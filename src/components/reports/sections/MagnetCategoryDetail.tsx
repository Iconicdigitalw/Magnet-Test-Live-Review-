import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { MagnetCategory, Question } from "@/contexts/SettingsContext";

interface MagnetCategoryDetailProps {
  category: MagnetCategory;
  score: number;
  maxScore: number;
  percentage: number;
  responses: Record<string, { answer: string; notes: string }>;
}

const MagnetCategoryDetail: React.FC<MagnetCategoryDetailProps> = ({
  category,
  score,
  maxScore,
  percentage,
  responses,
}) => {
  const getStatusIcon = (answer: string) => {
    if (answer === "yes" || answer === "excellent" || answer === "frequently" || answer === "very_confident") {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (answer === "no" || answer === "poor" || answer === "never" || answer === "not_confident") {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (answer === "needs_work" || answer.startsWith("needs_work") || answer === "sometimes" || answer === "rarely" || answer === "somewhat_confident") {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }
    return <HelpCircle className="h-5 w-5 text-gray-300" />;
  };

  const getStatusLabel = (answer: string) => {
    if (answer === "yes" || answer === "excellent" || answer === "frequently" || answer === "very_confident") return "Pass";
    if (answer === "no" || answer === "poor" || answer === "never" || answer === "not_confident") return "Fail";
    if (answer === "needs_work" || answer.startsWith("needs_work") || answer === "sometimes" || answer === "rarely" || answer === "somewhat_confident") return "Needs Work";
    return "Not Answered";
  };

  const getStatusColor = (answer: string) => {
    if (answer === "yes" || answer === "excellent" || answer === "frequently" || answer === "very_confident") return "bg-green-100 text-green-800 border-green-200";
    if (answer === "no" || answer === "poor" || answer === "never" || answer === "not_confident") return "bg-red-100 text-red-800 border-red-200";
    if (answer === "needs_work" || answer.startsWith("needs_work") || answer === "sometimes" || answer === "rarely" || answer === "somewhat_confident") return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Generate insights based on score
  const getInsights = () => {
    if (percentage >= 80) {
      return {
        type: "strength",
        title: "Category Strength",
        description: `Your ${category.name} is performing exceptionally well. Continue to maintain these standards.`,
        color: "bg-green-50 border-green-100 text-green-800",
      };
    } else if (percentage >= 60) {
      return {
        type: "warning",
        title: "Room for Improvement",
        description: `Your ${category.name} has good foundations but several key areas need optimization to maximize conversion.`,
        color: "bg-amber-50 border-amber-100 text-amber-800",
      };
    } else {
      return {
        type: "critical",
        title: "Critical Attention Needed",
        description: `Your ${category.name} is significantly underperforming and likely causing visitor drop-off. Prioritize fixes here.`,
        color: "bg-red-50 border-red-100 text-red-800",
      };
    }
  };

  const insight = getInsights();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Category Header Card */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className={`h-2 w-full ${category.color.replace("/20", "")}`} />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-base px-3 py-1">
                  {category.id}
                </Badge>
                <h2 className="text-2xl font-bold text-gray-900">
                  {category.name}
                </h2>
              </div>
              <p className="text-gray-600 max-w-2xl">{category.description}</p>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#34386a]">
                  {percentage}%
                </div>
                <div className="text-xs text-muted-foreground">Category Score</div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <div className="text-xl font-bold text-gray-700">
                  {score}/{maxScore}
                </div>
                <div className="text-xs text-muted-foreground">Points</div>
              </div>
            </div>
          </div>

          {/* Insight Box */}
          <div
            className={`mt-6 p-4 rounded-lg border flex items-start gap-3 ${insight.color}`}
          >
            <div className="mt-0.5">
              {percentage >= 80 ? (
                <CheckCircle className="h-5 w-5" />
              ) : percentage >= 60 ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
              <p className="text-sm opacity-90">{insight.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Breakdown */}
      <Card className="border-none shadow-sm">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Detailed Breakdown</h3>
        </div>
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            {category.questions.map((question, index) => {
              const response = responses[question.id];
              const answer = response?.answer || "";
              const notes = response?.notes || "";
              const isAnswered = !!answer;

              return (
                <AccordionItem
                  key={question.id}
                  value={question.id}
                  className="border-b last:border-0 px-6"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-start gap-4 text-left w-full">
                      <div className="mt-0.5 shrink-0">
                        {getStatusIcon(answer)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {question.text}
                          </span>
                          {isAnswered && (
                            <Badge
                              variant="secondary"
                              className={`shrink-0 ${getStatusColor(answer)}`}
                            >
                              {getStatusLabel(answer)}
                            </Badge>
                          )}
                        </div>
                        {!isAnswered && (
                          <span className="text-xs text-muted-foreground italic">
                            Not evaluated
                          </span>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pl-9">
                    <div className="space-y-3">
                      {/* Answer Details */}
                      <div className="bg-gray-50 p-3 rounded-md text-sm">
                        <span className="font-semibold text-gray-700">
                          Selected Answer:{" "}
                        </span>
                        <span className="text-gray-600 capitalize">
                          {answer.replace(/_/g, " ").replace(":", " - ")}
                        </span>
                      </div>

                      {/* Notes */}
                      {notes && (
                        <div className="flex gap-3 items-start text-sm text-gray-600 bg-blue-50/50 p-3 rounded-md border border-blue-100">
                          <MessageSquare className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-blue-900 block mb-1">
                              Reviewer Notes:
                            </span>
                            {notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default MagnetCategoryDetail;
