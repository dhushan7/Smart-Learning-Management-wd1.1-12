import React, { useEffect, useRef, useState } from "react";
import "./CommunityChatbot.css";
import chatbotKnowledge from "../data/chatbotKnowledge";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8086";
const AI_HISTORY_LIMIT = 6;

function CommunityChatbot() {
  const [isOpen, setIsOpen] = useState(false); // Controls if the chat window is open
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your Smart Learning assistant. I can help with quizzes, results, assignments, login issues, and platform navigation.",
      time: getCurrentTime(),
      suggestions: [
        "How do I attempt a quiz?",
        "Why can't I submit my quiz?",
        "What features does the platform have?"
      ]
    }
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastIntent, setLastIntent] = useState(null);

  const chatEndRef = useRef(null);

  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Added isOpen to ensure it scrolls down when the window is toggled open
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]); 

  const normalizeText = (text) => text.toLowerCase().trim();

  const getQuickReply = (userMessage) => {
    const message = normalizeText(userMessage);

    if (message.includes("time")) {
      const now = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

      return {
        text: `Current time is ${now}.`,
        suggestions: ["What is today's date?", "What is this website?"]
      };
    }

    if (message.includes("date") || message.includes("day")) {
      const today = new Date().toLocaleDateString();

      return {
        text: `Today's date is ${today}.`,
        suggestions: ["What time is it?", "What is this platform?"]
      };
    }

    return null;
  };

  const calculateMatchScore = (userMessage, item) => {
    const message = normalizeText(userMessage);
    let score = 0;

    item.patterns.forEach((pattern) => {
      if (message.includes(pattern.toLowerCase())) {
        score += 5;
      }
    });

    item.keywords.forEach((keyword) => {
      if (message.includes(keyword.toLowerCase())) {
        score += 2;
      }
    });

    if (lastIntent && item.topic === lastIntent.topic) {
      score += 1;
    }

    return score;
  };

  const getLocalBotResponse = (userMessage) => {
    const quickReply = getQuickReply(userMessage);
    if (quickReply) {
      return { ...quickReply, score: Number.MAX_SAFE_INTEGER };
    }

    let bestMatch = null;
    let bestScore = 0;

    chatbotKnowledge.forEach((item) => {
      const score = calculateMatchScore(userMessage, item);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    });

    if (bestMatch && bestScore > 0) {
      setLastIntent(bestMatch);

      let fullResponse = bestMatch.answer;

      if (bestMatch.steps && bestMatch.steps.length > 0) {
        fullResponse += "\n\nSteps:\n";
        bestMatch.steps.forEach((step, index) => {
          fullResponse += `${index + 1}. ${step}\n`;
        });
      }

      return {
        text: fullResponse.trim(),
        suggestions: bestMatch.suggestions || [],
        score: bestScore
      };
    }

    return {
      text:
        "I'm not fully sure about that yet. I can help with quizzes, results, assignments, login issues, and website navigation.",
      suggestions: [
        "How do I attempt a quiz?",
        "Where can I see quiz results?",
        "What features does the platform have?"
      ],
      score: 0
    };
  };

  // Updated sendMessage from the bottom code snippet
  // It now always tries the backend first, using localResponse as a fallback
  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      sender: "user",
      text: messageText,
      time: getCurrentTime()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const localResponse = getLocalBotResponse(messageText);
      const recentHistory = messages
        .filter((message) => message.sender === "user" || message.sender === "bot")
        .slice(-AI_HISTORY_LIMIT)
        .map((message) => ({
          role: message.sender === "bot" ? "assistant" : "user",
          content: message.text
        }));

      const requestPayload = { message: messageText };
      recentHistory.forEach((entry, index) => {
        requestPayload[`historyRole${index + 1}`] = entry.role;
        requestPayload[`historyContent${index + 1}`] = entry.content;
      });

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      if (!data.reply || data.reply === "__USE_LOCAL_FALLBACK__") {
        console.error("Chatbot backend fallback:", data.error || "Unknown backend error");

        const botMessage = {
          sender: "bot",
          text: localResponse.text,
          time: getCurrentTime(),
          suggestions: localResponse.suggestions
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        const botMessage = {
          sender: "bot",
          text: data.reply,
          time: getCurrentTime(),
          suggestions: [
            "How do I attempt a quiz?",
            "Why can't I submit my quiz?",
            "What features does the platform have?"
          ]
        };

        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error("Chatbot backend request failed:", error);

      const fallback = getLocalBotResponse(messageText);
      const botMessage = {
        sender: "bot",
        text: fallback.text,
        time: getCurrentTime(),
        suggestions: fallback.suggestions
      };

      setMessages((prev) => [...prev, botMessage]);
    }

    setIsTyping(false);
  };

  const handleSend = () => {
    sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const clearChat = () => {
    setMessages([
      {
        sender: "bot",
        text: "Chat cleared. Ask me anything about the Smart Learning Platform.",
        time: getCurrentTime(),
        suggestions: [
          "How do I attempt a quiz?",
          "Why can't I submit my quiz?",
          "What features does the platform have?"
        ]
      }
    ]);
    setLastIntent(null);
  };

  const quickActions = [
    "How do I attempt a quiz?",
    "Why can't I submit my quiz?",
    "Where can I see quiz results?",
    "What features does the platform have?"
  ];

  return (
    <div className="chatbot-floating-wrapper">
      {/* THE FLOATING TOGGLE BUTTON */}
      <button 
        className={`chatbot-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* THE CHAT WINDOW */}
      {isOpen && (
        <div className="floating-chat-window">
          <div className="chat-header">
            <div>
              <h2>Community Chatbot</h2>
              <p>Smart Learning Platform Assistant</p>
            </div>
            <button className="clear-btn" onClick={clearChat}>
              Clear Chat
            </button>
          </div>

          <div className="quick-actions">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-btn"
                onClick={() => handleSuggestionClick(action)}
              >
                {action}
              </button>
            ))}
          </div>

          <div className="chat-box">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.sender}`}>
                <div className={`message ${msg.sender}`}>
                  <p className="message-text">
                    {msg.text.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                  <span className="message-time">{msg.time}</span>
                </div>

                {msg.sender === "bot" && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="suggestions">
                    {msg.suggestions.map((suggestion, sIndex) => (
                      <button
                        key={sIndex}
                        className="suggestion-btn"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="message-wrapper bot">
                <div className="message bot typing">
                  <p>Typing...</p>
                </div>
              </div>
            )}

            <div ref={chatEndRef}></div>
          </div>

          <div className="input-area">
            <input
              type="text"
              placeholder="Ask about quizzes, assignments, results, login..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunityChatbot;