# -*- coding: utf-8 -*-
# fast_timestamp.py
import numpy as np, pandas as pd, time, joblib, sys
from sklearn.neighbors import BallTree

class FastTimestampSearch:
    """بحث سريع عن أقرب سجلات زمنية باستخدام BallTree فقط."""

    def __init__(self):
        self.timestamp_col = "timestamp"
        self.data: pd.DataFrame | None = None
        self.pre : np.ndarray   | None = None
        self.ball_tree: BallTree | None = None

    # ---------- تحميل البيانات من ملف ----------
    def load_data(self, file_obj, file_type='csv'): # Corrected indentation
        """Load dataset from file object with robust timestamp handling."""
        try:
            print(f"Loading data from {file_type} file...")
            if file_type == 'csv':
                print("Parsing CSV file...")
                self.data = pd.read_csv(file_obj, parse_dates=[self.timestamp_col])
                print(f"CSV file loaded with {len(self.data)} records")
            elif file_type == 'excel':
                self.data = pd.read_excel(file_obj, parse_dates=[self.timestamp_col])
            else:
                raise ValueError("Unsupported file type")

            print(f"Loaded {len(self.data)} records from {file_type} file")
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
            self._build_tree()

            print(f"Loaded {final_count} records ({initial_count - final_count} invalid timestamps removed)")
            print(f"Time range: {self.data[self.timestamp_col].min()} to {self.data[self.timestamp_col].max()}")
            print(self.data.tail(5))  # Print last 5 records for verification

            return True
        except Exception as e:
            print(f"Error loading data: {str(e)}")
            return False


    # ---------- تحويل الطابع الزمني إلى ميزات ----------
    def _prep(self, ts) -> np.ndarray:
        dt_idx = pd.to_datetime(ts, errors="coerce")
        feats = []
        for dt in dt_idx:
            if pd.isna(dt):
                feats.append([0]*13); continue
            if isinstance(dt, np.datetime64):
                dt = pd.Timestamp(dt)
            feats.append([
                dt.timestamp(),
                np.sin(2*np.pi*dt.hour/23), np.cos(2*np.pi*dt.hour/23),
                dt.dayofweek, dt.month, dt.hour, dt.minute, dt.day,
                dt.isocalendar().week, dt.dayofyear, dt.year,
                int(dt.month > 6), int((dt.hour >= 18) | (dt.hour <= 6))
            ])
        return np.array(feats, dtype=float)

    # ---------- تحميل نموذج محفوظ ----------
    def load_model(self, joblib_path: str):
        bundle = joblib.load(joblib_path)
        self.ball_tree = bundle["ball_tree"]
        self.pre       = bundle["pre"]
        self.data      = bundle["data"]
        print(f"✓ تم تحميل النموذج من {joblib_path}")

    # ---------- البحث ----------
    def search(self, ts_text: str, k: int = 5):
        q = self._prep([ts_text])[0]
        t0 = time.perf_counter()                 # ← بدلاً من time.time()
        dist, idx = self.ball_tree.query([q], k=k)
        elapsed_ms = (time.perf_counter() - t0) * 1000   # ملي ثانية بدقّة عالية
        return idx[0], dist[0], elapsed_ms
    
    def _build_tree(self):
        """Build BallTree from current data."""
        self.pre = self._prep(self.data[self.timestamp_col])
        self.ball_tree = BallTree(self.pre)
        print("BallTree built successfully.")

    def add_entry(self, entry: dict):
        print("Adding new entry from core logic:", entry)
        # Ensure timestamp is a pandas Timestamp
        if isinstance(entry[self.timestamp_col], str):
            entry[self.timestamp_col] = pd.to_datetime(entry[self.timestamp_col], errors='coerce')
        if self.data is None:
            print("No data loaded, initializing with the new entry.")
            self.data = pd.DataFrame([entry])
        else:
            print(f"Current data size: {len(self.data)} records")
            self.data = pd.concat([self.data, pd.DataFrame([entry])], ignore_index=True)
        # Ensure the whole column is datetime
        self.data[self.timestamp_col] = pd.to_datetime(self.data[self.timestamp_col], errors='coerce')
        if not set(entry.keys()).issubset(set(self.data.columns)):
            raise ValueError("New entry has different columns than existing data")
        self._build_tree()
        print(f"New entry added. Total records: {len(self.data)}")
        print(f"Time range: {self.data[self.timestamp_col].min()} to {self.data[self.timestamp_col].max()}")
        print(self.data.tail(5))  # Print last 5 records for verification