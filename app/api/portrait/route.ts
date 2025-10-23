import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const WEBHOOK_URL = 'https://n8nlocal.rakeshbash.live/webhook/generate-portrait';

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Step 1: Check if image URL exists in Supabase cache
    if (supabase) {
      try {
        const normalizedName = name.toLowerCase().trim();
        console.log(`🔍 Checking cache for: "${normalizedName}"`);
        
        const { data, error } = await supabase
          .from('biographies')
          .select('image_url')
          .eq('name', normalizedName)
          .maybeSingle();

        console.log(`📊 Database query result:`, { data, error });

        if (!error && data?.image_url) {
          console.log(`✅ Portrait found in cache for: ${name} -> ${data.image_url}`);
          return NextResponse.json({ 
            imageUrl: data.image_url,
            cached: true
          });
        } else {
          console.log(`❌ No cached portrait for: ${name} (image_url: ${data?.image_url || 'null'})`);
        }
      } catch (dbError) {
        console.log('Database check for portrait failed:', dbError);
      }
    }

      // Step 2: Trigger webhook in background (don't wait for response to avoid timeout)
      console.log(`🎨 Triggering background portrait generation for: ${name}`);

      // Fire and forget - don't await the webhook response
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name,
          callbackUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}/rest/v1/biographies` // For webhook to update Supabase directly
        }),
      })
        .then(async (webhookResponse) => {
          if (!webhookResponse.ok) {
            console.error(`⚠️ Webhook failed for ${name}:`, webhookResponse.statusText);
            return;
          }

          // Try to get the response
          let imageUrl = '/MG.png';
          const contentType = webhookResponse.headers.get('content-type');

          try {
            if (contentType?.includes('application/json')) {
              const webhookData = await webhookResponse.json();
              imageUrl = webhookData.imageUrl || webhookData.url || webhookData.link || webhookData.image || '/MG.png';
            } else {
              const responseText = await webhookResponse.text();
              imageUrl = responseText.trim() || '/MG.png';
            }
          } catch (parseError) {
            console.error('Failed to parse webhook response:', parseError);
            return;
          }

          // Convert Google Drive URL to direct image URL if needed
          imageUrl = convertGoogleDriveUrl(imageUrl);

          console.log(`✅ Background portrait generated for ${name}: ${imageUrl}`);

          // Save image URL to Supabase
          if (supabase && imageUrl !== '/MG.png') {
            try {
              const normalizedName = name.toLowerCase().trim();
              console.log(`💾 Saving background portrait for: "${normalizedName}" -> ${imageUrl}`);
              
              const { data: upsertData, error: upsertError } = await supabase
                .from('biographies')
                .upsert(
                  {
                    name: normalizedName,
                    display_name: name,
                    image_url: imageUrl,
                    biography: null,
                    created_at: new Date().toISOString()
                  },
                  {
                    onConflict: 'name',
                    ignoreDuplicates: false
                  }
                )
                .select();

              if (upsertError) {
                console.error('❌ Failed to save background portrait:', upsertError);
              } else if (upsertData && upsertData.length > 0) {
                console.log(`✅ Background portrait saved for: ${name}`);
              }
            } catch (saveError) {
              console.error('Error saving background portrait:', saveError);
            }
          }
        })
        .catch((webhookError) => {
          console.error(`⚠️ Background webhook error for ${name}:`, webhookError);
        });

      // Return immediately with placeholder - webhook will update Supabase in background
      console.log(`⚡ Returning immediately (generating in background)...`);
      
      return NextResponse.json({ 
        imageUrl: '/MG.png',
        cached: false,
        generating: true, // Flag to indicate background generation
        message: 'Portrait is being generated. Refresh in 60 seconds.'
      });

  } catch (error) {
    console.error('Portrait API error:', error);
    return NextResponse.json(
      { imageUrl: '/MG.png', error: 'Failed to fetch portrait' },
      { status: 500 }
    );
  }
}

// Helper function to convert Google Drive URLs to direct image URLs
function convertGoogleDriveUrl(url: string): string {
  if (!url || url === '/MG.png') return url;

  // Check if it's already in the correct format
  if (url.includes('drive.google.com/uc?')) {
    return url;
  }

  // Extract file ID from various Google Drive URL formats
  let fileId = null;

  // Format: https://drive.google.com/file/d/FILE_ID/view
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) {
    fileId = match1[1];
  }

  // Format: https://drive.google.com/open?id=FILE_ID
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) {
    fileId = match2[1];
  }

  // If we found a file ID, convert to direct link
  if (fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  // Return original URL if we couldn't convert it
  return url;
}
