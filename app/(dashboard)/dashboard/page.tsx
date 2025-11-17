"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Check } from "lucide-react";

type Transcription = {
  id: number;
  transcription: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function DashboardPage() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  const fetchTranscriptions = async () => {
    try {
      const response = await fetch("/api/transcriptions");
      if (response.ok) {
        const data = await response.json();
        setTranscriptions(data);
      }
    } catch (error) {
      console.error("Error fetching transcriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this transcription?")) {
      return;
    }

    try {
      const response = await fetch(`/api/transcriptions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTranscriptions(transcriptions.filter((t) => t.id !== id));
      } else {
        console.error("Failed to delete transcription");
      }
    } catch (error) {
      console.error("Error deleting transcription:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Dashboard</h1>
      
      {loading ? (
        <p className="text-muted-foreground">Loading transcriptions...</p>
      ) : transcriptions.length === 0 ? (
        <p className="text-muted-foreground">No transcriptions yet. Start recording to create your first transcription!</p>
      ) : (
        <div className="space-y-4">
          {transcriptions.map((transcription) => (
            <Card key={transcription.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {formatDate(transcription.createdAt)}
                    </CardTitle>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transcription.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : transcription.status === 'recording'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {transcription.status}
                      </span>
                    </div>
                  </div>
                  <CardAction>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(transcription.transcription, transcription.id)}
                        title="Copy transcription"
                      >
                        {copiedId === transcription.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transcription.id)}
                        title="Delete transcription"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardAction>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {transcription.transcription || (
                    <span className="text-muted-foreground italic">No transcription text available</span>
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
