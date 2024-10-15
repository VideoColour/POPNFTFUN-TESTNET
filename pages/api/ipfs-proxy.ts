import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cid, filename } = req.query;

  if (!cid) {
    return res.status(400).json({ error: 'Missing CID' });
  }

  const url = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${cid}${filename ? `/${filename}` : ''}`;

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
