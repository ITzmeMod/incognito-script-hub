export default function SecurityInfo() {
  return (
    <div className="space-y-6">
      <div className="p-4 border border-green-900 rounded-lg">
        <h4 className="text-green-300 font-medium mb-3">Frontend Security</h4>
        <ul className="space-y-1 text-gray-400">
          <li>• HTTPS enforcement via security headers</li>
          <li>• Content Security Policy (CSP)</li>
          <li>• Input validation & sanitization</li>
          <li>• XSS prevention with output escaping</li>
          <li>• Secure form handling</li>
        </ul>
      </div>

      <div className="p-4 border border-green-900 rounded-lg">
        <h4 className="text-green-300 font-medium mb-3">Backend Security</h4>
        <ul className="space-y-1 text-gray-400">
          <li>• Rate limiting & request throttling</li>
          <li>• JWT authentication</li>
          <li>• CSRF protection with tokens</li>
          <li>• Input sanitization</li>
          <li>• Security event logging</li>
        </ul>
      </div>

      <div className="p-4 border border-green-900 rounded-lg">
        <h4 className="text-green-300 font-medium mb-3">User Authentication</h4>
        <ul className="space-y-1 text-gray-400">
          <li>• Secure password handling</li>
          <li>• Brute-force protection</li>
          <li>• Session management</li>
          <li>• Secure cookies</li>
        </ul>
      </div>

      <div className="p-4 border border-green-900 rounded-lg">
        <h4 className="text-green-300 font-medium mb-3">Data Security</h4>
        <ul className="space-y-1 text-gray-400">
          <li>• Data validation with Zod</li>
          <li>• No hardcoded secrets</li>
          <li>• Secure data storage</li>
        </ul>
      </div>

      <div className="p-4 border border-green-900 rounded-lg">
        <h4 className="text-green-300 font-medium mb-3">Browser Security Headers</h4>
        <ul className="space-y-1 text-gray-400">
          <li>• Strict-Transport-Security</li>
          <li>• X-Frame-Options: DENY</li>
          <li>• X-XSS-Protection</li>
          <li>• X-Content-Type-Options: nosniff</li>
          <li>• Referrer-Policy: no-referrer</li>
          <li>• Permissions-Policy</li>
        </ul>
      </div>

      <div className="p-4 border border-green-900 rounded-lg">
        <h4 className="text-green-300 font-medium mb-3">Bot & Spam Protection</h4>
        <ul className="space-y-1 text-gray-400">
          <li>• Honeypot fields</li>
          <li>• Rate limiting</li>
        </ul>
      </div>

      <p className="text-gray-400 text-sm italic">
        All security features implemented using completely free tools and services.
      </p>
    </div>
  )
}
