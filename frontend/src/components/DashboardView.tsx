"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HeaderSection } from "./HeaderSection";
import { MetricsGrid } from "./MetricsGrid";
import { WhoopMonitorPanel } from "./WhoopMonitorPanel";
import { MetricDetailData } from "./MetricDetailModal";
import { getDecryptedTelemetryRecords } from "@/utils/telemetryBuffer";

interface DashboardViewProps {
  userName: string;
  hr: string | number;
  spo2: string | number;
  temp: string | number;
  hrv: string | number;
  steps: number;
  calories: number;
  fingerPresent: number;
  hasWarning: boolean;
  warningMessage?: string | null;
  mqttConnected: boolean;
  onOpenMetricDetail: (metric: MetricDetailData) => void;
  onOpenTelemetryConsole: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName,
  hr,
  spo2,
  temp,
  hrv,
  steps,
  calories,
  fingerPresent,
  hasWarning,
  warningMessage,
  mqttConnected,
  onOpenMetricDetail,
  onOpenTelemetryConsole,
}) => {
  const [derivedHrv, respRate, stress] = useMemo((): [number | string, number | string, string] => {
    if (fingerPresent === 0 || hr === "--") return ["--", "--", "--"];

    const numericHr = Number(hr);
    const calculatedHrv = Math.floor(120 - numericHr);
    const calculatedRespRate = Math.floor(numericHr / 5);

    return [
      Math.max(20, Math.min(120, calculatedHrv)),
      Math.max(12, Math.min(25, calculatedRespRate)),
      numericHr > 95 ? "High" : numericHr > 75 ? "Moderate" : "Low",
    ];
  }, [hr, fingerPresent]);
  const [strain, setStrain] = useState(4.0);
  const [recovery, setRecovery] = useState<number | string>("--");
  const [sleep, setSleep] = useState("--");

  useEffect(() => {
    let isMounted = true;

    const calculateRecoveryAndSleep = async () => {
      try {
        const records = await getDecryptedTelemetryRecords();
        const now = Date.now();
        const last24Hours = records.filter((record) => record.timestamp >= now - 24 * 60 * 60 * 1000);
        const parsedRecords = last24Hours
          .map((record) => {
            const values = record.payload.split(",");
            const hr = Number(values[0]);
            const motionLevel = Number(values[4] || 0);
            const hrv = Number.isFinite(hr) ? Math.round(70 - (hr - 70) * 0.4) : NaN;
            return { timestamp: record.timestamp, hr, motionLevel, hrv };
          })
          .filter((record) => Number.isFinite(record.hr) && record.hr > 0)
          .sort((first, second) => first.timestamp - second.timestamp);

        if (parsedRecords.length === 0) return;

        const dailyAverageHr = parsedRecords.reduce((sum, record) => sum + record.hr, 0) / parsedRecords.length;
        const qualifyingRecords = parsedRecords.filter((record) =>
          record.hr <= dailyAverageHr * 0.9 &&
          record.hr >= dailyAverageHr * 0.85 &&
          record.motionLevel === 0,
        );

        let longestBlock: typeof qualifyingRecords = [];
        let currentBlock: typeof qualifyingRecords = [];
        qualifyingRecords.forEach((record, index) => {
          const previousRecord = qualifyingRecords[index - 1];
          if (!previousRecord || record.timestamp - previousRecord.timestamp <= 5 * 60 * 1000) {
            currentBlock.push(record);
          } else {
            if (currentBlock.length > longestBlock.length) longestBlock = currentBlock;
            currentBlock = [record];
          }
        });
        if (currentBlock.length > longestBlock.length) longestBlock = currentBlock;

        if (longestBlock.length === 0) return;

        const firstSleepRecord = longestBlock[0];
        const lastSleepRecord = longestBlock[longestBlock.length - 1];
        const sleepDurationMs = Math.max(0, lastSleepRecord.timestamp - firstSleepRecord.timestamp);
        const sleepMinutes = Math.round(sleepDurationMs / 60000);
        const sleepHours = Math.floor(sleepMinutes / 60);
        const remainingMinutes = sleepMinutes % 60;
        const sleepHrv = longestBlock.reduce((sum, record) => sum + record.hrv, 0) / longestBlock.length;
        const historicalHrvRecords = records
          .map((record) => {
            const hr = Number(record.payload.split(",")[0]);
            return Number.isFinite(hr) && hr > 0 ? Math.round(70 - (hr - 70) * 0.4) : NaN;
          })
          .filter((hrv) => Number.isFinite(hrv) && hrv > 0);
        const historicalHrvBaseline = historicalHrvRecords.length
          ? historicalHrvRecords.reduce((sum, hrv) => sum + hrv, 0) / historicalHrvRecords.length
          : 0;

        if (isMounted) {
          setSleep(`${sleepHours}h ${remainingMinutes}m`);
          setRecovery(historicalHrvBaseline > 0
            ? Math.max(0, Math.min(100, Math.round((sleepHrv / historicalHrvBaseline) * 100)))
            : "--");
        }
      } catch {
        // IndexedDB may be unavailable until the browser grants storage access.
      }
    };

    void calculateRecoveryAndSleep();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const strainInterval = setInterval(() => {
      setStrain((currentStrain) => {
        const numericHr = Number(hr);
        const increment = numericHr > 100 ? 0.2 : 0.1;
        return Math.min(21.0, currentStrain + increment);
      });
    }, 5000);

    return () => clearInterval(strainInterval);
  }, [hr]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header Section (Greeting & Health Score Ring) */}
      <HeaderSection
        userName={userName}
        fingerPresent={fingerPresent}
        hasWarning={hasWarning}
        warningMessage={warningMessage}
        mqttConnected={mqttConnected}
      />

      {/* Metrics Grid (2x2 Reusable Cards with click actions) */}
      <div className="relative">
        <MetricsGrid
          hr={hr}
          spo2={spo2}
          temp={temp}
          fingerPresent={fingerPresent}
          steps={steps}
          onOpenMetricDetail={onOpenMetricDetail}
        />
      </div>

      <WhoopMonitorPanel
        hr={hr}
        hrv={derivedHrv}
        spo2={spo2}
        temp={temp}
        steps={steps}
        calories={calories}
        fingerPresent={fingerPresent}
        respRate={respRate}
        stress={stress}
        strain={strain}
        recovery={recovery}
        sleep={sleep}
      />

    </div>
  );
};
