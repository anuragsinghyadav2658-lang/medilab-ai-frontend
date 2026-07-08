import {
  Send,
  Mic,
  User,
  Bot,
  Loader2,
  Sparkles,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Copy,
  Play,
  Pause,
  MessageSquare,
  History,
  Clock,
  Plus,
  X,
  MoreVertical,
  Trash2,
  Edit2,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { chatWithAi } from "../services/api";
import { motion } from "framer-motion";

const AiChatPage = () => {
  // --- PURANE MISSING STATES YAHAN ADD KARNE HAIN ---
  const [chatToDelete, setChatToDelete] = useState(null);
  const [chatToRename, setChatToRename] = useState(null);
  const [renameInput, setRenameInput] = useState("");
  const [uploadedReportName, setUploadedReportName] = useState("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  // Stop speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // --- NAYA: Dropdown aur Delete Chat ka logic ---
  const [activeDropdown, setActiveDropdown] = useState(null);

  const confirmDeleteChat = () => {
    setChatSessions((prev) => {
      // Exact ID se filter karega, koi undefined kachra nahi bachega
      const updatedSessions = prev.filter((c) => c.id !== chatToDelete);
      localStorage.setItem(
        "medilab_all_chats",
        JSON.stringify(updatedSessions),
      );
      return updatedSessions;
    });

    if (currentChatId === chatToDelete) {
      startNewChat();
    }
    setChatToDelete(null);
    setActiveDropdown(null);
  };

  const confirmRenameChat = () => {
    if (!renameInput.trim()) return;
    setChatSessions((prev) => {
      const updatedSessions = prev.map((c) =>
        c.id === chatToRename ? { ...c, title: renameInput } : c,
      );
      localStorage.setItem(
        "medilab_all_chats",
        JSON.stringify(updatedSessions),
      );
      return updatedSessions;
    });
    setChatToRename(null);
  };

  // 1. Naye States (History Toggle aur Chat Sessions ke liye)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState(() => {
    const saved = localStorage.getItem("medilab_all_chats");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState(() => {
    const saved = localStorage.getItem("medilab_current_chat_id");
    return saved || Date.now().toString();
  });

  // 2. Current Messages state (Jo active chat id par depend karega)
  const [messages, setMessages] = useState(() => {
    const savedSessions = localStorage.getItem("medilab_all_chats");
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      const activeChat = parsed.find(
        (c) => c.id === localStorage.getItem("medilab_current_chat_id"),
      );
      if (activeChat) return activeChat.messages;
    }
    return [
      {
        id: 1,
        text: "Hello! I am MediLab AI. How can I help you today?",
        sender: "ai",
      },
    ];
  });

  // --- NAYA SMART AUTO-SWITCH & DEDUPLICATION LOGIC ---
  useEffect(() => {
    const savedReportName = localStorage.getItem(
      "medilab_uploaded_report_name",
    );

    if (savedReportName) {
      const existingSessions = JSON.parse(
        localStorage.getItem("medilab_all_chats") || "[]",
      );

      // Check karo ki is report ke naam ka chat pehle se exist karta hai kya?
      const foundSession = existingSessions.find(
        (c) => c.title === savedReportName,
      );

      if (foundSession) {
        // Agar pehle se baat hui hai is report par, toh sidha wahi purani chat khol do (No duplicates)
        setCurrentChatId(foundSession.id);
        setMessages(foundSession.messages);
        localStorage.setItem("medilab_current_chat_id", foundSession.id);
      } else {
        // Agar nayi report hai (jiska chat nahi bana), toh fresh chat start karo specifically is report ke liye
        const newId = Date.now().toString();
        setCurrentChatId(newId);
        setMessages([
          {
            id: 1,
            text: `Hello! I have analyzed your report: "${savedReportName}". What would you like to ask about it?`,
            sender: "ai",
          },
        ]);
        localStorage.setItem("medilab_current_chat_id", newId);
      }
    }
  }, []); // Ye sirf page load hone par ek baar chalega
  // ----------------------------------------------------

  // --- MISSING REF & SCROLL LOGIC YAHAN ADD KARNA HAI ---
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null); // Naya ref container ke liye

  // Auto-scroll to bottom whenever messages update
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 3. Jab bhi messages update hon, usko current session me save karo
  useEffect(() => {
    setChatSessions((prevSessions) => {
      const existingSessionIndex = prevSessions.findIndex(
        (c) => c.id === currentChatId,
      );
      let updatedSessions = [...prevSessions];

      if (existingSessionIndex > -1) {
        // NAYA LOGIC: Check karo ki naya message aaya hai ya sirf chat load hui hai
        const oldMessageCount =
          updatedSessions[existingSessionIndex].messages?.length || 0;
        const newMessageCount = messages?.length || 0;

        const activeChat = {
          ...updatedSessions[existingSessionIndex],
          messages,
        };

        if (newMessageCount > oldMessageCount) {
          // Agar naya message add hua hai, tabhi purani jagah se hata kar top pe lagao
          updatedSessions.splice(existingSessionIndex, 1);
          updatedSessions.unshift(activeChat);
        } else {
          // Agar sirf chat open ki hai, toh usko usi jagah par hi update kardo (position change nahi hogi)
          updatedSessions[existingSessionIndex] = activeChat;
        }
      } else {
        // Agar nayi chat hai toh top par hi aayegi
        const savedReportName = localStorage.getItem(
          "medilab_uploaded_report_name",
        );
        const userMsg = messages.find((m) => m.sender === "user");
        const title =
          savedReportName ||
          (userMsg ? userMsg.text.slice(0, 30) + "..." : "New Chat");

        updatedSessions = [
          { id: currentChatId, title, messages },
          ...updatedSessions,
        ];
      }

      localStorage.setItem(
        "medilab_all_chats",
        JSON.stringify(updatedSessions),
      );
      localStorage.setItem("medilab_current_chat_id", currentChatId);
      return updatedSessions;
    });
  }, [messages, currentChatId]);

  // 4. New Chat banane ka function
  const startNewChat = () => {
    // ZAROORI: Report ka naam clear karo taaki ye normal general chat ban jaye
    localStorage.removeItem("medilab_uploaded_report_name");

    const newId = Date.now().toString();
    setCurrentChatId(newId);
    setMessages([
      {
        id: 1,
        text: "Hello! I am MediLab AI. How can I help you today?",
        sender: "ai",
      },
    ]);
    localStorage.setItem("medilab_current_chat_id", newId);
  };

  // 5. Purani chat load karne ka function
  const loadChat = (chatId) => {
    // ZAROORI: Jab doosri chat load karein to purane report ka naam clear kar do taaki mix na ho
    localStorage.removeItem("medilab_uploaded_report_name");

    const session = chatSessions.find((c) => c.id === chatId);
    if (session) {
      setCurrentChatId(chatId);
      setMessages(session.messages);
    }
  };

  // Text-to-Speech (AI Voice Output) Logic
  // Pause/Play Toggle Function
  const togglePausePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  // Text-to-Speech (AI Voice Output) Logic
  const handleSpeech = (text, msgId) => {
    if (!("speechSynthesis" in window)) {
      alert(
        "Sorry, your browser does not support Text-to-Speech. Please try another browser.",
      );
      return;
    }

    // Purana audio roko (Chahe koi naya message ho ya same message repeat ho)
    window.speechSynthesis.cancel();

    // 50ms ka timeout lagaya hai taaki cancel() ka event properly clear ho jaye
    // aur double-click par top bar gayab na ho
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.onend = () => {
        setSpeakingMessageId(null);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        console.error("SpeechSynthesisUtterance error:", event);
        // Error handling me immediately null nahi kar rahe, taaki cancel error se issue na ho
      };

      // State update karke naya audio shuru karo
      setSpeakingMessageId(msgId);
      setIsPaused(false);
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  // Voice Input (Speech-to-Text) Logic
  const handleMicClick = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Sorry, your browser does not support Speech Recognition. Please try Chrome or Edge.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // Chat Submission Logic
  const handleSendMessage = async (e) => {
    e?.preventDefault();

    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");

    // Add User Message to UI
    const newUserMsg = { id: Date.now(), text: userMessage, sender: "user" };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // Backend API Call
      const aiResponseText = await chatWithAi(userMessage);

      // Add AI Message to UI
      const newAiMsg = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: "ai",
      };
      setMessages((prev) => [...prev, newAiMsg]);
    } catch (error) {
      console.error("Error communicating with AI:", error);
      const errorMsg = {
        id: Date.now() + 1,
        text: "Sorry, I am having trouble connecting to the server. Please try again.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[85vh] flex bg-glass-navy backdrop-blur-md border border-navy-lightest rounded-2xl shadow-glass overflow-hidden transition-all duration-300">
      {/* RIGHT SIDE: Main Chat Area */}
      <div
        className={`flex-1 flex flex-col relative transition-all duration-300 ${isHistoryOpen ? "md:pr-72" : "w-full"}`}
      >
        {/* Header */}
        <div className="bg-navy-light/60 p-4 border-b border-navy-lightest flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-mint shadow-mint-glow flex items-center justify-center">
            <Sparkles className="text-navy" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              MediLab AI Assistant
            </h2>
            <p className="text-xs text-mint flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-mint animate-pulse"></span>{" "}
              Context-Aware Mode Active
            </p>
          </div>

          {/* RIGHT SIDE ITEMS CONTAINER */}
          <div className="ml-auto flex items-center gap-3">
            {/* Play/Pause Button */}
            {speakingMessageId && (
              <button
                onClick={togglePausePlay}
                className="relative group w-10 h-10 flex items-center justify-center rounded-full bg-[#2a45a3] text-white hover:bg-[#203682] transition-all shadow-lg"
              >
                {isPaused ? (
                  <Play
                    size={20}
                    strokeWidth={2.5}
                    fill="none"
                    className="ml-1"
                  />
                ) : (
                  <Pause size={20} strokeWidth={2.5} fill="none" />
                )}
                <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#e3e3e3] px-3 py-1.5 text-[13px] font-medium text-gray-900 opacity-0 transition-all duration-200 group-hover:opacity-100 pointer-events-none z-50">
                  {isPaused ? "Resume" : "Pause"}
                </span>
              </button>
            )}

            {/* NAYA: History Toggle Button (Clock Icon) */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-mint hover:bg-mint/10 transition-colors relative group"
            >
              <History size={22} />
              <span className="absolute top-full mt-2 right-0 whitespace-nowrap rounded-xl bg-[#e3e3e3] px-3 py-1.5 text-[12px] font-medium text-gray-900 opacity-0 transition-all duration-200 group-hover:opacity-100 pointer-events-none z-50">
                Chat History
              </span>
            </button>
          </div>
        </div>

        {/* NAYA: Side-by-Side History Panel */}
        <AnimatePresence>
          {isHistoryOpen && (
            <>
              {/* NAYA OVERLAY: Screen par bahar kahin bhi click karne par panel close karne ke liye */}
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0 } }}
                className="absolute inset-0 z-40 bg-black/50 md:bg-transparent backdrop-blur-[2px] md:backdrop-blur-none cursor-pointer"
                onClick={() => setIsHistoryOpen(false)}
              ></motion.div>

              <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute top-0 right-0 h-full w-[85%] max-w-72 bg-navy-light border-l border-navy-lightest shadow-[0_0_40px_rgba(0,0,0,0.5)] md:shadow-[-10px_0_30px_rgba(0,0,0,0.15)] z-50 flex flex-col"
              >
                {/* Panel Header */}
                <div className="p-4 border-b border-navy-lightest flex items-center justify-between">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <History size={18} className="text-mint" /> Recent Chats
                  </h3>

                  {/* YAHAN CHANGE KARNA HAI - Close Button with Tooltip */}
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className="relative group text-gray-400 hover:text-white p-1 rounded-md hover:bg-navy transition-colors"
                  >
                    <X size={20} />
                    {/* Hover par dikhne wala 'Close' text */}
                    <span className="absolute top-full mt-2 right-0 whitespace-nowrap rounded-xl bg-[#e3e3e3] px-2 py-1 text-[12px] font-medium text-gray-900 opacity-0 transition-all duration-200 group-hover:opacity-100 pointer-events-none z-50">
                      Close
                    </span>
                  </button>
                </div>

                {/* New Chat Button */}
                <div className="p-4">
                  <button
                    onClick={() => {
                      startNewChat();
                      setIsHistoryOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-mint text-navy hover:bg-mint/90 py-2.5 rounded-xl transition-all font-bold shadow-mint-glow"
                  >
                    <Plus size={18} /> Start New Chat
                  </button>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                  {chatSessions.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center mt-4">
                      No history yet
                    </p>
                  ) : (
                    chatSessions.map((chat, index) => {
                      // Bulletproof key: Agar purani localStorage me ID duplicate/missing hai, toh bhi ye clash nahi karega
                      const rowKey = `${chat.id}-${index}`;

                      return (
                        <div
                          key={rowKey}
                          className="relative group w-full flex items-center"
                        >
                          {/* Main Chat Load Button */}
                          <button
                            onClick={() => {
                              if (chat.id) loadChat(chat.id);
                              setIsHistoryOpen(false);
                            }}
                            className={`flex-1 flex items-center gap-2 md:gap-3 text-left p-3 rounded-xl transition-all text-sm pr-8 w-full border overflow-hidden ${
                              String(currentChatId) === String(chat.id)
                                ? "bg-mint/10 border-mint text-mint shadow-mint-glow font-medium"
                                : "bg-navy/30 border-transparent text-gray-400 hover:bg-navy-light hover:border-navy-lightest hover:text-gray-200"
                            }`}
                          >
                            <MessageSquare
                              size={16}
                              className={`flex-shrink-0 ${
                                String(currentChatId) === String(chat.id)
                                  ? "text-mint"
                                  : "text-gray-500 group-hover:text-gray-400"
                              }`}
                            />

                            <span className="truncate">
                              {chat.title || "Unknown Chat"}
                            </span>
                          </button>

                          {/* 3-Dot Menu Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(
                                activeDropdown === rowKey ? null : rowKey,
                              );
                            }}
                            className={`absolute right-2 p-1.5 rounded-lg transition-all ${
                              activeDropdown === rowKey
                                ? "text-mint opacity-100"
                                : "text-gray-500 hover:text-mint opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {/* Dropdown Menu */}
                          {activeDropdown === rowKey && (
                            <div className="absolute right-8 top-8 w-28 bg-navy border border-navy-lightest rounded-xl shadow-xl z-50 overflow-hidden flex flex-col">
                              {/* Rename Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setChatToRename(chat.id);
                                  setRenameInput(chat.title || "");
                                  setActiveDropdown(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-navy-light hover:text-white transition-colors border-b border-navy-lightest"
                              >
                                <Edit2 size={14} /> Rename
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setChatToDelete(chat.id);
                                  setActiveDropdown(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Chat Messages Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative z-0"
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* AI Avatar */}
              {msg.sender === "ai" && (
                <div className="w-8 h-8 rounded-lg bg-mint-tint flex items-center justify-center text-mint flex-shrink-0 mt-1">
                  <Bot size={18} />
                </div>
              )}

              {/* Message Bubble (Gemini Style) */}
              <div
                className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-mint text-navy rounded-tr-sm font-medium shadow-md"
                    : "bg-navy-light border border-navy-lightest text-gray-200 rounded-tl-sm"
                }`}
              >
                {/* Main Chat Text */}
                <div>{msg.text}</div>

                {/* Action Bar - Sirf AI ke message me dikhega */}
                {msg.sender === "ai" && (
                  <div className="flex items-center gap-4 mt-4 text-gray-400">
                    {/* Good Response */}
                    <button className="relative group hover:text-mint hover:bg-mint/10 p-1.5 rounded-full transition-all">
                      <ThumbsUp size={18} />
                      {/* Gemini Style Bottom Tooltip with Arrow */}
                      <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#e3e3e3] px-3 py-1.5 text-[12px] font-medium text-gray-900 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 pointer-events-none z-50">
                        Good response
                        {/* Triangle Arrow */}
                        <svg
                          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 text-[#e3e3e3]"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <path d="M4 0l4 4H0z" />
                        </svg>
                      </span>
                    </button>

                    {/* Bad Response */}
                    <button className="relative group hover:text-mint hover:bg-mint/10 p-1.5 rounded-full transition-all">
                      <ThumbsDown size={18} />
                      <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#e3e3e3] px-3 py-1.5 text-[12px] font-medium text-gray-900 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 pointer-events-none z-50">
                        Bad response
                        <svg
                          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 text-[#e3e3e3]"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <path d="M4 0l4 4H0z" />
                        </svg>
                      </span>
                    </button>

                    {/* Redo */}
                    <button className="relative group hover:text-mint hover:bg-mint/10 p-1.5 rounded-full transition-all">
                      <RotateCcw size={18} />
                      <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#e3e3e3] px-3 py-1.5 text-[12px] font-medium text-gray-900 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 pointer-events-none z-50">
                        Redo
                        <svg
                          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 text-[#e3e3e3]"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <path d="M4 0l4 4H0z" />
                        </svg>
                      </span>
                    </button>

                    {/* Copy response */}
                    <button
                      onClick={() => navigator.clipboard.writeText(msg.text)}
                      className="relative group hover:text-mint hover:bg-mint/10 p-1.5 rounded-full transition-all"
                    >
                      <Copy size={18} />
                      <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#e3e3e3] px-3 py-1.5 text-[12px] font-medium text-gray-900 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 pointer-events-none z-50">
                        Copy response
                        <svg
                          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 text-[#e3e3e3]"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <path d="M4 0l4 4H0z" />
                        </svg>
                      </span>
                    </button>

                    {/* Speaker Button */}
                    <button
                      type="button"
                      onClick={() => handleSpeech(msg.text, msg.id)}
                      className="relative group ml-auto p-1.5 rounded-full transition-all hover:text-mint hover:bg-mint/10"
                    >
                      <Volume2
                        size={18}
                        className={
                          speakingMessageId === msg.id
                            ? "text-mint animate-pulse"
                            : ""
                        }
                      />
                      <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#e3e3e3] px-3 py-1.5 text-[12px] font-medium text-gray-900 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 pointer-events-none z-50">
                        Listen
                        <svg
                          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 text-[#e3e3e3]"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <path d="M4 0l4 4H0z" />
                        </svg>
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-lg bg-navy-light border border-navy-lightest flex items-center justify-center text-gray-400 flex-shrink-0 mt-1">
                  <User size={18} />
                </div>
              )}
            </motion.div>
          ))}

          {/* Loading Indicator - Purana Bouncing Dots Animation */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3 w-full justify-start"
            >
              <div className="w-8 h-8 rounded-lg bg-mint-tint flex items-center justify-center text-mint flex-shrink-0 mt-1">
                <Bot size={18} />
              </div>

              {/* Pro level SMOOTH 3-dot animation */}
              <div className="px-4 py-5 bg-navy-light border border-navy-lightest rounded-2xl rounded-tl-sm flex items-center justify-center min-w-[60px]">
                <div className="flex gap-1.5 items-center">
                  <motion.div
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0,
                    }}
                    className="w-2.5 h-2.5 bg-mint rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2,
                    }}
                    className="w-2.5 h-2.5 bg-mint rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.4,
                    }}
                    className="w-2.5 h-2.5 bg-mint rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Invisible div to help auto-scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-navy-light/60 border-t border-navy-lightest relative z-10 w-full">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 bg-navy border border-navy-lightest rounded-xl p-1.5 focus-within:border-mint/50 focus-within:ring-1 focus-within:ring-mint/50 transition-all w-full"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isListening ? "Listening..." : "Type your health query here..."
              }
              className="flex-1 bg-transparent border-none text-white px-3 py-2 text-sm focus:outline-none focus:ring-0 placeholder-gray-500 min-w-0"
              disabled={isLoading}
            />

            {/* Microphone Button */}
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isLoading}
              className={`p-2.5 rounded-lg transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
                isListening
                  ? "bg-red-500/20 text-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  : "bg-transparent text-gray-400 hover:text-mint hover:bg-mint-tint"
              }`}
              title="Voice Input"
            >
              <Mic size={20} />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2.5 rounded-lg transition-all flex items-center justify-center flex-shrink-0 ${
                input.trim() && !isLoading
                  ? "bg-mint text-navy shadow-mint-glow hover:scale-105"
                  : "bg-navy-light text-gray-500 cursor-not-allowed"
              }`}
            >
              <Send
                size={20}
                className={input.trim() && !isLoading ? "ml-0.5" : ""}
              />
            </button>
          </form>
        </div>
      </div>
      {/* RENAME CONFIRMATION MODAL */}
      {chatToRename && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-navy border border-navy-lightest p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Rename Chat</h3>
            <input
              type="text"
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              autoFocus
              className="w-full bg-navy-light border border-navy-lightest rounded-lg px-4 py-2 text-white mb-6 focus:outline-none focus:border-mint"
              placeholder="Enter new name..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setChatToRename(null)}
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-navy-light transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRenameChat}
                className="px-4 py-2 rounded-lg bg-mint text-navy font-bold hover:bg-mint/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* DELETE CONFIRMATION MODAL YAHAN PASTE KARNA HAI */}
      {chatToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-navy border border-navy-lightest p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-2">Delete Chat?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure, you want to permanently delete this chat? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setChatToDelete(null)}
                className="px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-navy-light transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDeleteChat()}
                className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiChatPage;
