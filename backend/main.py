from fastapi import FastAPI
from api.endpoints import energy, faults, search
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Smart Grid Platform")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your frontend's URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(energy.router, prefix="/energy", tags=["Energy"])
app.include_router(faults.router, prefix="/faults", tags=["Faults"])
app.include_router(search.router, prefix="/search", tags=["Search"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)