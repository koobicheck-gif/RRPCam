"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

type Tool = "arrow" | "circle" | "rect" | "text" | "freehand" | "eraser";
type Color = string;

interface DrawAction {
  tool: Tool;
  color: Color;
  lineWidth: number;
  points?: { x: number; y: number }[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  text?: string;
}

const COLORS = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#FFFFFF", "#000000"];
const TOOLS: Array<{ id: Tool; label: string; icon: string }> = [
  { id: "arrow", label: "Arrow", icon: "→" },
  { id: "circle", label: "Circle", icon: "○" },
  { id: "rect", label: "Rectangle", icon: "□" },
  { id: "freehand", label: "Draw", icon: "✏" },
  { id: "text", label: "Text", icon: "T" },
];

interface PhotoAnnotatorProps {
  imageUrl: string;
  fileName: string;
  onSave: (blob: Blob) => void;
  onClose: () => void;
}

export function PhotoAnnotator({
  imageUrl,
  fileName,
  onSave,
  onClose,
}: PhotoAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [tool, setTool] = useState<Tool>("arrow");
  const [color, setColor] = useState<Color>("#EF4444");
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [actions, setActions] = useState<DrawAction[]>([]);
  const [currentAction, setCurrentAction] = useState<DrawAction | null>(null);
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState<{ x: number; y: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const drawAll = useCallback(
    (ctx: CanvasRenderingContext2D, actionsToRender: DrawAction[], current?: DrawAction | null) => {
      if (!imageRef.current) return;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(imageRef.current, 0, 0, ctx.canvas.width, ctx.canvas.height);

      const renderAction = (action: DrawAction) => {
        ctx.strokeStyle = action.color;
        ctx.fillStyle = action.color;
        ctx.lineWidth = action.lineWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        switch (action.tool) {
          case "freehand":
            if (!action.points || action.points.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(action.points[0].x, action.points[0].y);
            for (let i = 1; i < action.points.length; i++) {
              ctx.lineTo(action.points[i].x, action.points[i].y);
            }
            ctx.stroke();
            break;

          case "arrow": {
            if (!action.start || !action.end) return;
            const { start, end } = action;
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const angle = Math.atan2(dy, dx);
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len < 5) return;
            const headLen = Math.min(20, len * 0.3);

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(
              end.x - headLen * Math.cos(angle - Math.PI / 6),
              end.y - headLen * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(
              end.x - headLen * Math.cos(angle + Math.PI / 6),
              end.y - headLen * Math.sin(angle + Math.PI / 6)
            );
            ctx.stroke();
            break;
          }

          case "circle":
            if (!action.start || !action.end) return;
            {
              const rx = Math.abs(action.end.x - action.start.x) / 2;
              const ry = Math.abs(action.end.y - action.start.y) / 2;
              const cx = (action.start.x + action.end.x) / 2;
              const cy = (action.start.y + action.end.y) / 2;
              ctx.beginPath();
              ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
              ctx.stroke();
            }
            break;

          case "rect":
            if (!action.start || !action.end) return;
            ctx.beginPath();
            ctx.strokeRect(
              action.start.x,
              action.start.y,
              action.end.x - action.start.x,
              action.end.y - action.start.y
            );
            break;

          case "text":
            if (!action.start || !action.text) return;
            ctx.font = `${action.lineWidth * 6}px Inter, sans-serif`;
            ctx.fillStyle = action.color;
            ctx.fillText(action.text, action.start.x, action.start.y);
            break;

          case "eraser":
            if (!action.points || action.points.length < 2) return;
            ctx.save();
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = action.lineWidth * 5;
            ctx.beginPath();
            ctx.moveTo(action.points[0].x, action.points[0].y);
            for (let i = 1; i < action.points.length; i++) {
              ctx.lineTo(action.points[i].x, action.points[i].y);
            }
            ctx.stroke();
            ctx.restore();
            break;
        }
      };

      actionsToRender.forEach(renderAction);
      if (current) renderAction(current);
    },
    []
  );

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      const maxW = Math.min(img.naturalWidth, window.innerWidth - 80);
      const maxH = Math.min(img.naturalHeight, window.innerHeight - 200);
      const ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
      const w = Math.round(img.naturalWidth * ratio);
      const h = Math.round(img.naturalHeight * ratio);
      setCanvasSize({ w, h });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasSize.w) return;
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;
    const ctx = canvas.getContext("2d");
    if (ctx) drawAll(ctx, actions);
  }, [canvasSize, actions, drawAll]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPos(e);

    if (tool === "text") {
      setTextPos(pos);
      setTextInput("");
      return;
    }

    setIsDrawing(true);
    const action: DrawAction = {
      tool,
      color,
      lineWidth,
      points: [pos],
      start: pos,
    };
    setCurrentAction(action);
  };

