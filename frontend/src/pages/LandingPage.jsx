import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Microphone,
  ChartLineUp,
  Calculator,
  TwitterLogo,
  ChartPieSlice,
  CurrencyCircleDollar,
  List,
  X,
  LinkedinLogo,
  GithubLogo,
} from "@phosphor-icons/react";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { connected } = useWallet();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (connected) {
      navigate("/setup");
    }
  };

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <RouterLink to="/" className="flex items-center">
          <h1 className="text-xl font-bold text-purple-500">VoiceSol</h1>
        </RouterLink>

        {/* Desktop Navigation */}
        <div className="nav-menu">
          <div className="flex items-center space-x-8">
            <button className="nav-link text-sm md:text-base font-medium tracking-wide">
              Home
            </button>
            <button className="nav-link text-sm md:text-base font-medium tracking-wide">
              Features
            </button>
            <button className="nav-link text-sm md:text-base font-medium tracking-wide">
              How It Works
            </button>
            <button className="nav-link text-sm md:text-base font-medium tracking-wide">
              FAQ
            </button>
          </div>
        </div>

        {/* Get Started and Wallet Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <WalletMultiButton />
          {connected && (
            <button onClick={handleGetStarted} className="nav-button">
              Get Started
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X size={24} className="text-neutral-600" />
          ) : (
            <List size={24} className="text-neutral-600" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden py-4 px-4 bg-white/80 backdrop-blur-sm border-t border-neutral-100/10">
          <div className="flex flex-col space-y-4">
            <button className="nav-link text-sm md:text-base font-medium tracking-wide text-center">
              Home
            </button>
            <button className="nav-link text-sm md:text-base font-medium tracking-wide text-center">
              Features
            </button>
            <button className="nav-link text-sm md:text-base font-medium tracking-wide text-center">
              How It Works
            </button>
            <button className="nav-link text-sm md:text-base font-medium tracking-wide text-center">
              FAQ
            </button>
            <div className="flex flex-col items-center space-y-4">
              <WalletMultiButton />
              {connected && (
                <button
                  onClick={handleGetStarted}
                  className="nav-button w-full"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const Feature = ({ icon: Icon, title, description }) => {
  return (
    <div className="feature-card relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex flex-col h-full p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 hover:border-purple-300 transition-colors duration-300">
        <div className="mb-4 p-3 rounded-full bg-purple-100 w-fit">
          <Icon size={24} className="text-purple-500" weight="duotone" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-800 mb-2">{title}</h3>
        <p className="text-neutral-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

const Step = ({ number, title, description }) => {
  return (
    <div className="step-card">
      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
        <span className="text-lg font-semibold text-purple-500">{number}</span>
      </div>
      <h3 className="text-lg font-semibold text-neutral-800 mb-2">{title}</h3>
      <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

const FAQ = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white/80 backdrop-blur-sm">
      <button
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors"
        onClick={onClick}
      >
        <span className="font-medium text-neutral-800 text-left">
          {question}
        </span>
        <div
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </div>
      </button>
      <div
        className={`transition-all duration-200 ease-in-out ${
          isOpen ? "max-h-48 py-4" : "max-h-0"
        } overflow-hidden bg-neutral-50/50`}
      >
        <p className="px-6 text-neutral-600 text-sm leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-12 px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Company Info */}
        <div className="flex flex-col space-y-4 max-w-sm">
          <h3 className="text-lg font-semibold text-purple-500">VoiceSol</h3>
          <p className="text-sm text-gray-700">
            Revolutionizing Solana development with voice-powered assistance.
            Execute trades, analyze markets, and manage your crypto portfolio
            with simple voice commands.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Quick Links</h3>
          <div className="flex flex-col space-y-2">
            <a
              href="#"
              className="text-sm text-gray-700 hover:text-purple-500 transition-colors duration-200"
            >
              Home
            </a>
            <a
              href="#"
              className="text-sm text-gray-700 hover:text-purple-500 transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#"
              className="text-sm text-gray-700 hover:text-purple-500 transition-colors duration-200"
            >
              How It Works
            </a>
            <a
              href="#"
              className="text-sm text-gray-700 hover:text-purple-500 transition-colors duration-200"
            >
              FAQ
            </a>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Connect With Us
          </h3>
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-gray-700 hover:text-purple-500 transition-colors duration-200"
            >
              <LinkedinLogo size={24} weight="regular" />
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-purple-500 transition-colors duration-200"
            >
              <TwitterLogo size={24} weight="regular" />
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-purple-500 transition-colors duration-200"
            >
              <GithubLogo size={24} weight="regular" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-200">
        <p className="text-sm text-center text-gray-600">
          © 2024 VoiceSol. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

