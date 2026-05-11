'use client';

import { useApp } from '@/context/AppContext';
import LoginPage from '@/components/LoginPage';
import MainApp from '@/components/MainApp';

export default function Home() {
  const { currentUser, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-white text-xl font-semibold">NexaERP Loading...</h2>
        <p className="text-slate-400 mt-2">Connecting to Neon Database</p>
      </div>
    );
  }

  return currentUser ? <MainApp /> : <LoginPage />;
}
