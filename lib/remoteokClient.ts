export async function fetchRemoteOKJobs(skills: string[] = []) {
  const url = "https://remoteok.com/api";

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`RemoteOK API error: ${res.status}`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  // Skip metadata (first object)
  return data.slice(1).filter((job: any) => {
    const title = job?.position || job?.title || "";
    const tags = job?.tags || [];
    return skills.some(skill =>
      title.toLowerCase().includes(skill.toLowerCase()) ||
      tags.some((tag: string) => tag.toLowerCase().includes(skill.toLowerCase()))
    );
  });
}
