import React, { useState, useContext } from "react";
import api from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import * as yup from "yup";

const loginSchema = yup.object().shape({
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required")
});

export default function Login() {
    const { setUser } = useContext(AuthContext);
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setErrors({});
        try {
            await loginSchema.validate(form, { abortEarly: false });

            setLoading(true);
            const res = await api.post("/auth/login", form);
            localStorage.setItem("token", res.data.token);
            setUser(res.data.user);
            nav("/generator");
        } catch (err) {
            setLoading(false);
            if (err.inner) {
                const validationErrors = {};
                err.inner.forEach(error => validationErrors[error.path] = error.message);
                setErrors(validationErrors);
            } else {
                setErrors({ server: err.response?.data?.error || "Login failed" });
            }
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
            {errors.server && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{errors.server}</div>}

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                    <input name="email" value={form.email} onChange={handleChange} placeholder="Email"
                        className={`w-full p-3 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password"
                        className={`w-full p-3 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <button disabled={loading} className="bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 disabled:bg-blue-300 flex justify-center">
                    {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "Login"}
                </button>
            </form>
        </div>
    );
}