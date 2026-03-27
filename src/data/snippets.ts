import type { Snippet } from '@/types/snippet';

/** Markdown 與 Mermaid 的快速樣板 */
export const SNIPPETS: Snippet[] = [
  {
    id: 'md-h1',
    label: 'H1 標題',
    mode: 'markdown',
    template: '# 請改成你的標題\n',
    placeholder: '請改成你的標題'
  },
  {
    id: 'md-bold',
    label: '粗體',
    mode: 'markdown',
    template: '**請改成重點文字**\n',
    placeholder: '請改成重點文字'
  },
  {
    id: 'md-list',
    label: '清單',
    mode: 'markdown',
    template: '- 請改成你的清單內容\n',
    placeholder: '請改成你的清單內容'
  },
  {
    id: 'md-link',
    label: '連結',
    mode: 'markdown',
    template: '[請改成連結文字](https://example.com)\n',
    placeholder: '請改成連結文字'
  },
  {
    id: 'md-code',
    label: '程式碼區塊',
    mode: 'markdown',
    template: '```ts\n// 請改成你的程式碼\n```\n',
    placeholder: '// 請改成你的程式碼'
  },
  {
    id: 'mm-flow',
    label: '流程圖',
    mode: 'mermaid',
    template: '```mermaid\nflowchart TD\n  A[請改成節點A] --> B[請改成節點B]\n```\n',
    placeholder: '請改成節點A'
  },
  {
    id: 'mm-arrow',
    label: '加入箭頭',
    mode: 'mermaid',
    template: 'A --> B\n',
    placeholder: 'A --> B'
  },
  {
    id: 'mm-labeled-arrow',
    label: '帶標籤箭頭',
    mode: 'mermaid',
    template: 'A -->|請改成標籤| B\n',
    placeholder: '請改成標籤'
  }
];