  const doDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !currentAction) return;
    const pos = getPos(e);
    const updated = { ...currentAction };

    if (tool === "freehand" || tool === "eraser") {
      updated.points = [...(updated.points || []), pos];
    } else {
      updated.end = pos;
    }

    setCurrentAction(updated);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) drawAll(ctx, actions, updated);
    }
  };

  const endDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !currentAction) return;
    setIsDrawing(false);
    const final = { ...currentAction };
    if (!final.end && (final.tool === "arrow" || final.tool === "circle" || final.tool === "rect")) {
      final.end = final.start;
    }
    setActions((prev) => [...prev, final]);
    setCurrentAction(null);
  };

  const handleTextSubmit = () => {
    if (!textPos || !textInput.trim()) {
      setTextPos(null);
      return;
    }
    const action: DrawAction = {
      tool: "text",
      color,
      lineWidth,
      start: textPos,
      text: textInput,
    };
    setActions((prev) => [...prev, action]);
    setTextPos(null);
    setTextInput("");
  };

  const undo = () => setActions((prev) => prev.slice(0, -1));
  const clear = () => setActions([]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (blob) onSave(blob);
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 bg-black/95">
      <div className="flex flex-col w-full max-w-4xl max-h-[100dvh] bg-gray-900 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-white">Annotate Photo</h3>
            <span className="text-xs text-gray-400 truncate max-w-[180px]">{fileName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={undo} disabled={actions.length === 0} className="text-xs text-gray-400 hover:text-white disabled:opacity-30 px-2 py-1 rounded hover:bg-gray-700">
              Undo
            </button>
            <button onClick={clear} disabled={actions.length === 0} className="text-xs text-gray-400 hover:text-white disabled:opacity-30 px-2 py-1 rounded hover:bg-gray-700">
              Clear
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-700 flex items-center justify-center text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-800 border-b border-gray-700 flex-wrap">
          {/* Tools */}
          <div className="flex items-center gap-1">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                title={t.label}
                className={cn(
                  "w-8 h-8 rounded-lg text-sm font-bold transition-colors",
                  tool === t.id
                    ? "bg-navy-600 text-white"
                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                )}
              >
                {t.icon}
              </button>
            ))}
            <button
              onClick={() => setTool("eraser")}
              title="Eraser"
              className={cn(
                "w-8 h-8 rounded-lg text-sm font-bold transition-colors",
                tool === "eraser"
                  ? "bg-navy-600 text-white"
                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
              )}
            >
              ◻
            </button>
          </div>

          <div className="w-px h-6 bg-gray-600" />

          {/* Colors */}
          <div className="flex items-center gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-transform",
                  color === c
                    ? "border-white scale-125"
                    : "border-transparent hover:scale-110"
                )}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-gray-600" />

          {/* Line width */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Size</span>
            <input
              type="range"
              min={1}
              max={8}
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-20 accent-navy-500"
            />
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-3 bg-gray-950 relative">
          {canvasSize.w > 0 ? (
            <>
              <canvas
                ref={canvasRef}
                className={cn(
                  "max-w-full max-h-full touch-none select-none rounded",
                  tool === "text" ? "canvas-text" : "canvas-draw"
                )}
                style={{ width: canvasSize.w, height: canvasSize.h }}
                onMouseDown={startDraw}
                onMouseMove={doDraw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={doDraw}
                onTouchEnd={endDraw}
              />
              {/* Text input overlay */}
              {textPos && (
                <div
                  className="absolute flex gap-1 items-center"
                  style={{ left: 0, top: 0, transform: "translateY(50px)" }}
                >
                  <input
                    autoFocus
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTextSubmit();
                      if (e.key === "Escape") setTextPos(null);
                    }}
                    placeholder="Type text, press Enter"
                    className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-navy-500 min-w-[200px]"
                  />
                  <button onClick={handleTextSubmit} className="bg-navy-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-navy-700">
                    Add
                  </button>
                  <button onClick={() => setTextPos(null)} className="text-gray-400 hover:text-white text-xs px-2 py-2">
                    ✕
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            {actions.length === 0 ? "No annotations yet" : `${actions.length} annotation${actions.length !== 1 ? "s" : ""}`}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary py-2 text-sm bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary py-2 text-sm">
              Save Annotations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
