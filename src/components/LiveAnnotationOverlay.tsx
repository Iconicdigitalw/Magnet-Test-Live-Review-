import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import {
  Pencil,
  Highlighter,
  Type,
  ArrowRight,
  Square,
  Eraser,
  MousePointer,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface LiveAnnotationOverlayProps {
  reviewId?: string;
  tabId?: string;
  tabColor?: string;
  width?: number;
  height?: number;
  scrollTop?: number;
  scrollLeft?: number;
  onAnnotationChange?: (annotations: any) => void;
}

const LiveAnnotationOverlay: React.FC<LiveAnnotationOverlayProps> = ({
  reviewId = "default-review",
  tabId = "M",
  tabColor = "#4ade80", // Default to green if no color provided
  width = 1200,
  height = 800,
  scrollTop = 0,
  scrollLeft = 0,
  onAnnotationChange = () => {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<string>("select");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<fabric.Path | null>(null);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: false,
        selection: true,
        backgroundColor: "transparent",
      });

      fabricCanvasRef.current = canvas;

      // Set canvas dimensions
      canvas.setWidth(width);
      canvas.setHeight(height);

      // Handle canvas events
      canvas.on("object:added", () => {
        if (fabricCanvasRef.current) {
          const annotations = fabricCanvasRef.current.toJSON();
          onAnnotationChange(annotations);
        }
      });

      canvas.on("object:modified", () => {
        if (fabricCanvasRef.current) {
          const annotations = fabricCanvasRef.current.toJSON();
          onAnnotationChange(annotations);
        }
      });

      // Clean up on unmount
      return () => {
        canvas.dispose();
        fabricCanvasRef.current = null;
      };
    }
  }, []);

  // Update canvas dimensions when props change
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setWidth(width);
      fabricCanvasRef.current.setHeight(height);
      fabricCanvasRef.current.renderAll();
    }
  }, [width, height]);

  // Update canvas position when scroll changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      // Adjust canvas viewpoint based on scroll position
      fabricCanvasRef.current.absolutePan(
        new fabric.Point(scrollLeft, scrollTop),
      );
      fabricCanvasRef.current.renderAll();
    }
  }, [scrollTop, scrollLeft]);

  // Handle tool changes
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    // Reset canvas mode based on active tool
    canvas.isDrawingMode = activeTool === "pen" || activeTool === "highlighter";
    canvas.selection = activeTool === "select";

    // Configure brush settings based on tool
    if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
      if (activeTool === "pen") {
        canvas.freeDrawingBrush.color = tabColor;
        canvas.freeDrawingBrush.width = 2;
      } else if (activeTool === "highlighter") {
        // Make highlighter semi-transparent
        const highlighterColor = fabric.Color.fromHex(tabColor).toRgba();
        const transparentColor = `rgba(${highlighterColor.split(",").slice(0, 3).join(",")}, 0.3)`;
        canvas.freeDrawingBrush.color = transparentColor;
        canvas.freeDrawingBrush.width = 15;
      }
    }
  }, [activeTool, tabColor]);

  // Handle mouse events for custom tools
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(e.nativeEvent);

    if (activeTool === "arrow") {
      setIsDrawing(true);
      // Start arrow with just a line
      const line = new fabric.Line(
        [pointer.x, pointer.y, pointer.x, pointer.y],
        {
          stroke: tabColor,
          strokeWidth: 2,
          selectable: true,
        },
      );
      canvas.add(line);
      setCurrentPath(line as unknown as fabric.Path);
    } else if (activeTool === "rectangle") {
      setIsDrawing(true);
      // Start rectangle
      const rect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        stroke: tabColor,
        strokeWidth: 2,
        fill: "transparent",
        selectable: true,
      });
      canvas.add(rect);
      setCurrentPath(rect as unknown as fabric.Path);
    } else if (activeTool === "text") {
      // Add text box at click position
      const text = new fabric.Textbox("Click to edit text", {
        left: pointer.x,
        top: pointer.y,
        fontSize: 16,
        fill: tabColor,
        width: 200,
        selectable: true,
        editable: true,
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      text.enterEditing();
      text.selectAll();
    } else if (activeTool === "eraser") {
      // Find and remove object under pointer
      const objects = canvas.getObjects();
      const target = canvas.findTarget(e.nativeEvent, false);
      if (target) {
        canvas.remove(target);
        canvas.renderAll();
        onAnnotationChange(canvas.toJSON());
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentPath || !fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(e.nativeEvent);

    if (activeTool === "arrow") {
      // Update arrow line
      const line = currentPath as unknown as fabric.Line;
      line.set({
        x2: pointer.x,
        y2: pointer.y,
      });
    } else if (activeTool === "rectangle") {
      // Update rectangle dimensions
      const rect = currentPath as unknown as fabric.Rect;
      const startX = rect.left || 0;
      const startY = rect.top || 0;
      const width = pointer.x - startX;
      const height = pointer.y - startY;

      rect.set({
        width: Math.abs(width),
        height: Math.abs(height),
        left: width < 0 ? pointer.x : startX,
        top: height < 0 ? pointer.y : startY,
      });
    }

    canvas.renderAll();
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentPath || !fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    if (activeTool === "arrow") {
      // Complete arrow by adding arrowhead
      const line = currentPath as unknown as fabric.Line;
      const x1 = line.x1 || 0;
      const y1 = line.y1 || 0;
      const x2 = line.x2 || 0;
      const y2 = line.y2 || 0;

      // Calculate angle for arrowhead
      const angle = Math.atan2(y2 - y1, x2 - x1);

      // Create arrowhead
      const headLength = 15;
      const headAngle = Math.PI / 6; // 30 degrees

      const arrowhead1 = new fabric.Line(
        [
          x2,
          y2,
          x2 - headLength * Math.cos(angle - headAngle),
          y2 - headLength * Math.sin(angle - headAngle),
        ],
        {
          stroke: tabColor,
          strokeWidth: 2,
          selectable: false,
        },
      );

      const arrowhead2 = new fabric.Line(
        [
          x2,
          y2,
          x2 - headLength * Math.cos(angle + headAngle),
          y2 - headLength * Math.sin(angle + headAngle),
        ],
        {
          stroke: tabColor,
          strokeWidth: 2,
          selectable: false,
        },
      );

      // Group the line and arrowheads
      const arrow = new fabric.Group([line, arrowhead1, arrowhead2], {
        selectable: true,
      });

      canvas.remove(line);
      canvas.add(arrow);
    }

    setIsDrawing(false);
    setCurrentPath(null);
    onAnnotationChange(canvas.toJSON());
  };

  return (
    <div className="relative bg-transparent" style={{ width, height }}>
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-background/80 p-2 rounded-md shadow-md">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "select" ? "default" : "outline"}
                size="icon"
                onClick={() => setActiveTool("select")}
              >
                <MousePointer size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Select</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "pen" ? "default" : "outline"}
                size="icon"
                onClick={() => setActiveTool("pen")}
              >
                <Pencil size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pen</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "highlighter" ? "default" : "outline"}
                size="icon"
                onClick={() => setActiveTool("highlighter")}
              >
                <Highlighter size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Highlighter</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "text" ? "default" : "outline"}
                size="icon"
                onClick={() => setActiveTool("text")}
              >
                <Type size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Text</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "arrow" ? "default" : "outline"}
                size="icon"
                onClick={() => setActiveTool("arrow")}
              >
                <ArrowRight size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Arrow</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "rectangle" ? "default" : "outline"}
                size="icon"
                onClick={() => setActiveTool("rectangle")}
              >
                <Square size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Rectangle</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "eraser" ? "default" : "outline"}
                size="icon"
                onClick={() => setActiveTool("eraser")}
              >
                <Eraser size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eraser</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 z-10 pointer-events-auto"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};

export default LiveAnnotationOverlay;
