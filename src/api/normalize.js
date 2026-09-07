/**
 * Backend → Frontend adapter layer.
 *
 * The FastAPI backend and the rich demo data use different field conventions
 * (snake_case vs camelCase, different score/roadmap/gap structures). These
 * pure normalizers convert every backend payload into the exact shape the UI
 * expects, so pages never crash or render blanks when live data loads.
 */

const clampScore = (n, fallback) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(0, Math.min(100, Math.round(v)));
};

const PRIORITY_COLORS = {
  Critical: "text-error bg-error-container text-on-error-container",
  Important: "text-on-secondary-container bg-secondary-container",
  Preferred: "text-outline bg-surface-container-high",
};

const STAGE_SYNONYMS = {
  interview: "interviewing",
  selected: "offered",
  assessment: "under_review",
  planning: "applied",
};

const firstNumber = (str) => {
  const m = String(str || "").match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
};

/** Extract the lowercase student skill-name set for overlap calculations. */
export function buildStudentContext(skillsData, studentProfile) {
  const skillNames = new Set(
    (Array.isArray(skillsData) ? skillsData : [])
      .map((s) => String(s?.name || s?.skill_name || "").toLowerCase())
      .filter(Boolean)
  );
  return {
    skillNames,
    readiness: clampScore(
      studentProfile?.readiness_score ?? studentProfile?.readinessScore ?? 80,
      80
    ),
    workplacePref: String(
      studentProfile?.workplace_preference ||
        studentProfile?.careerPreferences?.remotePreference ||
        ""
    ).toLowerCase(),
  };
}

const skillOverlap = (required, ctx) => {
  const req = required || [];
  const matched = req.filter((s) => ctx.skillNames.has(String(s).toLowerCase()));
  const missing = req.filter((s) => !ctx.skillNames.has(String(s).toLowerCase()));
  return { matched, missing };
};

/** Deterministic client-side fit estimate for opportunity cards (no /matches call). */
function computeFit(opp, ctx, matchedCount, requiredCount) {
  const skillScore = requiredCount > 0 ? Math.round((matchedCount / requiredCount) * 100) : 70;
  const prefScore = ctx.workplacePref && String(opp.workplaceType || "").toLowerCase() === ctx.workplacePref ? 95 : 72;
  const raw = skillScore * 0.55 + 85 * 0.2 + 85 * 0.1 + prefScore * 0.15;
  return clampScore(raw, 70);
}

/** /opportunities card → full UI shape (adds derived fit data the API doesn't return). */
export function normalizeOpportunityCard(raw, ctx = buildStudentContext([], {})) {
  if (!raw || typeof raw !== "object") return raw;
  const requiredSkills = raw.requiredSkills || raw.required_skills || [];
  const { matched, missing } = skillOverlap(requiredSkills, ctx);
  const hasFit = Number.isFinite(Number(raw.fitScore));

  const fitScore = hasFit
    ? clampScore(raw.fitScore, 70)
    : computeFit(raw, ctx, matched.length, requiredSkills.length);

  const fitBreakdown =
    raw.fitBreakdown ||
    (Number.isFinite(Number(raw.matchBreakdown?.skills))
      ? {
          skills: clampScore(raw.matchBreakdown.skills, 85),
          eligibility: clampScore(raw.matchBreakdown.education, 90),
          projects: clampScore(raw.matchBreakdown.projects, 85),
          experience: clampScore(raw.matchBreakdown.semantic_relevance, 80),
          careerGoal: clampScore(raw.matchBreakdown.career_goal, 88),
        }
      : {
          skills: clampScore(fitScore + 4, 88),
          eligibility: 92,
          projects: clampScore(fitScore - 5, 82),
          experience: clampScore(fitScore - 12, 75),
          careerGoal: clampScore(fitScore + 2, 86),
        });

  return {
    ...raw,
    fitScore,
    fitBreakdown,
    readinessScore: clampScore(raw.readinessScore ?? ctx.readiness, 80),
    requiredSkills,
    preferredSkills: raw.preferredSkills || raw.preferred_skills || [],
    academicEligibility: raw.academicEligibility || raw.allowed_years || [],
    matchedSkills: raw.matchedSkills || matched,
    missingSkills: raw.missingSkills || missing.slice(0, 3),
    compensation: raw.compensation || raw.stipend || null,
    detailedDescription: raw.detailedDescription || raw.overview || raw.description || "",
    logoText: raw.logoText || raw.logo_text || "SM",
    logoBg: raw.logoBg || raw.logo_bg || "bg-primary text-on-primary",
    categoryLabel: raw.categoryLabel || raw.category_label || "Opportunity",
    trustScore: clampScore(raw.trustScore ?? raw.trust_score ?? 90, 90),
    deadlineDays: Number.isFinite(Number(raw.deadlineDays ?? raw.deadline_days))
      ? Number(raw.deadlineDays ?? raw.deadline_days)
      : 14,
    stipendAmount: Number(raw.stipendAmount ?? raw.stipend_amount ?? 0) || 0,
    verified: Boolean(raw.verified),
  };
}

