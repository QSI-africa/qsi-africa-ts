import OpenAI from 'openai';
import prisma from '../config/prisma';
import type { ChatMessage } from '../types';

// Lazy-load OpenAI client to avoid crash if API key is not set
let openaiInstance: OpenAI | null = null;

const getOpenAIClient = (): OpenAI => {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
};

interface ContactInfo {
  name: string;
  email: string;
}

interface HealingPackage {
  title: string;
  shortPreview: string;
}

interface AIChatMessage {
  sender: 'user' | 'ai' | 'assistant';
  text: string;
}

interface InfrastructureToolCall {
  type: 'tool_call';
  toolCall: any;
}

interface InfrastructureMessage {
  type: 'message';
  text: string;
}

type InfrastructureResponse = InfrastructureToolCall | InfrastructureMessage;

interface VisionQuestion {
  type: 'question';
  section: string;
  text: string;
}

interface VisionSummary {
  type: 'summary_confirmation';
  section: string;
  text: string;
}

interface VisionFinal {
  type: 'final';
  markdown: string;
  modelUsed: string;
}

interface VisionMessage {
  type: 'message';
  text: string;
}

type VisionResponse = VisionQuestion | VisionSummary | VisionFinal | VisionMessage;

interface HealingRecommendation {
  type: 'recommendation';
  text: string;
}

type HealingResponse = HealingRecommendation | { type: 'message'; text: string };

