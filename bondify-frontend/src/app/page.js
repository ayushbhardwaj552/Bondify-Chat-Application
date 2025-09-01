import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Main container with a vibrant gradient background and animations */}
      <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 lg:p-16 shadow-2xl border border-white/20 animate-fadeIn space-y-8 max-w-4xl w-full">
        {/* Application Title with a stylish gradient text effect */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-secondary-300 drop-shadow-lg animate-pulse">
          Bondify
        </h1>
        {/* Tagline for the application */}
        <p className="text-xl md:text-2xl text-white font-light mt-4 leading-relaxed">
          Connect effortlessly, share your moments, chat with AI, and build your bonds.
        </p>
        
        {/* Action buttons for login and signup */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-10">
          <Link href="/auth/login" passHref>
            <span className="btn-primary transform hover:scale-105 transition-transform duration-300 ease-in-out text-lg px-10 py-4 shadow-xl">
              Log In
            </span>
          </Link>
          <Link href="/auth/signup" passHref>
            <span className="btn-secondary transform hover:scale-105 transition-transform duration-300 ease-in-out text-lg px-10 py-4 shadow-xl">
              Sign Up
            </span>
          </Link>
        </div>

        {/* Optional: Add some subtle social proof or feature highlights */}
        <div className="mt-12 text-white text-opacity-80 text-sm md:text-base space-y-2">
          <p className="flex items-center justify-center gap-2">
            <span className="text-yellow-300">⭐</span> Real-time Messaging
          </p>
          <p className="flex items-center justify-center gap-2">
            <span className="text-green-300">💬</span> Group Chats & AI Assistant
          </p>
          <p className="flex items-center justify-center gap-2">
            <span className="text-blue-300">🔒</span> Secure & Private
          </p>
        </div>
      </div>
    </div>
  );
}
