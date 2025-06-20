import Link from 'next/link';
import Image from 'next/image';

export default function ProjectOverview() {
  return (
    <div className="min-h-screen pattern-bg py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section remains unchanged */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-900 mb-4">DyslexoFly Project Overview</h1>
          <p className="text-indigo-700 max-w-2xl mx-auto">
            Making reading accessible for everyone through innovative technology
          </p>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
          <div className="p-6 md:p-8">
            {/* First section remains unchanged */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-indigo-900">Hackathon Project</h2>
              </div>
              <p className="text-indigo-800 mb-4 leading-relaxed">
                DyslexoFly was built for the <strong className="text-indigo-900">Code for Bharat Season 2 Hackathon</strong> with the goal 
                of empowering the 70 million+ dyslexic learners in India. Our solution transforms any educational 
                document into an accessible, engaging format—instantly.
              </p>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
                <p className="text-indigo-700 text-sm italic">
                  "Our vision is to create a tool that helps bridge the gap between conventional 
                  educational materials and the unique learning needs of individuals with dyslexia."
                </p>
              </div>
            </section>
            
            {/* Team section with updated photos */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-indigo-900">Our Team: The Kamand Krew</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="bg-white p-5 rounded-lg border border-indigo-100 shadow-sm">
                  <div className="flex items-start">
                    {/* Aditya's photo */}
                    <div className="mr-4 flex-shrink-0">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-100">
                        <Image 
                          src="/images/at.jpg" 
                          alt="Aditya Tayal" 
                          width={64} 
                          height={64} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-indigo-900">Aditya Tayal</h3>
                      <p className="text-indigo-700 text-sm">Full-stack & AI Integration</p>
                      <p className="mt-2 text-sm text-indigo-600">IIT Mandi, 3rd Year CSE</p>
                      <div className="mt-2">
                        <a href="https://github.com/TayalAditya" target="_blank" rel="noopener noreferrer" className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full inline-flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                          </svg>
                          GitHub
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-5 rounded-lg border border-indigo-100 shadow-sm">
                  <div className="flex items-start">
                    {/* Siddhi's photo */}
                    <div className="mr-4 flex-shrink-0">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-100">
                        <Image 
                          src="/images/ssp.jpg" 
                          alt="Siddhi Pogakwar" 
                          width={64} 
                          height={64} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-indigo-900">Siddhi Pogakwar</h3>
                      <p className="text-indigo-700 text-sm">TTS Training & Text Analyser</p>
                      <p className="mt-2 text-sm text-indigo-600">IIT Mandi, 3rd Year MnC</p>
                      <div className="mt-2">
                        <a href="https://github.com/SiddhiPogakwar123" target="_blank" rel="noopener noreferrer" className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full inline-flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                          </svg>
                          GitHub
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-indigo-900">Project Implementation</h2>
              </div>
              
              <p className="text-indigo-800 mb-4">
                Our solution leverages modern web technologies and AI to create a seamless experience:
              </p>
              
              <ul className="space-y-3 mb-4">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-indigo-800"><strong className="text-indigo-900">Frontend:</strong> Next.js with Tailwind CSS for a responsive, accessible interface</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-indigo-800"><strong className="text-indigo-900">Backend:</strong> Python with Flask for text processing and AI integration</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-indigo-800"><strong className="text-indigo-900">AI Features:</strong> Text extraction, summarization, and text-to-speech conversion</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-indigo-800"><strong className="text-indigo-900">Language Support:</strong> Currently Focused on English, Hindi with potential for more</span>
                </li>
              </ul>
              
              <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm mt-6">
                <h3 className="font-medium text-indigo-900 mb-2">GitHub Repository</h3>
                <p className="text-sm text-indigo-700 mb-3">
                  Our project code is available on GitHub. Feel free to explore, contribute, or use it as inspiration!
                </p>
                <a 
                  href="https://github.com/TayalAditya/DyslexoFly" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  View on GitHub
                </a>
              </div>
            </section>
            
            <section>
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-indigo-900">Future Roadmap</h2>
              </div>
              
              <ol className="space-y-3 mb-4 list-decimal list-inside pl-4">
                <li className="text-indigo-800">
                  <span className="font-medium text-indigo-900">Multi-language support</span> - Hindi, Marathi, and other Indian languages
                </li>
                <li className="text-indigo-800">
                  <span className="font-medium text-indigo-900">Browser extension</span> - Enable 1-click conversions of any web content
                </li>
                <li className="text-indigo-800">
                  <span className="font-medium text-indigo-900">Mobile application</span> - Native app experience for Android and iOS devices
                </li>
              </ol>
              
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-lg border border-indigo-100 text-center mt-6">
                <p className="text-indigo-900 font-medium mb-3">Interested in collaborating or learning more?</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="mailto:b23243@students.iitmandi.ac.in" className="px-4 py-2 bg-white border border-indigo-200 rounded-md text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm">
                    Contact Team
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
  );
}