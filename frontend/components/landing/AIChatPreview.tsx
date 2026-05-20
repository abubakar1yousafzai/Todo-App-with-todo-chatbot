"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";

type Role = "user" | "ai";

interface Message {
  id: number;
  role: Role;
  text: string;
}

const CONVERSATION: Message[] = [
  { id: 1, role: "user", text: "Add gym tomorrow at 7 PM" },
  { id: 2, role: "ai",   text: "Done! Gym task added for tomorrow at 7 PM ✓" },
  { id: 3, role: "user", text: "Mark workout complete" },
  { id: 4, role: "ai",   text: "Workout marked complete. Great job! 💪" },
  { id: 5, role: "user", text: "Delete shopping task" },
  { id: 6, role: "ai",   text: "Shopping task deleted successfully 🗑️" },
];

/* How long each step stays before the next one fires */
const STEP_DELAYS = [800, 1800, 3400, 4400, 6000, 7000];
/* After the last message, restart the loop after this delay */
const LOOP_PAUSE = 3200;

function TypingDots() {
  return (
    <span className="flex items-center gap-1 h-4">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-orange-400"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </span>
  );
}

const bubbleVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
};

function UserBubble({ text }: { text: string }) {
  return (
    <motion.div
      className="flex justify-end"
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-medium shadow-lg shadow-orange-500/20">
        {text}
      </div>
    </motion.div>
  );
}

function AIBubble({ text }: { text: string }) {
  return (
    <motion.div
      className="flex items-end gap-2"
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white/10 border border-white/15 text-white/90 text-sm font-medium backdrop-blur-sm">
        {text}
      </div>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <motion.div
      className="flex items-end gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
      transition={{ duration: 0.25 }}
    >
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white/10 border border-white/15 backdrop-blur-sm">
        <TypingDots />
      </div>
    </motion.div>
  );
}

export function AIChatPreview() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];

    function runSequence() {
      setVisibleCount(0);
      setIsTyping(false);

      CONVERSATION.forEach((msg, idx) => {
        if (msg.role === "ai") {
          /* show typing indicator 1 s before the AI bubble */
          const typingTimer = setTimeout(() => setIsTyping(true), STEP_DELAYS[idx] - 1000);
          timers.push(typingTimer);
        }

        const showTimer = setTimeout(() => {
          setIsTyping(false);
          setVisibleCount(idx + 1);
        }, STEP_DELAYS[idx]);
        timers.push(showTimer);
      });

      /* loop */
      const loopTimer = setTimeout(
        runSequence,
        STEP_DELAYS[STEP_DELAYS.length - 1] + LOOP_PAUSE
      );
      timers.push(loopTimer);
    }

    runSequence();
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [visibleCount, isTyping]);

  const visibleMessages = CONVERSATION.slice(0, visibleCount);

  return (
    <section className="py-24 flex flex-col items-center justify-center px-6">
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-3 mb-12"
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 font-semibold text-sm">
          <Sparkles className="w-4 h-4" />
          AI-Powered
        </span>
        <h2 className="text-4xl font-bold text-center text-gray-900">
          Meet Your{" "}
          <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            AI Task Assistant
          </span>
        </h2>
        <p className="text-gray-500 text-center max-w-md">
          Just type naturally. Your AI assistant adds, updates, and deletes tasks instantly — no clicks needed.
        </p>
      </motion.div>

      {/* Chat Card */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15 }}
        whileHover={{ y: -4, transition: { duration: 0.3 } }}
        className="
          w-full max-w-md
          rounded-3xl
          bg-gradient-to-br from-gray-900/90 via-gray-950/95 to-black/90
          border border-white/10
          shadow-2xl shadow-black/40
          backdrop-blur-2xl
          overflow-hidden
          ring-1 ring-orange-500/10
        "
        style={{
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.08), 0 32px 64px -16px rgba(0,0,0,0.7), 0 0 40px -8px rgba(249,115,22,0.12)",
        }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
            <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.6)]" />
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
          </div>
          <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-white/80 text-sm font-semibold tracking-tight">
              Live AI Assistant
            </span>
          </div>
          <div className="w-16" />
        </div>

        {/* Messages */}
        <div ref={scrollContainerRef} className="px-5 py-5 space-y-3 min-h-[280px] max-h-[340px] overflow-y-auto scrollbar-none">
          <AnimatePresence initial={false}>
            {visibleMessages.map((msg) =>
              msg.role === "user" ? (
                <UserBubble key={msg.id} text={msg.text} />
              ) : (
                <AIBubble key={msg.id} text={msg.text} />
              )
            )}

            {isTyping && <TypingBubble key="typing" />}
          </AnimatePresence>
        </div>

        {/* Input bar */}
        <div className="px-5 pb-5">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-white/30 text-sm flex-1 select-none">
              Ask your AI assistant…
            </span>
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/30">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Glow under card */}
      <div className="w-72 h-4 rounded-full bg-orange-500/15 blur-2xl -mt-2 mx-auto" />
    </section>
  );
}
