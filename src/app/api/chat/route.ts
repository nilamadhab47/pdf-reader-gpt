import { NextRequest, NextResponse } from "next/server";
import { callChain } from "@/lib/langchain";
import { connectToDb } from "@/lib/db";
import { Chats } from "@/models/ChatModel";

export async function POST(req: NextRequest) {
  const { question, chatHistory } = await req.json();

  if (!question) {
    return NextResponse.json("Error: No question in the request", {
      status: 400,
    });
  }

  try {
    const transformStream = new TransformStream();
    const readableStream = callChain({
      question,
      chatHistory,
      transformStream,
    });

    await connectToDb();
    await Chats.create({
      question,
      answer: await readableStream, // You might need to adjust this depending on the structure of your response
      timestamp: new Date(), 
    });


    return new Response(await readableStream);
  } catch (error) {
    console.error("Internal server error ", error);
    return NextResponse.json("Error: Something went wrong. Try again!", {
      status: 500,
    });
  }
}
