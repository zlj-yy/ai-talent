# AI天赋地图 — 发现你的隐藏优势

基于霍华德·加德纳多元智能理论的 **AI 个人能力画像 + 大学专业选择助手**

> 🎯 定位：不只是"测你的八种智能"，而是**AI帮你规划大学专业方向**

## 快速开始

### 1. 启动后端

```bash
cd backend
pip install -r requirements.txt

# 设置DeepSeek API Key（可选，不设置则使用本地回退报告）
export DEEPSEEK_API_KEY="your-api-key"

# 启动
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 打开前端

直接用浏览器打开 `frontend/index.html` 即可。

或者用任意HTTP服务器：

```bash
cd frontend
python -m http.server 5500
# 访问 http://localhost:5500
```

## 产品流程

```
首页 → 80道情景题 → 免费结果（雷达图+排名） → 付费墙 → AI完整报告
```

## 项目结构

```
├── frontend/
│   ├── index.html              # 主页面
│   ├── css/style.css           # 样式（移动端优先）
│   ├── js/
│   │   ├── app.js              # 应用主控
│   │   ├── questions.js        # 80道题目数据
│   │   ├── scoring.js          # 评分算法
│   │   ├── chart.js            # Canvas雷达图
│   │   ├── report.js           # 报告渲染
│   │   └── api.js              # 后端API + 本地回退
│   └── assets/favicon.svg
├── backend/
│   ├── main.py                 # FastAPI入口
│   ├── config.py               # 配置
│   ├── routers/
│   │   ├── report.py           # AI报告接口
│   │   └── payment.py          # 支付接口
│   ├── services/deepseek.py    # DeepSeek API
│   ├── prompts/report_prompt.py # AI Prompt模板
│   └── requirements.txt
└── README.md
```

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | HTML + CSS + Vanilla JS（零依赖） |
| 图表 | Canvas API 自绘雷达图 |
| 后端 | Python FastAPI |
| AI | DeepSeek Chat API |
| 支付 | 预留接口（MVP阶段模拟） |

## 功能特性

- ✅ 80道情景式题目（8种智能 × 10题）
- ✅ 8维雷达图可视化
- ✅ 人格类型智能判定
- ✅ AI深度报告（专业推荐 + 成长计划）
- ✅ 本地回退（无AI也可生成完整报告）
- ✅ 付费墙UI
- ✅ 移动端响应式设计
- ✅ 键盘快捷键（1-5选择 + Enter下一题）
- ✅ PDF打印导出

## 待完成

- [ ] 对接真实支付（微信支付/支付宝）
- [ ] 用户系统（登录/历史记录）
- [ ] 微信小程序版本
- [ ] 管理后台
- [ ] 数据分析和A/B测试

## License

MIT