interface ProfileData {
  fullName: string;
  location: string;
  personalBeliefs: string;
  background: string;
  lifeVision: string;
  challenges: string;
}
const visionTools = [
  {
    type: "function" as const,
    function: {
      name: "ask_clarifying_question",
      description:
        "Ask the user a specific question to gather information for a section of the vision document.",
      parameters: {
        type: "object",
        properties: {
          section_key: { type: "string" },
          question_text: { type: "string" },
        },
        required: ["section_key", "question_text"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "summarize_and_confirm_section",
      description:
        "Present a summary of the gathered information for a specific section and ask the user for confirmation or refinement before moving to the next section.",
      parameters: {
        type: "object",
        properties: {
          section_key: { type: "string" },
          summary_text: { type: "string" },
          next_section_key: { type: "string" },
        },
        required: ["section_key", "summary_text"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "submit_vision_document",
      description:
        "Submit the final, fully structured vision document in Markdown format once all sections (A-G) are complete.",
      parameters: {
        type: "object",
        properties: {
          markdown_document: { type: "string" },
        },
        required: ["markdown_document"],
      },
    },
  },
];

// server/src/services/aiService.js
// ... (imports)

// --- ADD NEW TOOLS FOR HEALING ---
const healingTools = [
  {
    type: "function" as const,
    function: {
      name: "ask_for_problem",
      description:
        "Use this for greetings, general questions, and asking clarifying questions to understand the user's problem. Do NOT use this to recommend.",
      parameters: {
        type: "object",
        properties: {
          question_text: {
            type: "string",
            description: "The conversational text or question to ask the user.",
          },
        },
        required: ["question_text"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "recommend_packages",
      description:
        "Use this ONLY when you understand the user's problem. Recommend 1-3 packages and explain WHY they fit in detail.",
      parameters: {
        type: "object",
        properties: {
          recommendation_text: {
            type: "string",
            description:
              "The full, detailed recommendation text for the user, explaining your choices and prompting them to click a package.",
          },
        },
        required: ["recommendation_text"],
      },
    },
  },
];

/* -------------------------------------------
   EXAMPLE VISION TEMPLATE (truncated)
------------------------------------------- */

const visionExample1 = `### Vision and Context
  The Urban Decongestion and Mobility Planning (UDMP) initiative views the city as a living organism — an intelligent system where roads, drainage, housing, institutions, and human behavior form one continuous field. Traditional planning isolates these components, fragmenting what should function as a unified, responsive whole. UDMP restores this coherence by aligning engineering and governance with quantum-inspired principles that mirror the laws of nature and consciousness itself:

  * **Quantum Entanglement:** Just as particles remain linked across distance, communities, economies, and individuals are interconnected in invisible ways. A decision in one area — a policy, a road, a zoning reform — creates ripples throughout the entire social and spatial fabric.
  * **Resonance:** When people, systems, and nations align in vision, gratitude, and coherence, transformation amplifies naturally. A single act of alignment can uplift whole populations, proving that social harmony is a measurable form of energy.
  * **Least Action Principle:** Nature always achieves transformation through the path of least wasted energy. For Africa, this means aligning development with natural flows — designing systems that evolve efficiently, elegantly, and sustainably, without unnecessary resistance or excess.
  * **Superposition and Coherence:** Every urban problem holds multiple potential solutions. Through structured intelligence and unified intent, UDMP "collapses" these possibilities into one coherent outcome — a solution that harmonizes functionality, dignity, and sustainability.

  In this vision, infrastructure becomes conscious architecture — a living, breathing expression of balance between human need and natural order. Cities are no longer chaotic expansions of matter, but organized reflections of collective clarity and national alignment.

  ### Core Focus Areas
  1. **CBD Congestion Mapping:** Identify pressure zones, flow bottlenecks, and commuter corridors through data and satellite imagery. Incorporate community insights for inclusive intelligence.
  2. **Public Transport Enhancement:** Modernize and rebrand public transport to restore dignity, reliability, and cultural pride in shared mobility.
  3. **Smart Employer-Linked Housing:** Design workforce housing clusters directly connected to transit systems — efficient, inclusive, and powered by sustainable utilities.
  4. **Adaptive Traffic Signal Optimization:** Deploy responsive traffic systems to regulate flow and ensure safety through real-time data-driven control.
  5. **Workforce Remote Optimization:** Introduce hybrid and remote work systems for institutions to reduce unnecessary daily travel while activating localized productivity hubs.
  6. **Government Service Redistribution:** Establish decentralized service hubs near transport corridors — improving access while reducing congestion in the CBD.
  7. **Zoning and Spatial Planning Reform:** Modernize zoning policies to promote pedestrian-first, mixed-use, and transit-oriented development that reflects modern African cities.
  8. **Smart Parking and Access Regulation:** Launch SmartPark Accounts — prepaid, mobile-enabled parking solutions that eliminate disputes and align with future smart city integrations.
  9. **Stormwater Management & Drainage Optimization:** Re-engineer drainage as an integral part of urban mobility, piloting sustainable, localized systems in flood-prone areas like Seventh Street.

  ### Strategic Advantages
  * Fully aligned with Vision 2030 and NDS1
  * Merges academic research with public policy
  * Encourages community-inclusive design and transparency
  * Positions Harare as a continental model for mobility coherence
  * Builds confidence through visible, measurable transformation

  ### Role of Pan African Engineers
  * Lead the technical architecture and project delivery
  * Coordinate national and municipal stakeholders
  * Mentor students and young professionals
  * Convert research data into actionable, smart infrastructure
  * Define continental standards for coherent city planning

  ### Institutional Engagement
  Pan African Engineers has initiated formal communication and engagement with the following key institutions:
  * Ministry of Transport and Infrastructural Development
  * Ministry of Local Government and Public Works
  * Zimbabwe Anti-Corruption Commission (ZACC)
  * Environmental Management Agency (EMA)
  * Zimbabwe Broadcasting Corporation (ZBC)
  * Zimbabwe United Passenger Company (ZUPCO)
  * Zimbabwe Institution of Engineers (ZIE)
  These engagements are at various stages of acknowledgment and review. While formal responses are pending, the communication channels have been opened.

  ### Immediate Actions
  * Formalize City of Harare collaboration for pilot implementation.
  * Identify high-impact short-term deliverables.
  * Integrate SmartPark framework with City Parking.
  * Engage innovators, universities, and developers for scalable pilot solutions.

  ### Strategic Invitation
  Pan African Engineers invites developers, businesses, and visionary thinkers to align their projects with this initiative — contributing to national progress through structured collaboration, mentorship, and sustainable engineering.`;

function getVisionModel(messages: AIChatMessage[]): string {
  const userMessageCount = messages.filter((m) => m.sender === "user").length;
  const lastMsg = messages[messages.length - 1]?.text?.toLowerCase() || "";

  // If this looks like the final stage (AI is about to synthesize full document)
  if (lastMsg.includes("confirm") || lastMsg.includes("final document")) {
    return "gpt-4.1"; // Use full GPT-4.1 for high-quality synthesis
  }

  // If it's the first interaction(s), use fast model for intro
  if (userMessageCount <= 1) {
    return "gpt-4o-mini";
  }

  // Default interactive mode
  return "gpt-4o-mini";
}

const infrastructureTool = {
  type: "function" as const,
  function: {
    name: "submit_infrastructure_request",
    description:
      "Submits the complete infrastructure request once all information is gathered.",
    parameters: {
      type: "object",
      properties: {
        project_type: {
          type: "string",
          description:
            'The type of project, e.g., "new house", "road repair", "drainage system".',
        },
        location: {
          type: "string",
          description:
            "The suburb, area, or city where the project is located.",
        },
        scope_details: {
          type: "string",
          description:
            'Specific details about the project. For a house, "3 bedrooms, 2 bathrooms". For a road, "approx. 2km length".',
        },
      },
      required: ["project_type", "location", "scope_details"],
    },
  },
};

async function continueInfrastructureChat(
  messages: AIChatMessage[],
  contactInfo: ContactInfo
): Promise<InfrastructureResponse> {
  const { name, email } = contactInfo;

  const systemPrompt = `
    You are a polite, professional, and highly efficient project intake specialist for Hyper Civil Engineers.
    Your user's name is ${name}. Their email is ${email}. DO NOT ask for this information.
    Your goal is to gather the necessary details to provide a quote by using the 'submit_infrastructure_request' tool.
    
    Follow this script precisely:
    1.  Your first message MUST be a greeting and ask what project they have in mind. (e.g., "Welcome, ${name}. What infrastructure project are you considering today?")
    2.  Ask ONE follow-up question at a time to get the 'project_type', 'location', and 'scope_details'.
    3.  Be concise. Keep your questions minimal. You must get all info in just 2-3 questions.
    4.  Once you have all three pieces of information, you MUST call the 'submit_infrastructure_request' tool.
    5.  Do not make small talk. Be professional and efficient.
    6. Always inform them that they will receive a quotation within 24 to 48 hours.
  `;

  const apiMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((msg): { role: "user" | "assistant"; content: string } => ({
      role: msg.sender === "ai" || msg.sender === "assistant" ? "assistant" : "user",
      content: msg.text,
    })),
  ];

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: apiMessages,
      tools: [infrastructureTool],
      tool_choice: "auto",
    });

    const responseMessage = response.choices[0].message;

    // Check if the AI wants to call our tool
    if (responseMessage.tool_calls) {
      // FIX: Return the tool call to the route handler for orchestration
      return {
        type: "tool_call",
        toolCall: responseMessage.tool_calls[0],
      };
    }

    return {
      type: "message",
      text: responseMessage.content || "Please continue.",
    };
  } catch (error: any) {
    console.error("Error in infrastructure chat:", error);
    // Return a structured message, not a raw object
    return {
      type: "message",
      text: "My apologies, I seem to have encountered a system error. Please try again shortly.",
    };
  }
}

async function continueVisionChat(
  messages: AIChatMessage[],
  contactInfo: ContactInfo
): Promise<VisionResponse> {
  const { name } = contactInfo;

  const systemPrompt = `
    You are a friendly and insightful **Vision Architect AI** for the **QSI Platform**, collaborating with ${name}.
    Your mission is to act as a partner, helping ${name} explore and structure their vision into a comprehensive document.

    ---

    ### 🧭 Workflow (Collaborative & Iterative)

    1.  **Start Warmly & Explain:**
        * Greet ${name}. Acknowledge their initial idea. Explain the section-by-section process with summaries for review.
        * Ask the first question for **"Vision and Context"** using **ask_clarifying_question** (key: "vision_context").
        * Example: "Okay ${name}, great starting point! Let’s begin building your vision document together, section by section. First, tell me about the core 'Vision and Context'. What's the deeper purpose or the main problem you're addressing?"

    2.  **Section Flow (Ask → Summarize → Confirm → Proceed):**
        For each section (A–G):
        * **Ask:** Use **ask_clarifying_question** to gather details for the *current section*. If the user's response is brief or refers to your suggestions (like "yes, those points"), gently ask for a little more detail specific to *their* vision based on those points. Ask only **one main question per turn**.
        * **Summarize & Confirm:** Once you have sufficient detail for the *current section*, call **summarize_and_confirm_section**. Provide a concise summary in "summary_text" and set "next_section_key" (or null for the last section).
            * Example Confirmation: "Got it. Here's a summary for *[Section Name]*: [summary_text]. Does that capture your thoughts, or is there anything to adjust before we discuss *[Next Section Name]*?"
        * **Handle User Response to Summary:**
            * **If User Confirms ("Yes", "Looks good", "Proceed", "Move on", etc.):** Acknowledge the confirmation briefly (e.g., "Perfect.") **Then, immediately** ask the *first* question for the **next section** using **ask_clarifying_question**. **Do NOT repeat the summary.**
            * **If User Provides Refinements:** Acknowledge the changes ("Okay, updated."). Integrate them. Then, call **summarize_and_confirm_section** *again* for the **current section** with the *updated summary*, asking for confirmation once more.

    3.  **Section Keys & Order:**
        A. "vision_context" → next: "core_focus_areas"
        B. "core_focus_areas" → next: "strategic_advantages"
        C. "strategic_advantages" → next: "stakeholder_role"
        D. "stakeholder_role" → next: "institutional_engagement"
        E. "institutional_engagement" → next: "immediate_actions"
        F. "immediate_actions" → next: "strategic_invitation"
        G. "strategic_invitation" → next: "null"

        --ask at most 3 questions per sections

    4.  **Final Assembly & Submission (CRITICAL):**
        * **ONLY AFTER** the user confirms the summary for the **final section (G - strategic_invitation)**, compile ALL confirmed section summaries into one complete **Markdown document** using the specified format.
        * Make **one single call** to **submit_vision_document** with the complete Markdown.
        * **DO NOT** output the final document as conversational text.

    ---

    ### 📝 Final Markdown Format
    \`\`\`markdown
    ### Vision and Context
    (Summary text A)

    ### Core Focus Areas
    (Summary text B - use bullets/numbers)

    ### Strategic Advantages
    (Summary text C - use bullets)

    ### Role of [Stakeholder Name from D]
    (Summary text D - use bullets)

    ### Institutional Engagement
    (Summary text E)

    ### Immediate Actions
    (Summary text F - use bullets/numbers)

    ### Strategic Invitation
    (Summary text G)
    \`\`\`

    ---

    ### 🎨 Tone & Style
    * **Collaborative & Encouraging:** "Great!", "Okay, let's explore that", "Does that feel right?" Use ${name}'s name occasionally.
    * **Concise:** Keep summaries brief. Ask **one primary question** per turn.
    * **Clear Transitions:** Explicitly state when moving to the next section after confirmation.

    ---

    **Goal:** Guide ${name} smoothly, confirm understanding at each step, handle confirmations correctly, and submit the final document via the tool. the final document should be inline with the structure of ${visionExample1}
    `;
  const apiMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((msg): { role: "user" | "assistant"; content: string } => ({
      role: msg.sender === "ai" || msg.sender === "assistant" ? "assistant" : "user",
      content: msg.text,
    })),
  ];

  // Determine which model to use based on phase
  const selectedModel = getVisionModel(messages);
  console.log(
    `🧩 Using model: ${selectedModel} for Vision Chat (User: ${name})`
  );

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: selectedModel,
      messages: apiMessages,
      tools: visionTools,
      tool_choice: "auto",
    });

    const message = response.choices[0].message;

    if (message.tool_calls) {
      const toolCall = message.tool_calls[0];
      if ('function' in toolCall) {
        const fn = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

      switch (fn) {
        case "ask_clarifying_question":
          return {
            type: "question",
            section: args.section_key,
            text: args.question_text,
          };

        case "summarize_and_confirm_section":
          const nextDisplay = args.next_section_key
            ? `'${args.next_section_key.replace(/_/g, " ")}'`
            : "the final document submission";
          return {
            type: "summary_confirmation",
            section: args.section_key,
            text: `Okay, here's a summary for '${args.section_key.replace(
              /_/g,
              " "
            )}':\n\n${
              args.summary_text
            }\n\nDoes that sound right, or would you like to refine anything before we move on to ${nextDisplay}?`,
          };

        case "submit_vision_document":
          return {
            type: "final",
            markdown: args.markdown_document,
            modelUsed: selectedModel,
          };

        default:
          return {
            type: "message",
            text: "I tried to process that step, but something seems off. Let's retry that section.",
          };
      }
      }
    }

    // If no tool call, return message content
    if (message.content) {
      return { type: "message", text: message.content };
    }

    return {
      type: "message",
      text: "I'm having trouble formulating a response. Could you restate your thought?",
    };
  } catch (error: any) {
    console.error("❌ Error in Vision Chat:", error);
    let msg =
      "I encountered an issue processing your vision. Please try again shortly.";
    if (error.response?.data?.error?.message)
      msg = error.response.data.error.message;
    return { type: "message", text: msg };
  }
}

