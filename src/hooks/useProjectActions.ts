import { useToast } from "@/components/ui/use-toast";

interface Project {
  id: string;
  name: string;
  url: string;
  clientName: string;
  status: string;
  lastUpdated: string;
  progress: number;
}

interface NewProjectData {
  name: string;
  url: string;
  clientName: string;
  clientEmail: string;
  status: string;
  description: string;
}

export const useProjectActions = () => {
  const { toast } = useToast();

  const handlePreviewProject = (
    project: Project,
    setPreviewProject: (project: Project) => void,
    setShowPreviewDialog: (show: boolean) => void,
  ) => {
    setPreviewProject(project);
    setShowPreviewDialog(true);
  };

  const handleShareProject = (
    project: Project,
    setShareProject: (project: Project) => void,
    setShowShareDialog: (show: boolean) => void,
  ) => {
    setShareProject(project);
    setShowShareDialog(true);
    const shareUrl = `${window.location.origin}/project/${project.id}/share`;

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
          toast({
            title: "Copy manually",
            description: "Please copy the link from the share dialog.",
            variant: "destructive",
          });
        });
    } else {
      toast({
        title: "Copy manually",
        description: "Please copy the link from the share dialog.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadProject = (project: Project) => {
    try {
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

      toast({
        title: "Download started",
        description: `"${project.name}" export has been downloaded.`,
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the project.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = (
    project: Project,
    onProjectDeleted?: (projectId: string) => void,
  ) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      )
    ) {
      console.log(`Deleting project: ${project.id}`);

      // Remove from localStorage
      try {
        const existingProjects = JSON.parse(
          localStorage.getItem("magnet-projects") || "[]",
        );
        const updatedProjects = existingProjects.filter(
          (p: Project) => p.id !== project.id,
        );
        localStorage.setItem(
          "magnet-projects",
          JSON.stringify(updatedProjects),
        );
      } catch (storageError) {
        console.error(
          "Error removing project from localStorage:",
          storageError,
        );
      }

      // Call the callback to remove the project from the UI
      if (onProjectDeleted) {
        onProjectDeleted(project.id);
      }

      toast({
        title: "Project deleted",
        description: `"${project.name}" has been deleted successfully.`,
      });
    }
  };

  const handleViewReport = (project: Project) => {
    window.location.href = `/project/${project.id}/report`;
  };

  const handleCreateProject = (
    projectData: NewProjectData,
    onProjectCreated: (project: Project) => void,
  ) => {
    try {
      // Generate a unique ID for the new project with timestamp and random component
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const newProject: Project = {
        id: `project-${timestamp}-${randomId}`,
        name: projectData.name,
        url: projectData.url,
        clientName: projectData.clientName,
        status: projectData.status,
        lastUpdated: new Date().toISOString().split("T")[0],
        progress: 0,
      };

      // Save to localStorage immediately
      try {
        const existingProjects = JSON.parse(
          localStorage.getItem("magnet-projects") || "[]",
        );
        const updatedProjects = [newProject, ...existingProjects];
        localStorage.setItem(
          "magnet-projects",
          JSON.stringify(updatedProjects),
        );
        
        // Initialize empty notes storage for this project
        const projectNotesKey = `magnet-project-reviews-${newProject.id}`;
        localStorage.setItem(projectNotesKey, JSON.stringify([]));
        
        console.log(`Created new project with unique ID: ${newProject.id}`);
      } catch (storageError) {
        console.error("Error saving project to localStorage:", storageError);
      }

      // Call the callback to add the project to the state
      onProjectCreated(newProject);

      toast({
        title: "Project created successfully!",
        description: `"${projectData.name}" has been created with ID ${newProject.id} and is ready for review.`,
        duration: 3000,
      });

      return newProject;
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Failed to create project",
        description:
          "There was an error creating the project. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      return null;
    }
  };

  return {
    handlePreviewProject,
    handleShareProject,
    handleDownloadProject,
    handleDeleteProject,
    handleViewReport,
    handleCreateProject,
  };
};