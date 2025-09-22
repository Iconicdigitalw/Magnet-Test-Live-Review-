import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  RotateCcw,
  GripVertical,
  Settings,
  BarChart3,
  ArrowLeft,
  Home,
} from "lucide-react";
import {
  useSettings,
  type Question,
  type MagnetCategory,
} from "@/contexts/SettingsContext";
import { toast } from "@/components/ui/use-toast";

const AdminSettings: React.FC = () => {
  // Add error boundary for context
  let settingsContext;
  try {
    settingsContext = useSettings();
  } catch (error) {
    console.error("Settings context error:", error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Configuration Error
          </h1>
          <p className="text-muted-foreground mb-4">
            The settings context is not available. Please ensure the
            SettingsProvider is properly configured.
          </p>
          <Button onClick={() => (window.location.href = "/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const {
    magnetCategories,
    updateCategory,
    addCategory,
    deleteCategory,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    resetToDefaults,
    getAverageScores,
    getReviewScores,
  } = settingsContext;

  const [activeCategory, setActiveCategory] = useState<string>("M");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingCategory, setEditingCategory] = useState<MagnetCategory | null>(
    null,
  );
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Omit<Question, "id">>({
    text: "",
    type: "multiple_choice",
    points: 10,
    required: true,
    config: {
      options: [
        { value: "yes", label: "Yes", points: 1.0 },
        { value: "needs_work", label: "Needs Work", points: 0.5 },
        { value: "no", label: "No", points: 0.0 },
      ],
    },
  });
  const [newCategory, setNewCategory] = useState<Omit<MagnetCategory, "id">>({
    name: "",
    description: "",
    color: "bg-gray-500",
    questions: [],
  });

  const averageScores = getAverageScores();
  const allScores = getReviewScores();

  const handleSaveQuestion = () => {
    if (!newQuestion.text.trim()) {
      toast({
        title: "Validation Error",
        description: "Question text is required.",
        variant: "destructive",
      });
      return;
    }

    addQuestion(activeCategory, newQuestion);
    setNewQuestion({
      text: "",
      type: "multiple_choice",
      points: 10,
      required: true,
      config: {
        options: [
          { value: "yes", label: "Yes", points: 1.0 },
          { value: "needs_work", label: "Needs Work", points: 0.5 },
          { value: "no", label: "No", points: 0.0 },
        ],
      },
    });
    setShowAddQuestion(false);

    toast({
      title: "Question Added",
      description: "New question has been added successfully.",
    });
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion) return;

    updateQuestion(activeCategory, editingQuestion.id, editingQuestion);
    setEditingQuestion(null);

    toast({
      title: "Question Updated",
      description: "Question has been updated successfully.",
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    deleteQuestion(activeCategory, questionId);
    toast({
      title: "Question Deleted",
      description: "Question has been deleted successfully.",
    });
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  const handleSaveCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    addCategory(newCategory);
    setNewCategory({
      name: "",
      description: "",
      color: "bg-gray-500",
      questions: [],
    });
    setShowAddCategory(false);

    toast({
      title: "Category Added",
      description: "New category has been added successfully.",
    });
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;

    updateCategory(editingCategory.id, editingCategory);
    setEditingCategory(null);

    toast({
      title: "Category Updated",
      description: "Category has been updated successfully.",
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    deleteCategory(categoryId);
    // If we're deleting the active category, switch to the first available one
    if (activeCategory === categoryId) {
      const remainingCategories = magnetCategories.filter(
        (cat) => cat.id !== categoryId,
      );
      if (remainingCategories.length > 0) {
        setActiveCategory(remainingCategories[0].id);
      }
    }
    toast({
      title: "Category Deleted",
      description: "Category has been deleted successfully.",
    });
  };

  const currentCategory = magnetCategories.find(
    (cat) => cat.id === activeCategory,
  );

  const handleBackToApp = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBackToApp}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to App
            </Button>
            <div className="w-px h-6 bg-border" />
            <h1 className="text-xl font-bold">MAGNET Admin Settings</h1>
          </div>
          <Button variant="ghost" onClick={handleBackToApp}>
            <Home className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Question Management
            </h2>
            <p className="text-muted-foreground">
              Manage MAGNET framework questions and scoring system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset to Defaults
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Reset to Default Settings?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset all questions and categories to their
                    default values. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetToDefaults}>
                    Reset Settings
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Tabs defaultValue="questions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="questions">
              <Settings className="mr-2 h-4 w-4" />
              Question Management
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Score Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Category Selector */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">MAGNET Categories</CardTitle>
                    <Dialog
                      open={showAddCategory}
                      onOpenChange={setShowAddCategory}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Add New Category</DialogTitle>
                          <DialogDescription>
                            Create a new MAGNET framework category.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="category-name">Category Name</Label>
                            <Input
                              id="category-name"
                              placeholder="Enter category name..."
                              value={newCategory.name}
                              onChange={(e) =>
                                setNewCategory((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category-description">
                              Description
                            </Label>
                            <Textarea
                              id="category-description"
                              placeholder="Enter category description..."
                              value={newCategory.description}
                              onChange={(e) =>
                                setNewCategory((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              className="min-h-[80px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category-color">Color</Label>
                            <Select
                              value={newCategory.color}
                              onValueChange={(value) =>
                                setNewCategory((prev) => ({
                                  ...prev,
                                  color: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bg-red-500">Red</SelectItem>
                                <SelectItem value="bg-blue-500">
                                  Blue
                                </SelectItem>
                                <SelectItem value="bg-green-500">
                                  Green
                                </SelectItem>
                                <SelectItem value="bg-yellow-500">
                                  Yellow
                                </SelectItem>
                                <SelectItem value="bg-purple-500">
                                  Purple
                                </SelectItem>
                                <SelectItem value="bg-orange-500">
                                  Orange
                                </SelectItem>
                                <SelectItem value="bg-pink-500">
                                  Pink
                                </SelectItem>
                                <SelectItem value="bg-indigo-500">
                                  Indigo
                                </SelectItem>
                                <SelectItem value="bg-gray-500">
                                  Gray
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setShowAddCategory(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleSaveCategory}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Category
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {magnetCategories.map((category) => (
                    <div key={category.id} className="relative group">
                      <Button
                        variant={
                          activeCategory === category.id ? "default" : "ghost"
                        }
                        className={`w-full justify-start text-left h-auto p-3 pr-12 ${
                          activeCategory === category.id
                            ? category.color + " text-white"
                            : ""
                        }`}
                        onClick={() => setActiveCategory(category.id)}
                      >
                        <div>
                          <div className="font-semibold">
                            {category.id} - {category.name}
                          </div>
                          <div className="text-xs opacity-80 mt-1">
                            {category.questions.length} questions
                          </div>
                        </div>
                      </Button>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Dialog
                          open={editingCategory?.id === category.id}
                          onOpenChange={(open) => {
                            if (!open) setEditingCategory(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCategory({ ...category });
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Edit Category</DialogTitle>
                              <DialogDescription>
                                Modify the category details below.
                              </DialogDescription>
                            </DialogHeader>
                            {editingCategory && (
                              <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-category-name">
                                    Category Name
                                  </Label>
                                  <Input
                                    id="edit-category-name"
                                    value={editingCategory.name}
                                    onChange={(e) =>
                                      setEditingCategory((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              name: e.target.value,
                                            }
                                          : null,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-category-description">
                                    Description
                                  </Label>
                                  <Textarea
                                    id="edit-category-description"
                                    value={editingCategory.description}
                                    onChange={(e) =>
                                      setEditingCategory((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              description: e.target.value,
                                            }
                                          : null,
                                      )
                                    }
                                    className="min-h-[80px]"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-category-color">
                                    Color
                                  </Label>
                                  <Select
                                    value={editingCategory.color}
                                    onValueChange={(value) =>
                                      setEditingCategory((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              color: value,
                                            }
                                          : null,
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="bg-red-500">
                                        Red
                                      </SelectItem>
                                      <SelectItem value="bg-blue-500">
                                        Blue
                                      </SelectItem>
                                      <SelectItem value="bg-green-500">
                                        Green
                                      </SelectItem>
                                      <SelectItem value="bg-yellow-500">
                                        Yellow
                                      </SelectItem>
                                      <SelectItem value="bg-purple-500">
                                        Purple
                                      </SelectItem>
                                      <SelectItem value="bg-orange-500">
                                        Orange
                                      </SelectItem>
                                      <SelectItem value="bg-pink-500">
                                        Pink
                                      </SelectItem>
                                      <SelectItem value="bg-indigo-500">
                                        Indigo
                                      </SelectItem>
                                      <SelectItem value="bg-gray-500">
                                        Gray
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setEditingCategory(null)}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleUpdateCategory}>
                                <Save className="mr-2 h-4 w-4" />
                                Update Category
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        {magnetCategories.length > 1 && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Category?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the category
                                  &quot;{category.name}&quot; and all its
                                  questions. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteCategory(category.id)
                                  }
                                >
                                  Delete Category
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Question Management */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded ${currentCategory?.color}`}
                        ></span>
                        {currentCategory?.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentCategory?.description}
                      </p>
                    </div>
                    <Dialog
                      open={showAddQuestion}
                      onOpenChange={setShowAddQuestion}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Question
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Add New Question</DialogTitle>
                          <DialogDescription>
                            Create a new question for the{" "}
                            {currentCategory?.name} category.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="question-text">Question Text</Label>
                            <Textarea
                              id="question-text"
                              placeholder="Enter the question text..."
                              value={newQuestion.text}
                              onChange={(e) =>
                                setNewQuestion((prev) => ({
                                  ...prev,
                                  text: e.target.value,
                                }))
                              }
                              className="min-h-[80px]"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="question-type">
                                Question Type
                              </Label>
                              <Select
                                value={newQuestion.type}
                                onValueChange={(
                                  value: "multiple_choice" | "text" | "rating",
                                ) =>
                                  setNewQuestion((prev) => ({
                                    ...prev,
                                    type: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="multiple_choice">
                                    Multiple Choice
                                  </SelectItem>
                                  <SelectItem value="text">
                                    Text Response
                                  </SelectItem>
                                  <SelectItem value="rating">
                                    Rating Scale
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="question-points">Points</Label>
                              <Input
                                id="question-points"
                                type="number"
                                min="0"
                                max="100"
                                value={newQuestion.points}
                                onChange={(e) =>
                                  setNewQuestion((prev) => ({
                                    ...prev,
                                    points: parseInt(e.target.value) || 0,
                                  }))
                                }
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="question-required"
                              checked={newQuestion.required}
                              onChange={(e) =>
                                setNewQuestion((prev) => ({
                                  ...prev,
                                  required: e.target.checked,
                                }))
                              }
                            />
                            <Label htmlFor="question-required">
                              Required Question
                            </Label>
                          </div>

                          {/* Type-specific configuration */}
                          {newQuestion.type === "multiple_choice" && (
                            <div className="space-y-3">
                              <Label>Answer Options</Label>
                              {/* Column Headers */}
                              <div className="grid grid-cols-12 gap-2 items-center text-sm font-medium text-muted-foreground">
                                <div className="col-span-3">Option Value</div>
                                <div className="col-span-4">Display Label</div>
                                <div className="col-span-3">
                                  Point Multiplier
                                </div>
                                <div className="col-span-2">Actions</div>
                              </div>
                              {newQuestion.config?.options?.map(
                                (option, index) => (
                                  <div
                                    key={index}
                                    className="grid grid-cols-12 gap-2 items-center"
                                  >
                                    <Input
                                      placeholder="e.g., yes"
                                      value={option.value}
                                      onChange={(e) => {
                                        const newOptions = [
                                          ...(newQuestion.config?.options ||
                                            []),
                                        ];
                                        newOptions[index] = {
                                          ...option,
                                          value: e.target.value,
                                        };
                                        setNewQuestion((prev) => ({
                                          ...prev,
                                          config: {
                                            ...prev.config,
                                            options: newOptions,
                                          },
                                        }));
                                      }}
                                      className="col-span-3"
                                    />
                                    <Input
                                      placeholder="e.g., Yes"
                                      value={option.label}
                                      onChange={(e) => {
                                        const newOptions = [
                                          ...(newQuestion.config?.options ||
                                            []),
                                        ];
                                        newOptions[index] = {
                                          ...option,
                                          label: e.target.value,
                                        };
                                        setNewQuestion((prev) => ({
                                          ...prev,
                                          config: {
                                            ...prev.config,
                                            options: newOptions,
                                          },
                                        }));
                                      }}
                                      className="col-span-4"
                                    />
                                    <Input
                                      type="number"
                                      placeholder="0.0 - 1.0"
                                      min="0"
                                      max="1"
                                      step="0.1"
                                      value={option.points}
                                      onChange={(e) => {
                                        const newOptions = [
                                          ...(newQuestion.config?.options ||
                                            []),
                                        ];
                                        newOptions[index] = {
                                          ...option,
                                          points:
                                            parseFloat(e.target.value) || 0,
                                        };
                                        setNewQuestion((prev) => ({
                                          ...prev,
                                          config: {
                                            ...prev.config,
                                            options: newOptions,
                                          },
                                        }));
                                      }}
                                      className="col-span-3"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newOptions =
                                          newQuestion.config?.options?.filter(
                                            (_, i) => i !== index,
                                          ) || [];
                                        setNewQuestion((prev) => ({
                                          ...prev,
                                          config: {
                                            ...prev.config,
                                            options: newOptions,
                                          },
                                        }));
                                      }}
                                      className="col-span-2"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ),
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newOptions = [
                                    ...(newQuestion.config?.options || []),
                                  ];
                                  newOptions.push({
                                    value: "",
                                    label: "",
                                    points: 0,
                                  });
                                  setNewQuestion((prev) => ({
                                    ...prev,
                                    config: {
                                      ...prev.config,
                                      options: newOptions,
                                    },
                                  }));
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Option
                              </Button>
                            </div>
                          )}

                          {newQuestion.type === "rating" && (
                            <div className="space-y-3">
                              <Label>Rating Scale Configuration</Label>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="rating-min">
                                    Minimum Value
                                  </Label>
                                  <Input
                                    id="rating-min"
                                    type="number"
                                    value={newQuestion.config?.rating?.min || 1}
                                    onChange={(e) => {
                                      setNewQuestion((prev) => ({
                                        ...prev,
                                        config: {
                                          ...prev.config,
                                          rating: {
                                            ...prev.config?.rating,
                                            min: parseInt(e.target.value) || 1,
                                          },
                                        },
                                      }));
                                    }}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="rating-max">
                                    Maximum Value
                                  </Label>
                                  <Input
                                    id="rating-max"
                                    type="number"
                                    value={newQuestion.config?.rating?.max || 5}
                                    onChange={(e) => {
                                      setNewQuestion((prev) => ({
                                        ...prev,
                                        config: {
                                          ...prev.config,
                                          rating: {
                                            ...prev.config?.rating,
                                            max: parseInt(e.target.value) || 5,
                                          },
                                        },
                                      }));
                                    }}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="rating-min-label">
                                    Min Label
                                  </Label>
                                  <Input
                                    id="rating-min-label"
                                    placeholder="e.g., Poor"
                                    value={
                                      newQuestion.config?.rating?.minLabel || ""
                                    }
                                    onChange={(e) => {
                                      setNewQuestion((prev) => ({
                                        ...prev,
                                        config: {
                                          ...prev.config,
                                          rating: {
                                            ...prev.config?.rating,
                                            minLabel: e.target.value,
                                          },
                                        },
                                      }));
                                    }}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="rating-max-label">
                                    Max Label
                                  </Label>
                                  <Input
                                    id="rating-max-label"
                                    placeholder="e.g., Excellent"
                                    value={
                                      newQuestion.config?.rating?.maxLabel || ""
                                    }
                                    onChange={(e) => {
                                      setNewQuestion((prev) => ({
                                        ...prev,
                                        config: {
                                          ...prev.config,
                                          rating: {
                                            ...prev.config?.rating,
                                            maxLabel: e.target.value,
                                          },
                                        },
                                      }));
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {newQuestion.type === "text" && (
                            <div className="space-y-3">
                              <Label>Text Input Configuration</Label>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="text-placeholder">
                                    Placeholder Text
                                  </Label>
                                  <Input
                                    id="text-placeholder"
                                    placeholder="Enter placeholder..."
                                    value={
                                      newQuestion.config?.text?.placeholder ||
                                      ""
                                    }
                                    onChange={(e) => {
                                      setNewQuestion((prev) => ({
                                        ...prev,
                                        config: {
                                          ...prev.config,
                                          text: {
                                            ...prev.config?.text,
                                            placeholder: e.target.value,
                                          },
                                        },
                                      }));
                                    }}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="text-max-length">
                                    Max Length
                                  </Label>
                                  <Input
                                    id="text-max-length"
                                    type="number"
                                    min="1"
                                    value={
                                      newQuestion.config?.text?.maxLength || 500
                                    }
                                    onChange={(e) => {
                                      setNewQuestion((prev) => ({
                                        ...prev,
                                        config: {
                                          ...prev.config,
                                          text: {
                                            ...prev.config?.text,
                                            maxLength:
                                              parseInt(e.target.value) || 500,
                                          },
                                        },
                                      }));
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="text-multiline"
                                  checked={
                                    newQuestion.config?.text?.multiline || false
                                  }
                                  onChange={(e) => {
                                    setNewQuestion((prev) => ({
                                      ...prev,
                                      config: {
                                        ...prev.config,
                                        text: {
                                          ...prev.config?.text,
                                          multiline: e.target.checked,
                                        },
                                      },
                                    }));
                                  }}
                                />
                                <Label htmlFor="text-multiline">
                                  Multiline Text Area
                                </Label>
                              </div>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setShowAddQuestion(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleSaveQuestion}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Question
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {currentCategory?.questions.map((question, index) => (
                        <Card
                          key={question.id}
                          className="border-l-4"
                          style={{
                            borderLeftColor: currentCategory.color.replace(
                              "bg-",
                              "#",
                            ),
                          }}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  <Badge variant="outline">
                                    {question.type.replace("_", " ")}
                                  </Badge>
                                  {question.required && (
                                    <Badge variant="secondary">Required</Badge>
                                  )}
                                  {question.points && question.points > 0 && (
                                    <Badge variant="default">
                                      {question.points} pts
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm font-medium mb-1">
                                  {question.text}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  ID: {question.id}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Dialog
                                  open={editingQuestion?.id === question.id}
                                  onOpenChange={(open) => {
                                    if (!open) setEditingQuestion(null);
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setEditingQuestion({ ...question })
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[600px]">
                                    <DialogHeader>
                                      <DialogTitle>Edit Question</DialogTitle>
                                      <DialogDescription>
                                        Modify the question details below.
                                      </DialogDescription>
                                    </DialogHeader>
                                    {editingQuestion && (
                                      <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-question-text">
                                            Question Text
                                          </Label>
                                          <Textarea
                                            id="edit-question-text"
                                            value={editingQuestion.text}
                                            onChange={(e) =>
                                              setEditingQuestion((prev) =>
                                                prev
                                                  ? {
                                                      ...prev,
                                                      text: e.target.value,
                                                    }
                                                  : null,
                                              )
                                            }
                                            className="min-h-[80px]"
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-question-type">
                                              Question Type
                                            </Label>
                                            <Select
                                              value={editingQuestion.type}
                                              onValueChange={(
                                                value:
                                                  | "multiple_choice"
                                                  | "text"
                                                  | "rating",
                                              ) =>
                                                setEditingQuestion((prev) =>
                                                  prev
                                                    ? { ...prev, type: value }
                                                    : null,
                                                )
                                              }
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="multiple_choice">
                                                  Multiple Choice
                                                </SelectItem>
                                                <SelectItem value="text">
                                                  Text Response
                                                </SelectItem>
                                                <SelectItem value="rating">
                                                  Rating Scale
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-question-points">
                                              Points
                                            </Label>
                                            <Input
                                              id="edit-question-points"
                                              type="number"
                                              min="0"
                                              max="100"
                                              value={editingQuestion.points}
                                              onChange={(e) =>
                                                setEditingQuestion((prev) =>
                                                  prev
                                                    ? {
                                                        ...prev,
                                                        points:
                                                          parseInt(
                                                            e.target.value,
                                                          ) || 0,
                                                      }
                                                    : null,
                                                )
                                              }
                                            />
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="checkbox"
                                            id="edit-question-required"
                                            checked={editingQuestion.required}
                                            onChange={(e) =>
                                              setEditingQuestion((prev) =>
                                                prev
                                                  ? {
                                                      ...prev,
                                                      required:
                                                        e.target.checked,
                                                    }
                                                  : null,
                                              )
                                            }
                                          />
                                          <Label htmlFor="edit-question-required">
                                            Required Question
                                          </Label>
                                        </div>

                                        {/* Type-specific configuration for editing */}
                                        {editingQuestion.type ===
                                          "multiple_choice" && (
                                          <div className="space-y-3">
                                            <Label>Answer Options</Label>
                                            {/* Column Headers */}
                                            <div className="grid grid-cols-12 gap-2 items-center text-sm font-medium text-muted-foreground">
                                              <div className="col-span-3">
                                                Option Value
                                              </div>
                                              <div className="col-span-4">
                                                Display Label
                                              </div>
                                              <div className="col-span-3">
                                                Point Multiplier
                                              </div>
                                              <div className="col-span-2">
                                                Actions
                                              </div>
                                            </div>
                                            {editingQuestion.config?.options?.map(
                                              (option, index) => (
                                                <div
                                                  key={index}
                                                  className="grid grid-cols-12 gap-2 items-center"
                                                >
                                                  <Input
                                                    placeholder="e.g., yes"
                                                    value={option.value}
                                                    onChange={(e) => {
                                                      const newOptions = [
                                                        ...(editingQuestion
                                                          .config?.options ||
                                                          []),
                                                      ];
                                                      newOptions[index] = {
                                                        ...option,
                                                        value: e.target.value,
                                                      };
                                                      setEditingQuestion(
                                                        (prev) =>
                                                          prev
                                                            ? {
                                                                ...prev,
                                                                config: {
                                                                  ...prev.config,
                                                                  options:
                                                                    newOptions,
                                                                },
                                                              }
                                                            : null,
                                                      );
                                                    }}
                                                    className="col-span-3"
                                                  />
                                                  <Input
                                                    placeholder="e.g., Yes"
                                                    value={option.label}
                                                    onChange={(e) => {
                                                      const newOptions = [
                                                        ...(editingQuestion
                                                          .config?.options ||
                                                          []),
                                                      ];
                                                      newOptions[index] = {
                                                        ...option,
                                                        label: e.target.value,
                                                      };
                                                      setEditingQuestion(
                                                        (prev) =>
                                                          prev
                                                            ? {
                                                                ...prev,
                                                                config: {
                                                                  ...prev.config,
                                                                  options:
                                                                    newOptions,
                                                                },
                                                              }
                                                            : null,
                                                      );
                                                    }}
                                                    className="col-span-4"
                                                  />
                                                  <Input
                                                    type="number"
                                                    placeholder="0.0 - 1.0"
                                                    min="0"
                                                    max="1"
                                                    step="0.1"
                                                    value={option.points}
                                                    onChange={(e) => {
                                                      const newOptions = [
                                                        ...(editingQuestion
                                                          .config?.options ||
                                                          []),
                                                      ];
                                                      newOptions[index] = {
                                                        ...option,
                                                        points:
                                                          parseFloat(
                                                            e.target.value,
                                                          ) || 0,
                                                      };
                                                      setEditingQuestion(
                                                        (prev) =>
                                                          prev
                                                            ? {
                                                                ...prev,
                                                                config: {
                                                                  ...prev.config,
                                                                  options:
                                                                    newOptions,
                                                                },
                                                              }
                                                            : null,
                                                      );
                                                    }}
                                                    className="col-span-3"
                                                  />
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                      const newOptions =
                                                        editingQuestion.config?.options?.filter(
                                                          (_, i) => i !== index,
                                                        ) || [];
                                                      setEditingQuestion(
                                                        (prev) =>
                                                          prev
                                                            ? {
                                                                ...prev,
                                                                config: {
                                                                  ...prev.config,
                                                                  options:
                                                                    newOptions,
                                                                },
                                                              }
                                                            : null,
                                                      );
                                                    }}
                                                    className="col-span-2"
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              ),
                                            )}
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                const newOptions = [
                                                  ...(editingQuestion.config
                                                    ?.options || []),
                                                ];
                                                newOptions.push({
                                                  value: "",
                                                  label: "",
                                                  points: 0,
                                                });
                                                setEditingQuestion((prev) =>
                                                  prev
                                                    ? {
                                                        ...prev,
                                                        config: {
                                                          ...prev.config,
                                                          options: newOptions,
                                                        },
                                                      }
                                                    : null,
                                                );
                                              }}
                                            >
                                              <Plus className="h-4 w-4 mr-2" />
                                              Add Option
                                            </Button>
                                          </div>
                                        )}

                                        {editingQuestion.type === "rating" && (
                                          <div className="space-y-3">
                                            <Label>
                                              Rating Scale Configuration
                                            </Label>
                                            <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-2">
                                                <Label htmlFor="edit-rating-min">
                                                  Minimum Value
                                                </Label>
                                                <Input
                                                  id="edit-rating-min"
                                                  type="number"
                                                  value={
                                                    editingQuestion.config
                                                      ?.rating?.min || 1
                                                  }
                                                  onChange={(e) => {
                                                    setEditingQuestion(
                                                      (prev) =>
                                                        prev
                                                          ? {
                                                              ...prev,
                                                              config: {
                                                                ...prev.config,
                                                                rating: {
                                                                  ...prev.config
                                                                    ?.rating,
                                                                  min:
                                                                    parseInt(
                                                                      e.target
                                                                        .value,
                                                                    ) || 1,
                                                                },
                                                              },
                                                            }
                                                          : null,
                                                    );
                                                  }}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="edit-rating-max">
                                                  Maximum Value
                                                </Label>
                                                <Input
                                                  id="edit-rating-max"
                                                  type="number"
                                                  value={
                                                    editingQuestion.config
                                                      ?.rating?.max || 5
                                                  }
                                                  onChange={(e) => {
                                                    setEditingQuestion(
                                                      (prev) =>
                                                        prev
                                                          ? {
                                                              ...prev,
                                                              config: {
                                                                ...prev.config,
                                                                rating: {
                                                                  ...prev.config
                                                                    ?.rating,
                                                                  max:
                                                                    parseInt(
                                                                      e.target
                                                                        .value,
                                                                    ) || 5,
                                                                },
                                                              },
                                                            }
                                                          : null,
                                                    );
                                                  }}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="edit-rating-min-label">
                                                  Min Label
                                                </Label>
                                                <Input
                                                  id="edit-rating-min-label"
                                                  placeholder="e.g., Poor"
                                                  value={
                                                    editingQuestion.config
                                                      ?.rating?.minLabel || ""
                                                  }
                                                  onChange={(e) => {
                                                    setEditingQuestion(
                                                      (prev) =>
                                                        prev
                                                          ? {
                                                              ...prev,
                                                              config: {
                                                                ...prev.config,
                                                                rating: {
                                                                  ...prev.config
                                                                    ?.rating,
                                                                  minLabel:
                                                                    e.target
                                                                      .value,
                                                                },
                                                              },
                                                            }
                                                          : null,
                                                    );
                                                  }}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="edit-rating-max-label">
                                                  Max Label
                                                </Label>
                                                <Input
                                                  id="edit-rating-max-label"
                                                  placeholder="e.g., Excellent"
                                                  value={
                                                    editingQuestion.config
                                                      ?.rating?.maxLabel || ""
                                                  }
                                                  onChange={(e) => {
                                                    setEditingQuestion(
                                                      (prev) =>
                                                        prev
                                                          ? {
                                                              ...prev,
                                                              config: {
                                                                ...prev.config,
                                                                rating: {
                                                                  ...prev.config
                                                                    ?.rating,
                                                                  maxLabel:
                                                                    e.target
                                                                      .value,
                                                                },
                                                              },
                                                            }
                                                          : null,
                                                    );
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {editingQuestion.type === "text" && (
                                          <div className="space-y-3">
                                            <Label>
                                              Text Input Configuration
                                            </Label>
                                            <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-2">
                                                <Label htmlFor="edit-text-placeholder">
                                                  Placeholder Text
                                                </Label>
                                                <Input
                                                  id="edit-text-placeholder"
                                                  placeholder="Enter placeholder..."
                                                  value={
                                                    editingQuestion.config?.text
                                                      ?.placeholder || ""
                                                  }
                                                  onChange={(e) => {
                                                    setEditingQuestion(
                                                      (prev) =>
                                                        prev
                                                          ? {
                                                              ...prev,
                                                              config: {
                                                                ...prev.config,
                                                                text: {
                                                                  ...prev.config
                                                                    ?.text,
                                                                  placeholder:
                                                                    e.target
                                                                      .value,
                                                                },
                                                              },
                                                            }
                                                          : null,
                                                    );
                                                  }}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="edit-text-max-length">
                                                  Max Length
                                                </Label>
                                                <Input
                                                  id="edit-text-max-length"
                                                  type="number"
                                                  min="1"
                                                  value={
                                                    editingQuestion.config?.text
                                                      ?.maxLength || 500
                                                  }
                                                  onChange={(e) => {
                                                    setEditingQuestion(
                                                      (prev) =>
                                                        prev
                                                          ? {
                                                              ...prev,
                                                              config: {
                                                                ...prev.config,
                                                                text: {
                                                                  ...prev.config
                                                                    ?.text,
                                                                  maxLength:
                                                                    parseInt(
                                                                      e.target
                                                                        .value,
                                                                    ) || 500,
                                                                },
                                                              },
                                                            }
                                                          : null,
                                                    );
                                                  }}
                                                />
                                              </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <input
                                                type="checkbox"
                                                id="edit-text-multiline"
                                                checked={
                                                  editingQuestion.config?.text
                                                    ?.multiline || false
                                                }
                                                onChange={(e) => {
                                                  setEditingQuestion((prev) =>
                                                    prev
                                                      ? {
                                                          ...prev,
                                                          config: {
                                                            ...prev.config,
                                                            text: {
                                                              ...prev.config
                                                                ?.text,
                                                              multiline:
                                                                e.target
                                                                  .checked,
                                                            },
                                                          },
                                                        }
                                                      : null,
                                                  );
                                                }}
                                              />
                                              <Label htmlFor="edit-text-multiline">
                                                Multiline Text Area
                                              </Label>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => setEditingQuestion(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button onClick={handleUpdateQuestion}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Update Question
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Question?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the
                                        question. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteQuestion(question.id)
                                        }
                                      >
                                        Delete Question
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Overall Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overall Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Reviews:
                      </span>
                      <span className="font-medium">{allScores.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Questions:
                      </span>
                      <span className="font-medium">
                        {magnetCategories.reduce(
                          (sum, cat) => sum + cat.questions.length,
                          0,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Scoring Questions:
                      </span>
                      <span className="font-medium">
                        {magnetCategories.reduce(
                          (sum, cat) =>
                            sum +
                            cat.questions.filter(
                              (q) => q.points && q.points > 0,
                            ).length,
                          0,
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Averages */}
              {magnetCategories.map((category) => {
                const maxCategoryScore = category.questions
                  .filter((q) => q.points && q.points > 0)
                  .reduce((sum, q) => sum + (q.points || 0), 0);
                const avgScore = averageScores[category.id] || 0;
                const percentage =
                  maxCategoryScore > 0
                    ? Math.round((avgScore / maxCategoryScore) * 100)
                    : 0;

                return (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded ${category.color}`}
                        ></span>
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Average Score:
                          </span>
                          <span className="font-medium">
                            {avgScore.toFixed(1)}/{maxCategoryScore}
                          </span>
                        </div>
                        <div className="w-full bg-secondary/20 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${category.color}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-center text-sm text-muted-foreground">
                          {percentage}% Average
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettings;
