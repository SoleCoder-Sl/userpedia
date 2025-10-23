import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Step 1: Check if biography exists in Supabase
    if (supabase) {
      try {
        const normalizedName = name.toLowerCase().trim();
        
        const { data, error } = await supabase
          .from('biographies')
          .select('biography, created_at')
          .eq('name', normalizedName)
          .maybeSingle();

        if (!error && data) {
          console.log(`✅ Biography found in database for: ${name}`);
          return NextResponse.json({ 
            biography: data.biography,
            cached: true,
            created_at: data.created_at
          });
        }
      } catch (dbError) {
        console.log('Database check failed, proceeding to generate:', dbError);
      }
    }

    // Step 2: Generate new biography if not in database
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback biography if no API key
      const fallbackBio = generateFallbackBio(name);
      return NextResponse.json({
        biography: fallbackBio,
        cached: false
      });
    }

    // Call OpenAI API to generate biography
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a biographical expert. Write detailed, accurate biographies with important words and dates in bold using HTML <strong> tags. Format the biography with multiple paragraphs using <p> tags with style="margin-bottom: 1rem". Include key dates, achievements, and legacy. Make it informative and engaging.'
          },
          {
            role: 'user',
            content: `Write a comprehensive biography for ${name}. Include:
- Full name and birth/death dates
- Early life and education
- Major achievements and contributions
- Important movements, works, or discoveries
- Legacy and impact
Use <strong> tags for important names, dates, places, concepts, and achievements. Format with <p> tags.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      return NextResponse.json({
        biography: generateFallbackBio(name)
      });
    }

    const data = await response.json();
    const biography = data.choices[0]?.message?.content || generateFallbackBio(name);

    // Step 3: Save the generated biography to Supabase for future use
    if (supabase && biography) {
      try {
        const normalizedName = name.toLowerCase().trim();
        
        const { error: insertError } = await supabase
          .from('biographies')
          .insert({
            name: normalizedName,
            display_name: name,
            biography: biography,
            image_url: null, // Will be populated by portrait API
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Failed to save biography to database:', insertError);
        } else {
          console.log(`💾 Biography saved to database for: ${name} (normalized: "${normalizedName}")`);
        }
      } catch (saveError) {
        console.error('Error saving to database:', saveError);
      }
    }

    return NextResponse.json({ 
      biography,
      cached: false 
    });
  } catch (error) {
    console.error('Biography API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch biography' },
      { status: 500 }
    );
  }
}

function generateFallbackBio(name: string): string {
  return `
    <p style="margin-bottom: 1rem">
      <strong>${name}</strong> is a notable personality whose contributions have made a significant impact in their field.
    </p>
    <p style="margin-bottom: 1rem">
      Throughout their career, <strong>${name}</strong> has been recognized for their dedication, expertise, and influence.
      Their work continues to inspire and shape the understanding of their contemporaries and future generations.
    </p>
    <p style="margin-bottom: 1rem">
      Known for their remarkable achievements, <strong>${name}</strong> has left an indelible mark through their contributions,
      demonstrating excellence and commitment to their craft.
    </p>
    <p style="margin-bottom: 0">
      The legacy of <strong>${name}</strong> continues to be celebrated and studied, serving as an inspiration for those
      who follow in their footsteps.
    </p>
  `;
}

