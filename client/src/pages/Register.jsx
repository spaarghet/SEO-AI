import React, { useState, useContext } from "react";
import api from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
    const { setUser } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const nav = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/auth/register", { email, password });
            localStorage.setItem("token", res.data.token);
            setUser(res.data.user);
            nav("/generator");
        } catch (err) {
            alert(err.response?.data?.error || "Register failed");
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            <h2 className="text-xl font-semibold">Register</h2>
            <form onSubmit={submit} className="mt-4 flex flex-col gap-2">
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="p-2 border" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="p-2 border" />
                <button className="bg-green-600 text-white p-2 rounded">Register</button>
            </form>
        </div>
    );
}