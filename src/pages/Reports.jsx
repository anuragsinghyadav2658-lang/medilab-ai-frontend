import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import ReportPrint from "../components/reports/ReportPrint";
import {
  Activity,
  Heart,
  Droplet,
  Thermometer,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit2,
} from "lucide-react";
import { fetchReports } from "../services/api";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showAllReports, setShowAllReports] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");

  const handleEditClick = () => {
    setEditedSummary(
      selectedReport
        ? selectedReport.aiSummary
        : "Based on the latest comprehensive blood panel...",
    );
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    if (selectedReport) {
      setSelectedReport({ ...selectedReport, aiSummary: editedSummary });
    }
    setIsEditing(false);
  };

  // Naya Filter Logic
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      (report.fileName &&
        report.fileName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (report.id && report.id.toString().includes(searchQuery));

    // Assuming backend returns date in 'createdAt' or 'date' field
    const reportDate = report.createdAt || report.date || "";
    const matchesDate = selectedDate ? reportDate.includes(selectedDate) : true;

    return matchesSearch && matchesDate;
  });

  // Purane 'visibleReports' logic ko is naye filtered array par update karo
  const visibleReports = showAllReports
    ? filteredReports
    : filteredReports.slice(0, 5);

  // Vitals State with fallback defaults
  const [vitals, setVitals] = useState([
    {
      name: "Heart Rate",
      value: "00 bpm",
      status: "Normal",
      icon: Heart,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
    },
    {
      name: "Blood Pressure",
      value: "00/80",
      status: "Optimal",
      icon: Activity,
      color: "text-mint",
      bg: "bg-mint-tint",
    },
    {
      name: "Blood Sugar",
      value: "00 mg/dL",
      status: "Normal",
      icon: Droplet,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      name: "Temperature",
      value: "00.0 °F",
      status: "Normal",
      icon: Thermometer,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
  ]);

  // Hook 1: Data Fetching and Initial Extraction Trigger
  useEffect(() => {
    const getReports = async () => {
      try {
        const data = await fetchReports();
        setReports(data.reverse()); // Latest report first

        if (data && data.length > 0) {
          const latest = data[0];
          setSelectedReport(latest); // By default sabse latest select kar do
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };
    getReports();
  }, []);

  // Hook 2: Jab bhi selectedReport change ho tab vitals update karo aur console me dikhao
  useEffect(() => {
    if (selectedReport) {
      extractVitals(selectedReport.aiSummary);
      console.log("Selected AI Summary:", selectedReport.aiSummary);
      // NAYI LINE: File ka naam chat ke liye save kar rahe hain
      localStorage.setItem(
        "medilab_uploaded_report_name",
        selectedReport.fileName,
      );
    }
  }, [selectedReport]);

  // Bulletproof Multi-Format Case-Insensitive Regex Parser Logic
  const extractVitals = (summary) => {
    if (!summary) return;

    // Super flexible pattern matching across varied sentence framing
    const hrMatch = summary.match(
      /(?:heart\s*rate|hr)(?:\s*of|\s*level|\s*:|\s+)*(\d{2,3})/i,
    );
    const bpMatch =
      summary.match(/\[BP:\s*([\d\/]+)\]/i) ||
      summary.match(
        /(?:blood\s*pressure|bp)(?:\s*of|\s*level|\s*:|\s+)*(\d{2,3}(?:\/\d{2,3})?)/i,
      );
    const sugarMatch = summary.match(
      /(?:blood\s*sugar|sugar)(?:\s*of|\s*level|\s*:|\s+)*(\d{2,3})/i,
    );
    const tempMatch = summary.match(
      /(?:temperature|temp)(?:\s*of|\s*level|\s*:|\s+)*(\d{2,3}(?:\.\d+)?)/i,
    );

    setVitals((prev) =>
      prev.map((vital) => {
        if (vital.name === "Heart Rate" && hrMatch) {
          return { ...vital, value: `${hrMatch[1]} bpm` };
        }
        if (vital.name === "Blood Pressure" && bpMatch) {
          return { ...vital, value: bpMatch[1] };
        }
        if (vital.name === "Blood Sugar" && sugarMatch) {
          return { ...vital, value: `${sugarMatch[1]} mg/dL` };
        }
        if (vital.name === "Temperature" && tempMatch) {
          return { ...vital, value: `${tempMatch[1]} °F` };
        }
        return vital; // Automatically retains the standard fallback defaults if match fails
      }),
    );
  };

  const handleWhatsAppShare = () => {
    if (!selectedReport) return;

    const patientName = selectedReport.patientName || "Patient";
    const patientPhone = selectedReport.patientPhone || ""; // Ensure country code is handled in DB or add here like `91${patientPhone}` if needed
    const summary =
      selectedReport.aiSummary || "Check my latest medical report analysis.";

    const rawMessage = `Hello ${patientName}, Aapki medical report ka analysis ready hai. Summary: \n\n${summary}`;
    const encodedMessage = encodeURIComponent(rawMessage);

    window.open(
      `https://wa.me/${patientPhone}?text=${encodedMessage}`,
      "_blank",
    );
  };

  // Framer motion variants for seamless layout rendering
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      <div className="max-w-6xl mx-auto print:hidden">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Patient Reports
          </h1>
          <p className="text-gray-400">
            Detailed AI analysis and vital signs overview.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6"
        >
          {/* Left Side: Dynamic Metric Cards & Historical Database Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Dynamic Vitals Tracking Display Blocks yahan map ho rahe hain */}

            {vitals.map((vital, index) => {
              const Icon = vital.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-glass-navy backdrop-blur-md border border-navy-lightest p-5 rounded-2xl shadow-glass flex items-center gap-4 hover:border-mint/30 transition-colors"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${vital.bg} ${vital.color}`}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{vital.name}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-xl font-bold text-white">
                        {vital.value}
                      </h3>
                      <span className="text-xs font-medium text-mint bg-mint-tint px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle size={10} /> {vital.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Recent Uploads Grid Controller */}
            <motion.div
              variants={itemVariants}
              className="sm:col-span-2 lg:col-span-4 bg-glass-navy backdrop-blur-md border border-navy-lightest p-6 rounded-2xl shadow-glass mt-2"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">
                    Recent Uploads
                  </h3>
                  {loading && (
                    <Loader2 size={18} className="text-mint animate-spin" />
                  )}
                </div>

                {/* Naya Search Bar & Date Picker */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Search Patient Name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-2 bg-navy-light border border-navy-lightest rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-mint transition-colors w-full sm:w-56"
                  />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 bg-navy-light border border-navy-lightest rounded-xl text-sm text-gray-300 focus:outline-none focus:border-mint transition-colors w-full sm:w-auto [color-scheme:dark]"
                  />
                  {filteredReports.length > 5 && (
                    <button
                      onClick={() => setShowAllReports(!showAllReports)}
                      className="text-sm text-mint hover:underline focus:outline-none whitespace-nowrap ml-1"
                    >
                      {showAllReports ? "Show Less" : "Show All"}
                    </button>
                  )}
                </div>
              </div>

              {/* Main Scrollable Record Container mapping actual medical database records */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {!loading && filteredReports.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">
                    No reports found for the selected filters.
                  </p>
                ) : (
                  visibleReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`flex flex-col p-4 cursor-pointer rounded-xl transition-all ${
                        selectedReport?.id === report.id
                          ? "bg-navy border-mint shadow-mint-glow"
                          : "bg-navy-light border border-navy-lightest hover:border-mint/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-mint-tint rounded-lg text-mint flex-shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-white text-sm font-medium truncate">
                            {report.fileName}
                          </p>
                          <p className="text-gray-400 text-xs">
                            ID: #{report.id} • Type:{" "}
                            {report.fileType
                              ? report.fileType.split("/")[1] || report.fileType
                              : "Unknown"}
                          </p>
                        </div>
                      </div>

                      {/* Integrated Text Analytics Presentation */}
                      <div className="p-3 bg-navy rounded-lg border border-navy-lightest">
                        <p className="text-gray-300 text-xs line-clamp-2">
                          <span className="text-mint font-semibold mr-1">
                            AI Analysis:
                          </span>
                          {report.aiSummary}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Side Panel: AI Global Insights Canvas */}
          <motion.div
            variants={itemVariants}
            className="bg-glass-navy backdrop-blur-md border border-mint/20 p-6 rounded-2xl shadow-mint-glow relative overflow-hidden flex flex-col h-full"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-mint/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-mint text-navy rounded-md shadow-mint-glow">
                <Activity size={18} />
              </div>
              <h2 className="text-xl font-bold text-white flex-1">
                Overall Summary
              </h2>

              {/* Edit Button */}
              {!isEditing && (
                <button
                  onClick={handleEditClick}
                  className="p-1.5 text-gray-400 hover:text-mint hover:bg-mint/10 rounded-lg transition-colors focus:outline-none"
                >
                  <Edit2 size={18} />
                </button>
              )}
            </div>

            {/* Displays either default analytical placeholders or live real-time analysis payload based on Clicked Report */}
            <div className="flex-1 space-y-4 text-sm text-gray-300 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
              {isEditing ? (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    className="w-full h-48 p-3 bg-navy-light border border-mint/40 rounded-xl text-white focus:outline-none focus:border-mint resize-none custom-scrollbar"
                    placeholder="Edit patient summary here..."
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveClick}
                      className="px-5 py-2 bg-mint text-navy font-semibold rounded-lg hover:brightness-110 transition-all text-sm shadow-mint-glow"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {selectedReport ? (
                    <p className="whitespace-pre-wrap leading-relaxed bg-navy/40 p-3 rounded-xl border border-navy-lightest">
                      {selectedReport.aiSummary}
                    </p>
                  ) : (
                    <>
                      <p>
                        Based on the latest comprehensive blood panel, all vital
                        signs are within the{" "}
                        <strong className="text-mint">optimal range</strong>.
                      </p>
                      <p>
                        Hemoglobin levels have improved since the last checkup.
                        Cholesterol is well-managed, but maintaining a
                        low-sodium diet is recommended to keep blood pressure at
                        optimal levels.
                      </p>
                    </>
                  )}

                  <div className="mt-4 p-3 bg-orange-400/10 border border-orange-400/20 rounded-xl flex gap-3 text-orange-200">
                    <AlertCircle
                      size={18}
                      className="text-orange-400 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-xs">
                      Vitamin D levels are slightly on the lower side. Consider
                      15 mins of morning sun exposure.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Buttons Container - Clean & Unified Style */}
            <div className="flex flex-col sm:flex-row w-full gap-3 mt-6">
              {/* Print Report Button */}
              <button
                onClick={() => window.print()}
                className="flex-1 w-full py-2.5 bg-transparent border border-mint text-mint font-medium rounded-xl hover:bg-mint hover:text-navy transition-all duration-300"
              >
                Print Report
              </button>

              {/* Share with Patient Button */}
              <button
                onClick={async () => {
                  try {
                    await navigator.share({
                      title: "Medical Report Analysis",
                      text:
                        selectedReport?.aiSummary ||
                        "Check my latest medical report analysis.",
                      url: window.location.href,
                    });
                  } catch (err) {
                    alert("Sharing not supported on this browser.");
                  }
                }}
                className="flex-1 w-full py-2.5 bg-transparent border border-mint text-mint font-medium rounded-xl hover:bg-mint hover:text-navy transition-all duration-300"
              >
                Share with Patient
              </button>

              {/* WhatsApp Share Button */}
              <button
                onClick={handleWhatsAppShare}
                className="flex-1 w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] text-white font-medium rounded-xl hover:bg-[#1ebe57] transition-all duration-300 shadow-lg"
              >
                <MessageCircle size={18} />
                WhatsApp
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Print Layout - Sirf Print karte waqt UI par aayega */}
      <div className="hidden print:block print:w-full print:absolute print:top-0 print:left-0 bg-white">
        <ReportPrint
          patientDetails={{
            name: selectedReport?.patientName || "Patient",
            age: selectedReport?.patientAge || "N/A",
            date: new Date().toLocaleDateString(),
          }}
          vitals={{
            testName: selectedReport?.fileName || "General Assessment",
            bp: vitals.find((v) => v.name === "Blood Pressure")?.value || "N/A",
            sugar: vitals.find((v) => v.name === "Blood Sugar")?.value || "N/A",
            heartRate:
              vitals.find((v) => v.name === "Heart Rate")?.value || "N/A",
          }}
          aiSummary={selectedReport?.aiSummary || "No analysis available."}
        />
      </div>
    </>
  );
};

export default Reports;
