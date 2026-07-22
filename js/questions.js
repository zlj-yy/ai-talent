/**
 * AI天赋地图 — 题目数据
 * 8种智能 × 5题 = 40题
 * 面向高中生，情景式题目
 * 每题计分 1-5（完全不像我 → 非常像我）
 * 预计用时：8-12分钟
 */

const QUESTIONS = [
  // ==================== 语言智能 (Linguistic) — 5题 ====================
  {
    id: 1,
    dimension: "linguistic",
    text: "你习惯用文字记录自己的想法，比如写日记、发长文朋友圈，或者给朋友写很长的消息。"
  },
  {
    id: 2,
    dimension: "linguistic",
    text: "和同学争论一个问题时，你通常能条理清晰地表达观点，让别人信服。"
  },
  {
    id: 3,
    dimension: "linguistic",
    text: "学外语（英语或其他语言）对你来说不算很吃力，你能感受到语言的规律和美感。"
  },
  {
    id: 4,
    dimension: "linguistic",
    text: "写作文时你很少为'不知道写什么'发愁，反而常常有很多话想写。"
  },
  {
    id: 5,
    dimension: "linguistic",
    text: "读到一个好故事或好句子时，你会反复品味，忍不住想分享给别人。"
  },

  // ==================== 逻辑-数学智能 (Logical) — 5题 ====================
  {
    id: 6,
    dimension: "logical",
    text: "遇到复杂问题时，你会下意识地把它拆解成几个小步骤，一步步推理。"
  },
  {
    id: 7,
    dimension: "logical",
    text: "玩解谜游戏（比如数独、密室逃脱、推理剧本）时，你总是最投入的那个。"
  },
  {
    id: 8,
    dimension: "logical",
    text: "编程、棋类或者策略类游戏让你感到兴奋，你享受规划和计算的乐趣。"
  },
  {
    id: 9,
    dimension: "logical",
    text: "面对各种'套路'和'方法'，你喜欢先理解背后的原理，而不是死记硬背。"
  },
  {
    id: 10,
    dimension: "logical",
    text: "当别人只看到一堆数据时，你能从中发现趋势、规律或者异常。"
  },

  // ==================== 空间智能 (Spatial) — 5题 ====================
  {
    id: 11,
    dimension: "spatial",
    text: "到一个新环境，你很快就能在脑海中构建出空间布局，不容易迷路。"
  },
  {
    id: 12,
    dimension: "spatial",
    text: "几何、立体几何学起来比代数更让你得心应手，你能轻松在脑海中旋转图形。"
  },
  {
    id: 13,
    dimension: "spatial",
    text: "拍照时你本能地会考虑构图——角度、光线、主体位置，而不是随便按快门。"
  },
  {
    id: 14,
    dimension: "spatial",
    text: "你对色彩搭配比较敏感，穿衣、布置房间时会注意配色是否协调。"
  },
  {
    id: 15,
    dimension: "spatial",
    text: "你喜欢涂鸦、画画或者设计一些小东西，做出来的东西经常被夸好看。"
  },

  // ==================== 身体-动觉智能 (Kinesthetic) — 5题 ====================
  {
    id: 16,
    dimension: "kinesthetic",
    text: "学习新东西时你喜欢'动手做'——实验、模型、实际操作比纯听课效果好得多。"
  },
  {
    id: 17,
    dimension: "kinesthetic",
    text: "你擅长至少一项体育运动，或者在需要身体协调的活动上比别人学得快。"
  },
  {
    id: 18,
    dimension: "kinesthetic",
    text: "长时间坐着不动会让你难受，你需要时不时站起来走动或做点什么。"
  },
  {
    id: 19,
    dimension: "kinesthetic",
    text: "看到别人做一个动作（比如舞蹈、运动技巧），你能比较快地模仿出来。"
  },
  {
    id: 20,
    dimension: "kinesthetic",
    text: "你享受用双手创造东西的过程——做菜、组装模型、搭建乐高都让你沉浸。"
  },

  // ==================== 音乐智能 (Musical) — 5题 ====================
  {
    id: 21,
    dimension: "musical",
    text: "你对音乐有比较强的感受力，听到好听的旋律会起鸡皮疙瘩或很兴奋。"
  },
  {
    id: 22,
    dimension: "musical",
    text: "听完一段旋律，你能比较准确地哼出来，节奏和音调偏差不大。"
  },
  {
    id: 23,
    dimension: "musical",
    text: "不同的音乐能明显影响你的情绪和状态，你会根据心情选择不同的歌。"
  },
  {
    id: 24,
    dimension: "musical",
    text: "你学过乐器或声乐，而且学得比一般人快，自己也比较享受这个过程。"
  },
  {
    id: 25,
    dimension: "musical",
    text: "你容易注意到环境中的声音——雨声、鸟鸣、远处的车声，感受它们的节奏和韵律。"
  },

  // ==================== 人际智能 (Interpersonal) — 5题 ====================
  {
    id: 26,
    dimension: "interpersonal",
    text: "你能比较快地感知到周围人的情绪变化——谁不开心了，谁在强撑。"
  },
  {
    id: 27,
    dimension: "interpersonal",
    text: "在团队中，你常常自然地成为协调者，帮助大家达成共识、化解矛盾。"
  },
  {
    id: 28,
    dimension: "interpersonal",
    text: "你能和不同类型的人找到共同话题——不管对方是学霸、体育生还是社恐。"
  },
  {
    id: 29,
    dimension: "interpersonal",
    text: "你善于激励别人——在小组项目中，你知道怎么让每个人发挥长处。"
  },
  {
    id: 30,
    dimension: "interpersonal",
    text: "你享受帮助别人成长的过程——给同学讲题、带学弟学妹适应新环境让你有成就感。"
  },

  // ==================== 内省智能 (Intrapersonal) — 5题 ====================
  {
    id: 31,
    dimension: "intrapersonal",
    text: "你经常反思自己的行为——'我刚才为什么那样说？''我真正想要的是什么？'"
  },
  {
    id: 32,
    dimension: "intrapersonal",
    text: "你对自己的优势和短板有比较清晰的认识，不太会被别人的评价左右。"
  },
  {
    id: 33,
    dimension: "intrapersonal",
    text: "遇到挫折时，你能在消化情绪后冷静分析原因，而不是一直陷在情绪里。"
  },
  {
    id: 34,
    dimension: "intrapersonal",
    text: "你喜欢独处，独处时不会觉得无聊，反而能高效思考或创作。"
  },
  {
    id: 35,
    dimension: "intrapersonal",
    text: "做决定时你会听从自己的内心，而不是盲从大多数人的选择。"
  },

  // ==================== 自然观察智能 (Naturalistic) — 5题 ====================
  {
    id: 36,
    dimension: "naturalistic",
    text: "你对自然界的细节很敏感——能注意到树叶的变化、昆虫的踪迹、云朵的形状。"
  },
  {
    id: 37,
    dimension: "naturalistic",
    text: "户外活动（登山、露营、观星、植物园）比室内活动更让你兴奋和放松。"
  },
  {
    id: 38,
    dimension: "naturalistic",
    text: "你对生物、地理这类与自然界相关的学科有超出平均水平的兴趣。"
  },
  {
    id: 39,
    dimension: "naturalistic",
    text: "你喜欢给事物分类和整理——你的书籍、文件、收藏品有自己的分类体系。"
  },
  {
    id: 40,
    dimension: "naturalistic",
    text: "你能察觉到天气变化的细微征兆——'快要下雨了'的直觉常常是对的。"
  }
];

