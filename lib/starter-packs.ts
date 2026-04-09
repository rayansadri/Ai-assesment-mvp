export type BlockType =
  | 'section' | 'intro' | 'video' | 'multiple-choice' | 'open-text'
  | 'scenario' | 'case-study' | 'document-check' | 'file-upload' | 'scoring-rule'

export type ProgramFamily = 'healthcare' | 'stem' | 'business' | 'trades' | 'general'

export interface StarterBlock {
  id: string
  type: BlockType
  cfg: Record<string, unknown>
}

export interface StarterPack {
  id: string
  name: string
  programFamily: ProgramFamily
  skillFocus: string[]
  description: string
  estimatedDuration: string
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  blocks: StarterBlock[]
}

// ─── Healthcare Packs ─────────────────────────────────────────────────────────

const sp1: StarterPack = {
  id: 'sp-hca-comm',
  name: 'Home Healthcare Aide — Patient Communication',
  programFamily: 'healthcare',
  skillFocus: ['Communication', 'Empathy'],
  description: 'Assess a candidate\'s ability to communicate clearly, compassionately, and professionally with patients in a home healthcare setting.',
  estimatedDuration: '30 min',
  difficulty: 'Moderate',
  blocks: [
    {
      id: 'sp1-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Home Healthcare Aide — Patient Communication assessment. This assessment evaluates your ability to communicate effectively and empathetically with patients. Please read each question carefully before responding. You will have a set time limit for each video response. Your answers will be reviewed by our admissions team.' }
    },
    {
      id: 'sp1-b2',
      type: 'video',
      cfg: { question: 'Please introduce yourself and explain why you are drawn to a career in home healthcare. What motivates you to work with patients in their homes?', maxDuration: 90, attempts: 2, note: 'Speak clearly and directly to the camera. You have up to 90 seconds.' }
    },
    {
      id: 'sp1-b3',
      type: 'video',
      cfg: { question: 'Describe a time when you had to explain something complex or important to someone who was confused or struggling to understand. How did you handle it and what was the outcome?', maxDuration: 120, attempts: 2, note: 'Focus on your communication approach and the result. You have up to 2 minutes.' }
    },
    {
      id: 'sp1-b4',
      type: 'open-text',
      cfg: { question: 'A patient refuses to take their prescribed medication. They say they don\'t trust the medication and become upset when you try to explain its importance. How do you respond in this situation? What steps do you take?', wordLimit: 400 }
    },
    {
      id: 'sp1-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Communication Skills', weight: 50, passing: 3.0, note: 'Evaluated across all video and written responses.' }
    },
    {
      id: 'sp1-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Patient-Centred Approach', weight: 50, passing: 3.0, note: 'Assessed based on tone, empathy, and prioritization of patient wellbeing.' }
    },
  ]
}

const sp2: StarterPack = {
  id: 'sp-hca-difficult',
  name: 'Home Healthcare Aide — Handling Difficult Situations',
  programFamily: 'healthcare',
  skillFocus: ['Judgment', 'Resilience'],
  description: 'Evaluate a candidate\'s judgment, emotional resilience, and safety awareness when managing challenging or unpredictable patient scenarios.',
  estimatedDuration: '35 min',
  difficulty: 'Challenging',
  blocks: [
    {
      id: 'sp2-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Handling Difficult Situations assessment. Home healthcare aides regularly encounter complex and emotionally demanding situations. This assessment is designed to evaluate your judgment, resilience, and ability to respond safely and professionally under pressure. Answer each question as honestly and thoughtfully as possible.' }
    },
    {
      id: 'sp2-b2',
      type: 'scenario',
      cfg: {
        title: 'The Uncooperative Patient',
        context: 'You arrive at the home of an elderly patient with early-stage dementia. It is morning and time to assist with their daily care routine. Today, the patient is agitated and refuses to cooperate with their morning care. They are asking for their family and becoming increasingly distressed.',
        question: 'How do you handle this situation? Walk us through your step-by-step approach, including how you communicate with the patient, how you prioritize their safety, and whether you escalate to a supervisor or family member.'
      }
    },
    {
      id: 'sp2-b3',
      type: 'video',
      cfg: { question: 'Describe the most challenging caregiving situation you have experienced or can imagine facing. How did you or would you manage it emotionally and professionally?', maxDuration: 120, attempts: 2, note: 'Be specific about the challenge and your personal response to it.' }
    },
    {
      id: 'sp2-b4',
      type: 'multiple-choice',
      cfg: {
        question: 'During a routine visit, a patient casually mentions they have been having thoughts about not wanting to be alive anymore. What is your first step?',
        options: [
          'Reassure the patient and change the subject to avoid upsetting them further',
          'Contact your supervisor immediately and follow your organization\'s safety protocol',
          'Call 911 right away without speaking further with the patient',
          'Continue with your scheduled tasks and note it in your report at the end of the day'
        ],
        correct: 1,
        multi: false
      }
    },
    {
      id: 'sp2-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Judgment & Safety', weight: 60, passing: 3.5, note: 'Evaluated on decisions made under pressure and adherence to safety protocols.' }
    },
    {
      id: 'sp2-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Resilience', weight: 40, passing: 3.0, note: 'Assessed on emotional self-regulation and professionalism under duress.' }
    },
  ]
}

const sp3: StarterPack = {
  id: 'sp-medrec-general',
  name: 'Medical Receptionist — General Video Screening',
  programFamily: 'healthcare',
  skillFocus: ['Communication', 'Professionalism'],
  description: 'A foundational screening for medical receptionist candidates covering communication style, professional boundaries, and patient experience values.',
  estimatedDuration: '25 min',
  difficulty: 'Easy',
  blocks: [
    {
      id: 'sp3-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Medical Receptionist General Screening. In this assessment, you will complete a series of video responses and a written question to help us understand your communication style, professionalism, and suitability for a front-desk role in a healthcare environment. Take your time to answer each question thoughtfully.' }
    },
    {
      id: 'sp3-b2',
      type: 'video',
      cfg: { question: 'Please introduce yourself and tell us what draws you to the medical receptionist role. What do you find meaningful about working at the front line of patient care?', maxDuration: 90, attempts: 2, note: 'Speak clearly and professionally, as if you are in an interview.' }
    },
    {
      id: 'sp3-b3',
      type: 'video',
      cfg: { question: 'Describe a time when you had to manage multiple competing priorities at once. How did you decide what to do first, and how did it turn out?', maxDuration: 120, attempts: 2, note: 'Use a real or hypothetical example.' }
    },
    {
      id: 'sp3-b4',
      type: 'multiple-choice',
      cfg: {
        question: 'A patient calls asking for their blood test results, but you do not have access to that information in your system. What do you do?',
        options: [
          'Tell them everything looks fine so they don\'t worry',
          'Transfer the call or direct them to the appropriate clinical team who can access their results',
          'Give them your personal opinion based on what you know about the test',
          'Tell them to call back another day when you are less busy'
        ],
        correct: 1,
        multi: false
      }
    },
    {
      id: 'sp3-b5',
      type: 'open-text',
      cfg: { question: 'In your own words, what does an exceptional patient experience look like at the front desk of a medical clinic? What role do you play in creating that experience?', wordLimit: 300 }
    },
    {
      id: 'sp3-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Communication', weight: 40, passing: 3.0, note: 'Evaluated across video and written responses.' }
    },
    {
      id: 'sp3-b7',
      type: 'scoring-rule',
      cfg: { pillar: 'Professionalism', weight: 30, passing: 3.0, note: 'Tone, demeanor, and appropriateness of responses.' }
    },
    {
      id: 'sp3-b8',
      type: 'scoring-rule',
      cfg: { pillar: 'Clinical Boundaries', weight: 30, passing: 3.5, note: 'Understanding of scope-of-practice limits and appropriate escalation.' }
    },
  ]
}

