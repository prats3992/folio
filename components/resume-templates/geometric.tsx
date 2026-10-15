import type { TemplateProps } from "./types"
import { A } from "./link"
import { initials, href } from "./helpers"

import { montserrat } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Mail, Phone, Globe, MapPin, Calendar } from "lucide-react"
import { Github, Linkedin } from "@/components/icons"

export function GeometricTemplate({ data: resumeData }: TemplateProps) {

  const { education, experience, projects, skills, personalInfo } = resumeData

  return (
    <div className={cn(montserrat.className, "relative mx-auto max-w-5xl overflow-hidden bg-white")}>
      {/* Geometric Shapes */}
      <div className="pointer-events-none absolute left-0 top-0 h-64 w-64 -translate-x-32 -translate-y-32 rotate-45 bg-yellow-500/10" />
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 translate-x-32 -translate-y-32 rotate-45 bg-red-500/10" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 -translate-x-32 translate-y-32 rotate-45 bg-red-500/10" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 translate-x-32 translate-y-32 rotate-45 bg-yellow-500/10" />

      {/* Circular Decoration */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border-[32px] border-yellow-500/5" />

      {/* Header */}
      <header className="relative z-10 overflow-hidden bg-gray-900 px-8 py-16 text-white">
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-8 flex flex-col items-center md:flex-row md:justify-between">
            <div className="mb-6 text-center md:mb-0 md:text-left">
              <h1 className="mb-2 text-5xl font-bold tracking-tight">{personalInfo.name}</h1>
              <p className="text-xl font-light text-gray-300">{personalInfo.role}</p>
              {personalInfo.summary && <p className="mt-3 max-w-2xl text-sm text-gray-400">{personalInfo.summary}</p>}
            </div>
            <div className="relative h-32 w-32 overflow-hidden rounded-lg border-4 border-white/10 bg-gray-800 flex items-center justify-center">
              <span className="text-4xl font-bold text-yellow-400">
                {initials(personalInfo.name)}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm md:justify-start">
            {personalInfo.email && (
            <A
              href={personalInfo.email ? `mailto:${personalInfo.email}` : undefined}
              className="flex items-center gap-2 hover:text-yellow-400"
            >
              <Mail className="h-4 w-4" />
              {personalInfo.email}
            </A>
            )}
            {personalInfo.phone && (
            <A href={personalInfo.phone ? `tel:${personalInfo.phone}` : undefined} className="flex items-center gap-2 hover:text-yellow-400">
              <Phone className="h-4 w-4" />
              {personalInfo.phone}
            </A>
            )}
            {personalInfo.github && (
            <A
              href={href(personalInfo.github)}
              className="flex items-center gap-2 hover:text-yellow-400"
            >
              <Github className="h-4 w-4" />
              {personalInfo.github}
            </A>
            )}
            {personalInfo.linkedin && (
            <A
              href={href(personalInfo.linkedin)}
              className="flex items-center gap-2 hover:text-yellow-400"
            >
              <Linkedin className="h-4 w-4" />
              {personalInfo.linkedin}
            </A>
            )}
            {personalInfo.website && (
            <A
              href={href(personalInfo.website)}
              className="flex items-center gap-2 hover:text-yellow-400"
            >
              <Globe className="h-4 w-4" />
              {personalInfo.website}
            </A>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-8">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Experience */}
          <section>
            <h2 className="relative mb-8 text-2xl font-bold text-gray-900">
              Professional Experience
              <span className="absolute -left-4 top-0 h-full w-1 bg-red-500" />
            </h2>
            <div className="space-y-8">
              {experience.map((exp, index) => (
                <div
                  key={index}
                  className="group relative rounded-lg bg-gray-50 p-6 transition-all hover:bg-white hover:shadow-lg"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{exp.role}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="font-medium">{exp.company}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-red-500" />
                        {exp.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-red-500" />
                        {exp.date}
                      </span>
                    </div>
                  </div>
                  <ul className="ml-6 list-disc space-y-2 text-gray-600">
                    {exp.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="relative mb-8 text-2xl font-bold text-gray-900">
                Technical Skills
                <span className="absolute -left-4 top-0 h-full w-1 bg-yellow-500" />
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.technical.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-yellow-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h2 className="relative mb-8 text-2xl font-bold text-gray-900">
                Soft Skills
                <span className="absolute -left-4 top-0 h-full w-1 bg-yellow-500" />
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.soft.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-yellow-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Projects */}
          <section>
            <h2 className="relative mb-8 text-2xl font-bold text-gray-900">
              Featured Projects
              <span className="absolute -left-4 top-0 h-full w-1 bg-red-500" />
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-lg bg-gray-50 p-6 transition-all hover:bg-white hover:shadow-lg"
                >
                  <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rotate-45 bg-red-500/5" />
                  <h3 className="mb-2 text-lg font-bold text-gray-900">{project.name}</h3>
                  <p className="mb-4 text-gray-600">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-gray-200/50 px-3 py-1 text-xs font-medium text-gray-900 transition-colors group-hover:bg-red-100"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section>
            <h2 className="relative mb-8 text-2xl font-bold text-gray-900">
              Education
              <span className="absolute -left-4 top-0 h-full w-1 bg-yellow-500" />
            </h2>
            <div className="space-y-6">
              {education.map((edu, index) => (
                <div
                  key={index}
                  className="group relative rounded-lg bg-gray-50 p-6 transition-all hover:bg-white hover:shadow-lg"
                >
                  <h3 className="text-lg font-bold text-gray-900">{edu.degree}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span className="font-medium">{edu.school}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-yellow-500" />
                      {edu.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-yellow-500" />
                      {edu.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

