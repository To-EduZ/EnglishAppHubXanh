"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Star, TrendingUp, Award, BookOpen, AlertTriangle, 
  BarChart3, Mic, Headphones, PenTool, ChevronRight, Brain, 
  Sparkles, RefreshCw, Compass, CheckCircle2, Loader2
} from "lucide-react";
import DevelopmentRadarChart from "@/components/DevelopmentRadarChart";

interface AssessmentData {
  _id: string;
  level: string;
  skill?: "Speaking" | "Listening" | "Reading" | "Writing";
  sentence: string;
  spokenText: string;
  score: number;
  stars: number;
  mispronouncedWords: string[];
  feedback: {
    tutorComment: string;
    tips: string;
  };
  roadmap: string[];
  createdAt: string;
}

interface WordFrequency {
  word: string;
  count: number;
}

export default function DashboardPage() {
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<"progress" | "aiReport">("progress");

  // AI Development Report State
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState<string | null>(null);
  const [isUpdatingReport, setIsUpdatingReport] = useState(false);

  const fetchReport = async (silent = false) => {
    if (!silent) setReportLoading(true);
    setReportError(null);
    try {
      const res = await fetch("/api/ai-development-report");
      if (!res.ok) {
        throw new Error("Không thể tải báo cáo phân tích AI!");
      }
      const json = await res.json();
      if (json.success && json.report) {
        setReportData(json.report);
      } else {
        throw new Error(json.error || "Lỗi tải báo cáo phát triển!");
      }
    } catch (err: any) {
      console.error("Lỗi API báo cáo phát triển:", err);
      setReportError(err.message);
    } finally {
      if (!silent) setReportLoading(false);
    }
  };

  const handleUpdateReport = async () => {
    setIsUpdatingReport(true);
    await fetchReport(false);
    setIsUpdatingReport(false);
  };

  useEffect(() => {
    async function fetchAllData() {
      try {
        const res = await fetch("/api/assessments");
        if (!res.ok) {
          throw new Error("Không thể tải lịch sử bài luyện tập!");
        }
        const json = await res.json();
        if (json.success && json.data) {
          setAssessments(json.data);
        }
      } catch (err: any) {
        console.error("Lỗi tải dashboard:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }

      // Load AI report in parallel
      fetchReport();
    }
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-pastel-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-8 border-blue-300 border-t-blue-500 animate-spin" />
          <span className="text-4xl absolute inset-0 flex items-center justify-center animate-bounce">📊</span>
        </div>
        <h2 className="text-2xl font-black text-slate-800 animate-pulse">
          Đang tải bảng tiến độ của con...
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Cô giáo AI đang tổng hợp thành tích học tập của bé! 🌟
        </p>
      </div>
    );
  }

  if (error || assessments.length === 0) {
    return (
      <div className="w-full min-h-screen bg-pastel-bg flex flex-col items-center justify-center p-6 text-center">
        <span className="text-6xl mb-4 animate-bounce">📭</span>
        <h2 className="text-2xl font-black text-slate-700">
          {error ? "Có lỗi xảy ra rồi..." : "Chưa có bài thi nào!"}
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mt-2">
          {error
            ? "Không thể tải dữ liệu. Bé hãy thử lại sau nhé!"
            : "Con hãy bắt đầu luyện các kỹ năng tiếng Anh để xem tiến độ của mình tại đây nhé!"}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <button className="btn-3d-green px-8 py-3 uppercase tracking-wider font-black text-sm">
              BẮT ĐẦU LUYỆN TẬP 🚀
            </button>
          </Link>
          <Link href="/interactive-test">
            <button className="btn-3d-pink px-8 py-3 uppercase tracking-wider font-black text-sm">
              THI TƯƠNG TÁC AI 🤖
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const totalAssessments = assessments.length;
  const avgScore = Math.round(
    assessments.reduce((sum, a) => sum + a.score, 0) / totalAssessments
  );
  const avgStars = (
    assessments.reduce((sum, a) => sum + a.stars, 0) / totalAssessments
  ).toFixed(1);

  // Compute skill breakdowns
  const skillStats: Record<string, { count: number; totalScore: number; totalStars: number }> = {
    Speaking: { count: 0, totalScore: 0, totalStars: 0 },
    Listening: { count: 0, totalScore: 0, totalStars: 0 },
    Reading: { count: 0, totalScore: 0, totalStars: 0 },
    Writing: { count: 0, totalScore: 0, totalStars: 0 }
  };

  assessments.forEach((a) => {
    const s = a.skill || "Speaking";
    if (skillStats[s]) {
      skillStats[s].count += 1;
      skillStats[s].totalScore += a.score;
      skillStats[s].totalStars += a.stars;
    }
  });

  const levelCounts: Record<string, number> = {};
  assessments.forEach((a) => {
    levelCounts[a.level] = (levelCounts[a.level] || 0) + 1;
  });

  // Calculate top wrong speaking words
  const wordFrequency: Record<string, number> = {};
  assessments.forEach((a) => {
    if ((a.skill || "Speaking") === "Speaking") {
      a.mispronouncedWords.forEach((word) => {
        const w = word.toLowerCase().trim();
        if (w) {
          wordFrequency[w] = (wordFrequency[w] || 0) + 1;
        }
      });
    }
  });

  const topWrongWords: WordFrequency[] = Object.entries(wordFrequency)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const levelColor: Record<string, string> = {
    Starters: "bg-pink-100 text-pink-700 border-pink-300",
    Movers: "bg-amber-100 text-amber-700 border-amber-300",
    Flyers: "bg-blue-100 text-blue-700 border-blue-300",
  };

  const levelAnimal: Record<string, string> = {
    Starters: "🦛",
    Movers: "🐒",
    Flyers: "🦁",
  };

  return (
    <div className="w-full min-h-screen pb-16 relative bg-pastel-bg dark:bg-dark-bg">
      <div className="bubble-bg top-20 left-10 w-24 h-24 animate-float" style={{ animationDelay: "1s" }} />
      <div className="bubble-bg bottom-20 right-12 w-28 h-28 animate-float" style={{ animationDelay: "3s" }} />

      <header className="w-full bg-white dark:bg-slate-900 border-b-4 border-slate-100 dark:border-slate-700 py-3 md:py-4 px-3 md:px-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/">
            <button className="btn-3d-gray px-4 py-2.5 text-xs font-black flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              QUAY VỀ
            </button>
          </Link>

          <div className="flex items-center gap-1.5 md:gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-3 md:px-4 py-1 md:py-1.5 rounded-2xl">
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
            <span className="text-[10px] md:text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">TIẾN ĐỘ HỌC TẬP</span>
          </div>

          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center border-2 border-emerald-300 dark:border-emerald-700">
            <span className="text-lg">📈</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto px-3 md:px-4 mt-6 md:mt-8 flex flex-col gap-6 md:gap-8">
        
        {/* Playful Segmented Tab Switcher */}
        <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl max-w-md w-full mx-auto border-2 border-slate-200 dark:border-slate-700 shadow-sm select-none">
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex-1 py-3 text-xs md:text-sm font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === "progress"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md scale-102"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            📊 TIẾN ĐỘ CHUNG
          </button>
          <button
            onClick={() => setActiveTab("aiReport")}
            className={`flex-1 py-3 text-xs md:text-sm font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "aiReport"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md scale-102"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            <Brain className="w-4 h-4 text-indigo-500 animate-pulse" />
            BÁO CÁO PHÁT TRIỂN AI
          </button>
        </div>

        {activeTab === "progress" ? (
          <>
            {/* 1. Scoreboard Summary Card */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-amber-200 dark:border-amber-900 p-4 md:p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-2 right-6 text-3xl animate-bounce" style={{ animationDelay: "1s" }}>🏆</div>

              <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 md:mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
                Tổng quan thành tích của bé
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-center">
                  <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <span className="text-3xl font-black text-blue-600 block">{totalAssessments}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase">Bài đã làm</span>
                </div>

                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-center">
                  <Award className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span className="text-3xl font-black text-emerald-600 block">{avgScore}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase">Điểm trung bình</span>
                </div>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
                  <Star className="w-8 h-8 text-amber-500 mx-auto mb-2 fill-amber-400" />
                  <span className="text-3xl font-black text-amber-600 block">{avgStars}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase">Sao trung bình</span>
                </div>

                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 text-center">
                  <span className="text-3xl block mb-1">📚</span>
                  <span className="text-3xl font-black text-purple-600 block">{Object.keys(levelCounts).length}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase">Level đã học</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {Object.entries(levelCounts).map(([level, count]) => (
                  <div
                    key={level}
                    className={`px-4 py-2 rounded-xl border-2 font-bold text-sm flex items-center gap-2 ${levelColor[level] || "bg-slate-100 text-slate-600 border-slate-300"}`}
                  >
                    <span className="text-lg">{levelAnimal[level] || "📖"}</span>
                    <span>{level}: {count} bài</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Skill-by-skill Breakdown Performance Rings */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-slate-100 dark:border-slate-700 p-4 md:p-6 shadow-xl">
              <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-100 mb-4 md:mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                <TrendingUp className="w-6 h-6 text-indigo-500" />
                Chi tiết 4 kỹ năng của bé 🌟
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Speaking */}
                <div className="bg-pink-50/50 border-2 border-pink-200 rounded-2xl p-4 text-center">
                  <span className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-pink-500 mx-auto border border-pink-100 shadow-sm mb-3">
                    <Mic className="w-5 h-5" />
                  </span>
                  <h4 className="text-sm font-black text-pink-700 uppercase">Speaking (Nói)</h4>
                  <p className="text-[10px] text-slate-400 font-extrabold mt-0.5">Số bài: {skillStats.Speaking.count}</p>
                  
                  <div className="mt-4">
                    <span className="text-2xl font-black text-pink-600 block">
                      {skillStats.Speaking.count > 0 ? Math.round(skillStats.Speaking.totalScore / skillStats.Speaking.count) : 0}
                      <span className="text-xs text-slate-400 font-normal"> /100</span>
                    </span>
                    <span className="text-xs font-bold text-slate-500 block mt-1">
                      ⭐ {skillStats.Speaking.count > 0 ? (skillStats.Speaking.totalStars / skillStats.Speaking.count).toFixed(1) : "0.0"} sao
                    </span>
                  </div>
                </div>

                {/* Listening */}
                <div className="bg-blue-50/50 border-2 border-blue-200 rounded-2xl p-4 text-center">
                  <span className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 mx-auto border border-blue-100 shadow-sm mb-3">
                    <Headphones className="w-5 h-5" />
                  </span>
                  <h4 className="text-sm font-black text-blue-700 uppercase">Listening (Nghe)</h4>
                  <p className="text-[10px] text-slate-400 font-extrabold mt-0.5">Số bài: {skillStats.Listening.count}</p>
                  
                  <div className="mt-4">
                    <span className="text-2xl font-black text-blue-600 block">
                      {skillStats.Listening.count > 0 ? Math.round(skillStats.Listening.totalScore / skillStats.Listening.count) : 0}
                      <span className="text-xs text-slate-400 font-normal"> /100</span>
                    </span>
                    <span className="text-xs font-bold text-slate-500 block mt-1">
                      ⭐ {skillStats.Listening.count > 0 ? (skillStats.Listening.totalStars / skillStats.Listening.count).toFixed(1) : "0.0"} sao
                    </span>
                  </div>
                </div>

                {/* Reading */}
                <div className="bg-emerald-50/50 border-2 border-emerald-200 rounded-2xl p-4 text-center">
                  <span className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 mx-auto border border-emerald-100 shadow-sm mb-3">
                    <BookOpen className="w-5 h-5" />
                  </span>
                  <h4 className="text-sm font-black text-emerald-700 uppercase">Reading (Đọc)</h4>
                  <p className="text-[10px] text-slate-400 font-extrabold mt-0.5">Số bài: {skillStats.Reading.count}</p>
                  
                  <div className="mt-4">
                    <span className="text-2xl font-black text-emerald-600 block">
                      {skillStats.Reading.count > 0 ? Math.round(skillStats.Reading.totalScore / skillStats.Reading.count) : 0}
                      <span className="text-xs text-slate-400 font-normal"> /100</span>
                    </span>
                    <span className="text-xs font-bold text-slate-500 block mt-1">
                      ⭐ {skillStats.Reading.count > 0 ? (skillStats.Reading.totalStars / skillStats.Reading.count).toFixed(1) : "0.0"} sao
                    </span>
                  </div>
                </div>

                {/* Writing */}
                <div className="bg-amber-50/50 border-2 border-amber-200 rounded-2xl p-4 text-center">
                  <span className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 mx-auto border border-amber-100 shadow-sm mb-3">
                    <PenTool className="w-5 h-5" />
                  </span>
                  <h4 className="text-sm font-black text-amber-700 uppercase">Writing (Viết)</h4>
                  <p className="text-[10px] text-slate-400 font-extrabold mt-0.5">Số bài: {skillStats.Writing.count}</p>
                  
                  <div className="mt-4">
                    <span className="text-2xl font-black text-amber-600 block">
                      {skillStats.Writing.count > 0 ? Math.round(skillStats.Writing.totalScore / skillStats.Writing.count) : 0}
                      <span className="text-xs text-slate-400 font-normal"> /100</span>
                    </span>
                    <span className="text-xs font-bold text-slate-500 block mt-1">
                      ⭐ {skillStats.Writing.count > 0 ? (skillStats.Writing.totalStars / skillStats.Writing.count).toFixed(1) : "0.0"} sao
                    </span>
                  </div>
                </div>

              </div>
            </section>

            {/* 3. Speaking mispronounced words log */}
            {topWrongWords.length > 0 && (
              <section className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-rose-200 dark:border-rose-900 p-4 md:p-6 shadow-xl">
                <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-rose-500" />
                  Top từ bé hay phát âm sai nhất khi Luyện Nói 🔊
                </h3>

                <div className="flex flex-wrap gap-3">
                  {topWrongWords.map((item, index) => {
                    const severity = item.count >= 3 ? "bg-rose-500 text-white" : item.count >= 2 ? "bg-orange-400 text-white" : "bg-yellow-300 text-slate-800";
                    return (
                      <div
                        key={item.word}
                        className="flex items-center gap-2 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2 shadow-sm"
                      >
                        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${severity}`}>
                          #{index + 1}
                        </span>
                        <span className="text-sm font-bold text-slate-700 uppercase">{item.word}</span>
                        <span className="text-xs font-bold text-slate-400">× {item.count}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 4. Complete assessment history */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-slate-100 dark:border-slate-700 p-4 md:p-6 shadow-xl">
              <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-500" />
                Lịch sử học tập của con 📝
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-400">
                      <th className="text-left py-3 px-2 text-xs font-black uppercase">Ngày</th>
                      <th className="text-left py-3 px-2 text-xs font-black uppercase">Kỹ năng</th>
                      <th className="text-left py-3 px-2 text-xs font-black uppercase">Cấp độ</th>
                      <th className="text-left py-3 px-2 text-xs font-black uppercase">Bài tập / Câu mẫu</th>
                      <th className="text-center py-3 px-2 text-xs font-black uppercase">Điểm</th>
                      <th className="text-center py-3 px-2 text-xs font-black uppercase">Sao</th>
                      <th className="text-center py-3 px-2 text-xs font-black uppercase">Xem lại</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((a) => {
                      const s = a.skill || "Speaking";
                      const badgeColor =
                        s === "Listening" ? "bg-blue-50 border-blue-200 text-blue-600" :
                        s === "Reading" ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                        s === "Writing" ? "bg-amber-50 border-amber-200 text-amber-600" :
                        "bg-pink-50 border-pink-200 text-pink-600";

                      return (
                        <tr
                          key={a._id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-2 text-xs text-slate-500">
                            {new Date(a.createdAt).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-black uppercase rounded-md border ${badgeColor}`}>
                              {s === "Listening" ? <Headphones className="w-2.5 h-2.5" /> :
                               s === "Reading" ? <BookOpen className="w-2.5 h-2.5" /> :
                               s === "Writing" ? <PenTool className="w-2.5 h-2.5" /> :
                               <Mic className="w-2.5 h-2.5" />}
                              {s}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded-lg border text-xs font-bold ${levelColor[a.level] || "bg-slate-100 text-slate-600"}`}>
                              {levelAnimal[a.level]} {a.level}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-xs font-bold text-slate-700 max-w-xs truncate">
                            "{a.sentence}"
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`font-black text-lg ${a.score >= 80 ? "text-emerald-500" : a.score >= 50 ? "text-amber-500" : "text-rose-500"}`}>
                              {a.score}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${i < a.stars ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Link href={`/result/${a._id}`}>
                              <button className="btn-3d-gray px-3 py-1.5 text-[10px] font-black flex items-center justify-center mx-auto gap-0.5 hover:scale-105 active:translate-y-0.5">
                                CHI TIẾT
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          /* AI REPORT TAB VIEW */
          <div className="flex flex-col gap-6 md:gap-8">
            {reportLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-4 bg-white dark:bg-slate-900 rounded-3xl border-4 border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-8 border-indigo-300 border-t-indigo-600 animate-spin" />
                  <span className="text-4xl absolute inset-0 flex items-center justify-center animate-bounce">👩‍🏫</span>
                </div>
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 animate-pulse">
                  Cô giáo AI đang soạn Báo cáo Phát triển...
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs text-center leading-relaxed">
                  Đợi một chút nhé! AI đang kết hợp điểm trung bình, lỗi phát âm, và vốn từ vựng trong lịch sử học để tổng hợp bản đồ phát triển kỹ năng của bé Tâm Anh.
                </p>
              </div>
            ) : reportError || !reportData ? (
              <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border-4 border-dashed border-slate-200 dark:border-slate-700 px-6 shadow-xl">
                <span className="text-6xl block mb-3">😢</span>
                <h3 className="text-xl font-black text-slate-700 dark:text-slate-200">Không thể tải báo cáo AI</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  Hệ thống AI đang bận hoặc có lỗi kết nối. Ba mẹ có thể bấm nút thử lại dưới đây để cô giáo AI quét lại lịch sử học nhé!
                </p>
                <button
                  onClick={() => fetchReport(false)}
                  className="btn-3d-indigo px-6 py-3 mt-6 uppercase text-xs font-black tracking-wider flex items-center gap-1.5 mx-auto"
                >
                  <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: "6s" }} />
                  Tải lại báo cáo
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6 md:gap-8">
                
                {/* 1. Radar Chart + AI Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  
                  {/* Left Column: Radar Chart */}
                  <div className="h-full flex flex-col justify-between">
                    <DevelopmentRadarChart
                      title="Biểu đồ phát triển"
                      colorScheme="violet"
                      size={310}
                      data={[
                        { label: "Speaking (Nói)", value: reportData.scores.speaking, emoji: "🎤" },
                        { label: "Listening (Nghe)", value: reportData.scores.listening, emoji: "🎧" },
                        { label: "Reading (Đọc)", value: reportData.scores.reading, emoji: "📖" },
                        { label: "Writing (Viết)", value: reportData.scores.writing, emoji: "✍️" },
                        { label: "Reflexes (Phản xạ)", value: reportData.scores.reflexes, emoji: "⚡" },
                        { label: "Focus (Tập trung)", value: reportData.scores.focus, emoji: "🧘" }
                      ]}
                    />
                  </div>

                  {/* Right Column: AI Tutor feedback commentary bubble */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-slate-100 dark:border-slate-800 p-5 md:p-6 shadow-xl flex flex-col justify-between h-full relative overflow-hidden">
                    <div className="absolute top-2 right-4 text-2xl animate-bounce">👩‍🏫</div>
                    <div>
                      <span className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 inline-flex items-center gap-1.5 mb-4 shadow-sm">
                        <Sparkles className="w-3 h-3 fill-indigo-400" />
                        ĐÁNH GIÁ PHÁT TRIỂN AI
                      </span>
                      <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-3">
                        Lời Khuyên Của Cô Giáo AI
                      </h3>
                      <p className="text-slate-600 dark:text-slate-350 font-extrabold text-xs md:text-sm leading-relaxed bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700 rounded-2xl p-4 shadow-inner">
                        "{reportData.summary}"
                      </p>
                    </div>
                    
                    {/* Trigger analyze refresh manually */}
                    <div className="mt-4 md:mt-6 pt-4 border-t border-slate-100 dark:border-slate-855 flex justify-end">
                      <button
                        onClick={handleUpdateReport}
                        disabled={isUpdatingReport}
                        className="btn-3d-indigo py-2.5 px-4 text-xs font-black tracking-wider uppercase flex items-center gap-1.5"
                      >
                        {isUpdatingReport ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Đang phân tích...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            CẬP NHẬT PHÂN TÍCH ⚡
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>

                {/* 2. Detailed Dimension Scores list */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-slate-100 dark:border-slate-700 p-5 md:p-6 shadow-xl">
                  <h3 className="text-sm md:text-base font-black text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    Chi tiết điểm phát triển 6 chỉ số
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: "speaking", label: "Phát âm & Luyện Nói (Speaking)", value: reportData.scores.speaking, color: "bg-pink-500", icon: "🎤" },
                      { key: "listening", label: "Nghe hiểu & Phản xạ (Listening)", value: reportData.scores.listening, color: "bg-blue-500", icon: "🎧" },
                      { key: "reading", label: "Vốn từ & Đọc hiểu (Reading)", value: reportData.scores.reading, color: "bg-emerald-500", icon: "📖" },
                      { key: "writing", label: "Ngữ pháp & Chính tả (Writing)", value: reportData.scores.writing, color: "bg-amber-500", icon: "✍️" },
                      { key: "reflexes", label: "Độ trôi chảy & Đối thoại (Reflexes)", value: reportData.scores.reflexes, color: "bg-purple-500", icon: "⚡" },
                      { key: "focus", label: "Chuyên cần & Tập trung (Focus)", value: reportData.scores.focus, color: "bg-indigo-500", icon: "🧘" }
                    ].map((item) => (
                      <div key={item.key} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700 rounded-2xl p-3.5 shadow-sm hover:scale-102 transition-all duration-200">
                        <div className="flex items-center justify-between text-xs font-black text-slate-600 dark:text-slate-300 mb-2">
                          <span>{item.icon} {item.label}</span>
                          <span className="font-mono text-sm font-black">{item.value} / 100</span>
                        </div>
                        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5 border border-slate-300/60 dark:border-slate-600">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${item.color}`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Strengths and Areas for Growths side-by-side cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Strengths Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-emerald-100 dark:border-emerald-950 p-5 md:p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute right-4 top-4 text-3xl">💪</div>
                    <h4 className="text-sm md:text-base font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      Điểm mạnh lấp lánh
                    </h4>
                    <ul className="space-y-3">
                      {reportData.strengths.map((str: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-350">
                          <span className="text-emerald-500 shrink-0 mt-0.5">🌟</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-rose-100 dark:border-rose-950 p-5 md:p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute right-4 top-4 text-3xl">📈</div>
                    <h4 className="text-sm md:text-base font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                      Cần cố gắng củng cố
                    </h4>
                    <ul className="space-y-3">
                      {reportData.weaknesses.map((weak: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-350">
                          <span className="text-rose-400 shrink-0 mt-0.5">🔧</span>
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* 4. Actionable Pedagogical Roadmap Recommendations Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-indigo-150 dark:border-slate-700 p-5 md:p-6 md:p-8 shadow-xl">
                  <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <Compass className="w-6 h-6 text-indigo-500 animate-spin" style={{ animationDuration: "12s" }} />
                    Lộ trình học tập đề xuất từ chuyên gia AI
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-6">
                    Dựa trên năng lực hiện tại của bé Tâm Anh, cô giáo AI đã chuẩn hóa lộ trình cá nhân hóa tiếp theo để hỗ trợ ba mẹ đồng hành cùng con:
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-5 text-xs md:text-sm font-extrabold text-slate-750 dark:text-slate-300 leading-relaxed font-sans shadow-inner">
                    {reportData.recommendation}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        <div className="text-center mt-4 flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
          <Link href="/">
            <button className="btn-3d-green px-8 py-4 text-sm tracking-wider uppercase">
              LUYỆN THÊM BÀI MỚI 🚀
            </button>
          </Link>
          <Link href="/interactive-test">
            <button className="btn-3d-pink px-8 py-4 text-sm tracking-wider uppercase">
              THI ĐẦU VÀO CHO BÉ 🤖
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
