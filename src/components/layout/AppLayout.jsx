import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileNav from "../navigation/MobileNav";
import MatchScoreModal from "../opportunity/MatchScoreModal";
import ResumeUploadModal from "../profile/ResumeUploadModal";
import NotificationToast from "../common/NotificationToast";
import AuthModal from "../auth/AuthModal";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header />

        {/* Content View */}
        <main className="flex-1 pt-16 pb-24 md:pb-12 px-4 sm:px-6 md:px-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>

      {/* Global Modals & Toast Alerts */}
      <MatchScoreModal />
      <ResumeUploadModal />
      <AuthModal />
      <NotificationToast />
    </div>
  );
}
