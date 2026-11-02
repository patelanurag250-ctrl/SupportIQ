import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Key,
  Cpu,
  Database,
  Building,
  UserCheck,
  Check,
  Save,
  Lock,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const SettingsView: React.FC = () => {
  const { organization } = useData();
  const { user, updateProfile, isAdmin } = useAuth();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [department, setDepartment] = useState(user.department || '');
  const [topK, setTopK] = useState(3);
  const [minThreshold, setMinThreshold] = useState(0.1);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(displayName, department);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-[#E4E2DA] pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#879B87] uppercase tracking-wider mb-2">
          <span className="w-2 h-2 rounded-full bg-[#C7F36B]" />
          <span>System & Operational Configuration</span>
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-[#252A26] tracking-tight">
          Platform Settings
        </h1>
        <p className="text-sm text-[#777D75] mt-1">
          Configure AI reasoning models, RAG retrieval thresholds, enterprise tenant parameters, and security policies.
        </p>
      </div>

      <div className="space-y-6">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl border border-[#E4E2DA] p-6 shadow-2xs space-y-5">
          <div className="flex items-center space-x-3 border-b border-[#E4E2DA] pb-4">
            <div className="w-8 h-8 rounded-lg bg-[#202522] text-[#C7F36B] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-[#252A26]">My Operational Profile</h3>
              <p className="text-xs text-[#777D75]">Current identity and role assignments</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#777D75] mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-xl px-3 py-2 text-xs text-[#252A26] focus:outline-none focus:border-[#879B87]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#777D75] mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-xl px-3 py-2 text-xs text-[#252A26] focus:outline-none focus:border-[#879B87]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#777D75] mb-1">Account Email</label>
                <input
                  type="text"
                  disabled
                  value={user.email}
                  className="w-full bg-[#EAE8E0] border border-[#DBD8CE] rounded-xl px-3 py-2 text-xs text-[#777D75] font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#777D75] mb-1">Assigned Role</label>
                <div className="flex items-center h-9">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#202522] text-[#C7F36B]">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#202522] text-[#C7F36B] hover:bg-[#2A312D] text-xs font-heading font-bold border border-[#2F3B34] flex items-center space-x-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>

              {saveSuccess && (
                <span className="text-xs font-mono text-[#79A88A] flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Profile updated</span>
                </span>
              )}
            </div>
          </form>
        </div>

        {/* AI & RAG Engine Parameters */}
        <div className="bg-white rounded-2xl border border-[#E4E2DA] p-6 shadow-2xs space-y-5">
          <div className="flex items-center space-x-3 border-b border-[#E4E2DA] pb-4">
            <div className="w-8 h-8 rounded-lg bg-[#202522] text-[#C7F36B] flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-[#252A26]">AI & RAG Engine Configuration</h3>
              <p className="text-xs text-[#777D75]">Configured through server-side @google/genai SDK</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs max-w-2xl">
            <div className="space-y-1">
              <label className="font-mono text-[11px] uppercase text-[#777D75] block">Foundation Model</label>
              <div className="p-3 bg-[#F5F3EE] rounded-xl border border-[#E4E2DA] font-mono text-[#252A26]">
                gemini-3.8-flash
              </div>
              <p className="text-[10px] text-[#879B87]">Selected for fast, high-accuracy conversational reasoning and grounding.</p>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[11px] uppercase text-[#777D75] block">Embedding Model</label>
              <div className="p-3 bg-[#F5F3EE] rounded-xl border border-[#E4E2DA] font-mono text-[#252A26]">
                gemini-embedding-2-preview
              </div>
              <p className="text-[10px] text-[#879B87]">768-dimensional multimodal vector representation with BM25 hybrid ranking.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between font-mono">
                <span className="text-[#777D75]">Top-K Chunks Retrieved</span>
                <span className="font-bold text-[#252A26]">{topK} chunks</span>
              </div>
              <input
                type="range"
                min={1}
                max={6}
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value))}
                className="w-full accent-[#202522]"
              />
              <p className="text-[10px] text-[#879B87]">Limits context injection to avoid dilution and hallucination.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between font-mono">
                <span className="text-[#777D75]">Relevance Threshold</span>
                <span className="font-bold text-[#252A26]">{minThreshold}</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.5}
                step={0.05}
                value={minThreshold}
                onChange={(e) => setMinThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#202522]"
              />
              <p className="text-[10px] text-[#879B87]">Chunks scoring below this threshold are dropped from context.</p>
            </div>
          </div>
        </div>

        {/* Cloud Infrastructure & Supabase Status */}
        <div className="bg-white rounded-2xl border border-[#E4E2DA] p-6 shadow-2xs space-y-5">
          <div className="flex items-center space-x-3 border-b border-[#E4E2DA] pb-4">
            <div className="w-8 h-8 rounded-lg bg-[#202522] text-[#C7F36B] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-[#252A26]">Cloud Infrastructure & Supabase Architecture</h3>
              <p className="text-xs text-[#777D75]">PostgreSQL relational database with Row Level Security (RLS) & Storage</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3.5 bg-[#F5F3EE] rounded-xl border border-[#E4E2DA] space-y-1">
              <span className="text-[10px] text-[#777D75] uppercase block">Database Engine</span>
              <p className="font-bold text-[#252A26]">PostgreSQL 15 / Supabase</p>
            </div>

            <div className="p-3.5 bg-[#F5F3EE] rounded-xl border border-[#E4E2DA] space-y-1">
              <span className="text-[10px] text-[#777D75] uppercase block">Storage Bucket</span>
              <p className="font-bold text-[#252A26]">knowledge-documents</p>
            </div>

            <div className="p-3.5 bg-[#F5F3EE] rounded-xl border border-[#E4E2DA] space-y-1">
              <span className="text-[10px] text-[#777D75] uppercase block">Data Isolation</span>
              <p className="font-bold text-[#79A88A] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Active RLS Policies
              </p>
            </div>
          </div>

          <div className="pt-2 text-xs text-[#777D75] flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-[#879B87]" />
            <span>SUPABASE_SECRET_KEY secured server-side. SUPABASE_PUBLISHABLE_KEY used with active Row Level Security (RLS).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