async function generateFrequencyProfile(
  profileData: ProfileData
): Promise<string> {
  const {
    fullName,
    location,
    personalBeliefs,
    background,
    lifeVision,
    challenges,
  } = profileData;

  const systemPrompt = `
    You are a QSI (Quantum Spiritual Intelligence) Analyst.
    You have received a detailed profile from a new user. Your task is to analyze this qualitative and emotional data to create a "Frequency Profile."

    USER DATA:
    - Full Name: ${fullName}
    - Location: ${location}
    - Personal Beliefs/Worldview: ${personalBeliefs}
    - Educational/Professional Background: ${background}
    - Life Vision (Goals, Trajectory): ${lifeVision}
    - Current Challenges (Emotional, Relational, Financial): ${challenges}

    ANALYSIS TASK:
    Using the principles of coherence and alignment, generate a "Frequency Profile" in Markdown format. This profile must outline:
    1.  **Vibrational Tendencies:** Based on their beliefs, vision, and challenges, what are their dominant thought patterns (e.g., "expansion-oriented," "stuck in scarcity loop," "seeking coherence").
    2.  **Key Contradictions (if any):** Identify any inner contradictions between their stated beliefs and their challenges (e.g., "Believes in abundance but is stuck in financial fear").
    3.  **Coherence Level (Estimate):** A brief assessment of their current alignment (e.g., "High potential, but currently fragmented," "Strongly aligned in career, but misaligned in relationships").
    4.  **Growth Potential & Path:** Suggest 1-2 key areas of focus for them to achieve greater coherence, based on the QSI framework.

    Respond *only* with the structured Markdown profile.
  `;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini", // Or a more powerful model for this complex task
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7,
    });
    return completion.choices[0].message.content || "Error: Could not generate profile analysis.";
  } catch (error: any) {
    console.error("Error generating Frequency Profile:", error);
    return "Error: Could not generate profile analysis.";
  }
}

