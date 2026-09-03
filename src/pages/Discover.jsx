import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import OpportunityCard from "../components/opportunity/OpportunityCard";
import OpportunityFilters from "../components/opportunity/OpportunityFilters";
import { CATEGORIES, POPULAR_TAGS } from "../data/opportunities";

export default function Discover() {
  const {
    filteredOpportunities,
    selectedCategory,
    setSelectedCategory,
    setSearchQuery,
    sortBy,
    setSortBy,
  } = useApp();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <div className="flex flex-col w-full space-y-unit-xl py-unit-md select-none">
      {/* Discover Page Header / Search & Quick Tags */}
      <section className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-surface-container-high/60 flex flex-col gap-unit-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-unit-md">
          <div>
            <h1 className="font-headline-xl text-on-surface mb-unit-xs">Discover Opportunities</h1>
            <p className="font-body-md text-on-surface-variant">
              Curated career, learning, and funding matches tailored to your exact skill profile.
            </p>
          </div>

          <div className="flex items-center gap-unit-sm">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-unit-xs px-unit-md py-2 rounded-xl bg-surface-container-highest text-on-surface font-label-md hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Filters</span>
            </button>

            {/* Sort Select */}
            <div className="flex items-center bg-surface-container-highest px-unit-md py-2 rounded-xl text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] mr-unit-sm text-primary">sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none outline-none text-body-sm font-medium text-on-surface cursor-pointer"
              >
                <option value="fit-desc">Fit Score (High to Low)</option>
                <option value="deadline-asc">Deadline (Earliest)</option>
                <option value="stipend-desc">Stipend / Funding (Max)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Tags Bar */}
        <div className="flex items-center gap-unit-sm overflow-x-auto pb-unit-xs no-scrollbar">
          <span className="text-label-sm text-outline uppercase tracking-wider shrink-0 font-semibold">
            Popular:
          </span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="px-unit-md py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shrink-0 whitespace-nowrap"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* 7 Mandatory Category Navigation Tabs */}
        <div className="flex items-center gap-unit-sm overflow-x-auto pt-unit-xs no-scrollbar border-b border-surface-container-high">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-unit-lg py-unit-md font-label-md transition-all whitespace-nowrap border-b-2 text-[14px] ${
                  isActive
                    ? "text-primary border-primary font-bold"
                    : "text-on-surface-variant hover:text-on-surface border-transparent font-medium"
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Layout with Sidebar Filters & Grid */}
      <div className="flex flex-col md:flex-row gap-unit-xl items-start">
        {/* Desktop Filters Sidebar */}
        <div className="hidden md:block">
          <OpportunityFilters />
        </div>

        {/* Mobile Filter Modal */}
        {isMobileFilterOpen && (
          <OpportunityFilters
            isMobileModal={true}
            onClose={() => setIsMobileFilterOpen(false)}
          />
        )}

        {/* Responsive Opportunity Grid */}
        <div className="flex-1 w-full flex flex-col gap-unit-lg">
          <div className="flex items-center justify-between">
            <p className="font-body-md text-on-surface-variant">
              Showing <span className="font-bold text-on-surface">{filteredOpportunities.length}</span> matched opportunities
            </p>
            <div className="text-body-sm text-outline hidden sm:block">
              Ranked by candidate skill vector cosine similarity
            </div>
          </div>

          {filteredOpportunities.length === 0 ? (
            <div className="bg-surface-container-lowest p-unit-2xl rounded-2xl border border-surface-container-high text-center space-y-unit-md">
              <span className="material-symbols-outlined text-[48px] text-outline">search_off</span>
              <h3 className="text-headline-sm text-on-surface">No matching opportunities found</h3>
              <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
                Try widening your minimum fit score, selecting all workplace types, or clearing your search keywords.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-unit-lg">
              {filteredOpportunities.map((opp) => (
                <OpportunityCard key={opp.id} opp={opp} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
