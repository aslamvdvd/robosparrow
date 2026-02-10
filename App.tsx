import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./components/Landing";
import Studio from "./components/Studio";
import SEO from "./components/SEO";
import About from "./components/About";
import Contact from "./components/Contact";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <SEO
                title="Virtual Robotics Studio"
                description="Build, code, and simulate Arduino and ESP32 robots directly in your browser. No hardware required."
              />
              <Landing />
            </>
          }
        />
        <Route
          path="/studio"
          element={
            <>
              <SEO
                title="Studio"
                description="Design circuits, write code, and collaborate with AI to build your virtual robot."
              />
              <Studio />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <SEO
                title="About Us"
                description="Our vision to democratize hardware education."
              />
              <About />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <SEO
                title="Contact Us"
                description="Get in touch with the Robo Sparrow team."
              />
              <Contact />
            </>
          }
        />
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
