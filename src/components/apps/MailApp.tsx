"use client";

import { useState, useCallback } from "react";
import type { WindowState } from "@/lib/types";

interface Props {
  window: WindowState;
}

interface Email {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  toEmail: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  dateShort: string;
  read: boolean;
  flagged: boolean;
  folder: string;
  avatarColor: string;
}

const EMAILS: Email[] = [
  {
    id: "1",
    from: "System",
    fromEmail: "noreply@wyattcase.com",
    to: "Wyatt Case",
    toEmail: "wyatt@wyattcase.com",
    subject: "Welcome to wyattcase.com",
    preview: "Your new site is live and ready to go. Here's what you need to know...",
    body: `Hi Wyatt,

Welcome to your new site at wyattcase.com! Everything is set up and ready to go.

Here are a few things you can do to get started:

1. Customize your desktop with new apps and files
2. Explore the built-in applications
3. Drag and drop items to organize your workspace

If you have any questions, feel free to reach out.

Best,
System Administrator`,
    date: "Mar 27, 2026 9:00 AM",
    dateShort: "9:00 AM",
    read: false,
    flagged: false,
    folder: "inbox",
    avatarColor: "#5856D6",
  },
  {
    id: "2",
    from: "Vercel",
    fromEmail: "notifications@vercel.com",
    to: "Wyatt Case",
    toEmail: "wyatt@wyattcase.com",
    subject: "Your Vercel deployment is ready",
    preview: "Deployment of wyattcase-com to production was successful...",
    body: `Hi Wyatt,

Your deployment to production has completed successfully.

Project: wyattcase-com
URL: https://wyattcase.com
Status: Ready
Duration: 32s

Preview your deployment or view the build logs in your Vercel dashboard.

---
Vercel
You're receiving this because you have notifications enabled for this project.`,
    date: "Mar 27, 2026 8:32 AM",
    dateShort: "8:32 AM",
    read: false,
    flagged: false,
    folder: "inbox",
    avatarColor: "#000000",
  },
  {
    id: "3",
    from: "GitHub",
    fromEmail: "noreply@github.com",
    to: "Wyatt Case",
    toEmail: "wyatt@wyattcase.com",
    subject: "Weekly GitHub digest",
    preview: "Here's what happened this week across your repositories...",
    body: `Hey wyattcase,

Here's your weekly digest for the week of March 20 - March 27.

Repositories you contributed to:
- wyattcase/wyattcase.com — 14 commits, 3 PRs merged
- wyattcase/auctionblock — 8 commits, 2 PRs merged

Stars received: 7
New followers: 3

Keep up the great work!

— The GitHub Team`,
    date: "Mar 26, 2026 6:00 PM",
    dateShort: "Yesterday",
    read: true,
    flagged: false,
    folder: "inbox",
    avatarColor: "#238636",
  },
  {
    id: "4",
    from: "Alex Rivera",
    fromEmail: "alex.rivera@company.com",
    to: "Wyatt Case",
    toEmail: "wyatt@wyattcase.com",
    subject: "Meeting tomorrow at 10am",
    preview: "Hey Wyatt, just a reminder that we have our sync tomorrow morning...",
    body: `Hey Wyatt,

Just a reminder that we have our project sync tomorrow morning at 10am. I've updated the agenda with the items we discussed on Slack.

Main topics:
- Q2 roadmap review
- New feature prioritization
- Design system updates

Let me know if you want to add anything else.

See you there!
Alex`,
    date: "Mar 26, 2026 3:45 PM",
    dateShort: "Yesterday",
    read: false,
    flagged: true,
    folder: "inbox",
    avatarColor: "#FF9500",
  },
  {
    id: "5",
    from: "Stripe",
    fromEmail: "receipts@stripe.com",
    to: "Wyatt Case",
    toEmail: "wyatt@wyattcase.com",
    subject: "Invoice #1234",
    preview: "Your invoice for $49.00 has been paid. Thank you for your payment...",
    body: `Invoice #1234

Amount paid: $49.00
Date: March 25, 2026
Payment method: Visa ending in 4242

Description:
- Pro Plan (Monthly) .............. $49.00

Total: $49.00

View your invoice online or download a PDF copy from your Stripe dashboard.

Thank you for your business.

— Stripe`,
    date: "Mar 25, 2026 11:20 AM",
    dateShort: "Tue",
    read: true,
    flagged: false,
    folder: "inbox",
    avatarColor: "#635BFF",
  },
];

interface Mailbox {
  id: string;
  label: string;
  icon: string;
  count?: number;
}

