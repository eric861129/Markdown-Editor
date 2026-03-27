import { useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

import { useMermaidSafeRender } from '@/hooks/useMermaidSafeRender';

interface Segment {
  type: 'markdown' | 'mermaid';
  content: string;
  /** 片段起始行（1-based） */
  startLine: number;
}

interface PreviewPaneProps {
  content: string;
  /** 點擊 Mermaid 錯誤提示時，通知 editor 跳到對應行 */
  onLocateLine: (line: number) => void;
  /** 回報 Mermaid 尚在渲染中的區塊數量 */
  onMermaidPendingChange: (pendingCount: number) => void;
}

/** 將原始內容切成 Markdown 與 Mermaid 片段，並記錄各片段起始行 */
function splitContent(content: string): Segment[] {
  const segments: Segment[] = [];
  const regex = /```mermaid\n([\s\S]*?)```/g;
  let lastIndex = 0;

  for (const match of content.matchAll(regex)) {
    const matchIndex = match.index ?? 0;
    const before = content.slice(lastIndex, matchIndex);

    if (before.trim()) {
      const beforeStartLine = content.slice(0, lastIndex).split('\n').length;
      segments.push({ type: 'markdown', content: before, startLine: beforeStartLine });
    }

    const mermaidStartLine = content.slice(0, matchIndex).split('\n').length + 1;
    segments.push({ type: 'mermaid', content: match[1] || '', startLine: mermaidStartLine + 1 });
    lastIndex = matchIndex + match[0].length;
  }

  const tail = content.slice(lastIndex);
  if (tail.trim()) {
    const tailStartLine = content.slice(0, lastIndex).split('\n').length;
    segments.push({ type: 'markdown', content: tail, startLine: tailStartLine });
  }

  return segments;
}

interface MermaidBlockProps {
  code: string;
  index: number;
  startLine: number;
  onLocateLine: (line: number) => void;
  onRenderStateChange: (index: number, pending: boolean) => void;
}

/** Mermaid 區塊顯示（成功顯示 SVG；失敗顯示友善錯誤） */
function MermaidBlock({
  code,
  index,
  startLine,
  onLocateLine,
  onRenderStateChange
}: MermaidBlockProps) {
  const { svg, error } = useMermaidSafeRender(code, index);

  useEffect(() => {
    onRenderStateChange(index, !svg && !error);
  }, [index, svg, error, onRenderStateChange]);

  if (error) {
    const mappedLine = typeof error.line === 'number' ? startLine + error.line - 1 : undefined;

    return (
      <div className="my-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        <p className="font-semibold">⚠️ Mermaid 語法提示</p>
        <p className="mt-1">{error.messageZh}</p>
        {typeof mappedLine === 'number' ? (
          <button
            className="mt-2 rounded bg-amber-200 px-2 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-300"
            onClick={() => onLocateLine(mappedLine)}
            type="button"
          >
            前往第 {mappedLine} 行附近
          </button>
        ) : null}
        {error.hint ? <p className="mt-1 text-amber-800">建議：{error.hint}</p> : null}
      </div>
    );
  }

  if (!svg) {
    return <div className="my-3 rounded-md bg-slate-100 p-3 text-sm text-slate-500">Mermaid 渲染中...</div>;
  }

  return (
    <div
      className="my-3 overflow-auto rounded-md border border-slate-200 p-3"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/** 右欄預覽：Markdown + Mermaid */
export function PreviewPane({ content, onLocateLine, onMermaidPendingChange }: PreviewPaneProps) {
  const segments = useMemo(() => splitContent(content), [content]);
  const pendingStateRef = useRef<Map<number, boolean>>(new Map());

  useEffect(() => {
    // 內容改變時重置 pending map，避免沿用舊狀態
    pendingStateRef.current = new Map();
    const hasMermaid = segments.some((segment) => segment.type === 'mermaid');
    if (!hasMermaid) {
      onMermaidPendingChange(0);
    }
  }, [segments, onMermaidPendingChange]);

  const handleRenderStateChange = (index: number, pending: boolean) => {
    pendingStateRef.current.set(index, pending);
    const pendingCount = Array.from(pendingStateRef.current.values()).filter(Boolean).length;
    onMermaidPendingChange(pendingCount);
  };

  return (
    <div className="prose prose-slate max-w-none">
      {segments.map((segment, index) => {
        if (segment.type === 'mermaid') {
          return (
            <MermaidBlock
              key={`m-${index}`}
              code={segment.content}
              index={index}
              startLine={segment.startLine}
              onLocateLine={onLocateLine}
              onRenderStateChange={handleRenderStateChange}
            />
          );
        }

        return (
          <ReactMarkdown key={`md-${index}`} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {segment.content}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}
