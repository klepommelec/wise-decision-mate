
// Supabase Edge Function for generating options with Claude AI
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY')

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generic option images for different categories
const optionImages = [
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80", // tech
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80", // business
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80", // productivity
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80", // finance
]

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

    if (!CLAUDE_API_KEY) {
      console.error('CLAUDE_API_KEY non configurée')
      throw new Error('Configuration API manquante')
    }

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

    console.log('Envoi de la requête à Claude')

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
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

    const responseStatus = response.status
    console.log(`Réponse Claude - status: ${responseStatus}`)

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Erreur API Claude:', errorData)
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la génération des options',
          details: errorData
        }),
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
      console.log('Contenu de la réponse:', contentText)
      
      // Try to extract the JSON part
      const jsonMatch = contentText.match(/\[\s*\{.*\}\s*\]/s)
      if (jsonMatch) {
        const parsedOptions = JSON.parse(jsonMatch[0])
        console.log('Options analysées:', parsedOptions)
        
        // Add imageUrl and isAIGenerated properties to each option
        options = parsedOptions.map((option, index) => ({
          ...option,
          id: crypto.randomUUID(),
          imageUrl: optionImages[index % optionImages.length],
          isAIGenerated: true
        }))
        
        console.log('Options finales:', options)
      } else {
        console.error('Format JSON non trouvé dans la réponse')
        throw new Error('Format de réponse invalide')
      }
    } catch (e) {
      console.error('Erreur lors du parsing de la réponse:', e)
      console.error('Contenu de la réponse:', data.content)
      
      // Provide fallback options in case of parsing error
      options = [
        { id: crypto.randomUUID(), title: "Option A", description: "Première option par défaut suite à une erreur de traitement.", imageUrl: optionImages[0], isAIGenerated: true },
        { id: crypto.randomUUID(), title: "Option B", description: "Deuxième option par défaut suite à une erreur de traitement.", imageUrl: optionImages[1], isAIGenerated: true },
        { id: crypto.randomUUID(), title: "Option C", description: "Troisième option par défaut suite à une erreur de traitement.", imageUrl: optionImages[2], isAIGenerated: true },
        { id: crypto.randomUUID(), title: "Option D", description: "Quatrième option par défaut suite à une erreur de traitement.", imageUrl: optionImages[3], isAIGenerated: true }
      ]
    }

    return new Response(
      JSON.stringify({ options }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erreur dans la fonction Edge:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur inconnue',
        errorObject: JSON.stringify(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
