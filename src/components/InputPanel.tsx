import { Loader2, AlertCircle } from 'lucide-react';
import type { IssueData, GenerationStatus, TemplateType, TEMPLATES } from '../types';

interface InputPanelProps {
  ticketId: string;
  setTicketId: (val: string) => void;
  template: string;
  setTemplate: (val: string) => void;
  isConnected: boolean;
  isLoading: boolean;
  onFetch: () => void;
  error: string;
  issueData: IssueData | null;
  onGenerate: () => void;
  generationStatus: GenerationStatus;
  generationError: string;
}

export default function InputPanel({
  ticketId,
  setTicketId,
  template,
  setTemplate,
  isConnected,
  isLoading,
  onFetch,
  error,
  issueData,
  onGenerate,
  generationStatus,
  generationError,
}: InputPanelProps) {
  const templates = ['functional', 'regression', 'smoke', 'edge', 'security'] as const;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Generate Test Cases</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Jira Ticket ID
          </label>
          <input
            type="text"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            placeholder="PROJ-123"
            disabled={!isConnected}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed uppercase"
          />
        </div>

        <button
          onClick={onFetch}
          disabled={isLoading || !isConnected || !ticketId}
          className="w-full py-2 px-4 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {issueData ? 'Refresh Issue' : 'Fetch Issue'}
        </button>

        {error && !issueData && (
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {issueData && (
          <>
            <div className="border-t border-slate-200 pt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Test Template
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {templates.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)} Testing
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onGenerate}
              disabled={generationStatus === 'loading'}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {generationStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate Test Cases
            </button>

            {generationError && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{generationError}</span>
              </div>
            )}

            {generationStatus === 'success' && (
              <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                Test cases generated successfully!
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}