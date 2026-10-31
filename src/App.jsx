import React, { useEffect, useMemo, useState } from 'react'
import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Copy,
  FilePlus2,
  FileText,
  GraduationCap,
  LoaderCircle,
  ListChecks,
  MapPin,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react'

const STORAGE_KEY = 'applyready-workspace-v1'

const starterData = {
  profile: {
    name: 'Jordan Lee',
    headline: 'Computer science student · Product-minded builder',
    email: 'jordan.lee@email.com',
    education: [
      { id: 'edu-1', school: 'Northstar University', degree: 'B.S. Computer Science', dates: '2023 – 2027' },
    ],
    experience: [],
    skills: 'React, TypeScript, Python, Figma, User research',
    projects: [
      { id: 'project-1', name: 'Campus Connect', details: 'Built a student event discovery app with a team of 3. Ran 8 user interviews.', achievement: 'Improved event sign-up completion by 24%.', tools: 'React · TypeScript · Figma' },
      { id: 'project-2', name: 'Study Buddy', details: 'Designed and shipped a lightweight study-group matching prototype for a campus design sprint.', achievement: '', tools: 'Python · UX research' },
    ],
  },
  application: {
    company: 'Northstar Labs',
    role: 'Product Design Intern',
    location: 'Remote · Summer 2027',
    jobDescription: 'We are looking for a curious intern to help our product team make complex tools feel simple. You will work with design and engineering to learn from customers, explore ideas, prototype flows, and help us ship improvements.\n\nYou might be a fit if you enjoy asking thoughtful questions, can share work you have made, and like collaborating across disciplines.',
    questions: [
      { id: 'question-1', prompt: 'Tell us about a project you are proud of. What was your contribution?', answer: '', reviewed: false },
      { id: 'question-2', prompt: 'Why are you interested in this internship at Northstar Labs?', answer: '', reviewed: false },
    ],
  },
  checklist: [false, false, false, false, false],
}

const steps = [
  { id: 'profile', label: 'My profile', icon: UserRound, hint: 'Your experience, in your words' },
  { id: 'application', label: 'New application', icon: FilePlus2, hint: 'Role details and questions' },
  { id: 'review', label: 'Review answer', icon: AlignLeft, hint: 'Write and check each response' },
  { id: 'checklist', label: 'Submission checklist', icon: ClipboardCheck, hint: 'Get ready to submit' },
]

const checklistLabels = [
  ['Resume tailored', 'Check that the most relevant experience is easy to find.'],
  ['Answers proofread', 'Read each answer aloud and check spelling and clarity.'],
  ['Facts verified', 'Confirm names, dates, tools, and results are accurate.'],
  ['Files attached', 'Attach the requested resume, portfolio, or work samples.'],
  ['Deadline checked', 'Confirm the submission date and any time zone.'],
]

function loadWorkspace() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return starterData
    const parsed = JSON.parse(saved)
    const savedProfile = parsed.profile || {}
    return {
      profile: {
        ...starterData.profile,
        ...savedProfile,
        education: Array.isArray(savedProfile.education) ? savedProfile.education : starterData.profile.education,
        experience: Array.isArray(savedProfile.experience) ? savedProfile.experience : [],
        projects: Array.isArray(savedProfile.projects)
          ? savedProfile.projects.map((project) => ({ achievement: '', ...project }))
          : starterData.profile.projects,
      },
      application: { ...starterData.application, ...parsed.application },
      checklist: Array.isArray(parsed.checklist) ? parsed.checklist : starterData.checklist,
    }
  } catch {
    return starterData
  }
}

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Field({ label, hint, className = '', ...props }) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      {hint && <span className="-mt-1 mb-2 block text-xs leading-5 text-muted">{hint}</span>}
      <input className="field" {...props} />
    </label>
  )
}

function TextAreaField({ label, hint, className = '', ...props }) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      {hint && <span className="-mt-1 mb-2 block text-xs leading-5 text-muted">{hint}</span>}
      <textarea className="field min-h-28 resize-y leading-6" {...props} />
    </label>
  )
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal">{eyebrow}</p>}
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

