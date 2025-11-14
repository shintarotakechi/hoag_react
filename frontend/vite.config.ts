import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { PluginOption, ViteDevServer } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'

const LOG_ENDPOINT = '/__system-log'
const MAX_BODY_BYTES = 16 * 1024
const ALLOWED_LOG_LEVELS = new Set(['log', 'info', 'warn', 'error'])

type IncomingLogPayload = {
  level: 'log' | 'info' | 'warn' | 'error'
  message: string
  args: string[]
  timestamp: string
  stack?: string
  source: string
  context: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, '..')
const LOG_FILE = path.join(REPO_ROOT, 'system.log')

function ensureLogFileExists() {
  if (!fs.existsSync(path.dirname(LOG_FILE))) {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true })
  }
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '', 'utf8')
  }
}

function respond(res: ServerResponse, status: number, message?: string) {
  res.statusCode = status
  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (message) {
    res.end(message)
  } else {
    res.end()
  }
}

function handlePreflight(res: ServerResponse) {
  res.statusCode = 204
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'content-type')
  res.end()
}

function sanitizeForLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function formatLogLine(payload: IncomingLogPayload): string {
  const lineParts = [
    `[${payload.timestamp}]`,
    `[${payload.level.toUpperCase()}]`,
    `[${payload.context}]`,
    `[${payload.source}]`,
    payload.message,
  ]

  if (payload.args.length) {
    lineParts.push(`args=${payload.args.map((arg) => sanitizeForLine(arg)).join(' | ')}`)
  }

  if (payload.stack) {
    lineParts.push(`stack=${sanitizeForLine(payload.stack)}`)
  }

  return `${lineParts.join(' ')}\n`
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function validatePayload(raw: unknown): IncomingLogPayload {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Payload must be an object')
  }

  const candidate = raw as Partial<IncomingLogPayload>

  if (!candidate.level || !ALLOWED_LOG_LEVELS.has(candidate.level)) {
    throw new Error('Invalid log level')
  }

  if (typeof candidate.message !== 'string' || candidate.message.trim().length === 0) {
    throw new Error('Message is required')
  }

  if (!candidate.timestamp || typeof candidate.timestamp !== 'string' || Number.isNaN(Date.parse(candidate.timestamp))) {
    throw new Error('Timestamp must be an ISO string')
  }

  const args = candidate.args ?? []
  if (!isStringArray(args)) {
    throw new Error('Args must be a string array')
  }

  if (args.length > 20) {
    throw new Error('Too many log arguments')
  }

  const stack = typeof candidate.stack === 'string' ? candidate.stack : undefined
  const source = typeof candidate.source === 'string' && candidate.source.length > 0 ? candidate.source : 'unknown'
  const context = typeof candidate.context === 'string' && candidate.context.length > 0 ? candidate.context : 'console'

  return {
    level: candidate.level,
    message: candidate.message.slice(0, 8_000),
    args: args.map((arg) => arg.slice(0, 2_000)),
    timestamp: candidate.timestamp,
    stack: stack?.slice(0, 8_000),
    source: source.slice(0, 512),
    context: context.slice(0, 128),
  }
}

async function appendLog(payload: IncomingLogPayload) {
  const line = formatLogLine(payload)
  await fs.promises.appendFile(LOG_FILE, line, 'utf8')
}

function handleLogRequest(server: ViteDevServer, req: IncomingMessage, res: ServerResponse) {
  let totalBytes = 0
  let aborted = false
  const chunks: string[] = []

  req.setEncoding('utf8')

  req.on('data', (chunk: string) => {
    if (aborted) return
    totalBytes += Buffer.byteLength(chunk)
    if (totalBytes > MAX_BODY_BYTES) {
      aborted = true
      respond(res, 413, 'Payload too large')
      req.destroy()
      return
    }
    chunks.push(chunk)
  })

  req.on('end', async () => {
    if (aborted) return
    const rawBody = chunks.join('').trim()
    if (!rawBody) {
      respond(res, 400, 'Payload cannot be empty')
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(rawBody)
    } catch {
      respond(res, 400, 'Payload must be valid JSON')
      return
    }

    try {
      const payload = validatePayload(parsed)
      await appendLog(payload)
      respond(res, 204)
    } catch (error) {
      if (error instanceof Error) {
        const status = error.message.startsWith('Invalid') || error.message.includes('must') || error.message.includes('required')
          ? 400
          : 500
        if (status === 500) {
          server.config.logger.error(`[dev-log] Failed to append log: ${error.message}`)
        }
        respond(res, status, error.message)
      } else {
        respond(res, 500, 'Unknown error')
      }
    }
  })

  req.on('error', (error) => {
    server.config.logger.error(`[dev-log] Request stream error: ${error}`)
    if (!res.writableEnded) {
      respond(res, 500, 'Stream error')
    }
  })
}

function devConsoleLoggingPlugin(): PluginOption {
  return {
    name: 'hoag-dev-console-logger',
    apply: 'serve',
    configureServer(server) {
      ensureLogFileExists()

      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith(LOG_ENDPOINT)) {
          return next()
        }

        if (req.method === 'OPTIONS') {
          handlePreflight(res)
          return
        }

        if (req.method !== 'POST') {
          respond(res, 405, 'Method Not Allowed')
          return
        }

        handleLogRequest(server, req, res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devConsoleLoggingPlugin()],
})
