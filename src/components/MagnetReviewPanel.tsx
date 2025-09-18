import React, { useState, useEffect, useRef, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Question {
  id: string;
  text: string;
  type: "multiple_choice" | "text" | "rating";
}

interface TabData {
  id: string;
  name: string;
  description: string;
  color: string;
  questions: Question[];
}

interface MagnetReviewPanelProps {
  activeTab?: string;
  projectId?: string;
  reviewId?: string;
  onTabChange?: (tabId: string) => void;
  onResponseSave?: (
    tabId: string,
    questionId: string,
    answer: string,
    notes: string,
  ) => void;
  onSubmit?: (
    responses: Record<string, { answer: string; notes: string }>,
  ) => void;
}

const MagnetReviewPanel: React.FC<MagnetReviewPanelProps> = ({
  activeTab = "M",
  projectId = "default-project",
  reviewId = "default-review",
  onTabChange = () => {},
  onResponseSave = () => {},
  onSubmit = () => {},
}) => {
  const [responses, setResponses] = useState<
    Record<string, { answer: string; notes: string }>
  >({});
  const [currentVisibleTab, setCurrentVisibleTab] = useState<string>(activeTab);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate storage key for persistence
  const storageKey = `magnet-review-${projectId}-${reviewId}`;

  // MAGNET Framework data based on the official framework
  const magnetTabs: TabData[] = [
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
        },
        {
          id: "m2",
          text: "Is there clear, bold messaging that earns attention fast?",
          type: "multiple_choice",
        },
        {
          id: "m3",
          text: "Does it make visitors curious to stay beyond the 1-second skim?",
          type: "multiple_choice",
        },
        {
          id: "m4",
          text: "Is bounce-worthy confusion eliminated at the top?",
          type: "multiple_choice",
        },
        {
          id: "m5",
          text: "Does the website stop the scroll and speak directly to the dream client?",
          type: "multiple_choice",
        },
        {
          id: "m6",
          text: "Additional notes on magnetic captivation:",
          type: "text",
        },
      ],
    },
    {
      id: "A",
      name: "Authentic Connection",
      description:
        "Trigger the 'they get me' response that keeps visitors engaged. Position yourself as the trusted guide and build emotional, logical, and philosophical connection in seconds.",
      color: "bg-blue-500",
      questions: [
        {
          id: "a1",
          text: "Does the website trigger the 'they get me' response?",
          type: "multiple_choice",
        },
        {
          id: "a2",
          text: "Is the brand positioned as a trusted guide, not just another expert?",
          type: "multiple_choice",
        },
        {
          id: "a3",
          text: "Does it build emotional connection in seconds?",
          type: "multiple_choice",
        },
        {
          id: "a4",
          text: "Does it build logical connection that makes sense?",
          type: "multiple_choice",
        },
        {
          id: "a5",
          text: "Does it make strangers feel credible and trustworthy in seconds?",
          type: "multiple_choice",
        },
        {
          id: "a6",
          text: "Does the website avoid feeling cold, robotic, or disconnected?",
          type: "multiple_choice",
        },
        {
          id: "a7",
          text: "Additional notes on authentic connection:",
          type: "text",
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
        },
        {
          id: "g2",
          text: "Do visitors sense authority and trust credibility?",
          type: "multiple_choice",
        },
        {
          id: "g3",
          text: "Does the strategic content answer silent objections?",
          type: "multiple_choice",
        },
        {
          id: "g4",
          text: "Does it address risks and frictions effectively?",
          type: "multiple_choice",
        },
        {
          id: "g5",
          text: "Does it build credibility, authority, and confidence to say YES fast?",
          type: "multiple_choice",
        },
        {
          id: "g6",
          text: "Does it guide people toward action without pressure, manipulation, confusion, or doubt?",
          type: "multiple_choice",
        },
        {
          id: "g7",
          text: "Additional notes on GOLDEN persuasion:",
          type: "text",
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
        },
        {
          id: "n2",
          text: "Is there a clean layout with smart visual hierarchy?",
          type: "multiple_choice",
        },
        {
          id: "n3",
          text: "Is the design coherent and conversion-friendly?",
          type: "multiple_choice",
        },
        {
          id: "n4",
          text: "Does it build instant confidence?",
          type: "multiple_choice",
        },
        {
          id: "n5",
          text: "Does it look and feel like the expert the audience has been searching for?",
          type: "multiple_choice",
        },
        {
          id: "n6",
          text: "Does the site's vibe match the niche and positioning while feeling uniquely yours?",
          type: "multiple_choice",
        },
        {
          id: "n7",
          text: "Additional notes on niche-precision design:",
          type: "text",
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
        },
        {
          id: "e2",
          text: "Does it feel like a smooth ride, not a frustrating maze?",
          type: "multiple_choice",
        },
        {
          id: "e3",
          text: "Is it fast and responsive with mobile optimization?",
          type: "multiple_choice",
        },
        {
          id: "e4",
          text: "Does it build trust through a clean, premium feel?",
          type: "multiple_choice",
        },
        {
          id: "e5",
          text: "Do visitors stay longer and explore more?",
          type: "multiple_choice",
        },
        {
          id: "e6",
          text: "Can visitors take seamless action without friction?",
          type: "multiple_choice",
        },
        {
          id: "e7",
          text: "Is staying and buying effortless, not frustrating?",
          type: "multiple_choice",
        },
        {
          id: "e8",
          text: "Additional notes on elegant experience:",
          type: "text",
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
        },
        {
          id: "t2",
          text: "Does it build long-term discoverability?",
          type: "multiple_choice",
        },
        {
          id: "t3",
          text: "Is the brand positioned as the go-to, not just another option?",
          type: "multiple_choice",
        },
        {
          id: "t4",
          text: "Do dream clients actually find the website?",
          type: "multiple_choice",
        },
        {
          id: "t5",
          text: "Is the site SEO-optimized and social-ready?",
          type: "multiple_choice",
        },
        {
          id: "t6",
          text: "Is it built to show up where the audience hangs out?",
          type: "multiple_choice",
        },
        {
          id: "t7",
          text: "Additional notes on targeted dominance:",
          type: "text",
        },
      ],
    },
  ];

  // Auto-save functionality with debouncing
  const triggerAutoSave = useCallback(
    (updatedResponses: Record<string, { answer: string; notes: string }>) => {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      setAutoSaveStatus("saving");

      // Set new timeout for auto-save
      autoSaveTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(updatedResponses));
          setAutoSaveStatus("saved");

          // Reset status after 2 seconds
          setTimeout(() => setAutoSaveStatus("idle"), 2000);
        } catch (error) {
          console.error("Auto-save failed:", error);
          setAutoSaveStatus("idle");
        }
      }, 1000); // 1 second debounce
    },
    [storageKey],
  );

  const handleResponseChange = (questionId: string, answer: string) => {
    setResponses((prev) => {
      const updatedResponses = {
        ...prev,
        [questionId]: { ...prev[questionId], answer },
      };

      const tabId =
        magnetTabs.find((tab) => tab.questions.some((q) => q.id === questionId))
          ?.id || "";

      onResponseSave(
        tabId,
        questionId,
        updatedResponses[questionId].answer,
        updatedResponses[questionId].notes || "",
      );

      // Trigger auto-save
      triggerAutoSave(updatedResponses);

      return updatedResponses;
    });
  };

  const handleNotesChange = (questionId: string, notes: string) => {
    setResponses((prev) => {
      const updatedResponses = {
        ...prev,
        [questionId]: { ...prev[questionId], notes },
      };

      const tabId =
        magnetTabs.find((tab) => tab.questions.some((q) => q.id === questionId))
          ?.id || "";

      onResponseSave(
        tabId,
        questionId,
        updatedResponses[questionId].answer || "",
        notes,
      );

      // Trigger auto-save
      triggerAutoSave(updatedResponses);

      return updatedResponses;
    });
  };

  // Intersection Observer to detect which section is currently visible
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      // Find the entry with the highest intersection ratio that's actually intersecting
      const intersectingEntries = entries.filter(
        (entry) => entry.isIntersecting,
      );

      if (intersectingEntries.length > 0) {
        // Sort by intersection ratio and get the most visible one
        const mostVisible = intersectingEntries.reduce((prev, current) =>
          current.intersectionRatio > prev.intersectionRatio ? current : prev,
        );

        const tabId = mostVisible.target.getAttribute("data-tab-id");
        if (tabId && tabId !== currentVisibleTab) {
          setCurrentVisibleTab(tabId);
          onTabChange(tabId);
        }
      }
    },
    [currentVisibleTab, onTabChange],
  );

  // Set up intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: scrollAreaRef.current,
      rootMargin: "-10% 0px -70% 0px", // Trigger when section header is near the top
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], // Multiple thresholds for better detection
    });

    // Re-observe all sections when the observer is set up
    const observeSections = () => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) {
          observer.observe(ref);
        }
      });
    };

    // Small delay to ensure refs are set
    const timeoutId = setTimeout(observeSections, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [handleIntersection]);

  // Load saved responses from localStorage on component mount
  useEffect(() => {
    try {
      const savedResponses = localStorage.getItem(storageKey);
      if (savedResponses) {
        const parsedResponses = JSON.parse(savedResponses);
        setResponses(parsedResponses);
        console.log("Loaded saved responses:", parsedResponses);
      }
    } catch (error) {
      console.error("Error loading saved responses:", error);
    }
  }, [storageKey]);

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Update current visible tab when activeTab prop changes
  useEffect(() => {
    setCurrentVisibleTab(activeTab);
  }, [activeTab]);

  // Scroll to section when tab is clicked
  const scrollToSection = (tabId: string) => {
    const sectionRef = sectionRefs.current[tabId];
    if (sectionRef) {
      // Get the scroll area viewport
      const scrollArea = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollArea) {
        const sectionTop = sectionRef.offsetTop;
        scrollArea.scrollTo({
          top: sectionTop,
          behavior: "smooth",
        });
      } else {
        // Fallback to scrollIntoView
        sectionRef.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Handle tab click
  const handleTabClick = (tabId: string) => {
    setCurrentVisibleTab(tabId);
    onTabChange(tabId);
    scrollToSection(tabId);
  };

  // Check if a question has been answered
  const isQuestionAnswered = (questionId: string) => {
    const response = responses[questionId];
    return response && (response.answer || response.notes?.trim());
  };

  // Calculate completion statistics
  const getCompletionStats = () => {
    const allQuestions = magnetTabs.flatMap((tab) => tab.questions);
    const answeredQuestions = allQuestions.filter((q) =>
      isQuestionAnswered(q.id),
    );
    return {
      total: allQuestions.length,
      answered: answeredQuestions.length,
      percentage: Math.round(
        (answeredQuestions.length / allQuestions.length) * 100,
      ),
    };
  };

  // Handle submit functionality
  const handleSubmit = async () => {
    const stats = getCompletionStats();

    if (stats.answered === 0) {
      toast({
        title: "No responses to submit",
        description: "Please answer at least one question before submitting.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate submit operation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      onSubmit(responses);

      toast({
        title: "Review submitted successfully!",
        description: `Submitted ${stats.answered} of ${stats.total} responses (${stats.percentage}% complete).`,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Submit failed",
        description:
          "There was an error submitting your review. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full bg-background flex flex-col">
      <div className="p-4 border-b">
        <p className="text-sm text-muted-foreground">
          Evaluate the website using the MAGNET framework
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <Tabs value={currentVisibleTab} onValueChange={handleTabClick}>
          <TabsList className="w-full grid grid-cols-6 h-12">
            {magnetTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`flex items-center justify-center h-full text-sm font-medium transition-colors ${
                  tab.id === currentVisibleTab
                    ? `${tab.color} text-white`
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.id}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Continuous Scrolling Content */}
      <ScrollArea className="h-[calc(100vh-220px)]" ref={scrollAreaRef}>
        <div className="space-y-0">
          {magnetTabs.map((tab, tabIndex) => (
            <div
              key={tab.id}
              ref={(el) => (sectionRefs.current[tab.id] = el)}
              data-tab-id={tab.id}
              className="min-h-[300px]" // Increased min height for better detection
            >
              {/* Section Header */}
              <div className={`p-4 ${tab.color} text-white`}>
                <h3 className="font-bold text-lg">{tab.name}</h3>
                <p className="text-sm text-white/90 mt-1">{tab.description}</p>
              </div>

              {/* Questions */}
              <div className="p-4 space-y-6">
                {tab.questions.map((question, questionIndex) => {
                  const isAnswered = isQuestionAnswered(question.id);
                  return (
                    <Card
                      key={question.id}
                      className={`transition-all duration-200 ${
                        isAnswered
                          ? "bg-muted/30 border-primary/30 shadow-sm"
                          : "hover:shadow-md"
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle
                          className={`text-sm flex items-center gap-2 ${
                            isAnswered ? "text-muted-foreground" : ""
                          }`}
                        >
                          {question.text}
                          {isAnswered && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className={isAnswered ? "opacity-75" : ""}>
                        {question.type === "multiple_choice" ? (
                          <RadioGroup
                            value={responses[question.id]?.answer || ""}
                            onValueChange={(value) =>
                              handleResponseChange(question.id, value)
                            }
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="yes"
                                id={`${question.id}-yes`}
                              />
                              <Label
                                htmlFor={`${question.id}-yes`}
                                className="flex items-center"
                              >
                                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="no"
                                id={`${question.id}-no`}
                              />
                              <Label
                                htmlFor={`${question.id}-no`}
                                className="flex items-center"
                              >
                                <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
                                No
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="needs_work"
                                id={`${question.id}-needs-work`}
                              />
                              <Label
                                htmlFor={`${question.id}-needs-work`}
                                className="flex items-center"
                              >
                                <HelpCircle className="w-4 h-4 mr-1 text-amber-500" />
                                Needs Work
                              </Label>
                            </div>
                            <Separator className="my-2" />
                            <Textarea
                              placeholder="Add notes (optional)"
                              className="min-h-[60px] text-sm"
                              value={responses[question.id]?.notes || ""}
                              onChange={(e) =>
                                handleNotesChange(question.id, e.target.value)
                              }
                            />
                          </RadioGroup>
                        ) : (
                          <Textarea
                            placeholder="Enter your response"
                            className="min-h-[100px]"
                            value={responses[question.id]?.notes || ""}
                            onChange={(e) =>
                              handleNotesChange(question.id, e.target.value)
                            }
                          />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Add spacing between sections except for the last one */}
              {tabIndex < magnetTabs.length - 1 && (
                <div className="h-4 bg-muted/20" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Compact Footer with Navigation and Actions */}
      <div className="border-t bg-background p-3">
        <div className="flex items-center justify-between gap-3">
          {/* Navigation Arrows */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const currentIndex = magnetTabs.findIndex(
                  (tab) => tab.id === currentVisibleTab,
                );
                if (currentIndex > 0) {
                  handleTabClick(magnetTabs[currentIndex - 1].id);
                }
              }}
              disabled={
                magnetTabs.findIndex((tab) => tab.id === currentVisibleTab) ===
                0
              }
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const currentIndex = magnetTabs.findIndex(
                  (tab) => tab.id === currentVisibleTab,
                );
                if (currentIndex < magnetTabs.length - 1) {
                  handleTabClick(magnetTabs[currentIndex + 1].id);
                }
              }}
              disabled={
                magnetTabs.findIndex((tab) => tab.id === currentVisibleTab) ===
                magnetTabs.length - 1
              }
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress and Auto-save Status */}
          <div className="flex items-center gap-3 flex-1">
            {/* Compact Progress */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{getCompletionStats().percentage}%</span>
              <div className="h-1.5 w-16 rounded-full bg-secondary/20">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${getCompletionStats().percentage}%` }}
                />
              </div>
              <span className="whitespace-nowrap">
                {getCompletionStats().answered}/{getCompletionStats().total}
              </span>
            </div>

            {/* Auto-save Status */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {autoSaveStatus === "saving" && (
                <>
                  <Clock className="h-3 w-3 animate-pulse" />
                  <span>Saving...</span>
                </>
              )}
              {autoSaveStatus === "saved" && (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">Saved</span>
                </>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || getCompletionStats().answered === 0}
            className="h-8"
          >
            <Send className="h-4 w-4 mr-1" />
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MagnetReviewPanel;
