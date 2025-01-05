'use client'

import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Activity, Brain, Shield } from 'lucide-react'

const features = [
  {
    title: "Real-time Tracking",
    description: "Monitor and analyze data in real-time with advanced AI algorithms",
    icon: Activity
  },
  {
    title: "Smart Analytics",
    description: "Get intelligent insights from your data with our powerful analytics engine",
    icon: Brain
  },
  {
    title: "Secure & Private",
    description: "Enterprise-grade security with end-to-end encryption",
    icon: Shield
  }
]

export default function Features() {
  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-white mb-16">
          Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card className="relative bg-gray-800 border-gray-700">
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full animate-ping" />
                  <CardHeader>
                    <Icon className="w-12 h-12 text-blue-500 mb-4" />
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
} 