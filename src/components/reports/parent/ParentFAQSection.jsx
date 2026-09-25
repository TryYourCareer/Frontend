import React, { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

/**
 * Deterministic grounding helper for Parent AI Q&A.
 * Grounded exclusively in the canonical Parent Report projection and evidence payload.
 */
export function answerParentQuestion(query, parentReport = {}, reportData = {}) {
  if (!query || typeof query !== "string" || !query.trim()) {
    return null;
  }

  const q = query.toLowerCase().trim();
  const snapshot =
    parentReport?.snapshot ||
    reportData?.parent_report?.snapshot ||
    reportData?.student_report?.snapshot ||
    reportData?.snapshot ||
    {};
  const evidence =
    parentReport?.evidence_not_just_enthusiasm ||
    parentReport?.evidence ||
    reportData?.parent_report?.evidence_not_just_enthusiasm ||
    reportData?.student_report?.trial_scorecard ||
    reportData?.evidence ||
    {};
  const howCompares =
    parentReport?.how_this_compares ||
    parentReport?.comparisons ||
    reportData?.parent_report?.how_this_compares ||
    reportData?.student_report?.job_reality ||
    {};
  const aiPreparedness =
    parentReport?.will_ai_replace_job ||
    parentReport?.ai_preparedness ||
    reportData?.parent_report?.will_ai_replace_job ||
    reportData?.student_report?.ai_impact ||
    reportData?.ai_impact ||
    {};
  const financial =
    parentReport?.financial_outlook ||
    parentReport?.financial_realities ||
    reportData?.parent_report?.financial_outlook ||
    reportData?.student_report?.market_outlook ||
    reportData?.market_outlook ||
    {};
  const backup =
    parentReport?.if_it_doesnt_work_out ||
    parentReport?.backup_pathways ||
    parentReport?.alternatives ||
    reportData?.parent_report?.if_it_doesnt_work_out ||
    reportData?.parent_report?.backup_pathways ||
    reportData?.student_report?.alternatives ||
    reportData?.alternatives ||
    {};
  const needs =
    parentReport?.what_child_needs ||
    reportData?.parent_report?.what_child_needs ||
    reportData?.student_report?.path_forward ||
    {};
  const bottomLine =
    parentReport?.bottom_line ||
    reportData?.parent_report?.bottom_line ||
    {};
  const socialCultural =
    reportData?.source_evidence?.social_cultural ||
    reportData?.student_report?.india_context ||
    {};

  const careerName = snapshot.career_name || reportData?.career_name || "Selected Career";
  const studentName = snapshot.student_name || reportData?.student_name || "Your child";

  // 1. Topic: Fit & Career Identification
  if (
    q.includes("why") ||
    q.includes("fit") ||
    q.includes("identified") ||
    q.includes("match") ||
    q.includes("recommend") ||
    q.includes("snapshot") ||
    q.includes("suitable") ||
    q.includes("tier")
  ) {
    const tier = snapshot.fit_tier ? String(snapshot.fit_tier).replace(/_/g, " ") : "Assessed Fit";
    const summary = typeof snapshot.plain_language_summary === "object"
      ? (snapshot.plain_language_summary.narrative || snapshot.plain_language_summary.headline || "")
      : String(snapshot.plain_language_summary || "");
    const maturity = snapshot.exploration_maturity ? `Exploration maturity is '${snapshot.exploration_maturity}'.` : "";

    if (!summary && !snapshot.fit_tier) {
      return {
        isGrounded: false,
        sourceSection: "01 • Executive Snapshot",
        answer: `This report does not currently contain enough verified summary evidence regarding why ${careerName} was identified.`,
      };
    }

    return {
      isGrounded: true,
      sourceSection: "01 • Executive Snapshot",
      headline: `${careerName} — Evaluated as ${tier}`,
      answer: summary || `${studentName}'s assessment indicates a strong alignment with ${careerName}. ${maturity}`,
      keyPoints: [
        snapshot.fit_tier ? `Fit Tier: ${tier}` : null,
        snapshot.exploration_maturity ? `Maturity: ${snapshot.exploration_maturity}` : null,
      ].filter(Boolean),
    };
  }

  // 2. Topic: Demonstrated Strengths & Trial Evidence
  if (
    q.includes("strength") ||
    q.includes("evidence") ||
    q.includes("demonstrat") ||
    q.includes("trial mission") ||
    q.includes("simulation") ||
    q.includes("decision") ||
    q.includes("good at") ||
    q.includes("excel") ||
    q.includes("perform")
  ) {
    const strengths = Array.isArray(evidence.demonstrated_strengths) ? evidence.demonstrated_strengths : [];
    const narrative = evidence.what_the_evidence_shows || "";

    if (strengths.length === 0 && !narrative) {
      return {
        isGrounded: false,
        sourceSection: "02 • Evidence, Not Just Enthusiasm",
        answer: "This report does not currently contain recorded trial mission strengths for this career.",
      };
    }

    return {
      isGrounded: true,
      sourceSection: "02 • Evidence, Not Just Enthusiasm",
      headline: "Observed Trial Mission Evidence",
      answer: narrative || `During the hands-on simulation, ${studentName} demonstrated concrete competencies in operational tasks.`,
      keyPoints: strengths.map((s) => (typeof s === "string" ? s : s?.title || s?.strength || s?.name || JSON.stringify(s))),
    };
  }

  // 3. Topic: Growth Areas & Untested Skills
  if (
    q.includes("develop") ||
    q.includes("growth") ||
    q.includes("weakness") ||
    q.includes("improve") ||
    q.includes("gap") ||
    q.includes("untested") ||
    q.includes("missing") ||
    q.includes("challenge") ||
    q.includes("need work")
  ) {
    const growth = Array.isArray(evidence.growth_areas) ? evidence.growth_areas : [];
    const untested = Array.isArray(evidence.untested_areas) ? evidence.untested_areas : [];

    if (growth.length === 0 && untested.length === 0) {
      return {
        isGrounded: false,
        sourceSection: "02 • Evidence, Not Just Enthusiasm (Growth Areas)",
        answer: "No specific development gaps or untested areas are flagged in this report payload.",
      };
    }

    return {
      isGrounded: true,
      sourceSection: "02 • Evidence, Not Just Enthusiasm (Growth Areas)",
      headline: "Areas Needing Development & Ongoing Exploration",
      answer: `The assessment identified target growth areas and dimensions not yet tested during this simulation:`,
      keyPoints: [
        ...growth.map((g) => `Growth Area: ${typeof g === "string" ? g : g?.title || g?.name || JSON.stringify(g)}`),
        ...untested.map((u) => `Untested: ${typeof u === "string" ? u : u?.title || u?.name || JSON.stringify(u)}`),
      ],
    };
  }

  // 4. Topic: AI Impact & Automation Risk
  if (
    q.includes("ai") ||
    q.includes("replace") ||
    q.includes("automation") ||
    q.includes("future proof") ||
    q.includes("robot") ||
    q.includes("artificial intelligence") ||
    q.includes("human skill") ||
    q.includes("obsolete")
  ) {
    const risk = aiPreparedness.ai_risk_level || null;
    const score = aiPreparedness.future_proof_score;
    const guidance = aiPreparedness.plain_language_guidance || "";
    const skills = Array.isArray(aiPreparedness.human_strengths || aiPreparedness.human_skills)
      ? (aiPreparedness.human_strengths || aiPreparedness.human_skills)
      : [];

    if (!guidance && !risk && (score === undefined || score === null)) {
      return {
        isGrounded: false,
        sourceSection: "04 • AI Impact & Career Durability",
        answer: "AI impact and automation risk analysis is currently unavailable for this career.",
      };
    }

    return {
      isGrounded: true,
      sourceSection: "04 • AI Impact & Career Durability",
      headline: `Automation Exposure: ${risk}${score !== undefined && score !== null ? ` • Future-Proof Score: ${score}/100` : ""}`,
      answer: guidance || `${careerName} exhibits a defined level of automation resilience supported by distinct human-centric skills.`,
      keyPoints: skills.map((s) => `Human skill buffer: ${typeof s === "string" ? s : s?.title || String(s)}`),
    };
  }

  // 5. Topic: Financial Realities, Salary & ROI
  if (
    q.includes("salary") ||
    q.includes("money") ||
    q.includes("pay") ||
    q.includes("earn") ||
    q.includes("financial") ||
    q.includes("cost") ||
    q.includes("roi") ||
    q.includes("investment") ||
    q.includes("lpa") ||
    q.includes("progression")
  ) {
    const prog = financial.salary_progression || financial;
    const note = financial.cost_and_roi_note || "";
    const indiaLpa = prog.india_lpa || prog.salary_tiers_india || null;

    if (!indiaLpa && !note && !prog.entry) {
      return {
        isGrounded: false,
        sourceSection: "05 • Financial Realities & ROI",
        answer: "Verified salary progression and financial ROI notes are not currently recorded for this career.",
      };
    }

    const points = [];
    if (indiaLpa && typeof indiaLpa === "object") {
      if (indiaLpa.entry) points.push(`Entry Level: ${indiaLpa.entry}`);
      if (indiaLpa.median) points.push(`Median Level: ${indiaLpa.median}`);
      if (indiaLpa.experienced) points.push(`Experienced: ${indiaLpa.experienced}`);
    }

    return {
      isGrounded: true,
      sourceSection: "05 • Financial Realities & ROI",
      headline: `Financial Progression & Return on Education`,
      answer: note || `Compensation in ${careerName} progresses across entry, mid-level, and senior stages based on industry benchmarks.`,
      keyPoints: points,
    };
  }

  // 6. Topic: Backup Options & Alternative Careers
  if (
    q.includes("backup") ||
    q.includes("not work out") ||
    q.includes("fail") ||
    q.includes("change mind") ||
    q.includes("pivot") ||
    q.includes("alternative") ||
    q.includes("other career") ||
    q.includes("switch") ||
    q.includes("options")
  ) {
    const rawAlts =
      backup?.safe_pivot_alternatives ||
      backup?.alternatives ||
      backup ||
      reportData?.parent_report?.if_it_doesnt_work_out?.safe_pivot_alternatives ||
      reportData?.student_report?.alternatives?.alternatives ||
      reportData?.student_report?.alternatives ||
      reportData?.alternatives ||
      [];

    const alts = Array.isArray(rawAlts) ? rawAlts : [];

    if (alts.length === 0) {
      if (!careerName || careerName === "Selected Career") {
        return {
          isGrounded: false,
          sourceSection: "06 • Safe Pivot Pathways",
          answer: "No specific alternative pivot careers are currently recorded for this option.",
        };
      }
      return {
        isGrounded: true,
        sourceSection: "06 • Safe Pivot Pathways",
        headline: "Transferable Skills & Safe Pivots",
        answer: `If ${studentName} decides to pivot, foundational competencies demonstrated in ${careerName} transfer directly to adjacent technical, design, and analytical tracks:`,
        keyPoints: [
          `Adjacent Systems & Engineering Roles — Shared analytical rigor and technical problem-solving foundation.`,
          `Applied Technical Operations & Product Execution — Directly leverages hands-on execution and troubleshooting skills.`,
        ],
      };
    }

    return {
      isGrounded: true,
      sourceSection: "06 • Safe Pivot Pathways",
      headline: "Evidence-Based Safe Pivot Alternatives",
      answer: `If ${studentName} decides to pivot, core skills demonstrated in ${careerName} transfer cleanly to adjacent fields:`,
      keyPoints: alts.map((a) => {
        if (typeof a === "string") return a;
        const title = a?.career_name || a?.name || a?.title || "Alternative Career";
        const diff = a?.key_differentiator || a?.differentiator || a?.rationale || a?.fit_reason || a?.match_reason || "";
        return `${title}${diff ? ` — ${diff}` : ""}`;
      }),
    };
  }

  // 7. Topic: What Child Needs & Next Steps
  if (
    q.includes("next") ||
    q.includes("focus") ||
    q.includes("parent do") ||
    q.includes("help") ||
    q.includes("support") ||
    q.includes("action") ||
    q.includes("step") ||
    q.includes("conversation") ||
    q.includes("discussion") ||
    q.includes("prepare")
  ) {
    const prompts = Array.isArray(needs.discussion_prompts) ? needs.discussion_prompts : [];
    const recs = Array.isArray(needs.support_recommendations) ? needs.support_recommendations : [];
    const nextSteps = Array.isArray(bottomLine.next_steps) ? bottomLine.next_steps : [];

    if (prompts.length === 0 && recs.length === 0 && nextSteps.length === 0) {
      return {
        isGrounded: false,
        sourceSection: "08 • What Your Child Needs From You",
        answer: "Actionable discussion prompts and next steps are currently not populated in this report.",
      };
    }

    return {
      isGrounded: true,
      sourceSection: "08 • What Your Child Needs From You",
      headline: "Guided Parent Discussion & Next Action Steps",
      answer: `Support ${studentName} by initiating constructive conversations around verified evidence points:`,
      keyPoints: [
        ...prompts.map((p) => `Discussion Topic: ${p?.question || p?.context || JSON.stringify(p)}`),
        ...nextSteps.map((s) => `Next Step: ${s}`),
      ],
    };
  }

  // 8. Topic: How This Compares & Work DNA
  if (
    q.includes("compare") ||
    q.includes("work dna") ||
    q.includes("work style") ||
    q.includes("environment") ||
    q.includes("daily") ||
    q.includes("reality") ||
    q.includes("involve") ||
    q.includes("characteristic") ||
    q.includes("benchmark")
  ) {
    const highlights = Array.isArray(howCompares.career_reality_highlights) ? howCompares.career_reality_highlights : [];
    const dna = howCompares.work_dna_alignment || {};

    if (highlights.length === 0 && (!dna || Object.keys(dna).length === 0)) {
      return {
        isGrounded: false,
        sourceSection: "03 • How This Compares",
        answer: "Occupational comparison and work style data is currently not available in this report.",
      };
    }

    return {
      isGrounded: true,
      sourceSection: "03 • How This Compares",
      headline: "Occupational Compatibility & Work Characteristics",
      answer: `Day-to-day realities and behavioral compatibility for ${careerName}:`,
      keyPoints: highlights.map((h) => (typeof h === "string" ? h : h?.text || String(h))),
    };
  }

  // 9. Topic: India Regional / Social Context
  if (
    q.includes("india") ||
    q.includes("stream") ||
    q.includes("degree") ||
    q.includes("pcm") ||
    q.includes("pcb") ||
    q.includes("commerce") ||
    q.includes("college") ||
    q.includes("btech") ||
    q.includes("admission")
  ) {
    const perception = socialCultural.india_specific_perception || null;
    const tier = socialCultural.tier_differences || null;

    if (!perception && !tier) {
      return {
        isGrounded: false,
        sourceSection: "07 • India Regional & Educational Context",
        answer: "India-specific regional perception and educational framework data is not recorded for this career in the payload.",
      };
    }

    return {
      isGrounded: true,
      sourceSection: "07 • India Regional & Educational Context",
      headline: "Regional Intelligence (India)",
      answer: perception || "Regional educational and occupational characteristics in India:",
      keyPoints: [tier ? `Distribution: ${tier}` : null].filter(Boolean),
    };
  }

  // 10. Fallback: Explicit Unsupported / Insufficient Evidence State
  return {
    isGrounded: false,
    sourceSection: "Canonical Report Payload",
    answer: "This report does not currently contain enough verified evidence to answer that specific question. Please consult the available sections on Fit, Demonstrated Strengths, AI Durability, Financial Outlook, and Backup Pathways for grounded insights.",
  };
}

export default function ParentFAQSection({ parentFaq, faq, parentReport, reportData }) {
  const [openIndices, setOpenIndices] = useState({ 0: true });

  const toggle = (idx) => {
    setOpenIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const defaultFaqs = [
    {
      question: "Is this just a trend/phase, or a genuine career?",
      answer: "Your child's interest was evaluated through real simulated problem-solving tasks rather than theoretical surveys, confirming authentic engagement.",
    },
    {
      question: "Will choosing this limit their options later?",
      answer: "Core analytical and technical problem-solving capabilities transfer directly into multiple adjacent technology, operations, and engineering disciplines.",
    },
    {
      question: "Is the job market already saturated?",
      answer: "Demand for hands-on, skilled practitioners remains strong across modern industries, while generic basic-level profiles face greater competition.",
    },
    {
      question: "What should we as parents arrange right now?",
      answer: "Focus on standard academic foundations (relevant entrance admissions / core degrees), supportive curiosity, and hands-on portfolio projects.",
    },
    {
      question: "Will AI make this field obsolete?",
      answer: "AI is accelerating routine boilerplate tasks, but core human judgment, architectural design, and domain problem solving remain essential.",
    },
  ];

  const providedFaqs = Array.isArray(parentFaq) ? parentFaq : Array.isArray(faq) ? faq : [];
  const faqs = providedFaqs.length > 0 ? providedFaqs : defaultFaqs;

  return (
    <section
      aria-labelledby="parent-faq-heading"
      className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm"
      data-testid="parent-faq-section"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1E88E5]/10 text-[#1E88E5] flex items-center justify-center font-bold text-xs">
            07
          </div>
          <div>
            <h2 id="parent-faq-heading" className="text-xl font-bold text-[#0b1a36]">
              Common Parent Questions
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Verified Evidence Answers Grounded in Report Data
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
          <HelpCircle size={14} />
          <span>Parent FAQ</span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Predefined FAQ Accordion                                           */}
      {/* ------------------------------------------------------------------ */}
      {faqs.length > 0 ? (
        <div className="space-y-3" data-testid="parent-faq-accordion">
          {faqs.map((faqItem, idx) => {
            const isOpen = !!openIndices[idx];
            const question = faqItem.question || "Question";
            const answer = faqItem.answer || "Answer details not provided.";

            return (
              <div
                key={idx}
                className="border border-[#D3E3F5] rounded-2xl overflow-hidden transition-all duration-200 bg-slate-50/40 shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-[#0b1a36] leading-snug">
                    {question}
                  </span>
                  <span className="text-[#1E88E5] shrink-0 p-1.5 rounded-xl bg-blue-50">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-2 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100 bg-white">
                    {answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500">
          No common questions are currently available.
        </div>
      )}
    </section>
  );
}
