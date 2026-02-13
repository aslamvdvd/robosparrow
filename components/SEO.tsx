import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  keywords?: string[];
  schema?: Record<string, any>;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image = "https://therobosparrow.com/logos/logo.png", // Default image if we have one
  url = "https://therobosparrow.com",
  keywords = [
    "robotics",
    "simulation",
    "arduino",
    "esp32",
    "virtual lab",
    "coding",
    "stem education",
    "iot",
    "electronics",
    "web-based simulation",
    "virtual robotics lab",
    "virtual breadboard",
    "Robo",
    "Sparrow",
    "robo",
    "sparrow",
    "rob sparrow",
    "robo sparrow",
    "agentic robotic learning platform",
    "agent robotics",
    "agent virtual robotics lab",
    "agent robotic lab",
    "robobuddy",
    "students friend robot",
    "robotics for kids",
    "robotics for children",
    "robotics for students",
    "robotics for hobbyists",
    "robotic hobby",
    "sparrow lab",
    "online robotics simulator",
    "free robotics simulator",
    "robotics remote lab",
    "virtual circuit builder",
    "arduino simulator online",
    "esp32 simulator",
    "raspberry pi simulator",
    "learn robotics online",
    "coding for robots",
    "block coding robotics",
    "python robotics simulation",
    "cpp robotics simulation",
    "stem projects for kids",
    "engineering simulation",
    "mechatronics",
    "educational technology",
    "edtech robotics",
    "virtual maker space",
    "digital twin robotics",
  ],
  schema,
}) => {
  const fullTitle = `${title} | Robo Sparrow`;
  const defaultKeywords = [
    "robotics",
    "simulation",
    "arduino",
    "esp32",
    "virtual lab",
    "coding",
    "stem education",
    "iot",
    "electronics",
    "web-based simulation",
  ];
  const allKeywords = [...new Set([...defaultKeywords, ...keywords])].join(
    ", ",
  );

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <meta name="image" content={image} />
      <meta name="author" content="Robo Sparrow Studio" />
      <meta name="robots" content="index, follow" />
      <meta name="theme-color" content="#030712" />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}

      {/* Open Graph tags (Facebook/Linkedin) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