const sp4: StarterPack = {
  id: 'sp-medrec-patient',
  name: 'Medical Receptionist — Patient Handling',
  programFamily: 'healthcare',
  skillFocus: ['De-escalation', 'Empathy'],
  description: 'Tests a candidate\'s ability to de-escalate upset patients, maintain professionalism under stress, and demonstrate genuine empathy in a clinical reception setting.',
  estimatedDuration: '25 min',
  difficulty: 'Moderate',
  blocks: [
    {
      id: 'sp4-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Patient Handling assessment for Medical Receptionist candidates. This assessment focuses on how you manage emotionally charged interactions at the front desk. You will be presented with a scenario, a video question, and a multiple choice question. Please respond as you would in a real clinical environment.' }
    },
    {
      id: 'sp4-b2',
      type: 'scenario',
      cfg: {
        title: 'The Upset Patient',
        context: 'A patient arrives at the reception desk visibly upset. They explain that their appointment was cancelled without notice and they took time off work to be here. They are speaking loudly and other patients in the waiting area are watching.',
        question: 'How do you respond in this moment? Describe your approach to de-escalating the situation, what you would say to the patient, how you handle the audience of other patients, and what steps you take to resolve the issue.'
      }
    },
    {
      id: 'sp4-b3',
      type: 'video',
      cfg: { question: 'Tell us about a time when you turned a frustrated or upset customer or client into a positive experience. What did you do, and what was the result?', maxDuration: 120, attempts: 2, note: 'Focus on your specific actions and communication techniques.' }
    },
    {
      id: 'sp4-b4',
      type: 'multiple-choice',
      cfg: {
        question: 'A patient at the front desk insists they must speak to the doctor directly and refuses to speak with you. What is the most appropriate response?',
        options: [
          'Step aside and let them go to the back office to find the doctor',
          'Calmly acknowledge their concern, explain the process, and offer to pass a message or schedule a callback with the physician',
          'Tell them the doctor is too busy and they need to make an appointment',
          'Escalate immediately to your manager without attempting to assist the patient'
        ],
        correct: 1,
        multi: false
      }
    },
    {
      id: 'sp4-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'De-escalation', weight: 50, passing: 3.5, note: 'Effectiveness of conflict management approach.' }
    },
    {
      id: 'sp4-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Empathy & Service', weight: 50, passing: 3.0, note: 'Genuine patient-centred approach and tone.' }
    },
  ]
}

const sp5: StarterPack = {
  id: 'sp-medrec-case',
  name: 'Medical Receptionist — Case Study',
  programFamily: 'healthcare',
  skillFocus: ['Prioritization', 'Judgment'],
  description: 'A realistic Monday morning scenario that tests a candidate\'s ability to triage, prioritize, and communicate effectively under high-volume, high-pressure front desk conditions.',
  estimatedDuration: '40 min',
  difficulty: 'Challenging',
  blocks: [
    {
      id: 'sp5-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Case Study assessment for Medical Receptionist candidates. You will be presented with a complex, realistic scenario requiring you to demonstrate your ability to prioritize tasks, communicate with patients and staff, and exercise sound judgment under pressure. Read the scenario carefully before answering the tasks.' }
    },
    {
      id: 'sp5-b2',
      type: 'case-study',
      cfg: {
        title: 'Monday Morning at Downtown Medical Clinic',
        context: 'It is Monday morning at 8:30 AM. You are the only receptionist on duty. The clinic opens at 9:00 AM and patients are already arriving. You have 4 patients checking in, 2 walk-in patients who need to be triaged, 3 phone lines ringing with patients on hold, a medical supply delivery at the front door requiring a signature, a patient requesting to reschedule their appointment, and the attending physician asking you for the patient files needed for the first hour of appointments.',
        tasks: [
          'How do you prioritize all of these competing demands? List your immediate actions in order.',
          'What do you communicate to the waiting and arriving patients to manage their expectations?',
          'If the delivery driver says they cannot wait and need a signature immediately, what do you do?',
          'Which of these situations, if any, would you escalate to a supervisor or physician immediately, and why?'
        ]
      }
    },
    {
      id: 'sp5-b3',
      type: 'scoring-rule',
      cfg: { pillar: 'Prioritization', weight: 40, passing: 3.5, note: 'Quality and logic of task ordering under pressure.' }
    },
    {
      id: 'sp5-b4',
      type: 'scoring-rule',
      cfg: { pillar: 'Communication Under Pressure', weight: 30, passing: 3.0, note: 'Approach to patient and team communication in a high-volume environment.' }
    },
    {
      id: 'sp5-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Judgment', weight: 30, passing: 3.0, note: 'Soundness of escalation and decision-making logic.' }
    },
  ]
}

// ─── STEM Packs ───────────────────────────────────────────────────────────────

