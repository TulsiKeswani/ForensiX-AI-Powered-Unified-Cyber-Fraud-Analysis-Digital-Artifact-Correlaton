import pandas as pd
from typing import Dict, Any, List
from normalization.normalizer import normalize_phone, normalize_email, normalize_upi, normalize_ip, normalize_timestamp

def parse_csv_evidence(file_path: str, evidence_type: str = "cdr") -> Dict[str, Any]:
    """Parse CSV files (CDR, IPDR, Bank logs) into common intermediate representation."""
    df = pd.read_csv(file_path)
    records = []
    nodes = []
    edges = []
    
    headers = [str(col).upper().strip() for col in df.columns]
    
    for idx, row in df.iterrows():
        row_dict = {str(k).upper().strip(): str(v).strip() for k, v in row.items() if pd.notna(v)}
        
        # Detect CDR columns (A_PARTY, B_PARTY / CALLER, RECEIVER)
        caller = row_dict.get('A_PARTY') or row_dict.get('CALLER') or row_dict.get('CALLER_PHONE')
        receiver = row_dict.get('B_PARTY') or row_dict.get('RECEIVER') or row_dict.get('RECEIVER_PHONE')
        timestamp = row_dict.get('START_TIME') or row_dict.get('TIMESTAMP') or row_dict.get('CALL_TIME')
        
        # Detect Bank / UPI columns
        sender_acc = row_dict.get('SENDER_ACCOUNT') or row_dict.get('SENDER_ACC') or row_dict.get('FROM_ACCOUNT')
        receiver_acc = row_dict.get('RECEIVER_ACCOUNT') or row_dict.get('RECEIVER_ACC') or row_dict.get('TO_ACCOUNT')
        upi_id = row_dict.get('UPI_ID') or row_dict.get('VPA')
        ip_addr = row_dict.get('IP_ADDRESS') or row_dict.get('IP')
        imei = row_dict.get('IMEI')

        if caller and receiver:
            c_norm = normalize_phone(caller)
            r_norm = normalize_phone(receiver)
            nodes.append({'id': f"PHONE_{c_norm}", 'type': 'PHONE', 'label': c_norm, 'value': c_norm})
            nodes.append({'id': f"PHONE_{r_norm}", 'type': 'PHONE', 'label': r_norm, 'value': r_norm})
            edges.append({
                'id': f"REL_CDR_{idx}",
                'source': f"PHONE_{c_norm}",
                'target': f"PHONE_{r_norm}",
                'type': 'CALLED',
                'label': 'CALLED',
                'timestamp': normalize_timestamp(timestamp)
            })

        if sender_acc and receiver_acc:
            nodes.append({'id': f"ACC_{sender_acc}", 'type': 'BANK_ACCOUNT', 'label': sender_acc, 'value': sender_acc})
            nodes.append({'id': f"ACC_{receiver_acc}", 'type': 'BANK_ACCOUNT', 'label': receiver_acc, 'value': receiver_acc})
            edges.append({
                'id': f"REL_BANK_{idx}",
                'source': f"ACC_{sender_acc}",
                'target': f"ACC_{receiver_acc}",
                'type': 'TRANSFERRED_TO',
                'label': 'TRANSFERRED_TO',
                'timestamp': normalize_timestamp(timestamp)
            })

    return {
        'total_records': len(df),
        'nodes': nodes,
        'edges': edges
    }
