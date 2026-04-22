import { Copy, FileDown, RefreshCw, Loader2, Check } from 'lucide-react';
import { useState } from 'react';

interface ExportButtonsProps {
  onCopy: () => void;
  onExportMarkdown: () => void;
  onExportCSV: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export default function ExportButtons({
  onCopy,
  onExportMarkdown,
  onExportCSV,
  onRegenerate,
  isRegenerating,
}: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCopy}
          disabled={copied}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            copied
              ? 'bg-green-100 text-green-800'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy TSV
            </>
          )}
        </button>

        <button
          onClick={onExportMarkdown}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Export Markdown
        </button>

        <button
          onClick={onExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <button
        onClick={onRegenerate}
        disabled={isRegenerating}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isRegenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Regenerating...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </>
        )}
      </button>
    </div>
  );
}