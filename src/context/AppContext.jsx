import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client";
import { OPPORTUNITIES } from "../data/opportunities";
import { STUDENT_PROFILE, SAMPLE_EXTRACTED_RESUME } from "../data/students";
import { VERIFIED_SKILLS, SKILL_GAPS, RECOMMENDED_PROJECTS } from "../data/skills";
import { INITIAL_APPLICATIONS } from "../data/applications";
import { ROADMAP_GOAL, ROADMAP_WEEKS } from "../data/roadmapData";
import {
  buildStudentContext,
  normalizeOpportunityCard,
  normalizeMatch,
  normalizeStudentSkill,
  normalizeSkillGap,
  normalizeRecommendedProject,
  normalizeRoadmap,
  normalizeApplication,
  resolveWeekNumber,
} from "../api/normalize";

const AppContext = createContext();

const AUTH_STORAGE_KEY = "skillmatch_user";
const SERVER_UNAVAILABLE = /(failed to fetch|load failed|networkerror|http error 5\d\d)/i;

const loadStoredUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && parsed.email ? parsed : null;
  } catch (_) {
    return null;
  }
};

// Local workspace user used when the auth backend is unreachable,
// so the app remains fully usable on any device / offline preview.
const buildLocalUser = (email, fullName) => {
  const derived = String(email || "Student")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id: `local-${Date.now()}`,
    email: email || "student@university.edu",
    full_name: fullName || derived || "Student",
    role: "student",
    auth_provider: "local-demo",
  };
};

