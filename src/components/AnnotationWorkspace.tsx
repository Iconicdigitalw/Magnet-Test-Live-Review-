import React, { useState, useRef, useEffect } from "react";
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
  Camera,
  Video,
  Square,
  Circle,
  Play,
  Pause,
  StopCircle,
  Magnet,
  X,
  ZoomIn,
  ZoomOut,
  Home,
  FolderOpen,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [isMagnetPanelOpen, setIsMagnetPanelOpen] = useState<boolean>(false);
  const [isMagnetPanelMinimized, setIsMagnetPanelMinimized] =
    useState<boolean>(false);
  const [magnetActiveTab, setMagnetActiveTab] = useState<string>(currentTab);
  const [zoomLevel, setZoomLevel] = useState<number>(0.75);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [captureProgress, setCaptureProgress] = useState<{
    current: number;
    total: number;
    status: string;
  }>({ current: 0, total: 0, status: "" });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentDevice =
    deviceSizes.find((device) => device.id === selectedDevice) ||
    deviceSizes[1];

  const scaledWidth = Math.round(currentDevice.width * zoomLevel);
  const scaledHeight = Math.round(currentDevice.height * zoomLevel);

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
      iframeRef.current.src = "about:blank";
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentUrl;
        }
      }, 100);
    }
  };

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const toggleMagnetPanel = () => setIsMagnetPanelOpen(!isMagnetPanelOpen);
  const toggleMagnetPanelMinimize = () =>
    setIsMagnetPanelMinimized(!isMagnetPanelMinimized);

  const handleMagnetTabChange = (tabId: string) => {
    console.log(
      "AnnotationWorkspace: Tab change requested:",
      tabId,
      "Current:",
      magnetActiveTab,
    );
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

  // Screen capture handler - captures the current browser tab
  const handleScreenCapture = async () => {
    try {
      toast({
        title: "Requesting screen capture...",
        description:
          "Please select the current browser tab to capture the viewport.",
        duration: 3000,
      });

      // Request screen capture with tab-only constraints
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: "browser", // Prefer browser tab over entire screen
          width: { ideal: currentDevice.width },
          height: { ideal: currentDevice.height },
        },
        audio: false, // No audio needed for screenshots
        preferCurrentTab: true, // Chrome extension hint
      } as any);

      if (!stream) {
        throw new Error("No screen capture stream available");
      }

      // Create video element to capture frame
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Create canvas and capture frame
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      ctx.drawImage(video, 0, 0);

      // Stop the stream
      stream.getTracks().forEach((track) => track.stop());

      // Convert to blob and download
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const deviceName = currentDevice.name
              .toLowerCase()
              .replace(/\s+/g, "-");

            link.download = `magnet-viewport-${deviceName}-${timestamp}.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast({
              title: "Viewport captured!",
              description: `Screenshot saved as ${link.download}`,
              duration: 3000,
            });
          } else {
            throw new Error("Failed to create image blob");
          }
        },
        "image/png",
        0.95,
      );
    } catch (error) {
      console.error("Error capturing viewport:", error);

      let errorTitle = "Viewport capture failed";
      let errorMessage = "There was an error capturing the viewport.";
      let suggestions = "";

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorTitle = "Permission denied";
          errorMessage = "Screen capture permission was denied.";
          suggestions =
            "Please allow screen capture and select the current browser tab.";
        } else if (error.name === "NotSupportedError") {
          errorTitle = "Not supported";
          errorMessage = "Screen capture is not supported in this browser.";
          suggestions =
            "Please use Chrome, Firefox, or Edge for screen capture.";
        } else {
          errorMessage = "An unexpected error occurred during capture.";
          suggestions = "Please try again or refresh the page.";
        }
      }

      toast({
        title: errorTitle,
        description: `${errorMessage} ${suggestions}`,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Area capture - captures a selected area with user interaction
  const handleAreaCapture = async () => {
    try {
      toast({
        title: "Area capture mode",
        description:
          "Click and drag to select an area, then capture it using screen capture.",
        duration: 4000,
      });

      // Request screen capture for area selection
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: "browser",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
        preferCurrentTab: true,
      } as any);

      if (!stream) {
        throw new Error("No screen capture stream available");
      }

      // Create video element
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Create canvas for area capture
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      ctx.drawImage(video, 0, 0);

      // Stop the stream
      stream.getTracks().forEach((track) => track.stop());

      // For now, capture the center area (can be enhanced with selection UI later)
      const centerX = canvas.width * 0.25;
      const centerY = canvas.height * 0.25;
      const areaWidth = canvas.width * 0.5;
      const areaHeight = canvas.height * 0.5;

      // Create new canvas for the selected area
      const areaCanvas = document.createElement("canvas");
      areaCanvas.width = areaWidth;
      areaCanvas.height = areaHeight;
      const areaCtx = areaCanvas.getContext("2d");

      if (!areaCtx) {
        throw new Error("Could not get area canvas context");
      }

      areaCtx.drawImage(
        canvas,
        centerX,
        centerY,
        areaWidth,
        areaHeight,
        0,
        0,
        areaWidth,
        areaHeight,
      );

      // Convert and download
      areaCanvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

            link.download = `magnet-area-capture-${timestamp}.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast({
              title: "Area captured!",
              description: `Area screenshot saved as ${link.download}`,
              duration: 3000,
            });
          }
        },
        "image/png",
        0.95,
      );
    } catch (error) {
      console.error("Error capturing area:", error);

      let errorTitle = "Area capture failed";
      let errorMessage = "There was an error capturing the selected area.";

      if (error instanceof Error && error.name === "NotAllowedError") {
        errorTitle = "Permission denied";
        errorMessage = "Screen capture permission was denied.";
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Utility function to capture a single frame from screen capture
  const captureFrame = async (
    stream: MediaStream,
  ): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        video.play();

        // Wait a bit for the video to stabilize
        setTimeout(() => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
              reject(new Error("Could not get canvas context"));
              return;
            }

            ctx.drawImage(video, 0, 0);
            resolve(canvas);
          } catch (error) {
            reject(error);
          }
        }, 200);
      };

      video.onerror = () => reject(new Error("Video loading failed"));
    });
  };

  // Utility function to detect scroll height
  const detectScrollHeight = (): number => {
    const iframe = iframeRef.current;
    if (!iframe) return currentDevice.height * 3;

    try {
      // Try to access iframe content (same-origin)
      if (iframe.contentWindow && iframe.contentDocument) {
        const doc = iframe.contentDocument;
        const body = doc.body;
        const html = doc.documentElement;

        const scrollHeight = Math.max(
          body?.scrollHeight || 0,
          body?.offsetHeight || 0,
          html?.clientHeight || 0,
          html?.scrollHeight || 0,
          html?.offsetHeight || 0,
        );

        return scrollHeight > 0 ? scrollHeight : currentDevice.height * 3;
      }
    } catch (error) {
      // Cross-origin - estimate based on common patterns
      console.log("Cross-origin detected, using intelligent estimation");
    }

    // Fallback estimation for cross-origin iframes
    return currentDevice.height * 4; // Assume 4 screen heights for most websites
  };

  // Utility function to scroll iframe
  const scrollIframe = async (scrollY: number): Promise<boolean> => {
    const iframe = iframeRef.current;
    if (!iframe) return false;

    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.scrollTo({
          top: scrollY,
          left: 0,
          behavior: "auto", // Instant scroll for capture
        });

        // Wait for scroll to complete and content to render
        await new Promise((resolve) => setTimeout(resolve, 800));
        return true;
      }
    } catch (error) {
      // Cross-origin scrolling not available
      console.log("Direct iframe scrolling not available (cross-origin)");
    }

    return false;
  };

  // Utility function to stitch images with overlap detection
  const stitchImages = (
    canvases: HTMLCanvasElement[],
    scrollStep: number,
  ): HTMLCanvasElement => {
    if (canvases.length === 0) {
      throw new Error("No images to stitch");
    }

    if (canvases.length === 1) {
      return canvases[0];
    }

    const firstCanvas = canvases[0];
    const totalHeight = (canvases.length - 1) * scrollStep + firstCanvas.height;

    const stitchedCanvas = document.createElement("canvas");
    stitchedCanvas.width = firstCanvas.width;
    stitchedCanvas.height = totalHeight;

    const ctx = stitchedCanvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get stitching canvas context");
    }

    // Draw each canvas at the appropriate position
    canvases.forEach((canvas, index) => {
      const yPosition = index * scrollStep;
      ctx.drawImage(canvas, 0, yPosition);
    });

    return stitchedCanvas;
  };

  // Enhanced full page capture with single permission request
  const handleElementCapture = async () => {
    if (isCapturing) {
      toast({
        title: "Capture in progress",
        description: "Please wait for the current capture to complete.",
        duration: 2000,
      });
      return;
    }

    setIsCapturing(true);
    setCaptureProgress({ current: 0, total: 0, status: "Initializing..." });

    let captureStream: MediaStream | null = null;

    try {
      // Step 1: Request permission and get initial measurements
      toast({
        title: "Starting full page capture",
        description: "Please grant screen capture permission to continue.",
        duration: 3000,
      });

      captureStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: "browser",
          width: { ideal: currentDevice.width * 2 }, // Higher resolution for better quality
          height: { ideal: currentDevice.height * 2 },
          frameRate: { ideal: 1, max: 5 }, // Low frame rate for screenshots
        },
        audio: false,
        preferCurrentTab: true,
      } as any);

      if (!captureStream) {
        throw new Error("Screen capture permission denied");
      }

      setCaptureProgress({ current: 1, total: 5, status: "Analyzing page..." });

      // Step 2: Detect page dimensions
      const totalHeight = detectScrollHeight();
      const viewportHeight = currentDevice.height;
      const scrollStep = Math.floor(viewportHeight * 0.7); // 30% overlap for better stitching
      const totalSections = Math.ceil(totalHeight / scrollStep);
      const maxSections = Math.min(totalSections, 15); // Limit to prevent excessive captures

      console.log(
        `Full page capture: ${totalHeight}px height, ${maxSections} sections`,
      );

      setCaptureProgress({
        current: 2,
        total: maxSections + 3,
        status: `Capturing ${maxSections} sections...`,
      });

      toast({
        title: "Capturing page sections",
        description: `Auto-scrolling through ${maxSections} sections. Please keep this tab active.`,
        duration: 4000,
      });

      // Step 3: Capture all sections
      const screenshots: HTMLCanvasElement[] = [];
      let currentScrollY = 0;

      for (let i = 0; i < maxSections; i++) {
        setCaptureProgress({
          current: i + 3,
          total: maxSections + 3,
          status: `Capturing section ${i + 1} of ${maxSections}...`,
        });

        // Scroll to position (if possible)
        const scrollSuccess = await scrollIframe(currentScrollY);

        if (!scrollSuccess && i > 0) {
          // If we can't scroll, we might be dealing with a cross-origin iframe
          // In this case, we'll capture what we can see and inform the user
          console.log("Cannot scroll iframe, capturing visible area only");
          break;
        }

        // Capture current view
        try {
          const canvas = await captureFrame(captureStream);
          screenshots.push(canvas);

          // Move to next scroll position
          currentScrollY += scrollStep;

          // Stop if we've scrolled past the estimated height
          if (currentScrollY >= totalHeight) {
            break;
          }
        } catch (error) {
          console.error(`Failed to capture section ${i + 1}:`, error);
          // Continue with next section
        }

        // Small delay between captures for stability
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Step 4: Reset scroll position
      setCaptureProgress({
        current: maxSections + 3,
        total: maxSections + 3,
        status: "Processing images...",
      });

      await scrollIframe(0); // Reset to top

      if (screenshots.length === 0) {
        throw new Error("No screenshots were captured successfully");
      }

      // Step 5: Stitch and save
      const finalCanvas = stitchImages(screenshots, scrollStep);

      finalCanvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const deviceName = currentDevice.name
              .toLowerCase()
              .replace(/\s+/g, "-");

            link.download = `magnet-fullpage-${deviceName}-${timestamp}.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast({
              title: "Full page captured successfully!",
              description: `${screenshots.length} sections stitched into ${link.download}`,
              duration: 5000,
            });
          } else {
            throw new Error("Failed to create final image");
          }
        },
        "image/png",
        0.92, // Slightly lower quality for smaller file size
      );
    } catch (error) {
      console.error("Full page capture error:", error);

      let errorTitle = "Full page capture failed";
      let errorMessage = "An error occurred during capture.";
      let suggestions = "";

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorTitle = "Permission denied";
          errorMessage = "Screen capture permission was denied.";
          suggestions =
            "Please allow screen capture and select this browser tab.";
        } else if (error.name === "NotSupportedError") {
          errorTitle = "Not supported";
          errorMessage = "Screen capture is not supported in this browser.";
          suggestions =
            "Please use Chrome, Firefox, or Edge for full page capture.";
        } else if (error.message.includes("No screenshots")) {
          errorTitle = "Capture failed";
          errorMessage = "Unable to capture any page sections.";
          suggestions =
            "The website may be blocking capture or the page failed to load.";
        } else {
          errorMessage = error.message || "An unexpected error occurred.";
          suggestions = "Please try again or use viewport capture instead.";
        }
      }

      toast({
        title: errorTitle,
        description: `${errorMessage} ${suggestions}`,
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      // Clean up
      if (captureStream) {
        captureStream.getTracks().forEach((track) => track.stop());
      }
      setIsCapturing(false);
      setCaptureProgress({ current: 0, total: 0, status: "" });
    }
  };

  // Screen recording handlers
  const startRecording = async () => {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { mediaSource: "screen" },
        audio: true,
      });
      if (!stream) return;

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
          ? "video/webm; codecs=vp9"
          : "video/webm",
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      stream.getVideoTracks()[0].onended = () => {
        if (recorder && recorder.state !== "inactive") {
          recorder.stop();
          setIsRecording(false);
          setMediaRecorder(null);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `magnet-review-${Date.now()}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        toast({
          title: "Recording saved",
          description:
            "Your screen recording has been saved to your downloads folder.",
          duration: 3000,
        });
      };

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

  // Iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const iframeUrl = iframeRef.current.contentWindow.location.href;
        setInputUrl(iframeUrl);
        setCurrentUrl(iframeUrl);
      }
    } catch (error) {
      // cross-origin
    }

    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.addEventListener(
          "beforeunload",
          (e) => {
            e.preventDefault();
            return false;
          },
        );
        iframeRef.current.contentWindow.addEventListener("error", (e) => {
          // @ts-ignore
          e.preventDefault?.();
        });
      }
    } catch (error) {
      // cross-origin
    }
  };

  // Iframe scroll events
  useEffect(() => {
    let scrollListener: (() => void) | null = null;
    let rafId: number | null = null;

    const scheduleUpdate = (x: number, y: number) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setScrollPosition({ x, y });
      });
    };

    const handleIframeScroll = () => {
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          const { scrollX, scrollY } = iframeRef.current.contentWindow;
          scheduleUpdate(scrollX, scrollY);
        }
      } catch (error) {
        // Cross-origin restrictions
      }
    };

    const setupScrollTracking = () => {
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          // Access test (throws if cross-origin)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const test = iframeRef.current.contentWindow.location.href;

          // Same-origin: direct scroll listener
          iframeRef.current.contentWindow.addEventListener(
            "scroll",
            handleIframeScroll,
            { passive: true, capture: false },
          );
          scrollListener = handleIframeScroll;
          handleIframeScroll();
        }
      } catch (error) {
        // Cross-origin: scroll tracking not available
        console.info("Cross-origin detected, scroll tracking limited");
      }
    };

    const timeoutId = setTimeout(setupScrollTracking, 500);

    const handleResize = () => {
      handleIframeScroll();
    };

    window.addEventListener("resize", handleResize, { passive: true });

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
          // ignore
        }
      }
      window.removeEventListener("resize", handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [currentUrl, isLoading]);

  const getTabColor = (tabId: string) => {
    const colors: Record<string, string> = {
      M: "#ef4444",
      A: "#3b82f6",
      G: "#eab308",
      N: "#22c55e",
      E: "#a855f7",
      T: "#f97316",
    };
    return colors[tabId] || "#22c55e";
  };

  return (
    <div
      className="flex flex-col w-full h-full bg-background"
      ref={containerRef}
    >
      {/* Top Bar */}
      <div className="flex items-center gap-2 p-2 border-b bg-background">
        <div className="flex items-center gap-1">
          <h1 className="text-lg font-bold mr-3">
            MAGNET Test<sup className="text-xs">TM</sup> Live
          </h1>
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

        {/* URL input */}
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

        {/* Review Tools */}
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isMagnetPanelOpen ? "default" : "ghost"}
                  size="sm"
                  onClick={toggleMagnetPanel}
                >
                  <Magnet className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isMagnetPanelOpen
                  ? "Close MAGNET Review"
                  : "Open MAGNET Review"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
                Capture Viewport
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAreaCapture}>
                <Square className="h-4 w-4 mr-2" />
                Capture Area
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleElementCapture}
                disabled={isCapturing}
              >
                <Circle
                  className={`h-4 w-4 mr-2 ${isCapturing ? "animate-spin" : ""}`}
                />
                {isCapturing ? "Capturing..." : "Capture Full Page"}
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
                    onClick={() =>
                      toast({
                        title: "Coming soon",
                        description:
                          "Area recording will be available in a future update.",
                        duration: 3000,
                      })
                    }
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
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Full Page Capture Progress Overlay */}
            {isCapturing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                <div className="bg-background rounded-lg p-6 shadow-2xl max-w-sm w-full mx-4">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Capturing Full Page
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {captureProgress.status}
                      </p>
                      {captureProgress.total > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>
                              {captureProgress.current} /{" "}
                              {captureProgress.total}
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min((captureProgress.current / captureProgress.total) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-3">
                        Please keep this tab active during capture
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Website iframe */}
            <iframe
              ref={iframeRef}
              key={`iframe-${currentUrl}`}
              src={currentUrl}
              onLoad={handleIframeLoad}
              className="w-full h-full border-0 border-transparent border-none"
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

            {/* Placeholder for future annotation overlay */}
            <LiveAnnotationOverlay
              key={`overlay-${magnetActiveTab}`}
              reviewId={reviewId}
              tabId={magnetActiveTab}
              tabColor={getTabColor(magnetActiveTab)}
              width={isFullscreen ? window.innerWidth : currentDevice.width}
              height={isFullscreen ? window.innerHeight : currentDevice.height}
              scrollTop={scrollPosition.y}
              scrollLeft={scrollPosition.x}
              zoomLevel={isFullscreen ? 1.0 : zoomLevel}
              isVisible={false}
              iframeRef={iframeRef}
            />
          </div>
        </div>

        {/* Floating MAGNET Review Panel */}
        {isMagnetPanelOpen && (
          <div
            className={`fixed left-4 top-1/2 -translate-y-1/2 z-50 animate-in slide-in-from-left-4 duration-300 ${
              isMagnetPanelMinimized ? "w-[60px]" : "w-[275px] max-w-[275px]"
            }`}
          >
            <div
              className={`h-[92vh] flex flex-col relative ${
                isMagnetPanelMinimized
                  ? ""
                  : "bg-background border rounded-lg shadow-2xl overflow-hidden"
              }`}
            >
              {/* Minimize/Expand Toggle - positioned at the right edge - only show when not minimized */}
              {!isMagnetPanelMinimized && (
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={toggleMagnetPanelMinimize}
                    className="h-8 w-6 p-0 rounded-l-lg rounded-r-none shadow-lg border-r-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {!isMagnetPanelMinimized ? (
                <>
                  <div className="flex items-center p-4 border-b justify-center h-0.5">
                    <h2 className="text-lg font-semibold leading-tight">
                      What’s your MAGNET?
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMagnetPanel}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <MagnetReviewPanel
                      activeTab={magnetActiveTab}
                      projectId={projectId}
                      reviewId={reviewId}
                      onTabChange={handleMagnetTabChange}
                      isMinimized={false}
                      onMinimizeToggle={() => {
                        setIsMagnetPanelMinimized(false);
                      }}
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
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-4">
                  <MagnetReviewPanel
                    activeTab={magnetActiveTab}
                    projectId={projectId}
                    reviewId={reviewId}
                    onTabChange={(tabId) => {
                      handleMagnetTabChange(tabId);
                    }}
                    isMinimized={true}
                    onMinimizeToggle={toggleMagnetPanelMinimize}
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnotationWorkspace;
