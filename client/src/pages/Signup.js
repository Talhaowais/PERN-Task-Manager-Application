import { useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/signup", form);
      navigate("/login");
    } catch {
      setError("Signup failed");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={submit} className="auth-card">
        <h2>Create Account</h2>

        <input
          placeholder="Name"
          required
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

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

        <button>Signup</button>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}