import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";

const AddUsers: React.FC = () => {
  const { signup, currentUser, logout } = useAuth();
  const loggedInUID = currentUser?.uid;

  // log out current user to support signup of new user
  useEffect(() => {
    logout && logout().then(() => console.log("logged out current user"));
  }, []);

  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [year, setYear] = useState<"11" | "12">("11");

  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);

  const resetState = () => {
    setEmail("");
    setName("");
    setImage("");
    setYear("11");
  };

  const userMutation = useMutation({
    mutationFn: (id: string) => {
      const data = {
        id,
        email,
        name,
        image,
        year,
      };
      console.log(data);
      return axios.post("http://localhost:3000/user/", data);
    },
    onSuccess: async () => {
      logout && (await logout());
    },
    onSettled: () => {
      resetState();
    },
  });

  async function handleSubmit(e: any) {
    e.preventDefault();
    const password = email.split("@")[0];

    try {
      setError("");
      setLoading(true);
      signup && signup(email, password);
    } catch (err) {
      setError(err);
      logout && (await logout());
    }

    setLoading(false);
  }

  // store user to db after successful signup
  useEffect(() => {
    if (!currentUser?.uid || currentUser.uid === loggedInUID) return;
    userMutation.mutate(currentUser.uid);
  }, [currentUser]);

  return (
    <div>
      <AdminNavbar />
      <div>
        <h2 className="text-center mb-4">Sign Up</h2>
        {JSON.stringify(error)}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label>Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label>Image</label>
            <input
              type="url"
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>
          <div>
            <label>Year</label>
            <select
              name="cars"
              onChange={(e) => setYear(e.target.value as "11" | "12")}
            >
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
          </div>
          <button disabled={loading} className="w-100" type="submit">
            Sign Up
          </button>
        </form>
      </div>
      <div className="w-100 text-center mt-2">
        Already have an account? <a href="/login">Log In</a>
      </div>
    </div>
  );
};

export default AddUsers;
