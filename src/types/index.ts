export type NodeKind = 'file' | 'directory';

export interface DirectoryNode {
  id: string;
  name: string;
  path: string;
  kind: NodeKind;
  size?: number;
  children?: DirectoryNode[];
  fileCount?: number;
  dirCount?: number;
}

export interface ScannerOptions {
  excludePatterns: string[];
  maxDepth: number; // 0 means unlimited
  showHidden: boolean;
  includeFiles: boolean;
}

export type TreeStyle = 'unicode' | 'ascii';

export interface MarkdownOptions {
  style: TreeStyle;
  showComments?: boolean;
  showStats?: boolean;
  maxDisplayDepth?: number;
}
