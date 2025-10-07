import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Eye,
  Share2,
  Download,
  Trash2,
  FileText,
  Calendar,
  User,
  Globe,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  url: string;
  clientName: string;
  status: string;
  lastUpdated: string;
  progress: number;
}

interface ProjectCardProps {
  project: Project;
  onStartReview: (projectId: string) => void;
  onPreview: (project: Project) => void;
  onShare: (project: Project) => void;
  onDownload: (project: Project) => void;
  onDelete: (project: Project) => void;
  onViewReport: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onStartReview,
  onPreview,
  onShare,
  onDownload,
  onDelete,
  onViewReport,
}) => {
  const getButtonText = () => {
    if (project.status === "active") return "Continue Review";
    if (project.status === "completed") return "View Details";
    return "View Details";
  };

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

  const showProgress =
    project.status !== "completed" && project.status !== "archived";

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">
              {project.name}
            </CardTitle>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <Globe className="h-3 w-3 mr-1 flex-shrink-0" />
              <CardDescription className="truncate">
                {project.url}
              </CardDescription>
            </div>
          </div>
          <Badge
            className={`ml-2 px-2 py-1 text-xs font-medium border ${getStatusColor()}`}
            variant="outline"
          >
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-gray-600">Client:</span>
            <span className="ml-auto font-medium text-gray-900">
              {project.clientName}
            </span>
          </div>

          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-gray-600">
              {project.status === "completed"
                ? "Completed:"
                : project.status === "archived"
                  ? "Archived:"
                  : "Updated:"}
            </span>
            <span className="ml-auto text-gray-900">{project.lastUpdated}</span>
          </div>

          {showProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress:</span>
                <span className="font-medium text-gray-900">
                  {project.progress}%
                </span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4 flex flex-col space-y-3">
        <TooltipProvider>
          <div className="flex items-center justify-center space-x-1 w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={() => onPreview(project)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Preview project</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => onShare(project)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share project</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-green-50 hover:text-green-600 transition-colors"
                  onClick={() => onDownload(project)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download project</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={() => onDelete(project)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete project</p>
              </TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-gray-200 mx-2" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-gray-50 hover:text-gray-700 transition-colors"
                  onClick={() => onViewReport(project)}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View report</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {project.status === "completed" ? (
          <div className="flex space-x-2 w-full">
            <Button
              variant="outline"
              className="flex-1 h-9 text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => onDownload(project)}
            >
              Export PDF
            </Button>
            <Button
              className="flex-1 h-9 text-sm font-medium bg-black text-white hover:bg-gray-800"
              onClick={() => onStartReview(project.id)}
            >
              View Details
            </Button>
          </div>
        ) : (
          <Button
            className="w-full h-9 text-sm font-medium bg-black text-white hover:bg-gray-800"
            onClick={() => onStartReview(project.id)}
          >
            {getButtonText()}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
