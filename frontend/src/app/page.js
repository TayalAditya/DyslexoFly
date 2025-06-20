import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Making Education <span className="text-blue-600">Accessible</span> for All
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Our EdTech Accessibility Hub converts educational materials into dyslexia-friendly formats with audio versions and easy-to-understand summaries.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/upload" 
                    className="px-6 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 shadow-md transition-colors">
                  Upload Material
                </Link>
                <Link href="/about"
                    className="px-6 py-3 bg-white text-blue-600 text-center rounded-lg border border-blue-200 hover:bg-gray-50 shadow-md transition-colors">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative h-80">
              <div className="absolute inset-0 bg-blue-100 rounded-xl transform rotate-3"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center p-8">
                    <div className="text-5xl mb-4">📚 📊 🎧</div>
                    <h3 className="text-xl font-semibold">Transform your learning experience</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Features Designed for Accessibility</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-xl p-6 shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Dyslexia-Friendly Text</h3>
              <p className="text-gray-600">Customize text with specialized fonts, spacing, and colors to improve readability for dyslexic readers.</p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6 shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.465a5 5 0 01-.732-.732m-.732.732a5 5 0 01-.732-.732M3 16.25v-.75a.75.75 0 00-.75-.75H1.5m1.5 3v.75c0 .414.336.75.75.75H5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Audio Conversion</h3>
              <p className="text-gray-600">Listen to your educational materials with our text-to-speech technology for auditory learning preferences.</p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6 shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Summaries</h3>
              <p className="text-gray-600">Get concise AI-generated summaries of complex educational materials to enhance comprehension.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Make Learning Accessible?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Upload your educational materials and transform them into accessible formats for dyslexic students.
          </p>
          <Link href="/upload" 
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 shadow-lg transition-colors">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  )
}