const IPFS_GATEWAYS = [
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.ipfs.io/ipfs/',
    'https://dweb.link/ipfs/',
    // Add more gateways here
  ];
  
  export const fetchWithRetry = async (url: string, retries = 3, delay = 1000): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) return response;
      } catch (error) {
        if (i === retries - 1) throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    throw new Error(`Failed to fetch ${url} after ${retries} retries`);
  };
  
  export function ipfsToHttps(ipfsUrl: string): string {
    if (!ipfsUrl) return '';
    if (ipfsUrl.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${ipfsUrl.slice(7)}`;
    }
    return ipfsUrl;
  }
  
  export async function fetchNFTMetadata(tokenUri: string | undefined): Promise<any> {
    if (!tokenUri) {
      throw new Error('Token URI is undefined');
    }

    let ipfsHash = tokenUri;
    if (tokenUri.startsWith('ipfs://')) {
      ipfsHash = tokenUri.slice(7);
    }

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
