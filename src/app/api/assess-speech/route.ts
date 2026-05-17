import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const sentence = formData.get("sentence") as string;
    const level = formData.get("level") as string;

    if (!audioFile || !sentence) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp đầy đủ file âm thanh và câu cần đánh giá!" },
        { status: 400 }
      );
    }

    console.log(`🎙️ Nhận yêu cầu đánh giá âm thanh:`);
    console.log(`- File name: ${audioFile.name}`);
    console.log(`- Dung lượng: ${audioFile.size} bytes`);
    console.log(`- Câu đích: "${sentence}"`);
    console.log(`- Cấp độ: ${level}`);

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const audioSize = audioBuffer.length;

    if (audioSize < 6000) {
      const targetWords = sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase().split(/\s+/).filter(Boolean);
      return NextResponse.json({
        success: true,
        sentence,
        score: 0,
        stars: 1,
        mispronouncedWords: targetWords,
        feedback: {
          tutorComment: "Ồ! Cô chưa nghe rõ được giọng đọc đáng yêu của con. Con hãy bấm nút 'Thử thách lại' và nói to, rõ ràng hơn vào sát Mic nhé! 🎤🎈",
          tips: "Hãy chắc chắn là con đã bấm nút cho phép sử dụng Microphone trên trình duyệt và nói thật to câu mẫu nhé.",
        },
        roadmap: [
          "Kiểm tra lại Microphone của máy tính hoặc điện thoại xem đã được bật chưa 🔌",
          "Nghe lại audio mẫu của cô giáo AI 3 lần để làm quen giọng điệu 🎵",
          "Bấm thử thách lại và dũng cảm nói thật to rõ từng chữ nhé bé yêu 💪"
        ],
      });
    }

    const file = new File([audioBuffer], "audio.webm", { type: "audio/webm" });

    const transcription = await groq.audio.transcriptions.create({
      model: "whisper-large-v3",
      file: file,
      language: "en",
    });

    const spokenText = (transcription.text || "").trim();
    console.log(`📝 [Groq Whisper] Transcribed text: "${spokenText}"`);

    const cleanedSentence = sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase();
    const targetWords = cleanedSentence.split(/\s+/).filter(Boolean);
    const cleanedSpoken = spokenText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase();
    const spokenWords = cleanedSpoken.split(/\s+/).filter(Boolean);

    const tempSpoken = [...spokenWords];
    const mispronouncedWords: string[] = [];

    targetWords.forEach((word) => {
      const index = tempSpoken.indexOf(word);
      if (index !== -1) {
        tempSpoken.splice(index, 1);
      } else {
        mispronouncedWords.push(word);
      }
    });

    const totalCount = targetWords.length;
    const correctCount = totalCount - mispronouncedWords.length;
    const score = Math.round((correctCount / totalCount) * 100);

    let stars = 5;
    if (score >= 95) stars = 5;
    else if (score >= 85) stars = 5;
    else if (score >= 70) stars = 4;
    else if (score >= 45) stars = 3;
    else if (score >= 20) stars = 2;
    else stars = 1;

    let tutorComment = "";
    let tips = "";
    let roadmap: string[] = [];

    if (score < 30) {
      tutorComment = "Ồ! Cô chưa nghe rõ được giọng đọc đáng yêu của con. Con hãy bấm nút 'Thử thách lại' và nói to, rõ ràng hơn vào sát Mic nhé! 🎤🎈";
      tips = "Hãy chắc chắn là con đã bấm nút cho phép sử dụng Microphone trên trình duyệt và nói thật to câu mẫu nhé.";
      roadmap = [
        "Kiểm tra lại Microphone của máy tính hoặc điện thoại xem đã được bật chưa 🔌",
        "Nghe lại audio mẫu của cô giáo AI 3 lần để làm quen giọng điệu 🎵",
        "Bấm thử thách lại và dũng cảm nói thật to rõ từng chữ nhé bé yêu 💪"
      ];
    } else if (stars === 5) {
      tutorComment = "Wow! Con phát âm thật xuất sắc! Giọng của con siêu chuẩn và truyền cảm luôn đấy. Cô rất tự hào về con! 🎉🦁";
      tips = "Con đã làm rất tốt. Hãy tiếp tục duy trì phong độ này ở các câu tiếp theo nhé!";
      roadmap = [
        "Luyện tập thêm 1 câu dài hơn thuộc cấp độ này để nhận thêm sao nhé! ⭐",
        "Thu âm và gửi tặng ba mẹ nghe giọng đọc Tiếng Anh siêu đỉnh của con 🎁",
        "Thử thách bản thân bằng cách tự kể một câu chuyện ngắn bằng Tiếng Anh 📚"
      ];
    } else if (stars === 4) {
      tutorComment = "Con làm tốt lắm! Phát âm rất rõ ràng và trôi chảy. Chỉ cần chú ý sửa một chút xíu lỗi nhỏ nữa là đạt 5 sao luôn nè! 🌟🐒";
      tips = `Từ "${mispronouncedWords.join(", ")}" con đọc gần đúng rồi, chỉ cần chú ý nhấn rõ hơi hoặc bật âm đuôi (ending sound) rõ hơn nữa nhé.`;
      roadmap = [
        `Nghe lại từ mẫu "${mispronouncedWords[0]}" và lặp lại 3 lần thật to trước gương 🪞`,
        `Chơi trò chơi 'Bật âm đuôi' - luyện đọc từ "${mispronouncedWords[0]}" thật gió 🌬️`,
        `Thử thách đọc lại cả câu này lần thứ hai để chinh phục trọn vẹn 5 sao vàng 🏆`
      ];
    } else {
      tutorComment = "Cô khen ngợi tinh thần cố gắng tuyệt vời của con! Con đã rất dũng cảm khi nói Tiếng Anh thật to. Hãy cùng cô luyện tập thêm nhé! 🦛🎈";
      tips = `Hãy lắng nghe thật kỹ cách phát âm của các từ "${mispronouncedWords.join(", ")}" và bật hơi mạnh hơn nhé bé yêu.`;
      roadmap = [
        `Luyện đọc chậm rãi từ "${mispronouncedWords[0]}" cùng cô giáo AI 👩‍🏫`,
        `Tham gia thử thách nói từ vựng "${mispronouncedWords[0]}" chậm rãi 3 lần liên tiếp 🐢`,
        `Nghe audio mẫu của câu này và nhại giọng theo thật vui nhộn 🎵`
      ];
    }

    return NextResponse.json({
      success: true,
      sentence,
      score,
      stars,
      mispronouncedWords,
      feedback: {
        tutorComment,
        tips,
      },
      roadmap,
    });
  } catch (error: any) {
    console.error("❌ Lỗi API assess-speech:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi chấm điểm phát âm: " + error.message },
      { status: 500 }
    );
  }
}
