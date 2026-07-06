import React, { useState, useEffect } from "react";
import {
  User,
  Bell,
  Shield,
  LogOut,
  Mail,
  Smartphone,
  Lock,
  Save,
} from "lucide-react";

const Settings = () => {
  // Email by default OFF rakha hai
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [autoAnalysis, setAutoAnalysis] = useState(true);

  // Profile data ke liye states
  const [profile, setProfile] = useState({
    fullName: "Loading...",
    email: "Loading...",
    phone: "Loading...",
  });

  const [editedProfile, setEditedProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Page load hote hi backend se user ki detail laane ka logic
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(
          "http://localhost:8080/api/users/profile",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const fetchedData = {
            fullName: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
          };
          setProfile(fetchedData);
          setEditedProfile(fetchedData); // Input boxes mein dikhane ke liye
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  // Input change handle karne ka function
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => {
      const updated = { ...prev, [name]: value };
      // Check karna ki original data se kuch alag hai ya nahi
      setHasChanges(
        updated.fullName !== profile.fullName ||
          updated.email !== profile.email ||
          updated.phone !== profile.phone,
      );
      return updated;
    });
  };

  // Profile Save karne ka function
  const saveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Yahan hum PUT request bhejenge naye data ke sath
      const response = await fetch("http://localhost:8080/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editedProfile.fullName,
          email: editedProfile.email, // Email generally edit nahi karne dena chahiye, par abhi ke liye bhej rahe hain
          phone: editedProfile.phone,
        }),
      });

      if (response.ok) {
        setProfile(editedProfile); // Original state ko update kar do
        setHasChanges(false); // Save button chupa do
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Backend Integration: Toggle Email Alerts
  const toggleEmailAlerts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first to change settings!");
      return;
    }

    const newState = !emailAlerts;
    setEmailAlerts(newState);

    try {
      const response = await fetch(
        "http://localhost:8080/api/users/preferences/email-alerts",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ emailAlertsEnabled: newState }),
        },
      );

      if (!response.ok) {
        setEmailAlerts(!newState);
        console.error("Failed to update preference in database");
      } else {
        console.log("Email preference updated successfully!");
      }
    } catch (error) {
      setEmailAlerts(!newState);
      console.error("Error updating preference:", error);
    }
  };

  // Password Pop-up aur Data ke states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password save karne ka logic (Done button ke liye)
  const handleSavePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert("Pehle details daalo!");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords match nahi kar rahe!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        "http://localhost:8080/api/users/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        },
      );

      if (response.ok) {
        alert("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }); // Data clear karo
        setIsPasswordModalOpen(false); // Modal (pop-up) band kar do
      } else {
        const errText = await response.text();
        alert(`Failed: ${errText}`);
      }
    } catch (error) {
      console.error("Password update error:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">
          Manage your profile, preferences, and security.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-glass-navy backdrop-blur-md border border-navy-lightest rounded-2xl p-6 shadow-glass">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-mint flex items-center gap-2">
              <User size={20} /> Profile Details
            </h2>
            {/* Ye Save button tabhi dikhega jab hasChanges true hoga */}
            {hasChanges && (
              <button
                onClick={saveProfile}
                className="flex items-center gap-2 bg-mint text-navy px-4 py-2 rounded-xl font-bold hover:bg-mint/90 transition-all text-sm shadow-mint-glow"
              >
                <Save size={16} /> Save changes
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={editedProfile.fullName}
                  onChange={handleProfileChange}
                  className="w-full bg-navy border border-navy-lightest rounded-xl pl-10 pr-4 py-3 text-white focus:border-mint focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={editedProfile.email}
                  onChange={handleProfileChange}
                  className="w-full bg-navy border border-navy-lightest rounded-xl pl-10 pr-4 py-3 text-white focus:border-mint focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">
                Phone Number
              </label>
              <div className="relative w-full md:w-1/2 pr-0 md:pr-3">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Smartphone size={16} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  name="phone"
                  value={editedProfile.phone}
                  onChange={handleProfileChange}
                  className="w-full bg-navy border border-navy-lightest rounded-xl pl-10 pr-4 py-3 text-white focus:border-mint focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-glass-navy backdrop-blur-md border border-navy-lightest rounded-2xl p-6 shadow-glass">
          <h2 className="text-lg font-semibold text-mint flex items-center gap-2 mb-6">
            <Bell size={20} /> Notifications & Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-navy border border-navy-lightest rounded-xl">
              <div>
                <h3 className="text-white font-medium">Email Alerts</h3>
                <p className="text-sm text-gray-400">
                  Receive medical report summaries via email.
                </p>
              </div>
              <button
                onClick={toggleEmailAlerts}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center focus:outline-none ${emailAlerts ? "bg-mint" : "bg-gray-600"}`}
              >
                <div
                  className={`w-4 h-4 bg-navy rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${emailAlerts ? "translate-x-7" : "translate-x-1"}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-navy border border-navy-lightest rounded-xl">
              <div>
                <h3 className="text-white font-medium">SMS Notifications</h3>
                <p className="text-sm text-gray-400">
                  Get text alerts when AI analysis is complete.
                </p>
              </div>
              <button
                onClick={() => setSmsAlerts(!smsAlerts)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center focus:outline-none ${smsAlerts ? "bg-mint" : "bg-gray-600"}`}
              >
                <div
                  className={`w-4 h-4 bg-navy rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${smsAlerts ? "translate-x-7" : "translate-x-1"}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-navy border border-navy-lightest rounded-xl">
              <div>
                <h3 className="text-white font-medium">Auto AI Analysis</h3>
                <p className="text-sm text-gray-400">
                  Automatically analyze reports upon upload.
                </p>
              </div>
              <button
                onClick={() => setAutoAnalysis(!autoAnalysis)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center focus:outline-none ${autoAnalysis ? "bg-mint" : "bg-gray-600"}`}
              >
                <div
                  className={`w-4 h-4 bg-navy rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${autoAnalysis ? "translate-x-7" : "translate-x-1"}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-glass-navy backdrop-blur-md border border-navy-lightest rounded-2xl p-6 shadow-glass">
          <h2 className="text-lg font-semibold text-mint flex items-center gap-2 mb-6">
            <Shield size={20} /> Security & Account
          </h2>

          {/* Buttons yahan fix kar diye hain */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex-1 py-3 px-6 bg-transparent border border-navy-lightest text-gray-300 rounded-xl hover:text-white hover:border-gray-500 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Lock size={18} /> Change Password
            </button>
          </div>

          <div className="pt-4 border-t border-navy-lightest">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              className="text-red-400 hover:text-red-300 font-medium flex items-center gap-2 transition-colors w-fit"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </div>
      {/* Password Modal (Pop-up) */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-navy border border-navy-lightest p-6 rounded-2xl w-full max-w-md shadow-glass">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock size={20} className="text-mint" /> Change Password
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full bg-navy border border-navy-lightest rounded-xl px-4 py-3 text-white focus:border-mint focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full bg-navy border border-navy-lightest rounded-xl px-4 py-3 text-white focus:border-mint focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full bg-navy border border-navy-lightest rounded-2xl px-4 py-3 text-white focus:border-mint focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  }); // Cancel pe clear kar do
                }}
                className="flex-1 py-3 px-4 bg-transparent border border-navy-lightest text-gray-300 rounded-xl hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePassword}
                className="flex-1 py-3 px-4 bg-mint text-navy rounded-2xl font-bold hover:bg-mint/90 transition-colors shadow-mint-glow"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
