import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import type { KnowledgeDocument, PaginatedResponse } from '../types';
import { useTheme } from '../context/ThemeContext';

export default function KnowledgePage() {
    const { designSystem } = useTheme();
    const isModern = designSystem === 'modern';
    const [docs, setDocs] = useState<PaginatedResponse<KnowledgeDocument> | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { loadDocuments(); }, []);

    const loadDocuments = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getDocuments({ page: 1, pageSize: 50 });
            setDocs(data);
        } catch (err: any) {
            const errorMsg = err?.response?.data?.error || 'Failed to load documents';
            setError(errorMsg);
            console.error('Failed to load documents', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        setError(null);
        try {
            for (const file of Array.from(files)) await api.uploadDocument(file);
            await loadDocuments();
        } catch (err: any) {
            const errorMsg = err?.response?.data?.error || 'Upload failed';
            setError(errorMsg);
            console.error('Upload failed', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this document?')) return;
        setError(null);
        try {
            await api.deleteDocument(id);
            await loadDocuments();
        } catch (err: any) {
            const errorMsg = err?.response?.data?.error || 'Delete failed';
            setError(errorMsg);
            console.error('Delete failed', err);
        }
    };

    const handleIndex = async (id: string) => {
        setError(null);
        try {
            await api.triggerIndexing(id);
            await loadDocuments();
        } catch (err: any) {
            const errorMsg = err?.response?.data?.error || 'Indexing failed';
            setError(errorMsg);
            console.error('Indexing failed', err);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="p-8 text-skin-base transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Knowledge Base</h1>
                    <p className="text-skin-muted">Upload and manage RAG documents for AskBox AI responses</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadDocuments} className={`px-4 py-2 rounded-lg text-sm font-bold border flex items-center gap-2 transition-colors ${
                        isModern ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50' : 'bg-primary/10 border-primary/20 text-slate-100 hover:bg-primary/20'
                    }`}>
                        <span className="material-symbols-outlined text-sm">refresh</span> Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-400 text-sm">error</span>
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Upload Area — editorial styled */}
            <div
                className={`rounded-2xl p-10 border-2 border-dashed transition-all cursor-pointer mb-8 overflow-hidden ${
                    dragActive 
                        ? (isModern ? 'border-indigo-500 bg-indigo-50' : 'border-primary bg-primary/10') 
                        : (isModern ? 'border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50' : 'border-primary/20 hover:border-primary/40 bg-primary/5')
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); handleUpload(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="flex flex-col items-center text-center">
                    {uploading ? (
                        <span className={`material-symbols-outlined text-4xl animate-spin mb-3 ${isModern ? 'text-indigo-600' : 'text-primary'}`}>progress_activity</span>
                    ) : (
                        <span className={`material-symbols-outlined text-4xl mb-3 ${isModern ? 'text-indigo-400' : 'text-slate-500'}`}>cloud_upload</span>
                    )}
                    <p className={`text-sm font-bold ${isModern ? 'text-slate-700' : 'text-slate-300'}`}>
                        {uploading ? 'Uploading documents...' : 'Drop files here or click to browse'}
                    </p>
                    <p className="text-[10px] text-skin-muted mt-1">Supports PDF, TXT, DOC, DOCX — Max 50MB per file</p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.txt,.doc,.docx"
                    multiple
                    onChange={(e) => handleUpload(e.target.files)}
                />
            </div>

            {/* Documents Grid */}
            <div className="ds-card p-0 group overflow-hidden">
                <div className={`px-6 py-4 border-b flex items-center justify-between ${isModern ? 'bg-slate-50/50 border-slate-200' : 'border-primary/10'}`}>
                    <span className="text-sm font-bold text-skin-base">{docs?.total || 0} Documents</span>
                    <div className="text-[10px] text-skin-muted uppercase font-bold tracking-wider">Azure AI Search Indexed</div>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
                    </div>
                ) : docs?.items.length === 0 ? (
                    <div className="p-12 text-center text-skin-muted">
                        <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">description</span>
                        <p>No documents uploaded yet</p>
                    </div>
                ) : (
                    <div className={`divide-y ${isModern ? 'divide-slate-100' : 'divide-primary/10'}`}>
                        {docs?.items.map((doc) => (
                            <div key={doc.id} className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                                isModern ? 'hover:bg-slate-50' : 'hover:bg-primary/5'
                            }`}>
                                <div className={`size-10 rounded-xl flex items-center justify-center ${
                                    isModern ? 'bg-indigo-50 text-indigo-600' : 'bg-primary/20 text-primary'
                                }`}>
                                    <span className="material-symbols-outlined text-[20px]">description</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate text-skin-base">{doc.originalName}</p>
                                    <p className="text-[10px] text-skin-muted">
                                        {formatSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={doc.indexingStatus} isModern={isModern} />
                                </div>
                                <div className="flex items-center gap-1">
                                    {doc.indexingStatus !== 'indexing' && (
                                        <button
                                            onClick={() => handleIndex(doc.id)}
                                            className={`size-8 rounded-lg flex items-center justify-center transition-colors ${
                                                isModern 
                                                    ? 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50' 
                                                    : 'text-slate-400 hover:text-primary hover:bg-primary/20'
                                            }`}
                                            title="Trigger indexing"
                                        >
                                            <span className="material-symbols-outlined text-sm">search</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="size-8 rounded-lg hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
                                        title="Delete document"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status, isModern }: { status: string, isModern: boolean }) {
    const styles: Record<string, string> = {
        indexed: isModern ? 'bg-emerald-100 text-emerald-700' : 'bg-accent-teal/10 text-accent-teal',
        indexing: isModern ? 'bg-indigo-100 text-indigo-700' : 'bg-primary/10 text-primary',
        failed: isModern ? 'bg-red-100 text-red-700' : 'bg-red-500/10 text-red-400',
        pending: isModern ? 'bg-gray-100 text-gray-600' : 'bg-slate-500/10 text-slate-400',
    };
    const icons: Record<string, string> = {
        indexed: 'check_circle',
        indexing: 'progress_activity',
        failed: 'error',
        pending: 'schedule',
    };
    return (
        <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${styles[status] || styles.pending}`}>
            <span className={`material-symbols-outlined text-sm ${status === 'indexing' ? 'animate-spin' : ''}`}>{icons[status] || 'schedule'}</span>
            {status}
        </span>
    );
}
