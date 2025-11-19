import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BarChart3, Plus, CheckCircle, Users, FileText } from "lucide-react";

const HomePage: React.FC = () => {
  const [activeFrameworkIndex, setActiveFrameworkIndex] = useState(-1);
  const [isPaused, setIsPaused] = useState(false);

  // Add CSS animation styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes progressBar {
        from { width: 0%; }
        to { width: 100%; }
      }
      .animate-in {
        animation-fill-mode: both;
      }
      .slide-in-from-bottom-4 {
        animation: slideInFromBottom 0.5s ease-out;
      }
      @keyframes slideInFromBottom {
        from {
          opacity: 0;
          transform: translateY(1rem);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes kenBurns {
        0% {
          transform: scale(1) translate(0, 0);
        }
        25% {
          transform: scale(1.08) translate(-2%, -1%);
        }
        50% {
          transform: scale(1.12) translate(1%, -2%);
        }
        75% {
          transform: scale(1.06) translate(-1%, 1%);
        }
        100% {
          transform: scale(1.1) translate(1%, 0%);
        }
      }
      .ken-burns {
        animation: kenBurns 20s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // MAGNET Framework data with images and descriptions
  const magnetFramework = [
    {
      id: "magnetic",
      name: "Magnetic Captivation",
      color: "bg-red-500",
      description:
        "In the first 1 to 3 seconds, does your website share a strong, clear message or bold promise that grabs visitors' attention and makes them curious to learn more or act?",
      image:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
      overlayText: "Does your website grab attention in 3 seconds?",
      overlaySubtext:
        "Your visitors decide within moments whether to stay or leave. A magnetic website immediately communicates value with a bold promise or compelling message that stops the scroll and sparks curiosity.",
      duration: 5000, // Longer text needs more time
    },
    {
      id: "authentic",
      name: "Authentic Connection",
      color: "bg-blue-500",
      description:
        "Do you use the exact words and phrases your ideal clients use to describe their biggest challenges or desired outcomes?",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
      overlayText: "Are you speaking your customer's language?",
      overlaySubtext:
        "Authentic connection happens when you mirror the exact words, phrases, and emotions your ideal clients use. This creates instant recognition and trust, making visitors feel truly understood.",
      duration: 5500, // Longer text needs more time
    },
    {
      id: "golden",
      name: "GOLDEN Persuasion",
      color: "bg-yellow-500",
      description:
        "Is your website messaging framed as an engaging, persuasive story?",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      overlayText: "Does your website tell a compelling story?",
      overlaySubtext:
        "Golden persuasion transforms features into benefits through storytelling. It guides visitors on an emotional journey from problem to solution, making your offer irresistible and memorable.",
      duration: 5500, // Longer text needs more time
    },
    {
      id: "niche",
      name: "Niche-Precision Design",
      color: "bg-green-500",
      description:
        "Does your website align with the general look and feel of other sites in your niche BUT without blending in OR feeling out of place?",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
      overlayText: "Does your design fit in while standing out?",
      overlaySubtext:
        "Niche-precision design strikes the perfect balance - familiar enough to feel credible in your industry, yet distinctive enough to be memorable. It builds trust while creating differentiation.",
      duration: 5000, // Medium text length
    },
    {
      id: "elegant",
      name: "Elegant Experience",
      color: "bg-purple-500",
      description:
        "Does your site load fast (under 3 seconds) and provide a smooth frustration-free experience on phone and other devices?",
      image:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
      overlayText: "Is your website frustration-free on every device?",
      overlaySubtext:
        "Elegant experience means lightning-fast loading, seamless navigation, and flawless functionality across all devices. Every interaction should feel effortless and intuitive, removing barriers to conversion.",
      duration: 5500, // Longer text needs more time
    },
    {
      id: "targeted",
      name: "Targeted Dominance",
      color: "bg-orange-500",
      description:
        "How often does your site show up in google, social media, and AI search?",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      overlayText: "Are you visible where your customers search?",
      overlaySubtext:
        "Targeted dominance ensures your website appears prominently in Google searches, social media feeds, and AI-powered search results. Maximum visibility drives consistent traffic and establishes market authority.",
      duration: 5000, // Medium text length
    },
  ];

  // Auto-cycle through framework tabs with dynamic timing
  useEffect(() => {
    if (isPaused) return;

    const getCurrentDuration = () => {
      if (activeFrameworkIndex === -1) {
        return 4000; // Default image duration
      }
      return magnetFramework[activeFrameworkIndex]?.duration || 4000;
    };

    const timeout = setTimeout(() => {
      setActiveFrameworkIndex((prevIndex) => {
        if (prevIndex >= magnetFramework.length - 1) {
          return -1; // Reset to show default image
        }
        return prevIndex + 1;
      });
    }, getCurrentDuration());

    return () => clearTimeout(timeout);
  }, [activeFrameworkIndex, isPaused, magnetFramework]);

  // Get current image and overlay data
  const getCurrentImageData = () => {
    if (activeFrameworkIndex === -1) {
      return {
        image:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
        overlayText: "Is your website converting visitors into customers?",
        overlaySubtext:
          "The MAGNET Framework evaluates six critical dimensions that determine your website's conversion potential. Discover which areas need attention to maximize your online success.",
        duration: 4000,
      };
    }
    return magnetFramework[activeFrameworkIndex];
  };

  // Get current duration for progress bar animation
  const getCurrentDuration = () => {
    return getCurrentImageData().duration || 4000;
  };

  const currentImageData = getCurrentImageData();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="/iconic-logo.webp"
              alt="Iconic Digital World Logo"
              className="h-7 w-7"
            />
            <h1 className="text-lg font-bold">
              MAGNET Test<sup className="text-xs">TM</sup> Live
            </h1>
          </Link>
          <Link to="/dashboard">
            <Button size="sm">Enter Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                Professional Website Reviews with{" "}
                <span className="text-primary">
                  MAGNET Test<sup className="text-sm">TM</sup>
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Comprehensive website analysis framework that evaluates websites
                across six critical dimensions to maximize conversion potential.
              </p>
            </div>

            {/* Animated MAGNET Framework */}
            <div
              className="bg-card/50 rounded-lg p-6 space-y-4"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                The MAGNET Framework
              </h3>
              <TooltipProvider>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {magnetFramework.map((item, index) => {
                    const isActive = activeFrameworkIndex === index;
                    return (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={`flex items-center gap-2 p-2 rounded-md transition-all duration-500 cursor-help transform ${
                              isActive
                                ? "bg-primary/20 shadow-lg scale-105 border-2 border-primary/30"
                                : "hover:bg-primary/10 hover:shadow-sm border-2 border-transparent"
                            }`}
                            onClick={() => {
                              setActiveFrameworkIndex(index);
                              setIsPaused(true);
                              setTimeout(() => setIsPaused(false), 5000);
                            }}
                          >
                            <div
                              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                isActive ? "animate-pulse shadow-lg" : ""
                              } ${item.color}`}
                            ></div>
                            <span
                              className={`font-medium transition-all duration-300 ${
                                isActive ? "text-primary font-semibold" : ""
                              }`}
                            >
                              {item.name}
                            </span>
                            {isActive && (
                              <div className="ml-auto">
                                <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{item.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>

              {/* Progress indicator */}
              <div className="flex justify-center mt-4">
                <div className="flex gap-1">
                  {magnetFramework.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        activeFrameworkIndex === index
                          ? "bg-primary scale-125"
                          : activeFrameworkIndex > index
                            ? "bg-primary/60"
                            : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/projects" className="flex-1">
                <Button size="lg" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Start Your Review
                </Button>
              </Link>
              <Link to="/dashboard" className="flex-1">
                <Button variant="outline" size="lg" className="w-full">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl relative">
              {/* Main Image with smooth transitions */}
              <img
                key={currentImageData.image}
                src={currentImageData.image}
                alt={
                  activeFrameworkIndex === -1
                    ? "Website analytics and review dashboard"
                    : currentImageData.name
                }
                className="w-full h-full object-cover transition-all duration-700 ease-in-out ken-burns"
              />

              {/* Animated overlay text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end z-10">
                <div className="p-6 text-white transform transition-all duration-500 ease-in-out pb-8">
                  <h4 className="text-xl font-bold mb-2 animate-in slide-in-from-bottom-4 duration-500">
                    {currentImageData.overlayText}
                  </h4>
                  <p className="text-sm opacity-90 animate-in slide-in-from-bottom-4 duration-700">
                    {currentImageData.overlaySubtext}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress bar - ALWAYS visible, positioned outside the image container */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/80 backdrop-blur-sm z-[100] rounded-b-xl">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-500 transition-all ease-linear shadow-lg"
                style={{
                  width: isPaused ? "100%" : "0%",
                  animation: isPaused
                    ? "none"
                    : `progressBar ${getCurrentDuration()}ms linear`,
                  boxShadow:
                    "0 0 12px rgba(59, 130, 246, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                }}
              />
            </div>

            {/* Floating icon with enhanced animation */}
            <div
              className={`absolute -bottom-4 -right-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center transition-all duration-500 ${
                activeFrameworkIndex !== -1 ? "scale-110 bg-primary/20" : ""
              }`}
            >
              <div
                className={`w-14 h-14 bg-primary rounded-full flex items-center justify-center transition-all duration-500 ${
                  activeFrameworkIndex !== -1 ? "animate-pulse" : ""
                }`}
              >
                <BarChart3 className="w-7 h-7 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="text-center space-y-3 p-6 rounded-lg bg-card/30">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Comprehensive Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Detailed insights across all six MAGNET dimensions with actionable
              recommendations.
            </p>
          </div>
          <div className="text-center space-y-3 p-6 rounded-lg bg-card/30">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Easy to Use</h3>
            <p className="text-sm text-muted-foreground">
              Simple interface with guided questions and visual annotations for
              efficient reviews.
            </p>
          </div>
          <div className="text-center space-y-3 p-6 rounded-lg bg-card/30">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Professional Reports</h3>
            <p className="text-sm text-muted-foreground">
              Generate detailed PDF reports and share findings with clients or
              team members.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
