import { useState } from "react";

type Education = {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
};

type Props = {
  education: Education[];
  onChange: (updated: Education[]) => void;
  disabled?: boolean;
};

export default function EducationForm({ education, onChange, disabled = false }: Props) {
  const handleChange = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index][field] = value;
    onChange(updated);
  };

  const addEducation = () => {
    onChange([
      ...education,
      { school: "", degree: "", field: "", startDate: "", endDate: "" },
    ]);
  };

  const removeEducation = (index: number) => {
    const updated = [...education];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Education</h2>
      {education.map((edu, index) => (
        <div key={index} className="bg-gray-800 p-4 rounded space-y-2">
          <input
            type="text"
            placeholder="School"
            value={edu.school}
            onChange={(e) => handleChange(index, "school", e.target.value)}
            disabled={disabled}
            className="w-full p-2 rounded bg-gray-700"
          />
          <input
            type="text"
            placeholder="Degree"
            value={edu.degree}
            onChange={(e) => handleChange(index, "degree", e.target.value)}
            disabled={disabled}
            className="w-full p-2 rounded bg-gray-700"
          />
          <input
            type="text"
            placeholder="Field"
            value={edu.field}
            onChange={(e) => handleChange(index, "field", e.target.value)}
            disabled={disabled}
            className="w-full p-2 rounded bg-gray-700"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={edu.startDate}
              onChange={(e) => handleChange(index, "startDate", e.target.value)}
              disabled={disabled}
              className="p-2 rounded bg-gray-700"
            />
            <input
              type="date"
              value={edu.endDate}
              onChange={(e) => handleChange(index, "endDate", e.target.value)}
              disabled={disabled}
              className="p-2 rounded bg-gray-700"
            />
          </div>
          {!disabled && (
            <button
              onClick={() => removeEducation(index)}
              className="text-red-400 hover:text-red-200"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      {!disabled && (
        <button
          onClick={addEducation}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
        >
          Add Education
        </button>
      )}
    </div>
  );
}
