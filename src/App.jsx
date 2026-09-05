import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { AppProvider, useApp } from "./context/AppContext";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import Matches from "./pages/Matches";
import OpportunityDetails from "./pages/OpportunityDetails";
import SkillProfile from "./pages/SkillProfile";
import SkillGapAnalysis from "./pages/SkillGapAnalysis";
import Roadmap from "./pages/Roadmap";
import ProjectRecommendations from "./pages/ProjectRecommendations";
import ApplicationTracker from "./pages/ApplicationTracker";
import StudentProfile from "./pages/StudentProfile";
import Saved from "./pages/Saved";

function AppContent() {
  const { currentRoute } = useApp();

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case "dashboard":
        return <Dashboard />;
      case "discover":
        return <Discover />;
      case "matches":
        return <Matches />;
      case "opportunity-details":
        return <OpportunityDetails />;
      case "skill-profile":
        return <SkillProfile />;
      case "skill-gap":
        return <SkillGapAnalysis />;
      case "roadmap":
        return <Roadmap />;
      case "projects":
        return <ProjectRecommendations />;
      case "applications":
        return <ApplicationTracker />;
      case "saved":
        return <Saved />;
      case "profile":
        return <StudentProfile />;
      default:
        return <Dashboard />;
    }
  };

  return <AppLayout>{renderCurrentPage()}</AppLayout>;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Analytics />
    </AppProvider>
  );
}
