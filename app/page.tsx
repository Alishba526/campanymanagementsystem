'use client';

import { useApp } from '@/context/AppContext';
import LoginPage from '@/components/LoginPage';
import MainApp from '@/components/MainApp';

export default function Home() {
  const { currentUser, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50">
            <span className="text-4xl">🚀</span>
          </div>
          <div className="absolute -inset-2 bg-purple-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
        </div>
        <h1 className="text-white text-3xl font-bold mb-2 tracking-wide">GROWZIX</h1>
        <p className="text-purple-300 text-sm font-medium mb-6">Enterprise Resource Planning</p>
        <div className="flex gap-2 mb-4">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="text-slate-400 text-sm">Initializing System...</p>
      </div>
    );
  }

  return currentUser ? <MainApp /> : <LoginPage />;
}
