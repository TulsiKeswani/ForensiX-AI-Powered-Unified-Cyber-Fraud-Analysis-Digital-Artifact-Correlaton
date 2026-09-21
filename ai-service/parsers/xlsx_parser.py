import pandas as pd
from typing import Dict, Any
from parsers.csv_parser import parse_csv_evidence

def parse_xlsx_evidence(file_path: str, evidence_type: str = "bank") -> Dict[str, Any]:
    """Parse Excel files by delegating sheet extraction to common record parsing."""
    try:
        df = pd.read_excel(file_path)
        # Convert temporarily to dataframe dictionary and parse
        temp_csv_path = file_path + ".tmp.csv"
        df.to_csv(temp_csv_path, index=False)
        res = parse_csv_evidence(temp_csv_path, evidence_type)
        import os
        if os.path.exists(temp_csv_path):
            os.remove(temp_csv_path)
        return res
    except Exception as e:
        return {'total_records': 0, 'nodes': [], 'edges': [], 'error': str(e)}
