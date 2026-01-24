import { Suspense } from 'react'
import ResetPasswordForm from './reset-password-form'

// ✅ WRAPPER COMPONENT (Server Component)
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}