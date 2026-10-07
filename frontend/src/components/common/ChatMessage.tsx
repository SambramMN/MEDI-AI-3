import React from "react"
import { Bot, User as UserIcon, ShieldAlert, ExternalLink, AlertTriangle } from "lucide-react"
import { SourceReference } from "../../types"

export interface MessageItem {
  id: string
  sender: "user" | "assistant"
  text: string
  importantInformation?: string | null
  safetyConsiderations?: string | null
  sources?: SourceReference[]
  disclaimer?: string | null
  wasRefused?: boolean
  refusalReason?: string | null
  timestamp: string
}

interface ChatMessageProps {
  message: MessageItem
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === "user"

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3 my-4">
        <div className="max-w-2xl bg-teal-800 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm text-sm leading-relaxed">
          <p className="whitespace-pre-wrap">{message.text}</p>
          <span className="block mt-1 text-[10px] text-teal-200/80 text-right">
            {message.timestamp}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0 text-xs shadow-sm">
          <UserIcon className="w-4 h-4" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 my-4">
      <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0 shadow-sm">
        <Bot className="w-4 h-4" />
      </div>

      <div className="max-w-2xl bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm p-4 shadow-sm text-sm text-slate-800 space-y-3">
        {message.wasRefused ? (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-amber-800 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Safety Guardrail Active
            </div>
            <p>{message.text}</p>
            {message.refusalReason && (
              <p className="mt-1.5 text-[11px] text-amber-700 italic border-t border-amber-200/60 pt-1">
                Reason: {message.refusalReason}
              </p>
            )}
          </div>
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
        )}

        {message.importantInformation && (
          <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100 text-teal-950 text-xs space-y-1">
            <div className="font-semibold flex items-center gap-1 text-teal-900">
              <ShieldAlert className="w-3.5 h-3.5 text-teal-700" />
              Important Medical Context
            </div>
            <p className="leading-relaxed">{message.importantInformation}</p>
          </div>
        )}

        {message.safetyConsiderations && (
          <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 text-rose-900 text-xs">
            <span className="font-semibold">Safety Consideration: </span>
            {message.safetyConsiderations}
          </div>
        )}

        {message.sources && message.sources.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Verified Medical Sources
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((src, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium"
                >
                  {src.title}
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-700 hover:text-teal-800 ml-0.5"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {message.disclaimer && (
          <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 italic">
            {message.disclaimer}
          </p>
        )}

        <span className="block text-[10px] text-slate-400 text-right">
          {message.timestamp}
        </span>
      </div>
    </div>
  )
}

export default ChatMessage
