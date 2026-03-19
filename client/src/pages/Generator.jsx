import React, { useState, useContext } from "react";
import api from "../api/apiClient";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import ProviderSwitcher from "../components/ProviderSwitcher";
import LoadingStream from "../components/LoadingStream";

export default function Generator() {
    const { fetchMe } = useContext(AuthContext);

    const [provider, setProvider] = useState("gemini");
    const [keyword, setKeyword] = useState("");
    const [topic, setTopic] = useState("");
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState(null);
    const [streaming, setStreaming] = useState(false);

    const generate = async () => {
        if (!keyword || !topic) return toast.error("Provide keyword and topic");
        setLoading(true);
        try {
            const res = await api.post("/ai/generate", { provider, input: { keyword, topic } });
            setOutput(res.data.output);
            toast.success("Content generated successfully!");
            await fetchMe();
        } catch (err) {
            console.error("Generate Error:", err);
            toast.error(err.response?.data?.error || err.message || "Error generating");
        } finally {
            setLoading(false);
        }
    };

    const startStream = async () => {
        if (provider !== "groq") return toast.error("Streaming only works with Groq");
        if (!keyword || !topic) return toast.error("Provide keyword and topic");

        setOutput("");
        setStreaming(true);

        const token = localStorage.getItem("token");
        const params = new URLSearchParams({ keyword, topic, token }).toString();
        const es = new EventSource(`${import.meta.env.VITE_API_BASE || "http://localhost:5000/api"}/ai/stream?${params}`, { withCredentials: true });

        es.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.chunk) {
                    setOutput((p) => (typeof p === "string" ? p + data.chunk : data.chunk));
                }
                if (data.done) {
                    es.close();
                    setStreaming(false);
                    setOutput((prev) => {
                        if (data.output) return data.output;
                        if (typeof prev === "string") {
                            try {
                                const cleanText = prev.replace(/```json/g, "").replace(/```/g, "").trim();
                                return JSON.parse(cleanText);
                            } catch { return prev; }
                        }
                        return prev;
                    });
                    toast.success("Live stream finished!");
                    fetchMe();
                }
                if (data.error) {
                    toast.error(data.error);
                    es.close();
                    setStreaming(false);
                }
            } catch (err) { console.error("SSE Error", err); }
        };

        es.onerror = () => {
            es.close();
            setStreaming(false);
            toast.error("Stream interrupted.");
        };
    };

    const handleReset = () => {
        setKeyword("");
        setTopic("");
        setOutput(null);
    };

    const isWorking = loading || streaming;
    const hasResult = !!output;

    return (
        <div className="max-w-4xl mx-auto py-4 md:py-8 px-2 md:px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 md:mb-8 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Generator</h2>
                    <p className="text-slate-500 mt-1 text-sm md:text-base">Generate SEO-optimized blog outlines and metadata.</p>
                </div>
                {hasResult && (
                    <button
                        onClick={handleReset}
                        disabled={isWorking}
                        className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition"
                    >
                        <span>↺</span> Reset Form
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="p-4 md:p-8 space-y-6">
                    <ProviderSwitcher value={provider} onChange={setProvider} disabled={isWorking || hasResult} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Keyword</label>
                            <input
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="e.g., react context api"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
                                disabled={isWorking || hasResult}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Context / Topic URL</label>
                            <input
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., https://react.dev"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
                                disabled={isWorking || hasResult}
                            />
                        </div>
                    </div>

                    {!hasResult && (
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                            <button
                                onClick={generate}
                                disabled={isWorking}
                                className="flex-1 bg-indigo-600 text-white p-3 md:p-4 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-200 transition shadow-lg shadow-indigo-100 disabled:shadow-none text-sm md:text-base"
                            >
                                {loading ? "Analyzing..." : "Generate Instantly"}
                            </button>
                            <button
                                onClick={startStream}
                                disabled={isWorking || provider !== "groq"}
                                className="flex-1 bg-white text-indigo-600 border-2 border-indigo-600 p-3 md:p-4 rounded-xl font-bold hover:bg-indigo-50 disabled:border-slate-200 disabled:text-slate-400 transition text-sm md:text-base"
                            >
                                {streaming ? "Streaming..." : "Stream (Groq Only)"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isWorking && <LoadingStream message={streaming ? "Groq is generating live content..." : "Gemini is composing your SEO data..."} />}

            {output && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 px-2">Generated Result</h3>
                    {typeof output === "string" ? (
                        <div className="bg-slate-900 text-slate-100 p-4 md:p-6 rounded-2xl shadow-inner font-mono text-xs md:text-sm whitespace-pre-wrap leading-relaxed border-4 border-slate-800">
                            {output}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Meta Data</span>
                                <h4 className="text-xl md:text-2xl font-black text-slate-900 mt-2">{output.metaTitle}</h4>
                                <p className="text-slate-600 mt-3 leading-relaxed text-sm md:text-base">{output.metaDescription}</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-slate-50 p-5 md:p-8 rounded-2xl border border-slate-200">
                                    <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm md:text-base">
                                        <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded">BLOG OUTLINE</span>
                                    </h5>
                                    <ol className="space-y-4">
                                        {Array.isArray(output.outline) && output.outline.map((o, i) => (
                                            <li key={i} className="flex gap-4 text-slate-700 text-sm md:text-base">
                                                <span className="font-mono text-indigo-400 font-bold">{String(i + 1).padStart(2, '0')}</span>
                                                <span className="font-medium">{o}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                <div className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200">
                                    <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm md:text-base">
                                        <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded">INTERNAL LINKS</span>
                                    </h5>
                                    <ul className="space-y-3">
                                        {Array.isArray(output.internalLinks) && output.internalLinks.map((l, i) => (
                                            <li key={i}>
                                                <a href={l} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 text-xs md:text-sm font-medium underline break-all">
                                                    {l}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}