import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LandingNavbar from "../components/LandingNavbar";
import LandingFooter from "../components/LandingFooter";
import { 
  HelpCircle, MessageSquare, Shield, FileText, ChevronDown, 
  Send, Loader2, CheckCircle2, Mail, Phone, MapPin 
} from "lucide-react";
import SEO from "../components/SEO";

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
    { q: "Is the assessment diagnostic test completely free?", a: "Yes! The main Stride Journey diagnostics, career path tools, and basic practice sandboxes are completely free for all signed-up students." },
    { q: "What is the Elevate placement sponsorship program?", a: "Elevate connects top-performing students (judged by their simulation stats and sandbox scores) with sponsored tech projects and direct interviews at our partner startups." },
    { q: "How do I join a professional career hub chat?", a: "Finishing a career path assessment unlocks your access to that public Career Hub. Active premium hubs (featuring real industry experts) become available once you complete the Stride Diagnostic." },
    { q: "Can I try coding sandboxes as an unauthenticated guest?", a: "Definitely! Guests who aren't logged in can test out our preview sandboxes right on the landing page. However, you'll need to create an account to save your scores, join chats, and earn verified badges." }
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
    <div className="min-h-screen transition-colors duration-300 flex flex-col bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] text-[#0b1a36]">
      <SEO
        title={
          activeTab === "help" || activeTab === "faq"
            ? "Help Center & FAQ"
            : activeTab === "contact"
            ? "Contact Support"
            : activeTab === "privacy"
            ? "Privacy Policy"
            : activeTab === "terms"
            ? "Terms of Service"
            : "Support Center"
        }
        description={
          activeTab === "help" || activeTab === "faq"
            ? "Find answers to frequently asked questions about Try Your Career assessments, diagnostic testing, practice sandboxes, and learning roadmaps."
            : activeTab === "contact"
            ? "Get in touch with the Try Your Career student support team for assistance with accounts, simulator tools, or partnerships."
            : activeTab === "privacy"
            ? "Read Try Your Career's privacy policy and data protection principles for students and educators."
            : "Read the Terms of Service for using the Try Your Career platform, assessments, and learning roadmaps."
        }
        url={`/support/${activeTab}`}
      />
      {/* Landing Navbar */}
      <LandingNavbar isDark={isDark} />

      <div className="flex-1 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Header Hero Banner */}
          <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-sky-50 text-[#1E88E5] px-3.5 py-1 rounded-full border border-sky-200">
              Support Center
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold tracking-tight leading-tight text-[#0b1a36]">
              We are here to help
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Got questions about simulators, hubs, or placements? Look through our guides below or reach out to our student support crew.
            </p>
          </div>

{/* Navigation Tabs */}
<div className="w-full max-w-2xl mx-auto border-b border-[#D3E3F5] pb-4">
  <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-center sm:gap-3 overflow-x-auto scrollbar-none">
    {[
      { id: "privacy", label: "Privacy Policy", icon: Shield },
      { id: "terms", label: "Terms of Service", icon: FileText },
      { id: "help", label: "Help Center", icon: HelpCircle },
      { id: "contact", label: "Contact Support", icon: MessageSquare },
    ].map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;

      return (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={`flex items-center justify-center gap-2 w-full sm:w-auto px-3 py-2.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all duration-200 border shrink-0 cursor-pointer ${
            isActive
              ? "bg-[#0b1a36] text-white border-[#0b1a36] shadow-sm"
              : "bg-white border-[#D3E3F5] text-slate-650 hover:bg-[#F0F6FC]"
          }`}
        >
          <Icon
            size={15}
            className={isActive ? "text-white" : "text-[#1E88E5]"}
          />
          <span>{tab.label}</span>
        </button>
      );
    })}
  </div>
