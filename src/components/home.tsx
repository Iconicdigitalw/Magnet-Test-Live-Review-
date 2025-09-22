import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Settings, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import AnnotationWorkspace from "./AnnotationWorkspace";
import MagnetReviewPanel from "./MagnetReviewPanel";
import DashboardStats from "./dashboard/DashboardStats";
import RecentProjects from "./dashboard/RecentProjects";
import RecentActivity from "./dashboard/RecentActivity";
import ProjectCard from "./projects/ProjectCard";
import ProjectDialogs from "./projects/ProjectDialogs";
import MagnetReports from "./reports/MagnetReports";
import { useProjectActions } from "@/hooks/useProjectActions";
import {
  mockProjects as initialProjects,
  mockActivities,
  type Project,
} from "@/data/mockData";

const Home = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [shareProject, setShareProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const projectActions = useProjectActions();

  // Function to handle project deletion
  const handleDeleteProject = (project: Project) => {
    projectActions.handleDeleteProject(project, (projectId: string) => {
      setProjects((prevProjects) =>
        prevProjects.filter((p) => p.id !== projectId),
      );
    });
  };

  // Function to handle starting a review
  const handleStartReview = (projectId: string) => {
    setSelectedProject(projectId);
    setActiveTab("workspace");
  };

  // Function to handle creating a new project
  const handleCreateProject = (projectData: {
    name: string;
    url: string;
    clientName: string;
    clientEmail: string;
    status: string;
    description: string;
  }) => {
    console.log("handleCreateProject called with:", projectData);

    try {
      const newProject = projectActions.handleCreateProject(
        projectData,
        (project) => {
          console.log("Project created successfully:", project);

          // Add the new project to the state
          setProjects((prevProjects) => {
            const updatedProjects = [project, ...prevProjects];
            console.log("Updated projects list:", updatedProjects);
            return updatedProjects;
          });

          // Close the dialog
          setShowNewProjectDialog(false);

          // Redirect to the review page for the new project
          setSelectedProject(project.id);
          setActiveTab("workspace");

          console.log("Redirecting to workspace for project:", project.id);
        },
      );

      console.log("handleCreateProject completed");
    } catch (error) {
      console.error("Error in handleCreateProject:", error);
    }
  };

  // Function to navigate to admin settings
  const handleNavigateToSettings = () => {
    window.location.href = "/admin/settings";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation - Hidden in workspace mode */}
      {activeTab !== "workspace" && (
        <header className="border-b bg-card">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">
                MAGNET Test<sup className="text-xs">TM</sup> Live
              </h1>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleNavigateToSettings}>
                    <Settings className="mr-2 h-4 w-4" />
                    Edit MAGNET Questionnaire
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <span className="text-muted-foreground">
                      More settings coming soon...
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
      )}

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
              <DashboardStats projects={projects} />

              {/* Recent Projects and Activity */}
              <div className="grid gap-4 md:grid-cols-2">
                <RecentProjects
                  projects={projects}
                  onStartReview={handleStartReview}
                  onViewAllProjects={() => setActiveTab("projects")}
                />
                <RecentActivity activities={mockActivities} />
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
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onStartReview={handleStartReview}
                        onPreview={(project) =>
                          projectActions.handlePreviewProject(
                            project,
                            setPreviewProject,
                            setShowPreviewDialog,
                          )
                        }
                        onShare={(project) =>
                          projectActions.handleShareProject(
                            project,
                            setShareProject,
                            setShowShareDialog,
                          )
                        }
                        onDownload={projectActions.handleDownloadProject}
                        onDelete={handleDeleteProject}
                        onVisitWebsite={projectActions.handleVisitWebsite}
                      />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="active" className="mt-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects
                      .filter((p) => p.status === "active")
                      .map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onStartReview={handleStartReview}
                          onPreview={(project) =>
                            projectActions.handlePreviewProject(
                              project,
                              setPreviewProject,
                              setShowPreviewDialog,
                            )
                          }
                          onShare={(project) =>
                            projectActions.handleShareProject(
                              project,
                              setShareProject,
                              setShowShareDialog,
                            )
                          }
                          onDownload={projectActions.handleDownloadProject}
                          onDelete={handleDeleteProject}
                          onVisitWebsite={projectActions.handleVisitWebsite}
                        />
                      ))}
                  </div>
                </TabsContent>
                <TabsContent value="completed" className="mt-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects
                      .filter((p) => p.status === "completed")
                      .map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onStartReview={handleStartReview}
                          onPreview={(project) =>
                            projectActions.handlePreviewProject(
                              project,
                              setPreviewProject,
                              setShowPreviewDialog,
                            )
                          }
                          onShare={(project) =>
                            projectActions.handleShareProject(
                              project,
                              setShareProject,
                              setShowShareDialog,
                            )
                          }
                          onDownload={projectActions.handleDownloadProject}
                          onDelete={handleDeleteProject}
                          onVisitWebsite={projectActions.handleVisitWebsite}
                        />
                      ))}
                  </div>
                </TabsContent>
                <TabsContent value="archived" className="mt-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects
                      .filter((p) => p.status === "archived")
                      .map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onStartReview={handleStartReview}
                          onPreview={(project) =>
                            projectActions.handlePreviewProject(
                              project,
                              setPreviewProject,
                              setShowPreviewDialog,
                            )
                          }
                          onShare={(project) =>
                            projectActions.handleShareProject(
                              project,
                              setShareProject,
                              setShowShareDialog,
                            )
                          }
                          onDownload={projectActions.handleDownloadProject}
                          onDelete={handleDeleteProject}
                          onVisitWebsite={projectActions.handleVisitWebsite}
                        />
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && <MagnetReports />}
        </main>
      ) : (
        // Workspace Tab (Annotation Interface)
        <div className="h-screen overflow-hidden">
          <AnnotationWorkspace
            url={
              selectedProject
                ? projects.find((p) => p.id === selectedProject)?.url ||
                  "https://example.com"
                : "https://example.com"
            }
            projectId={selectedProject || ""}
            onTabChange={(tabId) => {
              console.log("Active MAGNET tab changed to:", tabId);
            }}
            onNavigateHome={() => setActiveTab("dashboard")}
            onNavigateProjects={() => setActiveTab("projects")}
            onNavigateReports={() => setActiveTab("reports")}
          />
        </div>
      )}

      {/* All Dialogs */}
      <ProjectDialogs
        showNewProjectDialog={showNewProjectDialog}
        setShowNewProjectDialog={setShowNewProjectDialog}
        onCreateProject={handleCreateProject}
        showPreviewDialog={showPreviewDialog}
        setShowPreviewDialog={setShowPreviewDialog}
        previewProject={previewProject}
        onStartReview={handleStartReview}
        showShareDialog={showShareDialog}
        setShowShareDialog={setShowShareDialog}
        shareProject={shareProject}
      />
    </div>
  );
};

export default Home;
