import React from "react";
import { useApp } from "../context/AppContext";

export default function Roadmap() {
  const { roadmapGoal, roadmapWeeks, toggleChecklist, setCurrentRoute, addToast } = useApp();

  return (
    <div className="flex flex-col w-full space-y-unit-xl py-unit-md select-none">
      {/* Goal Banner & AI Agent Header (Matching Stitch Screen 4) */}
      <div className="relative overflow-hidden bg-primary-container text-on-primary-container rounded-2xl p-6 md:p-8 shadow-md border border-primary/20">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-unit-lg">
          <div className="space-y-unit-sm max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-primary-fixed/30 text-on-primary-fixed px-3 py-1 rounded-full text-label-sm font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[15px]">smart_toy</span>
              <span>{roadmapGoal.badge}</span>
            </div>
            <h1 className="text-headline-xl text-on-primary-container font-headline-xl leading-tight">
              {roadmapGoal.title}
            </h1>
            <p className="text-body-md text-on-primary-container/90">
              {roadmapGoal.description}
            </p>
          </div>

          {/* Progress Summary Card */}
          <div className="bg-surface text-on-surface p-unit-lg rounded-2xl shadow-md min-w-[260px] w-full md:w-auto flex flex-col gap-unit-sm shrink-0 border border-surface-container-high">
            <div className="flex justify-between items-center text-body-sm font-semibold">
              <span className="text-on-surface-variant">Overall Progress</span>
              <span className="text-primary font-bold">Week {roadmapGoal.currentWeek} of {roadmapGoal.totalWeeks}</span>
            </div>
            <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-1000"
                style={{ width: `${roadmapGoal.percentComplete}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-label-sm text-outline font-medium mt-unit-xs">
              <span>{roadmapGoal.totalWeeks - roadmapGoal.currentWeek} weeks remaining</span>
              <span className="font-bold text-primary">{roadmapGoal.percentComplete}% Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Roadmap Timeline & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-unit-xl items-start">
        {/* Left 2 Cols: Interactive Responsive Timeline */}
        <div className="lg:col-span-2 space-y-unit-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md text-on-surface">Your 10-Week Execution Roadmap</h2>
            <div className="hidden sm:flex items-center gap-unit-sm text-body-sm text-on-surface-variant font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary-container inline-block"></span>
                Current
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-surface-container-high inline-block"></span>
                Upcoming
              </span>
            </div>
          </div>

          {/* Vertical Timeline Stack */}
          <div className="relative pl-6 space-y-unit-lg before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-container-highest">
            {roadmapWeeks.map((week, idx) => {
              const isCompleted = week.status === "completed";
              const isCurrent = week.status === "current";

              return (
                <div key={week.weekLabel} className="relative group">
                  {/* Status Indicator Icon */}
                  <div
                    className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-surface transition-all ${
                      isCompleted
                        ? "bg-primary text-on-primary"
                        : isCurrent
                        ? "bg-secondary-container text-primary ring-primary/20 animate-pulse"
                        : "bg-surface-container-high text-outline"
                    }`}
                  >
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                    )}
                  </div>

                  {/* Milestone Card */}
                  <div
                    className={`p-unit-lg rounded-2xl shadow-sm transition-all space-y-unit-md border ${
                      isCurrent
                        ? "bg-surface-container-lowest border-primary/40 ring-2 ring-primary/10 shadow-md"
                        : "bg-surface-container-lowest border-surface-container-high/70 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-unit-sm">
                      <span
                        className={`text-label-sm uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg ${
                          isCompleted
                            ? "bg-primary-container/10 text-primary"
                            : isCurrent
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {week.weekLabel}
                      </span>
                      <span className="text-body-sm text-on-surface-variant flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        <span>{week.estimatedHours}</span>
                      </span>
                    </div>

                    <h3 className="text-headline-sm text-on-surface text-[19px]">{week.title}</h3>
                    <p className="text-body-md text-on-surface-variant">{week.description}</p>

                    {/* Skill Pills */}
                    <div className="flex flex-wrap gap-unit-xs pt-unit-xs">
                      {week.skills.map((s) => (
                        <span key={s} className="bg-surface-container-low px-unit-sm py-1 rounded-lg text-label-md text-on-surface-variant font-medium">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Deliverables Checklist (for current week) */}
                    {isCurrent && week.checklist && (
                      <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container-high/60 space-y-2 mt-2">
                        <span className="text-label-sm font-bold text-primary uppercase tracking-wider block">
                          Current Action Items
                        </span>
                        {week.checklist.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => toggleChecklist(idx, item.id)}
                            className="flex items-center gap-2.5 text-body-sm text-on-surface cursor-pointer p-1.5 rounded-lg hover:bg-surface-container transition-colors"
                          >
                            <span className="material-symbols-outlined text-primary text-[18px]">
                              {item.done ? "check_circle" : "radio_button_unchecked"}
                            </span>
                            <span className={item.done ? "line-through text-on-surface-variant" : "font-medium"}>
                              {item.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Card Footer Status / Action */}
                    <div className="pt-unit-sm flex items-center justify-between text-body-sm border-t border-surface-container-high">
                      <span className="text-primary font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">
                          {isCompleted ? "verified" : isCurrent ? "bolt" : "lock_clock"}
                        </span>
                        <span>{week.completedDate}</span>
                      </span>
                      <button
                        onClick={() => {
                          if (isCompleted) {
                            addToast(`Opened artifact for ${week.title}`, "info");
                          } else if (isCurrent) {
                            addToast("Syncing latest GitHub commit changes...", "success");
                          } else {
                            addToast("This milestone will unlock once current sprint completes.", "info");
                          }
                        }}
                        className="text-primary hover:underline text-body-sm font-medium flex items-center gap-1"
                      >
                        <span>{week.actionLabel}</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Career Agent Insights & Recommendations */}
        <div className="space-y-unit-lg">
          {/* AI Career Agent Advisor Widget */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-sm space-y-unit-md">
            <div className="flex items-center gap-2 text-primary font-label-md font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              <span>AI Agent Market Telemetry</span>
            </div>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              Based on recent internship job postings at Google Cloud and TechNova, candidate applications including Docker containerization and live FastAPI Swagger links experience <strong>3.4x higher interview response rates</strong>.
            </p>

            <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-high/60 space-y-1">
              <div className="text-label-sm font-bold text-on-surface">Recommended Next Action</div>
              <p className="text-body-sm text-on-surface-variant">
                Complete the "Embed Architecture Diagram" checklist item before applying to TechNova.
              </p>
            </div>

            <button
              onClick={() => setCurrentRoute("projects")}
              className="w-full py-2.5 bg-primary-container text-on-primary-container font-medium rounded-xl hover:bg-primary transition-colors shadow-sm text-body-sm"
            >
              Browse Proof-of-Work Projects
            </button>
          </div>

          {/* GitHub Sync Status Widget */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-sm space-y-unit-sm">
            <div className="flex items-center justify-between">
              <span className="text-label-sm font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">sync</span>
                <span>GitHub Telemetry Sync</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Repository commits synced 48 minutes ago. 148 commits detected in the last 30 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
