import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";

export async function POST(req: Request) {
    try {
        const user = await getUserFromSession();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        // Mock AI Chatbot Integration parsing natural language (FR 9)
        // E.g., "Họp với Team vào 2h chiều mai tại Quận 1"

        // In a real scenario, this would call OpenAI or Gemini APIs.
        // We are mocking the parsed output for UI validation.

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(14, 0, 0, 0);

        const endTime = new Date(tomorrow);
        endTime.setHours(15, 0, 0, 0);

        let simulatedMatchTitle = "Họp với Team";
        let simulatedLocation = "Quận 1";

        if (text.toLowerCase().includes("ăn trưa")) {
            simulatedMatchTitle = "Ăn trưa";
            simulatedLocation = "Nhà hàng ABC";
            tomorrow.setHours(12, 0, 0, 0);
            endTime.setHours(13, 0, 0, 0);
        }

        const mockResponse = {
            title: simulatedMatchTitle,
            startTime: tomorrow.toISOString(),
            endTime: endTime.toISOString(),
            location: simulatedLocation,
        };

        return NextResponse.json({ parsedData: mockResponse }, { status: 200 });

    } catch (error: any) {
        console.error("Quick create error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
