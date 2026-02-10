import React from "react";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Contact: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-500/30 flex flex-col">
      <div className="max-w-3xl mx-auto px-6 py-12 w-full flex-grow flex flex-col">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-gray-400 hover:text-white mb-12 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <div className="flex-grow flex flex-col justify-center">
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              Contact <span className="text-blue-500">Us</span>
            </h1>
            <p className="text-xl text-gray-400">
              We'd love to hear from investors, partners, and builders.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 flex flex-col items-center text-center hover:bg-gray-900 transition-colors">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Email Us
              </h3>
              <a
                href="mailto:aslammohammad336@gmail.com"
                className="text-gray-300 hover:text-blue-400 transition-colors font-mono"
              >
                aslammohammad336@gmail.com
              </a>
            </div>

            <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 flex flex-col items-center text-center hover:bg-gray-900 transition-colors">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 mb-6">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Call Us</h3>
              <a
                href="tel:+919142129714"
                className="text-gray-300 hover:text-green-400 transition-colors font-mono"
              >
                +91-9142129714
              </a>
            </div>
          </div>

          <div className="mt-12 p-6 rounded-xl bg-gray-900/30 border border-gray-800/50 text-center">
            <p className="text-gray-500 text-sm">
              Available for Global Opportunities
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