/** /matches item → UI shape (maps snake_case breakdown keys to camelCase). */
export function normalizeMatch(raw, ctx = buildStudentContext([], {})) {
  const base = normalizeOpportunityCard(raw, ctx);
  const b = raw.matchBreakdown || raw.breakdown || {};
  const missing = raw.whatYouAreMissing || {};

  return {
    ...base,
    fitBreakdown: {
      skills: clampScore(b.skills, base.fitScore),
      eligibility: clampScore(b.education, 90),
      projects: clampScore(b.projects, 82),
      experience: clampScore(b.semantic_relevance, 75),
      careerGoal: clampScore(b.career_goal, 86),
    },
    matchedSkills: (raw.requiredSkills || []).filter((s) =>
      ctx.skillNames.has(String(s).toLowerCase())
    ),
    missingSkills: [
      ...(missing.critical || []),
      ...(missing.important || []),
      ...(missing.optional || []),
    ].slice(0, 4),
    isEligible: raw.isEligible !== false,
    whyYouMatch: raw.whyYouMatch || [],
    explorationTag: raw.explorationTag || "Strong Match",
  };
}

/** /skills/my item → Skill Profile page shape. */
export function normalizeStudentSkill(s) {
  if (!s || typeof s !== "object") return s;
  if (s.name && s.evidence) return s; // already UI shape
  return {
    id: s.id || `sk-${Math.random().toString(36).slice(2, 8)}`,
    name: s.name || s.skill_name || "Skill",
    category: s.category || "General",
    proficiency: s.proficiency || "Beginner",
    confidence: clampScore(s.confidence, 60),
    freshness: s.freshness || "Recently active",
    endorsements: Number(s.endorsements ?? 0),
    evidence: s.evidence || {
      projectsCount: 0,
      certificationsCount: 0,
      activity:
        (s.evidence_details && (s.evidence_details.notes || s.evidence_details.detail)) ||
        s.last_demonstrated ||
        "Profile skill",
    },
  };
}

/** /skill-gaps gap → Skill Gap Analysis page shape. */
export function normalizeSkillGap(g, targetRole) {
  if (!g || typeof g !== "object") return g;
  if (g.skillName && g.recommendedAction) return g; // already UI shape
  return {
    id: g.id || `gap-${Math.random().toString(36).slice(2, 8)}`,
    skillName: g.skillName || g.skill_name || g.skill || "Skill",
    priority: g.priority || "Important",
    priorityColor: PRIORITY_COLORS[g.priority] || PRIORITY_COLORS.Important,
    currentLevel: g.currentLevel || g.current_level || "None",
    requiredLevel: g.requiredLevel || g.required_level || "Intermediate",
    estimatedEffort: g.estimatedEffort || g.estimated_effort || "~8 hrs",
    targetRole: g.targetRole || targetRole || "Your Target Roles",
    recommendedAction: g.recommendedAction || g.reason || "Close this gap via the AI roadmap.",
    curriculumModule: g.curriculumModule || "AI Career Roadmap",
  };
}

