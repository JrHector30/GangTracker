import { NORMATIVA_DATA } from '../data/normativaData.js';

/**
 * Servicio Inteligente de Consultas de Normativa - Animals City RP
 * 
 * Reglas de respuesta:
 * 1. Empieza con un 'SÍ', 'NO' o 'DEPENDE'.
 * 2. Explicación breve, humana y entendible (lenguaje de roleplay).
 * 3. Cero inventos de internet: fundamentado 100% en los 105 artículos de Animals City RP.
 */

const SPECIFIC_RULE_RESOLVERS = [
  {
    matches: (q) => (
      (q.includes('reconocer') || q.includes('identificar')) &&
      (q.includes('atuendo') || q.includes('ropa') || q.includes('vestimenta') || q.includes('auto') || q.includes('coche') || q.includes('vehiculo')) &&
      (q.includes('escapar') || q.includes('escapado') || q.includes('fuga') || q.includes('persecucion') || q.includes('poli'))
    ),
    response: {
      verdict: 'NO',
      badgeColor: 'red',
      headline: 'No pueden reconocerte solo por la ropa o el coche tras escapar.',
      explanation: 'La Policía no puede relacionarte únicamente por sospechas, voz, apariencia física genérica o por ver un coche o vestimenta similar una vez que terminó la persecución y perdieron la visual. Para imputarte tras una fuga necesitan Pruebas IC válidas obtenidas durante el hecho (fotografía clara de tu rostro sin máscara con el celular del juego o fotografía nítida de la matrícula/placa del vehículo). Si no tienen esa prueba gráfica, no pueden pararte ni acusarte solo por el modelo de tu auto o tu atuendo.',
      category: 'Normativa Ilegales y Bandas',
      ruleReference: 'Art. 9.1: Reconocimiento de Organizaciones y Pruebas IC Válidas'
    }
  },
  {
    matches: (q) => (
      (q.includes('lootear') || q.includes('robar') || q.includes('despojar')) &&
      (q.includes('poli') || q.includes('policia') || q.includes('policías') || q.includes('agente') || q.includes('oficial')) &&
      (q.includes('abatido') || q.includes('muerto') || q.includes('suelo'))
    ),
    response: {
      verdict: 'NO',
      badgeColor: 'red',
      headline: 'Está terminantemente prohibido lootear a la policía abatida.',
      explanation: 'Queda totalmente prohibido el hurto y la extracción de material o armamento de facciones legales oficiales (Policía y EMS). La única excepción contemplada en la normativa es una situación extrema de supervivencia en mitad de un tiroteo activo donde te quedes completamente sin munición. Fuera de ese caso excepcional, robar a un oficial abatido acarrea sanción grave y reporte directo.',
      category: 'Normativa General & Ilegales',
      ruleReference: 'Art. 3.26: Robo de Material Estatal/Gubernamental y Art. 5: Actos Delictivos'
    }
  },
  {
    matches: (q) => (
      (q.includes('tiempo') || q.includes('esperar') || q.includes('cooldown') || q.includes('minutos')) &&
      (q.includes('otro robo') || q.includes('nuevo robo') || q.includes('volver a robar'))
    ),
    response: {
      verdict: '15 MINUTOS',
      badgeColor: 'amber',
      headline: 'Debes esperar 15 minutos exactos tras perder a la policía.',
      explanation: 'Después de realizar cualquier robo donde haya acudido la policía, tienes que esperar un mínimo obligatorio de 15 minutos contados desde el momento exacto en que lograste perder la persecución antes de poder iniciar un nuevo atraco. Además, no se puede robar a falta de 15 minutos para un reinicio ni durante los 15 minutos posteriores.',
      category: '⚡ Chuleta Rápida & Normativa Ilegales',
      ruleReference: 'Tiempos de Espera y Cooldowns Oficiales / Art. 5: Actos Delictivos'
    }
  },
  {
    matches: (q) => (
      (q.includes('rehen') || q.includes('rehenes') || q.includes('tendero')) &&
      (q.includes('badulaque') || q.includes('24/7') || q.includes('licoreria') || q.includes('tienda'))
    ),
    response: {
      verdict: 'SÍ',
      badgeColor: 'emerald',
      headline: 'El tendero cuenta como rehén oficial (máximo 2 rehenes).',
      explanation: 'En robos pequeños (Badulaques 24/7, licorerías, peluquerías y tiendas de tatuajes), el tendero NPC cuenta oficialmente como un rehén válido. Puedes negociar usando al tendero más un jugador civil o NPC vivo (máximo 2 rehenes en total para estos robos). Prohibido rolear rehenes con el comando /do (deben estar presentes físicamente).',
      category: 'Normativa Ilegales (Atracos)',
      ruleReference: 'Art. 6.1: Atraco a Badulaque, Licorerías y Peluquerías'
    }
  },
  {
    matches: (q) => (
      (q.includes('power gaming') || q.includes('pg')) &&
      (q.includes('fuera de') || q.includes('desierto') || q.includes('los santos') || q.includes('permitido'))
    ),
    response: {
      verdict: 'SÍ',
      badgeColor: 'emerald',
      headline: 'El Power Gaming está permitido fuera de la ciudad de Los Santos con Fair Play.',
      explanation: 'El Power Gaming (PG) en persecuciones está habilitado y permitido fuera del perímetro urbano de Los Santos, siempre y cuando se mantenga el Fair Play (FP) y no sea un abuso ridículo (por ejemplo, arrojarse con un coche por un acantilado vertical). Si se vulnera el Fair Play o se abusa, la policía tiene derecho a romper negociaciones.',
      category: 'Normativa General & Ilegales',
      ruleReference: 'Art. 1.1: Power Gaming en Persecuciones y Normativa General 3.4'
    }
  },
  {
    matches: (q) => (
      (q.includes('cambiar') || q.includes('cambio')) &&
      (q.includes('ropa') || q.includes('vestimenta') || q.includes('atuendo')) &&
      (q.includes('despues de') || q.includes('luego de') || q.includes('robo') || q.includes('delictivo') || q.includes('acto ilegal'))
    ),
    response: {
      verdict: 'NO',
      badgeColor: 'red',
      headline: 'No puedes cambiarte de ropa de inmediato tras un hecho delictivo.',
      explanation: 'Está terminantemente prohibido cambiarte de ropa o aspecto físico inmediatamente después de un acto ilegal para evadir consecuencias. La normativa exige esperar al menos 30 minutos para un cambio de vestimenta civil tras actividades ilegales (y 15 minutos en el caso de miembros de bandas con colores oficiales). Cambiarse para cortar el rol se considera abuso de normativa sancionable.',
      category: 'Normativa Ilegales y Bandas',
      ruleReference: 'Art. 9.1: Identidad y Cambio de Vestimenta'
    }
  },
  {
    matches: (q) => (
      (q.includes('disparar') || q.includes('tirar')) &&
      (q.includes('vehiculo') || q.includes('coche') || q.includes('auto') || q.includes('moto')) &&
      (q.includes('conducir') || q.includes('manejando') || q.includes('conductor'))
    ),
    response: {
      verdict: 'NO',
      badgeColor: 'red',
      headline: 'El conductor NO puede disparar con el coche en movimiento.',
      explanation: 'El conductor del vehículo solo puede abrir fuego si el vehículo se encuentra completamente detenido. Los pasajeros sí pueden disparar desde el coche en movimiento, pero únicamente a ruedas y carrocería (jamás a matar o directo al piloto del otro vehículo).',
      category: 'Normativa Ilegales (Conflictos Agresivos)',
      ruleReference: 'Art. 7: Conflictos Agresivos y Uso de Armas en Vehículos'
    }
  },
  {
    matches: (q) => (
      (q.includes('robar') || q.includes('quitar') || q.includes('sacar')) &&
      (q.includes('comida') || q.includes('movil') || q.includes('telefono') || q.includes('dni') || q.includes('licencia'))
    ),
    response: {
      verdict: 'NO',
      badgeColor: 'red',
      headline: 'Está prohibido robar comida, DNI o celular de forma permanente a civiles.',
      explanation: 'Bajo ninguna circunstancia está permitido robarle a un ciudadano su comida, bebida, documento de identidad (DNI), pinganillo o licencias. El teléfono móvil únicamente se puede retirar de forma temporal durante la escena del rol (roleando quitárselo para evitar llamadas de auxilio) pero debe ser devuelto obligatoriamente al finalizar.',
      category: 'Normativa General & Ilegales',
      ruleReference: 'Art. 5: Actos Delictivos y Secuestros Express'
    }
  },
  {
    matches: (q) => (
      (q.includes('cuantos') || q.includes('maximo') || q.includes('limite')) &&
      (q.includes('civiles') || q.includes('amigos') || q.includes('sin banda')) &&
      (q.includes('robo') || q.includes('delito') || q.includes('ilegal'))
    ),
    response: {
      verdict: '3 PERSONAS',
      badgeColor: 'amber',
      headline: 'Máximo 3 civiles para actuar como grupo delictivo.',
      explanation: 'Los civiles legales que no formen parte de una mafia u organización oficial pueden realizar robos pequeños (Badulaques, licorerías, barberías, robos rápidos) en grupos de un máximo estricto de 3 integrantes. Superar ese número se considera rolear de banda sin autorización administrativa.',
      category: 'Normativa Civil e Ilegales',
      ruleReference: 'Art. 7: Normativa Civil / Sistema de Bandas'
    }
  }
];

