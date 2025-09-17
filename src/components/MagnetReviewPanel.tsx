import React, { useState } from "react";
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
import { CheckCircle, AlertCircle, HelpCircle } from "lucide-react";

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
  onTabChange?: (tabId: string) => void;
  onResponseSave?: (
    tabId: string,
    questionId: string,
    answer: string,
    notes: string,
  ) => void;
}

const MagnetReviewPanel: React.FC<MagnetReviewPanelProps> = ({
  activeTab = "M",
  onTabChange = () => {},
  onResponseSave = () => {},
}) => {
  const [responses, setResponses] = useState<
    Record<string, { answer: string; notes: string }>
  >({});

  // Mock data for MAGNET tabs
  const magnetTabs: TabData[] = [
    {
      id: "M",
      name: "Magnetic Captivation",
      description:
        "Evaluate the visual appeal and first impression of the website",
      color: "bg-[hsl(var(--chart-1))]" || "bg-red-500",
      questions: [
        {
          id: "m1",
          text: "Does the website immediately capture attention?",
          type: "multiple_choice",
        },
        {
          id: "m2",
          text: "Is the visual design appealing and professional?",
          type: "multiple_choice",
        },
        {
          id: "m3",
          text: "Are the colors and imagery aligned with the brand?",
          type: "multiple_choice",
        },
        {
          id: "m4",
          text: "Additional notes on magnetic captivation:",
          type: "text",
        },
      ],
    },
    {
      id: "A",
      name: "Authentic Connection",
      description: "Assess trust, credibility, and brand alignment",
      color: "bg-[hsl(var(--chart-2))]" || "bg-blue-500",
      questions: [
        {
          id: "a1",
          text: "Does the website establish credibility and trust?",
          type: "multiple_choice",
        },
        {
          id: "a2",
          text: "Is the brand voice consistent throughout?",
          type: "multiple_choice",
        },
        {
          id: "a3",
          text: "Are there testimonials or social proof elements?",
          type: "multiple_choice",
        },
        {
          id: "a4",
          text: "Additional notes on authentic connection:",
          type: "text",
        },
      ],
    },
    {
      id: "G",
      name: "GOLDEN Persuasion",
      description: "Evaluate value proposition and compelling content",
      color: "bg-[hsl(var(--chart-3))]" || "bg-yellow-500",
      questions: [
        {
          id: "g1",
          text: "Is the value proposition clearly communicated?",
          type: "multiple_choice",
        },
        {
          id: "g2",
          text: "Does the content persuade visitors effectively?",
          type: "multiple_choice",
        },
        {
          id: "g3",
          text: "Are benefits highlighted more than features?",
          type: "multiple_choice",
        },
        { id: "g4", text: "Additional notes on persuasion:", type: "text" },
      ],
    },
    {
      id: "N",
      name: "Niche-Precision Design",
      description: "Assess target audience fit and specificity",
      color: "bg-[hsl(var(--chart-4))]" || "bg-green-500",
      questions: [
        {
          id: "n1",
          text: "Is the website designed for a specific target audience?",
          type: "multiple_choice",
        },
        {
          id: "n2",
          text: "Does the content address specific pain points?",
          type: "multiple_choice",
        },
        {
          id: "n3",
          text: "Is the messaging tailored to the niche?",
          type: "multiple_choice",
        },
        {
          id: "n4",
          text: "Additional notes on niche-precision:",
          type: "text",
        },
      ],
    },
    {
      id: "E",
      name: "Elegant Experience",
      description: "Evaluate user experience, navigation, and flow",
      color: "bg-[hsl(var(--chart-5))]" || "bg-purple-500",
      questions: [
        {
          id: "e1",
          text: "Is the navigation intuitive and easy to use?",
          type: "multiple_choice",
        },
        {
          id: "e2",
          text: "Does the website load quickly and perform well?",
          type: "multiple_choice",
        },
        {
          id: "e3",
          text: "Is the website responsive across different devices?",
          type: "multiple_choice",
        },
        {
          id: "e4",
          text: "Additional notes on user experience:",
          type: "text",
        },
      ],
    },
    {
      id: "T",
      name: "Targeted Dominance",
      description: "Assess conversion optimization and call-to-actions",
      color: "bg-[hsl(var(--chart-1))]" || "bg-orange-500",
      questions: [
        {
          id: "t1",
          text: "Are call-to-actions clear and compelling?",
          type: "multiple_choice",
        },
        {
          id: "t2",
          text: "Is the conversion path obvious and frictionless?",
          type: "multiple_choice",
        },
        {
          id: "t3",
          text: "Are there appropriate conversion elements on each page?",
          type: "multiple_choice",
        },
        {
          id: "t4",
          text: "Additional notes on conversion optimization:",
          type: "text",
        },
      ],
    },
  ];

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

      return updatedResponses;
    });
  };

  return (
    <div className="w-full max-w-[350px] h-full bg-background border-r">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">MAGNET Review</h2>
        <p className="text-sm text-muted-foreground">
          Evaluate the website using the MAGNET framework
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="w-full grid grid-cols-6 h-12">
          {magnetTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={`${tab.id === activeTab ? tab.color : ""} transition-colors`}
            >
              {tab.id}
            </TabsTrigger>
          ))}
        </TabsList>

        {magnetTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="p-0 m-0">
            <div className={`p-3 ${tab.color}`}>
              <h3 className="font-bold text-white">{tab.name}</h3>
              <p className="text-xs text-white/90">{tab.description}</p>
            </div>

            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="p-4 space-y-6">
                {tab.questions.map((question) => (
                  <Card key={question.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{question.text}</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>

      <div className="p-4 border-t flex justify-between items-center">
        <Button variant="outline" size="sm">
          Previous Tab
        </Button>
        <Button size="sm">Next Tab</Button>
      </div>
    </div>
  );
};

export default MagnetReviewPanel;
