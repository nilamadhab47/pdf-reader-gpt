import { NextRequest, NextResponse } from 'next/server';
import { connectToDb } from '@/lib/db';
import { Chats } from '@/models/ChatModel';

export async function GET(req: NextRequest) {
  try {
    await connectToDb();
    const chatHistory = await Chats.find().sort({ timestamp: -1 });
    return NextResponse.json(chatHistory);
  } catch (error) {
    console.error("Internal server error ", error);
    return NextResponse.json("Error: Something went wrong. Try again!", {
      status: 500,
    });
  }
}