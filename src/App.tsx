import Signup from "./components/Signup";
import { AuthProvider } from "./AuthContext";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import PrivateRoutes from "./components/PrivateRoutes";
import Home from "./components/Dashboard/Home";

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
              <Route element={<PrivateRoutes />}>
                <Route path="/" element={<Home />} />
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
