import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Maximize2,
  Minimize2,
  Pen,
  Camera,
  Video,
  Square,
  Circle,
  Type,
  ArrowUpRight,
  Download,
  Play,
  Pause,
  StopCircle,
  Zap,
  X,
  ZoomIn,
  ZoomOut,
  Home,
  FolderOpen,
  BarChart3,
  MousePointer,
  Pencil,
  Highlighter,
  Eraser,
  Undo,
  Redo,
  Trash2,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import LiveAnnotationOverlay from "./LiveAnnotationOverlay";
import MagnetReviewPanel from "./MagnetReviewPanel";
import { toast } from "@/components/ui/use-toast";

interface AnnotationWorkspaceProps {
  url?: string;
  projectId?: string;
  reviewId?: string;
  currentTab?: string;
  onTabChange?: (tabId: string) => void;
  onNavigateHome?: () => void;
  onNavigateProjects?: () => void;
  onNavigateReports?: () => void;
}

const deviceSizes = [
  {
    id: "widescreen",
    name: "Widescreen",
    width: 1920,
    height: 1080,
    icon: <Monitor className="h-4 w-4" />,
  },
  {
    id: "desktop",
    name: "Desktop",
    width: 1366,
    height: 768,
    icon: <Monitor className="h-4 w-4" />,
  },
  {
    id: "laptop",
    name: "Laptop",
    width: 1280,
    height: 800,
    icon: <Laptop className="h-4 w-4" />,
  },
  {
    id: "tablet",
    name: "Tablet",
    width: 768,
    height: 1024,
    icon: <Tablet className="h-4 w-4" />,
  },
  {
    id: "mobile",
    name: "Mobile",
    width: 375,
    height: 812,
    icon: <Smartphone className="h-4 w-4" />,
  },
];

const zoomLevels = [0.25, 0.5, 0.75, 1.0];

// Predefined colors for annotation tools
const ANNOTATION_COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Black", value: "#000000" },
];

