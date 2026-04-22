from fastapi import APIRouter
from app.models import ConnectionTestRequest, ConnectionTestResponse, FetchIssueRequest, IssueData
from app.core import JiraClient

router = APIRouter(prefix="/api/jira", tags=["jira"])


@router.post("/test-connection", response_model=ConnectionTestResponse)
async def test_connection(request: ConnectionTestRequest):
    client = JiraClient(
        base_url=request.base_url,
        email=request.email,
        api_token=request.api_token
    )
    result = await client.test_connection()
    return ConnectionTestResponse(**result)


@router.post("/fetch-issue")
async def fetch_issue(request: FetchIssueRequest):
    import re
    if not re.match(r'^[A-Z]+-\d+$', request.ticket_id.upper()):
        return {"success": False, "error": "Invalid ticket ID format. Use format like PROJ-123"}

    client = JiraClient(
        base_url=request.base_url,
        email=request.email,
        api_token=request.api_token
    )
    result = await client.fetch_issue(request.ticket_id.upper())

    if not result.get("success"):
        return result

    issue = result["issue"]
    return {
        "success": True,
        "issue": IssueData(**issue).model_dump()
    }