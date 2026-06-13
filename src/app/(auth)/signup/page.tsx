import { SignupForm } from '@/components/features/auth/SignupForm'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">SoloAdventurer</h1>
          <p className="text-gray-600">Join our community of solo travelers</p>
        </div>

        <SignupForm />

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  )
}
