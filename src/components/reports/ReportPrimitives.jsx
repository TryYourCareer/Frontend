import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * ReportSection: Large cohesive white section container representing a major report section.
 * Hierarchy: Page -> ReportSection -> ReportInnerBox -> Rows/Content.
 */
export function ReportSection({
  id,
  number,
  eyebrow,
  title,
  description,
  badge,
  children,
  className = "",
  "data-testid": testId,
}) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className={`bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 space-y-6 shadow-xs ${className}`}
      data-testid={testId}
    >
      {(number || eyebrow || title || description || badge) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {number && (
                <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E88E5] border border-blue-200/70 flex items-center justify-center font-bold text-xs">
                  {number}
                </span>
              )}
              {eyebrow && (
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {eyebrow}
                </span>
              )}
            </div>
            {title && (
              <h2
                id={id ? `${id}-heading` : undefined}
                className="text-xl sm:text-2xl font-black text-[#0b1a36] tracking-tight"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {badge && <div className="shrink-0">{badge}</div>}
        </div>
      )}

      {children}
    </section>
  );
}

/**
 * ReportInnerBox: Slightly tinted off-white inner component surface with subtle border.
 * Groups related metrics, summaries, or structured content inside a ReportSection.
 */
export function ReportInnerBox({
  title,
  subtitle,
  icon: Icon,
  badge,
  children,
  className = "",
  "data-testid": testId,
}) {
  return (
    <div
      className={`bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5 transition-all ${className}`}
      data-testid={testId}
    >
      {(title || subtitle || Icon || badge) && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1E88E5] border border-blue-200/60 flex items-center justify-center shrink-0">
                <Icon size={14} />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-sm sm:text-base font-bold text-[#0b1a36] leading-snug">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 font-normal">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {badge && <div>{badge}</div>}
        </div>
      )}

      {children}
    </div>
  );
}

/**
 * ReportMetricList & ReportMetricRow:
 * Structured table/row-based presentation for metrics instead of fragmented cards.
 */
export function ReportMetricList({ headerLabels = ["Section", "Score", "Percentile"], children, className = "" }) {
  return (
    <div className={`bg-[#F8FAFC] border border-slate-200/80 rounded-2xl overflow-hidden ${className}`}>
      {headerLabels && headerLabels.length > 0 && (
        <div className="grid grid-cols-3 gap-2 px-4 sm:px-5 py-3 bg-slate-100/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <div className="text-left">{headerLabels[0]}</div>
          <div className="text-center">{headerLabels[1]}</div>
          <div className="text-right">{headerLabels[2]}</div>
        </div>
      )}
      <div className="divide-y divide-slate-200/60 bg-white">
        {children}
      </div>
    </div>
  );
}

export function ReportMetricRow({ label, value, subvalue, badge, details, isHighlight = false }) {
  return (
    <div className={`px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 transition ${isHighlight ? "bg-blue-50/30" : ""}`}>
      <div className="space-y-0.5 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-[#0b1a36] truncate">
            {label}
          </span>
          {badge}
        </div>
        {details && (
          <p className="text-[11px] text-slate-500 leading-snug">
            {details}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 text-right shrink-0">
        {value !== undefined && value !== null && (
          <span className="text-xs sm:text-sm font-black font-mono text-[#0b1a36]">
            {value}
          </span>
        )}
        {subvalue !== undefined && subvalue !== null && (
          <span className="text-xs font-semibold text-slate-500">
            {subvalue}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * ReportTimeline & ReportTimelineItem:
 * Connected vertical stepper/timeline for AI impact, path forward, and roadmaps.
 */
export function ReportTimeline({ children, className = "" }) {
  return (
    <div className={`relative pl-8 sm:pl-10 space-y-6 before:absolute before:top-3 before:bottom-3 before:left-3.5 sm:before:left-4 before:w-0.5 before:bg-slate-200 ${className}`}>
      {children}
    </div>
  );
}

export function ReportTimelineItem({ stepNumber, title, subtitle, badge, children, isCompleted = false }) {
  return (
    <div className="relative group">
      {/* Numbered Node on the connector line */}
      <div
        className={`absolute -left-8 sm:-left-10 top-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-2xs border-2 ${
          isCompleted
            ? "bg-emerald-600 text-white border-white ring-2 ring-emerald-600"
            : "bg-white text-[#1E88E5] border-[#1E88E5] ring-2 ring-blue-50"
        }`}
      >
        {stepNumber}
      </div>

      {/* Inner pathway component box */}
      <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3 hover:bg-white hover:border-[#D3E3F5] transition shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            {title && (
              <h4 className="text-sm sm:text-base font-bold text-[#0b1a36]">
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          {badge && <div>{badge}</div>}
        </div>

        {children}
      </div>
    </div>
  );
}

/**
 * ReportCareerCard: Cohesive stacked alternative career card with full-width CTA.
 */
export function ReportCareerCard({ name, relationLabel, differentiator, targetRoute, fitTier, source }) {
  return (
    <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:bg-white hover:border-[#D3E3F5] transition shadow-2xs">
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {relationLabel && (
            <span className="px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[#1E88E5] text-[10px] font-bold">
              {relationLabel}
            </span>
          )}
          {fitTier && (
            <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
              {fitTier}
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-[#0b1a36]">
          {name}
        </h3>

        {differentiator && (
          <p className="text-xs text-slate-600 leading-relaxed">
            {differentiator}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
        {source && (
          <div className="text-[10px] text-slate-400">
            Source: <span className="text-slate-500 font-medium">{source}</span>
          </div>
        )}

        {targetRoute ? (
          <Link
            to={targetRoute}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1E88E5] hover:bg-blue-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer text-center"
          >
            <span>View Career</span>
            <ArrowRight size={13} />
          </Link>
        ) : (
          <span className="text-xs text-slate-400 italic block text-center">
            Career link not available
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * ReportStatusBadge: Consistent status badge pills.
 */
export function ReportStatusBadge({ label, variant = "neutral", className = "" }) {
  const variantMap = {
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    blue: "bg-blue-50 text-[#1E88E5] border-blue-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    indigo: "bg-indigo-50 text-indigo-800 border-indigo-200",
    purple: "bg-purple-50 text-purple-800 border-purple-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const style = variantMap[variant] || variantMap.neutral;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] sm:text-xs font-bold ${style} ${className}`}>
      {label}
    </span>
  );
}
