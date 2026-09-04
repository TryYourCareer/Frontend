import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, ArrowRight, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getTestProgress, getTestQuestions, startTestSession, submitQuestionAnswer, submitTestSession, saveOnboardingProfile } from "../services/discoveryTest";

const LOGO_BLUE = "#5B7EC9";
const LOGO_DARK = "#3D1F08";
const LOGO_MID = "#7B4A28";
const LOGO_TAN = "#B8712E";

const AVAILABLE_INTEREST_TAGS = [
  "Coding & AI",
  "Tech & Software",
  "Visual Design",
  "Media & Content",
  "Finance & Money",
  "Business & Sales",
  "Healthcare & Science",
  "Public Speaking & Law",
  "Gaming & Entertainment",
  "Leadership",
];


export default function Assessment() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [testSessionId, setTestSessionId] = useState(null);
  const [previousSessionId, setPreviousSessionId] = useState(() => {
    return localStorage.getItem("latest_test_session_id") || null;
  });

  // Stage 0 Onboarding Signals State
  const [grade, setGrade] = useState("Class 12");
  const [currentStream, setCurrentStream] = useState("Science (PCM)");
  const [interestTags, setInterestTags] = useState(["Coding & AI", "Visual Design"]);
  const [declaredAspiration, setDeclaredAspiration] = useState("");
  const [learningStyle, setLearningStyle] = useState("Hands-on");

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState("instructions");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const savesRef = useRef(new Map());

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? (answers[currentQuestion.question_id] || "") : "";
  const totalQuestions = questions.length;
  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => Boolean(String(value || "").trim())).length,
    [answers]
  );
  const displayedCount = Math.max(answeredCount, progress);

  const toggleInterestTag = (tag) => {
    setInterestTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleStartTest = () => {
    setStatus("onboarding");
  };

  const handleProceedFromOnboarding = async () => {
    if (!profile?.id) {
      setError("Your profile is not ready yet. Please complete registration first.");
      setStatus("error");
      return;
    }
    setStatus("starting session");
    setError("");
    try {
      // Save Stage 0 Onboarding Signals
      await saveOnboardingProfile({
        user_id: profile.id,
        grade,
        current_stream: currentStream,
        interest_tags: interestTags,
        declared_aspiration: declaredAspiration,
        learning_style: learningStyle,
      });

      // Start Session
      const session = await startTestSession(profile.id);
      setTestSessionId(session.test_session_id);
      localStorage.setItem("latest_test_session_id", session.test_session_id);
      setPreviousSessionId(session.test_session_id);
      setStatus("loading questions");

      const questionsPayload = await getTestQuestions(session.test_session_id);
      setQuestions(questionsPayload.questions || []);
      setStatus("ready");
    } catch (err) {
      setError(err.message || "Unable to start discovery test.");
      setStatus("error");
    }
  };

  useEffect(() => {
    async function fetchProgress() {
      if (!testSessionId) return;
      try {
        const progressPayload = await getTestProgress(testSessionId);
        setProgress(progressPayload.answered_questions?.length ?? 0);
      } catch {
        // ignore progress fetch failure
      }
    }
    fetchProgress();
  }, [testSessionId]);

  const handleAnswer = (optionId) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.question_id]: optionId }));
  };

  const handleTextAnswerChange = (value) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.question_id]: value }));
  };

  const handleNext = async () => {
    if (!currentQuestion || !currentAnswer?.trim() || !testSessionId) return;
    setError("");

    const questionId = currentQuestion.question_id;
    // Launch save in background
    const savePromise = submitQuestionAnswer({
      testSessionId,
      questionId,
      selectedOptionId: currentQuestion.question_type === "open_text" ? null : currentAnswer,
      responseText: currentQuestion.question_type === "open_text" ? currentAnswer.trim() : null,
      responseTimeMs: null,
    }).then((res) => {
      savesRef.current.delete(questionId);
      return res;
    }).catch((err) => {
      savesRef.current.delete(questionId);
      setError("Some answers failed to save in background. Please check connection.");
      throw err;
    });

    savesRef.current.set(questionId, savePromise);

    // Optimistically update progress and advance index
    setProgress((prev) => Math.max(prev, answeredCount));

    if (currentIndex === totalQuestions - 1) {
      setIsSubmitting(true);
      try {
        // Wait for all background saves to finish
        await Promise.all(savesRef.current.values());
        setStatus("analyzing");
        await submitTestSession(testSessionId);
        setTimeout(() => {
          setStatus("completed");
          if (testSessionId) {
            navigate(`/career-report/${testSessionId}`);
          }
        }, 1500);
      } catch (err) {
        setError(err.message || "Failed to save all answers or submit test.");
        setIsSubmitting(false);
      }
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
  };

  if (status === "instructions") {
    return (
      <div className="min-h-screen bg-[#FAF6EC] px-6 py-12 text-slate-800 text-left">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span
              className="inline-flex w-fit items-center rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest uppercase border"
              style={{ borderColor: LOGO_BLUE, color: LOGO_BLUE, backgroundColor: "#EEF2FB" }}
            >
              DISCOVERY RUN
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-2">
              Start Your Career Discovery
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              This interactive assessment is designed to map your core strengths, interests, and logic styles to real-world career trajectories.
            </p>
          </div>

          {previousSessionId && (
            <div className="border border-[#7B4A28]/30 bg-[#7B4A28]/5 rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-[#7B4A28] font-bold text-xs uppercase tracking-wider">
                <Sparkles size={16} />
                <span>Completed Career Discovery Report Available</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                You have a previously calculated 6D RIASEC Career Fit Report. You can view your existing matches or retake the assessment test below.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => navigate(`/career-report/${previousSessionId}`)}
                  className="px-5 py-2.5 bg-[#7B4A28] hover:bg-[#633a1f] text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2"
                >
                  <span>View Latest Career Fit Report</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-[#e2d9c8] bg-[#FAF6EC]/40 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Duration</span>
              <p className="text-sm font-bold text-slate-800">10 – 15 Minutes</p>
            </div>
            <div className="border border-[#e2d9c8] bg-[#FAF6EC]/40 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Interactive Questions</span>
              <p className="text-sm font-bold text-slate-800">Multiple choice & open-text brief</p>
            </div>
          </div>

          <div className="space-y-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Rules & Tips</h3>
            <ul className="space-y-2.5 text-xs text-slate-650">
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: LOGO_TAN }} />
                <span>Answer naturally and honestly. There are no right or wrong answers.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: LOGO_BLUE }} />
                <span>You can go back to review or modify previous answers using the "Previous" action.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: LOGO_MID }} />
                <span>Ensure you are in a quiet environment to complete the session without interruptions.</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-[#e2d9c8] bg-white px-5 py-2.5 text-xs font-bold text-slate-650 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            {previousSessionId ? (
              <>
                <button
                  onClick={() => navigate(`/career-report/${previousSessionId}`)}
                  className="rounded-xl text-white px-6 py-2.5 text-xs font-bold transition shadow-sm flex items-center gap-2"
                  style={{ backgroundColor: LOGO_MID }}
                >
                  <span>View Career Fit Report</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={handleStartTest}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Retake Assessment Test
                </button>
              </>
            ) : (
              <button
                onClick={handleStartTest}
                className="rounded-xl text-white px-6 py-2.5 text-xs font-bold transition shadow-sm"
                style={{ backgroundColor: LOGO_DARK }}
              >
                Start Discovery Session
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === "onboarding") {
    return (
      <div className="min-h-screen bg-[#FAF6EC] px-6 py-12 text-slate-800 text-left">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <div className="border-b border-slate-200 pb-4 space-y-2">
            <span
              className="inline-flex w-fit items-center rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest uppercase border"
              style={{ borderColor: LOGO_BLUE, color: LOGO_BLUE, backgroundColor: "#EEF2FB" }}
            >
              STAGE 0 — ONBOARDING SIGNALS
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              Tell Us About Yourself
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              These initial context signals set your baseline 6D RIASEC priors before question scoring.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2d9c8] shadow-sm space-y-6">
            {/* Grade & Stream */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Current Education Grade</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white p-3 text-xs font-semibold text-slate-800 outline-none focus:border-slate-800"
                >
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                  <option value="UG Year 1-2">Undergraduate (Year 1–2)</option>
                  <option value="UG Year 3-4">Undergraduate (Year 3–4)</option>
                  <option value="Working Professional">Working Professional</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Current Academic Stream</label>
                <select
                  value={currentStream}
                  onChange={(e) => setCurrentStream(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white p-3 text-xs font-semibold text-slate-800 outline-none focus:border-slate-800"
                >
                  <option value="Science (PCM)">Science (PCM - Math)</option>
                  <option value="Science (PCB)">Science (PCB - Medical)</option>
                  <option value="Commerce">Commerce & Business</option>
                  <option value="Humanities">Humanities & Arts</option>
                  <option value="Undecided">Undecided / Open</option>
                </select>
              </div>
            </div>

            {/* Interest Tags */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Select Your Top Domain Interests (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {AVAILABLE_INTEREST_TAGS.map((tag) => {
                  const isSelected = interestTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterestTag(tag)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#7B4A28] text-white border-[#7B4A28] shadow-sm"
                          : "bg-stone-50 text-slate-700 border-stone-200 hover:border-slate-400"
                      }`}
                    >
                      {isSelected && <Check size={13} />}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Declared Aspiration */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Declared Aspiration (Optional)
              </label>
              <input
                type="text"
                value={declaredAspiration}
                onChange={(e) => setDeclaredAspiration(e.target.value)}
                placeholder="e.g., Software Engineer, AI Researcher, Product Manager..."
                className="w-full rounded-xl border border-stone-300 bg-white p-3.5 text-xs text-slate-800 outline-none focus:border-slate-800"
              />
              <p className="text-[11px] text-slate-400">What career field do you currently think you want to pursue?</p>
            </div>

            {/* Learning Style */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Preferred Learning & Working Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {["Hands-on", "Reading & Research", "Team Projects", "Independent"].map((style) => {
                  const isSelected = learningStyle === style;
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setLearningStyle(style)}
                      className={`p-3 rounded-xl text-xs font-bold border transition text-center ${
                        isSelected
                          ? "border-[#7B4A28] bg-[#FAF2DB]/80 text-[#7B4A28]"
                          : "border-stone-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setStatus("instructions")}
              className="rounded-xl border border-[#e2d9c8] bg-white px-5 py-2.5 text-xs font-bold text-slate-650 hover:bg-slate-50 transition"
            >
              Back to Instructions
            </button>
            <button
              onClick={handleProceedFromOnboarding}
              className="rounded-xl text-white px-7 py-3 text-xs font-bold transition shadow-sm flex items-center gap-2"
              style={{ backgroundColor: LOGO_DARK }}
            >
              <span>Continue to Assessment Questions</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }


  if (status === "analyzing") {
    return <AnalysisAnimation />;
  }

  if (status === "completed") {
    return (
      <div className="min-h-screen bg-[#FAF6EC] px-6 py-10 text-slate-800 text-left">
        <div className="mx-auto w-full max-w-6xl space-y-6">

          <span className="inline-flex items-center rounded-full border border-emerald-600 bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase text-emerald-700">
            ASSESSMENT COMPLETE
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">Your answers are saved</h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
            We’ve submitted your responses to our AI engine. Your matches and 6D RIASEC personality vectors are now calculated and updated.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate(testSessionId ? `/career-report/${testSessionId}` : "/dashboard")}
              className="rounded-xl bg-[#7B4A28] hover:bg-[#633a1f] px-6 py-3 text-xs font-bold text-white transition shadow-md flex items-center gap-2"
            >
              <span>View Your Career Fit Report</span>
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl bg-white border border-slate-300 hover:bg-slate-50 px-5 py-3 text-xs font-bold text-slate-700 transition shadow-sm"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#FAF6EC] px-6 py-10 flex items-center justify-center text-left">
        <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-900/5 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
          >
            <ArrowLeft size={13} /> Back
          </button>
          <p className="rounded-xl border border-red-100 bg-red-50/50 px-4 py-3 text-xs font-semibold text-red-700">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (status === "starting session" || status === "loading questions") {
    return (
      <div className="min-h-screen bg-[#FAF6EC] px-6 py-10 text-slate-800 text-left animate-pulse">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Top header bar skeleton */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-900/5 pb-4">
            <div className="h-9 w-20 bg-stone-200 rounded-md"></div>
            <div className="h-8 w-32 bg-stone-200 rounded-md"></div>
          </div>

          {/* Question Panel skeleton */}
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-900/5 pb-5">
              <div className="space-y-2.5 w-3/4">
                <div className="h-3 w-28 bg-stone-200 rounded-full"></div>
                <div className="h-6 bg-stone-200 rounded-md w-full"></div>
              </div>
              <div className="h-7 w-12 bg-stone-200 rounded-md"></div>
            </div>

            {/* Options block skeletons */}
            <div className="space-y-3">
              <div className="h-14 bg-white border border-stone-200 rounded-xl w-full"></div>
              <div className="h-14 bg-white border border-stone-200 rounded-xl w-full"></div>
              <div className="h-14 bg-white border border-stone-200 rounded-xl w-full"></div>
            </div>

            {/* Navigation skeletons */}
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-900/5 pt-5">
              <div className="h-9 w-24 bg-stone-200 rounded-md"></div>
              <div className="h-9 w-28 bg-stone-200 rounded-md"></div>
            </div>

            {/* Slider skeleton */}
            <div className="mt-5 rounded-xl border border-slate-900/5 bg-white p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-stone-200 rounded-full"></div>
                <div className="h-3 w-32 bg-stone-200 rounded-full"></div>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#FAF6EC] px-6 py-10 flex items-center justify-center text-left">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-900/5 bg-white p-8 text-center shadow-sm space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-900/5 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
          >
            <ArrowLeft size={13} /> Back
          </button>
          <p className="text-xs text-slate-500">No questions were loaded. Try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EC] px-6 py-10 text-slate-800 text-left">
      <div className="mx-auto max-w-6xl space-y-8">



        {/* Question Panel */}
        <div key={currentIndex} className="space-y-6 animate-question-slide">

          <div className="flex items-start justify-between gap-4 border-b border-slate-900/5 pb-5">
            <div className="space-y-1.5">
              <span className="inline-flex items-center rounded-full border border-slate-800 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase text-slate-800">
                {currentIndex < 10 ? "PART 1: SCENARIO CHOICE" : "PART 2: STAGE 2 REFLECTION"}
              </span>
              <h2 className="text-xl font-serif font-bold text-slate-900 leading-tight">{currentQuestion.question_text}</h2>
            </div>
            <div className="rounded-md bg-[#FAF2DB] px-3 py-1.5 text-xs font-bold text-slate-800">
              Q{currentIndex + 1}/{totalQuestions}
            </div>
          </div>

          {progress ? (
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Completed Answers: {progress} / {totalQuestions}
            </p>
          ) : null}

          {/* Options block */}
          <div className="space-y-3">
            {currentQuestion.question_type === "open_text" ? (
              <div className="space-y-2">
                <textarea
                  value={currentAnswer || ""}
                  onChange={(event) => handleTextAnswerChange(event.target.value)}
                  placeholder="Type your response here..."
                  rows={5}
                  className="w-full rounded-xl border border-stone-200 bg-white px-5 py-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-stone-200/50 focus:border-stone-900"
                />
                {currentAnswer && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleTextAnswerChange("")}
                      className="text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors"
                    >
                      Clear text
                    </button>
                  </div>
                )}
              </div>
            ) : (
              currentQuestion.options.map((option) => {
                const isSelected = currentAnswer === option.option_id;
                const optionText = option.option_text || option.text || option.label || "Unnamed option";
                return (
                  <button
                    key={option.option_id}
                    onClick={() => handleAnswer(option.option_id)}
                    className={`w-full rounded-xl border px-5 py-4 text-left transition flex items-center gap-3.5 group cursor-pointer ${
                      isSelected
                        ? "border-[#7B4A28] bg-[#FAF2DB]/90 text-slate-900 font-semibold shadow-sm"
                        : "border-stone-200 bg-white hover:bg-slate-50/70 hover:border-slate-300 text-slate-800"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? "border-[#7B4A28] bg-[#7B4A28]"
                          : "border-slate-300 bg-white group-hover:border-slate-400"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <p className="text-sm leading-relaxed flex-1">{optionText}</p>
                  </button>
                );
              })
            )}
          </div>

          {error ? (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          {/* Navigation Controls */}
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-900/5 pt-5">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-900/5 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={13} /> Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!currentAnswer?.trim() || isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#0b1a36] hover:bg-[#122b59] px-4 py-2.5 text-xs font-bold text-white transition shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : currentIndex === totalQuestions - 1 ? "Submit Test" : "Next Question"}
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Progress Slider */}
          <div className="mt-5 rounded-xl border border-slate-900/5 bg-white p-4 text-xs text-slate-500 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Overall Progress</span>
              <span>
                Answered {displayedCount} of {totalQuestions}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#0b1a36]"
                style={{ width: `${(displayedCount / Math.max(totalQuestions, 1)) * 100}%` }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function AnalysisAnimation() {
  const [step, setStep] = useState(0);
  const stages = [
    "Analyzing your DNA responses...",
    "Correlating matching career profiles...",
    "Scanning all 70+ available career paths...",
    "Generating personalized dashboard matches...",
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 700);
    const timer2 = setTimeout(() => setStep(2), 1400);
    const timer3 = setTimeout(() => setStep(3), 2100);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6EC] px-6 py-4 flex items-center justify-center text-slate-800 text-left">
      <div className="mx-auto w-full max-w-6xl space-y-2">
        {/* Full-width hiring.svg container */}
        <div className="flex items-center justify-center p-4 max-w-full h-72 overflow-hidden relative">
          <img
            src="/hiring.svg"
            alt="Fetching Analysis"
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Text Loader updates */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 pt-4">
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-[#e2d9c8] opacity-20"></div>
            {/* <div className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin" style={{ borderLeftColor: LOGO_BLUE }}></div> */}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Generating Your Career Matrix
            </h2>
            <p className="text-xs text-slate-500 font-medium h-4 transition-all duration-300">
              {stages[step]}
            </p>
          </div>

          {/* Simple progress track */}
          <div className="w-full max-w-md space-y-2 pt-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${(step + 1) * 25}%`,
                  backgroundColor: LOGO_BLUE
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
              <span>Mapping Capabilities</span>
              <span>{Math.round(((step + 1) * 25))}% Complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

