import React, { useEffect, useState } from "react";
import api from "../api/apiClient";
import * as yup from "yup";
import toast from "react-hot-toast";

const userSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    role: yup.string().required(),
    quota: yup.number().min(0).required(),
    password: yup.string().when('isNew', {
        is: true,
        then: () => yup.string().min(6, "Min 6 characters").required("Password required for new users"),
        otherwise: () => yup.string().nullable()
    })
});

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({ email: "", role: "free", quota: 5, password: "" });
    const [errors, setErrors] = useState({});

    const fetchUsers = () => {
        setLoading(true);
        api.get("/admin/users")
            .then(res => setUsers(res.data))
            .catch(() => toast.error("Failed to fetch users"))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        setForm(user ? { email: user.email, role: user.role, quota: user.quota, password: "" }
            : { email: "", role: "free", quota: 5, password: "" });
        setErrors({});
        setModalOpen(true);
    };

    const handleSave = async () => {
        try {
            await userSchema.validate({ ...form, isNew: !editingUser }, { abortEarly: false });
            if (editingUser) {
                await api.put(`/admin/users/${editingUser._id}`, form);
                if (form.password) await api.put(`/admin/users/${editingUser._id}/password`, { password: form.password });
                toast.success("User updated");
            } else {
                await api.post("/admin/users", form);
                toast.success("User created");
            }
            setModalOpen(false);
            fetchUsers();
        } catch (err) {
            if (err.inner) {
                const valErrors = {};
                err.inner.forEach(e => valErrors[e.path] = e.message);
                setErrors(valErrors);
            } else {
                toast.error(err.response?.data?.error || "Error saving user");
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this user?")) return;
        try {
            await api.delete(`/admin/users/${id}`);
            toast.success("User removed");
            fetchUsers();
        } catch (err) { toast.error("Delete failed"); }
    };

    if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-3xl font-black text-slate-900">User Management</h2>
                <button onClick={() => handleOpenModal()} className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition">
                    + Add New User
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50 border-b text-xs font-black text-slate-500 uppercase tracking-widest">
                                <th className="p-4">User Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Quota</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id} className="border-b hover:bg-slate-50 transition">
                                    <td className="p-4 font-bold text-slate-800">{u.email}</td>
                                    <td className="p-4 text-sm"><span className={`px-2 py-1 rounded-md font-bold uppercase text-[10px] ${u.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>{u.role}</span></td>
                                    <td className="p-4 text-sm text-slate-600 font-mono">{u.used || 0} / {u.quota}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleOpenModal(u)} className="text-indigo-600 hover:text-indigo-800 font-bold mr-4 text-sm transition">Edit</button>
                                        <button onClick={() => handleDelete(u._id)} className="text-red-600 hover:text-red-800 font-bold text-sm transition">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-black text-slate-900 mb-6">{editingUser ? "Update User" : "Register User"}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-slate-500 uppercase mb-1 block">Email Address</label>
                                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                                {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.email}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase mb-1 block">Role</label>
                                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition">
                                        <option value="free">Free</option>
                                        <option value="pro">Pro</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase mb-1 block">Quota</label>
                                    <input type="number" value={form.quota} onChange={e => setForm({ ...form, quota: e.target.value })} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-500 uppercase mb-1 block">{editingUser ? "Reset Password (optional)" : "Password"}</label>
                                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                                {errors.password && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.password}</p>}
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">Cancel</button>
                            <button onClick={handleSave} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}