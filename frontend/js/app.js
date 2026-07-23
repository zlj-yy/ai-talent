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
    if (navigator.share) {
      navigator.share({
        title: "AI天赋地图 — 我的能力画像",
        text: "我刚完成了多元智能测评，发现了自己的隐藏优势！你也来测测？",
        url: window.location.href
      }).catch(() => {});
    } else {
      // 复制链接
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert("链接已复制！分享给朋友让他们也来测试吧 ✨");
      }).catch(() => {});
    }
  },

  // ==================== PDF下载 ====================
  downloadPDF() {
    window.print();
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
