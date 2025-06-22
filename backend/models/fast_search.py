# -*- coding: utf-8 -*-
# fast_timestamp.py
import numpy as np, pandas as pd, time, joblib, sys
from sklearn.neighbors import BallTree

class FastTimestampSearch:
    """بحث سريع عن أقرب سجلات زمنية باستخدام BallTree فقط."""

    def init(self):
        self.timestamp_col = "timestamp"
        self.data: pd.DataFrame | None = None
        self.pre : np.ndarray   | None = None
        self.ball_tree: BallTree | None = None

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