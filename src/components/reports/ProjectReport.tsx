import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  ExternalLink,
  Download,
  LayoutDashboard,
  Target,
  Image as ImageIcon,
  MessageSquare,
  Eye,
  Navigation,
  Smile,
  Shield,
  TrendingUp,
} from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { Project } from "@/data/mockData";
import { getProjectNotes } from "@/components/MagnetReviewPanel";

// Import Sections
import ReportOverview from "./sections/ReportOverview";
import ReportStrategy from "./sections/ReportStrategy";
import MagnetCategoryDetail from "./sections/MagnetCategoryDetail";
import ReportMedia from "./sections/ReportMedia";

interface ProjectReportProps {
  project?: Project;
}

const ProjectReport: React.FC<ProjectReportProps> = ({
  project: propProject,
}) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { magnetCategories, getReviewScores } = useSettings();
  const [project, setProject] = useState<Project | null>(propProject || null);
  const [reviewScores, setReviewScores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [projectResponses, setProjectResponses] = useState<Record<string, any>>(
    {},
  );

  // Load project data
  useEffect(() => {
    const loadData = async () => {
      if (!propProject && projectId) {
        try {
          const savedProjects = JSON.parse(
            localStorage.getItem("magnet-projects") || "[]",
          );
          const foundProject = savedProjects.find(
            (p: Project) => p.id === projectId,
          );
          setProject(foundProject || null);

          if (foundProject) {
            const notes = getProjectNotes(foundProject.id);
            setProjectResponses(notes);
          }
        } catch (error) {
          console.error("Error loading project:", error);
        }
      } else if (propProject) {
        const notes = getProjectNotes(propProject.id);
        setProjectResponses(notes);
      }
      setIsLoading(false);
    };

    loadData();
  }, [projectId, propProject]);

  useEffect(() => {
    if (project) {
      const scores = getReviewScores(project.id);
      setReviewScores(scores);
    }
  }, [project, getReviewScores]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#34386a] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-xl font-semibold">Project Not Found</div>
          <Button onClick={() => navigate("/projects")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  // Calculate scores
  const latestScore = reviewScores[reviewScores.length - 1];
  const overallScore = latestScore
    ? Math.round((latestScore.totalScore / latestScore.maxPossibleScore) * 100)
    : 0;

  const getStatusColor = () => {
    switch (project.status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getCategoryIcon = (categoryId: string) => {
    const iconMap: Record<string, any> = {
      message: MessageSquare,
      attraction: Eye,
      goal: Target,
      navigation: Navigation,
      experience: Smile,
      trust: Shield,
    };
    return iconMap[categoryId.toLowerCase()] || TrendingUp;
  };

  // Mock Data
  const mockRecommendations = [
    {
      category: "Message",
      priority: "High",
      issue: "Homepage headline lacks clarity and impact",
      recommendation:
        "Revise main headline to clearly communicate value proposition within 3 seconds",
      impact: "Could increase conversion rate by 15-25%",
    },
    {
      category: "Navigation",
      priority: "Medium",
      issue: "Menu structure is confusing for mobile users",
      recommendation:
        "Simplify navigation menu and improve mobile responsiveness",
      impact: "Better user experience and reduced bounce rate",
    },
    {
      category: "Trust",
      priority: "High",
      issue: "Missing trust signals and testimonials",
      recommendation:
        "Add customer testimonials and trust badges above the fold",
      impact: "Increase credibility and conversion rates",
    },
  ];

  const mockCostBenefit = {
    costOfInaction: {
      monthlyLostRevenue: 5000,
      yearlyLostRevenue: 60000,
      customerAcquisitionImpact: "25% lower conversion rate",
    },
    benefitsOfAction: {
      estimatedROI: "300-500%",
      timeToImplement: "2-4 weeks",
      expectedIncrease: "15-30% conversion improvement",
    },
  };

  const topActions = [
    {
      label: "Revise homepage headline for clarity",
      impact: "High",
      effort: "Low",
      eta: "1 week",
    },
    {
      label: "Add trust signals and testimonials",
      impact: "High",
      effort: "Medium",
      eta: "2 weeks",
    },
    {
      label: "Optimize CTA button placement",
      impact: "Medium",
      effort: "Low",
      eta: "3 days",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <h1 className="text-lg font-bold text-[#34386a]">
                {project.name}
              </h1>
              <p className="text-xs text-muted-foreground">MAGNET Report</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button
              size="sm"
              className="bg-[#34386a] hover:bg-[#2a2e56]"
              onClick={() => window.open(project.url, "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Site
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 border-r bg-gray-50 overflow-y-auto">
          <nav className="p-4 space-y-6">
            {/* Main Sections */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                Report Sections
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "overview"
                      ? "bg-white text-[#34386a] shadow-sm"
                      : "text-gray-700 hover:bg-white/50"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Executive Overview
                </button>
                <button
                  onClick={() => setActiveTab("strategy")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "strategy"
                      ? "bg-white text-[#34386a] shadow-sm"
                      : "text-gray-700 hover:bg-white/50"
                  }`}
                >
                  <Target className="h-4 w-4" />
                  Strategic Plan
                </button>
                <button
                  onClick={() => setActiveTab("media")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "media"
                      ? "bg-white text-[#34386a] shadow-sm"
                      : "text-gray-700 hover:bg-white/50"
                  }`}
                >
                  <ImageIcon className="h-4 w-4" />
                  Media & Notes
                </button>
              </div>
            </div>

            {/* MAGNET Categories */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                MAGNET Deep Dive
              </div>
              <div className="space-y-1">
                {magnetCategories.map((category) => {
                  const Icon = getCategoryIcon(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveTab(`category-${category.id}`)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === `category-${category.id}`
                          ? "bg-white text-[#34386a] shadow-sm"
                          : "text-gray-700 hover:bg-white/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="truncate">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-5xl mx-auto p-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <ReportOverview
                project={project}
                overallScore={overallScore}
                getStatusColor={getStatusColor}
                getScoreColor={getScoreColor}
                costBenefit={mockCostBenefit}
                topActions={topActions}
              />
            )}

            {/* Strategy Tab */}
            {activeTab === "strategy" && (
              <ReportStrategy recommendations={mockRecommendations} />
            )}

            {/* Media Tab */}
            {activeTab === "media" && <ReportMedia />}

            {/* MAGNET Category Tabs */}
            {magnetCategories.map((category) => {
              if (activeTab !== `category-${category.id}`) return null;

              const categoryScore =
                latestScore?.categoryScores[category.id] || 0;
              const maxCategoryScore = category.questions
                .filter((q) => q.points && q.points > 0)
                .reduce((sum, q) => sum + (q.points || 0), 0);
              const categoryPercentage =
                maxCategoryScore > 0
                  ? Math.round((categoryScore / maxCategoryScore) * 100)
                  : 0;

              return (
                <MagnetCategoryDetail
                  key={category.id}
                  category={category}
                  score={categoryScore}
                  maxScore={maxCategoryScore}
                  percentage={categoryPercentage}
                  responses={projectResponses}
                />
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectReport;