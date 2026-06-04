export interface MedicamentoInfo {
  nombre: string;
  funcion: string;
  efectos_adversos: string[];
  interacciones: string[];
  recomendaciones: string;
}

export interface MedicamentosDb {
  [key: string]: MedicamentoInfo;
}

/**
 * Normaliza un texto convirtiéndolo a minúsculas, removiendo acentos/diacríticos,
 * dosis (como 500mg, 10ml, etc.), números individuales y palabras de presentación.
 * Esto ayuda a buscar por principio activo en lugar de dosis o presentación.
 */
export function cleanText(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Eliminar dosis comunes con unidades como "500 mg", "250mg/5ml", "1g", "875/125 mg", "30mcg", "300ui", "10%", etc.
    .replace(/\b\d+(?:\/\d+)?\s*(?:mg|g|gr|ml|mcg|ui|u|%|pct|ug)\b/gi, "")
    // Eliminar números sueltos (cantidad de piezas, dosis sin unidad si es número aislado)
    .replace(/\b\d+\b/g, "")
    // Eliminar palabras de presentación y unidades comunes en español
    .replace(/\b(?:tabletas|capsulas|comprimidos|jarabe|suspension|solucion|aerosol|spray|inyectable|parches|crema|pomada|gel|jeringa|frasco|sobres|supositorios|masticables|grageas|pieza|caja|frascos|polvo|granulado|gotas|glaes|ampolleta|ampolletas|unguento|ovulo|ovulos|inhalador|colirio|suspencion|tableta|capsula|comprimido|parche|supositorio|masticable|gragea|ampolla|ampollas|dosis|sobre|medida|mililitros|gramos|miligramos|unidades|piezas|cajas|caps|tabs|tab|cap|comp|susp|sol|envase|frasquito)\b/gi, "")
    // Reemplazar caracteres no alfanuméricos por espacios
    .replace(/[^a-z0-9]/g, " ")
    // Reemplazar múltiples espacios por uno solo
    .replace(/\s+/g, " ")
    .trim();
}

// Mantener compatibilidad de exportación por si acaso
export function normalizeText(str: string): string {
  return cleanText(str);
}

const stopwords = new Set(["de", "del", "en", "para", "la", "el", "los", "las", "un", "una", "y", "o", "con", "a"]);

function getIngredientTokens(text: string): string[] {
  const cleaned = cleanText(text);
  // Reemplazar conectores por espacios para separar ingredientes individuales
  const normalized = cleaned
    .replace(/\b(?:y|o|con|e|u)\b/g, " ")
    .replace(/[^a-z0-9]/g, " ");
  
  return normalized
    .split(/\s+/)
    .filter(token => token.length > 2 && !stopwords.has(token));
}

function tokensMatch(t1: string, t2: string): boolean {
  if (t1 === t2) return true;
  // Permitir variaciones de sufijos (como tadalafil vs tadalafilo, o metformin vs metformina)
  if (t1.length >= 5 && t2.length >= 5) {
    if (t1.startsWith(t2) || t2.startsWith(t1)) return true;
  }
  return false;
}

/**
 * Recupera la base de datos estática de medicamentos.
 * Busca primero localmente (útil para PWA cache y dev), y maneja fallback.
 */
export async function getMedicamentoInfo(medicationName: string): Promise<MedicamentoInfo | null> {
  if (!medicationName) return null;
  
  try {
    // Intentamos cargar desde la ruta relativa que funcionará tanto en el dev server como en producción
    const response = await fetch('./data/medicamentos_db.json');
    if (!response.ok) {
      // Fallback a ruta absoluta si fallara el relativo en alguna estructura
      const fallbackResponse = await fetch('../data/medicamentos_db.json');
      if (!fallbackResponse.ok) {
        throw new Error("No se pudo cargar la base de datos de medicamentos.");
      }
      const db: MedicamentosDb = await fallbackResponse.json();
      return findMedicamento(db, medicationName);
    }
    
    const db: MedicamentosDb = await response.json();
    return findMedicamento(db, medicationName);
  } catch (error) {
    console.error("Error al buscar información del medicamento:", error);
    return null;
  }
}

// Realiza la búsqueda utilizando tokens de ingredientes activos y puntuación inteligente
function findMedicamento(db: MedicamentosDb, name: string): MedicamentoInfo | null {
  const cleanedSearch = cleanText(name);
  if (!cleanedSearch) return null;
  
  // 1. Intentar buscar coincidencia exacta limpia en llaves y nombres
  for (const key of Object.keys(db)) {
    if (cleanText(key) === cleanedSearch || cleanText(db[key].nombre) === cleanedSearch) {
      return db[key];
    }
  }
  
  // 2. Coincidencia basada en tokens de ingredientes activos con ranking inteligente
  const queryTokens = getIngredientTokens(name);
  if (queryTokens.length === 0) return null;
  
  let bestMatch: MedicamentoInfo | null = null;
  let bestScore = -999;
  
  for (const key of Object.keys(db)) {
    const dbTokens = getIngredientTokens(key).concat(getIngredientTokens(db[key].nombre));
    const uniqueDbTokens = Array.from(new Set(dbTokens));
    
    const matchedQueryIndices = new Set<number>();
    const matchedDbIndices = new Set<number>();
    
    for (let i = 0; i < queryTokens.length; i++) {
      for (let j = 0; j < uniqueDbTokens.length; j++) {
        if (tokensMatch(queryTokens[i], uniqueDbTokens[j])) {
          matchedQueryIndices.add(i);
          matchedDbIndices.add(j);
        }
      }
    }
    
    const matchedCount = Math.min(matchedQueryIndices.size, matchedDbIndices.size);
    if (matchedCount === 0) continue;
    
    const unmatchedQuery = queryTokens.length - matchedQueryIndices.size;
    const unmatchedDb = uniqueDbTokens.length - matchedDbIndices.size;
    
    // Calcular puntaje penalizando tokens no coincidentes
    const score = matchedCount - 0.2 * unmatchedQuery - 0.1 * unmatchedDb;
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = db[key];
    }
  }
  
  if (bestScore > 0) {
    return bestMatch;
  }
  
  return null;
}
