"use client"

import { useEffect, useState } from "react"

export default function Honeypot() {
  const [token, setToken] = useState("")

  useEffect(() => {
    // Generate a random token
    const randomToken = Math.random().toString(36).substring(2, 15)
    setToken(randomToken)
  }, [])

  return (
    <>
      {/* Hidden field that humans won't fill out but bots might */}
      <div style={{ opacity: 0, position: "absolute", top: "-9999px", left: "-9999px" }}>
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
        <input type="hidden" name="honeypot_token" value={token} />
      </div>
    </>
  )
}
