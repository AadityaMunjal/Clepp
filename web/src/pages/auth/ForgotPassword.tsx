import { useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const ForgotPassword: React.FC = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const { resetPassword } = useAuth();
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setMessage("");
      setError("");
      setLoading(true);
      if (!emailRef.current?.value) return;
      resetPassword && (await resetPassword(emailRef.current?.value));
      setMessage("Check your inbox for further instructions");
    } catch {
      setError("Failed to reset password");
    }

    setLoading(false);
  }

  return (
    <>
      <div>
        <div>
          <h2 className="text-center mb-4">Password Reset</h2>
          {error && <p>{error}</p>}
          {message && <p>{message}</p>}
          <form onSubmit={handleSubmit}>
            <div id="email">
              <label>Email</label>
              <input type="email" ref={emailRef} required />
            </div>
            <button disabled={loading} className="w-100" type="submit">
              Reset Password
            </button>
          </form>
          <div className="w-100 text-center mt-3">
            <a href="/login">Login </a>
          </div>
        </div>
      </div>
      <div className="w-100 text-center mt-2">
        Need an account? <a href="/signup">Sign Up</a>
      </div>
    </>
  );
};

export default ForgotPassword;
