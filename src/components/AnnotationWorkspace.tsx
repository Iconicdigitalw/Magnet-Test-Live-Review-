import React, { useState, useRef, useEffect } from "react";
import { fabric } from "fabric";
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
import { toast } from "@/components/ui/use-toast";

interface AnnotationWorkspaceProps {
  url?: string;
  projectId?: string;
  reviewId?: string;
  currentTab?: string;
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
    width: 1440,
    height: 900,
    icon: <Monitor className="h-4 w-4" />,
  },
  {
    id: "laptop",
    name: "Laptop",
    width: 1024,
    height: 768,
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
    height: 667,
    icon: <Smartphone className="h-4 w-4" />,
  },
];

const AnnotationWorkspace: React.FC<AnnotationWorkspaceProps> = ({
  url = "https://example.com",
  projectId = "project-1",
  reviewId = "review-1",
  currentTab = "M",
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
  const [annotationTool, setAnnotationTool] = useState<string>("pen");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentDevice =
    deviceSizes.find((device) => device.id === selectedDevice) ||
    deviceSizes[1];

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
      iframeRef.current.src = currentUrl;
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Annotation tool handlers
  const handleAnnotationTool = (tool: string) => {
    setActiveAnnotationTool(tool);
    setAnnotationTool(tool);
    toast({
      title: `${tool.charAt(0).toUpperCase() + tool.slice(1)} tool selected`,
      description: `You can now use the ${tool} tool to annotate the website.`,
      duration: 2000,
    });
  };

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
      }
    } catch (error) {
      // Cross-origin restrictions might prevent accessing the URL
      console.log(
        "Could not access iframe URL due to cross-origin restrictions",
      );
    }
  };

  // Handle iframe scroll events
  useEffect(() => {
    let scrollListener: (() => void) | null = null;

    const handleIframeScroll = () => {
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          const { scrollX, scrollY } = iframeRef.current.contentWindow;
          setScrollPosition({ x: scrollX, y: scrollY });
        }
      } catch (error) {
        // Cross-origin restrictions might prevent accessing scroll position
      }
    };

    // Try to add scroll event listener to iframe
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.addEventListener(
          "scroll",
          handleIframeScroll,
        );
        scrollListener = handleIframeScroll;
      }
    } catch (error) {
      // Cross-origin restrictions might prevent adding event listener
      console.log(
        "Could not add scroll listener due to cross-origin restrictions",
      );
    }

    // Cleanup function
    return () => {
      if (scrollListener) {
        try {
          if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.removeEventListener(
              "scroll",
              scrollListener,
            );
          }
        } catch (error) {
          // Cross-origin restrictions might prevent removing event listener
          console.log(
            "Could not remove scroll listener due to cross-origin restrictions",
          );
        }
      }
    };
  }, [currentUrl]);

  return (
    <div
      className="flex flex-col w-full h-full bg-background"
      ref={containerRef}
    >
      {/* Compact Browser navigation bar */}
      <div className="flex items-center gap-1 p-2 border-b bg-background">
        {/* Left side - Browser controls */}
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleGoBack}>
                  <ArrowLeft className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Go back</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleGoForward}>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Go forward</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-3 w-3" />
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

        {/* Center - New functionality tools */}
        <div className="flex items-center gap-1">
          {/* Live Annotator */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="size-12">
              <Button variant="ghost" size="sm" className="h-8 w-8">
                <Pen className="h-4 w-4 flex" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => handleAnnotationTool("pen")}>
                <Pen className="h-4 w-4 mr-2" />
                Pen Tool
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAnnotationTool("highlighter")}
              >
                <Square className="h-4 w-4 mr-2" />
                Highlighter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAnnotationTool("text")}>
                <Type className="h-4 w-4 mr-2" />
                Text Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAnnotationTool("arrow")}>
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Arrow
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Screen Capture */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8">
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
              <Button variant="ghost" size="sm" className="h-8 w-8">
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
            <SelectTrigger className="w-[140px] h-8 text-xs">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="h-8 w-8"
                >
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
      <div
        className={`flex-1 flex justify-center items-start overflow-auto p-4 ${isFullscreen ? "bg-gray-900" : "bg-gray-100"}`}
      >
        <div
          className={`relative bg-white ${isFullscreen ? "" : "shadow-lg"}`}
          style={{
            width: isFullscreen ? "100%" : `${currentDevice.width}px`,
            height: isFullscreen ? "100%" : `${currentDevice.height}px`,
            maxWidth: "100%",
            maxHeight: "100%",
            overflow: "hidden",
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
            sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation allow-popups allow-modals"
            allow="fullscreen; camera; microphone; geolocation; payment; autoplay"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Annotation overlay */}
          <LiveAnnotationOverlay
            reviewId={reviewId}
            tabId={currentTab}
            tabColor="#4ade80"
            width={isFullscreen ? window.innerWidth : currentDevice.width}
            height={isFullscreen ? window.innerHeight : currentDevice.height}
            scrollTop={scrollPosition.y}
            scrollLeft={scrollPosition.x}
            onAnnotationChange={(annotations) => {
              // Handle annotation changes
              console.log("Annotations updated:", annotations);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AnnotationWorkspace;
