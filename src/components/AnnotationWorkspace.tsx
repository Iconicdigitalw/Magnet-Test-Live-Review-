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
import LiveAnnotationOverlay from "./LiveAnnotationOverlay";

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
      {/* Browser navigation bar */}
      <div className="flex items-center gap-2 p-2 border-b">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleGoBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Go back</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleGoForward}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Go forward</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex-1 flex items-center">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-1 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Enter website URL"
          />
          <Button onClick={navigateToUrl} className="rounded-l-none">
            Go
          </Button>
        </div>

        <Select value={selectedDevice} onValueChange={setSelectedDevice}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select device" />
          </SelectTrigger>
          <SelectContent>
            {deviceSizes.map((device) => (
              <SelectItem key={device.id} value={device.id}>
                <div className="flex items-center gap-2">
                  {device.icon}
                  <span>{device.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
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
            currentTab={currentTab}
            scrollPosition={scrollPosition}
            viewportWidth={currentDevice.width}
            viewportHeight={currentDevice.height}
            isFullscreen={isFullscreen}
          />
        </div>
      </div>
    </div>
  );
};

export default AnnotationWorkspace;
