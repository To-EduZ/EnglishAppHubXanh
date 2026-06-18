"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Edit2, CheckCircle2, Loader2, Save, X } from "lucide-react";
import { Mascot } from "@/types/mascot";

export default function MascotsManagementPage() {
  const [mascots, setMascots] = useState<Mascot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingMascot, setEditingMascot] = useState<Mascot | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchMascots();
  }, []);

  const fetchMascots = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/mascots");
      const json = await res.json();
      if (json.success) {
        setMascots(json.data);
      } else {
        setError(json.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (mascot: Mascot) => {
    setEditingMascot({ ...mascot });
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMascot) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/mascots`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMascot),
      });
      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        // Update local list
        setMascots((prev) => prev.map((m) => (m.id === editingMascot.id ? json.data : m)));
        setTimeout(() => setEditingMascot(null), 1500);
      } else {
        alert("Lỗi khi lưu: " + json.error);
      }
    } catch (err: any) {
      alert("Lỗi kết nối: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDialogueChange = (key: "speaking" | "listening" | "thinking", value: string) => {
    if (editingMascot) {
      setEditingMascot({
        ...editingMascot,
        dialogue: { ...editingMascot.dialogue, [key]: value },
      });
    }
  };

  const handleColorChange = (key: "ring" | "bg" | "text" | "border", value: string) => {
    if (editingMascot) {
      setEditingMascot({
        ...editingMascot,
        themeColors: { ...editingMascot.themeColors, [key]: value },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:scale-105 transition-transform border border-slate-200 dark:border-slate-700">
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
            </Link>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Quản lý Mascot</h1>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-200 mb-6 font-bold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mascots.map((mascot) => (
            <div key={mascot.id} className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm flex gap-6">
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center shrink-0 border-4 overflow-hidden ${mascot.themeColors.bg} ${mascot.themeColors.ring}`}>
                {mascot.avatarUrl ? (
                  <Image src={mascot.avatarUrl} alt={mascot.name} width={96} height={96} className="object-cover" />
                ) : (
                  <span className="text-4xl">🎭</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 truncate">{mascot.name}</h3>
                  <button 
                    onClick={() => handleEdit(mascot)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">{mascot.description || "Chưa có mô tả"}</p>
                <div className="space-y-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-2"><span className="w-4">🔊</span> <span className="truncate">{mascot.dialogue.speaking}</span></p>
                  <p className="flex items-center gap-2"><span className="w-4">🎤</span> <span className="truncate">{mascot.dialogue.listening}</span></p>
                  <p className="flex items-center gap-2"><span className="w-4">🧠</span> <span className="truncate">{mascot.dialogue.thinking}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {mascots.length === 0 && !error && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 mt-6">
            <span className="text-4xl block mb-4">🤷‍♂️</span>
            <p className="text-slate-500 dark:text-slate-400 font-bold">Chưa có Mascot nào trong Database. Vui lòng chạy script đồng bộ từ Cloudinary.</p>
          </div>
        )}

      </div>

      {/* Edit Modal */}
      {editingMascot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-500" />
                Chỉnh sửa thông tin {editingMascot.name}
              </h3>
              <button onClick={() => setEditingMascot(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 md:p-6 space-y-5 overflow-y-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Tên Mascot</label>
                  <input 
                    type="text" 
                    value={editingMascot.name}
                    onChange={e => setEditingMascot({...editingMascot, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Mã ID (Không đổi)</label>
                  <input 
                    type="text" 
                    value={editingMascot.id}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-500 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Mô tả (Dành cho trẻ em)</label>
                <textarea 
                  value={editingMascot.description}
                  onChange={e => setEditingMascot({...editingMascot, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-400 min-h-[80px]"
                />
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                <h4 className="font-black text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><span className="text-xl">💬</span> Lời thoại hiển thị</h4>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <span className="w-32 text-sm font-bold text-slate-600 dark:text-slate-400">Trạng thái Nói 🔊</span>
                    <input type="text" value={editingMascot.dialogue.speaking} onChange={e => handleDialogueChange("speaking", e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 focus:border-emerald-400" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <span className="w-32 text-sm font-bold text-slate-600 dark:text-slate-400">Trạng thái Nghe 🎤</span>
                    <input type="text" value={editingMascot.dialogue.listening} onChange={e => handleDialogueChange("listening", e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 focus:border-rose-400" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <span className="w-32 text-sm font-bold text-slate-600 dark:text-slate-400">Trạng thái Nghĩ 🧠</span>
                    <input type="text" value={editingMascot.dialogue.thinking} onChange={e => handleDialogueChange("thinking", e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 focus:border-amber-400" />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                <h4 className="font-black text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><span className="text-xl">🎨</span> Tuỳ biến màu sắc (Tailwind Classes)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Background (bg-)</label>
                    <input type="text" value={editingMascot.themeColors.bg} onChange={e => handleColorChange("bg", e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Ring / Avatar Border</label>
                    <input type="text" value={editingMascot.themeColors.ring} onChange={e => handleColorChange("ring", e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Text Color (text-)</label>
                    <input type="text" value={editingMascot.themeColors.text} onChange={e => handleColorChange("text", e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Border (border-)</label>
                    <input type="text" value={editingMascot.themeColors.border} onChange={e => handleColorChange("border", e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono" />
                  </div>
                </div>
              </div>

              {saveSuccess && (
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl border border-emerald-200 font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Đã lưu thành công!
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setEditingMascot(null)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                  Huỷ
                </button>
                <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-md shadow-blue-200 dark:shadow-none transition-colors flex items-center gap-2 disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu thay đổi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
