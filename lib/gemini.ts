import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Use gemini-1.5-flash which is the standard free model.
export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateScenario(platform: string) {
    try {
        const prompt = `Create a very simple and realistic message for a ${platform} user.

Context:
- The user belongs to a defence background (Serving Personnel, Veteran, or Defence Family).
- The message must look exactly like a real SMS, email, or chat message.

Threat Context:
- The message should involve ANY defence-related topic that could realistically be misused to deceive or mislead.
- Examples include official notices, benefits, allowances, postings, canteen services, welfare, verification requests, job offers, or urgent updates.
- You may choose ANY such context that could harm defence users if trusted.

Threat style based on platform:
- Snapchat: fake profile, private chat, blackmail risk
- Instagram: fake admirer or influencer, suspicious links
- Facebook: welfare, pension, unit connection message
- LinkedIn: fake recruiter or job offer for veterans

Rules:
1. Use very basic English and short sentences.
2. Make it sound urgent but natural.
3. Include a suspicious action (reply, click, confirm, or download).
4. Keep the message under 60 words.
5. Do NOT use words like "attack", "scam", "fraud", "malware", or "phishing".
6. Do NOT provide explanations, solutions, or warnings.
7. Output ONLY the message text. No titles or commentary.`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini generateScenario Error:", error);
        throw error;
    }
}

export async function evaluateResponse(scenario: string, selectedOption: string) {
    try {
        const prompt = `Evaluate whether the user's response to the message is SAFE or UNSAFE.

Scenario Message:
${scenario}

User's Response:
${selectedOption}

Rules:
1. Use very simple English.
2. Clearly say if the choice was safe or unsafe.
3. Explain why in 2 short sentences.
4. Give 3 clear bullet points on what the user should do in this situation.
5. Do NOT use technical words.
6. Do NOT blame or scare the user.
7. Give a score from 0 to 100 (higher is safer).
8. what kind of attack it could be.

Response format (STRICT):
FEEDBACK:
- Safe or Unsafe choice with reason (2 sentences)
- What to do:
  • Point 1
  • Point 2
  • Point 3
SCORE: XX`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const feedbackMatch = text.match(/FEEDBACK:\s*([\s\S]*?)(?=SCORE:|$)/i);
        const scoreMatch = text.match(/SCORE:\s*(\d+)/i);

        const feedback = feedbackMatch ? feedbackMatch[1].trim() : text;
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;

        return { feedback, score };
    } catch (error) {
        console.error("Gemini evaluateResponse Error:", error);
        throw error;
    }
}