const sp6: StarterPack = {
  id: 'sp-sweng-tech',
  name: 'Software Engineering — Technical & Cultural Fit',
  programFamily: 'stem',
  skillFocus: ['Technical', 'Problem Solving'],
  description: 'Assess software engineering candidates on technical aptitude, debugging mindset, and ability to articulate complex technical decisions clearly.',
  estimatedDuration: '35 min',
  difficulty: 'Challenging',
  blocks: [
    {
      id: 'sp6-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Software Engineering Technical & Cultural Fit assessment. This assessment includes a video response, a technical knowledge question, and a written reflection. There are no trick questions — we want to understand how you think, how you work, and how you communicate technical concepts. Take your time and be specific in your answers.' }
    },
    {
      id: 'sp6-b2',
      type: 'video',
      cfg: { question: 'Walk us through a technical project you have built or contributed to. What was your role, what technical decisions did you make, and what did you learn from the experience?', maxDuration: 180, attempts: 2, note: 'You have up to 3 minutes. Be specific about technologies used and challenges overcome.' }
    },
    {
      id: 'sp6-b3',
      type: 'multiple-choice',
      cfg: {
        question: 'What is the time complexity of a binary search algorithm on a sorted array of n elements?',
        options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
        correct: 2,
        multi: false
      }
    },
    {
      id: 'sp6-b4',
      type: 'open-text',
      cfg: { question: 'Describe a time when you encountered a bug or technical problem you could not immediately solve. Walk us through your debugging process, the tools or strategies you used, and how you ultimately resolved it (or what you would do differently next time).', wordLimit: 400 }
    },
    {
      id: 'sp6-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Technical Aptitude', weight: 50, passing: 3.5, note: 'Demonstrated technical knowledge and depth of understanding.' }
    },
    {
      id: 'sp6-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Problem Solving', weight: 30, passing: 3.0, note: 'Systematic thinking and persistence in the face of challenges.' }
    },
    {
      id: 'sp6-b7',
      type: 'scoring-rule',
      cfg: { pillar: 'Communication', weight: 20, passing: 3.0, note: 'Ability to explain technical concepts clearly and concisely.' }
    },
  ]
}

const sp7: StarterPack = {
  id: 'sp-datasci-analytical',
  name: 'Data Science — Analytical Reasoning',
  programFamily: 'stem',
  skillFocus: ['Analytical', 'Critical Thinking'],
  description: 'Evaluate a data science candidate\'s analytical reasoning, statistical literacy, and ability to interpret and communicate insights from data.',
  estimatedDuration: '30 min',
  difficulty: 'Moderate',
  blocks: [
    {
      id: 'sp7-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Data Science Analytical Reasoning assessment. This assessment is designed to evaluate how you approach data problems, reason through uncertainty, and communicate your findings. You will be presented with a case study and a conceptual question. There are no trick questions — we value clear thinking and honest reflection over "correct" answers.' }
    },
    {
      id: 'sp7-b2',
      type: 'case-study',
      cfg: {
        title: 'Interpreting a Dataset',
        context: 'A mid-sized company has shared their quarterly sales data with you. The data shows a significant and unexpected drop in revenue during Q3. The leadership team wants your analysis before their board meeting next week.',
        tasks: [
          'What questions would you ask the stakeholders before drawing any conclusions from this data?',
          'Describe your analytical approach — what would you do first, second, and third?',
          'What types of visualizations would be most useful for communicating your findings to non-technical leadership?',
          'List at least four possible factors that could explain the Q3 revenue drop and how you would test each hypothesis.'
        ]
      }
    },
    {
      id: 'sp7-b3',
      type: 'multiple-choice',
      cfg: {
        question: 'When analyzing a dataset that is heavily skewed to the right, which measure of central tendency is most appropriate to report as the "average"?',
        options: ['Mean', 'Median', 'Mode', 'Standard Deviation'],
        correct: 1,
        multi: false
      }
    },
    {
      id: 'sp7-b4',
      type: 'scoring-rule',
      cfg: { pillar: 'Analytical Reasoning', weight: 60, passing: 3.5, note: 'Depth and rigor of analytical thinking demonstrated in the case study.' }
    },
    {
      id: 'sp7-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Communication', weight: 40, passing: 3.0, note: 'Clarity and structure of written responses.' }
    },
  ]
}

const sp8: StarterPack = {
  id: 'sp-nursing-judgment',
  name: 'Nursing Science — Critical Thinking',
  programFamily: 'stem',
  skillFocus: ['Clinical Judgment', 'Ethics'],
  description: 'Test nursing science candidates on clinical reasoning, ethical decision-making, and the ability to advocate for patients in complex situations.',
  estimatedDuration: '30 min',
  difficulty: 'Moderate',
  blocks: [
    {
      id: 'sp8-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Nursing Science Critical Thinking assessment. This assessment explores your approach to clinical judgment and ethical decision-making. You will encounter scenarios that reflect real-world challenges nurses face daily. Please answer thoughtfully and honestly — there is rarely one perfect answer in nursing, and we are looking for your reasoning process, not just your conclusion.' }
    },
    {
      id: 'sp8-b2',
      type: 'scenario',
      cfg: {
        title: 'Conflicting Instructions',
        context: 'You are a nursing student on a clinical placement. The attending physician has given you a verbal order for a medication change. However, when you consult the charge nurse before proceeding, they tell you to follow a different protocol that does not include this change.',
        question: 'How do you proceed? Walk us through your decision-making process, who you communicate with, in what order, and why. What do you do if the conflict is not resolved quickly?'
      }
    },
    {
      id: 'sp8-b3',
      type: 'video',
      cfg: { question: 'Describe a time — real or hypothetical — when you had to advocate for a patient\'s needs despite resistance from someone in authority. What was the situation, how did you handle it, and what was the outcome?', maxDuration: 120, attempts: 2, note: 'Focus on your advocacy approach and communication style.' }
    },
    {
      id: 'sp8-b4',
      type: 'multiple-choice',
      cfg: {
        question: 'A patient\'s family approaches you privately and asks you not to tell the patient about their recent diagnosis, saying "it will be too upsetting." What is the correct response?',
        options: [
          'Agree to withhold the information to preserve the family\'s wishes',
          'Inform the family that the patient has the right to know their own diagnosis and that you must follow the care team\'s disclosure plan',
          'Tell the patient immediately without consulting the care team',
          'Document the request and do nothing until your shift ends'
        ],
        correct: 1,
        multi: false
      }
    },
    {
      id: 'sp8-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Clinical Judgment', weight: 50, passing: 3.5, note: 'Quality of reasoning in clinical scenarios.' }
    },
    {
      id: 'sp8-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Ethics', weight: 50, passing: 4.0, note: 'Demonstrated understanding of patient rights and professional ethics.' }
    },
  ]
}

