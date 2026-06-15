"use client";

import { AiAssistantChat } from "@/components/ai/ai-assistant-chat";

export default function AiAssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI Assistant</h2>
        <p className="text-muted-foreground">Get intelligent insights about your construction operations.</p>
      </div>
      <div className="max-w-3xl mx-auto">
        <AiAssistantChat />
      </div>
    </div>
  );
}
