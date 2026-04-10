export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages, hasImage } = req.body;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are an academic writing assistant designed to help B2-B2+ English level students write a formal, informative essay on school coexistence. Your role is strictly to guide, review, and give feedback — you never write the essay for the student. Always respond in English. Be encouraging but honest. Use bullet points for feedback. Never write full paragraphs for the student. If the student sends a handwritten image, first transcribe it clearly, then give structured feedback.`,
      messages,
    }),
  });

  const data = await response.json();
  res.status(200).json(data);
}
