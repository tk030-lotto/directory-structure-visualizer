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
 * FileSystemEntry (ドラッグ＆ドロップ時の webkitGetAsEntry) からツリー構造を非同期で走査・構築
 */
export async function parseFileSystemEntries(
  entries: any[],
  options: ScannerOptions
): Promise<DirectoryNode | null> {
  if (!entries || entries.length === 0) return null;

  const rootEntry = entries[0];
  const rootName = rootEntry.name || 'root';

  const root: DirectoryNode = {
    id: 'root',
    name: rootName,
    path: rootName,
    kind: rootEntry.isDirectory ? 'directory' : 'file',
    children: [],
    fileCount: 0,
    dirCount: 0,
    size: 0
  };

  if (rootEntry.isDirectory) {
    await scanEntry(rootEntry, root, rootName, options, 1);
  } else if (options.includeFiles) {
    // Bug5: includeFiles が false のときは単体ファイルのドロップも無視する
    const file = await getFileFromEntry(rootEntry);
    root.size = file ? file.size : 0;
    root.fileCount = 1;
  }

  sortAndStatsTree(root);
  return root;
}

async function scanEntry(
  entry: any,
  parentNode: DirectoryNode,
  currentPath: string,
  options: ScannerOptions,
  currentDepth: number
) {
  if (options.maxDepth > 0 && currentDepth > options.maxDepth) return;
  if (!entry.isDirectory) return;

  const dirReader = entry.createReader();
  const entries = await readAllEntries(dirReader);

  for (const childEntry of entries) {
    const childName = childEntry.name;
    const childPath = `${currentPath}/${childName}`;

    // 隠しファイルチェック
    if (!options.showHidden && childName.startsWith('.') && childName !== '.' && childName !== '..') {
      continue;
    }

    // 除外チェック
    if (isExcluded(childName, childPath, options.excludePatterns)) {
      continue;
    }

    if (!parentNode.children) {
      parentNode.children = [];
    }

    if (childEntry.isDirectory) {
      const dirNode: DirectoryNode = {
        id: `${childPath}-d`,
        name: childName,
        path: childPath,
        kind: 'directory',
        children: [],
        fileCount: 0,
        dirCount: 0,
        size: 0
      };
      parentNode.children.push(dirNode);
      await scanEntry(childEntry, dirNode, childPath, options, currentDepth + 1);
    } else if (childEntry.isFile && options.includeFiles) {
      const file = await getFileFromEntry(childEntry);
      const fileNode: DirectoryNode = {
        id: `${childPath}-f`,
        name: childName,
        path: childPath,
        kind: 'file',
        size: file ? file.size : 0
      };
      parentNode.children.push(fileNode);
    }
  }
}

function readAllEntries(dirReader: any): Promise<any[]> {
  return new Promise((resolve) => {
    let entries: any[] = [];
    const read = () => {
      dirReader.readEntries((batch: any[]) => {
        if (batch.length === 0) {
          resolve(entries);
        } else {
          entries = entries.concat(batch);
          read();
        }
      }, (err: unknown) => {
        // Bug4: エラー時も途中まで読んだ結果で resolve（サイレント失敗を防ぐためログ出力）
        console.warn('[scanner] readEntries failed, partial results returned:', err);
        resolve(entries);
      });
    };
    read();
  });
}

function getFileFromEntry(fileEntry: any): Promise<File | null> {
  return new Promise((resolve) => {
    fileEntry.file((file: File) => resolve(file), () => resolve(null));
  });
}

/**
 * HTML FileList (input webkitdirectory で選択されたファイル群) からツリーを構築
 */
export function parseFileList(files: FileList | File[], options: ScannerOptions): DirectoryNode | null {
  if (!files || files.length === 0) return null;

  const fileArray = Array.from(files);
  // Bug6: webkitRelativePath が空文字の場合も falsy として扱う
  const rawRelativePath = fileArray[0].webkitRelativePath;
  const rootName = rawRelativePath && rawRelativePath.length > 0
    ? rawRelativePath.split('/')[0]
    : (fileArray[0].name || 'root');

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
    
    if (!options.showHidden && parts.some(part => part.startsWith('.') && part !== '.' && part !== '..')) {
      return;
    }

    let current = root;
    let currentPath = rootName;

    // Bug2: webkitRelativePath がある場合は先頭のルート名分 (index=0) をスキップして i=1 開始
    // depth は startIndex からの相対値（1 始まり）で計算し maxDepth と比較する
    const startIndex = file.webkitRelativePath && file.webkitRelativePath.length > 0 ? 1 : 0;
    for (let i = startIndex; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      currentPath = `${currentPath}/${part}`;

      const depth = i - startIndex + 1;
      if (options.maxDepth > 0 && depth > options.maxDepth) {
        break;
      }

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
