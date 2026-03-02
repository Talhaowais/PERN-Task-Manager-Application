import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import SettingsModal from "./SettingsModal";

export default function Navbar() {
  const { user, setUser, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  const updateUser = (newUser) => {
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <div className="navbar">

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {user?.profileImage && (
          <img
            src={user.profileImage}
            alt=""
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover"
            }}
          />
        )}

        <h4>Welcome {user?.name}</h4>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={() => setShowSettings(true)}>⚙️</button>
        <button onClick={logout}>Logout</button>
      </div>

      {showSettings && (
        <SettingsModal
          user={user}
          close={() => setShowSettings(false)}
          updateUser={updateUser}
        />
      )}
    </div>
  );
}