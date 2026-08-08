const WW_DIMENSIONS = [
  "Tech",
  "Creative",
  "People",
  "Discovery",
  "Builder",
  "Justice",
  "Teaching",
  "Nature",
  "Compete",
];

const HW_DIMENSIONS = [
  "Analytical",
  "Creative Exec",
  "Relational",
  "Deep Research",
  "Hands On",
  "Strategic",
  "Performance",
];

const MW_DIMENSIONS = [
  "Build Lasting",
  "Artistic Mark",
  "Human Impact",
  "Discovery",
  "Empire Builder",
  "Justice Fighter",
  "Mentor Legacy",
];

const SIGNAL_MAP = {
  Tech: ["Cluster 1"],
  Creative: ["Cluster 3"],
  People: ["Cluster 2"],
  Discovery: ["Cluster 5"],
  Builder: ["Cluster 4", "Cluster 1"],
  Justice: ["Cluster 6"],
  Teaching: ["Cluster 2"],
  Nature: ["Cluster 5"],
  Compete: ["Cluster 4"],
};

const STAGE_LABELS = {
  1: "Stage 0",
  2: "Stage 0",
  3: "Stage 1",
  4: "Stage 1",
  5: "Stage 1",
  6: "Stage 2",
  7: "Stage 2",
  8: "Stage 3",
  9: "Stage 3",
  10: "Stage 3",
  11: "Stage 3",
  12: "Stage 4",
  13: "Stage 4",
};

