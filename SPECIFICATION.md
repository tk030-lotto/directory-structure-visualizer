# Directory Structure Visualizer 仕様書

## 1. 目的

指定したディレクトリ構造を解析し、Markdown形式のツリーとして出力する。

---

## 2. 開発方針

- 単機能・軽量
- ローカル完結
- シンプルなUI
- AIへ渡しやすいMarkdownを生成

---

## 3. 機能

### 必須

- フォルダ選択
- 再帰的なディレクトリ走査
- ツリー生成
- Markdown出力
- クリップボードコピー
- ファイル保存

### オプション

- 除外フォルダ指定
- 階層表示設定

---

## 4. システム構成

UI
 ↓
Directory Scanner
 ↓
Tree Builder
 ↓
Markdown Generator
 ↓
Export

---

## 5. ディレクトリ構成

src/
├── components/
├── services/
├── utils/
└── types/

---

## 6. 使用技術

- React
- TypeScript
- Electron
- Node.js

---

## 7. 除外対象

- node_modules
- .git
- dist
- build

---

## 8. 出力例

project/
├── src/
├── docs/
├── package.json
└── README.md

---

## 9. 今後の拡張候補

- フィルタ機能
- アイコン表示
- JSON出力
- HTML出力