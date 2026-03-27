import mermaid from 'mermaid';

let initialized = false;

/** 初始化 mermaid（僅執行一次） */
export function setupMermaid() {
  if (initialized) {
    return;
  }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'default'
  });

  initialized = true;
}

/** parse + render：先檢查語法，再產生 SVG */
export async function renderMermaidSvg(code: string, index: number): Promise<string> {
  await mermaid.parse(code);
  const id = `mermaid-${index}-${Date.now()}`;
  const result = await mermaid.render(id, code);
  return result.svg;
}
