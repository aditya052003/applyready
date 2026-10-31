import express from 'express'
import { generateDraft, GenerationError } from './grounding.js'
import { selectFactsWithMeta } from './meta.js'

export function createApp({ selectFacts = selectFactsWithMeta } = {}) {
  const app = express()
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_request, response) => {
    response.json({
      ok: true,
      provider: process.env.AI_PROVIDER || 'meta',
      configured: Boolean(process.env.MODEL_API_KEY),
    })
  })

  app.post('/api/generate', async (request, response) => {
    const body = request.body || {}
    const question = typeof body.question === 'string' ? body.question : ''
    const jobDescription = typeof body.jobDescription === 'string' ? body.jobDescription : ''
    const followUpAnswer = typeof body.followUpAnswer === 'string' ? body.followUpAnswer : ''

    if (question.length > 3000 || jobDescription.length > 25000 || followUpAnswer.length > 3000) {
      return response.status(413).json({ error: 'This request is too long. Shorten the question, job description, or follow-up detail.' })
    }

    try {
      const result = await generateDraft({
        profile: body.profile && typeof body.profile === 'object' ? body.profile : {},
        question,
        jobDescription,
        followUpAnswer,
      }, selectFacts)
      return response.json(result)
    } catch (error) {
      const status = error instanceof GenerationError ? error.statusCode : 500
      const message = error instanceof GenerationError ? error.message : 'The answer could not be generated. Check the server logs and try again.'
      if (status >= 500) console.error(`[api] generation error (${status})`)
      return response.status(status).json({ error: message })
    }
  })

  app.use((error, _request, response, _next) => {
    if (error?.type === 'entity.too.large') {
      return response.status(413).json({ error: 'This request is too large. Shorten the job description and try again.' })
    }
    console.error('[api] request error')
    return response.status(400).json({ error: 'The server could not read this request.' })
  })

  return app
}
