/**
 * AI天赋地图 — 应用主控
 */
const App = {
  // 状态
  state: {
    screen: "home",           // home | quiz | result-free | report-full
    questions: [],            // 打乱后的题目列表
    currentIndex: 0,          // 当前题目索引
    answers: {},              // { questionId: score }
    scores: null,             // 评分结果
    reportData: null,         // AI报告数据
    isPaid: false,            // 是否已付费
    orderId: null             // 支付订单ID
  },

  // ==================== 初始化 ====================
  init() {
    this.bindKeyboard();
    this.showScreen("home");
  },

  // ==================== 屏幕切换 ====================
  showScreen(screenName) {
    this.state.screen = screenName;
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(`screen-${screenName}`);
    if (target) {
      target.classList.add("active");
      window.scrollTo(0, 0);
    }
  },

  // ==================== 开始测试 ====================
  startTest() {
    this.state.questions = getShuffledQuestions();
    this.state.currentIndex = 0;
    this.state.answers = {};
    this.state.scores = null;
    this.state.reportData = null;
    this.state.isPaid = false;

    this.showScreen("quiz");
    this.renderQuestion();
    this.updateProgress();
  },

  // ==================== 渲染当前题目 ====================
  renderQuestion() {
    const q = this.state.questions[this.state.currentIndex];
    const prevAnswer = this.state.answers[q.id];

    document.getElementById("q-index").textContent = this.state.currentIndex + 1;
    document.getElementById("q-text").textContent = q.text;

    // 高亮已选选项
    document.querySelectorAll(".opt-btn").forEach(btn => {
      btn.classList.remove("selected");
      if (parseInt(btn.dataset.score) === prevAnswer) {
        btn.classList.add("selected");
      }
    });

    // 导航按钮状态
    document.getElementById("btn-prev").disabled = this.state.currentIndex === 0;

    // 键盘提示
    document.querySelector(".keyboard-hint").style.display =
      window.innerWidth < 768 ? "none" : "block";
  },

  // ==================== 选择答案 ====================
  selectAnswer(score) {
    const q = this.state.questions[this.state.currentIndex];
    this.state.answers[q.id] = score;

    // 更新UI高亮
    document.querySelectorAll(".opt-btn").forEach(btn => {
      btn.classList.toggle("selected", parseInt(btn.dataset.score) === score);
    });

    // 选完后短暂延迟自动跳下一题
    if (this.state.answers[q.id] !== undefined) {
      // 不自动跳转，让用户自己控制节奏
    }
  },

  // ==================== 导航 ====================
  nextQuestion() {
    const q = this.state.questions[this.state.currentIndex];
    if (this.state.answers[q.id] === undefined) {
      // 未作答，闪烁提示
      document.getElementById("question-card").style.animation = "none";
      void document.getElementById("question-card").offsetHeight;
      document.getElementById("question-card").style.animation = "shake 0.4s ease";
      return;
    }

    if (this.state.currentIndex < this.state.questions.length - 1) {
      this.state.currentIndex++;
      this.renderQuestion();
      this.updateProgress();
    } else {
      // 答完最后一题 → 计算结果
      this.finishTest();
    }
  },

  prevQuestion() {
    if (this.state.currentIndex > 0) {
      this.state.currentIndex--;
      this.renderQuestion();
      this.updateProgress();
    }
  },

  updateProgress() {
    const progress = ((this.state.currentIndex + 1) / this.state.questions.length) * 100;
    document.getElementById("progress-bar").style.width = progress + "%";
    document.getElementById("progress-text").textContent =
      `${this.state.currentIndex + 1}/${this.state.questions.length}`;
  },

  // ==================== 完成测试 ====================
  finishTest() {
    // 计算得分
    this.state.scores = Scoring.calculate(this.state.answers);

    // 渲染免费结果
    Report.renderFreeResult(this.state.scores);

    // 切换到结果页
    this.showScreen("result-free");

    // 滚动到顶部
    window.scrollTo(0, 0);
  },

  // ==================== 付费解锁 ====================
  async unlockReport() {
    // 标记已付费（MVP阶段跳过支付，直接生成报告）
    this.state.isPaid = true;

    // 切换到完整报告页
    this.showScreen("report-full");
    document.getElementById("report-loading").style.display = "block";
    document.getElementById("report-content").innerHTML = "";
    document.getElementById("report-actions").style.display = "none";

    window.scrollTo(0, 0);

    // 调用AI生成报告（带本地回退）
    this.state.reportData = await API.generateReport(this.state.scores);

    // 渲染报告
    Report.renderFullReport(this.state.reportData);
    window.scrollTo(0, 0);
  },

  // 保留支付弹窗方法供后续对接真实支付
  showPaymentModal() {
    document.getElementById("modal-payment").classList.add("active");
  },

  closePaymentModal() {
    document.getElementById("modal-payment").classList.remove("active");
  },

  async simulatePayment() {
    this.closePaymentModal();
    // 重定向到解锁流程
    this.unlockReport();
  },

  // ==================== 弹窗管理 ====================
  confirmExit() {
    document.getElementById("modal-exit").classList.add("active");
  },

  closeModal() {
    document.getElementById("modal-exit").classList.remove("active");
  },

  exitTest() {
    this.closeModal();
    this.showScreen("home");
  },

  // ==================== 恢复/重置 ====================
  restart() {
    this.state.answers = {};
    this.state.scores = null;
    this.state.reportData = null;
    this.state.isPaid = false;
    this.showScreen("home");
  },

  // ==================== 分享 ====================
  shareReport() {
    const isWechat = /MicroMessenger/i.test(navigator.userAgent);

    if (isWechat) {
      // 微信浏览器：无法直接调起分享，引导用户点击右上角 ···
      document.getElementById("modal-share-guide").classList.add("active");
    } else if (navigator.share) {
      // 现代浏览器：使用 Web Share API
      navigator.share({
        title: "AI天赋地图 — 我的能力画像",
        text: "我刚完成了多元智能测评，发现了自己的隐藏优势！你也来测测？",
        url: window.location.href
      }).catch(() => {
        // 用户取消分享或失败，降级到复制链接
        this.copyShareLink();
      });
    } else {
      // 不支持 Web Share：直接复制链接
      this.copyShareLink();
    }
  },

  copyShareLink() {
    const url = window.location.href;
    // 优先用 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        this.showToast("链接已复制，去粘贴分享吧 ✨");
      }).catch(() => {
        this.showCopyFallback(url);
      });
    } else {
      this.showCopyFallback(url);
    }
  },

  showCopyFallback(url) {
    // 兜底：选中文本让用户手动复制
    const input = document.createElement("textarea");
    input.value = url;
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    this.showToast("链接已复制，去粘贴分享吧 ✨");
  },

  closeShareGuide() {
    document.getElementById("modal-share-guide").classList.remove("active");
  },

  showToast(msg) {
    // 轻量 toast，自动消失
    const existing = document.querySelector(".toast-msg");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast-msg";
    toast.textContent = msg;
    document.body.appendChild(toast);

    // 触发动画
    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  },

  // ==================== 保存报告（生成图片） ====================
  saveReport() {
    const el = document.getElementById("report-content");
    if (!el || !el.innerHTML) {
      this.showToast("报告内容为空，请先生成报告");
      return;
    }

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    this.showToast("正在生成报告图片...");

    // 先隐藏 actions 按钮区域，避免截进图片里
    const actions = document.getElementById("report-actions");
    const actionsDisplay = actions ? actions.style.display : "";
    if (actions) actions.style.display = "none";

    // 截图前让报告区域撑开，去掉可能的滚动裁剪
    const container = document.getElementById("report-container");
    const origOverflow = container ? container.style.overflow : "";
    const origMaxH = container ? container.style.maxHeight : "";
    if (container) {
      container.style.overflow = "visible";
      container.style.maxHeight = "none";
    }

    html2canvas(el, {
      backgroundColor: "#0F0F1A",   // 和页面背景色一致
      scale: isMobile ? 2 : 1.5,    // 手机端 2x 高清
      useCORS: true,
      logging: false
    }).then(canvas => {
      // 恢复原样式
      if (actions) actions.style.display = actionsDisplay;
      if (container) {
        container.style.overflow = origOverflow;
        container.style.maxHeight = origMaxH;
      }

      const imgData = canvas.toDataURL("image/png");
      this._reportImageData = imgData;

      if (isMobile) {
        // 手机端：弹窗展示，用户长按保存
        document.getElementById("report-image").src = imgData;
        document.getElementById("modal-image-preview").classList.add("active");
        // 手机端隐藏下载按钮，引导长按
        document.getElementById("btn-download-image").style.display = "none";
        document.querySelector(".toast-msg")?.remove();
      } else {
        // 桌面端：直接触发下载
        this.downloadImage(imgData);
        document.querySelector(".toast-msg")?.remove();
      }
    }).catch(err => {
      if (actions) actions.style.display = actionsDisplay;
      if (container) {
        container.style.overflow = origOverflow;
        container.style.maxHeight = origMaxH;
      }
      console.error("生成图片失败:", err);
      this.showToast("生成图片失败，请重试");
    });
  },

  closeImagePreview() {
    document.getElementById("modal-image-preview").classList.remove("active");
  },

  downloadImage(imgData) {
    const data = imgData || this._reportImageData;
    if (!data) return;

    const a = document.createElement("a");
    a.href = data;
    a.download = "AI天赋地图-我的能力画像.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (!imgData) {
      // 从弹窗里点下载，顺手关掉弹窗
      this.closeImagePreview();
    }
    this.showToast("报告图片已保存 ✅");
  },

  // ==================== 键盘操作 ====================
  bindKeyboard() {
    document.addEventListener("keydown", (e) => {
      if (this.state.screen !== "quiz") return;

      const q = this.state.questions[this.state.currentIndex];

      // 数字键1-5选择
      if (["1", "2", "3", "4", "5"].includes(e.key)) {
        e.preventDefault();
        const score = parseInt(e.key);
        this.selectAnswer(score);

        // 如果已答且不是最后一题，1秒后自动进入下一题
        if (this.state.answers[q.id] !== undefined) {
          // 按Enter或再次按键快速跳转
        }
      }

      // Enter → 下一题
      if (e.key === "Enter") {
        e.preventDefault();
        if (this.state.answers[q.id] !== undefined) {
          this.nextQuestion();
        }
      }

      // 左右箭头导航
      if (e.key === "ArrowRight") {
        e.preventDefault();
        this.nextQuestion();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        this.prevQuestion();
      }
    });
  }
};

// ==================== 页面加载完成后初始化 ====================
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

// ==================== 添加抖动动画 ====================
const shakeStyle = document.createElement("style");
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    50% { transform: translateX(8px); }
    75% { transform: translateX(-4px); }
  }
`;
document.head.appendChild(shakeStyle);
