import Signup from "./components/Authentication/Signup";
import { AuthProvider } from "./components/Contexts/AuthContext";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Login from "./components/Authentication/Login";
import ForgotPassword from "./components/Authentication/ForgotPassword";
import AuthRequired from "./components/AuthRouting/AuthRequired";
import UserDashboard from "./components/Dashboard/UserHome";
import AdminDashboard from "./components/Dashboard/AdminHome";
import AdminRequired from "./components/AuthRouting/AdminRequired";
import UserRequired from "./components/AuthRouting/UserRequired";
import CreateAssignment from "./components/Admin/CreateAssignment";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { SidebarProvider } from "./components/Contexts/SidebarContext";
import AdminViewAssignment from "./components/Admin/AdminViewAssignment";
import UserViewAssignment from "./User/UserViewAssignment";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 },
  },
});

function App() {
  return (
    <div>
      <Router>
        <QueryClientProvider client={queryClient}>
          <SidebarProvider>
            <AuthProvider>
              <Routes>
                <Route element={<AuthRequired />}>
                  <Route element={<UserRequired />}>
                    <Route path="/" element={<UserDashboard />} />
                    <Route
                      path="assignment/:id"
                      element={<UserViewAssignment />}
                    />
                  </Route>
                  <Route element={<AdminRequired />}>
                    <Route path="admin" element={<AdminDashboard />} />
                    <Route path="admin/create" element={<CreateAssignment />} />
                    <Route
                      path="admin/assignment/:id"
                      element={<AdminViewAssignment />}
                    />
                  </Route>
                </Route>
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Routes>
            </AuthProvider>
          </SidebarProvider>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </Router>
    </div>
  );
}

export default App;
