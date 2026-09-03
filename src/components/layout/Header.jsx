import React from "react";
import { useApp } from "../../context/AppContext";

export default function Header() {
  const { searchQuery, setSearchQuery, setCurrentRoute, currentRoute, addToast, currentUser, setIsAuthModalOpen } = useApp();

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-surface/90 backdrop-blur-xl border-b border-surface-container-high shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-unit-md md:px-unit-xl">
      {/* Mobile Branding / Desktop Search */}
      <div className="flex items-center gap-unit-md flex-1 max-w-lg">
        <div 
          onClick={() => setCurrentRoute("dashboard")}
          className="md:hidden flex items-center gap-unit-sm text-primary font-headline-sm font-semibold cursor-pointer select-none"
        >
          <span className="material-symbols-outlined text-[24px]">verified</span>
          <span>SkillMatch</span>
        </div>

        <div className="hidden md:flex items-center gap-unit-sm bg-surface-container px-unit-md py-unit-xs rounded-xl w-full text-on-surface-variant focus-within:ring-2 focus-within:ring-primary focus-within:bg-surface-container-lowest transition-all">
          <span className="material-symbols-outlined text-[18px]">search</span>
          <input
            className="bg-transparent border-none outline-none w-full text-body-md text-on-surface placeholder:text-outline"
            placeholder="Search internships, hackathons, skills..."
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentRoute !== "discover" && currentRoute !== "matches") {
                setCurrentRoute("discover");
              }
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="text-outline hover:text-on-surface text-[16px]"
              title="Clear search"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-unit-md md:gap-unit-lg">
        {/* Quick Route Link on Mobile */}
        <button
          onClick={() => {
            setCurrentRoute("discover");
          }}
          className="md:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
          title="Search"
        >
          <span className="material-symbols-outlined text-[22px]">search</span>
        </button>

        {/* Auth / Account Badge */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-container-high bg-surface-container-lowest hover:bg-surface-container-low text-body-sm font-medium text-on-surface transition-all shadow-xs"
          title="Account / Authentication"
        >
          <span className="material-symbols-outlined text-[18px] text-primary">account_circle</span>
          <span className="hidden sm:inline">{currentUser ? currentUser.full_name?.split(" ")[0] || "Account" : "Sign In"}</span>
        </button>

        {/* Notifications */}
        <button 
          onClick={() => addToast("You have 3 high-confidence AI internship matches expiring soon.", "info")}
          className="relative p-unit-xs rounded-full hover:bg-surface-container-high hover:text-on-surface transition-colors text-on-surface-variant"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error ring-2 ring-surface"></span>
        </button>

        {/* Profile Avatar */}
        <button
          onClick={() => setCurrentRoute("profile")}
          className="flex items-center gap-unit-sm p-1 rounded-full hover:ring-2 hover:ring-primary/40 transition-all"
          title="View Student Profile"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-semibold text-label-md shadow-sm">
            {currentUser && currentUser.full_name ? currentUser.full_name.split(" ").map(n => n[0]).join("").slice(0, 2) : "DR"}
          </div>
        </button>
      </div>
    </header>
  );
}
