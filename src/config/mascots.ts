import { Mascot } from "@/types/mascot";

export const MASCOTS: Mascot[] = [
  {
    id: "lily",
    name: "Cô Lily AI",
    description: "Cô giáo ảo thân thiện, luôn sẵn sàng hướng dẫn bạn học tiếng Anh.",
    avatarUrl: "/mascots/lily/idle.png",
    images: {
      idle: "/mascots/lily/idle.png",
      speaking: "/mascots/lily/speaking.png",
      listening: "/mascots/lily/listening.png",
      thinking: "/mascots/lily/thinking.png",
      happy: "/mascots/lily/happy.png",
      encouraging: "/mascots/lily/encouraging.png",
    },
    dialogue: {
      speaking: "Cô Lily đang nói... 🔊",
      listening: "Cô đang nghe con nè... 🎤",
      thinking: "Cô đang suy nghĩ... 🧠",
    },
    themeColors: {
      ring: "border-blue-300 dark:border-blue-700",
      bg: "bg-sky-50 dark:bg-slate-800",
      text: "text-indigo-500 dark:text-indigo-400",
      border: "border-slate-100 dark:border-slate-800"
    }
  },
  {
    id: "max",
    name: "Khỉ Max",
    description: "Chú khỉ tinh nghịch, học tiếng Anh cùng Max chưa bao giờ nhàm chán!",
    avatarUrl: "/mascots/max/idle.png",
    images: {
      idle: "/mascots/max/idle.png",
      speaking: "/mascots/max/speaking.png",
      listening: "/mascots/max/listening.png",
      thinking: "/mascots/max/thinking.png",
      happy: "/mascots/max/happy.png",
      encouraging: "/mascots/max/encouraging.png",
    },
    dialogue: {
      speaking: "Max đang nói nè... 🔊",
      listening: "Max đang vểnh tai nghe... 🐒🎤",
      thinking: "Max đang vắt óc suy nghĩ... 🤔",
    },
    themeColors: {
      ring: "border-amber-300 dark:border-amber-700",
      bg: "bg-yellow-50 dark:bg-slate-800",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-100 dark:border-amber-900/50"
    }
  }
];
