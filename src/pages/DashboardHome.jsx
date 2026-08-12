// File: src/pages/DashboardHome.jsx

import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReportUploadCard from "../components/dashboard/ReportUploadCard";
import { getLatestReport } from "../services/api";

const DashboardHome = () => {
  const isLoggedIn = localStorage.getItem("token");
  const [latestReport, setLatestReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // New UI State
  const [showModal, setShowModal] = useState(false);
  const [patientCreated, setPatientCreated] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState(null); // <--- YE NAYI LINE ADD KI HAI
  const [patientForm, setPatientForm] = useState({
    name: "",
    age: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await getLatestReport();
        if (data) setLatestReport(data);
      } catch (error) {
        console.error("Error fetching latest report:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  const handleInputChange = (e) => {
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New Patient Data Submitted:", patientForm);

    // NAYA CODE: Abhi ke liye ek Dummy ID de rahe hain taaki popup hat jaye
    setCurrentPatientId(1);

    setPatientCreated(true);
    setShowModal(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl mx-auto min-h-[80vh] flex flex-col justify-center items-center px-4 relative z-10"
      >
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
            Clinic Dashboard
          </h1>
          <p className="text-gray-400">
            Create a patient profile to upload and analyze medical reports.
          </p>
        </div>

        {/* Conditional UI: Add Patient Button OR Upload Component */}
        <div className="w-full">
          {!patientCreated ? (
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-5 text-xl bg-mint text-navy font-bold rounded-2xl shadow-mint-glow hover:scale-[1.02] transition-transform flex justify-center items-center gap-3"
            >
              <span className="text-3xl leading-none mb-1">+</span> Add New
              Patient
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* NAYA CODE: patientId pass kar diya */}
              <ReportUploadCard patientId={currentPatientId} />
            </motion.div>
          )}
        </div>

        {/* Latest Report Section */}
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

      {/* Patient Form Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-navy border border-navy-lightest rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-mint mb-6">
                Add New Patient
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={patientForm.name}
                    onChange={handleInputChange}
                    className="w-full bg-navy-light border border-navy-lightest rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-mint transition-colors"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    required
                    min="0"
                    value={patientForm.age}
                    onChange={handleInputChange}
                    className="w-full bg-navy-light border border-navy-lightest rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-mint transition-colors"
                    placeholder="Enter age"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={patientForm.phone}
                    onChange={handleInputChange}
                    className="w-full bg-navy-light border border-navy-lightest rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-mint transition-colors"
                    placeholder="e.g. +91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    required
                    rows="3"
                    value={patientForm.address}
                    onChange={handleInputChange}
                    className="w-full bg-navy-light border border-navy-lightest rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-mint transition-colors resize-none"
                    placeholder="Enter full address"
                  />
                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl bg-transparent border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-mint text-navy font-bold hover:brightness-110 transition-all shadow-mint-glow"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardHome;
