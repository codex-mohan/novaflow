"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      for (let i = 0; i <= 100; i++) {
        setProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoading(false);

      if (status === "unauthenticated") {
        router.push("/auth/login");
      } else if (status === "authenticated") {
        router.push("/dashboard");
      }
    };
    checkAuthStatus();
  }, [status, router]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes: Node[] = [];
    const nodeCount = 150;
    const connectionDistance = 100;

    class Node {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 2;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = ["#8B5CF6", "#EC4899", "#EF4444", "#3B82F6", "#10B981"][
          Math.floor(Math.random() * 5)
        ];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new Node());
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < nodes.length; i++) {
        nodes[i].update();
        nodes[i].draw();

        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${
              0.2 - (distance / connectionDistance) * 0.2
            })`;
            ctx.lineWidth = 1.6;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animate);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-background">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 text-center flex flex-col items-center"
      >
        <Logo isLoading={isLoading} />
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-5xl font-bold mb-4 mt-8 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-pink-500 to-red-500"
        >
          NovaFlow
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-xl mb-8 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-pink-500 to-red-500"
        >
          AI-powered modular Assistant
        </motion.p>
        {isLoading ? <LoadingIndicator /> : null}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full"
          style={{ width: "200px", maxWidth: "200px" }}
        />
      </motion.div>
    </div>
  );
}

function Logo({ isLoading }: { isLoading: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="120"
      height="120"
      viewBox="0 0 100 100"
      className={`${isLoading ? "animate-pulse" : ""}`}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="5"
      />
      <path
        d="M50 10 L90 50 L50 90 L10 50 Z"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="50" r="10" fill="url(#logoGradient)" />
    </svg>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex space-x-2 justify-center items-center mb-4">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: 0 }}
          animate={{ y: [-10, 0, -10] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          className="w-3 h-3 bg-gradient-to-r from-violet-600 via-pink-500 to-red-500 rounded-full"
        />
      ))}
    </div>
  );
}
