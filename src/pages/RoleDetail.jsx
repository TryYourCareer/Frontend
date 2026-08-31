import { useState } from "react";
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  Lightbulb,
  Wrench,
  GraduationCap,
  ChevronRight,
  Target,
} from "lucide-react";

export default function RoleDetail({ role, onBack }) {
  const [activeTab, setActiveTab] = useState("dayInLife");

  if (!role) return null;

  const IconComponent = role.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-6 py-8 sm:px-10 lg:px-12 font-sans">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-xs transition hover:bg-slate-50"
          >
            <ArrowLeft size={14} />
            Back to AI Roles List
          </button>
        )}

        {/* 1. TOP HERO BANNER CARD */}
        <div className="flex flex-col justify-between gap-6 rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-center gap-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-[#D3E3F5] bg-[#EAF2FA] text-[#1E88E5] shadow-xs">
              <IconComponent size={28} />
            </div>
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E88E5]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                {role.category}
              </span>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0b1a36] sm:text-4xl">
                {role.title}
              </h1>
              <p className="max-w-lg text-xs leading-relaxed text-slate-600 sm:text-sm">
                {role.tagline}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 shrink-0 sm:items-end">
            <div className="w-full rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] px-5 py-3 text-left sm:w-auto sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Salary Range
              </p>
              <p className="text-xl font-black text-[#0b1a36]">
                {role.salary}
              </p>
            </div>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b1a36] hover:bg-[#122b59] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition sm:w-auto">
              <Target size={15} />
              Start Trial Mission
            </button>
          </div>
        </div>

        {/* 2. NAVIGATION TAB PILLS */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setActiveTab("dayInLife")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition shadow-xs ${
              activeTab === "dayInLife"
                ? "bg-[#0b1a36] text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Clock size={14} />
            Day in the Life
          </button>
          <button
            onClick={() => setActiveTab("realityCheck")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition shadow-xs ${
              activeTab === "realityCheck"
                ? "bg-[#0b1a36] text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <AlertTriangle size={14} />
            Reality Check
          </button>
          <button
            onClick={() => setActiveTab("proInsights")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition shadow-xs ${
              activeTab === "proInsights"
                ? "bg-[#0b1a36] text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Lightbulb size={14} />
            Pro Insights
          </button>
        </div>

        {/* 3. MAIN CONTENT GRID */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* LEFT CONTENT AREA */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* DAY IN THE LIFE TAB CONTENT */}
            {activeTab === "dayInLife" && (
              <div className="space-y-8 rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs sm:p-8">
                <div className="space-y-2">
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-[#0b1a36]">
                    The Unglamorous Truth
                  </h2>
                  <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {role.summary}
                  </p>
                </div>

                {/* TIMELINE SECTION */}
                {role.schedule ? (
                  <div className="relative space-y-6 before:absolute before:bottom-2 before:left-1/2 before:top-2 before:w-0.5 before:-translate-x-1/2 before:bg-[#D3E3F5]">
                    {role.schedule.map((item, index) => {
                      const isEven = index % 2 === 0;
                      return (
                        <div key={index} className="relative flex items-center justify-between">
                          
                          <div className={`w-[45%] ${isEven ? "pr-4 text-right" : "order-2 pl-4 text-left"}`}>
                            <div className="inline-block rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] p-4 text-left shadow-2xs">
                              <div className="mb-1 flex items-center justify-between gap-2">
                                <h4 className="text-xs font-bold text-slate-900">Task {index + 1}</h4>
                                <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-extrabold text-[#1E88E5]">
                                  {item.time}
                                </span>
                              </div>
                              <p className="text-xs font-semibold leading-relaxed text-slate-700">
                                {item.task}
                              </p>
                            </div>
                          </div>

                          <div className="absolute left-1/2 z-10 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full border border-[#D3E3F5] bg-white text-[#1E88E5] shadow-xs">
                            <Clock size={14} />
                          </div>

                          <div className={`w-[45%] ${isEven ? "order-2" : ""}`} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      Core Responsibilities
                    </h3>
                    <div className="grid gap-3">
                      {role.keyTasks.map((task, idx) => (
                        <div key={idx} className="rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] p-4 text-xs font-semibold text-slate-800">
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* REALITY CHECK TAB CONTENT */}
            {activeTab === "realityCheck" && (
              <div className="space-y-6 rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs sm:p-8">
                <h2 className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-[#0b1a36]">
                  <AlertTriangle className="text-amber-500" size={22} />
                  Role Reality Check
                </h2>
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Primary Workload Focus
                  </h3>
                  <div className="rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] p-5">
                    <p className="text-xs font-semibold leading-relaxed text-slate-800 sm:text-sm">
                      {role.dailyFocus}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Expected Key Deliverables
                  </h3>
                  <div className="grid gap-3">
                    {role.keyTasks.map((task, idx) => (
                      <div key={idx} className="flex items-start gap-3 rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] p-4">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#0b1a36] text-[10px] font-bold text-white">
                          {idx + 1}
                        </span>
                        <p className="text-xs font-semibold leading-relaxed text-slate-800">{task}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PRO INSIGHTS TAB CONTENT */}
            {activeTab === "proInsights" && (
              <div className="space-y-6 rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs sm:p-8">
                <h2 className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-[#0b1a36]">
                  <Lightbulb className="text-[#1E88E5]" size={22} />
                  Pro Insights & Career Pathway
                </h2>
                <div className="space-y-2 rounded-2xl border border-sky-200 bg-sky-50 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1E88E5]">
                    Experience & Career Tier
                  </h3>
                  <p className="text-sm font-bold text-slate-950">{role.experienceTier}</p>
                </div>
                <div className="space-y-2 rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] p-5">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Preparation Strategy
                  </h3>
                  <p className="text-xs font-medium leading-relaxed text-slate-800 sm:text-sm">
                    {role.preparation}
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR WIDGETS */}
          <div className="space-y-6">
            
            {/* CORE TOOLS & SKILLS WIDGET */}
            <div className="space-y-5 rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs">
              <h3 className="flex items-center gap-2 border-b border-[#D3E3F5] pb-3 font-serif font-bold text-slate-900 text-base">
                <Wrench size={16} className="text-slate-700" />
                Core Focus Area
              </h3>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Daily Workload
                </p>
                <div className="rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] p-3 text-xs font-semibold text-slate-800">
                  {role.dailyFocus}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Key Tasks Breakdown
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {role.keyTasks.map((_, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg border border-[#D3E3F5] bg-[#F0F6FC] px-2.5 py-1 text-[10px] font-bold text-slate-700"
                    >
                      Task Option {idx + 1}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* EDUCATION PATHWAYS WIDGET */}
            <div className="space-y-4 rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs">
              <h3 className="flex items-center gap-2 border-b border-[#D3E3F5] pb-3 font-serif font-bold text-slate-900 text-base">
                <GraduationCap size={16} className="text-slate-700" />
                Preparation Pathways
              </h3>

              <div className="space-y-2 rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] p-4">
                <p className="text-xs font-medium leading-relaxed text-slate-800">
                  {role.preparation}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-[#D3E3F5] bg-white p-3 text-xs font-bold text-slate-800 shadow-2xs transition hover:bg-[#F0F6FC] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#EAF2FA] text-[11px] font-bold text-[#1E88E5] border border-[#D3E3F5]">
                      1
                    </span>
                    <span>Self-Paced / Certification Route</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}