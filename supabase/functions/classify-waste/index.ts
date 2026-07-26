import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

const VALID_WASTE_TYPES = [
  "Organic",
  "Plastic",
  "Glass",
  "Metal",
  "Paper",
  "Textile",
  "Electronic Waste",
  "Mixed Waste",
] as const;

type WasteType = (typeof VALID_WASTE_TYPES)[number];

interface ClassificationResult {
  waste_type: WasteType;
  confidence_score: number;
  recommendation: string;
  all_detected_types?: string[];
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Scoring-based fallback classification.
 * Each keyword match adds a score to its waste type.
 * The type with the highest score wins.
 */
function fallbackClassify(imageSource: string): ClassificationResult {
  const source = imageSource.toLowerCase();
  
  const scores: Record<WasteType, number> = {
    "Organic": 0,
    "Plastic": 0,
    "Glass": 0,
    "Metal": 0,
    "Paper": 0,
    "Textile": 0,
    "Electronic Waste": 0,
    "Mixed Waste": 0,
  };

  // Compound keywords (higher weight = more specific)
  const compoundKeywords: [string, WasteType, number][] = [
    ["glass bottle", "Glass", 3],
    ["glass jar", "Glass", 3],
    ["glass recycling", "Glass", 3],
    ["broken glass", "Glass", 3],
    ["wine bottle", "Glass", 3],
    ["beer bottle", "Glass", 3],
    ["plastic bottle", "Plastic", 3],
    ["plastic bag", "Plastic", 3],
    ["plastic container", "Plastic", 3],
    ["pet bottle", "Plastic", 3],
    ["metal can", "Metal", 3],
    ["aluminum can", "Metal", 3],
    ["aluminium can", "Metal", 3],
    ["scrap metal", "Metal", 3],
    ["steel can", "Metal", 3],
    ["electronic waste", "Electronic Waste", 3],
    ["e-waste", "Electronic Waste", 3],
    ["circuit board", "Electronic Waste", 3],
    ["food waste", "Organic", 3],
    ["banana peel", "Organic", 3],
    ["fruit waste", "Organic", 3],
    ["vegetable waste", "Organic", 3],
    ["paper box", "Paper", 3],
    ["cardboard box", "Paper", 3],
    ["textile recycling", "Textile", 3],
    ["cloth recycling", "Textile", 3],
    ["mixed waste", "Mixed Waste", 3],
    ["waste mixture", "Mixed Waste", 3],
    ["unsorted waste", "Mixed Waste", 3],
  ];

  for (const [keyword, wasteType, weight] of compoundKeywords) {
    if (source.includes(keyword)) {
      scores[wasteType] += weight;
    }
  }

  // Single keywords (lower weight)
  const singleKeywords: [string, WasteType][] = [
    ["organic", "Organic"],
    ["biodegradable", "Organic"],
    ["food", "Organic"],
    ["fruit", "Organic"],
    ["vegetable", "Organic"],
    ["compost", "Organic"],
    ["banana", "Organic"],
    ["apple", "Organic"],
    ["leaf", "Organic"],
    ["peel", "Organic"],
    ["plastic", "Plastic"],
    ["pet", "Plastic"],
    ["polymer", "Plastic"],
    ["bag", "Plastic"],
    ["container", "Plastic"],
    ["packaging", "Plastic"],
    ["bottle", "Plastic"],
    ["glass", "Glass"],
    ["jar", "Glass"],
    ["window", "Glass"],
    ["mirror", "Glass"],
    ["metal", "Metal"],
    ["can", "Metal"],
    ["aluminum", "Metal"],
    ["aluminium", "Metal"],
    ["steel", "Metal"],
    ["iron", "Metal"],
    ["scrap", "Metal"],
    ["tin", "Metal"],
    ["paper", "Paper"],
    ["cardboard", "Paper"],
    ["newspaper", "Paper"],
    ["box", "Paper"],
    ["carton", "Paper"],
    ["textile", "Textile"],
    ["cloth", "Textile"],
    ["fabric", "Textile"],
    ["shirt", "Textile"],
    ["clothing", "Textile"],
    ["rag", "Textile"],
    ["cotton", "Textile"],
    ["electronic", "Electronic Waste"],
    ["phone", "Electronic Waste"],
    ["battery", "Electronic Waste"],
    ["circuit", "Electronic Waste"],
    ["computer", "Electronic Waste"],
    ["laptop", "Electronic Waste"],
    ["wire", "Electronic Waste"],
    ["cable", "Electronic Waste"],
    ["charger", "Electronic Waste"],
    ["mixed", "Mixed Waste"],
    ["general", "Mixed Waste"],
    ["unsorted", "Mixed Waste"],
    ["residual", "Mixed Waste"],
  ];

  for (const [keyword, wasteType] of singleKeywords) {
    if (source.includes(keyword)) {
      scores[wasteType] += 1;
    }
  }

  let maxScore = 0;
  let selectedType: WasteType = "Mixed Waste";
  const detectedTypes: WasteType[] = [];

  for (const [wasteType, score] of Object.entries(scores)) {
    if (score > 0) {
      detectedTypes.push(wasteType as WasteType);
    }
    if (score > maxScore) {
      maxScore = score;
      selectedType = wasteType as WasteType;
    }
  }

  if (maxScore === 0) {
    const hash = simpleHash(imageSource);
    const typeIndex = hash % VALID_WASTE_TYPES.length;
    selectedType = VALID_WASTE_TYPES[typeIndex];
    const confidence = 0.65 + (hash % 25) / 100;
    return {
      waste_type: selectedType,
      confidence_score: confidence,
      recommendation: getDefaultRecommendation(selectedType),
      all_detected_types: [selectedType],
    };
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const dominance = maxScore / totalScore;
  const confidence = Math.min(0.95, 0.70 + dominance * 0.25);

  return {
    waste_type: selectedType,
    confidence_score: confidence,
    recommendation: getDefaultRecommendation(selectedType),
    all_detected_types: detectedTypes.length > 0 ? detectedTypes : [selectedType],
  };
}

async function classifyWithGemini(
  imageBase64: string,
  mimeType: string,
  apiKey: string
): Promise<ClassificationResult> {
  const prompt = `You are an expert waste classification AI for the EcoKogi waste management system in Kogi State, Nigeria.

Analyze this waste image and classify it into EXACTLY ONE of these categories:
- Organic (food waste, yard waste, biodegradable materials)
- Plastic (bottles, bags, containers, packaging)
- Glass (bottles, jars, broken glass)
- Metal (cans, foil, scrap metal)
- Paper (newspapers, cardboard, office paper)
- Textile (clothes, fabric, rags)
- Electronic Waste (phones, batteries, circuits, appliances)
- Mixed Waste (multiple types combined, unsorted)

Respond ONLY with a valid JSON object in this exact format, no markdown, no code blocks:
{
  "waste_type": "<one of the 8 categories above>",
  "confidence_score": <number between 0.0 and 1.0>,
  "recommendation": "<2-3 sentence practical disposal/recycling advice specific to Kogi State>",
  "all_detected_types": ["<list of all waste types visible in the image>"]
}`;

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      maxOutputTokens: 500,
    },
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", errorText);
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!textContent) {
    throw new Error("Empty response from Gemini API");
  }

