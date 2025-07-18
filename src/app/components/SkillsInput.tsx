import { useState } from "react";

type SkillsInputProps = {
  skills: string[];
  onChange: (updatedSkills: string[]) => void;
  disabled?: boolean;
};

export default function SkillsInput({ skills, onChange, disabled = false }: SkillsInputProps) {
  const [input, setInput] = useState("");

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
      setInput("");
    }
  };

  const removeSkill = (skill: string) => {
    onChange(skills.filter((s) => s !== skill));
  };

  return (
    <div>
      <label className="block mb-2 font-semibold">Skills</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="bg-blue-600 text-white px-3 py-1 rounded-full flex items-center"
          >
            {skill}
            {!disabled && (
              <button
                onClick={() => removeSkill(skill)}
                className="ml-2 text-white hover:text-gray-300"
              >
                &times;
              </button>
            )}
          </span>
        ))}
      </div>

      {!disabled && (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="Add a skill"
            className="w-full p-2 bg-gray-800 rounded"
          />
          <button
            onClick={addSkill}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
