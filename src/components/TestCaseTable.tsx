import { Trash2, Plus } from 'lucide-react';
import type { TestCase } from '../types';

interface TestCaseTableProps {
  testCases: TestCase[];
  onUpdate: (index: number, field: keyof TestCase, value: any) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
}

export default function TestCaseTable({ testCases, onUpdate, onAdd, onDelete }: TestCaseTableProps) {
  const typeColors: Record<string, string> = {
    Positive: 'bg-green-100 text-green-800',
    Negative: 'bg-red-100 text-red-800',
    Edge: 'bg-purple-100 text-purple-800',
    Boundary: 'bg-yellow-100 text-yellow-800',
    Security: 'bg-blue-100 text-blue-800',
  };

  const priorityColors: Record<string, string> = {
    P0: 'bg-red-100 text-red-800',
    P1: 'bg-orange-100 text-orange-800',
    P2: 'bg-slate-100 text-slate-800',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          Generated Test Cases ({testCases.length})
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Row
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium w-20">ID</th>
              <th className="px-4 py-3 text-left font-medium w-48">Title</th>
              <th className="px-4 py-3 text-left font-medium w-24">Type</th>
              <th className="px-4 py-3 text-left font-medium w-20">Priority</th>
              <th className="px-4 py-3 text-left font-medium w-36">Preconditions</th>
              <th className="px-4 py-3 text-left font-medium w-48">Steps</th>
              <th className="px-4 py-3 text-left font-medium w-32">Test Data</th>
              <th className="px-4 py-3 text-left font-medium w-40">Expected Result</th>
              <th className="px-4 py-3 text-center font-medium w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {testCases.map((tc, idx) => (
              <tr key={tc.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={tc.id}
                    onChange={(e) => onUpdate(idx, 'id', e.target.value)}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={tc.title}
                    onChange={(e) => onUpdate(idx, 'title', e.target.value)}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={tc.type}
                    onChange={(e) => onUpdate(idx, 'type', e.target.value)}
                    className={`w-full px-2 py-1 border border-slate-200 rounded text-xs font-medium ${typeColors[tc.type] || 'bg-slate-100'}`}
                  >
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                    <option value="Edge">Edge</option>
                    <option value="Boundary">Boundary</option>
                    <option value="Security">Security</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={tc.priority}
                    onChange={(e) => onUpdate(idx, 'priority', e.target.value)}
                    className={`w-full px-2 py-1 border border-slate-200 rounded text-xs font-medium ${priorityColors[tc.priority] || 'bg-slate-100'}`}
                  >
                    <option value="P0">P0</option>
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <textarea
                    value={tc.preconditions}
                    onChange={(e) => onUpdate(idx, 'preconditions', e.target.value)}
                    rows={2}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <textarea
                    value={tc.steps.join('\n')}
                    onChange={(e) => onUpdate(idx, 'steps', e.target.value.split('\n').filter(s => s.trim()))}
                    rows={2}
                    placeholder="Step 1&#10;Step 2"
                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <textarea
                    value={tc.test_data}
                    onChange={(e) => onUpdate(idx, 'test_data', e.target.value)}
                    rows={2}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <textarea
                    value={tc.expected_result}
                    onChange={(e) => onUpdate(idx, 'expected_result', e.target.value)}
                    rows={2}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onDelete(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {testCases.length < 5 && (
        <div className="px-5 py-3 bg-yellow-50 border-t border-yellow-200 text-sm text-yellow-800">
          Warning: Minimum 5 test cases required. Current: {testCases.length}
        </div>
      )}
    </div>
  );
}