"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useScribe } from "@elevenlabs/react";

type PermissionState = "prompt" | "granted" | "denied" | "checking";

export function RecordingButton() {
  const [permissionState, setPermissionState] =
    useState<PermissionState>("checking");
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(
    null
  );
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    onPartialTranscript: (data) => {
      // Partial transcript is available via scribe.partialTranscript
      console.log("Partial:", data.text);
    },
    onCommittedTranscript: (data) => {
      console.log("Committed:", data.text);
    },
    onCommittedTranscriptWithTimestamps: (data) => {
      console.log("Committed with timestamps:", data.text);
      console.log("Timestamps:", data.timestamps);
    },
    onError: (error) => {
      console.error("Scribe error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during transcription";
      setError(errorMessage);
      setIsConnecting(false);
    },
  });

  const handleStop = useCallback(async () => {
    try {
      await scribe.disconnect();
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to stop recording: ${err.message}`);
      }
    }
  }, [scribe]);

  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      );
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(isMobileDevice || (hasTouchScreen && isSmallScreen));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.code === "Space" &&
        !event.repeat &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        if (permissionState === "granted") {
          if (!scribe.isConnected && !isConnecting) {
            handleStart();
          } else if (scribe.isConnected) {
            handleStop();
          }
        } else if (permissionState === "prompt") {
          requestPermission();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [permissionState, scribe.isConnected, isConnecting]);

  // 2-minute recording limit timer
  useEffect(() => {
    if (scribe.isConnected && recordingStartTime === null) {
      // Recording just started
      const startTime = Date.now();
      setRecordingStartTime(startTime);
      setTimeRemaining(120000); // 2 minutes in milliseconds
    } else if (!scribe.isConnected) {
      // Recording stopped
      setRecordingStartTime(null);
      setTimeRemaining(null);
    }
  }, [scribe.isConnected, recordingStartTime]);

  // Timer countdown and auto-stop
  useEffect(() => {
    if (!scribe.isConnected || recordingStartTime === null) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - recordingStartTime;
      const remaining = 120000 - elapsed; // 2 minutes = 120000ms

      if (remaining <= 0) {
        // Time's up - stop recording
        setTimeRemaining(0);
        handleStop();
        setError("Recording stopped automatically after 2 minutes.");
      } else {
        setTimeRemaining(remaining);
      }
    }, 100); // Update every 100ms for smooth countdown

    return () => {
      clearInterval(interval);
    };
  }, [scribe.isConnected, recordingStartTime, handleStop]);

  const checkMicrophonePermission = async () => {
    try {
      if (!navigator.permissions) {
        setPermissionState("prompt");
        return;
      }

      const result = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      setPermissionState(result.state as PermissionState);

      result.onchange = () => {
        setPermissionState(result.state as PermissionState);
      };
    } catch (error) {
      setPermissionState("prompt");
    }
  };

  const requestPermission = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissionState("granted");
    } catch (err) {
      if (err instanceof Error) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          setPermissionState("denied");
          setError(
            "Microphone permission denied. Please enable it in your browser settings."
          );
        } else {
          setError("Failed to access microphone. Please check your settings.");
        }
      }
    }
  };

  const fetchTokenFromServer = async (): Promise<string> => {
    const response = await fetch("/api/scribe-token");
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch token");
    }
    const data = await response.json();
    return data.token;
  };

  const handleStart = async () => {
    try {
      setError(null);
      setIsConnecting(true);

      // Fetch a single use token from the server
      const token = await fetchTokenFromServer();

      await scribe.connect({
        token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      setPermissionState("granted");
      setIsConnecting(false);
    } catch (err) {
      setIsConnecting(false);
      if (err instanceof Error) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          setPermissionState("denied");
          setError("Microphone permission denied.");
        } else {
          setError(
            err.message || "Failed to start recording. Please try again."
          );
        }
      }
    }
  };

  const handleClick = () => {
    if (permissionState === "denied" || permissionState === "prompt") {
      requestPermission();
    } else if (permissionState === "granted") {
      if (!scribe.isConnected && !isConnecting) {
        handleStart();
      } else if (scribe.isConnected) {
        handleStop();
      }
    }
  };

  const getButtonText = () => {
    if (permissionState === "checking" || isConnecting) {
      return "Checking...";
    }
    if (permissionState === "denied") {
      return "Enable Microphone";
    }
    if (permissionState === "prompt") {
      return "Enable Microphone";
    }
    if (scribe.isConnected) {
      return "Stop Recording";
    }
    return "Start Recording";
  };

  const getButtonIcon = () => {
    if (permissionState === "checking" || isConnecting) {
      return <Loader2 className="h-5 w-5 animate-spin" />;
    }
    if (permissionState === "denied" || permissionState === "prompt") {
      return <MicOff className="h-5 w-5" />;
    }
    if (scribe.isConnected) {
      return <Mic className="h-5 w-5" />;
    }
    return <Mic className="h-5 w-5" />;
  };

  // Format time remaining as MM:SS
  const formatTimeRemaining = (ms: number | null): string => {
    if (ms === null) return "";
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Combine partial transcript with committed transcripts for display
  const displayText =
    scribe.partialTranscript ||
    (scribe.committedTranscripts.length > 0
      ? scribe.committedTranscripts[scribe.committedTranscripts.length - 1].text
      : "");

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex flex-col items-center gap-2">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm mb-2 max-w-xs text-center">
            {error}
          </div>
        )}
        {scribe.isConnected && timeRemaining !== null && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-md text-xs font-mono font-semibold">
            {formatTimeRemaining(timeRemaining)} remaining
          </div>
        )}
        {displayText && scribe.isConnected && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-md text-sm mb-2 max-w-md text-center shadow-lg">
            {displayText || "Listening..."}
          </div>
        )}
        <Button
          onClick={handleClick}
          disabled={permissionState === "checking" || isConnecting}
          className={`
            rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all
            ${
              scribe.isConnected
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-orange-500 hover:bg-orange-600"
            }
            ${
              permissionState === "denied"
                ? "bg-gray-500 hover:bg-gray-600"
                : ""
            }
          `}
          size="icon"
          aria-label={getButtonText()}
        >
          {getButtonIcon()}
        </Button>
        <span className="text-xs text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-gray-900/80 px-2 py-1 rounded">
          {permissionState === "granted" &&
            !scribe.isConnected &&
            !isConnecting &&
            (isMobile ? "Tap to start" : "Press Space to start")}
          {scribe.isConnected && (isMobile ? "Tap to stop" : "Press Space to stop")}
          {permissionState !== "granted" && "Click to enable"}
        </span>
      </div>
    </div>
  );
}
