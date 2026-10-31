export class GenerationError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.name = 'GenerationError'
    this.statusCode = statusCode
  }
}

function safeId(value) {
  return encodeURIComponent(String(value || 'missing'))
}

function addFact(facts, { id, sourceId, category, label, value }) {
  if (typeof value !== 'string' || !value.trim()) return
  facts.push({ id, sourceId, category, label, value: value.trim() })
}

export function buildProfileFacts(profile = {}, followUpAnswer = '') {
  const facts = []

  String(profile.skills || '')
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean)
    .forEach((skill, index) => addFact(facts, {
      id: `skill:${index}`,
      sourceId: `skill:${index}`,
      category: 'skill',
      label: 'Skill',
      value: skill,
    }))

  for (const education of Array.isArray(profile.education) ? profile.education : []) {
    const sourceId = `education:${safeId(education.id)}`
    addFact(facts, { id: `${sourceId}:school`, sourceId, category: 'education', label: 'School', value: education.school })
    addFact(facts, { id: `${sourceId}:degree`, sourceId, category: 'education', label: 'Degree or area of study', value: education.degree })
    addFact(facts, { id: `${sourceId}:dates`, sourceId, category: 'education', label: 'Education dates', value: education.dates })
  }

  for (const project of Array.isArray(profile.projects) ? profile.projects : []) {
    const sourceId = `project:${safeId(project.id)}`
    addFact(facts, { id: `${sourceId}:name`, sourceId, category: 'project', label: 'Project', value: project.name })
    addFact(facts, { id: `${sourceId}:details`, sourceId, category: 'project', label: 'Project contribution', value: project.details })
    addFact(facts, { id: `${sourceId}:achievement`, sourceId, category: 'achievement', label: 'Project achievement or outcome', value: project.achievement })
    addFact(facts, { id: `${sourceId}:tools`, sourceId, category: 'skill', label: 'Project tools or skills', value: project.tools })
  }

  for (const item of Array.isArray(profile.experience) ? profile.experience : []) {
    const sourceId = `experience:${safeId(item.id)}`
    addFact(facts, { id: `${sourceId}:role`, sourceId, category: 'employment', label: 'Role', value: item.role })
    addFact(facts, { id: `${sourceId}:employer`, sourceId, category: 'employment', label: 'Employer or organization', value: item.employer })
    addFact(facts, { id: `${sourceId}:dates`, sourceId, category: 'employment', label: 'Employment dates', value: item.dates })
    addFact(facts, { id: `${sourceId}:details`, sourceId, category: 'employment', label: 'Responsibilities', value: item.details })
    addFact(facts, { id: `${sourceId}:achievement`, sourceId, category: 'achievement', label: 'Employment achievement or outcome', value: item.achievement })
  }

  addFact(facts, {
    id: 'follow-up:answer',
    sourceId: 'follow-up:answer',
    category: 'follow_up',
    label: 'Your follow-up detail',
    value: followUpAnswer,
  })

  return facts
}

function preflightFollowUp(question, facts) {
  const lower = question.toLowerCase()
  const hasFollowUp = facts.some((fact) => fact.category === 'follow_up')
  const hasProject = facts.some((fact) => fact.category === 'project' && fact.label === 'Project contribution')
  const hasEmployment = facts.some((fact) => fact.category === 'employment' && fact.label === 'Responsibilities')
  const hasSkills = facts.some((fact) => fact.category === 'skill')

  if (/\b(why|what attracts|what draws|interest(?:ed)? in|motiv(?:ation|ated)|what excites)\b/.test(lower) && !hasFollowUp) {
    return 'What specifically draws you to this role or organization? Share a detail in your own words so the answer can use your actual motivation.'
  }
  if (/\b(employment|employer|professional experience|work experience|previous job|past job)\b/.test(lower) && !hasEmployment && !hasFollowUp) {
    return 'Which role and employer should this answer refer to, and what did you personally do there? Add only details you can verify.'
  }
  if (/\b(project|built|created|made)\b/.test(lower) && !hasProject && !hasFollowUp) {
    return 'Which project should we use? Share its name and your specific contribution.'
  }
  if (/\b(skill|strength|tool|technology|technical ability)\b/.test(lower) && !hasSkills && !hasFollowUp) {
    return 'Which skills or tools do you want to support with a real example? Add them to your profile or describe them here.'
  }
  if (facts.length === 0) {
    return 'Add at least one skill, project, or work experience to your profile, or share a supporting detail here.'
  }
  return ''
}

