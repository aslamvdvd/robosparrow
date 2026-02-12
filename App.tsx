import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./components/Landing";
import Studio from "./components/Studio";
import SEO from "./components/SEO";
import About from "./components/About";
import Contact from "./components/Contact";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <SEO
                title="Build Real Robots in Your Browser for FREE! 🤖✨"
                description="The World's First AI-Powered Virtual Robotics Studio. No Kits Required. Code Arduino & ESP32, simulate physics, and build your dream robot in seconds. Start for FREE!"
                keywords={[
                  "free arduino simulator",
                  "web-based robotics",
                  "virtual robotics lab",
                  "online circuit simulator",
                  "esp32 simulator",
                  "best robotics simulator 2026",
                  "learn arduino online free",
                  "no download robotics software",
                ]}
                schema={{
                  "@context": "https://schema.org",
                  "@graph": [
                    {
                      "@type": "SoftwareApplication",
                      name: "Robo Sparrow",
                      applicationCategory: "EducationalApplication",
                      operatingSystem: "Web Browser",
                      offers: {
                        "@type": "Offer",
                        price: "0",
                        priceCurrency: "USD",
                      },
                      aggregateRating: {
                        "@type": "AggregateRating",
                        ratingValue: "4.8",
                        ratingCount: "1250",
                      },
                    },
                    {
                      "@type": "Organization",
                      name: "Robo Sparrow",
                      url: "https://therobosparrow.com",
                      logo: "https://therobosparrow.com/logos/logo.png",
                      sameAs: [
                        "https://github.com/aslamvdvd/robosparrow",
                        // Add other social links here if available
                      ],
                    },
                  ],
                }}
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
                title="Studio: Design. Code. Simulate. ⚡️"
                description="Experience the 'Figma for Robotics'. Drag & Drop components, write C++/Python, and watch your code come to life in a realistic physics simulation. 🎮"
                keywords={[
                  "online arduino ide",
                  "drag and drop circuit builder",
                  "simulate sensors and motors",
                  "virtual breadboard",
                  "robotics cad online",
                ]}
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
                title="The Revolution: Democratizing Hardware 🚀"
                description="Hardware is hard. We make it easy. Discover how Robo Sparrow is breaking down barriers to entry for millions of engineers worldwide."
                keywords={[
                  "future of robotics education",
                  "hardware innovation",
                  "robo sparrow mission",
                ]}
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
                title="Let's Build Something Amazing Together 🤝"
                description="Have a question? Want to partner? Get in touch with the Robo Sparrow team and join the hardware revolution."
                keywords={[
                  "contact robo sparrow",
                  "robotics partnership",
                  "support",
                ]}
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