export const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    stage: STAGE_LABELS[1],
    prompt: "What is your current age?",
    options: [
      { key: "A", text: "13-15 years" },
      { key: "B", text: "16-17 years" },
      { key: "C", text: "18-19 years" },
      { key: "D", text: "20-22 years" },
      { key: "E", text: "23 years or above" },
    ],
  },
  {
    id: 2,
    stage: STAGE_LABELS[2],
    prompt: "What is your current status?",
    options: [
      { key: "A", text: "Class 8, 9, or 10 student" },
      { key: "B", text: "Class 11 or 12 - Science stream" },
      { key: "C", text: "Class 11 or 12 - Commerce stream" },
      { key: "D", text: "Class 11 or 12 - Arts / Humanities stream" },
      { key: "E", text: "Undergraduate student" },
      { key: "F", text: "Graduate or currently working" },
      { key: "G", text: "Not sure where I stand / just exploring" },
    ],
  },
  {
    id: 3,
    stage: STAGE_LABELS[3],
    prompt:
      "Your school announces a surprise free half-day tomorrow. No plans, no pressure. A friend asks what you want to do. You say:",
    options: [
      { key: "A", text: "Let's go see how that new bridge/building is being constructed - I want to understand how it works" },
      { key: "B", text: "I want to finish the drawing, song, or story I've been working on" },
      { key: "C", text: "Let's organize something fun for our group or go help someone who needs it" },
      { key: "D", text: "I want to go deep into that topic I've been curious about all week" },
      { key: "E", text: "Let's play something competitive - I want to compete and win today" },
      { key: "F", text: "Let's figure out how to actually make some money doing something useful today" },
      { key: "G", text: "I want to game, stream, create content, or build something online" },
      { key: "H", text: "I honestly have no strong pull toward anything specific right now" },
    ],
  },
  {
    id: 4,
    stage: STAGE_LABELS[4],
    prompt: "You have to spend 3 hours on one of these right now. Which would you find least painful?",
    options: [
      { key: "A", text: "Solving 20 logic puzzles, math problems, or debugging a broken system" },
      { key: "B", text: "Designing a poster, writing a story, or composing music from scratch" },
      { key: "C", text: "Having deep conversations with 5 different people about their lives" },
      { key: "D", text: "Reading and summarizing 3 research articles on a complex topic" },
      { key: "E", text: "Building, fixing, or assembling something physical with my hands" },
      { key: "F", text: "Planning, pitching, and organizing a group event or project" },
      { key: "G", text: "Competing in a high-stakes tournament or public performance" },
    ],
  },
  {
    id: 5,
    stage: STAGE_LABELS[5],
    prompt: "If every career paid the exact same amount of money, what would you truly spend your life doing?",
    options: [
      { key: "A", text: "Build technology and systems that change the world" },
      { key: "B", text: "Create art, music, films, or stories that move people" },
      { key: "C", text: "Heal, counsel, or support people through their pain" },
      { key: "D", text: "Discover, research, or investigate the unknown" },
      { key: "E", text: "Lead - build a business, organization, or empire" },
      { key: "F", text: "Protect - fight for justice and defend people's rights" },
      { key: "G", text: "Teach, mentor, and guide the next generation" },
      { key: "H", text: "Work with nature, food, and living systems" },
      { key: "I", text: "Compete and win - push the limits of what is possible" },
    ],
  },
  {
    id: 6,
    stage: STAGE_LABELS[6],
    prompt: "Your project team is stuck. What do you automatically do?",
    options: [
      { key: "A", text: "Open my laptop and start researching quietly to find the answer" },
      { key: "B", text: "Say 'Let's just try something and fix it as we go'" },
      { key: "C", text: "Ask the team 'Has anyone dealt with something like this before?'" },
      { key: "D", text: "Work out a logical step-by-step plan in my head first" },
      { key: "E", text: "Suggest a completely different, creative approach" },
      { key: "F", text: "Take charge - assign roles and set a firm deadline" },
    ],
  },
  {
    id: 7,
    stage: STAGE_LABELS[7],
    prompt: "You are given a free project with no rules. What do you want to make?",
    options: [
      { key: "A", text: "A working model or app that solves a real-world problem" },
      { key: "B", text: "An art piece, film, or design that is visually powerful" },
      { key: "C", text: "A documentary about real people's stories" },
      { key: "D", text: "A research report that uncovers hidden truths" },
      { key: "E", text: "A business plan that could actually make money" },
      { key: "F", text: "A perfectly organized event or exhibition" },
    ],
  },
  {
    id: 8,
    stage: STAGE_LABELS[8],
    prompt: "After 3 months of hard work, which outcome makes you feel most fulfilled?",
    options: [
      { key: "A", text: "A product or system that people are actually using" },
      { key: "B", text: "A creative piece that genuinely moved someone" },
      { key: "C", text: "A person whose life actually changed because of me" },
      { key: "D", text: "A discovery or insight that nobody had before" },
      { key: "E", text: "A business result - revenue, growth, or measurable impact" },
      { key: "F", text: "Being recognized as the most skilled person in the room" },
    ],
  },
  {
    id: 9,
    stage: STAGE_LABELS[9],
    prompt: "At age 35, you are doing well financially. Looking back, what would make you feel 'empty'?",
    options: [
      { key: "A", text: "If I never built something truly great or lasting" },
      { key: "B", text: "If I never created anything beautiful or expressive" },
      { key: "C", text: "If I never truly healed or helped anyone" },
      { key: "D", text: "If I never discovered or understood anything new" },
      { key: "E", text: "If I never took the big risk and tried to build an empire" },
      { key: "F", text: "If I never stood up for what is right" },
      { key: "G", text: "If nobody grew or learned because of me" },
    ],
  },
  {
    id: 10,
    stage: STAGE_LABELS[10],
    prompt: "A stable government job vs. a risky startup with a high ceiling. Which do you take?",
    options: [
      { key: "A", text: "Government job - stability over gambling" },
      { key: "B", text: "Risky one - I'd rather bet on myself" },
      { key: "C", text: "Risky, but only if there is a very clear plan" },
      { key: "D", text: "Government job now, but build my own thing on the side" },
      { key: "E", text: "Honestly, I don't know yet" },
    ],
  },
  {
    id: 11,
    stage: STAGE_LABELS[11],
    prompt: "It is your last day of work, 40 years from now. Which retirement speech makes your eyes fill with tears?",
    options: [
      { key: "A", text: "'They built something that will outlast all of us'" },
      { key: "B", text: "'Every piece of their work made us feel something'" },
      { key: "C", text: "'Thousands of lives are better because this person showed up'" },
      { key: "D", text: "'They figured out what nobody else could'" },
      { key: "E", text: "'They built an empire and brought many people up with them'" },
      { key: "F", text: "'They stood up for what was right even when it cost them'" },
      { key: "G", text: "'Every person they mentored became extraordinary'" },
    ],
  },
  {
    id: 12,
    stage: STAGE_LABELS[12],
    prompt: "When you talk about unconventional careers at home, what happens?",
    options: [
      { key: "A", text: "They are completely open and support whatever makes me happy" },
      { key: "B", text: "They listen, but I need to explain it well and show it's viable" },
      { key: "C", text: "They are neutral - no strong views either way" },
      { key: "D", text: "They get worried and push me toward traditional paths (Eng/Med)" },
      { key: "E", text: "It causes serious conflict - only traditional careers are accepted" },
    ],
  },
  {
    id: 13,
    stage: STAGE_LABELS[13],
    prompt: "Realistically, how much can your family invest in your education?",
    options: [
      { key: "A", text: "Rs. 10 lakh or more" },
      { key: "B", text: "Rs. 3 - 10 lakh" },
      { key: "C", text: "Up to Rs. 3 lakh" },
      { key: "D", text: "I need a scholarship or mostly free education" },
      { key: "E", text: "I need to start earning as soon as possible" },
    ],
  },
];