async function continueHealingChat(
  messages: AIChatMessage[],
  contactInfo: ContactInfo,
  packages: HealingPackage[]
): Promise<HealingResponse> {
  const { name } = contactInfo;
  const packageList = packages
    .map((p) => `- Title: "${p.title}", Description: "${p.shortPreview}"`)
    .join("\n");

  const systemPrompt = `
    You are a compassionate and insightful QSI Healing Guide talking to ${name}.
    Your goal is to have a natural conversation, understand the user's problem, and then recommend relevant packages.

    WORKFLOW:
    1.  **Converse:** If the user greets you ("Hi") or asks a general question, respond conversationally using the 'ask_for_problem' tool. Your goal is to gently guide them to share what they are experiencing.
    2.  **Understand:** Once the user describes a problem (e.g., "I feel stressed"), analyze it.
    3.  **Recommend:** Call the 'recommend_packages' tool. In 'recommendation_text', you MUST provide:
        a. An empathetic acknowledgment of their problem.
        b. Detailed reasoning for 1-3 recommended packages from the list below, explaining *why* they fit the user's problem.
        c. A clear prompt for them to *click* a package on the sidebar to submit their inquiry.

    Available Packages:
    ${packageList}

    IMPORTANT: Your job is ONLY to converse and recommend. You do NOT generate a 'Liberation Plan'. You do NOT save anything. Your final step is the recommendation.
  `;

  const apiMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((msg): { role: "user" | "assistant"; content: string } => ({
      role: msg.sender === "ai" || msg.sender === "assistant" ? "assistant" : "user",
      content: msg.text,
    })),
  ];

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: apiMessages,
      tools: healingTools,
      tool_choice: "auto",
    });

    const msg = response.choices[0].message;

    if (msg.tool_calls) {
      const toolCall = msg.tool_calls[0];
      if ('function' in toolCall) {
        const fnName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

      if (fnName === "ask_for_problem") {
        return { type: "message", text: args.question_text };
      }
      if (fnName === "recommend_packages") {
        return { type: "recommendation", text: args.recommendation_text };
      }
      }
    }
    // Fallback for any conversational text
    return { type: "message", text: msg.content || "Please continue." };
  } catch (error: any) {
    console.error("Error in continueHealingChat:", error);
    return {
      type: "message",
      text: "Sorry, I encountered an error. Please try again.",
    };
  }
}

export {
  continueInfrastructureChat,
  continueVisionChat,
  generateFrequencyProfile,
  continueHealingChat,
};
