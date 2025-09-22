import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, TrendingUp, Target, Award } from "lucide-react";
import { useSettings, type ReviewScore } from "@/contexts/SettingsContext";

interface ScoreDisplayProps {
  score: ReviewScore;
  showDetails?: boolean;
  compact?: boolean;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  showDetails = true,
  compact = false,
}) => {
  const { magnetCategories } = useSettings();

  const overallPercentage =
    score.maxPossibleScore > 0
      ? Math.round((score.totalScore / score.maxPossibleScore) * 100)
      : 0;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreGrade = (percentage: number) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`text-2xl font-bold ${getScoreColor(overallPercentage)}`}
              >
                {getScoreGrade(overallPercentage)}
              </div>
              <div>
                <div className="font-medium">
                  {score.totalScore}/{score.maxPossibleScore}
                </div>
                <div className="text-sm text-muted-foreground">
                  {overallPercentage}%
                </div>
              </div>
            </div>
            <Trophy className={`h-6 w-6 ${getScoreColor(overallPercentage)}`} />
          </div>
          <Progress value={overallPercentage} className="mt-3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className={`h-6 w-6 ${getScoreColor(overallPercentage)}`} />
            Overall MAGNET Score
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div
            className={`text-6xl font-bold ${getScoreColor(overallPercentage)}`}
          >
            {getScoreGrade(overallPercentage)}
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-semibold">
              {score.totalScore} / {score.maxPossibleScore}
            </div>
            <div className="text-lg text-muted-foreground">
              {overallPercentage}% Overall Score
            </div>
          </div>
          <Progress value={overallPercentage} className="h-3" />
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Completed: {new Date(score.completedAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {showDetails && (
        <>
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {magnetCategories.map((category) => {
                  const categoryScore = score.categoryScores[category.id] || 0;
                  const maxCategoryScore = category.questions
                    .filter((q) => q.points && q.points > 0)
                    .reduce((sum, q) => sum + (q.points || 0), 0);
                  const categoryPercentage =
                    maxCategoryScore > 0
                      ? Math.round((categoryScore / maxCategoryScore) * 100)
                      : 0;

                  return (
                    <Card
                      key={category.id}
                      className="border-l-4"
                      style={{
                        borderLeftColor: category.color.replace("bg-", "#"),
                      }}
                    >
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">
                              {category.name}
                            </h4>
                            <Badge
                              variant={
                                categoryPercentage >= 70
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                categoryPercentage >= 70
                                  ? category.color + " text-white"
                                  : ""
                              }
                            >
                              {categoryPercentage}%
                            </Badge>
                          </div>
                          <div className="text-lg font-bold">
                            {categoryScore} / {maxCategoryScore}
                          </div>
                          <Progress
                            value={categoryPercentage}
                            className="h-2"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Question Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Question-by-Question Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {magnetCategories.map((category) => {
                    const categoryQuestions = category.questions.filter(
                      (q) => q.points && q.points > 0,
                    );
                    if (categoryQuestions.length === 0) return null;

                    return (
                      <div key={category.id}>
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`w-4 h-4 rounded ${category.color}`}
                          ></span>
                          <h4 className="font-semibold">{category.name}</h4>
                        </div>
                        <div className="space-y-2 ml-6">
                          {categoryQuestions.map((question) => {
                            const response = score.responses[question.id];
                            const earnedPoints = response?.points || 0;
                            const maxPoints = question.points || 0;
                            const percentage =
                              maxPoints > 0
                                ? Math.round((earnedPoints / maxPoints) * 100)
                                : 0;

                            return (
                              <div
                                key={question.id}
                                className="border rounded-lg p-3"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium mb-1">
                                      {question.text}
                                    </p>
                                    {response?.answer && (
                                      <Badge
                                        variant={
                                          response.answer === "yes"
                                            ? "default"
                                            : response.answer === "needs_work"
                                              ? "secondary"
                                              : "destructive"
                                        }
                                        className="text-xs"
                                      >
                                        {response.answer === "yes"
                                          ? "Yes"
                                          : response.answer === "needs_work"
                                            ? "Needs Work"
                                            : "No"}
                                      </Badge>
                                    )}
                                    {response?.notes && (
                                      <p className="text-xs text-muted-foreground mt-2">
                                        Notes: {response.notes}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div
                                      className={`font-bold ${getScoreColor(percentage)}`}
                                    >
                                      {earnedPoints}/{maxPoints}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {percentage}%
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {category.id !==
                          magnetCategories[magnetCategories.length - 1].id && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ScoreDisplay;
