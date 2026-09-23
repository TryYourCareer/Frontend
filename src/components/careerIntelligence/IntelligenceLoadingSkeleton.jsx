import React from "react";

export default function IntelligenceLoadingSkeleton({ type = "families" }) {
  if (type === "detail") {
    return (
      <div className="space-y-6 animate-pulse" data-testid="intelligence-skeleton-detail">
        {/* Header skeleton */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-[#D3E3F5] space-y-4">
          <div className="h-4 w-32 bg-[#F0F6FC] rounded-full" />
          <div className="h-8 w-72 bg-[#F0F6FC] rounded-2xl" />
          <div className="h-4 w-full max-w-xl bg-[#F0F6FC] rounded-full" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-24 bg-[#F0F6FC] rounded-full" />
            <div className="h-6 w-32 bg-[#F0F6FC] rounded-full" />
          </div>
        </div>

        {/* 2-col grid for Family & Work DNA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#D3E3F5] space-y-4">
            <div className="h-6 w-40 bg-[#F0F6FC] rounded-xl" />
            <div className="h-16 bg-[#F0F6FC] rounded-2xl" />
            <div className="h-12 bg-[#F0F6FC] rounded-2xl" />
          </div>
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#D3E3F5] space-y-4">
            <div className="h-6 w-40 bg-[#F0F6FC] rounded-xl" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-[#F0F6FC] rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Activities skeleton */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#D3E3F5] space-y-4">
          <div className="h-6 w-48 bg-[#F0F6FC] rounded-xl" />
          <div className="h-28 bg-[#F0F6FC] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (type === "careers") {
    return (
      <div className="space-y-6 animate-pulse" data-testid="intelligence-skeleton-careers">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#D3E3F5] space-y-3">
          <div className="h-4 w-28 bg-[#F0F6FC] rounded-full" />
          <div className="h-7 w-64 bg-[#F0F6FC] rounded-xl" />
          <div className="h-4 w-96 bg-[#F0F6FC] rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-[#D3E3F5] space-y-3">
              <div className="h-5 w-40 bg-[#F0F6FC] rounded-xl" />
              <div className="h-3 w-24 bg-[#F0F6FC] rounded-full" />
              <div className="h-10 bg-[#F0F6FC] rounded-2xl" />
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
          <div key={i} className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#D3E3F5] space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#F0F6FC] rounded-2xl" />
              <div className="h-5 w-48 bg-[#F0F6FC] rounded-xl" />
            </div>
            <div className="h-14 bg-[#F0F6FC] rounded-2xl" />
            <div className="h-4 w-28 bg-[#F0F6FC] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}