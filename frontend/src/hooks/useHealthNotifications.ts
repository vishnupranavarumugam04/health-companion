import { useEffect, useRef } from 'react';

const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play a pleasant dual-tone "chime" sound
    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime + startTime);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + startTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start(audioCtx.currentTime + startTime);
      oscillator.stop(audioCtx.currentTime + startTime + duration);
    };

    playTone(523.25, 0, 0.3); // C5
    playTone(659.25, 0.15, 0.4); // E5
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export const useHealthNotifications = (
  hr: string | number,
  steps: number,
  hasWarning: boolean,
  warningMessage: string | null | undefined
) => {
  const previousHrRef = useRef<number | null>(null);
  const previousStepsMilestoneRef = useRef<number>(Math.floor(steps / 1000) * 1000);
  const hasNotifiedWarningRef = useRef<boolean>(false);

  useEffect(() => {
    // Request permission on mount
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const notify = async (title: string, body: string) => {
      playNotificationSound();
      
      try {
        // Attempt standard web notification (Works on Desktop / iOS)
        new Notification(title, {
          body,
          icon: '/favicon.ico', // standard fallback
          vibrate: [200, 100, 200]
        } as any);
      } catch (e) {
        // Android Chrome throws 'Illegal constructor' and requires a Service Worker
        try {
          if (navigator.serviceWorker) {
            const regs = await navigator.serviceWorker.getRegistrations();
            if (regs && regs.length > 0) {
              await regs[0].showNotification(title, {
                body,
                icon: '/favicon.ico',
                vibrate: [200, 100, 200]
              } as any);
            }
          }
        } catch (swError) {
          console.error("Service worker notification failed:", swError);
        }
      }
    };

    // 1. Sudden HR Spikes / Drops
    const currentHr = Number(hr);
    if (!isNaN(currentHr)) {
      if (previousHrRef.current !== null) {
        if (currentHr > 100 && previousHrRef.current <= 100) {
          notify("High Heart Rate Alert", `Your heart rate suddenly spiked to ${currentHr} BPM.`);
        } else if (currentHr < 50 && previousHrRef.current >= 50) {
          notify("Low Heart Rate Alert", `Your heart rate dropped to ${currentHr} BPM.`);
        }
      }
      previousHrRef.current = currentHr;
    }

    // 2. Energizing Step Milestones (Every 1000 steps)
    if (steps > 0) {
      const currentMilestone = Math.floor(steps / 1000) * 1000;
      if (currentMilestone > 0 && currentMilestone > previousStepsMilestoneRef.current) {
        notify("Step Milestone Reached! 🏃‍♂️", `Awesome job! You just reached ${currentMilestone} steps today. Keep it up!`);
        previousStepsMilestoneRef.current = currentMilestone;
      } else if (steps < previousStepsMilestoneRef.current) {
         // handle reset (e.g. next day)
         previousStepsMilestoneRef.current = Math.floor(steps / 1000) * 1000;
      }
    }

    // 3. Warnings (e.g. SpO2, Temp)
    if (hasWarning && !hasNotifiedWarningRef.current) {
      notify("Health Companion Warning", warningMessage || "Critical health threshold exceeded.");
      hasNotifiedWarningRef.current = true;
    } else if (!hasWarning) {
      hasNotifiedWarningRef.current = false;
    }

  }, [hr, steps, hasWarning, warningMessage]);
};
