import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cid, filename } = req.query;

  if (!cid || !filename) {
    return res.status(400).json({ error: 'Missing CID or filename' });
  }

  const url = `https://ipfs.io/ipfs/${cid}/${filename}`;
  console.log('Attempting to fetch:', url);

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(response.data);
  } catch (error) {
    console.error('Error in IPFS proxy:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.message);
      console.error('Error config:', error.config);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      }
    } else {
      console.error('Non-Axios error:', error);
    }
    if (error instanceof Error) {
      return res.status(500).json({ error: 'Error fetching from IPFS', details: error.message });
    } else {
      return res.status(500).json({ error: 'Error fetching from IPFS', details: 'Unknown error' });
    }
  }
}
