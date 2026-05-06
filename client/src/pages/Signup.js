import { useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

        {/* Name */}
        <input
          className="auth-input"
          placeholder="Name"
          required
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

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

        <button type="submit">Signup</button>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>

      {/* Shared CSS (same as Login for consistency) */}
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