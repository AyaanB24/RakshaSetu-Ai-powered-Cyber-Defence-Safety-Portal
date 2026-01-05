import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log("Listing available models...");
        // The SDK doesn't have a direct listModels on genAI, we might need to use fetch if the SDK is old
        // But let's try to see if we can find it in the SDK or just try gemini-pro
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("gemini-pro works!");
    } catch (error) {
        console.error("gemini-pro failed:", error);

        // Try gemini-1.5-flash with a different name
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            await model.generateContent("Hello");
            console.log("gemini-1.5-flash-latest works!");
        } catch (e) {
            console.error("gemini-1.5-flash-latest failed too");
        }
    }
}

listModels();
