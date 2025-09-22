import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface Question {
  id: string;
  text: string;
  type: "multiple_choice" | "text" | "rating";
  points?: number; // Points for scoring
  required?: boolean;
  // Type-specific configurations
  config?: {
    // For multiple_choice questions
    options?: Array<{
      value: string;
      label: string;
      points?: number; // Points multiplier for this option (0-1)
      subOptions?: Array<{
        value: string;
        label: string;
        color: string;
        points: number; // Points multiplier for sub-option (0-1)
      }>;
    }>;
    // For rating questions
    rating?: {
      min: number;
      max: number;
      minLabel?: string;
      maxLabel?: string;
      step?: number;
    };
    // For text questions
    text?: {
      placeholder?: string;
      maxLength?: number;
      minLength?: number;
      multiline?: boolean;
    };
  };
}

export interface MagnetCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  questions: Question[];
}

export interface ReviewScore {
  reviewId: string;
  projectId: string;
  categoryScores: Record<string, number>; // Category ID -> Score
  totalScore: number;
  maxPossibleScore: number;
  completedAt: string;
  responses: Record<string, { answer: string; notes: string; points: number }>;
}

interface SettingsContextType {
  magnetCategories: MagnetCategory[];
  updateCategory: (
    categoryId: string,
    category: Partial<MagnetCategory>,
  ) => void;
  addCategory: (category: Omit<MagnetCategory, "id">) => void;
  deleteCategory: (categoryId: string) => void;
  addQuestion: (categoryId: string, question: Omit<Question, "id">) => void;
  updateQuestion: (
    categoryId: string,
    questionId: string,
    question: Partial<Question>,
  ) => void;
  deleteQuestion: (categoryId: string, questionId: string) => void;
  reorderQuestions: (categoryId: string, questions: Question[]) => void;
  resetToDefaults: () => void;
  // Scoring functions
  calculateScore: (
    responses: Record<string, { answer: string; notes: string }>,
  ) => ReviewScore;
  saveReviewScore: (score: ReviewScore) => void;
  getReviewScores: (projectId?: string) => ReviewScore[];
  getAverageScores: () => Record<string, number>;
  // Enhanced persistence utilities
  forceImmediateSave: (categories: MagnetCategory[]) => Promise<boolean>;
  saveStatus: "idle" | "saving" | "saved" | "error";
  isLoading: boolean;
  settingsVersion: number;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

// Default MAGNET categories with scoring based on The Magnet Test
const defaultMagnetCategories: MagnetCategory[] = [
  {
    id: "M",
    name: "Manna Magnetic Captivation",
    description:
      "In the first 1 to 3 seconds, does your website share a strong, clear message or bold promise that grabs visitors' attention and makes them curious to learn more or act?",
    color: "bg-red-500",
    questions: [
      {
        id: "m1",
        text: "In the first 1 to 3 seconds, does your website share a strong, clear message or bold promise that grabs visitors' attention and makes them curious to learn more or act?",
        type: "multiple_choice",
        points: 35,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "m2",
        text: "Does your site instantly show an image or video that deeply resonates with what visitors truly desire or need?",
        type: "multiple_choice",
        points: 35,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "m3",
        text: "Can a fifth grader easily & instantly understand exactly WHAT your solution is without asking &quot;what do you do&quot;?",
        type: "multiple_choice",
        points: 30,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
    ],
  },
  {
    id: "A",
    name: "Activate Authentic Connection",
    description:
      "Do you use the exact words and phrases your ideal clients use to describe their biggest challenges or desired outcomes?",
    color: "bg-blue-500",
    questions: [
      {
        id: "a1",
        text: "Do you use the exact words and phrases your ideal clients use to describe their biggest challenges or desired outcomes?",
        type: "multiple_choice",
        points: 25,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "a2",
        text: "Does your site provide clear and logical reasons why visitors should choose you/your solution?",
        type: "multiple_choice",
        points: 25,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "a3",
        text: "Within moments, can website visitors understand HOW your solution works and clearly see what makes it different from alternatives?",
        type: "multiple_choice",
        points: 25,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "a4",
        text: "How well does your site align with/address your potential clients' philosophies or beliefs?",
        type: "multiple_choice",
        points: 25,
        required: true,
        config: {
          options: [
            { value: "excellent", label: "Excellent", points: 1.0 },
            { value: "good", label: "Good", points: 0.75 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "poor", label: "Poor", points: 0.0 },
          ],
        },
      },
    ],
  },
  {
    id: "G",
    name: "Guide with GOLDEN Persuasion",
    description:
      "Is your website messaging framed as an engaging, persuasive story?",
    color: "bg-yellow-500",
    questions: [
      {
        id: "g1",
        text: "Is your website messaging framed as an engaging, persuasive story?",
        type: "multiple_choice",
        points: 15,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "g2",
        text: "Is your website intentionally crafted to answer your ideal client's &quot;unspoken&quot; objections, fears, and concerns?",
        type: "multiple_choice",
        points: 15,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "g3",
        text: "Is your website equipped with lead magnets (like free downloads or videos) to show hesitant prospects the value you deliver?",
        type: "multiple_choice",
        points: 15,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "g4",
        text: "Do you have a CRM system integrated with your website for automated lead segmentation, nurture & follow-ups?",
        type: "multiple_choice",
        points: 15,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "g5",
        text: "Do you use scarcity tactics, like limited-time offers or availability alerts, to create a sense of urgency for visitors?",
        type: "multiple_choice",
        points: 15,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "g6",
        text: "Are your call-to-action (CTA) buttons prominent and visually distinct from other content, making it effortless for visitors to find and click them?",
        type: "multiple_choice",
        points: 15,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "g7",
        text: "In the first 3 seconds on your site, can visitors spot trust and credibility markers, such as reviews, testimonials, or trust badges?",
        type: "multiple_choice",
        points: 15,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "g8",
        text: "Is there a clear privacy policy and terms of service on your website to help build trust and transparency with visitors?",
        type: "multiple_choice",
        points: 15,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
    ],
  },
  {
    id: "N",
    name: "Nail Niche-Precision Design",
    description:
      "Does your website align with the general look and feel of other sites in your niche BUT without blending in OR feeling out of place?",
    color: "bg-green-500",
    questions: [
      {
        id: "n1",
        text: "Does your website align with the general look and feel of other sites in your niche BUT without blending in OR feeling out of place?",
        type: "multiple_choice",
        points: 10,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "n2",
        text: "Does the website's overall design and user experience feel clean, polished, uncluttered, and premium, boosting visitors' confidence in your brand?",
        type: "multiple_choice",
        points: 10,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "n3",
        text: "Are you confident that each website element and section was intentionally & strategically positioned in the right order of appearance?",
        type: "multiple_choice",
        points: 10,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "n4",
        text: "Do you often second guess the appropriateness of your design when compared to the top competitors in your niche?",
        type: "multiple_choice",
        points: 10,
        required: true,
        config: {
          options: [
            { value: "never", label: "Never", points: 1.0 },
            { value: "rarely", label: "Rarely", points: 0.75 },
            { value: "sometimes", label: "Sometimes", points: 0.5 },
            { value: "often", label: "Often", points: 0.0 },
          ],
        },
      },
    ],
  },
  {
    id: "E",
    name: "Engineer Elegant Experience",
    description:
      "Does your site load fast (under 3 seconds) and provide a smooth frustration-free experience on phone and other devices?",
    color: "bg-purple-500",
    questions: [
      {
        id: "e1",
        text: "Does your site load fast (under 3 seconds) and provide a smooth frustration-free experience on phone and other devices?",
        type: "multiple_choice",
        points: 10,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "e2",
        text: "Is your website easy to navigate so that visitors find what they need in just 1-2 clicks?",
        type: "multiple_choice",
        points: 10,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
    ],
  },
  {
    id: "T",
    name: "Trigger Targeted Dominance",
    description:
      "How often does your site show up in google, social media, and AI search?",
    color: "bg-orange-500",
    questions: [
      {
        id: "t1",
        text: "How often does your site show up in google, social media, and AI search?",
        type: "multiple_choice",
        points: 5,
        required: true,
        config: {
          options: [
            { value: "frequently", label: "Frequently", points: 1.0 },
            { value: "sometimes", label: "Sometimes", points: 0.75 },
            { value: "rarely", label: "Rarely", points: 0.5 },
            { value: "never", label: "Never", points: 0.0 },
          ],
        },
      },
      {
        id: "t2",
        text: "Has your website been crafted to position you as a trusted leader and the obvious choice in your industry?",
        type: "multiple_choice",
        points: 5,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "t3",
        text: "How confident are you that your website answers the top 10 questions potential clients often ask?",
        type: "multiple_choice",
        points: 5,
        required: true,
        config: {
          options: [
            { value: "very_confident", label: "Very Confident", points: 1.0 },
            { value: "confident", label: "Confident", points: 0.75 },
            {
              value: "somewhat_confident",
              label: "Somewhat Confident",
              points: 0.5,
            },
            { value: "not_confident", label: "Not Confident", points: 0.0 },
          ],
        },
      },
      {
        id: "t4",
        text: "Do you have a clear marketing strategy that consistently drives potential clients to your site?",
        type: "multiple_choice",
        points: 5,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "t_extra_header",
        text: "Extra",
        type: "text",
        points: 0,
        required: false,
        config: {
          text: {
            placeholder: "--- Extra Questions (Do Not Impact Score) ---",
            maxLength: 0,
            multiline: false,
          },
        },
      },
      {
        id: "t5",
        text: "What is the current monthly revenue of your business?",
        type: "multiple_choice",
        points: 0,
        required: false,
        config: {
          options: [
            { value: "less_than_5k", label: "Less than $5K", points: 0 },
            { value: "5k_9k", label: "$5K - $9K", points: 0 },
            { value: "10k_29k", label: "$10K - $29K", points: 0 },
            { value: "30k_50k", label: "$30K - $50K", points: 0 },
            { value: "more_than_50k", label: "More than $50K", points: 0 },
          ],
        },
      },
      {
        id: "t6",
        text: "How much of that comes directly from your website?",
        type: "multiple_choice",
        points: 0,
        required: false,
        config: {
          options: [
            { value: "0_percent", label: "0%", points: 0 },
            { value: "1_10_percent", label: "1 - 10%", points: 0 },
            { value: "11_30_percent", label: "11 - 30%", points: 0 },
            { value: "31_50_percent", label: "31 - 50%", points: 0 },
            { value: "51_100_percent", label: "51 - 100%", points: 0 },
          ],
        },
      },
    ],
  },
];

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [magnetCategories, setMagnetCategories] = useState<MagnetCategory[]>(
    defaultMagnetCategories,
  );
  const [settingsVersion, setSettingsVersion] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  // Simplified save function
  const saveSettingsToStorage = (categories: MagnetCategory[]): boolean => {
    try {
      const settingsData = {
        categories,
        version: Date.now(),
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem("magnet-settings", JSON.stringify(settingsData));
      setSaveStatus("saved");
      setSettingsVersion(settingsData.version);
      return true;
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("error");
      return false;
    }
  };

  // Simplified load function
  const loadSettingsFromStorage = (): MagnetCategory[] => {
    try {
      const savedSettings = localStorage.getItem("magnet-settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);

        // Handle new format with version
        if (parsed.categories && Array.isArray(parsed.categories)) {
          setSettingsVersion(parsed.version || Date.now());
          return parsed.categories;
        }

        // Handle legacy format
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      return defaultMagnetCategories;
    } catch (error) {
      console.error("Error loading settings:", error);
      return defaultMagnetCategories;
    }
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    setIsLoading(true);
    const loadedCategories = loadSettingsFromStorage();
    setMagnetCategories(loadedCategories);
    setIsLoading(false);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load

    setSaveStatus("saving");
    const timeoutId = setTimeout(() => {
      saveSettingsToStorage(magnetCategories);
    }, 300); // Debounce saves

    return () => clearTimeout(timeoutId);
  }, [magnetCategories, isLoading]);

  // Force immediate save function for critical operations
  const forceImmediateSave = (
    categories: MagnetCategory[],
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const success = saveSettingsToStorage(categories);
      // Additional verification
      setTimeout(() => {
        const verification = loadSettingsFromStorage();
        const isVerified =
          JSON.stringify(verification) === JSON.stringify(categories);
        console.log(
          isVerified ? "✅ Save verified" : "❌ Save verification failed",
        );
        resolve(isVerified);
      }, 50);
    });
  };

  const updateCategory = (
    categoryId: string,
    updates: Partial<MagnetCategory>,
  ) => {
    setMagnetCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, ...updates } : cat)),
    );
  };

  const addCategory = (categoryData: Omit<MagnetCategory, "id">) => {
    const newCategory: MagnetCategory = {
      ...categoryData,
      id: `${categoryData.name.charAt(0).toUpperCase()}${Date.now()}`,
      questions: [],
    };

    setMagnetCategories((prev) => [...prev, newCategory]);
  };

  const deleteCategory = (categoryId: string) => {
    setMagnetCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
  };

  const addQuestion = (
    categoryId: string,
    questionData: Omit<Question, "id">,
  ) => {
    const newQuestion: Question = {
      ...questionData,
      id: `${categoryId.toLowerCase()}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      // Set default config based on question type
      config:
        questionData.config || getDefaultQuestionConfig(questionData.type),
    };

    setMagnetCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, questions: [...cat.questions, newQuestion] }
          : cat,
      ),
    );
  };

  const getDefaultQuestionConfig = (type: Question["type"]) => {
    switch (type) {
      case "multiple_choice":
        return {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            {
              value: "needs_work",
              label: "Needs Work",
              points: 0.5,
              subOptions: [
                {
                  value: "almost_there",
                  label: "Almost There",
                  color: "🔵",
                  points: 0.7,
                },
                {
                  value: "needs_bit_work",
                  label: "Needs a Bit of Work",
                  color: "🟡",
                  points: 0.5,
                },
                {
                  value: "moderate_rework",
                  label: "Moderate Rework",
                  color: "🟠",
                  points: 0.4,
                },
                {
                  value: "significant_fixes",
                  label: "Significant Fixes",
                  color: "🔴",
                  points: 0.3,
                },
                {
                  value: "complete_overhaul",
                  label: "Complete Overhaul",
                  color: "⚫",
                  points: 0.2,
                },
              ],
            },
            { value: "no", label: "No", points: 0.0 },
          ],
        };
      case "rating":
        return {
          rating: {
            min: 1,
            max: 5,
            minLabel: "Poor",
            maxLabel: "Excellent",
            step: 1,
          },
        };
      case "text":
        return {
          text: {
            placeholder: "Enter your response...",
            maxLength: 500,
            multiline: true,
          },
        };
      default:
        return {};
    }
  };

  const updateQuestion = (
    categoryId: string,
    questionId: string,
    updates: Partial<Question>,
  ) => {
    setMagnetCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              questions: cat.questions.map((q) =>
                q.id === questionId ? { ...q, ...updates } : q,
              ),
            }
          : cat,
      ),
    );
  };

  const deleteQuestion = (categoryId: string, questionId: string) => {
    setMagnetCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              questions: cat.questions.filter((q) => q.id !== questionId),
            }
          : cat,
      ),
    );
  };

  const reorderQuestions = (categoryId: string, questions: Question[]) => {
    setMagnetCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, questions } : cat)),
    );
  };

  const resetToDefaults = () => {
    setMagnetCategories(defaultMagnetCategories);
    try {
      localStorage.removeItem("magnet-settings");
    } catch (error) {
      console.error("Error clearing settings from localStorage:", error);
    }
  };

  // Scoring functions
  const calculateScore = (
    responses: Record<string, { answer: string; notes: string }>,
  ): ReviewScore => {
    const categoryScores: Record<string, number> = {};
    let totalScore = 0;
    let maxPossibleScore = 0;
    const scoredResponses: Record<
      string,
      { answer: string; notes: string; points: number }
    > = {};

    magnetCategories.forEach((category) => {
      let categoryScore = 0;
      let categoryMaxScore = 0;

      category.questions.forEach((question) => {
        if (question.points && question.points > 0) {
          categoryMaxScore += question.points;
          const response = responses[question.id];

          if (response && response.answer) {
            let questionScore = 0;

            if (
              question.type === "multiple_choice" &&
              question.config?.options
            ) {
              // Check if it's a sub-option response (contains ":")
              if (response.answer.includes(":")) {
                const [mainValue, subValue] = response.answer.split(":");
                const selectedOption = question.config.options.find(
                  (opt) => opt.value === mainValue,
                );
                if (selectedOption?.subOptions) {
                  const selectedSubOption = selectedOption.subOptions.find(
                    (subOpt) => subOpt.value === subValue,
                  );
                  if (
                    selectedSubOption &&
                    selectedSubOption.points !== undefined
                  ) {
                    questionScore = Math.floor(
                      question.points * selectedSubOption.points,
                    );
                  }
                }
              } else {
                // Use custom options for scoring
                const selectedOption = question.config.options.find(
                  (opt) => opt.value === response.answer,
                );
                if (selectedOption && selectedOption.points !== undefined) {
                  questionScore = Math.floor(
                    question.points * selectedOption.points,
                  );
                }
              }
            } else if (question.type === "rating" && question.config?.rating) {
              // Calculate rating score
              const rating = parseFloat(response.answer);
              const { min, max } = question.config.rating;
              if (!isNaN(rating) && rating >= min && rating <= max) {
                const percentage = (rating - min) / (max - min);
                questionScore = Math.floor(question.points * percentage);
              }
            } else {
              // Fallback to legacy scoring
              switch (response.answer) {
                case "yes":
                  questionScore = question.points;
                  break;
                case "needs_work":
                  questionScore = Math.floor(question.points * 0.5);
                  break;
                case "no":
                  questionScore = 0;
                  break;
                default:
                  questionScore = 0;
              }
            }

            categoryScore += questionScore;
            scoredResponses[question.id] = {
              ...response,
              points: questionScore,
            };
          } else {
            scoredResponses[question.id] = {
              answer: "",
              notes: "",
              points: 0,
            };
          }
        } else {
          // Text questions don't contribute to score
          scoredResponses[question.id] = {
            answer: responses[question.id]?.answer || "",
            notes: responses[question.id]?.notes || "",
            points: 0,
          };
        }
      });

      categoryScores[category.id] = categoryScore;
      totalScore += categoryScore;
      maxPossibleScore += categoryMaxScore;
    });

    return {
      reviewId: `review-${Date.now()}`,
      projectId: "current-project",
      categoryScores,
      totalScore,
      maxPossibleScore,
      completedAt: new Date().toISOString(),
      responses: scoredResponses,
    };
  };

  const saveReviewScore = (score: ReviewScore) => {
    try {
      const existingScores = getReviewScores();
      const updatedScores = [...existingScores, score];
      localStorage.setItem(
        "magnet-review-scores",
        JSON.stringify(updatedScores),
      );
    } catch (error) {
      console.error("Error saving review score:", error);
    }
  };

  const getReviewScores = (projectId?: string): ReviewScore[] => {
    try {
      const scores = localStorage.getItem("magnet-review-scores");
      if (scores) {
        const parsed = JSON.parse(scores) as ReviewScore[];
        return projectId
          ? parsed.filter((s) => s.projectId === projectId)
          : parsed;
      }
    } catch (error) {
      console.error("Error loading review scores:", error);
    }
    return [];
  };

  const getAverageScores = (): Record<string, number> => {
    const scores = getReviewScores();
    if (scores.length === 0) return {};

    const averages: Record<string, number> = {};

    magnetCategories.forEach((category) => {
      const categoryScores = scores.map(
        (s) => s.categoryScores[category.id] || 0,
      );
      const average =
        categoryScores.reduce((sum, score) => sum + score, 0) /
        categoryScores.length;
      averages[category.id] = Math.round(average * 100) / 100; // Round to 2 decimal places
    });

    return averages;
  };

  const value: SettingsContextType = {
    magnetCategories,
    updateCategory,
    addCategory,
    deleteCategory,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    resetToDefaults,
    calculateScore,
    saveReviewScore,
    getReviewScores,
    getAverageScores,
    // Expose additional utilities
    forceImmediateSave,
    saveStatus,
    isLoading,
    settingsVersion,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
