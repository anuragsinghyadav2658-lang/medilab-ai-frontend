import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Activity,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // Navigation ke liye

const Login = () => {
  const navigate = useNavigate();

  // UI States
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form Data States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // API Logic States
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Smooth sliding and fading animations for form toggle
  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
  };

  // Backend se connect karne ka function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
    const payload = isLogin
      ? { email, password }
      : { fullName: name, email, password };

    try {
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Handle JSON ya plain text response gracefully
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (response.ok) {
        // Success: Token save karo aur dashboard jao
        localStorage.setItem("token", data.token || "dummy-token");
        navigate("/dashboard");
      } else {
        // Error: Backend se jo exact 'error' ya 'message' aaya hai wo dikhao
        setErrorMessage(
          data.error ||
            data.message ||
            "Authentication failed. Please try again.",
        );
      }
    } catch (error) {
      setErrorMessage("Server error. Please check if your backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-navy flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Blobs for 3D feel */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-mint/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
      />

      {/* Main Glassmorphism Container */}
      <div className="w-full max-w-5xl bg-glass-navy backdrop-blur-xl border border-mint/20 rounded-3xl shadow-glass flex flex-col md:flex-row overflow-hidden relative z-10 min-h-[600px]">
        {/* Left Side: 3D Animated Visuals */}
        <div className="w-full md:w-1/2 p-10 flex flex-col items-center justify-center relative bg-gradient-to-br from-navy-light to-navy">
          <motion.div
            animate={{ y: [-15, 15, -15], rotateZ: [-2, 2, -2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* 3D Floating Icon/Logo Setup */}
            <div className="w-32 h-32 bg-mint/10 border border-mint/30 rounded-2xl flex items-center justify-center shadow-mint-glow mb-8 backdrop-blur-md rotate-3 hover:rotate-0 transition-transform duration-500 cursor-pointer">
              <Activity size={64} className="text-mint" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 text-center">
              MediLab AI
            </h1>
            <p className="text-gray-400 text-center max-w-xs leading-relaxed">
              Secure, AI-powered medical analysis at your fingertips.
            </p>
          </motion.div>

          {/* Floating decorative elements */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="absolute top-20 right-20 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 backdrop-blur-sm"
          >
            <Shield size={24} className="text-blue-400" />
          </motion.div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-navy/50 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "signup"}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-md mx-auto"
            >
              <h2 className="text-3xl font-bold text-white mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-gray-400 mb-6">
                {isLogin
                  ? "Enter your credentials to access your dashboard."
                  : "Sign up to start analyzing your medical reports."}
              </p>

              {/* Error Message Display */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm font-medium">
                  {errorMessage}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Full Name Field (Only for Signup) */}
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full pl-11 pr-4 py-3 bg-navy text-white border border-navy-lightest rounded-xl focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-colors"
                    />
                  </motion.div>
                )}

                {/* Email Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full pl-11 pr-4 py-3 bg-navy text-white border border-navy-lightest rounded-xl focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-colors"
                  />
                </div>

                {/* Password Field with Eye Toggle */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-11 pr-12 py-3 bg-navy text-white border border-navy-lightest rounded-xl focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-colors"
                  />
                  {/* Eye Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-mint transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-4 bg-mint hover:bg-mint/90 text-navy font-bold rounded-xl flex items-center justify-center gap-2 transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? "Processing..."
                    : isLogin
                      ? "Sign In"
                      : "Create Account"}
                  {!isLoading && (
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  )}
                </button>
              </form>

              {/* Toggle Login/Signup */}
              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}{" "}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrorMessage(""); // Switch karne par error hata do
                    }}
                    className="text-mint hover:underline font-medium focus:outline-none"
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Login;
