export async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (error) {
      if (i === retries - 1) throw error;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}
