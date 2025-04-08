import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatInterface from "./Message";
import { useParams } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

function Chat() {
const { userId: selectedUserId } = useParams();
const [loggedInUserId, setLoggedInUserId] = useState(null);

  // Extract logged-in user ID from JWT token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setLoggedInUserId(decoded.userId); // Ensure backend sends userId inside JWT
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, []);

  return (
    <>
      <Sidebar loggedInUserId={loggedInUserId}/>
      <ChatInterface loggedInUserId={loggedInUserId} selectedUserId={selectedUserId}/>
    </>
  )
}

export default Chat