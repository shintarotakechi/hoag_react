const LOG_LEVELS = ['log', 'info', 'warn', 'error'] as const

type DevLogLevel = (typeof LOG_LEVELS)[number]

type DevLoggerPayload = {
  level: DevLogLevel
  message: string
  args: string[]
  timestamp: string
  stack?: string
  source: string
  context: string
}

export interface DevLoggerConfig {
  endpoint: string
  levels: DevLogLevel[]
  maxArgs: number
  maxArgLength: number
  requestTimeoutMs: number
  dropPayloadThresholdBytes: number
  includeStackFor: DevLogLevel[]
}

const DEFAULT_CONFIG: DevLoggerConfig = {
  endpoint: '/__system-log',
  levels: [...LOG_LEVELS],
  maxArgs: 8,
  maxArgLength: 1_500,
  requestTimeoutMs: 1_500,
  dropPayloadThresholdBytes: 16_000,
  includeStackFor: ['warn', 'error'],
}

let activeConfig: DevLoggerConfig = { ...DEFAULT_CONFIG }

export function configureDevLogger(overrides: Partial<DevLoggerConfig>) {
  activeConfig = { ...activeConfig, ...overrides }
}

const ORIGINAL_CONSOLE: Record<DevLogLevel, (...args: unknown[]) => void> = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
}

const INSTALL_FLAG = '__HOAG_DEV_LOGGER__'

type LoggerAwareWindow = Window & {
  [INSTALL_FLAG]?: boolean
}

function shouldPatchConsole(): boolean {
  return typeof window !== 'undefined' && import.meta.env.DEV
}

function serializeArg(arg: unknown): string {
  if (typeof arg === 'string') return arg
  if (typeof arg === 'number' || typeof arg === 'boolean' || typeof arg === 'bigint') {
    return String(arg)
  }
  if (arg === undefined) return 'undefined'
  if (arg === null) return 'null'
  if (arg instanceof Error) {
    return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ''}`
  }
  if (arg instanceof Date) return arg.toISOString()
  if (typeof arg === 'function') return `[Function ${arg.name || 'anonymous'}]`

  const seen = new WeakSet()
  try {
    return JSON.stringify(arg, (_, value) => {
      if (typeof value === 'bigint') return `${value.toString()}n`
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value as object)) {
          return '[Circular]'
        }
        seen.add(value as object)
      }
      return value
    }) ?? '[Unserializable Object]'
  } catch (error) {
    return `[Unserializable ${(error as Error).message || Object.prototype.toString.call(arg)}]`
  }
}

function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input
  return `${input.slice(0, maxLength)}… (truncated)`
}

function buildPayload(level: DevLogLevel, args: unknown[], context: string): DevLoggerPayload {
  const truncatedArgs = args
    .slice(0, activeConfig.maxArgs)
    .map((arg) => truncate(serializeArg(arg), activeConfig.maxArgLength))

  const payload: DevLoggerPayload = {
    level,
    message: truncate(truncatedArgs.join(' '), activeConfig.maxArgLength * activeConfig.maxArgs),
    args: truncatedArgs,
    timestamp: new Date().toISOString(),
    source: typeof window !== 'undefined' ? window.location.pathname + window.location.search : 'unknown',
    context,
  }

  if (activeConfig.includeStackFor.includes(level)) {
    payload.stack = captureStackTrace()
  }

  return payload
}

function captureStackTrace(): string | undefined {
  try {
    const error = new Error('LOG_CAPTURE')
    if (!error.stack) return undefined
    const [, , ...rest] = error.stack.split('\n')
    return rest.join('\n') || undefined
  } catch (error) {
    ORIGINAL_CONSOLE.warn('Dev logger failed to capture stack trace', error)
    return undefined
  }
}

function shouldLogLevel(level: DevLogLevel): boolean {
  return activeConfig.levels.includes(level)
}

function sendPayload(payload: DevLoggerPayload) {
  const serialized = JSON.stringify(payload)
  if (serialized.length > activeConfig.dropPayloadThresholdBytes) {
    ORIGINAL_CONSOLE.warn('Dev logger dropped payload larger than configured threshold')
    return
  }

  const maybeBeacon = typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function'
  if (maybeBeacon) {
    const blob = new Blob([serialized], { type: 'application/json' })
    if (navigator.sendBeacon(activeConfig.endpoint, blob)) {
      return
    }
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined
  const timeoutId = controller
    ? window.setTimeout(() => {
        controller.abort()
      }, activeConfig.requestTimeoutMs)
    : undefined

  fetch(activeConfig.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: serialized,
    keepalive: true,
    signal: controller?.signal,
    credentials: 'same-origin',
  })
    .catch((error) => ORIGINAL_CONSOLE.warn('Dev logger failed to POST payload', error))
    .finally(() => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    })
}

function processLog(level: DevLogLevel, args: unknown[], context: string) {
  if (!shouldLogLevel(level)) return
  try {
    const payload = buildPayload(level, args, context)
    queueMicrotask(() => sendPayload(payload))
  } catch (error) {
    ORIGINAL_CONSOLE.warn('Dev logger failed to serialize payload', error)
  }
}

function patchConsole() {
  LOG_LEVELS.forEach((level) => {
    const original = ORIGINAL_CONSOLE[level]
    console[level] = (...args: unknown[]) => {
      original(...args)
      processLog(level, args, 'console')
    }
  })
}

function registerGlobalHandlers() {
  window.addEventListener('error', (event) => {
    processLog('error', [event.message, event.filename, event.lineno, event.error?.stack], 'window.error')
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
    processLog('error', [reason], 'window.unhandledrejection')
  })
}

export function installDevLogger(overrides?: Partial<DevLoggerConfig>) {
  if (!shouldPatchConsole()) return

  const loggerWindow = window as LoggerAwareWindow
  if (loggerWindow[INSTALL_FLAG]) return

  if (overrides) {
    configureDevLogger(overrides)
  }

  patchConsole()
  registerGlobalHandlers()
  loggerWindow[INSTALL_FLAG] = true
}
