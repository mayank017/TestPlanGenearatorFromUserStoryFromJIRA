import { FileText, Tag, AlertTriangle, Layers } from 'lucide-react';
import type { IssueData } from '../types';

interface ContextCardProps {
  issueData: IssueData;
}

export default function ContextCard({ issueData }: ContextCardProps) {
  const priorityColors: Record<string, string> = {
    Highest: 'bg-red-100 text-red-800',
    High: 'bg-orange-100 text-orange-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Low: 'bg-green-100 text-green-800',
    Lowest: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">User Story Context</h2>
        <span className="text-sm font-mono text-slate-500">{issueData.key}</span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1">
            <FileText className="w-4 h-4" />
            Summary
          </div>
          <p className="text-slate-800">{issueData.summary}</p>
        </div>

        {issueData.description && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1">
              <FileText className="w-4 h-4" />
              Description
            </div>
            <p className="text-slate-700 text-sm whitespace-pre-wrap">{issueData.description}</p>
          </div>
        )}

        {issueData.acceptance_criteria && issueData.acceptance_criteria.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1">
              <FileText className="w-4 h-4" />
              Acceptance Criteria
            </div>
            <ul className="space-y-1">
              {issueData.acceptance_criteria.map((ac, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  {ac}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">Type:</span>
            <span className="text-sm font-medium text-slate-800">{issueData.issue_type}</span>
          </div>

          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">Priority:</span>
            <span className={`text-sm font-medium px-2 py-0.5 rounded ${priorityColors[issueData.priority] || 'bg-slate-100 text-slate-800'}`}>
              {issueData.priority}
            </span>
          </div>

          {issueData.components.length > 0 && (
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">Components:</span>
              <span className="text-sm font-medium text-slate-800">
                {issueData.components.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}