function App() {
  const [workspace, setWorkspace] = useState(loadWorkspace)
  const [screen, setScreen] = useState('profile')
  const [saveState, setSaveState] = useState('saved')
  const [questionUi, setQuestionUi] = useState({})

  useEffect(() => {
    setSaveState('saving')
    const timer = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace))
      setSaveState('saved')
    }, 350)
    return () => window.clearTimeout(timer)
  }, [workspace])

  const profile = workspace.profile
  const application = workspace.application
  const reviewedCount = application.questions.filter((question) => question.reviewed).length
  const checklistDone = workspace.checklist.filter(Boolean).length
  const completion = Math.round(((Number(Boolean(profile.name)) + Number(Boolean(profile.skills)) + Number(Boolean(application.company)) + Number(checklistDone > 0)) / 4) * 100)
  const initials = useMemo(() => profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'JL', [profile.name])

  function updateProfile(key, value) {
    setWorkspace((current) => ({ ...current, profile: { ...current.profile, [key]: value } }))
  }

  function updateApplication(key, value) {
    setWorkspace((current) => ({ ...current, application: { ...current.application, [key]: value } }))
  }

  function updateQuestion(id, key, value) {
    setWorkspace((current) => ({
      ...current,
      application: {
        ...current.application,
        questions: current.application.questions.map((item) => item.id === id ? { ...item, [key]: value } : item),
      },
    }))
  }

  function addQuestion() {
    updateApplication('questions', [...application.questions, { id: `question-${Date.now()}`, prompt: '', answer: '', reviewed: false }])
  }

  function removeQuestion(id) {
    updateApplication('questions', application.questions.filter((item) => item.id !== id))
  }

  function updateEducation(id, key, value) {
    updateProfile('education', profile.education.map((item) => item.id === id ? { ...item, [key]: value } : item))
  }

  function updateProject(id, key, value) {
    updateProfile('projects', profile.projects.map((item) => item.id === id ? { ...item, [key]: value } : item))
  }

  function updateExperience(id, key, value) {
    updateProfile('experience', profile.experience.map((item) => item.id === id ? { ...item, [key]: value } : item))
  }

  function updateQuestionUi(id, patch) {
    setQuestionUi((current) => ({
      ...current,
      [id]: { ...current[id], ...patch },
    }))
  }

  async function generateAnswer(question) {
    const id = question.id
    if (!question.prompt.trim() || !application.jobDescription.trim()) {
      updateQuestionUi(id, { error: 'Add the application question and job description before generating.' })
      return
    }
    updateQuestionUi(id, { loading: true, error: '', copied: false })
    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const response = await fetch(`${apiBase}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            education: profile.education,
            skills: profile.skills,
            projects: profile.projects,
            experience: profile.experience,
          },
          jobDescription: application.jobDescription,
          question: question.prompt,
          followUpAnswer: question.followUpAnswer || '',
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || `Answer generation failed (${response.status}).`)
      if (result.status === 'needs_info') {
        updateQuestion(id, 'followUp', result.followUp)
        updateQuestionUi(id, { error: '', loading: false })
        return
      }
      updateQuestion(id, 'answer', result.answer)
      updateQuestion(id, 'evidence', result.evidence || [])
      updateQuestion(id, 'followUp', '')
      updateQuestion(id, 'followUpAnswer', '')
      updateQuestionUi(id, { loading: false, error: '', copied: false })
    } catch (error) {
      updateQuestionUi(id, { loading: false, error: error.message || 'Could not generate an answer. Check your connection and server setup.' })
    }
  }

  async function copyAnswer(question) {
    try {
      await navigator.clipboard.writeText(question.answer || '')
      updateQuestionUi(question.id, { copied: true, error: '' })
      window.setTimeout(() => updateQuestionUi(question.id, { copied: false }), 1800)
    } catch {
      updateQuestionUi(question.id, { error: 'Copy was blocked by the browser. Select the answer text and copy it manually.' })
    }
  }

  function navigate(next) {
    setScreen(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeIndex = steps.findIndex((step) => step.id === screen)
  const activeStep = steps[activeIndex]

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-ink">
      <aside className="sidebar fixed inset-y-0 left-0 z-20 flex w-[268px] flex-col border-r border-[#e8ebef] bg-white px-5 py-6">
        <div className="mb-9 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#0f766e] text-white shadow-sm">
            <BriefcaseBusiness size={19} strokeWidth={2.3} />
          </div>
          <div>
            <div className="text-[17px] font-bold tracking-[-0.04em] text-ink">ApplyReady</div>
            <div className="text-[11px] font-medium tracking-wide text-muted">INTERNSHIP WORKSPACE</div>
          </div>
        </div>

        <div className="px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9aa3b1]">Your workspace</div>
        <nav className="mt-3 space-y-1" aria-label="Application workspace">
          {steps.map((step, index) => {
            const Icon = step.icon
            const active = screen === step.id
            return (
              <button key={step.id} onClick={() => navigate(step.id)} className={cx('nav-item group', active && 'nav-item-active')} aria-current={active ? 'page' : undefined}>
                <span className={cx('nav-icon', active && 'nav-icon-active')}><Icon size={17} /></span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-[13px] font-semibold">{step.label}</span>
                  <span className={cx('mt-0.5 block truncate text-[11px]', active ? 'text-teal/80' : 'text-[#929baa]')}>{step.hint}</span>
                </span>
                {index < activeIndex && <Check size={15} className="text-teal" />}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto">
          <div className="rounded-2xl border border-[#e8eeec] bg-[#f4f9f7] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink">Workspace progress</span>
              <span className="text-xs font-bold text-teal">{completion}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#dce9e5]"><div className="h-full rounded-full bg-teal transition-all" style={{ width: `${completion}%` }} /></div>
            <p className="mt-3 text-[11px] leading-5 text-muted">Small steps add up. Your drafts stay on this device.</p>
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-[#edf0f3] px-1 pt-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e4f2ee] text-xs font-bold text-teal">{initials}</div>
            <div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-ink">{profile.name || 'Your profile'}</div><div className="mt-0.5 text-[11px] text-muted">Personal workspace</div></div>
            <ShieldCheck size={16} className="text-[#8ca39b]" aria-label="Saved privately on this device" />
          </div>
        </div>
      </aside>

      <div className="main-shell min-h-screen pl-[268px]">
        <header className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-[#e8ebef] bg-white/90 px-5 backdrop-blur-md sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted sm:text-sm">
            <span className="hidden sm:inline">Application workspace</span><ChevronRight size={14} className="hidden sm:block" />
            <span className="truncate font-semibold text-ink">{activeStep.label}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted sm:text-xs">
            <span className={cx('h-1.5 w-1.5 rounded-full', saveState === 'saved' ? 'bg-[#52a88b]' : 'animate-pulse bg-amber-400')} />
            <span className="hidden sm:inline">{saveState === 'saved' ? 'Saved on this device' : 'Saving changes'}</span>
            <span className="sm:hidden">{saveState === 'saved' ? 'Saved' : 'Saving'}</span>
          </div>
        </header>

        <main className="mx-auto max-w-[1230px] px-5 pb-14 pt-7 sm:px-8 sm:pt-10 lg:px-10">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal">Step {activeIndex + 1} of {steps.length}</p>
              <h1 className="max-w-3xl text-[27px] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[34px]">{screen === 'profile' ? 'Make your experience easy to share.' : screen === 'application' ? 'Start with the opportunity.' : screen === 'review' ? 'Your story, carefully checked.' : 'A calm final check before you submit.'}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{screen === 'profile' ? 'Build a source of truth from your education, skills, and work. You stay in control of every detail.' : screen === 'application' ? 'Add the role details and paste the questions so you can shape your application around the opportunity.' : screen === 'review' ? 'Draft each response in your own words, then check it against your real experience.' : 'Use this checklist to catch the small things before your application leaves your hands.'}</p>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-[#e4e8ed] bg-white px-3 py-2 text-[11px] font-semibold text-[#667080] shadow-sm sm:flex"><Save size={14} className="text-teal" /> Autosave on</div>
          </div>

          <div className="mb-7 grid grid-cols-4 gap-1.5 sm:gap-2">
            {steps.map((step, index) => (
              <button key={step.id} type="button" onClick={() => navigate(step.id)} className="group text-left" aria-label={`Go to ${step.label}`}>
                <div className={cx('h-1.5 rounded-full transition-colors', index <= activeIndex ? 'bg-teal' : 'bg-[#e3e7eb]', index === activeIndex && 'shadow-[0_0_0_3px_rgba(15,118,110,0.12)]')} />
                <div className={cx('mt-2 hidden text-[10px] font-semibold sm:block', index === activeIndex ? 'text-teal' : 'text-[#9aa3b1]')}>{step.label}</div>
              </button>
            ))}
          </div>

          {screen === 'profile' && (
            <ProfileScreen profile={profile} onProfile={updateProfile} onEducation={updateEducation} onExperience={updateExperience} onProject={updateProject} onNavigate={navigate} />
          )}
          {screen === 'application' && (
            <ApplicationScreen application={application} onApplication={updateApplication} onQuestion={updateQuestion} onAddQuestion={addQuestion} onRemoveQuestion={removeQuestion} onNavigate={navigate} />
          )}
          {screen === 'review' && (
            <ReviewScreen profile={profile} application={application} onQuestion={updateQuestion} reviewedCount={reviewedCount} onNavigate={navigate} questionUi={questionUi} onGenerate={generateAnswer} onCopy={copyAnswer} />
          )}
          {screen === 'checklist' && (
            <ChecklistScreen application={application} checklist={workspace.checklist} onChecklist={(value) => setWorkspace((current) => ({ ...current, checklist: value }))} checklistDone={checklistDone} onNavigate={navigate} />
          )}

          <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-[#e7eaee] pt-5 text-[11px] text-[#939caa] sm:flex-row">
            <span>ApplyReady · Your experience, thoughtfully prepared.</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} /> Your workspace is saved locally in this browser.</span>
          </footer>
        </main>
      </div>
    </div>
  )
}

function SampleNotice() {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#dcebe7] bg-[#f1f8f5] px-4 py-3.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-teal shadow-sm"><CircleHelp size={16} /></div>
      <div><p className="text-xs font-semibold text-[#285d53]">Sample data — make it yours</p><p className="mt-1 text-xs leading-5 text-[#628078]">These examples are for layout only. Replace them with accurate details from your own experience before using any draft.</p></div>
    </div>
  )
}

function ProfileScreen({ profile, onProfile, onEducation, onExperience, onProject, onNavigate }) {
  return (
    <>
      <SampleNotice />
      <SectionHeading eyebrow="Your profile" title="Start with what you know." description="Keep these details specific and honest. You can edit them at any time." />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(250px,0.75fr)]">
        <div className="space-y-5">
          <section className="panel p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3 border-b border-[#edf0f3] pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f4f1] text-teal"><UserRound size={18} /></div>
              <div><h3 className="text-sm font-semibold text-ink">A little about you</h3><p className="mt-1 text-xs text-muted">A useful starting point for every application.</p></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name" value={profile.name} onChange={(event) => onProfile('name', event.target.value)} placeholder="Your name" />
              <Field label="Email" type="email" value={profile.email} onChange={(event) => onProfile('email', event.target.value)} placeholder="you@email.com" />
              <Field label="One-line intro" className="sm:col-span-2" value={profile.headline} onChange={(event) => onProfile('headline', event.target.value)} placeholder="What are you studying or building?" />
            </div>
          </section>

          <section className="panel p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3 border-b border-[#edf0f3] pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f4f1] text-teal"><BriefcaseBusiness size={18} /></div>
              <div><h3 className="text-sm font-semibold text-ink">Work experience</h3><p className="mt-1 text-xs text-muted">Optional. Add employment details you can support exactly.</p></div>
            </div>
            <div className="space-y-4">
              {profile.experience.length === 0 && <div className="rounded-xl border border-dashed border-[#dfe5e8] bg-[#fbfcfd] px-4 py-3 text-xs leading-5 text-muted">No experience added yet. Leave this blank if you have no employment history to include.</div>}
              {profile.experience.map((experience, index) => <div key={experience.id} className="rounded-xl border border-[#edf0f3] bg-[#fbfcfd] p-4">
                <div className="mb-4 flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9aa3b1]">Experience {index + 1}</span><button type="button" onClick={() => onProfile('experience', profile.experience.filter((item) => item.id !== experience.id))} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600" aria-label={`Remove experience ${index + 1}`}><Trash2 size={15} /></button></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Role or title" value={experience.role || ''} onChange={(event) => onExperience(experience.id, 'role', event.target.value)} placeholder="Intern, assistant, volunteer…" />
                  <Field label="Employer or organization" value={experience.employer || ''} onChange={(event) => onExperience(experience.id, 'employer', event.target.value)} placeholder="Organization name" />
                  <Field label="Dates" className="sm:col-span-2" value={experience.dates || ''} onChange={(event) => onExperience(experience.id, 'dates', event.target.value)} placeholder="Month/year – month/year" />
                  <TextAreaField label="What did you do?" className="sm:col-span-2" value={experience.details || ''} onChange={(event) => onExperience(experience.id, 'details', event.target.value)} placeholder="Describe your own responsibilities in your words…" />
                  <TextAreaField label="Achievement or outcome (optional)" hint="Keep outcomes and numbers exactly as you can verify them." className="sm:col-span-2" value={experience.achievement || ''} onChange={(event) => onExperience(experience.id, 'achievement', event.target.value)} placeholder="A result you can support" />
                </div>
              </div>)}
              <button type="button" className="button-secondary" onClick={() => onProfile('experience', [...profile.experience, { id: `experience-${Date.now()}`, role: '', employer: '', dates: '', details: '', achievement: '' }])}><Plus size={15} /> Add experience</button>
            </div>
          </section>

          <section className="panel p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3 border-b border-[#edf0f3] pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0eefb] text-[#7168a8]"><GraduationCap size={19} /></div>
              <div><h3 className="text-sm font-semibold text-ink">Education</h3><p className="mt-1 text-xs text-muted">Add your current program or relevant training.</p></div>
            </div>
            <div className="space-y-4">
              {profile.education.map((education, index) => <div key={education.id} className="relative rounded-xl border border-[#edf0f3] bg-[#fbfcfd] p-4">
                {profile.education.length > 1 && <button type="button" onClick={() => onProfile('education', profile.education.filter((item) => item.id !== education.id))} className="absolute right-3 top-3 rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600" aria-label={`Remove education ${index + 1}`}><Trash2 size={15} /></button>}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="School or institution" value={education.school} onChange={(event) => onEducation(education.id, 'school', event.target.value)} placeholder="University or program" />
                  <Field label="Degree or area of study" value={education.degree} onChange={(event) => onEducation(education.id, 'degree', event.target.value)} placeholder="B.A. / Certificate / Major" />
                  <Field label="Dates" className="sm:col-span-2" value={education.dates} onChange={(event) => onEducation(education.id, 'dates', event.target.value)} placeholder="2024 – 2028" />
                </div>
              </div>)}
              <button type="button" className="button-secondary" onClick={() => onProfile('education', [...profile.education, { id: `edu-${Date.now()}`, school: '', degree: '', dates: '' }])}><Plus size={15} /> Add education</button>
            </div>
          </section>

          <section className="panel p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3 border-b border-[#edf0f3] pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4e8] text-[#bb7b35]"><Award size={18} /></div>
              <div><h3 className="text-sm font-semibold text-ink">Skills and projects</h3><p className="mt-1 text-xs text-muted">Capture useful evidence, outcomes, and tools.</p></div>
            </div>
            <Field label="Skills" hint="Separate items with commas. Keep to skills you can talk about with examples." value={profile.skills} onChange={(event) => onProfile('skills', event.target.value)} placeholder="Research, Excel, Python, communication…" />
            <div className="mt-6 space-y-4">
              {profile.projects.map((project, index) => <div key={project.id} className="rounded-xl border border-[#edf0f3] bg-[#fbfcfd] p-4">
                <div className="mb-4 flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9aa3b1]">Project {index + 1}</span><button type="button" onClick={() => onProfile('projects', profile.projects.filter((item) => item.id !== project.id))} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600" aria-label={`Remove project ${index + 1}`}><Trash2 size={15} /></button></div>
                <div className="grid gap-4">
                  <Field label="Project name" value={project.name} onChange={(event) => onProject(project.id, 'name', event.target.value)} placeholder="What did you make or contribute to?" />
                  <TextAreaField label="What did you do?" hint="Be concrete about your contribution and any result you can support." value={project.details} onChange={(event) => onProject(project.id, 'details', event.target.value)} placeholder="Describe the problem, your contribution, and what changed…" />
                  <TextAreaField label="Achievement or outcome (optional)" hint="Keep numbers and results exactly as you can verify them." value={project.achievement || ''} onChange={(event) => onProject(project.id, 'achievement', event.target.value)} placeholder="A measurable result or other outcome" />
                  <Field label="Tools or skills used" value={project.tools} onChange={(event) => onProject(project.id, 'tools', event.target.value)} placeholder="Tools, methods, collaborators" />
                </div>
              </div>)}
              <button type="button" className="button-secondary" onClick={() => onProfile('projects', [...profile.projects, { id: `project-${Date.now()}`, name: '', details: '', tools: '' }])}><Plus size={15} /> Add project</button>
            </div>
          </section>
          <div className="flex justify-end"><button className="button-primary" onClick={() => onNavigate('application')}>Continue to application <ArrowRight size={16} /></button></div>
        </div>

        <div className="space-y-5">
          <div className="panel overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-[#dcefe8] via-[#e9f2ef] to-[#f5eddf]" />
            <div className="px-5 pb-5"><div className="-mt-7 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white bg-[#0f766e] text-base font-bold text-white">{profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'JL'}</div><h3 className="text-base font-semibold text-ink">{profile.name || 'Your name'}</h3><p className="mt-1 text-xs leading-5 text-muted">{profile.headline || 'Your one-line intro'}</p><div className="mt-4 flex items-center gap-2 border-t border-[#edf0f3] pt-4 text-xs text-muted"><GraduationCap size={14} /> {profile.education[0]?.school || 'Add a school or program'}</div></div>
          </div>
          <div className="rounded-2xl border border-[#e8ebef] bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink"><ShieldCheck size={16} className="text-teal" /> Keep it true</div>
            <p className="mt-2 text-xs leading-5 text-muted">Generated drafts are assembled from exact profile facts. If the information is missing, the review screen asks you for it instead of filling in a guess.</p>
          </div>
          <div className="rounded-2xl border border-[#e8ebef] bg-white p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink"><ListChecks size={16} className="text-[#887cad]" /> Profile snapshot</div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between gap-3"><span className="text-muted">Education</span><span className="font-semibold text-ink">{profile.education.length} {profile.education.length === 1 ? 'entry' : 'entries'}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted">Work experience</span><span className="font-semibold text-ink">{profile.experience.length} {profile.experience.length === 1 ? 'entry' : 'entries'}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted">Projects</span><span className="font-semibold text-ink">{profile.projects.length} {profile.projects.length === 1 ? 'example' : 'examples'}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted">Skills listed</span><span className="font-semibold text-ink">{profile.skills.split(',').filter((skill) => skill.trim()).length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function ApplicationScreen({ application, onApplication, onQuestion, onAddQuestion, onRemoveQuestion, onNavigate }) {
  const questionCount = application.questions.filter((item) => item.prompt.trim()).length
  return (
    <>
      <SampleNotice />
      <SectionHeading eyebrow="New application" title="Give this opportunity a shape." description="Paste the role details and application questions. These stay editable as you prepare your responses." />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.72fr)]">
        <div className="space-y-5">
          <section className="panel p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3 border-b border-[#edf0f3] pb-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f4f1] text-teal"><BriefcaseBusiness size={18} /></div><div><h3 className="text-sm font-semibold text-ink">Opportunity details</h3><p className="mt-1 text-xs text-muted">A few basics to keep your application organized.</p></div></div>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Company" value={application.company} onChange={(event) => onApplication('company', event.target.value)} placeholder="Company name" /><Field label="Role title" value={application.role} onChange={(event) => onApplication('role', event.target.value)} placeholder="Internship title" /><Field label="Location or term" className="sm:col-span-2" value={application.location} onChange={(event) => onApplication('location', event.target.value)} placeholder="City, remote, season, or year" /></div>
          </section>
          <section className="panel p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3 border-b border-[#edf0f3] pb-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0eefb] text-[#7168a8]"><FileText size={18} /></div><div><h3 className="text-sm font-semibold text-ink">Job description</h3><p className="mt-1 text-xs text-muted">Paste the sections that help you understand the work.</p></div></div>
            <TextAreaField label="Role description" hint="The full text is fine. Highlight responsibilities or qualifications you want to remember." className="job-description" value={application.jobDescription} onChange={(event) => onApplication('jobDescription', event.target.value)} placeholder="Paste the job description here…" />
          </section>
          <section className="panel p-5 sm:p-7">
            <div className="mb-6 flex flex-col gap-3 border-b border-[#edf0f3] pb-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4e8] text-[#bb7b35]"><AlignLeft size={18} /></div><div><h3 className="text-sm font-semibold text-ink">Application questions</h3><p className="mt-1 text-xs text-muted">Paste each prompt as it appears on the application.</p></div></div><span className="w-fit rounded-full bg-[#f3f5f7] px-2.5 py-1 text-[11px] font-semibold text-muted">{questionCount} added</span></div>
            <div className="space-y-4">
              {application.questions.map((question, index) => <div key={question.id} className="rounded-xl border border-[#edf0f3] bg-[#fbfcfd] p-4">
                <div className="mb-3 flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9aa3b1]">Question {index + 1}</span>{application.questions.length > 1 && <button type="button" onClick={() => onRemoveQuestion(question.id)} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600" aria-label={`Remove question ${index + 1}`}><Trash2 size={15} /></button>}</div>
                <TextAreaField label="Prompt" value={question.prompt} onChange={(event) => onQuestion(question.id, 'prompt', event.target.value)} placeholder="Paste an application question…" className="question-prompt" />
              </div>)}
              <button type="button" className="button-secondary" onClick={onAddQuestion}><Plus size={15} /> Add a question</button>
            </div>
          </section>
          <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row"><button className="button-quiet" onClick={() => onNavigate('profile')}><ArrowLeft size={16} /> Back to profile</button><button className="button-primary" onClick={() => onNavigate('review')}>Open answer review <ArrowRight size={16} /></button></div>
        </div>
        <div className="space-y-5">
          <div className="panel p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink"><MapPin size={16} className="text-teal" /> Application snapshot</div>
            <div className="space-y-3 border-t border-[#edf0f3] pt-4 text-xs"><div><p className="text-[#9aa3b1]">Company</p><p className="mt-1 font-semibold text-ink">{application.company || 'Not added yet'}</p></div><div><p className="text-[#9aa3b1]">Role</p><p className="mt-1 font-semibold text-ink">{application.role || 'Not added yet'}</p></div><div><p className="text-[#9aa3b1]">Location / term</p><p className="mt-1 font-semibold text-ink">{application.location || 'Not added yet'}</p></div></div>
          </div>
          <div className="rounded-2xl border border-[#eee9da] bg-[#fffdf7] p-5"><div className="flex items-center gap-2 text-sm font-semibold text-[#65573a]"><CircleHelp size={16} /> A note about drafts</div><p className="mt-2 text-xs leading-5 text-[#877b61]">Pasting a prompt does not produce an answer. The review screen is a space for you to write, revise, and verify your own responses.</p></div>
          <div className="panel p-5"><div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink"><ListChecks size={16} className="text-[#887cad]" /> Before you write</div><ul className="space-y-2.5 text-xs leading-5 text-muted"><li className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-teal" /> Note the requirements that match your actual experience.</li><li className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-teal" /> Keep the original application wording nearby.</li><li className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-teal" /> Leave questions blank until you have a truthful example.</li></ul></div>
        </div>
      </div>
    </>
  )
}

function ReviewScreen({ profile, application, onQuestion, reviewedCount, onNavigate, questionUi, onGenerate, onCopy }) {
  const questions = application.questions
  const projects = profile.projects.filter((project) => project.name || project.details || project.achievement)
  const experience = profile.experience.filter((item) => item.role || item.employer || item.details)
  const skills = profile.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
  return (
    <>
      <div className="mb-6 rounded-2xl border border-[#dcebe7] bg-[#f1f8f5] p-4 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-5">
        <div className="flex gap-3"><div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-teal shadow-sm"><ShieldCheck size={17} /></div><div><p className="text-xs font-semibold text-[#285d53]">Fact-bound AI drafts</p><p className="mt-1 max-w-2xl text-xs leading-5 text-[#628078]">The model selects facts from your profile; the server inserts those exact saved details. If something important is missing, you’ll get a follow-up question instead.</p></div></div>
        <div className="ml-11 mt-3 w-fit rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#4d736a] sm:ml-0 sm:mt-0">{reviewedCount} of {questions.length} marked reviewed</div>
      </div>
      <SectionHeading eyebrow="Review answer" title="Write one clear answer at a time." description={`Your application for ${application.role || 'this role'} at ${application.company || 'this company'}. Generated drafts stay editable, with their exact profile facts listed below.`} />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(275px,0.72fr)]">
        <div className="space-y-4">
          {questions.length === 0 && <div className="panel p-8 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0f4f4] text-teal"><AlignLeft size={19} /></div><h3 className="mt-4 text-sm font-semibold text-ink">No questions yet</h3><p className="mt-2 text-xs leading-5 text-muted">Add the application questions to create a review space for each one.</p><button className="button-primary mx-auto mt-5" onClick={() => onNavigate('application')}>Add questions <ArrowRight size={15} /></button></div>}
          {questions.map((question, index) => {
            const ui = questionUi[question.id] || {}
            const answer = question.answer || ''
            const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0
            return <section key={question.id} className="panel p-5 sm:p-7">
              <div className="mb-5 flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal">Question {index + 1}</span><button type="button" onClick={() => onQuestion(question.id, 'reviewed', !question.reviewed)} className={cx('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors', question.reviewed ? 'border-[#cee6dc] bg-[#eef8f3] text-[#32735f]' : 'border-[#e5e9ed] bg-white text-[#788292] hover:border-[#9ccabe] hover:text-teal')}><Check size={13} /> {question.reviewed ? 'Reviewed' : 'Mark reviewed'}</button></div>
              <TextAreaField label="Application prompt" value={question.prompt} onChange={(event) => onQuestion(question.id, 'prompt', event.target.value)} placeholder="Paste the original question…" className="question-prompt" />
              {question.followUp && <div className="mt-4 rounded-xl border border-[#eee5cf] bg-[#fffdf7] p-4"><p className="text-xs font-semibold text-[#65573a]">A detail is missing</p><p className="mt-1.5 text-sm leading-6 text-[#76694f]">{question.followUp}</p><div className="mt-3"><TextAreaField label="Your detail" hint="Write only what is true. This will be saved with your draft in this browser." value={question.followUpAnswer || ''} onChange={(event) => onQuestion(question.id, 'followUpAnswer', event.target.value)} placeholder="Add your own context…" /></div></div>}
              <div className="mt-5"><TextAreaField label="Your editable draft response" hint="The initial draft uses exact facts selected from your profile. Review it carefully; any edits you make may add new claims." value={answer} onChange={(event) => onQuestion(question.id, 'answer', event.target.value)} placeholder="Generate a draft or write your own answer here…" className="answer-field" /></div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#9aa3b1]"><span>Editable draft · verify before using</span><span>{wordCount} {wordCount === 1 ? 'word' : 'words'} · {answer.length} characters</span></div>
              {question.evidence?.length > 0 && <div className="mt-4 rounded-xl border border-[#dcebe7] bg-[#f7fbf9] p-4"><p className="mb-2 text-xs font-semibold text-[#285d53]">Exact profile facts used when generated</p><ul className="space-y-2">{question.evidence.map((fact) => <li key={fact.id} className="text-xs leading-5 text-[#526f68]"><span className="font-semibold">{fact.label}:</span> {fact.value}</li>)}</ul><p className="mt-3 text-[10px] leading-4 text-[#7c938d]">These citations match the generated version. Check any additional claims you add while editing.</p></div>}
              {ui.error && <p role="alert" className="mt-4 rounded-lg border border-[#f0d5d2] bg-[#fff7f6] px-3 py-2.5 text-xs leading-5 text-[#a34d46]">{ui.error}</p>}
              <div className="mt-5 flex flex-col gap-2 border-t border-[#edf0f3] pt-4 sm:flex-row sm:flex-wrap sm:items-center">
                <button type="button" className="button-primary" onClick={() => onGenerate(question)} disabled={ui.loading} aria-live="polite">{ui.loading ? <LoaderCircle size={15} className="animate-spin" /> : <Sparkles size={15} />}{ui.loading ? 'Generating…' : question.answer ? 'Generate again' : 'Generate answer'}</button>
                <button type="button" className="button-secondary" onClick={() => onCopy(question)} disabled={!answer.trim()}>{ui.copied ? <Check size={15} /> : <Copy size={15} />}{ui.copied ? 'Copied' : 'Copy answer'}</button>
                {ui.loading && <span className="text-xs text-muted" role="status">Matching your question to saved profile facts…</span>}
              </div>
            </section>
          })}
          <div className="flex flex-col-reverse justify-between gap-3 pt-1 sm:flex-row"><button className="button-quiet" onClick={() => onNavigate('application')}><ArrowLeft size={16} /> Edit application details</button><button className="button-primary" onClick={() => onNavigate('checklist')}>Go to submission checklist <ArrowRight size={16} /></button></div>
        </div>
        <aside className="space-y-5 xl:sticky xl:top-[88px]">
          <div className="panel p-5">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink"><Award size={16} className="text-[#bb7b35]" /> Profile facts available</div>
            <p className="mb-4 text-xs leading-5 text-muted">These are the only saved facts the AI selector can use. Add details on your profile before generating if something is missing.</p>
            <div className="space-y-3">
              {experience.map((item) => <div key={item.id} className="rounded-xl border border-[#edf0f3] bg-[#fbfcfd] p-3"><p className="text-xs font-semibold text-ink">{[item.role, item.employer].filter(Boolean).join(' · ')}</p>{item.dates && <p className="mt-1 text-[10px] text-teal">{item.dates}</p>}{item.details && <p className="mt-1.5 text-[11px] leading-5 text-muted">{item.details}</p>}{item.achievement && <p className="mt-1.5 text-[11px] leading-5 text-muted">{item.achievement}</p>}</div>)}
              {projects.map((project) => <div key={project.id} className="rounded-xl border border-[#edf0f3] bg-[#fbfcfd] p-3"><p className="text-xs font-semibold text-ink">{project.name || 'Untitled project'}</p>{project.details && <p className="mt-1.5 text-[11px] leading-5 text-muted">{project.details}</p>}{project.achievement && <p className="mt-1.5 text-[11px] leading-5 text-muted">{project.achievement}</p>}{project.tools && <p className="mt-2 text-[10px] font-semibold text-teal">{project.tools}</p>}</div>)}
              {experience.length === 0 && projects.length === 0 && <p className="rounded-xl bg-[#f7f8fa] p-3 text-xs leading-5 text-muted">No work facts are available yet. Add a project or experience before generating an answer.</p>}
            </div>
            <button className="mt-4 text-xs font-semibold text-teal hover:text-[#0a5d57]" onClick={() => onNavigate('profile')}>Edit profile details <ArrowRight size={13} className="ml-1 inline" /></button>
          </div>
          <div className="panel p-5"><div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink"><GraduationCap size={16} className="text-[#7168a8]" /> Skills on your profile</div><div className="flex flex-wrap gap-2">{skills.length ? skills.map((skill) => <span key={skill} className="rounded-full border border-[#e6e9ed] bg-[#fafbfc] px-2.5 py-1 text-[11px] font-medium text-[#626d7b]">{skill}</span>) : <span className="text-xs text-muted">No skills added yet.</span>}</div></div>
          <div className="rounded-2xl border border-[#eee9da] bg-[#fffdf7] p-5"><div className="flex items-center gap-2 text-sm font-semibold text-[#65573a]"><CircleHelp size={16} /> Quick self-check</div><ul className="mt-3 space-y-2.5 text-xs leading-5 text-[#877b61]"><li>Can you explain every claim?</li><li>Does each example describe your contribution?</li><li>Are numbers and dates accurate?</li><li>Does the response answer the prompt directly?</li></ul></div>
        </aside>
      </div>
    </>
  )
}

function ChecklistScreen({ application, checklist, onChecklist, checklistDone, onNavigate }) {
  const allDone = checklistDone === checklistLabels.length
  return (
    <>
      <SectionHeading eyebrow="Submission checklist" title="Give it one last thoughtful read." description="Check off each item as you complete it. These reminders do not submit anything for you." action={<div className="flex items-center gap-2 rounded-full border border-[#e4e8ed] bg-white px-3 py-2 text-xs font-semibold text-muted shadow-sm"><CheckCircle2 size={15} className="text-teal" /> {checklistDone}/{checklistLabels.length} complete</div>} />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
        <section className="panel p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3 border-b border-[#edf0f3] pb-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f4f1] text-teal"><ClipboardCheck size={18} /></div><div><h3 className="text-sm font-semibold text-ink">Before you submit</h3><p className="mt-1 text-xs text-muted">Your checklist is saved automatically on this device.</p></div></div>
          <div className="space-y-2.5">
            {checklistLabels.map(([label, description], index) => <button key={label} type="button" onClick={() => onChecklist(checklist.map((value, i) => i === index ? !value : value))} className={cx('flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all', checklist[index] ? 'border-[#cfe6dc] bg-[#f3faf6]' : 'border-[#edf0f3] bg-white hover:border-[#c6d8d3] hover:bg-[#fcfefd]')} aria-pressed={Boolean(checklist[index])}>
              <span className={cx('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors', checklist[index] ? 'border-teal bg-teal text-white' : 'border-[#cfd5dc] bg-white text-transparent')}><Check size={13} strokeWidth={3} /></span>
              <span className="min-w-0 flex-1"><span className={cx('block text-sm font-semibold', checklist[index] ? 'text-[#39705f]' : 'text-ink')}>{label}</span><span className="mt-1 block text-xs leading-5 text-muted">{description}</span></span>
            </button>)}
          </div>
          <div className="mt-6 flex flex-col-reverse justify-between gap-3 border-t border-[#edf0f3] pt-5 sm:flex-row"><button className="button-quiet" onClick={() => onNavigate('review')}><ArrowLeft size={16} /> Back to answers</button><button type="button" onClick={() => onChecklist(checklist.map(() => false))} className="button-quiet text-muted"><Trash2 size={15} /> Clear checks</button></div>
        </section>
        <div className="space-y-5">
          <div className="panel p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink"><BriefcaseBusiness size={16} className="text-teal" /> Application summary</div>
            <div className="rounded-xl bg-[#f7f8fa] p-4"><p className="text-xs font-semibold text-ink">{application.role || 'Role not named'}</p><p className="mt-1 text-xs text-muted">{application.company || 'Company not named'}</p>{application.location && <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted"><MapPin size={12} /> {application.location}</p>}</div>
            <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl border border-[#edf0f3] p-3"><p className="text-[11px] text-muted">Questions</p><p className="mt-1 text-lg font-semibold text-ink">{application.questions.filter((q) => q.prompt.trim()).length}</p></div><div className="rounded-xl border border-[#edf0f3] p-3"><p className="text-[11px] text-muted">Reviewed</p><p className="mt-1 text-lg font-semibold text-ink">{application.questions.filter((q) => q.reviewed).length}</p></div></div>
          </div>
          <div className={cx('rounded-2xl border p-5 transition-colors', allDone ? 'border-[#cfe6dc] bg-[#f2faf6]' : 'border-[#eee9da] bg-[#fffdf7]')}>
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">{allDone ? <CheckCircle2 size={17} className="text-teal" /> : <CircleHelp size={17} className="text-[#9f8752]" />}{allDone ? 'Ready for your final review' : 'Your next step'}</div>
            <p className="mt-2 text-xs leading-5 text-muted">{allDone ? 'All checklist items are checked. Review the live application form once more, then submit it yourself.' : `Complete ${checklistLabels.length - checklistDone} more ${checklistLabels.length - checklistDone === 1 ? 'item' : 'items'} when you are ready. Nothing is sent from this workspace.`}</p>
            <button className="button-secondary mt-4 w-full justify-center" onClick={() => onNavigate('review')}><AlignLeft size={15} /> Review your answers</button>
          </div>
          <div className="flex gap-3 rounded-2xl border border-[#e8ebef] bg-white p-4"><div className="mt-0.5 text-teal"><ShieldCheck size={17} /></div><p className="text-[11px] leading-5 text-muted">Your application is not submitted by ApplyReady. Use the employer's application page to complete and send it.</p></div>
        </div>
      </div>
    </>
  )
}

export default App