const buildProjectSteps = (skills) => {
  const s = skills && skills.length ? skills : ["the core skill"];
  return [
    "Set up the project scaffold, repository and README",
    `Implement the core module for ${s.slice(0, 2).join(" & ")}`,
    `Add tests, documentation and evaluation metrics for ${s[0]}`,
    "Deploy a live demo and publish the repo for portfolio verification",
  ];
};

/** Recommended project (either data source) → Project Recommendations page shape. */
export function normalizeRecommendedProject(p) {
  if (!p || typeof p !== "object") return p;
  if (p.steps && p.skillsTargeted) return p; // already UI shape
  const skills = p.skillsTargeted || p.skillsCovered || p.skills_covered || [];
  const hours = Number(p.estimatedHours ?? p.estimated_hours ?? 12) || 12;
  return {
    id: p.id || `rp-${Math.random().toString(36).slice(2, 8)}`,
    title: p.title,
    description: p.description,
    difficulty: p.difficulty || "Intermediate",
    estimatedDuration: p.estimatedDuration || (hours <= 12 ? "7-10 days" : "12-16 days"),
    skillsTargeted: skills,
    impact: p.impact || "Portfolio proof-of-work",
    steps: buildProjectSteps(skills),
  };
}

/** /roadmap → { goal, weeks } in the shape Roadmap.jsx + Dashboard.jsx expect. */
export function normalizeRoadmap(road) {
  const goal = {
    title: road.title || "Career Readiness Roadmap",
    badge: road.badge || "AI Career Agent Active",
    description: road.description || "Personalized plan to close your skill gaps.",
    currentWeek: road.currentWeek ?? road.current_week ?? 1,
    totalWeeks: road.totalWeeks ?? road.total_weeks ?? 10,
    percentComplete:
      road.percentComplete ?? road.overallProgress ?? road.overall_progress ?? 0,
    overallProgress: road.overallProgress ?? road.overall_progress ?? road.percentComplete ?? 0,
  };

  const rawWeeks = Array.isArray(road.weeks) ? road.weeks : [];
  const weeks = rawWeeks.map((w, idx) => {
    const weekNum = Number.isFinite(Number(w.week)) ? Number(w.week) : idx + 1;
    const status =
      w.status || (w.completed ? "completed" : w.current ? "current" : "upcoming");
    return {
      ...w,
      week: weekNum,
      weekLabel: w.weekLabel || `Week ${weekNum}${status === "current" ? " (Current)" : ""}`,
      title: w.title || `Milestone ${weekNum}`,
      description: w.description || w.focus || "",
      skills: w.skills || [],
      status,
      completedDate: w.completedDate || w.date || "",
      estimatedHours:
        w.estimatedHours || (Number.isFinite(Number(w.hours)) ? `${w.hours} hrs estimated` : ""),
      actionLabel:
        w.actionLabel ||
        (status === "completed" ? "Review Notes" : status === "current" ? "Action Hub" : "Preview"),
      checklist: w.checklist || [],
    };
  });

  return { goal, weeks };
}

/** /applications item → Application Tracker shape (maps stage synonyms). */
export function normalizeApplication(a) {
  if (!a || typeof a !== "object") return a;
  const stage = STAGE_SYNONYMS[a.stage] || a.stage;
  return {
    ...a,
    stage,
    status: STAGE_SYNONYMS[a.status] || a.status,
    opportunityId: a.opportunityId || a.opportunity_id,
    logoText: a.logoText || a.logo_text || "SM",
    logoBg: a.logoBg || a.logo_bg || "bg-primary text-on-primary",
    fitScore: clampScore(a.fitScore ?? a.fit_score ?? 75, 75),
    trustScore: clampScore(a.trustScore ?? a.trust_score ?? 90, 90),
    nextAction: a.nextAction || a.next_action || "Awaiting update",
    lastUpdated: a.lastUpdated || a.last_updated || "",
  };
}

/** Resolve the numeric week for a roadmap checklist toggle. */
export function resolveWeekNumber(weekObj, fallbackIdx) {
  if (weekObj && Number.isFinite(Number(weekObj.week))) return Number(weekObj.week);
  const parsed = firstNumber(weekObj && (weekObj.weekLabel || weekObj.title));
  return parsed || fallbackIdx + 1;
}
