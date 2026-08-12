import React, { useState, useRef } from "react";
import { UploadCloud, File, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { uploadReport } from "../../services/api";

const ReportUploadCard = ({ patientId }) => {
  // Saare states component ke andar hi rahenge
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  // Drag and Drop Logic
  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = function(e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // Upload Logic
  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    if (!patientId) {
      alert("Please select or create a patient first!");
      return;
    }

    setIsUploading(true);
    try {
      // Updated API call jisme file ke sath patientId bhi jayega
      await uploadReport(file, patientId);

      localStorage.setItem("medilab_uploaded_report_name", file.name);
      alert("Report Uploaded & Analyzed Successfully!");

      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      alert("Error uploading report. Backend check karo!");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-glass-navy backdrop-blur-md border border-navy-lightest p-6 rounded-2xl shadow-glass w-full"
    >
      <h2 className="text-lg font-semibold text-white mb-4">
        Upload Medical Report
      </h2>

      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          dragActive
            ? "border-mint bg-mint-tint"
            : "border-navy-lightest hover:border-mint/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!file ? onButtonClick : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept=".pdf,.png,.jpg,.jpeg"
        />

        {!file ? (
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <UploadCloud size={40} className="text-mint animate-bounce" />
            <p className="text-gray-400 text-sm">
              Drag & drop or <span className="text-mint font-bold">browse</span>
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-navy p-3 rounded-lg border border-mint/20 cursor-default">
            <div className="flex items-center gap-2 text-mint">
              <File size={20} />
              <span className="text-sm truncate max-w-[200px] text-white font-medium">
                {file.name}
              </span>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-red-400 transition-colors p-1"
              disabled={isUploading}
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      <button
        disabled={!file || isUploading}
        onClick={handleUploadAndAnalyze}
        className={`w-full mt-4 py-2.5 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
          file && !isUploading
            ? "bg-mint text-navy hover:shadow-mint-glow cursor-pointer"
            : "bg-navy-lightest text-gray-500 cursor-not-allowed"
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Analyzing...
          </>
        ) : (
          "Analyze with AI"
        )}
      </button>
    </motion.div>
  );
};

export default ReportUploadCard;
