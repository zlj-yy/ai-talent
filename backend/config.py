"""
AI天赋地图 — 配置
"""
import os

# DeepSeek API
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "your-api-key-here")
DEEPSEEK_BASE_URL = "https://api.deepseek.com"
DEEPSEEK_MODEL = "deepseek-chat"

# 支付配置
REPORT_PRICE = 9.9  # 元

# CORS
CORS_ORIGINS = [
    "http://localhost:5500",
    "http://localhost:8000",
    "http://127.0.0.1:5500",
    "http://127.0.0.1:8000",
    "*"  # 开发阶段允许所有来源
]

# 服务器
HOST = "0.0.0.0"
PORT = 8000
