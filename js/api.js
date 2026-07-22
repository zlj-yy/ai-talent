/**
 * AI天赋地图 — 后端API调用
 */

const API = {
  // 后端地址（开发时指向本地，部署后改为实际域名）
  BASE_URL: "http://localhost:8000",

  /**
   * 调用后端生成AI报告
   * @param {Object} scores - 8维得分
   * @returns {Promise<Object>} AI生成的报告JSON
   */
  async generateReport(scores) {
    try {
      // 5秒超时，超时则使用本地回退
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.BASE_URL}/api/generate-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn("AI报告生成失败，使用本地回退:", err.message);

      // 如果后端不可用，返回本地生成的回退报告
      return this._fallbackReport(scores);
    }
  },

  /**
   * 创建支付订单
   * @returns {Promise<Object>} { orderId, qrCodeUrl }
   */
  async createOrder() {
    try {
      const response = await fetch(`${this.BASE_URL}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Payment error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn("支付接口不可用:", err.message);
      return null;
    }
  },

  /**
   * 验证支付状态
   * @param {string} orderId
   * @returns {Promise<boolean>}
   */
  async verifyPayment(orderId) {
    try {
      const response = await fetch(`${this.BASE_URL}/api/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });

      if (!response.ok) return false;
      const data = await response.json();
      return data.paid === true;
    } catch (err) {
      console.warn("支付验证失败:", err.message);
      return false;
    }
  },

  /**
   * 本地回退报告生成（无需后端，离线可用）
   * 当后端/AI不可用时作为备选方案
   */
  _fallbackReport(scores) {
    const top = Scoring.getTopThree(scores);
    const persona = Scoring.getPersona(scores);
    const sorted = Scoring.getSortedScores(scores);

    // 基于得分模式匹配专业推荐
    const majors = this._matchMajors(scores);

    // 生成成长计划
    const growthPlan = this._generateGrowthPlan(scores);

    return {
      persona,
      topStrengths: top,
      allDimensions: sorted,
      majors,
      growthPlan,
      generatedBy: "local",
      generatedAt: new Date().toISOString()
    };
  },

  /**
   * 基于得分模式匹配专业推荐
   */
  _matchMajors(scores) {
    const top = Scoring.getTopThree(scores);
    const primaryKey = top[0].key;

    // 专业数据库（基于多元智能与中国大学专业设置的映射）
    const majorDB = {
      linguistic: [
        { name: "新闻传播学", stars: 5, reason: "你的语言优势是新闻和传播的核心竞争力" },
        { name: "法学", stars: 5, reason: "法律职业对语言表达和逻辑论证要求极高" },
        { name: "汉语言文学", stars: 4, reason: "深入学习语言和文化，发挥你的文字天赋" },
        { name: "翻译/外语", stars: 4, reason: "语言是你的强项，多语能力让你更有竞争力" },
        { name: "教育学", stars: 3, reason: "语言表达能力是优秀教师的基础" }
      ],
      logical: [
        { name: "计算机科学与技术", stars: 5, reason: "编程和算法需要强大的逻辑推理能力" },
        { name: "数学与应用数学", stars: 5, reason: "纯粹的逻辑世界，让你的抽象思维发光" },
        { name: "电子信息工程", stars: 4, reason: "电路设计和信号处理需要严谨的逻辑" },
        { name: "金融学/精算", stars: 4, reason: "金融模型和风险评估依赖数学分析能力" },
        { name: "物理学", stars: 3, reason: "探索自然规律需要严密的逻辑和数学功底" }
      ],
      spatial: [
        { name: "建筑学", stars: 5, reason: "空间思维是你最大的武器，建筑将美学与结构完美结合" },
        { name: "工业设计", stars: 5, reason: "将空间想象力转化为产品设计能力" },
        { name: "城乡规划", stars: 4, reason: "宏观空间布局和系统思维" },
        { name: "数字媒体艺术", stars: 4, reason: "视觉设计和三维建模需要出色的空间感知" },
        { name: "土木工程", stars: 3, reason: "工程制图和结构分析需要空间思维" }
      ],
      kinesthetic: [
        { name: "体育教育/运动训练", stars: 5, reason: "将身体天赋转化为专业技能" },
        { name: "临床医学", stars: 5, reason: "外科手术需要精准的手眼协调和动手能力" },
        { name: "机械工程", stars: 4, reason: "动手操作和实践能力在机械领域至关重要" },
        { name: "护理学", stars: 4, reason: "需要灵活的身体操作技能和动手能力" },
        { name: "表演/舞蹈", stars: 3, reason: "身体表达是你的天然语言" }
      ],
      musical: [
        { name: "音乐学/音乐表演", stars: 5, reason: "充分发挥你的音乐感知和表达能力" },
        { name: "录音艺术/音响工程", stars: 4, reason: "将音乐敏感度转化为技术能力" },
        { name: "广播电视编导", stars: 4, reason: "音乐感对影视节奏和情绪的把控很有帮助" },
        { name: "学前教育", stars: 3, reason: "音乐能力在幼儿教育中非常实用" },
        { name: "心理学", stars: 3, reason: "音乐与情绪的联系让你对心理有独特理解" }
      ],
      interpersonal: [
        { name: "工商管理", stars: 5, reason: "人际能力是管理和领导力的核心" },
        { name: "心理学/应用心理学", stars: 5, reason: "理解他人是成为优秀心理咨询师的基础" },
        { name: "市场营销", stars: 4, reason: "洞察消费者心理，善于沟通和影响" },
        { name: "人力资源管理", stars: 4, reason: "识人用人是你天然的优势领域" },
        { name: "社会学", stars: 3, reason: "研究人群和社会互动模式" }
      ],
      intrapersonal: [
        { name: "哲学", stars: 5, reason: "深度思考人生和世界，你的内省能力在这里发光" },
        { name: "心理学", stars: 5, reason: "理解自己才能更好地理解他人" },
        { name: "历史学", stars: 4, reason: "从过去反思现在和未来，需要深刻的洞察" },
        { name: "文学/创意写作", stars: 4, reason: "将内心世界的丰富体验化为创作" },
        { name: "社会学", stars: 3, reason: "对社会和自我的双重思考" }
      ],
      naturalistic: [
        { name: "生物科学", stars: 5, reason: "观察和理解生命现象是你最擅长的事" },
        { name: "环境科学与工程", stars: 5, reason: "将自然观察力用于解决环境问题" },
        { name: "农学/园艺", stars: 4, reason: "与植物和大自然亲密接触" },
        { name: "地质学/气象学", stars: 4, reason: "观察和解读自然现象的规律" },
        { name: "医学/药学", stars: 3, reason: "对人体这一最复杂的自然系统深入探究" }
      ]
    };

    // 主要推荐：基于最强维度
    const primary = majorDB[primaryKey] || majorDB["logical"];

    // 次要推荐：基于第二优势维度
    const secondaryKey = top[1]?.key || "linguistic";
    const secondary = (majorDB[secondaryKey] || majorDB["linguistic"])
      .filter(m => !primary.some(p => p.name === m.name))
      .slice(0, 2);

    return [...primary.slice(0, 6), ...secondary.map(m => ({...m, stars: Math.max(1, m.stars - 1)}))];
  },

  /**
   * 生成12个月成长计划
   */
  _generateGrowthPlan(scores) {
    const sorted = Scoring.getSortedScores(scores);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];

    // 基于最强维度推荐学习内容
    const learningMap = {
      linguistic:    ["精读10本经典著作并写读书笔记", "参加辩论/演讲社团", "尝试日更写作100天"],
      logical:       ["学习Python编程基础", "刷LeetCode算法题（每周3题）", "阅读《思考，快与慢》"],
      spatial:       ["学习Blender/Figma基础建模", "每月完成一个设计作品", "参观建筑/设计展览"],
      kinesthetic:   ["系统学习一项新运动技能", "参与手工/机械项目实践", "坚持每日运动习惯"],
      musical:       ["系统学习一门乐器", "学习基础乐理和编曲软件", "组建或加入一个音乐社团"],
      interpersonal: ["担任学生组织/项目的负责人", "每周深度访谈一位不同领域的人", "学习非暴力沟通技巧"],
      intrapersonal: ["坚持每日冥想或反思日记", "阅读哲学/心理学入门经典", "制定个人年度目标追踪体系"],
      naturalistic:  ["参加一个野外考察/生态项目", "学习生物/环境科学网课", "建立自己的自然观察笔记"]
    };

    const strongLearning = learningMap[strongest.key] || learningMap["logical"];
    const weakLearning = learningMap[weakest.key] || learningMap["linguistic"];

    return {
      strongestDimension: strongest.name,
      weakestDimension: weakest.name,
      phases: [
        {
          period: "第1-3个月：奠定基础",
          tasks: [
            `发挥${strongest.name}优势：${strongLearning[0]}`,
            `补充${weakest.name}短板：${weakLearning[0]}`,
            "完成3次能力复测，追踪进步"
          ]
        },
        {
          period: "第4-6个月：深度拓展",
          tasks: [
            `进阶实践：${strongLearning[1]}`,
            "参与一个跨学科项目，连接你的不同能力",
            "找到一位在你优势领域的导师或榜样"
          ]
        },
        {
          period: "第7-9个月：应用实战",
          tasks: [
            strongLearning[2],
            "将你的能力组合应用到具体目标（比赛、作品集、实习）",
            "开始建立个人品牌或作品展示"
          ]
        },
        {
          period: "第10-12个月：整合突破",
          tasks: [
            "回顾全年成长，更新能力画像",
            "制定下一年度目标和大学专业方向",
            "将经验输出成博客/视频，帮助后来者"
          ]
        }
      ]
    };
  }
};
