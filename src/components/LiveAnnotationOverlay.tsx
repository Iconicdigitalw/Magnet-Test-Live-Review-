import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  clearMode?: "none" | "all" | "erase" | "select";
  onClearComplete?: () => void;
}

// Unified annotation schema
type PenAnnotation = {
  id: string;
  type: "pen" | "highlighter";
  color: string;
  opacity?: number;
  strokeWidth: number;
  points: { x: number; y: number }[];
};

type RectAnnotation = {
  id: string;
  type: "rectangle";
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeWidth: number;
};

type ArrowAnnotation = {
  id: string;
  type: "arrow";
  color: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth: number;
};

type TextAnnotation = {
  id: string;
  type: "text";
  color: string;
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  isEditing?: boolean;
};

type Annotation =
  | PenAnnotation
  | RectAnnotation
  | ArrowAnnotation
  | TextAnnotation;

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
  selectedColor = "#ef4444",
  onToolChange = () => {},
  onColorChange = () => {},
  initialAnnotations,
  onScrollDelta,
  useVirtualScroll = false,
  clearMode = "none",
  onClearComplete = () => {},
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentId] = useState(() => `${reviewId}-${tabId}-${Date.now()}`);
  const [hoveredAnnotationId, setHoveredAnnotationId] = useState<string | null>(
    null,
  );
  const [eraserPath, setEraserPath] = useState<{ x: number; y: number }[]>([]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const textInputRef = useRef<HTMLInputElement | null>(null);

  // Working draft objects while drawing
  const draftRef = useRef<Annotation | null>(null);

  // Load initial annotations
  useEffect(() => {
    if (!initialAnnotations) return;
    try {
      const parsed =
        typeof initialAnnotations === "string"
          ? JSON.parse(initialAnnotations)
          : initialAnnotations;
      if (Array.isArray(parsed)) {
        setAnnotations(parsed as Annotation[]);
      }
    } catch (e) {
      console.warn("Invalid initialAnnotations", e);
    }
  }, [initialAnnotations]);

  // Emit changes
  useEffect(() => {
    onAnnotationChange?.(annotations);
  }, [annotations, onAnnotationChange]);

  // Handle clear mode changes
  useEffect(() => {
    if (clearMode === "all") {
      setAnnotations([]);
      onClearComplete();
    }
  }, [clearMode, onClearComplete]);

  const scale = zoomLevel ?? 1;

  // Utility to get SVG-local coordinates and normalize for scale
  const getPoint = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;
      if ("touches" in e && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        const me = e as React.MouseEvent;
        clientX = me.clientX;
        clientY = me.clientY;
      }
      const x = (clientX - rect.left) / (scale || 1);
      const y = (clientY - rect.top) / (scale || 1);
      return {
        x: Math.max(0, Math.min(width, x)),
        y: Math.max(0, Math.min(height, y)),
      };
    },
    [scale, width, height],
  );

  const startDraw = useCallback(
    (e: React.MouseEvent) => {
      if (!isVisible) return;

      // Handle erase mode
      if (clearMode === "erase") {
        setIsDrawing(true);
        const p = getPoint(e);
        setEraserPath([p]);
        return;
      }

      // Handle select mode for deletion - only if no other tool is active
      if (
        clearMode === "select" &&
        (activeTool === "none" || activeTool === "select")
      ) {
        // Click to delete will be handled in the annotation click handler
        return;
      }

      if (activeTool === "none" || activeTool === "select") return;
      setIsDrawing(true);
      const p = getPoint(e);

      if (activeTool === "pen" || activeTool === "highlighter") {
        draftRef.current = {
          id: `${currentId}-path-${Date.now()}`,
          type: activeTool,
          color: selectedColor,
          opacity: activeTool === "highlighter" ? 0.3 : 1,
          strokeWidth: activeTool === "highlighter" ? 20 : 3,
          points: [p],
        } as PenAnnotation;
      } else if (activeTool === "rectangle") {
        draftRef.current = {
          id: `${currentId}-rect-${Date.now()}`,
          type: "rectangle",
          color: selectedColor,
          x: p.x,
          y: p.y,
          width: 0,
          height: 0,
          strokeWidth: 2,
        } as RectAnnotation;
      } else if (activeTool === "arrow") {
        draftRef.current = {
          id: `${currentId}-arrow-${Date.now()}`,
          type: "arrow",
          color: selectedColor,
          x1: p.x,
          y1: p.y,
          x2: p.x,
          y2: p.y,
          strokeWidth: 2,
        } as ArrowAnnotation;
      } else if (activeTool === "text") {
        const newAnn: TextAnnotation = {
          id: `${currentId}-text-${Date.now()}`,
          type: "text",
          color: selectedColor,
          x: p.x,
          y: p.y,
          text: "",
          fontSize: 16,
          fontFamily: "Arial, sans-serif",
          isEditing: true,
        };
        setAnnotations((prev) => [...prev, newAnn]);
        setEditingTextId(newAnn.id);
        setEditingText("");
        setIsDrawing(false);

        // Focus the input after a short delay to ensure it's rendered
        setTimeout(() => {
          if (textInputRef.current) {
            textInputRef.current.focus();
          }
        }, 10);
      }
    },
    [activeTool, currentId, getPoint, isVisible, selectedColor, clearMode],
  );

  const moveDraw = useCallback(
    (e: React.MouseEvent) => {
      // Handle eraser movement
      if (clearMode === "erase" && isDrawing) {
        const p = getPoint(e);
        setEraserPath((prev) => {
          const newPath = [...prev, p];

          // Check for intersections with annotations and remove them
          setAnnotations((currentAnnotations) => {
            return currentAnnotations.filter((ann) => {
              if (ann.type === "pen" || ann.type === "highlighter") {
                const penAnn = ann as PenAnnotation;
                // Check if current eraser point intersects with any point in the annotation
                return !penAnn.points.some((point) => {
                  const distance = Math.sqrt(
                    Math.pow(point.x - p.x, 2) + Math.pow(point.y - p.y, 2),
                  );
                  return distance < 15; // Eraser radius
                });
              }
              // For other annotation types, check if current eraser point is near them
              if (ann.type === "rectangle") {
                const rect = ann as RectAnnotation;
                return !(
                  p.x >= rect.x &&
                  p.x <= rect.x + rect.width &&
                  p.y >= rect.y &&
                  p.y <= rect.y + rect.height
                );
              }
              if (ann.type === "arrow") {
                const arrow = ann as ArrowAnnotation;
                const distToLine =
                  Math.abs(
                    (arrow.y2 - arrow.y1) * p.x -
                      (arrow.x2 - arrow.x1) * p.y +
                      arrow.x2 * arrow.y1 -
                      arrow.y2 * arrow.x1,
                  ) /
                  Math.sqrt(
                    Math.pow(arrow.y2 - arrow.y1, 2) +
                      Math.pow(arrow.x2 - arrow.x1, 2),
                  );
                return distToLine >= 10;
              }
              if (ann.type === "text") {
                const text = ann as TextAnnotation;
                const distance = Math.sqrt(
                  Math.pow(text.x - p.x, 2) + Math.pow(text.y - p.y, 2),
                );
                return distance >= 30;
              }
              return true;
            });
          });

          return newPath;
        });
        return;
      }

      if (!isDrawing || !draftRef.current) return;
      const p = getPoint(e);
      const draft = draftRef.current;

      if (draft.type === "pen" || draft.type === "highlighter") {
        (draft as PenAnnotation).points = [
          ...(draft as PenAnnotation).points,
          p,
        ];
      } else if (draft.type === "rectangle") {
        const r = draft as RectAnnotation;
        r.width = p.x - r.x;
        r.height = p.y - r.y;
      } else if (draft.type === "arrow") {
        const a = draft as ArrowAnnotation;
        a.x2 = p.x;
        a.y2 = p.y;
      }

      // Force repaint by updating state with a noop change
      setAnnotations((prev) => [...prev]);
    },
    [getPoint, isDrawing, clearMode],
  );

  const endDraw = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Clear eraser path
    if (clearMode === "erase") {
      setEraserPath([]);
      return;
    }

    if (!draftRef.current) return;

    const d = draftRef.current;

    // Normalize rectangles to positive width/height
    if (d.type === "rectangle") {
      const r = d as RectAnnotation;
      const nx = Math.min(r.x, r.x + r.width);
      const ny = Math.min(r.y, r.y + r.height);
      const nw = Math.abs(r.width);
      const nh = Math.abs(r.height);
      r.x = nx;
      r.y = ny;
      r.width = nw;
      r.height = nh;
    }

    setAnnotations((prev) => [...prev, d]);
    draftRef.current = null;
  }, [isDrawing, clearMode]);

  // Render helpers
  const toPolylinePoints = (pts: { x: number; y: number }[]) =>
    pts.map((pt) => `${pt.x},${pt.y}`).join(" ");

  const arrowHead = (x1: number, y1: number, x2: number, y2: number) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const size = 10;
    const a1 = angle + Math.PI * 0.85;
    const a2 = angle - Math.PI * 0.85;
    const p1 = { x: x2, y: y2 };
    const p2 = { x: x2 + size * Math.cos(a1), y: y2 + size * Math.sin(a1) };
    const p3 = { x: x2 + size * Math.cos(a2), y: y2 + size * Math.sin(a2) };
    return `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
  };

  const handleAnnotationClick = useCallback(
    (annotationId: string) => {
      // Only allow deletion when in select mode AND no other annotation tool is active
      if (
        clearMode === "select" &&
        (activeTool === "none" || activeTool === "select")
      ) {
        setAnnotations((prev) => prev.filter((ann) => ann.id !== annotationId));
      }
    },
    [clearMode, activeTool],
  );

  const handleTextInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (editingText.trim().length > 0) {
          setAnnotations((prev) =>
            prev.map((ann) =>
              ann.id === editingTextId
                ? { ...ann, text: editingText.trim(), isEditing: false }
                : ann,
            ),
          );
        } else {
          // Remove empty text annotation
          setAnnotations((prev) =>
            prev.filter((ann) => ann.id !== editingTextId),
          );
        }
        setEditingTextId(null);
        setEditingText("");
      } else if (e.key === "Escape") {
        e.preventDefault();
        // Remove the text annotation on escape
        setAnnotations((prev) =>
          prev.filter((ann) => ann.id !== editingTextId),
        );
        setEditingTextId(null);
        setEditingText("");
      }
    },
    [editingText, editingTextId],
  );

  const handleTextInputBlur = useCallback(() => {
    if (editingTextId) {
      if (editingText.trim().length > 0) {
        setAnnotations((prev) =>
          prev.map((ann) =>
            ann.id === editingTextId
              ? { ...ann, text: editingText.trim(), isEditing: false }
              : ann,
          ),
        );
      } else {
        // Remove empty text annotation
        setAnnotations((prev) =>
          prev.filter((ann) => ann.id !== editingTextId),
        );
      }
      setEditingTextId(null);
      setEditingText("");
    }
  }, [editingText, editingTextId]);

  if (!isVisible) return null;

  return (
    <div
      className="absolute inset-0 z-50 bg-transparent"
      style={{
        width,
        height,
        // Match iframe scaling so overlay aligns perfectly
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        pointerEvents:
          (activeTool === "select" || activeTool === "none") &&
          clearMode === "none"
            ? "none"
            : "auto",
        cursor:
          clearMode === "erase"
            ? "crosshair"
            : clearMode === "select"
              ? "pointer"
              : "default",
      }}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="block"
        onMouseDown={startDraw}
        onMouseMove={moveDraw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
      >
        {/* Existing annotations */}
        {annotations.map((ann) => {
          const isHovered = hoveredAnnotationId === ann.id;
          const isSelectable =
            clearMode === "select" &&
            (activeTool === "none" || activeTool === "select");

          if (ann.type === "pen" || ann.type === "highlighter") {
            const p = ann as PenAnnotation;
            return (
              <polyline
                key={ann.id}
                points={toPolylinePoints(p.points)}
                fill="none"
                stroke={p.color}
                strokeOpacity={
                  isHovered && isSelectable
                    ? 0.5
                    : (p.opacity ?? (ann.type === "highlighter" ? 0.3 : 1))
                }
                strokeWidth={p.strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{ cursor: isSelectable ? "pointer" : "default" }}
                onMouseEnter={() =>
                  isSelectable && setHoveredAnnotationId(ann.id)
                }
                onMouseLeave={() =>
                  isSelectable && setHoveredAnnotationId(null)
                }
                onClick={() => handleAnnotationClick(ann.id)}
              />
            );
          }
          if (ann.type === "rectangle") {
            const r = ann as RectAnnotation;
            return (
              <rect
                key={ann.id}
                x={r.x}
                y={r.y}
                width={r.width}
                height={r.height}
                fill={isHovered && isSelectable ? "rgba(255,0,0,0.1)" : "none"}
                stroke={r.color}
                strokeWidth={r.strokeWidth}
                style={{ cursor: isSelectable ? "pointer" : "default" }}
                onMouseEnter={() =>
                  isSelectable && setHoveredAnnotationId(ann.id)
                }
                onMouseLeave={() =>
                  isSelectable && setHoveredAnnotationId(null)
                }
                onClick={() => handleAnnotationClick(ann.id)}
              />
            );
          }
          if (ann.type === "arrow") {
            const a = ann as ArrowAnnotation;
            return (
              <g
                key={ann.id}
                style={{ cursor: isSelectable ? "pointer" : "default" }}
                onMouseEnter={() =>
                  isSelectable && setHoveredAnnotationId(ann.id)
                }
                onMouseLeave={() =>
                  isSelectable && setHoveredAnnotationId(null)
                }
                onClick={() => handleAnnotationClick(ann.id)}
              >
                <line
                  x1={a.x1}
                  y1={a.y1}
                  x2={a.x2}
                  y2={a.y2}
                  stroke={a.color}
                  strokeWidth={a.strokeWidth}
                  strokeOpacity={isHovered && isSelectable ? 0.5 : 1}
                />
                <polygon
                  points={arrowHead(a.x1, a.y1, a.x2, a.y2)}
                  fill={a.color}
                  fillOpacity={isHovered && isSelectable ? 0.5 : 1}
                />
              </g>
            );
          }
          if (ann.type === "text") {
            const t = ann as TextAnnotation;
            if (t.isEditing && editingTextId === t.id) {
              return (
                <foreignObject
                  key={ann.id}
                  x={t.x}
                  y={t.y - 16}
                  width={200}
                  height={24}
                >
                  <input
                    ref={textInputRef}
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={handleTextInputKeyDown}
                    onBlur={handleTextInputBlur}
                    style={{
                      background: "transparent",
                      border: "1px solid #ccc",
                      borderRadius: "2px",
                      padding: "2px 4px",
                      fontSize: `${t.fontSize || 16}px`,
                      fontFamily: t.fontFamily || "Arial, sans-serif",
                      color: t.color,
                      outline: "none",
                      width: "100%",
                      minWidth: "100px",
                    }}
                    placeholder="Type here..."
                  />
                </foreignObject>
              );
            }
            return (
              <text
                key={ann.id}
                x={t.x}
                y={t.y}
                fill={t.color}
                fontSize={t.fontSize || 16}
                fontFamily={t.fontFamily || "Arial, sans-serif"}
                fillOpacity={isHovered && isSelectable ? 0.5 : 1}
                style={{ cursor: isSelectable ? "pointer" : "default" }}
                onMouseEnter={() =>
                  isSelectable && setHoveredAnnotationId(ann.id)
                }
                onMouseLeave={() =>
                  isSelectable && setHoveredAnnotationId(null)
                }
                onClick={() => handleAnnotationClick(ann.id)}
              >
                {t.text}
              </text>
            );
          }
          return null;
        })}

        {/* Eraser visualization */}
        {clearMode === "erase" && eraserPath.length > 0 && (
          <circle
            cx={eraserPath[eraserPath.length - 1].x}
            cy={eraserPath[eraserPath.length - 1].y}
            r={15}
            fill="rgba(255, 0, 0, 0.2)"
            stroke="red"
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        )}

        {/* Draft element while drawing */}
        {isDrawing && draftRef.current && (
          <>
            {(() => {
              const d = draftRef.current!;
              if (d.type === "pen" || d.type === "highlighter") {
                const p = d as PenAnnotation;
                return (
                  <polyline
                    points={toPolylinePoints(p.points)}
                    fill="none"
                    stroke={p.color}
                    strokeOpacity={p.opacity ?? 1}
                    strokeWidth={p.strokeWidth}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                );
              } else if (d.type === "rectangle") {
                const r = d as RectAnnotation;
                const x = Math.min(r.x + r.width, r.x);
                const y = Math.min(r.y + r.height, r.y);
                const w = Math.abs(r.width);
                const h = Math.abs(r.height);
                return (
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill="none"
                    stroke={r.color}
                    strokeWidth={r.strokeWidth}
                  />
                );
              } else if (d.type === "arrow") {
                const a = d as ArrowAnnotation;
                return (
                  <g>
                    <line
                      x1={a.x1}
                      y1={a.y1}
                      x2={a.x2}
                      y2={a.y2}
                      stroke={a.color}
                      strokeWidth={a.strokeWidth}
                    />
                    <polygon
                      points={arrowHead(a.x1, a.y1, a.x2, a.y2)}
                      fill={a.color}
                    />
                  </g>
                );
              }
              return null;
            })()}
          </>
        )}
      </svg>
    </div>
  );
};

export default LiveAnnotationOverlay;
