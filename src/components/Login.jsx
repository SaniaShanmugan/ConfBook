import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken, setUserLocal, getUser } from "../api";
import "./Login.css";
import emg from "../assets/emergere.jpg";

function Login({ setUser }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser();
    if (user) {
      setUser && setUser(user);
      navigate("/", { replace: true });
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }

    setLoading(true);
    setError("");

    const data = await api("/auth/login", "POST", { email, password });

    if (data.error) {
      setError(data.error);
      setLoading(false);
      return;
    }

    setToken(data.token);
    setUserLocal(data.user);
    setUser && setUser(data.user);
    navigate("/", { replace: true });
  };

  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password required.");
      return;
    }
    setLoading(true);
    setError("");

    const data = await api("/auth/register", "POST", { email, password });

    if (data.error) {
      setError(data.error);
    } else {
      setError("Account created. You can login now.");
    }
    setLoading(false);
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        <div className="login-brand">
          <img src={emg} alt="logo" className="brand-logo" />
          <h1 className="brand-title">ConfBook</h1>
        </div>
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue</p>
        </div>
        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="login-btn primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <button type="button" className="login-btn secondary"
            onClick={handleSignup} disabled={loading}>
            Create Account
          </button>
        </form>
        <div className="login-footer">
          <p>Secure conference booking platform</p>
        </div>
      </div>
    </div>
  );
}

export default Login;