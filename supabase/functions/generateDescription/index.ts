
// Supabase Edge Function for generating descriptions with Claude AI
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY')

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { title, context, type } = await req.json()

    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Le titre est requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Générant une description pour ${type}: ${title} dans le contexte: ${context}`)

    // Prepare the prompt for Claude based on whether it's an option or criterion
    let prompt = '';
    if (type === 'option') {
      prompt = `
Tu es un assistant spécialisé dans l'aide à la prise de décision.
L'utilisateur analyse une décision concernant : "${context}".
Il a ajouté une option intitulée : "${title}".

Génère une description détaillée et objective pour cette option (2-3 phrases) qui explique:
- En quoi consiste cette option
- Ses avantages potentiels
- Ses inconvénients éventuels

Ta réponse doit être courte, directe et utile pour l'analyse décisionnelle.
Réponds uniquement avec la description, sans autre texte.`;
    } else {
      prompt = `
Tu es un assistant spécialisé dans l'aide à la prise de décision.
L'utilisateur analyse une décision concernant : "${context}".
Il a ajouté un critère intitulé : "${title}".

Génère une brève explication (1-2 phrases) de ce que signifie ce critère dans le contexte de cette décision et pourquoi il est important à considérer.

Ta réponse doit être courte, directe et utile pour l'analyse décisionnelle.
Réponds uniquement avec l'explication, sans autre texte.`;
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 250,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Erreur API Claude:', errorData)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la génération de la description' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    console.log('Réponse reçue de Claude')

    // Extract the content from Claude's response
    const description = data.content[0].text.trim()
    
    return new Response(
      JSON.stringify({ description }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erreur dans la fonction Edge:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
