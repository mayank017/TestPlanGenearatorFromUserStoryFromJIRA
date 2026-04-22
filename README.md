# Jira Test Case Generator

A full-stack web application that connects to Jira, fetches user stories, and auto-generates structured test cases using Groq LLM.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  React +    │────>│  FastAPI   │────>│   Jira     │
│  Tailwind  │     │  Backend   │     │   REST API │
│  Frontend  │<────│  (Python) │<────│   v3       │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           v
                    ┌─────────────┐
                    │  Groq LLM  │
                    │  (Sonnet) │
                    └─────────────┘
```

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Python 3.11 + FastAPI
- **LLM:** Groq (openai/gpt-oss-120b)
- **Jira:** REST API v3 via httpx

## Prerequisites

1. Python 3.11+
2. Node.js 18+
3. Jira Cloud account with API token
4. Groq API key (free at groq.com)

## Quick Start

### 1. Clone and Setup

```bash
cd jira-test-generator
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your credentials:

```env
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-jira-api-token
GROQ_API_KEY=your-groq-api-key
ALLOWED_ORIGINS=http://localhost:5173
GROQ_MODEL=openai/gpt-oss-120b
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend:

```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Docker Compose (Alternative)

```bash
docker-compose up --build
```

## API Endpoints

| Method | Path | Purpose |
|--------|-----|---------|
| POST | `/api/jira/test-connection` | Validate Jira credentials |
| POST | `/api/jira/fetch-issue` | Fetch and parse Jira issue |
| POST | `/api/testcases/generate` | Generate test cases via Groq |
| POST | `/api/testcases/export` | Export to MD/CSV/TSV |

## Test Templates

Available templates in `/templates`:

- `functional.yaml` - Core functionality testing
- `regression.yaml` - Regression testing
- `smoke.yaml` - Smoke testing
- `edge.yaml` - Edge case testing
- `security.yaml` - Security testing

## Usage Flow

1. **Connect:** Enter Jira URL, email, and API token
2. **Test Connection:** Click "Test Connection" to verify
3. **Fetch Issue:** Enter ticket ID (e.g., PROJ-123)
4. **Select Template:** Choose test template type
5. **Generate:** Click "Generate Test Cases"
6. **Edit:** Modify generated cases in the table
7. **Export:** Copy TSV, download MD/CSV

## Test Case Schema

```json
{
  "id": "TC_001",
  "title": "Verify PDF export displays all data",
  "type": "Positive",
  "priority": "P0",
  "preconditions": "User logged in with reports access",
  "steps": ["Navigate to Reports", "Select PDF", "Click Export"],
  "test_data": "Report ID: RPT-001",
  "expected_result": "PDF downloads with all data",
  "linked_jira_id": "PROJ-123"
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JIRA_BASE_URL` | Yes | Jira instance URL |
| `JIRA_EMAIL` | Yes | Jira account email |
| `JIRA_API_TOKEN` | Yes | Jira API token |
| `GROQ_API_KEY` | Yes | Groq API key |
| `ALLOWED_ORIGINS` | No | CORS origins (comma-separated) |
| `GROQ_MODEL` | No | Groq model name |
| `REQUEST_TIMEOUT` | No | Request timeout in seconds |

## Getting Jira API Token

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Copy the token

## Getting Groq API Key

1. Go to https://console.groq.com
2. Sign up/Login
3. Create API key in console

## Development

### Backend Structure

```
backend/
├── app/
│   ├── api/routes/     # API endpoints
│   ├── core/         # Business logic
│   ├── models/       # Pydantic schemas
│   └── config.py     # Settings
├── templates/       # Test templates
├── Dockerfile
└── requirements.txt
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/  # React components
│   ├── services/    # API client
│   └── types/      # TypeScript types
├── package.json
└── vite.config.ts
```

## License

MIT