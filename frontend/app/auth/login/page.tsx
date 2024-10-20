/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Chrome, Github } from "lucide-react";
import GradientButton from "@/components/ui/GradientButton";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      console.error(result.error);
    } else {
      router.push("/dashboard");
    }
  };

  const handleGitHubLogin = () => {
    signIn("github", { callbackUrl: "/dashboard" });
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row"
      >
        <div className="p-8 md:w-1/2">
          <h2 className="text-3xl font-bold mb-6 text-purple-300">Sign In</h2>
          <div className="flex space-x-4 mb-6">
            <GradientButton
              className="flex-1 flex items-center justify-center"
              color="text-foreground"
              fromColor="from-gray-800"
              toColor="to-gray-700"
              onClick={handleGitHubLogin}
            >
              <Github size={20} className="mr-2" />
              Github
            </GradientButton>
            <GradientButton
              className="flex-1 flex items-center justify-center"
              color="text-foreground"
              fromColor="from-orange-500"
              toColor="to-yellow-500"
              onClick={handleGoogleLogin}
            >
              <Chrome size={20} className="mr-2 text-text" />
              Google
            </GradientButton>
          </div>
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-300 opacity-30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-primary bg-opacity-50 text-purple-200">
                Or continue with
              </span>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-purple-200 mb-1"
              >
                USERNAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-purple-200 bg-opacity-10 border border-purple-300 border-opacity-30 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-white placeholder-purple-200 placeholder-opacity-60 transition-shadow duration-300 ease-in-out hover:shadow-lg hover:shadow-purple-500/30"
                  placeholder="Enter your username"
                  required
                />
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300"
                  size={18}
                />
              </div>
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-purple-200 mb-1"
              >
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-purple-200 bg-opacity-10 border border-purple-300 border-opacity-30 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-white placeholder-purple-200 placeholder-opacity-60 transition-shadow duration-300 ease-in-out hover:shadow-lg hover:shadow-purple-500/30"
                  placeholder="Enter your password"
                  required
                />
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300"
                  size={18}
                />
              </div>
            </div>
            <GradientButton
              width={"full"}
              height={40}
              type="submit"
              fromColor="from-purple-600"
              toColor="to-pink-600"
              color="text-foreground"
            >
              Sign In
            </GradientButton>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-purple-500 rounded bg-purple-300 bg-opacity-10 transition-shadow duration-300 ease-in-out hover:shadow-sm hover:shadow-pink-500/30"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-purple-200"
                >
                  Remember Me
                </label>
              </div>
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-pink-400 hover:text-pink-300 transition-colors duration-300 ease-in-out relative group"
                >
                  Forgot Password?
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-300 group-hover:w-full transition-all duration-300 ease-in-out"></span>
                </a>
              </div>
            </div>
          </form>
        </div>
        <div className="bg-purple-300 bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 md:w-1/2 flex flex-col justify-center items-center text-white">
          <h2 className="text-3xl font-bold mb-4 text-pink-300">
            Welcome to NovaFlow
          </h2>
          <p className="mb-6 text-center text-purple-200">
            Don't have an account?
          </p>
          <GradientButton
            type="button"
            color="text-foreground"
            fromColor="from-cyan-500"
            viaColor="via-cyan-550"
            toColor="to-lime-500"
            onClick={() => router.push("/auth/signup")}
          >
            Sign In
          </GradientButton>
        </div>
      </motion.div>
    </div>
  );
}
