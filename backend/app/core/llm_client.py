import os
import json
import time
from groq import Groq
from typing import Optional


class LLMClient:
    def __init__(self, api_key: Optional[str] = None, model: str = "openai/gpt-oss-120b"):
        self.api_key = api_key or os.environ.get("GROQ_API_KEY", "")
        self.model = model
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is required")

    def generate_test_cases(
        self,
        issue_data: dict,
        template: dict,
        min_cases: int = 5
    ) -> dict:
        start_time = time.time()

        client = Groq(api_key=self.api_key)

        system_prompt = self._build_system_prompt(template, min_cases)
        user_prompt = self._build_user_prompt(issue_data)

        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=4000,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        generation_time_ms = int((time.time() - start_time) * 1000)

        usage = {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens
        }

        try:
            parsed = json.loads(content)
            test_cases = parsed if isinstance(parsed, list) else parsed.get("test_cases", parsed)
            if isinstance(test_cases, dict):
                test_cases = [test_cases]
        except json.JSONDecodeError:
            test_cases = self._parse_fallback(content)

        return {
            "test_cases": test_cases,
            "generation_time_ms": generation_time_ms,
            "token_usage": usage
        }

    def _build_system_prompt(self, template: dict, min_cases: int) -> str:
        coverage = template.get("coverage", [])
        coverage_text = "\n".join([
            f"- {c.get('type')}: {c.get('description', '')} (weight: {c.get('weight')}%)"
            for c in coverage
        ])

        return f"""You are a senior QA engineer specializing in test case creation.
Generate minimum {min_cases} test cases based on the provided Jira user story.

Always output valid JSON array matching this schema:
[{{
  "id": "TC_XXX",
  "title": "string",
  "type": "Positive|Negative|Edge|Boundary|Security",
  "priority": "P0|P1|P2",
  "preconditions": "string",
  "steps": ["string"],
  "test_data": "string",
  "expected_result": "string",
  "linked_jira_id": "PROJ-XXX"
}}]

Template: {template.get('name', 'Functional')}
Coverage requirements:
{coverage_text}

Tone: {template.get('tone', 'technical')}
Ensure each test case has unique ID (TC_001, TC_002, etc.)"""

    def _build_user_prompt(self, issue_data: dict) -> str:
        return f"""Jira Issue:
- Key: {issue_data.get('key', '')}
- Summary: {issue_data.get('summary', '')}
- Description: {issue_data.get('description', '')}
- Acceptance Criteria: {chr(10).join(issue_data.get('acceptance_criteria', []))}
- Priority: {issue_data.get('priority', '')}
- Components: {', '.join(issue_data.get('components', []))}
- Issue Type: {issue_data.get('issue_type', '')}"""

    def _parse_fallback(self, content: str) -> list[dict]:
        lines = content.strip().split("\n")
        cases = []
        current_case = {}
        linked_id = ""

        for line in lines:
            if '"id"' in line or '"TC_' in line:
                if current_case:
                    cases.append(current_case)
                    current_case = {}
            if '"title"' in line:
                current_case["title"] = line.split(":")[-1].strip().strip('",')
            if '"type"' in line:
                t = line.split(":")[-1].strip().strip('",')
                current_case["type"] = t
                current_case["priority"] = "P1"
                current_case["preconditions"] = ""
                current_case["steps"] = []
                current_case["test_data"] = ""
                current_case["expected_result"] = ""
                current_case["linked_jira_id"] = linked_id

        if current_case:
            cases.append(current_case)

        return cases[:5] if len(cases) > 5 else cases