'use client'

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function About() {
  return (
    <section className="py-20 bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              About TraceAI
            </h2>
            <p className="text-gray-400 mb-6">
              TraceAI is revolutionizing the way businesses track and analyze data. 
              Our cutting-edge AI technology provides unparalleled insights and 
              real-time monitoring capabilities.
            </p>
            <Button variant="secondary" className="mb-8">
              Learn More About Us
            </Button>
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-blue-500">
                <div className="absolute w-1 h-8 bg-blue-300 animate-pulse" 
                     style={{ animation: 'trace 2s infinite' }} />
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gray-700 border-gray-600 overflow-hidden">
              <div className="aspect-video relative">
                {/* Add your image or visualization here */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent" />
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 