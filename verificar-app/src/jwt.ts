/**
 * Utilería de compatibilidad para verificar JWT firmados con ES256 de forma offline
 * y para decodificar el token simplificado de Proyecto Celene.
 */

// Convierte un string Base64URL a un Uint8Array binario
function base64UrlToUint8Array(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Limpia el formato PEM de la llave pública y lo convierte a formato binario SPKI para Web Crypto
function pemToSpki(pem: string): Uint8Array {
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  
  let pemContents = pem.trim();
  if (pemContents.startsWith(pemHeader)) {
    pemContents = pemContents.substring(pemHeader.length);
  }
  if (pemContents.endsWith(pemFooter)) {
    pemContents = pemContents.substring(0, pemContents.length - pemFooter.length);
  }
  // Quitar saltos de línea y espacios en blanco
  pemContents = pemContents.replace(/\s+/g, '');
  
  return base64UrlToUint8Array(pemContents);
}

// Importa la llave pública PEM para que pueda usarse con Web Crypto (RSASSA-PKCS1-v1_5 / SHA-256)
async function importPublicKey(pem: string): Promise<CryptoKey> {
  const spki = pemToSpki(pem);
  return await window.crypto.subtle.importKey(
    "spki",
    spki as any,
    {
      name: "ECDSA",
      namedCurve: "P-256"
    },
    false, // No es extraíble
    ["verify"]
  );
}

/**
 * Decodifica la cabecera (header) de un JWT.
 */
export function decodeJWTHeader(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const headerB64 = parts[0];
    const bytes = base64UrlToUint8Array(headerB64);
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(bytes));
  } catch (error) {
    console.error("Error al decodificar la cabecera del JWT:", error);
    return null;
  }
}

/**
 * Verifica la firma ES256 de un token JWT utilizando una llave pública PEM.
 */
export async function verifyJWT(token: string, pemKey: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // 1. Validar algoritmo en la cabecera (debe ser ES256 obligatoriamente)
    const header = decodeJWTHeader(token);
    if (!header || header.alg !== 'ES256') {
      console.warn("Algoritmo de firma no soportado o ausente:", header?.alg);
      return false;
    }
    
    const [headerB64, payloadB64, signatureB64] = parts;
    
    // Firma en bytes
    const signatureBytes = base64UrlToUint8Array(signatureB64);
    
    // Los datos firmados son la representación ASCII de "header.payload"
    const encoder = new TextEncoder();
    const signedDataBytes = encoder.encode(`${headerB64}.${payloadB64}`);
    
    // Importar la llave
    const cryptoKey = await importPublicKey(pemKey);
    
    // Verificar firma
    return await window.crypto.subtle.verify(
      {
        name: "ECDSA",
        hash: { name: "SHA-256" }
      },
      cryptoKey,
      signatureBytes as any,
      signedDataBytes as any
    );
  } catch (error) {
    console.error("Error al verificar la firma del JWT:", error);
    return false;
  }
}

/**
 * Decodifica la carga útil (payload) de un JWT de forma segura soportando caracteres UTF-8.
 */
export function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payloadB64 = parts[1];
    const bytes = base64UrlToUint8Array(payloadB64);
    
    // Decodificar usando TextDecoder para soportar acentos y caracteres especiales latinos
    const decoder = new TextDecoder();
    const jsonStr = decoder.decode(bytes);
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error al decodificar la carga útil del JWT:", error);
    return null;
  }
}

/**
 * Decodifica el token simplificado de la receta usando mezcla XOR y Base64.
 * @param scrambledToken - El token 't' de la URL.
 * @param key - Clave de mezcla (por defecto "celene").
 * @returns El objeto de la receta decodificada.
 */
export function decodeRecipeToken(scrambledToken: string, key: string = "celene"): any {
  try {
    // 1. Restaurar formato Base64 estándar
    let base64Str = scrambledToken.replace(/-/g, '+').replace(/_/g, '/');
    while (base64Str.length % 4) {
      base64Str += '=';
    }
    
    // 2. Decodificar Base64 a string binario
    const binary = window.atob(base64Str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    // 3. Aplicar XOR inverso para obtener los caracteres originales
    const keyBytes = new TextEncoder().encode(key);
    const decryptedBytes = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      decryptedBytes[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // 4. Decodificar bytes UTF-8 a string JSON y parsear
    const jsonStr = new TextDecoder().decode(decryptedBytes);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Error decodificando el token simplificado:", e);
    return null;
  }
}
