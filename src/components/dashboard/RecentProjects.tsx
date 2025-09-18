import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight } from "lucide-react";

interface Project {
  id: string;
  name: string;
  url: string;
  clientName: string;
  status: string;
  lastUpdated: string;
  progress: number;
}

interface RecentProjectsProps {
  projects: Project[];
  onStartReview: (projectId: string) => void;
  onViewAllProjects: () => void;
}

const RecentProjects: React.FC<RecentProjectsProps> = ({
  projects,
  onStartReview,
  onViewAllProjects,
}) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
        <CardDescription>Your most recent website reviews</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {projects.slice(0, 3).map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between space-x-4"
              >
                <div>
                  <p className="text-sm font-medium leading-none">
                    {project.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{project.url}</p>
                  <div className="mt-1">
                    <Badge
                      variant={
                        project.status === "active"
                          ? "default"
                          : project.status === "completed"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {project.status.charAt(0).toUpperCase() +
                        project.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStartReview(project.id)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={onViewAllProjects}
        >
          View All Projects
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentProjects;