const sp9: StarterPack = {
  id: 'sp-envtech-field',
  name: 'Environmental Technology — Field Assessment',
  programFamily: 'stem',
  skillFocus: ['Technical', 'Grit'],
  description: 'Evaluate environmental technology candidates on their field readiness, commitment to the discipline, and ability to follow rigorous technical protocols under challenging conditions.',
  estimatedDuration: '25 min',
  difficulty: 'Moderate',
  blocks: [
    {
      id: 'sp9-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Environmental Technology Field Assessment. This assessment is designed to evaluate your motivation for entering the environmental field, your physical and mental readiness for field work, and your knowledge of basic field sampling and data collection protocols. Answer each question honestly and with as much specific detail as possible.' }
    },
    {
      id: 'sp9-b2',
      type: 'video',
      cfg: { question: 'Why environmental technology? Tell us what draws you to this field and what motivates your commitment to environmental work, even when conditions are difficult.', maxDuration: 90, attempts: 2, note: 'Be specific about your interests and values related to the environment.' }
    },
    {
      id: 'sp9-b3',
      type: 'open-text',
      cfg: { question: 'Describe a situation — real or hypothetical — where you had to work in challenging physical or environmental conditions. How did you manage your own safety and performance? What kept you motivated?', wordLimit: 350 }
    },
    {
      id: 'sp9-b4',
      type: 'multiple-choice',
      cfg: {
        question: 'When collecting field samples for environmental analysis, sampling error is best prevented by:',
        options: [
          'Collecting only one sample per site to reduce handling errors',
          'Following strict standardized collection protocols and using proper chain-of-custody procedures',
          'Skipping QA/QC steps when time is limited to collect more samples',
          'Relying on the laboratory to identify and correct any collection errors'
        ],
        correct: 1,
        multi: false
      }
    },
    {
      id: 'sp9-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Technical Knowledge', weight: 50, passing: 3.0, note: 'Understanding of field protocols and data quality.' }
    },
    {
      id: 'sp9-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Field Readiness', weight: 50, passing: 3.0, note: 'Physical and mental preparedness for environmental field work.' }
    },
  ]
}

const sp10: StarterPack = {
  id: 'sp-compsys-trouble',
  name: 'Computer Systems — Troubleshooting Assessment',
  programFamily: 'stem',
  skillFocus: ['Technical', 'Problem Solving'],
  description: 'Test computer systems candidates on their systematic troubleshooting approach, networking fundamentals, and ability to stay composed during technical incidents.',
  estimatedDuration: '30 min',
  difficulty: 'Challenging',
  blocks: [
    {
      id: 'sp10-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Computer Systems Troubleshooting Assessment. This assessment evaluates your technical knowledge, systematic problem-solving approach, and your ability to respond to real-world IT incidents under pressure. Please answer each question with as much technical detail as you can — we want to understand how you think through problems, not just what you know.' }
    },
    {
      id: 'sp10-b2',
      type: 'video',
      cfg: { question: 'Walk us through how you would approach diagnosing a computer that will not boot. What are your first steps, what information do you gather, and how do you narrow down the cause?', maxDuration: 150, attempts: 2, note: 'Be systematic and specific. Mention hardware and software considerations.' }
    },
    {
      id: 'sp10-b3',
      type: 'scenario',
      cfg: {
        title: 'Network Outage at 3 PM',
        context: 'It is 3:00 PM on a Tuesday. You receive an urgent message that approximately 50 users across the office have suddenly lost network access. You are the only IT person available on-site.',
        question: 'What are your first 5 steps? Walk through them in order, explaining what you are checking, why, and what information you are trying to gather with each step.'
      }
    },
    {
      id: 'sp10-b4',
      type: 'multiple-choice',
      cfg: {
        question: 'In the OSI model, at which layer does DNS (Domain Name System) primarily operate?',
        options: ['Layer 1 — Physical', 'Layer 3 — Network', 'Layer 5 — Session', 'Layer 7 — Application'],
        correct: 3,
        multi: false
      }
    },
    {
      id: 'sp10-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Technical Proficiency', weight: 60, passing: 3.5, note: 'Depth of technical knowledge and accuracy of troubleshooting steps.' }
    },
    {
      id: 'sp10-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Systematic Thinking', weight: 40, passing: 3.0, note: 'Logical and methodical approach to problem identification.' }
    },
  ]
}

// ─── Business Packs ───────────────────────────────────────────────────────────

const sp11: StarterPack = {
  id: 'sp-busadmin-comm',
  name: 'Business Administration — Communication & Fit',
  programFamily: 'business',
  skillFocus: ['Communication', 'Motivation'],
  description: 'A general-purpose screening for business administration candidates covering professional communication, organizational skills, and program motivation.',
  estimatedDuration: '25 min',
  difficulty: 'Easy',
  blocks: [
    {
      id: 'sp11-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Business Administration Communication & Fit assessment. This assessment is designed to learn more about you — your background, your organizational style, and your goals. There are no right or wrong answers. Please respond as you would in a professional setting and be as specific as possible.' }
    },
    {
      id: 'sp11-b2',
      type: 'video',
      cfg: { question: 'Please introduce yourself. Tell us a bit about your background and what your career goals are after completing this program.', maxDuration: 90, attempts: 2, note: 'Speak clearly and professionally. You have up to 90 seconds.' }
    },
    {
      id: 'sp11-b3',
      type: 'open-text',
      cfg: { question: 'Describe your organizational style. How do you typically manage your time and prioritize tasks when you have multiple competing deadlines? Give a specific example if possible.', wordLimit: 300 }
    },
    {
      id: 'sp11-b4',
      type: 'multiple-choice',
      cfg: {
        question: 'A colleague on a shared project misses an important deadline that directly affects your own work. What is your first step?',
        options: [
          'Complain to your manager immediately',
          'Reach out to the colleague directly to understand what happened and discuss how to move forward',
          'Complete their portion of the work yourself without saying anything',
          'Exclude them from the project going forward'
        ],
        correct: 1,
        multi: false
      }
    },
    {
      id: 'sp11-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Communication', weight: 40, passing: 3.0, note: 'Clarity and professionalism across all responses.' }
    },
    {
      id: 'sp11-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Professionalism', weight: 30, passing: 3.0, note: 'Tone, self-awareness, and workplace readiness.' }
    },
    {
      id: 'sp11-b7',
      type: 'scoring-rule',
      cfg: { pillar: 'Motivation', weight: 30, passing: 3.0, note: 'Clarity of goals and genuine alignment with the program.' }
    },
  ]
}

