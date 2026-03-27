# Markdown & Mermaid 編輯器 - 啟動架構提案

> 目標：純前端、可部署到 GitHub Pages、適合初學者學習 Markdown 與 Mermaid。

## 1) 專案目錄結構規劃

```text
Markdown-Editor/
├─ public/
│  ├─ favicon.svg
│  └─ tutorial-assets/               # 教學模式用靜態圖片或示意圖
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ routes.tsx                  # 若未來需多頁可擴充
│  │  └─ providers/
│  │     └─ EditorProvider.tsx       # 全域編輯器狀態（模式、內容、任務）
│  ├─ components/
│  │  ├─ layout/
│  │  │  ├─ ThreePaneLayout.tsx      # 三欄式版面容器
│  │  │  ├─ SidebarPane.tsx          # 左欄：模式切換 + Snippets
│  │  │  ├─ EditorPane.tsx           # 中欄：CodeMirror 編輯器
│  │  │  └─ PreviewPane.tsx          # 右欄：Markdown + Mermaid 預覽
│  │  ├─ sidebar/
│  │  │  ├─ ModeToggle.tsx
│  │  │  ├─ SnippetButtonGroup.tsx
│  │  │  └─ snippetCatalog.ts        # Markdown / Mermaid 樣板定義
│  │  ├─ teaching/
│  │  │  ├─ MissionPanel.tsx         # 闖關任務列表
│  │  │  ├─ MissionBadge.tsx         # 任務解鎖視覺回饋
│  │  │  └─ missionRules.ts          # 任務條件規則
│  │  ├─ preview/
│  │  │  ├─ MarkdownRenderer.tsx
│  │  │  ├─ MermaidRenderer.tsx
│  │  │  └─ MermaidErrorCard.tsx     # 友善錯誤提示 UI
│  │  └─ export/
│  │     ├─ ExportMenu.tsx
│  │     └─ useExporters.ts          # .md/.html/.pdf 匯出邏輯
│  ├─ hooks/
│  │  ├─ useLocalStorageDraft.ts     # 自動儲存
│  │  ├─ useSnippetInsertion.ts      # 游標插入樣板
│  │  ├─ useMissionProgress.ts       # 任務狀態驗證
│  │  └─ useMermaidSafeRender.ts     # Mermaid 錯誤攔截
│  ├─ services/
│  │  ├─ markdown.ts                 # remark/rehype pipeline
│  │  ├─ mermaid.ts                  # mermaid 初始化與 render
│  │  └─ export.ts                   # 匯出前「等待渲染完成」協調
│  ├─ types/
│  │  ├─ editor.ts
│  │  ├─ mission.ts
│  │  └─ snippet.ts
│  ├─ styles/
│  │  └─ index.css
│  ├─ utils/
│  │  ├─ debounce.ts
│  │  ├─ download.ts
│  │  └─ lineMap.ts                  # 錯誤行號映射工具
│  ├─ main.tsx
│  └─ vite-env.d.ts
├─ docs/
│  └─ architecture-plan.md
├─ index.html
├─ package.json
├─ tsconfig.json
├─ tailwind.config.ts
├─ postcss.config.cjs
├─ vite.config.ts
└─ README.md
```

## 2) package.json 依賴套件清單（建議版本區間）

> 以下為「完整建議」。真正初始化時可用 `npm create vite@latest` 後再補齊。