const QUESTION_WEIGHTS = {
  3: 22,
  5: 43,
  7: 35,
  4: 34,
  6: 33,
  8: 24,
  9: 24,
  11: 24,
};

const CONTRIBUTIONS = {
  3: {
    A: { ww: { Tech: 1 } },
    B: { ww: { Creative: 1 } },
    C: { ww: { People: 1 } },
    D: { ww: { Discovery: 1 } },
    E: { ww: { Compete: 1 } },
    F: { ww: { Builder: 1 } },
    G: { ww: { Creative: 0.5, Tech: 0.5 } },
    H: { ww: { Discovery: 0.2, People: 0.2, Builder: 0.2, Tech: 0.2, Creative: 0.2 } },
  },
  4: {
    A: { hw: { Analytical: 1 } },
    B: { hw: { "Creative Exec": 1 } },
    C: { hw: { Relational: 1 } },
    D: { hw: { "Deep Research": 1 } },
    E: { hw: { "Hands On": 1 } },
    F: { hw: { Strategic: 1 } },
    G: { hw: { Performance: 1 } },
  },
  5: {
    A: { ww: { Tech: 1 }, mw: { "Build Lasting": 1 } },
    B: { ww: { Creative: 1 }, mw: { "Artistic Mark": 1 } },
    C: { ww: { People: 1 }, mw: { "Human Impact": 1 } },
    D: { ww: { Discovery: 1 }, mw: { Discovery: 1 } },
    E: { ww: { Builder: 1 }, mw: { "Empire Builder": 1 } },
    F: { ww: { Justice: 1 }, mw: { "Justice Fighter": 1 } },
    G: { ww: { Teaching: 1 }, mw: { "Mentor Legacy": 1 } },
    H: { ww: { Nature: 1 }, mw: { "Human Impact": 0.4, Discovery: 0.3, "Build Lasting": 0.3 } },
    I: { ww: { Compete: 1 }, mw: { "Empire Builder": 0.6, "Build Lasting": 0.4 } },
  },
  6: {
    A: { hw: { "Deep Research": 1 } },
    B: { hw: { "Hands On": 1 } },
    C: { hw: { Relational: 1 } },
    D: { hw: { Analytical: 1 } },
    E: { hw: { "Creative Exec": 1 } },
    F: { hw: { Strategic: 1 } },
  },
  7: {
    A: { ww: { Tech: 0.7, Builder: 0.3 }, hw: { "Hands On": 0.5, Analytical: 0.5 } },
    B: { ww: { Creative: 1 }, hw: { "Creative Exec": 0.7, Performance: 0.3 } },
    C: { ww: { People: 1 }, hw: { Relational: 0.7, "Deep Research": 0.3 } },
    D: { ww: { Discovery: 1 }, hw: { "Deep Research": 0.8, Analytical: 0.2 } },
    E: { ww: { Builder: 0.7, Compete: 0.3 }, hw: { Strategic: 0.7, Analytical: 0.3 } },
    F: { ww: { Teaching: 0.6, People: 0.4 }, hw: { Strategic: 0.6, "Creative Exec": 0.4 } },
  },
  8: {
    A: { mw: { "Build Lasting": 1 } },
    B: { mw: { "Artistic Mark": 1 } },
    C: { mw: { "Human Impact": 1 } },
    D: { mw: { Discovery: 1 } },
    E: { mw: { "Empire Builder": 1 } },
    F: { mw: { "Build Lasting": 0.5, "Empire Builder": 0.5 } },
  },
  9: {
    A: { mw: { "Build Lasting": 1 } },
    B: { mw: { "Artistic Mark": 1 } },
    C: { mw: { "Human Impact": 1 } },
    D: { mw: { Discovery: 1 } },
    E: { mw: { "Empire Builder": 1 } },
    F: { mw: { "Justice Fighter": 1 } },
    G: { mw: { "Mentor Legacy": 1 } },
  },
  11: {
    A: { mw: { "Build Lasting": 1 } },
    B: { mw: { "Artistic Mark": 1 } },
    C: { mw: { "Human Impact": 1 } },
    D: { mw: { Discovery: 1 } },
    E: { mw: { "Empire Builder": 1 } },
    F: { mw: { "Justice Fighter": 1 } },
    G: { mw: { "Mentor Legacy": 1 } },
  },
};

