const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// 1. Resolve MongoDB connection string with automatic .env.local parsing
let mongodbUri = "mongodb+srv://EduZ3667:naobo2@englishkidsapp.hyzcoyq.mongodb.net/english-kids-app?appName=EnglishKidsApp";

try {
  const envPath = path.join(__dirname, ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/^MONGODB_URI=(.+)$/m);
    if (match && match[1]) {
      mongodbUri = match[1].trim();
    }
  }
} catch (e) {
  console.log("⚠️ Không thể đọc file .env.local, sử dụng chuỗi kết nối mặc định.");
}

console.log(`🔌 Đang kết nối tới MongoDB Atlas: ${mongodbUri.split("@")[1] || mongodbUri}`);

// 2. Define Mongoose Schemas directly inside seed script to run easily using 'node seed.js'
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    currentLevel: { type: String, enum: ["Starters", "Movers", "Flyers"], default: "Starters" },
    totalStars: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const QuestionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    level: { type: String, enum: ["Starters", "Movers", "Flyers"], required: true },
  },
  { timestamps: true }
);

const AssessmentResultSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    level: { type: String, enum: ["Starters", "Movers", "Flyers"], required: true },
    skill: { type: String, enum: ["Speaking", "Listening", "Reading", "Writing"], default: "Speaking", required: true },
    sentence: { type: String, required: true },
    spokenText: { type: String, default: "" },
    recordedAudioUrl: { type: String, default: "" },
    targetAnswer: { type: String, default: "" },
    userAnswer: { type: String, default: "" },
    corrections: { type: String, default: "" },
    score: { type: Number, required: true, min: 0, max: 100 },
    stars: { type: Number, required: true, min: 1, max: 5 },
    mispronouncedWords: { type: [String], default: [] },
    feedback: {
      tutorComment: { type: String, required: true },
      tips: { type: String, default: "" },
    },
    roadmap: { type: [String], default: [] },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Question = mongoose.models.Question || mongoose.model("Question", QuestionSchema);
const AssessmentResult = mongoose.models.AssessmentResult || mongoose.model("AssessmentResult", AssessmentResultSchema);

// 3. Mock Data Payload
const mockUsers = [
  {
    name: "Tâm Anh",
    age: 7,
    currentLevel: "Starters",
    totalStars: 14,
  },
  {
    name: "Gia Bảo",
    age: 9,
    currentLevel: "Movers",
    totalStars: 24,
  },
  {
    name: "Minh Khôi",
    age: 11,
    currentLevel: "Flyers",
    totalStars: 32,
  },
];

const mockQuestions = [
  // Starters Questions
  { text: "This is a yellow banana.", level: "Starters" },
  { text: "The cat is sleeping under the red mat.", level: "Starters" },
  // Movers Questions
  { text: "The cute monkey is climbing a tall tree.", level: "Movers" },
  { text: "They are playing soccer in the green field.", level: "Movers" },
  // Flyers Questions
  { text: "A brave lion stands proudly on top of the mountain.", level: "Flyers" },
  { text: "The astronaut successfully landed on the bright moon.", level: "Flyers" },
];

