const handler = async (req: Request): Promise<Response> => {
  console.log(`Received ${req.method} request`);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  try {
    const requestText = await req.text();
    console.log('Request body:', requestText);
    
    const { url, venue, date } = JSON.parse(requestText);
    console.log('Parsed data:', { url, venue, date });

    const apiUrl = url.replace(/{date}/g, date);
    console.log('Fetching from URL:', apiUrl);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const sessions = await response.json();
    console.log('Received sessions:', sessions);

    // Process the sessions
    const courts = [];
    const timeSlots = new Map<string, string[]>();

    sessions.forEach((session: any) => {
      if (session.Available) {
        const time = session.StartTime.split('T')[1].substring(0, 5); // Extract HH:mm
        const existing = timeSlots.get(time) || [];
        existing.push(session.ResourceId);
        timeSlots.set(time, existing);
      }
    });

    timeSlots.forEach((courtIds, time) => {
      courts.push({
        time,
        availability: courtIds
      });
    });

    const data = {
      name: venue,
      date: date,
      courts: courts.sort((a, b) => a.time.localeCompare(b.time))
    };

    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

console.log('Starting server on port 8000...');
Deno.serve({ hostname: "0.0.0.0", port: 8000 }, handler);