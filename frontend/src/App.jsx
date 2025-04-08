import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
 // Import Layout
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./layout";
import ProfileDetails from "./components/ProfileDetails";
import Subscription from "./components/Subscription";
import Meet from "./components/Meet";
import Chat from "./components/Chat";
import UserList from "./components/UserList";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Wrap all routes inside the Layout */}
        <Route element={<Layout />}>
          {/* <Route path="/" element={<Home />} /> */}
          {/* <Route path="/about" element={<About />} /> */}
          {/* <Route path="/contact" element={<Contact />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile/:id" element={<ProfileDetails />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/meet/:roomName" element={<Meet userName="User" />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/users" element={<UserList />} />
          <Route path="/chat/:userId" element={<Chat />} />
        </Route>
      </Routes>
    </Router>
  );
}
