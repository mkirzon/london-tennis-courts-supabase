// @deno-types="https://deno.land/std@0.208.0/http/server.ts"
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

interface CourtData {
  time: string;
  availability: string[];
}

interface VenueData {
  name: string;
  date: string;
  courts: CourtData[];
}

interface RequestData {
  url: string;
  venue: string;
  date: string;
}

interface VenueSession {
  ResourceId: string;
  StartTime: string;
  EndTime: string;
  Available: boolean;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VenueSession {
  ResourceId: string;
  StartTime: string;
  EndTime: string;
  Available: boolean;
}

async function fetchVenueData(baseUrl: string, date: string): Promise<VenueSession[]> {
  try {
    const url = baseUrl.replace(/{date}/g, date)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data as VenueSession[]
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

function parseVenueData(sessions: VenueSession[], venueName: string, date: string): VenueData {
  const courts: CourtData[] = []
  const timeSlots = new Map<string, string[]>()

  // Group sessions by time slot
  sessions.forEach(session => {
    if (session.Available) {
      const time = session.StartTime.split('T')[1].substring(0, 5) // Extract HH:mm
      const existing = timeSlots.get(time) || []
      existing.push(session.ResourceId)
      timeSlots.set(time, existing)
    }
  })

  // Convert Map to array of CourtData
  timeSlots.forEach((courtIds, time) => {
    courts.push({
      time,
      availability: courtIds
    })
  })

  return {
    name: venueName,
    date: currentDate,
    courts
  }
}

serve(async (req: Request) => {
  console.log(`Received ${req.method} request`)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestText = await req.text()
    console.log('Request body:', requestText)
    
    const requestData = JSON.parse(requestText) as RequestData
    const { url, venue, date } = requestData
    console.log('Parsed data:', { url, venue, date })
    
    if (!url || !venue) {
      return new Response(
        JSON.stringify({ error: 'URL and venue name are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const sessions = await fetchVenueData(url, date)
    console.log('Fetched sessions:', sessions)
    const data = parseVenueData(sessions, venue, date)

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})