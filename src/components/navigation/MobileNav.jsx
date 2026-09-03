import React from "react";
import { useApp } from "../../context/AppContext";

export default function MobileNav() {
  const { currentRoute, setCurrentRoute } = useApp();

  const mobileNavItems = [
    { id: "dashboard", label: "Home", icon: "dashboard" },
    { id: "discover", label: "Discover", icon: "explore" },
    { id: "matches", label: "Matches", icon: "handshake" },
    { id: "roadmap", label: "Roadmap", icon: "map" },
    { id: "profile", label: "Profile", icon: "account_circle" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-surface-container-high shadow-[0_-1px_8px_rgba(0,0,0,0.06)] z-50 flex items-center justify-around px-unit-xs select-none">
      {mobileNavItems.map((item) => {
        const isActive =
          currentRoute === item.id ||
          (item.id === "discover" && currentRoute === "opportunity-details");
        return (
          <button
            key={item.id}
            onClick={() => setCurrentRoute(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isActive
                ? "text-primary font-semibold"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <span className={`material-symbols-outlined text-[22px] ${isActive ? "fill" : ""}`}>
              {item.icon}
            </span>
            <span className="text-label-sm mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