const CLUSTER_BASE_SIGNATURES = {
  "Cluster 1": {
    ww: { Tech: 62, Builder: 20, Discovery: 18 },
    hw: { Analytical: 40, "Hands On": 20, Strategic: 20, "Deep Research": 20 },
    mw: { "Build Lasting": 40, Discovery: 20, "Empire Builder": 25, "Mentor Legacy": 15 },
  },
  "Cluster 2": {
    ww: { People: 45, Teaching: 30, Justice: 10, Nature: 15 },
    hw: { Relational: 42, Strategic: 22, "Deep Research": 18, "Creative Exec": 18 },
    mw: { "Human Impact": 45, "Mentor Legacy": 28, "Justice Fighter": 12, "Build Lasting": 15 },
  },
  "Cluster 3": {
    ww: { Creative: 68, People: 12, Compete: 20 },
    hw: { "Creative Exec": 48, Performance: 28, Relational: 12, Strategic: 12 },
    mw: { "Artistic Mark": 55, "Build Lasting": 20, "Empire Builder": 25 },
  },
  "Cluster 4": {
    ww: { Builder: 40, Compete: 35, Tech: 25 },
    hw: { Strategic: 38, Analytical: 30, Performance: 12, Relational: 20 },
    mw: { "Empire Builder": 50, "Build Lasting": 30, "Mentor Legacy": 20 },
  },
  "Cluster 5": {
    ww: { Nature: 42, Discovery: 40, People: 18 },
    hw: { "Deep Research": 34, "Hands On": 28, Analytical: 20, Relational: 18 },
    mw: { Discovery: 36, "Human Impact": 34, "Build Lasting": 30 },
  },
  "Cluster 6": {
    ww: { Justice: 50, People: 28, Teaching: 22 },
    hw: { Strategic: 30, Relational: 28, "Deep Research": 22, Performance: 20 },
    mw: { "Justice Fighter": 50, "Human Impact": 20, "Mentor Legacy": 20, "Build Lasting": 10 },
  },
};

const WW_KEYWORDS = {
  Tech: ["software", "ai", "machine", "data", "cloud", "developer", "engineer", "cyber", "code", "robot"],
  Creative: ["design", "art", "film", "music", "writer", "content", "visual", "media", "fashion"],
  People: ["therapy", "counselling", "patient", "community", "social", "healthcare", "teaching"],
  Discovery: ["research", "analysis", "scientist", "lab", "investigate", "insight"],
  Builder: ["product", "business", "operations", "manager", "startup", "entrepreneur"],
  Justice: ["law", "policy", "compliance", "forensic", "rights", "ethics", "governance"],
  Teaching: ["teacher", "mentor", "trainer", "education", "coach"],
  Nature: ["environment", "sustainability", "agri", "food", "climate", "wildlife", "earth"],
  Compete: ["sales", "trading", "gaming", "sports", "performance", "growth", "revenue"],
};

const HW_KEYWORDS = {
  Analytical: ["analysis", "sql", "math", "debug", "logic", "optimization", "modeling"],
  "Creative Exec": ["design", "creative", "story", "ideation", "content", "branding"],
  Relational: ["counselling", "client", "stakeholder", "people", "team", "community"],
  "Deep Research": ["research", "study", "investigation", "evidence", "lab", "paper"],
  "Hands On": ["build", "field", "maintenance", "deployment", "repair", "hands-on"],
  Strategic: ["strategy", "roadmap", "planning", "lead", "management", "decision"],
  Performance: ["present", "public", "stage", "competition", "pitch", "speaking"],
};

