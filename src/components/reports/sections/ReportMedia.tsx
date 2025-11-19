import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera, Video, MessageSquare } from "lucide-react";

interface ReportMediaProps {
  notes?: string;
}

const ReportMedia: React.FC<ReportMediaProps> = ({ notes }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    type: "video" | "image";
    title: string;
    src?: string;
  } | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Visual Evidence */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-[#34386a]" />
            <div>
              <h2 className="font-semibold text-lg text-[#34386a]">
                Visual Evidence
              </h2>
              <p className="text-xs text-muted-foreground">
                Screenshots and recordings that illustrate key issues.
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <button
                key={`video-${i}`}
                onClick={() => {
                  setSelectedMedia({
                    type: "video",
                    title: `Review Session ${i}`,
                  });
                  setIsLightboxOpen(true);
                }}
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <Video className="h-6 w-6 text-gray-400" />
                </div>
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
                  Video
                </div>
              </button>
            ))}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <button
                key={`shot-${i}`}
                onClick={() => {
                  setSelectedMedia({
                    type: "image",
                    title: `Screenshot ${i}`,
                    src: `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&q=70`,
                  });
                  setIsLightboxOpen(true);
                }}
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                <img
                  src={`https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&q=60`}
                  alt={`Screenshot ${i}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Discussion Notes */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#34386a]" />
          <div>
            <h2 className="font-semibold text-sm text-[#34386a]">
              Discussion Notes
            </h2>
            <p className="text-xs text-muted-foreground">
              Use this space during review meetings to capture decisions and next
              steps.
            </p>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="border rounded-md bg-card/50 p-3 text-xs text-muted-foreground min-h-[80px] flex items-center justify-between">
            <span>
              {notes ||
                "In the future this can be a live notes area synced to your project. For now, use it as a prompt for the conversation."}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Media Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center">
              <h3 className="text-white font-medium">{selectedMedia?.title}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={() => setIsLightboxOpen(false)}
              >
                <span className="sr-only">Close</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>

            {selectedMedia?.type === "image" ? (
              <div className="w-full h-[80vh] flex items-center justify-center bg-black">
                <img
                  src={
                    selectedMedia?.src ||
                    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=70"
                  }
                  alt={selectedMedia?.title || "Screenshot"}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : selectedMedia?.type === "video" ? (
              <div className="w-full h-[80vh] flex items-center justify-center bg-black text-white">
                <div className="text-center">
                  <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Video Preview Placeholder</p>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportMedia;
