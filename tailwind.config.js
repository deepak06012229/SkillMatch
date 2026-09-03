/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#00685f",
        "primary-container": "#008378",
        "on-primary": "#ffffff",
        "on-primary-container": "#f4fffc",
        "primary-fixed": "#89f5e7",
        "primary-fixed-dim": "#6bd8cb",
        "on-primary-fixed": "#00201d",
        "on-primary-fixed-variant": "#005049",
        "inverse-primary": "#6bd8cb",

        "secondary": "#565e74",
        "secondary-container": "#dae2fd",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#5c647a",
        "secondary-fixed": "#dae2fd",
        "secondary-fixed-dim": "#bec6e0",
        "on-secondary-fixed": "#131b2e",
        "on-secondary-fixed-variant": "#3f465c",

        "tertiary": "#4d5d73",
        "tertiary-container": "#66768d",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#fdfcff",
        "tertiary-fixed": "#d3e4fe",
        "tertiary-fixed-dim": "#b7c8e1",
        "on-tertiary-fixed": "#0b1c30",
        "on-tertiary-fixed-variant": "#38485d",

        "surface": "#f8f9fa",
        "surface-bright": "#f8f9fa",
        "surface-dim": "#d9dadb",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f4f5",
        "surface-container": "#edeeef",
        "surface-container-high": "#e7e8e9",
        "surface-container-highest": "#e1e3e4",
        "surface-variant": "#e1e3e4",
        "surface-tint": "#006a61",
        "on-surface": "#191c1d",
        "on-surface-variant": "#3d4947",
        "inverse-surface": "#2e3132",
        "inverse-on-surface": "#f0f1f2",

        "background": "#f8f9fa",
        "on-background": "#191c1d",

        "outline": "#6d7a77",
        "outline-variant": "#bcc9c6",

        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "sm": "0.125rem",
        "md": "0.25rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "2xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "unit-xs": "4px",
        "unit-sm": "8px",
        "unit-md": "16px",
        "unit-lg": "24px",
        "unit-xl": "32px",
        "unit-2xl": "48px",
        "gutter": "24px",
        "margin-desktop": "32px",
        "margin-mobile": "16px"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        "headline-xl": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "headline-sm": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"]
      },
      fontSize: {
        "headline-xl": ["36px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-lg": ["28px", { lineHeight: "36px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-md": ["22px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-sm": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.01em", fontWeight: "500" }],
        "label-sm": ["11px", { lineHeight: "14px", letterSpacing: "0.02em", fontWeight: "500" }]
      }
    },
  },
  plugins: [],
}
