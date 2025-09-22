import React from "react";

interface LiveAnnotationOverlayProps {
  reviewId?: string;
  tabId?: string;
  tabColor?: string;
  width?: number;
  height?: number;
  scrollTop?: number;
  scrollLeft?: number;
  zoomLevel?: number;
  onAnnotationChange?: (annotations: any) => void;
  isVisible?: boolean;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
  activeTool?: string;
  selectedColor?: string;
  onToolChange?: (tool: string) => void;
  onColorChange?: (color: string) => void;
  initialAnnotations?: any;
  onScrollDelta?: (dx: number, dy: number) => void;
  useVirtualScroll?: boolean;
}

const LiveAnnotationOverlay: React.FC<LiveAnnotationOverlayProps> = ({
  reviewId = "default-review",
  tabId = "M",
  tabColor = "#22c55e",
  width = 1200,
  height = 800,
  scrollTop = 0,
  scrollLeft = 0,
  zoomLevel = 1.0,
  onAnnotationChange = () => {},
  isVisible = true,
  iframeRef,
  activeTool = "select",
  selectedColor,
  onToolChange = () => {},
  onColorChange = () => {},
  initialAnnotations,
  onScrollDelta,
  useVirtualScroll = false,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 z-50 bg-transparent pointer-events-none"
      style={{
        width,
        height,
      }}
    >
      {/* Placeholder for future annotation implementation */}
    </div>
  );
};

export default LiveAnnotationOverlay;
