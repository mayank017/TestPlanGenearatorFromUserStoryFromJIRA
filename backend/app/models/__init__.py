from pydantic import BaseModel, Field
from typing import Optional


class ConnectionTestRequest(BaseModel):
    base_url: str
    email: str
    api_token: str


class ConnectionTestResponse(BaseModel):
    success: bool
    message: str
    server_info: Optional[dict] = None
    error: Optional[str] = None


class FetchIssueRequest(BaseModel):
    ticket_id: str
    base_url: str
    email: str
    api_token: str


class IssueData(BaseModel):
    id: str
    key: str
    summary: str
    description: str
    acceptance_criteria: list[str]
    issue_type: str
    priority: str
    components: list[str]
    linked_issues: list[str] = []


class GenerateTestCasesRequest(BaseModel):
    issue_data: IssueData
    template_name: str = "functional"
    custom_template: Optional[str] = None
    min_cases: int = Field(default=5, ge=5)
    groq_model: Optional[str] = None
    groq_api_key: Optional[str] = None


class TestCase(BaseModel):
    id: str
    title: str
    type: str
    priority: str
    preconditions: str
    steps: list[str]
    test_data: str
    expected_result: str
    linked_jira_id: str


class GenerateTestCasesResponse(BaseModel):
    test_cases: list[TestCase]
    generation_time_ms: int
    token_usage: dict


class ExportRequest(BaseModel):
    test_cases: list[TestCase]
    format: str = "markdown"


class ExportResponse(BaseModel):
    filename: str
    content: str
    mime_type: str