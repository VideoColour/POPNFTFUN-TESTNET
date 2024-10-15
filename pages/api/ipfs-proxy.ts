import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cid } = req.query
  if (!cid || typeof cid !== 'string') {
    return res.status(400).json({ error: 'Invalid CID' })
  }

  try {
    const response = await fetch(`https://ipfs.io/ipfs/${cid}`)
    if (!response.ok) {
      throw new Error(`IPFS gateway responded with status: ${response.status}`)
    }
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching IPFS data:', error)
    res.status(500).json({ error: 'Failed to fetch IPFS data' })
  }
}
