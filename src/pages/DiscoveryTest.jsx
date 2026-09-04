import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { startTestSession, getTestQuestions, submitQuestionAnswer, submitTestSession, getTestProgress } from "../services/discoveryTest";
import { useAuth } from "../contexts/AuthContext";

export default function DiscoveryTest() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [testSessionId, setTestSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const savesRef = useRef(new Map());
  const currentQuestion = questions[currentIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.question_id] : null;
  const totalQuestions = questions.length;

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const displayedCount = Math.max(answeredCount, progress);

  useEffect(() => {
    if (loading) return;
    if (!profile?.id) {
      setError("Your profile is not ready yet. Please complete registration first.");
      setStatus("error");
      return;
    }

    let mounted = true;

    async function init() {
      setStatus("starting session");
      setError("");
      try {
        const session = await startTestSession(profile.id);
        if (!mounted) return;
        setTestSessionId(session.test_session_id);
        setStatus("loading questions");

        const questionsPayload = await getTestQuestions(session.test_session_id);
        if (!mounted) return;
        setQuestions(questionsPayload.questions || []);
        setStatus("ready");
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unable to start discovery test.");
        setStatus("error");
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, [profile, loading]);

  useEffect(() => {
    async function fetchProgress() {
      if (!testSessionId) return;
      try {
        const progressPayload = await getTestProgress(testSessionId);
        const count = progressPayload.answered_questions?.length ?? 0;
        setProgress(count);
      } catch {
        // ignore progress fetch failure
      }
    }
    fetchProgress();
  }, [testSessionId]);

  const handleAnswer = async (optionId) => {
    if (!currentQuestion || !testSessionId) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.question_id]: optionId }));
  };

  const handleNext = async () => {
    if (!currentQuestion || !selectedAnswer || !testSessionId) return;
    setError("");

    const questionId = currentQuestion.question_id;
    // Launch save in background
    const savePromise = submitQuestionAnswer({
      testSessionId,
      questionId,
      selectedOptionId: selectedAnswer,
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
        await submitTestSession(testSessionId);
        setStatus("completed");
        navigate(`/career-report/${testSessionId}`);
      } catch (err) {
        setError(err.message || "Failed to save all answers or submit test.");
      } finally {
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

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-6 py-10 text-center font-sans">
        <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-serif font-bold text-[#0b1a36]">Discovery Test</h1>
        <p className="mt-4 text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (status === "starting session" || status === "loading questions") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-6 py-10 text-center font-sans flex items-center justify-center">
        <div className="inline-flex items-center gap-3 rounded-3xl border border-[#D3E3F5] bg-white px-6 py-5 shadow-xs">
          <Loader2 className="animate-spin text-[#1E88E5]" size={24} />
          <span className="text-sm sm:text-base font-semibold text-[#0b1a36]">Preparing your discovery session...</span>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-6 py-10 text-center font-sans">
        <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-serif font-bold text-[#0b1a36]">Discovery Test</h1>
        <p className="mt-4 text-slate-600">No questions were loaded. Try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 py-8 sm:px-8 font-sans text-left">
      <div className="mx-auto max-w-4xl rounded-3xl border border-[#D3E3F5] bg-white p-6 sm:p-8 shadow-xs">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 cursor-pointer">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Session</p>
            <p className="text-xs sm:text-sm font-bold text-slate-700">{testSessionId || "—"}</p>
          </div>
        </div>
        <div key={currentIndex} className="rounded-3xl border border-[#D3E3F5] bg-[#F0F6FC] p-6 space-y-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-sky-50 text-[#1E88E5] border border-sky-200">
                {currentIndex < 10 ? "Part 1: Behavioral Scenario" : "Part 2: Qualitative Reflection"}
              </span>
              <h2 className="mt-3 text-lg sm:text-2xl font-serif font-bold text-[#0b1a36] leading-snug">{currentQuestion.question_text}</h2>
            </div>
            <div className="rounded-full border border-[#D3E3F5] bg-white px-3.5 py-1.5 text-xs sm:text-sm font-bold text-[#0b1a36] shadow-2xs shrink-0">
              {currentIndex + 1}/{totalQuestions}
            </div>
          </div>

          {currentQuestion.question_type === "open_text" ? (
            <div className="space-y-2">
              <textarea
                value={selectedAnswer || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your reflection answer here (3–5 sentences recommended)..."
                rows={5}
                className="w-full rounded-2xl border border-[#D3E3F5] bg-white p-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 outline-none transition resize-none shadow-2xs"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>Reflections help customize your qualitative career match insights.</span>
                <span>{(selectedAnswer || "").length} characters</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {currentQuestion.options?.map((option) => {
                const isSelected = selectedAnswer === option.option_id;
                return (
                  <button
                    key={option.option_id}
                    onClick={() => handleAnswer(option.option_id)}
                    className={`w-full rounded-2xl border px-5 py-4 text-left transition flex items-center gap-3.5 group cursor-pointer shadow-2xs ${
                      isSelected
                        ? "border-[#1E88E5] bg-sky-50/80 text-[#0b1a36] font-semibold"
                        : "border-[#D3E3F5] bg-white hover:bg-[#F0F6FC] text-slate-800"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? "border-[#1E88E5] bg-[#1E88E5]"
                          : "border-slate-300 bg-white group-hover:border-slate-400"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-900 flex-1">{option.option_text}</p>
                  </button>
                );
              })}
            </div>
          )}

          {error ? <p className="mt-4 text-xs sm:text-sm text-red-600 font-semibold">{error}</p> : null}
          <div className="mt-6 flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={(!selectedAnswer && currentQuestion.question_type !== "open_text") || isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0b1a36] hover:bg-[#122b59] px-6 py-2.5 text-xs sm:text-sm font-bold text-white transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Saving..." : currentIndex === totalQuestions - 1 ? "Submit Test" : "Next Question"}
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="mt-5 rounded-2xl border border-[#D3E3F5] bg-white p-4 text-xs text-slate-600 shadow-2xs space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Overall Progress</span>
              <span>Answered {displayedCount} of {totalQuestions}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#edf3fb]">
              <div className="h-full rounded-full bg-[#0b1a36] transition-all duration-300" style={{ width: `${(displayedCount / Math.max(totalQuestions, 1)) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}