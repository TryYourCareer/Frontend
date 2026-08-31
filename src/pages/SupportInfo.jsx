import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LandingNavbar from "../components/LandingNavbar";
import LandingFooter from "../components/LandingFooter";
import { 
  HelpCircle, MessageSquare, Shield, FileText, ChevronDown, 
  Send, Loader2, CheckCircle2, Mail, Phone, MapPin 
} from "lucide-react";

export default function SupportInfo() {
  const { tabId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tabId || "help");

  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const [expandedFaq, setExpandedFaq] = useState(null);

  const isDark = false; // Strictly light theme!

  // Sync tab updates from URL parameter
  React.useEffect(() => {
    if (tabId && tabId !== activeTab) {
      setActiveTab(tabId);
    }
  }, [tabId, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/support/${tab}`);
  };

  // FAQs data
  const faqs = [
    { q: "Is the assessment diagnostic test completely free?", a: "Yes! The core Stride Journey diagnostics, career path selector, and basic simulator sandboxes are 100% free for all registered students." },
    { q: "What is the Elevate placement sponsorship program?", a: "Elevate matches high-performing students (based on simulation metrics and sandbox scores) with sponsored tech capstones and direct interview panels at partnered growth firms." },
    { q: "How do I join a professional career hub chat?", a: "Once you complete a career path assessment, you will unlock the corresponding public Career Hub. Active premium hubs (with dedicated industry architects) are open to students who complete the Stride Diagnostic." },
    { q: "Can I try coding sandboxes as an unauthenticated guest?", a: "Absolutely. Logged-out guests can try out interactive preview sandboxes directly on the landing page, but must create an account to record scores, join hubs, and unlock verified badges." }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setContactSubmitted(true);
      setTicketId(`TYC-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 flex flex-col bg-[#dfeaf7] text-[#0b1a36]">
      {/* Landing Navbar */}
      <LandingNavbar isDark={isDark} />

      <div className="flex-1 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Header Hero Banner */}
          <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-[#7B4A28]/10 text-[#7B4A28] px-3 py-1 rounded-full border border-[#7B4A28]/20">
              Support Center
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight leading-tight text-slate-900">
              We are here to help
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Need guidance on simulators, hubs, or placement tracks? Browse our resources or contact our student support team.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-3 border-b border-slate-200/60 pb-4 overflow-x-auto whitespace-nowrap scrollbar-none w-full max-w-2xl mx-auto">
            {[
              { id: "help", label: "Help Center", icon: HelpCircle },
              { id: "contact", label: "Contact Support", icon: MessageSquare },
              { id: "privacy", label: "Privacy Policy", icon: Shield },
              { id: "terms", label: "Terms of Service", icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition shadow-sm border shrink-0 ${
                    isActive
                      ? "bg-[#7B4A28] text-white border-transparent"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 md:p-10 shadow-xl text-left">
            
            {/* 1. Help Center Tab */}
            {activeTab === "help" && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black font-serif text-slate-900">Frequently Asked Questions</h2>
                  <p className="text-sm text-slate-500">Quick answers to common questions about TryYourCareers dashboards, sandboxes, and cohort placements.</p>
                </div>

                <div className="space-y-3 pt-2 max-w-3xl">
                  {faqs.map((faq, i) => (
                    <div 
                      key={i} 
                      className="border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between font-bold text-xs sm:text-sm text-slate-800"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown 
                          size={16} 
                          className={`text-slate-400 transition-transform ${expandedFaq === i ? "rotate-180" : ""}`} 
                        />
                      </button>
                      {expandedFaq === i && (
                        <div className="px-5 pb-4 pt-1 border-t border-slate-200/40 text-xs sm:text-sm text-slate-600 leading-relaxed animate-fade-in">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Contact Support Tab */}
            {activeTab === "contact" && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Contact form */}
                  <div className="lg:col-span-7 space-y-4">
                    <h2 className="text-2xl font-black font-serif text-slate-900">Submit a Ticket</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Can't find what you're looking for? Leave a message and we'll reply shortly.</p>

                    {contactSubmitted ? (
                      <div className="bg-emerald-500/10 text-emerald-800 p-6 rounded-2xl border border-emerald-500/20 space-y-3 animate-scale-in">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={20} className="text-emerald-550" />
                          <h4 className="text-sm font-bold">Ticket Submitted Successfully!</h4>
                        </div>
                        <p className="text-xs text-slate-550 leading-relaxed pl-8">
                          Your Support Ticket ID is <span className="font-bold font-mono text-[#7B4A28]">{ticketId}</span>. A confirmation has been sent to your email. Our team will review the issue and follow up within 2 hours.
                        </p>
                        <div className="pl-8 pt-2">
                          <button
                            onClick={() => setContactSubmitted(false)}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] px-4 py-2 rounded-xl transition"
                          >
                            Submit Another Ticket
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleContactSubmit} className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input 
                            required
                            type="text" 
                            placeholder="Your Name" 
                            className="p-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 text-slate-805"
                          />
                          <input 
                            required
                            type="email" 
                            placeholder="Email Address" 
                            className="p-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 text-slate-805"
                          />
                        </div>
                        <select 
                          required
                          className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 text-slate-700"
                        >
                          <option value="">Select Category</option>
                          <option value="tech">Technical Issue / Sandboxes</option>
                          <option value="assess">Assessment & Stride Diagnostic</option>
                          <option value="hiring">Partner Sponsorship & Elevate Cohorts</option>
                          <option value="other">General Inquiries</option>
                        </select>
                        <textarea 
                          required
                          rows="4" 
                          placeholder="Write your issue in detail..." 
                          className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 text-slate-805"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#7B4A28] hover:bg-[#643b20] text-white font-bold text-xs px-5 py-3 rounded-xl transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <>
                                <Send size={13} />
                                <span>Send Message</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Office Info card */}
                  <div className="lg:col-span-5 p-6 rounded-2xl bg-[#FAF6EC]/40 border border-slate-200/70 space-y-4">
                    <h3 className="text-sm font-black uppercase text-[#7B4A28]">Office Info</h3>
                    <div className="space-y-4 pt-2">
                      <div className="flex items-start gap-3">
                        <Mail size={16} className="text-[#7B4A28] mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Email Address</p>
                          <p className="text-xs text-slate-500">support@tryyourcareers.com</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone size={16} className="text-[#7B4A28] mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Helpline Phone</p>
                          <p className="text-xs text-slate-500">+91 98765 43210 (9 AM - 6 PM)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-[#7B4A28] mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Headquarters</p>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            9th Floor, Brigade Tech Park, Whitefield, Bangalore, Karnataka, 560066
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Privacy Policy Tab */}
            {activeTab === "privacy" && (
              <div className="space-y-6 animate-fade-in text-xs sm:text-sm leading-relaxed text-slate-600 max-w-4xl">
                <h2 className="text-2xl font-black font-serif text-slate-900 mb-4">Privacy Policy</h2>
                <p className="font-bold text-slate-500 mb-6">Last Updated: August 2026</p>
                
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800">1. Information We Collect</h3>
                  <p>
                    We collect information when you register an account, fill out profiles, complete diagnostic tests, or write/execute code logic in our sandbox simulator environments. This includes names, emails, diagnostic scores, community chat messages, and basic diagnostic answers.
                  </p>
                  
                  <h3 className="text-base font-bold text-slate-800">2. Simulator Sandbox Logging</h3>
                  <p>
                    In order to compute performance scores, diagnostic indices, and verify execution states, we log interactive testing indicators inside the compiler and sandbox mockups. No personal script files on your desktop are scanned or indexed.
                  </p>
                  
                  <h3 className="text-base font-bold text-slate-800">3. Data Sharing and Sponsorships</h3>
                  <p>
                    Your individual diagnostic scores and profile badges are completely private. If you apply for the Elevate placement sponsorship cohorts, you explicitly authorize sharing score metrics and portfolio summaries with partnered growth firms.
                  </p>
                </div>
              </div>
            )}

            {/* 4. Terms of Service Tab */}
            {activeTab === "terms" && (
              <div className="space-y-6 animate-fade-in text-xs sm:text-sm leading-relaxed text-slate-600 max-w-4xl">
                <h2 className="text-2xl font-black font-serif text-slate-900 mb-4">Terms of Service</h2>
                <p className="font-bold text-slate-500 mb-6">Last Updated: August 2026</p>
                
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800">1. Account Security and Integrity</h3>
                  <p>
                    By registering an account on TryYourCareers, you agree to safeguard your credentials and maintain score honesty. Sharing access with third parties to manipulate mock assessments or code results is strictly prohibited.
                  </p>
                  
                  <h3 className="text-base font-bold text-slate-800">2. Permitted Use of Sandboxes</h3>
                  <p>
                    Simulator sandbox tools (code compilers, quiz mockups, real-time channels) are provided for personal educational training only. Attempting to reverse engineer execution servers or script bot queries is a violation of these terms.
                  </p>
                  
                  <h3 className="text-base font-bold text-slate-800">3. Placement Disclaimers</h3>
                  <p>
                    Completion of Stride Stages, assessment indices, or participation in Elevate mentoring reviews provides placement support and interview eligibility but does not guarantee employment.
                  </p>
                </div>
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
