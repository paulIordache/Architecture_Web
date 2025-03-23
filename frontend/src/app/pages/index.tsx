'use client' // Important to mark this as a client component

import { useRouter } from 'next/navigation'

const Home = () => {
  const router = useRouter()

  const goToLogin = () => {
    router.push("/login")
  }

  const goToRegister = () => {
    router.push("/register")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to Our App</h1>
        <p className="text-lg mb-8">Choose an option to proceed</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={goToLogin}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
          <button
            onClick={goToRegister}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-700 transition"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
