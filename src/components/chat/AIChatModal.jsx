// import React, { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
// import { chatWithAi } from '../../services/api'; // API function import kar liya

// const AIChatModal = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [input, setInput] = useState('');
//   const [messages, setMessages] = useState([
//     { id: 1, sender: 'ai', text: 'Hello! I am MediLab AI. Aapki lab report ya health ke baare me koi bhi sawaal ho toh poochiye.' }
//   ]);
//   const [isTyping, setIsTyping] = useState(false); 
  
//   const messagesEndRef = useRef(null);

//   // Auto-scroll logic
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, isTyping]); 

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     // 1. User ka message UI me add karo
//     const userText = input;
//     const userMsg = { id: Date.now(), sender: 'user', text: userText };
//     setMessages((prev) => [...prev, userMsg]);
//     setInput('');
//     setIsTyping(true);

//     // 2. Asli backend API call Gemini ke liye
//     try {
//       const aiResponseText = await chatWithAi(userText);
      
//       const aiMsg = { 
//         id: Date.now() + 1, 
//         sender: 'ai', 
//         text: aiResponseText 
//       };
//       setMessages((prev) => [...prev, aiMsg]);

//     } catch (error) {
//       console.error("Chat API failed:", error);
//       const errorMsg = { 
//         id: Date.now() + 1, 
//         sender: 'ai', 
//         text: 'Sorry, connection error. Backend check kijiye ya thodi der me try karein.' 
//       };
//       setMessages((prev) => [...prev, errorMsg]);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   return (
//     <>
//       {/* Floating Chat Button */}
//       <AnimatePresence>
//         {!isOpen && (
//           <motion.button
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             exit={{ scale: 0 }}
//             whileHover={{ scale: 1.1 }}
//             onClick={() => setIsOpen(true)}
//             className="fixed bottom-20 md:bottom-10 right-4 md:right-8 w-14 h-14 bg-mint text-navy rounded-full shadow-mint-glow flex items-center justify-center z-50"
//           >
//             <MessageSquare size={24} />
//           </motion.button>
//         )}
//       </AnimatePresence>

//       {/* Chat Modal */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: 50, scale: 0.9 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 20, scale: 0.9 }}
//             transition={{ duration: 0.3 }}
//             className="fixed bottom-20 md:bottom-10 right-4 md:right-8 w-[calc(100vw-2rem)] md:w-96 h-[500px] max-h-[80vh] bg-glass-navy backdrop-blur-xl border border-navy-lightest rounded-2xl shadow-glass flex flex-col z-50 overflow-hidden"
//           >
//             {/* Header */}
//             <div className="flex items-center justify-between px-4 py-3 bg-navy border-b border-navy-lightest">
//               <div className="flex items-center gap-2 text-white font-semibold">
//                 <Bot size={20} className="text-mint" />
//                 <span>MediLab AI Assistant</span>
//               </div>
//               <button 
//                 onClick={() => setIsOpen(false)}
//                 className="text-gray-400 hover:text-white transition-colors"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             {/* Chat Area */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
//               {messages.map((msg) => (
//                 <div 
//                   key={msg.id} 
//                   className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//                 >
//                   <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
//                     {/* Avatar */}
//                     <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-navy-lightest">
//                       {msg.sender === 'user' ? <User size={14} className="text-gray-300" /> : <Bot size={14} className="text-mint" />}
//                     </div>

//                     {/* Message Bubble */}
//                     <div className={`p-3 text-sm shadow-md whitespace-pre-wrap leading-relaxed ${
//                       msg.sender === 'user' 
//                         ? 'bg-mint-tint border border-mint/20 text-white rounded-2xl rounded-tr-none' 
//                         : 'bg-navy-light border border-navy-lightest text-gray-200 rounded-2xl rounded-tl-none'
//                     }`}>
//                       {msg.text}
//                     </div>

//                   </div>
//                 </div>
//               ))}
              
//               {/* Typing Indicator UI */}
//               {isTyping && (
//                 <div className="flex w-full justify-start">
//                   <div className="flex gap-2 max-w-[80%] flex-row">
//                     <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-navy-lightest">
//                       <Bot size={14} className="text-mint" />
//                     </div>
//                     <div className="p-4 bg-navy-light border border-navy-lightest rounded-2xl rounded-tl-none flex gap-1 items-center">
//                       <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-mint rounded-full"></motion.div>
//                       <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-mint rounded-full"></motion.div>
//                       <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-mint rounded-full"></motion.div>
//                     </div>
//                   </div>
//                 </div>
//               )}
              
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Input Area */}
//             <form onSubmit={handleSendMessage} className="p-3 bg-navy-light/50 border-t border-navy-lightest flex gap-2">
//               <input
//                 type="text"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 placeholder="Ask about your report..."
//                 className="flex-1 bg-navy border border-navy-lightest text-white rounded-xl px-4 py-2 focus:outline-none focus:border-mint/50 transition-colors text-sm"
//               />
//               <button 
//                 type="submit"
//                 disabled={!input.trim() || isTyping}
//                 className="w-10 h-10 bg-mint text-navy rounded-xl flex items-center justify-center disabled:opacity-50 hover:shadow-mint-glow transition-all cursor-pointer"
//               >
//                 <Send size={18} />
//               </button>
//             </form>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default AIChatModal;