const sp12: StarterPack = {
  id: 'sp-marketing-creative',
  name: 'Marketing — Creativity & Motivation',
  programFamily: 'business',
  skillFocus: ['Creativity', 'Motivation'],
  description: 'Assess marketing candidates on their strategic creativity, ability to think analytically about brand challenges, and genuine motivation for the field.',
  estimatedDuration: '30 min',
  difficulty: 'Moderate',
  blocks: [
    {
      id: 'sp12-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Marketing Creativity & Motivation assessment. This assessment is designed to evaluate your strategic thinking, creative instincts, and passion for marketing. You will complete a live pitch and a brand strategy case study. There is no single correct answer — we are looking for original ideas backed by clear thinking.' }
    },
    {
      id: 'sp12-b2',
      type: 'video',
      cfg: { question: 'Pitch us a marketing campaign idea for a product or brand of your choice. You have up to 2 minutes. Walk us through the target audience, the core message, and at least one key channel or tactic.', maxDuration: 120, attempts: 2, note: 'Be creative, clear, and specific. This can be a real brand or a hypothetical one.' }
    },
    {
      id: 'sp12-b3',
      type: 'case-study',
      cfg: {
        title: 'Declining Brand Engagement',
        context: 'A brand you manage has seen its social media engagement drop by 40% over the past 6 months. Follower counts are flat, reach is declining, and conversion rates from social campaigns have dropped significantly. The marketing budget has not changed.',
        tasks: [
          'What data and metrics would you gather first before forming any hypotheses?',
          'Propose 3 distinct strategic interventions you would test to reverse the trend.',
          'How would you measure whether your interventions are working, and over what timeframe?'
        ]
      }
    },
    {
      id: 'sp12-b4',
      type: 'scoring-rule',
      cfg: { pillar: 'Strategic Thinking', weight: 50, passing: 3.0, note: 'Quality of analysis and logic behind proposed strategies.' }
    },
    {
      id: 'sp12-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Creativity', weight: 30, passing: 3.0, note: 'Originality and distinctiveness of ideas.' }
    },
    {
      id: 'sp12-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Motivation', weight: 20, passing: 3.0, note: 'Genuine enthusiasm and engagement with the marketing field.' }
    },
  ]
}

const sp13: StarterPack = {
  id: 'sp-finance-analytical',
  name: 'Finance — Analytical & Professional Fit',
  programFamily: 'business',
  skillFocus: ['Analytical', 'Professionalism'],
  description: 'Evaluate finance candidates on quantitative reasoning, professional presentation, and their ability to interpret financial data and communicate findings to stakeholders.',
  estimatedDuration: '35 min',
  difficulty: 'Challenging',
  blocks: [
    {
      id: 'sp13-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Finance Analytical & Professional Fit assessment. This assessment includes a video response, a financial calculation question, and a budget analysis case study. We are evaluating both your technical financial knowledge and your ability to communicate clearly in a professional context. Take your time and show your reasoning.' }
    },
    {
      id: 'sp13-b2',
      type: 'video',
      cfg: { question: 'Why finance? Tell us what draws you to this field and which area of finance interests you most — and why.', maxDuration: 90, attempts: 2, note: 'Be specific about your interests and what you hope to do with your finance education.' }
    },
    {
      id: 'sp13-b3',
      type: 'multiple-choice',
      cfg: {
        question: 'A company reports total revenue of $500,000 and total operating costs of $350,000. What is the company\'s operating margin?',
        options: ['30%', '15%', '70%', '40%'],
        correct: 0,
        multi: false
      }
    },
    {
      id: 'sp13-b4',
      type: 'case-study',
      cfg: {
        title: 'Budget Variance Review',
        context: 'You are a junior financial analyst. A department has overspent its quarterly budget by 18%. Your manager has asked you to prepare a variance analysis and present your findings to leadership at the end of the week.',
        tasks: [
          'What are the most likely causes of an 18% budget overrun and how would you identify which one(s) apply?',
          'Describe the steps you would take to investigate — what data would you pull, who would you speak to, and in what order?',
          'What would your report to leadership include? List the key components and the tone you would take.'
        ]
      }
    },
    {
      id: 'sp13-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Analytical Reasoning', weight: 50, passing: 3.5, note: 'Quantitative accuracy and depth of financial analysis.' }
    },
    {
      id: 'sp13-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Professionalism', weight: 50, passing: 3.0, note: 'Communication quality, tone, and stakeholder awareness.' }
    },
  ]
}

const sp14: StarterPack = {
  id: 'sp-hr-ethics',
  name: 'Human Resources — Ethics & People Skills',
  programFamily: 'business',
  skillFocus: ['Ethics', 'Professionalism'],
  description: 'Assess HR candidates on their ethical judgment, discretion with sensitive information, and ability to navigate complex interpersonal situations with professionalism.',
  estimatedDuration: '30 min',
  difficulty: 'Moderate',
  blocks: [
    {
      id: 'sp14-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Human Resources Ethics & People Skills assessment. HR professionals are trusted with sensitive information and complex human situations every day. This assessment evaluates your judgment, your understanding of confidentiality and proper process, and your ability to handle sensitive situations with care and professionalism. Please respond as you would in a real HR role.' }
    },
    {
      id: 'sp14-b2',
      type: 'scenario',
      cfg: {
        title: 'Harassment Complaint',
        context: 'An employee approaches you informally during lunch. They describe a pattern of behaviour from their direct manager that they feel constitutes workplace harassment. They are not ready to file a formal complaint and ask you to handle it quietly without any official record.',
        question: 'How do you proceed? Walk through your immediate response to the employee, the steps you are required to take, the limits of what you can promise about confidentiality, and how you balance the employee\'s wishes with your organizational obligations.'
      }
    },
    {
      id: 'sp14-b3',
      type: 'video',
      cfg: { question: 'Describe a time when you had to navigate a sensitive or uncomfortable situation in a workplace or school setting and handle it with professionalism. What was the situation, what did you do, and what did you learn from it?', maxDuration: 120, attempts: 2, note: 'Protect the privacy of anyone involved. Focus on your actions and reasoning.' }
    },
    {
      id: 'sp14-b4',
      type: 'multiple-choice',
      cfg: {
        question: 'An employee shares confidential personal health information with you informally in the hallway, saying "I just thought you should know." What should you do?',
        options: [
          'Share the information with their manager so the team can provide appropriate support',
          'Keep the information strictly confidential and refer the employee to the appropriate support channels if needed',
          'Document the information in their performance file for future reference',
          'Ignore it — if it was not a formal disclosure, it is not your concern'
        ],
        correct: 1,
        multi: false
      }
    },
    {
      id: 'sp14-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Ethics & Judgment', weight: 60, passing: 4.0, note: 'Quality of ethical reasoning and process adherence.' }
    },
    {
      id: 'sp14-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'People Skills', weight: 40, passing: 3.0, note: 'Empathy, communication, and interpersonal awareness.' }
    },
  ]
}

