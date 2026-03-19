import React from "react";

export default function ProviderSwitcher({ value, onChange, disabled }) {
    const providers = [
        { id: "gemini", name: "Gemini", desc: "Balanced & Smart" },
        { id: "groq", name: "Groq (Llama)", desc: "Live Streaming" }
    ];

    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">AI Engine</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {providers.map((p) => (
                    <button
                        key={p.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(p.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${value === p.id ? "border-indigo-600 bg-indigo-50" : "border-slate-100 hover:border-slate-200"
                            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <p className={`font-bold ${value === p.id ? "text-indigo-700" : "text-slate-800"}`}>{p.name}</p>
                        <p className="text-xs text-slate-500">{p.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}