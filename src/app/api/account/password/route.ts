import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { verifyToken } from '@/lib/auth'

export async function PUT(req: Request) {
    await connectDB();

    const cookie = req.headers.get('cookie')?.match(/authToken=([^;]+)/)?.[1]
    if (!cookie) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    let payload;
    try { payload = verifyToken(cookie)}
    catch { return NextResponse.json({error: 'Unautorized'}, {status: 401})}

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Missing fields'}, { status: 400})
    }

    const user = await User.findById(payload.id)
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404});

    const valid = await user.comparePassword(currentPassword)
    if (!valid) {
        return NextResponse.json({ error: 'Wrong password'}, {status: 401})
    }

    user.password = newPassword;
    await user.save()
    return NextResponse.json({ success: true})
}