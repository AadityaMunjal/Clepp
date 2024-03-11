import { useRef, useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const emailRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: any) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      login && (await login(emailRef.current.value, passwordRef.current.value));
      navigate("/");
    } catch {
      setError("Failed to log in");
    }

    setLoading(false);
  }

  return (
    <>
      <div>
        <div>
          <h2 className="text-center mb-4">Log In</h2>
          {error && <p>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div id="email">
              <label>Email</label>
              <input type="email" ref={emailRef} required />
            </div>
            <div id="password">
              <label>Password</label>
              <input type="password" ref={passwordRef} required />
            </div>
            <button disabled={loading} className="w-100" type="submit">
              Log In
            </button>
          </form>
          <div className="w-100 text-center mt-3">
            <a href="/forgot-password">Forgot Password?</a>
          </div>
        </div>
      </div>
      <div className="w-100 text-center mt-2">
        Need an account? <a href="/signup">Sign Up</a>
      </div>
    </>
  );
}
