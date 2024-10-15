const IPFS_GATEWAYS = [
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    // Add more gateways here
  ];
  
  export async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url);
        if (response.ok) return response;
        throw new Error(`HTTP error! status: ${response.status}`);
      } catch (error) {
        console.error(`Attempt ${i + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        if (i === maxRetries - 1) throw error; // Rethrow on last attempt
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
    throw new Error(`Failed to fetch after ${maxRetries} retries`);
  }
  
  export async function fetchNFTMetadata(ipfsHash: string): Promise<any> {
    for (const gateway of IPFS_GATEWAYS) {
      try {
        const url = `${gateway}${ipfsHash}`;
        const response = await fetchWithRetry(url);
        return await response.json();
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Failed to fetch from ${gateway}: ${error.message}`);
        } else {
          console.error(`Failed to fetch from ${gateway}: Unknown error`);
        }
      }
    }
    throw new Error('Failed to fetch NFT metadata from all gateways');
  }