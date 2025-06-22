# api/endpoints/energy.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.energy_demand import predict_energy_consumption

router = APIRouter()

class EnergyInput(BaseModel):
    timestamp: str  # Format: 'dd/mm/yyyy HH:MM'
    lag_24h: float
    Temp: float
    RH: float
    FF: float
    P: float

@router.post("/predict")
async def predict_energy(input_data: EnergyInput):
    try:
        print("Received input data:", input_data)
        result = predict_energy_consumption(input_data.dict())
        print("Prediction result:", result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
