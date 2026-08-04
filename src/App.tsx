import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FilePicker } from './components/FilePicker';
import { Controls } from './components/Controls';
import { TreeViewer } from './components/TreeViewer';
import { ExportPanel } from './components/ExportPanel';
import { Footer } from './components/Footer';
import { DirectoryNode, ScannerOptions, MarkdownOptions } from './types';
import { parseFileList, parseFileSystemEntries, DEFAULT_SCANNER_OPTIONS } from './services/scanner';
import { generateMarkdownTree } from './utils/markdownGenerator';

export const App: React.FC = () => {
  const [rawFiles, setRawFiles] = useState<FileList | File[] | null>(null);
  const [rawEntries, setRawEntries] = useState<any[] | null>(null);
  const [scannerOptions, setScannerOptions] = useState<ScannerOptions>(DEFAULT_SCANNER_OPTIONS);
  const [markdownOptions, setMarkdownOptions] = useState<MarkdownOptions>({
    style: 'unicode',
    showStats: true
  });

  const [treeNode, setTreeNode] = useState<DirectoryNode | null>(null);

  // ファイルリストまたはエントリまたはオプションが変更されたらツリーを非同期/同期で再生成
  useEffect(() => {
    let isSubscribed = true;

    async function updateTree() {
      if (rawEntries && rawEntries.length > 0) {
        const parsed = await parseFileSystemEntries(rawEntries, scannerOptions);
        if (isSubscribed) setTreeNode(parsed);
      } else if (rawFiles && rawFiles.length > 0) {
        const parsed = parseFileList(rawFiles, scannerOptions);
        if (isSubscribed) setTreeNode(parsed);
      } else {
        if (isSubscribed) setTreeNode(null);
      }
    }

    updateTree();

    return () => {
      isSubscribed = false;
    };
  }, [rawFiles, rawEntries, scannerOptions]);

  const markdownText = useMemo(() => {
    return generateMarkdownTree(treeNode, markdownOptions);
  }, [treeNode, markdownOptions]);

  const handleFilesSelected = (files: FileList | File[]) => {
    setRawEntries(null);
    setRawFiles(files);
  };

  const handleEntriesSelected = (entries: any[]) => {
    setRawFiles(null);
    setRawEntries(entries);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px' }}>
      <Header />

      <FilePicker
        onFilesSelected={handleFilesSelected}
        onEntriesSelected={handleEntriesSelected}
        folderName={treeNode ? treeNode.name : null}
        fileCount={treeNode ? (treeNode.fileCount || 0) + (treeNode.dirCount || 0) : 0}
      />

      <Controls
        scannerOptions={scannerOptions}
        markdownOptions={markdownOptions}
        onScannerChange={setScannerOptions}
        onMarkdownChange={setMarkdownOptions}
      />

      {treeNode && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
          <TreeViewer rootNode={treeNode} />
          <ExportPanel markdownText={markdownText} rootName={treeNode.name} />
        </div>
      )}

      <Footer />
    </div>
  );
};