// 维度中文名映射
const DIMENSION_NAMES = {
  linguistic:      { name: "语言智能",   icon: "📝", color: "#FF6B6B", description: "对语言文字的敏感度、表达和理解能力" },
  logical:         { name: "逻辑-数学智能", icon: "🧮", color: "#4ECDC4", description: "推理、计算、抽象思维和科学分析能力" },
  spatial:         { name: "空间智能",   icon: "🎨", color: "#45B7D1", description: "对空间、形状、色彩的感知和表达能力" },
  kinesthetic:     { name: "身体-动觉智能", icon: "🤸", color: "#96CEB4", description: "运用身体表达想法、动手操作的能力" },
  musical:         { name: "音乐智能",   icon: "🎵", color: "#FFEAA7", description: "对节奏、音高、旋律、音色的敏感度" },
  interpersonal:   { name: "人际智能",   icon: "🤝", color: "#DDA0DD", description: "理解他人情绪、意图，善于沟通合作的能力" },
  intrapersonal:   { name: "内省智能",   icon: "🧘", color: "#98D8C8", description: "认识自己、自我反思、理解内心世界的能力" },
  naturalistic:    { name: "自然观察智能", icon: "🌿", color: "#A8D8B9", description: "识别和分类自然界事物、观察规律的能力" }
};

// 将题目随机打乱（保留原数组不动，返回打乱后的副本）
function getShuffledQuestions() {
  const shuffled = [...QUESTIONS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