const MW_KEYWORDS = {
  "Build Lasting": ["impact", "systems", "long-term", "infrastructure", "legacy", "lasting"],
  "Artistic Mark": ["creative", "design", "express", "story", "aesthetic", "art"],
  "Human Impact": ["help", "heal", "support", "care", "community", "wellbeing"],
  Discovery: ["discover", "research", "innovate", "investigate", "knowledge"],
  "Empire Builder": ["business", "growth", "revenue", "entrepreneur", "leadership", "scale"],
  "Justice Fighter": ["justice", "law", "rights", "ethics", "policy", "governance"],
  "Mentor Legacy": ["teach", "mentor", "coach", "guide", "educate"],
};

function toNumber(value, fallback = 0) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  const text = String(value ?? "").trim();
  if (!text) return fallback;

  const match = text.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : fallback;
}

function initVector(keys) {
  return keys.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});
}

function addWeighted(contribution, targetVector, weight) {
  if (!contribution) return;
  Object.entries(contribution).forEach(([key, value]) => {
    if (!(key in targetVector)) return;
    targetVector[key] += value * weight;
  });
}

function normalizeTo100(vector) {
  const total = Object.values(vector).reduce((sum, value) => sum + value, 0);
  if (!total) return vector;

  const normalized = {};
  Object.entries(vector).forEach(([key, value]) => {
    normalized[key] = (value / total) * 100;
  });
  return normalized;
}

