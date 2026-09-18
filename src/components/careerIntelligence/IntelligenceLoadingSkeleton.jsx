import React from "react";

export default function IntelligenceLoadingSkeleton({ type = "families" }) {
  if (type === "detail") {
    return (
      <div className="space-y-6 animate-pulse" data-testid="intelligence-skeleton-detail">
        {/* Header skeleton */}
        <div className="bg-white/80 rounded-2xl p-6 border border-[#e2d9c8] space-y-4">
          <div className="h-4 w-32 bg-[#e8dfc8] rounded-full" />
          <div className="h-8 w-72 bg-[#e8dfc8] rounded-xl" />
          <div className="h-4 w-full max-w-xl bg-[#e8dfc8] rounded-full" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-24 bg-[#e8dfc8] rounded-full" />
            <div className="h-6 w-32 bg-[#e8dfc8] rounded-full" />
          </div>
        </div>

        {/* 2-col grid for Family & Work DNA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 rounded-2xl p-6 border border-[#e2d9c8] space-y-4">
            <div className="h-6 w-40 bg-[#e8dfc8] rounded-lg" />
            <div className="h-16 bg-[#f0e9d8] rounded-xl" />
            <div className="h-12 bg-[#f0e9d8] rounded-xl" />
          </div>
          <div className="bg-white/80 rounded-2xl p-6 border border-[#e2d9c8] space-y-4">
            <div className="h-6 w-40 bg-[#e8dfc8] rounded-lg" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-[#f0e9d8] rounded-xl" />
            ))}
          </div>
        </div>

        {/* Activities skeleton */}
        <div className="bg-white/80 rounded-2xl p-6 border border-[#e2d9c8] space-y-4">
          <div className="h-6 w-48 bg-[#e8dfc8] rounded-lg" />
          <div className="h-28 bg-[#f0e9d8] rounded-xl" />
        </div>
      </div>
    );
  }

  if (type === "careers") {
    return (
      <div className="space-y-6 animate-pulse" data-testid="intelligence-skeleton-careers">
        <div className="bg-white/80 rounded-2xl p-6 border border-[#e2d9c8] space-y-3">
          <div className="h-4 w-28 bg-[#e8dfc8] rounded-full" />
          <div className="h-7 w-64 bg-[#e8dfc8] rounded-lg" />
          <div className="h-4 w-96 bg-[#e8dfc8] rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 bg-white/80 rounded-2xl p-5 border border-[#e2d9c8] space-y-3">
              <div className="h-5 w-40 bg-[#e8dfc8] rounded-md" />
              <div className="h-3 w-24 bg-[#e8dfc8] rounded-full" />
              <div className="h-10 bg-[#f0e9d8] rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: families grid skeleton
  return (
    <div className="space-y-6 animate-pulse" data-testid="intelligence-skeleton-families">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/80 rounded-2xl p-6 border border-[#e2d9c8] space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#e8dfc8] rounded-xl" />
              <div className="h-5 w-48 bg-[#e8dfc8] rounded-md" />
            </div>
            <div className="h-14 bg-[#f0e9d8] rounded-xl" />
            <div className="h-4 w-28 bg-[#e8dfc8] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
