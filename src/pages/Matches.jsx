import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function Matches() {
  const { opportunities, setFitScoreModalData, applyToOpportunity, viewOpportunityDetails, toggleSave, savedIds } = useApp();
  const [selectedFilter, setSelectedFilter] = useState("all");

  const highMatches = opportunities
    .filter((opp) => opp.fitScore >= 80)
    .sort((a, b) => b.fitScore - a.fitScore);

  const filteredMatches = highMatches.filter((opp) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "high90") return opp.fitScore >= 90;
    if (selectedFilter === "internships") return opp.category === "internships";
    if (selectedFilter === "verified") return opp.verified;
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-unit-xl py-unit-md select-none">
      {/* Page Header */}
      <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-surface-container-high/60 flex flex-col md:flex-row md:items-center justify-between gap-unit-lg shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-primary font-label-md uppercase tracking-wider font-semibold mb-1">
            <span className="material-symbols-outlined text-[18px]">handshake</span>
            <span>Algorithmic Fit Matrix</span>
          </div>
          <h1 className="font-headline-xl text-on-surface">My Matches ({filteredMatches.length})</h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl">
            Opportunities evaluated with &gt;80% profile synergy across Skills, Eligibility, Projects, Experience, and Career Goals.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "all", label: "All ≥80% Fit" },
            { id: "high90", label: "Frontier (≥90%)" },
            { id: "internships", label: "Internships" },
            { id: "verified", label: "Verified Partners" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedFilter(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-body-sm font-medium transition-colors whitespace-nowrap ${
                selectedFilter === pill.id
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Important Disclaimer Notice */}
      <div className="bg-surface-container-lowest p-unit-md rounded-xl border border-primary/20 flex items-center gap-unit-md text-body-sm text-on-surface-variant shadow-sm">
        <span className="material-symbols-outlined text-primary text-[22px] shrink-0">info</span>
        <div>
          <strong className="text-on-surface">Compliance Note:</strong> SkillMatch Fit Scores measure multi-dimensional credential alignment. They do not calculate probability of final hire or selection.
        </div>
      </div>

      {/* Match Cards List with Expanded Visual Breakdown */}
      <div className="space-y-unit-lg">
        {filteredMatches.map((opp) => {
          const isSaved = savedIds.has(opp.id);
          const breakdown = opp.fitBreakdown || {
            skills: 90,
            eligibility: 100,
            projects: 85,
            experience: 70,
            careerGoal: 90,
          };

          return (
            <div
              key={opp.id}
              className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-surface-container-high/70 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row gap-unit-xl items-start lg:items-center justify-between"
            >
              {/* Left Column: Organization & Details */}
              <div className="space-y-unit-md flex-1">
                <div className="flex items-start gap-unit-md">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-headline-sm font-bold shadow-sm shrink-0 ${opp.logoBg}`}>
                    {opp.logoText}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        onClick={() => viewOpportunityDetails(opp.id)}
                        className="font-headline-sm text-on-surface hover:text-primary cursor-pointer transition-colors"
                      >
                        {opp.title}
                      </h3>
                      {opp.verified && (
                        <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                          verified
                        </span>
                      )}
                      <span className="bg-surface-container-high text-on-surface-variant text-label-sm px-2.5 py-0.5 rounded-full font-medium">
                        {opp.categoryLabel}
                      </span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">
                      {opp.organization} • {opp.location} • {opp.compensation}
                    </p>
                  </div>
                </div>

                <p className="text-body-md text-on-surface-variant line-clamp-2 max-w-2xl">
                  {opp.description}
                </p>

                {/* Skill Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-label-sm text-outline font-semibold">Matched Skills:</span>
                  {opp.matchedSkills?.map((s) => (
                    <span key={s} className="bg-primary-container/10 text-primary px-2 py-0.5 rounded text-label-sm font-medium">
                      ✓ {s}
                    </span>
                  ))}
                  {opp.missingSkills?.map((s) => (
                    <span key={s} className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded text-label-sm">
                      + {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Middle Column: Multi-Dimensional Breakdown */}
              <div className="w-full lg:w-72 bg-surface-container-low p-4 rounded-xl border border-surface-container-high/60 space-y-2.5 shrink-0">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container-high/60">
                  <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
                    Fit Score Breakdown
                  </span>
                  <span className="text-headline-sm text-primary font-bold">{opp.fitScore}% Fit</span>
                </div>

                <div className="space-y-1.5 text-body-sm">
                  <div className="flex justify-between items-center text-label-sm">
                    <span className="text-on-surface-variant">Skills</span>
                    <span className="font-semibold text-on-surface">{breakdown.skills}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${breakdown.skills}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center text-label-sm pt-0.5">
                    <span className="text-on-surface-variant">Eligibility</span>
                    <span className="font-semibold text-on-surface">{breakdown.eligibility}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${breakdown.eligibility}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center text-label-sm pt-0.5">
                    <span className="text-on-surface-variant">Projects</span>
                    <span className="font-semibold text-on-surface">{breakdown.projects}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${breakdown.projects}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center text-label-sm pt-0.5">
                    <span className="text-on-surface-variant">Career Goal</span>
                    <span className="font-semibold text-on-surface">{breakdown.careerGoal}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${breakdown.careerGoal}%` }}></div>
                  </div>
                </div>

                {/* Readiness and Trust badges */}
                <div className="pt-2 border-t border-surface-container-high/60 flex items-center justify-between text-label-sm">
                  <span className="text-on-surface-variant">Readiness: <strong className="text-on-surface">{opp.readinessScore}%</strong></span>
                  <span className="text-on-surface-variant">Trust: <strong className="text-primary">{opp.trustScore}%</strong></span>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex flex-row lg:flex-col gap-unit-sm w-full lg:w-auto shrink-0 justify-end">
                <button
                  onClick={() => setFitScoreModalData(opp)}
                  className="flex-1 lg:flex-none px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md transition-colors text-center"
                >
                  Inspect Matrix
                </button>
                <button
                  onClick={() => toggleSave(opp.id)}
                  className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${
                    isSaved
                      ? "bg-primary-container text-on-primary-container border-primary-container"
                      : "bg-surface-container-lowest text-on-surface-variant border-surface-container-high hover:bg-surface-container-high"
                  }`}
                  title={isSaved ? "Saved" : "Save"}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isSaved ? "fill" : ""}`}>
                    bookmark
                  </span>
                </button>
                <button
                  onClick={() => applyToOpportunity(opp)}
                  className="flex-1 lg:flex-none px-6 py-2.5 rounded-xl bg-primary text-on-primary font-medium hover:bg-primary-container transition-all shadow-sm text-center"
                >
                  Quick Apply
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
