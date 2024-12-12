"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <div className="relative p-5 m-2 flex flex-col items-center justify-center min-h-screen overflow-hidden bg-base">
      <div className="z-10 text-center flex flex-col items-center">
        <Logo isLoading={false} />
        <h1 className="text-5xl font-bold mb-4 mt-8 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-pink-500 to-red-500">
          NovaFlow
        </h1>
        <p className="text-xl mb-8 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-pink-500 to-red-500">
          AI-powered modular Assistant
        </p>
      </div>
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
