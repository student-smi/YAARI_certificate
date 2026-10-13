import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Type, RotateCcw, Trash2, Check, Download, X, Sparkles } from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSignature: (signatureDataUrl: string, signatoryName?: string) => void;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onInsertSignature
}) => {
  const [activeMode, setActiveMode] = useState<'draw' | 'type'>('draw');
  
  // Draw mode state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const [penColor, setPenColor] = useState<string>('#0F172A');
  const [penWidth, setPenWidth] = useState<number>(3);

  // Type mode state
  const [typedName, setTypedName] = useState<string>('Arthur Sterling');
  const [typedFont, setTypedFont] = useState<string>('Great Vibes');

  // Colors palette
  const inkColors = [
    { label: 'Midnight Black', hex: '#0F172A' },
    { label: 'Royal Navy', hex: '#1E3A8A' },
    { label: 'Classic Blue', hex: '#2563EB' },
    { label: 'Burgundy Wine', hex: '#881337' },
    { label: 'Metallic Gold', hex: '#B45309' }
  ];

  // Font options for typed signature
  const fontOptions = [
    { name: 'Pinyon Script', label: 'Aristocratic Cursive' },
    { name: 'Great Vibes', label: 'Classic Flowing Script' },
    { name: 'Alex Brush', label: 'Formal Calligraphy' },
    { name: 'Allura', label: 'Graceful Signature' },
    { name: 'Dancing Script', label: 'Expressive Cursive' },
    { name: 'Parisienne', label: 'French Vintage Script' },
    { name: 'Italianno', label: 'Italian Calligraphy' },
    { name: 'Playfair Display', label: 'Sophisticated Serif' },
    { name: 'Cormorant Garamond', label: 'Diplomatic Italic' }
  ];

  // Setup canvas with high-DPI scaling
  useEffect(() => {
    if (!isOpen || activeMode !== 'draw') return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 2;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penWidth;
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, activeMode]);

  // Update stroke style when color or width changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
    }
  }, [penColor, penWidth]);

  if (!isOpen) return null;

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save current state for undo
    const dpr = window.devicePixelRatio || 2;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory(prev => [...prev.slice(-10), imgData]);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.closePath();
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeHistory([]);
    setHasDrawn(false);
  };

  const handleUndo = () => {
    if (strokeHistory.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previous = strokeHistory[strokeHistory.length - 1];
    ctx.putImageData(previous, 0, 0);
    setStrokeHistory(prev => prev.slice(0, -1));
    if (strokeHistory.length === 1) {
      setHasDrawn(false);
    }
  };

  // Convert typed text into a high-DPI transparent PNG Data URL
  const generateTypedSignatureDataUrl = (): string => {
    const offscreen = document.createElement('canvas');
    offscreen.width = 600;
    offscreen.height = 180;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return '';

    ctx.font = `italic 64px "${typedFont}", cursive, serif`;
    ctx.fillStyle = penColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName, 300, 90);

    return offscreen.toDataURL('image/png');
  };

  // Handle final insert onto certificate
  const handleInsert = () => {
    if (activeMode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      const dataUrl = canvas.toDataURL('image/png');
      onInsertSignature(dataUrl, 'Handwritten Signature');
    } else {
      if (!typedName.trim()) return;
      const dataUrl = generateTypedSignatureDataUrl();
      onInsertSignature(dataUrl, typedName.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-elevated border border-neutral-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base text-black">Digital Signature Studio</h3>
              <p className="text-xs text-neutral-500">Create a crystal-clear, transparent vector signature for official certificates</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-6 pt-4 flex items-center gap-2 border-b border-neutral-100 pb-3">
          <button
            onClick={() => setActiveMode('draw')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'draw'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw with Mouse / Pen</span>
          </button>

          <button
            onClick={() => setActiveMode('type')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'type'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Type in Calligraphy</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          
          {/* DRAW MODE */}
          {activeMode === 'draw' ? (
            <div className="space-y-3">
              {/* Drawing Board Canvas */}
              <div className="relative rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50/60 overflow-hidden shadow-inner flex flex-col items-center justify-center">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-56 cursor-crosshair touch-none"
                />

                {!hasDrawn && (
                  <div className="absolute pointer-events-none text-center space-y-1">
                    <PenTool className="w-6 h-6 text-neutral-300 mx-auto" />
                    <p className="text-xs text-neutral-400 font-semibold">Draw your signature here with your mouse, trackpad, or pen</p>
                    <span className="text-[10px] text-neutral-300">Creates a clean transparent PNG background</span>
                  </div>
                )}

                {/* Subtle base baseline guide line */}
                <div className="absolute bottom-10 left-10 right-10 h-px bg-neutral-200 pointer-events-none border-b border-dashed border-neutral-300" />
              </div>

              {/* Tools Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Ink Color Picker */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-neutral-600">Ink Color:</span>
                  <div className="flex items-center gap-1.5">
                    {inkColors.map(c => (
                      <button
                        key={c.hex}
                        onClick={() => setPenColor(c.hex)}
                        title={c.label}
                        style={{ backgroundColor: c.hex }}
                        className={`w-6 h-6 rounded-full transition-all ${
                          penColor === c.hex ? 'ring-2 ring-black ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Stroke thickness */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-neutral-600">Stroke:</span>
                  <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                    {[
                      { label: 'Fine', w: 2 },
                      { label: 'Medium', w: 3 },
                      { label: 'Bold', w: 4.5 }
                    ].map(st => (
                      <button
                        key={st.w}
                        onClick={() => setPenWidth(st.w)}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                          penWidth === st.w ? 'bg-black text-white shadow-xs' : 'text-neutral-600'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Undo / Clear actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleUndo}
                    disabled={strokeHistory.length === 0}
                    className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 disabled:opacity-40"
                    title="Undo Stroke"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={!hasDrawn}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-200 hover:bg-red-50 hover:text-red-600 text-xs font-semibold text-neutral-600 disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* TYPE MODE */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black mb-1.5">
                  Enter Signatory Full Name
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Sterling"
                  className="w-full px-3.5 py-2 text-sm font-semibold border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              {/* Calligraphy Font Chooser */}
              <div>
                <label className="block text-xs font-bold text-black mb-1.5">
                  Select Calligraphy Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {fontOptions.map(f => (
                    <button
                      key={f.name}
                      onClick={() => setTypedFont(f.name)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        typedFont === f.name
                          ? 'border-2 border-black bg-neutral-50 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-400 bg-white'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase text-neutral-400 block tracking-wider">
                        {f.label}
                      </span>
                      <span
                        style={{ fontFamily: f.name }}
                        className="text-2xl text-black block mt-1 truncate"
                      >
                        {typedName || 'Signature Preview'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker for typed signature */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-neutral-600">Ink Color:</span>
                <div className="flex items-center gap-1.5">
                  {inkColors.map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setPenColor(c.hex)}
                      title={c.label}
                      style={{ backgroundColor: c.hex }}
                      className={`w-6 h-6 rounded-full transition-all ${
                        penColor === c.hex ? 'ring-2 ring-black ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black rounded-xl hover:bg-neutral-200/60 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleInsert}
            disabled={activeMode === 'draw' ? !hasDrawn : !typedName.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Insert Signature onto Certificate</span>
          </button>
        </div>

      </div>
    </div>
  );
};
