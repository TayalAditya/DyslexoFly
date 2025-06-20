import Link from 'next/link'

export default function About() {
  return (
    <div className="min-h-screen pattern-bg py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-900 mb-4">About DyslexoFly</h1>
          <p className="text-indigo-700 max-w-2xl mx-auto">
            Making educational content accessible to everyone, one document at a time
          </p>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
          <div className="p-6 md:p-8">
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-indigo-900">Our Mission</h2>
              </div>
              <p className="text-indigo-800 mb-4 leading-relaxed">
                DyslexoFly is dedicated to making educational materials accessible to all learners, 
                particularly those with dyslexia and other reading difficulties. We believe that everyone deserves 
                equal access to quality education, regardless of their learning differences.
              </p>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
                <p className="text-indigo-700 text-sm italic">
                  "We envision a world where learning materials adapt to students, not the other way around."
                </p>
              </div>
            </section>
            
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-indigo-900">What We Do</h2>
              </div>
              
              <p className="text-indigo-800 mb-4">
                Our platform transforms standard educational content into dyslexia-friendly formats by:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="text-indigo-600 mr-2">🔤</div>
                    <h3 className="font-medium text-indigo-900">Dyslexia-Friendly Text</h3>
                  </div>
                  <p className="text-sm text-indigo-700">
                    Converting text using specialized fonts, optimal spacing, and visual aids
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="text-indigo-600 mr-2">🔊</div>
                    <h3 className="font-medium text-indigo-900">Audio Versions</h3>
                  </div>
                  <p className="text-sm text-indigo-700">
                    Creating high-quality audio readings with natural-sounding voices
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="text-indigo-600 mr-2">📝</div>
                    <h3 className="font-medium text-indigo-900">AI Summaries</h3>
                  </div>
                  <p className="text-sm text-indigo-700">
                    Generating concise summaries to enhance comprehension and recall
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="text-indigo-600 mr-2">⚙️</div>
                    <h3 className="font-medium text-indigo-900">Customizable Experience</h3>
                  </div>
                  <p className="text-sm text-indigo-700">
                    Allowing users to adjust fonts, sizes, colors, and reading preferences
                  </p>
                </div>
              </div>
            </section>
            
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-indigo-900">Our Technology</h2>
              </div>
              
              <p className="text-indigo-800 mb-4">
                DyslexoFly combines modern web technologies with artificial intelligence to deliver 
                a seamless and effective learning experience:
              </p>
              
              <div className="relative overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-1 mb-4"></div>
                <ul className="space-y-3 mb-4">
                  {[
                    'Advanced text processing algorithms for format conversion',
                    'Natural language processing for text summarization',
                    'High-quality text-to-speech synthesis for audio generation',
                    'Responsive web design for accessibility across all devices'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-indigo-800">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-1"></div>
              </div>
            </section>
            
            <section>
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-indigo-900">Get Involved</h2>
              </div>
              
              <p className="text-indigo-800 mb-6">
                We're constantly working to improve DyslexoFly and expand our capabilities. 
                If you're interested in contributing to this project or have suggestions for improvement, 
                please contact us.
              </p>
              
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-lg border border-indigo-100 text-center">
                <p className="text-indigo-900 font-medium mb-3">Ready to make education more accessible?</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="mailto:contact@dyslexofly.com" className="px-4 py-2 bg-white border border-indigo-200 rounded-md text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm">
                    Contact Us
                  </a>
                  <Link href="/upload" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-sm">
                    Try DyslexoFly Now
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}