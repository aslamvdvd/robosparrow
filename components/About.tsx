import React from "react";
import { ArrowLeft, Target, Lightbulb, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Our <span className="text-blue-500">Vision</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            Democratizing hardware education by removing the physical barriers
            to entry. We believe that every aspiring engineer should have access
            to a world-class robotics lab, right in their hands.
          </p>
        </header>

        <div className="space-y-16">
          <section className="grid md:grid-cols-[1fr_2fr] gap-8">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">The Spark</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Robotics is hard. You need hardware, space, and a budget. I
                wanted to democratize this experience.
                <strong>Robo Sparrow</strong> was born from the idea that a
                "virtual bench" could be just as messy, educational, and fun as
                a real one.
              </p>
              <p>I wanted to build a place where:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li>You don't need to buy an expensive kit upfront.</li>
                <li>You can't burn out an LED (physically, at least).</li>
                <li>
                  You can code, wire, and simulate in real-time with AI
                  assistance.
                </li>
                <li>You can buy the components from us when you're ready to build physically and you can get it delivered to your doorstep.</li>
                <li>You can have your project assembled by us when you're ready to build physically and you can get it delivered to your doorstep.</li>
                <li>You can share your projects with the world.</li>
                <li>You can collaborate with other builders.</li>
              </ul>
            </div>
          </section>

          <section className="grid md:grid-cols-[1fr_2fr] gap-8 border-t border-gray-800 pt-16">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">The Mission</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We are building the "Github for Hardware." By combining
                high-fidelity simulation with an Agentic AI tutor, we are
                solving the "Hair on Fire" problem of expensive barriers to
                entry in robotics education.
              </p>
              <p>
                Our goal is to empower the next generation of hardware engineers
                to design, build, and share their creations without limits.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-24 p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to build?</h3>
          <p className="text-gray-400 mb-6">
            Jump into the studio and start your journey today.
          </p>
          <button
            onClick={() => navigate("/studio")}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-transform hover:-translate-y-0.5"
          >
            Launch Studio
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
