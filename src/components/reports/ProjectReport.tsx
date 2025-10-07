import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Globe,
  User,
  Calendar,
  BarChart3,
  FileText,
  Video,
  Camera,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Target,
  Clock,
  ExternalLink,
  MessageSquare,
  Eye,
  Navigation,
  Smile,
  Shield,
} from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { Project } from "@/data/mockData";

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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    type: "video" | "image";
    title: string;
    src?: string;
  } | null>(null);

  // Load project data if not provided as prop
  useEffect(() => {
    if (!propProject && projectId) {
      try {
        const savedProjects = JSON.parse(
          localStorage.getItem("magnet-projects") || "[]",
        );
        const foundProject = savedProjects.find(
          (p: Project) => p.id === projectId,
        );
        setProject(foundProject || null);
      } catch (error) {
        console.error("Error loading project:", error);
      }
    }
    setIsLoading(false);
  }, [projectId, propProject]);

  // Load review scores
  useEffect(() => {
    if (project) {
      const scores = getReviewScores(project.id);
      setReviewScores(scores);
    }
  }, [project, getReviewScores]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Project Not Found</h2>
          <p className="text-muted-foreground">
            The requested project could not be found.
          </p>
          <Button onClick={() => navigate("/projects")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  // Calculate overall MAGNET score
  const latestScore = reviewScores[reviewScores.length - 1];
  const overallScore = latestScore
    ? Math.round((latestScore.totalScore / latestScore.maxPossibleScore) * 100)
    : 0;

  // Get status color
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

  // Get score color based on percentage
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Get background color for score visualization
  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 border-green-200";
    if (score >= 60) return "bg-yellow-100 border-yellow-200";
    return "bg-red-100 border-red-200";
  };

  // Get MAGNET category icons
  const getCategoryIcon = (categoryId: string) => {
    const iconMap: Record<string, any> = {
      message: MessageSquare,
      attraction: Eye,
      goal: Target,
      navigation: Navigation,
      experience: Smile,
      trust: Shield,
    };
    return iconMap[categoryId.toLowerCase()] || BarChart3;
  };

  // Calculate category scores for visualization
  const getCategoryScores = () => {
    if (!latestScore) return [];

    return magnetCategories.map((category) => {
      const categoryScore = latestScore.categoryScores[category.id] || 0;
      const maxCategoryScore = category.questions
        .filter((q) => q.points && q.points > 0)
        .reduce((sum, q) => sum + (q.points || 0), 0);
      const categoryPercentage =
        maxCategoryScore > 0
          ? Math.round((categoryScore / maxCategoryScore) * 100)
          : 0;

      return {
        ...category,
        score: categoryScore,
        maxScore: maxCategoryScore,
        percentage: categoryPercentage,
        icon: getCategoryIcon(category.id),
      };
    });
  };

  // Mock data for demonstration
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/projects")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
            <div className="w-px h-6 bg-border" />
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
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(project.url, "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Site
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 space-y-6">
        {/* Compact Project Overview Strip */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <h2 className="text-xl font-bold">{project.name}</h2>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center">
                      <Globe className="mr-1 h-3 w-3" />
                      <span>{project.url}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="mr-1 h-3 w-3" />
                      <span>{project.clientName}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      <span>Updated {project.lastUpdated}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">
                      {project.progress}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Progress
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-lg font-bold ${getScoreColor(overallScore)}`}
                    >
                      {overallScore}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      MAGNET Score
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge
                  className={`px-3 py-1 ${getStatusColor()}`}
                  variant="outline"
                >
                  {project.status.charAt(0).toUpperCase() +
                    project.status.slice(1)}
                </Badge>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Video className="h-4 w-4" />
                  <span>3</span>
                  <Camera className="h-4 w-4 ml-2" />
                  <span>12</span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>2.5h</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MAGNET Donut Chart Scorecard */}
        {latestScore && (
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl">
                <BarChart3 className="mr-3 h-6 w-6" />
                MAGNET Framework Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="relative w-96 h-96">
                  <svg
                    className="w-96 h-96 transform -rotate-90"
                    viewBox="0 0 200 200"
                  >
                    {(() => {
                      const categoryScores = getCategoryScores();
                      const radius = 70;
                      const innerRadius = 50;
                      const centerX = 100;
                      const centerY = 100;
                      let currentAngle = 0;

                      const colors = [
                        "#ef4444", // red
                        "#3b82f6", // blue
                        "#eab308", // yellow
                        "#22c55e", // green
                        "#a855f7", // purple
                        "#f97316", // orange
                      ];

                      return categoryScores.map((category, index) => {
                        const percentage = category.percentage / 100;
                        const angle = percentage * 360;
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + angle;

                        const startRadians = (startAngle * Math.PI) / 180;
                        const endRadians = (endAngle * Math.PI) / 180;

                        const x1 = centerX + radius * Math.cos(startRadians);
                        const y1 = centerY + radius * Math.sin(startRadians);
                        const x2 = centerX + radius * Math.cos(endRadians);
                        const y2 = centerY + radius * Math.sin(endRadians);

                        const x3 = centerX + innerRadius * Math.cos(endRadians);
                        const y3 = centerY + innerRadius * Math.sin(endRadians);
                        const x4 =
                          centerX + innerRadius * Math.cos(startRadians);
                        const y4 =
                          centerY + innerRadius * Math.sin(startRadians);

                        const largeArcFlag = angle > 180 ? 1 : 0;

                        const pathData = [
                          `M ${x1} ${y1}`,
                          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          `L ${x3} ${y3}`,
                          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                          "Z",
                        ].join(" ");

                        currentAngle = endAngle;

                        return (
                          <path
                            key={category.id}
                            d={pathData}
                            fill={colors[index % colors.length]}
                            opacity="0.9"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className={`text-5xl font-bold ${getScoreColor(overallScore)}`}
                      >
                        {overallScore}%
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Overall Score
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-8">
                {getCategoryScores().map((category, index) => {
                  const IconComponent = category.icon;
                  const colors = [
                    "#ef4444",
                    "#3b82f6",
                    "#eab308",
                    "#22c55e",
                    "#a855f7",
                    "#f97316",
                  ];
                  return (
                    <div
                      key={category.id}
                      className="flex items-center space-x-3"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: colors[index % colors.length],
                        }}
                      ></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {category.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {category.percentage}% ({category.score}/
                          {category.maxScore} pts)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Media Strip - condensed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="mr-2 h-5 w-5" />
              Review Media
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Tap any thumbnail to preview
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Video className="h-4 w-4" /> 3 Videos
                </span>
                <span className="flex items-center gap-1">
                  <Camera className="h-4 w-4" /> 6 Shots
                </span>
              </div>
            </div>
            <div className="mt-3 overflow-x-auto">
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <button
                    key={`video-${i}`}
                    type="button"
                    onClick={() => {
                      setSelectedMedia({
                        type: "video",
                        title: `Review Session ${i}`,
                      });
                      setIsLightboxOpen(true);
                    }}
                    className="group relative w-28 h-20 flex-shrink-0 rounded-md border bg-muted overflow-hidden"
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <Video className="h-6 w-6" />
                    </div>
                    <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded opacity-90 group-hover:opacity-100">
                      Session {i}
                    </span>
                  </button>
                ))}
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <button
                    key={`shot-${i}`}
                    type="button"
                    onClick={() => {
                      setSelectedMedia({
                        type: "image",
                        title: `Screenshot ${i}`,
                        src: `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&q=70`,
                      });
                      setIsLightboxOpen(true);
                    }}
                    className="group relative w-28 h-20 flex-shrink-0 rounded-md border overflow-hidden"
                  >
                    <img
                      src={`https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&q=60`}
                      alt={`Screenshot ${i}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded opacity-90 group-hover:opacity-100">
                      Shot {i}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Executive Summary Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              <h4>Overall Assessment</h4>
              <p>
                The MAGNET analysis of {project.name} reveals a website with
                strong potential but several areas requiring immediate
                attention. With an overall score of {overallScore}%, the site
                demonstrates good foundational elements while showing clear
                opportunities for conversion optimization.
              </p>

              <h4>Key Strengths</h4>
              <ul>
                <li>Clean, professional design that builds initial trust</li>
                <li>Mobile-responsive layout with good user experience</li>
                <li>Clear navigation structure for easy content discovery</li>
              </ul>

              <h4>Critical Areas for Improvement</h4>
              <ul>
                <li>Homepage messaging lacks clarity and immediate impact</li>
                <li>Missing trust signals and social proof elements</li>
                <li>
                  Call-to-action buttons need better positioning and design
                </li>
              </ul>

              <h4>Recommended Next Steps</h4>
              <p>
                Focus on implementing high-impact changes first, particularly
                around messaging clarity and trust building. These improvements
                could yield a 15-30% increase in conversion rates within 2-4
                weeks of implementation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">{rec.category}</h4>
                    <Badge
                      variant={
                        rec.priority === "High" ? "destructive" : "secondary"
                      }
                    >
                      {rec.priority} Priority
                    </Badge>
                  </div>
                  <div>
                    <h5 className="font-medium text-red-600 mb-1">
                      Issue Identified:
                    </h5>
                    <p className="text-sm">{rec.issue}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-600 mb-1">
                      Recommendation:
                    </h5>
                    <p className="text-sm">{rec.recommendation}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-green-600 mb-1">
                      Expected Impact:
                    </h5>
                    <p className="text-sm">{rec.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost/Benefit Analysis Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Cost/Benefit Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="flex items-center text-red-600 font-semibold">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Cost of Inaction
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Lost Revenue:</span>
                    <span className="font-semibold text-red-600">
                      $
                      {mockCostBenefit.costOfInaction.monthlyLostRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Yearly Lost Revenue:</span>
                    <span className="font-semibold text-red-600">
                      $
                      {mockCostBenefit.costOfInaction.yearlyLostRevenue.toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div>
                    <h5 className="font-medium mb-2">
                      Impact on Customer Acquisition:
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      {mockCostBenefit.costOfInaction.customerAcquisitionImpact}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="flex items-center text-green-600 font-semibold">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Benefits of Action
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Estimated ROI:</span>
                    <span className="font-semibold text-green-600">
                      {mockCostBenefit.benefitsOfAction.estimatedROI}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Time to Implement:</span>
                    <span className="font-semibold">
                      {mockCostBenefit.benefitsOfAction.timeToImplement}
                    </span>
                  </div>
                  <Separator />
                  <div>
                    <h5 className="font-medium mb-2">Expected Improvement:</h5>
                    <p className="text-sm text-muted-foreground">
                      {mockCostBenefit.benefitsOfAction.expectedIncrease}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="flex items-center font-semibold mb-4">
                <Target className="mr-2 h-5 w-5" />
                Implementation Roadmap
              </h4>
              <div className="space-y-4">
                {[
                  {
                    phase: "Phase 1 (Week 1-2)",
                    tasks:
                      "Homepage messaging, trust signals, CTA optimization",
                  },
                  {
                    phase: "Phase 2 (Week 3-4)",
                    tasks: "Navigation improvements, mobile optimization",
                  },
                  {
                    phase: "Phase 3 (Week 5-6)",
                    tasks: "Content refinement, A/B testing setup",
                  },
                ].map((phase, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h5 className="font-medium">{phase.phase}</h5>
                      <p className="text-sm text-muted-foreground">
                        {phase.tasks}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Lightbox */}
        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedMedia?.title || "Preview"}</DialogTitle>
            </DialogHeader>
            {selectedMedia?.type === "image" ? (
              <div className="w-full">
                <img
                  src={
                    selectedMedia?.src ||
                    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=70"
                  }
                  alt={selectedMedia?.title || "Screenshot"}
                  className="w-full h-auto rounded-md"
                />
              </div>
            ) : selectedMedia?.type === "video" ? (
              <div className="w-full aspect-video bg-black/90 rounded-md flex items-center justify-center text-white">
                <Video className="h-10 w-10 mr-2" />
                <span>Video Preview</span>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ProjectReport;
