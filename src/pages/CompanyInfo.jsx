import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LandingNavbar from "../components/LandingNavbar";
import LandingFooter from "../components/LandingFooter";
import { 
  Users, Briefcase, TrendingUp, Heart, Award, Sparkles, 
  Clock, CheckCircle2, Smile, Building, Send 
} from "lucide-react";

export default function CompanyInfo() {
  const { tabId } = useParams();
  const navigate = useNavigate();
  const { token, setIsLoginOpen } = useAuth();
  const [activeTab, setActiveTab] = useState(tabId || "about");

  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [applyingFor, setApplyingFor] = useState(null);

  const isDark = false; // Strictly light theme as requested!

  // Sync tab updates from URL parameter if changed
  React.useEffect(() => {
    if (tabId && tabId !== activeTab) {
      setActiveTab(tabId);
    }
  }, [tabId, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/company/${tab}`);
  };

  // Mock Data for Team members
  const team = [
    { name: "Ananya Sharma", role: "Co-Founder & CEO", desc: "Ex-Product Leader, passionate about closing the skill gap.", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
    { name: "Rohit Verma", role: "Chief of Pedagogy", desc: "Former Educator with 12+ years of curriculum design.", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80" },
    { name: "Sneha Patel", role: "Head of Community", desc: "Creating space for collaboration and peer learning hubs.", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" }
  ];

  // Mock Success Stories
  const stories = [
    { name: "Rahul S.", from: "B.Com Student", to: "Backend Developer at Razorpay", quote: "The simulator code sandboxes changed everything. I wasn't just learning concepts; I was solving actual production tasks. It gave me the coding confidence I needed to ace the technical round.", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80" },
    { name: "Meera Nair", from: "Freelance Content Writer", to: "UX Architect at CureFit", quote: "Aligning my creative skills with clear career metrics helped me pivot. The pathway maps showed me exactly what portfolio elements were missing, and the mentor hub supported me daily.", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80" }
  ];

  // Open job listings
  const jobs = [
    { id: "fe", title: "Frontend Engineering Intern", team: "Product & Tech", location: "Bangalore / Remote", type: "Stipend: ₹25k/mo", duration: "6 Months" },
    { id: "cm", title: "Community Hub Manager", team: "Marketing & Growth", location: "Remote", type: "Full-Time", duration: "Immediate" },
    { id: "ca", title: "Career Coach & Counselor", team: "Student Success", location: "Mumbai / Hybrid", type: "Part-Time", duration: "Immediate" }
  ];

  return (
    <div className="min-h-screen transition-colors duration-300 flex flex-col bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] text-[#0b1a36] font-sans">
      {/* Landing Navbar */}
      <LandingNavbar isDark={isDark} />

      <div className="flex-1 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Header Hero Banner */}
          <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-sky-50 text-[#1E88E5] px-3.5 py-1 rounded-full border border-sky-200">
              Company Hub
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight leading-tight text-[#0b1a36]">
              Shaping Career Reality
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              We build simulator sandboxes, structure real metrics, and foster mentor hubs to help students step into their dream careers with confidence.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-3 border-b border-[#D3E3F5] pb-4 overflow-x-auto whitespace-nowrap scrollbar-none w-full max-w-2xl mx-auto">
            {[
              { id: "about", label: "About Us", icon: Building },
              { id: "elevate", label: "Elevate Program", icon: Award },
              { id: "stories", label: "Success Stories", icon: Smile },
              { id: "careers", label: "Careers", icon: Briefcase }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition shadow-xs border shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-[#0b1a36] text-white border-transparent"
                      : "bg-white border-[#D3E3F5] text-slate-650 hover:bg-[#F0F6FC]"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-white" : "text-[#1E88E5]"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Section */}
          <div className="bg-white rounded-3xl border border-[#D3E3F5] p-6 sm:p-8 md:p-10 shadow-xs text-left">
            
            {/* 1. About Us Tab */}
            {activeTab === "about" && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <h2 className="text-2xl font-serif font-bold text-[#0b1a36]">Our Mission</h2>
                    <p className="text-sm leading-relaxed text-slate-600">
                      For decades, students have graduated with textbook definitions but zero actual hands-on career confidence. We founded TryYourCareers to shatter this disconnect.
                    </p>
                    <p className="text-sm leading-relaxed text-slate-600">
                      We offer interactive sandbox tours where students can solve code test suites, adjust professional UI layouts, and analyze salary growth models. We're here to make real-world professional environments completely transparent and accessible.
                    </p>
                  </div>
                  <div className="lg:col-span-5 p-6 rounded-2xl bg-[#F0F6FC] border border-[#D3E3F5] space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E88E5]">Core Values</h3>
                    <div className="space-y-3">
                      {[
                        { title: "Sandbox First", desc: "No boring presentations. Build, debug, and play inside active simulations." },
                        { title: "Metric Transparency", desc: "Real salary bands, automation indices, and placement tracks." },
                        { title: "Community Cohesion", desc: "Connect with mentors, ask daily QAs, and learn together." }
                      ].map((val, i) => (
                        <div key={i} className="flex gap-3">
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{val.title}</p>
                            <p className="text-[11px] text-slate-500">{val.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Team Grid */}
                <div className="pt-6 border-t border-[#D3E3F5] space-y-4">
                  <h3 className="text-lg font-serif font-bold text-[#0b1a36]">The Core Team</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {team.map((t, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-[#F0F6FC] p-4 rounded-2xl border border-[#D3E3F5]">
                        <img src={t.img} alt={t.name} className="w-12 h-12 rounded-xl object-cover border border-[#D3E3F5]" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{t.name}</h4>
                          <p className="text-[10px] font-bold text-[#1E88E5]">{t.role}</p>
                          <p className="text-[11px] text-slate-500 mt-1">{t.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Elevate Program Tab */}
            {activeTab === "elevate" && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-3">
                  <h2 className="text-2xl font-serif font-bold text-[#0b1a36]">The Elevate Program</h2>
                  <p className="text-sm leading-relaxed text-slate-600 max-w-3xl">
                    Elevate is our flagship internship & mentorship bridge, turning top-performing sandbox students into placement-ready graduates with official corporate sponsorship.
                  </p>
                </div>

                {/* Steps timeline */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
                  {[
                    { num: "01", name: "Simulate & Qualify", desc: "Complete Stride Journey stages and finish the interactive diagnostic tests." },
                    { num: "02", name: "1-on-1 Hub Review", desc: "Get matched with professional architects for weekly code/design reviews." },
                    { num: "03", name: "Production Capstone", desc: "Build feature upgrades for partnered high-growth tech startups." },
                    { num: "04", name: "Direct Placement", desc: "Fast-track interviews with partners (Razorpay, CureFit, and more)." }
                  ].map((step, i) => (
                    <div key={i} className="bg-[#F0F6FC] p-5 rounded-2xl border border-[#D3E3F5] relative space-y-3">
                      <span className="text-3xl font-black text-[#1E88E5]/15 absolute top-4 right-4">{step.num}</span>
                      <h4 className="text-sm font-bold text-slate-800 pt-2">{step.name}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-6 rounded-2xl bg-[#F0F6FC] border border-[#D3E3F5] flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Want to join the next cohort?</h3>
                    <p className="text-xs text-slate-500">Applications open every quarter. You must complete your assessment score metrics to qualify.</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (token) {
                        navigate("/dashboard");
                      } else {
                        setIsLoginOpen(true);
                      }
                    }}
                    className="bg-[#0b1a36] hover:bg-[#122b59] text-white font-bold text-xs px-5 py-3 rounded-full transition shadow-xs whitespace-nowrap active:scale-95 cursor-pointer"
                  >
                    Start Assessment Qualifying
                  </button>
                </div>
              </div>
            )}

            {/* 3. Success Stories Tab */}
            {activeTab === "stories" && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="text-2xl font-serif font-bold text-[#0b1a36]">Student Success Stories</h2>
                  <p className="text-sm text-slate-500">See how students pivoted, mastered simulated environments, and unlocked verified positions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {stories.map((st, i) => (
                    <div key={i} className="flex flex-col bg-[#F0F6FC] rounded-2xl border border-[#D3E3F5] p-6 space-y-4">
                      <div className="flex items-center gap-4">
                        <img src={st.img} alt={st.name} className="w-14 h-14 rounded-full object-cover border border-[#D3E3F5]" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{st.name}</h4>
                          <p className="text-[11px] font-bold text-slate-400">{st.from}</p>
                          <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <TrendingUp size={12} />
                            {st.to}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs italic text-slate-600 leading-relaxed pt-2">
                        "{st.quote}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Careers Tab */}
            {activeTab === "careers" && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Job postings */}
                  <div className="lg:col-span-7 space-y-5">
                    <h2 className="text-2xl font-serif font-bold text-[#0b1a36]">Open Roles</h2>
                    <div className="space-y-4">
                      {jobs.map((job) => (
                        <div key={job.id} className="bg-[#F0F6FC] p-5 rounded-2xl border border-[#D3E3F5] flex justify-between items-center gap-4 hover:border-slate-300 transition-all">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-800">{job.title}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-500">
                              <span className="flex items-center gap-1"><Building size={10} />{job.team}</span>
                              <span className="flex items-center gap-1"><Clock size={10} />{job.duration}</span>
                              <span className="text-[#1E88E5] font-bold">{job.type}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setApplyingFor(job.title);
                              setApplicationSubmitted(false);
                            }}
                            className="bg-[#0b1a36] hover:bg-[#122b59] text-white font-bold text-xs px-3.5 py-2 rounded-full transition active:scale-95 cursor-pointer shadow-2xs"
                          >
                            Apply
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Culture Perks */}
                  <div className="lg:col-span-5 p-6 rounded-2xl bg-[#F0F6FC] border border-[#D3E3F5] space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E88E5]">Work Culture Benefits</h3>
                    <div className="space-y-3.5">
                      {[
                        { icon: Heart, title: "Wellness First", desc: "Flexible hours, hybrid schedules, and dedicated health stipend." },
                        { icon: Sparkles, title: "Builder Mindset", desc: "We favor prototypes and testing over massive documents." },
                        { icon: Users, title: "Inclusive Vibe", desc: "Collaborate closely with team partners on equal footing." }
                      ].map((perk, i) => {
                        const Icon = perk.icon;
                        return (
                          <div key={i} className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#1E88E5] border border-sky-200 flex items-center justify-center shrink-0">
                              <Icon size={14} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{perk.title}</p>
                              <p className="text-[11px] text-slate-500">{perk.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Applying Mock form */}
                {applyingFor && (
                  <div className="p-6 rounded-2xl bg-sky-50/70 border border-sky-200 max-w-xl animate-scale-in space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-slate-800">
                        Apply: <span className="text-[#1E88E5]">{applyingFor}</span>
                      </h3>
                      <button 
                        onClick={() => setApplyingFor(null)}
                        className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    {applicationSubmitted ? (
                      <div className="bg-emerald-500/10 text-emerald-800 p-4 rounded-xl border border-emerald-500/20 flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-xs font-bold">Application submitted! We will email you back within 3 days.</span>
                      </div>
                    ) : (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          setApplicationSubmitted(true);
                        }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                      >
                        <input 
                          required
                          type="text" 
                          placeholder="Full Name" 
                          className="p-2.5 rounded-xl border border-[#D3E3F5] bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-400 shadow-2xs"
                        />
                        <input 
                          required
                          type="email" 
                          placeholder="Email Address" 
                          className="p-2.5 rounded-xl border border-[#D3E3F5] bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-400 shadow-2xs"
                        />
                        <input 
                          required
                          type="url" 
                          placeholder="Portfolio / LinkedIn Link" 
                          className="sm:col-span-2 p-2.5 rounded-xl border border-[#D3E3F5] bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-400 shadow-2xs"
                        />
                        <div className="sm:col-span-2 flex justify-end">
                          <button
                            type="submit"
                            className="bg-[#0b1a36] hover:bg-[#122b59] text-white font-bold text-xs px-4 py-2 rounded-full transition flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
                          >
                            <Send size={11} />
                            <span>Submit Application</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Landing Footer */}
      <LandingFooter isDark={isDark} />
    </div>
  );
}