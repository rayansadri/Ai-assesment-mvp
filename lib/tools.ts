import Anthropic from '@anthropic-ai/sdk'

export const TOOL_DEFINITIONS: Anthropic.Messages.Tool[] = [
  {
    name: 'parse_policy',
    description:
      'Parse an uploaded policy document and extract key themes, evaluation criteria, and signals. Use when the user wants to analyze or understand a policy document.',
    input_schema: {
      type: 'object' as const,
      properties: {
        document_id: {
          type: 'string',
          description: 'The ID of the policy document to parse',
        },
        focus: {
          type: 'string',
          description: 'Optional specific aspect to focus on (e.g., "integrity checks", "scoring anchors")',
        },
      },
      required: ['document_id'],
    },
  },
  {
    name: 'generate_assessment',
    description:
      'Generate a complete assessment draft including dimensions, questions, scoring logic, and integrity checks. Use when the user asks to create or generate an assessment.',
    input_schema: {
      type: 'object' as const,
      properties: {
        objective: {
          type: 'string',
          description: 'The objective or purpose of the assessment',
        },
        team_id: {
          type: 'string',
          description: 'The team ID this assessment is for',
        },
        policy_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'IDs of policy documents to use as source material',
        },
        focus_areas: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional specific dimensions or areas to focus on',
        },
        title: {
          type: 'string',
          description: 'Optional title for the assessment draft',
        },
      },
      required: ['objective', 'team_id'],
    },
  },
  {
    name: 'improve_questions',
    description:
      'Improve, refine, or rewrite questions in an existing draft. Use when the user asks to strengthen, rewrite, or add questions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        draft_id: {
          type: 'string',
          description: 'The ID of the draft to improve questions for',
        },
        dimension: {
          type: 'string',
          description: 'Optional specific dimension to focus improvement on',
        },
        feedback: {
          type: 'string',
          description: 'Specific feedback or direction for improvement',
        },
      },
      required: ['draft_id', 'feedback'],
    },
  },
  {
    name: 'generate_scoring',
    description:
      'Generate or update scoring rubrics (1/3/5 anchors) for dimensions in a draft. Use when the user asks for scoring logic or rubrics.',
    input_schema: {
      type: 'object' as const,
      properties: {
        draft_id: {
          type: 'string',
          description: 'The ID of the draft to generate scoring for',
        },
        dimensions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional specific dimensions to generate scoring for. If empty, generates for all.',
        },
      },
      required: ['draft_id'],
    },
  },
  {
    name: 'generate_integrity_checks',
    description:
      'Generate or strengthen integrity checks and anti-gaming measures for a draft. Use when the user asks for integrity checks, anti-gaming, or red flag detection.',
    input_schema: {
      type: 'object' as const,
      properties: {
        draft_id: {
          type: 'string',
          description: 'The ID of the draft to generate integrity checks for',
        },
        context: {
          type: 'string',
          description: 'Optional direction (e.g., "stricter", "focus on credential verification")',
        },
      },
      required: ['draft_id'],
    },
  },
  {
    name: 'save_assessment_draft',
    description:
      'Save an assessment draft to storage. Always call this after generating or significantly modifying a draft.',
    input_schema: {
      type: 'object' as const,
      properties: {
        draft_id: {
          type: 'string',
          description: 'The ID of the draft to save',
        },
      },
      required: ['draft_id'],
    },
  },
  {
    name: 'load_assessment_draft',
    description:
      'Load a specific saved assessment draft. Use when the user references a specific draft by ID or name.',
    input_schema: {
      type: 'object' as const,
      properties: {
        draft_id: {
          type: 'string',
          description: 'The ID of the draft to load',
        },
      },
      required: ['draft_id'],
    },
  },
  {
    name: 'list_team_workspaces',
    description:
      'List all saved assessment drafts for a team. Use when the user asks what drafts exist for a team.',
    input_schema: {
      type: 'object' as const,
      properties: {
        team_id: {
          type: 'string',
          description: 'The team ID to list drafts for',
        },
      },
      required: ['team_id'],
    },
  },
  {
    name: 'compare_versions',
    description:
      'Compare two draft versions and return a summary of what changed. Use when the user asks to compare or diff two assessments.',
    input_schema: {
      type: 'object' as const,
      properties: {
        draft_id_a: {
          type: 'string',
          description: 'The ID of the first draft to compare',
        },
        draft_id_b: {
          type: 'string',
          description: 'The ID of the second draft to compare',
        },
      },
      required: ['draft_id_a', 'draft_id_b'],
    },
  },
]
