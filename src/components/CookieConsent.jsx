import React, { useState, useEffect } from "react";
import { Cookie, ShieldCheck, X, Settings } from "lucide-react";

const CONSENT_KEY = "clearcareers_cookie_consent";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true (Session, Auth, HttpOnly security)
    analytics: true,
    functional: true,
  });

  useEffect(() => {
    // Check if consent has already been given
    const storedConsent = localStorage.getItem(CONSENT_KEY);
    if (!storedConsent) {
      // Show after a brief delay for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = {
      essential: true,
      analytics: true,
      functional: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(fullConsent));
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    const essentialConsent = {
      essential: true,
      analytics: false,
      functional: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(essentialConsent));
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    const customConsent = {
      ...preferences,
      essential: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(customConsent));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50 md:max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-xl border border-[#0284c7]/20 shadow-[0_20px_50px_rgba(2,132,199,0.15)] rounded-2xl p-5 text-gray-800 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] flex items-center justify-center text-white shadow-md shadow-[#0284c7]/20">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 leading-tight flex items-center gap-1.5">
                Cookie & Privacy Choices
                <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">TryYourCareer Security</p>
            </div>
          </div>
          <button
            onClick={handleEssentialOnly}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!isCustomizing ? (
          <>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              We use secure <span className="font-semibold text-gray-800">HttpOnly cookies</span> and local session storage to keep you logged in safely, preserve your Trial Mission progress, and improve your career matching experience.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] hover:from-[#0369a1] hover:to-[#0284c7] text-white text-xs font-semibold shadow-md shadow-[#0284c7]/25 hover:shadow-lg transition-all text-center"
              >
                Accept All Cookies
              </button>
              <button
                onClick={handleEssentialOnly}
                className="px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition text-center"
              >
                Essential Only
              </button>
              <button
                onClick={() => setIsCustomizing(true)}
                className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition flex items-center justify-center"
                title="Customize preferences"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* Customization Preferences View */
          <div className="space-y-3 pt-1">
            <div className="space-y-2">
              {/* Essential */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                <div>
                  <span className="text-xs font-semibold text-gray-900 block">Strictly Necessary</span>
                  <span className="text-[10px] text-gray-500">HttpOnly auth tokens, session state</span>
                </div>
                <span className="text-[10px] font-bold text-[#0284c7] bg-[#e0f2fe] px-2 py-0.5 rounded-md">
                  Required
                </span>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                <div>
                  <span className="text-xs font-semibold text-gray-900 block">Analytics & Performance</span>
                  <span className="text-[10px] text-gray-500">Vercel insights & mission completion metrics</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="w-4 h-4 text-[#0284c7] rounded accent-[#0284c7]"
                />
              </div>

              {/* Functional */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                <div>
                  <span className="text-xs font-semibold text-gray-900 block">Preferences & Features</span>
                  <span className="text-[10px] text-gray-500">Remembers dark/light theme, UI filters</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                  className="w-4 h-4 text-[#0284c7] rounded accent-[#0284c7]"
                />
              </div>
            </div>

            {/* Custom Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSaveCustom}
                className="flex-1 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold transition text-center"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setIsCustomizing(false)}
                className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium transition"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
