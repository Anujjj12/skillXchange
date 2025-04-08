import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useAuth from "@/hooks/useAuth";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export default function ProfileDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [requestStatus, setRequestStatus] = useState(null);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [loadingMeeting, setLoadingMeeting] = useState(true);
  const [roomName, setRoomName] = useState("");

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    if (currentUser && id) {
      setRoomName(`meet-${currentUser._id}-${id}`);
    }
  }, [currentUser, id]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/user/profile/${id}`
        );
        setUser(response.data);
      } catch (err) {
        setError("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  useEffect(() => {
    const fetchRequestStatus = async () => {
      if (currentUser) {
        try {
          const res = await axios.get(
            `http://localhost:5000/user/request/status?senderId=${currentUser._id}&receiverId=${id}`
          );
          setRequestStatus(res.data.status);
        } catch (err) {
          console.error("Error fetching request status", err);
        }
      }
    };

    fetchRequestStatus();
    const interval = setInterval(fetchRequestStatus, 3000);
    return () => clearInterval(interval);
  }, [id, currentUser]);

  useEffect(() => {
    const fetchActiveMeeting = async () => {
      setLoadingMeeting(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/meet/active/${currentUser._id}`
        );
        setActiveMeeting(res.data);
      } catch (err) {
        setActiveMeeting(null);
      } finally {
        setLoadingMeeting(false);
      }
    };

    fetchActiveMeeting();
    const interval = setInterval(fetchActiveMeeting, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const sendConnectionRequest = async () => {
    if (!currentUser) {
      setMessage("User not found");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/user/connect/request",
        {
          senderId: currentUser._id,
          receiverId: id,
        }
      );

      setMessage(response.data.message);

      await axios.post("http://localhost:5000/user/notifications", {
        senderId: currentUser._id,
        receiverId: id,
        senderName: currentUser.name,
        senderEmail: currentUser.email,
        message: `${currentUser.name} sent you a connection request`,
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send request");
    }
  };

  const handleAcceptRequest = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/user/connect/accept",
        {
          receiverId: currentUser._id,
          senderId: id,
        }
      );

      setRequestStatus("accepted");
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response.data.message);
    }
  };

  const handleRejectRequest = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/user/connect/reject",
        {
          receiverId: currentUser._id,
          senderId: id,
        }
      );

      setRequestStatus("none");
      setMessage(response.message);
    } catch (error) {
      setMessage("Caught Error in rejecting request");
    }
  };

  const createMeeting = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/meet/create", {
        creatorId: currentUser._id,
        partnerId: id,
        roomName,
      });

      navigate(`/meet/${roomName}?userId=${currentUser._id}`);
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  const handleReport = async () => {
    try {
      await axios.post("http://localhost:5000/user/report", {
        reporterId: currentUser._id,
        reportedUserId: user._id,
        reason: reportReason,
      });

      alert("Report submitted. Thank you!");
      setReportReason("");
      setReportOpen(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report.");
    }
  };

  if (loading) return <p>Loading user details...</p>;
  if (error) return <p>{error}</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{user.name}'s Profile</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Skills Have:</strong> {user.skillsHave?.join(", ") || "None"}</p>
          <p><strong>Skills Want:</strong> {user.skillsWant?.join(", ") || "None"}</p>
        </div>

        {/* Report Icon */}
        {currentUser._id !== user._id && (
          <Button
            variant="ghost"
            onClick={() => setReportOpen(true)}
            className="text-red-500"
          >
            <Flag className="w-5 h-5" />
          </Button>
        )}
      </div>

      {requestStatus === "pending" ? (
        <p className="text-gray-500">Request Sent</p>
      ) : requestStatus === "accepted" ? (
        <p className="text-green-500">You are connected</p>
      ) : requestStatus === "received" ? (
        <div>
          <button
            onClick={handleAcceptRequest}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            Accept
          </button>
          <button
            onClick={handleRejectRequest}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Reject
          </button>
        </div>
      ) : (
        <button
          onClick={sendConnectionRequest}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Connect
        </button>
      )}

      <p>{message}</p>

      {requestStatus === "accepted" && (
        <>
          {loadingMeeting ? (
            <p className="mt-4 text-gray-500">Checking meeting status...</p>
          ) : activeMeeting ? (
            <button
              onClick={() =>
                navigate(
                  `/meet/${activeMeeting.roomName}?userId=${currentUser._id}`
                )
              }
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
            >
              Join Meeting
            </button>
          ) : (
            <button
              onClick={createMeeting}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Create Meeting
            </button>
          )}
        </>
      )}

      <button
        onClick={() => navigate("/subscription")}
        className="mt-4 bg-purple-500 text-white px-4 py-2 rounded"
      >
        View Subscription Plans
      </button>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {user.name}</DialogTitle>
          </DialogHeader>

          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="w-full border rounded p-2 mt-2"
          >
            <option value="">Select a reason</option>
            <option value="Spam">Spam</option>
            <option value="Inappropriate behavior">Inappropriate behavior</option>
            <option value="Fake account">Fake account</option>
            <option value="Other">Other</option>
          </select>

          <Button
            onClick={handleReport}
            disabled={!reportReason}
            className="w-full mt-4"
          >
            Submit Report
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
