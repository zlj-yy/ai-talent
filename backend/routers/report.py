"""
AI天赋地图 — 报告生成接口
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from services.deepseek import deepseek_service
from routers.stats import increment_report_count

router = APIRouter(prefix="/api", tags=["report"])


class ReportRequest(BaseModel):
    scores: dict = Field(
        ...,
        example={
            "linguistic": 85,
            "logical": 92,
            "spatial": 70,
            "kinesthetic": 55,
            "musical": 60,
            "interpersonal": 78,
            "intrapersonal": 88,
            "naturalistic": 45
        }
    )


class ReportResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    generatedBy: str  # "ai" | "local"


@router.post("/generate-report", response_model=ReportResponse)
async def generate_report(req: ReportRequest):
    """
    根据8维得分生成AI深度报告。
    如果AI不可用，返回null让前端使用本地回退。
    """
    # 验证得分数据
    required_dims = [
        "linguistic", "logical", "spatial", "kinesthetic",
        "musical", "interpersonal", "intrapersonal", "naturalistic"
    ]

    for dim in required_dims:
        if dim not in req.scores:
            raise HTTPException(
                status_code=400,
                detail=f"缺少维度: {dim}"
            )

    # 调用DeepSeek生成报告
    report = await deepseek_service.generate_report(req.scores)

    if report:
        increment_report_count()
        return ReportResponse(
            success=True,
            data=report,
            generatedBy="ai"
        )
    else:
        # AI不可用，通知前端使用本地回退
        return ReportResponse(
            success=False,
            error="AI服务暂时不可用",
            generatedBy="local"
        )
