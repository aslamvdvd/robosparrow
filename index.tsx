import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import ReactGA from "react-ga4";

// Initialize Google Analytics 4
// 1. Create a GA4 property at analytics.google.com
// 2. Get your "Measurement ID" (starts with G-)
// 3. Add VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX to your .env file
const rawGaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
const GA_MEASUREMENT_ID = rawGaId
  ? rawGaId.replace(/^"|"$/g, "").trim()
  : undefined;

// Only initialize Analytics in Production to prevent dev data pollution
const IS_PROD = import.meta.env.PROD;

if (GA_MEASUREMENT_ID && IS_PROD) {
  ReactGA.initialize(GA_MEASUREMENT_ID);
  // Send initial pageview
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
} else {
  console.log(
    "Analytics: No VITE_GA_MEASUREMENT_ID found. Skipping initialization.",
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
