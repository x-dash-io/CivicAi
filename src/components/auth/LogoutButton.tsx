'use client';

import { useState } from 'react';
import { logout } from '@/lib/actions/auth';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      setIsLoading(false);
      console.error('Logout failed:', error);
    }
  };

  return (
    <form action={handleLogout}>
      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
      >
        <LogOut className="w-5 h-5" />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </form>
  );
}
