import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Gauge,
  BookOpen,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { EvaluationRecord } from '../types';

export const AIEvaluationView: React.FC = () => {
  const { evaluations, runEvaluation } = useData();
  const { isAdmin } = useAuth();

  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'latest' | 'history'>('latest');

  const latestEval: EvaluationRecord | undefined = evaluations[0];

  const handleRunTest = async () => {
    setIsRunning(true);
    try {
      await runEvaluation();
    } catch (err) {
      console.error('Evaluation run failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#E4E2DA] pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#879B87] uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#C7F36B]" />
            <span>RAG Quality Assurance & Grounding Verification</span>
          </div>
          <h1 className="text-3xl font-heading font-extrabold text-[#252A26] tracking-tight">
            AI Evaluation & Groundedness Gate
          </h1>
          <p className="text-sm text-[#777D75] mt-1 max-w-2xl">
            Systematic benchmark suite executing controlled retrieval queries against the live knowledge base to audit semantic recall, answer groundedness, citation precision, and latency.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          {isAdmin ? (
            <button
              onClick={handleRunTest}
              disabled={isRunning}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#202522] text-[#C7F36B] hover:bg-[#2A312D] text-xs font-heading font-bold border border-[#2F3B34] transition-all shadow-xs disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C7F36B]" />
                  <span>Executing 8 Evaluation Suites...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-[#C7F36B]" />
                  <span>Run Benchmark Evaluation</span>
                </>
              )}
            </button>
          ) : (
            <div className="text-xs font-mono text-[#777D75] bg-[#EAE8E0] px-3 py-1.5 rounded-lg border border-[#DBD8CE]">
              Admin Role Required to Trigger Runs
            </div>
          )}
        </div>
      </div>

      {/* KPI Scorecards */}
      {latestEval && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-[#202522] text-[#F5F3EE] p-5 rounded-2xl border border-[#2F3B34] shadow-sm">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#C7F36B]">
              Retrieval Success Rate
            </span>
            <div className="text-3xl font-heading font-extrabold mt-1 text-[#F5F3EE]">
              {latestEval.retrievalSuccessRate}%
            </div>
            <p className="text-[11px] text-[#879B87] mt-1 font-mono">
              {latestEval.successfulRetrievals} of {latestEval.totalTests} queries passed
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E4E2DA] shadow-2xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#777D75]">
              Average Semantic Relevance
            </span>
            <div className="text-3xl font-heading font-extrabold text-[#252A26] mt-1">
              {(latestEval.averageRelevanceScore * 100).toFixed(0)}%
            </div>
            <p className="text-[11px] text-[#79A88A] mt-1 font-mono">BM25 + Cosine threshold: &gt;0.70</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E4E2DA] shadow-2xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#777D75]">
              Groundedness Score
            </span>
            <div className="text-3xl font-heading font-extrabold text-[#252A26] mt-1">
              {(latestEval.groundednessScore * 100).toFixed(0)}%
            </div>
            <p className="text-[11px] text-[#777D75] mt-1 font-mono">Strict zero-hallucination compliance</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E4E2DA] shadow-2xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#777D75]">
              Mean Retrieval Latency
            </span>
            <div className="text-3xl font-heading font-extrabold text-[#252A26] mt-1">
              {latestEval.averageLatencyMs} <span className="text-sm font-normal text-[#777D75]">ms</span>
            </div>
            <p className="text-[11px] text-[#79A88A] mt-1 font-mono">High-throughput sub-500ms SLA</p>
          </div>
        </div>
      )}

      {/* Methodology Disclaimer Note */}
      <div className="bg-[#EAE8E0]/70 border border-[#DBD8CE] rounded-xl p-4 flex items-start space-x-3 text-xs text-[#252A26]">
        <HelpCircle className="w-4 h-4 text-[#879B87] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-heading font-bold text-[#252A26]">Deterministic Evaluation Methodology</p>
          <p className="text-[#777D75] leading-relaxed">
            Test cases run controlled prompts with known ground truth documents. Relevance scores reflect normalized BM25 keyword matching and vector chunk semantic similarity. Groundedness confirms that the model answer references explicit facts without ungrounded extrapolation.
          </p>
        </div>
      </div>

      {/* Detailed Benchmark Test Results Table */}
      {latestEval && (
        <div className="bg-white rounded-2xl border border-[#E4E2DA] shadow-2xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-[#E4E2DA] flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-[#252A26]">
                Benchmark Test Cases ({latestEval.testResults.length})
              </h3>
              <p className="text-xs text-[#777D75]">
                Run Timestamp: {new Date(latestEval.runDate).toLocaleString()}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#79A88A]/20 text-[#79A88A] border border-[#79A88A]/30">
              STATUS: {latestEval.status.toUpperCase()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F3EE] border-b border-[#E4E2DA] text-[#777D75] font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Test ID</th>
                  <th className="py-3 px-4">Test Query</th>
                  <th className="py-3 px-4">Expected Ground Truth</th>
                  <th className="py-3 px-4">Retrieved Knowledge Source</th>
                  <th className="py-3 px-4">Relevance</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E2DA]">
                {latestEval.testResults.map((tr) => (
                  <tr key={tr.id} className="hover:bg-[#F5F3EE]/60">
                    <td className="py-3 px-4 font-mono font-bold text-[#879B87]">{tr.id}</td>
                    <td className="py-3 px-4 font-medium text-[#252A26] max-w-xs">{tr.query}</td>
                    <td className="py-3 px-4 text-[#777D75] text-[11px] font-mono truncate max-w-[180px]">
                      {tr.expectedDoc}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#252A26] truncate max-w-[180px]">
                      {tr.retrievedDoc}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[#252A26]">
                        {Math.round(tr.relevanceScore * 100)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#777D75]">{tr.latencyMs}ms</td>
                    <td className="py-3 px-4">
                      {tr.status === 'PASS' ? (
                        <span className="flex items-center space-x-1 text-[#79A88A] font-mono font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PASS</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-[#E66B5B] font-mono font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>FAIL</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
