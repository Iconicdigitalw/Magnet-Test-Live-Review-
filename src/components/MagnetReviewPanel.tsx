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
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  SettingsProvider,
  SettingsContext,
  useSettings,
  type Question as SettingsQuestion,
  type MagnetCategory,
} from "@/contexts/SettingsContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

// Use the Question type from SettingsContext for consistency
type Question = SettingsQuestion;

// TabData is compatible with MagnetCategory from SettingsContext
type TabData = MagnetCategory;

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
  isMinimized?: boolean;
  onMinimizeToggle?: () => void;
}

// Inner panel that assumes SettingsContext is available
const MagnetReviewPanelInner: React.FC<MagnetReviewPanelProps> = ({
  activeTab = "M",
  projectId = "default-project",
  reviewId = "default-review",
  onTabChange = () => {},
  onResponseSave = () => {},
  onSubmit = () => {},
  isMinimized = false,
  onMinimizeToggle = () => {},
}) => {
  // Use dynamic settings from context
  const { magnetCategories: magnetTabs } = useSettings();

  const [responses, setResponses] = useState<
    Record<string, { answer: string; notes: string }>
  >({});
  const [expandedSubOptions, setExpandedSubOptions] = useState<
    Record<string, boolean>
  >({});
  const [showSelectedBall, setShowSelectedBall] = useState<
    Record<string, boolean>
  >({});
  // Set initial tab to first available tab or fallback to activeTab prop
  const initialTab = magnetTabs.length > 0 ? magnetTabs[0].id : activeTab;
  const [currentVisibleTab, setCurrentVisibleTab] =
    useState<string>(initialTab);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate storage key for persistence
  const storageKey = `magnet-review-${projectId}-${reviewId}`;

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

      // Handle sub-options expansion
      if (answer === "needs_work") {
        setExpandedSubOptions((prev) => ({
          ...prev,
          [questionId]: true,
        }));
      } else {
        setExpandedSubOptions((prev) => ({
          ...prev,
          [questionId]: false,
        }));
      }

      return updatedResponses;
    });
  };

  const handleSubOptionChange = (
    questionId: string,
    mainValue: string,
    subValue: string,
  ) => {
    const combinedAnswer = `${mainValue}:${subValue}`;
    handleResponseChange(questionId, combinedAnswer);

    // Also expand the sub-options when a sub-option is selected
    setExpandedSubOptions((prev) => ({
      ...prev,
      [questionId]: true,
    }));
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
    if (!scrollAreaRef.current) return;

    // Find the actual scrollable viewport
    let scrollRoot = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLElement;

    if (!scrollRoot) {
      scrollRoot = scrollAreaRef.current;
    }

    const observer = new IntersectionObserver(handleIntersection, {
      root: scrollRoot,
      rootMargin: "-20% 0px -60% 0px", // Adjusted margins for better detection
      threshold: [0, 0.1, 0.3, 0.5, 0.7, 1], // Multiple thresholds for better detection
    });

    // Re-observe all sections when the observer is set up
    const observeSections = () => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) {
          observer.observe(ref);
        }
      });
    };

    // Longer delay to ensure refs are properly set
    const timeoutId = setTimeout(observeSections, 200);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [handleIntersection, magnetTabs.length]);

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

  // Update current visible tab when activeTab prop changes or magnetTabs change.
  // Also scroll to the section when expanding from minimized state or when activeTab updates externally.
  useEffect(() => {
    if (magnetTabs.length > 0) {
      // If activeTab exists in magnetTabs, use it; otherwise use first tab
      const tabExists = magnetTabs.some((tab) => tab.id === activeTab);
      const targetTab = tabExists ? activeTab : magnetTabs[0].id;

      // Always update the current visible tab when activeTab changes
      if (targetTab !== currentVisibleTab) {
        setCurrentVisibleTab(targetTab);

        // If panel is not minimized, ensure we scroll the content to the selected section
        if (!isMinimized) {
          // Longer delay to ensure sections are mounted and refs are set
          setTimeout(() => {
            scrollToSection(targetTab);
          }, 150);
        }
      }
    }
  }, [activeTab, magnetTabs, isMinimized, currentVisibleTab]);

  // Scroll to section when tab is clicked
  const scrollToSection = (tabId: string) => {
    const sectionRef = sectionRefs.current[tabId];
    if (sectionRef && scrollAreaRef.current) {
      // Get the scroll area viewport - try multiple selectors
      let scrollViewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement;

      if (!scrollViewport) {
        // Fallback selectors
        scrollViewport = scrollAreaRef.current.querySelector(
          ".scroll-area-viewport",
        ) as HTMLElement;
      }

      if (!scrollViewport) {
        // Last fallback - look for scrollable element
        scrollViewport = scrollAreaRef.current.querySelector(
          "[style*='overflow']",
        ) as HTMLElement;
      }

      if (scrollViewport) {
        const sectionTop = sectionRef.offsetTop;
        scrollViewport.scrollTo({
          top: sectionTop - 10, // Small offset for better visibility
          behavior: "smooth",
        });
      } else {
        // Direct fallback to scrollIntoView
        sectionRef.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    }
  };

  // Handle tab click
  const handleTabClick = (tabId: string) => {
    console.log("Tab clicked:", tabId, "Current:", currentVisibleTab);
    setCurrentVisibleTab(tabId);
    onTabChange(tabId);
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      scrollToSection(tabId);
    }, 50);
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

  // Handle minimized state
  if (isMinimized) {
    return (
      <div className="flex flex-col items-center bg-transparent h-full justify-center py-4">
        {/* Vertical MAGNET Tabs */}
        <div className="flex flex-col gap-2">
          {magnetTabs.map((tab) => {
            const isActive = tab.id === currentVisibleTab;
            const isAnswered = tab.questions.some((q) =>
              isQuestionAnswered(q.id),
            );

            return (
              <button
                key={tab.id}
                onClick={() => {
                  console.log(
                    "Minimized tab clicked:",
                    tab.id,
                    "Current:",
                    currentVisibleTab,
                  );
                  // First update the tab, then expand
                  setCurrentVisibleTab(tab.id);
                  onTabChange(tab.id);
                  // Expand the panel first
                  onMinimizeToggle();
                  // Then scroll to the section after expansion
                  setTimeout(() => {
                    scrollToSection(tab.id);
                  }, 100);
                }}
                className={`h-8 w-8 text-sm font-medium transition-colors flex items-center justify-center rounded ${
                  isActive
                    ? `${tab.color} text-white shadow-lg`
                    : "text-gray-700 hover:bg-gray-50 border border-gray-100 bg-white shadow-sm"
                } ${isAnswered ? "ring-1 ring-primary/30" : "opacity-60"}`}
              >
                {tab.id}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background flex flex-col">
      {/* Tab Navigation */}
      <div className="border-b">
        <Tabs value={currentVisibleTab} onValueChange={handleTabClick}>
          <TabsList
            className={`w-full h-12`}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${magnetTabs.length}, 1fr)`,
            }}
          >
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
      <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
        <div className="space-y-0">
          {magnetTabs.map((tab, tabIndex) => (
            <div
              key={tab.id}
              ref={(el) => (sectionRefs.current[tab.id] = el)}
              data-tab-id={tab.id}
              // Increased min height for better detection
              className="min-h-[300px]"
            >
              {/* Section Header */}
              <div className={`p-4 ${tab.color} text-white`}>
                <h3 className="font-bold text-lg">{tab.name}</h3>
                <p className="text-sm text-white/90 mt-1">{tab.description}</p>
              </div>

              {/* Questions */}
              <div className="p-4 space-y-6">
                {tab.questions.map((question) => {
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
                      <CardContent
                        className={`overflow-hidden ${isAnswered ? "opacity-75" : ""}`}
                      >
                        {question.type === "multiple_choice" ? (
                          <div className="space-y-3">
                            <RadioGroup
                              value={
                                responses[question.id]?.answer?.includes(":")
                                  ? responses[question.id]?.answer?.split(
                                      ":",
                                    )[0]
                                  : responses[question.id]?.answer || ""
                              }
                              onValueChange={(value) => {
                                handleResponseChange(question.id, value);
                              }}
                              className="flex flex-col space-y-1"
                            >
                              {question.config?.options?.map((option) => {
                                const getIconForOption = (
                                  value: string,
                                  points: number,
                                ) => {
                                  if (points >= 0.8)
                                    return (
                                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                                    );
                                  if (points >= 0.3)
                                    return (
                                      <HelpCircle className="w-4 h-4 mr-1 text-amber-500" />
                                    );
                                  return (
                                    <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
                                  );
                                };

                                return (
                                  <div key={option.value} className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem
                                        value={option.value}
                                        id={`${question.id}-${option.value}`}
                                        checked={
                                          option.value === "needs_work"
                                            ? responses[
                                                question.id
                                              ]?.answer?.startsWith(
                                                "needs_work:",
                                              )
                                            : responses[question.id]?.answer ===
                                              option.value
                                        }
                                      />
                                      <Label
                                        htmlFor={`${question.id}-${option.value}`}
                                        className="flex items-center"
                                      >
                                        {getIconForOption(
                                          option.value,
                                          option.points || 0,
                                        )}
                                        {option.label}
                                        {option.value === "needs_work" && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              setShowSelectedBall((prev) => ({
                                                ...prev,
                                                [question.id]:
                                                  !prev[question.id],
                                              }));
                                            }}
                                            className="ml-2 p-1 hover:bg-muted rounded transition-colors"
                                            title={
                                              showSelectedBall[question.id]
                                                ? "Hide all options"
                                                : "Show all options"
                                            }
                                          >
                                            {showSelectedBall[question.id] ? (
                                              <EyeOff className="h-3 w-3 text-muted-foreground" />
                                            ) : (
                                              <Eye className="h-3 w-3 text-muted-foreground" />
                                            )}
                                          </button>
                                        )}
                                      </Label>
                                      {/* Show selected ball by default when needs_work is selected */}
                                      {option.value === "needs_work" &&
                                        responses[
                                          question.id
                                        ]?.answer?.startsWith(
                                          "needs_work:",
                                        ) && (
                                          <div className="ml-2">
                                            {(() => {
                                              const subValue =
                                                responses[
                                                  question.id
                                                ]?.answer?.split(":")[1];
                                              const selectedSubOption =
                                                option.subOptions?.find(
                                                  (subOpt) =>
                                                    subOpt.value === subValue,
                                                );
                                              return selectedSubOption ? (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setShowSelectedBall(
                                                      (prev) => ({
                                                        ...prev,
                                                        [question.id]:
                                                          !prev[question.id],
                                                      }),
                                                    );
                                                  }}
                                                  className="text-lg hover:scale-110 transition-transform cursor-pointer"
                                                  title={`${selectedSubOption.label} - Click to ${showSelectedBall[question.id] ? "hide" : "show"} all options`}
                                                >
                                                  {selectedSubOption.color}
                                                </button>
                                              ) : null;
                                            })()}
                                          </div>
                                        )}
                                    </div>
                                    {/* Sub-options for "needs_work" */}
                                    {option.value === "needs_work" &&
                                      (expandedSubOptions[question.id] ||
                                        showSelectedBall[question.id]) &&
                                      option.subOptions &&
                                      !responses[question.id]?.answer?.includes(
                                        ":",
                                      ) && (
                                        <div className="ml-6 mt-2 p-3 bg-muted/30 rounded-lg border-l-2 border-amber-300 flex flex-col items-start py-0 justify-start w-[169.76484421071655px]">
                                          <div className="text-xs text-muted-foreground mb-2 w-[152.35384843985912px]">
                                            How much work is needed?
                                          </div>
                                          <div className="flex space-x-2 items-start content-start my-0 w-[120px] justify-start">
                                            <TooltipProvider>
                                              {option.subOptions.map(
                                                (subOption) => {
                                                  const isSelected =
                                                    responses[question.id]
                                                      ?.answer ===
                                                    `${option.value}:${subOption.value}`;
                                                  return (
                                                    <Tooltip
                                                      key={subOption.value}
                                                    >
                                                      <TooltipTrigger
                                                        asChild
                                                        className=" w-[18px] h-[18px]"
                                                      >
                                                        <button
                                                          type="button"
                                                          onClick={() =>
                                                            handleSubOptionChange(
                                                              question.id,
                                                              option.value,
                                                              subOption.value,
                                                            )
                                                          }
                                                          className={`text-lg transition-all duration-200 hover:scale-110 ${
                                                            isSelected
                                                              ? "ring-1 ring-gray-400 ring-offset-[2px] rounded-full"
                                                              : "hover:opacity-80"
                                                          }`}
                                                        >
                                                          {subOption.color}
                                                        </button>
                                                      </TooltipTrigger>
                                                      <TooltipContent>
                                                        <p className="text-sm font-medium">
                                                          {subOption.label}
                                                        </p>
                                                      </TooltipContent>
                                                    </Tooltip>
                                                  );
                                                },
                                              )}
                                            </TooltipProvider>
                                          </div>
                                        </div>
                                      )}
                                    {/* Show sub-options when a ball is selected and user wants to see all options */}
                                    {option.value === "needs_work" &&
                                      showSelectedBall[question.id] &&
                                      option.subOptions &&
                                      responses[question.id]?.answer?.includes(
                                        ":",
                                      ) && (
                                        <div className="ml-6 mt-2 p-3 bg-muted/30 rounded-lg border-l-2 border-amber-300">
                                          <div className="text-xs text-muted-foreground mb-2">
                                            How much work is needed?
                                          </div>
                                          <div className="flex items-center space-x-2 w-[148.22594387949573px]">
                                            <TooltipProvider>
                                              {option.subOptions.map(
                                                (subOption) => {
                                                  const isSelected =
                                                    responses[question.id]
                                                      ?.answer ===
                                                    `${option.value}:${subOption.value}`;
                                                  return (
                                                    <Tooltip
                                                      key={subOption.value}
                                                    >
                                                      <TooltipTrigger
                                                        asChild
                                                        className="flex"
                                                      >
                                                        <button
                                                          type="button"
                                                          onClick={() =>
                                                            handleSubOptionChange(
                                                              question.id,
                                                              option.value,
                                                              subOption.value,
                                                            )
                                                          }
                                                          className={`text-lg transition-all duration-200 hover:scale-110 ${
                                                            isSelected
                                                              ? "ring-1 ring-gray-400 ring-offset-[2px] rounded-full"
                                                              : "hover:opacity-80"
                                                          }`}
                                                        >
                                                          {subOption.color}
                                                        </button>
                                                      </TooltipTrigger>
                                                      <TooltipContent>
                                                        <p className="text-sm font-medium">
                                                          {subOption.label}
                                                        </p>
                                                      </TooltipContent>
                                                    </Tooltip>
                                                  );
                                                },
                                              )}
                                            </TooltipProvider>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                );
                              }) || (
                                // Fallback to default options if no custom options
                                <>
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
                                </>
                              )}
                            </RadioGroup>
                            <Separator className="my-2" />
                            <Textarea
                              placeholder="Add notes (optional)"
                              className="min-h-[60px] text-sm w-full max-w-full"
                              value={responses[question.id]?.notes || ""}
                              onChange={(e) =>
                                handleNotesChange(question.id, e.target.value)
                              }
                            />
                          </div>
                        ) : question.type === "rating" ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>
                                {question.config?.rating?.minLabel || "Min"}
                              </span>
                              <span>
                                {question.config?.rating?.maxLabel || "Max"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 flex-wrap flex-shrink-0 gap-x-[0px] ml-[8px] ml-0.5 px-1 w-[188.39407873928712px] h-[51.165958842118016px]">
                              {Array.from(
                                {
                                  length:
                                    (question.config?.rating?.max || 5) -
                                    (question.config?.rating?.min || 1) +
                                    1,
                                },
                                (_, i) => {
                                  const value =
                                    (question.config?.rating?.min || 1) + i;
                                  return (
                                    <Button
                                      key={value}
                                      type="button"
                                      variant={
                                        responses[question.id]?.answer ===
                                        value.toString()
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() =>
                                        handleResponseChange(
                                          question.id,
                                          value.toString(),
                                        )
                                      }
                                      className="flex-shrink-0 gap-x-0.5 ml-[5px] px-[5px] w-[30.68332308552226px] h-[35.85925470467657px] px-[8px] w-[31.19467713103154px] h-[32.231015804824324px] w-[28.081941028507345px] h-[29.12360896673988px] justify-center items-center flex-row"
                                    >
                                      {value}
                                    </Button>
                                  );
                                },
                              )}
                            </div>
                            <Separator className="my-2" />
                            <Textarea
                              placeholder="Add notes (optional)"
                              className="min-h-[60px] text-sm w-full max-w-full"
                              value={responses[question.id]?.notes || ""}
                              onChange={(e) =>
                                handleNotesChange(question.id, e.target.value)
                              }
                            />
                          </div>
                        ) : (
                          <Textarea
                            placeholder={
                              question.config?.text?.placeholder ||
                              "Enter your response"
                            }
                            className={`w-full max-w-full ${
                              question.config?.text?.multiline
                                ? "min-h-[100px]"
                                : "min-h-[60px]"
                            }`}
                            maxLength={question.config?.text?.maxLength}
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
      <div className="border-t bg-background p-3 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between gap-3 w-full max-w-full">
          {/* Navigation Arrows */}
          <div className="flex items-center gap-1 shrink-0">
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
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Compact Progress */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
              <span className="shrink-0">
                {getCompletionStats().percentage}%
              </span>
              <div className="h-1.5 w-16 rounded-full bg-secondary/20 shrink-0">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${getCompletionStats().percentage}%` }}
                />
              </div>
              <span className="whitespace-nowrap shrink-0">
                {getCompletionStats().answered}/{getCompletionStats().total}
              </span>
            </div>

            {/* Auto-save Status */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
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
            className="h-8 shrink-0"
          >
            <Send className="h-4 w-4 mr-1" />
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Outer component that ensures a provider exists
const MagnetReviewPanel: React.FC<MagnetReviewPanelProps> = (props) => {
  const ctx = React.useContext(SettingsContext as React.Context<any>);
  if (!ctx) {
    return (
      <SettingsProvider>
        <MagnetReviewPanelInner {...props} />
      </SettingsProvider>
    );
  }
  return <MagnetReviewPanelInner {...props} />;
};

export default MagnetReviewPanel;
