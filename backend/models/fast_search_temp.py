
# Import libraries
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.neighbors import NearestNeighbors, BallTree, KDTree
from sklearn.metrics.pairwise import pairwise_distances
from datasketch import MinHash, MinHashLSH
import time
import matplotlib.pyplot as plt
# from google.colab import drive, files
import os
import io

class EnhancedTimestampSearch:
    def __init__(self):
        """Initialize the search system."""
        self.data = None
        self.timestamp_col = 'timestamp'
        self.models = {}
        self.preprocessed_features = None
        self.lsh = None
        self.lsh_hashes = {}

    def enhanced_preprocess(self, timestamps): # Corrected indentation
        """Advanced timestamp preprocessing with multiple temporal features."""
        # Convert to pandas DatetimeIndex first for consistent handling
        if isinstance(timestamps, (pd.DatetimeIndex, pd.Series)):
            dt_objects = timestamps
        else:
            try:
                dt_objects = pd.to_datetime(timestamps, errors='coerce')
            except:
                dt_objects = [datetime.strptime(ts, '%Y-%m-%d %H:%M:%S') for ts in timestamps]
                dt_objects = pd.to_datetime(dt_objects, errors='coerce')

        features = []
        for dt in dt_objects:
            if pd.isna(dt):
                features.append([0]*13)  # Default values for null timestamps
                continue

            # Convert to pandas Timestamp if it's numpy datetime64
            if isinstance(dt, np.datetime64):
                dt = pd.Timestamp(dt)

            # Unix timestamp (works for pandas Timestamp)
            unix_ts = dt.timestamp()

            # Cyclical time features
            hour_sin = np.sin(2 * np.pi * dt.hour/23.0)
            hour_cos = np.cos(2 * np.pi * dt.hour/23.0)

            # Date components
            day_of_week = dt.dayofweek  # Monday=0, Sunday=6
            month = dt.month

            features.append([
                unix_ts,
                hour_sin, hour_cos,
                day_of_week,
                month,
                dt.hour,
                dt.minute,
                dt.day,
                dt.week,
                dt.dayofyear,
                dt.year,
                int(dt.month > 6),  # Second half of year
                int((dt.hour >= 18) | (dt.hour <= 6))  # Night time
            ])

        return np.array(features)

    def load_data(self, file_obj, file_type='csv'): # Corrected indentation
        """Load dataset from file object with robust timestamp handling."""
        try:
            if file_type == 'csv':
                self.data = pd.read_csv(file_obj, parse_dates=[self.timestamp_col])
            elif file_type == 'excel':
                self.data = pd.read_excel(file_obj, parse_dates=[self.timestamp_col])
            else:
                raise ValueError("Unsupported file type")

            # Ensure timestamp column exists
            if self.timestamp_col not in self.data.columns:
                # Try common timestamp column names
                for col in ['Timestamp', 'datetime', 'Date', 'time']:
                    if col in self.data.columns:
                        self.timestamp_col = col
                        break
                else:
                    raise ValueError("No timestamp column found")

            # Convert to datetime if not already
            if not pd.api.types.is_datetime64_any_dtype(self.data[self.timestamp_col]):
                self.data[self.timestamp_col] = pd.to_datetime(
                    self.data[self.timestamp_col],
                    errors='coerce'
                )

            # Remove rows with invalid timestamps
            initial_count = len(self.data)
            self.data = self.data.dropna(subset=[self.timestamp_col])
            final_count = len(self.data)

            print(f"Loaded {final_count} records ({initial_count - final_count} invalid timestamps removed)")
            print(f"Time range: {self.data[self.timestamp_col].min()} to {self.data[self.timestamp_col].max()}")
            return True

        except Exception as e:
            print(f"Error loading data: {str(e)}")
            return False

    def fit_models(self): # Corrected indentation
        """Fit all search models to the data."""
        if self.data is None:
            raise ValueError("No data loaded")

        print("\nPreprocessing timestamps...")
        timestamps = self.data[self.timestamp_col].values
        self.preprocessed_features = self.enhanced_preprocess(timestamps)

        print("Training KNN models...")
        self.models['knn_euclidean'] = NearestNeighbors(n_neighbors=5, metric='euclidean').fit(self.preprocessed_features)
        self.models['knn_manhattan'] = NearestNeighbors(n_neighbors=5, metric='manhattan').fit(self.preprocessed_features)

        print("Training Ball Tree...")
        self.models['ball_tree'] = BallTree(self.preprocessed_features, metric='euclidean')

        print("Training KD Tree...")
        self.models['kd_tree'] = KDTree(self.preprocessed_features, metric='euclidean')

        print("Training LSH model...")
        self._fit_lsh()

        print("\nAll models trained successfully")

    def _fit_lsh(self): # Corrected indentation
        """Fit LSH model for approximate similarity search."""
        self.lsh = MinHashLSH(threshold=0.5, num_perm=128)
        self.lsh_hashes = {}

        for idx, features in enumerate(self.preprocessed_features):
            mh = MinHash(num_perm=128)
            for i, val in enumerate(features):
                word = f"feature_{i}_val_{int(val*1000)}"
                mh.update(word.encode('utf8'))
            self.lsh.insert(idx, mh)
            self.lsh_hashes[idx] = mh

    def search(self, query_timestamp, model_name='knn_euclidean', k=5): # Corrected indentation
        """Search for nearest timestamps using specified model."""
        try:
            query_features = self.enhanced_preprocess([query_timestamp])[0]
            start_time = time.time()

            if model_name.startswith('knn'):
                distances, indices = self.models[model_name].kneighbors([query_features], n_neighbors=k)
                distances, indices = distances[0], indices[0]
            elif model_name in ['ball_tree', 'kd_tree']:
                distances, indices = self.models[model_name].query([query_features], k=k)
                distances, indices = distances[0], indices[0]
            elif model_name == 'lsh':
                mh = MinHash(num_perm=128)
                for i, val in enumerate(query_features):
                    word = f"feature_{i}_val_{int(val*1000)}"
                    mh.update(word.encode('utf8'))
                indices = np.array(list(self.lsh.query(mh)))
                if len(indices) > 0:
                    distances = pairwise_distances([query_features], self.preprocessed_features[indices])[0]
                    if len(indices) > k:
                        sorted_idx = np.argsort(distances)[:k]
                        indices, distances = indices[sorted_idx], distances[sorted_idx]
                else:
                    distances = np.array([])
            else:
                raise ValueError(f"Unknown model: {model_name}")

            search_time = time.time() - start_time
            return indices, distances, search_time

        except Exception as e:
            print(f"Search error: {str(e)}")
            return np.array([]), np.array([]), 0
