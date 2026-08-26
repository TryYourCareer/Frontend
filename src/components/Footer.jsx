import { motion } from "framer-motion";
import { Globe, Heart, Terminal, Users } from "lucide-react";

export default function Footer({ theme = "light" }) {
  const isDark = theme === "dark";

  return (
    <footer className={`border-t py-12 px-6 sm:px-8 mt-auto transition-colors duration-300 ${
      isDark 
        ? "bg-slate-950 border-slate-800 text-slate-400" 
        : "bg-white border-[#e2e8f0] text-slate-650"
    }`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand & Mission */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.ico"
              alt="Company Logo"
              className="h-8 w-8 shrink-0 object-contain"
            />
            <span className={`cc-display font-black text-base ${isDark ? "text-white" : "text-[#0f1d3c]"}`}>
              Try Your Career
            </span>
          </div>
          <p className="text-xs leading-relaxed">
            Empowering students to simulate, experiment, and confidently navigate their ideal career pathways. Play before you choose.
          </p>
          <div className="flex gap-3 pt-2">
            {[
              { icon: Terminal, link: "#" },
              { icon: Globe, link: "#" },
              { icon: Users, link: "#" },
              { icon: Globe, link: "#" }
            ].map((soc, i) => {
              const Icon = soc.icon;
              return (
                <motion.a
                  key={i}
                  href={soc.link}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg border text-xs transition-colors ${
                    isDark 
                      ? "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-750" 
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:text-blue-600 hover:border-blue-200"
                  }`}
                >
                  <Icon size={14} />
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Explore Links */}
        <div className="space-y-3">
          <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-[#0f1d3c]"}`}>
            Explore
          </h4>
          <ul className="space-y-2 text-xs">
            {[
              { label: "Career Assessment", link: "#assessment" },
              { label: "Reality Checker", link: "#career-reality" },
              { label: "Insights Hub", link: "#insights-feed" },
              { label: "Interactive Simulations", link: "#simulations" }
            ].map((lnk, i) => (
              <li key={i}>
                <a href={lnk.link} className={`hover:underline flex items-center gap-1.5 transition-colors ${isDark ? "hover:text-white" : "hover:text-blue-600"}`}>
                  {lnk.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources & Support */}
        <div className="space-y-3">
          <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-[#0f1d3c]"}`}>
            Resources
          </h4>
          <ul className="space-y-2 text-xs">
            {[
              { label: "Documentation", link: "#" },
              { label: "Career Guides", link: "#" },
              { label: "Help & Support", link: "#" },
              { label: "Privacy Policy", link: "#" }
            ].map((lnk, i) => (
              <li key={i}>
                <a href={lnk.link} className={`hover:underline flex items-center gap-1.5 transition-colors ${isDark ? "hover:text-white" : "hover:text-blue-605"}`}>
                  {lnk.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div className="space-y-3">
          <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-[#0f1d3c]"}`}>
            Stay Informed
          </h4>
          <p className="text-xs leading-relaxed">
            Subscribe to receive new simulator announcements and industry outlook updates.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                placeholder="Enter your email"
                className={`w-full px-3 py-2 text-xs rounded-lg border outline-none transition ${
                  isDark
                    ? "bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500/50"
                    : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500/50"
                }`}
              />
            </div>
            <button
              type="button"
              className="px-3.5 py-2 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md shadow-blue-500/10"
            >
              Join
            </button>
          </div>
        </div>

      </div>

      <div className={`max-w-6xl mx-auto border-t mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-4 ${
        isDark ? "border-slate-800" : "border-slate-100"
      }`}>
        <p className="flex items-center gap-1">
          Made with <Heart size={10} className="text-rose-500 fill-rose-500" /> by TryYourCareer Team
        </p>
        <p>
          &copy; {new Date().getFullYear()} TryYourCareer. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
