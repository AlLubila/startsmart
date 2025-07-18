"use client";

import { useEffect, useState } from "react";
import { fetchWithErrorHandling } from "../../../utils/fetchWithErrorHandling";
import SkillsInput from "@/app/components/SkillsInput";
import EducationForm from "@/app/components/EducationForm";
import ExperienceForm from "@/app/components/ExperienceForm";

type Education = { school: string; degree: string; field: string; startDate: string; endDate: string; };
type Experience = { title: string; company: string; startDate: string; endDate: string; description: string; };
type Profile = {
  fullName: string; bio: string; linkedIn: string; phone: string;
  email?: string; avatarUrl?: string; skills: string[];
  education: Education[]; experience: Experience[];
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    fullName: "",
    bio: "",
    linkedIn: "",
    phone: "",
    email: "",
    avatarUrl: "",
    skills: [],
    education: [],
    experience: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const data = await fetchWithErrorHandling("/api/profile");
        setProfile({
          fullName: data.fullName || "",
          bio: data.bio || "",
          linkedIn: data.linkedIn || "",
          phone: data.phone || "",
          email: data.email || "",
          avatarUrl: data.avatarUrl || "",
          skills: data.skills || [],
          education: data.education || [],
          experience: data.experience || [],
        });
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await fetchWithErrorHandling("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      setSuccess("Profile saved!");
      setIsEditing(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-900 text-white rounded-lg shadow-lg space-y-6">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      {loading && <p>Loading...</p>}
      {error && <div className="bg-red-600 p-2 rounded">{error}</div>}
      {success && <div className="bg-green-600 p-2 rounded">{success}</div>}

      {!loading && (
        <>
          <input
            type="text"
            value={profile.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            disabled={!isEditing}
            placeholder="Full Name"
            className="w-full p-2 bg-gray-800 rounded"
          />
          <input
            type="text"
            value={profile.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={!isEditing}
            placeholder="Email"
            className="w-full p-2 bg-gray-800 rounded"
          />
          {/* ... autres champs bio, linkedIn, phone */}
          <textarea
            value={profile.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            disabled={!isEditing}
            placeholder="Bio"
            className="w-full p-2 bg-gray-800 rounded"
          />
          <SkillsInput
            skills={profile.skills}
            onChange={(skills) => setProfile((p) => ({ ...p, skills }))}
            disabled={!isEditing}
          />
          <EducationForm
            education={profile.education}
            onChange={(education) => setProfile((p) => ({ ...p, education }))}
            disabled={!isEditing}
          />
          <ExperienceForm
            experience={profile.experience}
            onChange={(experience) => setProfile((p) => ({ ...p, experience }))}
            disabled={!isEditing}
          />

          <div className="flex gap-4 mt-6">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
