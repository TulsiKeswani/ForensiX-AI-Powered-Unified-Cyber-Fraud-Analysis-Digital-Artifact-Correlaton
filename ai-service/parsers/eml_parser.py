import email
from email import policy
from typing import Dict, Any
from entity_extraction.extractor import extract_entities_from_text
from normalization.normalizer import normalize_email

def parse_eml_evidence(file_path: str) -> Dict[str, Any]:
    """Parse email .eml headers and body text."""
    try:
        with open(file_path, 'rb') as f:
            msg = email.message_from_binary_file(f, policy=policy.default)

        sender = normalize_email(msg.get('From', ''))
        receiver = normalize_email(msg.get('To', ''))
        subject = msg.get('Subject', '')
        
        body_text = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == 'text/plain':
                    body_text += part.get_payload(decode=True).decode(errors='ignore')
        else:
            body_text = msg.get_payload(decode=True).decode(errors='ignore')

        full_content = f"{subject}\n{body_text}"
        extracted = extract_entities_from_text(full_content)

        nodes = []
        if sender:
            nodes.append({'id': f"EMAIL_{sender}", 'type': 'EMAIL', 'label': sender, 'value': sender})
        if receiver:
            nodes.append({'id': f"EMAIL_{receiver}", 'type': 'EMAIL', 'label': receiver, 'value': receiver})

        for ent in extracted:
            nodes.append({'id': f"{ent['type']}_{ent['value']}", 'type': ent['type'], 'label': ent['value'], 'value': ent['value']})

        edges = []
        if sender and receiver:
            edges.append({
                'id': f"REL_EML_0",
                'source': f"EMAIL_{sender}",
                'target': f"EMAIL_{receiver}",
                'type': 'SENT_EMAIL',
                'label': 'SENT_EMAIL'
            })

        return {
            'total_records': 1,
            'nodes': nodes,
            'edges': edges
        }
    except Exception as e:
        return {'total_records': 0, 'nodes': [], 'edges': [], 'error': str(e)}
