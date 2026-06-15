"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Loader2, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "What projects are behind schedule?",
  "Show material cost trends",
  "Generate monthly report summary",
  "Which suppliers have best ratings?",
];

export function AiAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", role: "assistant", content: "Hello! I'm your BuildMaster AI assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chat", { message: text });
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: data.reply }]);
    } catch {
      const fallback = getFallbackResponse(text);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" /> AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={msg.role === "assistant" ? "bg-primary/10 text-primary" : "bg-muted"}>
                    {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className={`rounded-lg px-4 py-2 max-w-[80%] text-sm ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10"><Bot className="h-4 w-4 text-primary" /></AvatarFallback></Avatar>
              <div className="bg-muted rounded-lg px-4 py-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <Button key={s} variant="outline" size="sm" onClick={() => sendMessage(s)} className="text-xs">
                {s}
              </Button>
            ))}
          </div>
        )}

        <div className="border-t p-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your projects..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          />
          <Button size="icon" onClick={() => sendMessage(input)} disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getFallbackResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("schedule") || q.includes("behind")) {
    return "Based on current data, Harbor Bridge (45% progress) and Green Valley (15% progress) are behind their planned timelines. I recommend reviewing resource allocation for these projects.";
  }
  if (q.includes("material") || q.includes("cost")) {
    return "Material costs have increased 8% this quarter. Cement and steel account for 62% of total material spend. Consider bulk ordering from BuildMart for 12% savings.";
  }
  if (q.includes("report")) {
    return "Monthly Summary: 12 active projects, $510K revenue (Jun), 5 material alerts, 3 pending payments totaling $320K. Overall project health: 78% on track.";
  }
  if (q.includes("supplier")) {
    return "Top rated suppliers: BuildMart (4.8★), SteelCo (4.6★), TimberPro (4.5★). BuildMart offers best pricing for cement; SteelCo for rebar.";
  }
  return "I've analyzed your construction data. Currently tracking 24 projects with $4.85M total revenue. Would you like details on projects, materials, payments, or workforce?";
}