const AnnotationWorkspace: React.FC<AnnotationWorkspaceProps> = ({
  url = "https://example.com",
  projectId = "project-1",
  reviewId = "review-1",
  currentTab = "M",
  onTabChange = () => {},
  onNavigateHome = () => {},
  onNavigateProjects = () => {},
  onNavigateReports = () => {},
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>(url);
  const [inputUrl, setInputUrl] = useState<string>(url);
  const [selectedDevice, setSelectedDevice] = useState<string>("desktop");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scrollPosition, setScrollPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [activeAnnotationTool, setActiveAnnotationTool] =
    useState<string>("pen");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [annotationTool, setAnnotationTool] = useState<string>("#22c55e");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [isMagnetPanelOpen, setIsMagnetPanelOpen] = useState<boolean>(false);
  const [magnetActiveTab, setMagnetActiveTab] = useState<string>(currentTab);
  const [zoomLevel, setZoomLevel] = useState<number>(0.75);
  const [isAnnotationMode, setIsAnnotationMode] = useState<boolean>(true);
  const [annotations, setAnnotations] = useState<any>(null);
  const [isAnnotationToolboxOpen, setIsAnnotationToolboxOpen] =
    useState<boolean>(true);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentDevice =
    deviceSizes.find((device) => device.id === selectedDevice) ||
    deviceSizes[1];

  // Calculate scaled dimensions
  const scaledWidth = Math.round(currentDevice.width * zoomLevel);
  const scaledHeight = Math.round(currentDevice.height * zoomLevel);

  // Handle URL navigation
  const navigateToUrl = () => {
    if (inputUrl) {
      setIsLoading(true);
      setCurrentUrl(inputUrl);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigateToUrl();
    }
  };

  const handleGoBack = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.history.back();
      }
    } catch (error) {
      console.log("Could not navigate back due to cross-origin restrictions");
    }
  };

  const handleGoForward = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.history.forward();
      }
    } catch (error) {
      console.log(
        "Could not navigate forward due to cross-origin restrictions",
      );
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      // Force a complete reload by setting src to empty first
      iframeRef.current.src = "about:blank";
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentUrl;
        }
      }, 100);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleMagnetPanel = () => {
    setIsMagnetPanelOpen(!isMagnetPanelOpen);
  };

  const handleMagnetTabChange = (tabId: string) => {
    setMagnetActiveTab(tabId);
    onTabChange(tabId);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoomLevel);
    if (currentIndex < zoomLevels.length - 1) {
      setZoomLevel(zoomLevels[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoomLevel);
    if (currentIndex > 0) {
      setZoomLevel(zoomLevels[currentIndex - 1]);
    }
  };

  const handleZoomReset = () => {
    setZoomLevel(1.0);
  };

  // Annotation tool handlers
  const handleAnnotationTool = (tool: string) => {
    setActiveAnnotationTool(tool);
    setAnnotationTool(tool);
    setIsAnnotationMode(true);

    // Provide user feedback about tool behavior
    const toolMessages = {
      select: "Select mode - you can interact with the website normally",
      pen: "Pen tool - click and drag to draw on the website",
      highlighter: "Highlighter tool - click and drag to highlight areas",
      text: "Text tool - click anywhere to add text annotations",
      arrow: "Arrow tool - click and drag to draw arrows",
      rectangle: "Rectangle tool - click and drag to draw rectangles",
      eraser: "Eraser tool - click on annotations to remove them",
    };

    toast({
      title: `${tool.charAt(0).toUpperCase() + tool.slice(1)} tool selected`,
      description:
        toolMessages[tool as keyof typeof toolMessages] ||
        `You can now use the ${tool} tool to annotate the website.`,
      duration: 3000,
    });
  };

  // Toggle annotation mode
  const toggleAnnotationMode = () => {
    setIsAnnotationMode(!isAnnotationMode);
    if (!isAnnotationMode) {
      setIsAnnotationToolboxOpen(true);
      toast({
        title: "Annotation mode enabled",
        description:
          "You can now annotate the website. Use the tools panel on the left.",
        duration: 3000,
      });
    }
  };

  const toggleAnnotationToolbox = () => {
    setIsAnnotationToolboxOpen(!isAnnotationToolboxOpen);
  };

  // Handle annotation changes
  const handleAnnotationChange = (newAnnotations: any) => {
    setAnnotations(newAnnotations);
    // Auto-save annotations to localStorage
    try {
      const storageKey = `annotations-${projectId}-${reviewId}-${magnetActiveTab}`;
      localStorage.setItem(storageKey, JSON.stringify(newAnnotations));
    } catch (error) {
      console.error("Failed to save annotations:", error);
    }
  };

  // Load saved annotations
  useEffect(() => {
    try {
      const storageKey = `annotations-${projectId}-${reviewId}-${magnetActiveTab}`;
      const savedAnnotations = localStorage.getItem(storageKey);
      if (savedAnnotations) {
        setAnnotations(JSON.parse(savedAnnotations));
      }
    } catch (error) {
      console.error("Failed to load annotations:", error);
    }
  }, [projectId, reviewId, magnetActiveTab]);

  // Screen capture handler
  const handleScreenCapture = async () => {
    try {
      // Show loading toast
      toast({
        title: "Capturing screenshot",
        description: "Please wait while we capture the current view...",
        duration: 2000,
      });

      // Use html2canvas or similar approach for cross-origin iframe capture
      if (iframeRef.current) {
        // For demo purposes, we'll create a canvas with the iframe dimensions
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Set canvas dimensions to match the iframe
          canvas.width = currentDevice.width;
          canvas.height = currentDevice.height;

          // In a real implementation, we would use html2canvas or a similar library
          // to capture the iframe content, but for now we'll simulate it
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.font = "20px Arial";
          ctx.fillStyle = "#000000";
          ctx.fillText(`Screenshot of ${currentUrl}`, 20, 40);
          ctx.fillText(`Captured at ${new Date().toLocaleString()}`, 20, 70);

          // Create download link
          const link = document.createElement("a");
          link.download = `screenshot-${Date.now()}.png`;
          link.href = canvas.toDataURL();
          link.click();

          toast({
            title: "Screenshot captured",
            description:
              "The screenshot has been saved to your downloads folder.",
            duration: 3000,
          });
        }
      }
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      toast({
        title: "Screenshot failed",
        description:
          "There was an error capturing the screenshot. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Screen recording handlers
  const startRecording = async () => {
    try {
      // Request screen capture permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" },
        audio: true,
      });

      // Handle user canceling the screen selection dialog
      if (!stream) {
        return;
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
          ? "video/webm; codecs=vp9"
          : "video/webm",
      });

      const chunks: BlobPart[] = [];

      // Listen for data available event
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      // Listen for stream end events
      stream.getVideoTracks()[0].onended = () => {
        if (recorder && recorder.state !== "inactive") {
          recorder.stop();
          setIsRecording(false);
          setMediaRecorder(null);
        }
      };

      // Handle recording stop
      recorder.onstop = () => {
        // Create a blob from the recorded chunks
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);

        // Create and trigger download
        const link = document.createElement("a");
        link.href = url;
        link.download = `magnet-review-${Date.now()}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        URL.revokeObjectURL(url);
        stream.getTracks().forEach((track) => track.stop());

        toast({
          title: "Recording saved",
          description:
            "Your screen recording has been saved to your downloads folder.",
          duration: 3000,
        });
      };

      // Start recording with 1 second chunks
      recorder.start(1000);
      setMediaRecorder(recorder);
      setIsRecording(true);

      toast({
        title: "Recording started",
        description:
          "Your screen is now being recorded. Click the stop button when finished.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording failed",
        description:
          "There was an error starting the recording. Please check your permissions and try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);

      toast({
        title: "Recording stopped",
        description: "Processing your recording...",
        duration: 2000,
      });
    }
  };

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false);

    // Try to get the current URL from the iframe
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const iframeUrl = iframeRef.current.contentWindow.location.href;
        setInputUrl(iframeUrl);
        setCurrentUrl(iframeUrl);

        // Prevent infinite reloads by checking if the URL has changed unexpectedly
        if (iframeUrl !== currentUrl && !iframeUrl.includes("about:blank")) {
          console.log("URL changed to:", iframeUrl);
        }
      }
    } catch (error) {
      // Cross-origin restrictions might prevent accessing the URL
      console.log(
        "Could not access iframe URL due to cross-origin restrictions",
      );
    }

    // Add error handling for problematic websites
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        // Prevent the iframe from navigating the parent window
        iframeRef.current.contentWindow.addEventListener(
          "beforeunload",
          (e) => {
            e.preventDefault();
            return false;
          },
        );

        // Prevent popup behavior that might cause reloading
        iframeRef.current.contentWindow.addEventListener("error", (e) => {
          console.log("Iframe content error prevented:", e);
          e.preventDefault();
        });
      }
    } catch (error) {
      console.log(
        "Could not add iframe event listeners due to cross-origin restrictions",
      );
    }
  };

  // Enhanced iframe scroll events with polling fallback for cross-origin sites
  useEffect(() => {
    let scrollListener: (() => void) | null = null;
    let scrollPollInterval: NodeJS.Timeout | null = null;
    let lastScrollX = 0;
    let lastScrollY = 0;
    let isIframeReady = false;
    let rafId: number | null = null;
    const scheduleUpdate = (x: number, y: number) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setScrollPosition({ x, y });
      });
    };

    const handleIframeScroll = () => {
      try {
        if (
          iframeRef.current &&
          iframeRef.current.contentWindow &&
          isIframeReady
        ) {
          const { scrollX, scrollY } = iframeRef.current.contentWindow;
          if (scrollX !== lastScrollX || scrollY !== lastScrollY) {
            lastScrollX = scrollX;
            lastScrollY = scrollY;
            scheduleUpdate(scrollX, scrollY);
          }
        }
      } catch (error) {
        // Cross-origin restrictions might prevent accessing scroll position
        // Use polling as fallback
      }
    };

    // Wait for iframe to be ready before setting up scroll tracking
    const setupScrollTracking = () => {
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          // Test if we can access the content window
          const testAccess = iframeRef.current.contentWindow.location;

          // If we get here, we have access - set up direct event listener
          iframeRef.current.contentWindow.addEventListener(
            "scroll",
            handleIframeScroll,
            { passive: true },
          );
          scrollListener = handleIframeScroll;
          isIframeReady = true;

          // Initial scroll position check
          handleIframeScroll();
        }
      } catch (error) {
        // Cross-origin restrictions - use polling fallback
        console.log(
          "Using polling fallback for scroll tracking due to cross-origin restrictions",
        );
        isIframeReady = true;
        scrollPollInterval = setInterval(handleIframeScroll, 50); // More frequent polling
      }
    };

    // Set up scroll tracking after a short delay to ensure iframe is loaded
    const timeoutId = setTimeout(setupScrollTracking, 500);

    // Handle iframe resize events to reposition annotations
    const handleResize = () => {
      if (iframeRef.current && isIframeReady) {
        // Force a scroll position update on resize
        handleIframeScroll();
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);

      if (scrollListener) {
        try {
          if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.removeEventListener(
              "scroll",
              scrollListener,
            );
          }
        } catch (error) {
          console.log(
            "Could not remove scroll listener due to cross-origin restrictions",
          );
        }
      }

      if (scrollPollInterval) {
        clearInterval(scrollPollInterval);
      }

      window.removeEventListener("resize", handleResize);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
  }, [currentUrl, isLoading]);

  // Get color for MAGNET tab
  const getTabColor = (tabId: string) => {
    const colors: Record<string, string> = {
      M: "#ef4444", // Red
      A: "#3b82f6", // Blue
      G: "#eab308", // Yellow
      N: "#22c55e", // Green
      E: "#a855f7", // Purple
      T: "#f97316", // Orange
    };
    return colors[tabId] || "#22c55e";
  };

  return (
    <div
      className="flex flex-col w-full h-full bg-background"
      ref={containerRef}
    >
      {/* Consolidated Navigation Bar */}
      <div className="flex items-center gap-2 p-2 border-b bg-background">
        {/* App Navigation */}
        <div className="flex items-center gap-1">
          <h1 className="text-lg font-bold mr-3">MAGNET Review</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={onNavigateHome}>
                  <Home className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Dashboard</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={onNavigateProjects}>
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Projects</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={onNavigateReports}>
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reports</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-px h-6 bg-border mx-2" />
        </div>

        {/* Browser Controls */}
        {/* Left side - Browser controls */}
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleGoBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Go back</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleGoForward}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Go forward</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* URL input - more compact */}
        <div className="flex items-center flex-1 max-w-md mx-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-2 py-1 text-xs border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Enter website URL"
          />
          <Button
            onClick={navigateToUrl}
            size="sm"
            className="rounded-l-none text-xs px-2"
          >
            Go
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoomLevel === zoomLevels[0]}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="text-xs font-medium min-w-[3rem] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoomLevel === zoomLevels[zoomLevels.length - 1]}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-px h-6 bg-border mx-1" />
        </div>

        {/* Annotation & Review Tools */}
        <div className="flex items-center">
          {/* MAGNET Review Panel Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isMagnetPanelOpen ? "default" : "ghost"}
                  size="sm"
                  onClick={toggleMagnetPanel}
                >
                  <Zap className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isMagnetPanelOpen
                  ? "Close MAGNET Review"
                  : "Open MAGNET Review"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Annotation Mode Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isAnnotationMode ? "default" : "ghost"}
                  size="sm"
                  onClick={toggleAnnotationMode}
                  className={
                    isAnnotationMode ? "bg-primary text-primary-foreground" : ""
                  }
                >
                  <Pen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isAnnotationMode
                  ? "Disable Annotations"
                  : "Enable Annotations"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isAnnotationMode && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isAnnotationToolboxOpen ? "default" : "ghost"}
                    size="sm"
                    onClick={toggleAnnotationToolbox}
                    className={
                      isAnnotationToolboxOpen
                        ? "bg-primary text-primary-foreground"
                        : ""
                    }
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isAnnotationToolboxOpen
                    ? "Hide Annotation Tools"
                    : "Show Annotation Tools"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Screen Capture */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Camera className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={handleScreenCapture}>
                <Camera className="h-4 w-4 mr-2" />
                Capture Screenshot
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast({
                    title: "Coming soon",
                    description:
                      "Area capture will be available in a future update.",
                    duration: 3000,
                  });
                }}
              >
                <Square className="h-4 w-4 mr-2" />
                Capture Area
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast({
                    title: "Coming soon",
                    description:
                      "Element capture will be available in a future update.",
                    duration: 3000,
                  });
                }}
              >
                <Circle className="h-4 w-4 mr-2" />
                Capture Element
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Screen Recorder */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Video
                  className={`h-4 w-4 ${isRecording ? "text-red-500" : ""}`}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {!isRecording ? (
                <>
                  <DropdownMenuItem onClick={startRecording}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Recording
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      toast({
                        title: "Coming soon",
                        description:
                          "Area recording will be available in a future update.",
                        duration: 3000,
                      });
                    }}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Record Area
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={stopRecording}>
                    <StopCircle className="h-4 w-4 mr-2 text-red-500" />
                    Stop Recording
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <Circle className="h-4 w-4 mr-2 text-red-500 animate-pulse" />
                    Recording...
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right side - Device selector and fullscreen */}
        <div className="flex items-center gap-1 ml-auto">
          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Device" />
            </SelectTrigger>
            <SelectContent>
              {deviceSizes.map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  <div className="flex items-center gap-2">
                    {device.icon}
                    <span className="text-xs">{device.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      {/* Viewport container */}
      <div className="relative flex-1">
        <div
          className={`flex justify-center items-start overflow-auto h-full ${isFullscreen ? "bg-gray-900 p-0" : "bg-gray-100 p-4"}`}
        >
          <div
            className={`relative bg-white ${isFullscreen ? "" : "shadow-lg"}`}
            style={{
              width: isFullscreen ? "100vw" : `${scaledWidth}px`,
              height: isFullscreen ? "100vh" : `${scaledHeight}px`,
              maxWidth: isFullscreen ? "100vw" : "100%",
              maxHeight: isFullscreen ? "100vh" : "100%",
              overflow: "hidden",
              transform: isFullscreen ? "none" : `scale(1)`,
            }}
          >
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Website iframe */}
            <iframe
              ref={iframeRef}
              src={currentUrl}
              onLoad={handleIframeLoad}
              className="w-full h-full border-0"
              style={{
                width: isFullscreen ? "100vw" : `${currentDevice.width}px`,
                height: isFullscreen ? "100vh" : `${currentDevice.height}px`,
                transform: isFullscreen ? "none" : `scale(${zoomLevel})`,
                transformOrigin: "top left",
              }}
              sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation allow-popups allow-modals allow-downloads"
              allow="fullscreen; camera; microphone; geolocation; payment; autoplay; clipboard-read; clipboard-write"
              referrerPolicy="no-referrer-when-downgrade"
              onError={(e) => {
                console.error("Iframe error:", e);
                setIsLoading(false);
              }}
            />

            {/* Annotation overlay */}
            <LiveAnnotationOverlay
              reviewId={reviewId}
              tabId={magnetActiveTab}
              tabColor={getTabColor(magnetActiveTab)}
              width={isFullscreen ? window.innerWidth : currentDevice.width}
              height={isFullscreen ? window.innerHeight : currentDevice.height}
              scrollTop={scrollPosition.y}
              scrollLeft={scrollPosition.x}
              zoomLevel={isFullscreen ? 1.0 : zoomLevel}
              isVisible={isAnnotationMode}
              iframeRef={iframeRef}
              onAnnotationChange={handleAnnotationChange}
              activeTool={activeAnnotationTool}
              selectedColor={annotationTool}
              onToolChange={(tool) => setActiveAnnotationTool(tool)}
              onColorChange={(color) => setAnnotationTool(color)}
            />
          </div>
        </div>

        {/* Floating MAGNET Review Panel */}
        {isMagnetPanelOpen && (
          <>
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/20 z-40"
              onClick={toggleMagnetPanel}
            />

            {/* Floating Panel */}
            <div className="absolute left-4 top-4 bottom-4 w-[380px] z-50 animate-in slide-in-from-left-4 duration-300">
              <div className="bg-background border rounded-lg shadow-2xl h-full flex flex-col">
                {/* Panel Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">MAGNET Review</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMagnetPanel}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-hidden">
                  <MagnetReviewPanel
                    activeTab={magnetActiveTab}
                    projectId={projectId}
                    reviewId={reviewId}
                    onTabChange={handleMagnetTabChange}
                    onResponseSave={(tabId, questionId, answer, notes) => {
                      console.log("Response saved:", {
                        tabId,
                        questionId,
                        answer,
                        notes,
                      });
                    }}
                    onSubmit={(responses) => {
                      console.log("Review submitted:", responses);
                      toast({
                        title: "Review submitted!",
                        description:
                          "Your MAGNET review has been submitted successfully.",
                        duration: 5000,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Floating Annotation Toolbox */}
        {isAnnotationMode && isAnnotationToolboxOpen && (
          <div
            className={`absolute ${isMagnetPanelOpen ? "left-[400px]" : "left-4"} top-1/2 transform -translate-y-1/2 z-50 animate-in slide-in-from-left-4 duration-300`}
          >
            <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-2xl p-3 w-[70px]">
              {/* Toolbox Header */}
              <div className="text-xs font-medium text-muted-foreground mb-2 text-center">
                Tools
              </div>

              <TooltipProvider>
                {/* Tool Selection - Vertical Stack */}
                <div className="flex flex-col gap-2 mb-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          activeAnnotationTool === "select"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveAnnotationTool("select")}
                        className="h-8 w-full"
                      >
                        <MousePointer className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Select</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          activeAnnotationTool === "pen" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveAnnotationTool("pen")}
                        className="h-8 w-full"
                        style={
                          activeAnnotationTool === "pen"
                            ? {
                                backgroundColor: annotationTool,
                                color: "white",
                              }
                            : {}
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Pen</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          activeAnnotationTool === "highlighter"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveAnnotationTool("highlighter")}
                        className="h-8 w-full"
                        style={
                          activeAnnotationTool === "highlighter"
                            ? {
                                backgroundColor: annotationTool + "50",
                                color: annotationTool,
                              }
                            : {}
                        }
                      >
                        <Highlighter className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Highlighter</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          activeAnnotationTool === "text"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveAnnotationTool("text")}
                        className="h-8 w-full"
                      >
                        <Type className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Text</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          activeAnnotationTool === "arrow"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveAnnotationTool("arrow")}
                        className="h-8 w-full"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Arrow</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          activeAnnotationTool === "rectangle"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveAnnotationTool("rectangle")}
                        className="h-8 w-full"
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Rectangle</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          activeAnnotationTool === "eraser"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveAnnotationTool("eraser")}
                        className="h-8 w-full"
                      >
                        <Eraser className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Eraser</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Color Selection - Vertical */}
                <div className="mb-3">
                  <div className="text-xs font-medium text-muted-foreground mb-2 text-center">
                    Colors
                  </div>
                  <div className="flex flex-col gap-2 items-center">
                    {ANNOTATION_COLORS.map((color) => (
                      <Tooltip key={color.value}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setAnnotationTool(color.value)}
                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                              annotationTool === color.value
                                ? "border-foreground shadow-md"
                                : "border-border"
                            }`}
                            style={{ backgroundColor: color.value }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{color.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </TooltipProvider>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnotationWorkspace;
