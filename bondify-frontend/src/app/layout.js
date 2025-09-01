import { Inter } from "next/font/google";
import "./globals.css";
// Corrected relative import paths
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "./components/SocketProvider";
import { ChatProvider } from "@/context/ChatContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Bondify - Connect & Chat",
  description: "A modern chat application built with Next.js and MERN stack.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* AuthProvider wraps the entire application to provide user authentication context */}
       <AuthProvider>
  <ChatProvider>
    <SocketProvider>
      {children}
    </SocketProvider>
  </ChatProvider>
</AuthProvider>      </body>
    </html>
  );
}
