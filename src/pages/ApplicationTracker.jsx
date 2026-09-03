import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { APPLICATION_STAGES } from "../data/applications";

export default function ApplicationTracker() {
  const { applications, moveApplicationStage, viewOpportunityDetails, setCurrentRoute } = useApp();
  const [selectedMobileStage, setSelectedMobileStage] = useState("all");

  const getApplicationsByStage = (stageId) => {
    return applications.filter((app) => app.stage === stageId);
  };

  const filteredMobileApps = applications.filter((app) =>
    selectedMobileStage === "all" ? true : app.stage === selectedMobileStage
  );

  return (
    <div className="flex flex-col w-full space-y-unit-xl py-unit-md select-none">
      {/* Header */}
      <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-surface-container-high/60 flex flex-col md:flex-row md:items-center justify-between gap-unit-lg shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-primary font-label-md uppercase tracking-wider font-semibold mb-1">
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>Lifecycle Application Hub</span>
          </div>
          <h1 className="font-headline-xl text-on-surface">Application Tracker ({applications.length})</h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl">
            Monitor real-time recruiter screening stages, take-home evaluations, and scheduled interview rounds.
          </p>
        </div>

        <button
          onClick={() => setCurrentRoute("discover")}
          className="px-unit-lg py-2.5 bg-primary text-on-primary font-medium rounded-xl hover:bg-primary-container transition-all shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">explore</span>
          <span>Apply to New Roles</span>
        </button>
      </div>

      {/* Mobile Stage Selector Tabs (Hidden on Desktop) */}
      <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedMobileStage("all")}
          className={`px-3 py-1.5 rounded-xl text-body-sm font-medium whitespace-nowrap transition-colors ${
            selectedMobileStage === "all"
              ? "bg-primary text-on-primary shadow-sm"
              : "bg-surface-container-low text-on-surface-variant"
          }`}
        >
          All ({applications.length})
        </button>
        {APPLICATION_STAGES.map((stg) => {
          const count = getApplicationsByStage(stg.id).length;
          return (
            <button
              key={stg.id}
              onClick={() => setSelectedMobileStage(stg.id)}
              className={`px-3 py-1.5 rounded-xl text-body-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedMobileStage === stg.id
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant"
              }`}
            >
              <span>{stg.title}</span>
              <span className="text-label-sm font-bold opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Desktop Kanban Pipeline (5 Columns) */}
      <div className="hidden md:grid md:grid-cols-5 gap-unit-md items-start overflow-x-auto">
        {APPLICATION_STAGES.map((stage) => {
          const stageApps = getApplicationsByStage(stage.id);

          return (
            <div
              key={stage.id}
              className="bg-surface-container-low/70 rounded-2xl p-4 border border-surface-container-high flex flex-col space-y-unit-md min-w-[220px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
                <div className="flex items-center gap-1.5 font-headline-sm text-[16px] text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-primary">{stage.icon}</span>
                  <span>{stage.title}</span>
                </div>
                <span className="bg-surface-container-highest px-2 py-0.5 rounded-full text-label-sm font-bold text-on-surface-variant">
                  {stageApps.length}
                </span>
              </div>

              {/* Cards in this Stage */}
              <div className="space-y-unit-md min-h-[300px]">
                {stageApps.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-outline-variant text-center text-outline text-label-sm">
                    No active roles in {stage.title}
                  </div>
                ) : (
                  stageApps.map((app) => (
                    <div
                      key={app.id}
                      className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container-high/80 hover:shadow-md transition-all space-y-2 select-none"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-label-sm shrink-0 ${app.logoBg}`}>
                          {app.logoText}
                        </div>
                        <span className="bg-primary-container/10 text-primary text-label-sm font-bold px-2 py-0.5 rounded-full">
                          {app.fitScore}% Fit
                        </span>
                      </div>

                      <div>
                        <h4
                          onClick={() => viewOpportunityDetails(app.opportunityId)}
                          className="font-headline-sm text-[15px] text-on-surface hover:text-primary cursor-pointer line-clamp-1"
                        >
                          {app.title}
                        </h4>
                        <p className="text-body-sm text-on-surface-variant line-clamp-1">
                          {app.organization}
                        </p>
                      </div>

                      {/* Next Action Box */}
                      <div className="bg-surface-container-low p-2 rounded-lg text-label-sm text-on-surface-variant border border-surface-container-high/40">
                        <span className="font-semibold text-on-surface block text-[11px] uppercase tracking-wider text-primary">Next Step:</span>
                        <span className="line-clamp-2">{app.nextAction}</span>
                      </div>

                      {/* Stage Mover Controls */}
                      <div className="pt-2 border-t border-surface-container-high flex items-center justify-between text-label-sm">
                        <span className="text-outline">{app.lastUpdated}</span>
                        <select
                          value={app.stage}
                          onChange={(e) => moveApplicationStage(app.id, e.target.value)}
                          className="bg-surface-container-high text-on-surface px-2 py-1 rounded text-label-sm font-medium border-none outline-none cursor-pointer"
                        >
                          <option value="saved">Saved</option>
                          <option value="applied">Applied</option>
                          <option value="under_review">In Review</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="offered">Offered</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Card List (Visible on Mobile) */}
      <div className="md:hidden space-y-unit-md">
        {filteredMobileApps.map((app) => (
          <div
            key={app.id}
            className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-sm space-y-unit-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-body-md ${app.logoBg}`}>
                  {app.logoText}
                </div>
                <div>
                  <h4
                    onClick={() => viewOpportunityDetails(app.opportunityId)}
                    className="font-headline-sm text-[16px] text-on-surface hover:text-primary"
                  >
                    {app.title}
                  </h4>
                  <p className="text-body-sm text-on-surface-variant">{app.organization}</p>
                </div>
              </div>
              <span className="bg-primary-container/10 text-primary text-label-md font-bold px-2.5 py-1 rounded-full">
                {app.fitScore}% Fit
              </span>
            </div>

            <div className="bg-surface-container-low p-3 rounded-xl text-body-sm border border-surface-container-high/60">
              <strong className="text-primary block text-label-sm uppercase tracking-wider mb-0.5">Next Milestone:</strong>
              <p className="text-on-surface-variant">{app.nextAction}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-container-high">
              <span className="text-label-sm text-outline">Stage:</span>
              <select
                value={app.stage}
                onChange={(e) => moveApplicationStage(app.id, e.target.value)}
                className="bg-surface-container-high px-3 py-1 rounded-lg text-body-sm font-semibold text-on-surface"
              >
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="under_review">Under Review</option>
                <option value="interviewing">Interviewing</option>
                <option value="offered">Offered</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
