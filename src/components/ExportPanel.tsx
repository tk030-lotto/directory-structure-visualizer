import React, { useState } from 'react';
import { Copy, Check, Download, FileCode2 } from 'lucide-react';

interface ExportPanelProps {
  markdownText: string;
  rootName: string;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ markdownText, rootName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!markdownText) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(markdownText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = markdownText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    if (!markdownText) return;
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rootName || 'directory-structure'}_tree.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileCode2 size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Markdown 出力プレビュー
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCopy}
            disabled={!markdownText}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            {copied ? <Check size={15} color="var(--accent-emerald)" /> : <Copy size={15} />}
            {copied ? 'コピー完了' : 'コピー'}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownload}
            disabled={!markdownText}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            <Download size={15} />
            .md 保存
          </button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <textarea
          readOnly
          className="input-text"
          style={{
            width: '100%',
            height: '420px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            resize: 'none',
            whiteSpace: 'pre',
            background: 'rgba(15, 23, 42, 0.8)',
            color: '#e2e8f0',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-sm)'
          }}
          value={markdownText || '// フォルダを選択するとここにAI提示用のMarkdownツリーが自動生成されます'}
        />
      </div>
    </div>
  );
};
