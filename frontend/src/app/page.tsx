"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Define an interface for projects
interface Project {
  id: string;
  name: string;
  // Additional fields can be added as required
}

// Custom hook to fetch projects based on username and token
const useProjects = (username: string, token: string) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username || !token) {
      setProjects([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetchProjects = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/projects/${username}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error fetching projects: ${response.statusText}`);
        }

        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err: never) {
        setError(err.message);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [username, token]);

  return { projects, loading, error };
};

const HeroSection = () => {
  const router = useRouter();

  // Authentication state and error
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [initError, setInitError] = useState<string | null>(null);

  // Menu toggle
  const [menuOpen, setMenuOpen] = useState(false);

  // Cursor effect using Framer Motion
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 300, damping: 30 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseX.set(e.clientX - 7.5);
    mouseY.set(e.clientY - 7.5);
  };

  // Check for authentication details on mount (client-only)
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedToken = localStorage.getItem("authToken");

    if (!storedUsername || !storedToken) {
      setInitError("User not authenticated");
      setIsLoggedIn(false);
      setUsername("");
      setToken("");
      return;
    }

    setIsLoggedIn(true);
    setUsername(storedUsername);
    setToken(storedToken);
  }, []);

  // Use custom hook to fetch projects
  const { projects, loading: projectsLoading, error: projectsError } = useProjects(username, token);

  // Logout functionality
  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setUsername("");
    setToken("");
    router.push("/"); // Redirect to the login page
  };

  const errorMessage = initError || projectsError;

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
              background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)",
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
              </div>
          )}

          {/* Menu Button */}
          <button
              className="group flex justify-center items-center w-[55px] h-[45px] rounded-full bg-white transition-all duration-300 hover:bg-gray-200 relative"
              onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="flex flex-col justify-between w-6 h-4">
              <div className="w-full h-[2px] bg-black transition-all duration-300 group-hover:w-4"></div>
              <div className="w-full h-[2px] bg-black transition-all duration-300 group-hover:w-2"></div>
              <div className="w-full h-[2px] bg-black transition-all duration-300 group-hover:w-5"></div>
            </div>
          </button>
        </div>

        {/* Dashboard Menu */}
        {menuOpen && (
            <div className="absolute top-20 right-0 bg-white text-black rounded-lg shadow-lg w-64 p-4">
              {isLoggedIn ? (
                  <>
                    {projectsLoading ? (
                        <p>Loading projects...</p>
                    ) : projects.length > 0 ? (
                        <div>
                          <h2 className="text-lg font-semibold mb-2">Your Projects</h2>
                          <ul>
                            {projects.map((project) => (
                                <li
                                    key={project.id}
                                    className="p-2 cursor-pointer hover:bg-gray-200 rounded transition"
                                    onClick={() => router.push(`/project/${project.id}`)}
                                >
                                  {project.name}
                                </li>
                            ))}
                          </ul>
                          <button
                              className="w-full bg-black text-white py-2 mt-2 rounded-lg transition hover:bg-gray-800"
                              onClick={() => router.push("/create_project")}
                          >
                            Create Project
                          </button>
                        </div>
                    ) : (
                        <button
                            className="w-full bg-black text-white py-2 mt-2 rounded-lg transition hover:bg-gray-800"
                            onClick={() => router.push("/create_project")}
                        >
                          Create Project
                        </button>
                    )}
                  </>
              ) : (
                  <p className="text-center text-gray-700">You must log in.</p>
              )}
              {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
            </div>
        )}

        {/* Hero Text */}
        <div className="absolute bottom-50 left-8 z-1000">
          <h1 className="text-5xl md:text-7xl font-bold text-white">Welcome to Moltisanti</h1>
          <p className="mt-4 text-2xl text-gray-200">
            Unleash your creativity with our cutting-edge architectural design platform.
          </p>
          <p className="mt-4 text-2xl text-gray-200">Select from a range of room layouts, customize every detail with precision, and visualize your space in stunning 3D.</p>
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
