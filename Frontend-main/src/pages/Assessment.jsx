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
    <section className="min-h-screen w-full bg-[#f8fafc] px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white px-6 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-10">
          <div className="absolute right-10 top-10 h-28 w-28 rounded-full bg-[#dbe4ff] opacity-60 blur-3xl"></div>
          <div className="absolute left-8 top-36 h-24 w-24 rounded-[28px] bg-[#ede7ff] opacity-70 blur-2xl"></div>

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#2563eb]">Assessment</p>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">Career Discovery Engine</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Answer all 13 questions. Your results are generated inside this same section.</p>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back
            </button>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.95fr]">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_15px_40px_rgba(15,23,42,0.06)]">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#1d4ed8] font-semibold">13</div>
                  <p className="mt-4 text-sm font-semibold text-slate-950">13 Questions</p>
                  <p className="mt-2 text-sm text-slate-500">Comprehensive</p>
                </div>
                <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_15px_40px_rgba(15,23,42,0.06)]">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0fdf4] text-[#15803d] font-semibold">5</div>
                  <p className="mt-4 text-sm font-semibold text-slate-950">5 Minutes</p>
                  <p className="mt-2 text-sm text-slate-500">Estimated Time</p>
                </div>
                <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_15px_40px_rgba(15,23,42,0.06)]">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5f3ff] text-[#7c3aed] font-semibold">270</div>
                  <p className="mt-4 text-sm font-semibold text-slate-950">270 Careers</p>
                  <p className="mt-2 text-sm text-slate-500">Real Database</p>
                </div>
              </div>

              <div className="mt-6 rounded-[28px] border border-slate-200 bg-[#f8fbff] p-6 shadow-[0_20px_40px_rgba(15,23,42,0.06)]">
                <div className="rounded-[24px] border border-[#d8e9ff] bg-white p-6 shadow-sm">
                  <p className="text-sm leading-7 text-slate-700">
                    This is not a test. There are no right answers, no ideal score, and no result that is better than another. Answer honestly, and your first reaction is usually the best one.
                  </p>
                </div>

                <div className="mt-8 rounded-[28px] bg-white p-6 shadow-[0_18px_35px_rgba(15,23,42,0.05)]">
                  <p className="text-lg font-semibold text-slate-950">Three things to keep in mind</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl border border-[#e2e8f0] bg-[#f8fafc] p-4 text-sm text-slate-600">
                      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#e0efff] text-[#2563eb]">✓</div>
                      Pick the option that feels most true right now.
                    </div>
                    <div className="rounded-3xl border border-[#e2e8f0] bg-[#fdf2fe] p-4 text-sm text-slate-600">
                      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#f5e0ff] text-[#7c3aed]">❤️</div>
                      Go with your gut on the first read.
                    </div>
                    <div className="rounded-3xl border border-[#e2e8f0] bg-[#f8fafc] p-4 text-sm text-slate-600">
                      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#0f172a]">⭐</div>
                      There is no ideal result.
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[24px] border border-[#e2e8f0] bg-[#f9fafb] p-5 text-sm leading-6 text-slate-600">
                  Every combination of answers leads somewhere interesting. What matters is finding career directions that fit your values, energy, and long-term goals.
                </div>
              </div>
            </div>

            <div className="relative rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
              <div className="absolute right-6 top-6 h-16 w-16 rounded-full bg-[#eef4ff] opacity-80"></div>
              <div className="absolute -right-10 bottom-8 h-14 w-14 rounded-full bg-[#f5e8ff] opacity-80"></div>
              <h2 className="text-2xl font-bold text-slate-950">What You'll Get</h2>
              <div className="mt-6 space-y-4 text-slate-600">
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

              <div className="mt-8 rounded-[24px] border border-[#e2e8f0] bg-[#f8fafc] p-5 text-sm leading-6 text-slate-600">
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
