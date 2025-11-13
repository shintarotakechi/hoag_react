# Changelog

This file records all important changes for hoag.

## [0.1.0] - Initial Setup

### Added
- AGENTS.md: システム設計ドキュメントを作成。ローカル開発環境に焦点を当てたフルスタックアーキテクチャ、イベント駆動型システム、Next.js/Node.js/TypeScript/Python の技術スタック、Docker Compose を使ったローカルインフラ設定を含む包括的な設計書を追加
- イベント駆動型アーキテクチャの設計：RabbitMQ/Redis を使ったローカルメッセージキュー、イベントフローの定義
- プロジェクト構造：フロントエンド、バックエンド、サービス、共有コードのディレクトリ構造を定義
- ローカル開発セットアップガイド：Docker Compose、データベースマイグレーション、開発サーバー起動手順を記載
- 本番環境への移行パス：ローカル → コンテナ化 → クラウド（AWS）への段階的な移行計画を定義

### Prompts Used
<prompt>
Help me make @AGENTS.md based on @jobdescription.md I want to work on things locally for now, so limit the scope to local, but eventually move on to their techstack. I need this to be able to function with everything on localhost and will not have time to connect to third party products.
</prompt>

## Changelog Format

The changelog follows the recommendations of @Keep a Changelog.

This project adheres to @Semantic Versioning.

### Meaning of Version Numbers
- Major version: "Changed" for incompatible API changes
- Minor version: "Added" for functionality in a backwards-compatible manner
- Patch version: "Fixed" for backwards-compatible bug fixes

