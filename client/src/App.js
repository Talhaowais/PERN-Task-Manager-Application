import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TodoPage from "./pages/TodoPage";
import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "./context/AuthContext";
import './styles.css';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Protected Home Route */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <TodoPage />
          </PrivateRoute>
        }
      />

      {/* Login Route */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" />}
      />

      {/* Signup Route */}
      <Route
        path="/signup"
        element={!user ? <Signup /> : <Navigate to="/" />}
      />

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;