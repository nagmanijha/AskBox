<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { SystemConfig } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
    const { designSystem } = useTheme();
    const { user, isDemoMode } = useAuth();
    const isModern = designSystem === 'modern';
    const isAdmin = user?.role === 'admin';
    const [settings, setSettings] = useState<SystemConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [saved, setSaved] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Record<string, string>>({});
    const [showNew, setShowNew] = useState(false);
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const inputClasses = `w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 transition-colors ${
        isModern 
            ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 placeholder-slate-400' 
            : 'bg-background-dark border-primary/20 text-slate-100 placeholder-slate-600 focus:ring-primary'
    }`;

    useEffect(() => { loadSettings(); }, []);

    const loadSettings = async () => {
        setLoading(true);
        setError(null);
        try {
            let data;
            if (isDemoMode) {
                // Return comprehensive mock settings for demo/mock-auth mode
                data = [
                    { id: '1', key: 'max_retries', value: 3, description: 'Maximum number of API retry attempts before failing', updatedAt: new Date().toISOString() },
                    { id: '2', key: 'system_prompt', value: 'You are a helpful assistant for rural Indian farmers. Speak in a respectful, clear tone.', description: 'Base instruction set for the LLM core', updatedAt: new Date().toISOString() },
                    { id: '3', key: 'supported_languages', value: '["Hindi", "Bhojpuri", "Maithili", "Magahi", "Tamil", "Kannada"]', description: 'List of dialects currently active in the STT engine', updatedAt: new Date().toISOString() },
                    { id: '4', key: 'latency_threshold', value: 250, description: 'Target average response time in milliseconds', updatedAt: new Date().toISOString() }
                ];
            } else {
                data = await api.getSettings();
            }
            setSettings(data);
            const values: Record<string, string> = {};
            data.forEach((s: any) => (values[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value)));
            setEditValues(values);
        } catch (err: any) {
            const errorMsg = err?.response?.data?.error || 'Failed to load settings';
            setError(errorMsg);
            console.error('Failed to load settings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string) => {
        setSaving(key);
        setError(null);
        try {
            let parsedValue: any;
            try { parsedValue = JSON.parse(editValues[key]); } catch { parsedValue = editValues[key]; }
            await api.updateSetting(key, parsedValue);
            setSaved(key);
            setTimeout(() => setSaved(null), 2000);
        } catch (err: any) {
            const errorMsg = err?.response?.data?.error || 'Failed to save setting';
            setError(errorMsg);
            console.error('Failed to save setting', err);
        } finally {
            setSaving(null);
        }
    };

    const handleCreate = async () => {
        if (!newKey) {
            setError('Setting key is required');
            return;
        }
        setError(null);
        try {
            let parsedValue: any;
            try { parsedValue = JSON.parse(newValue); } catch { parsedValue = newValue; }
            await api.createSetting(newKey, parsedValue, newDesc);
            setShowNew(false); setNewKey(''); setNewValue(''); setNewDesc('');
            await loadSettings();
        } catch (err: any) {
            const errorMsg = err?.response?.data?.error || 'Failed to create setting';
            setError(errorMsg);
            console.error('Failed to create setting', err);
        }
    };

    const formatLabel = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center gap-6 animate-in fade-in zoom-in-95">
                <div className={`size-24 rounded-full flex items-center justify-center ${isModern ? 'bg-red-50 text-red-500' : 'bg-red-500/10 text-red-400'}`}>
                    <span className="material-symbols-outlined text-5xl">lock</span>
                </div>
                <div>
                    <h2 className="text-2xl font-black mb-2">Access Restricted</h2>
                    <p className="text-skin-muted max-w-xs mx-auto">Only system administrators can modify core configuration parameters.</p>
                </div>
                <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className={`px-8 py-3 rounded-xl font-bold transition-all ${isModern ? 'bg-indigo-600 text-white' : 'bg-primary text-background-dark'}`}
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 text-skin-base transition-colors duration-300">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">System Configuration</h1>
                    <p className="text-skin-muted">Configure AskBox assistant behavior and parameters</p>
                </div>
                <button
                    onClick={() => setShowNew(!showNew)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${
                        isModern ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-primary text-background-dark hover:bg-primary/90'
                    }`}
                >
                    <span className="material-symbols-outlined text-sm">add</span> Add Setting
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-400 text-sm">error</span>
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* New Setting Form */}
            {showNew && (
                <div className={`rounded-2xl p-5 mb-6 space-y-3 border ${
                    isModern ? 'bg-indigo-50 border-indigo-100' : 'bg-primary/5 border-primary/10'
                }`}>
                    <h3 className="text-sm font-bold text-skin-base">New Configuration</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                            className={inputClasses}
                            placeholder="Setting key (e.g. max_retries)"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                        />
                        <input
                            className={inputClasses}
                            placeholder="Value"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                        />
                        <input
                            className={inputClasses}
                            placeholder="Description"
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleCreate} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 ${
                            isModern ? 'bg-indigo-600 text-white' : 'bg-primary text-background-dark'
                        }`}>
                            <span className="material-symbols-outlined text-xs">save</span> Create
                        </button>
                        <button onClick={() => setShowNew(false)} className={`px-4 py-2 rounded-lg text-xs font-bold border ${
                            isModern ? 'bg-white border-slate-300 text-slate-500 hover:text-slate-700' : 'bg-primary/10 border-primary/20 text-slate-300'
                        }`}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Settings List */}
            <div className="space-y-3">
                {settings.map((setting) => (
                    <div key={setting.id} className={`${isModern ? 'ds-card' : 'bg-primary/5 border border-primary/10 rounded-2xl p-5'}`}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`material-symbols-outlined text-[20px] ${isModern ? 'text-indigo-600' : 'text-primary'}`}>settings</span>
                                    <h3 className="text-sm font-bold text-skin-base">{formatLabel(setting.key)}</h3>
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isModern ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-slate-500'}`}>{setting.key}</span>
                                </div>
                                {setting.description && (
                                    <p className="text-xs text-skin-muted mb-3 pl-7">{setting.description}</p>
                                )}
                                {setting.key === 'supported_languages' || setting.key === 'system_prompt' ? (
                                    <textarea
                                        className={`${inputClasses} min-h-[80px] resize-y font-mono text-xs`}
                                        value={editValues[setting.key] || ''}
                                        onChange={(e) => setEditValues({ ...editValues, [setting.key]: e.target.value })}
                                    />
                                ) : (
                                    <input
                                        className={inputClasses}
                                        value={editValues[setting.key] || ''}
                                        onChange={(e) => setEditValues({ ...editValues, [setting.key]: e.target.value })}
                                    />
                                )}
                            </div>
                            <button
                                onClick={() => handleSave(setting.key)}
                                disabled={saving === setting.key}
                                className={`mt-6 size-10 rounded-xl flex items-center justify-center transition-all border ${
                                    saved === setting.key
                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        : isModern 
                                            ? 'bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border-slate-200'
                                            : 'bg-primary/10 text-slate-400 hover:text-primary hover:bg-primary/20 border-primary/20'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-sm ${saving === setting.key ? 'animate-spin' : ''}`}>
                                    {saving === setting.key ? 'progress_activity' : saved === setting.key ? 'check' : 'save'}
                                </span>
                            </button>
                        </div>
                        <p className="text-[10px] text-skin-muted mt-2 pl-7">
                            Last updated: {new Date(setting.updatedAt).toLocaleString('en-IN')}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
=======
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { SystemConfig } from '../types';

export default function SettingsPage() {
    const [settings, setSettings] = useState<SystemConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [saved, setSaved] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Record<string, string>>({});
    const [showNew, setShowNew] = useState(false);
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const [newDesc, setNewDesc] = useState('');

    useEffect(() => { loadSettings(); }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await api.getSettings();
            setSettings(data);
            const values: Record<string, string> = {};
            data.forEach((s) => (values[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value)));
            setEditValues(values);
        } catch (err) { console.error('Failed to load settings', err); }
        finally { setLoading(false); }
    };

    const handleSave = async (key: string) => {
        setSaving(key);
        try {
            let parsedValue: any;
            try { parsedValue = JSON.parse(editValues[key]); } catch { parsedValue = editValues[key]; }
            await api.updateSetting(key, parsedValue);
            setSaved(key);
            setTimeout(() => setSaved(null), 2000);
        } catch (err) { console.error('Failed to save setting', err); }
        finally { setSaving(null); }
    };

    const handleCreate = async () => {
        if (!newKey) return;
        try {
            let parsedValue: any;
            try { parsedValue = JSON.parse(newValue); } catch { parsedValue = newValue; }
            await api.createSetting(newKey, parsedValue, newDesc);
            setShowNew(false); setNewKey(''); setNewValue(''); setNewDesc('');
            await loadSettings();
        } catch (err) { console.error('Failed to create setting', err); }
    };

    const formatLabel = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">System Configuration</h1>
                    <p className="text-slate-400">Configure AskBox assistant behavior and parameters</p>
                </div>
                <button
                    onClick={() => setShowNew(!showNew)}
                    className="bg-primary text-background-dark px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add</span> Add Setting
                </button>
            </div>

            {/* New Setting Form */}
            {showNew && (
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 mb-6 space-y-3">
                    <h3 className="text-sm font-bold">New Configuration</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                            className="bg-background-dark border border-primary/20 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Setting key (e.g. max_retries)"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                        />
                        <input
                            className="bg-background-dark border border-primary/20 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Value"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                        />
                        <input
                            className="bg-background-dark border border-primary/20 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Description"
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleCreate} className="bg-primary text-background-dark px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">save</span> Create
                        </button>
                        <button onClick={() => setShowNew(false)} className="bg-primary/10 px-4 py-2 rounded-lg text-xs font-bold border border-primary/20 text-slate-300">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Settings List */}
            <div className="space-y-3">
                {settings.map((setting) => (
                    <div key={setting.id} className="bg-primary/5 border border-primary/10 rounded-2xl p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-primary text-[20px]">settings</span>
                                    <h3 className="text-sm font-bold">{formatLabel(setting.key)}</h3>
                                    <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded">{setting.key}</span>
                                </div>
                                {setting.description && (
                                    <p className="text-xs text-slate-500 mb-3 pl-7">{setting.description}</p>
                                )}
                                {setting.key === 'supported_languages' || setting.key === 'system_prompt' ? (
                                    <textarea
                                        className="w-full bg-background-dark border border-primary/20 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 outline-none focus:ring-1 focus:ring-primary min-h-[80px] resize-y"
                                        value={editValues[setting.key] || ''}
                                        onChange={(e) => setEditValues({ ...editValues, [setting.key]: e.target.value })}
                                    />
                                ) : (
                                    <input
                                        className="w-full bg-background-dark border border-primary/20 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-primary"
                                        value={editValues[setting.key] || ''}
                                        onChange={(e) => setEditValues({ ...editValues, [setting.key]: e.target.value })}
                                    />
                                )}
                            </div>
                            <button
                                onClick={() => handleSave(setting.key)}
                                disabled={saving === setting.key}
                                className={`mt-6 size-10 rounded-xl flex items-center justify-center transition-all ${saved === setting.key
                                        ? 'bg-accent-teal/20 text-accent-teal'
                                        : 'bg-primary/10 text-slate-400 hover:text-primary hover:bg-primary/20 border border-primary/20'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-sm ${saving === setting.key ? 'animate-spin' : ''}`}>
                                    {saving === setting.key ? 'progress_activity' : saved === setting.key ? 'check' : 'save'}
                                </span>
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-2 pl-7">
                            Last updated: {new Date(setting.updatedAt).toLocaleString('en-IN')}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
>>>>>>> pr-3
