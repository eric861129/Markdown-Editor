import type { EditorMode } from './editor';

/** 側欄樣板資料 */
export interface Snippet {
  /** 樣板 id */
  id: string;
  /** 顯示名稱 */
  label: string;
  /** 樣板內容（含教學註解） */
  template: string;
  /** 插入後要選取的關鍵字 */
  placeholder: string;
  /** 適用模式 */
  mode: EditorMode;
}
