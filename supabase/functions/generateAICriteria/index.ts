
// Supabase Edge Function for generating criteria with Claude AI
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
    const { title, description } = await req.json()

    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Le titre de la décision est requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Générant des critères pour la décision: ${title}`)

    // Prepare the prompt for Claude
    const prompt = `
Tu es un assistant spécialisé dans l'aide à la prise de décision. 
L'utilisateur doit prendre une décision concernant : "${title}".
${description ? `Détails supplémentaires : "${description}"` : ''}

Génère 5 critères pertinents et distincts que l'utilisateur devrait prendre en compte pour évaluer ses options.
Chaque critère doit avoir :
1. Un nom court et clair (maximum 3 mots)
2. Une importance par défaut de 1 à 5 selon la pertinence estimée du critère (5 étant le plus important)

Format de réponse souhaité :
[
  { "name": "Critère 1", "weight": 4 },
  { "name": "Critère 2", "weight": 3 },
  { "name": "Critère 3", "weight": 5 },
  { "name": "Critère 4", "weight": 2 },
  { "name": "Critère 5", "weight": 3 }
]
Réponds uniquement avec ce JSON, sans autre texte.`

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
        max_tokens: 1000,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Erreur API Claude:', errorData)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la génération des critères' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    console.log('Réponse reçue de Claude')

    // Extract the content from Claude's response and parse the JSON
    let criteria = []
    try {
      // Extract JSON from Claude's text response
      const contentText = data.content[0].text
      // Try to extract the JSON part
      const jsonMatch = contentText.match(/\[\s*\{.*\}\s*\]/s)
      if (jsonMatch) {
        criteria = JSON.parse(jsonMatch[0])
        // Add id and isAIGenerated properties
        criteria = criteria.map((criterion, index) => ({
          ...criterion,
          id: (index + 1).toString(),
          isAIGenerated: true
        }))
      } else {
        // Fallback if the response is not in the expected format
        throw new Error('Format de réponse invalide')
      }
    } catch (e) {
      console.error('Erreur lors du parsing de la réponse:', e)
      // Provide fallback criteria in case of parsing error
      criteria = [
        { id: "1", name: "Coût", weight: 4, isAIGenerated: true },
        { id: "2", name: "Qualité", weight: 3, isAIGenerated: true },
        { id: "3", name: "Durabilité", weight: 5, isAIGenerated: true }
      ]
    }

    return new Response(
      JSON.stringify({ criteria }),
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