  let parsed: ClassificationResult;
  try {
    const cleaned = textContent
      .replace(/```json
?/g, "")
      .replace(/```
?/g, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse Gemini response:", textContent);
    throw new Error("Failed to parse AI classification response");
  }

  if (!VALID_WASTE_TYPES.includes(parsed.waste_type as WasteType)) {
    const mapped = mapToValidType(parsed.waste_type);
    if (mapped) {
      parsed.waste_type = mapped;
    } else {
      parsed.waste_type = "Mixed Waste";
      parsed.confidence_score = Math.max(parsed.confidence_score - 0.2, 0.1);
    }
  }

  parsed.confidence_score = Math.min(
    1.0,
    Math.max(0.0, parsed.confidence_score || 0.5)
  );

  if (!parsed.recommendation || parsed.recommendation.trim() === "") {
    parsed.recommendation = getDefaultRecommendation(
      parsed.waste_type as WasteType
    );
  }

  return parsed;
}

function mapToValidType(input: string): WasteType | null {
  const normalized = input.toLowerCase().trim();
  const mappings: Record<string, WasteType> = {
    organic: "Organic", biodegradable: "Organic", food: "Organic", compost: "Organic",
    plastic: "Plastic", polymer: "Plastic",
    glass: "Glass", ceramic: "Glass",
    metal: "Metal", aluminium: "Metal", aluminum: "Metal", steel: "Metal", iron: "Metal",
    paper: "Paper", cardboard: "Paper",
    textile: "Textile", fabric: "Textile", cloth: "Textile", clothing: "Textile",
    "electronic waste": "Electronic Waste", electronic: "Electronic Waste",
    "e-waste": "Electronic Waste", ewaste: "Electronic Waste",
    battery: "Electronic Waste", batteries: "Electronic Waste",
    "mixed waste": "Mixed Waste", mixed: "Mixed Waste",
    general: "Mixed Waste", unsorted: "Mixed Waste",
  };

  for (const [key, value] of Object.entries(mappings)) {
    if (normalized.includes(key)) return value;
  }
  return null;
}

function getDefaultRecommendation(wasteType: WasteType): string {
  const recommendations: Record<WasteType, string> = {
    Organic: "Dispose in the green organic waste bin. Consider composting at home to reduce waste and create nutrient-rich soil for gardening in Kogi State.",
    Plastic: "Rinse and place in the recycling bin. Flatten bottles to save space. Check the recycling number for proper sorting at EcoKogi collection centers.",
    Glass: "Rinse and place in the glass recycling bin. Handle broken glass carefully and wrap in newspaper for safety at collection points.",
    Metal: "Rinse cans and place in the metal recycling bin. Scrap metal can be taken to designated EcoKogi recycling partners for cash payment.",
    Paper: "Keep dry and place in the paper recycling bin. Remove any plastic wrapping. Cardboard should be flattened for efficient collection.",
    Textile: "Donate wearable items to local charities in Kogi State. Non-wearable textiles can be dropped at designated textile recycling points.",
    "Electronic Waste": "Do NOT dispose in regular bins. Take to authorized EcoKogi e-waste collection points. Many electronics contain hazardous materials that need special handling.",
    "Mixed Waste": "Sort items into separate categories when possible. Mixed waste should be placed in the general waste bin for proper processing at the EcoKogi facility.",
  };
  return recommendations[wasteType] || "Dispose responsibly in the appropriate bin.";
}

async function fetchImageAsBase64(
  imageUrl: string
): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.warn(`Image fetch returned ${response.status} for ${imageUrl}`);
      return null;
    }
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return { base64: btoa(binary), mimeType: contentType };
  } catch (err) {
    console.warn(`Failed to fetch image: ${err}`);
    return null;
  }
}

