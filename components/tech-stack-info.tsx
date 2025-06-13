export default function TechStackInfo() {
  return (
    <div className="space-y-6">
      <div className="p-4 border border-green-900 rounded-lg">
        <h4 className="text-green-300 font-medium mb-3">Frontend</h4>
        <ul className="space-y-1 text-gray-400">
          <li>• Next.js (React Framework)</li>
          <li>• React (UI Library)</li>
          <li>• TailwindCSS (Styling)</li>
          <li>• Framer Motion (Animations)</li>
        </ul>
      </div>

      <div className="p-4 border border-green-900 rounded-lg">
        <h4 className="text-green-300 font-medium mb-3">Backend & Storage</h4>
        <ul className="space-y-1 text-gray-400">
          <li>• LocalStorage (Client-side storage)</li>
          <li>• Next.js API Routes (Serverless functions)</li>
          <li>• Google OAuth (Authentication)</li>
        </ul>
      </div>

      <p className="text-gray-400 text-sm italic mt-4">
        This tech stack is completely free to host and maintain, with no recurring costs.
      </p>
    </div>
  )
}
