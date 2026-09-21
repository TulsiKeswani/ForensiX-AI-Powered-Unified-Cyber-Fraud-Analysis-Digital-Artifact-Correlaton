import json
from typing import Dict, Any
from entity_extraction.extractor import extract_entities_from_text

def parse_json_evidence(file_path: str) -> Dict[str, Any]:
    """Parse JSON mobile logs or structured evidence files."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        raw_text = json.dumps(data)
        entities = extract_entities_from_text(raw_text)

        nodes = []
        for ent in entities:
            nodes.append({
                'id': f"{ent['type']}_{ent['value']}",
                'type': ent['type'],
                'label': ent['value'],
                'value': ent['value']
            })

        return {
            'total_records': len(data) if isinstance(data, list) else 1,
            'nodes': nodes,
            'edges': []
        }
    except Exception as e:
        return {'total_records': 0, 'nodes': [], 'edges': [], 'error': str(e)}
