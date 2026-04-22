import httpx
import base64
from typing import Optional


class JiraClient:
    def __init__(self, base_url: str, email: str, api_token: str):
        self.base_url = base_url.rstrip("/")
        self.email = email
        self.api_token = api_token
        self.headers = self._build_headers()

    def _build_headers(self) -> dict:
        credentials = f"{self.email}:{self.api_token}"
        encoded = base64.b64encode(credentials.encode()).decode()
        return {
            "Authorization": f"Basic {encoded}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    async def test_connection(self) -> dict:
        async with httpx.AsyncClient(timeout=10) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/rest/api/3/myself",
                    headers=self.headers
                )
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "message": "Connection successful",
                        "server_info": {
                            "accountId": data.get("accountId"),
                            "displayName": data.get("displayName")
                        }
                    }
                elif response.status_code == 401:
                    return {"success": False, "error": "Invalid credentials"}
                elif response.status_code == 403:
                    return {"success": False, "error": "Access denied"}
                else:
                    return {"success": False, "error": f"HTTP {response.status_code}"}
            except httpx.ConnectError:
                return {"success": False, "error": "Cannot connect to Jira server"}
            except Exception as e:
                return {"success": False, "error": str(e)}

    async def fetch_issue(self, ticket_id: str) -> dict:
        async with httpx.AsyncClient(timeout=30) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/rest/api/3/issue/{ticket_id}",
                    headers=self.headers
                )
                if response.status_code == 404:
                    return {"success": False, "error": f"Issue {ticket_id} not found"}
                elif response.status_code == 401:
                    return {"success": False, "error": "Invalid credentials"}
                elif response.status_code == 403:
                    return {"success": False, "error": "Access denied"}
                elif response.status_code != 200:
                    return {"success": False, "error": f"HTTP {response.status_code}"}

                data = response.json()
                return self._parse_issue(data)
            except httpx.ConnectError:
                return {"success": False, "error": "Cannot connect to Jira server"}
            except Exception as e:
                return {"success": False, "error": str(e)}

    def _parse_issue(self, data: dict) -> dict:
        fields = data.get("fields", {})
        description = fields.get("description", {})
        description_text = self._extract_description(description)

        acceptance_criteria = self._extract_acceptance_criteria(description)

        return {
            "success": True,
            "issue": {
                "id": data.get("id"),
                "key": data.get("key"),
                "summary": fields.get("summary", ""),
                "description": description_text,
                "acceptance_criteria": acceptance_criteria,
                "issue_type": fields.get("issuetype", {}).get("name", "Story"),
                "priority": fields.get("priority", {}).get("name", "Medium"),
                "components": [c.get("name", "") for c in fields.get("components", [])],
                "linked_issues": [
                    i.get("key", "") for i in fields.get("issuelinks", [])
                    if i.get("outwardIssue")
                ]
            }
        }

    def _extract_description(self, desc: dict) -> str:
        if isinstance(desc, str):
            return desc
        if isinstance(desc, dict):
            content = desc.get("content", [])
            if content:
                return self._extract_text_from_content(content[0])
        return ""

    def _extract_text_from_content(self, content: dict) -> str:
        parts = content.get("content", [])
        texts = []
        for part in parts:
            if part.get("type") == "text":
                texts.append(part.get("text", ""))
        return "".join(texts)

    def _extract_acceptance_criteria(self, desc: dict) -> list[str]:
        criteria = []
        if isinstance(desc, dict):
            content = desc.get("content", [])
            for block in content:
                for part in block.get("content", []):
                    if part.get("type") == "paragraph":
                        text = "".join(
                            t.get("text", "")
                            for t in part.get("content", [])
                            if t.get("type") == "text"
                        )
                        if "acceptance" in text.lower() or "criterion" in text.lower():
                            criteria.append(text)
        return criteria if criteria else ["No acceptance criteria found"]