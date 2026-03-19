import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
    const { user } = useContext(AuthContext);

    if (!user) return null; // Prevent rendering if user is missing

    const isUnlimited = user.role === "admin" || user.role === "pro";

    return (
        <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto mt-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            <p className="mt-4 text-lg">Welcome, <span className="font-semibold text-blue-600">{user.email}</span></p>

            <div className="mt-6 border-t pt-4">
                <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium capitalize">{user.role}</span>
                </div>

                <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">{isUnlimited ? "Total Content Generated:" : "Quota Used:"}</span>
                    <span className="font-medium">
                        {isUnlimited ? user.used : `${user.used} / ${user.quota}`}
                    </span>
                </div>
            </div>
        </div>
    );
}