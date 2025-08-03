import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the Firecrawl API key from Supabase secrets
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not found in environment')
      return new Response(
        JSON.stringify({ error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Starting crawl for URL:', url)

    // Call Firecrawl API v1 - Try scraping first for immediate results
    console.log('Trying single page scrape first...')
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown'],
        includeTags: ['h1', 'h2', 'h3', 'p', 'a', 'div'],
        excludeTags: ['nav', 'footer', 'header', 'script', 'style'],
      })
    })

    if (scrapeResponse.ok) {
      const scrapeData = await scrapeResponse.json()
      console.log('Single page scrape successful')
      
      if (scrapeData.data && scrapeData.data.markdown) {
        return new Response(
          JSON.stringify({
            success: true,
            data: [scrapeData.data],
            message: `Successfully scraped the main page. Content length: ${scrapeData.data.markdown.length} characters`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    console.log('Single page scrape failed, trying full crawl...')
    
    // If single page scrape fails, try full crawl
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        limit: 20,
        scrapeOptions: {
          formats: ['markdown'],
          includeTags: ['h1', 'h2', 'h3', 'p', 'a', 'div'],
          excludeTags: ['nav', 'footer', 'header', 'script', 'style'],
        },
        allowBackwardCrawling: false,
        allowExternalContentLinks: false
      })
    })

    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text()
      console.error('Firecrawl API error:', firecrawlResponse.status, errorText)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Firecrawl API error: ${firecrawlResponse.status}`,
          details: errorText 
        }),
        { status: firecrawlResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const crawlData = await firecrawlResponse.json()
    console.log('Crawl response:', crawlData)

    // Check if we got data directly or need to poll for results
    if (crawlData.data && Array.isArray(crawlData.data)) {
      // Direct response with data
      return new Response(
        JSON.stringify({
          success: true,
          data: crawlData.data,
          message: `Successfully crawled ${crawlData.data.length} pages`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (crawlData.id) {
      // Got a job ID, need to check status
      console.log('Got crawl job ID:', crawlData.id)
      
      // Wait a bit for the crawl to start
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Check status
      const statusResponse = await fetch(`https://api.firecrawl.dev/v1/crawl/${crawlData.id}`, {
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
        }
      })

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        console.log('Crawl status:', statusData)
        
        return new Response(
          JSON.stringify({
            success: true,
            jobId: crawlData.id,
            status: statusData.status,
            completed: statusData.completed || 0,
            total: statusData.total || 0,
            data: statusData.data || [],
            message: `Crawl ${statusData.status}. Found ${statusData.completed || 0} pages.`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        console.error('Status check failed:', statusResponse.status)
        return new Response(
          JSON.stringify({
            success: true,
            jobId: crawlData.id,
            status: 'started',
            message: 'Crawl started successfully but status check failed'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      console.error('Unexpected response format:', crawlData)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Unexpected response format from Firecrawl',
          details: crawlData 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error in crawl-golf-courses function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})