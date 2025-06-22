# api/endpoints/search.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from models.fast_search import FastTimestampSearch
import pandas as pd
import io

router = APIRouter()

MODEL_PATH = "models/ml_models/model.joblib"
searcher = FastTimestampSearch()
dataset_loaded = False
print(searcher.timestamp_col)

# try:
#     searcher.load_model(MODEL_PATH)
# except FileNotFoundError:
#     raise RuntimeError(f"❌ model not found at {MODEL_PATH}")

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



@router.post("/search/upload")
async def upload_dataset(file: UploadFile = File(...)):
    global dataset_loaded
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="File must be .csv or .xlsx")
    try:
        contents = await file.read()
        file_obj = io.BytesIO(contents)
        file_type = 'csv' if file.filename.endswith('.csv') else 'excel'
        searcher.load_data(file_obj, file_type)
        dataset_loaded = True
        return {"message": "Dataset uploaded and BallTree built."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------- Search Endpoint --------
@router.post("/search")
async def search_timestamp(query: TimestampQuery):
    if not dataset_loaded:
        raise HTTPException(status_code=400, detail="Dataset not loaded yet.")
    
    try:
        idx, dist, ms = searcher.search(query.timestamp, k=5)
        print(f"Search completed in {ms} ms, found {len(idx)} neighbours")
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
        print(f"Error during search: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error during search: {str(e)}")

# -------- Add Bulb Endpoint --------
@router.post("/add")
async def add_bulb(entry: BulbEntry):
    # if not dataset_loaded:
    #     raise HTTPException(status_code=400, detail="Dataset not loaded yet.")
    
    try:
        print(f"Adding entry: {entry}")
        # converting entry header names to match the searcher's data format
        # bulb_number,timestamp,power_consumption (Watts),voltage_levels (Volts),current_fluctuations (Amperes),temperature (Celsius),environmental_conditions,current_fluctuations_env (Amperes)
        entry_dict = entry.dict()
        entry_dict = {
            "bulb_number": entry_dict["bulb_number"],
            "timestamp": entry_dict["timestamp"],
            "power_consumption (Watts)": entry_dict["power_consumption__Watts"],
            "voltage_levels (Volts)": entry_dict["voltage_levels__Volts"],
            "current_fluctuations (Amperes)": entry_dict["current_fluctuations__Amperes"], 
            "temperature (Celsius)": entry_dict["temperature__Celsius"],
            "current_fluctuations_env (Amperes)": entry_dict["current_fluctuations_env__Amperes"],
            "environmental_conditions": entry_dict["environmental_conditions"],
            "fault_type": 0
        }
        searcher.add_entry(entry_dict)
        print(f"Entry added: {entry_dict}")
        global dataset_loaded
        dataset_loaded = True  # Ensure dataset is marked as loaded after adding entry
        return {"message": "Bulb entry added and BallTree rebuilt."}
    except Exception as e:
        print(f"Error adding bulb entry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