</div>

          {/* Tab Content Section */}
          <div className="bg-white rounded-3xl border border-[#D3E3F5] p-6 sm:p-8 md:p-10 shadow-xs text-left">
            
            {/* 1. Help Center Tab */}
            {activeTab === "help" && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="text-2xl font-sans font-bold text-[#0b1a36]">Frequently Asked Questions</h2>
                  <p className="text-sm text-slate-500">Quick answers to common questions about TryYourCareers dashboards, sandboxes, and cohort placements.</p>
                </div>

                <div className="space-y-3 pt-2 max-w-3xl">
                  {faqs.map((faq, i) => (
                    <div 
                      key={i} 
                      className="border border-[#D3E3F5] rounded-2xl bg-[#F0F6FC] overflow-hidden shadow-2xs"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between font-bold text-xs sm:text-sm text-[#0b1a36] cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown 
                          size={16} 
                          className={`text-slate-400 transition-transform ${expandedFaq === i ? "rotate-180" : ""}`} 
                        />
                      </button>
                      {expandedFaq === i && (
                        <div className="px-5 pb-4 pt-1 border-t border-[#D3E3F5] text-xs sm:text-sm text-slate-600 leading-relaxed animate-fade-in bg-white">
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
                    <h2 className="text-2xl font-sans font-bold text-[#0b1a36]">Submit a Ticket</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Can't find what you're looking for? Leave a message and we'll reply shortly.</p>

                    {contactSubmitted ? (
                      <div className="bg-emerald-500/10 text-emerald-800 p-6 rounded-2xl border border-emerald-500/20 space-y-3 animate-scale-in">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={20} className="text-emerald-600" />
                          <h4 className="text-sm font-bold">Ticket Submitted Successfully!</h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed pl-8">
                          Your Support Ticket ID is <span className="font-bold font-mono text-[#1E88E5]">{ticketId}</span>. A confirmation has been sent to your email. Our team will review the issue and follow up within 2 hours.
                        </p>
                        <div className="pl-8 pt-2">
                          <button
                            onClick={() => setContactSubmitted(false)}
                            className="bg-[#0b1a36] hover:bg-[#122b59] text-white font-bold text-[10px] px-4 py-2 rounded-full transition cursor-pointer shadow-2xs"
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
                            className="p-3 rounded-xl border border-[#D3E3F5] bg-white text-xs sm:text-sm focus:outline-none focus:border-slate-400 text-slate-800 shadow-2xs"
                          />
                          <input 
                            required
                            type="email" 
                            placeholder="Email Address" 
                            className="p-3 rounded-xl border border-[#D3E3F5] bg-white text-xs sm:text-sm focus:outline-none focus:border-slate-400 text-slate-800 shadow-2xs"
                          />
                        </div>
                        <select 
                          required
                          className="w-full p-3 rounded-xl border border-[#D3E3F5] bg-white text-xs sm:text-sm focus:outline-none focus:border-slate-400 text-slate-700 shadow-2xs"
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
                          className="w-full p-3 rounded-xl border border-[#D3E3F5] bg-white text-xs sm:text-sm focus:outline-none focus:border-slate-400 text-slate-800 shadow-2xs"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#0b1a36] hover:bg-[#122b59] text-white font-bold text-xs px-5 py-3 rounded-full transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
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
                  <div className="lg:col-span-5 p-6 rounded-2xl bg-[#F0F6FC] border border-[#D3E3F5] space-y-4 shadow-2xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E88E5]">Office Info</h3>
                    <div className="space-y-4 pt-2">
                      <div className="flex items-start gap-3">
                        <Mail size={16} className="text-[#1E88E5] mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Email Address</p>
                          <p className="text-xs text-slate-500">tryyourcareer@gmail.com</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone size={16} className="text-[#1E88E5] mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Helpline Phone</p>
                          <p className="text-xs text-slate-500">Contact us by email for support and inquiries</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-[#1E88E5] mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Headquarters</p>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Plot No. 43, Sy No. 3 and 4/part, Satyanarayanapuram Colony, Peerzadiguda, Ghatkesar, Hyderabad, Telangana, 500098, India
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
                <h2 className="text-2xl font-sans font-bold text-[#0b1a36] mb-4">Privacy Policy</h2>
                <p className="font-bold text-slate-500 mb-6">Last Updated: September 30, 2026</p>

                <div className="space-y-8">
                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">1. Who We Are</h3>
                    <p>
                      Try Your Career is operated by <strong>TRY YOUR CAREER PRIVATE LIMITED</strong>. We provide
                      career exploration, assessments, interactive simulations, career intelligence, reports, and
                      related educational and career-development tools.
                    </p>
                    <p>
                      <strong>Address:</strong> Plot No. 43, Sy No. 3 and 4/part, Satyanarayanapuram Colony,
                      Peerzadiguda, Ghatkesar, Hyderabad, Telangana, 500098, India.
                    </p>
                    <p>
                      <strong>Privacy Contact:</strong>{" "}
                      <a href="mailto:tryyourcareer@gmail.com" className="text-[#1E88E5] hover:underline">
                        tryyourcareer@gmail.com
                      </a>
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">2. Information We Collect</h3>
                    <p>Depending on how you use the platform, we may process:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Account information such as name, email address, phone number, date of birth, age, and profile information.</li>
                      <li>Education and career information such as education level, areas of interest, location, skills, and career preferences.</li>
                      <li>Assessment information including questions, answers, scores, timestamps, response durations, and derived assessment dimensions.</li>
                      <li>Trial Mission information including working notes, findings, decisions, reflections, outputs, resource access, and session activity.</li>
                      <li>Community information including messages and files or media submitted through available Career Hub functionality.</li>
                      <li>Career intelligence and report information generated from assessments, simulations, career data, and platform interactions.</li>
                      <li>Technical and usage information needed to operate, secure, and improve the platform.</li>
                      <li>Cookie and browser-storage preferences used to remember applicable platform and privacy settings.</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">3. How We Use Information</h3>
                    <p>We may use information to:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Create and maintain user accounts and authenticate users.</li>
                      <li>Provide assessments, diagnostic activities, Trial Missions, and career simulations.</li>
                      <li>Store progress and assessment or simulation results.</li>
                      <li>Generate career insights, recommendations, reports, and action plans.</li>
                      <li>Provide community and support functionality.</li>
                      <li>Maintain, secure, troubleshoot, and improve the platform.</li>
                      <li>Detect misuse, unauthorized access, fraud, or other security issues.</li>
                      <li>Meet applicable legal and regulatory obligations.</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">4. Assessments, Trial Missions, and Derived Information</h3>
                    <p>
                      Some information is generated from your activity rather than directly entered by you. This may
                      include assessment dimensions, fit information, simulation observations, decision-related data,
                      career intelligence, report summaries, and action plans.
                    </p>
                    <p>
                      These results may be stored and used to provide related Try Your Career features and to maintain
                      your career-exploration history.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">5. AI and Automated Processing</h3>
                    <p>
                      Try Your Career uses AI-supported functionality, including <strong>Google Gemini</strong>, for
                      certain platform capabilities. Depending on the feature, information required to generate an
                      output may include assessment results, career information, simulation activity, reflections,
                      or other relevant platform data.
                    </p>
                    <p>
                      AI-assisted results may be used for career intelligence, scenario processing, analysis, report
                      generation, and related functionality. AI-generated content may contain inaccuracies or omissions
                      and should not be treated as a guaranteed educational, employment, salary, or professional outcome.
                    </p>
                    <p>
                      The specific data-use and retention practices of an external AI provider may also be governed by
                      that provider's applicable terms and policies.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">6. How We Share Information</h3>
                    <p>
                      Try Your Career <strong>does not currently share user information with employers, recruiters,
                      or other third parties for hiring or recruitment purposes.</strong>
                    </p>
                    <p>
                      We may use service providers that support authentication, hosting, databases, analytics,
                      infrastructure, or AI functionality. Such providers may process information as necessary to
                      provide their services.
                    </p>
                    <p>
                      We may also disclose information where required by applicable law, regulation, legal process,
                      or a valid governmental or judicial request.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">7. Third-Party Services</h3>
                    <p>
                      The current platform architecture may use services including Supabase for authentication,
                      database and realtime functionality; supported OAuth providers for authentication; Vercel
                      services for hosting, analytics, and performance monitoring; and Google Gemini for certain
                      AI-supported functionality.
                    </p>
                    <p>
                      Third-party providers may have their own privacy policies and terms governing their processing
                      activities.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">8. Parent Report Sharing</h3>
                    <p>
                      Where parent-report functionality is available, a report may be shared through an expiring,
                      read-only access mechanism. The shared report is designed to provide a limited summary rather
                      than expose all underlying student information.
                    </p>
                    <p>
                      Certain underlying information, including raw assessment responses and private Trial Mission
                      notes, may remain excluded from the shared parent report. Users should treat report links as
                      confidential and share them only with intended recipients.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">9. Cookies and Local Storage</h3>
                    <p>
                      Try Your Career may use cookies, local storage, and similar technologies for essential platform
                      functionality, authentication/session management, analytics, functional preferences, and
                      application state.
                    </p>
                    <p>
                      Available privacy preferences can be managed through the platform's consent controls and,
                      where applicable, through browser settings.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">10. Data Retention</h3>
                    <p>
                      We retain information for as long as reasonably necessary to provide the relevant services,
                      maintain user history and functionality, comply with applicable obligations, resolve disputes,
                      and enforce our agreements.
                    </p>
                    <p>
                      Different categories of information may therefore be retained for different periods. Certain
                      temporary sharing mechanisms may expire automatically. A comprehensive self-service deletion
                      facility and formal published retention schedule are not currently available through the product.
                    </p>
                    <p>
                      For questions about retention or deletion, contact{" "}
                      <a href="mailto:tryyourcareer@gmail.com" className="text-[#1E88E5] hover:underline">
                        tryyourcareer@gmail.com
                      </a>.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">11. Data Security</h3>
                    <p>
                      We use reasonable technical and organizational measures intended to protect information
                      processed through the platform. These may include authenticated access controls, authorization
                      checks, secure API communication, token-based authentication, expiring access mechanisms for
                      certain shared reports, database access controls, and search-engine exclusion for private pages.
                    </p>
                    <p>
                      No internet-based service can guarantee absolute security. Users should protect their account
                      credentials and avoid sharing authentication information with others.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">12. Your Information and Privacy Requests</h3>
                    <p>
                      Depending on applicable law and the circumstances, users may have rights relating to their
                      personal information, including requesting information about processing, correction of
                      inaccurate information, deletion where applicable, and raising privacy concerns.
                    </p>
                    <p>
                      Profile information can be managed through the platform where those controls are available.
                      A self-service complete account-data export and automated account-deletion facility are not
                      currently available through the user interface.
                    </p>
                    <p>
                      Privacy requests may be submitted to{" "}
                      <a href="mailto:tryyourcareer@gmail.com" className="text-[#1E88E5] hover:underline">
                        tryyourcareer@gmail.com
                      </a>{" "}
                      and will be reviewed in accordance with applicable law and the nature of the request.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">13. Students and Younger Users</h3>
                    <p>
                      Try Your Career is intended to support students and people exploring career options and does
                      not currently impose a general minimum age restriction.
                    </p>
                    <p>
                      Users under 18 should use the platform with appropriate involvement and guidance from a parent
                      or legal guardian where required by applicable law. Try Your Career does not currently operate a
                      formal parental-consent verification mechanism through the platform.
                    </p>
                    <p>
                      Parents or guardians with questions about information relating to a younger user may contact us
                      at{" "}
                      <a href="mailto:tryyourcareer@gmail.com" className="text-[#1E88E5] hover:underline">
                        tryyourcareer@gmail.com
                      </a>.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">14. User-Submitted Content</h3>
                    <p>
                      Users may submit notes, reflections, assessment responses, decisions, messages, files, and
                      other content. Users are responsible for ensuring that they have the necessary rights to submit
                      such content.
                    </p>
                    <p>
                      Submitted content may be processed as necessary to provide assessment, simulation, reporting,
                      career intelligence, community, and other platform functionality.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">15. International Processing</h3>
                    <p>
                      Some technology and service providers used by Try Your Career may process information from
                      locations outside India. Such processing may be subject to the applicable infrastructure,
                      contractual arrangements, and privacy practices of those providers.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">16. Changes to This Privacy Policy</h3>
                    <p>
                      We may update this Privacy Policy when our services, data practices, legal requirements, or
                      operational processes change. The updated version will be published on this page with a revised
                      "Last Updated" date.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">17. Contact Us</h3>
                    <p><strong>TRY YOUR CAREER PRIVATE LIMITED</strong></p>
                    <p>
                      Plot No. 43, Sy No. 3 and 4/part, Satyanarayanapuram Colony, Peerzadiguda, Ghatkesar,
                      Hyderabad, Telangana, 500098, India
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      <a href="mailto:tryyourcareer@gmail.com" className="text-[#1E88E5] hover:underline">
                        tryyourcareer@gmail.com
                      </a>
                    </p>
                  </section>
                </div>
              </div>
            )}

            {/* 4. Terms of Service Tab */}
            {activeTab === "terms" && (
              <div className="space-y-6 animate-fade-in text-xs sm:text-sm leading-relaxed text-slate-600 max-w-4xl">
                <h2 className="text-2xl font-sans font-bold text-[#0b1a36] mb-4">Terms of Service</h2>
                <p className="font-bold text-slate-500 mb-6">Last Updated: September 30, 2026</p>

                <div className="space-y-8">
                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">1. Acceptance of These Terms</h3>
                    <p>
                      These Terms of Service govern your access to and use of Try Your Career, operated by
                      <strong> TRY YOUR CAREER PRIVATE LIMITED</strong>. By creating an account, accessing, or using
                      the platform, you agree to these Terms.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">2. About Try Your Career</h3>
                    <p>
                      Try Your Career provides career exploration and career-development tools that may include
                      assessments, diagnostic activities, Trial Missions, workplace simulations, career intelligence,
                      career-fit information, decision reports, parent reports, career pathways, action plans,
                      community functionality, and related educational features.
                    </p>
                    <p>
                      The specific features available to a user may change over time.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">3. Eligibility</h3>
                    <p>
                      Try Your Career does not currently impose a general minimum age restriction. The platform is
                      designed to support students and other users exploring career options.
                    </p>
                    <p>
                      Users under 18 should use the platform with appropriate involvement and guidance from a parent
                      or legal guardian where required by applicable law.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">4. Account Registration and Security</h3>
                    <p>When creating and using an account, you agree to:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Provide information that is accurate to the best of your knowledge.</li>
                      <li>Keep account information reasonably up to date.</li>
                      <li>Protect your login credentials.</li>
                      <li>Not knowingly provide another person access to your account for the purpose of manipulating results or activity.</li>
                      <li>Notify us if you become aware of unauthorized access to your account.</li>
                    </ul>
                    <p>You are responsible for activity performed through your account, subject to applicable law.</p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">5. Assessments and Career Exploration</h3>
                    <p>
                      Assessments, diagnostic activities, career matching, fit information, and related tools are
                      intended to help users explore possible career directions.
                    </p>
                    <p>
                      Assessment results, career matches, fit scores, reports, and recommendations do not guarantee
                      employment, admission, salary, promotion, professional certification, or any particular career
                      outcome.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">6. Trial Missions and Simulations</h3>
                    <p>
                      Trial Missions are simulated activities designed to expose users to aspects of different types
                      of professional work.
                    </p>
                    <p>
                      Simulation results may reflect decisions, evidence gathered, working notes, reflections, task
                      completion, scenario interactions, and other activity within the simulation.
                    </p>
                    <p>
                      Simulation outcomes are educational and exploratory. They are not a formal professional
                      qualification, employment assessment, or guarantee of suitability for an actual job.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">7. AI and Automated Results</h3>
                    <p>
                      Try Your Career may use automated systems and AI technologies, including Google Gemini, to
                      support certain platform functionality.
                    </p>
                    <p>
                      AI-assisted outputs may include career insights, scenario outcomes, career analysis, report
                      content, market or industry analysis, and other career-related information.
                    </p>
                    <p>
                      AI-generated content may contain inaccuracies, omissions, or outdated information. Users should
                      independently evaluate important information before relying on it for educational, financial,
                      employment, or career decisions.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">8. No Employment or Placement Guarantee</h3>
                    <p>
                      Use of Try Your Career, completion of assessments or Trial Missions, achievement of scores,
                      generation of reports, or participation in platform activities does not guarantee a job,
                      interview, placement, internship, admission, specific salary, or particular career outcome.
                    </p>
                    <p>
                      Try Your Career does not currently represent that completion of any platform activity
                      automatically results in employment or recruitment by a third party.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">9. Acceptable Use</h3>
                    <p>You must not:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Attempt to gain unauthorized access to the platform or its systems.</li>
                      <li>Circumvent authentication or authorization controls.</li>
                      <li>Interfere with platform availability or security.</li>
                      <li>Introduce malware or malicious code.</li>
                      <li>Abuse APIs or automated services.</li>
                      <li>Attempt to overload or disrupt the platform.</li>
                      <li>Scrape or systematically extract platform content where such activity is unauthorized.</li>
                      <li>Reverse engineer or attempt to reproduce proprietary platform systems except where permitted by applicable law.</li>
                      <li>Manipulate assessment or Trial Mission results through fraudulent activity.</li>
                      <li>Impersonate another person or use another user's account without authorization.</li>
                      <li>Upload unlawful, harmful, malicious, or infringing material.</li>
                      <li>Harass, threaten, abuse, or discriminate against other users.</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">10. Community and Career Hub Conduct</h3>
                    <p>
                      Where community or Career Hub functionality is available, users are responsible for the content
                      they submit.
                    </p>
                    <p>
                      Users must not use community functionality to harass or threaten others, publish unlawful or
                      abusive content, disclose another person's private information without authorization, upload
                      malicious files, impersonate others, spam users, or engage in fraudulent or deceptive activity.
                    </p>
                    <p>
                      We may remove content or restrict community access where reasonably necessary to protect users,
                      the platform, or comply with applicable law.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">11. User-Submitted Content</h3>
                    <p>
                      Users may submit notes, reflections, assessment responses, decisions, messages, files, and
                      other content. Users remain responsible for the content they submit and represent that they have
                      the necessary rights and permissions to submit it.
                    </p>
                    <p>
                      You grant Try Your Career the limited permission necessary to host, store, process, display,
                      analyze, and otherwise use submitted content for the purpose of providing the relevant platform
                      services. This permission does not transfer ownership of your personal content to Try Your Career.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">12. Try Your Career Intellectual Property</h3>
                    <p>
                      The platform may include software, source code, user-interface designs, branding, logos,
                      assessment content, simulation scenarios, rubrics, career content, proprietary methodologies,
                      databases, datasets, and other proprietary materials.
                    </p>
                    <p>
                      Except for rights granted under these Terms or rights that cannot legally be restricted, these
                      materials remain the property of Try Your Career Private Limited or the relevant rights holder.
                    </p>
                    <p>
                      Users may use the platform and its outputs for their intended personal and educational purposes
                      and must not reproduce, redistribute, sell, publicly republish, or commercially exploit
                      proprietary platform materials without appropriate authorization.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">13. Reports and Downloads</h3>
                    <p>
                      Certain reports may be available for viewing or download. Reports are provided for the user's
                      intended educational and career-exploration purposes.
                    </p>
                    <p>
                      Users are responsible for protecting downloaded reports and should not publicly distribute
                      reports containing another person's personal information.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">14. Parent Reports</h3>
                    <p>
                      Where the parent-report feature is available, a user may generate a limited report intended for
                      sharing with a parent or guardian. The shared report may contain a summary of career-related
                      findings while excluding certain underlying information such as raw assessment responses or
                      private Trial Mission notes.
                    </p>
                    <p>
                      Users are responsible for sharing report links only with intended recipients.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">15. Third-Party Services</h3>
                    <p>
                      Try Your Career relies on third-party infrastructure and services for certain functionality,
                      including authentication, hosting, database services, analytics, performance monitoring, and
                      AI-supported features.
                    </p>
                    <p>
                      Third-party services may be governed by their own terms and policies. We are not responsible for
                      independent changes to third-party services outside our reasonable control.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">16. Platform Availability and Changes</h3>
                    <p>
                      We aim to keep Try Your Career available and functional but do not guarantee that the platform
                      will always be available, uninterrupted, error-free, completely secure, or free from defects.
                    </p>
                    <p>
                      We may modify, improve, replace, suspend, or discontinue individual features or parts of the
                      platform for technical, security, legal, product-development, or operational reasons.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">17. Account Suspension or Termination</h3>
                    <p>
                      We may restrict, suspend, or terminate access where reasonably necessary, including where these
                      Terms are violated, the account is used for fraudulent or unlawful activity, the platform is
                      abused, security is threatened, unauthorized access is attempted, or action is required by law.
                    </p>
                    <p>
                      Where appropriate and technically feasible, we may provide notice before taking such action.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">18. Privacy</h3>
                    <p>
                      Your use of Try Your Career is also governed by our Privacy Policy, which explains how information
                      is collected, used, stored, and processed. The Privacy Policy forms part of these Terms.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">19. Disclaimers</h3>
                    <p>
                      Try Your Career is provided for educational, informational, and career-exploration purposes.
                      We do not guarantee that assessment results, career recommendations, market or salary
                      information, AI-generated content, or simulation outcomes will always be accurate, current,
                      suitable, or predictive of future educational or employment outcomes.
                    </p>
                    <p>
                      Users are responsible for evaluating information and making their own educational and career
                      decisions.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">20. Limitation of Liability</h3>
                    <p>
                      To the maximum extent permitted by applicable law, Try Your Career Private Limited will not be
                      responsible for indirect, incidental, special, consequential, or unforeseeable losses arising
                      from use of the platform.
                    </p>
                    <p>
                      Nothing in these Terms excludes or limits liability that cannot legally be excluded or limited
                      under applicable law.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">21. Indemnification</h3>
                    <p>
                      To the extent permitted by applicable law, you agree to be responsible for losses, claims, or
                      reasonable costs arising from your unlawful use of the platform, violation of these Terms, or
                      infringement of another person's rights through content you submit.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">22. Governing Law</h3>
                    <p>
                      These Terms are governed by the laws of <strong>India</strong>. Any dispute arising in connection
                      with these Terms or the use of Try Your Career will be handled in accordance with applicable
                      Indian law.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">23. Changes to These Terms</h3>
                    <p>
                      We may update these Terms when the platform, services, legal requirements, or operational
                      practices change. Updated Terms will be published on this page with a revised "Last Updated"
                      date.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-slate-800">24. Contact</h3>
                    <p><strong>TRY YOUR CAREER PRIVATE LIMITED</strong></p>
                    <p>
                      Plot No. 43, Sy No. 3 and 4/part, Satyanarayanapuram Colony, Peerzadiguda, Ghatkesar,
                      Hyderabad, Telangana, 500098, India
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      <a href="mailto:tryyourcareer@gmail.com" className="text-[#1E88E5] hover:underline">
                        tryyourcareer@gmail.com
                      </a>
                    </p>
                  </section>
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