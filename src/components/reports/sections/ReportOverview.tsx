import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Globe,
  User,
  Calendar,
  Target,
  Video,
  Camera,
  Clock,
  AlertTriangle,
  FileText,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import { Project } from "@/data/mockData";

interface ReportOverviewProps {
  project: Project;
  overallScore: number;
  getScoreColor: (score: number) => string;
  getStatusColor: () => string;
  costBenefit: {
    costOfInaction: {
      monthlyLostRevenue: number;
      yearlyLostRevenue: number;
      customerAcquisitionImpact: string;
    };
    benefitsOfAction: {
      estimatedROI: string;
      timeToImplement: string;
      expectedIncrease: string;
    };
  };
  topActions: {
    label: string;
    impact: string;
    effort: string;
    eta: string;
  }[];
}

const ReportOverview: React.FC<ReportOverviewProps> = ({
  project,
  overallScore,
  getScoreColor,
  getStatusColor,
  costBenefit,
  topActions,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-2 lg:col-span-3 border-none shadow-md bg-gradient-to-r from-[#34386a] to-[#4a4e8a] text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-4">
                <div>
                  <Badge
                    className={`mb-2 border-none ${getStatusColor()} bg-white/10 text-white`}
                  >
                    {project.status.charAt(0).toUpperCase() +
                      project.status.slice(1)}
                  </Badge>
                  <h1 className="text-3xl font-bold">{project.name}</h1>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-100 hover:text-white flex items-center gap-2 mt-1 text-sm"
                  >
                    <Globe className="h-4 w-4" />
                    {project.url}
                  </a>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-blue-100">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {project.clientName}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Updated {project.lastUpdated}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-4">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{overallScore}%</div>
                    <div className="text-sm text-blue-100">MAGNET Score</div>
                  </div>
                  <div className="w-px h-12 bg-white/20" />
                  <div className="text-center">
                    <div className="text-4xl font-bold">{project.progress}%</div>
                    <div className="text-sm text-blue-100">Completion</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-blue-100 bg-black/10 rounded-full px-3 py-2">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    Urgency: High
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-yellow-300" />
                    Effort: Medium
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                    ROI: High
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1 flex flex-col justify-center border-none shadow-md">
          <CardContent className="p-6 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-[#34386a]">3</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Video className="h-3 w-3" /> Videos
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-[#34386a]">12</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Camera className="h-3 w-3" /> Screenshots
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-[#34386a]">2.5h</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Review Time
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-600">3</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Critical Issues
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Impact */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#34386a]" />
            <div>
              <h2 className="font-semibold text-lg text-[#34386a]">
                Business Impact
              </h2>
              <p className="text-xs text-muted-foreground">
                Share this section with decision makers to justify investment.
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <h4 className="text-sm font-semibold text-red-800 mb-3 uppercase tracking-wide">
                Cost of Inaction
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-red-700">Monthly Loss</span>
                  <span className="text-lg font-bold text-red-700">
                    ${costBenefit.costOfInaction.monthlyLostRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-red-700">Yearly Loss</span>
                  <span className="text-lg font-bold text-red-700">
                    ${costBenefit.costOfInaction.yearlyLostRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h4 className="text-sm font-semibold text-green-800 mb-3 uppercase tracking-wide">
                Projected ROI
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-green-700">Est. Return</span>
                  <span className="text-lg font-bold text-green-700">
                    {costBenefit.benefitsOfAction.estimatedROI}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-green-700">Timeline</span>
                  <span className="text-lg font-bold text-green-700">
                    {costBenefit.benefitsOfAction.timeToImplement}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Actions */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[#34386a]" />
            <h2 className="font-semibold text-sm text-[#34386a]">
              Top 3 Actions to Take Next
            </h2>
          </div>
          <p className="text-xs text-muted-foreground hidden md:block">
            Prioritized actions to move from insight to implementation.
          </p>
        </div>
        <CardContent className="p-4 grid gap-3 md:grid-cols-3">
          {topActions.map((action, index) => (
            <div
              key={index}
              className="rounded-lg border bg-card p-3 flex flex-col gap-2"
            >
              <div className="text-sm font-medium text-foreground">
                {index + 1}. {action.label}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                  Impact: {action.impact}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                  Effort: {action.effort}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                  ETA: {action.eta}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#34386a]" />
            <div>
              <h2 className="font-semibold text-lg text-[#34386a]">
                Executive Summary
              </h2>
              <p className="text-xs text-muted-foreground">
                2-minute overview for decision makers.
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-6 space-y-6">
          <div className="prose max-w-none text-gray-600">
            <p className="text-lg leading-relaxed text-gray-700">
              The MAGNET analysis of{" "}
              <span className="font-semibold text-[#34386a]">
                {project.name}
              </span>{" "}
              reveals a website with strong potential but several areas requiring
              immediate attention. With an overall score of{" "}
              <span className={`font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </span>
              , the site demonstrates good foundational elements while showing
              clear opportunities for conversion optimization.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Key Strengths
              </h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                  Clean, professional design that builds initial trust
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                  Mobile-responsive layout with good user experience
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                  Clear navigation structure for easy content discovery
                </li>
              </ul>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Critical Improvements
              </h3>
              <ul className="space-y-2 text-sm text-red-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                  Homepage messaging lacks clarity and immediate impact
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                  Missing trust signals and social proof elements
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                  Call-to-action buttons need better positioning
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportOverview;
