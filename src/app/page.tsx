"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Trophy, Star, Clock, ChevronRight, Volume2, Sparkles, BarChart3, Mic, Headphones, BookOpen, PenTool, X, Upload } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface AssessmentItem {
  _id: string;
  level: "Starters" | "Movers" | "Flyers";
  skill?: "Speaking" | "Listening" | "Reading" | "Writing";
  sentence: string;
  score: number;
  stars: number;
  createdAt: string;
}

export default function Dashboard() {
  const [history, setHistory] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStars, setTotalStars] = useState(0);
  const [activeModalLevel, setActiveModalLevel] = useState<string | null>(null);

  const voices = [
    { code: "en-US-AriaNeural", name: "Mỹ (Nữ) 🇺🇸" },
    { code: "en-US-GuyNeural", name: "Mỹ (Nam) 🇺🇸" },
    { code: "en-GB-SoniaNeural", name: "Anh (Nữ) 🇬🇧" },
    { code: "en-GB-RyanNeural", name: "Anh (Nam) 🇬🇧" },
    { code: "en-AU-NatashaNeural", name: "Úc (Nữ) 🇦🇺" },
  ];

  const [selectedVoice, setSelectedVoice] = useState<string>("en-US-AriaNeural");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferred_accent_voice");
      if (saved) {
        setSelectedVoice(saved);
      }
    }
  }, []);

  const handleVoiceChange = (voiceCode: string) => {
    setSelectedVoice(voiceCode);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_accent_voice", voiceCode);
    }
  };

  // Fetch recent speech tests history
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/assessments");
        const json = await res.json();
        if (json.success && json.data) {
          setHistory(json.data);
          // Calculate total stars collected across all tests
          const starsSum = json.data.reduce((acc: number, item: AssessmentItem) => acc + item.stars, 0);
          setTotalStars(starsSum);
        }
      } catch (error) {
        console.error("Lỗi khi tải lịch sử đánh giá:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const levels = [
    {
      id: "Starters",
      title: "Starters",
      cambridge: "Pre-A1 Cambridge",
      character: "🦛",
      charName: "Hippo Dễ Thương",
      ageRange: "Bé từ 6 - 7 tuổi",
      bgColor: "hover:border-pink-300 dark:hover:border-pink-800/80",
      accentBg: "bg-pink-500",
      btnClass: "btn-3d-pink",
      description: "Học từ vựng cơ bản, đồ vật, động vật và màu sắc siêu thú vị xung quanh con.",
      progressBarColor: "bg-pink-500",
      mockProgress: 80,
    },
    {
      id: "Movers",
      title: "Movers",
      cambridge: "A1 Cambridge",
      character: "🐒",
      charName: "Monkey Thông Minh",
      ageRange: "Bé từ 8 - 9 tuổi",
      bgColor: "hover:border-amber-300 dark:hover:border-amber-800/80",
      accentBg: "bg-amber-500",
      btnClass: "btn-3d-yellow",
      description: "Luyện đọc các câu ngắn mô tả hành động, thời tiết, các hoạt động vui chơi hàng ngày.",
      progressBarColor: "bg-amber-400",
      mockProgress: 45,
    },
    {
      id: "Flyers",
      title: "Flyers",
      cambridge: "A2 Cambridge",
      character: "🦁",
      charName: "Lion Dũng Cảm",
      ageRange: "Bé từ 10 - 11 tuổi",
      bgColor: "hover:border-blue-300 dark:hover:border-blue-800/80",
      accentBg: "bg-blue-500",
      btnClass: "btn-3d-blue",
      description: "Thử thách kể chuyện qua tranh ảnh, miêu tả sở thích cá nhân và các chuyến du lịch.",
      progressBarColor: "bg-blue-500",
      mockProgress: 0,
    },
  ];

  return (
    <div className="w-full min-h-screen pb-20 relative bg-slate-50 dark:bg-slate-950 font-sans">
      
      {/* 1. Playful Welcome Header */}
      <header className="w-full bg-white/80 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800 shadow-sm py-4 px-4 md:px-8 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Sub-tag */}
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce" style={{ animationDuration: "2.5s" }}>🚀</span>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1">
                KidSpeak <span className="text-emerald-500">English</span>
              </h1>
              <p className="text-[9px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                Cambridge Primary Speaking Hub
              </p>
            </div>
          </div>

          {/* Right: Integrated compact Kid status bar & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Action Buttons: Import & Dashboard */}
            <div className="flex items-center gap-2">
              <Link href="/dashboard/import">
                <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-black tracking-wider uppercase transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  Số hóa
                </button>
              </Link>

              <Link href="/dashboard">
                <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-750 text-slate-700 dark:text-slate-200 text-xs font-black tracking-wider uppercase transition-all duration-200 shadow-sm cursor-pointer">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                  Tiến độ
                </button>
              </Link>
            </div>

            {/* Profile Pill */}
            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/40 dark:border-slate-700/50 rounded-full px-3 py-1.5 shadow-inner">
              <span className="text-lg">👦🏻</span>
              <div className="text-left">
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase leading-none">Học viên nhí</p>
                <h4 className="text-xs font-black text-slate-750 dark:text-slate-200 leading-tight">Tâm Anh</h4>
              </div>
            </div>

            {/* Stars Count Pill */}
            <div className="flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 rounded-full px-3 py-1.5 shadow-sm">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
              <span className="text-xs font-black text-amber-700 dark:text-amber-400 font-mono leading-none">
                {totalStars + 10}
              </span>
            </div>

            {/* Trophy Pill */}
            <div className="flex items-center gap-1.5 bg-yellow-500/10 dark:bg-yellow-500/20 border border-yellow-500/20 rounded-full px-3 py-1.5 shadow-sm">
              <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />
              <span className="text-[9px] font-black text-yellow-700 dark:text-yellow-400 uppercase tracking-wider leading-none">
                {totalStars > 12 ? "Vàng" : totalStars > 5 ? "Bạc" : "Đồng"}
              </span>
            </div>

            {/* AI Accent Selector */}
            <div className="relative">
              <select
                value={selectedVoice}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="appearance-none bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-250/50 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold rounded-full pl-8 pr-8 py-2.5 transition-all shadow-sm focus:outline-none cursor-pointer"
              >
                {voices.map((v) => (
                  <option key={v.code} value={v.code} className="dark:bg-slate-900 dark:text-slate-200">
                    {v.name}
                  </option>
                ))}
              </select>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none">🌐</span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none opacity-60">▼</span>
            </div>

            <ThemeToggle />
          </div>

        </div>
      </header>

      {/* 2. Welcome Banner */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 mt-8">
        
        {/* Elegant Mesh Gradient Welcome Section */}
        <section className="relative bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 rounded-3xl shadow-xl p-6 md:p-10 overflow-hidden mb-8 border border-indigo-400/20">
          {/* Decorative subtle background glows */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-white/5 rounded-full blur-xl -mb-20 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl text-white">
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-[10px] md:text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 mb-4 shadow-sm animate-bounce-subtle">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              Vừa học vừa chơi cực vui
            </span>
            
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Luyện Nói Tiếng Anh <br className="hidden sm:inline" /> Chuẩn Cambridge Cùng AI!
            </h2>
            <p className="text-sm md:text-lg font-bold text-slate-100/95 mt-4 leading-relaxed max-w-xl">
              Bé thỏa sức đóng vai các con vật dễ thương, thu âm giọng nói tự tin và nhận sao vàng rực rỡ từ cô giáo AI nhé! 🦁🐒🦛
            </p>
          </div>
          
          <span className="hidden lg:inline absolute right-16 bottom-6 text-9xl animate-float pointer-events-none select-none">🎉</span>
        </section>

        {/* 2.5. Interactive YLE AI Placement Entrance Test Banner */}
        <section className="relative overflow-hidden backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="absolute top-2 right-4 text-3xl animate-bounce pointer-events-none" style={{ animationDelay: "1s" }}>🌟</div>
          
          <div className="max-w-xl text-left relative z-10">
            <span className="bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] md:text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-indigo-500/20 inline-flex items-center gap-1.5 mb-3.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-indigo-400/40 animate-pulse" />
              Bài Test Đầu Vào Độc Quyền
            </span>
            <h3 className="text-xl md:text-3xl font-black text-slate-850 dark:text-slate-100 leading-tight">
              Đánh Giá Năng Lực Toàn Diện Đầu Vào 👩‍🏫
            </h3>
            <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
              Khảo sát toàn diện 4 kỹ năng tiếng Anh (Nghe, Nói, Đọc, Viết) chuẩn Cambridge YLE thông qua hội thoại tương tác trực quan với Cô giáo AI. Nhận ngay biểu đồ radar năng lực và lộ trình học chuẩn xác!
            </p>
          </div>
          
          <Link href="/interactive-test" className="w-full md:w-auto shrink-0 relative z-10">
            <button className="w-full md:w-auto bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl px-8 py-4 font-black tracking-wider uppercase flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg hover:shadow-pink-500/20 text-sm md:text-base cursor-pointer border-b-4 border-rose-700">
              <Mic className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
              Thi Đầu Vào Ngay 🚀
            </button>
          </Link>
        </section>

        {/* 3. Level Selection Section */}
        <section className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div className="text-left">
              <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                🏆 Thử thách theo cấp độ của bé:
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-xs md:text-sm mt-1">
                Các cấp độ học tập và rèn luyện kỹ năng chuẩn Cambridge Primary.
              </p>
            </div>
            
            {/* Adaptive CAT test trigger */}
            <div className="shrink-0">
              <Link href="/adaptive-test">
                <button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-b-4 border-teal-800 hover:translate-y-[2px] hover:border-b-2 text-white rounded-2xl px-5 py-3 font-black tracking-wider uppercase flex items-center gap-2 shadow-md transition-all text-xs md:text-sm cursor-pointer">
                  <Sparkles className="w-4 h-4" />
                  Đánh giá thích ứng AI
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {levels.map((lvl) => (
              <div
                key={lvl.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-6 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group ${lvl.bgColor}`}
              >
                {/* Level Tag floating */}
                <div className="absolute right-4 top-4 flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700 rounded-2xl px-2.5 py-1 shadow-sm">
                  <Award className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">{lvl.cambridge}</span>
                </div>

                <div>
                  {/* Animal Mascot Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl shadow-sm border border-slate-200/50 dark:border-slate-750 mb-4 group-hover:scale-105 transition-transform duration-300 select-none">
                    {lvl.character}
                  </div>

                  <h4 className="text-xl md:text-2xl font-black text-slate-850 dark:text-slate-100">{lvl.title}</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 mt-0.5">{lvl.charName}</p>
                  
                  <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full px-2.5 py-0.5 text-[11px] font-bold mb-4">
                    👦🏻 {lvl.ageRange}
                  </span>

                  <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                    {lvl.description}
                  </p>
                </div>

                {/* Progress bar inside card */}
                <div className="mt-auto w-full pt-4 border-t border-slate-250/30 dark:border-slate-800/50">
                  <div className="flex items-center justify-between text-[11px] font-extrabold mb-1.5 text-slate-600 dark:text-slate-400">
                    <span>Tiến trình hoàn thành:</span>
                    <span className="font-mono">{lvl.mockProgress}%</span>
                  </div>
                  
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-750 p-0.5 mb-6">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${lvl.progressBarColor}`}
                      style={{ width: `${lvl.mockProgress}%` }}
                    />
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={() => setActiveModalLevel(lvl.id)}
                    className={`${lvl.btnClass} w-full py-3 text-xs md:text-sm tracking-wider uppercase flex items-center justify-center gap-1 cursor-pointer`}
                  >
                    Chơi Ngay
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. History Widget */}
        <section className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800 p-6 md:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-250/30 dark:border-slate-800/50">
            <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
              Lịch sử luyện nói gần đây của bé
            </h3>
            <span className="text-[10px] md:text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200/30 dark:border-slate-700/50">
              Đã làm {history.length} bài nói
            </span>
          </div>

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
              <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              <span className="text-sm font-bold">Đang tải lịch sử...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center bg-slate-105/50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 px-4">
              <span className="text-5xl block mb-3">🏆</span>
              <p className="text-slate-600 dark:text-slate-350 font-extrabold text-sm">Con chưa có bài thu âm nào.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                Bé hãy nhấn nút <strong>CHƠI NGAY</strong> của các cấp độ Starters, Movers hoặc Flyers ở trên để thực hiện bài nói đầu tiên nhé!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[380px] overflow-y-auto pr-2">
              {history.map((item) => {
                const badgeColor =
                  item.level === "Starters"
                    ? "bg-pink-100 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800"
                    : item.level === "Movers"
                    ? "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                    : "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";

                return (
                  <div key={item._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group transition-colors hover:bg-slate-50/40 dark:hover:bg-slate-800/40 px-3 rounded-2xl -mx-3">
                    
                    {/* Level icon + sentence */}
                    <div className="flex items-start gap-3.5 max-w-xl min-w-0">
                      <div className={`shrink-0 text-[10px] md:text-xs font-extrabold uppercase px-2.5 py-1.5 rounded-xl border ${badgeColor} text-center`}>
                        <span className="block text-base md:text-lg mb-0.5">
                          {item.level === "Starters" ? "🦛" : item.level === "Movers" ? "🐒" : "🦁"}
                        </span>
                        {item.level}
                      </div>
                      
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs md:text-sm font-extrabold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                            &quot;{item.sentence}&quot;
                          </p>
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 text-[8px] md:text-[9px] font-black uppercase rounded-md border ${
                            item.skill === "Listening" ? "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400" :
                            item.skill === "Reading" ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400" :
                            item.skill === "Writing" ? "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400" :
                            "bg-pink-50 dark:bg-pink-950/50 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400"
                          }`}>
                            {item.skill === "Listening" ? <Headphones className="w-2.5 h-2.5" /> :
                             item.skill === "Reading" ? <BookOpen className="w-2.5 h-2.5" /> :
                             item.skill === "Writing" ? <PenTool className="w-2.5 h-2.5" /> :
                             <Mic className="w-2.5 h-2.5" />}
                            {item.skill || "Speaking"}
                          </span>
                        </div>
                        <p className="text-[10px] md:text-[11px] font-bold text-slate-400 dark:text-slate-550 mt-1">
                          Ngày làm: {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Star badge & click link */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t border-dashed border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 sm:border-0">
                      
                      {/* Interactive Stars */}
                      <div className="flex items-center bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl px-2.5 py-1 shrink-0">
                        {Array.from({ length: item.stars }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-500 fill-amber-450" />
                        ))}
                        {Array.from({ length: 5 - item.stars }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-200 dark:text-slate-650" />
                        ))}
                        <span className="text-[9px] md:text-[10px] font-black text-amber-700 dark:text-amber-450 ml-1.5 font-mono">
                          {item.score}/100
                        </span>
                      </div>

                      {/* Review details link */}
                      <Link href={`/result/${item._id}`}>
                        <button className="btn-3d-gray px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs uppercase tracking-wider flex items-center gap-0.5 font-black hover:scale-105 cursor-pointer">
                          XEM LẠI
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </Link>

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* 🚀 Playful Kid-Friendly Skill Selector Modal */}
      {activeModalLevel && (() => {
        const lvlObj = levels.find(l => l.id === activeModalLevel);
        if (!lvlObj) return null;
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-2xl max-w-lg w-full relative overflow-hidden animate-bounce-subtle p-6 md:p-8">
              
              {/* Close Button */}
              <button 
                onClick={() => setActiveModalLevel(null)}
                className="absolute top-4 right-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-full p-2 border border-slate-200/50 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Character Mascot Header */}
              <div className="flex items-center gap-3.5 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 flex items-center justify-center text-3xl shadow-sm shrink-0 animate-bounce">
                  {lvlObj.character}
                </div>
                <div>
                  <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                    Cấp độ {lvlObj.title}
                  </span>
                  <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-100 leading-tight mt-1">
                    Mascot {lvlObj.charName} chào con!
                  </h3>
                </div>
              </div>

              <p className="text-slate-650 dark:text-slate-300 font-extrabold text-xs md:text-sm text-center mb-6 leading-relaxed bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 rounded-2xl p-4">
                🌟 &quot;Bé muốn thử thách kỹ năng tiếng Anh nào cùng cô giáo AI hôm nay?&quot;
              </p>

              {/* Grid of 4 Skills */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* 1. Speaking (Nói) */}
                <Link href={`/test/${lvlObj.id}?skill=speaking`} onClick={() => setActiveModalLevel(null)}>
                  <div className="bg-pink-500/[0.04] dark:bg-pink-500/[0.08] hover:bg-pink-500/[0.08] dark:hover:bg-pink-500/[0.12] border border-pink-500/20 hover:border-pink-500/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-sm group">
                    <span className="w-11 h-11 bg-white dark:bg-slate-800 rounded-xl border border-pink-100 dark:border-pink-900/60 flex items-center justify-center text-pink-500 shadow-sm mb-3 group-hover:scale-105 transition-transform">
                      <Mic className="w-5 h-5 md:w-6 md:h-6" />
                    </span>
                    <span className="text-xs md:text-sm font-black text-pink-700 dark:text-pink-300 uppercase tracking-wide block">Luyện Nói</span>
                    <span className="text-[9px] md:text-[10px] font-bold text-pink-400 mt-0.5 block">Speaking Game</span>
                  </div>
                </Link>

                {/* 2. Listening (Nghe) */}
                <Link href={`/test/${lvlObj.id}?skill=listening`} onClick={() => setActiveModalLevel(null)}>
                  <div className="bg-blue-500/[0.04] dark:bg-blue-500/[0.08] hover:bg-blue-500/[0.08] dark:hover:bg-blue-500/[0.12] border border-blue-500/20 hover:border-blue-500/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-sm group">
                    <span className="w-11 h-11 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-blue-500 shadow-sm mb-3 group-hover:scale-105 transition-transform">
                      <Headphones className="w-5 h-5 md:w-6 md:h-6" />
                    </span>
                    <span className="text-xs md:text-sm font-black text-blue-700 dark:text-blue-300 uppercase tracking-wide block">Luyện Nghe</span>
                    <span className="text-[9px] md:text-[10px] font-bold text-blue-400 mt-0.5 block">Listening Game</span>
                  </div>
                </Link>

                {/* 3. Reading (Đọc) */}
                <Link href={`/test/${lvlObj.id}?skill=reading`} onClick={() => setActiveModalLevel(null)}>
                  <div className="bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] hover:bg-emerald-500/[0.08] dark:hover:bg-emerald-500/[0.12] border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-sm group">
                    <span className="w-11 h-11 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center text-emerald-500 shadow-sm mb-3 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
                    </span>
                    <span className="text-xs md:text-sm font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wide block">Luyện Đọc</span>
                    <span className="text-[9px] md:text-[10px] font-bold text-emerald-400 mt-0.5 block">Reading Game</span>
                  </div>
                </Link>

                {/* 4. Writing (Viết) */}
                <Link href={`/test/${lvlObj.id}?skill=writing`} onClick={() => setActiveModalLevel(null)}>
                  <div className="bg-amber-500/[0.04] dark:bg-amber-500/[0.08] hover:bg-amber-500/[0.08] dark:hover:bg-amber-500/[0.12] border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-sm group">
                    <span className="w-11 h-11 bg-white dark:bg-slate-800 rounded-xl border border-amber-100 dark:border-amber-900/60 flex items-center justify-center text-amber-500 shadow-sm mb-3 group-hover:scale-105 transition-transform">
                      <PenTool className="w-5 h-5 md:w-6 md:h-6" />
                    </span>
                    <span className="text-xs md:text-sm font-black text-amber-700 dark:text-amber-300 uppercase tracking-wide block">Luyện Viết</span>
                    <span className="text-[9px] md:text-[10px] font-bold text-amber-400 mt-0.5 block">Writing Game</span>
                  </div>
                </Link>

              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
