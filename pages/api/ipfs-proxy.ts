import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cid, filename } = req.query;

  if (!cid || !filename) {
    return res.status(400).json({ error: 'Missing cid or filename' });
  }

  console.log('CID:', cid);
  console.log('Filename:', filename);
  console.log('JWT Token:', process.env.PINATA_JWT ? 'Set' : 'Not set');

  try {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}/${filename}`, {
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    });

    res.setHeader('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (error) {
    console.error('Error in IPFS proxy:', error);
    res.status(500).json({ error: 'Failed to fetch IPFS content' });
  }
}
