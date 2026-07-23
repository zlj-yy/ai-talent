"""
AI天赋地图 — 频率限制中间件
"""
import time
from collections import defaultdict
from fastapi import Request, HTTPException


class RateLimiter:
    """简单的内存频率限制器"""

    def __init__(self):
        self._windows = defaultdict(list)  # key -> [timestamps]

    def _clean(self, key: str, window_sec: float):
        now = time.time()
        cutoff = now - window_sec
        self._windows[key] = [t for t in self._windows.get(key, []) if t > cutoff]

    def check(self, key: str, max_requests: int, window_sec: float) -> bool:
        """检查是否允许请求，True=放行，False=超限"""
        self._clean(key, window_sec)
        if len(self._windows.get(key, [])) >= max_requests:
            return False
        self._windows[key].append(time.time())
        return True


# 全局实例
limiter = RateLimiter()

# 限制规则：(端点关键字, 时间窗口秒数, 最大请求数)
RULES = [
    ("/api/generate-report", 3600, 20),   # 同一IP每小时最多20次AI报告
    ("/api/track", 60, 10),               # 同一IP每分钟最多10次统计请求
]


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def rate_limit_middleware(request: Request, call_next):
    """FastAPI 中间件：请求频率限制"""
    path = request.url.path
    for keyword, window_sec, max_req in RULES:
        if keyword in path:
            key = f"{get_client_ip(request)}:{keyword}"
            if not limiter.check(key, max_req, window_sec):
                raise HTTPException(status_code=429, detail="请求太频繁了，请稍后再试")
            break

    return await call_next(request)
