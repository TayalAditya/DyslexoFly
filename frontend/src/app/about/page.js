export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">About EdTech Accessibility Hub</h1>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-6">
              The EdTech Accessibility Hub is dedicated to making educational materials accessible to all learners, 
              particularly those with dyslexia and other reading difficulties. We believe that everyone deserves 
              equal access to quality education, regardless of their learning differences.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
            <p className="text-gray-700 mb-6">
              Our platform transforms standard educational content into dyslexia-friendly formats by:
            </p>
            
            <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
              <li>Converting text to dyslexia-friendly formats with specialized fonts and spacing</li>
              <li>Creating audio versions of text for auditory learners</li>
              <li>Generating AI-powered summaries to enhance comprehension</li>
              <li>Providing customizable reading experiences with adjustable fonts, sizes, and colors</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mb-4">Our Technology</h2>
            <p className="text-gray-700 mb-6">
              The EdTech Accessibility Hub combines modern web technologies with artificial intelligence to deliver 
              a seamless and effective learning experience. We use:
            </p>
            
            <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
              <li>Advanced text processing algorithms for format conversion</li>
              <li>Natural language processing for text summarization</li>
              <li>High-quality text-to-speech synthesis for audio generation</li>
              <li>Responsive web design for accessibility across all devices</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mb-4">Get Involved</h2>
            <p className="text-gray-700">
              We're constantly working to improve our platform and expand our capabilities. 
              If you're interested in contributing to this project or have suggestions for improvement, 
              please contact us at <a href="mailto:contact@edtechhub.example" className="text-blue-600 hover:underline">contact@edtechhub.example</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}