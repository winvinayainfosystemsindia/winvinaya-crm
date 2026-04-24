import os
from typing import Dict, Any

def load_prompt(filename: str, variables: Dict[str, Any] = None) -> str:
    """
    Loads a prompt from the prompts directory and injects variables.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    prompt_path = os.path.join(base_dir, "prompts", filename)
    
    if not os.path.exists(prompt_path):
        raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
        
    with open(prompt_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    if variables:
        import json
        # Automatically JSON dump lists/dicts for prompt injection
        processed_vars = {}
        for k, v in variables.items():
            if isinstance(v, (list, dict)):
                processed_vars[k] = json.dumps(v)
            else:
                processed_vars[k] = v
        
        try:
            return content.format(**processed_vars)
        except KeyError as e:
            # If a variable is missing in the template, we might want to log it but still return
            return content
            
    return content

def load_skills_reference() -> str:
    """Loads the skills.md file as a context string."""
    return load_prompt("skills.md")
