import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2 } from "lucide-react";

const MagnetReports: React.FC = () => {
  const magnetScores = [
    { name: "M - Magnetic Captivation", score: 78, color: "hsl(0,85%,65%)" },
    { name: "A - Authentic Connection", score: 65, color: "hsl(30,85%,65%)" },
    { name: "G - GOLDEN Persuasion", score: 82, color: "hsl(60,85%,65%)" },
    {
      name: "N - Niche-Precision Design",
      score: 71,
      color: "hsl(120,85%,65%)",
    },
    { name: "E - Elegant Experience", score: 89, color: "hsl(200,85%,65%)" },
    { name: "T - Targeted Dominance", score: 76, color: "hsl(270,85%,65%)" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <Button variant="outline">
          <BarChart2 className="mr-2 h-4 w-4" /> Generate Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>MAGNET Framework Analysis</CardTitle>
          <CardDescription>Overview of all project evaluations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {magnetScores.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{item.name}</h3>
                  <span className="text-sm">{item.score}% Average</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary/20">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.score}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MagnetReports;
