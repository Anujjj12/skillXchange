import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import SuggestionCard from "./SuggestionCard";
import { fetchSuggestions } from "@/api/userApi";
import SkillsMatcher from "./SkillsMatcher";

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const user = useAuth();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const suggestions = async () => {
      try {
        const response = await fetchSuggestions();
        setSuggestions(response);
      } catch (error) {
        setError("Error fetching suggestions");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      suggestions();
      setUserName(user.name);
    }
  }, [user]);

  const shouldShowSuggestions = !matchedUsers || matchedUsers.length === 0;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-2">{userName}</h2>
      <h2 className="text-2xl font-bold mb-4">Skill Exchange Suggestions</h2>

      {user && (
        <div className="mb-6">
          <SkillsMatcher userId={user._id} setMatchedUsers={setMatchedUsers} />
        </div>
      )}

      {loading ? (
        <p>Loading suggestions...</p>
      ) : matchedUsers.length === 0 ? (
        suggestions.length === 0 ? (
          <p>No matching users found yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((suggestedUser) => (
              <SuggestionCard key={suggestedUser._id} user={suggestedUser} />
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}
