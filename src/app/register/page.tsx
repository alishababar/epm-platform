'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// New sign-ups always land as EMPLOYEE (see lib/auth.ts — role is not a
// client-settable field). An ADMIN promotes users to MANAGER/ADMIN from
// the team settings page.

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signUpError } = await authClient.signUp.email({ name, email, password });

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message ?? 'Could not create your account.');
      return;
    }
    router.push('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-surface-border bg-surface-raised p-8">
        <h1 className="text-xl font-semibold text-slate-100">Create account</h1>
        <p className="mt-1 text-sm text-slate-400">Start managing your team's work.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            id="name"
            label="Full name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jordan Lee"
          />
          <Input
            id="email"
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-300 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