```json
{
  "name": "markdown-mermaid-editor",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@codemirror/lang-markdown": "^6.3.1",
    "@codemirror/language": "^6.10.8",
    "@codemirror/state": "^6.5.2",
    "@codemirror/theme-one-dark": "^6.1.2",
    "@codemirror/view": "^6.38.6",
    "@uiw/react-codemirror": "^4.24.2",
    "clsx": "^2.1.1",
    "file-saver": "^2.0.5",
    "html2canvas": "^1.4.1",
    "jspdf": "^3.0.1",
    "lucide-react": "^0.546.0",
    "mermaid": "^11.12.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-markdown": "^10.1.0",
    "rehype-highlight": "^7.0.2",
    "rehype-raw": "^7.0.0",
    "rehype-sanitize": "^6.0.0",
    "remark-breaks": "^4.0.0",
    "remark-gfm": "^4.0.1",
    "remark-parse": "^11.0.0",
    "remark-rehype": "^11.1.2",
    "unist-util-visit": "^5.0.0",
    "zod": "^4.1.5"
  },
  "devDependencies": {
    "@eslint/js": "^9.34.0",
    "@tailwindcss/postcss": "^4.1.12",
    "@types/file-saver": "^2.0.7",
    "@types/node": "^24.3.0",
    "@types/react": "^19.1.12",
    "@types/react-dom": "^19.1.9",
    "@vitejs/plugin-react": "^5.0.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.34.0",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.3.0",
    "postcss": "^8.5.6",
    "prettier": "^3.6.2",
    "tailwindcss": "^4.1.12",
    "typescript": "~5.9.2",
    "typescript-eslint": "^8.41.0",
    "vite": "^7.1.3"
  }
}
```

## 3) 三個關鍵機制的實作策略

### A. 左側邊欄「插入樣板」的游標控制

- 使用 `@uiw/react-codemirror` 提供的 `viewRef`（`EditorView`）。
- Snippet 資料結構建議：
  - `label`: 按鈕名稱
  - `template`: 要插入的字串（含繁中註解）
  - `selectFrom` / `selectTo`: 插入後要自動選取的範圍（讓使用者直接改字）
- 插入流程：
  1. 讀取目前選取範圍 `from/to`。
  2. 使用 `view.dispatch({ changes, selection })` 直接替換所選內容。
  3. 替換後把游標定位到模板中的可編輯區段，並 `focus()` 回編輯器。
- 若目前模式是 Mermaid，按鈕插入三反引號的 `mermaid` 區塊，避免新手忘記 fence。

### B. 教學模式的狀態驗證邏輯

- 任務資料建議放 `missionRules.ts`：
  - `id`, `title`, `description`, `validator(content)`, `dependsOn`。
- 驗證策略：
  - 每次內容變更時（300ms debounce）執行所有 `validator`。
  - `validator` 優先使用「語法特徵」而不是字串全等（例如：是否存在 `# ` 標題、是否存在 `- ` 清單、是否存在 mermaid fence）。
- 解鎖流程：
  - 任務完成時顯示動畫 / 勾勾。
  - 若 `dependsOn` 未完成，不解鎖下一關（保留教學節奏）。
- 儲存策略：
  - 任務進度與草稿內容一起存 LocalStorage（版本號 key，便於未來 migration）。

### C. Mermaid 錯誤攔截機制（友善中文提示 + 行號）

- 不直接讓 Mermaid raw error 泡到 UI。
- `useMermaidSafeRender.ts` 中封裝：
  1. 先用 `mermaid.parse(code)` 做語法檢查。
  2. 通過後再 `mermaid.render(id, code)` 產生 SVG。
  3. 若 `throw`，統一轉成 `MermaidFriendlyError`：
     - `messageZh`: 溫和繁中訊息（例如：`圖表語法有一點小狀況，請檢查箭頭或括號是否成對。`）
     - `line`: 透過 regex 從錯誤文字提取行號（例如 `line 3`）。
     - `hint`: 依圖類型給提示（flowchart / sequence / classDiagram）
- 預覽區 UI：
  - 顯示 `MermaidErrorCard`（淡黃色提示框 + 建議修正）
  - 絕不顯示 stack trace
  - 若有 `line` 則顯示 `第 X 行附近`，並可觸發 editor 高亮該行

---

## 補充：匯出 .html / .pdf 時確保 Mermaid 完整渲染

- HTML 匯出：使用「預覽區最終 DOM」序列化，確保已是 SVG 結果。
- PDF 匯出流程：
  1. 觸發一次預覽重繪。
  2. `await` 所有 Mermaid 渲染 Promise 完成。
  3. 再用 `html2canvas` 截圖 + `jsPDF` 生成 PDF。
- 若偵測仍有未完成圖表節點，顯示 loading toast，避免輸出空白圖。
