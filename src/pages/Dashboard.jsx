import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import OpportunityCard from "../components/opportunity/OpportunityCard";

export default function Dashboard() {
  const { 
    studentProfile, 
    opportunities, 
    setCurrentRoute, 
    setIsResumeModalOpen, 
    roadmapGoal, 
    roadmapWeeks,
    toggleChecklist 
  } = useApp();

  const [quickFilter, setQuickFilter] = useState("all");

  const currentWeekData = (roadmapWeeks && (roadmapWeeks.find((w) => w.status === "current" || w.current) || roadmapWeeks[6] || roadmapWeeks[0])) || {};

  // Opportunities for Dashboard grid
  const recommendedOpps = (opportunities || []).filter((opp) => {
    if (!opp) return false;
    const title = opp.title || "";
    const org = opp.organization || "";
    const skills = opp.requiredSkills || [];

    if (quickFilter === "all") return true;
    if (quickFilter === "aiml") return title.includes("AI") || title.includes("ML") || title.includes("Machine");
    if (quickFilter === "cloud") return skills.some(s => s.toLowerCase().includes("cloud")) || org.includes("Cloud") || title.includes("Cloud");
    if (quickFilter === "hackathons") return opp.category === "hackathons" || opp.type === "hackathons";
    return true;
  }).slice(0, 6);

  return (
    <div className="flex flex-col w-full space-y-unit-2xl py-unit-md select-none">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-unit-lg bg-surface-container-low p-6 md:p-8 rounded-2xl shadow-sm border border-surface-container-high/60">
        <div className="flex flex-col space-y-unit-sm">
          <div className="flex items-center gap-unit-sm text-primary font-label-md uppercase tracking-wider font-semibold">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>SkillMatch Intelligence Hub</span>
          </div>
          <h1 className="text-headline-xl text-on-surface">Good morning, {studentProfile.name.split(" ")[0]}</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">
            Here are the opportunities and skill actions that matter most right now.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-unit-md w-full md:w-auto">
          <button
            onClick={() => setIsResumeModalOpen(true)}
            className="w-full sm:w-auto bg-surface-container-lowest border border-surface-container-high text-on-surface px-unit-lg py-2.5 rounded-xl text-body-md font-medium hover:bg-surface-container-high transition-all shadow-sm flex items-center justify-center gap-unit-sm whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">upload_file</span>
            <span>Sync Resume</span>
          </button>
          <button
            onClick={() => setCurrentRoute("roadmap")}
            className="w-full sm:w-auto bg-primary text-on-primary px-unit-lg py-2.5 rounded-xl text-body-md font-medium hover:bg-primary-container transition-all shadow-sm flex items-center justify-center gap-unit-sm whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>Action Hub</span>
          </button>
        </div>
      </div>

      {/* Top Row: Profile Readiness, Skill Gaps, Roadmap Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-unit-lg">
        {/* Profile Readiness Widget */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high/60 flex flex-col justify-between hover:border-primary/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-unit-md">
              <h2 className="text-headline-sm text-[18px] text-on-surface flex items-center gap-unit-sm">
                <span className="material-symbols-outlined text-primary">badge</span>
                <span>Profile Readiness</span>
              </h2>
              <span className="text-headline-sm text-primary font-bold">
                {studentProfile.readiness_score || studentProfile.readinessScore || 86}%
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-unit-md">
              <div
                className="bg-primary h-full rounded-full transition-all duration-1000"
                style={{ width: `${studentProfile.readiness_score || studentProfile.readinessScore || 86}%` }}
              ></div>
            </div>
            <div className="mb-unit-md">
              <p className="text-body-sm text-on-surface-variant mb-1 font-medium">Career Goal</p>
              <p className="text-body-md font-semibold text-on-surface flex items-center gap-unit-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                <span>
                  {studentProfile.target_role ||
                    studentProfile.careerPreferences?.primaryGoal ||
                    (studentProfile.career_goals && studentProfile.career_goals[0]) ||
                    "AI/ML Internship"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-body-sm text-on-surface-variant mb-2 font-medium">Current Verified Skills</p>
              <div className="flex flex-wrap gap-unit-xs">
                <span className="bg-primary-container/10 text-primary px-2.5 py-1 rounded-lg text-label-md font-medium">
                  Python • Advanced
                </span>
                <span className="bg-primary-container/10 text-primary px-2.5 py-1 rounded-lg text-label-md font-medium">
                  Machine Learning • Intermediate
                </span>
                <span className="bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-lg text-label-md font-medium">
                  React • Intermediate
                </span>
                <span className="bg-surface-container-high text-on-surface-variant px-2.5 py-1 rounded-lg text-label-md font-medium">
                  Cloud • Beginner
                </span>
              </div>
            </div>
          </div>
          <div className="mt-unit-lg pt-4 border-t border-surface-container-high flex justify-between items-center text-body-sm text-on-surface-variant">
            <span>Last optimized 2 days ago</span>
            <button
              onClick={() => setCurrentRoute("profile")}
              className="text-primary font-medium hover:underline flex items-center gap-1"
            >
              <span>Update profile</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Skill Gaps Widget */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high/60 flex flex-col justify-between hover:border-error/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-unit-md">
              <h2 className="text-headline-sm text-[18px] text-on-surface flex items-center gap-unit-sm">
                <span className="material-symbols-outlined text-error">analytics</span>
                <span>Critical Skill Gaps</span>
              </h2>
              <span className="bg-error-container text-on-error-container text-label-sm font-semibold px-2.5 py-0.5 rounded-full">
                3 gaps identified
              </span>
            </div>
            <div className="space-y-unit-sm">
              <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container-high/40">
                <div className="flex justify-between text-body-md font-medium text-on-surface mb-1">
                  <span>TensorFlow</span>
                  <span className="text-error text-label-md font-bold">Critical</span>
                </div>
                <div className="flex justify-between text-body-sm text-on-surface-variant">
                  <span>Beginner → Advanced</span>
                  <span className="font-medium">~14 hrs</span>
                </div>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container-high/40">
                <div className="flex justify-between text-body-md font-medium text-on-surface mb-1">
                  <span>Docker</span>
                  <span className="text-on-secondary-container text-label-md font-bold">Important</span>
                </div>
                <div className="flex justify-between text-body-sm text-on-surface-variant">
                  <span>None → Intermediate</span>
                  <span className="font-medium">~8 hrs</span>
                </div>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container-high/40">
                <div className="flex justify-between text-body-md font-medium text-on-surface mb-1">
                  <span>Cloud deployment</span>
                  <span className="text-outline text-label-md font-bold">Preferred</span>
                </div>
                <div className="flex justify-between text-body-sm text-on-surface-variant">
                  <span>Beginner → Intermediate</span>
                  <span className="font-medium">~6 hrs</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-unit-lg pt-4 border-t border-surface-container-high flex justify-between items-center text-body-sm text-on-surface-variant">
            <span>Recommended curriculum ready</span>
            <button
              onClick={() => setCurrentRoute("skill-gap")}
              className="text-primary font-medium hover:underline flex items-center gap-1"
            >
              <span>Explore gaps</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Roadmap Progress Widget */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high/60 flex flex-col justify-between hover:border-primary/40 transition-colors md:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between mb-unit-md">
              <h2 className="text-headline-sm text-[18px] text-on-surface flex items-center gap-unit-sm">
                <span className="material-symbols-outlined text-primary">map</span>
                <span>Roadmap Progress</span>
              </h2>
              <span className="text-label-md text-primary font-bold">
                Week {roadmapGoal?.currentWeek || 7} of {roadmapGoal?.totalWeeks || 10}
              </span>
            </div>
            <div className="mb-unit-md">
              <h3 className="text-body-lg font-semibold text-on-surface">
                {currentWeekData.title || "GitHub Portfolio & Resume Optimization"}
              </h3>
              <p className="text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                {currentWeekData.focus || currentWeekData.description || "Refining repository READMEs and aligning project metrics with ATS algorithms for AI roles."}
              </p>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-unit-md">
              <div
                className="bg-primary h-full rounded-full transition-all duration-1000"
                style={{ width: `${roadmapGoal?.overallProgress || roadmapGoal?.percentComplete || 70}%` }}
              ></div>
            </div>
            <div className="space-y-unit-xs">
              {currentWeekData.checklist?.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(6, item.id)}
                  className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors text-body-sm text-on-surface cursor-pointer select-none"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      {item.done ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <span className={item.done ? "line-through text-on-surface-variant" : ""}>{item.title}</span>
                  </span>
                  <span className="material-symbols-outlined text-outline text-[16px]">chevron_right</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-unit-lg pt-4 border-t border-surface-container-high flex justify-between items-center text-body-sm text-on-surface-variant">
            <span>Next milestone in 3 days</span>
            <button
              onClick={() => setCurrentRoute("roadmap")}
              className="text-primary font-medium hover:underline flex items-center gap-1"
            >
              <span>View roadmap</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Opportunities Grid */}
      <div className="flex flex-col space-y-unit-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-unit-md">
          <div>
            <h2 className="text-headline-md text-on-surface">Recommended Opportunities</h2>
            <p className="text-body-md text-on-surface-variant">
              Matched using your verified skills, career goals, and experience level.
            </p>
          </div>
          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-unit-xs overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "all", label: "All (6)" },
              { id: "aiml", label: "AI/ML (3)" },
              { id: "cloud", label: "Cloud (2)" },
              { id: "hackathons", label: "Hackathons (1)" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setQuickFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-body-sm font-medium transition-all shrink-0 ${
                  quickFilter === tab.id
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Grid on Desktop, 2 on Tablet, 1 on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-unit-lg">
          {recommendedOpps.map((opp) => (
            <OpportunityCard key={opp.id} opp={opp} />
          ))}
        </div>

        {/* Bottom Discover CTA */}
        <div className="pt-unit-md flex justify-center">
          <button
            onClick={() => setCurrentRoute("discover")}
            className="bg-surface-container-lowest border border-surface-container-high hover:border-primary text-primary px-unit-xl py-3 rounded-xl text-body-md font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <span>Explore All 142 Opportunities</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
