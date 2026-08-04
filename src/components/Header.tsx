import React from 'react';
import { FolderTree, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="glass-panel" style={{ padding: '20px 30px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div 
            style={{
              background: 'var(--accent-gradient)',
              padding: '12px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <FolderTree size={28} color="white" />
          </div>
          <div>
            <h1 className="gradient-text" style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>
              Directory Structure Visualizer
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              ローカルフォルダの構造を直感的に解析・ツリー化し、AI用のMarkdownを出力
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.1)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <Sparkles size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.8rem', color: '#c7d2fe', fontWeight: 500 }}>v1.0.0</span>
        </div>
      </div>
    </header>
  );
};