const sp15: StarterPack = {
  id: 'sp-pm-leadership',
  name: 'Project Management — Leadership & Prioritization',
  programFamily: 'business',
  skillFocus: ['Leadership', 'Prioritization'],
  description: 'Test project management candidates on their ability to lead under pressure, handle scope changes, and apply structured prioritization frameworks.',
  estimatedDuration: '30 min',
  difficulty: 'Moderate',
  blocks: [
    {
      id: 'sp15-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Project Management Leadership & Prioritization assessment. This assessment evaluates your ability to lead teams under pressure, make clear prioritization decisions, and communicate effectively when plans change. You will encounter a real-world scenario, a reflection question, and a concept check. Please be specific and show your reasoning.' }
    },
    {
      id: 'sp15-b2',
      type: 'scenario',
      cfg: {
        title: 'Scope Creep Crisis',
        context: 'You are managing a software implementation project that is 3 weeks away from launch. The client has just requested a significant new feature that was not in the original scope. Your development team is already at full capacity and the timeline cannot be extended without cost implications.',
        question: 'How do you respond to the client and manage this situation? Walk through your immediate communication with the client, how you assess whether the change is feasible, how you involve your team, and the options you present to stakeholders.'
      }
    },
    {
      id: 'sp15-b3',
      type: 'video',
      cfg: { question: 'Tell us about a project you managed or participated in that did not go as planned. What went wrong, how did you respond, and what would you do differently?', maxDuration: 120, attempts: 2, note: 'Focus on what you personally did, not just what happened to the project.' }
    },
    {
      id: 'sp15-b4',
      type: 'multiple-choice',
      cfg: {
        question: 'In the MoSCoW prioritization framework, what does the "M" stand for?',
        options: ['Minimum Viable Feature', 'Must Have', 'Managed Requirement', 'Milestone Deliverable'],
        correct: 1,
        multi: false
      }
    },
    {
      id: 'sp15-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Leadership', weight: 50, passing: 3.0, note: 'Demonstrated ability to guide teams and manage stakeholder expectations.' }
    },
    {
      id: 'sp15-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Prioritization', weight: 30, passing: 3.0, note: 'Structured and logical approach to decision-making under constraints.' }
    },
    {
      id: 'sp15-b7',
      type: 'scoring-rule',
      cfg: { pillar: 'Communication', weight: 20, passing: 3.0, note: 'Clarity and professionalism in communicating changes and decisions.' }
    },
  ]
}

// ─── Trades Packs ─────────────────────────────────────────────────────────────

const sp16: StarterPack = {
  id: 'sp-construction-safety',
  name: 'Construction — Safety First Assessment',
  programFamily: 'trades',
  skillFocus: ['Safety', 'Judgment'],
  description: 'Screen construction candidates on their WHMIS and on-site safety knowledge, their ability to identify hazards, and their judgment in unsafe situations.',
  estimatedDuration: '20 min',
  difficulty: 'Easy',
  blocks: [
    {
      id: 'sp16-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Construction Safety First Assessment. Safety is the foundation of every trade. This short assessment evaluates your knowledge of workplace safety protocols, your ability to recognize hazards, and your judgment in situations where safety is at risk. Please answer honestly and specifically.' }
    },
    {
      id: 'sp16-b2',
      type: 'video',
      cfg: { question: 'Describe your experience with WHMIS training or other site safety protocols. What certifications or safety training have you completed, and how have you applied that knowledge on the job?', maxDuration: 90, attempts: 2, note: 'If you have limited experience, describe how you would approach learning safety protocols on a new site.' }
    },
    {
      id: 'sp16-b3',
      type: 'multiple-choice',
      cfg: {
        question: 'You notice a coworker on your job site who is not wearing the required PPE in a designated mandatory PPE zone. What do you do?',
        options: [
          'Ignore it — it is not your job to enforce safety rules',
          'Politely remind your coworker of the PPE requirement and why it matters',
          'Report them to the site supervisor immediately without speaking to them first',
          'Finish your own work first and then mention it at the end of the day'
        ],
        correct: 1,
        multi: false
      }
    },
    {
      id: 'sp16-b4',
      type: 'open-text',
      cfg: { question: 'Describe a time when you identified a safety hazard on a job site, in training, or in any work environment. What was the hazard, how did you identify it, and what did you do about it?', wordLimit: 300 }
    },
    {
      id: 'sp16-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Safety Knowledge', weight: 60, passing: 4.0, note: 'Accuracy and depth of safety protocol knowledge.' }
    },
    {
      id: 'sp16-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Judgment', weight: 40, passing: 3.5, note: 'Appropriate response to unsafe conditions and peer accountability.' }
    },
  ]
}

const sp17: StarterPack = {
  id: 'sp-electrical-technical',
  name: 'Electrical — Technical Knowledge Check',
  programFamily: 'trades',
  skillFocus: ['Technical', 'Safety'],
  description: 'Assess electrical trades candidates on foundational technical knowledge, safe diagnostic practices, and their training background.',
  estimatedDuration: '25 min',
  difficulty: 'Moderate',
  blocks: [
    {
      id: 'sp17-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Electrical Technical Knowledge Check. This assessment evaluates your foundational electrical knowledge, your approach to safe diagnostics, and your training background. Please answer each question with as much technical detail as you can. If you are newer to the field, explain what you have learned so far and how you would approach finding answers safely.' }
    },
    {
      id: 'sp17-b2',
      type: 'multiple-choice',
      cfg: {
        question: 'A GFCI outlet in a bathroom trips repeatedly even when no appliance is plugged in. What is the most likely cause?',
        options: [
          'A faulty appliance that was previously plugged in caused a residual fault',
          'There is likely a wiring issue or ground fault somewhere in the circuit',
          'This is normal operation — GFCI outlets trip periodically as a self-test',
          'The circuit is overloaded and needs a higher amperage breaker'
        ],
        correct: 0,
        multi: false
      }
    },
    {
      id: 'sp17-b3',
      type: 'video',
      cfg: { question: 'Walk us through how you would diagnose an issue in an electrical panel safely. What steps would you take, what tools would you use, and what safety precautions are non-negotiable?', maxDuration: 150, attempts: 2, note: 'Be systematic. Walk through both your technical approach and your safety checks.' }
    },
    {
      id: 'sp17-b4',
      type: 'open-text',
      cfg: { question: 'Describe your current training, certifications, and practical experience related to electrical work. What are you currently learning, and what are you working toward?', wordLimit: 300 }
    },
    {
      id: 'sp17-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Technical Knowledge', weight: 60, passing: 3.5, note: 'Accuracy of electrical concepts and diagnostic approach.' }
    },
    {
      id: 'sp17-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Safety Protocols', weight: 40, passing: 4.0, note: 'Demonstrated commitment to electrical safety standards.' }
    },
  ]
}

