/** 編輯器模式：Markdown 或 Mermaid 樣板 */
export type EditorMode = 'markdown' | 'mermaid';

/** Mermaid 友善錯誤資訊 */
export interface MermaidFriendlyError {
  /** 溫和中文提示 */
  messageZh: string;
  /** 可能的錯誤行號（若可解析） */
  line?: number;
  /** 額外修正建議 */
  hint?: string;
}
