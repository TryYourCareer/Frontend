import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { supabase, isSupabaseConfigured as isFirebaseConfigured } from "../supabaseConfig";
import { ASSESSMENT_QUESTIONS, evaluateAssessment } from "../utils/matchingEngine";
import { ArrowLeft, RefreshCw, ChevronLeft, ChevronRight, TrendingUp, DollarSign, Activity, ShieldCheck, Loader2, Target, CheckCircle2, AlertCircle, ArrowRight, Trophy, Star, Sparkles } from "lucide-react";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";
const API_TIMEOUT_MS = 3000;
const CSV_TIMEOUT_MS = 8000;
const XP_PER_QUESTION = 75;
const QUEST_THEME = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
];

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export default function Assessment({ onBack, onOpenCluster, user = null }) {
  const [careers, setCareers] = useState([]);
  const [isLoadingCareers, setIsLoadingCareers] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveState, setSaveState] = useState("idle");
  const [saveError, setSaveError] = useState("");

  const [answers, setAnswers] = useState(() => {
    return ASSESSMENT_QUESTIONS.reduce((acc, question) => {
      acc[question.id] = "";
      return acc;
    }, {});
  });

  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;

    function normalizeForEngine(row) {
      return {
        "No.": Number(row.id || row["No."] || 0),
        "Career Name": row.title || row["Career Name"] || "",
        Cluster: row.cluster || row.Cluster || "",
        "One-Line Summary": row.one_line_summary || row["One-Line Summary"] || "",
        "What They Do": row.what_they_do || row["What They Do"] || "",
        Industries: row.industries || row.Industries || "",
        "Entry Salary (LPA)": row.entry_salary || row["Entry Salary (LPA)"] || "",
        "Mid Salary (LPA)": row.mid_salary || row["Mid Salary (LPA)"] || "",
        "Senior Salary (LPA)": row.senior_salary || row["Senior Salary (LPA)"] || "",
        "Top Earnings (LPA)": row.top_earnings || row["Top Earnings (LPA)"] || "",
        "Demand Level": row.demand_level || row["Demand Level"] || "",
        "Growth Rate": row.growth_rate || row["Growth Rate"] || "",
        "AI Impact": row.ai_impact || row["AI Impact"] || "",
        "Core Skills": row.core_skills || row["Core Skills"] || "",
        "Key Certifications": row.key_certifications || row["Key Certifications"] || "",
        "Degree Required": row.degree_required || row["Degree Required"] || "",
        "Work-Life Balance": row.work_life_balance || row["Work-Life Balance"] || "",
        "Stress Level": row.stress_level || row["Stress Level"] || "",
        "Entry Path": row.entry_path || row["Entry Path"] || "",
        "Who Should Choose": row.who_should_choose || row["Who Should Choose"] || "",
        "Who Should Avoid": row.who_should_avoid || row["Who Should Avoid"] || "",
        Verdict: row.verdict || row.Verdict || "",
        "Money Score": row.money_score || row["Money Score"] || "",
        "Growth Score": row.growth_score || row["Growth Score"] || "",
        "Stability Score": row.stability_score || row["Stability Score"] || "",
      };
    }

    async function loadCareersCsv() {
      try {
        setIsLoadingCareers(true);

        let normalizedForEngine = [];

        try {
          const response = await fetchWithTimeout(`${API_BASE_URL}/careers/full`, API_TIMEOUT_MS);
          if (!response.ok) {
            throw new Error("Backend API unavailable");
          }

          const payload = await response.json();
          normalizedForEngine = (payload || []).map(normalizeForEngine);
        } catch {
          const csvText = await fetchWithTimeout("/data/Careers.csv", CSV_TIMEOUT_MS).then((res) => {
            if (!res.ok) {
              throw new Error("Could not load careers dataset");
            }
            return res.text();
          });

          const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
          });

          if (parsed.errors.length > 0) {
            throw new Error(parsed.errors[0].message || "Could not parse careers dataset");
          }

          normalizedForEngine = (parsed.data || []).map(normalizeForEngine);
        }

        if (!cancelled) {
          setCareers(normalizedForEngine);
          setLoadError("");
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message || "Failed to load careers data");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCareers(false);
        }
      }
    }

    loadCareersCsv();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentQuestion = ASSESSMENT_QUESTIONS[questionIndex];
  const selectedOption = answers[currentQuestion?.id] || "";
  const progress = useMemo(() => ((questionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100, [questionIndex]);
  const answeredCount = useMemo(() => Object.values(answers).filter(Boolean).length, [answers]);
  const totalQuestions = ASSESSMENT_QUESTIONS.length; 
  const maxXp = totalQuestions * XP_PER_QUESTION;
  const stageGradient = QUEST_THEME[questionIndex % QUEST_THEME.length];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (result) return; // Don't navigate if results are shown
      
      if (event.key === "Enter" && selectedOption) {
        event.preventDefault();
        handleNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (selectedOption) handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption, result]);

  const handleSelectOption = (optionKey) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionKey,
    }));
  };

  const saveAssessmentToSupabase = async (computedResult, selectedAnswers) => {
    if (!isFirebaseConfigured || !supabase) {
      return;
    }

    try {
      setSaveState("saving");
      setSaveError("");

      const { error } = await supabase
        .from('assessments')
        .insert([
          {
            user_id: user?.id || null, // Supabase user id
            user_email: user?.email || null,
            answers: selectedAnswers,
            student_profile: computedResult.studentProfile,
            top_matches: computedResult.topMatches,
            // createdAt is handled by Postgres default now()
          }
        ]);

      if (error) throw error;

      setSaveState("saved");
    } catch (error) {
      setSaveState("error");
      setSaveError(error?.message || "Could not save assessment.");
    }
  };

  const handleNext = () => {
    if (!selectedOption) return;

    if (questionIndex === ASSESSMENT_QUESTIONS.length - 1) {
      const computed = evaluateAssessment(answers, careers);
      setResult(computed);
      void saveAssessmentToSupabase(computed, answers);
      return;
    }

    setQuestionIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (questionIndex === 0) return;
    setQuestionIndex((prev) => prev - 1);
  };

  const restartAssessment = () => {
    setAnswers(
      ASSESSMENT_QUESTIONS.reduce((acc, question) => {
        acc[question.id] = "";
        return acc;
      }, {})
    );
    setQuestionIndex(0);
    setResult(null);
    setSaveState("idle");
    setSaveError("");
  };

  return (
    <>
      <section className="min-h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_#dff7ff_0%,_#edf3ff_34%,_#dce7ff_68%,_#f6fbff_100%)] px-4 py-6 sm:px-8 sm:py-9">
        <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] border border-[#bdd4ff] bg-white/88 shadow-[0_24px_70px_rgba(34,74,150,0.18)] backdrop-blur">
          <div className="border-b border-[#d9e6ff] bg-[#f7fbff] px-5 py-4 sm:px-8">
            <button
              type="button"
              onClick={onBack}
              className="cc-body inline-flex items-center gap-2 rounded-xl border border-[#b8cbf7] bg-[#edf3ff] px-4 py-2 text-sm font-bold text-[#234b9f] transition hover:bg-[#e0ebff] hover:-translate-y-0.5"
            >
              <ArrowLeft size={15} />
              Back
            </button>
            {/* <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl border border-[#d7e4ff] bg-white px-4 py-3">
                <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${stageGradient} text-white shadow-md`}>
                  <Trophy size={18} />
                </div>
                <div>
                  <p className="cc-body text-[10px] font-black uppercase tracking-[0.18em] text-[#6b82aa]">Quest Level</p>
                  <p className="cc-display text-lg font-black text-[#112f66]">Level {level}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[#d7e4ff] bg-white px-4 py-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9f1ff] text-[#2f63d7]">
                  <Zap size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="cc-body text-[10px] font-black uppercase tracking-[0.18em] text-[#6b82aa]">XP</p>
                    <p className="cc-body text-xs font-black text-[#2f63d7]">{xpEarned}/{maxXp}</p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#dce8ff]">
                    <motion.div className={`h-full rounded-full bg-gradient-to-r ${stageGradient}`} animate={{ width: `${(xpEarned / maxXp) * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[#d7e4ff] bg-white px-4 py-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef4ff] text-[#2f63d7]">
                  <Flag size={18} />
                </div>
                <div>
                  <p className="cc-body text-[10px] font-black uppercase tracking-[0.18em] text-[#6b82aa]">Missions</p>
                  <p className="cc-display text-lg font-black text-[#112f66]">{answeredCount}/{totalQuestions} cleared</p>
                </div>
              </div>
            </div> */}
          </div>

          <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="cc-body inline-flex items-center gap-2 rounded-full border border-[#c9dcff] bg-[#edf4ff] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#3f6fce]">
                <Sparkles size={13} />
                Career Quest
              </p>
              <h1 className="cc-display mt-3 text-3xl font-black text-[#0c1e4f] sm:text-4xl">Unlock Your Career Loadout</h1>
              <p className="cc-body mt-2 max-w-2xl text-sm text-[#41608e] sm:text-base">Clear each mission, earn XP, and reveal the career paths that best match your instincts.</p>
            </div>

            
          </div>

          {isLoadingCareers ? (
            <div className="mt-8 rounded-2xl border border-[#ccdcff] bg-[#f4f8ff] p-6 text-center">
              <Loader2 size={24} className="mx-auto mb-3 animate-spin text-[#2e5ec6]" />
              <p className="cc-body text-lg font-semibold text-[#2e5ec6]">Loading careers dataset...</p>
            </div>
          ) : null}

          {loadError ? (
            <div className="mt-8 rounded-2xl border border-[#f4b1b1] bg-[#ffe9e9] p-5 text-sm font-semibold text-[#9f2f2f]">{loadError}</div>
          ) : null}

          {!isLoadingCareers && !loadError && !result ? (
            <div className="mt-8">
              {/* Progress Section */}
              <div className="mb-8 rounded-[24px] border border-[#c8dcff] bg-[#f8fbff] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${stageGradient} text-white shadow-lg`}>
                      <Target size={20} />
                    </div>
                    <div>
                      <p className="cc-body text-xs font-black uppercase tracking-[0.15em] text-[#4a72ba]">{currentQuestion.stage}</p>
                      <p className="cc-body mt-1 text-sm font-bold text-[#365c9c]">Mission {questionIndex + 1} of {totalQuestions}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="cc-body text-xs font-black uppercase tracking-[0.15em] text-[#4a72ba]">Quest Progress</p>
                    <p className="cc-display mt-1 text-2xl font-black text-[#2f63d7]">{Math.round(progress)}%</p>
                  </div>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[#dce8ff] ring-1 ring-[#c6d9ff]">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${stageGradient}`}
                  />
                </div>
              </div>

              {/* Question Section */}
              <div className="mb-8 rounded-[24px] border border-[#d9e6ff] bg-white p-5 shadow-[0_12px_30px_rgba(45,91,177,0.08)] sm:p-7">
                <div className="mb-4 flex items-center gap-2">
                  {[...Array(totalQuestions)].map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-2 flex-1 rounded-full transition ${
                        idx < answeredCount
                          ? "bg-[#2f63d7]"
                          : idx === questionIndex
                          ? "bg-[#90b4f5]"
                          : "bg-[#e4ecfb]"
                      }`}
                    />
                  ))}
                </div>
                <h2 className="cc-display text-2xl font-extrabold leading-tight text-[#10254f] sm:text-3xl md:text-4xl">{currentQuestion.prompt}</h2>
                <p className="cc-body mt-3 text-sm font-semibold text-[#5a7ba8]">Choose your move. Your answer adds XP to your final career profile.</p>
              </div>

              {/* Options Grid */}
              <div className="mb-10 grid gap-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === option.key;
                  return (
                    <motion.button
                      key={option.key}
                      type="button"
                      onClick={() => handleSelectOption(option.key)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`group relative overflow-hidden rounded-[22px] border-2 px-4 py-5 text-left transition duration-200 sm:px-6 ${
                        isSelected
                          ? "border-[#2f63d7] bg-gradient-to-br from-[#edf3ff] to-[#f5faff] shadow-[0_16px_34px_rgba(47,99,215,0.25)]"
                          : "border-[#d5e0f8] bg-white hover:border-[#7fa4ee] hover:bg-[#f8fbff] hover:shadow-[0_10px_22px_rgba(47,99,215,0.12)]"
                      }`}
                    >
                      {isSelected ? (
                        <motion.span
                          layoutId="selectedQuestGlow"
                          className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${stageGradient}`}
                        />
                      ) : null}
                      <div className="flex items-start gap-4">
                        <motion.span
                          initial={false}
                          animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
                          className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-sm font-black transition-all ${
                            isSelected
                              ? `bg-gradient-to-br ${stageGradient} text-white shadow-[0_6px_16px_rgba(47,99,215,0.3)]`
                              : "bg-[#e8effe] text-[#4069b7] group-hover:bg-[#dde9ff]"
                          }`}
                        >
                          {option.key}
                        </motion.span>
                        <span className="cc-body flex-1 pt-1 text-sm font-bold leading-7 text-[#143167] sm:text-base">{option.text}</span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mt-1 flex items-center gap-2 rounded-full bg-[#e8f7ef] px-3 py-1 text-[#16824f]"
                          >
                            <CheckCircle2 size={17} />
                            <span className="cc-body hidden text-xs font-black sm:inline">+{XP_PER_QUESTION} XP</span>
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Navigation Section */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={questionIndex === 0}
                  className="cc-body order-2 sm:order-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#c7d7fb] bg-white px-5 py-3 text-sm font-bold text-[#345ca7] transition duration-200 hover:border-[#7fa4ee] hover:bg-[#f3f7ff] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:border-[#e0e8f5] disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <ChevronLeft size={18} />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="order-1 flex items-center justify-center gap-2 rounded-full border border-[#d7e4ff] bg-[#f8fbff] px-4 py-2 sm:order-2">
                  <div className={`h-2 w-2 rounded-full ${selectedOption ? "bg-emerald-400 cc-pulse-dot" : "bg-[#b0c4e3]"}`} />
                  <span className="cc-body text-xs font-bold text-[#5a7ba8]">
                    {selectedOption ? `Move locked: +${XP_PER_QUESTION} XP` : "Pick a move to continue"}
                  </span>
                </div>

                <motion.button
                  type="button"
                  onClick={handleNext}
                  disabled={!selectedOption}
                  whileHover={selectedOption ? { scale: 1.02 } : {}}
                  whileTap={selectedOption ? { scale: 0.98 } : {}}
                  className="cc-body order-3 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2f63d7] to-[#1f4ec4] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(47,99,215,0.25)] transition duration-200 hover:shadow-[0_12px_28px_rgba(47,99,215,0.35)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#a0b5dd] disabled:shadow-none disabled:hover:translate-y-0"
                >
                  {questionIndex === ASSESSMENT_QUESTIONS.length - 1 ? (
                    <>
                      <span>Reveal Rewards</span>
                      <Target size={18} />
                    </>
                  ) : (
                    <>
                      <span>Next Mission</span>
                      <ChevronRight size={18} />
                    </>
                  )}
                </motion.button>
              </div>

              {/* Keyboard hint */}
              <p className="cc-body mt-4 text-center text-xs font-semibold text-[#7a8fb5]">Press Enter after selecting to continue the quest.</p>
            </div>
          ) : null}

          {!isLoadingCareers && !loadError && result ? (
            <div className="mt-8">
              {/* Results Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col gap-4 rounded-[26px] border-2 border-[#00a5b7] bg-gradient-to-br from-[#ecf5f7] to-[#f0fbfc] p-5 shadow-[0_18px_45px_rgba(0,165,183,0.14)] sm:flex-row sm:items-center sm:justify-between sm:p-7"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#00a5b7] to-[#2f63d7] text-white shadow-lg">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <p className="cc-body text-xs font-black uppercase tracking-[0.2em] text-[#1b7a87]">Quest Complete</p>
                    <h2 className="cc-display mt-2 text-2xl font-black text-[#0f5d69] sm:text-3xl">Rewards Unlocked</h2>
                    <p className="cc-body mt-2 text-sm font-semibold text-[#28697a]">You earned {maxXp} XP and revealed your strongest career matches.</p>
                  </div>
                </div>
                <motion.button
                  type="button"
                  onClick={restartAssessment}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cc-body inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#4a72ba] bg-white px-5 py-3 text-sm font-bold text-[#2b55aa] shadow-[0_4px_12px_rgba(74,114,186,0.15)] transition hover:bg-[#f0f5ff] hover:-translate-y-0.5"
                >
                  <RefreshCw size={16} />
                  Restart Quest
                </motion.button>
              </motion.div>

              {/* Firebase Save Status */}
              {isFirebaseConfigured ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 flex items-center gap-3 rounded-xl border-2 px-4 py-3 sm:px-5 ${
                    saveState === "saved"
                      ? "border-emerald-200 bg-emerald-50"
                      : saveState === "error"
                      ? "border-red-200 bg-red-50"
                      : "border-cyan-200 bg-cyan-50"
                  }`}
                >
                  {saveState === "saving" ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-cyan-600" />
                      <p className="cc-body text-sm font-semibold text-cyan-700">Saving your results...</p>
                    </>
                  ) : saveState === "saved" ? (
                    <>
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      <p className="cc-body text-sm font-semibold text-emerald-700">Results saved successfully!</p>
                    </>
                  ) : saveState === "error" ? (
                    <>
                      <AlertCircle size={18} className="text-red-600" />
                      <p className="cc-body text-sm font-semibold text-red-700">Couldn't save: {saveError}</p>
                    </>
                  ) : null}
                </motion.div>
              ) : null}

              {/* Student Profile Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8 rounded-2xl border-2 border-[#ccdcff] bg-gradient-to-br from-[#f5f9ff] to-[#f0f5ff] p-5 sm:p-7"
              >
                <p className="cc-body mb-5 text-xs font-bold uppercase tracking-[0.15em] text-[#4a72ba]">Your Career Profile</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-xl border border-[#d8e4ff] bg-white/70 p-4 backdrop-blur-sm transition hover:shadow-[0_6px_16px_rgba(47,99,215,0.1)]"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#dde9ff] text-[#3060cc]">
                        <Activity size={18} />
                      </div>
                      <p className="cc-body text-xs font-bold uppercase tracking-[0.12em] text-[#4a72ba]">Work World</p>
                    </div>
                    <p className="cc-display text-2xl font-extrabold text-[#102a5d]">{result.studentProfile.dominant.ww}</p>
                    <p className="cc-body mt-2 text-xs text-[#5a7ba8]">Your ideal work environment</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border border-[#d8e4ff] bg-white/70 p-4 backdrop-blur-sm transition hover:shadow-[0_6px_16px_rgba(47,99,215,0.1)]"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#dde9ff] text-[#3060cc]">
                        <ShieldCheck size={18} />
                      </div>
                      <p className="cc-body text-xs font-bold uppercase tracking-[0.12em] text-[#4a72ba]">Thinking Style</p>
                    </div>
                    <p className="cc-display text-2xl font-extrabold text-[#102a5d]">{result.studentProfile.dominant.hw}</p>
                    <p className="cc-body mt-2 text-xs text-[#5a7ba8]">How you problem-solve</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-xl border border-[#d8e4ff] bg-white/70 p-4 backdrop-blur-sm transition hover:shadow-[0_6px_16px_rgba(47,99,215,0.1)]"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#dde9ff] text-[#3060cc]">
                        <TrendingUp size={18} />
                      </div>
                      <p className="cc-body text-xs font-bold uppercase tracking-[0.12em] text-[#4a72ba]">Motivation</p>
                    </div>
                    <p className="cc-display text-2xl font-extrabold text-[#102a5d]">{result.studentProfile.dominant.mw}</p>
                    <p className="cc-body mt-2 text-xs text-[#5a7ba8]">What drives you</p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Top Matches Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="cc-body mb-4 inline-flex items-center gap-2 rounded-full border border-[#c9dcff] bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-[#4a72ba]">
                  <Star size={14} />
                  Top {result.topMatches.length} Reward Cards
                </p>
                <div className="grid gap-5">
                  {result.topMatches.map((match, index) => (
                    <motion.article
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + index * 0.1 }}
                      onClick={() => {
                        onOpenCluster?.(match.cluster);
                      }}
                      whileHover={{ scale: 1.01, y: -4 }}
                      className="group cursor-pointer overflow-hidden rounded-[26px] border-2 border-[#cddcff] bg-white p-5 shadow-[0_10px_28px_rgba(25,54,116,0.1)] transition hover:border-[#00a5b7] hover:shadow-[0_18px_46px_rgba(0,165,183,0.2)] sm:p-7"
                    >
                      {/* Match Header */}
                      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`cc-body inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r ${QUEST_THEME[index % QUEST_THEME.length]} px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-white shadow-md`}>
                              <Trophy size={13} />
                              Rank {index + 1}
                            </span>
                            <span className="cc-body text-xs font-bold uppercase tracking-[0.12em] text-[#7a8fb5]">
                              {match.cluster}
                            </span>
                          </div>
                          <h3 className="cc-display mt-3 text-2xl font-black text-[#102a5e] group-hover:text-[#00a5b7] transition">
                            {match.careerName}
                          </h3>
                          <p className="cc-body mt-2 text-sm leading-6 text-[#3f5e90]">{match.summary}</p>
                        </div>
                        <div className="shrink-0 rounded-2xl bg-gradient-to-br from-[#2f63d7] to-[#1f4ec4] px-5 py-4 text-center shadow-[0_8px_20px_rgba(47,99,215,0.25)]">
                          <p className="cc-body text-xs font-bold uppercase tracking-[0.12em] text-white/80">Match</p>
                          <p className="cc-display text-3xl font-black text-white">{Math.round(match.score)}%</p>
                        </div>
                      </div>

                      {/* Match Explanation */}
                      <p className="cc-body mt-5 border-t border-[#e0e8f5] pt-5 text-sm leading-6 text-[#29477f]">
                        {match.explanation}
                      </p>

                      {/* Reality Scorecard */}
                      <div className="mt-5 grid gap-3 rounded-xl border border-[#d8e4ff] bg-[#f8fbff] p-4 sm:grid-cols-4">
                        <div className="flex items-start gap-2 p-1">
                          <DollarSign size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                          <div className="flex-1">
                            <p className="cc-body text-[10px] font-bold uppercase tracking-[0.12em] text-[#5f80bd]">Money Score</p>
                            <div className="mt-2 flex items-baseline gap-1">
                              <p className="cc-display text-xl font-black text-[#15346d]">{match.realityScorecard.money}</p>
                              <p className="cc-body text-xs text-[#7a8fb5]">/10</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-1">
                          <TrendingUp size={16} className="mt-0.5 shrink-0 text-blue-500" />
                          <div className="flex-1">
                            <p className="cc-body text-[10px] font-bold uppercase tracking-[0.12em] text-[#5f80bd]">Growth Score</p>
                            <div className="mt-2 flex items-baseline gap-1">
                              <p className="cc-display text-xl font-black text-[#15346d]">{match.realityScorecard.growth}</p>
                              <p className="cc-body text-xs text-[#7a8fb5]">/10</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-1">
                          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-violet-500" />
                          <div className="flex-1">
                            <p className="cc-body text-[10px] font-bold uppercase tracking-[0.12em] text-[#5f80bd]">Stability</p>
                            <div className="mt-2 flex items-baseline gap-1">
                              <p className="cc-display text-xl font-black text-[#15346d]">{match.realityScorecard.stability}</p>
                              <p className="cc-body text-xs text-[#7a8fb5]">/10</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-1">
                          <Activity size={16} className="mt-0.5 shrink-0 text-amber-500" />
                          <div className="flex-1">
                            <p className="cc-body text-[10px] font-bold uppercase tracking-[0.12em] text-[#5f80bd]">Feasibility</p>
                            <div className="mt-2 flex items-baseline gap-1">
                              <p className="cc-display text-xl font-black text-[#15346d]">{match.realityScorecard.feasibility}</p>
                              <p className="cc-body text-xs text-[#7a8fb5]">/10</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="mt-5 flex items-center gap-2 text-[#00a5b7] opacity-0 transition group-hover:opacity-100">
                        <span className="cc-body text-sm font-bold">Open reward path</span>
                        <ArrowRight size={16} />
                      </div>
                    </motion.article>
                  ))}
                </div>
              </motion.div>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="mt-10 text-center"
              >
                <p className="cc-body mb-4 text-sm text-[#5a7ba8]">Want to explore more careers or see different matches?</p>
                <motion.button
                  type="button"
                  onClick={restartAssessment}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cc-body inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2f63d7] to-[#1f4ec4] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(47,99,215,0.25)] transition hover:shadow-[0_12px_28px_rgba(47,99,215,0.35)] hover:-translate-y-0.5"
                >
                  <RefreshCw size={16} />
                  Replay Quest
                </motion.button>
              </motion.div>
            </div>
          ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
