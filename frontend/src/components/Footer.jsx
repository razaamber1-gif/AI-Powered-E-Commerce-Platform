export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid sm:grid-cols-3 gap-8 text-sm">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">Shopzy</h3>
          <p>AI-powered shopping assistant. Find what you want, fast.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">About</h4>
          <ul className="space-y-2">
            <li>Final-year project</li>
            <li>Built with React, Node.js, FastAPI</li>
            <li>Llama 3.2 LLM for AI search</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Try the AI ChatBot</h4>
          <p>Click the floating button in the bottom-right corner and search using everyday language.</p>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs">
        © {new Date().getFullYear()} Shopzy. All rights reserved.
      </div>
    </footer>
  );
}
