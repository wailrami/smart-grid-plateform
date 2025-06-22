# api/endpoints/search.py

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from models.fast_search import FastTimestampSearch
from sklearn.neighbors import BallTree 
import time
import pandas as pd
import numpy as np

router = APIRouter()

MODEL_PATH = "models/ml_models/model.joblib"
searcher = FastTimestampSearch()

try:
    searcher.load_model(MODEL_PATH)
except FileNotFoundError:
    raise RuntimeError(f"❌ model not found at {MODEL_PATH}")

# -------- Models --------
class TimestampQuery(BaseModel):
    timestamp: str

class BulbEntry(BaseModel):
    bulb_number: int
    timestamp: str
    power_consumption__Watts: float
    voltage_levels__Volts: float
    current_fluctuations__Amperes: float
    temperature__Celsius: float
    current_fluctuations_env__Amperes: float
    environmental_conditions: str

# -------- Search Endpoint --------
@router.post("/search")
async def search_timestamp(query: TimestampQuery):
    try:
        idx, dist, ms = searcher.search(query.timestamp, k=5)
        if len(idx) == 0:
            raise HTTPException(status_code=404, detail="No neighbours found")

        rows = searcher.data.iloc[idx].copy()
        rows["distance"] = dist.round(4)

        return {
            "query_timestamp": query.timestamp,
            "elapsed_ms": round(ms, 3),
            "neighbours": rows.to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------- Add Bulb Endpoint --------
@router.post("/search/add")
async def add_bulb(entry: BulbEntry):
    try:
        # Append to the original DataFrame (simplified logic)
        new_row = entry.dict()
        if searcher.data is not None:
            searcher.data = pd.concat([searcher.data, pd.DataFrame([new_row])], ignore_index=True)
        else:
            searcher.data = pd.DataFrame([new_row])

        # Rebuild model index (minimal rebuild)
        searcher.pre = searcher._prep(searcher.data[searcher.timestamp_col])
        searcher.ball_tree = BallTree(searcher.pre)

        return {"message": "Bulb entry added successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

