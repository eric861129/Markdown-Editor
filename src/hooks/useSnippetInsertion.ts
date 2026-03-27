import type { EditorView } from '@codemirror/view';

import type { Snippet } from '@/types/snippet';

/**
 * 在編輯器目前游標位置插入樣板，並選取 placeholder 文字。
 */
export function insertSnippet(view: EditorView | null, snippet: Snippet) {
  if (!view) {
    return;
  }

  const selection = view.state.selection.main;
  const insertFrom = selection.from;
  const insertTo = selection.to;

  view.dispatch({
    changes: {
      from: insertFrom,
      to: insertTo,
      insert: snippet.template
    }
  });

  const insertedTextStart = insertFrom;
  const placeholderOffset = snippet.template.indexOf(snippet.placeholder);

  if (placeholderOffset >= 0) {
    const from = insertedTextStart + placeholderOffset;
    const to = from + snippet.placeholder.length;
    view.dispatch({ selection: { anchor: from, head: to } });
  }

  view.focus();
}
