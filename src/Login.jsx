import { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { toast } from "react-toastify";

function Login() {
  const isDemo = import.meta.env.VITE_APP_MODE === "demo";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error("Login failed: " + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Admin Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              placeholder="Enter your email"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn login-btn">
            Login
          </button>
        </form>

        {isDemo && (
          <div className="demo-info">
            Demo account
            <br />
            Email: {import.meta.env.VITE_DEMO_EMAIL}
            <br />
            Password: {import.meta.env.VITE_DEMO_PASSWORD}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
