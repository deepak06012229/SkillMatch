import React from "react";
import { useApp } from "../context/AppContext";

export default function ProjectRecommendations() {
  const { recommendedProjects, setCurrentRoute, addToast } = useApp();

  return (
    <div className="flex flex-col w-full space-y-unit-xl py-unit-md select-none">
      {/* Header */}
      <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-surface-container-high/60 flex flex-col md:flex-row md:items-center justify-between gap-unit-lg shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-primary font-label-md uppercase tracking-wider font-semibold mb-1">
            <span className="material-symbols-outlined text-[18px]">code_blocks</span>
            <span>Proof-of-Work Portfolio Engine</span>
          </div>
          <h1 className="font-headline-xl text-on-surface">Project Recommendations</h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl">
            Targeted hands-on projects designed to eliminate your detected skill gaps and produce verifiable code artifacts for recruiters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentRoute("skill-gap")}
            className="px-unit-lg py-2.5 bg-surface-container-lowest border border-surface-container-high hover:border-primary text-on-surface font-medium rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
            <span>View Skill Gaps</span>
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-unit-lg items-start">
        {recommendedProjects.map((project) => (
          <div
            key={project.id}
            className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-surface-container-high/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-unit-md"
          >
            <div className="space-y-unit-md">
              <div className="flex items-start justify-between gap-2">
                <span className="bg-primary-container/10 text-primary px-3 py-1 rounded-full text-label-sm font-bold">
                  {project.difficulty}
                </span>
                <span className="text-body-sm text-outline font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">schedule</span>
                  {project.estimatedDuration}
                </span>
              </div>

              <h3 className="font-headline-sm text-on-surface text-[19px] leading-snug">
                {project.title}
              </h3>

              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                {project.description}
              </p>

              {/* Impact Callout */}
              <div className="bg-primary-container/10 p-3 rounded-xl border border-primary/20 flex items-center gap-2 text-body-sm text-primary font-semibold">
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
                <span>{project.impact}</span>
              </div>

              {/* Targeted Skills */}
              <div className="space-y-1">
                <span className="text-label-sm text-outline font-semibold uppercase tracking-wider block">
                  Skills Built
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.skillsTargeted.map((s) => (
                    <span key={s} className="bg-surface-container-low text-on-surface-variant px-2.5 py-1 rounded-lg text-label-md font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Implementation Roadmap Steps */}
              <div className="space-y-2 pt-2 border-t border-surface-container-high">
                <span className="text-label-sm text-on-surface font-semibold block">
                  Milestone Sprint
                </span>
                <ol className="space-y-1.5 text-body-sm text-on-surface-variant list-decimal list-inside">
                  {project.steps.map((step, idx) => (
                    <li key={idx} className="leading-snug">{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-unit-md border-t border-surface-container-high">
              <button
                onClick={() => addToast(`Started project sprint: ${project.title}. Milestone tracker added to Roadmap.`, "success")}
                className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-1.5 text-body-sm"
              >
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                <span>Start Project Sprint</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
