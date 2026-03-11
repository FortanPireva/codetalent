import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { getSupabase } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Only PDF files are accepted" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File must be less than 5MB" },
      { status: 400 }
    );
  }

  try {
    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const fileName = `${session.user.id}/${Date.now()}.pdf`;
    const supabase = getSupabase();
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("resumes").getPublicUrl(fileName);

    // Send PDF directly to Claude for extraction (Claude natively reads PDFs)
    const base64Pdf = buffer.toString("base64");
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64Pdf,
              },
            },
            {
              type: "text",
              text: `Extract structured profile information from this resume PDF. Return a JSON object with the following fields (use null for missing fields):
- name: full name (string)
- bio: a brief professional summary, max 500 chars (string)
- phone: phone number (string)
- location: city/country (string)
- skills: array of technical skills (string[])
- githubUrl: GitHub profile URL if mentioned (string)
- linkedinUrl: LinkedIn profile URL if mentioned (string)

Return ONLY the JSON object, no markdown, no explanation.`,
            },
          ],
        },
      ],
    });

    let parsedProfile: Record<string, unknown> = {};
    try {
      const content = message.content[0];
      if (content.type === "text") {
        parsedProfile = JSON.parse(content.text);
      }
    } catch {
      // If parsing fails, return empty profile with the URL
      console.error("Failed to parse Claude response");
    }

    return NextResponse.json({
      resumeUrl: publicUrl,
      parsedProfile,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "Failed to process resume" },
      { status: 500 }
    );
  }
}
