import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Plus,
  Clock,
  CheckCircle,
  Archive,
  BarChart2,
  ArrowRight,
  Globe,
  Settings,
  Eye,
  Share2,
  Download,
  Trash2,
  ExternalLink,
} from "lucide-react";
import AnnotationWorkspace from "./AnnotationWorkspace";
import MagnetReviewPanel from "./MagnetReviewPanel";

const Home = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [previewProject, setPreviewProject] = useState<any>(null);
  const [shareProject, setShareProject] = useState<any>(null);
  const { toast } = useToast();

  // Mock data for projects
  const projects = [
    {
      id: "1",
      name: "E-commerce Website Review",
      url: "https://example-ecommerce.com",
      clientName: "Acme Inc.",
      status: "active",
      lastUpdated: "2023-06-15",
      progress: 65,
    },
    {
      id: "2",
      name: "Portfolio Site Evaluation",
      url: "https://portfolio-example.com",
      clientName: "Jane Designer",
      status: "completed",
      lastUpdated: "2023-06-10",
      progress: 100,
    },
    {
      id: "3",
      name: "SaaS Platform Analysis",
      url: "https://saas-platform.com",
      clientName: "Tech Solutions LLC",
      status: "active",
      lastUpdated: "2023-06-18",
      progress: 30,
    },
    {
      id: "4",
      name: "Blog Redesign Review",
      url: "https://blog-example.com",
      clientName: "Content Creators Co.",
      status: "archived",
      lastUpdated: "2023-05-20",
      progress: 100,
    },
  ];

  // Mock data for recent activity
  const recentActivity = [
    {
      id: "1",
      type: "review_started",
      projectName: "E-commerce Website Review",
      user: "Alex Johnson",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      type: "annotation_added",
      projectName: "SaaS Platform Analysis",
      user: "Maria Garcia",
      timestamp: "5 hours ago",
    },
    {
      id: "3",
      type: "review_completed",
      projectName: "Portfolio Site Evaluation",
      user: "Sam Wilson",
      timestamp: "1 day ago",
    },
    {
      id: "4",
      type: "project_created",
      projectName: "Blog Redesign Review",
      user: "Taylor Smith",
      timestamp: "3 days ago",
    },
  ];

  // Function to handle starting a review
  const handleStartReview = (projectId: string) => {
    setSelectedProject(projectId);
    setActiveTab("workspace");
  };

  // Function to handle creating a new project
  const handleCreateProject = () => {
    setShowNewProjectDialog(false);
    // In a real app, this would create a new project and redirect to it
  };

  // Function to handle project preview
  const handlePreviewProject = (project: any) => {
    setPreviewProject(project);
    setShowPreviewDialog(true);
  };

  // Function to handle project sharing
  const handleShareProject = (project: any) => {
    setShareProject(project);
    setShowShareDialog(true);
    // In a real app, this would generate shareable links
    const shareUrl = `${window.location.origin}/project/${project.id}/share`;

    // Try to copy to clipboard with proper error handling
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          toast({
            title: "Link copied!",
            description:
              "The shareable link has been copied to your clipboard.",
          });
        })
        .catch((error) => {
          console.warn("Failed to copy to clipboard:", error);
          // Fallback: show the link in the dialog for manual copying
          toast({
            title: "Copy manually",
            description: "Please copy the link from the share dialog.",
            variant: "destructive",
          });
        });
    } else {
      // Fallback for browsers that don't support clipboard API
      toast({
        title: "Copy manually",
        description: "Please copy the link from the share dialog.",
        variant: "destructive",
      });
    }
  };

  // Function to handle project download
  const handleDownloadProject = (project: any) => {
    // In a real app, this would trigger file download
    const projectData = {
      project: project,
      exportedAt: new Date().toISOString(),
      exportedBy: "Current User",
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, "_")}_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to handle project deletion
  const handleDeleteProject = (project: any) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      )
    ) {
      // In a real app, this would make an API call to delete the project
      console.log(`Deleting project: ${project.id}`);
      // Remove from local state for demo purposes
      // setProjects(projects.filter(p => p.id !== project.id));
    }
  };

  // Function to visit website
  const handleVisitWebsite = (project: any) => {
    window.open(project.url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">MAGNET Review</h1>
            <nav className="hidden md:flex space-x-4">
              <Button
                variant="ghost"
                onClick={() => setActiveTab("dashboard")}
                className={activeTab === "dashboard" ? "bg-accent" : ""}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("projects")}
                className={activeTab === "projects" ? "bg-accent" : ""}
              >
                Projects
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("reports")}
                className={activeTab === "reports" ? "bg-accent" : ""}
              >
                Reports
              </Button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=user123"
                alt="User"
              />
              <AvatarFallback>US</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {activeTab !== "workspace" ? (
        <main className="container px-4 py-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <Button onClick={() => setShowNewProjectDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New Project
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Projects
                    </CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{projects.length}</div>
                    <p className="text-xs text-muted-foreground">
                      +2 from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Reviews
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {projects.filter((p) => p.status === "active").length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +1 from last week
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completed Reviews
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {projects.filter((p) => p.status === "completed").length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Same as last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Archived Projects
                    </CardTitle>
                    <Archive className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {projects.filter((p) => p.status === "archived").length}
                    </div>
                    <p className="text-xs text-muted-foreground">No change</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Projects and Activity */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Recent Projects</CardTitle>
                    <CardDescription>
                      Your most recent website reviews
                    </CardDescription>
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
                              <p className="text-sm text-muted-foreground">
                                {project.url}
                              </p>
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
                              onClick={() => handleStartReview(project.id)}
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
                      onClick={() => setActiveTab("projects")}
                    >
                      View All Projects
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest actions on your projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {recentActivity.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start space-x-4"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.user}`}
                                alt={activity.user}
                              />
                              <AvatarFallback>
                                {activity.user.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                <span className="font-semibold">
                                  {activity.user}
                                </span>
                                {activity.type === "review_started" &&
                                  " started a review on "}
                                {activity.type === "annotation_added" &&
                                  " added annotations to "}
                                {activity.type === "review_completed" &&
                                  " completed a review of "}
                                {activity.type === "project_created" &&
                                  " created a new project "}
                                <span className="font-semibold">
                                  {activity.projectName}
                                </span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {activity.timestamp}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search projects..."
                      className="w-[200px] pl-8 md:w-[300px]"
                    />
                  </div>
                  <Button onClick={() => setShowNewProjectDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Project
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All Projects</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                      <Card key={project.id}>
                        <CardHeader>
                          <CardTitle>{project.name}</CardTitle>
                          <CardDescription className="truncate">
                            {project.url}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Client:</span>
                              <span className="text-sm font-medium">
                                {project.clientName}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Status:</span>
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
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Last Updated:</span>
                              <span className="text-sm text-muted-foreground">
                                {project.lastUpdated}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Progress:</span>
                                <span className="text-sm font-medium">
                                  {project.progress}%
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-secondary/20">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-2">
                          <TooltipProvider>
                            <div className="flex items-center justify-center space-x-1 w-full">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      handlePreviewProject(project)
                                    }
                                  >
                                    <Eye className="w-4 h-4 text-purple-600" />
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
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleShareProject(project)}
                                  >
                                    <Share2 className="w-4 h-4 text-blue-600" />
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
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      handleDownloadProject(project)
                                    }
                                  >
                                    <Download className="w-4 h-4 text-green-600" />
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
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleDeleteProject(project)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete project</p>
                                </TooltipContent>
                              </Tooltip>

                              <div className="w-px h-4 bg-border mx-1" />

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleVisitWebsite(project)}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Visit website</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>

                          <Button
                            className="w-full"
                            onClick={() => handleStartReview(project.id)}
                          >
                            {project.status === "active"
                              ? "Continue Review"
                              : "View Details"}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="active" className="mt-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects
                      .filter((p) => p.status === "active")
                      .map((project) => (
                        <Card key={project.id}>
                          <CardHeader>
                            <CardTitle>{project.name}</CardTitle>
                            <CardDescription className="truncate">
                              {project.url}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Client:</span>
                                <span className="text-sm font-medium">
                                  {project.clientName}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Last Updated:</span>
                                <span className="text-sm text-muted-foreground">
                                  {project.lastUpdated}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Progress:</span>
                                  <span className="text-sm font-medium">
                                    {project.progress}%
                                  </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-secondary/20">
                                  <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex flex-col space-y-2">
                            <TooltipProvider>
                              <div className="flex items-center justify-center space-x-1 w-full">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        handlePreviewProject(project)
                                      }
                                    >
                                      <Eye className="w-4 h-4 text-purple-600" />
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
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        handleShareProject(project)
                                      }
                                    >
                                      <Share2 className="w-4 h-4 text-blue-600" />
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
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        handleDownloadProject(project)
                                      }
                                    >
                                      <Download className="w-4 h-4 text-green-600" />
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
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        handleDeleteProject(project)
                                      }
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete project</p>
                                  </TooltipContent>
                                </Tooltip>

                                <div className="w-px h-4 bg-border mx-1" />

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        handleVisitWebsite(project)
                                      }
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Visit website</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>

                            <Button
                              className="w-full"
                              onClick={() => handleStartReview(project.id)}
                            >
                              Continue Review
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
                <TabsContent value="completed" className="mt-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects
                      .filter((p) => p.status === "completed")
                      .map((project) => (
                        <Card key={project.id}>
                          <CardHeader>
                            <CardTitle>{project.name}</CardTitle>
                            <CardDescription className="truncate">
                              {project.url}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Client:</span>
                                <span className="text-sm font-medium">
                                  {project.clientName}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Completed On:</span>
                                <span className="text-sm text-muted-foreground">
                                  {project.lastUpdated}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex flex-col space-y-2">
                            <TooltipProvider>
                              <div className="flex items-center justify-center space-x-1 w-full">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        handlePreviewProject(project)
                                      }
                                    >
                                      <Eye className="w-4 h-4 text-purple-600" />
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
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        handleShareProject(project)
                                      }
                                    >
                                      <Share2 className="w-4 h-4 text-blue-600" />
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
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        handleDownloadProject(project)
                                      }
                                    >
                                      <Download className="w-4 h-4 text-green-600" />
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
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        handleDeleteProject(project)
                                      }
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete project</p>
                                  </TooltipContent>
                                </Tooltip>

                                <div className="w-px h-4 bg-border mx-1" />

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        handleVisitWebsite(project)
                                      }
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Visit website</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>

                            <div className="flex justify-between space-x-2 w-full">
                              <Button variant="outline" className="flex-1">
                                Export PDF
                              </Button>
                              <Button
                                className="flex-1"
                                onClick={() => handleStartReview(project.id)}
                              >
                                View Details
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
                <TabsContent value="archived" className="mt-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects
                      .filter((p) => p.status === "archived")
                      .map((project) => (
                        <Card key={project.id}>
                          <CardHeader>
                            <CardTitle>{project.name}</CardTitle>
                            <CardDescription className="truncate">
                              {project.url}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Client:</span>
                                <span className="text-sm font-medium">
                                  {project.clientName}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Archived On:</span>
                                <span className="text-sm text-muted-foreground">
                                  {project.lastUpdated}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex flex-col space-y-2">
                            <TooltipProvider>
                              <div className="flex items-center justify-center space-x-1 w-full">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        handlePreviewProject(project)
                                      }
                                    >
                                      <Eye className="w-4 h-4 text-purple-600" />
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
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        handleShareProject(project)
                                      }
                                    >
                                      <Share2 className="w-4 h-4 text-blue-600" />
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
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        handleDeleteProject(project)
                                      }
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete project</p>
                                  </TooltipContent>
                                </Tooltip>

                                <div className="w-px h-4 bg-border mx-1" />

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        handleVisitWebsite(project)
                                      }
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Visit website</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>

                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => handleStartReview(project.id)}
                            >
                              View Details
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
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
                  <CardDescription>
                    Overview of all project evaluations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Mock chart for Message */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">
                          M - Magnetic Captivation
                        </h3>
                        <span className="text-sm">78% Average</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary/20">
                        <div
                          className="h-full rounded-full bg-[hsl(0,85%,65%)]"
                          style={{ width: "78%" }}
                        />
                      </div>
                    </div>

                    {/* Mock chart for Attraction */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">
                          A - Authentic Connection
                        </h3>
                        <span className="text-sm">65% Average</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary/20">
                        <div
                          className="h-full rounded-full bg-[hsl(30,85%,65%)]"
                          style={{ width: "65%" }}
                        />
                      </div>
                    </div>

                    {/* Mock chart for Goal */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">G - GOLDEN Persuasion</h3>
                        <span className="text-sm">82% Average</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary/20">
                        <div
                          className="h-full rounded-full bg-[hsl(60,85%,65%)]"
                          style={{ width: "82%" }}
                        />
                      </div>
                    </div>

                    {/* Mock chart for Navigation */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">
                          N - Niche-Precision Design
                        </h3>
                        <span className="text-sm">71% Average</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary/20">
                        <div
                          className="h-full rounded-full bg-[hsl(120,85%,65%)]"
                          style={{ width: "71%" }}
                        />
                      </div>
                    </div>

                    {/* Mock chart for Experience */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">E - Elegant Experience</h3>
                        <span className="text-sm">89% Average</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary/20">
                        <div
                          className="h-full rounded-full bg-[hsl(200,85%,65%)]"
                          style={{ width: "89%" }}
                        />
                      </div>
                    </div>

                    {/* Mock chart for Trust */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">T - Targeted Dominance</h3>
                        <span className="text-sm">76% Average</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary/20">
                        <div
                          className="h-full rounded-full bg-[hsl(270,85%,65%)]"
                          style={{ width: "76%" }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      ) : (
        // Workspace Tab (Annotation Interface)
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <div className="w-[350px] border-r bg-card">
            <MagnetReviewPanel projectId={selectedProject || ""} />
          </div>
          <div className="flex-1 relative">
            <AnnotationWorkspace projectId={selectedProject || ""} />
          </div>
        </div>
      )}

      {/* New Project Dialog */}
      <Dialog
        open={showNewProjectDialog}
        onOpenChange={setShowNewProjectDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter the details for your new website review project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project-name" className="text-right">
                Project Name
              </Label>
              <Input
                id="project-name"
                placeholder="E.g. Client Website Review"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website-url" className="text-right">
                Website URL
              </Label>
              <Input
                id="website-url"
                placeholder="https://example.com"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client-name" className="text-right">
                Client Name
              </Label>
              <Input
                id="client-name"
                placeholder="Client or Company Name"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client-email" className="text-right">
                Client Email
              </Label>
              <Input
                id="client-email"
                type="email"
                placeholder="client@example.com"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project-status" className="text-right">
                Status
              </Label>
              <Select defaultValue="active">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="project-description"
                placeholder="Brief description of the project"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewProjectDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Preview</DialogTitle>
            <DialogDescription>
              {previewProject?.name} - {previewProject?.url}
            </DialogDescription>
          </DialogHeader>
          {previewProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Project Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Client:</span>{" "}
                      {previewProject.clientName}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {previewProject.status}
                    </p>
                    <p>
                      <span className="font-medium">Progress:</span>{" "}
                      {previewProject.progress}%
                    </p>
                    <p>
                      <span className="font-medium">Last Updated:</span>{" "}
                      {previewProject.lastUpdated}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">MAGNET Scores</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Message:</span>
                      <span>78%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Attraction:</span>
                      <span>65%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Goal:</span>
                      <span>82%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Navigation:</span>
                      <span>71%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Experience:</span>
                      <span>89%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Trust:</span>
                      <span>76%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Screenshots & Recordings</h4>
                <p className="text-sm text-muted-foreground">
                  No screenshots or recordings available for this project.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreviewDialog(false)}
            >
              Close
            </Button>
            <Button onClick={() => handleStartReview(previewProject?.id)}>
              Open Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share Project</DialogTitle>
            <DialogDescription>
              Generate shareable links for {shareProject?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Share Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="screenshots" defaultChecked />
                  <Label htmlFor="screenshots">Screenshots</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="recordings" defaultChecked />
                  <Label htmlFor="recordings">Screen Recordings</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="responses" defaultChecked />
                  <Label htmlFor="responses">Review Responses & Scores</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Shareable Link</Label>
              <div className="flex space-x-2">
                <Input
                  value={`${window.location.origin}/project/${shareProject?.id}/share`}
                  readOnly
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${window.location.origin}/project/${shareProject?.id}/share`,
                    )
                  }
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Close
            </Button>
            <Button onClick={() => setShowShareDialog(false)}>
              Generate Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
