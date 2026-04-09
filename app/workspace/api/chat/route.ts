import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic()

export const dynamic = 'force-dynamic'

const METHODOLOGY = `
# Finance Program Fit Methodology

## The Three Pillars

### 1. Education Fit
Academic background, credential alignment, and program prerequisites.
Scoring 1–5. Evidence: transcripts, GPA, degree relevance.

### 2. Industry Experience
Professional and practical experience — depth, recency, relevance.
Scoring 1–5. Part-time roles normalized to 60% weight. Volunteer work discounted to 50% unless clinical/supervised. Research counts as industry experience for STEM.

### 3. Statement of Purpose
Motivation clarity, career goal alignment, commitment signals.
Scoring 1–5. Probe for specific incidents — discount generic rehearsed answers.

## Program Weights and Thresholds

### Graduate Certificates
Education Fit 40% (passing ≥ 3.0) · Industry Experience 25% (passing ≥ 2.5) · SOP 35% (passing ≥ 3.2)
Overall passing: 3.2/5.0 · Duration: 40–50 min
Profile: mid-career professionals seeking credentials, often career-pivoting.

### STEM
Education Fit 35% (passing ≥ 3.2) · Industry Experience 30% (passing ≥ 3.0) · SOP 35% (passing ≥ 3.5)
Overall passing: 3.5/5.0 · Duration: 50–60 min
Profile: technical/research-oriented applicants. Self-taught skills count if verifiable.

### Healthcare / Trades / Diploma
Education Fit 30% (passing ≥ 3.0) · Industry Experience 40% (passing ≥ 3.5) · SOP 30% (passing ≥ 3.0)
Overall passing: 3.4/5.0 · Duration: 45–55 min
Profile: vocational applicants. Practical hours are the primary differentiator.

## Integrity Rules (all programs)
- Unverifiable Data — Hard Stop: stop advancement until docs provided
- Part-Time Normalization: roles <20 hrs/week scored at 60% weight
- Volunteer Discounting: unpaid roles at 50% unless clinical/supervised
- NA Fallback: non-standard backgrounds scored on SOP + interview only

## Scoring Scale
1 = Insufficient · 2 = Weak · 3 = Adequate · 4 = Strong · 5 = Exceptional
`

const SYSTEM_PROMPT = `You are Design Brain, an internal assessment design copilot for Passage Assessment used by the Finance team.

Your job: help Finance reviewers design, generate, and refine interview assessments for program applicants using the Finance Program Fit Methodology.

You can:
- Generate full assessment drafts for a given program category (questions, scoring, integrity checks, next steps)
- Suggest behaviorally-anchored questions per pillar
- Define 1/3/5 scoring rubrics with observable behavioral anchors
- Identify integrity risks and anti-gaming checks specific to the program
- Refine and improve existing drafts based on feedback

Finance Program Fit Methodology you must follow:
${METHODOLOGY}

Tone: direct, practical, collegial — internal tool. Not a compliance officer, not a generic chatbot.

Format rules:
- Use **bold** for pillar names, scores, key terms
- Use numbered or bulleted lists for questions, anchors, steps
- Be dense and specific — no filler
- When generating a full draft, structure by section: Questions by pillar, then Scoring, then Integrity, then Next Steps
- For questions: always include the question, the assessment intent, and a follow-up probe
- For scoring: write clear observable behavioral anchors for 1, 3, and 5
- For integrity: include the rule, the trigger signal, and the recommended action`

export async function POST(req: NextRequest) {
  const { messages, programLabel } = await req.json() as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
    programLabel: string
  }

  // Build full conversation history for multi-turn context
  const apiMessages: Anthropic.MessageParam[] = messages.map(m => ({
    role: m.role,
    content: m.content,
  }))

  // Prepend program context to the latest user message
  if (apiMessages.length > 0 && apiMessages[apiMessages.length - 1].role === 'user') {
    const last = apiMessages[apiMessages.length - 1]
    apiMessages[apiMessages.length - 1] = {
      ...last,
      content: `[Program: ${programLabel}]\n\n${last.content}`,
    }
  }

  const stream = await client.messages.stream({
    model: 'claude-opus-4-5',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: apiMessages,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
