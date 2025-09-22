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
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

// Default MAGNET categories with scoring
const defaultMagnetCategories: MagnetCategory[] = [
  {
    id: "M",
    name: "Magnetic Captivation",
    description:
      "Pass the 1-second Attention & Instant Clarity check. Clear, bold messaging that earns attention fast and makes them curious to stay beyond the 1-second skim.",
    color: "bg-red-500",
    questions: [
      {
        id: "m1",
        text: "Does the website pass the 1-second attention test?",
        type: "multiple_choice",
        points: 20,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            { value: "needs_work", label: "Needs Work", points: 0.5 },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "m2",
        text: "Is there clear, bold messaging that earns attention fast?",
        type: "multiple_choice",
        points: 20,
        required: true,
        config: {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            { value: "needs_work", label: "Needs Work", points: 0.5 },
            { value: "no", label: "No", points: 0.0 },
          ],
        },
      },
      {
        id: "m3",
        text: "Does it make visitors curious to stay beyond the 1-second skim?",
        type: "multiple_choice",
        points: 20,
        required: true,
      },
      {
        id: "m4",
        text: "Is bounce-worthy confusion eliminated at the top?",
        type: "multiple_choice",
        points: 20,
        required: true,
      },
      {
        id: "m5",
        text: "Does the website stop the scroll and speak directly to the dream client?",
        type: "multiple_choice",
        points: 20,
        required: true,
      },
      {
        id: "m6",
        text: "Additional notes on magnetic captivation:",
        type: "text",
        points: 0,
        required: false,
        config: {
          text: {
            placeholder: "Enter your observations and recommendations...",
            maxLength: 1000,
            multiline: true,
          },
        },
      },
    ],
  },
  {
    id: "A",
    name: "Authentic Connection",
    description:
      'Trigger the "they get me" response that keeps visitors engaged. Position yourself as the trusted guide and build emotional, logical, and philosophical connection in seconds.',
    color: "bg-blue-500",
    questions: [
      {
        id: "a1",
        text: 'Does the website trigger the "they get me" response?',
        type: "multiple_choice",
        points: 17,
        required: true,
      },
      {
        id: "a2",
        text: "Is the brand positioned as a trusted guide, not just another expert?",
        type: "multiple_choice",
        points: 17,
        required: true,
      },
      {
        id: "a3",
        text: "Does it build emotional connection in seconds?",
        type: "multiple_choice",
        points: 16,
        required: true,
      },
      {
        id: "a4",
        text: "Does it build logical connection that makes sense?",
        type: "multiple_choice",
        points: 17,
        required: true,
      },
      {
        id: "a5",
        text: "Does it make strangers feel credible and trustworthy in seconds?",
        type: "multiple_choice",
        points: 16,
        required: true,
      },
      {
        id: "a6",
        text: "Does the website avoid feeling cold, robotic, or disconnected?",
        type: "multiple_choice",
        points: 17,
        required: true,
      },
      {
        id: "a7",
        text: "Additional notes on authentic connection:",
        type: "text",
        points: 0,
        required: false,
      },
    ],
  },
  {
    id: "G",
    name: "GOLDEN Persuasion",
    description:
      "Ethically boost conversions with persuasive storytelling. Make them sense your authority, trust your credibility, and build confidence to say YES fast.",
    color: "bg-yellow-500",
    questions: [
      {
        id: "g1",
        text: "Does the website ethically boost conversions with persuasive storytelling?",
        type: "multiple_choice",
        points: 17,
        required: true,
      },
      {
        id: "g2",
        text: "Do visitors sense authority and trust credibility?",
        type: "multiple_choice",
        points: 17,
        required: true,
      },
      {
        id: "g3",
        text: "Does the strategic content answer silent objections?",
        type: "multiple_choice",
        points: 16,
        required: true,
      },
      {
        id: "g4",
        text: "Does it address risks and frictions effectively?",
        type: "multiple_choice",
        points: 17,
        required: true,
      },
      {
        id: "g5",
        text: "Does it build credibility, authority, and confidence to say YES fast?",
        type: "multiple_choice",
        points: 16,
        required: true,
      },
      {
        id: "g6",
        text: "Does it guide people toward action without pressure, manipulation, confusion, or doubt?",
        type: "multiple_choice",
        points: 17,
        required: true,
      },
      {
        id: "g7",
        text: "Additional notes on GOLDEN persuasion:",
        type: "text",
        points: 0,
        required: false,
      },
    ],
  },
  {
    id: "N",
    name: "Niche-Precision Design",
    description:
      "Design is your number 1 message! Visually match your niche without blending in, with clean layout and smart visual hierarchy that builds instant confidence.",
    color: "bg-green-500",
    questions: [
      {
        id: "n1",
        text: "Does the design visually match the niche without blending in?",
        type: "multiple_choice",
        points: 17,
        required: true,
      },
      {
        id: "n2",
        text: "Is there a clean layout with smart visual hierarchy?",
        type: "multiple_choice",
        points: 17,
        required: true,
      },
      {
        id: "n3",
        text: "Is the design coherent and conversion-friendly?",
        type: "multiple_choice",
        points: 16,
        required: true,
      },
      {
        id: "n4",
        text: "Does it build instant confidence?",
        type: "multiple_choice",
        points: 17,
        required: true,
      },
      {
        id: "n5",
        text: "Does it look and feel like the expert the audience has been searching for?",
        type: "multiple_choice",
        points: 16,
        required: true,
      },
      {
        id: "n6",
        text: "Does the site's vibe match the niche and positioning while feeling uniquely yours?",
        type: "multiple_choice",
        points: 17,
        required: true,
      },
      {
        id: "n7",
        text: "Additional notes on niche-precision design:",
        type: "text",
        points: 0,
        required: false,
      },
    ],
  },
  {
    id: "E",
    name: "Elegant Experience",
    description:
      "Ensure your site loads fast, works everywhere, and feels like a smooth ride not a frustrating maze. Fast, responsive mobile-optimized experience that builds trust.",
    color: "bg-purple-500",
    questions: [
      {
        id: "e1",
        text: "Does the site load fast and work everywhere?",
        type: "multiple_choice",
        points: 15,
        required: true,
      },
      {
        id: "e2",
        text: "Does it feel like a smooth ride, not a frustrating maze?",
        type: "multiple_choice",
        points: 14,
        required: true,
      },
      {
        id: "e3",
        text: "Is it fast and responsive with mobile optimization?",
        type: "multiple_choice",
        points: 14,
        required: true,
      },
      {
        id: "e4",
        text: "Does it build trust through a clean, premium feel?",
        type: "multiple_choice",
        points: 14,
        required: true,
      },
      {
        id: "e5",
        text: "Do visitors stay longer and explore more?",
        type: "multiple_choice",
        points: 14,
        required: true,
      },
      {
        id: "e6",
        text: "Can visitors take seamless action without friction?",
        type: "multiple_choice",
        points: 15,
        required: true,
      },
      {
        id: "e7",
        text: "Is staying and buying effortless, not frustrating?",
        type: "multiple_choice",
        points: 14,
        required: true,
      },
      {
        id: "e8",
        text: "Additional notes on elegant experience:",
        type: "text",
        points: 0,
        required: false,
      },
    ],
  },
  {
    id: "T",
    name: "Targeted Dominance",
    description:
      "No more winking in the dark! Improve visibility in search, socials, and beyond. Build long-term discoverability and position yourself as the go-to, not just another option.",
    color: "bg-orange-500",
    questions: [
      {
        id: "t1",
        text: "Does the website improve visibility in search and socials?",
        type: "multiple_choice",
        points: 17,
        required: true,
      },
      {
        id: "t2",
        text: "Does it build long-term discoverability?",
        type: "multiple_choice",
        points: 17,
        required: true,
      },
      {
        id: "t3",
        text: "Is the brand positioned as the go-to, not just another option?",
        type: "multiple_choice",
        points: 16,
        required: true,
      },
      {
        id: "t4",
        text: "Do dream clients actually find the website?",
        type: "multiple_choice",
        points: 17,
        required: true,
      },
      {
        id: "t5",
        text: "Is the site SEO-optimized and social-ready?",
        type: "multiple_choice",
        points: 16,
        required: true,
      },
      {
        id: "t6",
        text: "Is it built to show up where the audience hangs out?",
        type: "multiple_choice",
        points: 17,
        required: true,
      },
      {
        id: "t7",
        text: "Additional notes on targeted dominance:",
        type: "text",
        points: 0,
        required: false,
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

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("magnet-settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setMagnetCategories(parsed);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("magnet-settings", JSON.stringify(magnetCategories));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }, [magnetCategories]);

  const updateCategory = (
    categoryId: string,
    updates: Partial<MagnetCategory>,
  ) => {
    console.log("SettingsContext: Updating category", categoryId, updates);
    setMagnetCategories((prev) => {
      const updated = prev.map((cat) =>
        cat.id === categoryId ? { ...cat, ...updates } : cat,
      );
      console.log("SettingsContext: Categories after update", updated.length);
      return updated;
    });
  };

  const addCategory = (categoryData: Omit<MagnetCategory, "id">) => {
    const newCategory: MagnetCategory = {
      ...categoryData,
      id: `${categoryData.name.charAt(0).toUpperCase()}${Date.now()}`,
      questions: [],
    };

    console.log("SettingsContext: Adding new category", newCategory);
    setMagnetCategories((prev) => {
      const updated = [...prev, newCategory];
      console.log("SettingsContext: Categories after add", updated.length);
      return updated;
    });
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

    console.log(
      "SettingsContext: Adding question to category",
      categoryId,
      newQuestion,
    );
    setMagnetCategories((prev) => {
      const updated = prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, questions: [...cat.questions, newQuestion] }
          : cat,
      );
      console.log(
        "SettingsContext: Categories after question add",
        updated.length,
      );
      return updated;
    });
  };

  const getDefaultQuestionConfig = (type: Question["type"]) => {
    switch (type) {
      case "multiple_choice":
        return {
          options: [
            { value: "yes", label: "Yes", points: 1.0 },
            { value: "needs_work", label: "Needs Work", points: 0.5 },
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
              // Use custom options for scoring
              const selectedOption = question.config.options.find(
                (opt) => opt.value === response.answer,
              );
              if (selectedOption && selectedOption.points !== undefined) {
                questionScore = Math.floor(
                  question.points * selectedOption.points,
                );
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
