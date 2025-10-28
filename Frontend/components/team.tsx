"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
const teamMembers = [
  {
    name: "Raanesh U",
    role: "ML Engineer",
    bio: "Machine Learning Engineer with a strong drive for innovation in AI-powered education, focused on building intelligent and adaptive learning systems.",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQG1EXakfiQYiQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1711986747949?e=1762992000&v=beta&t=bKwk2FX-5Kcz-RwWDQR_JhZctz6ZwViiWpeoczb4fYU"
  },
  {
    name: "Oswald Shilo",
    role: "ML Engineer",
    bio: "AI specialist passionate about developing secure, scalable, and high-performance models that enhance digital learning experiences.",
    image: "https://media.licdn.com/dms/image/v2/D5635AQF6JZCZ8viiOA/profile-framedphoto-shrink_400_400/B56ZimcTnlHUAg-/0/1755139095404?e=1762268400&v=beta&t=xchUE-ERy9MvsaYl6-vkV_MvBzkoIwGuJet3cn2c1Oc"
  },
  {
    name: "Ranjith Ganesh B.",
    role: "Full Stack Developer",
    bio: "Versatile developer crafting seamless, user-centric web solutions that merge functionality with engaging learning design.",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQG80Iis1L9Lpw/profile-displayphoto-scale_400_400/B4DZjIin4ZHwAg-/0/1755711177029?e=1762992000&v=beta&t=DDsqBW-brLOFNiaNwVjfhZgCSk23CLSmffVUekxWU6g"
  },
  {
    name: "Tharun Kumaran G.",
    role: "Full Stack Developer",
    bio: "Full-stack engineer dedicated to delivering responsive, accessible, and efficient web applications using cutting-edge technologies.",
    image: "https://media.licdn.com/dms/image/v2/D5603AQHIuvlWliFLEQ/profile-displayphoto-shrink_400_400/B56ZYl7RvwGsAg-/0/1744393019767?e=1762992000&v=beta&t=mGk2lesOtdwKP48TOQw-BYOlfsUuSfAQlaq_d6e8wFo"
  },
]


export default function Team() {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="team"
      ref={ref}
      className={`relative py-16 px-6 transition-opacity duration-1000 bg-white ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 mb-4">Our Team</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto rounded-full" />
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-white border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-amber-100 mx-auto mb-4 group-hover:border-amber-200 transition-colors duration-300">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  unoptimized={true}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-sm text-amber-500 font-medium mb-3">{member.role}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
