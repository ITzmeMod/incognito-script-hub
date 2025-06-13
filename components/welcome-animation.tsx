"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function WelcomeAnimation() {
  const [showAnimation, setShowAnimation] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!showAnimation) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 2.5 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-6xl font-bold text-green-500"
          animate={{
            textShadow: ["0 0 5px #00ff00", "0 0 20px #00ff00", "0 0 5px #00ff00"],
          }}
          transition={{ duration: 1.5, repeat: 1, repeatType: "reverse" }}
        >
          WELCOME TO INCOGNITO
        </motion.h1>
        <motion.p
          className="text-xl text-center mt-4 text-green-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Your Ultimate Roblox Scripting Hub
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
