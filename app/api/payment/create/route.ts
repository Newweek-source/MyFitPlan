import { NextResponse } from 'next/server';

export async function POST() {
  // V1 placeholder. Replace this with Razorpay order creation before production launch.
  return NextResponse.json({ ok: false, message: 'Razorpay is not connected yet. Use the demo unlock while building.' }, { status: 501 });
}