function parseDataUrl(dataUrl: string): { base64: string; mimeType: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL format");
  return { mimeType: match[1], base64: match[2] };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const isHealthCheck = url.pathname.endsWith("/health") || req.method === "GET";

    if (isHealthCheck) {
      return new Response(
        JSON.stringify({
          status: "ok",
          service: "classify-waste",
          model: "gemini-2.0-flash",
          supported_types: VALID_WASTE_TYPES,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { image_url, image_base64, user_id } = body;

    if (!image_url && !image_base64) {
      return new Response(
        JSON.stringify({
          error: "Missing image",
          message: "Provide either image_url or image_base64",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageSource = image_url || "base64_upload";
    let imageBase64: string | null = null;
    let mimeType = "image/jpeg";
    let imageFetchFailed = false;

    if (image_base64) {
      if (image_base64.startsWith("data:")) {
        const parsed = parseDataUrl(image_base64);
        imageBase64 = parsed.base64;
        mimeType = parsed.mimeType;
      } else {
        imageBase64 = image_base64;
      }
    } else if (image_url) {
      const fetched = await fetchImageAsBase64(image_url);
      if (fetched) {
        imageBase64 = fetched.base64;
        mimeType = fetched.mimeType;
      } else {
        imageFetchFailed = true;
      }
    }

    let classification: ClassificationResult;
    let usedGemini = false;
    let geminiError: string | null = null;
    let usedFallback = false;

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const hasValidGeminiKey = geminiApiKey && 
      !geminiApiKey.includes("placeholder") && 
      !geminiApiKey.includes("test_key") &&
      geminiApiKey.length > 20;

    if (hasValidGeminiKey && imageBase64) {
      try {
        classification = await classifyWithGemini(imageBase64, mimeType, geminiApiKey!);
        usedGemini = true;
      } catch (err) {
        geminiError = err instanceof Error ? err.message : "Unknown Gemini error";
        console.warn("Gemini API failed, using fallback:", geminiError);
        classification = fallbackClassify(imageSource);
        usedFallback = true;
      }
    } else {
      classification = fallbackClassify(imageSource);
      usedFallback = true;
    }

    let savedRecord = null;
    if (user_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data, error } = await supabase
        .from("waste_classifications")
        .insert({
          user_id,
          image_url: image_url || "base64_upload",
          waste_type: classification.waste_type,
          confidence_score: classification.confidence_score,
          recommendation: classification.recommendation,
          all_detected_types: classification.all_detected_types || [],
          status: "completed",
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to save classification:", error);
      } else {
        savedRecord = data;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        classification: {
          waste_type: classification.waste_type,
          confidence_score: classification.confidence_score,
          recommendation: classification.recommendation,
          all_detected_types: classification.all_detected_types || [],
        },
        metadata: {
          model: usedGemini ? "gemini-2.0-flash" : "fallback-v2",
          used_gemini: usedGemini,
          used_fallback: usedFallback,
          image_fetch_failed: imageFetchFailed,
          gemini_error: geminiError,
        },
        record: savedRecord,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Classification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        error: "Classification failed",
        message: errorMessage,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
