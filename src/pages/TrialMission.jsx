import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function TrialMission() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setSubscribed(true);
      setIsSubmitting(false);
      setEmail("");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Back navigation */}
        <button 
          onClick={() => navigate("/dashboard")} 
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl md:p-12 mb-10">
          {/* Decorative background glow */}
          <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-amber-200/20 blur-3xl" />
          <div className="absolute left-0 bottom-0 -ml-24 -mb-24 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1 text-xs font-bold text-amber-800 uppercase tracking-wider mb-6">
              <Rocket size={12} className="animate-bounce" /> Launching Soon
            </span>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Trial Missions
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Embark on real-world simulations of your dream careers. Step into the shoes of professionals, complete hands-on tasks, and build your portfolio before choosing your path.
            </p>

            {/* Newsletter Subscription */}
            <div className="mt-8 max-w-md">
              {subscribed ? (
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-emerald-800">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                  <span className="font-semibold text-sm">Thanks! We'll notify you as soon as missions go live.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email to get early access"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 text-sm shadow-sm transition-all duration-200 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                  >
                    {isSubmitting ? "Submitting..." : "Notify Me"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
