import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, Plus } from "lucide-react";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="/iconic-logo.png"
              alt="Iconic Digital World Logo"
              className="h-8 w-8"
            />
            <h1 className="text-xl font-bold">
              MAGNET Test<sup className="text-xs">TM</sup> Live
            </h1>
          </Link>
          <Link to="/dashboard">
            <Button>Enter Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Professional Website Reviews with{" "}
                <span className="text-primary">
                  MAGNET Test<sup className="text-lg">TM</sup>
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Comprehensive website analysis framework that evaluates user
                experience across six critical dimensions to maximize your
                website's conversion potential.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                Transform your website with MAGNET:
              </h3>
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-semibold text-foreground">
                      Manna Magnetic Captivation:
                    </span>{" "}
                    <span className="text-muted-foreground">
                      Strong, clear messaging that grabs attention and creates
                      curiosity
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-semibold text-foreground">
                      Activate Authentic Connection:
                    </span>{" "}
                    <span className="text-muted-foreground">
                      Using client language and providing clear reasons to
                      choose you
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-semibold text-foreground">
                      Guide with GOLDEN Persuasion:
                    </span>{" "}
                    <span className="text-muted-foreground">
                      Engaging storytelling, lead magnets, and persuasive
                      elements
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-semibold text-foreground">
                      Nail Niche-Precision Design:
                    </span>{" "}
                    <span className="text-muted-foreground">
                      Strategic design that fits your niche while standing out
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-semibold text-foreground">
                      Engineer Elegant Experience:
                    </span>{" "}
                    <span className="text-muted-foreground">
                      Fast loading, smooth navigation, and frustration-free
                      experience
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-semibold text-foreground">
                      Trigger Targeted Dominance:
                    </span>{" "}
                    <span className="text-muted-foreground">
                      Search visibility, industry leadership, and marketing
                      strategy
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8 py-4">
                  <Plus className="mr-2 h-5 w-5" /> Start Your Review
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
                alt="Website analytics and review dashboard"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Comprehensive Analysis</h3>
            <p className="text-muted-foreground">
              Get detailed insights across all six MAGNET dimensions with
              actionable recommendations for improvement.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Easy to Use</h3>
            <p className="text-muted-foreground">
              Simple interface with guided questions and visual annotations to
              make website reviews efficient and thorough.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Professional Reports</h3>
            <p className="text-muted-foreground">
              Generate detailed PDF reports and share findings with clients or
              team members for collaborative improvement.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
