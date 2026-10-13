import React from 'react';

export const VINTAGE_CORNER_STROKE_PATHS = [
  // Outer corner flourish swirls
  "M 6 42 C 6 22, 22 6, 42 6 C 52 6, 60 11, 60 19 C 60 27, 52 32, 44 32 C 36 32, 31 27, 31 20 C 31 14, 36 10, 42 10",
  "M 42 6 C 22 6, 6 22, 6 42 C 6 52, 11 60, 19 60 C 27 60, 32 52, 32 44 C 32 36, 27 31, 20 31 C 14 31, 10 36, 10 42",
  // Outer corner loop at intersection
  "M 4 28 C 4 14, 14 4, 28 4 C 38 4, 46 10, 46 19 C 46 27, 40 32, 32 32 C 26 32, 21 27, 21 21 C 21 16, 25 12, 30 12",
  "M 28 4 C 14 4, 4 14, 4 28 C 4 38, 10 46, 19 46 C 27 46, 32 40, 32 32 C 32 26, 27 21, 21 21 C 16 21, 12 25, 12 30",
  // Extended Horizontal Scroll along top edge
  "M 42 6 C 60 6, 76 -1, 92 4 C 106 8, 118 20, 114 32 C 110 42, 96 42, 90 32 C 86 25, 90 17, 98 16 C 105 15, 110 20, 109 26",
  "M 60 12 C 76 8, 92 17, 106 13 C 116 10, 128 14, 134 7 C 138 2, 134 -4, 127 -4 C 120 -4, 115 2, 119 8",
  "M 34 16 C 50 25, 72 25, 88 16 C 100 10, 115 13, 124 24 C 129 30, 124 37, 117 36 C 110 35, 108 28, 113 23",
  // Extended Vertical Scroll along left edge
  "M 6 42 C 6 60, -1 76, 4 92 C 8 106, 20 118, 32 114 C 42 110, 42 96, 32 90 C 25 86, 17 90, 16 98 C 15 105, 20 110, 26 109",
  "M 12 60 C 8 76, 17 92, 13 106 C 10 116, 14 128, 7 134 C 2 138, -4 134, -4 127 C -4 120, 2 115, 8 119",
  "M 16 34 C 25 50, 25 72, 16 88 C 10 100, 13 115, 24 124 C 30 129, 37 124, 36 117 C 35 110, 28 108, 23 113",
  // Diagonal Inner Rosette / Heart Flourish (toward center)
  "M 28 28 C 42 42, 56 56, 72 68 C 82 76, 92 73, 94 63 C 96 53, 86 46, 76 51 C 69 55, 69 63, 75 67 C 81 71, 87 66, 85 60",
  "M 28 28 C 42 42, 56 56, 68 72 C 76 82, 73 92, 63 94 C 53 96, 46 86, 51 76 C 55 69, 63 69, 67 75 C 71 81, 66 87, 60 85",
  // Central Fleur / Spear toward center (45 deg)
  "M 38 38 C 52 52, 65 65, 80 80 C 87 87, 94 85, 96 78 C 98 69, 90 63, 82 68 C 76 72, 78 80, 84 81",
  "M 80 80 C 72 87, 63 98, 68 82 C 72 76, 80 78, 81 84"
];

export const VINTAGE_CORNER_DOTS = [
  { cx: 48, cy: 19, r: 2 },
  { cx: 19, cy: 48, r: 2 },
  { cx: 98, cy: 24, r: 2.2 },
  { cx: 24, cy: 98, r: 2.2 },
  { cx: 75, cy: 75, r: 2.5 },
  { cx: 16, cy: 16, r: 2 },
  { cx: 127, cy: 5, r: 1.8 },
  { cx: 5, cy: 127, r: 1.8 }
];

interface VintageOrnateBorderProps {
  width: number;
  height: number;
  color?: string;
  className?: string;
}

/**
 * Renders an authentic vintage Victorian filigree double-frame certificate border overlay.
 */
