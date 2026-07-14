import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getTestProgress, getTestQuestions, startTestSession, submitQuestionAnswer, submitTestSession } from "../services/discoveryTest";

export default function Assessment() {
  const { user } = useAuth();
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
  const currentAnswer = currentQuestion ? answers[currentQuestion.question_id] : "";
  const totalQuestions = questions.length;
  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => Boolean(String(value || "").trim())).length,
    [answers]
  );
  const displayedCount = Math.max(answeredCount, progress);

  useEffect(() => {
    let mounted = true;

    async function init() {
      setStatus("starting session");
      setError("");
      try {
        if (!user?.id) {
          throw new Error("Your profile is not ready yet. Please complete registration first.");
        }

        const session = await startTestSession(user.id);
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
  }, [user]);

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
  }, [testSessionId, answers]);

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
    setIsSubmitting(true);
    setError("");

    try {
      await submitQuestionAnswer({
        testSessionId,
        questionId: currentQuestion.question_id,
        selectedOptionId: currentQuestion.question_type === "open_text" ? null : currentAnswer,
        responseText: currentQuestion.question_type === "open_text" ? currentAnswer.trim() : null,
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

  if (status === "completed") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#eff6ff_0%,_#dbeafe_42%,_#f8fafc_100%)] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(37,64,116,0.12)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">Assessment complete</p>
          <h1 className="mt-4 text-3xl font-black text-slate-900">Your answers are saved</h1>
          <p className="mt-3 text-slate-600">We’ve submitted the session to the backend and recorded your progress.</p>
          <button onClick={() => navigate("/dashboard")} className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white">
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen grid place-items-center bg-[radial-gradient(circle_at_top_left,_#eff6ff_0%,_#dbeafe_42%,_#f8fafc_100%)] px-6 py-10 text-center">
        <div className="max-w-md rounded-[28px] border border-red-200 bg-white p-8 shadow-[0_20px_60px_rgba(37,64,116,0.12)]">
          <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Discovery Test</h1>
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (status === "starting session" || status === "loading questions") {
    return (
      <div className="min-h-screen grid place-items-center bg-[radial-gradient(circle_at_top_left,_#eff6ff_0%,_#dbeafe_42%,_#f8fafc_100%)] px-6 py-10 text-center">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-base font-semibold">Preparing your discovery session...</span>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen grid place-items-center bg-[radial-gradient(circle_at_top_left,_#eff6ff_0%,_#dbeafe_42%,_#f8fafc_100%)] px-6 py-10 text-center">
        <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(37,64,116,0.12)]">
          <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Discovery Test</h1>
          <p className="mt-4 text-slate-600">No questions were loaded. Try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#eff6ff_0%,_#dbeafe_42%,_#f8fafc_100%)] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(37,64,116,0.12)]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Session</p>
            <p className="text-sm font-semibold text-slate-600">{testSessionId || "Pending"}</p>
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
          {progress ? <p className="mb-4 text-sm font-semibold text-blue-700">Backend progress: {progress} answered</p> : null}
          <div className="space-y-3">
            {currentQuestion.question_type === "open_text" ? (
              <textarea
                value={currentAnswer}
                onChange={(event) => handleTextAnswerChange(event.target.value)}
                placeholder="Type your response here..."
                rows={6}
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            ) : (
              currentQuestion.options.map((option) => {
                const isSelected = currentAnswer === option.option_id;
                const optionText = option.option_text || option.text || option.label || "Unnamed option";
                return (
                  <button
                    key={option.option_id}
                    onClick={() => handleAnswer(option.option_id)}
                    className={`w-full rounded-2xl border px-5 py-4 text-left text-slate-900 transition ${isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  >
                    <p className="font-semibold leading-6">{optionText}</p>
                  </button>
                );
              })
            )}
          </div>
          {error ? <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!currentAnswer?.trim() || isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
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
            <p className="mt-2">
              Answered {displayedCount} of {totalQuestions}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
