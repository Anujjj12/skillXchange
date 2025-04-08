import axios from "axios";
import { Bell, Search, SearchIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(token ? true : false);

    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    }

  }, []);


  const fetchNotifications = async () => {
    try{
      const user = JSON.parse(localStorage.getItem("user"));
      if(!user) return;

      const response = await axios.get(`http://localhost:5000/user/notifications/${user._id}`)

      setNotifications(response.data.notifications);
    }
    catch(error){
      console.error("Error in fetching notifications : ", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try{
      await axios.post("http://localhost:5000/user/notifications/read", {
        notificationId: notification._id,
      });

      navigate(`/profile/${notification.senderId}`);

      setNotifications((prev) => prev.filter((n) => n._id !== notification._id));
    }
    catch(error){
      console.error("Mark as read notification failed : ", error);
    }
  };

  const handleAuth = () => {
    if (isLoggedIn) {
      console.log("Logging out...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.clear();

      setIsLoggedIn(false);
      navigate("/login");
    } else {
      navigate("/login");
      // window.location.reload();
    }
  };

  return (
    <nav className="bg-blue-600 p-4 flex justify-between items-center text-white relative">
      <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate("/")}>
        My Website
      </h1>

      <div className="flex items-center space-x-4">
        {isLoggedIn && (
          <div className="relative">
            <div className="flex items-center space-x-2">

            <Bell
              size={24}
              className="cursor-pointer"
              onClick={() => fetchNotifications()}
            />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {notifications.length}
              </span>
            )}
            </div>

            <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded shadow-lg">
              {notifications.length === 0 ? (
                <p className="p-2 text-gray-500">No new notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className="p-2 border-b cursor-pointer hover:bg-gray-200"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p className="font-bold">{notification.senderName}</p>
                    <p className="text-sm text-gray-600">{notification.senderEmail}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleAuth}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
        >
          {isLoggedIn ? "Logout" : "Login"}
        </button>
      </div>
    </nav>
  );
}
