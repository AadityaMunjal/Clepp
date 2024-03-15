import { useRef, useState } from "react";
import { useAuth } from "../Contexts/AuthContext";

export default function Signup() {
  const emailRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const passwordConfirmRef = useRef<any>(null);
  const { signup } = useAuth();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (passwordRef.current?.value !== passwordConfirmRef.current?.value) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);
      signup &&
        (await signup(emailRef.current?.value, passwordRef.current?.value));
    } catch (err) {
      setError(err);
    }

    setLoading(false);
  }

  return (
    <>
      hi
      <div>
        <h2 className="text-center mb-4">Sign Up</h2>
        {JSON.stringify(error)}
        <form onSubmit={handleSubmit}>
          <div id="email">
            <label>Email</label>
            <input type="email" ref={emailRef} required />
          </div>
          <div id="password">
            <label>Password</label>
            <input type="password" ref={passwordRef} required />
          </div>
          <div id="password-confirm">
            <label>Password Confirmation</label>
            <input type="password" ref={passwordConfirmRef} required />
          </div>
          <button disabled={loading} className="w-100" type="submit">
            Sign Up
          </button>
        </form>
      </div>
      <div className="w-100 text-center mt-2">
        Already have an account? <a href="/login">Log In</a>
      </div>
    </>
  );
}
