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

export default function Assessment({ theme = "light", onBack, onOpenCluster, user = null }) {
  const isDark = theme === "dark";
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
  const [started, setStarted] = useState(false);

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
    setStarted(false);
  };

  const handleStartAssessment = () => {
    setStarted(true);
  };

  return (
    <section className={`min-h-screen w-full px-4 py-8 sm:px-8 sm:py-10 ${isDark ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"}`}>
      <div className="mx-auto max-w-6xl">
        <div className={`relative overflow-hidden rounded-[32px] border px-6 py-8 sm:px-10 sm:py-10 ${isDark ? "border-slate-700 bg-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.35)]" : "border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"}`}>
          <div className={`absolute right-10 top-10 h-28 w-28 rounded-full opacity-60 blur-3xl ${isDark ? "bg-slate-800" : "bg-[#dbe4ff]"}`}></div>
          <div className={`absolute left-8 top-36 h-24 w-24 rounded-[28px] opacity-70 blur-2xl ${isDark ? "bg-slate-800" : "bg-[#ede7ff]"}`}></div>

          <div className="relative flex flex-col gap-8">
            <div className="flex items-center justify-between gap-4">
              <p className={`text-xs font-semibold uppercase tracking-[0.32em] ${isDark ? "text-slate-400" : "text-[#2563eb]"}`}>Assessment</p>
              <button
                type="button"
                onClick={onBack}
                className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${isDark ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
              >
                Back
              </button>
            </div>

            <div className="max-w-3xl">
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Start your career discovery journey</h1>
              <p className={`mt-4 max-w-2xl text-base leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}>Answer all 13 questions. Your results are generated inside this same section.</p>
            </div>
          </div>

          <div className="mt-10 grid gap-6">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className={`rounded-[20px] border p-5 shadow-[0_15px_40px_rgba(15,23,42,0.06)] ${isDark ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white"}`}>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#1d4ed8] font-semibold">13</div>
                  <p className={`mt-4 text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-950"}`}>13 Questions</p>
                  <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Comprehensive</p>
                </div>
                <div className={`rounded-[20px] border p-5 shadow-[0_15px_40px_rgba(15,23,42,0.06)] ${isDark ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white"}`}>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0fdf4] text-[#15803d] font-semibold">5</div>
                  <p className={`mt-4 text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-950"}`}>5 Minutes</p>
                  <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Estimated Time</p>
                </div>
                <div className={`rounded-[20px] border p-5 shadow-[0_15px_40px_rgba(15,23,42,0.06)] ${isDark ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white"}`}>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5f3ff] text-[#7c3aed] font-semibold">270</div>
                  <p className={`mt-4 text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-950"}`}>270 Careers</p>
                  <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Real Database</p>
                </div>
              </div>

              <div className={`mt-6 rounded-[28px] border p-6 shadow-[0_20px_40px_rgba(15,23,42,0.06)] ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-[#f8fbff]"}`}>
                <div className={`rounded-[24px] border p-6 shadow-sm ${isDark ? "border-slate-700 bg-slate-950" : "border border-[#d8e9ff] bg-white"}`}>
                  <h2 className={`text-xl font-semibold ${isDark ? "text-slate-100" : "text-slate-950"}`}>Before You Begin</h2>
                  <p className={`mt-4 text-sm leading-7 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    This is not a test. There are no right answers, no scores to hack, and no result that is better than another. What this assessment does is ask you 17 carefully chosen questions about how you actually think, what genuinely interests you, and what kind of work feels meaningful—not what sounds impressive.
                  </p>
                  <p className={`mt-4 text-sm leading-7 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    The assessment consists of 14 multiple-choice questions and 3 short reflection questions, where you'll have the opportunity to express your thoughts in your own words.
                  </p>
                  <p className={`mt-4 text-sm leading-7 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Based on your answers, Try Your Career will recommend careers from our career database that match your natural thinking style, interests, and preferences—not just your subject scores or your family's expectations.
                  </p>
                </div>

                <div className={`mt-8 rounded-[28px] p-6 shadow-[0_18px_35px_rgba(15,23,42,0.05)] ${isDark ? "bg-slate-950" : "bg-white"}`}>
                  <p className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-slate-950"}`}>Three things to keep in mind</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className={`rounded-3xl border p-4 text-sm ${isDark ? "border-slate-700 bg-slate-900 text-slate-300" : "border border-[#e2e8f0] bg-[#f8fafc] text-slate-600"}`}>
                      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#e0efff] text-[#2563eb]">✓</div>
                      <p className="font-semibold text-slate-900">Pick the option that feels most true right now</p>
                      <p className="mt-2 text-[13px] leading-5 text-slate-600">Not the one that sounds smartest or that you think we want to hear. The more honest you are, the more useful the result.</p>
                    </div>
                    <div className={`rounded-3xl border p-4 text-sm ${isDark ? "border-slate-700 bg-slate-900 text-slate-300" : "border border-[#e2e8f0] bg-[#fdf2fe] text-slate-600"}`}>
                      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#f5e0ff] text-[#7c3aed]">❤️</div>
                      <p className="font-semibold text-slate-900">Go with your gut on the first read</p>
                      <p className="mt-2 text-[13px] leading-5 text-slate-600">Most people who overthink their answers end up with less accurate results. Your first instinct is usually the truest one.</p>
                    </div>
                    <div className={`rounded-3xl border p-4 text-sm ${isDark ? "border-slate-700 bg-slate-900 text-slate-300" : "border border-[#e2e8f0] bg-[#f8fafc] text-slate-600"}`}>
                      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#0f172a]">⭐</div>
                      <p className="font-semibold text-slate-900">There is no ideal result</p>
                      <p className="mt-2 text-[13px] leading-5 text-slate-600">Every combination of answers leads somewhere interesting. Wherever you land, there is a real career path waiting.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className={`relative rounded-[28px] border p-8 shadow-[0_20px_40px_rgba(15,23,42,0.08)] ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
              <div className={`absolute right-6 top-6 h-16 w-16 rounded-full opacity-80 ${isDark ? "bg-slate-800" : "bg-[#eef4ff]"}`}></div>
              <div className={`absolute -right-10 bottom-8 h-14 w-14 rounded-full opacity-80 ${isDark ? "bg-slate-800" : "bg-[#f5e8ff]"}`}></div>
              <h2 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-950"}`}>What You'll Get</h2>
              <div className={`mt-6 space-y-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#2563eb]">✓</span>
                  <div>
                    <p className="font-semibold text-slate-900">Personalized career pathways</p>
                    <p className="text-sm text-slate-500">Career matches tailored to your interests and strengths.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#f0fdf4] text-[#15803d]">✓</span>
                  <div>
                    <p className="font-semibold text-slate-900">Meaningful career recommendations</p>
                    <p className="text-sm text-slate-500">Options that feel realistic, inspiring, and relevant.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#faf5ff] text-[#7c3aed]">✓</span>
                  <div>
                    <p className="font-semibold text-slate-900">Clear next steps and confidence</p>
                    <p className="text-sm text-slate-500">See practical guidance and which careers fit your profile best.</p>
                  </div>
                </div>
              </div>

              <div className={`mt-8 rounded-[24px] p-5 text-sm leading-6 ${isDark ? "border border-slate-700 bg-slate-950 text-slate-400" : "border border-[#e2e8f0] bg-[#f8fafc] text-slate-600"}`}>
                Answer honestly and avoid overthinking. Your first response is usually the best one.
              </div>

              <button
                type="button"
                onClick={handleStartAssessment}
                className="mt-8 inline-flex w-full items-center justify-center rounded-3xl bg-[#2563eb] px-6 py-4 text-base font-semibold text-white shadow-[0_18px_45px_rgba(37,99,235,0.24)] transition hover:bg-[#1d4ed8]"
              >
                Start Assessment →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
