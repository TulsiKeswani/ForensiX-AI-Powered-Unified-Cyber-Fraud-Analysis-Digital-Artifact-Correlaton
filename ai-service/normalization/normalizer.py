import re
from datetime import datetime

def normalize_phone(phone_str: str) -> str:
    """Normalize phone numbers to canonical 10-digit standard or E.164 string."""
    if not phone_str:
        return ""
    digits = re.sub(r'\D', '', str(phone_str))
    if len(digits) == 12 and digits.startswith('91'):
        digits = digits[2:]
    elif len(digits) > 10 and digits.startswith('0'):
        digits = digits.lstrip('0')
    return digits[-10:] if len(digits) >= 10 else digits

def normalize_email(email_str: str) -> str:
    """Normalize email addresses to lowercase."""
    if not email_str:
        return ""
    return str(email_str).strip().lower()

def normalize_upi(upi_str: str) -> str:
    """Normalize UPI IDs to lowercase canonical format."""
    if not upi_str:
        return ""
    return str(upi_str).strip().lower()

def normalize_ip(ip_str: str) -> str:
    """Normalize IP addresses."""
    if not ip_str:
        return ""
    match = re.search(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', str(ip_str))
    return match.group(0) if match else str(ip_str).strip()

def normalize_imei(imei_str: str) -> str:
    """Normalize IMEI string."""
    if not imei_str:
        return ""
    digits = re.sub(r'\D', '', str(imei_str))
    return digits

def normalize_timestamp(ts_str: str) -> str:
    """Normalize various timestamp formats to ISO 8601 UTC."""
    if not ts_str:
        return datetime.utcnow().isoformat() + "Z"
    
    ts_str = str(ts_str).strip()
    formats = [
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%d %H:%M:%S",
        "%d/%m/%Y %H:%M",
        "%d-%b-%Y %H:%M",
        "%Y/%m/%d %H:%M:%S"
    ]
    
    for fmt in formats:
        try:
            dt = datetime.strptime(ts_str, fmt)
            return dt.isoformat() + "Z"
        except ValueError:
            pass
            
    return ts_str
