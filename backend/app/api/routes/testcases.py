from fastapi import APIRouter, HTTPException
from app.models import (
    GenerateTestCasesRequest,
    GenerateTestCasesResponse,
    TestCase,
    ExportRequest,
    ExportResponse
)
from app.core import LLMClient, load_template, load_custom_template
import os

router = APIRouter(prefix="/api/testcases", tags=["testcases"])


@router.post("/generate", response_model=GenerateTestCasesResponse)
async def generate_test_cases(request: GenerateTestCasesRequest):
    api_key = request.groq_api_key or os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is required. Please enter your Groq API key.")

    if request.custom_template:
        template = load_custom_template(request.custom_template)
    else:
        template = load_template(request.template_name)

    if not template:
        raise HTTPException(status_code=400, detail="Invalid template")

    model = request.groq_model or os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")
    llm_client = LLMClient(api_key=api_key, model=model)

    issue_dict = request.issue_data.model_dump()

    result = llm_client.generate_test_cases(
        issue_data=issue_dict,
        template=template,
        min_cases=request.min_cases
    )

    test_cases = result["test_cases"]

    for i, tc in enumerate(test_cases):
        if "id" not in tc:
            tc["id"] = f"TC_{str(i+1).zfill(3)}"
        if "linked_jira_id" not in tc:
            tc["linked_jira_id"] = issue_dict.get("key", "")

    if len(test_cases) < request.min_cases:
        raise HTTPException(
            status_code=400,
            detail=f"Generated only {len(test_cases)} test cases. Minimum {request.min_cases} required."
        )

    return GenerateTestCasesResponse(
        test_cases=[TestCase(**tc) for tc in test_cases[:10]],
        generation_time_ms=result["generation_time_ms"],
        token_usage=result["token_usage"]
    )


@router.post("/export", response_model=ExportResponse)
async def export_test_cases(request: ExportRequest):
    test_cases = request.test_cases
    format_type = request.format.lower()

    if format_type == "markdown":
        content = _to_markdown(test_cases)
        filename = f"{test_cases[0].linked_jira_id}_testcases.md"
        mime_type = "text/markdown"
    elif format_type == "csv":
        content = _to_csv(test_cases)
        filename = f"{test_cases[0].linked_jira_id}_testcases.csv"
        mime_type = "text/csv"
    elif format_type == "tsv":
        content = _to_tsv(test_cases)
        filename = f"{test_cases[0].linked_jira_id}_testcases.tsv"
        mime_type = "text/tab-separated-values"
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")

    return ExportResponse(
        filename=filename,
        content=content,
        mime_type=mime_type
    )


def _to_markdown(test_cases: list[TestCase]) -> str:
    lines = ["# Test Cases\n"]

    for tc in test_cases:
        lines.append(f"## {tc.id}: {tc.title}\n")
        lines.append(f"- **Type:** {tc.type}")
        lines.append(f"- **Priority:** {tc.priority}")
        lines.append(f"- **Preconditions:** {tc.preconditions}")
        lines.append(f"- **Test Data:** {tc.test_data}")
        lines.append(f"- **Expected Result:** {tc.expected_result}")
        lines.append("\n### Steps:")
        for i, step in enumerate(tc.steps, 1):
            lines.append(f"{i}. {step}")
        lines.append(f"\n---\n")

    return "\n".join(lines)


def _to_csv(test_cases: list[TestCase]) -> str:
    header = "ID,Title,Type,Priority,Preconditions,Steps,Test Data,Expected Result,Linked Jira\n"
    rows = []

    for tc in test_cases:
        steps = "|".join(tc.steps)
        row = f'"{tc.id}","{tc.title}","{tc.type}","{tc.priority}","{tc.preconditions}","{steps}","{tc.test_data}","{tc.expected_result}","{tc.linked_jira_id}"'
        rows.append(row)

    return header + "\n".join(rows)


def _to_tsv(test_cases: list[TestCase]) -> str:
    header = "ID\tTitle\tType\tPriority\tPreconditions\tSteps\tTest Data\tExpected Result\tLinked Jira\n"
    rows = []

    for tc in test_cases:
        steps = "|".join(tc.steps)
        row = f"{tc.id}\t{tc.title}\t{tc.type}\t{tc.priority}\t{tc.preconditions}\t{steps}\t{tc.test_data}\t{tc.expected_result}\t{tc.linked_jira_id}"
        rows.append(row)

    return header + "\n".join(rows)