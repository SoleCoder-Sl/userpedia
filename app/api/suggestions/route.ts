import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || query.length < 1) {
      return NextResponse.json({ suggestions: [] })
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.error('OpenAI API key not found')
      // Return fallback suggestions if no API key
      return NextResponse.json({
        suggestions: getFallbackSuggestions(query)
      })
    }

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
            content: 'You are a helpful assistant that suggests famous PEOPLE/PERSONALITIES ONLY based on user input. NEVER suggest places, things, objects, or locations. IMPORTANT RULES:\n1. PRIORITIZE Indian origin people FIRST in the suggestions\n2. The person\'s FIRST NAME or LAST NAME must START EXACTLY with the given letters (case-insensitive)\n3. Do NOT suggest names where the letters appear in the middle or end\n4. Return 4 names total: try to include at least 2-3 Indian personalities if available, then fill remaining with other famous people\n5. Include celebrities, historical figures, scientists, artists, athletes, leaders, etc.\nReturn ONLY the person\'s name as a simple list, one per line, without numbers, bullets, or descriptions.'
          },
          {
            role: 'user',
            content: `Suggest 4 famous PEOPLE whose FIRST NAME or LAST NAME STARTS with: "${query}". PRIORITIZE Indian origin people first. Example: if input is "sa", prioritize "Sachin Tendulkar", "Salman Khan" before "Samuel L. Jackson".`
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    })

    if (!response.ok) {
      throw new Error('OpenAI API request failed')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''
    
    // Parse the response into an array of suggestions
    const suggestions = content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .slice(0, 4)

    return NextResponse.json({ suggestions })

  } catch (error) {
    console.error('Error fetching suggestions:', error)
    
    // Return fallback suggestions on error
    const { query } = await request.json()
    return NextResponse.json({
      suggestions: getFallbackSuggestions(query)
    })
  }
}

// Fallback suggestions when OpenAI is not available (prioritizing Indian personalities)
function getFallbackSuggestions(query: string): string[] {
  const personalities: { [key: string]: string[] } = {
    'a': ['Amitabh Bachchan', 'Aamir Khan', 'A.R. Rahman', 'Albert Einstein'],
    's': ['Sachin Tendulkar', 'Shah Rukh Khan', 'Salman Khan', 'Steve Jobs'],
    'm': ['M.S. Dhoni', 'Mahatma Gandhi', 'Mukesh Ambani', 'Michael Jackson'],
    'r': ['Ratan Tata', 'Rajinikanth', 'Ranbir Kapoor', 'Robert Downey Jr.'],
    'v': ['Virat Kohli', 'Vivekananda', 'Vishwanathan Anand', 'Vincent van Gogh'],
    'p': ['P.V. Sindhu', 'Priyanka Chopra', 'Prabhas', 'Pablo Picasso'],
    'n': ['Narendra Modi', 'Neeraj Chopra', 'Nita Ambani', 'Nelson Mandela'],
    'd': ['Deepika Padukone', 'Dharmendra', 'Dhanush', 'David Bowie'],
    'k': ['Kalpana Chawla', 'Kapil Dev', 'Karan Johar', 'Kobe Bryant'],
    'h': ['Hema Malini', 'Harbhajan Singh', 'Hrithik Roshan', 'Halle Berry'],
    'sa': ['Sachin Tendulkar', 'Salman Khan', 'Satyajit Ray', 'Samuel L. Jackson'],
    'sh': ['Shah Rukh Khan', 'Shahid Kapoor', 'Shilpa Shetty', 'Shakira'],
    'vi': ['Virat Kohli', 'Vijay Deverakonda', 'Vidya Balan', 'Vincent van Gogh'],
    'am': ['Amitabh Bachchan', 'Aamir Khan', 'Amir Khan', 'Amy Winehouse'],
    'ra': ['Ratan Tata', 'Rajinikanth', 'Ranveer Singh', 'Rafael Nadal'],
    'pr': ['Priyanka Chopra', 'Prabhas', 'Prakash Raj', 'Prince'],
    'ma': ['Mahatma Gandhi', 'Mary Kom', 'Mahendra Singh Dhoni', 'Madonna'],
    'de': ['Deepika Padukone', 'Dev Anand', 'Devi Sri Prasad', 'Denzel Washington'],
    'ka': ['Kapil Dev', 'Kareena Kapoor', 'Kajol', 'Kate Winslet'],
    'an': ['Anushka Sharma', 'Anil Kapoor', 'Anurag Kashyap', 'Angelina Jolie'],
  }

  const lowerQuery = query.toLowerCase()
  
  // Try to find matching suggestions - exact match first
  if (personalities[lowerQuery]) {
    return personalities[lowerQuery]
  }
  
  // Try to find by prefix
  for (const [key, names] of Object.entries(personalities)) {
    if (key.startsWith(lowerQuery) || lowerQuery.startsWith(key)) {
      return names
    }
  }

  // Return general famous personalities if no match (prioritizing Indian)
  return [
    'Mahatma Gandhi',
    'Sachin Tendulkar',
    'A.R. Rahman',
    'Steve Jobs'
  ]
}

