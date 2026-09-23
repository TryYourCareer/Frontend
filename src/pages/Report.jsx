import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';

export default function Report() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState('student'); // 'student' | 'parent'
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    if (location.state?.defaultView) {
      setActiveView(location.state.defaultView);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-800 font-sans antialiased pb-24">
      
      {/* TOP NAVBAR */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#0b1a36] text-white flex items-center justify-center font-black text-xs">
            ✨
          </div>
          <span className="font-sans font-bold text-base text-[#0b1a36]">Career Discovery Engine</span>
        </div>

        {/* Center Toggle Matching Screenshot Style */}
        <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200">
          <button 
            onClick={() => setActiveView('student')}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${activeView === 'student' ? 'bg-[#0b1a36] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Student
          </button>
          <button 
            onClick={() => setActiveView('parent')}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${activeView === 'parent' ? 'bg-[#0b1a36] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Parent
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer shadow-2xs">
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700">
            <User size={14} className="text-slate-500" />
            <span>Hi, Vinisha</span>
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER (Expanded to max-w-6xl to remove wide side gaps) */}
      <div className="mx-auto max-w-6xl px-4 sm:px-8 pt-6 space-y-6">

        {/* UNLOCKED BANNER */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 flex items-center justify-between text-xs font-semibold text-emerald-800 shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-600 font-bold">🌿</span>
            <span>Report unlocked &bull; View your personalized career insights</span>
          </div>
          <span className="font-mono font-bold text-emerald-700">#RE-9042</span>
        </div>


        {/* ========================================================= */}
        {/* STUDENT VIEW SECTIONS                                     */}
        {/* ========================================================= */}
        {activeView === 'student' && (
          <div className="space-y-6">

            {/* SNAPSHOT */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-emerald-500 bg-slate-50 shrink-0 shadow-inner">
                  <div className="text-center">
                    <span className="text-3xl font-black text-[#0b1a36]">78%</span>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Fit Score</p>
                  </div>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recommended Career</p>
                    <h2 className="text-2xl font-black text-[#0b1a36] mt-0.5">Software Developer</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Tech &amp; IT</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">🛡️</div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Confidence Level</p>
                        <p className="font-bold text-slate-800">High</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">📈</div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Career Outlook</p>
                        <p className="font-bold text-slate-800">Positive</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-1 rounded-xl text-xs font-bold">
                  &check; Strong Match
                </span>
                <span className="text-xs text-slate-400 font-semibold">Validated via 3-day Mission Telemetry</span>
              </div>
            </div>


            {/* WHO YOU ARE (6D VECTOR) */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-5 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0b1a36]">Who You Are (6D Vector Profile)</h3>
                <span className="text-[10px] bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-700 font-bold">Psychometric + Trial</span>
              </div>

              <div className="grid md:grid-cols-[1.2fr_1fr] gap-6 items-center">
                <div className="bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[220px]">
                  <span className="absolute top-2.5 left-3 text-[10px] font-bold text-slate-500">Analytical</span>
                  <span className="absolute top-2.5 right-3 text-[10px] font-bold text-slate-500">Creative</span>
                  <span className="absolute bottom-2.5 left-3 text-[10px] font-bold text-slate-500">Teamwork</span>
                  <span className="absolute bottom-2.5 right-3 text-[10px] font-bold text-slate-500">Communication</span>
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">Adaptability</span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">Problem Solving</span>
                  
                  <div className="w-28 h-28 border border-dashed border-indigo-400 rounded-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500 rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Top 3 Traits</h4>
                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">1</span> Problem Solving
                      </span>
                      <span className="font-mono font-bold text-blue-600">92%</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">2</span> Analytical
                      </span>
                      <span className="font-mono font-bold text-blue-600">88%</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">3</span> Adaptability
                      </span>
                      <span className="font-mono font-bold text-blue-600">85%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* REALITY CHECK */}
            <div className="bg-white border-2 border-emerald-500 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-4 text-left relative">
              <div className="absolute top-6 right-6 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Good Match</div>
              <h3 className="text-base font-bold text-[#0b1a36]">This career fits your skills, interests and market demand.</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200"><p className="text-[10px] text-slate-400 font-bold uppercase">SKILL MATCH</p><p className="text-base font-black text-emerald-600 mt-0.5">82%</p></div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200"><p className="text-[10px] text-slate-400 font-bold uppercase">INTEREST MATCH</p><p className="text-base font-black text-emerald-600 mt-0.5">76%</p></div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200"><p className="text-[10px] text-slate-400 font-bold uppercase">MARKET DEMAND</p><p className="text-base font-black text-amber-600 mt-0.5">68%</p></div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200"><p className="text-[10px] text-slate-400 font-bold uppercase">GROWTH POTENTIAL</p><p className="text-base font-black text-emerald-600 mt-0.5">72%</p></div>
              </div>
              
              <p className="text-[11px] text-slate-400 font-semibold pt-1">&check; Based on verified data</p>
            </div>


            {/* WHAT THE JOB LOOKS LIKE */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-4 text-left">
              <h3 className="text-base font-bold text-[#0b1a36]">What the Job Looks Like</h3>
              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">💻</div>
                  <p className="font-bold text-[#0b1a36]">Day-to-Day Work</p>
                  <p className="text-slate-500 leading-relaxed">Build, test and maintain software applications. Work with teams to solve real-world problems.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">⚡</div>
                  <p className="font-bold text-[#0b1a36]">Core Skills</p>
                  <p className="text-slate-500 leading-relaxed">Coding, problem solving, communication, teamwork.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">🚀</div>
                  <p className="font-bold text-[#0b1a36]">Entry Points</p>
                  <p className="text-slate-500 leading-relaxed">Internships, entry-level roles, certifications, personal projects.</p>
                </div>
              </div>
            </div>


            {/* TRIAL MISSION SCORECARD */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0b1a36]">Trial Mission Scorecard</h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1 rounded-full font-bold">Verified Run</span>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-emerald-600 bg-white shrink-0">
                  <span className="text-sm font-bold text-[#0b1a36]">78%</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Overall Performance</p>
                  <p className="text-[11px] text-slate-500">Calculated across 5 core simulation challenges</p>
                </div>
              </div>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="pb-3">Section</th>
                      <th className="pb-3">Score</th>
                      <th className="pb-3 text-right">Percentile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    <tr><td className="py-3">Reasoning</td><td className="py-3">85%</td><td className="py-3 text-right font-mono text-emerald-600">82nd</td></tr>
                    <tr><td className="py-3">Coding</td><td className="py-3">72%</td><td className="py-3 text-right font-mono text-emerald-600">60th</td></tr>
                    <tr><td className="py-3">Aptitude</td><td className="py-3">76%</td><td className="py-3 text-right font-mono text-emerald-600">74th</td></tr>
                    <tr><td className="py-3">OOP Concepts</td><td className="py-3">80%</td><td className="py-3 text-right font-mono text-emerald-600">78th</td></tr>
                    <tr><td className="py-3">DSA</td><td className="py-3">69%</td><td className="py-3 text-right font-mono text-emerald-600">62nd</td></tr>
                  </tbody>
                </table>
              </div>
            </div>


            {/* MARKET OUTLOOK */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0b1a36]">Market Outlook</h3>
                <span className="text-[10px] text-slate-400 font-bold">2024–2032 Projection</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-xl font-black text-[#0b1a36]">4.8%</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Job Growth (Next 5 Years)</p>
                  <span className="inline-block mt-2 text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">&check; Verified</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-xl font-mono font-black text-[#0b1a36]">$92K</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Avg. Entry Salary (Per Year)</p>
                  <span className="inline-block mt-2 text-[9px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded">&#9888; Estimated</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-xl font-mono font-black text-[#0b1a36]">1.2M</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Total Jobs (Next 5 Years)</p>
                  <span className="inline-block mt-2 text-[9px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded">&#9888; Estimated</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-xl font-black text-emerald-600">12%</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Remote Work Opportunities</p>
                  <span className="inline-block mt-2 text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">&check; Verified</span>
                </div>
              </div>
            </div>


            {/* HOW AI WILL RESHAPE THIS CAREER */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-4 text-left">
              <h3 className="text-base font-bold text-[#0b1a36]">How AI Will Reshape This Career</h3>

              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                  <p className="font-bold text-[#0b1a36]">Today</p>
                  <p className="text-slate-500">AI assists with code completion in testing and debugging.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                  <p className="font-bold text-[#0b1a36]">Near-term</p>
                  <p className="text-slate-500">More automation in testing and documentation.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                  <p className="font-bold text-[#0b1a36]">Long-term</p>
                  <p className="text-slate-500">AI will help with architecture and complex problem solving.</p>
                </div>
              </div>
            </div>


            {/* YOUR PATH FORWARD */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-4 text-left">
              <h3 className="text-base font-bold text-[#0b1a36]">Your Path Forward</h3>

              <div className="space-y-4 relative border-l-2 border-slate-200 ml-3 pl-5 text-xs">
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">1</span>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p className="font-bold text-[#0b1a36]">Learn the Basics (0-3 months)</p>
                    <ul className="text-slate-500 mt-2 space-y-1.5">
                      <li>&check; Java / Python basics</li>
                      <li>&check; DSA fundamentals</li>
                      <li>&check; Build small projects</li>
                    </ul>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-slate-300 text-white flex items-center justify-center font-bold text-xs">2</span>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p className="font-bold text-[#0b1a36]">Build Experience (3-6 months)</p>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-slate-300 text-white flex items-center justify-center font-bold text-xs">3</span>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p className="font-bold text-[#0b1a36]">Grow &amp; Specialize (6-12 months)</p>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-slate-300 text-white flex items-center justify-center font-bold text-xs">4</span>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p className="font-bold text-[#0b1a36]">Apply &amp; Get Hired (12+ months)</p>
                  </div>
                </div>
              </div>
            </div>


            {/* IF NOT THIS, THEN WHAT */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-4 text-left">
              <h3 className="text-base font-bold text-[#0b1a36]">If Not This, Then What?</h3>

              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <p className="font-bold text-[#0b1a36]">Data Analyst</p>
                  <p className="text-[11px] text-emerald-600 font-bold">&check; Good Match</p>
                  <p className="text-slate-500 text-[11px]">Trends, insights, data</p>
                  <button className="w-full mt-2 bg-[#0b1a36] hover:bg-[#122b59] text-white py-2 rounded-xl font-bold cursor-pointer">View Details</button>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <p className="font-bold text-[#0b1a36]">Web Developer</p>
                  <p className="text-[11px] text-emerald-600 font-bold">&check; Good Match</p>
                  <p className="text-slate-500 text-[11px]">Build web applications</p>
                  <button className="w-full mt-2 bg-[#0b1a36] hover:bg-[#122b59] text-white py-2 rounded-xl font-bold cursor-pointer">View Details</button>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <p className="font-bold text-[#0b1a36]">QA Engineer</p>
                  <p className="text-[11px] text-amber-600 font-bold">&#9888; Moderate Match</p>
                  <p className="text-slate-500 text-[11px]">Ensure product quality</p>
                  <button className="w-full mt-2 bg-[#0b1a36] hover:bg-[#122b59] text-white py-2 rounded-xl font-bold cursor-pointer">View Details</button>
                </div>
              </div>
            </div>


            {/* YOUR NEXT 6-12 MONTHS CHECKLIST */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-4 text-left">
              <h3 className="text-base font-bold text-[#0b1a36]">Your Next 6–12 Months Checklist</h3>

              <div className="space-y-3 text-xs">
                {[
                  'Complete DSA course',
                  'Build 2 real-world projects',
                  'Apply for internships',
                  'Prepare for placement tests',
                  'Attend mock interviews',
                ].map((item, idx) => (
                  <label key={idx} className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 cursor-pointer">
                    <input type="checkbox" defaultChecked={idx === 0} className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
                    <span className="font-semibold text-slate-800">{item}</span>
                  </label>
                ))}
              </div>

              <button className="w-full mt-4 bg-[#0b1a36] hover:bg-[#122b59] text-white py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm cursor-pointer">
                <span>&#128229;</span>
                <span>Download PDF</span>
              </button>
            </div>

          </div>
        )}


        {/* ========================================================= */}
        {/* PARENT VIEW SECTIONS                                      */}
        {/* ========================================================= */}
        {activeView === 'parent' && (
          <div className="space-y-6">

            {/* SNAPSHOT FOR PARENTS */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm text-left space-y-3">
              <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">Parent Advisory Lens</span>
              <h3 className="text-xl font-serif font-bold text-[#0b1a36]">A stable and promising career choice.</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This career offers good job stability, healthy long-term ROI, and aligns with your child&apos;s strengths and interests.
              </p>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Our Verdict</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">A strong and balanced choice for long-term growth.</p>
              </div>
            </div>

            {/* COMPARISON TABLE */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm text-left space-y-3">
              <h3 className="text-base font-bold text-[#0b1a36]">Comparison Table</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="pb-3">Career Path</th>
                      <th className="pb-3">Job Stability</th>
                      <th className="pb-3">Avg. Salary (LPA)</th>
                      <th className="pb-3 text-right">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    <tr className="bg-emerald-50/50"><td className="py-3 text-[#0b1a36] font-bold">Software Developer</td><td className="py-3 text-emerald-700">High</td><td className="py-3 font-mono">9–12</td><td className="py-3 text-right text-emerald-700">High</td></tr>
                    <tr><td className="py-3">Data Analyst</td><td className="py-3 text-emerald-700">High</td><td className="py-3 font-mono">7–10</td><td className="py-3 text-right text-amber-700">Medium</td></tr>
                    <tr><td className="py-3">UI/UX Designer</td><td className="py-3 text-amber-700">Medium</td><td className="py-3 font-mono">6–9</td><td className="py-3 text-right text-amber-700">Medium</td></tr>
                    <tr><td className="py-3">QA Engineer</td><td className="py-3 text-amber-700">Medium</td><td className="py-3 font-mono">5–8</td><td className="py-3 text-right text-amber-700">Medium</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* COST & PAYOFF */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm text-left space-y-4">
              <h3 className="text-base font-bold text-[#0b1a36]">Cost &amp; Payoff</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Investment (4 years)</p>
                  <p className="text-2xl font-mono font-black text-[#0b1a36] mt-1">&#8377;12,00,000</p>
                </div>
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                  <p className="text-[10px] text-emerald-700 font-bold uppercase">Expected Annual Pay (After 2-3 years)</p>
                  <p className="text-2xl font-mono font-black text-emerald-700 mt-1">&#8377;9,20,000</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">&check; Break-even:</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">~1.4 years</span>
              </div>
            </div>

            {/* COMMON PARENT QUESTIONS */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm text-left space-y-3">
              <h3 className="text-base font-bold text-[#0b1a36]">Common Parent Questions</h3>

              <div className="space-y-3">
                {[
                  'Is this career future-proof?',
                  'What is the job security like?',
                  'What are the work hours?',
                  'Will they be able to handle the pressure?',
                ].map((q, index) => (
                  <div key={index} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                    <button 
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full p-4 text-left font-bold text-xs text-[#0b1a36] flex justify-between items-center hover:bg-slate-100 transition cursor-pointer"
                    >
                      <span>{q}</span>
                      <span className="text-indigo-600">{openFaq === index ? '▲' : '▼'}</span>
                    </button>
                    {openFaq === index && (
                      <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-200 mt-1 bg-white">
                        Detailed data-backed insights provided by our decision engine to address guardian security considerations.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SUPPORT CHECKLIST */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm text-left space-y-4">
              <h3 className="text-base font-bold text-[#0b1a36]">Support Checklist</h3>

              <div className="grid sm:grid-cols-2 gap-3 text-xs font-semibold">
                {[
                  'Encourage skill development',
                  'Help build a good routine',
                  'Support career exploration',
                  'Keep the conversation open',
                  'Celebrate small wins',
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">&check;</span>
                    <span className="text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}