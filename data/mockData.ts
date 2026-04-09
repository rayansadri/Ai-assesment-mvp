export const mockWorkspace = {
  team: {
    id: "finance",
    name: "Finance Team",
    initials: "FT",
    color: "#5B6EF5",
  },

  policy: {
    id: "doc-1",
    name: "Finance_Program_Fit_Methodology.pdf",
    size: "84 KB",
    uploadedAt: "Apr 3, 2026",
  },

  conversation: [
    {
      id: "msg-1",
      role: "user" as const,
      content:
        "I've uploaded our Finance Program Fit Methodology. Can you help me turn this into a structured assessment for our analyst candidates?",
      timestamp: "10:14 AM",
    },
    {
      id: "msg-2",
      role: "assistant" as const,
      timestamp: "10:14 AM",
      content:
        "I've parsed the Finance Program Fit Methodology. Here's what I found and how I'd structure the assessment.",
      parsed: {
        methodologyUnderstanding:
          "The methodology evaluates candidates across four pillars: analytical rigor, communication clarity, client orientation, and ethical judgment. Scoring anchors range from insufficient (1) to exceptional (5).",
        identifiedGap:
          "The methodology doesn't include signals for detecting coached or rehearsed answers — a common risk in structured finance interviews.",
      },
      cards: [
        {
          type: "methodology-core" as const,
          title: "Methodology Core",
          pillars: [
            { name: "Analytical Rigor", weight: "35%", color: "#5B6EF5" },
            { name: "Communication", weight: "25%", color: "#3DD68C" },
            { name: "Client Orientation", weight: "20%", color: "#F5A623" },
            { name: "Ethical Judgment", weight: "20%", color: "#F56565" },
          ],
        },
        {
          type: "assessment-logic" as const,
          title: "Assessment Logic",
          items: [
            "12 behaviorally-anchored questions across 4 pillars",
            "Scoring rubric: 1 (Insufficient) → 3 (Adequate) → 5 (Exceptional)",
            "3 integrity checks for coached-answer detection",
            "Estimated duration: 45–60 minutes",
          ],
        },
      ],
      suggestedActions: [
        "Generate full question bank",
        "Review scoring rubric draft",
        "Add integrity checks",
        "Export as assessment template",
      ],
    },
  ],

  draft: {
    version: "V1.0 Draft",
    title: "Finance Analyst Assessment",
    meta: {
      duration: "45–60 min",
      passingScore: "3.5 / 5.0",
    },
    questions: [
      {
        id: "q1",
        dimension: "Analytical Rigor",
        text: "Walk me through how you'd value a company with negative near-term cash flows.",
        type: "Technical",
        intent: "Assess depth of financial modeling and assumption clarity",
        followUp: "Probe: How do you handle terminal value when the business is currently unprofitable?",
      },
      {
        id: "q2",
        dimension: "Analytical Rigor",
        text: "Describe a time you found a material error in a financial model. What did you do?",
        type: "Behavioral",
        intent: "Assess error-correction behavior and attention to detail under pressure",
        followUp: "Probe: What was the downstream impact? How did you communicate the error?",
      },
      {
        id: "q3",
        dimension: "Communication",
        text: "Tell me about a time you explained a complex financial concept to a non-finance stakeholder.",
        type: "Behavioral",
        intent: "Assess ability to adapt communication style for different audiences",
        followUp: "Probe: How did you know they understood? What would you do differently?",
      },
      {
        id: "q4",
        dimension: "Ethical Judgment",
        text: "Your VP asks you to present assumptions you believe are too optimistic. Pitch is in 3 hours. What do you do?",
        type: "Situational",
        intent: "Assess ethical judgment under authority pressure and time constraint",
        followUp: "Probe: Have you faced something similar? What actually happened?",
      },
    ],
    scoringLogic: [
      {
        dimension: "Analytical Rigor",
        score1: "Cannot construct or explain financial models. Makes basic arithmetic errors.",
        score3: "Demonstrates standard modeling skills with some prompting. Misses nuance on assumptions.",
        score5: "Builds models fluently, articulates assumptions, catches errors independently.",
        requiredEvidence: "Specific model examples with named companies or transactions",
      },
      {
        dimension: "Communication",
        score1: "Unclear, disorganized. Cannot adapt to audience. Heavy use of unexplained jargon.",
        score3: "Adequate clarity. Some reliance on buzzwords. Moderate ability to simplify.",
        score5: "Concise, precise, and adaptable. Structures complex explanations intuitively.",
        requiredEvidence: "Observed during interview + examples of client-facing communication",
      },
      {
        dimension: "Ethical Judgment",
        score1: "Avoids ethical questions. Gives vague answers. Shows willingness to misrepresent data.",
        score3: "Recognizes obligations but hesitates. Gives formulaic answers without specificity.",
        score5: "Directly addresses dilemmas with specific examples. Principled under real pressure.",
        requiredEvidence: "Specific past incident — not just hypothetical response",
      },
    ],
    integrityWarnings: [
      {
        name: "Deal Credit Inflation",
        description: "Candidate claims primary responsibility for deals beyond their seniority level",
        trigger: "Uses 'I' language for transactions unlikely for their role",
        action: "Ask for specific contribution. Probe what their team did separately.",
        severity: "high" as const,
      },
      {
        name: "Ethical Deflection",
        description: "Candidate gives rehearsed or generic ethics answers",
        trigger: "Answer contains no specific incident — only hypothetical 'I would...' framing",
        action: "Press for a real example. If none exists, score integrity at 2 or below.",
        severity: "medium" as const,
      },
      {
        name: "Credential Discrepancy",
        description: "Timeline or institution details inconsistent between resume and interview",
        trigger: "Dates, titles, or credentials don't match narrative",
        action: "Flag for background check. Do not advance before verification.",
        severity: "high" as const,
      },
    ],
    nextSteps: [
      "Add 2 more behavioral questions for Client Orientation dimension",
      "Calibrate scoring rubric with senior reviewers before use",
      "Review integrity checks with compliance team",
      "Set up pilot run with 2 reviewers before full deployment",
    ],
  },

  savedDrafts: [
    { id: "d1", title: "Finance Analyst Assessment", version: "V1.0", updatedAt: "Apr 3", questions: 4 },
    { id: "d2", title: "Associate Hiring Guide", version: "V0.2", updatedAt: "Mar 28", questions: 7 },
  ],

  uploadedPolicies: [
    { id: "p1", name: "Finance_Program_Fit_Methodology.pdf", size: "84 KB" },
    { id: "p2", name: "IB_Analyst_Rubric_2026.pdf", size: "52 KB" },
  ],
}

export type MockWorkspace = typeof mockWorkspace
