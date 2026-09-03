import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function SkillProfile() {
  const { skillsData, setCurrentRoute, setIsResumeModalOpen } = useApp();
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = ["all", "Languages", "AI & Data", "Frameworks", "Web Frontend", "Backend", "Infrastructure"];

  const filteredSkills = skillsData.filter((skill) =>
    activeCategory === "all" ? true : skill.category === activeCategory
  );

  return (
    <div className="flex flex-col w-full space-y-unit-xl py-unit-md select-none">
      {/* Header */}
      <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-surface-container-high/60 flex flex-col md:flex-row md:items-center justify-between gap-unit-lg shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-primary font-label-md uppercase tracking-wider font-semibold mb-1">
            <span className="material-symbols-outlined text-[18px]">badge</span>
            <span>Algorithmic Competency Graph</span>
          </div>
          <h1 className="font-headline-xl text-on-surface">Skill Profile & Verification</h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl">
            Each skill competency level is verified against code repository evidence, technical assessments, and coursework artifacts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsResumeModalOpen(true)}
            className="px-unit-lg py-2.5 bg-surface-container-lowest border border-surface-container-high hover:border-primary text-on-surface font-medium rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">add</span>
            <span>Extract from Resume</span>
          </button>
          <button
            onClick={() => setCurrentRoute("skill-gap")}
            className="px-unit-lg py-2.5 bg-primary text-on-primary font-medium rounded-xl hover:bg-primary-container transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            <span>Gap Analysis</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-unit-md py-1.5 rounded-xl text-body-sm font-medium transition-colors whitespace-nowrap ${
              activeCategory === cat
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {cat === "all" ? "All Skills" : cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-unit-lg">
        {filteredSkills.map((skill) => (
          <div
            key={skill.id}
            className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-unit-md"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between mb-unit-sm">
                <div>
                  <h3 className="font-headline-sm text-on-surface text-[20px]">{skill.name}</h3>
                  <span className="text-label-sm text-on-surface-variant font-medium">{skill.category}</span>
                </div>
                <span className="bg-primary-container/10 text-primary px-3 py-1 rounded-full font-label-md font-bold">
                  {skill.proficiency}
                </span>
              </div>

              {/* Confidence Meter */}
              <div className="space-y-1 my-unit-md bg-surface-container-low p-3 rounded-xl border border-surface-container-high/40">
                <div className="flex justify-between items-center text-body-sm">
                  <span className="text-on-surface-variant font-medium">Algorithmic Confidence</span>
                  <span className="font-bold text-primary">{skill.confidence}%</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-1000"
                    style={{ width: `${skill.confidence}%` }}
                  ></div>
                </div>
              </div>

              {/* Evidence Section */}
              <div className="space-y-unit-xs text-body-sm">
                <span className="text-label-sm text-outline font-semibold uppercase tracking-wider block">
                  Verified Evidence
                </span>
                <div className="flex items-center gap-2 text-on-surface font-medium">
                  <span className="material-symbols-outlined text-[16px] text-primary">terminal</span>
                  <span>{skill.evidence.projectsCount} portfolio projects</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface font-medium">
                  <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                  <span>{skill.evidence.certificationsCount} external certification</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant text-label-md">
                  <span className="material-symbols-outlined text-[16px] text-outline">history</span>
                  <span>{skill.evidence.activity}</span>
                </div>
              </div>
            </div>

            {/* Freshness & Endorsements */}
            <div className="pt-unit-md border-t border-surface-container-high flex items-center justify-between text-label-sm">
              <span className="text-primary flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">update</span>
                <span>{skill.freshness}</span>
              </span>
              <span className="text-on-surface-variant">
                {skill.endorsements} peer validations
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
