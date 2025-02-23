import { Configuration, OpenAIApi } from "openai-edge"
import { OpenAIStream, StreamingTextResponse } from "ai"

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(config)

export const runtime = "edge"

export async function POST(req: Request) {
  const { messages, image } = await req.json()

  const lastMessage = messages[messages.length - 1]
  let content = lastMessage.content

  if (image) {
    content = [
      { type: "text", text: lastMessage.content },
      { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } },
    ]
  }

  const response = await openai.createChatCompletion({
    model: "gpt-4-vision-preview",
    stream: true,
    max_tokens: 2048,
    messages: [
      {
        role: "system",
        content:
          "You are an AI academic coach, knowledgeable in various subjects. Your task is to help students understand concepts, solve problems, and clarify their doubts. Provide clear, concise, and accurate explanations. If a concept is complex, break it down into simpler parts. Encourage critical thinking and provide hints rather than direct answers when appropriate. If an image is provided, analyze it and incorporate your observations into your response.",
      },
      ...messages.slice(0, -1),
      { role: lastMessage.role, content: content },
    ],
  })

  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
}

