import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, FileText } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { 
  getProjectNotes, 
  saveProjectNotes, 
  clearProjectNotes, 
  getAllProjectReviews 
} from './MagnetReviewPanel';

interface ProjectNotesManagerProps {
  projectId: string;
  projectName?: string;
}

const ProjectNotesManager: React.FC<ProjectNotesManagerProps> = ({
  projectId,
  projectName = 'Unknown Project'
}) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<any>({});

  // Load all reviews for this project
  useEffect(() => {
    const loadReviews = () => {
      const projectReviews = getAllProjectReviews(projectId);
      setReviews(projectReviews);
    };

    loadReviews();
    
    // Refresh every 2 seconds to show real-time updates
    const interval = setInterval(loadReviews, 2000);
    return () => clearInterval(interval);
  }, [projectId]);

  // Load notes for selected review
  useEffect(() => {
    if (selectedReview) {
      const notes = getProjectNotes(projectId, selectedReview);
      setReviewNotes(notes);
    }
  }, [selectedReview, projectId]);

  const handleClearReview = (reviewId: string) => {
    if (window.confirm(`Are you sure you want to clear all notes for review "${reviewId}"?`)) {
      const success = clearProjectNotes(projectId, reviewId);
      if (success) {
        toast({
          title: 'Notes cleared',
          description: `All notes for review "${reviewId}" have been cleared.`,
          duration: 3000,
        });
        
        // Refresh the reviews list
        const updatedReviews = getAllProjectReviews(projectId);
        setReviews(updatedReviews);
        
        if (selectedReview === reviewId) {
          setSelectedReview(null);
          setReviewNotes({});
        }
      }
    }
  };

  const handleViewReview = (reviewId: string) => {
    setSelectedReview(reviewId === selectedReview ? null : reviewId);
  };

  const getResponseCount = (notes: any) => {
    if (!notes || typeof notes !== 'object') return 0;
    return Object.keys(notes).filter(key => {
      const response = notes[key];
      return response && (response.answer || response.notes);
    }).length;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Notes Manager
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Project: <strong>{projectName}</strong> (ID: {projectId})
          </p>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reviews found for this project.</p>
              <p className="text-sm">Start a MAGNET review to see notes here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold">Reviews ({reviews.length})</h3>
              {reviews.map((review) => (
                <div key={review.reviewId} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {review.reviewId}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {review.responseCount || 0} responses
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Last saved: {new Date(review.lastSaved).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReview(review.reviewId)}
                      >
                        <Eye className="h-4 w-4" />
                        {selectedReview === review.reviewId ? 'Hide' : 'View'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleClearReview(review.reviewId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {selectedReview === review.reviewId && (
                    <div className="mt-4 p-3 bg-muted/50 rounded border">
                      <h4 className="font-medium mb-2">Review Notes:</h4>
                      {Object.keys(reviewNotes).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No notes found.</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {Object.entries(reviewNotes).map(([questionId, response]: [string, any]) => (
                            <div key={questionId} className="text-sm">
                              <div className="font-medium text-xs text-muted-foreground mb-1">
                                Question: {questionId}
                              </div>
                              {response.answer && (
                                <div className="mb-1">
                                  <span className="font-medium">Answer:</span> {response.answer}
                                </div>
                              )}
                              {response.notes && (
                                <div>
                                  <span className="font-medium">Notes:</span> {response.notes}
                                </div>
                              )}
                              <hr className="my-2 opacity-30" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectNotesManager;