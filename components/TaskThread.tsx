"use client";

import { useState } from "react";
import type { TaskMessage } from "@/types";

type TaskThreadProps = {
  jobId: string;
  messages: TaskMessage[];
  actorRole: "admin" | "writer";
  actorName: string;
  onSend: (payload: { jobId: string; fromRole: "admin" | "writer"; fromName: string; text: string }) => void;
};

export function TaskThread({ jobId, messages, actorRole, actorName, onSend }: TaskThreadProps) {
  const [text, setText] = useState("");
  const thread = messages.filter((m) => m.jobId === jobId);

  return (
    <section className="mt-5 rounded-3xl border border-ink/10 bg-[#fffaf0] p-5">
      <h4 className="font-display text-2xl font-black">Task thread</h4>
      <div className="mt-3 max-h-56 space-y-2 overflow-auto rounded-2xl bg-white p-3">
        {thread.length === 0 ? (
          <p className="text-sm text-muted">No messages yet.</p>
        ) : (
          thread.map((message) => (
            <article key={message.id} className="rounded-xl border border-ink/10 p-2">
              <p className="text-xs font-black uppercase text-muted">
                {message.fromRole} - {message.fromName}
              </p>
              <p className="text-sm">{message.text}</p>
              <p className="text-xs text-muted">{new Date(message.createdAt).toLocaleString()}</p>
            </article>
          ))
        )}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!text.trim()) return;
          onSend({ jobId, fromRole: actorRole, fromName: actorName, text: text.trim() });
          setText("");
        }}
      >
        <input
          className="flex-1 rounded-2xl border border-ink/15 bg-white px-3 py-2"
          onChange={(e) => setText(e.target.value)}
          placeholder="Write instruction or update..."
          value={text}
        />
        <button className="rounded-2xl bg-ink px-4 py-2 font-black text-white" type="submit">
          Send
        </button>
      </form>
    </section>
  );
}
