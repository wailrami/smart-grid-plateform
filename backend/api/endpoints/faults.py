# api/endpoints/faults.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.fault_prediction import predict_fault
import math

router = APIRouter()

def clean_nans(obj):
    if isinstance(obj, float) and math.isnan(obj):
        return None
    if isinstance(obj, dict):
        return {k: clean_nans(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [clean_nans(v) for v in obj]
    return obj


class FaultInput(BaseModel):
    bulb_number: int
    timestamp: str  # e.g., "28/03/2023 16:28"
    power_consumption__Watts: float
    voltage_levels__Volts: float
    current_fluctuations__Amperes: float
    temperature__Celsius: float
    current_fluctuations_env__Amperes: float
    environmental_conditions: str

@router.post("/predict")
async def predict_fault_route(input_data: FaultInput):
    try:
        data = {
            'bulb_number': input_data.bulb_number,
            'timestamp': input_data.timestamp,
            'power_consumption (Watts)': input_data.power_consumption__Watts,
            'voltage_levels (Volts)': input_data.voltage_levels__Volts,
            'current_fluctuations (Amperes)': input_data.current_fluctuations__Amperes,
            'temperature (Celsius)': input_data.temperature__Celsius,
            'current_fluctuations_env (Amperes)': input_data.current_fluctuations_env__Amperes,
            'environmental_conditions': input_data.environmental_conditions
        }

        result = predict_fault(data)
        # print("Raw Prediction Result:", data)
        result = clean_nans(result)
        # print("Prediction Result:", result)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
