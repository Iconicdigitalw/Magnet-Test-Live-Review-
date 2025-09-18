import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

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

interface ProjectDialogsProps {
  // New Project Dialog
  showNewProjectDialog: boolean;
  setShowNewProjectDialog: (show: boolean) => void;
  onCreateProject: (projectData: NewProjectData) => void;

  // Preview Dialog
  showPreviewDialog: boolean;
  setShowPreviewDialog: (show: boolean) => void;
  previewProject: Project | null;
  onStartReview: (projectId: string) => void;

  // Share Dialog
  showShareDialog: boolean;
  setShowShareDialog: (show: boolean) => void;
  shareProject: Project | null;
}

const ProjectDialogs: React.FC<ProjectDialogsProps> = ({
  showNewProjectDialog,
  setShowNewProjectDialog,
  onCreateProject,
  showPreviewDialog,
  setShowPreviewDialog,
  previewProject,
  onStartReview,
  showShareDialog,
  setShowShareDialog,
  shareProject,
}) => {
  const [formData, setFormData] = useState<NewProjectData>({
    name: "",
    url: "",
    clientName: "",
    clientEmail: "",
    status: "active",
    description: "",
  });

  const handleInputChange = (field: keyof NewProjectData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log("Form submission started", formData);

    // Basic validation with user feedback
    const errors = [];
    if (!formData.name.trim()) {
      errors.push("Project name is required");
    }
    if (!formData.url.trim()) {
      errors.push("Website URL is required");
    }
    if (!formData.clientName.trim()) {
      errors.push("Client name is required");
    }

    // Validate URL format
    if (formData.url.trim() && !isValidUrl(formData.url.trim())) {
      errors.push("Please enter a valid URL (e.g., https://example.com)");
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    try {
      console.log("Calling onCreateProject with:", formData);
      onCreateProject(formData);

      // Reset form
      setFormData({
        name: "",
        url: "",
        clientName: "",
        clientEmail: "",
        status: "active",
        description: "",
      });

      console.log("Project creation completed successfully");
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  // URL validation helper function
  const isValidUrl = (string: string) => {
    try {
      // Add protocol if missing
      const url = string.startsWith("http") ? string : `https://${string}`;
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Auto-format URL on blur
  const handleUrlBlur = (value: string) => {
    if (value && !value.startsWith("http")) {
      const formattedUrl = `https://${value}`;
      handleInputChange("url", formattedUrl);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setShowNewProjectDialog(open);
    if (!open) {
      // Reset form when dialog closes
      setFormData({
        name: "",
        url: "",
        clientName: "",
        clientEmail: "",
        status: "active",
        description: "",
      });
    }
  };
  return (
    <>
      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={handleDialogClose}>
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
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
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
                value={formData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                onBlur={(e) => handleUrlBlur(e.target.value)}
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
                value={formData.clientName}
                onChange={(e) =>
                  handleInputChange("clientName", e.target.value)
                }
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
                value={formData.clientEmail}
                onChange={(e) =>
                  handleInputChange("clientEmail", e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project-status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
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
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogClose(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.name.trim() ||
                !formData.url.trim() ||
                !formData.clientName.trim()
              }
              className="bg-black text-white hover:bg-gray-800"
            >
              Create Project
            </Button>
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
            <Button onClick={() => onStartReview(previewProject?.id || "")}>
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
    </>
  );
};

export default ProjectDialogs;
