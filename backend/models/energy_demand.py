# models/energy_demand.py

import pandas as pd
import numpy as np
import joblib
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.metrics import MeanSquaredError
import holidays
from datetime import datetime

# Load scaler
scaler = joblib.load("models/ml_models/scaler.joblib")

# Load models
def load_energy_models():
    models = {}
    model_paths = {
        'random_forest': 'models/ml_models/random_forest.joblib',
        'xgboost': 'models/ml_models/xgboost.joblib',
        'lightgbm': 'models/ml_models/lightgbm.joblib',
        'gradient_boosting': 'models/ml_models/gradient_boosting.joblib',
        'ensemble': 'models/ml_models/ensemble.joblib'
    }
    for name, path in model_paths.items():
        try:
            print(f"Loading model: {name} from {path}")
            models[name] = joblib.load(path)
            print(f"Model {name} loaded successfully.")
        except:
            pass

    try:
        print("Loading LSTM model...")
        lstm_model = load_model("models/ml_models/lstm_model.h5", custom_objects={"mse": MeanSquaredError()})
        lstm_model.compile(optimizer='adam', loss='mse', metrics=['mse'])
        models['lstm'] = lstm_model
        print("LSTM model loaded successfully.")
    except:
        pass

    return models

# Preprocess input
def preprocess_input(payload: dict):
    time_str = payload['timestamp']
    # Parse using the original format
    print("input time: ", time_str)
    dt = datetime.strptime(time_str, '%Y-%m-%dT%H:%M' if 'T' in time_str else '%Y-%m-%d %H:%M')

    # Reformat to desired format
    reformatted_time_str = dt.strftime('%d/%m/%Y %H:%M')
    print("converted time format + ", reformatted_time_str)
    input_time = pd.to_datetime(reformatted_time_str, format='%d/%m/%Y %H:%M')
    lag_24h = payload['lag_24h']
    lag_48h = lag_72h = rolling_mean = lag_24h
    
    df = pd.DataFrame({
        'Time': [input_time],
        'building 41_lag_24h': [lag_24h],
        'building 41_lag_48h': [lag_48h],
        'building 41_lag_72h': [lag_72h],
        'building 41_rolling_24h_mean': [rolling_mean],
        'Temp': [payload['Temp']],
        'RH': [payload['RH']/100],  # Normalize RH to [0, 1]
        'FF': [payload['FF']],
        'P': [payload['P']]
    })
    
    df['hour'] = df['Time'].dt.hour
    df['day_of_week'] = df['Time'].dt.dayofweek
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
    nl_holidays = holidays.Netherlands(years=[input_time.year])
    df['is_holiday'] = df['Time'].dt.date.isin(nl_holidays).astype(int)
    df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
    df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)

    features = [
        'hour_sin', 'hour_cos', 'is_weekend', 'is_holiday',
        'building 41_lag_24h', 'building 41_lag_48h', 'building 41_lag_72h',
        'building 41_rolling_24h_mean', 'Temp', 'RH', 'FF', 'P'
    ]

    X_scaled = scaler.transform(df[features])
    X_seq = np.repeat(X_scaled, 24, axis=0).reshape(1, 24, len(features))
    
    return X_scaled, tf.convert_to_tensor(X_seq, dtype=tf.float32), input_time

# Predict
def predict_energy_consumption(payload: dict):
    models = load_energy_models()
    print("Models loaded successfully.")
    X_scaled, X_seq, input_time = preprocess_input(payload)
    print("Input data preprocessed successfully.")
    predictions = {}

    for name, model in models.items():
        if name == 'lstm':
            pred = np.round(model(X_seq).numpy().flatten()[0]).astype(int)
        elif name == 'ensemble':
            weights = model['weights']
            model_preds = []
            for m_name, m in model['models'].items():
                if m_name == 'lstm':
                    model_preds.append(model['models'][m_name](X_seq).numpy().flatten()[0])
                else:
                    model_preds.append(model['models'][m_name].predict(X_scaled)[0])
            pred = np.round(np.average(model_preds, weights=[weights[m] for m in model['models']])).astype(int)
        else:
            pred = np.round(model.predict(X_scaled)[0]).astype(int)
        predictions[name] = int(pred)

    return {
        'timestamp': input_time.strftime('%Y-%m-%d %H:%M'),
        'predictions': predictions
    }