export function AppProvider({ children }) {
  // Navigation
  const [currentRoute, setCurrentRoute] = useState("dashboard");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState("opp-1");

  // Authentication (restores persisted session so sign-in survives refresh)
  const [currentUser, setCurrentUser] = useState(loadStoredUser);

  const persistUser = (user) => {
    try {
      if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (_) {}
  };
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Opportunities & Filters
  const [opportunities, setOpportunities] = useState(OPPORTUNITIES);
  const [matchesList, setMatchesList] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set(["opp-3", "opp-5"]));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minFitScore, setMinFitScore] = useState(70);
  const [workplaceFilters, setWorkplaceFilters] = useState({
    Remote: true,
    "On-site": true,
    Hybrid: true,
  });
  const [eligibilityFilters, setEligibilityFilters] = useState({
    "1st Year Students": true,
    "2nd Year Students": true,
    "Final Year & Graduates": true,
  });
  const [minStipend, setMinStipend] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("fit-desc");

  // Mobile filters drawer open state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Applications
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);

  // Roadmap & Checklists
  const [roadmapGoal, setRoadmapGoal] = useState(ROADMAP_GOAL);
  const [roadmapWeeks, setRoadmapWeeks] = useState(ROADMAP_WEEKS);

  // Student Profile, Skills & Gaps
  const [studentProfile, setStudentProfile] = useState(STUDENT_PROFILE);
  const [skillsData, setSkillsData] = useState(VERIFIED_SKILLS);
  const [skillGapsData, setSkillGapsData] = useState(SKILL_GAPS);
  const [recommendedProjects, setRecommendedProjects] = useState(RECOMMENDED_PROJECTS);
  const [recommendedCourses, setRecommendedCourses] = useState([]);

  // Resume Upload & Extraction
  const [extractedResume, setExtractedResume] = useState(SAMPLE_EXTRACTED_RESUME);
  const [currentResumeId, setCurrentResumeId] = useState(null);

  // Modals & Popups
  const [fitScoreModalData, setFitScoreModalData] = useState(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [applyModalOpp, setApplyModalOpp] = useState(null);

  // Notification Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // INITIAL BACKEND HYDRATION — every payload passes through the normalizer
  // adapter so live backend data can never crash or blank out a page.
  const refreshBackendData = async () => {
    try {
      // 0. Authenticated student identity (for newly registered accounts)
      try {
        const me = await api.getMe();
        if (me && me.email) {
          setCurrentUser((u) => ({ ...(u || {}), ...me }));
          persistUser({ ...(currentUser || {}), ...me });
        }
      } catch (_) {}

      // 1. Student skills first — used as matching context for everything else
      let ctx = buildStudentContext(skillsData, studentProfile);
      const skills = await api.getMySkills().catch(() => null);
      if (Array.isArray(skills) && skills.length > 0) {
        const normalizedSkills = skills.map(normalizeStudentSkill);
        setSkillsData(normalizedSkills);
        ctx = buildStudentContext(normalizedSkills, studentProfile);
      }

      // 2. Profile
      const prof = await api.getProfile().catch(() => null);
      if (prof) {
        prof.name = prof.name || prof.full_name || "Student";
        prof.full_name = prof.full_name || prof.name || "Student";
        setStudentProfile(prof);
        ctx = buildStudentContext(skillsData, prof);
      }

      // 3. Matches (server-computed fit scores — richest source)
      const matches = await api.getMatches({ min_fit: 40 }).catch(() => null);
      if (Array.isArray(matches) && matches.length > 0) {
        setMatchesList(matches.map((m) => normalizeMatch(m, ctx)));
      }

      // 4. Opportunities (cards get client-side derived fit when missing)
      const opps = await api.getOpportunities().catch(() => null);
      if (Array.isArray(opps) && opps.length > 0) {
        setOpportunities(opps.map((o) => normalizeOpportunityCard(o, ctx)));
      }

      // 5. Skill Gaps + recommendations
      const gapsRes = await api.getSkillGaps().catch(() => null);
      if (gapsRes) {
        if (Array.isArray(gapsRes.gaps)) {
          setSkillGapsData(
            gapsRes.gaps.map((g) => normalizeSkillGap(g, gapsRes.targetRole))
          );
        }
        if (Array.isArray(gapsRes.courses)) setRecommendedCourses(gapsRes.courses);
        if (Array.isArray(gapsRes.projects)) {
          setRecommendedProjects(gapsRes.projects.map(normalizeRecommendedProject));
        }
      }

      // 6. Roadmap
      const road = await api.getRoadmap().catch(() => null);
      if (road) {
        const { goal, weeks } = normalizeRoadmap(road);
        setRoadmapGoal((prev) => ({ ...prev, ...goal }));
        if (weeks.length > 0) setRoadmapWeeks(weeks);
      }

      // 7. Applications
      const apps = await api.getApplications().catch(() => null);
      if (Array.isArray(apps)) {
        setApplications(apps.map(normalizeApplication));
      }

      // 8. Saved
      const saved = await api.getSaved().catch(() => null);
      if (saved && Array.isArray(saved.saved_ids)) {
        setSavedIds(new Set(saved.saved_ids));
      }
    } catch (e) {
      console.log("Backend offline or booting, using rich fallback data:", e.message);
    }
  };

  useEffect(() => {
    refreshBackendData();
  }, []);

  // AUTH ACTIONS — real backend first, graceful local-demo fallback when offline
  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      setCurrentUser(res.user);
      persistUser(res.user);
      await refreshBackendData();
      return res;
    } catch (err) {
      if (!SERVER_UNAVAILABLE.test(err.message || "")) throw err;
      const user = buildLocalUser(email);
      setCurrentUser(user);
      persistUser(user);
      addToast("Auth server unreachable — signed in to local demo workspace", "info");
      await refreshBackendData();
      return { user };
    }
  };

  const register = async (data) => {
    try {
      const res = await api.register(data);
      setCurrentUser(res.user);
      persistUser(res.user);
      await refreshBackendData();
      return res;
    } catch (err) {
      if (!SERVER_UNAVAILABLE.test(err.message || "")) throw err;
      const user = buildLocalUser(data.email, data.full_name);
      setCurrentUser(user);
      persistUser(user);
      addToast("Auth server unreachable — account created in local demo workspace", "info");
      await refreshBackendData();
      return { user };
    }
  };

  const googleAuth = async (data) => {
    try {
      const res = await api.googleAuth(data);
      setCurrentUser(res.user);
      persistUser(res.user);
      await refreshBackendData();
      return res;
    } catch (err) {
      if (!SERVER_UNAVAILABLE.test(err.message || "")) throw err;
      const user = buildLocalUser(data.email, data.name);
      setCurrentUser(user);
      persistUser(user);
      addToast("Auth server unreachable — signed in to local demo workspace", "info");
      await refreshBackendData();
      return { user };
    }
  };

  const logout = () => {
    api.setToken(null);
    setCurrentUser(null);
    persistUser(null);
    setCurrentRoute("dashboard");
    addToast("Signed out", "info");
  };

  // Toggle Save Opportunity
  const toggleSave = async (oppId) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      const isSaved = next.has(oppId);
      if (isSaved) {
        next.delete(oppId);
        addToast("Removed from saved opportunities", "info");
      } else {
        next.add(oppId);
        const opp = opportunities.find((o) => o.id === oppId);
        addToast(`Saved "${opp ? opp.title : "Opportunity"}" to your list`, "success");
      }
      return next;
    });

    // Sync with backend
    try {
      await api.toggleSaved(oppId);
    } catch (_) {}
  };

  // Quick Apply to Opportunity
  const applyToOpportunity = async (opp) => {
    const existing = applications.find(
      (a) => (a.opportunityId === opp.id || a.opportunity_id === opp.id) && a.stage !== "saved"
    );
    if (existing) {
      addToast(`You already applied to ${opp.title}`, "info");
      return;
    }

    const newApp = {
      id: `app-${Date.now()}`,
      opportunityId: opp.id,
      title: opp.title,
      organization: opp.organization,
      logoText: opp.logoText || "SM",
      logoBg: opp.logoBg || "bg-primary text-on-primary",
      category: opp.categoryLabel || opp.category,
      stage: "applied",
      status: "applied",
      appliedDate: "Today",
      lastUpdated: "Just now",
      nextAction: "Application submitted and sent to hiring team",
      fitScore: opp.fitScore,
      trustScore: opp.trustScore,
      notes: "Submitted via SkillMatch instant application.",
    };

    setApplications((prev) => [newApp, ...prev.filter((a) => a.opportunityId !== opp.id)]);
    addToast(`Successfully applied to ${opp.title} at ${opp.organization}!`, "success");

    // Backend sync
    try {
      await api.applyToOpportunity(opp.id, "Instant platform application");
    } catch (err) {
      console.warn("Applied locally:", err.message);
    }
  };

  // Move application between stages
  const moveApplicationStage = async (appId, newStage) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              stage: newStage,
              status: newStage,
              lastUpdated: "Just now",
              nextAction: `Status moved to ${newStage.replace("_", " ").toUpperCase()}`,
            }
          : app
      )
    );
    addToast(`Application moved to ${newStage.replace("_", " ")}`, "success");

    try {
      await api.updateApplicationStatus(appId, newStage);
    } catch (err) {
      console.warn("Status updated locally:", err.message);
    }
  };

  // Toggle checklist item in roadmap (Dynamically updates progress and Profile Readiness!)
  const toggleChecklist = async (weekIdx, checkId) => {
    const weekObj = Array.isArray(roadmapWeeks) ? roadmapWeeks[weekIdx] : null;
    const weekNum = resolveWeekNumber(weekObj, weekIdx);

    // Optimistic update
    setRoadmapWeeks((prev) => {
      if (!Array.isArray(prev) || !prev[weekIdx]) return prev;
      const copy = [...prev];
      const week = { ...copy[weekIdx] };
      if (week.checklist) {
        week.checklist = week.checklist.map((item) =>
          item.id === checkId ? { ...item, done: !item.done } : item
        );
        copy[weekIdx] = week;
      }
      return copy;
    });

    // Backend dynamic sync
    try {
      const res = await api.toggleRoadmapChecklist(weekNum, checkId);
      if (res && res.new_readiness_score) {
        setStudentProfile((p) => ({ ...p, readiness_score: res.new_readiness_score }));
        addToast(
          `Milestone updated! Profile Readiness dynamically recalculated: ${res.new_readiness_score}%`,
          "success"
        );
      }
    } catch (e) {
      addToast("Roadmap milestone saved", "success");
    }
  };

  // Reset Filters
  const resetFilters = () => {
    setMinFitScore(50);
    setWorkplaceFilters({ Remote: true, "On-site": true, Hybrid: true });
    setEligibilityFilters({
      "1st Year Students": true,
      "2nd Year Students": true,
      "Final Year & Graduates": true,
    });
    setMinStipend("all");
    setVerifiedOnly(false);
    setSelectedCategory("all");
    setSearchQuery("");
    addToast("Filters reset to default", "info");
  };

  // Navigate to opportunity details
  const viewOpportunityDetails = (oppId) => {
    setSelectedOpportunityId(oppId);
    setCurrentRoute("opportunity-details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filtered Opportunities computation
  const filteredOpportunities = opportunities
    .filter((opp) => {
      if (selectedCategory !== "all" && opp.category !== selectedCategory && opp.type !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = opp.title.toLowerCase().includes(q);
        const matchOrg = opp.organization.toLowerCase().includes(q);
        const matchSkills = (opp.requiredSkills || []).some((s) => s.toLowerCase().includes(q));
        const matchDesc = (opp.description || "").toLowerCase().includes(q);
        if (!matchTitle && !matchOrg && !matchSkills && !matchDesc) return false;
      }
      if (opp.fitScore < minFitScore) return false;
      if (!workplaceFilters[opp.workplaceType]) return false;
      if (opp.academicEligibility && opp.academicEligibility.length > 0) {
        const matchesEligibility = opp.academicEligibility.some(
          (level) => eligibilityFilters[level] || level === "All Academic Years"
        );
        if (!matchesEligibility && Object.values(eligibilityFilters).some((v) => !v)) return false;
      }
      if (verifiedOnly && !opp.verified) return false;
      if (minStipend === "500" && opp.stipendAmount < 500) return false;
      if (minStipend === "1500" && opp.stipendAmount < 1500) return false;
      if (minStipend === "3000" && opp.stipendAmount < 3000) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "fit-desc") return (b.fitScore || 0) - (a.fitScore || 0);
      if (sortBy === "deadline-asc") return (a.deadlineDays || 0) - (b.deadlineDays || 0);
      if (sortBy === "stipend-desc") return (b.stipendAmount || 0) - (a.stipendAmount || 0);
      return 0;
    });

  const selectedOpportunity =
    opportunities.find((o) => o.id === selectedOpportunityId) || opportunities[0];

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        setCurrentRoute,
        selectedOpportunityId,
        setSelectedOpportunityId,
        selectedOpportunity,
        viewOpportunityDetails,
        opportunities,
        filteredOpportunities,
        matchesList: matchesList.length > 0 ? matchesList : filteredOpportunities,
        savedIds,
        toggleSave,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        minFitScore,
        setMinFitScore,
        workplaceFilters,
        setWorkplaceFilters,
        eligibilityFilters,
        setEligibilityFilters,
        minStipend,
        setMinStipend,
        verifiedOnly,
        setVerifiedOnly,
        sortBy,
        setSortBy,
        resetFilters,
        isMobileFilterOpen,
        setIsMobileFilterOpen,
        applications,
        applyToOpportunity,
        moveApplicationStage,
        roadmapWeeks,
        toggleChecklist,
        studentProfile,
        setStudentProfile,
        extractedResume,
        setExtractedResume,
        currentResumeId,
        setCurrentResumeId,
        fitScoreModalData,
        setFitScoreModalData,
        isResumeModalOpen,
        setIsResumeModalOpen,
        applyModalOpp,
        setApplyModalOpp,
        toasts,
        addToast,
        removeToast,
        skillsData,
        setSkillsData,
        skillGapsData,
        recommendedProjects,
        recommendedCourses,
        roadmapGoal,
        currentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        register,
        googleAuth,
        logout,
        refreshBackendData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
