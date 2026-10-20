export const metadata = { title: 'Check your email — Levy Desk' }

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-stone-200 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-2xl">
          ✉️
        </div>
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="text-sm text-stone-500">
          A sign-in link has been sent to your email address. Click the link to
          complete sign-in.
        </p>
        <p className="text-xs text-stone-400">
          The link expires in 24 hours. If you don't see it, check your spam folder.
        </p>
      </div>
    </div>
  )
}