const MAILBOXES: Mailbox[] = [
  { id: "inbox", label: "Inbox", icon: "📥", count: 3 },
  { id: "drafts", label: "Drafts", icon: "📝" },
  { id: "sent", label: "Sent", icon: "📤" },
  { id: "trash", label: "Trash", icon: "🗑️" },
  { id: "flagged", label: "Flagged", icon: "🚩" },
];

function AvatarCircle({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-white text-[14px] font-semibold shrink-0"
      style={{ backgroundColor: color }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

interface ComposeFormProps {
  onClose: () => void;
  onSend: () => void;
}

function ComposeForm({ onClose, onSend }: ComposeFormProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[520px] bg-[#2a2a2a] rounded-lg shadow-2xl border border-white/10 flex flex-col overflow-hidden">
        {/* Compose header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#323232] border-b border-white/10">
          <span className="text-[13px] font-semibold text-white/90">New Message</span>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white text-[18px] leading-none"
          >
            ✕
          </button>
        </div>

        {/* Fields */}
        <div className="border-b border-white/10">
          <div className="flex items-center px-4 py-1.5 border-b border-white/5">
            <span className="text-[12px] text-white/40 w-[50px]">To:</span>
            <input
              className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/20"
              placeholder="recipient@example.com"
            />
          </div>
          <div className="flex items-center px-4 py-1.5 border-b border-white/5">
            <span className="text-[12px] text-white/40 w-[50px]">Cc:</span>
            <input
              className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/20"
              placeholder=""
            />
          </div>
          <div className="flex items-center px-4 py-1.5">
            <span className="text-[12px] text-white/40 w-[50px]">Subject:</span>
            <input
              className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/20"
              placeholder=""
            />
          </div>
        </div>

        {/* Body */}
        <textarea
          className="flex-1 min-h-[200px] p-4 bg-transparent text-[13px] text-white/90 outline-none resize-none placeholder:text-white/20"
          placeholder="Write your message..."
        />

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/10">
          <div className="flex gap-2">
            <button className="text-white/40 hover:text-white text-[16px]" title="Attach">
              📎
            </button>
          </div>
          <button
            onClick={() => {
              onSend();
              onClose();
            }}
            className="px-4 py-1 bg-[#0A84FF] hover:bg-[#409CFF] rounded text-[12px] font-medium text-white transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MailApp({ window: _win }: Props) {
  const [selectedMailbox, setSelectedMailbox] = useState("inbox");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(EMAILS[0].id);
  const [emails, setEmails] = useState<Email[]>(EMAILS);
  const [composing, setComposing] = useState(false);

  const filteredEmails = emails.filter((e) => {
    if (selectedMailbox === "flagged") return e.flagged;
    return e.folder === selectedMailbox;
  });

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) ?? null;

  const markAsRead = useCallback(
    (id: string) => {
      setEmails((prev) =>
        prev.map((e) => (e.id === id ? { ...e, read: true } : e))
      );
    },
    []
  );

  const handleSelectEmail = useCallback(
    (id: string) => {
      setSelectedEmailId(id);
      markAsRead(id);
    },
    [markAsRead]
  );

  const toggleFlag = useCallback(
    (id: string) => {
      setEmails((prev) =>
        prev.map((e) => (e.id === id ? { ...e, flagged: !e.flagged } : e))
      );
    },
    []
  );

  const moveToTrash = useCallback(
    (id: string) => {
      setEmails((prev) =>
        prev.map((e) => (e.id === id ? { ...e, folder: "trash" } : e))
      );
      if (selectedEmailId === id) setSelectedEmailId(null);
    },
    [selectedEmailId]
  );

  const unreadCount = emails.filter((e) => !e.read && e.folder === "inbox").length;

  return (
    <div className="flex h-full text-white text-[13px] relative">
      {/* Mailbox Sidebar */}
      <div className="w-[160px] bg-[rgba(30,30,30,0.6)] border-r border-white/10 py-2 shrink-0 overflow-y-auto">
        <div className="px-3 py-1 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
          Mailboxes
        </div>
        {MAILBOXES.map((mb) => {
          const count =
            mb.id === "inbox"
              ? unreadCount
              : mb.id === "flagged"
                ? emails.filter((e) => e.flagged).length
                : mb.count;
          return (
            <button
              key={mb.id}
              onClick={() => setSelectedMailbox(mb.id)}
              className={`w-full text-left px-3 py-1 flex items-center gap-2 hover:bg-white/10 rounded-md mx-1 transition-colors ${
                selectedMailbox === mb.id ? "bg-white/10" : ""
              }`}
              style={{ width: "calc(100% - 8px)" }}
            >
              <span className="text-[14px]">{mb.icon}</span>
              <span className="truncate flex-1">{mb.label}</span>
              {count != null && count > 0 && (
                <span className="text-[10px] bg-[#0A84FF] text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-medium leading-none">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Message List */}
      <div className="w-[260px] bg-[#1e1e1e] border-r border-white/10 flex flex-col shrink-0">
        {/* Toolbar */}
        <div className="h-[36px] bg-[#2a2a2a] border-b border-white/5 flex items-center px-2 gap-1 shrink-0">
          <button
            onClick={() => setComposing(true)}
            className="text-[16px] hover:bg-white/10 rounded px-1.5 py-0.5 transition-colors"
            title="Compose"
          >
            ✏️
          </button>
          <button
            className="text-[16px] hover:bg-white/10 rounded px-1.5 py-0.5 transition-colors opacity-50"
            title="Reply"
          >
            ↩️
          </button>
          <button
            className="text-[16px] hover:bg-white/10 rounded px-1.5 py-0.5 transition-colors opacity-50"
            title="Forward"
          >
            ↪️
          </button>
          <div className="flex-1" />
          <button
            onClick={() => {
              if (selectedEmailId) moveToTrash(selectedEmailId);
            }}
            className="text-[16px] hover:bg-white/10 rounded px-1.5 py-0.5 transition-colors"
            title="Trash"
          >
            🗑️
          </button>
          <button
            onClick={() => {
              if (selectedEmailId) toggleFlag(selectedEmailId);
            }}
            className="text-[16px] hover:bg-white/10 rounded px-1.5 py-0.5 transition-colors"
            title="Flag"
          >
            🚩
          </button>
        </div>

        {/* Message entries */}
        <div className="flex-1 overflow-y-auto">
          {filteredEmails.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/30 text-[12px]">
              No messages
            </div>
          ) : (
            filteredEmails.map((email) => (
              <button
                key={email.id}
                onClick={() => handleSelectEmail(email.id)}
                className={`w-full text-left px-3 py-2.5 border-b border-white/5 hover:bg-white/5 transition-colors ${
                  selectedEmailId === email.id ? "bg-[#0A84FF]/20" : ""
                }`}
              >
                <div className="flex gap-2.5">
                  <AvatarCircle name={email.from} color={email.avatarColor} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`truncate text-[13px] ${
                          !email.read ? "font-semibold text-white" : "text-white/70"
                        }`}
                      >
                        {email.from}
                      </span>
                      <span className="text-[10px] text-white/40 shrink-0">
                        {email.dateShort}
                      </span>
                    </div>
                    <div
                      className={`truncate text-[12px] ${
                        !email.read ? "font-medium text-white/90" : "text-white/50"
                      }`}
                    >
                      {email.subject}
                    </div>
                    <div className="truncate text-[11px] text-white/30 mt-0.5">
                      {email.preview}
                    </div>
                  </div>
                  {!email.read && (
                    <div className="w-[8px] h-[8px] rounded-full bg-[#0A84FF] shrink-0 mt-1" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message Preview */}
      <div className="flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden">
        {selectedEmail ? (
          <>
            {/* Preview toolbar */}
            <div className="h-[36px] bg-[#2a2a2a] border-b border-white/5 flex items-center px-3 shrink-0">
              <span className="text-white/60 text-[12px] truncate">
                {selectedEmail.subject}
              </span>
            </div>

            {/* Email headers */}
            <div className="px-5 pt-4 pb-3 border-b border-white/10">
              <div className="flex items-start gap-3">
                <AvatarCircle
                  name={selectedEmail.from}
                  color={selectedEmail.avatarColor}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-[14px] text-white">
                      {selectedEmail.from}
                    </span>
                    <span className="text-[11px] text-white/40 shrink-0">
                      {selectedEmail.date}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/40 mt-0.5">
                    From: {selectedEmail.from} &lt;{selectedEmail.fromEmail}&gt;
                  </div>
                  <div className="text-[11px] text-white/40">
                    To: {selectedEmail.to} &lt;{selectedEmail.toEmail}&gt;
                  </div>
                  <div className="text-[11px] text-white/40">
                    Date: {selectedEmail.date}
                  </div>
                  <div className="text-[11px] text-white/40">
                    Subject: {selectedEmail.subject}
                  </div>
                </div>
              </div>
            </div>

            {/* Email body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <pre className="text-[13px] text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
                {selectedEmail.body}
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/30 text-[13px]">
            No message selected
          </div>
        )}
      </div>

      {/* Compose overlay */}
      {composing && (
        <ComposeForm
          onClose={() => setComposing(false)}
          onSend={() => {
            /* no-op for mock */
          }}
        />
      )}
    </div>
  );
}
