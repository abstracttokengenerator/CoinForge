import { NextRequest, NextResponse } from 'next/server'

const PINATA_JWT = process.env.PINATA_JWT ?? ''
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? 'https://gateway.pinata.cloud/ipfs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only images allowed' }, { status: 400 })
    }

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be under 2MB' }, { status: 400 })
    }

    if (!PINATA_JWT) {
      // No Pinata configured — return a placeholder
      return NextResponse.json({ url: '' })
    }

    // Upload to Pinata IPFS
    const pinataForm = new FormData()
    pinataForm.append('file', file)
    pinataForm.append('pinataMetadata', JSON.stringify({ name: `coinforge-token-${Date.now()}` }))
    pinataForm.append('pinataOptions', JSON.stringify({ cidVersion: 1 }))

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: pinataForm,
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Pinata error:', err)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const data = await res.json()
    const ipfsHash = data.IpfsHash
    const url = `${PINATA_GATEWAY}/${ipfsHash}`

    return NextResponse.json({ url, ipfsHash })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
