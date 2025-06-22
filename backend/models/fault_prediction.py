# models/fault_prediction.py

import pandas as pd
import numpy as np
import joblib
from datetime import datetime
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

# Load pre-trained models once
models = {
    'binary': {
        # 'gradient_boosting': joblib.load('models/ml_models/binary_gradient_boosting.joblib'),
        # 'logistic_regression': joblib.load('models/binary_logistic_regression.joblib'),
        # 'xgboost': joblib.load('models/binary_xgboost.joblib'),
        'random_forest': joblib.load('models/ml_models/binary_random_forest.joblib'),
    },
    'multiclass': {
        # 'gradient_boosting': joblib.load('models/ml_models/multiclass_gradient_boosting.joblib'),
        # 'xgboost': joblib.load('models/multiclass_xgboost.joblib'),
        'random_forest': joblib.load('models/ml_models/multiclass_random_forest.joblib')
    }
}

fault_types = {
    0: 'No Fault',
    1: 'Electrical Fault',
    2: 'Temperature Fault',
    3: 'Environmental Fault'
}

def create_features(input_data: dict) -> pd.DataFrame:
    df = pd.DataFrame([input_data])
    df['timestamp'] = pd.to_datetime(df['timestamp'], dayfirst=True)

    df['hour'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['month'] = df['timestamp'].dt.month
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)

    df['is_rainy'] = (df['environmental_conditions'] == 'Rainy').astype(int)
    df['is_cloudy'] = (df['environmental_conditions'] == 'Cloudy').astype(int)

    df['power_voltage_ratio'] = df['power_consumption (Watts)'] / df['voltage_levels (Volts)'].replace(0, np.nan)
    df['power_voltage_ratio'].fillna(0, inplace=True)
    df['current_imbalance'] = df['current_fluctuations (Amperes)'] - df['current_fluctuations_env (Amperes)']

    # Add placeholder values for rolling stats and days since last record
    rolling_cols = ['power_consumption (Watts)', 'voltage_levels (Volts)', 'current_fluctuations (Amperes)']
    for col in rolling_cols:
        df[f'{col}_rolling_avg'] = df[col]
        df[f'{col}_rolling_std'] = 0

    df['days_since_last_record'] = 0

    features = [
        'bulb_number',
        'power_consumption (Watts)',
        'voltage_levels (Volts)',
        'current_fluctuations (Amperes)',
        'temperature (Celsius)',
        'current_fluctuations_env (Amperes)',
        'power_consumption (Watts)_rolling_avg',
        'voltage_levels (Volts)_rolling_avg',
        'current_fluctuations (Amperes)_rolling_avg',
        'power_consumption (Watts)_rolling_std',
        'voltage_levels (Volts)_rolling_std',
        'current_fluctuations (Amperes)_rolling_std',
        'days_since_last_record',
        'hour', 'day_of_week', 'month', 'is_weekend',
        'is_rainy', 'is_cloudy', 'power_voltage_ratio', 'current_imbalance'
    ]

    return df[features]

def predict_fault(input_data: dict) -> dict:
    X = create_features(input_data)

    binary_results = {}
    for name, model in models['binary'].items():
        pred = model.predict(X)[0]
        proba = model.predict_proba(X)[0][1] if hasattr(model, 'predict_proba') else None

        metrics = {
            'accuracy': None,
            'precision': None,
            'recall': None,
            'f1': None,
            'roc_auc': None
        }

        if hasattr(model, 'predict_proba'):
            try:
                metrics['roc_auc'] = float(roc_auc_score([1 if pred == 'Fault' else 0], [proba]))
            except:
                pass

        binary_results[name] = {
            'prediction': 'Fault' if pred == 1 else 'No Fault',
            'probability': proba,
            'metrics': metrics
        }

    multiclass_results = {}
    for name, model in models['multiclass'].items():
        pred = model.predict(X)[0]
        proba = model.predict_proba(X)[0] if hasattr(model, 'predict_proba') else None

        metrics = {
            'accuracy': None,
            'precision': None,
            'recall': None,
            'f1': None,
            'roc_auc': None
        }

        multiclass_results[name] = {
            'prediction': fault_types.get(pred, 'Unknown'),
            'probabilities': {fault_types.get(i, 'Unknown'): float(p) for i, p in enumerate(proba)} if proba is not None else None,
            'metrics': metrics
        }

    return {
        'binary': binary_results,
        'multiclass': multiclass_results
    }
