# from fastapi import APIRouter, UploadFile, File
# from models.fast_search import fsearch

# router = APIRouter()

# @router.get("/fast")
# async def search():
#     print("Fast search endpoint called")
#     return fsearch()


# search.py

from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
from models.fast_search import EnhancedTimestampSearch as FastSearch
import io
from datetime import datetime

router = APIRouter()

# Initialize once
search_model = FastSearch()
dataset_loaded = False

# @router.post("/search/upload")
# async def upload_dataset(file: UploadFile = File(...)):
#     global dataset_loaded
#     if not file.filename.endswith(('.csv', '.xlsx')):
#         raise HTTPException(status_code=400, detail="File must be .csv or .xlsx")

#     try:
#         contents = await file.read()
#         if file.filename.endswith('.csv'):
#             df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
#         else:
#             df = pd.read_excel(io.BytesIO(contents))

#         if 'timestamp' not in df.columns:
#             raise HTTPException(status_code=400, detail="Dataset must contain 'timestamp' column")

#         search_model.fit(df)
#         dataset_loaded = True
#         return {"message": "Dataset uploaded and model fitted."}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# @router.get("/search")
# async def search_timestamp(query: str, k: int = 5):
#     if not dataset_loaded:
#         raise HTTPException(status_code=400, detail="Dataset not loaded yet.")

#     try:
#         results = search_model.search(query_timestamp=query, n_neighbors=k)
#         return results.to_dict(orient="records")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))



@router.post("/search/upload")
async def upload_dataset(file: UploadFile = File(...)):
    global dataset_loaded
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="File must be .csv or .xlsx")

    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            file_type = 'csv'
            # df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        else:
            file_type = 'excel'
            # df = pd.read_excel(io.BytesIO(contents))


        # search_model.fit(df)

        try:
            loaded = search_model.load_data(io.BytesIO(contents), file_type)
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error loading data: {str(e)}")
        if loaded:
            # Train models
            search_model.fit_models()

            # Generate test queries from data range
            timestamps = search_model.data[search_model.timestamp_col]
            test_queries = pd.date_range(
                start=timestamps.min(),
                end=timestamps.max(),
                periods=5
            ).strftime('%Y-%m-%d %H:%M:%S').tolist()

        else:
            raise HTTPException(status_code=500, detail="Failed to load dataset.")
        dataset_loaded = True
        return {"message": "Dataset uploaded and model fitted."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search")
async def search_timestamp(query: str, k: int = 5):
    if not dataset_loaded:
        raise HTTPException(status_code=400, detail="Dataset not loaded yet.")

    try:
        # Validate timestamp
        datetime.strptime(query, '%Y-%m-%d %H:%M:%S')

        results = {}
        for model in ['knn_euclidean', 'ball_tree', 'lsh']:
            indices, distances, time_taken = search_model.search(query, model, k=k)
            if len(indices) > 0:
                records = search_model.data.iloc[indices].head().to_dict(orient="records")
            else:
                records = []
            results[model] = {
                "results": records,
                "time_taken": time_taken
            }
        return results
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid timestamp format. Use YYYY-MM-DD HH:MM:SS")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/search/random")
async def search_timestamp():
    if not dataset_loaded:
        raise HTTPException(status_code=400, detail="Dataset not loaded yet.")

    try:
        return search_model.data.sample(5)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

