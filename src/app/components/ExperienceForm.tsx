import { useState } from "react";

type Experience = {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Props = {
  experience: Experience[];
  onChange: (updated: Experience[]) => void;
  disabled?: boolean;
};

export default function ExperienceForm({ experience, onChange, disabled = false }: Props) {
  const handleChange = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experience];
    updated[index][field] = value;
    onChange(updated);
  };

  const addExperience = () => {
    onChange([
      ...experience,
      { title: "", company: "", startDate: "", endDate: "", description: "" },
    ]);
  };

  const removeExperience = (index: number) => {
    const updated = [...experience];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Experience</h2>
      {experience.map((exp, index) => (
        <div key={index} className="bg-gray-800 p-4 rounded space-y-2">
          <input
            type="text"
            placeholder="Job Title"
            value={exp.title}
            onChange={(e) => handleChange(index, "title", e.target.value)}
            disabled={disabled}
            className="w-full p-2 rounded bg-gray-700"
          />
          <input
            type="text"
            placeholder="Company"
            value={exp.company}
            onChange={(e) => handleChange(index, "company", e.target.value)}
            disabled={disabled}
            className="w-full p-2 rounded bg-gray-700"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={exp.startDate}
              onChange={(e) => handleChange(index, "startDate", e.target.value)}
              disabled={disabled}
              className="p-2 rounded bg-gray-700"
            />
            <input
              type="date"
              value={exp.endDate}
              onChange={(e) => handleChange(index, "endDate", e.target.value)}
              disabled={disabled}
              className="p-2 rounded bg-gray-700"
            />
          </div>
          <textarea
            placeholder="Description"
            value={exp.description}
            onChange={(e) => handleChange(index, "description", e.target.value)}
            disabled={disabled}
            className="w-full p-2 rounded bg-gray-700"
          />
          {!disabled && (
            <button
              onClick={() => removeExperience(index)}
              className="text-red-400 hover:text-red-200"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      {!disabled && (
        <button
          onClick={addExperience}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
        >
          Add Experience
        </button>
      )}
    </div>
  );
}
