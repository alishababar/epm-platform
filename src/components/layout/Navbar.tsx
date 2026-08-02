'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/Button';

interface NavbarProps {
  title: string;
  userName: string;
}

export function Navbar({ title, userName }: NavbarProps) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-surface-border px-6">
      <h1 className="text-base font-semibold text-slate-100">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-400">{userName}</span>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut size={15} /> Sign out
        </Button>
      </div>
    </header>
  );
}
