import React from "react";
import { useApp } from "../../context/AppContext";

export default function Sidebar() {
  const { currentRoute, setCurrentRoute, savedIds, applications } = useApp();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "discover", label: "Discover", icon: "explore" },
    { id: "matches", label: "My Matches", icon: "handshake", badge: "8" },
    { id: "skill-profile", label: "Skill Profile", icon: "badge" },
    { id: "skill-gap", label: "Skill Gap Analysis", icon: "analytics", badge: "3", badgeColor: "bg-error-container text-on-error-container" },
    { id: "roadmap", label: "Roadmap", icon: "map" },
    { id: "projects", label: "Projects", icon: "code_blocks" },
    { id: "applications", label: "Applications", icon: "send", badge: String(applications.filter(a => a.stage !== "saved").length) },
    { id: "saved", label: "Saved", icon: "bookmark", badge: String(savedIds.size) },
    { id: "profile", label: "Student Profile", icon: "account_circle" },
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-surface-container-high z-50 flex-col pt-unit-xl pb-unit-lg select-none">
      {/* Brand Logo */}
      <div 
        onClick={() => setCurrentRoute("dashboard")}
        className="px-unit-lg mb-unit-xl text-headline-sm font-semibold text-primary flex items-center gap-unit-sm cursor-pointer"
      >
        <span className="material-symbols-outlined text-[28px]">verified</span>
        <span>SkillMatch</span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-unit-md space-y-unit-xs overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = currentRoute === item.id || (item.id === "discover" && currentRoute === "opportunity-details");
          return (
            <button
              key={item.id}
              onClick={() => setCurrentRoute(item.id)}
              className={`w-full flex items-center justify-between px-unit-md py-unit-sm transition-all text-body-md ${
                isActive
                  ? "bg-primary-container text-on-primary-container font-medium rounded-xl shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-xl"
              }`}
            >
              <div className="flex items-center">
                <span className="material-symbols-outlined mr-unit-md text-[20px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-label-sm font-semibold px-2 py-0.5 rounded-full ${
                  isActive 
                    ? "bg-on-primary-container/20 text-on-primary-container" 
                    : item.badgeColor || "bg-surface-container-highest text-on-surface-variant"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Agent Mini Status Card */}
      <div className="px-unit-md mt-auto pt-unit-md border-t border-surface-container-high">
        <div 
          onClick={() => setCurrentRoute("roadmap")}
          className="bg-surface-container-lowest p-unit-md rounded-xl shadow-sm border border-surface-container-high/60 hover:border-primary/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-label-sm text-primary font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">smart_toy</span> AI Agent
            </span>
            <span className="text-label-sm text-outline">Week 7/10</span>
          </div>
          <p className="text-body-sm text-on-surface font-medium line-clamp-1">AI/ML Internship Readiness</p>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: "70%" }}></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
