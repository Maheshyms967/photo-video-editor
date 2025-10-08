import React from 'react'
import ImageEditor from './components/ImageEditor'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Photo Editor Pro
        </h1>
        <p className="text-gray-400">Edit your photos like a pro — right in your browser</p>
      </header>

      <div className="w-full max-w-6xl bg-[#2b2b2b] p-6 rounded-2xl shadow-lg">
        <ImageEditor />
      </div>

      <footer className="mt-10 text-gray-500 text-sm">
        © {new Date().getFullYear()} • Made by Mahi 🚀
      </footer>
    </div>
  )
}
