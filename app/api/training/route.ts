import { NextResponse } from "next/server";
import { generateScenario, evaluateResponse } from "@/lib/gemini";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, platform, scenario, selectedOption } = body;

        if (action === "generate") {
            console.log("Generating scenario for platform:", platform);
            const generatedScenario = await generateScenario(platform);
            return NextResponse.json({ scenario: generatedScenario });
        }

        if (action === "evaluate") {
            console.log("Evaluating response for scenario:", scenario.substring(0, 50) + "...");
            const evaluation = await evaluateResponse(scenario, selectedOption);
            return NextResponse.json(evaluation);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        const errorLog = `[${new Date().toISOString()}] Training API Error: ${error.message}\nStack: ${error.stack}\nDetails: ${JSON.stringify(error)}\n\n`;
        try {
            fs.appendFileSync(path.join(process.cwd(), "api-error.log"), errorLog);
        } catch (e) {
            console.error("Failed to write to log file:", e);
        }
        console.error("Training API Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}
