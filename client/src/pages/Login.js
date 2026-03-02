import { useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      login(res.data);
      navigate("/");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={submit} className="auth-card">
        <h2>Login</h2>

        <input
          placeholder="Email"
          type="email"
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Password"
          type="password"
          required
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {error && <p className="error">{error}</p>}

        <button>Login</button>

        <p>
          Don’t have an account? <Link to="/signup">Signup</Link>
        </p>
      </form>
    </div>
  );
}