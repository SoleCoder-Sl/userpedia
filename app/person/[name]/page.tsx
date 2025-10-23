"use client"

import { ExpandableButton } from "@/components/molecule-ui/expandable-button";
import { Search } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function PersonPage() {
  const router = useRouter();
  const params = useParams();
  const personName = decodeURIComponent(params.name as string);
  
  const [biography, setBiography] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    console.log(`🔄 Effect triggered for: ${personName}`);
    
    // IMMEDIATELY clear old data to prevent showing wrong person's info
    setImageUrl('');
    setBiography('');
    setIsLoading(true);
    setIsImageLoading(true);
    setShowSlowMessage(false);

    // Flag to prevent state updates after cleanup
    let isActive = true;
    let slowTimer: NodeJS.Timeout | null = null;

    const fetchBiography = async () => {
      console.log(`📖 Fetching biography for: ${personName}`);
      
      try {
        const response = await fetch('/api/biography', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: personName }),
        });

        if (!isActive) {
          console.log(`⏭️ Biography response ignored (person changed): ${personName}`);
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setBiography(data.biography);
          console.log(`✅ Biography loaded for: ${personName}`);
        } else {
          setBiography(`<p>Unable to load biography for ${personName}.</p>`);
        }
      } catch (error) {
        if (isActive) {
          console.error('Error fetching biography:', error);
          setBiography(`<p>Unable to load biography for ${personName}.</p>`);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    const fetchPortrait = async () => {
      console.log(`🖼️ Fetching portrait for: ${personName}`);
      
      // Show slow message after 15 seconds
      slowTimer = setTimeout(() => {
        if (isActive) {
          console.log('⏰ Portrait taking longer than expected...');
          setShowSlowMessage(true);
        }
      }, 15000);
      
      try {
        const response = await fetch('/api/portrait', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: personName }),
        });

        if (!isActive) {
          console.log(`⏭️ Portrait response ignored (person changed): ${personName}`);
          return;
        }

        if (response.ok) {
          const data = await response.json();
          let portraitUrl = data.imageUrl || '';
          
          if (portraitUrl && portraitUrl.includes('drive.google.com')) {
            // Proxy through our server to avoid CORS
            portraitUrl = `/api/image-proxy?url=${encodeURIComponent(portraitUrl)}`;
          }

          if (portraitUrl) {
            console.log(`✅ Portrait URL for "${personName}": ${portraitUrl}`);
            setImageUrl(portraitUrl);
            setShowSlowMessage(false);
          } else {
            console.warn(`⚠️ No portrait URL received for: ${personName}`);
          }
        } else {
          console.error(`❌ Failed to fetch portrait for ${personName}:`, response.statusText);
        }
      } catch (error) {
        if (isActive) {
          console.error('❌ Error fetching portrait:', error);
        }
      } finally {
        if (slowTimer) {
          clearTimeout(slowTimer);
        }
        if (isActive) {
          setIsImageLoading(false);
        }
      }
    };

    // Fetch data
    fetchBiography();
    fetchPortrait();

    // Cleanup: prevent state updates when person changes
    return () => {
      console.log(`🧹 Cleaning up for: ${personName}`);
      isActive = false;
      if (slowTimer) {
        clearTimeout(slowTimer);
      }
    };
  }, [personName]);

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    router.push(`/person/${encodeURIComponent(query)}`);
  };

  // Split name into parts for styling
  const nameParts = personName.split(' ');
  const firstName = nameParts.slice(0, -1).join(' ') || personName;
  const lastName = nameParts[nameParts.length - 1] || '';

  return (
    <div 
      className="h-screen overflow-hidden flex flex-col"
      style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(0,0,0,0.85) 100%)" }}
    >
      {/* Header with back button and search button */}
      <header className="flex justify-between items-start p-6 relative">
        {/* Go Back to Home Button - Dark Glass Morphism */}
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
          }}
        >
          ← Go Back to Home
        </button>

        {/* Centered Text in Header */}
        <div 
          style={{ 
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '1.5rem',
            textAlign: 'center'
          }}
        >
          {/* Bio Name */}
          <div 
            className="bio-name"
            style={{
              textAlign: 'center',
              lineHeight: '1.1',
              textTransform: 'uppercase',
            }}
          >
            {/* First Name - Elegant Serif */}
            {firstName && (
              <span 
                className="first"
                style={{
                  display: 'block',
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(18px, 3vw, 36px)',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  color: 'rgba(255,255,255,0.95)',
                  textShadow: '0 2px 10px rgba(0,0,0,0.4)',
                }}
              >
                {firstName}
              </span>
            )}
            
            {/* Last Name - Dark Glass Text */}
            {lastName && (
              <span 
                style={{
                  display: 'block',
                  fontWeight: 900,
                  fontSize: 'clamp(36px, 6vw, 72px)',
                  letterSpacing: '6px',
                  textTransform: 'uppercase',
                  background: 'linear-gradient(90deg, #1a1a1a, #4a4a4a, #1a1a1a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: 'none',
                  boxShadow: 'none',
                  border: 'none',
                  outline: 'none',
                }}
              >
                {lastName}
              </span>
            )}
          </div>
        </div>

        {/* Expandable Search Button */}
        <ExpandableButton 
          icon={<Search size={20} />}
          onSearch={handleSearch}
          className="z-50"
        />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        {/* Glass Morphism Box */}
        <div
          style={{
            position: 'relative',
            width: '1000px',
            height: '400px',
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '250px', // Space for the image
            overflow: 'hidden',
          }}
        >
          {/* Image Container (Half out, half in) */}
          <div
            style={{
              position: 'absolute',
              left: '-221px', // Half of 442px
              top: '50%',
              transform: 'translateY(-50%)',
              width: '442px',
              height: '442px',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            {isImageLoading ? (
              <div 
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '10px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '14px',
                  padding: '20px',
                  textAlign: 'center',
                  gap: '10px',
                }}
              >
                {showSlowMessage ? (
                  <>
                    <div style={{ fontSize: '16px', fontWeight: 600 }}>
                      🎨 First time search!
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: '1.5', maxWidth: '350px' }}>
                      Our team is creating a custom portrait for {personName}.
                      This may take 30-60 seconds. Please wait...
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '10px' }}>
                      Future searches will be instant!
                    </div>
                  </>
                ) : (
                  <>
                    <div>Generating portrait...</div>
                    <div style={{ fontSize: '11px', opacity: 0.7 }}>Please wait</div>
                  </>
                )}
              </div>
            ) : imageUrl ? (
              <img
                key={personName} // Force re-render on person change
                src={imageUrl}
                alt={personName}
                width="442"
                height="442"
                style={{ 
                  width: '442px',
                  height: '442px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.3))',
                }}
                onError={(e) => {
                  console.error(`Failed to load portrait: ${imageUrl}`);
                }}
              />
            ) : (
              <div 
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '10px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '12px',
                  gap: '5px',
                }}
              >
                <div>❌ Portrait generation failed</div>
                <div style={{ fontSize: '10px', opacity: 0.6 }}>Please try again later</div>
              </div>
            )}
          </div>

          {/* Scrollable Biography Content */}
          <div 
            className="custom-scrollbar"
            style={{
              flex: 1,
              height: '100%',
              overflowY: 'scroll',
              padding: '20px 40px 20px 0', // Adjusted padding for left alignment
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1rem',
              lineHeight: '1.6',
              textAlign: 'left',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE and Edge
            }}
          >
            {/* Hide scrollbar for Webkit browsers */}
            <style jsx global>{`
              .custom-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {isLoading ? (
              <p>Loading biography...</p>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: biography }} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
