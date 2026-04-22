export interface ConnectionTestRequest {
  base_url: string;
  email: string;
  api_token: string;
}

export interface ConnectionTestResponse {
  success: boolean;
  message: string;
  server_info?: {
    accountId?: string;
    displayName?: string;
  };
  error?: string;
}

export interface IssueData {
  id: string;
  key: string;
  summary: string;
  description: string;
  acceptance_criteria: string[];
  issue_type: string;
  priority: string;
  components: string[];
  linked_issues: string[];
}

export interface FetchIssueRequest {
  ticket_id: string;
  base_url: string;
  email: string;
  api_token: string;
}

export interface TestCase {
  id: string;
  title: string;
  type: 'Positive' | 'Negative' | 'Edge' | 'Boundary' | 'Security';
  priority: 'P0' | 'P1' | 'P2';
  preconditions: string;
  steps: string[];
  test_data: string;
  expected_result: string;
  linked_jira_id: string;
}

export interface GenerateTestCasesRequest {
  issue_data: IssueData;
  template_name: string;
  custom_template?: string;
  min_cases?: number;
  groq_model?: string;
  groq_api_key?: string;
}

export interface GenerateTestCasesResponse {
  test_cases: TestCase[];
  generation_time_ms: number;
  token_usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ExportRequest {
  test_cases: TestCase[];
  format: 'markdown' | 'csv' | 'tsv';
}

export interface ExportResponse {
  filename: string;
  content: string;
  mime_type: string;
}

export type ConnectionStatus = 'idle' | 'loading' | 'success' | 'error';

export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

export const TEMPLATES = ['functional', 'regression', 'smoke', 'edge', 'security'] as const;

export type TemplateType = typeof TEMPLATES[number];