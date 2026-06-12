import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ASSESSMENT_QUESTIONS, evaluateAssessment } from "../utils/matchingEngine";
import { db, isFirebaseConfigured } from "../firebaseConfig";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";
const API_TIMEOUT_MS = 3000;
const CSV_TIMEOUT_MS = 8000;

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

  const handleSelectOption = (optionKey) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionKey,
    }));
  };

  const saveAssessmentToFirebase = async (computedResult, selectedAnswers) => {
    if (!isFirebaseConfigured || !db) {
      return;
    }

    try {
      setSaveState("saving");
      setSaveError("");

      await addDoc(collection(db, "assessments"), {
        userId: user?.uid || null,
        userEmail: user?.email || null,
        answers: selectedAnswers,
        studentProfile: computedResult.studentProfile,
        topMatches: computedResult.topMatches,
        createdAt: serverTimestamp(),
      });

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
      void saveAssessmentToFirebase(computed, answers);
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
    <section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_#eef4ff_0%,_#d6e5ff_42%,_#c9ddff_100%)] px-4 py-6 sm:px-8 sm:py-9">
      <div className="mx-auto w-full max-w-6xl rounded-[32px] border border-[#c2d5fb] bg-white/80 p-6 shadow-[0_22px_60px_rgba(43,90,186,0.18)] backdrop-blur sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="cc-body text-sm font-semibold uppercase tracking-[0.18em] text-[#3f6fce]">Assessment</p>
            <h1 className="cc-display mt-1 text-3xl font-black text-[#0c1e4f] sm:text-4xl">Career Discovery Engine</h1>
            <p className="cc-body mt-2 text-sm text-[#41608e] sm:text-base">Answer all 13 questions. Your results are generated inside this same section.</p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="cc-body rounded-xl border border-[#b8cbf7] bg-[#edf3ff] px-4 py-2 text-sm font-bold text-[#234b9f] transition hover:bg-[#e0ebff]"
          >
            Back
          </button>
        </div>

        {isLoadingCareers ? (
          <div className="mt-8 rounded-2xl border border-[#ccdcff] bg-[#f4f8ff] p-6 text-center">
            <p className="cc-body text-lg font-semibold text-[#2e5ec6]">Loading careers dataset...</p>
          </div>
        ) : null}

        {loadError ? (
          <div className="mt-8 rounded-2xl border border-[#f4b1b1] bg-[#ffe9e9] p-5 text-sm font-semibold text-[#9f2f2f]">{loadError}</div>
        ) : null}

        {!isLoadingCareers && !loadError && !result ? (
          <div className="mt-8">
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[#365c9c]">
                <span className="cc-body">{currentQuestion.stage}</span>
                <span className="cc-body">Question {questionIndex + 1} / {ASSESSMENT_QUESTIONS.length}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-[#dce8ff]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#376dde] to-[#00a5b7] transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <h2 className="cc-display text-2xl font-extrabold leading-tight text-[#10254f] sm:text-[2rem]">{currentQuestion.prompt}</h2>

            <div className="mt-6 grid gap-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOption === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleSelectOption(option.key)}
                    className={`group rounded-2xl border px-4 py-4 text-left transition sm:px-5 ${
                      isSelected
                        ? "border-[#2f63d7] bg-[#edf3ff] shadow-[0_10px_22px_rgba(47,99,215,0.2)]"
                        : "border-[#d5e0f8] bg-white hover:border-[#7fa4ee] hover:bg-[#f5f9ff]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 grid h-7 w-7 place-items-center rounded-full text-xs font-black ${
                          isSelected ? "bg-[#2f63d7] text-white" : "bg-[#e8effe] text-[#4069b7]"
                        }`}
                      >
                        {option.key}
                      </span>
                      <span className="cc-body text-sm font-semibold leading-6 text-[#143167] sm:text-base">{option.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={questionIndex === 0}
                className="cc-body rounded-xl border border-[#c7d7fb] bg-white px-4 py-2 text-sm font-bold text-[#345ca7] transition disabled:cursor-not-allowed disabled:opacity-45 hover:bg-[#f3f7ff]"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!selectedOption}
                className="cc-body rounded-xl bg-[#2f63d7] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#2658c7] disabled:cursor-not-allowed disabled:bg-[#8ea7dd]"
              >
                {questionIndex === ASSESSMENT_QUESTIONS.length - 1 ? "See My Matches" : "Next"}
              </button>
            </div>
          </div>
        ) : null}

        {!isLoadingCareers && !loadError && result ? (
          <div className="mt-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="cc-display text-2xl font-black text-[#0f2552] sm:text-3xl">Career Match Results</h2>
              <button
                type="button"
                onClick={restartAssessment}
                className="cc-body rounded-xl border border-[#b9cdf8] bg-[#eef4ff] px-4 py-2 text-sm font-bold text-[#2b55aa] transition hover:bg-[#e2ecff]"
              >
                Retake Assessment
              </button>
            </div>

            {isFirebaseConfigured ? (
              <div className="mb-4 rounded-xl border border-[#d6e4ff] bg-[#f4f8ff] px-4 py-3">
                {saveState === "saving" ? (
                  <p className="cc-body text-sm font-semibold text-[#2d5dbf]">Saving assessment to Firebase...</p>
                ) : null}
                {saveState === "saved" ? (
                  <p className="cc-body text-sm font-semibold text-[#226a3f]">Assessment saved to Firebase successfully.</p>
                ) : null}
                {saveState === "error" ? (
                  <p className="cc-body text-sm font-semibold text-[#9b2d2d]">Could not save assessment to Firebase: {saveError}</p>
                ) : null}
              </div>
            ) : null}

            <div className="mb-6 grid gap-3 rounded-2xl border border-[#ccdcff] bg-[#f5f9ff] p-4 sm:grid-cols-3">
              <div>
                <p className="cc-body text-xs font-bold uppercase tracking-[0.14em] text-[#4a72ba]">Work World</p>
                <p className="cc-display mt-1 text-lg font-extrabold text-[#102a5d]">{result.studentProfile.dominant.ww}</p>
              </div>
              <div>
                <p className="cc-body text-xs font-bold uppercase tracking-[0.14em] text-[#4a72ba]">Thinking Style</p>
                <p className="cc-display mt-1 text-lg font-extrabold text-[#102a5d]">{result.studentProfile.dominant.hw}</p>
              </div>
              <div>
                <p className="cc-body text-xs font-bold uppercase tracking-[0.14em] text-[#4a72ba]">Motivation</p>
                <p className="cc-display mt-1 text-lg font-extrabold text-[#102a5d]">{result.studentProfile.dominant.mw}</p>
              </div>
            </div>

            <div className="grid gap-4">
              {result.topMatches.map((match, index) => (
                <article
                  key={match.id}
                  onClick={() => {
                    onOpenCluster?.(match.cluster);
                  }}
                  className="cursor-pointer rounded-2xl border border-[#cddcff] bg-white p-5 shadow-[0_8px_24px_rgba(25,54,116,0.1)] transition hover:shadow-[0_12px_32px_rgba(25,54,116,0.2)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="cc-body text-xs font-bold uppercase tracking-[0.15em] text-[#4b74be]">Match #{index + 1} • {match.cluster}</p>
                      <h3 className="cc-display mt-1 text-xl font-black text-[#102a5e]">{match.careerName}</h3>
                      <p className="cc-body mt-1 text-sm text-[#3f5e90]">{match.summary}</p>
                    </div>
                    <div className="rounded-xl bg-[#edf4ff] px-4 py-2 text-center">
                      <p className="cc-body text-xs font-bold uppercase tracking-[0.12em] text-[#4870ba]">Match</p>
                      <p className="cc-display text-2xl font-black text-[#1a4eb0]">{Math.round(match.score)}%</p>
                    </div>
                  </div>

                  <p className="cc-body mt-3 text-sm text-[#29477f]">{match.explanation}</p>

                  <div className="mt-4 grid gap-2 rounded-xl border border-[#d8e4ff] bg-[#f8fbff] p-3 sm:grid-cols-4">
                    <div>
                      <p className="cc-body text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f80bd]">Money</p>
                      <p className="cc-display text-lg font-black text-[#15346d]">{match.realityScorecard.money}/10</p>
                    </div>
                    <div>
                      <p className="cc-body text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f80bd]">Growth</p>
                      <p className="cc-display text-lg font-black text-[#15346d]">{match.realityScorecard.growth}/10</p>
                    </div>
                    <div>
                      <p className="cc-body text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f80bd]">Stability</p>
                      <p className="cc-display text-lg font-black text-[#15346d]">{match.realityScorecard.stability}/10</p>
                    </div>
                    <div>
                      <p className="cc-body text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f80bd]">Feasibility</p>
                      <p className="cc-display text-lg font-black text-[#15346d]">{match.realityScorecard.feasibility}/10</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
