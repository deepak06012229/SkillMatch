import React from "react";
import { useApp } from "../../context/AppContext";

export default function MatchScoreModal() {
  const { fitScoreModalData, setFitScoreModalData, applyToOpportunity, viewOpportunityDetails } = useApp();

  if (!fitScoreModalData) return null;

  const opp = fitScoreModalData;
  const breakdown = opp.fitBreakdown || {
    skills: 90,
    eligibility: 100,
    projects: 85,
    experience: 75,
    careerGoal: 90
  };

  const readiness = opp.readinessScore || 78;
  const trust = opp.trustScore || 94;

  const breakdownItems = [
    { label: "Verified Skills Alignment", score: breakdown.skills, icon: "psychology", desc: "Direct match with your verified Python, ML & Linear Algebra competencies" },
    { label: "Academic Eligibility", score: breakdown.eligibility, icon: "school", desc: "Meets year, degree, and semester prerequisites" },
    { label: "Project Proof-of-Work", score: breakdown.projects, icon: "terminal", desc: "Matched against your CNN Image Classification & Visual QA repos" },
    { label: "Prior Experience Relevance", score: breakdown.experience, icon: "work", desc: "Undergraduate lab research intern background" },
    { label: "Career Goal Cohesion", score: breakdown.careerGoal, icon: "flag", desc: "Directly accelerates your target 10-week AI/ML role path" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-surface-container-lowest w-full max-w-xl rounded-2xl shadow-xl border border-surface-container-high overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-unit-lg border-b border-surface-container-high flex items-start justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-unit-md">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-headline-sm font-semibold shadow-sm ${opp.logoBg}`}>
              {opp.logoText}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-on-surface">{opp.title}</h3>
                {opp.verified && (
                  <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                )}
              </div>
              <p className="text-body-sm text-on-surface-variant">{opp.organization} • {opp.location}</p>
            </div>
          </div>
          <button 
            onClick={() => setFitScoreModalData(null)}
            className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-unit-lg overflow-y-auto space-y-unit-lg">
          {/* Main Fit Score Banner */}
          <div className="bg-surface-container-low p-unit-lg rounded-xl border border-surface-container-high/60 flex flex-col sm:flex-row items-center justify-between gap-unit-md">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-label-sm font-semibold text-primary uppercase tracking-wider">SkillMatch Multi-Factor Fit</span>
              <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                <span className="text-[36px] font-bold text-primary leading-none">{opp.fitScore}%</span>
                <span className="text-body-md font-semibold text-on-surface">Fit Index</span>
              </div>
              <p className="text-body-sm text-on-surface-variant">
                Computed by algorithmic vector similarity against candidate profile.
              </p>
            </div>
            
            {/* Trust & Readiness Badges */}
            <div className="flex flex-row sm:flex-col gap-2 shrink-0">
              <div className="bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-surface-container-high flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
                <div className="text-left">
                  <div className="text-label-sm text-outline">Readiness</div>
                  <div className="text-body-sm font-bold text-on-surface">{readiness}% Ready</div>
                </div>
              </div>
              <div className="bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-surface-container-high flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <div className="text-left">
                  <div className="text-label-sm text-outline">Opportunity Trust</div>
                  <div className="text-body-sm font-bold text-primary">{trust}% Verified</div>
                </div>
              </div>
            </div>
          </div>

          {/* Strict Disclaimer Notice */}
          <div className="bg-surface-container-high/40 p-unit-md rounded-xl border border-surface-container-high flex items-start gap-unit-sm text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px] text-outline shrink-0 mt-0.5">info</span>
            <div>
              <strong className="text-on-surface">Understanding the Fit Score:</strong> The Fit Score measures objective alignment between your profile credentials and role requirements. It does <em>not</em> represent probability of final selection or an automated hiring decision.
            </div>
          </div>

          {/* Breakdown Progress Bars */}
          <div className="space-y-unit-md">
            <h4 className="font-headline-sm text-on-surface text-[16px]">Factor Alignment Breakdown</h4>
            <div className="space-y-unit-sm">
              {breakdownItems.map((item, idx) => (
                <div key={idx} className="bg-surface-container-low p-3 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 text-body-md font-medium text-on-surface">
                      <span className="material-symbols-outlined text-primary text-[18px]">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <span className="text-body-md font-bold text-primary">{item.score}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-1">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-700" 
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                  <p className="text-label-sm text-on-surface-variant">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-unit-lg border-t border-surface-container-high flex items-center justify-between bg-surface-container-low/50">
          <button
            onClick={() => {
              viewOpportunityDetails(opp.id);
              setFitScoreModalData(null);
            }}
            className="text-body-md text-primary font-medium hover:underline flex items-center gap-1"
          >
            View Full Opportunity <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
          <div className="flex items-center gap-unit-sm">
            <button
              onClick={() => setFitScoreModalData(null)}
              className="px-unit-md py-2 rounded-xl text-body-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                applyToOpportunity(opp);
                setFitScoreModalData(null);
              }}
              className="bg-primary text-on-primary px-unit-lg py-2 rounded-xl text-body-sm font-medium hover:bg-primary-container transition-all shadow-sm"
            >
              Quick Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