export const VintageOrnateBorder: React.FC<VintageOrnateBorderProps> = ({
  width,
  height,
  color = '#1E3A8A',
  className = ''
}) => {
  const outerMargin = 24;
  const innerMargin = 34;

  const outerWidth = Math.max(0, width - outerMargin * 2);
  const outerHeight = Math.max(0, height - outerMargin * 2);

  const innerWidth = Math.max(0, width - innerMargin * 2);
  const innerHeight = Math.max(0, height - innerMargin * 2);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`absolute inset-0 pointer-events-none z-10 ${className}`}
      style={{ color }}
    >
      <defs>
        <g id="vintage-filigree-corner-path">
          {VINTAGE_CORNER_STROKE_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="currentColor"
              strokeWidth={i < 4 ? '1.5' : '1.3'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {VINTAGE_CORNER_DOTS.map((dot, i) => (
            <circle
              key={`dot-${i}`}
              cx={dot.cx}
              cy={dot.cy}
              r={dot.r}
              fill="currentColor"
            />
          ))}
        </g>
      </defs>

      <g stroke="currentColor" fill="none">
        {/* Outer Solid Frame Line */}
        <rect
          x={outerMargin}
          y={outerMargin}
          width={outerWidth}
          height={outerHeight}
          strokeWidth="2.5"
          fill="none"
        />

        {/* Inner Fine Parallel Frame Line */}
        <rect
          x={innerMargin}
          y={innerMargin}
          width={innerWidth}
          height={innerHeight}
          strokeWidth="1"
          fill="none"
        />

        {/* 4 Ornate Victorian Filigree Corners */}
        {/* Top-Left */}
        <use
          href="#vintage-filigree-corner-path"
          x={outerMargin}
          y={outerMargin}
        />

        {/* Top-Right */}
        <use
          href="#vintage-filigree-corner-path"
          transform={`translate(${width - outerMargin}, ${outerMargin}) scale(-1, 1)`}
        />

        {/* Bottom-Right */}
        <use
          href="#vintage-filigree-corner-path"
          transform={`translate(${width - outerMargin}, ${height - outerMargin}) scale(-1, -1)`}
        />

        {/* Bottom-Left */}
        <use
          href="#vintage-filigree-corner-path"
          transform={`translate(${outerMargin}, ${height - outerMargin}) scale(1, -1)`}
        />
      </g>
    </svg>
  );
};

/**
 * Draws the vintage ornate border directly to a canvas 2D rendering context (used in PDF and image generator)
 */
export const drawVintageOrnateBorderToCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scaleW: number,
  scaleH: number,
  color: string = '#1E3A8A'
) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  const minScale = Math.min(scaleW, scaleH);
  const outerMargin = 24 * scaleW;
  const outerMarginY = 24 * scaleH;
  const innerMargin = 34 * scaleW;
  const innerMarginY = 34 * scaleH;

  // 1. Outer Frame Line
  ctx.lineWidth = 2.5 * minScale;
  ctx.strokeRect(outerMargin, outerMarginY, width - outerMargin * 2, height - outerMarginY * 2);

  // 2. Inner Fine Line
  ctx.lineWidth = 1 * minScale;
  ctx.strokeRect(innerMargin, innerMarginY, width - innerMargin * 2, height - innerMarginY * 2);

  // 3. Ornate Corner Filigrees
  const drawCorner = (tx: number, ty: number, sx: number, sy: number) => {
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(sx * minScale, sy * minScale);

    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw all stroke paths
    for (const pathStr of VINTAGE_CORNER_STROKE_PATHS) {
      if (typeof Path2D !== 'undefined') {
        const p = new Path2D(pathStr);
        ctx.stroke(p);
      }
    }

    // Draw accent dots
    for (const dot of VINTAGE_CORNER_DOTS) {
      ctx.beginPath();
      ctx.arc(dot.cx, dot.cy, dot.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  // Top-Left
  drawCorner(outerMargin, outerMarginY, 1, 1);
  // Top-Right
  drawCorner(width - outerMargin, outerMarginY, -1, 1);
  // Bottom-Right
  drawCorner(width - outerMargin, height - outerMarginY, -1, -1);
  // Bottom-Left
  drawCorner(outerMargin, height - outerMarginY, 1, -1);

  ctx.restore();
};