const LandingPage = () => {
  const [openFAQIndex, setOpenFAQIndex] = useState(null);

  const features = [
    {
      icon: Microphone,
      title: "Voice Assistant",
      description:
        "Get instant answers to your Solana development questions through voice interaction",
    },
    {
      icon: ChartLineUp,
      title: "Smart Trading",
      description: "Execute trades seamlessly using natural language commands",
    },
    {
      icon: Calculator,
      title: "Tax Calculator",
      description:
        "Simplify your crypto tax calculations with automated tracking",
    },
    {
      icon: TwitterLogo,
      title: "News & Insights",
      description:
        "Stay updated with real-time Twitter feeds and market analysis",
    },
    {
      icon: ChartPieSlice,
      title: "Analytics",
      description:
        "Deep dive into your trading patterns with AI-powered insights",
    },
    {
      icon: CurrencyCircleDollar,
      title: "Global Payments",
      description:
        "Send money globally using Solana's fast and low-cost network",
    },
  ];

  const faqs = [
    {
      question: "Is my wallet secure?",
      answer:
        "Yes, we never store your private keys and use industry-standard encryption.",
    },
    {
      question: "What voice commands are supported?",
      answer:
        "We support trading, portfolio management, and documentation queries.",
    },
    {
      question: "How accurate is the voice recognition?",
      answer:
        "Our AI model is trained on crypto terminology for high accuracy.",
    },
    {
      question: "Can I use multiple wallets?",
      answer:
        "Yes, you can connect and manage multiple Solana wallets seamlessly.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
      <NavBar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="heading-gradient animate-gradient mb-6">
            Your Voice-Powered
            <br />
            Solana Assistant
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto mb-12">
            Execute trades, analyze markets, and manage your crypto portfolio
            with simple voice commands
          </p>
          <RouterLink to="/dashboard" className="nav-button inline-block mb-16">
            Get Started
          </RouterLink>

          <div className="hero-image relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl opacity-70 blur-sm group-hover:opacity-100 transition-all duration-300" />
            <div className="relative rounded-xl overflow-hidden border border-purple-200">
              <img
                src="/src/assets/test.png"
                alt="Dashboard Preview"
                className="w-full h-full object-contain transform group-hover:scale-[1.01] transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50">
        <div className="text-center mb-12">
          <h2 className="heading-gradient">Features</h2>
        </div>
        <div className="features-container">
          {features.map((feature, index) => (
            <Feature key={index} {...feature} />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="heading-gradient">How It Works</h2>
        </div>
        <div className="steps-container">
          <Step
            number="1"
            title="Connect Your Wallet"
            description="Securely connect your Solana wallet to get started"
          />
          <Step
            number="2"
            title="Enable Voice Commands"
            description="Allow microphone access to interact with the platform"
          />
          <Step
            number="3"
            title="Start Trading"
            description="Use natural language to execute trades and manage your portfolio"
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white/50">
        <div className="text-center mb-12">
          <h2 className="heading-gradient">FAQ</h2>
        </div>
        <div className="max-w-3xl mx-auto px-4">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQ
                key={index}
                {...faq}
                isOpen={openFAQIndex === index}
                onClick={() =>
                  setOpenFAQIndex(openFAQIndex === index ? null : index)
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
