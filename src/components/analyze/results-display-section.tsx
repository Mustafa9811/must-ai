"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExternalLinkIcon, DownloadIcon } from "lucide-react";
import { motion } from "framer-motion";
import { AnalysisFollowUpChat } from "./analysis-follow-up-chat";

interface ResultsDisplaySectionProps {
  analysisId: string;
  summary: string;
  reportUrl: string;
}

export function ResultsDisplaySection({
  analysisId,
  summary,
  reportUrl,
}: ResultsDisplaySectionProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleViewReport = () => {
    window.open(reportUrl, "_blank");
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    
    try {
      const response = await fetch(reportUrl);
      const blob = await response.blob();
      
      // Create a temporary link element to trigger download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `mustax-analysis-report-${analysisId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading report:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Analysis Complete</h2>
              <p className="text-muted-foreground">
                Your document has been analyzed by MusTax AI
              </p>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-medium mb-2">Analysis Summary</h3>
              <p className="text-sm whitespace-pre-line">{summary}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={handleViewReport}
              >
                <ExternalLinkIcon className="mr-2 h-4 w-4" />
                View Full Report
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                onClick={handleDownloadReport}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-b-2 border-t-2 border-current"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Download Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Separator className="my-8" />
      
      <div className="w-full max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Ask Follow-up Questions</h2>
        <p className="text-muted-foreground mb-6">
          Ask specific questions about your analyzed document
        </p>
        <AnalysisFollowUpChat analysisId={analysisId} />
      </div>
    </motion.div>
  );
}
