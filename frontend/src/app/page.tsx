"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring } from "framer-motion";

const HeroSection = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  // Set up motion values for a smooth, delayed cursor-following dot
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 300, damping: 30 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Update motion values on mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseX.set(e.clientX - 7.5);
    mouseY.set(e.clientY - 7.5);
  };

  // Check for login status
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    } else {
      setIsLoggedIn(false);
      setUsername("");
    }
  }, []);

  // Logout functionality
  const handleLogout = () => {
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername("");
  };

  return (
    <section
      className="relative h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://www.fewandfar.co.uk/assets/nurture/hero-nurture.png/37a01e95a52e22c42071fee52efbb684.webp')",
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)",
        }}
      ></div>

      {/* Top Section */}
      <div className="absolute top-8 left-8 flex items-center space-x-4 z-20">
        <div className="flex items-center">
          <img
            className="w-8 h-8 mr-2"
            src="https://upload.wikimedia.org/wikipedia/commons/d/df/Coat_of_arms_of_Sicily.svg"
            alt="logo"
          />
          <h1 className="text-white text-2xl font-bold">Moltisanti</h1>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute top-8 right-8 flex items-center space-x-4 z-20">
        {isLoggedIn ? (
          <div className="flex items-center space-x-4">
            <p className="text-white text-lg">Welcome, {username}</p>
            <button
              onClick={handleLogout}
              className="rounded-full border border-white text-white bg-transparent px-6 py-2 transition-all duration-300 hover:bg-white hover:text-black"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex space-x-4">
            <button
              onClick={() => router.push("/login")}
              className="rounded-full border border-white text-white bg-transparent px-6 py-2 transition-all duration-300 hover:bg-white hover:text-black"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/register")}
              className="rounded-full border border-white text-white bg-transparent px-6 py-2 transition-all duration-300 hover:bg-white hover:text-black"
            >
              Register
            </button>

            {/* Menu Button */}
            <button className="group flex justify-center items-center w-[55px] h-[45px] rounded-full bg-white transition-all duration-300 hover:bg-gray-200">
              <div className="flex flex-col justify-between w-6 h-4">
                <div className="w-full h-[2px] bg-black transition-all duration-300 group-hover:w-4"></div>
                <div className="w-full h-[2px] bg-black transition-all duration-300 group-hover:w-2"></div>
                <div className="w-full h-[2px] bg-black transition-all duration-300 group-hover:w-5"></div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Hero Text */}
      <div className="absolute bottom-12 left-8 z-20">
        <h1 className="text-5xl md:text-7xl font-bold text-white">
          Welcome to Moltisanti
        </h1>
        <p className="mt-4 text-xl text-gray-200">
          Empowering Your Journey with Excellence
        </p>
      </div>

      {/* Smooth Cursor-Following Dot */}
      <motion.div
        className="absolute rounded-full bg-white pointer-events-none"
        style={{
          width: 15,
          height: 15,
          left: smoothX,
          top: smoothY,
        }}
      />
    </section>
  );
};

export default HeroSection;
