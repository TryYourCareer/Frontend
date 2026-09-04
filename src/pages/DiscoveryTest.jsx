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
      <div className="min-h-screen px-6 py-10 text-center">
        <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-bold">Discovery Test</h1>
        <p className="mt-4 text-red-600">{error}</p>
      </div>
    );
  }

  if (status === "starting session" || status === "loading questions") {
    return (
      <div className="min-h-screen px-6 py-10 text-center">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-base font-semibold">Preparing your discovery session...</span>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen px-6 py-10 text-center">
        <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-bold">Discovery Test</h1>
        <p className="mt-4 text-slate-600">No questions were loaded. Try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Session</p>
            <p className="text-sm font-semibold text-slate-600">{testSessionId || "—"}</p>
          </div>
        </div>
        <div key={currentIndex} className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 animate-question-slide">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {currentIndex < 10 ? "Part 1: Behavioral Scenario" : "Part 2: Qualitative Reflection"}
              </span>
              <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-slate-900 leading-snug">{currentQuestion.question_text}</h2>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shrink-0">
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
                className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
              />
              <div className="flex items-center justify-between text-xs text-slate-450 px-1">
                <span>Reflections help customize your qualitative career match insights.</span>
                <span>{(selectedAnswer || "").length} characters</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => {
                const isSelected = selectedAnswer === option.option_id;
                return (
                  <button
                    key={option.option_id}
                    onClick={() => handleAnswer(option.option_id)}
                    className={`w-full rounded-2xl border px-5 py-4 text-left transition flex items-center gap-3.5 group cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/90 text-slate-900 font-semibold shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-800"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-600"
                          : "border-slate-300 bg-white group-hover:border-slate-400"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 flex-1">{option.option_text}</p>
                  </button>
                );
              })}
            </div>
          )}

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={(!selectedAnswer && currentQuestion.question_type !== "open_text") || isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : currentIndex === totalQuestions - 1 ? "Submit Test" : "Next Question"}
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="mt-5 rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-800">Progress</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-blue-500" style={{ width: `${(displayedCount / Math.max(totalQuestions, 1)) * 100}%` }} />
            </div>
            <p className="mt-2">Answered {displayedCount} of {totalQuestions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
