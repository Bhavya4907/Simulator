from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.characters import router as character_router
from routes.chat import router as chat_router
from routes.auth import router as auth_router

app = FastAPI(
    title="App",
    description="AI companion backend",
    version="1.0.0",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Update `allow_origins` with your actual frontend URL before going to prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # e.g. ["https://yourapp.com"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(character_router, prefix="/characters", tags=["Characters"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])


# ── Health checks ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def home():
    return {"message": "Backend running"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "online"}