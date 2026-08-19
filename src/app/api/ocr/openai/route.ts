import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, applyRateLimit } from '@/lib/auth/middleware';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const rlError = applyRateLimit(req, 'ocr');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(req);
    if (authError) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a medical lab report OCR assistant. Extract lab test values from this medical report image. 

IMPORTANT: Only extract values that are HIGHLIGHTED (yellow/orange background), BOLD, or shown in RED/abnormal color. Ignore normal/unhighlighted values.

Return a JSON object with:
- "rawText": the full text you can read from the image
- "labValues": array of { "testName": "...", "value": "...", "unit": "...", "normalRange": "..." } - ONLY for highlighted/bold/abnormal values
- "vitals": { "systolic": "...", "diastolic": "...", "pulse": "...", "temperature": "...", "spo2": "...", "weight": "...", "height": "..." }
- "diagnoses": array of diagnosis strings found
- "medicines": array of medicine name strings found
- "complaints": array of complaint strings found
- "reportDate": the report/collection date in YYYY-MM-DD format (look for "COL.Date", "Report Date", "Collection Date", "Sample Date", etc.)

Focus on extracting ONLY the highlighted/bold/abnormal values from the report.

Return ONLY valid JSON, no markdown formatting.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`,
                  detail: 'high',
                },
              },
              {
                type: 'text',
                text: 'Extract ONLY the highlighted, bold, or abnormal (red-colored) lab values from this medical report. Ignore normal/unhighlighted values.',
              },
            ],
          },
        ],
        max_tokens: 4000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error('[ocr-proxy] OpenAI API error:', response.status);
      return NextResponse.json({ error: 'OCR processing failed' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'No content in OCR response' }, { status: 502 });
    }

    // Parse JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      return NextResponse.json({ error: 'Failed to parse OCR result' }, { status: 502 });
    }

    return NextResponse.json({ result: parsed });
  } catch (e) {
    console.error('[ocr-proxy]', e);
    return NextResponse.json({ error: 'OCR proxy failed' }, { status: 500 });
  }
}
