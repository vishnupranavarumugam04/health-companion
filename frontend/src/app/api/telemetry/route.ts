import { NextRequest, NextResponse } from "next/server";

// In-memory telemetry state for direct HTTP pushes
let directPushData: {
  hr: number;
  spo2: number;
  temp: number;
  finger: number;
  steps: number;
  activity: string;
  fall: boolean;
  environmentalTemperature: number;
  humidity: number;
  airQuality: number;
  updatedAt: number;
  source: string;
} | null = null;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const hr = searchParams.get("hr");
  const spo2 = searchParams.get("spo2");
  const temp = searchParams.get("temp");
  const finger = searchParams.get("finger");
  const steps = searchParams.get("steps");
  const activity = searchParams.get("activity") || "RESTING";
  const fall = searchParams.get("fall") === "1" || searchParams.get("fall") === "true";
  const envTemp = searchParams.get("environmentalTemperature");
  const humidity = searchParams.get("humidity");
  const airQuality = searchParams.get("airQuality");

  if (hr !== null || spo2 !== null || temp !== null || finger !== null) {
    directPushData = {
      hr: hr !== null ? parseFloat(hr) : 75,
      spo2: spo2 !== null ? parseFloat(spo2) : 98,
      temp: temp !== null ? parseFloat(temp) : 36.6,
      finger: finger !== null ? parseInt(finger, 10) : 1,
      steps: steps !== null ? parseInt(steps, 10) : 0, // Removed hard-coded 1420
      activity: activity,
      fall: fall,
      environmentalTemperature: envTemp !== null ? parseFloat(envTemp) : 25.0,
      humidity: humidity !== null ? parseFloat(humidity) : 50.0,
      airQuality: airQuality !== null ? parseFloat(airQuality) : 1000,
      updatedAt: Date.now(),
      source: "ESP32 Direct Telemetry",
    };
  }

  // Check if direct push happened within last 30 seconds
  if (directPushData && Date.now() - directPushData.updatedAt < 30000) {
    return NextResponse.json(
      {
        connected: true,
        isHardwareOnline: true,
        hr: directPushData.hr,
        spo2: directPushData.spo2,
        temp: directPushData.temp,
        finger: directPushData.finger,
        steps: directPushData.steps,
        activity: directPushData.activity,
        fall: directPushData.fall,
        environmentalTemperature: directPushData.environmentalTemperature,
        humidity: directPushData.humidity,
        airQuality: directPushData.airQuality,
        updatedAt: directPushData.updatedAt,
        source: directPushData.source,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  // 2. Poll dweet.io server-side for Cirkit hardware simulator
  try {
    const dweetThing = "kpsplayz_ring_sih26181";
    const dweetRes = await fetch(`http://dweet.io/get/latest/dweet/for/${dweetThing}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (dweetRes.ok) {
      const data = await dweetRes.json();
      if (data && data.with && data.with.length > 0) {
        const item = data.with[0];
        const content = item.content || item;

        if (content.hr !== undefined || content.heartRate !== undefined) {
          const rawHr = content.hr !== undefined ? content.hr : content.heartRate;
          const rawSpo2 = content.spo2;
          const rawTemp = content.temp !== undefined ? content.temp : content.temperature;
          const rawFinger = content.finger;

          return NextResponse.json(
            {
              connected: true,
              isHardwareOnline: true,
              hr: rawHr !== undefined ? parseFloat(rawHr) : "--",
              spo2: rawSpo2 !== undefined ? parseFloat(rawSpo2) : "--",
              temp: rawTemp !== undefined ? parseFloat(rawTemp) : "--",
              finger: rawFinger !== undefined ? parseInt(rawFinger, 10) : 1,
              steps: content.steps !== undefined ? parseInt(content.steps, 10) : 0, // Removed hard-coded 1420
              activity: content.activity || "RESTING",
              fall: content.fall === "1" || content.fall === true,
              environmentalTemperature: content.environmentalTemperature !== undefined ? parseFloat(content.environmentalTemperature) : "--",
              humidity: content.humidity !== undefined ? parseFloat(content.humidity) : "--",
              airQuality: content.airQuality !== undefined ? parseFloat(content.airQuality) : "--",
              updatedAt: Date.now(),
              source: "Cirkit Dweet Live",
            },
            {
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-store, max-age=0",
              },
            }
          );
        }
      }
    }
  } catch (e) {
    // Continue
  }

  // 3. Fallback: Hardware is NOT CONNECTED (Offline)
  return NextResponse.json(
    {
      connected: false,
      isHardwareOnline: false,
      hr: "--",
      spo2: "--",
      temp: "--",
      finger: 0,
      steps: 0,
      activity: "RESTING",
      fall: false,
      environmentalTemperature: "--",
      humidity: "--",
      airQuality: "--",
      updatedAt: null,
      source: "Disconnected",
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    directPushData = {
      hr: body.hr !== undefined ? parseFloat(body.hr) : 75,
      spo2: body.spo2 !== undefined ? parseFloat(body.spo2) : 98,
      temp: body.temp !== undefined ? parseFloat(body.temp) : 36.6,
      finger: body.finger !== undefined ? parseInt(body.finger, 10) : 1,
      steps: body.steps !== undefined ? parseInt(body.steps, 10) : 0, // Removed hardcoded 1420
      activity: body.activity || "RESTING",
      fall: body.fall === "1" || body.fall === true,
      environmentalTemperature: body.environmentalTemperature !== undefined ? parseFloat(body.environmentalTemperature) : 25.0,
      humidity: body.humidity !== undefined ? parseFloat(body.humidity) : 50.0,
      airQuality: body.airQuality !== undefined ? parseFloat(body.airQuality) : 1000,
      updatedAt: Date.now(),
      source: "ESP32 Ring Live Stream",
    };

    return NextResponse.json({ success: true, data: directPushData }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
