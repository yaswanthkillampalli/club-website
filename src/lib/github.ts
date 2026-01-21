interface GitHubRepoData {
  name: string;
  description: string;
  stars: number;
  language: string;
  topics: string[];
  lastUpdated: string;
}

export const fetchGitHubRepoDetails = async (repoUrl: string): Promise<GitHubRepoData | null> => {
  try {
    // 1. Clean the URL to get "owner/repo" (e.g., "facebook/react")
    // Removes "https://github.com/" to get the clean path
    const cleanPath = repoUrl.replace('https://github.com/', '').replace(/\/$/, '');
    
    // 2. Call the public GitHub API
    // We fetch from api.github.com
    const response = await fetch(`https://api.github.com/repos/${cleanPath}`);
    
    if (!response.ok) {
      console.error("GitHub Repo not found");
      return null;
    }

    const data = await response.json();

    return {
      name: data.name,
      description: data.description,
      stars: data.stargazers_count,
      language: data.language,
      topics: data.topics,
      lastUpdated: data.updated_at
    };

  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    return null;
  }
};