/**
 * AI天赋地图 — Canvas 雷达图
 */

const RadarChart = {

  /**
   * 在 canvas 上绘制8维雷达图
   * @param {string} canvasId - canvas元素ID
   * @param {Object} scores - { linguistic: 85, logical: 92, ... }
   */
  draw(canvasId, scores) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    // 设置canvas实际尺寸（高清屏适配）
    const displayWidth = Math.min(400, window.innerWidth - 40);
    const displayHeight = displayWidth;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = displayWidth + "px";
    canvas.style.height = displayHeight + "px";
    ctx.scale(dpr, dpr);

    const W = displayWidth;
    const H = displayHeight;
    const cx = W / 2;
    const cy = H / 2;
    const radius = W * 0.32;
    const levels = 5;

    // 维度顺序和颜色
    const dims = [
      { key: "linguistic",    color: "#FF6B6B" },
      { key: "logical",       color: "#4ECDC4" },
      { key: "spatial",       color: "#45B7D1" },
      { key: "kinesthetic",   color: "#96CEB4" },
      { key: "musical",       color: "#FFEAA7" },
      { key: "interpersonal", color: "#DDA0DD" },
      { key: "intrapersonal", color: "#98D8C8" },
      { key: "naturalistic",  color: "#A8D8B9" }
    ];

    const n = dims.length;
    const angleStep = (Math.PI * 2) / n;
    const startAngle = -Math.PI / 2; // 从顶部开始

    // 清除
    ctx.clearRect(0, 0, W, H);

    // --- 绘制背景网格 ---
    for (let level = 1; level <= levels; level++) {
      const r = (radius / levels) * level;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const angle = startAngle + i * angleStep;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 刻度标签
      if (level === levels) {
        const labelR = r + 16;
        for (let i = 0; i < n; i++) {
          const angle = startAngle + i * angleStep;
          const lx = cx + labelR * Math.cos(angle);
          const ly = cy + labelR * Math.sin(angle);
          const dim = dims[i];
          const name = DIMENSION_NAMES[dim.key].name;

          ctx.font = "11px -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#9898B0";
          ctx.fillText(name, lx, ly);
        }
      }
    }

    // --- 绘制轴线 ---
    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.stroke();
    }

    // --- 绘制数据区域 ---
    const dataPoints = dims.map((dim, i) => {
      const score = scores[dim.key] || 0;
      const r = (score / 100) * radius;
      const angle = startAngle + i * angleStep;
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle)
      };
    });

    // 填充区域
    ctx.beginPath();
    dataPoints.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(108, 92, 231, 0.15)";
    ctx.fill();

    // 描边
    ctx.strokeStyle = "rgba(108, 92, 231, 0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- 绘制数据点 ---
    dims.forEach((dim, i) => {
      const pt = dataPoints[i];
      const score = scores[dim.key] || 0;

      // 光晕
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = dim.color + "30";
      ctx.fill();

      // 实心点
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = dim.color;
      ctx.fill();

      // 分数标注
      const angle = startAngle + i * angleStep;
      const labelR = (score / 100) * radius + 18;
      const lx = cx + labelR * Math.cos(angle);
      const ly = cy + labelR * Math.sin(angle);

      ctx.font = "bold 11px -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = dim.color;
      ctx.fillText(score.toString(), lx, ly);
    });

    // --- 中心点 ---
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fill();
  }
};
