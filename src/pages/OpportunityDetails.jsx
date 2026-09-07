import React from "react";
import { useApp } from "../context/AppContext";

export default function OpportunityDetails() {
  const {
    selectedOpportunity,
    setCurrentRoute,
    applyToOpportunity,
    toggleSave,
    savedIds,
    setFitScoreModalData,
    applications,
  } = useApp();

  const opp = selectedOpportunity;
  if (!opp) {
    return (
      <div className="p-8 text-center">
        <p>No opportunity selected.</p>
        <button
          onClick={() => setCurrentRoute("discover")}
          className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl"
        >
          Back to Discover
        </button>
      </div>
    );
  }

  const isSaved = savedIds.has(opp.id);
  const existingApp = applications.find((a) => a.opportunityId === opp.id && a.stage !== "saved");

  const breakdown = opp.fitBreakdown || {
    skills: 92,
    eligibility: 100,
    projects: 85,
    experience: 70,
    careerGoal: 90,
  };

  return (
    <div className="flex flex-col w-full space-y-unit-xl py-unit-md select-none pb-28 md:pb-8">
      {/* Top Breadcrumbs & Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentRoute("discover")}
          className="flex items-center gap-1.5 text-body-md text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Back to Opportunities</span>
        </button>

        <div className="flex items-center gap-unit-sm">
          <button
            onClick={() => toggleSave(opp.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-body-sm font-medium transition-colors ${
              isSaved
                ? "bg-primary-container text-on-primary-container border-primary-container"
                : "bg-surface-container-lowest text-on-surface-variant border-surface-container-high hover:bg-surface-container-high"
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${isSaved ? "fill" : ""}`}>
              bookmark
            </span>
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout on Desktop, Single-Column on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-unit-xl items-start">
        {/* Left 2 Columns: Detailed Specifications */}
        <div className="lg:col-span-2 space-y-unit-xl">
          {/* Header Card */}
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-surface-container-high/60 shadow-sm space-y-unit-md">
            <div className="flex items-start gap-unit-lg">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-headline-md font-bold shadow-sm shrink-0 ${opp.logoBg}`}>
                {opp.logoText}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-headline-lg text-on-surface text-[24px] md:text-[28px]">
                    {opp.title}
                  </h1>
                  {opp.verified && (
                    <span className="material-symbols-outlined text-[22px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  )}
                </div>
                <p className="text-body-lg text-on-surface-variant mt-1">
                  {opp.organization} • {opp.location}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 rounded-lg bg-surface-container-low text-primary text-label-md font-semibold">
                    {opp.categoryLabel}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-surface-container-low text-on-surface text-label-md font-semibold">
                    {opp.workplaceType}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-surface-container-low text-on-surface text-label-md font-semibold">
                    {opp.compensation}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-error-container/40 text-error text-label-md font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">schedule</span>
                    <span>Deadline: {opp.deadlineDays} days left</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Responsibilities */}
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-surface-container-high/60 shadow-sm space-y-unit-lg">
            <div>
              <h3 className="font-headline-sm text-on-surface mb-unit-sm">Role Overview</h3>
              <p className="text-body-lg text-on-surface-variant leading-relaxed">
                {opp.detailedDescription || opp.overview || opp.description}
              </p>
            </div>

            <div className="border-t border-surface-container-high pt-unit-lg">
              <h3 className="font-headline-sm text-on-surface mb-unit-sm">Required Qualifications & Skills</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-unit-md mt-unit-sm">
                {(opp.requiredSkills || []).map((skill) => {
                  const isMatched = opp.matchedSkills?.includes(skill);
                  return (
                    <div
                      key={skill}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isMatched
                          ? "bg-primary-container/10 border-primary/20 text-on-surface"
                          : "bg-surface-container-low border-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[18px] ${isMatched ? "text-primary font-bold" : "text-outline"}`}>
                          {isMatched ? "check_circle" : "pending"}
                        </span>
                        <span className="font-medium text-body-md">{skill}</span>
                      </div>
                      <span className={`text-label-sm font-semibold ${isMatched ? "text-primary" : "text-outline"}`}>
                        {isMatched ? "Verified in Profile" : "Skill Gap"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-surface-container-high pt-unit-lg">
              <h3 className="font-headline-sm text-on-surface mb-unit-sm">Academic Year Eligibility</h3>
              <div className="flex flex-wrap gap-unit-xs">
                {(opp.academicEligibility || []).map((year) => (
                  <span key={year} className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg text-body-sm font-medium">
                    ✓ {year}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Factor Fit Matrix & Direct Apply Card */}
        <div className="space-y-unit-lg">
          {/* Fit Score Widget */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-sm space-y-unit-md">
            <div className="flex items-center justify-between">
              <span className="text-label-sm font-bold text-primary uppercase tracking-wider">Candidate Match Index</span>
              <button
                onClick={() => setFitScoreModalData(opp)}
                className="text-label-sm text-primary hover:underline font-medium"
              >
                Inspect Factors
              </button>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-[44px] font-bold text-primary leading-none">{opp.fitScore}%</span>
              <span className="text-headline-sm text-on-surface font-semibold">SkillMatch Fit</span>
            </div>

            <p className="text-body-sm text-on-surface-variant">
              Computed algorithmically from your verified profile credentials. Not an automated guarantee of selection.
            </p>

            <div className="space-y-2 pt-2 border-t border-surface-container-high">
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Verified Skills Alignment</span>
                <span className="font-semibold text-primary">{breakdown.skills}%</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Academic Prerequisites</span>
                <span className="font-semibold text-primary">{breakdown.eligibility}%</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Portfolio Proof-of-Work</span>
                <span className="font-semibold text-primary">{breakdown.projects}%</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Target Career Acceleration</span>
                <span className="font-semibold text-primary">{breakdown.careerGoal}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-surface-container-high">
              <div className="bg-surface-container-low p-2.5 rounded-xl text-center">
                <div className="text-label-sm text-outline">Candidate Readiness</div>
                <div className="text-headline-sm text-[18px] font-bold text-on-surface">{opp.readinessScore || 80}%</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-xl text-center">
                <div className="text-label-sm text-outline">Opportunity Trust</div>
                <div className="text-headline-sm text-[18px] font-bold text-primary">{opp.trustScore || 90}%</div>
              </div>
            </div>

            {/* Desktop Apply CTA */}
            <div className="hidden md:block pt-unit-sm">
              <button
                onClick={() => applyToOpportunity(opp)}
                disabled={Boolean(existingApp)}
                className={`w-full py-3 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 transition-all ${
                  existingApp
                    ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
                    : "bg-primary text-on-primary hover:bg-primary-container"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {existingApp ? "task_alt" : "send"}
                </span>
                <span>{existingApp ? `Applied (${existingApp.stage.toUpperCase()})` : "Submit Application"}</span>
              </button>
            </div>
          </div>

          {/* Company & Trust Card */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-sm space-y-unit-sm">
            <div className="flex items-center gap-2 text-primary font-label-md font-semibold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Employer Trust Verification</span>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              This organization has completed verified employer identity screening, verified stipend escrows, and direct campus partnership accreditation.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Apply CTA Bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 p-3 bg-surface-container-lowest border-t border-surface-container-high shadow-2xl z-40 flex items-center justify-between gap-3">
        <div>
          <div className="text-label-sm text-primary font-bold">{opp.fitScore}% Fit Score</div>
          <div className="text-body-sm font-semibold text-on-surface line-clamp-1">{opp.compensation}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSave(opp.id)}
            className={`p-2.5 rounded-xl border ${
              isSaved
                ? "bg-primary-container text-on-primary-container border-primary-container"
                : "border-surface-container-high text-on-surface-variant"
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isSaved ? "fill" : ""}`}>
              bookmark
            </span>
          </button>
          <button
            onClick={() => applyToOpportunity(opp)}
            disabled={Boolean(existingApp)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-body-sm shadow-md flex items-center gap-1.5 ${
              existingApp
                ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
                : "bg-primary text-on-primary"
            }`}
          >
            <span>{existingApp ? "Applied" : "Apply Now"}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
