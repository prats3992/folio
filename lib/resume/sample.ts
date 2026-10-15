import { resumeDataSchema } from "./schema"

// Fictional sample used by the template gallery and as an example in the editor.
export const SAMPLE_RESUME = resumeDataSchema.parse({
  "personalInfo": {
    "name": "Sarah Anderson",
    "role": "Senior Frontend Developer",
    "email": "sarah.anderson@example.com",
    "phone": "+1 (555) 123-4567",
    "github": "github.com/sanderson",
    "linkedin": "linkedin.com/in/sanderson",
    "website": "sarahanderson.dev",
    "photo": "",
    "location": "San Francisco, CA",
    "summary": "Senior frontend engineer with 6+ years building fast, accessible web apps in React and TypeScript. Led teams, shipped design systems and cares about performance budgets."
  },
  "education": [
    {
      "degree": "Master of Science in Computer Science",
      "school": "Stanford University",
      "location": "Stanford, CA",
      "date": "2018 - 2020"
    },
    {
      "degree": "Bachelor of Engineering in Software Engineering",
      "school": "University of Washington",
      "location": "Seattle, WA",
      "date": "2014 - 2018"
    }
  ],
  "experience": [
    {
      "role": "Senior Frontend Developer",
      "company": "TechCorp Solutions",
      "location": "San Francisco, CA",
      "date": "2020 - Present",
      "achievements": [
        "Led a team of 5 developers in rebuilding the company's flagship web application using Next.js and TypeScript, resulting in a 40% improvement in performance metrics",
        "Implemented a new design system that reduced development time for new features by 30%",
        "Mentored junior developers and conducted technical interviews for frontend positions"
      ]
    },
    {
      "role": "Frontend Developer",
      "company": "Innovation Labs",
      "location": "Seattle, WA",
      "date": "2018 - 2020",
      "achievements": [
        "Developed and maintained multiple React-based applications serving 100k+ daily users",
        "Collaborated with UX team to implement responsive designs and improve accessibility",
        "Reduced bundle size by 45% through code splitting and lazy loading strategies"
      ]
    }
  ],
  "projects": [
    {
      "name": "E-commerce Platform",
      "description": "Built a full-stack e-commerce platform using Next.js, TypeScript, and Stripe",
      "technologies": [
        "Next.js",
        "TypeScript",
        "Stripe",
        "Tailwind CSS"
      ],
      "url": ""
    },
    {
      "name": "Design System",
      "description": "Created a comprehensive design system with 50+ reusable components",
      "technologies": [
        "React",
        "Storybook",
        "Jest",
        "Figma"
      ],
      "url": ""
    },
    {
      "name": "Analytics Dashboard",
      "description": "Developed a real-time analytics dashboard with data visualization",
      "technologies": [
        "React",
        "D3.js",
        "WebSocket",
        "Material-UI"
      ],
      "url": ""
    }
  ],
  "skills": {
    "technical": [
      "JavaScript/TypeScript",
      "React/Next.js",
      "HTML5/CSS3",
      "Node.js",
      "GraphQL",
      "REST APIs",
      "Git",
      "Jest/Testing Library"
    ],
    "soft": [
      "Team Leadership",
      "Project Management",
      "Technical Writing",
      "Mentoring"
    ]
  },
  "certifications": [
    {
      "name": "AWS Certified Developer – Associate",
      "issuer": "Amazon Web Services",
      "date": "2023"
    }
  ]
})
