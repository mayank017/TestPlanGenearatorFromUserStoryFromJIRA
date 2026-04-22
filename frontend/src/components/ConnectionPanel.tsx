import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { ConnectionStatus } from '../types';

interface ConnectionPanelProps {
  baseUrl: string;
  setBaseUrl: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  apiToken: string;
  setApiToken: (val: string) => void;
  groqApiKey: string;
  setGroqApiKey: (val: string) => void;
  connectionStatus: ConnectionStatus;
  connectionError: string;
  onTestConnection: () => void;
}

export default function ConnectionPanel({
  baseUrl,
  setBaseUrl,
  email,
  setEmail,
  apiToken,
  setApiToken,
  groqApiKey,
  setGroqApiKey,
  connectionStatus,
  connectionError,
  onTestConnection,
}: ConnectionPanelProps) {
  const [showToken, setShowToken] = useState(false);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-slate-300" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'loading':
        return 'Testing...';
      case 'success':
        return 'Connected';
      case 'error':
        return 'Error';
      default:
        return 'Not connected';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Jira Connection</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Jira Base URL
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://your-domain.atlassian.net"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your-email@example.com"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            API Token
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Enter your Jira API token"
              className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Groq API Key
          </label>
          <input
            type={showToken ? 'text' : 'password'}
            value={groqApiKey}
            onChange={(e) => setGroqApiKey(e.target.value)}
            placeholder="Enter your Groq API key"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">
            Get free key at console.groq.com
          </p>
        </div>

        <button
          onClick={onTestConnection}
          disabled={connectionStatus === 'loading' || !baseUrl || !email || !apiToken || !groqApiKey}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {connectionStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
          Test Connection
        </button>

        <div className="flex items-center gap-2 text-sm">
          {getStatusIcon()}
          <span className={connectionStatus === 'error' ? 'text-red-600' : connectionStatus === 'success' ? 'text-green-600' : 'text-slate-500'}>
            {getStatusText()}
          </span>
        </div>

        {connectionError && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {connectionError}
          </p>
        )}
      </div>
    </div>
  );
}