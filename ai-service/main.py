import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

from parsers.csv_parser import parse_csv_evidence
from parsers.xlsx_parser import parse_xlsx_evidence
from parsers.json_parser import parse_json_evidence
from parsers.txt_parser import parse_txt_evidence
from parsers.eml_parser import parse_eml_evidence
from analytics.graph_analytics import compute_graph_analytics
from analytics.kingpin_detector import detect_kingpin_and_linkages

app = FastAPI(
    title="ForensiX AI & Evidence Processing Service",
    description="Python FastAPI service for parsing cyber digital evidence, extracting entities, resolving canonical nodes, running PageRank/Betweenness, and predicting Main Suspect (Kingpin).",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyticsRequest(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ForensiX Python Processing API"}

@app.post("/process/csv")
async def process_csv(file: UploadFile = File(...), evidence_type: str = Form("cdr")):
    temp_path = f"temp_{file.filename}"
    try:
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        result = parse_csv_evidence(temp_path, evidence_type)
        return {"success": True, "data": result}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/process/xlsx")
async def process_xlsx(file: UploadFile = File(...), evidence_type: str = Form("bank")):
    temp_path = f"temp_{file.filename}"
    try:
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        result = parse_xlsx_evidence(temp_path, evidence_type)
        return {"success": True, "data": result}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/process/json")
async def process_json(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    try:
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        result = parse_json_evidence(temp_path)
        return {"success": True, "data": result}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/process/txt")
async def process_txt(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    try:
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        result = parse_txt_evidence(temp_path)
        return {"success": True, "data": result}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/process/eml")
async def process_eml(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    try:
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        result = parse_eml_evidence(temp_path)
        return {"success": True, "data": result}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/analytics/graph")
def graph_analytics(req: AnalyticsRequest):
    analytics = compute_graph_analytics(req.nodes, req.edges)
    return {"success": True, "analytics": analytics}

@app.post("/analytics/kingpin")
def kingpin_prediction(req: AnalyticsRequest):
    result = detect_kingpin_and_linkages(req.nodes, req.edges)
    return {"success": True, **result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
