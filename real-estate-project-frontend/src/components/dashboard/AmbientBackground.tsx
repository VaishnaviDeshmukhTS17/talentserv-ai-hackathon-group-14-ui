import { useEffect, useRef } from 'react';

interface AmbientBackgroundProps {
  theme: string;
}

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

interface BlobNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetRadius: number;
  currentColors: ColorRGB[];
  targetColors: ColorRGB[];
}

export default function AmbientBackground({ theme }: AmbientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);

  // Retrieve RGB values mapping to active themes
  const getThemeColors = (themeName: string): ColorRGB[] => {
    switch (themeName) {
      case 'charcoal-grey':
        return [
          { r: 6, g: 182, b: 212 },   // cyan
          { r: 59, g: 130, b: 246 },  // blue
          { r: 167, g: 139, b: 250 }  // purple
        ];
      case 'sapphire-dark':
        return [
          { r: 29, g: 78, b: 216 },   // navy
          { r: 96, g: 165, b: 250 },  // ice blue
          { r: 37, g: 99, b: 235 }   // cobalt
        ];
      case 'emerald-forest':
        return [
          { r: 5, g: 150, b: 105 },   // emerald
          { r: 16, g: 185, b: 129 },  // mint
          { r: 6, g: 95, b: 70 }      // forest green
        ];
      case 'light-violet':
        return [
          { r: 139, g: 92, b: 246 },  // violet
          { r: 192, g: 132, b: 252 }, // lavender
          { r: 232, g: 121, b: 249 }  // magenta
        ];
      default:
        return [
          { r: 6, g: 182, b: 212 },
          { r: 59, g: 130, b: 246 },
          { r: 167, g: 139, b: 250 }
        ];
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initialize 4 dynamic, organic blobs
    const blobs: BlobNode[] = [
      {
        x: width * 0.2,
        y: height * 0.3,
        vx: 0.5,
        vy: -0.4,
        radius: Math.min(width, height) * 0.35,
        targetRadius: Math.min(width, height) * 0.35,
        currentColors: getThemeColors(theme),
        targetColors: getThemeColors(theme)
      },
      {
        x: width * 0.8,
        y: height * 0.2,
        vx: -0.4,
        vy: 0.5,
        radius: Math.min(width, height) * 0.4,
        targetRadius: Math.min(width, height) * 0.4,
        currentColors: getThemeColors(theme),
        targetColors: getThemeColors(theme)
      },
      {
        x: width * 0.3,
        y: height * 0.8,
        vx: -0.3,
        vy: -0.5,
        radius: Math.min(width, height) * 0.3,
        targetRadius: Math.min(width, height) * 0.3,
        currentColors: getThemeColors(theme),
        targetColors: getThemeColors(theme)
      },
      {
        x: width * 0.7,
        y: height * 0.7,
        vx: 0.4,
        vy: 0.3,
        radius: Math.min(width, height) * 0.35,
        targetRadius: Math.min(width, height) * 0.35,
        currentColors: getThemeColors(theme),
        targetColors: getThemeColors(theme)
      }
    ];

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      blobs.forEach((blob) => {
        blob.radius = Math.min(width, height) * 0.35;
        blob.targetRadius = Math.min(width, height) * 0.35;
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      hasMovedRef.current = true;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Main animation render loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Smoothly transition colors when theme changes
      const activeColors = getThemeColors(theme);

      blobs.forEach((blob, blobIdx) => {
        // Interpolate colors (RGB) towards active theme colors
        blob.currentColors.forEach((color, colorIdx) => {
          const target = activeColors[colorIdx] || activeColors[0];
          color.r += (target.r - color.r) * 0.05;
          color.g += (target.g - color.g) * 0.05;
          color.b += (target.b - color.b) * 0.05;
        });

        // Drift slowly with screen boundaries bounce
        blob.x += blob.vx;
        blob.y += blob.vy;

        if (blob.x - blob.radius < 0 || blob.x + blob.radius > width) {
          blob.vx *= -1;
        }
        if (blob.y - blob.radius < 0 || blob.y + blob.radius > height) {
          blob.vy *= -1;
        }

        // Magnetic Attraction: Slide gently towards mouse cursor coordinates
        if (hasMovedRef.current) {
          const dx = mouseRef.current.x - blob.x;
          const dy = mouseRef.current.y - blob.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Apply soft gravity vector pull if within 400px of mouse cursor
          if (distance < 500) {
            const pull = (500 - distance) / 500 * 0.45; // Soft attraction force
            blob.x += (mouseRef.current.x - blob.x) * pull * 0.03;
            blob.y += (mouseRef.current.y - blob.y) * pull * 0.03;
          }
        }

        // Render nodes as smooth radial gradient meshes
        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          blob.radius
        );

        const primaryColor = blob.currentColors[blobIdx % blob.currentColors.length];
        const secondaryColor = blob.currentColors[(blobIdx + 1) % blob.currentColors.length];

        // Format strings mapping opacity and colors
        const colorStr1 = `rgba(${Math.round(primaryColor.r)}, ${Math.round(primaryColor.g)}, ${Math.round(primaryColor.b)}, 0.065)`;
        const colorStr2 = `rgba(${Math.round(secondaryColor.r)}, ${Math.round(secondaryColor.g)}, ${Math.round(secondaryColor.b)}, 0.02)`;
        const colorStr3 = 'rgba(0, 0, 0, 0)';

        gradient.addColorStop(0, colorStr1);
        gradient.addColorStop(0.5, colorStr2);
        gradient.addColorStop(1, colorStr3);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-100 transition-opacity duration-1000 bg-transparent"
    />
  );
}
