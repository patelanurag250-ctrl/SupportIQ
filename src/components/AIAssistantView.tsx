import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User as UserIcon,
  Copy,
  Check,
  Plus,
  BookOpen,
  Sparkles,
  Ticket as TicketIcon,
  Trash2,
  ExternalLink,
  Search,
  Quote,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Citation, Conversation } from '../types';

interface AIAssistantViewProps {
  onCreateTicketFromChat?: (subject: string, description: string) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  onCreateTicketFromChat,
}) => {
  const { conversations, sendChatMessage, documents } = useData();
  const { user } = useAuth();

  const [activeConvId, setActiveConvId] = useState<string>(
    conversations[0]?.id || 'cnv-new'
  );
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCitations, setActiveCitations] = useState<Citation[]>(
    [...(conversations[0]?.messages || [])].reverse().find((m) => m.citations && m.citations.length > 0)?.citations || []
  );
  const [convSearch, setConvSearch] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    setInputText('');
    setIsTyping(true);

    try {
      const res = await sendChatMessage(text, activeConvId, user.id);
      setActiveConvId(res.conversationId);
      if (res.message.citations && res.message.citations.length > 0) {
        setActiveCitations(res.message.citations);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewConversation = () => {
    const newId = `cnv-${Date.now()}`;
    setActiveConvId(newId);
    setActiveCitations([]);
  };

  const suggestedQuestions = [
    'How do I set up Okta SAML 2.0 SSO and find the ACS URL?',
    'What is our refund policy for 30-day subscriptions?',
    'What are the API rate limits for the Enterprise plan?',
    'Is SMS two-factor authentication allowed for administrators?',
  ];

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(convSearch.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden bg-[#F5F3EE]">
      {/* LEFT PANEL: Conversation History */}
      <div className="w-72 bg-[#171C19] border-r border-[#2C3530] flex flex-col shrink-0 text-[#F5F3EE]">
        {/* Header */}
        <div className="p-4 border-b border-[#2C3530] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#879B87] font-bold">
              Chat Sessions
            </span>
            <button
              onClick={handleNewConversation}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#202522] border border-[#2F3B34] text-[#C7F36B] hover:bg-[#2A312D] text-xs font-mono transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#879B87] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter interactions..."
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              className="w-full bg-[#202522] border border-[#2F3B34] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F5F3EE] placeholder-[#879B87] focus:outline-none focus:border-[#C7F36B]"
            />
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto dark-scroll p-3 space-y-1.5">
          {filteredConversations.map((conv) => {
            const isActive = conv.id === activeConvId;
            return (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConvId(conv.id);
                  const lastCitationMsg = [...(conv.messages || [])].reverse().find((m) => m.citations && m.citations.length > 0);
                  if (lastCitationMsg && lastCitationMsg.citations) {
                    setActiveCitations(lastCitationMsg.citations);
                  }
                }}
                className={`w-full text-left p-3 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-[#202522] text-[#F5F3EE] border border-[#2F3B34] shadow-inner'
                    : 'text-[#879B87] hover:bg-[#202522]/50 hover:text-[#F5F3EE]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono text-[#879B87] text-[10px]">
                    {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 rounded bg-[#171C19] text-[#79A88A] border border-[#2C3530]">
                    {conv.messages.length} msgs
                  </span>
                </div>
                <p className="text-xs font-medium truncate leading-tight text-[#F5F3EE]">
                  {conv.title}
                </p>
              </button>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="p-4 text-center text-xs text-[#879B87]">
              No conversations found.
            </div>
          )}
        </div>

        {/* Knowledge Base Sync Badge */}
        <div className="p-3 border-t border-[#2C3530] bg-[#121614] flex items-center justify-between text-[11px] font-mono text-[#879B87]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C7F36B]" />
            RAG Grounded
          </span>
          <span className="text-[#F5F3EE] font-bold">{documents.length} verified docs</span>
        </div>
      </div>

      {/* CENTER PANEL: Main Conversational Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F3EE]">
        {/* Subtle Dark Conversation Header with Lime Status Indicator */}
        <div className="bg-[#202522] border-b border-[#2F3B34] px-6 py-3 flex items-center justify-between text-[#F5F3EE] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#171C19] border border-[#2F3B34] flex items-center justify-center text-[#C7F36B]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-bold text-sm text-[#F5F3EE]">
                  SupportIQ Intelligence Workspace
                </h3>
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#C7F36B]/20 text-[#C7F36B] border border-[#C7F36B]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C7F36B] animate-pulse" />
                  <span>ONLINE • GEMINI 3.8</span>
                </span>
              </div>
              <p className="text-[11px] text-[#879B87]">
                Answers are grounded strictly in your verified organization documents.
              </p>
            </div>
          </div>

          <button
            onClick={handleNewConversation}
            className="text-xs font-mono text-[#879B87] hover:text-[#C7F36B] flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {(!activeConversation || activeConversation.messages.length === 0) && (
            <div className="max-w-xl mx-auto py-12 text-center space-y-5 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-[#202522] border border-[#2F3B34] flex items-center justify-center text-[#C7F36B] mx-auto shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-[#252A26]">
                  How can SupportIQ assist you today?
                </h2>
                <p className="text-xs text-[#777D75] mt-1 max-w-md mx-auto">
                  Ask any question about enterprise security, billing refunds, API quotas, or SAML SSO. Every answer references real verified source documents.
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="grid grid-cols-1 gap-2 pt-2 text-left">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="p-3 rounded-xl bg-white border border-[#E4E2DA] hover:border-[#879B87] text-xs font-medium text-[#252A26] transition-all hover:shadow-xs flex items-center justify-between group"
                  >
                    <span>{q}</span>
                    <span className="text-[#879B87] group-hover:text-[#252A26] font-mono text-[10px]">Ask →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeConversation?.messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex space-x-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#202522] border border-[#2F3B34] text-[#C7F36B] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`space-y-2 max-w-xl ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#202522] text-[#F5F3EE] rounded-tr-xs shadow-xs'
                        : 'bg-white text-[#252A26] border border-[#E4E2DA] rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* AI Metadata & Grounded Evidence Footnote */}
                  {!isUser && (
                    <div className="space-y-2 pt-1 pl-1">
                      {/* Evidence Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-[#777D75] uppercase tracking-wider font-semibold flex items-center gap-1">
                            <Quote className="w-3 h-3 text-[#879B87]" /> Verified Sources ({msg.citations.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.citations.map((c, i) => (
                              <button
                                key={i}
                                onClick={() => setActiveCitations(msg.citations || [])}
                                className="px-2 py-1 rounded bg-[#EAE8E0] hover:bg-[#DBD8CE] border border-[#DBD8CE] text-[10px] font-mono text-[#252A26] flex items-center space-x-1 transition-colors"
                              >
                                <span className="font-bold text-[#879B87]">[{i + 1}]</span>
                                <span className="truncate max-w-[160px]">{c.documentTitle}</span>
                                <span className="text-[9px] text-[#79A88A] font-bold">
                                  {Math.round(c.relevanceScore * 100)}%
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommended Next Action */}
                      {msg.suggestedAction && (
                        <div className="bg-[#EAE8E0]/70 border border-[#DBD8CE] rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[11px] text-[#252A26]">
                          <span className="text-[#777D75] flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#879B87]" /> Next Action:
                          </span>
                          <span className="font-medium text-[#252A26]">{msg.suggestedAction}</span>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex items-center space-x-3 pt-1 text-[11px] text-[#777D75]">
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="hover:text-[#252A26] flex items-center space-x-1"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-[#79A88A]" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>

                        {onCreateTicketFromChat && (
                          <button
                            onClick={() =>
                              onCreateTicketFromChat(
                                'Issue escalated from AI Assistant chat',
                                `Customer Conversation:\n\n${activeConversation?.messages
                                  .map((m) => `${m.sender.toUpperCase()}: ${m.content}`)
                                  .join('\n\n')}`
                              )
                            }
                            className="hover:text-[#252A26] flex items-center space-x-1 font-medium"
                          >
                            <TicketIcon className="w-3 h-3 text-[#879B87]" />
                            <span>Create Ticket from Chat</span>
                          </button>
                        )}

                        <span className="font-mono text-[9px] text-[#879B87]">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#879B87]/30 border border-[#879B87]/50 text-[#252A26] flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex space-x-3 max-w-xl animate-in fade-in">
              <div className="w-7 h-7 rounded-lg bg-[#202522] border border-[#2F3B34] text-[#C7F36B] flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-[#E4E2DA] rounded-tl-xs shadow-2xs flex items-center space-x-2">
                <div className="flex space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#879B87] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#879B87] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#879B87] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[11px] font-mono text-[#777D75]">
                  Retrieving knowledge & generating grounded response...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Dock */}
        <div className="p-4 bg-white border-t border-[#E4E2DA]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask SupportIQ about company policy, API limits, SAML, or billing..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              className="flex-1 bg-[#F5F3EE] border border-[#E4E2DA] rounded-xl px-4 py-2.5 text-xs text-[#252A26] placeholder-[#777D75] focus:outline-none focus:border-[#879B87]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="px-4 py-2.5 rounded-xl bg-[#202522] text-[#C7F36B] hover:bg-[#2A312D] disabled:opacity-40 disabled:hover:bg-[#202522] text-xs font-heading font-bold border border-[#2F3B34] transition-all flex items-center space-x-1.5 shadow-xs"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT PANEL: Context and Retrieved Knowledge */}
      <div className="w-80 bg-white border-l border-[#E4E2DA] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#E4E2DA] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#879B87]" />
            <h4 className="font-heading font-bold text-xs text-[#252A26]">
              Retrieved Knowledge Context
            </h4>
          </div>
          <span className="font-mono text-[10px] text-[#777D75] bg-[#F5F3EE] px-1.5 py-0.5 rounded border border-[#E4E2DA]">
            {activeCitations.length} Citations
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeCitations.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#777D75] space-y-2">
              <Quote className="w-6 h-6 text-[#879B87] mx-auto opacity-40" />
              <p className="font-medium text-[#252A26]">No documents currently referenced</p>
              <p className="text-[11px] text-[#777D75] max-w-xs mx-auto">
                When you submit a query, relevant chunks and source citations will appear here with exact page & section extracts.
              </p>
            </div>
          ) : (
            activeCitations.map((citation, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#F5F3EE] border border-[#E4E2DA] space-y-2.5 hover:border-[#879B87] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-heading font-bold text-[#252A26]">
                    <span className="w-4 h-4 rounded-full bg-[#202522] text-[#C7F36B] text-[10px] font-mono flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="line-clamp-1">{citation.documentTitle}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#79A88A] bg-[#79A88A]/10 px-1.5 py-0.5 rounded">
                    {Math.round(citation.relevanceScore * 100)}% Match
                  </span>
                </div>

                <div className="text-[11px] font-mono text-[#777D75] flex items-center justify-between border-t border-[#E4E2DA] pt-1.5">
                  <span className="truncate max-w-[160px]">{citation.section}</span>
                  <span>Page {citation.page}</span>
                </div>

                {/* Supporting Text Snippet */}
                <div className="bg-white p-2.5 rounded-lg border border-[#E4E2DA] text-[11px] text-[#252A26] leading-relaxed italic border-l-2 border-l-[#879B87]">
                  "{citation.snippet}"
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