const sp18: StarterPack = {
  id: 'sp-culinary-standards',
  name: 'Culinary Arts — Professional Standards',
  programFamily: 'trades',
  skillFocus: ['Professionalism', 'Technical'],
  description: 'Evaluate culinary arts candidates on kitchen experience, leadership under pressure, and knowledge of food safety standards.',
  estimatedDuration: '25 min',
  difficulty: 'Moderate',
  blocks: [
    {
      id: 'sp18-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Culinary Arts Professional Standards assessment. This assessment evaluates your kitchen experience, your ability to lead and communicate in a high-pressure environment, and your knowledge of food safety standards. Please be specific in your answers and draw on real experience wherever possible.' }
    },
    {
      id: 'sp18-b2',
      type: 'video',
      cfg: { question: 'Walk us through your kitchen experience. What types of environments have you worked in, what is your strongest cuisine or technique, and what role have you typically played in kitchen operations?', maxDuration: 120, attempts: 2, note: 'Be specific about the type of establishment, the volume, and your responsibilities.' }
    },
    {
      id: 'sp18-b3',
      type: 'scenario',
      cfg: {
        title: 'Dinner Rush Breakdown',
        context: 'It is 5:30 PM on a Saturday. You have 120 covers booked over the next 90 minutes. Your sous chef calls in sick with no notice. Two of your line cooks are already overwhelmed with prep.',
        question: 'How do you reorganize the kitchen? Walk through how you reassign stations, communicate with your team, adjust the menu if needed, and keep service running without compromising food quality or safety.'
      }
    },
    {
      id: 'sp18-b4',
      type: 'multiple-choice',
      cfg: {
        question: 'According to food safety guidelines, what is the minimum safe internal temperature for cooked poultry?',
        options: ['63°C (145°F)', '74°C (165°F)', '82°C (180°F)', '57°C (135°F)'],
        correct: 1,
        multi: false
      }
    },
    {
      id: 'sp18-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Technical Skills', weight: 40, passing: 3.5, note: 'Kitchen knowledge, technique, and culinary aptitude.' }
    },
    {
      id: 'sp18-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Kitchen Leadership', weight: 30, passing: 3.0, note: 'Ability to manage team and operations under pressure.' }
    },
    {
      id: 'sp18-b7',
      type: 'scoring-rule',
      cfg: { pillar: 'Food Safety', weight: 30, passing: 4.0, note: 'Knowledge of and commitment to food safety standards.' }
    },
  ]
}

const sp19: StarterPack = {
  id: 'sp-heavy-equip-safety',
  name: 'Heavy Equipment — Safety & Operational Fit',
  programFamily: 'trades',
  skillFocus: ['Safety', 'Grit'],
  description: 'Screen heavy equipment candidates on certifications, pre-operational safety habits, and the grit required to work safely and productively in demanding outdoor conditions.',
  estimatedDuration: '20 min',
  difficulty: 'Easy',
  blocks: [
    {
      id: 'sp19-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Heavy Equipment Safety & Operational Fit assessment. Safe operation of heavy equipment depends on training, habits, and judgment. This short assessment evaluates your equipment experience, your pre-operational safety practices, and your ability to stay productive and safe under tough conditions. Answer honestly and specifically.' }
    },
    {
      id: 'sp19-b2',
      type: 'video',
      cfg: { question: 'Describe your heavy equipment experience. What types of equipment have you operated, what certifications do you hold, and what environments have you worked in?', maxDuration: 90, attempts: 2, note: 'Be specific about machine types, working conditions, and hours of operation where possible.' }
    },
    {
      id: 'sp19-b3',
      type: 'multiple-choice',
      cfg: {
        question: 'Before operating heavy equipment in an area you have not worked in before, what should you do first?',
        options: [
          'Start immediately — waiting wastes time on a job site',
          'Conduct a thorough site inspection and complete a hazard assessment before operating',
          'Wait for someone else to tell you it is safe to proceed',
          'Check your phone for any messages from the site supervisor'
        ],
        correct: 1,
        multi: false
      }
    },
    {
      id: 'sp19-b4',
      type: 'open-text',
      cfg: { question: 'Describe a time when you had to work through genuinely difficult conditions — weather, terrain, equipment issues, or tight deadlines. How did you stay safe and keep yourself and your crew productive?', wordLimit: 300 }
    },
    {
      id: 'sp19-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Operational Safety', weight: 70, passing: 4.0, note: 'Knowledge of pre-operational checks, site safety, and hazard awareness.' }
    },
    {
      id: 'sp19-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Grit & Reliability', weight: 30, passing: 3.0, note: 'Demonstrated resilience and dependability in demanding conditions.' }
    },
  ]
}

// ─── General Packs ────────────────────────────────────────────────────────────

const sp20: StarterPack = {
  id: 'sp-general-video',
  name: 'General Video Screening — Communication Fit',
  programFamily: 'general',
  skillFocus: ['Communication', 'Motivation'],
  description: 'A flexible, program-agnostic video screening that evaluates a candidate\'s communication style, self-awareness, and clarity of goals.',
  estimatedDuration: '20 min',
  difficulty: 'Easy',
  blocks: [
    {
      id: 'sp20-b1',
      type: 'intro',
      cfg: { text: 'Welcome to this video screening assessment. This is your opportunity to introduce yourself and share your goals in your own words. There are no trick questions. Please answer each question as honestly and clearly as you can. Speak directly to the camera and take your time before starting each response.' }
    },
    {
      id: 'sp20-b2',
      type: 'video',
      cfg: { question: 'Please introduce yourself. Tell us about your background — where you are coming from — and what you are hoping to get out of this program.', maxDuration: 90, attempts: 2, note: 'Speak naturally. You have up to 90 seconds.' }
    },
    {
      id: 'sp20-b3',
      type: 'video',
      cfg: { question: 'What do you consider your biggest strength, and how do you think that strength will help you succeed in this program and your future career?', maxDuration: 90, attempts: 2, note: 'Be specific and give a real example if you can.' }
    },
    {
      id: 'sp20-b4',
      type: 'open-text',
      cfg: { question: 'Where do you see yourself 3 years from now? What does success look like to you, and what steps are you planning to take to get there?', wordLimit: 250 }
    },
    {
      id: 'sp20-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Communication Clarity', weight: 50, passing: 3.0, note: 'Clarity, fluency, and structure of spoken and written responses.' }
    },
    {
      id: 'sp20-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Motivation & Goals', weight: 50, passing: 3.0, note: 'Specificity and authenticity of stated goals and motivations.' }
    },
  ]
}

