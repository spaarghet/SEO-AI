import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Generator from "./pages/Generator";
import History from "./pages/History";
import Admin from "./pages/Admin";
import PrivateRoute from "./components/PrivateRoute";
import { AuthContext } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

export default function App() {
    const { user } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
            <Toaster position="bottom-center" reverseOrder={false} />

            <Header />

            <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
                <Routes>
                    <Route path="/login" element={user ? <Navigate to="/generator" /> : <Login />} />

                    <Route element={<PrivateRoute />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/generator" element={<Generator />} />
                        <Route path="/history" element={<History />} />
                    </Route>

                    <Route element={<PrivateRoute requireAdmin={true} />}>
                        <Route path="/admin" element={<Admin />} />
                    </Route>
                </Routes>
            </main>
        </div>
    );
}