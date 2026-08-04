import React, { useState } from 'react';
import { SlidersHorizontal, Eye, EyeOff, Layers, FileCode } from 'lucide-react';
import { ScannerOptions, MarkdownOptions, TreeStyle } from '../types';

interface ControlsProps {
  scannerOptions: ScannerOptions;
  markdownOptions: MarkdownOptions;
  onScannerChange: (options: ScannerOptions) => void;
  onMarkdownChange: (options: MarkdownOptions) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  scannerOptions,
  markdownOptions,
  onScannerChange,
  onMarkdownChange
}) => {
  const [excludeInput, setExcludeInput] = useState(scannerOptions.excludePatterns.join(', '));

  const handleExcludeBlur = () => {
    const patterns = excludeInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);
    onScannerChange({ ...scannerOptions, excludePatterns: patterns });
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <SlidersHorizontal size={18} color="var(--accent-primary)" />
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
          フィルター・表示オプション
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* 除外パターン設定 */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
            除外フォルダ・ファイル (カンマ区切り)
          </label>
          <input
            type="text"
            className="input-text"
            style={{ width: '100%' }}
            value={excludeInput}
            onChange={(e) => setExcludeInput(e.target.value)}
            onBlur={handleExcludeBlur}
            placeholder="node_modules, .git, dist, *.log"
          />
        </div>

        {/* 階層深度設定 */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
            <Layers size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            最大階層深度 (0 = 無制限)
          </label>
          <input
            type="number"
            className="input-text"
            style={{ width: '100%' }}
            min={0}
            max={20}
            value={scannerOptions.maxDepth}
            onChange={(e) => onScannerChange({ ...scannerOptions, maxDepth: parseInt(e.target.value, 10) || 0 })}
          />
        </div>

        {/* ツリー形式設定 */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
            <FileCode size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            ツリー記号スタイル
          </label>
          <select
            className="input-text"
            style={{ width: '100%', cursor: 'pointer' }}
            value={markdownOptions.style}
            onChange={(e) => onMarkdownChange({ ...markdownOptions, style: e.target.value as TreeStyle })}
          >
            <option value="unicode">Unicode (├──, └──)</option>
            <option value="ascii">ASCII (|--, \--)</option>
          </select>
        </div>

        {/* トグル設定群 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', gridColumn: 'span 2', marginTop: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-main)' }}>
            <input
              type="checkbox"
              checked={scannerOptions.showHidden}
              onChange={(e) => onScannerChange({ ...scannerOptions, showHidden: e.target.checked })}
              style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
            />
            {scannerOptions.showHidden ? <Eye size={16} color="var(--accent-cyan)" /> : <EyeOff size={16} color="var(--text-dim)" />}
            隠しファイルを表示 (`.`)
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-main)' }}>
            <input
              type="checkbox"
              checked={markdownOptions.showStats ?? true}
              onChange={(e) => onMarkdownChange({ ...markdownOptions, showStats: e.target.checked })}
              style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
            />
            統計情報 (ファイル数/フォルダ数) を含める
          </label>
        </div>
      </div>
    </div>
  );
};
