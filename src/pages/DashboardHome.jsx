import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReportUploadCard from "../components/dashboard/ReportUploadCard";
import { getLatestReport } from "../services/api";

const DashboardHome = () => {
  const isLoggedIn = localStorage.getItem("token");
  const [latestReport, setLatestReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Page load hote hi latest report fetch karne ka logic
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await getLatestReport();
        if (data) {
          setLatestReport(data);
        }
      } catch (error) {
        console.error("Error fetching latest report:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-2xl mx-auto min-h-[80vh] flex flex-col justify-center items-center px-4"
    >
      {/* NAYA: Responsive Login Button */}
      {!isLoggedIn && (
        <div className="w-full flex justify-end md:absolute md:top-6 md:right-8 z-50 mb-6 md:mb-0">
          <Link
            to="/login"
            className="flex items-center gap-2 px-6 py-2.5 bg-mint text-navy font-bold rounded-xl shadow-mint-glow hover:scale-105 transition-transform"
          >
            Login / Sign In
          </Link>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Diagnostic Dashboard
        </h1>
        <p className="text-gray-400">
          Upload your medical reports for instant AI-powered insights.
        </p>
      </div>

      {/* Upload Component */}
      <div className="w-full">
        <ReportUploadCard />
      </div>

      {/* Dynamic Latest Report Section (Original design se match karta hua) */}
      <div className="w-full mt-6">
        {loading ? (
          <p className="text-gray-500 text-center text-sm animate-pulse">
            Checking for recent insights...
          </p>
        ) : latestReport ? (
          <div className="bg-glass-navy backdrop-blur-md border border-navy-lightest p-6 rounded-2xl shadow-glass mt-4">
            <h3 className="text-lg font-semibold text-mint mb-3 flex items-center gap-2">
              Latest Analysis:{" "}
              <span className="text-white text-base font-normal">
                {latestReport.fileName}
              </span>
            </h3>
            <div className="p-4 bg-navy-light rounded-xl border border-navy-lightest">
              <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                {latestReport.aiSummary}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};

export default DashboardHome;
