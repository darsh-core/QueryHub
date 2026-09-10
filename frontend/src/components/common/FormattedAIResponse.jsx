import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

export const FormattedAIResponse = ({ content, className = '' }) => {
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!content) return null;

  const handleCopy = (codeText, idx) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Helper to parse block elements (code blocks vs text blocks)
  const parseBlocks = (rawText) => {
    const codeBlockRegex = /```([a-zA-Z0-9_]*)\n([\s\S]*?)```/g;
    const blocks = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(rawText)) !== null) {
      if (match.index > lastIndex) {
        blocks.push({
          type: 'text',
          content: rawText.slice(lastIndex, match.index)
        });
      }
      blocks.push({
        type: 'code',
        language: match[1] || 'sql',
        content: match[2].trim()
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < rawText.length) {
      blocks.push({
        type: 'text',
        content: rawText.slice(lastIndex)
      });
    }

    return blocks;
  };

  // Helper to render text with inline markdown (headings, bold, lists, inline code)
  const renderFormattedText = (textChunk) => {
    const lines = textChunk.split('\n');
    const renderedElements = [];

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();

      // Heading 1 / 2 / 3
      if (trimmed.startsWith('### ')) {
        renderedElements.push(
          <h4 key={lineIdx} className="text-xs font-bold text-gray-900 mt-2.5 mb-1 uppercase tracking-wider">
            {parseInlineMarkdown(trimmed.replace('### ', ''))}
          </h4>
        );
        return;
      }
      if (trimmed.startsWith('## ')) {
        renderedElements.push(
          <h3 key={lineIdx} className="text-sm font-bold text-gray-900 mt-2.5 mb-1">
            {parseInlineMarkdown(trimmed.replace('## ', ''))}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith('# ')) {
        renderedElements.push(
          <h2 key={lineIdx} className="text-base font-extrabold text-gray-900 mt-2.5 mb-1">
            {parseInlineMarkdown(trimmed.replace('# ', ''))}
          </h2>
        );
        return;
      }

      // Unordered list items (- or *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemText = trimmed.substring(2);
        renderedElements.push(
          <div key={lineIdx} className="flex items-start gap-2 my-1 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#081F5C] mt-1.5 shrink-0" />
            <span className="flex-1">{parseInlineMarkdown(itemText)}</span>
          </div>
        );
        return;
      }

      // Ordered list items (1. 2.)
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        renderedElements.push(
          <div key={lineIdx} className="flex items-start gap-2 my-1 pl-1">
            <span className="font-mono text-[10px] font-bold text-[#081F5C] bg-[#081F5C]/10 px-1.5 py-0.2 rounded shrink-0">
              {numMatch[1]}
            </span>
            <span className="flex-1">{parseInlineMarkdown(numMatch[2])}</span>
          </div>
        );
        return;
      }

      // Empty lines for paragraph spacing
      if (!trimmed) {
        renderedElements.push(<div key={lineIdx} className="h-1" />);
        return;
      }

      // Regular paragraph line
      renderedElements.push(
        <p key={lineIdx} className="my-0.5 leading-relaxed">
          {parseInlineMarkdown(line)}
        </p>
      );
    });

    return renderedElements;
  };

  // Helper to parse **bold** and `inline code`
  const parseInlineMarkdown = (str) => {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} className="font-bold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={pIdx} className="font-mono text-[11px] bg-[#081F5C]/10 text-[#081F5C] px-1.5 py-0.5 rounded border border-[#081F5C]/20 font-semibold">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const blocks = parseBlocks(content);

  return (
    <div className={`space-y-2 text-xs text-gray-800 font-sans leading-relaxed ${className}`}>
      {blocks.map((block, bIdx) => {
        if (block.type === 'code') {
          return (
            <div key={bIdx} className="my-2 rounded-xl overflow-hidden border border-[#081F5C]/30 bg-[#0A192F] shadow-xs">
              {/* Code Block Header Bar */}
              <div className="bg-[#081F5C] px-3 py-1.5 flex items-center justify-between text-white text-[10px] font-mono">
                <div className="flex items-center gap-1.5 text-blue-200">
                  <Terminal className="w-3.5 h-3.5" />
                  <span className="font-bold uppercase tracking-wider">{block.language || 'SQL'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(block.content, bIdx)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Copy code to clipboard"
                >
                  {copiedIdx === bIdx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-300 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Text Body */}
              <pre className="p-3 overflow-x-auto text-[11px] font-mono text-blue-100 leading-relaxed bg-[#061224]">
                <code>{block.content}</code>
              </pre>
            </div>
          );
        }

        return <div key={bIdx}>{renderFormattedText(block.content)}</div>;
      })}
    </div>
  );
};
