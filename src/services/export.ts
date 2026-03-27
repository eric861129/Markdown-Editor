import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/** 下載 markdown 檔 */
export function exportMarkdown(content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, 'document.md');
}

/** 下載 html 檔 */
export function exportHtml(renderedHtml: string) {
  const html = `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>匯出文件</title>
    <style>
      body { font-family: "Noto Sans TC", sans-serif; margin: 24px; line-height: 1.6; }
      pre { background: #111827; color: #f9fafb; padding: 12px; border-radius: 8px; overflow: auto; }
      code { font-family: "JetBrains Mono", monospace; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #d1d5db; padding: 8px; }
    </style>
  </head>
  <body>${renderedHtml}</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  saveAs(blob, 'document.html');
}

/**
 * 下載 PDF：
 * 1) 等待呼叫端確認 mermaid 完成
 * 2) 對預覽區截圖後輸出 PDF
 */
export async function exportPdf(previewElement: HTMLElement) {
  const canvas = await html2canvas(previewElement, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true
  });

  const imageData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const renderWidth = canvas.width * ratio;
  const renderHeight = canvas.height * ratio;

  pdf.addImage(imageData, 'PNG', 16, 16, renderWidth - 32, renderHeight - 32);
  pdf.save('document.pdf');
}
