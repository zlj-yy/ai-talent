"""
AI天赋地图 — DeepSeek API 服务
"""
import json
import httpx
from config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL
from prompts.report_prompt import SYSTEM_PROMPT, build_user_prompt


class DeepSeekService:
    """DeepSeek API 调用封装"""

    def __init__(self):
        self.api_key = DEEPSEEK_API_KEY
        self.base_url = DEEPSEEK_BASE_URL
        self.model = DEEPSEEK_MODEL

    async def generate_report(self, scores: dict) -> dict:
        """
        调用DeepSeek生成个性化AI报告

        Args:
            scores: 8维得分，如 {"linguistic": 85, "logical": 92, ...}

        Returns:
            dict: 结构化的报告JSON
        """
        user_prompt = build_user_prompt(scores)

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": messages,
                        "temperature": 0.7,
                        "max_tokens": 4096,
                        "response_format": {"type": "json_object"}
                    }
                )

                if response.status_code != 200:
                    print(f"[DeepSeek] API error: {response.status_code} {response.text}")
                    return None

                data = response.json()
                content = data["choices"][0]["message"]["content"]

                # 解析JSON
                report = json.loads(content)
                return report

        except httpx.TimeoutException:
            print("[DeepSeek] 请求超时")
            return None
        except json.JSONDecodeError as e:
            print(f"[DeepSeek] JSON解析失败: {e}")
            return None
        except Exception as e:
            print(f"[DeepSeek] 未知错误: {e}")
            return None


# 单例
deepseek_service = DeepSeekService()
