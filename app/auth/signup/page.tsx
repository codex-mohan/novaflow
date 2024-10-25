"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Mail, Github, Chrome } from "lucide-react";
import GradientButton from "@/components/ui/GradientButton";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const fullName = `${firstName} ${lastName}`;

    try {
      router.push("/projects");
    } catch (error) {
      console.error("Signup error:", error);
      alert("An error occurred during signup");
    }
  };

  const handleGitHubSignUp = () => {
    console.log("");
  };

  const handleGoogleSignUp = () => {
    console.log("");
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
          <h2 className="text-3xl font-bold mb-6 text-purple-300">Sign Up</h2>
          <div className="flex space-x-4 mb-6">
            <GradientButton
              className="flex-1 flex items-center justify-center"
              color="text-font"
              fromColor="from-gray-800"
              toColor="to-gray-700"
              onClick={handleGitHubSignUp}
            >
              <Github size={20} className="mr-2" />
              Github
            </GradientButton>
            <GradientButton
              className="flex-1 flex items-center justify-center"
              color="text-font"
              fromColor="from-orange-500"
              toColor="to-yellow-500"
              onClick={handleGoogleSignUp}
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
              <span className="px-2 bg-primary bg-opacity-50 backdrop-blur-3xl rounded-md text-purple-200">
                Or sign up with email
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
                  placeholder="Choose a username"
                  required
                />
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300"
                  size={18}
                />
              </div>
            </div>

            <div className="mb-4 flex flex-row space-x-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">
                  FIRST NAME
                </label>
                <div className="relative">
                  <input
                    id="firstname"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-3 pr-3 py-2 bg-purple-200 bg-opacity-10 border border-purple-300 border-opacity-30 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-white placeholder-purple-200 placeholder-opacity-60 transition-shadow duration-300 ease-in-out hover:shadow-lg hover:shadow-purple-500/30"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
              </div>
              <div className="">
                <label className="block text-sm font-medium text-purple-200 mb-1">
                  LAST NAME
                </label>
                <div className="relative">
                  <input
                    id="lastname"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-3 pr-3 py-2 bg-purple-200 bg-opacity-10 border border-purple-300 border-opacity-30 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-white placeholder-purple-200 placeholder-opacity-60 transition-shadow duration-300 ease-in-out hover:shadow-lg hover:shadow-purple-500/30"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-purple-200 mb-1"
              >
                EMAIL
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-purple-200 bg-opacity-10 border border-purple-300 border-opacity-30 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-white placeholder-purple-200 placeholder-opacity-60 transition-shadow duration-300 ease-in-out hover:shadow-lg hover:shadow-purple-500/30"
                  placeholder="Enter your email"
                  required
                />
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300"
                  size={18}
                />
              </div>
            </div>
            <div className="mb-4">
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
                  placeholder="Create a password"
                  required
                />
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300"
                  size={18}
                />
              </div>
            </div>
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-purple-200 mb-1"
              >
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-purple-200 bg-opacity-10 border border-purple-300 border-opacity-30 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-white placeholder-purple-200 placeholder-opacity-60 transition-shadow duration-300 ease-in-out hover:shadow-lg hover:shadow-purple-500/30"
                  placeholder="Confirm your password"
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
              color="text-font"
            >
              Sign Up
            </GradientButton>
          </form>
        </div>
        <div className="bg-purple-300 bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 md:w-1/2 flex flex-col justify-center items-center text-white">
          <h2 className="text-3xl font-bold mb-4 text-pink-300">
            Join NovaFlow
          </h2>
          <p className="mb-6 text-center text-purple-200">
            Already have an account?
          </p>
          <GradientButton
            type="button"
            color="text-font"
            fromColor="from-cyan-500"
            viaColor="via-cyan-550"
            toColor="to-lime-500"
            onClick={() => router.push("/auth/signin")}
          >
            Sign In
          </GradientButton>
        </div>
      </motion.div>
    </div>
  );
}
