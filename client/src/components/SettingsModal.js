import React, { useState, useEffect } from "react";
import api from "../api";
import { supabase } from "../supabaseClient";

function SettingsModal({ isOpen, onClose, user, onSaved }) {
  const [imageUrl, setImageUrl] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [pronoun, setPronoun] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing values
  useEffect(() => {
    if (user) {
      setImageUrl(user.profilePic || "");
      setBirthDate(user.dob || "");
      setPronoun(user.title || "");
    }
  }, [user]);

  if (!isOpen) return null;

  // upload to Supabase bucket
  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;

      const { error } = await supabase.storage
        .from("profile-images")
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data } = supabase.storage
        .from("profile-images")
        .getPublicUrl(fileName);

      setImageUrl(data.publicUrl);

    } catch (err) {
      alert("Image upload failed");
      console.log(err);
    } finally {
      setUploading(false);
    }
  };

  // SAVE SETTINGS
  const saveSettings = async () => {
    try {
      setSaving(true);

      const res = await api.put("/user/settings", {
        profileImage: imageUrl,
        birthDate,
        pronoun,
      });

      onSaved(res.data.user); // update user in context
      onClose();

    } catch (err) {
      alert("Failed to save settings");
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Profile Settings</h3>

        {/* IMAGE PREVIEW */}
        <div style={styles.avatarContainer}>
          <img
            src={
              imageUrl ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="profile-images"
            style={styles.avatar}
          />
        </div>

        <input type="file" onChange={uploadImage} />

        {uploading && <p>Uploading...</p>}

        {/* DATE */}
        <br></br>
        <label>Choose Date of Birth</label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          style={styles.input}
        />

        {/* PRONOUN */}
        <label>Pronoun</label>
        <div style={styles.radioGroup}>
          <label>
            <input
              type="radio"
              value="Mr"
              checked={pronoun === "Mr"}
              onChange={(e) => setPronoun(e.target.value)}
            />
            Mr
          </label>

          <label>
            <input
              type="radio"
              value="Mrs"
              checked={pronoun === "Mrs"}
              onChange={(e) => setPronoun(e.target.value)}
            />
            Mrs
          </label>

          <label>
            <input
              type="radio"
              value="Miss"
              checked={pronoun === "Miss"}
              onChange={(e) => setPronoun(e.target.value)}
            />
            Miss
          </label>
        </div>

        {/* BUTTONS */}
        <div style={styles.buttons}>
          <button onClick={onClose} style={styles.cancelBtn}>
            Cancel
          </button>

          <button
            onClick={saveSettings}
            style={styles.saveBtn}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#fff",
    padding: 25,
    borderRadius: 12,
    width: 320,
  },
  avatarContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    objectFit: "cover",
  },
  input: {
    width: "100%",
    padding: 8,
    margin: "8px 0",
  },
  radioGroup: {
    display: "flex",
    gap: 10,
    marginBottom: 15,
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 15,
  },
  cancelBtn: {
    padding: "8px 14px",
    border: "none",
    background: "#ccc",
    borderRadius: 6,
    cursor: "pointer",
  },
  saveBtn: {
    padding: "8px 14px",
    border: "none",
    background: "#4CAF50",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
  },
};

export default SettingsModal;