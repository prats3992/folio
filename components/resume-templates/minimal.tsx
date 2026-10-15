import type { TemplateProps } from "./types"
import { A } from "./link"
import { contactItems } from "./helpers"


export function MinimalTemplate({ data: resumeData }: TemplateProps) {

  const { education, experience, projects, skills, personalInfo } = resumeData

  return (
    <div className="font-sans">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">{personalInfo.name || "Your Name"}</h1>
        {personalInfo.role && <p className="mb-2 text-lg">{personalInfo.role}</p>}
        {personalInfo.summary && <p className="mx-auto mb-3 max-w-2xl text-sm text-gray-700">{personalInfo.summary}</p>}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm text-gray-600">
          {contactItems(personalInfo).map((c, i) => (
            <span key={c.key} className="whitespace-nowrap">
              {i > 0 && <span className="mr-3 text-gray-300">|</span>}
              {c.href ? <A href={c.href}>{c.label}</A> : c.label}
            </span>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2 className="mb-3 border-b border-gray-300 pb-1 text-xl font-semibold">Experience</h2>
            <div className="space-y-4">
              {experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between">
                    <h3 className="font-medium">{exp.role || "Role"}</h3>
                    <span className="text-sm text-gray-600">{exp.date || "Date"}</span>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm">{exp.company || "Company"}</p>
                    <p className="text-sm text-gray-600">{exp.location || "Location"}</p>
                  </div>
                  <ul className="mt-1 list-inside list-disc text-sm">
                    {(exp.achievements || []).map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <h2 className="mb-3 border-b border-gray-300 pb-1 text-xl font-semibold">Education</h2>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between">
                    <h3 className="font-medium">{edu.degree || "Degree"}</h3>
                    <span className="text-sm text-gray-600">{edu.date || "Date"}</span>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm">{edu.school || "School"}</p>
                    <p className="text-sm text-gray-600">{edu.location || "Location"}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {(skills.technical.length > 0 || skills.soft.length > 0) && (
          <section>
            <h2 className="mb-3 border-b border-gray-300 pb-1 text-xl font-semibold">Skills</h2>
            <div className="grid gap-2 md:grid-cols-2">
              {skills.technical.length > 0 && (
                <div>
                  <h3 className="font-medium">Technical</h3>
                  <p className="text-sm">{skills.technical.join(", ")}</p>
                </div>
              )}
              {skills.soft.length > 0 && (
                <div>
                  <h3 className="font-medium">Soft Skills</h3>
                  <p className="text-sm">{skills.soft.join(", ")}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2 className="mb-3 border-b border-gray-300 pb-1 text-xl font-semibold">Projects</h2>
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div key={index}>
                  <h3 className="font-medium">{project.name || "Project Name"}</h3>
                  <p className="text-sm">{project.description || "Project Description"}</p>
                  {project.technologies && project.technologies.length > 0 && (
                    <p className="mt-1 text-xs text-gray-600">Technologies: {project.technologies.join(", ")}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

