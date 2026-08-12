import axios from "axios";

const BASE_URL = "https://medilab-ai-backend.onrender.com/api/reports";

const PATIENT_URL = "https://medilab-ai-backend.onrender.com/api/patients";

export const createPatient = async (patientData) => {
  try {
    const response = await axios.post(PATIENT_URL, patientData);
    return response.data;
  } catch (error) {
    console.error("Error creating patient:", error);
    throw error;
  }
};

// 1. Nayi actual file (PDF/Image) backend me save karne ke liye
export const uploadReport = async (file, patientId) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("patientId", patientId);

    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading report:", error);
    throw error;
  }
};

// 2. Database se saari reports fetch karne ke liye
export const fetchReports = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

// 3. AI Chatbot se baat karne ke liye
export const chatWithAi = async (message) => {
  try {
    const response = await axios.post(`${BASE_URL}/chat`, { message });
    return response.data;
  } catch (error) {
    console.error("Error in AI chat:", error);
    throw error;
  }
};

// 4. Dashboard ke liye sabse latest report fetch karne ke liye
export const getLatestReport = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/latest`);
    return response.data;
  } catch (error) {
    console.error("Error fetching latest report:", error);
    throw error;
  }
};
