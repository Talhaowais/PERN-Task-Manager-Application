import { useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

        {/* Email */}
        <input
          className="auth-input"
          placeholder="Email"
          type="email"
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {/* Password with Eye Button */}
        <div className="password-wrapper">
          <input
            className="auth-input"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            required
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="eye-icon"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit">Login</button>

        <p>
          Don’t have an account? <Link to="/signup">Signup</Link>
        </p>
      </form>

      {/* Minimal required CSS (add to your CSS file if not already present) */}
      <style>{`
        .auth-input {
          width: 100%;
          padding: 12px 14px;
          margin: 8px 0;
          border: 1px solid #ccc;
          border-radius: 6px;
          outline: none;
          box-sizing: border-box;
        }

        .password-wrapper {
          position: relative;
          width: 100%;
        }

        .eye-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #555;
          display: flex;
          align-items: center;
        }

        .auth-card {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}