const sp21: StarterPack = {
  id: 'sp-general-workethic',
  name: 'Work Ethic & Motivation Assessment',
  programFamily: 'general',
  skillFocus: ['Motivation', 'Grit'],
  description: 'A general-purpose assessment for evaluating a candidate\'s drive, resilience, and ability to manage competing demands with integrity.',
  estimatedDuration: '25 min',
  difficulty: 'Easy',
  blocks: [
    {
      id: 'sp21-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Work Ethic & Motivation assessment. This assessment helps us understand what drives you, how you handle adversity, and how you manage competing priorities. Please answer each question with specific examples from your own life — work, school, volunteer experience, or personal challenges all count.' }
    },
    {
      id: 'sp21-b2',
      type: 'video',
      cfg: { question: 'Tell us about a meaningful goal you set for yourself. What was the goal, what obstacles did you face, and what did you do to achieve it?', maxDuration: 120, attempts: 2, note: 'This can be academic, professional, personal, or athletic. Be specific about what you did.' }
    },
    {
      id: 'sp21-b3',
      type: 'scenario',
      cfg: {
        title: 'Competing Demands',
        context: 'You have two important deadlines on the same day — one for a school assignment and one for a commitment you made to a work or volunteer team. Both are genuinely important and neither can be easily postponed. Your supervisor is unavailable to advise you.',
        question: 'How do you decide what to prioritize? Walk through your reasoning and describe how you would communicate your decision to both parties involved.'
      }
    },
    {
      id: 'sp21-b4',
      type: 'open-text',
      cfg: { question: 'Describe a time when you failed at something or fell short of your own expectations. What happened, how did you feel, and what did you do next? What did you learn from that experience?', wordLimit: 350 }
    },
    {
      id: 'sp21-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Motivation', weight: 50, passing: 3.0, note: 'Evidence of self-direction, goal-setting, and intrinsic drive.' }
    },
    {
      id: 'sp21-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Resilience', weight: 50, passing: 3.0, note: 'Ability to recover from setbacks and adapt to competing pressures.' }
    },
  ]
}

const sp22: StarterPack = {
  id: 'sp-general-cognitive',
  name: 'General Cognitive Skills Assessment',
  programFamily: 'general',
  skillFocus: ['Critical Thinking', 'Analytical'],
  description: 'A program-agnostic cognitive assessment measuring logical reasoning, analytical thinking, and structured problem-solving.',
  estimatedDuration: '25 min',
  difficulty: 'Moderate',
  blocks: [
    {
      id: 'sp22-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the General Cognitive Skills Assessment. This assessment evaluates your logical reasoning, analytical thinking, and ability to approach problems in a structured way. Some questions may feel unfamiliar — that is intentional. We are looking for how you think, not just what you know. Take your time and show your work where possible.' }
    },
    {
      id: 'sp22-b2',
      type: 'multiple-choice',
      cfg: {
        question: 'If all Bloops are Razzies, and all Razzies are Lazzies, are all Bloops definitely Lazzies?',
        options: ['Yes — all Bloops must be Lazzies', 'No — Bloops cannot be Lazzies', 'Cannot be determined from the information given'],
        correct: 0,
        multi: false
      }
    },
    {
      id: 'sp22-b3',
      type: 'case-study',
      cfg: {
        title: 'Resource Allocation Problem',
        context: 'You are part of a team of 5 people. You have 3 projects that all need to be completed within 2 weeks. However, you only have enough time and resources to complete 2 of them properly within that window.',
        tasks: [
          'How would you assess which 2 projects to prioritize? What criteria would you use?',
          'What additional information would you need before making this decision?',
          'How would you communicate this decision to the stakeholders of the project that gets deferred?'
        ]
      }
    },
    {
      id: 'sp22-b4',
      type: 'open-text',
      cfg: { question: 'Describe how you approach learning something completely new — a skill, a subject, or a tool you had never encountered before. What is your process? What strategies have worked best for you?', wordLimit: 300 }
    },
    {
      id: 'sp22-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Logical Reasoning', weight: 50, passing: 3.5, note: 'Accuracy and clarity of deductive and inductive reasoning.' }
    },
    {
      id: 'sp22-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Problem Solving', weight: 50, passing: 3.0, note: 'Structure and quality of approach to the resource allocation case.' }
    },
  ]
}

const sp23: StarterPack = {
  id: 'sp-general-cultural',
  name: 'Cultural Fit & Professionalism Assessment',
  programFamily: 'general',
  skillFocus: ['Professionalism', 'Ethics'],
  description: 'A general-purpose assessment to evaluate a candidate\'s professional values, ethical reasoning, and interpersonal awareness in workplace contexts.',
  estimatedDuration: '20 min',
  difficulty: 'Easy',
  blocks: [
    {
      id: 'sp23-b1',
      type: 'intro',
      cfg: { text: 'Welcome to the Cultural Fit & Professionalism assessment. This assessment helps us understand your professional values, your approach to ethics in the workplace, and how you interact with colleagues and teams. Please answer honestly — we are looking for self-awareness and genuine reflection, not perfect answers.' }
    },
    {
      id: 'sp23-b2',
      type: 'video',
      cfg: { question: 'Describe your ideal work environment and team dynamic. What kind of culture do you thrive in, and what kind of colleague are you to others?', maxDuration: 90, attempts: 2, note: 'Be specific and honest. There is no single right answer.' }
    },
    {
      id: 'sp23-b3',
      type: 'scenario',
      cfg: {
        title: 'Ethical Grey Area',
        context: 'You notice that a colleague on your team has been padding their expense reports — adding small amounts that do not seem legitimate. It has happened a few times and you are not their manager. No one else appears to have noticed.',
        question: 'What do you do? Walk through your reasoning — do you say something, to whom, and how? What factors influence your decision?'
      }
    },
    {
      id: 'sp23-b4',
      type: 'multiple-choice',
      cfg: {
        question: 'A team member publicly takes credit for a significant piece of work you completed. What is your most appropriate first response?',
        options: [
          'Say nothing — it is not worth creating conflict over',
          'Address it privately with your colleague directly and professionally',
          'Escalate to your manager immediately',
          'Post a correction on the team\'s internal communication channel'
        ],
        correct: 1,
        multi: false
      }
    },
    {
      id: 'sp23-b5',
      type: 'scoring-rule',
      cfg: { pillar: 'Professionalism', weight: 50, passing: 3.0, note: 'Tone, self-awareness, and workplace conduct demonstrated across responses.' }
    },
    {
      id: 'sp23-b6',
      type: 'scoring-rule',
      cfg: { pillar: 'Ethics & Integrity', weight: 50, passing: 3.5, note: 'Quality of ethical reasoning and willingness to act with integrity.' }
    },
  ]
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const STARTER_PACKS: StarterPack[] = [
  sp1, sp2, sp3, sp4, sp5,
  sp6, sp7, sp8, sp9, sp10,
  sp11, sp12, sp13, sp14, sp15,
  sp16, sp17, sp18, sp19,
  sp20, sp21, sp22, sp23,
]

export const PROGRAM_FAMILIES: { id: ProgramFamily; label: string; color: string; icon: string }[] = [
  {
    id: 'healthcare',
    label: 'Healthcare',
    color: '#059669',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
  },
  {
    id: 'stem',
    label: 'STEM',
    color: '#3451D1',
    icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18'
  },
  {
    id: 'business',
    label: 'Business',
    color: '#7C3AED',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
  },
  {
    id: 'trades',
    label: 'Trades',
    color: '#D97706',
    icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z'
  },
  {
    id: 'general',
    label: 'General',
    color: '#6B7280',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  },
]
