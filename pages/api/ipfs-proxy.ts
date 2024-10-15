import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cid, filename } = req.query;

  if (!cid || !filename) {
    return res.status(400).json({ error: 'Missing CID or filename' });
  }

  const url = `https://amethyst-total-sole-31.mypinata.cloud/ipfs/${cid}/${filename}`;

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    });

    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(response.data);
  } catch (error) {
    console.error('Error in IPFS proxy:', error);
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json({ error: error.response.data });
    }
    return res.status(500).json({ error: 'Error fetching from IPFS' });
  }
}
