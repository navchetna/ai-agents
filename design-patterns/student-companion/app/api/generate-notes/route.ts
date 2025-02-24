import { Configuration, OpenAIApi } from "openai-edge"
import { OpenAIStream, StreamingTextResponse } from "ai"

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(config)

export const runtime = "edge"

export async function POST(req: Request) {
  const { prompt } = await req.json()

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: [
      {
        role: "system",
        content:
          "You are an AI academic assistant. Your task is to generate concise, informative notes on various academic topics. Structure your notes with headings, subheadings, and bullet points for clarity. Use HTML tags for formatting.",
      },
      {
        role: "user",
        content: `Generate notes on the following topic: ${prompt}`,
      },
    ],
  })

  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
}

