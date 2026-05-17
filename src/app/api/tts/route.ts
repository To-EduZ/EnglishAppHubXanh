import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text");
    const lang = searchParams.get("lang") || "en";

    if (!text) {
      return NextResponse.json({ error: "Tham số 'text' không được để trống!" }, { status: 400 });
    }

    // Google Translate TTS URL that generates high-quality speech
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      text
    )}&tl=${lang}&client=tw-ob`;

    console.log(`🔊 [Server TTS Proxy] Đang lấy giọng đọc cho câu: "${text}"`);

    // Fetch stream from server side with headers to bypass hotlinking protection
    const res = await fetch(ttsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://translate.google.com/",
      },
    });

    if (!res.ok) {
      throw new Error(`Google Translate trả về mã trạng thái: ${res.status}`);
    }

    const audioBuffer = await res.arrayBuffer();

    // Stream back MP3 audio bytes to browser
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for high performance
      },
    });

  } catch (err: any) {
    console.error("❌ Lỗi sinh âm thanh đọc mẫu phía Server:", err);
    return NextResponse.json({ error: "Không thể kết nối với dịch vụ phát âm thanh mẫu!" }, { status: 500 });
  }
}
