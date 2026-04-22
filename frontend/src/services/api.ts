import axios from 'axios';
import type {
  ConnectionTestRequest,
  ConnectionTestResponse,
  FetchIssueRequest,
  IssueData,
  GenerateTestCasesRequest,
  GenerateTestCasesResponse,
  ExportRequest,
  ExportResponse
} from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const jiraApi = {
  testConnection: async (data: ConnectionTestRequest): Promise<ConnectionTestResponse> => {
    const response = await api.post<ConnectionTestResponse>('/jira/test-connection', data);
    return response.data;
  },

  fetchIssue: async (data: FetchIssueRequest): Promise<{ success: boolean; issue?: IssueData; error?: string }> => {
    const response = await api.post('/jira/fetch-issue', data);
    return response.data;
  },
};

export const testCaseApi = {
  generate: async (data: GenerateTestCasesRequest): Promise<GenerateTestCasesResponse> => {
    const response = await api.post<GenerateTestCasesResponse>('/testcases/generate', data);
    return response.data;
  },

  export: async (data: ExportRequest): Promise<ExportResponse> => {
    const response = await api.post<ExportResponse>('/testcases/export', data);
    return response.data;
  },
};

export default api;