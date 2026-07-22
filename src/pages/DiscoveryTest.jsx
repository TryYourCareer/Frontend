import { useEffect, useMemo, useState } from "react";
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
  }, [testSessionId, answers]);

  const handleAnswer = async (optionId) => {
    if (!currentQuestion || !testSessionId) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.question_id]: optionId }));
  };

  const handleNext = async () => {
    if (!currentQuestion || !selectedAnswer || !testSessionId) return;
    setIsSubmitting(true);
    setError("");

    try {
      await submitQuestionAnswer({
        testSessionId,
        questionId: currentQuestion.question_id,
        selectedOptionId: selectedAnswer,
        responseTimeMs: null,
      });
      setProgress((prev) => Math.max(prev, answeredCount));
      if (currentIndex === totalQuestions - 1) {
        await submitTestSession(testSessionId);
        setStatus("completed");
        return;
      }
      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      setError(err.message || "Failed to save answer.");
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Discovery Question</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{currentQuestion.question_text}</h2>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              {currentIndex + 1}/{totalQuestions}
            </div>
          </div>
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.option_id;
              return (
                <button
                  key={option.option_id}
                  onClick={() => handleAnswer(option.option_id)}
                  className={`w-full rounded-2xl border px-5 py-4 text-left transition ${isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <p className="font-semibold text-slate-900">{option.option_text}</p>
                </button>
              );
            })}
          </div>
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
              disabled={!selectedAnswer || isSubmitting}
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
