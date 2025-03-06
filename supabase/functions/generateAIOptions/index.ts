
// Supabase Edge Function for generating options with Claude AI
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

    console.log(`Générant des options pour la décision: ${title}`)

    // Prepare the prompt for Claude
    const prompt = `
Tu es un assistant spécialisé dans l'aide à la prise de décision. 
L'utilisateur doit prendre une décision concernant : "${title}".
${description ? `Détails supplémentaires : "${description}"` : ''}

Génère 4 options distinctes et pertinentes que l'utilisateur pourrait considérer.
Chaque option doit avoir :
1. Un titre court et clair (maximum 10 mots)
2. Une description détaillée expliquant les avantages et inconvénients de cette option (environ 2-3 phrases)

Format de réponse souhaité :
[
  { "title": "Titre option 1", "description": "Description option 1" },
  { "title": "Titre option 2", "description": "Description option 2" },
  { "title": "Titre option 3", "description": "Description option 3" },
  { "title": "Titre option 4", "description": "Description option 4" }
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
        JSON.stringify({ error: 'Erreur lors de la génération des options' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    console.log('Réponse reçue de Claude')

    // Extract the content from Claude's response and parse the JSON
    let options = []
    try {
      // Extract JSON from Claude's text response
      const contentText = data.content[0].text
      // Try to extract the JSON part
      const jsonMatch = contentText.match(/\[\s*\{.*\}\s*\]/s)
      if (jsonMatch) {
        options = JSON.parse(jsonMatch[0])
        
        // Add unique IDs and isAIGenerated flag
        options = options.map((option, index) => ({
          ...option,
          id: (index + 1).toString(),
          isAIGenerated: true
        }))
      } else {
        // Fallback if the response is not in the expected format
        throw new Error('Format de réponse invalide')
      }
    } catch (e) {
      console.error('Erreur lors du parsing de la réponse:', e)
      // Provide fallback options in case of parsing error
      options = [
        { id: "1", title: "Option personnalisée 1", description: "Première option par défaut suite à une erreur de traitement.", isAIGenerated: true },
        { id: "2", title: "Option personnalisée 2", description: "Deuxième option par défaut suite à une erreur de traitement.", isAIGenerated: true },
        { id: "3", title: "Option personnalisée 3", description: "Troisième option par défaut suite à une erreur de traitement.", isAIGenerated: true },
        { id: "4", title: "Option personnalisée 4", description: "Quatrième option par défaut suite à une erreur de traitement.", isAIGenerated: true }
      ]
    }

    return new Response(
      JSON.stringify({ options }),
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
