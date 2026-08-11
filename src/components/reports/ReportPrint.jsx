// File: src/components/reports/ReportPrint.jsx

import React from "react";

const ReportPrint = ({
  clinicDetails = {
    logoUrl: "https://via.placeholder.com/80?text=LOGO",
    clinicName: "MediCare Clinic",
    doctorName: "Dr. Sharma",
  },
  patientDetails = {
    name: "Rahul Verma",
    age: "34 Yrs",
    date: new Date().toLocaleDateString(),
  },
  vitals = {
    testName: "Blood Test",
    bp: "120/80",
    sugar: "95 mg/dL",
    heartRate: "72 bpm",
  },
  aiSummary = "Aapka khoon thoda kam hai 10g/dL par, aamtor par ye 15g/dL hota hai to aapko thakawat feel ho sakti hai. Hari sabziya aur iron wali diet badhayein.",
}) => {
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-black p-10 mx-auto shadow-2xl print:shadow-none print:m-0 print:p-8 flex flex-col font-sans">
      {/* Top Header */}
      <div className="flex justify-between items-center border-b-2 border-gray-800 pb-6 mb-6">
        <div className="flex items-center gap-4">
          {clinicDetails.logoUrl && (
            <img
              src={clinicDetails.logoUrl}
              alt="Clinic Logo"
              className="w-16 h-16 object-contain"
            />
          )}
          <h1 className="text-3xl font-extrabold uppercase tracking-wide text-gray-900">
            {clinicDetails.clinicName}
          </h1>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-800">
            {clinicDetails.doctorName}
          </h2>
          <p className="text-sm text-gray-600">Consultant Physician</p>
        </div>
      </div>

      {/* Sub-header (Patient Details) */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mb-8 text-sm font-semibold text-gray-800 border border-gray-200">
        <p>
          <span className="text-gray-500">Patient Name:</span>{" "}
          {patientDetails.name}
        </p>
        <p>
          <span className="text-gray-500">Age:</span> {patientDetails.age}
        </p>
        <p>
          <span className="text-gray-500">Date:</span> {patientDetails.date}
        </p>
      </div>

      {/* Vitals Box */}
      <div className="mb-8 border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-5 py-3 border-b border-gray-300">
          <h3 className="text-lg font-bold text-gray-800">
            Test Vitals ({vitals.testName || "General Assessment"})
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-6 text-sm bg-white p-5">
          <div className="flex flex-col">
            <span className="text-gray-500 font-medium mb-1">
              Blood Pressure
            </span>
            <span className="font-bold text-gray-900 text-base">
              {vitals.bp || "N/A"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 font-medium mb-1">Blood Sugar</span>
            <span className="font-bold text-gray-900 text-base">
              {vitals.sugar || "N/A"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 font-medium mb-1">Heart Rate</span>
            <span className="font-bold text-gray-900 text-base">
              {vitals.heartRate || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="mb-8 flex-grow">
        <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">
          Detailed Summary
        </h3>
        <div className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap">
          {aiSummary}
        </div>
      </div>

      {/* Bottom Footer - Safety Note */}
      <div className="mt-auto pt-6 border-t border-gray-300 text-sm font-medium text-gray-500 text-center italic">
        "Yeh summary aapki aasani ke liye banayi gayi hai taaki aap apne test
        report ko aasan bhasha me samajh sakein. Kripya dawai ya ilaj ke liye
        hamesha apne Doctor ki salah maanein."
      </div>
    </div>
  );
};

export default ReportPrint;
