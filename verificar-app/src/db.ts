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
 * Normaliza un texto convirtiéndolo a minúsculas y removiendo acentos/diacríticos.
 * Por ejemplo: "Losartán" -> "losartan".
 */
export function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
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

// Realiza la búsqueda utilizando llaves normalizadas
function findMedicamento(db: MedicamentosDb, name: string): MedicamentoInfo | null {
  const normalizedSearch = normalizeText(name);
  
  // Buscar coincidencia exacta por llave normalizada
  if (db[normalizedSearch]) {
    return db[normalizedSearch];
  }
  
  // Si no se encuentra directo, buscar si el nombre en la BD contiene la búsqueda o viceversa
  for (const key of Object.keys(db)) {
    const dbKeyNormalized = normalizeText(key);
    const dbNameNormalized = normalizeText(db[key].nombre);
    
    if (dbKeyNormalized.includes(normalizedSearch) || 
        normalizedSearch.includes(dbKeyNormalized) ||
        dbNameNormalized.includes(normalizedSearch) ||
        normalizedSearch.includes(dbNameNormalized)) {
      return db[key];
    }
  }
  
  return null;
}
