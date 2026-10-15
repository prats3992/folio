import type { ComponentType } from "react"
import type { TemplateProps } from "./types"
import { A } from "./link"
import { initials, href, yearsOfExperience } from "./helpers"

import { poppins, inter } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Mail, Phone, GraduationCap, Briefcase, Star, Code, Users, Brain } from "lucide-react"
import { Github } from "@/components/icons"

function StatCard({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border bg-white p-4 shadow-sm transition-colors hover:border-teal-500">
      <div className="mb-2 rounded-full bg-orange-100 p-2">
        <Icon className="h-5 w-5 text-orange-600" />
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

export function InfographicTemplate({ data: resumeData }: TemplateProps) {

  const { education, experience, projects, skills, personalInfo } = resumeData

  const years = yearsOfExperience(experience)

  // Calculate number of projects
  const numberOfProjects = projects.length

  // Calculate total technologies
  const totalTechnologies = new Set(
    projects.flatMap((project) => project.technologies).concat(skills.technical),
  ).size

  return (
    <div className="mx-auto max-w-4xl space-y-8 bg-gray-50 p-8">
      {/* Header */}
      <header className="relative overflow-hidden rounded-lg bg-teal-900 p-8 text-white">
        <div className="relative z-10">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            {/* Replace image with initials avatar */}
            <div className="flex h-32 w-32 items-center justify-center rounded-xl border-4 border-white/20 bg-white/10 text-4xl font-bold text-white">
              {initials(personalInfo.name)}
            </div>
            <div className="text-center md:text-left">
              <h1 className={cn(poppins.className, "mb-2 text-4xl font-bold tracking-tight")}>
                {personalInfo.name || ""}
              </h1>
              <p className={cn(inter.className, "mb-4 text-xl text-white/90")}>{personalInfo.role || ""}</p>
              {personalInfo.summary && <p className="mb-4 max-w-2xl text-sm text-white/85">{personalInfo.summary}</p>}
              <div className="flex flex-wrap justify-center gap-4 text-sm md:justify-start">
                {personalInfo.email && (
                <A
                  href={personalInfo.email ? `mailto:${personalInfo.email}` : undefined}
                  className="flex items-center gap-1 hover:text-white/80"
                >
                  <Mail className="h-4 w-4" />
                  {personalInfo.email || ""}
                </A>
                )}
                {personalInfo.phone && (
                <A
                  href={personalInfo.phone ? `tel:${personalInfo.phone}` : undefined}
                  className="flex items-center gap-1 hover:text-white/80"
                >
                  <Phone className="h-4 w-4" />
                  {personalInfo.phone || ""}
                </A>
                )}
                {personalInfo.github && (
                <A
                  href={href(personalInfo.github)}
                  className="flex items-center gap-1 hover:text-white/80"
                >
                  <Github className="h-4 w-4" />
                  {personalInfo.github || ""}
                </A>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 150%, rgba(255, 255, 255, 0.1) 30%, transparent 31%), radial-gradient(circle at 80% -50%, rgba(255, 255, 255, 0.1) 20%, transparent 21%)",
            backgroundSize: "60px 60px",
          }}
        />
      </header>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard icon={Briefcase} label="Years Experience" value={`${years}+`} />
        <StatCard icon={Star} label="Projects" value={numberOfProjects.toString()} />
        <StatCard icon={Code} label="Technologies" value={totalTechnologies.toString()} />
        <StatCard icon={Users} label="Roles Held" value={experience.length.toString()} />
      </div>

      {/* Skills Section */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className={cn(poppins.className, "mb-6 text-2xl font-semibold text-gray-900")}>Skills & Expertise</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className={cn(poppins.className, "mb-4 font-medium text-gray-900")}>Technical Proficiency</h3>
            <div className="flex flex-wrap gap-2">
              {skills.technical.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1.5 rounded-md border border-teal-100 bg-teal-50 px-2.5 py-1 text-sm font-medium text-teal-700"
                >
                  <Code className="h-3.5 w-3.5" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className={cn(poppins.className, "mb-4 font-medium text-gray-900")}>Core Competencies</h3>
            <div className="grid grid-cols-2 gap-4">
              {skills.soft.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 rounded-lg border bg-gray-50 p-3 text-sm transition-colors hover:border-orange-200 hover:bg-orange-50"
                >
                  <Brain className="h-4 w-4 text-orange-500" />
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className={cn(poppins.className, "mb-6 text-2xl font-semibold text-gray-900")}>Professional Journey</h2>
        <div className="space-y-6">
          {experience.map((exp, index) => (
            <div key={index} className="relative flex gap-4 pb-6 last:pb-0">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <Briefcase className="h-5 w-5 text-orange-600" />
                </div>
                {index !== experience.length - 1 && <div className="h-full w-px bg-orange-200" />}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className={cn(poppins.className, "font-medium text-gray-900")}>{exp.role}</h3>
                  <span className="text-sm text-orange-600">{exp.date}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {exp.company} • {exp.location}
                </p>
                <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
                  {exp.achievements.map((achievement, i) => (
                    <li key={i}>{achievement}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className={cn(poppins.className, "mb-6 text-2xl font-semibold text-gray-900")}>Featured Projects</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg border bg-gray-50 p-4 transition-all hover:border-teal-500"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className={cn(poppins.className, "font-medium text-gray-900")}>{project.name}</h3>
                <Users className="h-4 w-4 text-teal-500" />
              </div>
              <p className="mb-4 text-sm text-muted-foreground">{project.description}</p>
              <div className="flex flex-wrap gap-1">
                {project.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full bg-teal-50 px-2 py-1 text-xs text-teal-600"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education Section */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className={cn(poppins.className, "mb-6 text-2xl font-semibold text-gray-900")}>Education</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {education.map((edu, index) => (
            <div
              key={index}
              className="flex items-start gap-4 rounded-lg border bg-gray-50 p-4 transition-colors hover:border-orange-200 hover:bg-orange-50"
            >
              <div className="rounded-full bg-orange-100 p-2">
                <GraduationCap className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className={cn(poppins.className, "font-medium text-gray-900")}>{edu.degree}</h3>
                <p className="text-sm text-muted-foreground">{edu.school}</p>
                <div className="mt-1 flex items-center gap-2 text-sm text-orange-600">
                  <span>{edu.location}</span>
                  <span>•</span>
                  <span>{edu.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

