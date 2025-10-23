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

      // Step 2: Call webhook and wait for image URL
      console.log(`🎨 Generating portrait for: ${name}`);

      try {
        const webhookResponse = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name }),
        });

        if (!webhookResponse.ok) {
          console.error('Webhook failed:', webhookResponse.statusText);
          return NextResponse.json({ 
            error: 'Webhook failed',
            cached: false
          }, { status: 500 });
        }

        // Get the image URL from webhook
        let imageUrl = '';
        const contentType = webhookResponse.headers.get('content-type');

        try {
          if (contentType?.includes('application/json')) {
            const webhookData = await webhookResponse.json();
            imageUrl = webhookData.imageUrl || webhookData.url || webhookData.link || webhookData.image || '';
          } else {
            const responseText = await webhookResponse.text();
            imageUrl = responseText.trim() || '';
          }
        } catch (parseError) {
          console.error('Failed to parse webhook response:', parseError);
          return NextResponse.json({ 
            error: 'Failed to parse webhook response',
            cached: false
          }, { status: 500 });
        }

        if (!imageUrl) {
          console.error('No image URL received from webhook');
          return NextResponse.json({ 
            error: 'No image URL from webhook',
            cached: false
          }, { status: 500 });
        }

        // Convert Google Drive URL to direct image URL
        imageUrl = convertGoogleDriveUrl(imageUrl);

        console.log(`✅ Portrait generated for ${name}: ${imageUrl}`);

        // Step 3: Update image URL in Supabase (row must already exist from biography API)
        if (supabase && imageUrl) {
          try {
            const normalizedName = name.toLowerCase().trim();
            console.log(`💾 Updating portrait URL for: "${normalizedName}" -> ${imageUrl}`);
            
            const { data: updateData, error: updateError } = await supabase
              .from('biographies')
              .update({ image_url: imageUrl })
              .eq('name', normalizedName)
              .select();

            if (updateError) {
              console.error('❌ Failed to update portrait URL:', updateError);
            } else if (updateData && updateData.length > 0) {
              console.log(`✅ Portrait URL updated for: ${name}`);
            } else {
              console.warn(`⚠️ No rows updated for: ${name}. Row might not exist yet.`);
            }
          } catch (saveError) {
            console.error('Error updating portrait URL:', saveError);
          }
        }

        return NextResponse.json({ 
          imageUrl,
          cached: false
        });

      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        return NextResponse.json({ 
          error: 'Failed to generate portrait',
          cached: false
        }, { status: 500 });
      }

  } catch (error) {
    console.error('Portrait API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portrait' },
      { status: 500 }
    );
  }
}

// Helper function to convert Google Drive URLs to direct image URLs
function convertGoogleDriveUrl(url: string): string {
  if (!url) return url;

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
