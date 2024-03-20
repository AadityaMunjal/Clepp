import AddUsers from "./pages/admin/AddUsers";
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import AuthRequired from "./components/AuthRouting/AuthRequired";
import UserDashboard from "./pages/user/UserHome";
import AdminDashboard from "./pages/admin/AdminHome";
import AdminRequired from "./components/AuthRouting/AdminRequired";
import UserRequired from "./components/AuthRouting/UserRequired";
import CreateAssignment from "./pages/admin/CreateAssignment";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { SidebarProvider } from "./contexts/SidebarContext";
import AdminViewAssignment from "./pages/admin/AdminViewAssignment";
import UserViewAssignment from "./pages/user/UserViewAssignment";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 },
  },
});

const App: React.FC = () => {
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
                <Route path="/admin/add-users" element={<AddUsers />} />
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
};

export default App;
