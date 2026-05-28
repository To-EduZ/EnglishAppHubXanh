"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader2, PlayCircle, Send, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Stage = "intro" | "warmup" | "picture" | "completed";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  stage: Stage;
  audioUrl?: string;
}

export default function InteractiveTest() {
  const [stage, setStage] = useState<Stage>("intro");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // Fetch a question for the picture stage
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch("/api/questions");
        const data = await res.json();
        if (data.success) {
          const picQuestions = data.data.filter((q: any) => q.type === "Scene_Description" || q.imagePath);
          if (picQuestions.length > 0) {
            setCurrentQuestion(picQuestions[0]);
          }
        }
      } catch (err) {
        console.error("Lỗi lấy câu hỏi:", err);
      }
    };
    fetchQuestions();
  }, []);

  const playTTS = (text: string) => {
    // Strip emojis so TTS engine doesn't read them aloud
    const cleanText = text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');
    const url = `/api/tts?text=${encodeURIComponent(cleanText.trim())}`;
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play().catch(e => console.error("Lỗi phát audio:", e));
    }
  };

  const addAiMessage = (content: string) => {
    const newMessage: Message = { id: Date.now().toString(), role: "ai", content, stage };
    setMessages((prev) => [...prev, newMessage]);
    playTTS(content);
  };

  const startTest = () => {
    setStage("warmup");
    addAiMessage("Hello! Welcome to the English test. What's your name?");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleAudioSubmission(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Vui lòng cấp quyền sử dụng Microphone nhé!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioSubmission = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("stage", stage);
      
      const currentStageMessages = messages.filter(m => m.stage === stage);
      formData.append("chatHistory", JSON.stringify(currentStageMessages.slice(-6))); // Only send recent to save tokens
      
      if (stage === "picture" && currentQuestion) {
        formData.append("context", JSON.stringify({
          expectedKeywords: currentQuestion.evaluationCriteria?.expectedKeywords || []
        }));
      }

      const res = await fetch("/api/interactive-chat", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (data.success) {
        // Add user message
        setMessages((prev) => [...prev, {
          id: Date.now().toString() + "_u",
          role: "user",
          content: data.transcribedText || "(Audio)",
          stage
        }]);

        // Add AI message
        addAiMessage(data.aiResponse);

        // Check stage progression
        if (data.stageComplete) {
          if (stage === "warmup") {
            setTimeout(() => setStage("picture"), 2000);
          } else if (stage === "picture") {
            setTimeout(() => setStage("completed"), 2000);
          }
        }
      } else {
        alert("Có lỗi xảy ra: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối đến server AI.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (stage === "intro") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border-4 border-blue-100">
          <div className="text-6xl mb-4">🌟</div>
          <h1 className="text-3xl font-black text-blue-600 mb-2">Interactive AI Test</h1>
          <p className="text-slate-600 mb-8 font-medium">
            Bài thi giao tiếp 1-kèm-1 với cô giáo AI. Con hãy bật loa và mic lên nhé!
          </p>
          <button 
            onClick={startTest}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition-transform"
          >
            <PlayCircle className="inline-block mr-2 w-6 h-6" />
            Bắt đầu bài thi
          </button>
          
          <Link href="/dashboard" className="block mt-4 text-slate-400 font-bold hover:text-slate-600">
            Quay lại Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col max-w-4xl mx-auto h-screen relative">
      {/* Hidden audio element for TTS */}
      <audio ref={audioRef} className="hidden" />

      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">👩‍🏫</div>
          <div>
            <h2 className="font-bold text-slate-800">Cô giáo AI</h2>
            <p className="text-xs text-blue-500 font-medium">Đang trong phòng thi ({stage})</p>
          </div>
        </div>
        <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200">
          Thoát
        </Link>
      </div>

      {/* Context Area (e.g. Picture) */}
      {stage === "picture" && currentQuestion && (
        <div className="bg-amber-50 p-4 border-b border-amber-200 flex flex-col items-center">
          <h3 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" /> Look at the picture and answer
          </h3>
          {currentQuestion.imagePath && (
            <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden shadow-md">
              <Image 
                src={currentQuestion.imagePath} 
                alt="Test image" 
                fill 
                className="object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              msg.role === "ai" 
                ? "bg-white border-2 border-blue-100 text-slate-800 rounded-tl-sm" 
                : "bg-blue-500 text-white rounded-tr-sm"
            }`}>
              <p className="font-medium">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-blue-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="font-medium text-sm">Cô giáo đang nghe...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {stage !== "completed" ? (
        <div className="p-4 bg-white border-t sticky bottom-0">
          <div className="flex items-center justify-center gap-4">
            {!isRecording ? (
              <button 
                onClick={startRecording}
                disabled={isProcessing}
                className="w-20 h-20 bg-green-500 text-white rounded-full flex flex-col items-center justify-center hover:scale-105 hover:bg-green-600 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg"
              >
                <Mic className="w-8 h-8 mb-1" />
                <span className="text-[10px] font-black uppercase">Nói</span>
              </button>
            ) : (
              <button 
                onClick={stopRecording}
                className="w-20 h-20 bg-rose-500 text-white rounded-full flex flex-col items-center justify-center hover:scale-105 animate-pulse shadow-lg shadow-rose-200"
              >
                <Square className="w-8 h-8 mb-1" />
                <span className="text-[10px] font-black uppercase">Dừng</span>
              </button>
            )}
            
            {/* Optional simple text fallback logic can go here if needed later */}
          </div>
          <p className="text-center text-xs text-slate-400 mt-3 font-medium">
            {isRecording ? "Đang ghi âm... Nhấn Dừng khi nói xong" : "Nhấn nút Nói để trả lời cô giáo"}
          </p>
        </div>
      ) : (
        <div className="p-8 bg-green-50 text-center border-t border-green-200">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-black text-green-600 mb-2">Hoàn thành bài thi!</h2>
          <p className="text-slate-600 font-medium">Bé đã trả lời rất xuất sắc.</p>
          <Link href="/dashboard" className="inline-block mt-4 px-6 py-3 bg-green-500 text-white rounded-xl font-bold shadow-md hover:bg-green-600">
            Trở về Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
