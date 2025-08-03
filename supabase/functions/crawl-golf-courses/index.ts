import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
      return new Response(
        JSON.stringify({ error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Starting crawl for URL:', url)

    // Call Firecrawl API
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v0/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        crawlerOptions: {
          limit: 50,
          excludes: ['*/login', '*/admin', '*/cart', '*/checkout']
        },
        pageOptions: {
          includeHtml: false,
          includeMarkdown: true,
          includeRawHtml: false,
          includeTags: ['h1', 'h2', 'h3', 'p', 'a', 'div', 'span'],
          excludeTags: ['nav', 'footer', 'header', 'script', 'style']
        }
      })
    })

    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text()
      console.error('Firecrawl API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to start crawl', details: errorText }),
        { status: firecrawlResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const crawlData = await firecrawlResponse.json()
    console.log('Crawl started successfully:', crawlData)

    // If it's a crawl job, we need to check the status
    if (crawlData.jobId) {
      console.log('Crawl job started, checking status...')
      
      // Wait a bit and then check status
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      const statusResponse = await fetch(`https://api.firecrawl.dev/v0/crawl/status/${crawlData.jobId}`, {
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
            jobId: crawlData.jobId,
            status: statusData.status,
            completed: statusData.completed || 0,
            total: statusData.total || 0,
            data: statusData.data || [],
            message: 'Crawl started successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // If it's a direct response (single page)
    return new Response(
      JSON.stringify({
        success: true,
        data: crawlData,
        message: 'Page crawled successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in crawl-golf-courses function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})