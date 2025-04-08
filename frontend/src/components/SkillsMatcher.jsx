import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const SkillsMatcher = ({ userId, setMatchedUsers }) => {
  const [skillsOptions, setSkillsOptions] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSkills = async () => {
      const res = await axios.get(`http://localhost:5000/user/skills/unique/${userId}`);
      setSkillsOptions(res.data);
    };

    fetchSkills();
  }, [userId]);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!selectedSkill) {
        setMatches([]);
        setMatchedUsers([]); // reset matchedUsers in dashboard
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/user/search/${userId}/${selectedSkill}`);
        setMatches(res.data);
        setMatchedUsers(res.data); // update matchedUsers in dashboard
      } catch (err) {
        console.error("Error fetching matches:", err);
        setMatches([]);
        setMatchedUsers([]);
      }
    };

    fetchMatches();
  }, [selectedSkill, userId, setMatchedUsers]);

  return (
    <div className="p-4">
      <select
        value={selectedSkill}
        onChange={(e) => setSelectedSkill(e.target.value)}
        className="border p-2 rounded w-full max-w-md"
      >
        <option value="">Select a skill</option>
        {skillsOptions.map((skill, idx) => (
          <option key={idx} value={skill}>
            {skill}
          </option>
        ))}
      </select>

      {matches.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {matches.map((user) => (
            <Card key={user._id} className="shadow-md hover:shadow-lg transition duration-300" onClick={() => navigate(`/profile/${user._id}`)}>
              <CardContent>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-sm">Has: {user.skillsHave.join(", ")}</p>
                <p className="text-sm text-gray-600">Wants: {user.skillsWant.join(", ")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillsMatcher;
