import { useState, useCallback, useEffect } from 'react';
import ConnectionPanel from './components/ConnectionPanel';
import InputPanel from './components/InputPanel';
import ContextCard from './components/ContextCard';
import TestCaseTable from './components/TestCaseTable';
import ExportButtons from './components/ExportButtons';
import type { IssueData, TestCase, ConnectionStatus, GenerationStatus } from './types';

const STORAGE_KEY = 'jira-test-gen-config';

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data: { baseUrl: string; email: string; apiToken: string; groqApiKey: string }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function App() {
  const savedConfig = loadFromStorage();
  const [baseUrl, setBaseUrl] = useState(savedConfig?.baseUrl || '');
  const [email, setEmail] = useState(savedConfig?.email || '');
  const [apiToken, setApiToken] = useState(savedConfig?.apiToken || '');
  const [groqApiKey, setGroqApiKey] = useState(savedConfig?.groqApiKey || '');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    saveToStorage({ baseUrl, email, apiToken, groqApiKey });
  }, [baseUrl, email, apiToken, groqApiKey]);

  const [ticketId, setTicketId] = useState('');
  const [template, setTemplate] = useState('functional');
  const [issueData, setIssueData] = useState<IssueData | null>(null);
  const [fetchStatus, setFetchStatus] = useState<GenerationStatus>('idle');
  const [fetchError, setFetchError] = useState('');

  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const [generationError, setGenerationError] = useState('');

  const handleConnectionTest = useCallback(async () => {
    if (!baseUrl || !email || !apiToken) {
      setConnectionError('Please fill in all fields');
      return;
    }

    setConnectionStatus('loading');
    setConnectionError('');

    try {
      const { jiraApi } = await import('./services/api');
      const response = await jiraApi.testConnection({
        base_url: baseUrl,
        email,
        api_token: apiToken,
      });

      if (response.success) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
        setConnectionError(response.error || 'Connection failed');
      }
    } catch (err: any) {
      const errData = err.response?.data;
      const msg = typeof errData?.error === 'string' ? errData.error : errData?.error?.message || err.message || 'Connection failed';
      setConnectionError(msg);
    }
  }, [baseUrl, email, apiToken]);

  const handleFetchIssue = useCallback(async () => {
    if (!ticketId) {
      setFetchError('Please enter a ticket ID');
      return;
    }

    if (!baseUrl || !email || !apiToken) {
      setFetchError('Please configure Jira connection first');
      return;
    }

    setFetchStatus('loading');
    setFetchError('');
    setIssueData(null);
    setTestCases([]);

    try {
      const { jiraApi } = await import('./services/api');
      const response = await jiraApi.fetchIssue({
        ticket_id: ticketId.toUpperCase(),
        base_url: baseUrl,
        email,
        api_token: apiToken,
      });

      if (response.success && response.issue) {
        setIssueData(response.issue);
        setFetchStatus('success');
      } else {
        setFetchStatus('error');
        setFetchError(response.error || 'Failed to fetch issue');
      }
    } catch (err: any) {
      const errData = err.response?.data;
      const msg = typeof errData?.error === 'string' ? errData.error : errData?.error?.message || err.message || 'Failed to fetch issue';
      setFetchError(msg);
    }
  }, [ticketId, baseUrl, email, apiToken]);

  const handleGenerate = useCallback(async () => {
    if (!issueData) {
      setGenerationError('Please fetch an issue first');
      return;
    }

    if (!groqApiKey) {
      setGenerationError('Please enter your Groq API key');
      return;
    }

    setGenerationStatus('loading');
    setGenerationError('');

    try {
      const { testCaseApi } = await import('./services/api');
      const response = await testCaseApi.generate({
        issue_data: issueData,
        template_name: template,
        min_cases: 5,
        groq_api_key: groqApiKey,
      });

      setTestCases(response.test_cases);
      setGenerationStatus('success');
    } catch (err: any) {
      const errData = err.response?.data;
      const msg = typeof errData?.detail === 'string' ? errData.detail : typeof errData?.error === 'string' ? errData.error : errData?.error?.message || err.message || 'Failed to generate test cases';
      setGenerationError(msg);
    }
  }, [issueData, template, groqApiKey]);

  const handleTestCaseUpdate = useCallback((index: number, field: keyof TestCase, value: any) => {
    setTestCases(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const handleAddTestCase = useCallback(() => {
    const newId = `TC_${String(testCases.length + 1).padStart(3, '0')}`;
    const newCase: TestCase = {
      id: newId,
      title: '',
      type: 'Positive',
      priority: 'P1',
      preconditions: '',
      steps: [''],
      test_data: '',
      expected_result: '',
      linked_jira_id: issueData?.key || '',
    };
    setTestCases(prev => [...prev, newCase]);
  }, [testCases.length, issueData]);

  const handleDeleteTestCase = useCallback((index: number) => {
    setTestCases(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleRegenerate = useCallback(() => {
    setTestCases([]);
    setGenerationStatus('idle');
    handleGenerate();
  }, [handleGenerate]);

  const handleExport = useCallback(async (format: 'markdown' | 'csv' | 'tsv') => {
    if (testCases.length === 0) return;

    try {
      const { testCaseApi } = await import('./services/api');
      const response = await testCaseApi.export({
        test_cases: testCases,
        format,
      });

      const blob = new Blob([response.content], { type: response.mime_type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [testCases]);

  const handleCopyToClipboard = useCallback(async () => {
    if (testCases.length === 0) return;

    const tsv = testCases.map(tc =>
      [tc.id, tc.title, tc.type, tc.priority, tc.preconditions, tc.steps.join('|'), tc.test_data, tc.expected_result, tc.linked_jira_id]
      .join('\t')
    ).join('\n');

    const header = 'ID\tTitle\tType\tPriority\tPreconditions\tSteps\tTest Data\tExpected Result\tLinked Jira';
    await navigator.clipboard.writeText(header + '\n' + tsv);
  }, [testCases]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-800">Jira Test Case Generator</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <ConnectionPanel
              baseUrl={baseUrl}
              setBaseUrl={setBaseUrl}
              email={email}
              setEmail={setEmail}
              apiToken={apiToken}
              setApiToken={setApiToken}
              groqApiKey={groqApiKey}
              setGroqApiKey={setGroqApiKey}
              connectionStatus={connectionStatus}
              connectionError={connectionError}
              onTestConnection={handleConnectionTest}
            />

            <InputPanel
              ticketId={ticketId}
              setTicketId={setTicketId}
              template={template}
              setTemplate={setTemplate}
              isConnected={connectionStatus === 'success'}
              isLoading={fetchStatus === 'loading'}
              onFetch={handleFetchIssue}
              error={fetchError}
              issueData={issueData}
              onGenerate={handleGenerate}
              generationStatus={generationStatus}
              generationError={generationError}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {issueData && (
              <ContextCard issueData={issueData} />
            )}

            {testCases.length > 0 && (
              <TestCaseTable
                testCases={testCases}
                onUpdate={handleTestCaseUpdate}
                onAdd={handleAddTestCase}
                onDelete={handleDeleteTestCase}
              />
            )}

            {testCases.length > 0 && (
              <ExportButtons
                onCopy={handleCopyToClipboard}
                onExportMarkdown={() => handleExport('markdown')}
                onExportCSV={() => handleExport('csv')}
                onRegenerate={handleRegenerate}
                isRegenerating={generationStatus === 'loading'}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;