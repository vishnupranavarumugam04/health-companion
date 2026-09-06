"use client";
import React, { useEffect, useRef } from "react";
import { Moon, Footprints, Heart } from "lucide-react";

export interface SamsungGalaxyRingsProps {
  sleepText: string | number;
  stepsText: string | number;
  hrText: string | number;
}

export const SamsungGalaxyRings: React.FC<SamsungGalaxyRingsProps> = ({
  sleepText,
  stepsText,
  hrText,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let stars: Star[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initParticles();
    };

    class Particle {
      cx: number;
      cy: number;
      angle: number;
      radius: number;
      color: string;
      speed: number;
      size: number;

      constructor(cx: number, cy: number, baseRadius: number, colorRange: string[], speed: number) {
        this.cx = cx;
        this.cy = cy;
        this.angle = Math.random() * Math.PI * 2;
        // spread particles out like a thick galaxy ring
        const spread = (Math.random() - 0.5) * (baseRadius * 0.8);
        this.radius = baseRadius + spread;
        this.color = colorRange[Math.floor(Math.random() * colorRange.length)];
        this.speed = speed * (Math.random() * 0.4 + 0.8) * (Math.random() > 0.5 ? 1 : -1);
        this.size = Math.random() * 1.5;
      }

      update() {
        this.angle += this.speed;
      }

      draw(ctx: CanvasRenderingContext2D) {
        const x = this.cx + Math.cos(this.angle) * this.radius;
        const y = this.cy + Math.sin(this.angle) * this.radius;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class Star {
       x: number;
       y: number;
       size: number;
       alpha: number;
       speed: number;
       
       constructor(w: number, h: number) {
         this.x = Math.random() * w;
         this.y = Math.random() * h;
         this.size = Math.random() * 1.5;
         this.alpha = Math.random();
         this.speed = (Math.random() * 0.02) - 0.01;
       }
       
       update() {
         this.alpha += this.speed;
         if (this.alpha <= 0 || this.alpha >= 1) this.speed *= -1;
       }
       
       draw(ctx: CanvasRenderingContext2D) {
         ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, this.alpha))})`;
         ctx.beginPath();
         ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
         ctx.fill();
       }
    }
    
    const initParticles = () => {
      particles = [];
      stars = [];
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      const centerY = height / 2;
      const ringRadius = Math.min(width / 8, height / 2.5);
      
      const centers = [
        { x: width * 0.18, colors: ["#a78bfa", "#c4b5fd", "#6b7280", "#4b5563"] }, // Purple (Sleep)
        { x: width * 0.5, colors: ["#22d3ee", "#34d399", "#6b7280", "#4b5563"] },  // Cyan/Green (Activity)
        { x: width * 0.82, colors: ["#fb923c", "#fcd34d", "#6b7280", "#4b5563"] }  // Orange (Heart)
      ];

      centers.forEach(center => {
        for (let i = 0; i < 1200; i++) {
          particles.push(new Particle(center.x, centerY, ringRadius, center.colors, 0.0015));
        }
      });
      
      for(let i=0; i<250; i++) {
        stars.push(new Star(width, height));
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      stars.forEach(s => {
        s.update();
        s.draw(ctx);
      });

      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("resize", resize);
    resize();
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-56 bg-black rounded-3xl overflow-hidden my-4 border border-slate-800/80 shadow-lg shadow-black/50">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      <div className="absolute inset-0 flex justify-center items-center w-full h-full">
        <div className="flex w-full h-full relative">
          
          {/* Left: Sleep */}
          <div className="absolute left-[18%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 blur-2xl bg-purple-500/30 rounded-full scale-150 animate-pulse" />
              <div className="relative z-10 w-16 h-16 rounded-full bg-slate-900/40 backdrop-blur-sm border border-purple-500/20 flex items-center justify-center">
                 <Moon className="w-8 h-8 text-purple-300 fill-purple-400 drop-shadow-[0_0_8px_#a78bfa]" />
              </div>
            </div>
            <div className="text-purple-200 font-semibold text-sm drop-shadow-[0_0_5px_#a78bfa] z-10 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-md">
              {sleepText}
            </div>
          </div>
          
          {/* Middle: Activity */}
          <div className="absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 blur-2xl bg-cyan-500/30 rounded-full scale-150 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="relative z-10 w-20 h-20 rounded-full bg-slate-900/40 backdrop-blur-sm border border-cyan-500/20 flex items-center justify-center">
                 <Footprints className="w-10 h-10 text-cyan-300 fill-cyan-400 drop-shadow-[0_0_8px_#22d3ee]" />
              </div>
            </div>
            <div className="text-cyan-200 font-bold text-base drop-shadow-[0_0_5px_#22d3ee] z-10 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-md">
              {stepsText}
            </div>
          </div>
          
          {/* Right: Heart Rate */}
          <div className="absolute left-[82%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 blur-2xl bg-orange-500/30 rounded-full scale-150 animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="relative z-10 w-16 h-16 rounded-full bg-slate-900/40 backdrop-blur-sm border border-orange-500/20 flex items-center justify-center">
                 <Heart className="w-8 h-8 text-orange-300 fill-orange-400 drop-shadow-[0_0_8px_#fb923c]" />
              </div>
            </div>
            <div className="text-orange-200 font-semibold text-sm drop-shadow-[0_0_5px_#fb923c] z-10 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-md">
              {hrText}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
