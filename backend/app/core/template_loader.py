import os
import yaml
from typing import Optional


TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "..", "templates")


def load_template(name: str) -> Optional[dict]:
    if name == "custom":
        return None

    template_path = os.path.join(TEMPLATES_DIR, f"{name}.yaml")
    if not os.path.exists(template_path):
        template_path = os.path.join(TEMPLATES_DIR, "functional.yaml")

    with open(template_path, "r") as f:
        return yaml.safe_load(f)


def load_custom_template(yaml_content: str) -> Optional[dict]:
    try:
        return yaml.safe_load(yaml_content)
    except:
        return None


def list_templates() -> list[str]:
    templates = []
    if os.path.exists(TEMPLATES_DIR):
        for f in os.listdir(TEMPLATES_DIR):
            if f.endswith(".yaml"):
                templates.append(f.replace(".yaml", ""))
    return templates if templates else ["functional"]