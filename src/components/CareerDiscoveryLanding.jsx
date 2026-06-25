import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Newspaper,
  Users,
  Globe,
  Target,
  Check,
  Heart,
  Star,
} from "lucide-react";

export default function CareerDiscoveryLanding() {
  const fade = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className="min-h-screen w-full bg-white text-0F172A px-4 py-10 sm:px-8 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div variants={fade} className="relative overflow-visible rounded-2xl px-6 py-10">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-2563EB tracking-wide">ASSESSMENT</span>
            </div>
            <div>
              <button
                aria-label="Back"
                className="rounded-full border border-E2E8F0 bg-white px-4 py-2 text-sm font-semibold text-0F172A hover:shadow-md transition"
              >
                ← Back
              </button>
            </div>
          </div>

          <div className="mt-8 max-w-3xl">
            <motion.h1 variants={fade} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-0F172A">
              Career Discovery Engine
            </motion.h1>
            <motion.p variants={fade} className="mt-4 text-base text-slate-600">
              Answer all 13 questions. Your results are generated inside this same section.
            </motion.p>
          </div>

          <motion.div variants={fade} className="mt-10 grid gap-4 sm:grid-cols-3">
            <article className="group rounded-2xl bg-white border border-E2E8F0 p-6 shadow-sm hover:shadow-lg transition">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2563EB font-semibold">13</div>
              <h3 className="mt-4 text-lg font-semibold text-0F172A">Questions</h3>
              <p className="mt-1 text-sm text-slate-500">Comprehensive</p>
            </article>

            <article className="group rounded-2xl bg-white border border-E2E8F0 p-6 shadow-sm hover:shadow-lg transition">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2563EB font-semibold">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-0F172A">5</h3>
              <p className="mt-1 text-sm text-slate-500">Minutes — Estimated Time</p>
            </article>

            <article className="group rounded-2xl bg-white border border-E2E8F0 p-6 shadow-sm hover:shadow-lg transition">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2563EB font-semibold">270</div>
              <h3 className="mt-4 text-lg font-semibold text-0F172A">Careers</h3>
              <p className="mt-1 text-sm text-slate-500">Real Database</p>
            </article>
          </motion.div>

          <motion.div variants={fade} className="mt-8 rounded-2xl border border-blue-100 bg-white p-6 shadow-md">
            <p className="text-base text-slate-700">
              This is not a test. There are no right answers, no ideal score, and no result that is better than another. Answer honestly, and your first reaction is usually the best one.
            </p>
          </motion.div>

          <motion.section variants={fade} className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-E2E8F0 bg-white p-5 shadow-sm hover:-translate-y-1 transition">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-2563EB">✓</div>
              <p className="mt-3 font-semibold text-0F172A">Pick the option that feels most true right now.</p>
            </div>
            <div className="rounded-2xl border border-E2E8F0 bg-white p-5 shadow-sm hover:-translate-y-1 transition">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-8B5CF6">❤️</div>
              <p className="mt-3 font-semibold text-0F172A">Go with your gut on the first read.</p>
            </div>
            <div className="rounded-2xl border border-E2E8F0 bg-white p-5 shadow-sm hover:-translate-y-1 transition">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-2563EB">⭐</div>
              <p className="mt-3 font-semibold text-0F172A">There is no ideal result.</p>
            </div>
          </motion.section>

          <motion.div variants={fade} className="mt-10 rounded-2xl border border-E2E8F0 bg-white p-6 shadow-sm relative overflow-hidden">
            <div className="absolute right-6 top-6 h-40 w-40 rounded-full bg-blue-50 opacity-60 blur-3xl"></div>
            <h3 className="text-xl font-semibold text-0F172A">What You'll Get</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-2563EB">✓</div>
                <div>
                  <p className="font-semibold text-0F172A">Personalized career pathways</p>
                  <p className="text-sm text-slate-500">Career matches tailored to your interests and strengths.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-8B5CF6">✓</div>
                <div>
                  <p className="font-semibold text-0F172A">Meaningful career recommendations</p>
                  <p className="text-sm text-slate-500">Options that feel realistic, inspiring, and relevant.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-2563EB">✓</div>
                <div>
                  <p className="font-semibold text-0F172A">Clear next steps and confidence</p>
                  <p className="text-sm text-slate-500">See practical guidance and which careers fit your profile best.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fade} className="mt-12">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mx-auto block w-full max-w-md rounded-full bg-gradient-to-r from-#2563EB via-#3B82F6 to-#1D4ED8 px-6 py-4 text-center text-white font-semibold shadow-lg hover:shadow-2xl transition"
            >
              <span className="inline-flex items-center justify-center gap-3">
                <span>Start Assessment</span>
                <ArrowRight className="h-5 w-5" />
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.main>
  );
}
