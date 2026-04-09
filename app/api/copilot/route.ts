import { NextRequest, NextResponse } from 'next/server'

const MODELS = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash']

type Mode = 'generate_questions' | 'rubric' | 'intro' | 'improve_block' | 'harder_to_game' | 'variant' | 'chat' | 'suggest_description' | 'generate_full'

function buildSystemPrompt(mode: Mode, program: string, existingBlockTitles: string[]): string {
  const prog = program || 'this program'
  const existingCtx = existingBlockTitles.length > 0
    ? `Current blocks already on canvas (avoid duplicating these dimensions):\n${existingBlockTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
    : 'Canvas is empty — no blocks yet.'

  if (mode === 'generate_questions') {
    return `You are an expert assessment designer creating screening content for: ${prog}.

${existingCtx}

Return ONLY a JSON object — no markdown, no code fences, no extra text. Use this exact schema:
{
  "type": "questions",
  "suggestions": [
    {
      "title": "Short 3-6 word label for this question",
      "prompt": "The exact question text the applicant will see. Make it specific to ${prog}.",
      "whyItFits": "One sentence: why this question fits ${prog} and what skill/trait it reveals.",
      "measures": ["Tag1", "Tag2", "Tag3"],
      "blockType": "video" | "multiple-choice" | "open-text" | "scenario" | "case-study",
      "difficulty": "Easy" | "Moderate" | "Challenging",
      "scoringNote": "What a strong answer should include or demonstrate."
    }
  ]
}

Rules:
- Generate exactly 3 suggestions
- Each must be specific to ${prog} — no generic corporate questions
- If existing blocks cover communication, lean toward judgment, integrity, grit, or technical reasoning
- measures must be 2-4 tags from: Communication, Judgment, Empathy, Professionalism, Critical Thinking, Technical Reasoning, Integrity, Grit, Adaptability, Collaboration, Ethics, Problem Solving
- blockType must match the nature of the question (video for behavioral, MC for knowledge, scenario for situational)
- Questions must sound like real admissions or workplace screening items`
  }

  if (mode === 'rubric') {
    return `You are an expert assessment designer creating a scoring rubric for: ${prog}.

${existingCtx}

Return ONLY a JSON object:
{
  "type": "rubric",
  "dimensions": [
    {
      "name": "Dimension name (e.g. Communication, Judgment)",
      "weight": 25,
      "strong": "What a strong fit looks like for ${prog}",
      "neutral": "What a neutral/average fit looks like",
      "weak": "What a weak fit looks like",
      "watchFor": "Red flags or patterns to watch for"
    }
  ]
}

Generate 3-4 dimensions that are specific to ${prog}. Weights should sum to 100.`
  }

  if (mode === 'intro') {
    return `You are writing a professional intro block for a candidate assessment for: ${prog}.

${existingCtx}

Return ONLY a JSON object:
{
  "type": "intro",
  "text": "The intro text the candidate will see. Should be 2-3 sentences: what the assessment is for, what to expect, and any important notes. Tone: professional, clear, welcoming but formal."
}

Make it specific to ${prog}. Do not use generic language.`
  }

  if (mode === 'improve_block') {
    return `You are an expert assessment designer improving existing blocks for: ${prog}.

${existingCtx}

Return ONLY a JSON object:
{
  "type": "improvements",
  "suggestions": [
    {
      "blockRef": "Which block (by title or index)",
      "original": "The original question or content",
      "improved": "Your improved version",
      "whyBetter": "One sentence: why this version is stronger for ${prog}"
    }
  ]
}

If canvas is empty, suggest what blocks would be ideal for ${prog} instead.`
  }

  if (mode === 'harder_to_game') {
    return `You are an expert at making assessment questions harder to fake or game, for: ${prog}.

${existingCtx}

Return ONLY a JSON object:
{
  "type": "questions",
  "suggestions": [
    {
      "title": "Short label",
      "prompt": "A question that is harder to give a rehearsed answer to. Use specific situations, trade-offs, or unexpected angles specific to ${prog}.",
      "whyItFits": "Why this harder-to-game version works for ${prog}",
      "measures": ["Tag1", "Tag2"],
      "blockType": "video" | "scenario" | "open-text",
      "difficulty": "Challenging",
      "scoringNote": "What a genuine vs rehearsed answer looks like"
    }
  ]
}

Generate 3 suggestions. Focus on specificity, trade-offs, and unexpected angles that reward real experience over rehearsed answers.`
  }

  if (mode === 'variant') {
    return `You are creating question variants for: ${prog}.

${existingCtx}

Return ONLY a JSON object:
{
  "type": "questions",
  "suggestions": [
    {
      "title": "Variant [A/B/C]: Short label",
      "prompt": "A variant of an existing question that tests the same dimension differently",
      "whyItFits": "How this variant measures the same trait from a different angle for ${prog}",
      "measures": ["Tag1", "Tag2"],
      "blockType": "video" | "open-text" | "scenario",
      "difficulty": "Easy" | "Moderate" | "Challenging",
      "scoringNote": "What to look for in the answer"
    }
  ]
}

Generate 3 variants.`
  }

  if (mode === 'suggest_description') {
    return `You are creating a short assessment purpose statement for: ${prog}.

Return ONLY a JSON object:
{
  "type": "description_bullets",
  "bullets": [
    { "category": "Technical", "text": "What specific technical, clinical, or domain skills this assessment evaluates — specific to ${prog}, under 15 words" },
    { "category": "Personality", "text": "What personality, behavioral, or soft skill traits to look for in candidates for ${prog}, under 15 words" },
    { "category": "Outcome", "text": "What a strong-fit candidate for ${prog} should clearly demonstrate, under 15 words" }
  ]
}

Make all bullets highly specific to ${prog}. No generic language like "strong communication skills".`
  }

  if (mode === 'generate_full') {
    return `You are building a complete fit assessment for: ${prog}.

${existingCtx}

Return ONLY a JSON object with exactly 4 blocks — an intro, then 3 questions:
{
  "type": "full_assessment",
  "blocks": [
    {
      "type": "intro",
      "cfg": { "text": "Welcome message for ${prog} assessment — 2 sentences, professional, specific to ${prog}" }
    },
    {
      "type": "video" | "scenario" | "open-text",
      "cfg": {
        "question": "A behavioral question specific to ${prog}",
        "maxDuration": 90,
        "attempts": 2,
        "note": "What to look for in a strong answer",
        "title": "(for scenario only) Short title",
        "context": "(for scenario only) Situation context",
        "wordLimit": 400
      }
    }
  ]
}

Rules:
- Block 1: always intro
- Block 2: video — behavioral question about real experience in ${prog}
- Block 3: scenario — situational judgment relevant to ${prog}
- Block 4: open-text — reflective or values-based question for ${prog}
- All questions must be specific to ${prog}, not generic`
  }

  // chat fallback
  return `You are an expert assessment designer helping build a screening assessment for: ${prog}.

${existingCtx}

Answer the user's question concisely. Focus on ${prog}-specific guidance.
Return ONLY a JSON object:
{
  "type": "text",
  "content": "Your response here. Be specific to ${prog}."
}`
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  for (const modelName of MODELS) {
    for (const apiVersion of ['v1', 'v1beta']) {
      const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      })
      const data = await res.json()
      if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text
      }
      // Only retry v1beta if v1 gives 404
      if (res.status !== 404) break
    }
  }
  throw new Error('All models unavailable')
}

// ─── Demo fallback data ───────────────────────────────────────────────────────
function getDemoData(mode: Mode, program: string) {
  const prog = program.toLowerCase()
  const isHealthcare = prog.includes('nurse') || prog.includes('health') || prog.includes('medical') || prog.includes('care')
  const isTech = prog.includes('software') || prog.includes('engineer') || prog.includes('developer') || prog.includes('tech')
  const isBusiness = prog.includes('business') || prog.includes('admin') || prog.includes('management') || prog.includes('account')

  if (mode === 'suggest_description') {
    if (isHealthcare) return { type: 'description_bullets', bullets: [
      { category: 'Technical', text: 'Patient communication, clinical judgment, and safe care prioritization under pressure' },
      { category: 'Personality', text: 'Empathy, resilience, and professional accountability in high-stakes situations' },
      { category: 'Outcome', text: 'Candidates who handle real clinical environments and build patient trust from day one' },
    ]}
    if (isTech) return { type: 'description_bullets', bullets: [
      { category: 'Technical', text: 'Problem-solving, systems thinking, and sound judgment under technical constraints' },
      { category: 'Personality', text: 'Integrity, collaboration, and ownership mindset in team-based engineering environments' },
      { category: 'Outcome', text: 'Candidates who communicate trade-offs clearly and grow with the team' },
    ]}
    return { type: 'description_bullets', bullets: [
      { category: 'Technical', text: 'Analytical reasoning, prioritization, and professional communication in real work contexts' },
      { category: 'Personality', text: 'Adaptability, integrity, and professionalism under genuine workplace pressure' },
      { category: 'Outcome', text: 'Candidates who contribute independently and build stakeholder trust from week one' },
    ]}
  }

  if (mode === 'generate_full') {
    if (isHealthcare) return { type: 'full_assessment', blocks: [
      { type: 'intro', cfg: { text: `Welcome to the ${prog} fit assessment. This evaluation helps us understand how you communicate, make decisions, and handle real patient-care situations. There are no trick questions — answer honestly and thoughtfully.` }},
      { type: 'video', cfg: { question: `Describe a time when you managed a stressful or emotionally difficult situation involving another person. What did you do, and what did you learn?`, maxDuration: 90, attempts: 2, note: 'Look for empathy, composure, and self-awareness.' }},
      { type: 'scenario', cfg: { title: 'Competing Priorities', context: `You have three patients who all need attention: one is in pain, one needs a scheduled medication, and one is showing early signs of deterioration. Your supervisor is unavailable.`, question: 'Walk us through exactly how you prioritize and who you notify first.' }},
      { type: 'open-text', cfg: { question: `What drew you to ${prog} specifically — and what do you believe is the hardest part of this work that most candidates underestimate?`, wordLimit: 350 }},
    ]}
    if (isTech) return { type: 'full_assessment', blocks: [
      { type: 'intro', cfg: { text: `Welcome to the ${prog} fit assessment. This evaluation tests how you think through problems, handle uncertainty, and make decisions with incomplete information.` }},
      { type: 'video', cfg: { question: `A production bug is reported 20 minutes before a major demo. You can apply a quick patch now or take more time to do it properly. Walk us through your decision.`, maxDuration: 90, attempts: 2, note: 'Look for trade-off reasoning, stakeholder awareness, and calm under pressure.' }},
      { type: 'scenario', cfg: { title: 'Security vs. Urgency', context: `Your manager asks you to skip a security review to meet a client deadline. The risk is low but real. Skipping saves three days.`, question: 'What do you do? Walk through your reasoning and who you involve.' }},
      { type: 'open-text', cfg: { question: `Describe a time you disagreed with a technical decision made by someone more senior. What did you do, and how did it turn out?`, wordLimit: 350 }},
    ]}
    return { type: 'full_assessment', blocks: [
      { type: 'intro', cfg: { text: `Welcome to the ${prog} fit assessment. We want to understand how you handle real workplace challenges, communicate under pressure, and demonstrate professional integrity.` }},
      { type: 'video', cfg: { question: `Tell us about a time you had to deliver difficult news to a colleague, client, or manager. What did you do and what was the outcome?`, maxDuration: 90, attempts: 2, note: 'Look for honesty, empathy, and professional composure.' }},
      { type: 'scenario', cfg: { title: 'Conflicting Instructions', context: `Two managers give you contradictory instructions about a high-priority task. Both believe their version is correct. You cannot complete both by end of day.`, question: 'How do you handle this? Walk us through your exact steps.' }},
      { type: 'open-text', cfg: { question: `What does professional integrity mean to you — and describe a specific moment when it was genuinely tested?`, wordLimit: 350 }},
    ]}
  }

  if (mode === 'generate_questions' || mode === 'harder_to_game' || mode === 'variant') {
    if (isHealthcare) {
      return { type: 'questions', suggestions: [
        { title: 'Handling a distressed patient', prompt: 'A patient becomes increasingly agitated because they have been waiting for over two hours and feel ignored by the team. How do you approach this situation and what steps do you take to de-escalate?', whyItFits: 'Tests patient-facing communication, empathy, and de-escalation — core skills for any nursing or healthcare role.', measures: ['Communication', 'Empathy', 'Judgment'], blockType: 'video', difficulty: 'Moderate', scoringNote: 'Look for calm tone, acknowledgment of the patient\'s frustration, clear action steps, and awareness of team dynamics.' },
        { title: 'Medication refusal scenario', prompt: 'A patient refuses to take their prescribed medication, citing distrust of the healthcare system. You must ensure compliance without violating patient autonomy. Walk us through your approach.', whyItFits: 'Directly tests ethics, patient autonomy awareness, and professional judgment — critical for practical nursing programs.', measures: ['Ethics', 'Judgment', 'Professionalism'], blockType: 'scenario', difficulty: 'Challenging', scoringNote: 'Strong answers acknowledge patient rights, involve supervision where needed, and avoid coercive language.' },
        { title: 'Prioritization under pressure', prompt: 'You have three patients who all need immediate attention: one is in pain, one needs a medication at a scheduled time, and one is showing early signs of deterioration. How do you prioritize and who do you notify?', whyItFits: 'Assesses clinical judgment and prioritization skills, which are foundational to safe patient care in nursing.', measures: ['Critical Thinking', 'Judgment', 'Grit'], blockType: 'open-text', difficulty: 'Challenging', scoringNote: 'Should identify the deteriorating patient as highest priority, show awareness of escalation protocols, and demonstrate calm reasoning.' },
      ]}
    }
    if (isTech) {
      return { type: 'questions', suggestions: [
        { title: 'Debugging under time pressure', prompt: 'A critical bug has been found in production 30 minutes before a major client demo. You can fix it with a quick patch that might introduce technical debt, or take more time on the right solution. What do you do and why?', whyItFits: 'Tests practical engineering judgment, trade-off reasoning, and professional communication under pressure.', measures: ['Judgment', 'Technical Reasoning', 'Grit'], blockType: 'video', difficulty: 'Challenging', scoringNote: 'Look for clear trade-off reasoning, communication with stakeholders, and awareness of both options\' consequences.' },
        { title: 'Code review disagreement', prompt: 'A senior engineer has rejected your pull request citing style concerns, but you believe the approach is technically correct and time is limited. How do you handle this?', whyItFits: 'Measures collaboration, communication, and professional integrity in technical team settings.', measures: ['Collaboration', 'Communication', 'Integrity'], blockType: 'scenario', difficulty: 'Moderate', scoringNote: 'Strong answers show willingness to discuss, not just comply or resist — look for evidence of seeking shared understanding.' },
        { title: 'System design trade-offs', prompt: 'Describe a time when you had to choose between two technical approaches that each had significant trade-offs. What was the context, what did you choose, and what would you do differently today?', whyItFits: 'Reveals depth of technical reasoning and the candidate\'s ability to reflect critically on past decisions.', measures: ['Technical Reasoning', 'Critical Thinking', 'Adaptability'], blockType: 'open-text', difficulty: 'Moderate', scoringNote: 'Genuine answers should show specific trade-offs, not generic positives — watch for vague responses that avoid naming real downsides.' },
      ]}
    }
    // Default / business
    return { type: 'questions', suggestions: [
      { title: 'Handling conflicting priorities', prompt: 'You are given three urgent tasks by three different managers, all claiming their request is the highest priority. You cannot complete all three by end of day. How do you handle this?', whyItFits: 'Tests prioritization, upward communication, and professional judgment — relevant across business and administrative roles.', measures: ['Judgment', 'Communication', 'Professionalism'], blockType: 'video', difficulty: 'Moderate', scoringNote: 'Look for candidates who escalate clearly, propose solutions, and avoid passive avoidance of the conflict.' },
      { title: 'Handling a difficult client', prompt: 'A client contacts you very unhappy about a missed deadline that was caused by internal miscommunication, not by you directly. They are demanding a discount and threatening to leave. How do you respond?', whyItFits: 'Directly assesses client-facing professionalism, accountability, and de-escalation skills.', measures: ['Professionalism', 'Communication', 'Integrity'], blockType: 'scenario', difficulty: 'Challenging', scoringNote: 'Strong answers take ownership on behalf of the team, offer a clear resolution path, and maintain a professional tone throughout.' },
      { title: 'Ethical gray area', prompt: 'You discover that a small but recurring accounting error has been benefiting your company by a few hundred dollars per month. Your manager appears to be aware but has said nothing. What do you do?', whyItFits: 'Tests professional integrity and ethical decision-making, which are critical in any business or administrative program.', measures: ['Integrity', 'Ethics', 'Judgment'], blockType: 'open-text', difficulty: 'Challenging', scoringNote: 'Look for candidates who name the ethical concern clearly and describe a reasonable escalation path — watch for deflection or rationalization.' },
    ]}
  }

  if (mode === 'rubric') {
    return { type: 'rubric', dimensions: [
      { name: 'Communication', weight: 30, strong: 'Clear, structured, and audience-aware communication. Uses appropriate tone and language for the context.', neutral: 'Generally clear but occasionally vague or uses overly technical/informal language.', weak: 'Disorganized, unclear, or inappropriate tone for the situation.', watchFor: 'Candidates who speak well but give no concrete examples — polish without substance.' },
      { name: 'Judgment & Decision Making', weight: 35, strong: 'Shows clear reasoning, weighs trade-offs, and explains the "why" behind decisions.', neutral: 'Arrives at a reasonable decision but lacks a clear reasoning process.', weak: 'Makes a decision without reasoning, or reasons leads to a poor outcome.', watchFor: 'Watch for "I would ask my manager" as a default answer — escalation is valid but cannot be the only answer.' },
      { name: 'Integrity & Professionalism', weight: 20, strong: 'Takes ownership, holds consistent values under pressure, and demonstrates accountability.', neutral: 'Generally professional but avoids difficult truths or responsibility.', weak: 'Deflects blame, minimizes the ethical dimensions, or acts only in self-interest.', watchFor: 'Candidates who score high on charm but low on accountability under specific scenario pressure.' },
      { name: 'Grit & Adaptability', weight: 15, strong: 'Shows evidence of working through ambiguity, setbacks, or changing requirements without losing performance.', neutral: 'Acknowledges difficulty but gives limited evidence of actual adaptability.', weak: 'Avoids discomfort or frames challenges as external rather than showing personal response.', watchFor: 'Generic "I thrive under pressure" answers without a specific story to back it up.' },
    ]}
  }

  if (mode === 'intro') {
    const progName = program.split(' — ')[0] || program
    return { type: 'intro', text: `Welcome to the ${progName} assessment. This evaluation is designed to help our admissions team understand how you think, communicate, and approach real-world situations relevant to this program. Please read each question carefully before responding. There are no trick questions — we are looking for honest, thoughtful answers that reflect your genuine perspective and experience. Your responses will be reviewed by our team and used as part of a holistic review process.` }
  }

  if (mode === 'improve_block') {
    return { type: 'improvements', suggestions: [
      { blockRef: 'General recommendation', original: 'Tell me about yourself.', improved: `Describe a situation in your background — academic, work, or personal — that you believe best demonstrates why you are ready for a ${program.split(' — ')[0] || 'this'} program. What happened, what was your role, and what did you learn?`, whyBetter: 'The improved version is specific and behavioral, forcing the candidate to reveal real experience rather than a rehearsed pitch.' },
    ]}
  }

  return { type: 'text', content: `I'm ready to help you build a strong assessment for ${program || 'this program'}. Use the quick actions above to generate questions, a scoring rubric, or an intro block.` }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })

  try {
    const { message, mode = 'chat', program = '', existingBlockTitles = [] } = await req.json()
    const systemPrompt = buildSystemPrompt(mode as Mode, program, existingBlockTitles)
    const fullPrompt = `${systemPrompt}\n\nUser request: ${message}`

    let parsed
    try {
      const raw = await callGemini(fullPrompt, apiKey)
      const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      // API unavailable (quota/rate limit) — use demo data
      parsed = getDemoData(mode as Mode, program)
    }

    return NextResponse.json({ parsed })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
