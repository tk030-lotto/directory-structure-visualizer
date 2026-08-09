import React, { useState } from 'react';
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown, Binary, AlertCircle } from 'lucide-react';
import { DirectoryNode } from '../types';

interface TreeViewerProps {
  rootNode: DirectoryNode | null;
}

export const TreeViewer: React.FC<TreeViewerProps> = ({ rootNode }) => {
  if (!rootNode) return null;

  const hasChildren = rootNode.children && rootNode.children.length > 0;

  return (
    <div className="glass-panel" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Binary size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
            ツリー構造グラフィックプレビュー
          </h3>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {rootNode.dirCount} フォルダ / {rootNode.fileCount} ファイル
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '420px', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
        {hasChildren ? (
          <TreeNodeItem node={rootNode} defaultExpanded={true} level={0} />
        ) : (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={32} color="var(--accent-primary)" style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>
              表示可能なファイルが存在しません
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              選択されたフォルダが空か、または除外フィルターによってすべてスキップされています。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface TreeNodeItemProps {
  node: DirectoryNode;
  defaultExpanded?: boolean;
  level: number;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({ node, defaultExpanded = false, level }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || level < 2);
  const isDir = node.kind === 'directory';

  const toggleExpand = () => {
    if (isDir) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    // Bug1 fix: margin ショートハンドが marginLeft を上書きするため marginTop/marginBottom に分離
    <div style={{ marginLeft: `${level * 16}px`, marginTop: '2px', marginBottom: '2px' }}>
      <div
        onClick={toggleExpand}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 8px',
          borderRadius: '4px',
          cursor: isDir ? 'pointer' : 'default',
          transition: 'background 0.15s ease',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        {isDir ? (
          <>
            <span style={{ color: 'var(--text-dim)', display: 'inline-flex' }}>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
            <span style={{ color: '#f59e0b', display: 'inline-flex' }}>
              {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{node.name}/</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '4px' }}>
              ({node.fileCount ?? 0})
            </span>
          </>
        ) : (
          <>
            <span style={{ width: '14px' }} />
            <span style={{ color: '#38bdf8', display: 'inline-flex' }}>
              <FileText size={15} />
            </span>
            <span style={{ color: 'var(--text-muted)' }}>{node.name}</span>
          </>
        )}
      </div>

      {isDir && isExpanded && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNodeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
