import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { createApp } from '../server/app.js'
import { generateDraft, GenerationError } from '../server/grounding.js'
import { selectFactsWithMeta } from '../server/meta.js'

const profile = {
  name: 'Not sent to the model',
  email: 'private@example.test',
  skills: 'Research, React',
  education: [{ id: 'edu-1', school: 'North College', degree: 'Computer Science', dates: '2023–2027' }],
  experience: [],
  projects: [{
    id: 'project-1',
    name: 'Campus Compass',
    details: 'Built a student event discovery app with a team of 3. Ran 8 user interviews.',
    achievement: 'Improved event sign-up completion by 24%.',
    tools: 'React, Node.js',
  }],
}

const input = {
  profile,
  question: 'Tell us about a project that is relevant to this role.',
  jobDescription: 'Seeking an intern with product research and web application experience.',
}

afterEach(() => {
  delete process.env.AI_API_KEY
  delete process.env.MODEL_API_KEY
  delete process.env.AI_PROVIDER
  delete process.env.AI_MODEL
})

describe('fact-grounded answer generation', () => {
  it('assembles an editable answer from exact project facts and returns citations', async () => {
    const result = await generateDraft(input, async ({ facts }) => ({
      status: 'ready',
      selectedFactIds: facts.filter((fact) => fact.sourceId === 'project:project-1').map((fact) => fact.id),
      followUp: '',
    }))

    assert.equal(result.status, 'ready')
    assert.match(result.answer, /Campus Compass/)
    assert.match(result.answer, /Built a student event discovery app with a team of 3\. Ran 8 user interviews\./)
    assert.match(result.answer, /Improved event sign-up completion by 24%\./)
    assert.deepEqual(result.evidence.map((fact) => fact.value), [
      'Campus Compass',
      'Built a student event discovery app with a team of 3. Ran 8 user interviews.',
      'Improved event sign-up completion by 24%.',
      'React, Node.js',
    ])
    assert.doesNotMatch(JSON.stringify(result), /private@example\.test|Not sent to the model/)
  })

  it('asks for motivation before calling the provider when the profile has no such fact', async () => {
    let called = false
    const result = await generateDraft({
      ...input,
      question: 'Why are you interested in this company?',
    }, async () => { called = true })

    assert.equal(result.status, 'needs_info')
    assert.match(result.followUp, /draws you to this role or organization/i)
    assert.equal(called, false)
  })

  it('uses a user-provided follow-up verbatim as the supporting detail', async () => {
    const response = 'I am interested because the team works on accessible public transit tools.'
    const result = await generateDraft({
      ...input,
      question: 'Why are you interested in this company?',
      followUpAnswer: response,
    }, async ({ facts }) => ({
      status: 'ready',
      selectedFactIds: facts.filter((fact) => fact.category === 'follow_up').map((fact) => fact.id),
      followUp: '',
    }))

    assert.equal(result.status, 'ready')
    assert.equal(result.answer, `My response: ${response}`)
    assert.equal(result.evidence[0].value, response)
  })

  it('rejects model selections that are not in the saved profile', async () => {
    await assert.rejects(
      generateDraft(input, async () => ({ status: 'ready', selectedFactIds: ['achievement:made-up-number'], followUp: '' })),
      (error) => error instanceof GenerationError && error.statusCode === 502,
    )
  })

  it('uses Meta Responses structured output and a configurable model', async () => {
    process.env.AI_PROVIDER = 'meta'
    process.env.MODEL_API_KEY = 'test-meta-key'
    process.env.AI_MODEL = 'muse-wonder-1.0'
    let requestUrl
    let requestOptions
    const resultJson = { status: 'ready', selectedFactIds: ['project:project-1:name'], followUp: '' }

    const result = await selectFactsWithMeta({
      question: input.question,
      jobDescription: input.jobDescription,
      facts: [{ id: 'project:project-1:name', label: 'Project', value: 'Campus Compass' }],
    }, async (url, options) => {
      requestUrl = url
      requestOptions = options
      return {
        ok: true,
        json: async () => ({ output: [{ content: [{ type: 'output_text', text: JSON.stringify(resultJson) }] }] }),
      }
    })

    const requestBody = JSON.parse(requestOptions.body)
    assert.equal(requestUrl, 'https://api.meta.ai/v1/responses')
    assert.equal(requestOptions.headers.Authorization, 'Bearer test-meta-key')
    assert.equal(requestBody.model, 'muse-wonder-1.0')
    assert.equal(requestBody.text.format.type, 'json_schema')
    assert.equal(requestBody.text.format.strict, true)
    assert.deepEqual(requestBody.text.format.schema.required, ['status', 'selectedFactIds', 'followUp'])
    assert.equal(requestBody.text.format.schema.additionalProperties, false)
    assert.deepEqual(result, resultJson)
  })

  it('reports missing Meta configuration without making a network request', async () => {
    process.env.AI_PROVIDER = 'meta'
    delete process.env.MODEL_API_KEY
    await assert.rejects(
      selectFactsWithMeta({ question: input.question, jobDescription: input.jobDescription, facts: [] }),
      (error) => error instanceof GenerationError && error.statusCode === 503 && /MODEL_API_KEY/.test(error.message),
    )
  })

  it('serves the full generation flow through the Express API using a mock selector', async (context) => {
    const server = createApp({
      selectFacts: async ({ facts }) => ({
        status: 'ready',
        selectedFactIds: facts.filter((fact) => fact.sourceId === 'project:project-1').map((fact) => fact.id),
        followUp: '',
      }),
    }).listen(0, '127.0.0.1')
    context.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())))
    await new Promise((resolve, reject) => {
      server.once('listening', resolve)
      server.once('error', reject)
    })

    const address = server.address()
    const response = await fetch(`http://127.0.0.1:${address.port}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.status, 'ready')
    assert.match(body.answer, /24%/)
    assert.equal(body.evidence.length, 4)
  })
})
