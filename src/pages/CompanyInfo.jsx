import React, { useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

import LandingNavbar from "../components/LandingNavbar";

import LandingFooter from "../components/LandingFooter";



import {
  Users,
  Briefcase,
  TrendingUp,
  Heart,
  Award,
  Sparkles,
  Clock,
  CheckCircle2,
  Smile,
  Building,
  Send,
  Compass,
  Target,
  Layers,
  Activity,
  FileText,
  GraduationCap,
  Search,
  MapPin,
  Mail,
  ArrowRight
} from "lucide-react";



import SEO from "../components/SEO";



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







  // Mock Success Stories

  const stories = [

    {

      name: "Rahul S.",

      from: "B.Com Student",

      to: "Backend Developer at Razorpay",

      quote:

        "The practice sandboxes completely flipped the script for me. Instead of just memorizing theory, I was tackling actual engineering problems. It gave me the courage and skills I needed to crush my technical interviews.",

      img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80"

    },

    {

      name: "Meena Nair",

      from: "Freelance Content Writer",

      to: "UX Architect at CureFit",

      quote:

        "Matching my creative background with transparent career guidelines made pivoting so much easier. The roadmap showed me exactly what my portfolio was lacking, and the daily mentor support kept me on track.",

      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80"

    }

  ];



  // Open job listings

  const jobs = [

    {

      id: "fe",

      title: "Frontend Engineering Intern",

      team: "Product & Tech",

      location: "Bangalore / Remote",

      type: "Stipend: ₹25k/mo",

      duration: "6 Months"

    },

    {

      id: "cm",

      title: "Community Hub Manager",

      team: "Marketing & Growth",

      location: "Remote",

      type: "Full-Time",

      duration: "Immediate"

    },

    {

      id: "ca",

      title: "Career Coach & Counselor",

      team: "Student Success",

      location: "Mumbai / Hybrid",

      type: "Part-Time",

      duration: "Immediate"

    }

  ];



  return (

    <div className="min-h-screen transition-colors duration-300 flex flex-col bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] text-[#0b1a36] font-sans">

      <SEO

        title={

          activeTab === "about"

            ? "About Us"

            : activeTab === "careers"

            ? "Careers & Open Roles"

            : activeTab === "elevate"

            ? "Elevate Program"

            : activeTab === "stories"

            ? "Student Success Stories"

            : "Company"

        }

        description={

          activeTab === "about"

            ? "Learn about Try Your Career, our mission to make career exploration more practical, structured, and evidence-based."

            : activeTab === "careers"

            ? "Explore open positions, internships, and work culture at Try Your Career."

            : activeTab === "elevate"

            ? "Discover the Elevate program connecting top simulator performers with sponsored capstone projects and interviews."

            : "Read how students transitioned into tech roles and mastered simulator sandboxes on Try Your Career."

        }

        url={`/company/${activeTab}`}

      />



      {/* Landing Navbar */}

      <LandingNavbar isDark={isDark} />



      <div className="flex-1 py-8 sm:py-12 px-3 sm:px-6">

        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">



          {/* Header Hero Banner */}

          <div className="text-center space-y-4 max-w-2xl mx-auto pt-2 sm:pt-4">

            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-sky-50 text-[#1E88E5] px-3.5 py-1 rounded-full border border-sky-200">

              Company Hub

            </span>



            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold tracking-tight leading-tight text-[#0b1a36]">

              Shaping Career Reality

            </h1>



            <p className="text-sm sm:text-base text-slate-600 leading-relaxed px-2 sm:px-0">

              We create realistic practice simulators, clear career steps, and helpful mentor networks so students can step into tech jobs feeling totally ready.

            </p>

          </div>



          {/* Navigation Tabs */}

          <div className="w-full max-w-2xl mx-auto border-b border-[#D3E3F5] pb-3 sm:pb-4">

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-center sm:gap-2.5">

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

                    className={`

                      flex items-center justify-center gap-1.5

                      w-full sm:w-auto

                      min-h-[40px]

                      px-2.5 py-2 sm:px-4 sm:py-2

                      rounded-xl sm:rounded-full

                      text-[11px] sm:text-xs

                      font-bold

                      transition-all duration-200

                      border

                      cursor-pointer

                      active:scale-[0.98]

                      ${

                        isActive

                          ? "bg-[#0b1a36] text-white border-[#0b1a36] shadow-sm"

                          : "bg-white border-[#D3E3F5] text-slate-650 hover:bg-[#F0F6FC] hover:border-[#b9cee5]"

                      }

                    `}

                  >

                    <Icon

                      size={14}

                      className={`shrink-0 ${

                        isActive ? "text-white" : "text-[#1E88E5]"

                      }`}

                    />



                    <span className="truncate">

                      {tab.label}

                    </span>

                  </button>

                );

              })}

            </div>

          </div>



          {/* Tab Content Section */}

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D3E3F5] p-4 sm:p-6 md:p-8 lg:p-10 shadow-xs text-left">



            {/* 1. About Us Tab */}
            {activeTab === "about" && (
              <div className="space-y-10 animate-fade-in">

                {/* 1. Mission / Introduction */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  <div className="lg:col-span-7 space-y-4 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[#1E88E5] text-[11px] font-bold uppercase tracking-wider w-fit">
                      <Compass size={13} />
                      <span>Our Mission</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-sans font-bold text-[#0b1a36] leading-snug">
                      Practical Career Exploration Before Important Decisions
                    </h2>

                    <p className="text-sm leading-relaxed text-slate-600">
                      Try Your Career is a career exploration platform that helps people understand careers more practically before making important career decisions.
                    </p>

                    <p className="text-sm leading-relaxed text-slate-600">
                      Choosing a career is one of the most critical decisions an individual makes, yet it is often made with limited exposure to the actual day-to-day work involved. Try Your Career exists to make career exploration practical, structured, and evidence-based—giving learners and explorers better information and practical context before deciding what to pursue next.
                    </p>
                  </div>

                  <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#F0F6FC] border border-[#D3E3F5] space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E88E5] mb-3">
                        Exploration Framework
                      </h3>
                      <div className="space-y-3">
                        {[
                          {
                            title: "Practical Exploration",
                            desc: "Explore day-to-day workplace tasks and problem-solving beyond static titles."
                          },
                          {
                            title: "Structured Experience",
                            desc: "Engage with interactive Trial Missions to experience representative work."
                          },
                          {
                            title: "Evidence-Based Insights",
                            desc: "Gather observations and data from activities to inform personal reflections."
                          },
                          {
                            title: "Informed Decision-Making",
                            desc: "Equip students, parents, and explorers with objective clarity for next steps."
                          }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{item.title}</p>
                              <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. The Problem */}
                <div className="pt-8 border-t border-[#D3E3F5] space-y-5">
                  <div className="max-w-2xl space-y-2">
                    <h3 className="text-xl font-sans font-bold text-[#0b1a36]">
                      The Problem We Address
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Traditional career discovery often relies on superficial titles and ungrounded assumptions rather than realistic exposure to the work.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        title: "Knowing Titles vs. Understanding Work",
                        desc: "People frequently recognize career names without understanding the specific tasks, tools, problem-solving, and daily routine required in the role."
                      },
                      {
                        title: "Decisions Influenced by Incomplete Information",
                        desc: "Career choices are often influenced by social pressure, fleeting trends, expectations, or salary perceptions without understanding the day-to-day responsibilities."
                      },
                      {
                        title: "Job Descriptions Lack Practical Exposure",
                        desc: "Reading static job descriptions alone does not give someone practical exposure to what doing the work actually feels like."
                      },
                      {
                        title: "High-Stakes Discovery Occurs Too Late",
                        desc: "People may spend significant time and resources pursuing a path before discovering that the actual work does not match their expectations."
                      }
                    ].map((prob, idx) => (
                      <div
                        key={idx}
                        className="bg-[#F0F6FC] p-4 sm:p-5 rounded-2xl border border-[#D3E3F5] space-y-2"
                      >
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1E88E5] shrink-0" />
                          {prob.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {prob.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. How Try Your Career Works */}
                <div className="pt-8 border-t border-[#D3E3F5] space-y-5">
                  <div className="max-w-2xl space-y-2">
                    <h3 className="text-xl font-sans font-bold text-[#0b1a36]">
                      How Try Your Career Works
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      A structured, step-by-step exploration journey designed to build understanding and practical evidence.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        num: "01",
                        title: "Explore",
                        desc: "Understand careers, roles, responsibilities, skills, and relevant career information across industries."
                      },
                      {
                        num: "02",
                        title: "Assess",
                        desc: "Use the platform's available structured assessments as part of the exploration process."
                      },
                      {
                        num: "03",
                        title: "Experience",
                        desc: "Use Trial Missions and practical career activities to experience representative work."
                      },
                      {
                        num: "04",
                        title: "Reflect & Decide",
                        desc: "Use the information, observations, decisions, evidence, and available career intelligence to better understand possible next steps."
                      }
                    ].map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-[#F0F6FC] p-5 rounded-2xl border border-[#D3E3F5] relative space-y-2"
                      >
                        <span className="text-2xl font-black text-[#1E88E5]/20 absolute top-4 right-4">
                          {step.num}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 pt-1">
                          {step.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. What the Platform Provides */}
                <div className="pt-8 border-t border-[#D3E3F5] space-y-5">
                  <div className="max-w-2xl space-y-2">
                    <h3 className="text-xl font-sans font-bold text-[#0b1a36]">
                      What the Platform Provides
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Actual product capabilities available on Try Your Career to support career discovery and decision clarity.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        icon: Search,
                        title: "Career Discovery & Information",
                        desc: "Detailed career profiles detailing daily tasks, core skills, salary benchmarks, and occupational context."
                      },
                      {
                        icon: Target,
                        title: "Structured Assessments",
                        desc: "Guided diagnostic evaluations to help users explore interests, aptitudes, and domain alignment."
                      },
                      {
                        icon: Layers,
                        title: "Trial Missions",
                        desc: "Practical career activities that allow users to experience representative workplace problem-solving."
                      },
                      {
                        icon: Activity,
                        title: "Career Intelligence",
                        desc: "Structured domain overviews, industry clusters, and comparative data to evaluate career landscapes."
                      },
                      {
                        icon: FileText,
                        title: "Decision & Parent Reports",
                        desc: "Structured reports summarizing exploration progress, observations, and recommendations for users and families."
                      },
                      {
                        icon: Compass,
                        title: "Roadmaps & Action Planning",
                        desc: "Step-by-step milestones outlining skill development and progression pathways for chosen career fields."
                      }
                    ].map((cap, idx) => {
                      const Icon = cap.icon;
                      return (
                        <div
                          key={idx}
                          className="bg-[#F0F6FC] p-5 rounded-2xl border border-[#D3E3F5] space-y-2.5"
                        >
                          <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#1E88E5] border border-sky-200 flex items-center justify-center">
                            <Icon size={15} />
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                            {cap.title}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                            {cap.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. What Makes Our Approach Different */}
                <div className="pt-8 border-t border-[#D3E3F5] space-y-5">
                  <div className="max-w-2xl space-y-2">
                    <h3 className="text-xl font-sans font-bold text-[#0b1a36]">
                      What Makes the Approach Different
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Core principles that guide how Try Your Career approaches career exploration.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        title: "Experience Before Commitment",
                        desc: "People should have opportunities to understand and experience representative career work before committing to a path."
                      },
                      {
                        title: "Evidence Over Assumptions",
                        desc: "Career exploration should use observable activities, decisions, information, and relevant evidence instead of relying only on assumptions."
                      },
                      {
                        title: "Clarity Over Hype",
                        desc: "The platform should help people understand careers realistically without promising guaranteed outcomes."
                      },
                      {
                        title: "The Decision Remains With the User",
                        desc: "Try Your Career supports the decision with information and structured experiences. It does not make the decision on behalf of the user."
                      }
                    ].map((diff, idx) => (
                      <div
                        key={idx}
                        className="bg-[#F0F6FC] p-5 rounded-2xl border border-[#D3E3F5] space-y-2"
                      >
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                          <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                          <span>{diff.title}</span>
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed pl-6">
                          {diff.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Who Try Your Career Is For */}
                <div className="pt-8 border-t border-[#D3E3F5] space-y-5">
                  <div className="max-w-2xl space-y-2">
                    <h3 className="text-xl font-sans font-bold text-[#0b1a36]">
                      Who Try Your Career Is For
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Designed for anyone seeking practical clarity when evaluating career directions.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        icon: GraduationCap,
                        title: "Students & Learners",
                        desc: "School and college students seeking practical understanding of careers before deciding on academic paths, degrees, or majors."
                      },
                      {
                        icon: Briefcase,
                        title: "Recent Graduates",
                        desc: "Graduates exploring entry options and gaining realistic exposure to job responsibilities."
                      },
                      {
                        icon: Compass,
                        title: "Career Explorers & Changers",
                        desc: "People considering a career change and evaluating new professional fields through structured exploration."
                      },
                      {
                        icon: Users,
                        title: "Parents & Guardians",
                        desc: "Parents looking for objective career information and structured reports to support their children's exploration."
                      }
                    ].map((aud, idx) => {
                      const Icon = aud.icon;
                      return (
                        <div
                          key={idx}
                          className="bg-[#F0F6FC] p-5 rounded-2xl border border-[#D3E3F5] space-y-2.5"
                        >
                          <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#1E88E5] border border-sky-200 flex items-center justify-center">
                            <Icon size={15} />
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                            {aud.title}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                            {aud.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 7. Company Information */}
                <div className="pt-8 border-t border-[#D3E3F5] space-y-4">
                  <div className="max-w-2xl space-y-1">
                    <h3 className="text-xl font-sans font-bold text-[#0b1a36]">
                      Company Information
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Corporate details and registered office of Try Your Career.
                    </p>
                  </div>

                  <div className="bg-[#F0F6FC] p-5 sm:p-6 rounded-2xl border border-[#D3E3F5] grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E88E5]">
                        <Building size={14} />
                        <span>Legal Entity</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        TRY YOUR CAREER PRIVATE LIMITED
                      </p>
                      <p className="text-xs text-slate-500">
                        Hyderabad, Telangana, India
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E88E5]">
                        <MapPin size={14} />
                        <span>Registered Address</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Plot No. 43, Sy No. 3 and 4/part,<br />
                        Satyanarayanapuram Colony, Peerzadiguda,<br />
                        Ghatkesar, Hyderabad, Telangana, 500098, India
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E88E5]">
                        <Mail size={14} />
                        <span>Contact</span>
                      </div>
                      <p className="text-xs text-slate-700">
                        Direct Inquiries:
                      </p>
                      <a
                        href="mailto:tryyourcareer@gmail.com"
                        className="text-xs font-bold text-[#1E88E5] hover:underline block"
                      >
                        tryyourcareer@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* 8. Final CTA */}
                <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-sky-50 to-[#E9F3FC] border border-[#D3E3F5] flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                  <div className="space-y-1 max-w-xl">
                    <h3 className="text-base sm:text-lg font-bold text-[#0b1a36]">
                      Begin Your Career Exploration
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Explore careers, experience representative work through Trial Missions, and make informed decisions with practical evidence.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (token) {
                        navigate("/dashboard");
                      } else {
                        navigate("/explore-careers");
                      }
                    }}
                    className="bg-[#0b1a36] hover:bg-[#122b59] text-white font-bold text-xs px-6 py-3 rounded-full transition shadow-xs whitespace-nowrap active:scale-95 cursor-pointer flex items-center justify-center gap-2 w-full md:w-auto shrink-0"
                  >
                    <span>Explore Careers</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

              </div>
            )}



            {/* 2. Elevate Program Tab */}

            {activeTab === "elevate" && (

              <div className="space-y-8 animate-fade-in">



                <div className="space-y-3">

                  <h2 className="text-2xl font-sans font-bold text-[#0b1a36]">

                    The Elevate Program

                  </h2>



                  <p className="text-sm leading-relaxed text-slate-600 max-w-3xl">

                    Elevate is our premier internship and coaching bridge that takes our top sandbox performers and turns them into job-backed professionals with formal company backing.

                  </p>

                </div>



                {/* Steps timeline */}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">

                  {[

                    {

                      num: "01",

                      name: "Simulate & Qualify",

                      desc: "Progress through our learning milestones and pass the hands-on diagnostic tests."

                    },

                    {

                      num: "02",

                      name: "1-on-1 Hub Review",

                      desc: "Get paired with industry experts for weekly feedback on your code and design projects."

                    },

                    {

                      num: "03",

                      name: "Production Capstone",

                      desc: "Work on real feature updates and tasks for fast-growing startup partners."

                    },

                    {

                      num: "04",

                      name: "Direct Placement",

                      desc: "Skip the usual queue with fast-tracked interviews at partner companies like Razorpay and CureFit."

                    }

                  ].map((step, i) => (

                    <div

                      key={i}

                      className="bg-[#F0F6FC] p-5 rounded-2xl border border-[#D3E3F5] relative space-y-3"

                    >

                      <span className="text-3xl font-black text-[#1E88E5]/15 absolute top-4 right-4">

                        {step.num}

                      </span>



                      <h4 className="text-sm font-bold text-slate-800 pt-2">

                        {step.name}

                      </h4>



                      <p className="text-xs text-slate-500 leading-relaxed">

                        {step.desc}

                      </p>

                    </div>

                  ))}

                </div>



                <div className="p-5 sm:p-6 rounded-2xl bg-[#F0F6FC] border border-[#D3E3F5] flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">

                  <div>

                    <h3 className="text-sm font-bold text-slate-800">

                      Ready to join our next batch?

                    </h3>



                    <p className="text-xs text-slate-500">

                      New groups start every quarter. Just hit your assessment targets to qualify.

                    </p>

                  </div>



                  <button

                    onClick={() => {

                      if (token) {

                        navigate("/dashboard");

                      } else {

                        setIsLoginOpen(true);

                      }

                    }}

                    className="bg-[#0b1a36] hover:bg-[#122b59] text-white font-bold text-xs px-5 py-3 rounded-full transition shadow-xs whitespace-nowrap active:scale-95 cursor-pointer w-full md:w-auto"

                  >

                    Start Assessment

                  </button>

                </div>



              </div>

            )}



            {/* 3. Success Stories Tab */}

            {activeTab === "stories" && (

              <div className="space-y-8 animate-fade-in">



                <div className="space-y-2">

                  <h2 className="text-2xl font-sans font-bold text-[#0b1a36]">

                    Student Success Stories

                  </h2>



                  <p className="text-sm text-slate-500">

                    Read how everyday students successfully shifted their careers, mastered our practice environments, and landed real tech jobs.

                  </p>

                </div>



                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

                  {stories.map((st, i) => (

                    <div

                      key={i}

                      className="flex flex-col bg-[#F0F6FC] rounded-2xl border border-[#D3E3F5] p-5 sm:p-6 space-y-4"

                    >

                      <div className="flex items-start gap-4">

                        <img

                          src={st.img}

                          alt={st.name}

                          className="w-14 h-14 rounded-full object-cover border border-[#D3E3F5] shrink-0"

                        />



                        <div className="min-w-0">

                          <h4 className="text-sm font-bold text-slate-800">

                            {st.name}

                          </h4>



                          <p className="text-[11px] font-bold text-slate-400">

                            {st.from}

                          </p>



                          <p className="text-xs font-bold text-emerald-600 flex items-start gap-1 mt-1">

                            <TrendingUp size={12} className="shrink-0 mt-0.5" />

                            <span>{st.to}</span>

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

                    <h2 className="text-2xl font-sans font-bold text-[#0b1a36]">

                      Open Roles

                    </h2>



                    <div className="space-y-4">

                      {jobs.map((job) => (

                        <div

                          key={job.id}

                          className="bg-[#F0F6FC] p-4 sm:p-5 rounded-2xl border border-[#D3E3F5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-300 transition-all"

                        >

                          <div className="space-y-1 min-w-0">

                            <h4 className="text-sm font-bold text-slate-800">

                              {job.title}

                            </h4>



                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] font-bold text-slate-500">

                              <span className="flex items-center gap-1">

                                <Building size={10} />

                                {job.team}

                              </span>



                              <span className="flex items-center gap-1">

                                <Clock size={10} />

                                {job.duration}

                              </span>



                              <span className="text-[#1E88E5] font-bold">

                                {job.type}

                              </span>

                            </div>

                          </div>



                          <button

                            onClick={() => {

                              setApplyingFor(job.title);

                              setApplicationSubmitted(false);

                            }}

                            className="bg-[#0b1a36] hover:bg-[#122b59] text-white font-bold text-xs px-4 py-2 rounded-full transition active:scale-95 cursor-pointer shadow-2xs shrink-0 w-full sm:w-auto"

                          >

                            Apply

                          </button>

                        </div>

                      ))}

                    </div>

                  </div>



                  {/* Culture Perks */}

                  <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#F0F6FC] border border-[#D3E3F5] space-y-4">

                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E88E5]">

                      Work Culture Benefits

                    </h3>



                    <div className="space-y-3.5">

                      {[

                        {

                          icon: Heart,

                          title: "Wellness First",

                          desc: "Enjoy flexible hours, hybrid work arrangements, and a dedicated wellness budget."

                        },

                        {

                          icon: Sparkles,

                          title: "Builder Mindset",

                          desc: "We care more about building and testing practical prototypes than heavy paperwork."

                        },

                        {

                          icon: Users,

                          title: "Inclusive Vibe",

                          desc: "Work side-by-side with teammates where everyone's voice carries equal weight."

                        }

                      ].map((perk, i) => {

                        const Icon = perk.icon;



                        return (

                          <div key={i} className="flex gap-3">

                            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#1E88E5] border border-sky-200 flex items-center justify-center shrink-0">

                              <Icon size={14} />

                            </div>



                            <div>

                              <p className="text-xs font-bold text-slate-800">

                                {perk.title}

                              </p>



                              <p className="text-[11px] text-slate-500">

                                {perk.desc}

                              </p>

                            </div>

                          </div>

                        );

                      })}

                    </div>

                  </div>



                </div>



                {/* Applying Mock form */}

                {applyingFor && (

                  <div className="p-5 sm:p-6 rounded-2xl bg-sky-50/70 border border-sky-200 max-w-xl animate-scale-in space-y-4">



                    <div className="flex justify-between items-start gap-4">

                      <h3 className="text-sm font-bold text-slate-800">

                        Apply:{" "}

                        <span className="text-[#1E88E5]">

                          {applyingFor}

                        </span>

                      </h3>



                      <button

                        onClick={() => setApplyingFor(null)}

                        className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"

                      >

                        Cancel

                      </button>

                    </div>



                    {applicationSubmitted ? (

                      <div className="bg-emerald-500/10 text-emerald-800 p-4 rounded-xl border border-emerald-500/20 flex items-center gap-3">

                        <CheckCircle2

                          size={16}

                          className="text-emerald-500 shrink-0"

                        />



                        <span className="text-xs font-bold">

                          Application submitted! We will email you back within 3 days.

                        </span>

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

                            className="bg-[#0b1a36] hover:bg-[#122b59] text-white font-bold text-xs px-4 py-2 rounded-full transition flex items-center justify-center gap-1.5 active:scale-95 shadow-xs cursor-pointer w-full sm:w-auto"

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