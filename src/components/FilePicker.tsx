import React, { useRef, useState } from 'react';
import { FolderPlus, UploadCloud, FolderCheck } from 'lucide-react';

interface FilePickerProps {
  onFilesSelected: (files: FileList | File[]) => void;
  folderName: string | null;
  fileCount: number;
}

export const FilePicker: React.FC<FilePickerProps> = ({ onFilesSelected, folderName, fileCount }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFolderButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        style={{ display: 'none' }}
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.15)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '36px 20px',
          textAlign: 'center',
          background: isDragging ? 'rgba(99, 102, 241, 0.08)' : 'rgba(15, 23, 42, 0.4)',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
        onClick={handleFolderButtonClick}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          <div style={{
            background: folderName ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            padding: '16px',
            borderRadius: '50%',
            color: folderName ? 'var(--accent-emerald)' : 'var(--accent-primary)'
          }}>
            {folderName ? <FolderCheck size={36} /> : <UploadCloud size={36} />}
          </div>
        </div>

        {folderName ? (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              {folderName}
            </h3>
            <p style={{ color: 'var(--accent-emerald)', fontSize: '0.875rem', fontWeight: 500 }}>
              {fileCount} 件の要素をスキャン・解析完了
            </p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '8px' }}>
              クリックまたは新しいフォルダをドロップして再選択
            </p>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              フォルダを選択またはここにドラッグ＆ドロップ
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
              ローカルマシン上のフォルダ構造を読み込んで即時にツリー表現を生成します
            </p>
            <button type="button" className="btn btn-primary" onClick={(e) => { e.stopPropagation(); handleFolderButtonClick(); }}>
              <FolderPlus size={18} />
              フォルダを選択
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
