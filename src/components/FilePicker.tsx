import React, { useRef, useState } from 'react';
import { FolderPlus, UploadCloud, FolderCheck } from 'lucide-react';

interface FilePickerProps {
  onFilesSelected: (files: FileList | File[]) => void;
  onEntriesSelected?: (entries: any[]) => void;
  folderName: string | null;
  // Bug7: ファイル数とディレクトリ数を分離して受け取る
  fileCount: number;
  dirCount: number;
}

export const FilePicker: React.FC<FilePickerProps> = ({
  onFilesSelected,
  onEntriesSelected,
  folderName,
  fileCount,
  dirCount
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  // Issue10: ファイル単体ドロップ時のエラーメッセージを保持
  const [dropError, setDropError] = useState<string | null>(null);

  const handleFolderButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDropError(null);
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
    setDropError(null);

    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      const entries: any[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
          if (entry) {
            entries.push(entry);
          }
        }
      }
      if (entries.length > 0) {
        // Issue10: ディレクトリが 1 つも含まれていない場合はエラーを表示
        const hasDirectory = entries.some((entry) => entry.isDirectory);
        if (!hasDirectory) {
          setDropError('フォルダをドロップしてください。単体ファイルには対応していません。');
          return;
        }
        if (onEntriesSelected) {
          onEntriesSelected(entries);
          return;
        }
      }
    }

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
            {/* Bug7: ファイル数とフォルダ数を分逆して表示 */}
            <p style={{ color: 'var(--accent-emerald)', fontSize: '0.875rem', fontWeight: 500 }}>
              {dirCount} フォルダ / {fileCount} ファイル をスキャン完了
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
            {/* Issue10: ファイル単体ドロップ時のエラー表示 */}
            {dropError && (
              <p style={{
                color: '#f87171',
                fontSize: '0.8rem',
                marginBottom: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                padding: '6px 12px'
              }}>
                ⚠️ {dropError}
              </p>
            )}
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