function selectFacts(selection, facts) {
  if (!selection || !Array.isArray(selection.selectedFactIds)) {
    throw new GenerationError('The AI returned an invalid fact selection. Try again.', 502)
  }
  if (selection.status === 'needs_info') {
    const followUp = typeof selection.followUp === 'string' ? selection.followUp.trim() : ''
    if (!followUp) throw new GenerationError('The AI could not identify the missing detail. Try again.', 502)
    return { status: 'needs_info', followUp }
  }
  if (selection.status !== 'ready' || selection.selectedFactIds.length === 0 || selection.selectedFactIds.length > 8) {
    throw new GenerationError('The AI could not find enough supported profile facts. Add more detail or answer the follow-up question.', 422)
  }

  const byId = new Map(facts.map((fact) => [fact.id, fact]))
  const uniqueIds = [...new Set(selection.selectedFactIds)]
  const selected = uniqueIds.map((id) => byId.get(id))
  if (selected.some((fact) => !fact)) {
    throw new GenerationError('The AI selected a fact that is not in your profile. Try again.', 502)
  }
  return { status: 'ready', selected }
}

function requireFact(selected, sourceId, suffix) {
  const fact = selected.find((item) => item.sourceId === sourceId && item.id.endsWith(`:${suffix}`))
  if (!fact) throw new GenerationError('The selected facts are incomplete. Add more profile detail and try again.', 422)
  return fact.value
}

function composeAnswer(selected) {
  const followUp = selected.find((fact) => fact.category === 'follow_up')
  const sourceGroups = [...new Set(selected.filter((fact) => fact.category !== 'skill' && fact.category !== 'achievement').map((fact) => fact.sourceId))]
  const projectGroups = sourceGroups.filter((id) => id.startsWith('project:'))
  const employmentGroups = sourceGroups.filter((id) => id.startsWith('experience:'))
  const educationGroups = sourceGroups.filter((id) => id.startsWith('education:'))
  const skillFacts = selected.filter((fact) => fact.category === 'skill')
  const achievements = selected.filter((fact) => fact.category === 'achievement')

  if (followUp) return `My response: ${followUp.value}`

  if (projectGroups.length) {
    if (projectGroups.length > 1 || employmentGroups.length || educationGroups.length) {
      throw new GenerationError('The AI selected facts from conflicting experiences. Try again.', 502)
    }
    const sourceId = projectGroups[0]
    const name = requireFact(selected, sourceId, 'name')
    const details = requireFact(selected, sourceId, 'details')
    const achievement = achievements.find((fact) => fact.sourceId === sourceId)?.value
    const tools = skillFacts.find((fact) => fact.sourceId === sourceId)?.value
    const lines = [`A relevant project is ${name}. ${details}`]
    if (achievement) lines.push(achievement)
    if (tools) lines.push(`Tools and skills I used: ${tools}.`)
    return lines.join(' ')
  }

  if (employmentGroups.length) {
    if (employmentGroups.length > 1 || educationGroups.length) {
      throw new GenerationError('The AI selected facts from conflicting experiences. Try again.', 502)
    }
    const sourceId = employmentGroups[0]
    const role = requireFact(selected, sourceId, 'role')
    const employer = requireFact(selected, sourceId, 'employer')
    const details = requireFact(selected, sourceId, 'details')
    const dates = selected.find((fact) => fact.sourceId === sourceId && fact.id.endsWith(':dates'))?.value
    const achievement = achievements.find((fact) => fact.sourceId === sourceId)?.value
    const lines = [`In my role as ${role} at ${employer}${dates ? ` (${dates})` : ''}, ${details}`]
    if (achievement) lines.push(achievement)
    return lines.join(' ')
  }

  if (educationGroups.length) {
    if (educationGroups.length > 1) throw new GenerationError('The AI selected multiple education records. Try again.', 502)
    const sourceId = educationGroups[0]
    const degree = requireFact(selected, sourceId, 'degree')
    const school = requireFact(selected, sourceId, 'school')
    const dates = selected.find((fact) => fact.sourceId === sourceId && fact.id.endsWith(':dates'))?.value
    return `I am studying ${degree} at ${school}${dates ? ` (${dates})` : ''}.`
  }

  if (skillFacts.length) {
    const skills = [...new Set(skillFacts.map((fact) => fact.value))]
    return `Relevant skills in my profile include ${skills.join(', ')}.`
  }

  throw new GenerationError('The AI did not select enough profile facts for an answer. Try again.', 422)
}

export async function generateDraft(input, selectWithAi) {
  const question = String(input.question || '').trim()
  const jobDescription = String(input.jobDescription || '').trim()
  if (!question || !jobDescription) throw new GenerationError('Add both the application question and job description first.', 400)

  const facts = buildProfileFacts(input.profile || {}, String(input.followUpAnswer || '').trim())
  const preflight = preflightFollowUp(question, facts)
  if (preflight) return { status: 'needs_info', followUp: preflight }

  const selection = await selectWithAi({
    question,
    jobDescription,
    facts: facts.map(({ id, label, value, category, sourceId }) => ({ id, label, value, category, sourceId })),
  })
  const result = selectFacts(selection, facts)
  if (result.status === 'needs_info') return result

  return {
    status: 'ready',
    answer: composeAnswer(result.selected),
    evidence: result.selected.map(({ id, label, value, category }) => ({ id, label, value, category })),
  }
}
