import React, { useState } from 'react';
import {
  KnowledgeDocument,
  DocumentChunk,
} from '../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  FileText,
  Upload,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  RefreshCw,
  Plus,
  X,
  FileCode,
  ShieldAlert,
} from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const { documents, chunks, uploadDocument, deleteDocument } = useData();
  const { isCustomer, user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewChunkModal, setPreviewChunkModal] = useState<DocumentChunk | null>(null);

  // Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [newFileType, setNewFileType] = useState<'pdf' | 'docx' | 'txt' | 'md'>('txt');
  const [newContent, setNewContent] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];
  const docChunks = chunks.filter((c) => c.documentId === selectedDoc?.id);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsUploading(true);
    try {
      await uploadDocument({
        title: newTitle,
        fileName: `${newTitle.toLowerCase().replace(/\s+/g, '-')}.${newFileType}`,
        fileType: newFileType,
        rawContent: newContent,
        summary: newSummary,
        uploadedBy: user.displayName,
      });

      setNewTitle('');
      setNewContent('');
      setNewSummary('');
      setUploadModalOpen(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this verified document and its vector chunks?')) {
      await deleteDocument(id);
      if (selectedDocId === id) {
        setSelectedDocId(documents.find((d) => d.id !== id)?.id || '');
      }
    }
  };

  const fileTypeIcons: Record<string, string> = {
    pdf: 'bg-[#E66B5B]/15 text-[#E66B5B] border-[#E66B5B]/30',
    docx: 'bg-[#879B87]/20 text-[#252A26] border-[#879B87]/30',
    txt: 'bg-[#F5F3EE] text-[#777D75] border-[#E4E2DA]',
    md: 'bg-[#202522] text-[#C7F36B] border-[#2F3B34]',
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden bg-[#F5F3EE]">
      {/* Top Banner: Visual Ingestion Pipeline */}
      <div className="bg-[#202522] border-b border-[#2F3B34] px-6 py-4 text-[#F5F3EE] shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C7F36B] font-bold">
                Knowledge Intelligence Architecture
              </span>
              <span className="text-xs text-[#879B87]">•</span>
              <span className="text-xs font-mono text-[#879B87]">RAG Ingestion Pipeline</span>
            </div>
            <h2 className="font-heading font-extrabold text-base text-[#F5F3EE] mt-0.5">
              Verified Organizational Knowledge Base
            </h2>
          </div>

          {!isCustomer && (
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#C7F36B] text-[#171C19] hover:bg-[#B5E655] text-xs font-heading font-bold transition-all shadow-sm self-start md:self-auto"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Ingest Document</span>
            </button>
          )}
        </div>

        {/* Visual Pipeline Stages */}
        <div className="mt-4 pt-3 border-t border-[#2F3B34] flex items-center space-x-2 overflow-x-auto text-[11px] font-mono">
          {[
            { step: '01', label: 'Uploaded' },
            { step: '02', label: 'Extracted' },
            { step: '03', label: 'Chunked' },
            { step: '04', label: 'Embedded (768d)' },
            { step: '05', label: 'Searchable' },
          ].map((s, idx) => (
            <React.Fragment key={s.step}>
              <div className="flex items-center space-x-1.5 bg-[#171C19] border border-[#2C3530] px-3 py-1 rounded-md shrink-0">
                <span className="text-[#C7F36B] font-bold">{s.step}</span>
                <span className="text-[#F5F3EE] font-medium">{s.label}</span>
              </div>
              {idx < 4 && <ArrowRight className="w-3.5 h-3.5 text-[#879B87] shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content: Split Master-Detail */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Documents List */}
        <div className="w-96 bg-white border-r border-[#E4E2DA] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#E4E2DA]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#879B87] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search documents by title or topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#252A26] placeholder-[#777D75] focus:outline-none focus:border-[#879B87]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#E4E2DA]">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              const badgeClass = fileTypeIcons[doc.fileType] || fileTypeIcons.txt;

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#F5F3EE] border-l-3 border-l-[#202522]' : 'hover:bg-[#F5F3EE]/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${badgeClass}`}>
                      {doc.fileType}
                    </span>
                    <span className="text-[10px] font-mono text-[#79A88A] bg-[#79A88A]/10 px-1.5 py-0.5 rounded font-bold">
                      {doc.status}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-xs text-[#252A26] mt-2 leading-snug line-clamp-2">
                    {doc.title}
                  </h3>

                  <p className="text-[11px] text-[#777D75] mt-1 line-clamp-2 leading-relaxed">
                    {doc.summary}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[#879B87]">
                    <span>{doc.chunkCount} vector chunks</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Document Details & Chunk Inspector */}
        {selectedDoc ? (
          <div className="flex-1 flex flex-col overflow-y-auto bg-[#F5F3EE]">
            {/* Document Header */}
            <div className="p-6 bg-white border-b border-[#E4E2DA] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#879B87] uppercase font-bold">
                  Document ID: {selectedDoc.id}
                </span>

                {!isCustomer && (
                  <button
                    onClick={() => handleDelete(selectedDoc.id)}
                    className="text-xs font-mono text-[#E66B5B] hover:bg-[#FDF2F1] p-1.5 rounded-lg flex items-center space-x-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Document</span>
                  </button>
                )}
              </div>

              <h1 className="font-heading font-extrabold text-xl text-[#252A26]">
                {selectedDoc.title}
              </h1>

              <p className="text-xs text-[#777D75] leading-relaxed max-w-3xl">
                {selectedDoc.summary}
              </p>

              <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-[#777D75] border-t border-[#E4E2DA]">
                <div>File: <span className="font-bold text-[#252A26]">{selectedDoc.fileName}</span></div>
                <div>Size: <span className="font-bold text-[#252A26]">{(selectedDoc.fileSize / 1024).toFixed(1)} KB</span></div>
                <div>Indexed By: <span className="font-bold text-[#252A26]">{selectedDoc.uploadedBy}</span></div>
                <div>Status: <span className="font-bold text-[#79A88A]">{selectedDoc.status}</span></div>
              </div>
            </div>

            {/* Chunk Inspector */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#252A26]">
                    Semantic Chunks & Retrieval Units ({docChunks.length})
                  </h3>
                  <p className="text-xs text-[#777D75]">
                    These atomic units are matched during RAG queries to formulate grounded AI answers
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-white border border-[#E4E2DA] px-2 py-1 rounded text-[#777D75]">
                  Cosine Similarity Ready
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docChunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    className="p-4 rounded-xl bg-white border border-[#E4E2DA] shadow-2xs space-y-2 hover:border-[#879B87] transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#879B87]">
                      <span className="font-bold text-[#252A26]">{chunk.section}</span>
                      <span>Page {chunk.pageNumber}</span>
                    </div>

                    <p className="text-xs text-[#252A26] leading-relaxed line-clamp-4 italic border-l-2 border-l-[#C7F36B] pl-2.5">
                      "{chunk.content}"
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-[#777D75] border-t border-[#E4E2DA]/60">
                      <span>{chunk.content.length} characters</span>
                      <button
                        onClick={() => setPreviewChunkModal(chunk)}
                        className="text-[#202522] hover:text-[#C7F36B] font-bold flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect Chunk</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-[#777D75]">
            Select a document from the left panel to inspect chunks.
          </div>
        )}
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E2DA] max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E4E2DA] pb-3">
              <h3 className="font-heading font-bold text-base text-[#252A26]">Ingest Knowledge Document</h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1 text-[#777D75] hover:text-[#252A26] rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#777D75] mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Enterprise Billing & Refund Guidelines 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-xl px-3 py-2 text-xs text-[#252A26] focus:outline-none focus:border-[#879B87]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#777D75] mb-1">Format</label>
                  <select
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value as any)}
                    className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-xl px-3 py-2 text-xs text-[#252A26] focus:outline-none"
                  >
                    <option value="txt">Text (.txt)</option>
                    <option value="md">Markdown (.md)</option>
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="docx">Word Document (.docx)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#777D75] mb-1">Summary (Optional)</label>
                  <input
                    type="text"
                    placeholder="Brief description for retrieval indexing"
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-xl px-3 py-2 text-xs text-[#252A26] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#777D75] mb-1">
                  Document Content / Extracted Text
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste organizational documentation, SOP guidelines, technical specifications, or policy terms..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-xl p-3 text-xs text-[#252A26] focus:outline-none focus:border-[#879B87]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E4E2DA]">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#777D75] hover:bg-[#F5F3EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl bg-[#202522] text-[#C7F36B] hover:bg-[#2A312D] text-xs font-heading font-bold border border-[#2F3B34] flex items-center space-x-1.5"
                >
                  {isUploading ? <span>Processing Chunks...</span> : <span>Process & Index</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHUNK PREVIEW MODAL */}
      {previewChunkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E2DA] max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E4E2DA] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#879B87] uppercase">Vector Chunk Inspector</span>
                <h3 className="font-heading font-bold text-sm text-[#252A26]">{previewChunkModal.section}</h3>
              </div>
              <button
                onClick={() => setPreviewChunkModal(null)}
                className="p-1 text-[#777D75] hover:text-[#252A26] rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F5F3EE] p-4 rounded-xl border border-[#E4E2DA] text-xs text-[#252A26] leading-relaxed whitespace-pre-wrap">
              {previewChunkModal.content}
            </div>

            <div className="flex justify-between items-center text-xs font-mono text-[#777D75] pt-2">
              <span>Page {previewChunkModal.pageNumber}</span>
              <button
                onClick={() => setPreviewChunkModal(null)}
                className="px-4 py-1.5 rounded-lg bg-[#202522] text-[#F5F3EE] font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
