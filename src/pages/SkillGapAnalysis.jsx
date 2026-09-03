import React from "react";
import { useApp } from "../context/AppContext";

export default function SkillGapAnalysis() {
  const { skillGapsData, setCurrentRoute } = useApp();

  const criticalGaps = skillGapsData.filter((g) => g.priority === "Critical");
  const importantGaps = skillGapsData.filter((g) => g.priority === "Important");
  const preferredGaps = skillGapsData.filter((g) => g.priority === "Preferred");

  const renderGapCard = (gap) => (
    <div
      key={gap.id}
      className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-unit-md"
    >
      <div className="space-y-unit-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-on-surface text-[18px]">{gap.skillName}</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-label-sm font-bold ${gap.priorityColor}`}>
            {gap.priority}
          </span>
        </div>

        <p className="text-body-sm text-on-surface-variant">
          Target Role Need: <span className="font-medium text-on-surface">{gap.targetRole}</span>
        </p>

        {/* Current vs Required Level Matrix */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container-high/40 space-y-2">
          <div className="flex justify-between text-body-sm">
            <span className="text-on-surface-variant font-medium">Current Level:</span>
            <span className="font-semibold text-outline">{gap.currentLevel}</span>
          </div>
          <div className="flex justify-between text-body-sm">
            <span className="text-on-surface-variant font-medium">Target Required:</span>
            <span className="font-semibold text-primary">{gap.requiredLevel}</span>
          </div>
          <div className="flex justify-between text-body-sm pt-1 border-t border-surface-container-high/60">
            <span className="text-on-surface-variant font-medium">Estimated Effort:</span>
            <span className="font-bold text-on-surface">{gap.estimatedEffort}</span>
          </div>
        </div>

        {/* Recommended Action */}
        <div className="bg-primary-container/5 p-3 rounded-xl border border-primary/20">
          <span className="text-label-sm text-primary font-bold block mb-1">Recommended Learning Path</span>
          <p className="text-body-sm text-on-surface-variant font-medium">{gap.recommendedAction}</p>
        </div>
      </div>

      <div className="pt-unit-md border-t border-surface-container-high flex items-center justify-between">
        <span className="text-label-sm text-outline font-medium">{gap.curriculumModule}</span>
        <button
          onClick={() => setCurrentRoute("roadmap")}
          className="text-primary hover:underline text-body-sm font-medium flex items-center gap-1"
        >
          <span>Open in Roadmap</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col w-full space-y-unit-xl py-unit-md select-none">
      {/* Header */}
      <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-surface-container-high/60 flex flex-col md:flex-row md:items-center justify-between gap-unit-lg shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-primary font-label-md uppercase tracking-wider font-semibold mb-1">
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            <span>Prerequisite Gap Diagnostics</span>
          </div>
          <h1 className="font-headline-xl text-on-surface">Skill Gap Analysis</h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl">
            Identifies competencies missing between your verified student credentials and your target AI/ML engineering roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentRoute("projects")}
            className="px-unit-lg py-2.5 bg-primary text-on-primary font-medium rounded-xl hover:bg-primary-container transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">code_blocks</span>
            <span>Close Gaps with Projects</span>
          </button>
        </div>
      </div>

      {/* Critical Skills Section */}
      <div className="space-y-unit-md">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-error"></span>
          <h2 className="font-headline-md text-on-surface text-[20px]">Critical Gaps (High Market Impact)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-unit-lg">
          {criticalGaps.map(renderGapCard)}
        </div>
      </div>

      {/* Important Skills Section */}
      <div className="space-y-unit-md pt-unit-md">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-secondary"></span>
          <h2 className="font-headline-md text-on-surface text-[20px]">Important Gaps (Production Standard)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-unit-lg">
          {importantGaps.map(renderGapCard)}
        </div>
      </div>

      {/* Preferred Skills Section */}
      <div className="space-y-unit-md pt-unit-md">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-outline"></span>
          <h2 className="font-headline-md text-on-surface text-[20px]">Preferred / Differentiator Skills</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-unit-lg">
          {preferredGaps.map(renderGapCard)}
        </div>
      </div>
    </div>
  );
}
