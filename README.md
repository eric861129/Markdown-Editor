# Markdown-Editor

專為初學者設計的 Markdown & Mermaid 編輯器（純前端 / 可部署 GitHub Pages）。

## 已完成項目（第一版）

- 三欄式版面：左側樣板與任務、中間編輯器、右側預覽。
- CodeMirror 編輯區 + LocalStorage 自動儲存。
- Markdown 即時渲染 + Mermaid SVG 即時渲染。
- Mermaid 友善錯誤攔截（繁中提示，不顯示 stack trace）。
- Mermaid 錯誤可一鍵定位到編輯器行號。
- 匯出 `.md` / `.html` / `.pdf`（PDF 匯出前會等待 Mermaid 渲染完成）。
- 教學闖關模式（Markdown 5 關 + Mermaid 3 關）。

## 開發

```bash
npm install
npm run dev
```

## 文件

- 架構規劃：`docs/architecture-plan.md`