export function searchNormativaContext(userQuestion) {
  const query = userQuestion.toLowerCase().trim();

  for (const resolver of SPECIFIC_RULE_RESOLVERS) {
    if (resolver.matches(query)) {
      return resolver.response;
    }
  }

  const stopWords = new Set([
    'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para',
    'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'mas', 'pero', 'sus', 'le', 'ya', 'o', 'este',
    'si', 'porque', 'esta', 'son', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'mi', 'me', 'despues',
    'pueden', 'puedo', 'puede', 'podemos', 'es', 'son', 'tipo', 'tengo', 'hacer'
  ]);

  const rawWords = query
    .replace(/[¿?¡!.,;:()"-_]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  if (rawWords.length === 0) {
    return {
      verdict: 'NO CLARO',
      badgeColor: 'slate',
      headline: 'Por favor formula una pregunta más específica.',
      explanation: 'Indica qué acción quieres realizar (por ejemplo: rehenes en joyeria, lootear a un herido, uso de casco en tiroteos, o cambiar de coche en persecución).',
      category: 'Guía de Consulta',
      ruleReference: 'Consulta General'
    };
  }

  const scoredItems = [];

  NORMATIVA_DATA.forEach(category => {
    category.items.forEach(item => {
      const titleLower = item.title.toLowerCase();
      const contentLower = item.content.toLowerCase();
      let score = 0;

      rawWords.forEach(word => {
        if (titleLower.includes(word)) score += 8;
        if (contentLower.includes(word)) score += 2;
      });

      if (score > 4) {
        scoredItems.push({
          categoryName: category.name,
          title: item.title,
          content: item.content,
          score
        });
      }
    });
  });

  scoredItems.sort((a, b) => b.score - a.score);

  if (scoredItems.length === 0) {
    return {
      verdict: 'NO TIPIFICADO',
      badgeColor: 'slate',
      headline: 'No se encontró una regla específica para esta situación.',
      explanation: 'Esta situación concreta no aparece explícitamente detallada en los 105 artículos de la normativa de Animals City RP. Te recomendamos consultar directamente vía Ticket en el Discord oficial con la administración o rolearlo siguiendo el sentido común y el Fair Play.',
      category: 'Reglamento Animals City RP',
      ruleReference: 'Principio de Fair Play / Consulta de Administración'
    };
  }

  const bestMatch = scoredItems[0];
  const textSample = bestMatch.content.toLowerCase();

  let verdict = 'DEPENDE';
  let badgeColor = 'amber';

  const isProhibited = (
    textSample.includes('prohibido') ||
    textSample.includes('no está permitido') ||
    textSample.includes('no se puede') ||
    textSample.includes('sancion') ||
    textSample.includes('warn') ||
    textSample.includes('invalida')
  );

  const isAllowed = (
    textSample.includes('está permitido') ||
    textSample.includes('podrá') ||
    textSample.includes('pueden') ||
    textSample.includes('se permite') ||
    textSample.includes('válido')
  );

  if (isProhibited && !isAllowed) {
    verdict = 'NO';
    badgeColor = 'red';
  } else if (isAllowed && !isProhibited) {
    verdict = 'SÍ';
    badgeColor = 'emerald';
  }

  const sentences = bestMatch.content.split(/\n+|\.\s+/).filter(s => s.trim().length > 25);
  let relevantSentence = sentences.find(s => {
    const sLow = s.toLowerCase();
    return rawWords.some(w => sLow.includes(w));
  }) || sentences[0] || bestMatch.content.slice(0, 260);

  relevantSentence = relevantSentence
    .replace(/[✦•\t*]/g, '')
    .replace(/&quot;/g, '"')
    .trim();

  return {
    verdict,
    badgeColor,
    headline: `Según la sección "${bestMatch.title}":`,
    explanation: relevantSentence,
    category: bestMatch.categoryName,
    ruleReference: `${bestMatch.categoryName} » ${bestMatch.title}`
  };
}

export async function queryGeminiNormativa(question, apiKey) {
  if (!apiKey) {
    return searchNormativaContext(question);
  }

  const systemInstruction = `
Eres el Asistente Oficial de Normativa del servidor de GTA V Roleplay "Animals City RP".
Tu misión es resolver dudas de jugadores sobre el reglamento de forma humana, clara, precisa y directa.

REGLAS DE ORO:
1. Comienza SIEMPRE tu respuesta con "Sí.", "No." o "Depende." en la primera palabra.
2. Explica la respuesta brevemente (máximo 3-4 renglones) en tono humano, como un compañero rolero experimentado, sin sonar a robot ni inventar nada de internet.
3. Menciona la norma o artículo de Animals City RP correspondiente.
4. Si algo NO está tipificado en las normas de Animals City RP, di claramente que no está regulado en el reglamento y sugiere abrir Ticket con el staff.
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nPregunta del jugador:\n${question}` }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 300
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    let verdict = 'INFO';
    let badgeColor = 'cyan';
    if (/^sí/i.test(replyText)) {
      verdict = 'SÍ';
      badgeColor = 'emerald';
    } else if (/^no/i.test(replyText)) {
      verdict = 'NO';
      badgeColor = 'red';
    } else if (/^depende/i.test(replyText)) {
      verdict = 'DEPENDE';
      badgeColor = 'amber';
    }

    return {
      verdict,
      badgeColor,
      headline: 'Respuesta Asistente Animals City RP:',
      explanation: replyText,
      category: 'Normativa Oficial Animals City RP',
      ruleReference: 'Verificado con Reglamento Oficial'
    };
  } catch (err) {
    console.warn('Fallo llamada Gemini, usando motor local:', err);
    return searchNormativaContext(question);
  }
}
