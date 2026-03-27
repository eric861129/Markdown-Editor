import { markdown } from '@codemirror/lang-markdown';
import type { EditorView } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import clsx from 'clsx';
import { useMemo, useRef, useState } from 'react';

import { DEFAULT_CONTENT } from '@/data/defaultContent';
import { MISSIONS } from '@/data/missions';
import { SNIPPETS } from '@/data/snippets';
import { useLocalStorageDraft } from '@/hooks/useLocalStorageDraft';
import { useMissionProgress } from '@/hooks/useMissionProgress';
import { insertSnippet } from '@/hooks/useSnippetInsertion';
import { exportHtml, exportMarkdown, exportPdf } from '@/services/export';
import type { EditorMode } from '@/types/editor';
import type { Mission } from '@/types/mission';
import type { Snippet } from '@/types/snippet';
import { PreviewPane } from './PreviewPane';

/** 左側任務清單元件 */
function MissionPanel({ missions, statusMap }: { missions: Mission[]; statusMap: Record<string, string> }) {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
      <h3 className="text-sm font-semibold text-slate-800">闖關任務（8 關）</h3>
      {missions.map((mission, index) => {
        const status = statusMap[mission.id];
        const icon = status === 'done' ? '✅' : status === 'active' ? '🟡' : '🔒';
        return (
          <div key={mission.id} className="rounded-md bg-slate-50 p-2 text-xs text-slate-700">
            <p className="font-semibold">
              {icon} 第 {index + 1} 關：{mission.title}
            </p>
            <p className="mt-1">{mission.description}</p>
            <p className="mt-1 text-slate-500">{mission.hint}</p>
          </div>
        );
      })}
    </div>
  );
}

/** 左側樣板按鈕群組 */
function SnippetButtons({ mode, snippets, onInsert }: { mode: EditorMode; snippets: Snippet[]; onInsert: (snippet: Snippet) => void }) {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
      <h3 className="text-sm font-semibold text-slate-800">快速樣板</h3>
      <div className="grid grid-cols-1 gap-2">
        {snippets
          .filter((snippet) => snippet.mode === mode)
          .map((snippet) => (
            <button
              key={snippet.id}
              className="rounded-md bg-sky-50 px-3 py-2 text-left text-xs font-medium text-sky-700 transition hover:bg-sky-100"
              onClick={() => onInsert(snippet)}
              type="button"
            >
              {snippet.label}
            </button>
          ))}
      </div>
    </div>
  );
}

/**
 * 等待所有 Mermaid 區塊完成渲染：
 * - pendingCount 需連續 stableRounds 次為 0
 * - 最多等 timeoutMs，避免卡死
 */
async function waitForMermaidReady(
  getPendingCount: () => number,
  timeoutMs = 5000,
  intervalMs = 80,
  stableRounds = 2
) {
  const start = Date.now();
  let zeroCountRounds = 0;

  while (Date.now() - start < timeoutMs) {
    const pending = getPendingCount();
    if (pending === 0) {
      zeroCountRounds += 1;
      if (zeroCountRounds >= stableRounds) {
        return true;
      }
    } else {
      zeroCountRounds = 0;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return false;
}

/** App 主畫面：三欄式編輯器 */
export function App() {
  const [mode, setMode] = useState<EditorMode>('markdown');
  const [exportMessage, setExportMessage] = useState<string>('');
  const editorViewRef = useRef<EditorView | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const mermaidPendingCountRef = useRef<number>(0);

  const { content, setContent, completedMissionIds, setCompletedMissionIds } =
    useLocalStorageDraft(DEFAULT_CONTENT);

  const statusMap = useMissionProgress(
    MISSIONS,
    content,
    completedMissionIds,
    setCompletedMissionIds
  );

  const renderedHtmlForExport = useMemo(() => {
    const node = previewRef.current;
    return node?.innerHTML ?? '';
  }, [content]);

  /** 跳到指定行並選取該行，供 Mermaid 錯誤快速定位使用 */
  function jumpToLine(lineNumber: number) {
    const view = editorViewRef.current;
    if (!view) {
      return;
    }

    const safeLine = Math.max(1, Math.min(lineNumber, view.state.doc.lines));
    const line = view.state.doc.line(safeLine);

    view.dispatch({
      selection: { anchor: line.from, head: line.to },
      scrollIntoView: true
    });

    view.focus();
  }

  async function handleExportPdf() {
    if (!previewRef.current) {
      return;
    }

    setExportMessage('正在確認 Mermaid 圖表渲染完成...');

    const ready = await waitForMermaidReady(() => mermaidPendingCountRef.current);

    if (!ready) {
      setExportMessage('仍有圖表尚未完成，已逾時，請稍後再試。');
      return;
    }

    setExportMessage('Mermaid 已完成，正在輸出 PDF...');

    await exportPdf(previewRef.current);
    setExportMessage('PDF 匯出完成。');

    // 短暫提示後清空
    setTimeout(() => setExportMessage(''), 1500);
  }

  return (
    <div className="min-h-screen p-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <h1 className="text-lg font-bold text-slate-900">Markdown & Mermaid 新手教學編輯器</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button className="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white" onClick={() => exportMarkdown(content)} type="button">
            匯出 .md
          </button>
          <button className="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white" onClick={() => exportHtml(renderedHtmlForExport)} type="button">
            匯出 .html
          </button>
          <button className="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white" onClick={handleExportPdf} type="button">
            匯出 .pdf
          </button>
          {exportMessage ? <span className="text-xs text-slate-600">{exportMessage}</span> : null}
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-120px)] grid-cols-1 gap-4 xl:grid-cols-[320px_1fr_1fr]">
        <aside className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="mb-2 text-sm font-semibold text-slate-800">樣板模式切換</p>
            <div className="grid grid-cols-2 gap-2">
              {(['markdown', 'mermaid'] as const).map((item) => (
                <button
                  key={item}
                  className={clsx(
                    'rounded-md px-3 py-2 text-xs font-semibold',
                    mode === item ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                  )}
                  onClick={() => setMode(item)}
                  type="button"
                >
                  {item === 'markdown' ? 'Markdown 語法' : 'Mermaid 圖表'}
                </button>
              ))}
            </div>
          </div>

          <SnippetButtons
            mode={mode}
            snippets={SNIPPETS}
            onInsert={(snippet) => insertSnippet(editorViewRef.current, snippet)}
          />

          <MissionPanel missions={MISSIONS} statusMap={statusMap} />
        </aside>

        <section className="rounded-lg border border-slate-200 bg-white p-3">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">編輯區（自動儲存）</h2>
          <CodeMirror
            value={content}
            minHeight="70vh"
            extensions={[markdown()]}
            onChange={(value) => setContent(value)}
            onCreateEditor={(view) => {
              editorViewRef.current = view;
            }}
          />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-3">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">預覽區</h2>
          <div ref={previewRef}>
            <PreviewPane
              content={content}
              onLocateLine={jumpToLine}
              onMermaidPendingChange={(count) => {
                mermaidPendingCountRef.current = count;
              }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
