import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import {
  getTestProgress,
  getTestQuestions,
  startTestSession,
  submitQuestionAnswer,
  submitTestSession,
} from "../services/discoveryTest";

const BRAND_BLUE = "#1E88E5";
const ACCENT_BLUE = "#38BDF8";

export default function Assessment() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [testSessionId, setTestSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState("instructions");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const savesRef = useRef(new Map());

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.question_id] || "" : "";
  const totalQuestions = questions.length;
  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => Boolean(String(value || "").trim())).length,
    [answers]
  );
  const displayedCount = Math.max(answeredCount, progress);

  const handleStartTest = async () => {
    if (!profile?.id) {
      setError("Your profile is not ready yet. Please complete registration first.");
      setStatus("error");
      return;
    }
    setStatus("starting session");
    setError("");
    try {
      const session = await startTestSession(profile.id);
      setTestSessionId(session.test_session_id);
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
    const savePromise = submitQuestionAnswer({
      testSessionId,
      questionId,
      selectedOptionId: currentQuestion.question_type === "open_text" ? null : currentAnswer,
      responseText: currentQuestion.question_type === "open_text" ? currentAnswer.trim() : null,
      responseTimeMs: null,
    })
      .then((res) => {
        savesRef.current.delete(questionId);
        return res;
      })
      .catch((err) => {
        savesRef.current.delete(questionId);
        setError("Some answers failed to save in background. Please check connection.");
        throw err;
      });

    savesRef.current.set(questionId, savePromise);
    setProgress((prev) => Math.max(prev, answeredCount));

    if (currentIndex === totalQuestions - 1) {
      setIsSubmitting(true);
      try {
        await Promise.all(savesRef.current.values());
        setStatus("analyzing");
        await submitTestSession(testSessionId);
        setTimeout(() => {
          setStatus("completed");
        }, 3000);
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
      <div className="min-h-screen bg-gradient-to-br from-[#F4F8FC] via-[#EBF3FB] to-[#DFECF8] px-6 py-12 text-slate-800 text-left">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <div className="border-b border-[#D3E3F5] pb-4">
            <span
              className="inline-flex w-fit items-center rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest uppercase border border-[#1E88E5]/30 text-[#1E88E5] bg-[#EAF2FA]"
            >
              DISCOVERY RUN
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A] mt-2">
              Start Your Career Discovery
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              This interactive assessment is designed to map your core strengths, interests, and logic styles to real-world career trajectories.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-[#D3E3F5] bg-white/80 backdrop-blur-sm rounded-2xl p-4 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Duration</span>
              <p className="text-sm font-bold text-[#0F172A]">10 – 15 Minutes</p>
            </div>
            <div className="border border-[#D3E3F5] bg-white/80 backdrop-blur-sm rounded-2xl p-4 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Interactive Questions</span>
              <p className="text-sm font-bold text-[#0F172A]">Multiple choice & open-text brief</p>
            </div>
          </div>

          <div className="space-y-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Rules & Tips</h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 bg-[#1E88E5]" />
                <span>Answer naturally and honestly. There are no right or wrong answers.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 bg-[#38BDF8]" />
                <span>You can go back to review or modify previous answers using the "Previous" action.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 bg-[#0284C7]" />
                <span>Ensure you are in a quiet environment to complete the session without interruptions.</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-[#D3E3F5] flex flex-wrap gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-[#D3E3F5] bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#F0F6FC] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleStartTest}
              className="rounded-xl bg-[#1E88E5] hover:bg-[#1976D2] text-white px-6 py-2.5 text-xs font-bold transition shadow-sm shadow-[#1E88E5]/30"
            >
              Start Discovery Session
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
      <div className="min-h-screen bg-gradient-to-br from-[#F4F8FC] via-[#EBF3FB] to-[#DFECF8] px-6 py-10 text-slate-800 text-left">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <span className="inline-flex items-center rounded-full border border-emerald-600 bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase text-emerald-700">
            ASSESSMENT COMPLETE
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A] leading-tight">Your answers are saved</h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
            We’ve submitted your responses to our AI engine. Your matches are now calculated and updated.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 rounded-xl bg-[#1E88E5] hover:bg-[#1976D2] px-6 py-2.5 text-xs font-bold text-white transition shadow-md shadow-[#1E88E5]/25"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F8FC] via-[#EBF3FB] to-[#DFECF8] px-6 py-10 flex items-center justify-center text-left">
        <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 rounded-md bg-white border border-[#D3E3F5] px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-[#F0F6FC] transition"
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
      <div className="min-h-screen bg-gradient-to-br from-[#F4F8FC] via-[#EBF3FB] to-[#DFECF8] px-6 py-10 text-slate-800 text-left animate-pulse">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex items-center justify-between gap-4 border-b border-[#D3E3F5] pb-4">
            <div className="h-9 w-20 bg-[#D3E3F5]/60 rounded-md"></div>
            <div className="h-8 w-32 bg-[#D3E3F5]/60 rounded-md"></div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-[#D3E3F5] pb-5">
              <div className="space-y-2.5 w-3/4">
                <div className="h-3 w-28 bg-[#D3E3F5]/60 rounded-full"></div>
                <div className="h-6 bg-[#D3E3F5]/60 rounded-md w-full"></div>
              </div>
              <div className="h-7 w-12 bg-[#D3E3F5]/60 rounded-md"></div>
            </div>

            <div className="space-y-3">
              <div className="h-14 bg-white/80 border border-[#D3E3F5] rounded-xl w-full"></div>
              <div className="h-14 bg-white/80 border border-[#D3E3F5] rounded-xl w-full"></div>
              <div className="h-14 bg-white/80 border border-[#D3E3F5] rounded-xl w-full"></div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#D3E3F5] pt-5">
              <div className="h-9 w-24 bg-[#D3E3F5]/60 rounded-md"></div>
              <div className="h-9 w-28 bg-[#D3E3F5]/60 rounded-md"></div>
            </div>

            <div className="mt-5 rounded-xl border border-[#D3E3F5] bg-white/80 p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-[#D3E3F5]/60 rounded-full"></div>
                <div className="h-3 w-32 bg-[#D3E3F5]/60 rounded-full"></div>
              </div>
              <div className="h-1.5 bg-[#EAF2FA] rounded-full w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F8FC] via-[#EBF3FB] to-[#DFECF8] px-6 py-10 flex items-center justify-center text-left">
        <div className="mx-auto max-w-md rounded-2xl border border-[#D3E3F5] bg-white p-8 text-center shadow-sm space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 rounded-md bg-white border border-[#D3E3F5] px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-[#F0F6FC] transition"
          >
            <ArrowLeft size={13} /> Back
          </button>
          <p className="text-xs text-slate-500">No questions were loaded. Try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8FC] via-[#EBF3FB] to-[#DFECF8] px-6 py-10 text-slate-800 text-left">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.question_id || currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#D3E3F5] pb-5">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center rounded-full border border-[#1E88E5]/30 bg-[#EAF2FA] px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase text-[#1E88E5]">
                    DISCOVERY QUESTION
                  </span>
                  <h2 className="text-xl font-serif font-bold text-[#0F172A] leading-tight">
                    {currentQuestion.question_text}
                  </h2>
                </div>
                <div className="rounded-md bg-[#EAF2FA] border border-[#1E88E5]/20 px-3 py-1.5 text-xs font-bold text-[#1E88E5] shrink-0">
                  Q{currentIndex + 1}/{totalQuestions}
                </div>
              </div>

              {progress ? (
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Completed Answers: {progress} / {totalQuestions}
                </p>
              ) : null}

              <div className="space-y-3">
                {currentQuestion.question_type === "open_text" ? (
                  <div className="space-y-2">
                    <textarea
                      value={currentAnswer || ""}
                      onChange={(event) => handleTextAnswerChange(event.target.value)}
                      placeholder="Type your response here..."
                      rows={5}
                      className="w-full rounded-xl border border-[#D3E3F5] bg-white px-5 py-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5]"
                    />
                    {currentAnswer && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleTextAnswerChange("")}
                          className="text-xs text-slate-500 hover:text-[#1E88E5] font-bold transition-colors"
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
                        className={`w-full rounded-xl border px-5 py-4 text-left transition shadow-sm ${
                          isSelected
                            ? "border-[#1E88E5] bg-[#EAF2FA] text-[#1E88E5] font-bold shadow-[#1E88E5]/10"
                            : "border-[#D3E3F5] bg-white text-slate-800 hover:bg-[#F0F6FC] hover:border-[#B6D5F2]"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{optionText}</p>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {error ? (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#D3E3F5] pt-5">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D3E3F5] bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#F0F6FC] transition shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={13} /> Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!currentAnswer?.trim() || isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E88E5] hover:bg-[#1976D2] px-5 py-2.5 text-xs font-bold text-white transition shadow-sm shadow-[#1E88E5]/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : currentIndex === totalQuestions - 1 ? "Submit Test" : "Next Question"}
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-[#D3E3F5] bg-white/90 p-4 text-xs text-slate-500 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Overall Progress</span>
              <span>
                Answered {displayedCount} of {totalQuestions}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#EAF2FA]">
              <div
                className="h-full rounded-full bg-[#1E88E5] transition-all duration-300"
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
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8FC] via-[#EBF3FB] to-[#DFECF8] px-6 py-4 flex items-center justify-center text-slate-800 text-left">
      <div className="mx-auto w-full max-w-6xl space-y-2">
        <div className="flex items-center justify-center p-4 max-w-full h-72 overflow-hidden relative">
          <img
            src="/hiring.svg"
            alt="Fetching Analysis"
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div className="flex flex-col items-center justify-center text-center space-y-4 pt-4">
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-[#D3E3F5]"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-transparent border-[#1E88E5] animate-spin"></div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-[#0F172A]">
              Generating Your Career Matrix
            </h2>
            <p className="text-xs text-slate-500 font-medium h-4 transition-all duration-300">
              {stages[step]}
            </p>
          </div>

          <div className="w-full max-w-md space-y-2 pt-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-[#EAF2FA] border border-[#D3E3F5]">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out bg-[#1E88E5]"
                style={{
                  width: `${(step + 1) * 25}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
              <span>Mapping Capabilities</span>
              <span>{Math.round((step + 1) * 25)}% Complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}