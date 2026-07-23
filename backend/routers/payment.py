"""
AI天赋地图 — 支付接口（MVP简化版）
"""
import uuid
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config import REPORT_PRICE

router = APIRouter(prefix="/api", tags=["payment"])

# 模拟订单存储（生产环境替换为数据库）
_orders = {}


class CreateOrderResponse(BaseModel):
    success: bool
    orderId: str
    amount: float
    qrCodeUrl: str = ""  # 生产环境替换为真实支付二维码


class VerifyPaymentRequest(BaseModel):
    orderId: str


class VerifyPaymentResponse(BaseModel):
    paid: bool
    message: str = ""


@router.post("/create-order", response_model=CreateOrderResponse)
async def create_order():
    """
    创建支付订单。
    MVP阶段返回模拟数据，生产环境对接微信支付/支付宝。
    """
    order_id = f"ORDER-{uuid.uuid4().hex[:12].upper()}"
    _orders[order_id] = {
        "amount": REPORT_PRICE,
        "paid": False,
        "createdAt": time.time()
    }

    return CreateOrderResponse(
        success=True,
        orderId=order_id,
        amount=REPORT_PRICE,
        qrCodeUrl=""  # TODO: 对接真实支付后填充
    )


@router.post("/verify-payment", response_model=VerifyPaymentResponse)
async def verify_payment(req: VerifyPaymentRequest):
    """
    验证支付状态。
    MVP阶段：创建订单60秒内自动标记为已支付（方便测试）。
    """
    order = _orders.get(req.orderId)

    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")

    # 开发模式：60秒内的订单自动通过
    if time.time() - order["createdAt"] < 3600:  # 1小时内
        order["paid"] = True
        return VerifyPaymentResponse(paid=True, message="支付成功")
    else:
        return VerifyPaymentResponse(paid=False, message="订单已过期，请重新下单")
