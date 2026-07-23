"""
AI天赋地图 — FastAPI 入口
启动: uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import CORS_ORIGINS, HOST, PORT

from routers.report import router as report_router
from routers.payment import router as payment_router

app = FastAPI(
    title="AI天赋地图 API",
    description="基于霍华德·加德纳多元智能理论的AI个人能力画像系统",
    version="0.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(report_router)
app.include_router(payment_router)


@app.get("/")
async def root():
    return {
        "name": "AI天赋地图 API",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
