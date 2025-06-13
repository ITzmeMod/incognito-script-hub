export default function TechStack() {
  return (
    <div className="mt-8 p-6 border border-green-900 rounded-lg bg-black/50">
      <h3 className="text-xl font-bold text-green-400 mb-4">Tech Stack</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-green-300 font-medium mb-2">Frontend</h4>
          <ul className="space-y-1 text-gray-400">
            <li>• Next.js (React Framework)</li>
            <li>• React (UI Library)</li>
            <li>• TailwindCSS (Styling)</li>
            <li>• Framer Motion (Animations)</li>
          </ul>
        </div>
        <div>
          <h4 className="text-green-300 font-medium mb-2">Backend & Storage</h4>
          <ul className="space-y-1 text-gray-400">
            <li>• LocalStorage (Client-side storage)</li>
            <li>• Next.js API Routes (Serverless functions)</li>
            <li>• Google OAuth (Authentication)</li>
          </ul>
        </div>
      </div>
      <p className="mt-4 text-gray-400 text-sm">
        This tech stack is completely free to host and maintain, with no recurring costs.
      </p>
    </div>
  )
}
