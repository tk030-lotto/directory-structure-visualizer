import { DirectoryNode, MarkdownOptions } from '../types';

const UNICODE_SYMBOLS = {
  branch: '├── ',
  last: '└── ',
  vertical: '│   ',
  space: '    '
};

const ASCII_SYMBOLS = {
  branch: '|-- ',
  last: '\\-- ',
  vertical: '|   ',
  space: '    '
};

/**
 * DirectoryNode ツリーを Markdown テキスト構造に変換
 */
export function generateMarkdownTree(
  root: DirectoryNode | null,
  options: MarkdownOptions = { style: 'unicode', showStats: true }
): string {
  if (!root) return '';

  const symbols = options.style === 'ascii' ? ASCII_SYMBOLS : UNICODE_SYMBOLS;
  const lines: string[] = [];

  // ルートディレクトリー
  let rootHeader = `${root.name}/`;
  if (options.showStats && (root.fileCount !== undefined || root.dirCount !== undefined)) {
    rootHeader += ` (${root.fileCount || 0} files, ${root.dirCount || 0} folders)`;
  }
  lines.push(rootHeader);

  if (root.children && root.children.length > 0) {
    buildTreeLines(root.children, '', lines, symbols, options, 1);
  }

  return lines.join('\n');
}

function buildTreeLines(
  nodes: DirectoryNode[],
  prefix: string,
  lines: string[],
  symbols: typeof UNICODE_SYMBOLS,
  options: MarkdownOptions,
  currentDepth: number
) {
  if (options.maxDisplayDepth && options.maxDisplayDepth > 0 && currentDepth > options.maxDisplayDepth) {
    return;
  }

  nodes.forEach((node, index) => {
    const isLast = index === nodes.length - 1;
    const connector = isLast ? symbols.last : symbols.branch;
    const isDir = node.kind === 'directory';
    
    let line = `${prefix}${connector}${node.name}${isDir ? '/' : ''}`;

    lines.push(line);

    if (isDir && node.children && node.children.length > 0) {
      const newPrefix = prefix + (isLast ? symbols.space : symbols.vertical);
      buildTreeLines(node.children, newPrefix, lines, symbols, options, currentDepth + 1);
    }
  });
}
