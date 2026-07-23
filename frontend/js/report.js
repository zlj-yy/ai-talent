/**
 * AI天赋地图 — 报告渲染
 */

const Report = {

  /**
   * 渲染免费结果页
   * @param {Object} scores
   */
  renderFreeResult(scores) {
    // 绘制雷达图
    RadarChart.draw("radar-chart", scores);

    // 渲染前三优势
    const topThree = Scoring.getTopThree(scores);
    const strengthsEl = document.getElementById("top-strengths");
    strengthsEl.innerHTML = topThree.map((item, i) => {
      const medals = ["🥇", "🥈", "🥉"];
      return `
        <div class="strength-item">
          <span class="strength-rank">${medals[i]}</span>
          <span class="strength-icon">${item.icon}</span>
          <div class="strength-info">
            <div class="strength-name">${item.name}</div>
            <div class="strength-score">${item.score}分 · ${item.description}</div>
          </div>
          <div class="strength-bar-bg">
            <div class="strength-bar-fill" style="width:${item.score}%;background:${item.color};"></div>
          </div>
        </div>
      `;
    }).join("");

    // 渲染人格类型
    const persona = Scoring.getPersona(scores);
    document.getElementById("persona-badge").innerHTML = `
      <div class="persona-label">你的人格类型</div>
      <div class="persona-type">${persona.emoji} ${persona.type}</div>
    `;
  },

  /**
   * 渲染完整AI报告
   * @param {Object} reportData - 来自AI或本地回退的报告
   */
  renderFullReport(reportData) {
    const container = document.getElementById("report-content");
    const loading = document.getElementById("report-loading");

    if (!reportData) {
      loading.innerHTML = "<p style='color:#FF6B6B;'>报告生成失败，请刷新重试</p>";
      return;
    }

    loading.style.display = "none";
    document.getElementById("report-actions").style.display = "flex";

    const { persona, allDimensions, majors, growthPlan } = reportData;

    let html = "";

    // --- 1. 能力画像总览 ---
    html += `
      <div class="report-section" id="section-overview">
        <h3>🧬 完整能力画像</h3>
        <div class="radar-container">
          <canvas id="radar-chart-full" width="400" height="400"></canvas>
        </div>
        <div style="text-align:center;margin-top:8px;">
          <span class="persona-badge">
            <span class="persona-label">你的人格类型</span>
            <span class="persona-type">${persona.emoji} ${persona.type}</span>
          </span>
        </div>
        <p style="margin-top:16px;">${persona.description}</p>
      </div>
    `;

    // --- 2. 逐维度详细解读 ---
    html += `<div class="report-section"><h3>📊 维度逐一解读</h3>`;
    allDimensions.forEach((dim, i) => {
      const level = dim.score >= 80 ? "🔥 突出优势" : dim.score >= 60 ? "👍 良好水平" : dim.score >= 40 ? "📈 发展空间" : "⚠️ 需要关注";
      html += `
        <div style="margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
            <span style="font-size:1.3rem;">${dim.icon}</span>
            <strong>${dim.name}</strong>
            <span style="color:${dim.color};font-weight:700;">${dim.score}分</span>
            <span style="font-size:0.75rem;color:var(--text-muted);">${level}</span>
          </div>
          <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${dim.score}%;background:${dim.color};border-radius:3px;"></div>
          </div>
          <p style="font-size:0.82rem;color:var(--text-muted);margin-top:4px;">${dim.description}</p>
        </div>
      `;
    });
    html += `</div>`;

    // --- 3. 大学专业推荐 ---
    html += `<div class="report-section"><h3>🎓 大学专业推荐</h3>`;
    html += `<p style="margin-bottom:12px;">基于你的能力画像，以下专业与你的匹配度最高：</p>`;
    html += `<ul class="major-list">`;
    majors.forEach(m => {
      const stars = "★".repeat(m.stars) + "☆".repeat(5 - m.stars);
      html += `
        <li class="major-item">
          <span class="major-stars" style="color:#FFD93D;">${stars}</span>
          <span class="major-name">${m.name}</span>
          <span class="major-reason">${m.reason}</span>
        </li>
      `;
    });
    html += `</ul>`;
    html += `<p style="font-size:0.8rem;color:var(--text-muted);margin-top:8px;">💡 以上推荐基于你的能力模式，最终选择请结合个人兴趣和实际情况。</p>`;
    html += `</div>`;

    // --- 4. 12个月成长计划 ---
    html += `<div class="report-section"><h3>🗺️ 12个月成长计划</h3>`;
    html += `<p style="margin-bottom:16px;">你的最强维度：<strong style="color:var(--primary-light);">${growthPlan.strongestDimension}</strong> | 需要关注：<strong style="color:#FF6B6B;">${growthPlan.weakestDimension}</strong></p>`;
    html += `<div class="growth-timeline">`;
    growthPlan.phases.forEach(phase => {
      html += `
        <div class="growth-phase">
          <h4>${phase.period}</h4>
          ${phase.tasks.map(t => `<p>✅ ${t}</p>`).join("")}
        </div>
      `;
    });
    html += `</div></div>`;

    // --- 5. 盲区预警 ---
    const weakest = allDimensions[allDimensions.length - 1];
    const secondWeakest = allDimensions[allDimensions.length - 2];
    html += `
      <div class="report-section">
        <h3>⚠️ 能力盲区预警</h3>
        <p>你的<strong style="color:#FF6B6B;">${weakest.name}（${weakest.score}分）</strong>和<strong style="color:#FF6B6B;">${secondWeakest.name}（${secondWeakest.score}分）</strong>相对较弱，这并不代表你不擅长，只是相比你的优势维度需要更多关注：</p>
        <p style="margin-top:8px;">建议：</p>
        <p>• 在选专业时避免以这两个能力为核心竞争力的方向</p>
        <p>• 有意识地在日常生活中练习这两个维度的相关技能</p>
        <p>• 团队合作时寻找能互补这些能力短板的人</p>
      </div>
    `;

    // --- 6. 下一步行动 ---
    html += `
      <div class="report-section" style="border-color:rgba(108,92,231,0.3);background:rgba(108,92,231,0.05);">
        <h3>🚀 你的下一步行动</h3>
        <p>1. <strong>本周内</strong>：深入了解上面推荐的TOP3专业，浏览相关大学官网和培养方案</p>
        <p>2. <strong>本月内</strong>：开始执行12个月成长计划的第一阶段任务</p>
        <p>3. <strong>3个月后</strong>：回来复测，追踪你的能力画像变化</p>
        <p>4. <strong>长期</strong>：持续学习，但记住——测试结果不是标签，而是起点</p>
      </div>
    `;

    container.innerHTML = html;

    // 重新绘制完整报告中的雷达图
    setTimeout(() => {
      RadarChart.draw("radar-chart-full", reportData.allScores || {});
    }, 100);
  }
};
