import React, { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import {
  Pencil,
  Highlighter,
  Type,
  ArrowRight,
  Square,
  Eraser,
  MousePointer,
  Undo,
  Redo,
  Trash2,
  Palette,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

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
  // New: virtual scroll bridge for cross-origin fallback
  onScrollDelta?: (dx: number, dy: number) => void;
  useVirtualScroll?: boolean;
}

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
  activeTool: externalActiveTool = "select",
  selectedColor: externalSelectedColor,
  onToolChange = () => {},
  onColorChange = () => {},
  initialAnnotations,
  onScrollDelta,
  useVirtualScroll = false,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<string>(externalActiveTool);
  const [selectedColor, setSelectedColor] = useState<string>(
    externalSelectedColor || tabColor,
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<fabric.Path | null>(null);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  // Wheel passthrough for smooth scrolling while tools are active (only when not using virtual scroll)
  const [wheelPassthrough, setWheelPassthrough] = useState(false);
  const wheelTimeoutRef = useRef<number | null>(null);
  const panRaf = useRef<number | null>(null);

  // Save canvas state to history
  const saveCanvasState = useCallback(() => {
    if (fabricCanvasRef.current) {
      const state = JSON.stringify(fabricCanvasRef.current.toJSON());
      setCanvasHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(state);
        return newHistory.slice(-50);
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
    }
  }, [historyIndex]);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: false,
        selection: true,
        backgroundColor: "transparent",
        preserveObjectStacking: true,
        renderOnAddRemove: true,
        stateful: true,
        perPixelTargetFind: true,
      });

      fabricCanvasRef.current = canvas;

      canvas.setWidth(width);
      canvas.setHeight(height);

      canvas.on("object:added", (e) => {
        if (e.target && !e.target.isType("activeSelection")) {
          saveCanvasState();
          if (fabricCanvasRef.current) {
            const annotations = fabricCanvasRef.current.toJSON();
            onAnnotationChange(annotations);
          }
        }
      });

      canvas.on("object:modified", () => {
        saveCanvasState();
        if (fabricCanvasRef.current) {
          const annotations = fabricCanvasRef.current.toJSON();
          onAnnotationChange(annotations);
        }
      });

      canvas.on("object:removed", () => {
        saveCanvasState();
        if (fabricCanvasRef.current) {
          const annotations = fabricCanvasRef.current.toJSON();
          onAnnotationChange(annotations);
        }
      });

      if (initialAnnotations) {
        try {
          canvas.loadFromJSON(initialAnnotations, () => {
            canvas.renderAll();
            saveCanvasState();
          });
        } catch (err) {
          // ignore bad JSON
        }
      } else {
        saveCanvasState();
      }

      return () => {
        canvas.dispose();
        fabricCanvasRef.current = null;
      };
    }
  }, [initialAnnotations, saveCanvasState, width, height]);

  // Update canvas dimensions when props change
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setWidth(width);
      fabricCanvasRef.current.setHeight(height);
      fabricCanvasRef.current.renderAll();
    }
  }, [width, height]);

  // Keep annotations anchored to page while scrolling/zooming
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (panRaf.current) {
      cancelAnimationFrame(panRaf.current);
    }
    const x = scrollLeft;
    const y = scrollTop;
    panRaf.current = requestAnimationFrame(() => {
      canvas.setZoom(zoomLevel);
      const vt = (canvas.viewportTransform || [1, 0, 0, 1, 0, 0]) as number[];
      vt[0] = zoomLevel;
      vt[3] = zoomLevel;
      vt[4] = -x * zoomLevel;
      vt[5] = -y * zoomLevel;
      canvas.setViewportTransform(vt);
      canvas.requestRenderAll();
    });
    return () => {
      if (panRaf.current) {
        cancelAnimationFrame(panRaf.current);
        panRaf.current = null;
      }
    };
  }, [scrollTop, scrollLeft, zoomLevel]);

  // Sync with external tool and color props
  useEffect(() => {
    if (externalActiveTool !== activeTool) {
      setActiveTool(externalActiveTool);
    }
  }, [externalActiveTool]);

  useEffect(() => {
    if (externalSelectedColor && externalSelectedColor !== selectedColor) {
      setSelectedColor(externalSelectedColor);
    }
  }, [externalSelectedColor]);

  // If initialAnnotations change later (e.g., loaded async), load them
  useEffect(() => {
    if (!fabricCanvasRef.current || !initialAnnotations) return;
    try {
      fabricCanvasRef.current.loadFromJSON(initialAnnotations, () => {
        fabricCanvasRef.current?.renderAll();
        saveCanvasState();
      });
    } catch (err) {
      // ignore
    }
  }, [initialAnnotations, saveCanvasState]);

  // Handle tool changes
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    canvas.isDrawingMode = activeTool === "pen" || activeTool === "highlighter";
    canvas.selection = activeTool === "select";

    if (canvas.isDrawingMode) {
      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      }
      if (activeTool === "pen") {
        canvas.freeDrawingBrush.color = selectedColor || tabColor;
        canvas.freeDrawingBrush.width = Math.max(2 / zoomLevel, 1);
        // @ts-ignore
        canvas.freeDrawingBrush.shadowBlur = 0;
      } else if (activeTool === "highlighter") {
        const color = selectedColor || tabColor;
        const rgb = new fabric.Color(color).getSource() as number[];
        const transparentColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.3)`;
        canvas.freeDrawingBrush.color = transparentColor;
        canvas.freeDrawingBrush.width = Math.max(15 / zoomLevel, 8);
        // @ts-ignore
        canvas.freeDrawingBrush.shadowBlur = 2;
      }
    }

    switch (activeTool) {
      case "pen":
      case "highlighter":
        canvas.defaultCursor = "crosshair";
        break;
      case "text":
        canvas.defaultCursor = "text";
        break;
      case "eraser":
        canvas.defaultCursor = "grab";
        break;
      default:
        canvas.defaultCursor = "default";
    }

    onToolChange(activeTool);
  }, [activeTool, selectedColor, zoomLevel, tabColor, onToolChange]);

  // Handle mouse events for custom tools
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!fabricCanvasRef.current) return;

    if (activeTool !== "select") {
      e.preventDefault();
      e.stopPropagation();
    }

    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(e.nativeEvent);

    if (activeTool === "arrow") {
      setIsDrawing(true);
      const line = new fabric.Line(
        [pointer.x, pointer.y, pointer.x, pointer.y],
        {
          stroke: selectedColor || tabColor,
          strokeWidth: Math.max(2 / zoomLevel, 1),
          selectable: true,
          strokeLineCap: "round",
        },
      );
      canvas.add(line);
      setCurrentPath(line as unknown as fabric.Path);
    } else if (activeTool === "rectangle") {
      setIsDrawing(true);
      const rect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        stroke: selectedColor || tabColor,
        strokeWidth: Math.max(2 / zoomLevel, 1),
        fill: "transparent",
        selectable: true,
        strokeLineCap: "round",
        strokeLineJoin: "round",
      });
      canvas.add(rect);
      setCurrentPath(rect as unknown as fabric.Path);
    } else if (activeTool === "text") {
      const text = new fabric.Textbox("Click to edit text", {
        left: pointer.x,
        top: pointer.y,
        fontSize: Math.max(16 / zoomLevel, 12),
        fill: selectedColor || tabColor,
        width: Math.max(200 / zoomLevel, 150),
        selectable: true,
        editable: true,
        fontFamily: "Arial, sans-serif",
        textAlign: "left",
      });
      fabricCanvasRef.current.add(text);
      fabricCanvasRef.current.setActiveObject(text);
      text.enterEditing();
      text.selectAll();
    } else if (activeTool === "eraser") {
      const target = canvas.findTarget(e.nativeEvent, false);
      if (target && target !== canvas.backgroundImage) {
        canvas.remove(target);
        canvas.renderAll();
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentPath || !fabricCanvasRef.current) return;

    if (isDrawing) {
      e.preventDefault();
      e.stopPropagation();
    }

    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(e.nativeEvent);

    if (activeTool === "arrow") {
      const line = currentPath as unknown as fabric.Line;
      line.set({
        x2: pointer.x,
        y2: pointer.y,
      });
    } else if (activeTool === "rectangle") {
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
      const line = currentPath as unknown as fabric.Line;
      const x1 = line.x1 || 0;
      const y1 = line.y1 || 0;
      const x2 = line.x2 || 0;
      const y2 = line.y2 || 0;

      const angle = Math.atan2(y2 - y1, x2 - x1);
      const headLength = 15;
      const headAngle = Math.PI / 6;

      const arrowhead1 = new fabric.Line(
        [
          x2,
          y2,
          x2 - headLength * Math.cos(angle - headAngle),
          y2 - headLength * Math.sin(angle - headAngle),
        ],
        {
          stroke: selectedColor || tabColor,
          strokeWidth: Math.max(2 / zoomLevel, 1),
          selectable: false,
          strokeLineCap: "round",
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
          stroke: selectedColor || tabColor,
          strokeWidth: Math.max(2 / zoomLevel, 1),
          selectable: false,
          strokeLineCap: "round",
        },
      );

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

  // Undo/Redo/Clear
  const handleUndo = useCallback(() => {
    if (historyIndex > 0 && fabricCanvasRef.current) {
      const prevState = canvasHistory[historyIndex - 1];
      fabricCanvasRef.current.loadFromJSON(prevState, () => {
        fabricCanvasRef.current?.renderAll();
        setHistoryIndex((prev) => prev - 1);
      });
    }
  }, [canvasHistory, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < canvasHistory.length - 1 && fabricCanvasRef.current) {
      const nextState = canvasHistory[historyIndex + 1];
      fabricCanvasRef.current.loadFromJSON(nextState, () => {
        fabricCanvasRef.current?.renderAll();
        setHistoryIndex((prev) => prev + 1);
      });
    }
  }, [canvasHistory, historyIndex]);

  const handleClearCanvas = useCallback(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = "transparent";
      fabricCanvasRef.current.renderAll();
      saveCanvasState();
      onAnnotationChange({ objects: [], version: "5.2.4" });
    }
  }, [saveCanvasState, onAnnotationChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            if (e.shiftKey) {
              e.preventDefault();
              handleRedo();
            } else {
              e.preventDefault();
              handleUndo();
            }
            break;
          case "y":
            e.preventDefault();
            handleRedo();
            break;
        }
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (fabricCanvasRef.current) {
          const activeObjects = fabricCanvasRef.current.getActiveObjects();
          if (activeObjects.length > 0) {
            e.preventDefault();
            fabricCanvasRef.current.remove(...activeObjects);
            fabricCanvasRef.current.discardActiveObject();
            fabricCanvasRef.current.renderAll();
          }
        }
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, handleUndo, handleRedo]);

  if (!isVisible) {
    return null;
  }

  // Wheel handler on the WRAPPER
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (activeTool === "select") return;

    if (useVirtualScroll) {
      // Cross-origin fallback: prevent page scroll and emit deltas scaled to page coords
      e.preventDefault();
      e.stopPropagation();
      const dx = e.deltaX / (zoomLevel || 1);
      const dy = e.deltaY / (zoomLevel || 1);
      if (onScrollDelta) onScrollDelta(dx, dy);
      return;
    }

    // Default behavior: allow temporary passthrough to let iframe handle scroll
    if (wheelTimeoutRef.current) window.clearTimeout(wheelTimeoutRef.current);
    setWheelPassthrough(true);
    wheelTimeoutRef.current = window.setTimeout(() => {
      setWheelPassthrough(false);
    }, 1200);
  };

  const wrapperPointerEvents =
    activeTool === "select" || (!useVirtualScroll && wheelPassthrough)
      ? "none"
      : "auto";

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 z-50 bg-transparent"
      style={{
        width,
        height,
        pointerEvents:
          wrapperPointerEvents as React.CSSProperties["pointerEvents"],
      }}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 z-40"
        style={{ cursor: "inherit" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isDrawing) {
            setIsDrawing(false);
            setCurrentPath(null);
          }
        }}
      />
    </div>
  );
};

export default LiveAnnotationOverlay;
