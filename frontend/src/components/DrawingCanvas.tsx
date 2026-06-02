import { useMemo, useState } from "react";
import type { Stroke } from "../services/api";

interface DrawingCanvasProps {
  strokes: Stroke[];
  disabled?: boolean;
  onStroke: (stroke: { x: number; y: number; color: string; size: number }) => Promise<void>;
}

export function DrawingCanvas({ strokes, disabled = false, onStroke }: DrawingCanvasProps) {
  const [isDrawing, setIsDrawing] = useState(false);

  const points = useMemo(() => {
    return strokes.map((stroke) => {
      return {
        left: `${stroke.x * 100}%`,
        top: `${stroke.y * 100}%`,
        color: stroke.color,
        size: Math.max(2, Math.min(12, stroke.size))
      };
    });
  }, [strokes]);

  async function pushStroke(event: React.MouseEvent<HTMLDivElement>) {
    if (disabled) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;

    if (x < 0 || x > 1 || y < 0 || y > 1) {
      return;
    }

    await onStroke({
      x,
      y,
      color: "#111827",
      size: 4
    });
  }

  return (
    <div
      className="drawing-canvas"
      onMouseDown={async (event) => {
        setIsDrawing(true);
        await pushStroke(event);
      }}
      onMouseMove={async (event) => {
        if (!isDrawing) {
          return;
        }
        await pushStroke(event);
      }}
      onMouseUp={() => setIsDrawing(false)}
      onMouseLeave={() => setIsDrawing(false)}
      role="img"
      aria-label="Interactive drawing canvas"
    >
      {points.map((point, index) => (
        <span
          key={`${index}-${point.left}-${point.top}`}
          className="drawing-canvas__point"
          style={{
            left: point.left,
            top: point.top,
            backgroundColor: point.color,
            width: `${point.size}px`,
            height: `${point.size}px`
          }}
        />
      ))}
      {disabled ? <p className="drawing-canvas__hint">Drawer is currently drawing.</p> : null}
    </div>
  );
}
