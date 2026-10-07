import React, { useState, useRef, useEffect } from "react"
import { Bot, Send, ShieldAlert, Sparkles, AlertCircle, HelpCircle, Loader2 } from "lucide-react"
import { assistantApi } from "../api/assistantApi"
import ChatMessage, { MessageItem } from "../components/common/ChatMessage"
import MedicalNoticeBanner from "../components/common/MedicalNoticeBanner"
import { useToast } from "../components/common/Toast"

export const AssistantPage: React.FC = () => {
  const { error } = useToast()

  const [inputQuestion, setInputQuestion] = useState("")
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "initial-1",
      sender: "assistant",
      text: "Hello! I am MedSafe AI Assistant. I can provide evidence-based information regarding active pharmaceutical ingredients, drug mechanisms, side effects, known interactions, and precautions.\n\nHow can I assist your medication understanding today?",
      importantInformation: "This assistant is an educational tool. It does not diagnose, prescribe, or calculate clinical dosages.",
      disclaimer: "Always discuss medication decisions with your treating physician or licensed pharmacist.",
      sources: [
        { title: "MedSafe Clinical Knowledge Base", source_type: "database" },
      ],
      timestamp: "Just now",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputQuestion).trim()
    if (!textToSend || isLoading) return

    const userMessage: MessageItem = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputQuestion("")
    setIsLoading(true)

    try {
      const res = await assistantApi.ask({
        question: textToSend,
      })

      const botMessage: MessageItem = {
        id: res.query_id || `bot-${Date.now()}`,
        sender: "assistant",
        text: res.answer,
        importantInformation: res.important_information,
        safetyConsiderations: res.safety_considerations,
        sources: res.sources || [],
        disclaimer: res.disclaimer,
        wasRefused: res.was_refused,
        refusalReason: res.refusal_reason,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (err: any) {
      error("Assistant Service Error", err.message || "Unable to reach the assistant service.")
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: "I am currently unable to query the clinical knowledge base. Please try again or consult verified pharmaceutical references.",
          wasRefused: true,
          refusalReason: "Service communication failure",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const sampleQuestions = [
    "What is the difference between Paracetamol and Ibuprofen?",
    "Why shouldn't Grapefruit be taken with certain statins?",
    "What are common side effects of Metformin?",
    "What active ingredients are commonly found in cold & flu remedies?",
  ]

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-8.5rem)]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          AI Medicine & Safety Assistant
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ask questions regarding active ingredients, common uses, side effects, and interaction mechanisms.
        </p>
      </div>

      <MedicalNoticeBanner compact />

      {/* Chat Container */}
      <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col overflow-hidden">
        {/* Messages list */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 text-slate-500 text-xs py-2">
              <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                Retrieving clinical knowledge base & applying safety guardrails...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-600" />
            Suggestions:
          </span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 font-medium transition shrink-0 whitespace-nowrap border border-slate-200/60"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Prompt Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask an informational question about a medication, active ingredient, or interaction..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuestion.trim()}
              className="p-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white transition disabled:opacity-40 shadow-sm"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center mt-2">
            MedSafe Assistant does NOT diagnose conditions, prescribe medications, or replace medical consultations.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AssistantPage
