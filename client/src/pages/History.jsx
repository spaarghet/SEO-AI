import React, { useEffect, useState, useContext } from "react";
import api from "../api/apiClient";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function History() {
    const { user } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [providerFilter, setProviderFilter] = useState("all");

    useEffect(() => {
        api.get("/ai/history")
            .then((r) => setItems(r.data.data))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    const handleDownload = async (id, title, e) => {
        if (e) e.stopPropagation();
        const tid = toast.loading("Preparing document...");
        try {
            const response = await api.get(`/ai/export/${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${title || 'seo-blog'}.txt`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success("Downloaded!", { id: tid });
        } catch (err) {
            toast.error("Download failed", { id: tid });
        }
    };

    const filteredItems = items.filter((it) => {
        const matchesSearch = (it.output?.metaTitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (it.userId?.email || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProvider = providerFilter === "all" || it.provider === providerFilter;
        return matchesSearch && matchesProvider;
    });

    if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h2 className="text-3xl font-black text-slate-900">History</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-3 border rounded-xl w-full md:w-64 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                    <select
                        value={providerFilter}
                        onChange={(e) => setProviderFilter(e.target.value)}
                        className="p-3 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-600"
                    >
                        <option value="all">All Engines</option>
                        <option value="gemini">Gemini</option>
                        <option value="groq">Groq</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredItems.length === 0 && <p className="text-slate-500 bg-white p-12 rounded-2xl shadow-sm text-center font-medium border-2 border-dashed">No matches found.</p>}

                {filteredItems.map((it) => (
                    <div
                        key={it._id}
                        onClick={() => setSelectedBlog(it)}
                        className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer hover:shadow-lg transition-all border border-slate-100 hover:border-indigo-200 group"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{it.provider}</span>
                                    <span className="text-xs text-slate-400 font-medium">{new Date(it.createdAt).toLocaleDateString()}</span>
                                    {user?.role === "admin" && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">User: {it.userId?.email}</span>}
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">{it.output?.metaTitle || "Draft Generation"}</h4>
                                <p className="text-sm text-slate-500 line-clamp-1">{it.output?.metaDescription}</p>
                            </div>
                            <button
                                onClick={(e) => handleDownload(it._id, it.output?.metaTitle, e)}
                                className="w-full sm:w-auto text-xs font-black uppercase text-slate-600 bg-slate-100 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg transition"
                            >
                                ↓ Save TXT
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedBlog && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-start bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedBlog.output?.metaTitle}</h3>
                                <div className="flex gap-3 mt-1">
                                    <span className="text-xs text-slate-400 font-bold uppercase">{new Date(selectedBlog.createdAt).toLocaleString()}</span>
                                    {user?.role === "admin" && <span className="text-xs text-red-500 font-bold uppercase">By: {selectedBlog.userId?.email}</span>}
                                </div>
                            </div>
                            <button onClick={() => setSelectedBlog(null)} className="text-slate-400 hover:text-red-500 text-3xl leading-none">&times;</button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-8">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Metadata Context</h4>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-slate-600 leading-relaxed">{selectedBlog.output?.metaDescription}</div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4">Content Outline</h4>
                                    {Array.isArray(selectedBlog?.output?.outline) ? (
                                        <ol className="space-y-4">
                                            {selectedBlog.output.outline.map((item, index) => (
                                                <li key={index} className="flex gap-4 text-slate-800">
                                                    <span className="font-mono text-indigo-400 font-black">{index + 1}</span>
                                                    <span className="font-medium">{item}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    ) : <p className="text-slate-500 italic">No outline data.</p>}
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">Suggested Links</h4>
                                    {Array.isArray(selectedBlog?.output?.internalLinks) && selectedBlog.output.internalLinks.length > 0 ? (
                                        <ul className="space-y-3">
                                            {selectedBlog.output.internalLinks.map((link, index) => (
                                                <li key={index} className="flex items-center gap-2">
                                                    <span className="text-emerald-400">🔗</span>
                                                    <a href={link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline break-all text-xs font-bold">{link}</a>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className="text-slate-500 italic">No links generated.</p>}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t flex flex-col sm:flex-row justify-end gap-3 bg-slate-50/50">
                            <button onClick={() => setSelectedBlog(null)} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition">Close</button>
                            <button
                                onClick={() => handleDownload(selectedBlog._id, selectedBlog.output?.metaTitle)}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                            >
                                Download TXT
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}