"""
AI天赋地图 — 访问统计接口
"""
import json
import os
from datetime import datetime, date
from fastapi import APIRouter, Request

router = APIRouter(prefix="/api", tags=["stats"])

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "stats.json")


def _load():
    if not os.path.exists(DATA_FILE):
        return {"totalVisits": 0, "totalReports": 0, "daily": {}, "ips": {}}
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save(data):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _get_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/track")
async def track(request: Request):
    """记录一次页面访问"""
    ip = _get_ip(request)
    today = date.today().isoformat()
    data = _load()

    data["totalVisits"] = data.get("totalVisits", 0) + 1
    data["daily"][today] = data["daily"].get(today, 0) + 1
    data["ips"][ip] = data["ips"].get(ip, 0) + 1

    _save(data)
    return {"ok": True}


@router.get("/stats")
async def get_stats(request: Request):
    """获取统计数据"""
    data = _load()
    today = date.today().isoformat()

    # 计算今日和昨日
    daily = data.get("daily", {})
    today_count = daily.get(today, 0)
    yesterday = sorted([k for k in daily.keys() if k < today], reverse=True)
    yesterday_count = daily.get(yesterday[0], 0) if yesterday else 0

    return {
        "totalVisits": data.get("totalVisits", 0),
        "totalReports": data.get("totalReports", 0),
        "todayVisits": today_count,
        "yesterdayVisits": yesterday_count,
        "uniqueIPs": len(data.get("ips", {}))
    }


def increment_report_count():
    """内部调用：报告生成计数"""
    data = _load()
    data["totalReports"] = data.get("totalReports", 0) + 1
    _save(data)
