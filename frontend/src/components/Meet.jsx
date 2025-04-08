  import axios from "axios";
  import React, { useEffect, useRef } from "react";
  import { useParams, useSearchParams, useNavigate } from "react-router-dom";

  const Meet = () => {
    const { roomName } = useParams();
    const [searchParams] = useSearchParams();
    const userId = searchParams.get("userId");
    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);
    const hasJoined = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
      const loadMeeting = () => {
        const existingScript = document.getElementById("jitsi-script");

        if (!existingScript) {
          const script = document.createElement("script");
          script.src = "https://meet.jit.si/external_api.js";
          script.async = true;
          script.id = "jitsi-script";
          script.onload = () => initializeJitsi();
          document.body.appendChild(script);
        } else {
          initializeJitsi();
        }
      };

      const initializeJitsi = () => {
        if (!window.JitsiMeetExternalAPI) {
          console.error("JitsiMeetExternalAPI not available");
          return;
        }
      
        const domain = "meet.jit.si";
        const options = {
          roomName,
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: `User ${userId}`,
          },
          configOverwrite: {
            disableThirdPartyRequests: true,
          },
          interfaceConfigOverwrite: {
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          },
        };
      
        try {
          const api = new window.JitsiMeetExternalAPI(domain, options);
          jitsiApiRef.current = api;
      
          api.addEventListener("videoConferenceJoined", () => {
            console.log("User joined the meeting");
            hasJoined.current = true;
          });
      
          api.addEventListener("videoConferenceLeft", async () => {
            if (!hasJoined.current) return; 

            console.log("User left the meeting");
            try {
              await axios.post("http://localhost:5000/api/meet/end", {
                roomName,
                userId,
              });
              console.log("Meeting status updated on server");
            } catch (err) {
              console.error("Failed to update meeting status:", err);
            }
            
            hasJoined.current = false;
            navigate("/dashboard");
          });
      
          window.addEventListener("beforeunload", handleUnload);
        } catch (err) {
          console.error("Error initializing Jitsi:", err);
        }
      };
      

      const handleUnload = () => {
        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose();
        }
      };

      loadMeeting();

      return () => {
        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose();
        }
        window.removeEventListener("beforeunload", handleUnload);
      };
    }, [roomName, userId, navigate]);

    return (
      <div
        ref={jitsiContainerRef}
        style={{ width: "100%", height: "100vh" }}
        id="jitsi-container"
      />
    );
  };

  export default Meet;
