type FetchAdzunaParams = {
  country: string;
  what?: string;
  location?: string;
  skills?: string[];
  page?: number;
};

export async function fetchAdzunaJobs({
  country,
  what = "",
  location = "",
  skills = [],
  page = 1,
}: FetchAdzunaParams) {
  const APP_ID = process.env.ADZUNA_APP_ID;
  const APP_KEY = process.env.ADZUNA_APP_KEY;

  if (!APP_ID || !APP_KEY) {
    throw new Error("Missing Adzuna APP_ID or APP_KEY environment variables");
  }

  const baseURL = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`;
  const params = new URLSearchParams();

  params.append("app_id", APP_ID);
  params.append("app_key", APP_KEY);
  params.append("results_per_page", "20");

  if (what) params.append("what", what);
  if (location) params.append("where", location);

  if (skills.length > 0) {
    const skillsQuery = skills.join(" ");
    const whatWithSkills = what ? `${what} ${skillsQuery}` : skillsQuery;
    params.set("what", whatWithSkills);
  }

  params.append("sort_by", "relevance");

  const url = `${baseURL}?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Adzuna API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data;
}
