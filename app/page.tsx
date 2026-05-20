'use client';

import { useApp } from '@/context/AppContext';
import LoginPage from '@/components/LoginPage';
import MainApp from '@/components/MainApp';
import Loader from '@/components/Loader';

export default function Home() {
  const { currentUser, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
        <Loader />
      </div>
    );
  }

  return currentUser ? <MainApp /> : <LoginPage />;
}
