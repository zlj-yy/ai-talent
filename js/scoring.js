/**
 * AI天赋地图 — 评分引擎
 */

const Scoring = {

  /**
   * 根据用户答案计算8维得分
   * @param {Object} answers - { questionId: score(1-5) }
   * @returns {Object} { linguistic: 85, logical: 92, ... }
   */
  calculate(answers) {
    const rawScores = {
      linguistic:      { total: 0, count: 0 },
      logical:         { total: 0, count: 0 },
      spatial:         { total: 0, count: 0 },
      kinesthetic:     { total: 0, count: 0 },
      musical:         { total: 0, count: 0 },
      interpersonal:   { total: 0, count: 0 },
      intrapersonal:   { total: 0, count: 0 },
      naturalistic:    { total: 0, count: 0 }
    };

    // 遍历所有已答题目，按维度汇总
    for (const [qId, score] of Object.entries(answers)) {
      const question = QUESTIONS.find(q => q.id === parseInt(qId));
      if (!question) continue;

      const dim = question.dimension;
      rawScores[dim].total += score;
      rawScores[dim].count += 1;
    }

    // 归一化为百分制 (满分50 → 百分制)
    const normalized = {};
    for (const [dim, data] of Object.entries(rawScores)) {
      if (data.count === 0) {
        normalized[dim] = 0;
      } else {
        // 每题满分5分，该维度满分 = count × 5
        // 归一化到百分制: (实际得分 / 满分) × 100
        normalized[dim] = Math.round((data.total / (data.count * 5)) * 100);
      }
    }

    return normalized;
  },

  /**
   * 获取排名前三的优势智能
   * @param {Object} scores - { linguistic: 85, ... }
   * @returns {Array} [{dimension, name, score, icon, color}, ...]
   */
  getTopThree(scores) {
    const entries = Object.entries(scores)
      .map(([key, score]) => ({
        key,
        score,
        ...DIMENSION_NAMES[key]
      }))
      .sort((a, b) => b.score - a.score);

    return entries.slice(0, 3);
  },

  /**
   * 根据得分模式判断人格类型
   * @param {Object} scores
   * @returns {Object} { type, description, traits }
   */
  getPersona(scores) {
    const top = this.getTopThree(scores);
    const topKeys = top.map(t => t.key);
    const topScores = top.map(t => t.score);

    // 判断逻辑：根据前两大优势智能组合
    const combo = [topKeys[0], topKeys[1]].sort().join('+');

    const personas = {
      "intrapersonal+logical": {
        type: "独立探索者",
        emoji: "🔬",
        description: "你拥有强大的逻辑分析能力和深刻的自我认知。你适合需要独立思考、深度研究的领域，比起团队协作，你更擅长独自攻克难题。",
        strengths: ["深度思考", "自我驱动", "严谨分析"],
        watchOut: ["长期封闭可能影响沟通协作", "需要刻意练习表达和分享"]
      },
      "interpersonal+linguistic": {
        type: "沟通影响者",
        emoji: "🎤",
        description: "你善于理解他人，并用语言打动人心。你天然适合需要频繁沟通、协调、说服的工作，是团队中的信息枢纽。",
        strengths: ["表达沟通", "共情理解", "影响力"],
        watchOut: ["需要加强逻辑和数据思维", "避免过度在意他人看法"]
      },
      "logical+spatial": {
        type: "架构设计师",
        emoji: "🏗️",
        description: "你可以同时在抽象逻辑和视觉空间中游刃有余。你适合设计、工程、建筑等需要'既看到整体又把握细节'的领域。",
        strengths: ["系统思维", "空间想象", "工程能力"],
        watchOut: ["可能忽略人际和情感维度", "需要加强团队协作"]
      },
      "kinesthetic+spatial": {
        type: "动手创造者",
        emoji: "🎨",
        description: "你通过双手和双眼来理解世界。无论是艺术创作、手工制作还是运动竞技，你擅长把想法变成看得见、摸得着的东西。",
        strengths: ["动手能力", "审美感知", "实践学习"],
        watchOut: ["理论抽象能力可能偏弱", "需要补充系统的知识框架"]
      },
      "intrapersonal+linguistic": {
        type: "思想表达者",
        emoji: "✍️",
        description: "你既善于内省思考，又善于用语言将思想传达给他人。你适合写作、教学、咨询等需要'想得深+说得透'的工作。",
        strengths: ["思想深度", "文字表达", "独立思考"],
        watchOut: ["行动力可能跟不上思考", "需要避免过度完美主义"]
      },
      "interpersonal+intrapersonal": {
        type: "智慧引导者",
        emoji: "🌟",
        description: "你同时拥有理解他人和理解自己的能力，这让你成为天然的导师和领导者。你适合教育、心理咨询、管理等领域。",
        strengths: ["领导潜力", "情绪智慧", "平衡能力"],
        watchOut: ["可能在照顾他人和照顾自己之间失衡", "需要学会设立边界"]
      },
      "logical+naturalistic": {
        type: "科学观察者",
        emoji: "🔍",
        description: "你的分析思维与对自然/系统的观察力完美结合。你适合科学研究、数据分析、环境科学等需要'观察→推理→发现'的领域。",
        strengths: ["科学思维", "观察力", "系统性"],
        watchOut: ["可能偏重理论忽视实践", "需要更多人际互动"]
      },
      "musical+intrapersonal": {
        type: "艺术感知者",
        emoji: "🎼",
        description: "你对美和情感有敏锐的感知力，并有能力将内在体验转化为创造性表达。你适合音乐、文学、艺术治疗等创造性工作。",
        strengths: ["艺术感知", "情感表达", "创造性"],
        watchOut: ["可能偏感性忽视理性分析", "需要平衡理想与现实"]
      }
    };

    // 匹配最佳人格类型
    let bestMatch = null;
    for (const [pattern, persona] of Object.entries(personas)) {
      const patKeys = pattern.split('+');
      if (patKeys.every(k => topKeys.includes(k))) {
        bestMatch = persona;
        break;
      }
    }

    // 默认回退
    if (!bestMatch) {
      // 根据最高分维度单独判断
      const primary = top[0].key;
      const fallbacks = {
        linguistic:    { type: "语言表达者", emoji: "📝", description: "你天生善于用语言和文字与世界对话。", strengths: [], watchOut: [] },
        logical:       { type: "逻辑思考者", emoji: "🧮", description: "你享受用理性思维拆解复杂问题。", strengths: [], watchOut: [] },
        spatial:       { type: "空间感知者", emoji: "🎨", description: "你通过视觉和空间来理解世界。", strengths: [], watchOut: [] },
        kinesthetic:   { type: "行动实践者", emoji: "🤸", description: "你用身体和行动来学习和创造。", strengths: [], watchOut: [] },
        musical:       { type: "韵律感知者", emoji: "🎵", description: "你与声音和节奏有天然的共鸣。", strengths: [], watchOut: [] },
        interpersonal: { type: "人际连接者", emoji: "🤝", description: "你善于理解、连接和影响他人。", strengths: [], watchOut: [] },
        intrapersonal: { type: "内在探索者", emoji: "🧘", description: "你擅长内省和自我觉察。", strengths: [], watchOut: [] },
        naturalistic:  { type: "自然观察者", emoji: "🌿", description: "你对自然界有敏锐的观察力。", strengths: [], watchOut: [] }
      };
      bestMatch = fallbacks[primary] || fallbacks["intrapersonal"];
    }

    return {
      ...bestMatch,
      topDimensions: top.slice(0, 3).map(t => t.name),
      allScores: scores
    };
  },

  /**
   * 获取所有维度得分，按分数降序排列
   */
  getSortedScores(scores) {
    return Object.entries(scores)
      .map(([key, score]) => ({
        key,
        score,
        ...DIMENSION_NAMES[key]
      }))
      .sort((a, b) => b.score - a.score);
  }
};
