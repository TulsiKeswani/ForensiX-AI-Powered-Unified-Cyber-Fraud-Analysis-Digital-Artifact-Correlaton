import re
from typing import List, Dict, Any
from normalization.normalizer import (
    normalize_phone, normalize_email, normalize_upi, normalize_ip, normalize_imei
)

PHONE_REGEX = r'\b(?:\+?91[\-\s]?)?[6-9]\d{9}\b'
EMAIL_REGEX = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
UPI_REGEX = r'\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b'
IP_REGEX = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
IMEI_REGEX = r'\b\d{15}\b'
ACCOUNT_REGEX = r'\b(?:ACC|ACCT)?\d{9,18}\b'

def extract_entities_from_text(text: str) -> List[Dict[str, Any]]:
    """Extract structured cyber entities from unstructured text using regex rules."""
    entities = []
    
    # Phone Numbers
    phones = re.findall(PHONE_REGEX, text)
    for p in set(phones):
        norm = normalize_phone(p)
        if len(norm) == 10:
            entities.append({'type': 'PHONE', 'value': norm, 'raw': p})

    # Emails & UPIs
    raw_emails = re.findall(EMAIL_REGEX, text)
    for e in set(raw_emails):
        if any(handle in e.lower() for handle in ['@ybl', '@paytm', '@okicici', '@oksbi', '@upi', '@axis']):
            entities.append({'type': 'UPI', 'value': normalize_upi(e), 'raw': e})
        else:
            entities.append({'type': 'EMAIL', 'value': normalize_email(e), 'raw': e})

    # Standalone UPIs
    upis = re.findall(UPI_REGEX, text)
    for u in set(upis):
        norm_u = normalize_upi(u)
        if not any(ent['value'] == norm_u for ent in entities):
            entities.append({'type': 'UPI', 'value': norm_u, 'raw': u})

    # IP Addresses
    ips = re.findall(IP_REGEX, text)
    for ip in set(ips):
        entities.append({'type': 'IP', 'value': normalize_ip(ip), 'raw': ip})

    # IMEIs
    imeis = re.findall(IMEI_REGEX, text)
    for im in set(imeis):
        entities.append({'type': 'IMEI', 'value': normalize_imei(im), 'raw': im})

    return entities
