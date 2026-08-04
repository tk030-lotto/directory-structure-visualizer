import { DirectoryNode, ScannerOptions } from '../types';

export const DEFAULT_EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  '.DS_Store',
  'dist',
  'build',
  '.next',
  '.cache',
  'coverage',
  'Thumbs.db'
];

export const DEFAULT_SCANNER_OPTIONS: ScannerOptions = {
  excludePatterns: DEFAULT_EXCLUDE_PATTERNS,
  maxDepth: 0,
  showHidden: false,
  includeFiles: true
};

/**
 * 渡されたパスが除外パターンに一致するか判定
 */
export function isExcluded(name: string, path: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    if (!pattern.trim()) return false;
    const cleanPattern = pattern.trim();

    // 完全一致または前方/後方一致
    if (name === cleanPattern) return true;
    if (path.split('/').includes(cleanPattern)) return true;

    // ワイルドカード処理 (*.log など)
    if (cleanPattern.startsWith('*.')) {
      const ext = cleanPattern.slice(1);
      return name.endsWith(ext);
    }
    return false;
  });
}

/**
 * HTML FileList (input webkitdirectory で選択されたファイル郡) からツリーを構築
 */
export function parseFileList(files: FileList | File[], options: ScannerOptions): DirectoryNode | null {
  if (!files || files.length === 0) return null;

  const fileArray = Array.from(files);
  // webkitRelativePath 例: "my-project/src/components/Header.tsx"
  const rootName = fileArray[0].webkitRelativePath.split('/')[0] || 'root';

  const root: DirectoryNode = {
    id: 'root',
    name: rootName,
    path: rootName,
    kind: 'directory',
    children: [],
    fileCount: 0,
    dirCount: 0,
    size: 0
  };

  fileArray.forEach(file => {
    const relativePath = file.webkitRelativePath || file.name;
    const parts = relativePath.split('/');
    
    // スキップ判定（隠しファイル）
    if (!options.showHidden && parts.some(part => part.startsWith('.') && part !== '.' && part !== '..')) {
      return;
    }

    let current = root;
    let currentPath = rootName;

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      currentPath = `${currentPath}/${part}`;

      // 深度制限チェック
      if (options.maxDepth > 0 && i > options.maxDepth) {
        break;
      }

      // 除外判定
      if (isExcluded(part, currentPath, options.excludePatterns)) {
        break;
      }

      if (!current.children) {
        current.children = [];
      }

      let existing = current.children.find(child => child.name === part);

      if (!existing) {
        existing = {
          id: `${currentPath}-${isFile ? 'f' : 'd'}`,
          name: part,
          path: currentPath,
          kind: isFile ? 'file' : 'directory',
          size: isFile ? file.size : 0,
          children: isFile ? undefined : [],
          fileCount: 0,
          dirCount: 0
        };
        current.children.push(existing);
      }

      if (isFile) {
        current.size = (current.size || 0) + file.size;
      }

      current = existing;
    }
  });

  // ツリーの統計情報と並び替え (ディレクトリ優先、名前順)
  sortAndStatsTree(root);

  return root;
}

/**
 * ツリーのソート（ディレクトリが先、アルファベット順）およびファイル数・ディレクトリー数の再帰集計
 */
export function sortAndStatsTree(node: DirectoryNode): { files: number; dirs: number } {
  if (node.kind === 'file') {
    return { files: 1, dirs: 0 };
  }

  let totalFiles = 0;
  let totalDirs = 0;

  if (node.children) {
    // ディレクトリを上に、ファイルを下にソート
    node.children.sort((a, b) => {
      if (a.kind !== b.kind) {
        return a.kind === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });

    node.children.forEach(child => {
      if (child.kind === 'directory') {
        totalDirs += 1;
        const res = sortAndStatsTree(child);
        totalFiles += res.files;
        totalDirs += res.dirs;
      } else {
        totalFiles += 1;
      }
    });
  }

  node.fileCount = totalFiles;
  node.dirCount = totalDirs;

  return { files: totalFiles, dirs: totalDirs };
}
