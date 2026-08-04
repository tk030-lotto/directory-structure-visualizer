import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-copyright">
          © 2026 Directory Tree Visualizer. Released under the MIT License.
        </p>
        <p className="footer-security">
          <ShieldCheck size={14} style={{ color: '#10b981' }} />
          Fully Local & Secure Process
        </p>
      </div>
    </footer>
  );
};
