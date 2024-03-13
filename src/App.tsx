import Signup from "./components/Signup";
import { AuthProvider } from "./AuthContext";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import AuthRequired from "./components/AuthRequired";
import UserDashboard from "./components/Dashboard/UserHome";
import AdminDashboard from "./components/Dashboard/AdminHome";
import AdminRequired from "./components/AdminRequired";
import UserRequired from "./components/UserRequired";

function App() {
  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Router>
          <AuthProvider>
            <Routes>
              <Route element={<AuthRequired />}>
                <Route element={<UserRequired />}>
                  <Route path="/" element={<UserDashboard />} />
                </Route>
                <Route element={<AdminRequired />}>
                  <Route path="admin" element={<AdminDashboard />} />
                </Route>
              </Route>
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </AuthProvider>
        </Router>
      </div>
    </div>
  );
}

export default App;
