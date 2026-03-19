import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Header() {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        navigate("/login");
        setIsOpen(false);
    };

    return (
        <header className="bg-white border-b sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/" className="text-xl md:text-2xl font-bold text-indigo-600">SEO.AI</Link>

                    {/* Hamburger Button */}
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-600 focus:outline-none">
                        {isOpen ? "✕" : "☰"}
                    </button>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        {user ? (
                            <>
                                <Link to="/generator" className="text-slate-600 hover:text-indigo-600 font-medium">Generator</Link>
                                <Link to="/history" className="text-slate-600 hover:text-indigo-600 font-medium">History</Link>
                                {user.role === "admin" && <Link to="/admin" className="text-red-600 font-medium">Admin</Link>}
                                <button onClick={handleLogout} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200">Logout</button>
                            </>
                        ) : (
                            <Link to="/login" className="bg-indigo-600 text-white px-5 py-2 rounded-lg">Login</Link>
                        )}
                    </nav>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <nav className="md:hidden pb-4 flex flex-col space-y-3 animate-in slide-in-from-top duration-200">
                        {user ? (
                            <>
                                <Link to="/generator" onClick={() => setIsOpen(false)} className="block py-2 text-slate-600 font-medium">Generator</Link>
                                <Link to="/history" onClick={() => setIsOpen(false)} className="block py-2 text-slate-600 font-medium">History</Link>
                                {user.role === "admin" && <Link to="/admin" onClick={() => setIsOpen(false)} className="block py-2 text-red-600 font-medium">Admin</Link>}
                                <button onClick={handleLogout} className="w-full text-left py-2 text-slate-700 font-medium border-t">Logout</button>
                            </>
                        ) : (
                            <Link to="/login" onClick={() => setIsOpen(false)} className="block py-2 text-indigo-600 font-medium">Login</Link>
                        )}
                    </nav>
                )}
            </div>
        </header>
    );
}