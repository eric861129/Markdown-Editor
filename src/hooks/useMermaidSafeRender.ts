import { useEffect, useState } from 'react';

import type { MermaidFriendlyError } from '@/types/editor';
import { renderMermaidSvg, setupMermaid } from '@/services/mermaid';

/** 嘗試從 mermaid 錯誤訊息抽出行號 */
function extractLine(error: unknown): number | undefined {
  const text = String(error);
  const match = text.match(/line\s*(\d+)/i);
  if (!match) {
    return undefined;
  }
  return Number(match[1]);
}

/** mermaid 區塊渲染結果 */
export interface MermaidRenderResult {
  svg?: string;
  error?: MermaidFriendlyError;
}

/**
 * 安全渲染 Mermaid：
 * - 成功回傳 svg
 * - 失敗回傳友善中文錯誤（不曝光 stack trace）
 */
export function useMermaidSafeRender(code: string, index: number) {
  const [result, setResult] = useState<MermaidRenderResult>({});

  useEffect(() => {
    setupMermaid();

    if (!code.trim()) {
      setResult({});
      return;
    }

    renderMermaidSvg(code, index)
      .then((svg) => setResult({ svg }))
      .catch((error) => {
        const line = extractLine(error);
        setResult({
          error: {
            messageZh: '圖表語法有一點小狀況，請檢查箭頭、括號或關鍵字格式。',
            line,
            hint: '你可以先確認是否使用 flowchart / sequenceDiagram 的正確語法。'
          }
        });
      });
  }, [code, index]);

  return result;
}
