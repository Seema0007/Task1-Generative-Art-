import React, { useEffect, useRef, useState } from 'react';
import { Settings, Download, Trash2, Palette, Maximize2, Copy } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
  life: number;
  size: number;
}

interface Point {
  x: number;
  y: number;
}

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [settings, setSettings] = useState({
    particleCount: 15,
    particleLife: 100,
    fadeSpeed: 0.015,
    flowForce: 0.8,
    hueSpeed: 0.5,
    symmetry: 6,
    baseSize: 2,
    sizeVariation: 1,
    colorTheme: 0,
  });

  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const prevMouseRef = useRef<Point>({ x: 0, y: 0 });
  const hueRef = useRef(0);
  const frameRef = useRef(0);

  const colorThemes = [
    { name: 'Rainbow', hueStart: 0, hueRange: 360 },
    { name: 'Ocean', hueStart: 180, hueRange: 60 },
    { name: 'Fire', hueStart: 0, hueRange: 60 },
    { name: 'Forest', hueStart: 90, hueRange: 60 },
    { name: 'Neon', hueStart: 300, hueRange: 120 },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const createParticle = (x: number, y: number, angle: number = 0): Particle => {
      const theme = colorThemes[settings.colorTheme];
      const hue = theme.hueStart + (hueRef.current % theme.hueRange);
      const speed = settings.flowForce * (0.5 + Math.random() * 0.5);
      const size = settings.baseSize + Math.random() * settings.sizeVariation;

      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        hue,
        life: settings.particleLife,
        size,
      };
    };

    const createSymmetricParticles = (x: number, y: number) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.sqrt(dx * dx + dy * dy);

      for (let i = 0; i < settings.symmetry; i++) {
        const rotationAngle = (Math.PI * 2 * i) / settings.symmetry;
        const newAngle = angle + rotationAngle;
        const newX = centerX + Math.cos(newAngle) * distance;
        const newY = centerY + Math.sin(newAngle) * distance;
        
        for (let j = 0; j < settings.particleCount; j++) {
          const particleAngle = newAngle + (Math.random() - 0.5) * 0.5;
          particlesRef.current.push(createParticle(newX, newY, particleAngle));
        }
      }
    };

    const animate = () => {
      if (!ctx) return;
      frameRef.current = requestAnimationFrame(animate);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isDrawing) {
        const dx = mouseRef.current.x - prevMouseRef.current.x;
        const dy = mouseRef.current.y - prevMouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 1) {
          createSymmetricParticles(mouseRef.current.x, mouseRef.current.y);
          hueRef.current = (hueRef.current + settings.hueSpeed) % 360;
          prevMouseRef.current = { ...mouseRef.current };
        }
      }

      ctx.globalCompositeOperation = 'screen';
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= settings.fadeSpeed;
        
        const theme = colorThemes[settings.colorTheme];
        const alpha = particle.life / 100;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 50%, ${alpha})`;
        ctx.fill();

        return particle.life > 0;
      });
      ctx.globalCompositeOperation = 'source-over';
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isDrawing, settings]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = { 
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      prevMouseRef.current = { ...mouseRef.current };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = { 
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = [];
    }
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'generative-art.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const toggleFullscreen = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!document.fullscreenElement) {
      canvas.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="relative w-full h-screen">
      <canvas
        ref={canvasRef}
        className="touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      
      <div className="absolute bottom-8 right-1/2 translate-x-1/2 flex gap-4">
        <button
          onClick={() => setShowControls(!showControls)}
          className={`p-4 rounded-full backdrop-blur-sm transition-all ${
            showControls ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
          title="Settings"
          >
          <Settings className="w-6 h-6 text-white" />
        </button>
        
        <button
          onClick={clearCanvas}
          className="p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all"
          title="Clear Canvas"
        >
          <Trash2 className="w-6 h-6 text-white" />
        </button>
        
        <button
          onClick={saveImage}
          className="p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all"
          title="Save Image"
        >
          <Download className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-6 h-6 text-white" />
        </button>
      </div>

      {showControls && (
        <div className="absolute top-4 left-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg text-white max-w-xs">
          <h3 className="text-lg font-semibold mb-4">Controls</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Symmetry</label>
              <input
                type="range"
                min="1"
                max="12"
                value={settings.symmetry}
                onChange={(e) =>
                  setSettings({ ...settings, symmetry: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Flow Force</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={settings.flowForce}
                onChange={(e) =>
                  setSettings({ ...settings, flowForce: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Particle Size</label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={settings.baseSize}
                onChange={(e) =>
                  setSettings({ ...settings, baseSize: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Color Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {colorThemes.map((theme, index) => (
                  <button
                    key={theme.name}
                    onClick={() => setSettings({ ...settings, colorTheme: index })}
                    className={`px-3 py-1 rounded ${
                      settings.colorTheme === index
                        ? 'bg-white/30'
                        : 'bg-white/10 hover:bg-white/20'
                    } transition-all text-sm`}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Fade Speed</label>
              <input
                type="range"
                min="0.01"
                max="0.05"
                step="0.005"
                value={settings.fadeSpeed}
                onChange={(e) =>
                  setSettings({ ...settings, fadeSpeed: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;