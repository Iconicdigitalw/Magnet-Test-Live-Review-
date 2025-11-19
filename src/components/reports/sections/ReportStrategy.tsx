import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp } from "lucide-react";

interface ReportStrategyProps {
  recommendations: {
    category: string;
    priority: string;
    issue: string;
    recommendation: string;
    impact: string;
  }[];
  roadmap?: {
    phase: string;
    title: string;
    tasks: string;
    color: string;
  }[];
}

const ReportStrategy: React.FC<ReportStrategyProps> = ({
  recommendations,
  roadmap,
}) => {
  // Default roadmap if not provided
  const defaultRoadmap = [
    {
      phase: "Phase 1 (Week 1-2)",
      title: "Quick Wins & Critical Fixes",
      tasks: "Homepage messaging, trust signals, CTA optimization",
      color: "bg-red-500",
    },
    {
      phase: "Phase 2 (Week 3-4)",
      title: "Structural Improvements",
      tasks: "Navigation improvements, mobile optimization",
      color: "bg-yellow-500",
    },
    {
      phase: "Phase 3 (Week 5-6)",
      title: "Optimization & Testing",
      tasks: "Content refinement, A/B testing setup",
      color: "bg-green-500",
    },
  ];

  const activeRoadmap = roadmap || defaultRoadmap;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Strategic Recommendations */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#34386a]" />
            <div>
              <h2 className="font-semibold text-lg text-[#34386a]">
                Strategic Recommendations
              </h2>
              <p className="text-xs text-muted-foreground">
                Concrete changes, prioritized by impact and effort.
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="group p-4 border rounded-xl hover:shadow-md transition-all bg-white"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-gray-50">
                      {rec.category}
                    </Badge>
                    <h4 className="font-semibold text-gray-900">{rec.issue}</h4>
                  </div>
                  <Badge
                    className={
                      rec.priority === "High"
                        ? "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"
                    }
                  >
                    {rec.priority} Priority
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pl-1">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Recommendation
                    </div>
                    <p className="text-sm text-gray-700">
                      {rec.recommendation}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Expected Impact
                    </div>
                    <p className="text-sm font-medium text-[#34386a]">
                      {rec.impact}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Roadmap */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#34386a]" />
            <div>
              <h2 className="font-semibold text-lg text-[#34386a]">
                Implementation Roadmap
              </h2>
              <p className="text-xs text-muted-foreground">
                Now, Next, Later – phased plan to roll out improvements.
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
            <div className="space-y-8">
              {activeRoadmap.map((phase, index) => (
                <div
                  key={index}
                  className="relative flex items-start gap-6 pl-4"
                >
                  <div
                    className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-xs font-bold text-white ${phase.color}`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-gray-900">{phase.title}</h4>
                      <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border">
                        {phase.phase}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{phase.tasks}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportStrategy;
