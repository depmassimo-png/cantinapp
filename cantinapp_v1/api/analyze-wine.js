// ============================================================
// Vercel Edge Function — Analizza etichetta vino con Claude
// Path: /api/analyze-wine
// ============================================================

export const config = {
  runtime: 'edge',
};

const SYSTEM_PROMPT = `Sei un sommelier esperto. Analizza l'etichetta fronte (e retro se fornito) di una bottiglia di vino ed estrai i seguenti dati in JSON.

Restituisci SOLO un oggetto JSON valido, senza testo aggiuntivo, senza markdown, senza backtick. Schema:

{
  "nome_vino": "string o null - nome commerciale del vino (es. 'Barolo Riserva Monfortino', 'Brunello di Montalcino', 'Châteauneuf-du-Pape')",
  "produttore": "string o null - nome della cantina/produttore (es. 'Giacomo Conterno', 'Biondi Santi', 'Château Margaux')",
  "annata": "number o null - anno di vendemmia",
  "tipologia": "rosso | bianco | rosato | spumante | passito | liquoroso - deduci dal colore della bottiglia, etichetta, denominazione",
  "denominazione": "string o null - es. 'DOCG', 'DOC', 'IGT', 'AOC', 'AOP', 'DO', 'DOCa', 'QbA', 'Vino da Tavola'",
  "nazione": "string o null - paese di origine. Valori esatti da usare: 'Italia', 'Francia', 'Spagna', 'Portogallo', 'Germania', 'Austria', 'Svizzera', 'Grecia', 'Ungheria', 'Slovenia', 'Croazia', 'Georgia', 'Stati Uniti', 'Argentina', 'Cile', 'Australia', 'Nuova Zelanda', 'Sudafrica'. Se altra nazione, usa 'Altro'.",
  "regione": "string o null - regione di produzione. Per l'Italia usa una delle 20 regioni ufficiali (es. 'Toscana', 'Piemonte', 'Trentino-Alto Adige'). Per altre nazioni usa la zona vinicola (es. 'Bordeaux', 'Borgogna', 'Champagne', 'Mosella', 'Rioja', 'Douro', 'Napa Valley')",
  "vitigni": "array di stringhe o null - vitigni indicati in etichetta o deducibili dalla denominazione",
  "gradazione": "number o null - percentuale alcol (es. 13.5)",
  "formato_ml": "number - in ml, default 750",
  "metodo": "classico | charmat | ancestrale o null - solo per spumanti",
  "sboccatura": "number o null - anno di sboccatura (solo spumanti metodo classico)",
  "dosaggio": "string o null - es. 'Brut Nature', 'Brut', 'Extra Dry' (solo spumanti)"
}

Regole:
- Se un dato non è chiaramente leggibile, metti null
- DEDUCI sempre nazione e regione anche se non scritti esplicitamente: 'Barolo'/'Brunello' → Italia/Piemonte o Toscana; 'Châteauneuf-du-Pape' → Francia/Rodano; 'Rioja' → Spagna/Rioja; 'Mosel' → Germania/Mosella
- Per i Barolo, Brunello, ecc. deduci automaticamente anche vitigno
- "Tipologia" è obbligatoria, deducila dal contesto
- "nazione" è OBBLIGATORIA: se non identifichi la nazione dall'etichetta, usa 'Italia' come default solo se ci sono segnali italiani (lingua, codici fiscali italiani, DOC/DOCG/IGT); altrimenti deduci dal nome del vino o produttore
- Non inventare dati: meglio null che ipotesi (tranne per nazione)
- Per i vitigni usa nomi italiani standard (es. "Nebbiolo", "Sangiovese", non "Sangiovese Grosso")`;

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key non configurata' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { fronte_base64, retro_base64, fronte_media_type, retro_media_type } = body;

    if (!fronte_base64) {
      return new Response(JSON.stringify({ error: 'Foto fronte obbligatoria' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Costruisci messaggi per Claude
    const content = [];

    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: fronte_media_type || 'image/jpeg',
        data: fronte_base64
      }
    });
    content.push({ type: 'text', text: 'Questo è il FRONTE dell\'etichetta.' });

    if (retro_base64) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: retro_media_type || 'image/jpeg',
          data: retro_base64
        }
      });
      content.push({ type: 'text', text: 'Questo è il RETRO/controetichetta.' });
    }

    content.push({
      type: 'text',
      text: 'Analizza le immagini ed estrai i dati del vino. Restituisci SOLO il JSON, senza testo aggiuntivo.'
    });

    // Chiama Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Claude API error:', errText);
      return new Response(JSON.stringify({
        error: 'Errore Claude API',
        details: errText
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || '';

    // Pulizia: a volte Claude mette i backtick anche se gli dici di no
    let cleaned = rawText.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      return new Response(JSON.stringify({
        error: 'Risposta AI non valida',
        raw: rawText
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: parsed,
      usage: data.usage
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Server error:', err);
    return new Response(JSON.stringify({
      error: 'Errore server',
      details: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