function topDimension(vector) {
  return Object.entries(vector).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function vectorSimilarity(studentVector, careerVector) {
  const dimensions = Object.keys(studentVector);
  const overlap = dimensions.reduce(
    (sum, key) => sum + Math.min(studentVector[key] || 0, careerVector[key] || 0),
    0
  );
  return Math.max(0, Math.min(1, overlap / 100));
}

function createBaseSignature(cluster) {
  const base = CLUSTER_BASE_SIGNATURES[cluster] || CLUSTER_BASE_SIGNATURES["Cluster 1"];
  return {
    ww: { ...initVector(WW_DIMENSIONS), ...(base.ww || {}) },
    hw: { ...initVector(HW_DIMENSIONS), ...(base.hw || {}) },
    mw: { ...initVector(MW_DIMENSIONS), ...(base.mw || {}) },
  };
}

function bumpByKeywords(text, vector, dictionary, bump = 6) {
  Object.entries(dictionary).forEach(([dimension, words]) => {
    const hits = words.reduce((count, keyword) => {
      return text.includes(keyword) ? count + 1 : count;
    }, 0);

    if (hits > 0) {
      vector[dimension] += hits * bump;
    }
  });
}

function careerText(career) {
  return [
    career["Career Name"],
    career["One-Line Summary"],
    career["What They Do"],
    career["Industries"],
    career["Core Skills"],
    career["Who Should Choose"],
    career["Verdict"],
  ]
    .join(" ")
    .toLowerCase();
}

function buildCareerSignature(career) {
  const signature = createBaseSignature(String(career.Cluster || "Cluster 1"));
  const text = careerText(career);

  bumpByKeywords(text, signature.ww, WW_KEYWORDS, 7);
  bumpByKeywords(text, signature.hw, HW_KEYWORDS, 6);
  bumpByKeywords(text, signature.mw, MW_KEYWORDS, 6);

  return {
    ww: normalizeTo100(signature.ww),
    hw: normalizeTo100(signature.hw),
    mw: normalizeTo100(signature.mw),
  };
}

function isRiskyCareer(career) {
  const stability = toNumber(career["Stability Score"], 7);
  const stress = toNumber(career["Stress Level"], 6);
  const text = careerText(career);

  return (
    stability <= 6 ||
    stress >= 7 ||
    ["startup", "trading", "gaming", "actor", "founder", "blockchain", "freelance"].some((k) =>
      text.includes(k)
    )
  );
}

function isLowAcceptanceCareer(career) {
  const text = careerText(career);
  return ["film", "music", "gaming", "fashion", "content", "artist", "influencer"].some((k) =>
    text.includes(k)
  );
}

function isHighAcceptanceCareer(career) {
  const text = careerText(career);
  return ["engineer", "doctor", "medicine", "law", "government", "civil", "bank"].some((k) =>
    text.includes(k)
  );
}

function isHighCostCareer(career) {
  const text = careerText(career);
  return ["mbbs", "medicine", "pilot", "law", "phd"].some((k) => text.includes(k));
}

function isAnchorCareer(career) {
  const stability = toNumber(career["Stability Score"], 7);
  const demand = String(career["Demand Level"] || "").toLowerCase();
  return stability >= 8 && (isHighAcceptanceCareer(career) || demand.includes("high"));
}

function riskModifier(q10Answer, career) {
  const risky = isRiskyCareer(career);
  if (!q10Answer) return 1;

  switch (q10Answer) {
    case "A":
      return risky ? 0.85 : 1.04;
    case "B":
      return risky ? 1.07 : 0.96;
    case "C":
      return risky ? 1.04 : 0.98;
    case "D":
      return risky ? 0.95 : 1.03;
    default:
      return 1;
  }
}

function familyModifier(q12Answer, career) {
  if (!q12Answer) return 1;

  const lowAcceptance = isLowAcceptanceCareer(career);
  const highAcceptance = isHighAcceptanceCareer(career);

  if (q12Answer === "E") {
    if (lowAcceptance) return 0.8;
    if (highAcceptance) return 1.08;
    return 1;
  }

  if (q12Answer === "D") {
    if (lowAcceptance) return 0.88;
    if (highAcceptance) return 1.05;
    return 1;
  }

  if (q12Answer === "B") {
    if (highAcceptance) return 1.03;
    return 1;
  }

  return 1;
}

function budgetModifier(q13Answer, career) {
  if (!q13Answer || !isHighCostCareer(career)) return 1;

  const map = {
    A: 1,
    B: 0.95,
    C: 0.88,
    D: 0.82,
    E: 0.78,
  };

  return map[q13Answer] || 1;
}

function streamModifier(q2Answer, careerSignature) {
  if (q2Answer !== "D") return 1;
  return (careerSignature.ww.Tech || 0) >= 60 ? 0.92 : 1;
}

function buildStudentProfile(answers) {
  const ww = initVector(WW_DIMENSIONS);
  const hw = initVector(HW_DIMENSIONS);
  const mw = initVector(MW_DIMENSIONS);

  Object.entries(CONTRIBUTIONS).forEach(([qidText, optionMap]) => {
    const qid = Number(qidText);
    const selected = answers[qid];
    if (!selected || !optionMap[selected]) return;

    const weight = QUESTION_WEIGHTS[qid] || 20;
    const contribution = optionMap[selected];

    addWeighted(contribution.ww, ww, weight);
    addWeighted(contribution.hw, hw, weight);
    addWeighted(contribution.mw, mw, weight);
  });

  const normalized = {
    ww: normalizeTo100(ww),
    hw: normalizeTo100(hw),
    mw: normalizeTo100(mw),
  };

  return {
    ...normalized,
    dominant: {
      ww: topDimension(normalized.ww),
      hw: topDimension(normalized.hw),
      mw: topDimension(normalized.mw),
    },
  };
}

function buildRealityScorecard(career, appliedModifiers) {
  const money = toNumber(career["Money Score"], 6);
  const growth = toNumber(career["Growth Score"], 6);
  const stability = toNumber(career["Stability Score"], 6);
  const feasibility = Math.max(1, Math.min(10, ((appliedModifiers.family * appliedModifiers.budget) * 10) / 2));

  return {
    money,
    growth,
    stability,
    feasibility: Number(feasibility.toFixed(1)),
  };
}

function buildExplanation(student, career, finalScore) {
  const cluster = String(career.Cluster || "Unknown Cluster");
  const dominantWW = student.dominant.ww;
  const dominantHW = student.dominant.hw;
  const dominantMW = student.dominant.mw;

  return `${career["Career Name"]} aligns with your ${dominantWW} work-world signal, ${dominantHW} execution style, and ${dominantMW} motivation pattern (${Math.round(finalScore)}% fit in ${cluster}).`;
}

function scoreCareer(studentProfile, career, answers) {
  const signature = buildCareerSignature(career);

  const ias = vectorSimilarity(studentProfile.ww, signature.ww) * 100;
  const tss = vectorSimilarity(studentProfile.hw, signature.hw) * 100;
  const mas = vectorSimilarity(studentProfile.mw, signature.mw) * 100;

  const dominantMWStrength = studentProfile.mw[studentProfile.dominant.mw] || 0;
  const isPerfectAlignment = dominantMWStrength >= 75;

  const baseScore = isPerfectAlignment
    ? ias * 0.28 + tss * 0.28 + mas * 0.44
    : ias * 0.33 + tss * 0.3 + mas * 0.37;

  const modifiers = {
    risk: riskModifier(answers[10], career),
    family: familyModifier(answers[12], career),
    budget: budgetModifier(answers[13], career),
    stream: streamModifier(answers[2], signature),
  };

  const finalScore = Math.max(
    1,
    Math.min(99, baseScore * modifiers.risk * modifiers.family * modifiers.budget * modifiers.stream)
  );

  return {
    career,
    ias,
    tss,
    mas,
    baseScore,
    finalScore,
    isPerfectAlignment,
    signature,
    modifiers,
    explanation: buildExplanation(studentProfile, career, finalScore),
    realityScorecard: buildRealityScorecard(career, modifiers),
  };
}

function getSignaledClusters(studentProfile) {
  return new Set(SIGNAL_MAP[studentProfile.dominant.ww] || []);
}

function pickFirst(candidates, selectedIds, predicate) {
  return candidates.find((item) => {
    const id = String(item.career["No."] || item.career["Career Name"] || "");
    if (!id || selectedIds.has(id)) return false;
    return predicate(item);
  });
}

function selectTopFive(scored, studentProfile, answers) {
  const sorted = [...scored].sort((a, b) => b.finalScore - a.finalScore);
  const selected = [];
  const selectedIds = new Set();
  const signaledClusters = getSignaledClusters(studentProfile);

  const addItem = (item) => {
    if (!item) return false;
    const id = String(item.career["No."] || item.career["Career Name"] || "");
    if (!id || selectedIds.has(id)) return false;
    selected.push(item);
    selectedIds.add(id);
    return true;
  };

  if (["D", "E"].includes(answers[12])) {
    addItem(pickFirst(sorted, selectedIds, (item) => isAnchorCareer(item.career)));
  }

  addItem(
    pickFirst(sorted, selectedIds, (item) => {
      const cluster = String(item.career.Cluster || "");
      return cluster && !signaledClusters.has(cluster);
    })
  );

  while (selected.length < 5) {
    const uniqueClusters = new Set(selected.map((item) => String(item.career.Cluster || "")).filter(Boolean));
    if (uniqueClusters.size >= 3) break;

    const nextDiverse = pickFirst(sorted, selectedIds, (item) => {
      const cluster = String(item.career.Cluster || "");
      return cluster && !uniqueClusters.has(cluster);
    });

    if (!addItem(nextDiverse)) break;
  }

  for (const item of sorted) {
    if (selected.length >= 5) break;
    addItem(item);
  }

  return selected.slice(0, 5);
}

export function evaluateAssessment(answers, careers) {
  const studentProfile = buildStudentProfile(answers);

  const scoredCareers = (careers || [])
    .filter((career) => career && career["Career Name"] && career.Cluster)
    .map((career) => scoreCareer(studentProfile, career, answers));

  const topMatches = selectTopFive(scoredCareers, studentProfile, answers).map((item) => ({
    id: Number(item.career["No."]) || item.career["Career Name"],
    careerName: item.career["Career Name"],
    cluster: item.career.Cluster,
    score: Number(item.finalScore.toFixed(1)),
    summary: item.career["One-Line Summary"] || "High-fit path based on your current signals.",
    explanation: item.explanation,
    realityScorecard: item.realityScorecard,
    salary: {
      entry: item.career["Entry Salary (LPA)"] || "NA",
      mid: item.career["Mid Salary (LPA)"] || "NA",
      senior: item.career["Senior Salary (LPA)"] || "NA",
    },
  }));

  return {
    studentProfile,
    topMatches,
  };
}
