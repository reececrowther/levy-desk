import { signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const metadata = { title: 'Sign in — Levy Desk' }

const isDev = process.env.NODE_ENV === 'development'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: '#fdf8f2' }}>
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Sign in to Levy Desk</h1>
          <p className="text-sm text-stone-500">
            {isDev ? 'Local dev: sign in instantly below.' : 'Enter your email to receive a magic link.'}
          </p>
        </div>

        {/* Dev bypass — only rendered in development */}
        {isDev && (
          <form
            action={async (formData: FormData) => {
              'use server'
              const email = formData.get('email') as string
              await signIn('dev', { email, redirectTo: '/dashboard' })
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="dev-email">Email address</Label>
              <Input
                id="dev-email"
                name="email"
                type="email"
                placeholder="demo@levydesk.local"
                defaultValue="demo@levydesk.local"
                required
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600">
              Sign in (dev — no email sent)
            </Button>
            <p className="text-center text-xs text-amber-600">
              Dev bypass — visible in development only
            </p>
          </form>
        )}

        {/* Magic link form — shown in production, or alongside dev form */}
        {(!isDev || process.env.EMAIL_SERVER) && (
          <form
            action={async (formData: FormData) => {
              'use server'
              const email = formData.get('email') as string
              await signIn('nodemailer', { email, redirectTo: '/dashboard' })
            }}
            className="space-y-4"
          >
            {isDev && (
              <p className="text-xs text-stone-400">Or use magic link (requires EMAIL_SERVER):</p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <Button type="submit" className="w-full" variant={isDev ? 'outline' : 'default'}>
              Send magic link
            </Button>
          </form>
        )}

        <p className="text-center text-xs text-stone-400">
          By signing in you agree to our terms of service.
        </p>
      </div>
    </div>
  )
}
