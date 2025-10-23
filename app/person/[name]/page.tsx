"use client"

import { ExpandableButton } from "@/components/molecule-ui/expandable-button";
import { Search } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function PersonPage() {
  const router = useRouter();
  const params = useParams();
  const personName = decodeURIComponent(params.name as string);
  
  const [biography, setBiography] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('/MG.png');
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Track in-flight requests to prevent duplicates
  const bioFetchingRef = useRef(false);
  const portraitFetchingRef = useRef(false);

  useEffect(() => {
    // Reset state when person changes to prevent showing wrong data
    setImageUrl('/MG.png');
    setBiography('');
    setIsLoading(true);
    setIsImageLoading(true);

    let bioAborted = false;
    let portraitAborted = false;

    const fetchBiography = async () => {
      if (bioFetchingRef.current || bioAborted) {
        console.log('⏭️ Skipping duplicate biography fetch');
        return;
      }
      bioFetchingRef.current = true;
      
      setIsLoading(true);
      try {
        const response = await fetch('/api/biography', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: personName }),
        });

        if (!bioAborted && response.ok) {
          const data = await response.json();
          setBiography(data.biography);
        } else if (!bioAborted) {
          setBiography(`<p>Unable to load biography for ${personName}.</p>`);
        }
      } catch (error) {
        if (!bioAborted) {
          console.error('Error fetching biography:', error);
          setBiography(`<p>Unable to load biography for ${personName}.</p>`);
        }
      } finally {
        setIsLoading(false);
        bioFetchingRef.current = false;
      }
    };

    const fetchPortrait = async () => {
      if (portraitFetchingRef.current || portraitAborted) {
        console.log('⏭️ Skipping duplicate portrait fetch');
        return;
      }
      portraitFetchingRef.current = true;
      
      setIsImageLoading(true);
      try {
        const response = await fetch('/api/portrait', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: personName }),
        });

        if (!portraitAborted && response.ok) {
          const data = await response.json();
          let portraitUrl = data.imageUrl || '/MG.png';
          
          // If it's a Google Drive URL, proxy it through our server to avoid CORS
          if (portraitUrl.includes('drive.google.com')) {
            portraitUrl = `/api/image-proxy?url=${encodeURIComponent(portraitUrl)}`;
          }

          console.log(`🖼️ Setting portrait for "${personName}":`, portraitUrl);
          setImageUrl(portraitUrl);
        } else if (!portraitAborted) {
          console.error('Failed to fetch portrait:', response.statusText);
          setImageUrl('/MG.png');
        }
      } catch (error) {
        if (!portraitAborted) {
          console.error('Error fetching portrait:', error);
          setImageUrl('/MG.png');
        }
      } finally {
        setIsImageLoading(false);
        portraitFetchingRef.current = false;
      }
    };

    fetchBiography();
    fetchPortrait();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      bioAborted = true;
      portraitAborted = true;
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
                {lastName.toUpperCase()}
              </span>
            )}
          </div>
        </div>
        
        <ExpandableButton icon={<Search />} onSearch={handleSearch} />
      </header>

      {/* Content area with glass box */}
      <div className="flex-1 flex flex-col items-center justify-center" style={{ paddingTop: '0', marginTop: '0' }}>
        {/* Glass Morphism Box with Image */}
        <div 
          style={{
            position: 'relative',
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            width: '1000px',
            height: '400px',
          }}
        >
          {/* Image positioned half outside, half inside the box on left - FIXED */}
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '-221px',
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
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '10px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '14px',
                }}
              >
                Loading portrait...
              </div>
            ) : (
              <img
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
                  // Fallback to default image if proxy fails
                  (e.target as HTMLImageElement).src = '/MG.png';
                }}
              />
            )}
          </div>

          {/* Scrollable Biography Content */}
          <div 
            className="custom-scrollbar"
            style={{
              height: '100%',
              overflowY: 'auto',
              padding: '2rem',
              paddingLeft: '180px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div 
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '15px',
                lineHeight: '1.8',
                textAlign: 'justify',
              }}
            >
            <h2 
              style={{
                fontSize: '24px',
                fontWeight: 700,
                marginBottom: '1rem',
                color: 'rgba(255, 255, 255, 0.95)',
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Biography
            </h2>
            
            {isLoading ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '200px',
                color: 'rgba(255, 255, 255, 0.7)',
              }}>
                <p>Loading biography...</p>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: biography }} />
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
