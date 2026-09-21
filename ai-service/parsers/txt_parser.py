from typing import Dict, Any
from entity_extraction.extractor import extract_entities_from_text

def parse_txt_evidence(file_path: str) -> Dict[str, Any]:
    """Parse raw text complaints, chat logs, or mobile text dumps."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()

        entities = extract_entities_from_text(text)
        nodes = []
        for ent in entities:
            nodes.append({
                'id': f"{ent['type']}_{ent['value']}",
                'type': ent['type'],
                'label': ent['value'],
                'value': ent['value']
            })

        return {
            'total_records': len(text.splitlines()),
            'nodes': nodes,
            'edges': []
        }
    except Exception as e:
        return {'total_records': 0, 'nodes': [], 'edges': [], 'error': str(e)}
