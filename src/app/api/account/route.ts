import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { verifyToken } from '@/lib/auth'

export async function GET(req: Request) {
    await connectDB();

    const cookie = req.headers.get('cookie')?.match(/authToken=([^;]+)/)?.[1]
    if (!cookie) return NextResponse.json({ error: 'Unauthorized'}, { status: 401});

    let payload
    try { payload = verifyToken(cookie)}
    catch { return NextResponse.json({ error: 'Unauthorized'}, {status: 401})}

    const user = await User.findById(payload.id).select('-passwordHash')
    if (!user) return NextResponse.json({error: 'Not found'}, {status: 404});
    return NextResponse.json(user);
}