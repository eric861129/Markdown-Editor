import type { Mission } from '@/types/mission';

/** 教學任務規則：以語法特徵判定，避免全文比對 */
export const MISSIONS: Mission[] = [
  {
    id: 'mission-h1',
    title: '建立一級標題',
    description: '請輸入一個以 # 開頭的標題。',
    hint: '提示：例如 # 我的第一份筆記',
    mode: 'markdown',
    validator: (content) => /^#\s+.+/m.test(content)
  },
  {
    id: 'mission-bold',
    title: '建立粗體文字',
    description: '請加入一段 **粗體** 文字。',
    hint: '提示：例如 **重點內容**',
    mode: 'markdown',
    dependsOn: 'mission-h1',
    validator: (content) => /\*\*[^*]+\*\*/.test(content)
  },
  {
    id: 'mission-list',
    title: '建立清單項目',
    description: '請新增至少一行 - 開頭的清單。',
    hint: '提示：例如 - 我完成第三關',
    mode: 'markdown',
    dependsOn: 'mission-bold',
    validator: (content) => /^-\s+.+/m.test(content)
  },
  {
    id: 'mission-link',
    title: '建立連結語法',
    description: '請新增一個 [文字](網址) 連結。',
    hint: '提示：例如 [官方網站](https://example.com)',
    mode: 'markdown',
    dependsOn: 'mission-list',
    validator: (content) => /\[[^\]]+\]\((https?:\/\/[^)]+)\)/.test(content)
  },
  {
    id: 'mission-code',
    title: '建立程式碼區塊',
    description: '請新增一段三反引號程式碼區塊。',
    hint: '提示：```js ... ```',
    mode: 'markdown',
    dependsOn: 'mission-link',
    validator: (content) => /```[\s\S]*```/.test(content)
  },
  {
    id: 'mission-mermaid-basic',
    title: 'Mermaid 基本流程圖',
    description: '建立一段 mermaid 區塊並包含 flowchart。',
    hint: '提示：```mermaid\nflowchart TD\n...\n```',
    mode: 'mermaid',
    dependsOn: 'mission-code',
    validator: (content) => /```mermaid[\s\S]*flowchart\s+(TD|LR|BT|RL)/m.test(content)
  },
  {
    id: 'mission-mermaid-arrow',
    title: '加入箭頭關係',
    description: '在 mermaid 區塊中加入至少一條箭頭 A --> B。',
    hint: '提示：節點之間可用 --> 連線',
    mode: 'mermaid',
    dependsOn: 'mission-mermaid-basic',
    validator: (content) => /```mermaid[\s\S]*-->/m.test(content)
  },
  {
    id: 'mission-mermaid-label',
    title: '加入連線標籤',
    description: '在連線中加入文字標籤，例如 A -->|確認| B。',
    hint: '提示：箭頭中可用 |文字| 做註解',
    mode: 'mermaid',
    dependsOn: 'mission-mermaid-arrow',
    validator: (content) => /```mermaid[\s\S]*-->\|[^|]+\|/m.test(content)
  }
];