async function seed() {
  try {
    await mongoose.connect(mongodbUri);
    console.log("✅ Đã kết nối thành công tới MongoDB Atlas!");

    // Clear stale collections
    console.log("🧹 Đang dọn dẹp các bộ dữ liệu cũ...");
    await User.deleteMany({});
    await Question.deleteMany({});
    await AssessmentResult.deleteMany({});
    console.log("🧹 Dọn dẹp hoàn tất!");

    // Insert Users
    console.log("🌱 Đang gieo dữ liệu Users...");
    const createdUsers = await User.insertMany(mockUsers);
    console.log(`👥 Đã thêm thành công ${createdUsers.length} tài khoản bé học viên mẫu!`);

    // Insert Questions
    console.log("🌱 Đang gieo dữ liệu Questions...");
    const createdQuestions = await Question.insertMany(mockQuestions);
    console.log(`📝 Đã thêm thành công ${createdQuestions.length} câu hỏi mẫu!`);

    // Retrieve references to map results dynamically
    const tamAnh = createdUsers.find(u => u.name === "Tâm Anh");
    const giaBao = createdUsers.find(u => u.name === "Gia Bảo");

    // Dynamic Assessment Results payload
    const mockResults = [
      {
        userId: tamAnh._id.toString(),
        level: "Starters",
        skill: "Speaking",
        sentence: "This is a yellow banana.",
        spokenText: "This is a yellow banan.",
        recordedAudioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        score: 85,
        stars: 4,
        mispronouncedWords: ["banana"],
        feedback: {
          tutorComment: "Bé Tâm Anh phát âm rất to, rõ ràng và trôi chảy. Con chỉ cần chú ý bật hơi rõ hơn ở từ 'banana' một chút xíu nữa là đạt điểm 100 hoàn hảo luôn nhé! 🌟",
          tips: "Từ 'banana' phát âm chính xác là /bəˈnæn.ə/, trọng âm rơi vào âm tiết thứ hai. Con hãy thử đọc nhấn mạnh âm 'na' ở giữa nhé!",
        },
        roadmap: [
          "Luyện tập đọc từ 'banana' riêng biệt 5 lần trước gương.",
          "Bấm nghe cô giáo AI đọc mẫu câu trên và bắt chước nhại giọng.",
          "Thử thách thu âm lại câu này để đạt trọn vẹn 5 sao vàng nhé con.",
        ],
      },
      {
        userId: tamAnh._id.toString(),
        level: "Starters",
        skill: "Listening",
        sentence: "The cat sits on the red mat.",
        targetAnswer: "cat",
        userAnswer: "cat",
        score: 100,
        stars: 5,
        feedback: {
          tutorComment: "Tuyệt vời! Bé Tâm Anh đã lắng nghe rất chuẩn xác và chọn đúng từ khóa 'cat' trong tranh. Tai nghe của con cực siêu! 👑",
          tips: "Bé có biết: âm /æ/ trong từ 'cat' là âm a bẹt, con hãy mở rộng miệng sang hai bên một chút khi phát âm để nghe chuẩn bản xứ nhé!",
        },
        roadmap: [
          "Luyện nghe thêm 3 câu đố vui trắc nghiệm cùng cô giáo AI.",
          "Tìm xem trong phòng con có con mèo 'cat' nào không và chỉ tay gọi tên nhé.",
        ],
      },
      {
        userId: giaBao._id.toString(),
        level: "Movers",
        skill: "Writing",
        sentence: "Write a sentence about the illustration of a monkey.",
        userAnswer: "The monkey is climbing the coconut tree.",
        corrections: "The monkey is climbing the coconut tree.",
        score: 100,
        stars: 5,
        feedback: {
          tutorComment: "Xuất sắc Gia Bảo ơi! Con đã đặt câu mô tả tranh rất chính xác ngữ pháp, chia động từ thì hiện tại tiếp diễn 'is climbing' hoàn hảo và viết đúng chính tả từ khó 'coconut'!",
          tips: "Mẹo nhỏ cho con: Hãy ghi nhớ từ 'climbing' có âm câm 'b', con phát âm là /ˈklaɪ.mɪŋ/ chứ không đọc chữ 'b' nhé con yêu!",
        },
        roadmap: [
          "Viết thêm 1 câu mô tả các bạn khỉ đang chơi đùa trong vườn bách thú.",
          "Tập chép từ 'coconut' 3 lần vào vở để nhớ lâu hơn chính tả nhé.",
        ],
      },
    ];

    // Insert Assessment Results
    console.log("🌱 Đang gieo dữ liệu AssessmentResults lịch sử bài tập mẫu...");
    const createdResults = await AssessmentResult.insertMany(mockResults);
    console.log(`📈 Đã gieo thành công ${createdResults.length} kết quả luyện tập lịch sử!`);

    console.log("\n🎉 Gieo dữ liệu thành công rực rỡ! Cơ sở dữ liệu đám mây đã sẵn sàng. 🚀");
  } catch (error) {
    console.error("❌ Gặp sự cố nghiêm trọng khi gieo dữ liệu:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Đã ngắt kết nối an toàn với MongoDB Atlas.");
    process.exit(0);
  }
}

seed();
