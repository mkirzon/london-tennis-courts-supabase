# Tennis Courts Availability Checker - Supabase Edge Function

This Supabase Edge Function checks the availability of tennis courts by scraping venue websites and returning structured data.

## Structure

```
supabase/
  functions/
    tennis-courts/
      index.ts          # Main edge function code
      package.json      # Dependencies and scripts
      tsconfig.json     # TypeScript configuration
      .eslintrc.json    # ESLint configuration
```

## Development

1. Install dependencies:
```bash
cd supabase/functions/tennis-courts
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Deployment

Deploy the function to your Supabase project:

```bash
npm run deploy
```

## Usage

The function accepts POST requests with the following JSON body:

```json
{
  "url": "https://example-venue-booking-url.com",
  "venue": "Venue Name"
}
```

Response format:

```json
{
  "name": "Venue Name",
  "date": "Selected Date",
  "courts": [
    {
      "time": "HH:MM",
      "availability": ["Court 1", "Court 2"]
    }
  ]
}
```

## Environment Variables

None required for basic functionality. Add any API keys or secrets through the Supabase dashboard if needed.