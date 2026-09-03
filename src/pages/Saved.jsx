import React from "react";
import { useApp } from "../context/AppContext";
import OpportunityCard from "../components/opportunity/OpportunityCard";

export default function Saved() {
  const { savedIds, opportunities, setCurrentRoute } = useApp();

  const savedOpps = opportunities.filter((opp) => savedIds.has(opp.id));

  return (
    <div className="flex flex-col w-full space-y-unit-xl py-unit-md select-none">
      {/* Header */}
      <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-surface-container-high/60 flex flex-col md:flex-row md:items-center justify-between gap-unit-lg shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-primary font-label-md uppercase tracking-wider font-semibold mb-1">
            <span className="material-symbols-outlined text-[18px]">bookmark</span>
            <span>Saved Queue</span>
          </div>
          <h1 className="font-headline-xl text-on-surface">Saved Opportunities ({savedOpps.length})</h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl">
            Bookmarked internships, hackathons, and scholarships to review before deadlines expire.
          </p>
        </div>

        <button
          onClick={() => setCurrentRoute("discover")}
          className="px-unit-lg py-2.5 bg-primary text-on-primary font-medium rounded-xl hover:bg-primary-container transition-all shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">explore</span>
          <span>Explore More Roles</span>
        </button>
      </div>

      {savedOpps.length === 0 ? (
        <div className="bg-surface-container-lowest p-unit-2xl rounded-2xl border border-surface-container-high text-center space-y-unit-md">
          <span className="material-symbols-outlined text-[48px] text-outline">bookmark_border</span>
          <h3 className="text-headline-sm text-on-surface">No saved opportunities yet</h3>
          <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
            Click the bookmark icon on any opportunity card in Discover or My Matches to save it here for quick access.
          </p>
          <button
            onClick={() => setCurrentRoute("discover")}
            className="px-unit-xl py-2.5 bg-primary text-on-primary rounded-xl font-medium shadow-sm"
          >
            Browse Opportunities
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-unit-lg">
          {savedOpps.map((opp) => (
            <OpportunityCard key={opp.id} opp={opp} />
          ))}
        </div>
      )}
    </div>
  );
}
