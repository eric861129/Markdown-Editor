import type { EditorMode } from './editor';

/** 教學任務定義 */
export interface Mission {
  /** 任務唯一識別碼 */
  id: string;
  /** 任務標題 */
  title: string;
  /** 任務描述 */
  description: string;
  /** 任務提示 */
  hint: string;
  /** 對應模式 */
  mode: EditorMode;
  /** 前置任務 */
  dependsOn?: string;
  /** 檢查內容是否通關 */
  validator: (content: string) => boolean;
}
