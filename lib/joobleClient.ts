export async function fetchJoobleJobs({
  country,
  what,
  skills,
}: {
  country: string;
  what: string;
  skills: string[];
}) {
  const apiKey = process.env.JOOBLE_API_KEY;
  const query = `${what} ${skills.join(" ")}`.trim();

  const res = await fetch("https://jooble.org/api/" + apiKey, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      keywords: query,
      location: country,
    }),
  });

  if (!res.ok) {
    throw new Error("Jooble API failed");
  }

  const data = await res.json();
  return data.jobs || [];
}
