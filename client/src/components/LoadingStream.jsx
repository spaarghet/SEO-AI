import React from "react";

export default function LoadingStream({ message }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="relative flex h-12 w-12">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-12 w-12 bg-blue-600"></span>
            </div>
            <p className="mt-6 text-gray-600 font-medium animate-pulse">
                {message || "AI is processing your request..."}
            </p>
        </div>
    );
}