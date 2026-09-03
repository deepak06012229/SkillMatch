import React from "react";
import { useApp } from "../../context/AppContext";

export default function OpportunityFilters({ isMobileModal = false, onClose }) {
  const {
    minFitScore,
    setMinFitScore,
    workplaceFilters,
    setWorkplaceFilters,
    eligibilityFilters,
    setEligibilityFilters,
    minStipend,
    setMinStipend,
    verifiedOnly,
    setVerifiedOnly,
    resetFilters,
  } = useApp();

  const handleWorkplaceToggle = (type) => {
    setWorkplaceFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleEligibilityToggle = (level) => {
    setEligibilityFilters((prev) => ({
      ...prev,
      [level]: !prev[level],
    }));
  };

  const content = (
    <div className="flex flex-col gap-unit-lg">
      {/* Title & Reset */}
      <div className="flex items-center justify-between">
        <h3 className="font-headline-sm text-on-surface text-[18px] flex items-center gap-unit-sm">
          <span className="material-symbols-outlined text-[20px] text-primary">filter_list</span>
          <span>Advanced Filters</span>
        </h3>
        <button
          onClick={resetFilters}
          className="text-label-sm text-primary hover:underline font-medium"
        >
          Reset All
        </button>
      </div>

      {/* Minimum Fit Score Slider */}
      <div className="flex flex-col gap-unit-xs">
        <div className="flex justify-between items-center text-label-md text-on-surface">
          <span>Minimum Fit Score</span>
          <span className="text-primary font-bold">{minFitScore}%</span>
        </div>
        <input
          type="range"
          min="50"
          max="99"
          value={minFitScore}
          onChange={(e) => setMinFitScore(Number(e.target.value))}
          className="accent-primary w-full cursor-pointer h-2 bg-surface-container-high rounded-lg"
        />
        <div className="flex justify-between text-label-sm text-outline">
          <span>50%</span>
          <span>80%</span>
          <span>99%</span>
        </div>
      </div>

      {/* Workplace / Location Type */}
      <div className="flex flex-col gap-unit-xs">
        <label className="font-label-md text-on-surface font-semibold">Location & Workplace</label>
        <div className="space-y-unit-xs">
          {["Remote", "On-site", "Hybrid"].map((type) => (
            <label
              key={type}
              className="flex items-center gap-unit-sm text-body-sm text-on-surface-variant cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={workplaceFilters[type]}
                onChange={() => handleWorkplaceToggle(type)}
                className="w-4 h-4 rounded accent-primary cursor-pointer"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Academic Year Eligibility */}
      <div className="flex flex-col gap-unit-xs">
        <label className="font-label-md text-on-surface font-semibold">Academic Eligibility</label>
        <div className="space-y-unit-xs">
          {["1st Year Students", "2nd Year Students", "Final Year & Graduates"].map((level) => (
            <label
              key={level}
              className="flex items-center gap-unit-sm text-body-sm text-on-surface-variant cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={eligibilityFilters[level]}
                onChange={() => handleEligibilityToggle(level)}
                className="w-4 h-4 rounded accent-primary cursor-pointer"
              />
              <span>{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Minimum Compensation / Stipend */}
      <div className="flex flex-col gap-unit-xs">
        <label className="font-label-md text-on-surface font-semibold">Minimum Stipend / Funding</label>
        <select
          value={minStipend}
          onChange={(e) => setMinStipend(e.target.value)}
          className="w-full bg-surface-container-high px-unit-md py-2 rounded-xl text-body-sm text-on-surface border-none outline-none cursor-pointer"
        >
          <option value="all">Any Compensation</option>
          <option value="500">$500+ / mo or Prize</option>
          <option value="1500">$1,500+ / mo</option>
          <option value="3000">$3,000+ / mo</option>
        </select>
      </div>

      {/* Verified Partners Only */}
      <div className="pt-unit-xs border-t border-surface-container-high">
        <label className="flex items-center gap-unit-sm text-body-sm text-on-surface font-medium cursor-pointer select-none">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="w-4 h-4 rounded accent-primary cursor-pointer"
          />
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <span>Verified Partners Only</span>
          </span>
        </label>
      </div>
    </div>
  );

  if (isMobileModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
        <div className="bg-surface-container-lowest w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto animate-slideUp">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-container-high">
            <span className="font-headline-sm text-on-surface">Filter Opportunities</span>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          {content}
          <div className="mt-6 pt-4 border-t border-surface-container-high flex justify-end">
            <button
              onClick={onClose}
              className="w-full bg-primary text-on-primary py-2.5 rounded-xl font-medium shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-full md:w-72 shrink-0 bg-surface-container-lowest p-unit-lg rounded-xl shadow-sm border border-surface-container-high/60 sticky top-24">
      {content}
    </aside>
  );
}
