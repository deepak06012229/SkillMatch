import React from "react";
import { useApp } from "../../context/AppContext";

export default function OpportunityCard({ opp }) {
  const { savedIds, toggleSave, applyToOpportunity, viewOpportunityDetails, setFitScoreModalData } = useApp();
  const isSaved = savedIds.has(opp.id);

  return (
    <div 
      className="opportunity-card flex flex-col justify-between bg-surface-container-lowest p-unit-lg rounded-xl shadow-sm hover:shadow-md border border-surface-container-high/60 transition-all group select-none"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-unit-md mb-unit-md">
          <div 
            onClick={() => viewOpportunityDetails(opp.id)}
            className="flex items-center gap-unit-md cursor-pointer flex-1"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-headline-sm font-semibold shrink-0 shadow-sm ${opp.logoBg}`}>
              {opp.logoText}
            </div>
            <div>
              <div className="flex items-center gap-unit-xs flex-wrap">
                <h4 className="font-headline-sm text-[17px] text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                  {opp.title}
                </h4>
                {opp.verified && (
                  <span 
                    className="material-symbols-outlined text-[16px] text-primary" 
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Verified Trust Status"
                  >
                    verified
                  </span>
                )}
              </div>
              <p className="font-body-sm text-on-surface-variant">
                {opp.organization} • {opp.location}
              </p>
            </div>
          </div>

          {/* Interactive Fit Score Pill */}
          <button
            onClick={() => setFitScoreModalData(opp)}
            className="px-2.5 py-1 rounded-full bg-primary-container/10 hover:bg-primary-container/20 text-primary font-label-md font-bold flex items-center gap-1 transition-colors shrink-0 shadow-sm"
            title="Click to view full Fit Score Breakdown"
          >
            <span className="material-symbols-outlined text-[15px]">bolt</span>
            <span>{opp.fitScore}% Fit</span>
          </button>
        </div>

        {/* Description snippet */}
        <p 
          onClick={() => viewOpportunityDetails(opp.id)}
          className="font-body-md text-on-surface-variant line-clamp-2 mb-unit-md cursor-pointer"
        >
          {opp.description}
        </p>

        {/* Skill Tags & Compensation */}
        <div className="flex flex-wrap gap-unit-xs mb-unit-md">
          <span className="px-unit-sm py-unit-xs rounded bg-surface-container-low text-primary text-label-sm font-medium">
            {opp.categoryLabel}
          </span>
          {opp.compensation && (
            <span className="px-unit-sm py-unit-xs rounded bg-surface-container-low text-on-surface-variant text-label-sm font-semibold">
              {opp.compensation}
            </span>
          )}
          {opp.requiredSkills.slice(0, 2).map((skill) => (
            <span 
              key={skill}
              className="px-unit-sm py-unit-xs rounded bg-surface-container-low text-on-surface-variant text-label-sm"
            >
              {skill}
            </span>
          ))}
          {opp.requiredSkills.length > 2 && (
            <span className="px-unit-sm py-unit-xs rounded bg-surface-container-low text-outline text-label-sm">
              +{opp.requiredSkills.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Deadline, Save, Quick Apply */}
      <div className="flex items-center justify-between pt-unit-md border-t border-surface-container-high/80">
        <span className="text-label-sm text-error flex items-center gap-1 font-medium">
          <span className="material-symbols-outlined text-[15px]">schedule</span>
          <span>Closes in {opp.deadlineDays} days</span>
        </span>

        <div className="flex items-center gap-unit-sm">
          <button
            onClick={() => toggleSave(opp.id)}
            className={`p-2 rounded-xl transition-colors ${
              isSaved
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
            title={isSaved ? "Saved" : "Save opportunity"}
          >
            <span className={`material-symbols-outlined text-[20px] ${isSaved ? "fill" : ""}`}>
              bookmark
            </span>
          </button>
          <button
            onClick={() => applyToOpportunity(opp)}
            className="px-unit-md py-1.5 rounded-xl bg-primary text-on-primary font-label-md hover:bg-primary-container transition-all shadow-sm flex items-center gap-1"
          >
            <span>Apply</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
