import requests

OLLAMA_URL = "http://localhost:11434/api/generate"

def generate_response(prompt: str):
    payload = {
        "model": "llama3.2:3b",
        "prompt": prompt,
        "stream": False
    }

    response = requests.post(OLLAMA_URL, json=payload)
    return response.json()["response"]



def generate_rag_response(current_entry: str, retrieved_entries: list):
    context_block = "\n\n".join(retrieved_entries)

    prompt = f"""
You are an emotional reflection assistant.

Here are some past diary entries of the user:
{context_block}

Current diary entry:
{current_entry}

Based on past patterns and the current entry:
- Provide a short emotional reflection.
- Suggest one helpful coping strategy.
Keep it supportive and concise.
"""

    return generate_response(prompt)
