import { useState, useEffect } from 'react';
import { verifyJWT, verifySignedMessage, decodeJWT, decodeRecipeToken, decodeRx1Token } from './jwt';
import { getMedicamentoInfo } from './db';
import type { MedicamentoInfo } from './db';

// Llave pública ECDSA P-256 por defecto (fallback)
const DEFAULT_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEONvASPPsTmaEbxh/JqikHzwIUrqB
rJn70fKGodBsi5y8amW5wLGctj+G5Y3vHbUzbx+03JUfqbfZaBz7KukXeQ==
-----END PUBLIC KEY-----`;

interface DoctorInfo {
  doctor_id: number;
  doctor_nombre: string;
  cedula: string;
  universidad: string;
  especialidad?: string;
}

const DOCTORS_DB: { [key: number]: DoctorInfo } = {
  1: {
    doctor_id: 1,
    doctor_nombre: "Dr. Carlos Donato Dueñas Prieto",
    cedula: "15504256",
    universidad: "Universidad Autónoma de Baja California",
    especialidad: "Médico General"
  },
  2: {
    doctor_id: 2,
    doctor_nombre: "Dr. Mario Esteban Minor Sánchez",
    cedula: "2378734",
    universidad: "Universidad Autónoma de Baja California",
    especialidad: "Médico General"
  },
  3: {
    doctor_id: 3,
    doctor_nombre: "Dr. Juan Pérez",
    cedula: "12345678",
    universidad: "N/A",
    especialidad: "Pediatría"
  },
  4: {
    doctor_id: 4,
    doctor_nombre: "Dr. Juan Pérez",
    cedula: "12345678",
    universidad: "N/A",
    especialidad: "Pediatría"
  }
};

interface MedicationItem {
  nombre: string;
  via_administracion: string;
  frecuencia_horas: number;
  duracion_dias: number;
  indicaciones_extra: string;
}

interface DoctorEmisor {
  doctor_id: number;
  doctor_nombre: string;
  cedula: string;
  universidad: string;
  especialidad?: string;
}

interface PrescriptionPayload {
  // Nueva estructura unificada
  documento_tipo?: string; // receta_medica, certificado_medico, etc.
  documento_id?: string;
  fecha_emision?: string;
  emisor?: DoctorEmisor;
  contenido?: {
    medicamentos?: MedicationItem[];
    [key: string]: any;
  };
  
  // Soporte retrocompatible
  doctor_id?: number;
  doctor_nombre?: string;
  cedula?: string;
  universidad?: string;
  fecha?: string;
  medicamentos?: MedicationItem[];
  receta_id?: string;
}

interface SavedPrescription {
  token: string;
  doctor_nombre: string;
  medicamentos_summary: string;
  fecha_emision: string;
  documento_tipo: string;
  verifiedAt: number;
}

type VerificationSource = 'hybrid' | 'rx1' | 'simplified' | 'jwt' | null;

interface HybridVerificationRequest {
  rid: string;
  sig: string;
}

interface HybridApiPayload {
  rid?: string;
  fecha?: string;
  fecha_consulta?: string;
  doctor_id?: number | string;
  doctor_nombre?: string;
  cedula?: string;
  universidad?: string;
  especialidad?: string;
  medicamentos?: any[];
  contenido?: {
    medicamentos?: any[];
    [key: string]: any;
  };
  signature_input?: string;
  signed_string?: string;
  [key: string]: any;
}

function isRecipeTokenPayload(payload: any): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return false;
  }

  const hasIdentity = payload.rid || payload.id || payload.d || payload.fecha_emision || payload.fecha;
  const hasContent = Array.isArray(payload.m) || Array.isArray(payload.medicamentos) || !!payload.contenido?.medicamentos;

  return Boolean(hasIdentity && hasContent);
}

function getTokenFromLocation(): string | null {
  const hash = window.location.hash ? window.location.hash.slice(1).trim() : '';
  if (hash) {
    try {
      return decodeURIComponent(hash);
    } catch {
      return hash;
    }
  }

  const params = new URLSearchParams(window.location.search);
  return params.get('t') || params.get('token');
}

function getHybridRequestFromLocation(): HybridVerificationRequest | null {
  const rawHash = window.location.hash ? window.location.hash.slice(1).trim() : '';
  const rawQuery = new URLSearchParams(window.location.search);

  const parseParams = (raw: string): URLSearchParams => new URLSearchParams(raw.replace(/^\?/, ''));

  const candidates = [rawHash, rawQuery.toString()].filter(Boolean);
  for (const candidate of candidates) {
    const params = parseParams(candidate);
    const rid = params.get('rid')?.trim();
    const sig = params.get('sig')?.trim();
    if (rid && sig) {
      return { rid, sig };
    }
  }

  return null;
}

function normalizeManualTokenInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  try {
    const url = new URL(trimmed);
    const hash = url.hash ? url.hash.slice(1).trim() : '';
    if (hash) {
      return decodeURIComponent(hash);
    }
    const rid = url.searchParams.get('rid');
    const sig = url.searchParams.get('sig');
    if (rid && sig) {
      return `rid=${rid}&sig=${sig}`;
    }
    const token = url.searchParams.get('t') || url.searchParams.get('token');
    if (token) return token;
  } catch {
    // No es una URL completa, seguimos con el texto directo.
  }

  if (trimmed.startsWith('#')) {
    const raw = trimmed.slice(1).trim();
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

function validateRx1Payload(payload: any): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, errors: ['El payload no es un objeto válido.'] };
  }

  if (typeof payload.rid !== 'string' || !payload.rid.trim()) {
    errors.push('Falta el folio `rid`.');
  }
  if (typeof payload.d !== 'string' || !payload.d.trim()) {
    errors.push('Falta la fecha `d`.');
  }
  if (!Array.isArray(payload.m) || payload.m.length === 0) {
    errors.push('Falta la lista de medicamentos `m`.');
  } else {
    payload.m.forEach((med: any, index: number) => {
      if (!med || typeof med !== 'object' || Array.isArray(med)) {
        errors.push(`Medicamento ${index + 1} inválido.`);
        return;
      }
      if (typeof med.n !== 'string' || !med.n.trim()) {
        errors.push(`Medicamento ${index + 1} sin nombre \`n\`.`);
      }
      if (typeof med.v !== 'string' || !med.v.trim()) {
        errors.push(`Medicamento ${index + 1} sin vía \`v\`.`);
      }
      if (typeof med.f !== 'number' || Number.isNaN(med.f)) {
        errors.push(`Medicamento ${index + 1} sin frecuencia \`f\`.`);
      }
      if (typeof med.d !== 'number' || Number.isNaN(med.d)) {
        errors.push(`Medicamento ${index + 1} sin duración \`d\`.`);
      }
    });
  }

  return { ok: errors.length === 0, errors };
}

function normalizeTextForCompare(value: string | undefined | null): string {
  return String(value ?? '').trim().toLowerCase();
}

function resolveDoctorFromRegistry(apiDoctorId: number, apiPayload: HybridApiPayload): { doctor: DoctorInfo | null; status: 'matched' | 'unregistered' | 'mismatch'; message?: string } {
  const registryDoctor = DOCTORS_DB[apiDoctorId] || null;
  if (!registryDoctor) {
    return { doctor: null, status: 'unregistered' };
  }

  const apiDoctorNombre = normalizeTextForCompare(apiPayload.doctor_nombre);
  const apiCedula = normalizeTextForCompare(apiPayload.cedula);
  const apiUniversidad = normalizeTextForCompare(apiPayload.universidad);
  const apiEspecialidad = normalizeTextForCompare(apiPayload.especialidad);

  const mismatches: string[] = [];
  if (apiDoctorNombre && apiDoctorNombre !== normalizeTextForCompare(registryDoctor.doctor_nombre)) {
    mismatches.push('nombre');
  }
  if (apiCedula && apiCedula !== normalizeTextForCompare(registryDoctor.cedula)) {
    mismatches.push('cédula');
  }
  if (apiUniversidad && apiUniversidad !== normalizeTextForCompare(registryDoctor.universidad)) {
    mismatches.push('universidad');
  }
  if (apiEspecialidad && registryDoctor.especialidad && apiEspecialidad !== normalizeTextForCompare(registryDoctor.especialidad)) {
    mismatches.push('especialidad');
  }

  if (mismatches.length > 0) {
    return {
      doctor: registryDoctor,
      status: 'mismatch',
      message: `Los campos del médico no coinciden con el registro local: ${mismatches.join(', ')}.`
    };
  }

  return { doctor: registryDoctor, status: 'matched' };
}

function normalizeMedicationItem(item: any): MedicationItem {
  return {
    nombre: String(item?.nombre ?? item?.n ?? '').trim(),
    via_administracion: String(item?.via_administracion ?? item?.v ?? '').trim(),
    frecuencia_horas: Number(item?.frecuencia_horas ?? item?.f ?? 24),
    duracion_dias: Number(item?.duracion_dias ?? item?.d ?? item?.t ?? 1),
    indicaciones_extra: String(item?.indicaciones_extra ?? item?.i ?? '').trim()
  };
}

function normalizeApiPayload(raw: HybridApiPayload, rid: string): { prescription: PrescriptionPayload; medications: MedicationItem[]; doctorStatus: 'matched' | 'unregistered' | 'mismatch'; doctorMessage?: string } {
  const apiDoctorId = Number(raw.doctor_id || 0);
  const doctorResolution = resolveDoctorFromRegistry(apiDoctorId, raw);
  const registryDoctor = doctorResolution.doctor;

  const fecha = raw.fecha_consulta || raw.fecha || '';
  const rawMeds = raw.medicamentos || raw.contenido?.medicamentos || [];
  const medications = Array.isArray(rawMeds) ? rawMeds.map(normalizeMedicationItem).filter(m => m.nombre) : [];

  const doctorNombre = registryDoctor?.doctor_nombre || raw.doctor_nombre || 'Médico Celene';
  const cedula = registryDoctor?.cedula || raw.cedula || 'N/A';
  const universidad = registryDoctor?.universidad || raw.universidad || 'N/A';
  const especialidad = registryDoctor?.especialidad || raw.especialidad || 'Medicina General';

  const prescription: PrescriptionPayload = {
    documento_tipo: 'receta_medica',
    documento_id: rid,
    fecha_emision: fecha,
    emisor: {
      doctor_id: apiDoctorId,
      doctor_nombre: doctorNombre,
      cedula,
      universidad,
      especialidad
    },
    contenido: {
      ...raw.contenido,
      medicamentos: medications
    }
  };

  return {
    prescription,
    medications,
    doctorStatus: doctorResolution.status,
    doctorMessage: doctorResolution.message
  };
}

function buildHybridSignatureString(raw: HybridApiPayload, rid: string): string {
  const fixed = raw.signature_input || raw.signed_string;
  if (fixed && fixed.trim()) return fixed.trim();

  const fecha = raw.fecha_consulta || raw.fecha || '';
  const doctorId = Number(raw.doctor_id || 0);
  return `rid=${rid}|fecha=${fecha}|doctor_id=${doctorId}`;
}

export default function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorType, setErrorType] = useState<'none' | 'invalid_signature' | 'expired' | 'no_token' | 'malformed'>('no_token');
  const [verificationSource, setVerificationSource] = useState<VerificationSource>(null);
  const [doctorValidationStatus, setDoctorValidationStatus] = useState<'matched' | 'unregistered' | null>(null);
  const [manualToken, setManualToken] = useState<string>('');
  const [prescription, setPrescription] = useState<PrescriptionPayload | null>(null);
  const [resolvedDrugs, setResolvedDrugs] = useState<{ [key: string]: MedicamentoInfo | null }>({});
  const [publicKeyPem, setPublicKeyPem] = useState<string>(DEFAULT_PUBLIC_KEY_PEM);
  
  // Historial y Notificaciones
  const [history, setHistory] = useState<SavedPrescription[]>([]);
  const [notifPermission, setNotifPermission] = useState<string>('default');
  const [remindersEnabled, setRemindersEnabled] = useState<{ [key: string]: boolean }>({});
  const [notifStatusMsg, setNotifStatusMsg] = useState<string | null>(null);

  // Al cargar, obtener historial, permiso de notificaciones y la llave pública dinámica
  useEffect(() => {
    loadHistory();
    fetchDynamicPublicKey();
    
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
    
    // Escuchar cambios de URL (popstate)
    const handleUrlChange = () => {
      const hybridRequest = getHybridRequestFromLocation();
      if (hybridRequest) {
        verifyAndLoadRecipe(`rid=${encodeURIComponent(hybridRequest.rid)}&sig=${encodeURIComponent(hybridRequest.sig)}`);
        return;
      }

      const incomingToken = getTokenFromLocation();
      if (incomingToken) {
        verifyAndLoadRecipe(incomingToken);
      } else {
        setIsValid(null);
        setErrorType('no_token');
        setVerificationSource(null);
        setDoctorValidationStatus(null);
        setManualToken('');
        setPrescription(null);
        setResolvedDrugs({});
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    handleUrlChange();

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [publicKeyPem]); // Escuchar cambios de la llave pública

  const fetchDynamicPublicKey = async () => {
    try {
      const res = await fetch('./public_key.pem');
      if (res.ok) {
        const text = await res.text();
        if (text.includes("BEGIN PUBLIC KEY") && text !== publicKeyPem) {
          setPublicKeyPem(text);
          console.log("✅ Llave pública cargada dinámicamente desde public_key.pem");
        }
      }
    } catch (e) {
      console.warn("No se pudo cargar public_key.pem de forma dinámica. Usando llave embebida.");
    }
  };

  const loadHistory = () => {
    const raw = localStorage.getItem('celene_recetas_historial');
    if (raw) {
      try {
        setHistory(JSON.parse(raw));
      } catch (e) {
        console.error(e);
      }
    }
    const savedReminders = localStorage.getItem('celene_recordatorios_activos');
    if (savedReminders) {
      try {
        setRemindersEnabled(JSON.parse(savedReminders));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const saveToHistory = (tok: string, payload: PrescriptionPayload) => {
    const raw = localStorage.getItem('celene_recetas_historial');
    let current: SavedPrescription[] = [];
    if (raw) {
      try {
        current = JSON.parse(raw);
      } catch (e) {
        current = [];
      }
    }
    
    if (current.some(item => item.token === tok)) return;

    // Adaptación a la estructura dinámica
    const doctorName = payload.emisor?.doctor_nombre || payload.doctor_nombre || "Médico Celene";
    const fecha = payload.fecha_emision || payload.fecha || "";
    const tipo = payload.documento_tipo || "receta_medica";
    
    // Resumen de contenido
    let summary = "Documento Oficial";
    const medicamentos = payload.contenido?.medicamentos || payload.medicamentos;
    if (medicamentos && medicamentos.length > 0) {
      const names = medicamentos.map(m => m.nombre).join(', ');
      summary = names.length > 50 ? names.substring(0, 47) + '...' : names;
    } else if (payload.contenido?.resumen) {
      summary = payload.contenido.resumen;
    }

    const newItem: SavedPrescription = {
      token: tok,
      doctor_nombre: doctorName,
      medicamentos_summary: summary,
      fecha_emision: fecha,
      documento_tipo: tipo,
      verifiedAt: Date.now()
    };

    const updated = [newItem, ...current].slice(0, 10);
    localStorage.setItem('celene_recetas_historial', JSON.stringify(updated));
    setHistory(updated);
  };

  const verifyAndLoadRecipe = async (rawToken: string) => {
    const token = normalizeManualTokenInput(rawToken);
    setLoading(true);
    setIsValid(null);
    setErrorType('none');
    setDoctorValidationStatus(null);
    
    let decodedRaw: any = null;
    let detectedSource: VerificationSource = null;

    const hybridParams = new URLSearchParams(token.replace(/^[#?]/, ''));
    const hybridRid = hybridParams.get('rid');
    const hybridSig = hybridParams.get('sig');

    if (hybridRid && hybridSig) {
      const rid = hybridRid.trim();
      const sig = hybridSig.trim().replace(/\s+/g, '+');
      setVerificationSource('hybrid');
      try {
        const apiUrl = `https://script.google.com/macros/s/AKfycbyRfJ1QfEUtW-i8igdnKN8qGhVQ8DZfFUQtHVlwZ0Ky0Md_Lz9KYIUdeF8Bfge4c-n5pg/exec?rid=${encodeURIComponent(rid)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`API respondió con estado ${response.status}`);
        }

        const apiRaw = await response.json() as HybridApiPayload;
        const normalized = normalizeApiPayload(apiRaw, rid);
        const signedString = buildHybridSignatureString(apiRaw, rid);
        const signatureOk = await verifySignedMessage(signedString, sig, publicKeyPem);

        if (!signatureOk) {
          setIsValid(false);
          setErrorType('invalid_signature');
          setVerificationSource('hybrid');
          setPrescription(null);
          setResolvedDrugs({});
          setLoading(false);
          return;
        }

        if (normalized.doctorStatus === 'mismatch') {
          setIsValid(false);
          setErrorType('invalid_signature');
          setVerificationSource('hybrid');
          setPrescription(null);
          setResolvedDrugs({});
          setLoading(false);
          return;
        }

        decodedRaw = normalized.prescription;
        detectedSource = 'hybrid';
        setDoctorValidationStatus(normalized.doctorStatus);
      } catch (error) {
        console.error('Error validando la receta híbrida:', error);
        setIsValid(false);
        setErrorType('malformed');
        setVerificationSource('hybrid');
        setPrescription(null);
        setResolvedDrugs({});
        setLoading(false);
        return;
      }
    }

    // 1. Intentar decodificar como token RX1 (Base45 + zlib + JSON)
    if (/^RX1:/i.test(token)) {
      const rx1Decoded = decodeRx1Token(token);
      const rx1Validation = validateRx1Payload(rx1Decoded);
      if (!rx1Decoded || !rx1Validation.ok) {
        setIsValid(false);
        setErrorType('malformed');
        setVerificationSource('rx1');
        setPrescription(null);
        setResolvedDrugs({});
        setLoading(false);
        return;
      }
      decodedRaw = rx1Decoded;
      detectedSource = 'rx1';
      setDoctorValidationStatus('matched');
    }

    // 2. Si no es RX1, intentar como token simplificado (XOR / celene)
    if (!decodedRaw) {
      const scrambledDecoded = decodeRecipeToken(token);
      if (isRecipeTokenPayload(scrambledDecoded)) {
        decodedRaw = scrambledDecoded;
        detectedSource = 'simplified';
        setDoctorValidationStatus('matched');
      }
    }

    // 3. Si no es un token simplificado, intentar como JWT tradicional
    if (!decodedRaw) {
      const jwtDecoded = decodeJWT(token);
      if (!jwtDecoded) {
        setIsValid(false);
        setErrorType('malformed');
        setPrescription(null);
        setResolvedDrugs({});
        setLoading(false);
        return;
      }
      decodedRaw = jwtDecoded;
      detectedSource = 'jwt';
      setDoctorValidationStatus('matched');

      // Verificar firma ES256 offline usando la llave pública cargada
      const signatureOk = await verifyJWT(token, publicKeyPem);
      if (!signatureOk) {
        setIsValid(false);
        setErrorType('invalid_signature');
        setPrescription(null);
        setResolvedDrugs({});
        setLoading(false);
        return;
      }
    }

    setVerificationSource(detectedSource);

    // Mapear el payload al formato de la UI
    let decoded: PrescriptionPayload;
    if (detectedSource === 'rx1') {
      decoded = {
        documento_tipo: 'receta_medica',
        documento_id: String(decodedRaw.rid),
        fecha_emision: decodedRaw.d,
        emisor: {
          doctor_id: Number(decodedRaw.id || 0),
          doctor_nombre: decodedRaw.dn || 'Médico Celene',
          cedula: decodedRaw.dc || 'N/A',
          universidad: decodedRaw.du || 'N/A',
          especialidad: decodedRaw.de || 'Medicina General'
        },
        contenido: {
          medicamentos: (decodedRaw.m || []).map((med: any) => ({
            nombre: med.n || '',
            via_administracion: med.v || '',
            frecuencia_horas: Number(med.f || 24),
            duracion_dias: Number(med.d || 1),
            indicaciones_extra: med.i || ''
          }))
        }
      };
    } else if (detectedSource === 'simplified' || decodedRaw.rid || decodedRaw.d || decodedRaw.id) {
      const docId = Number(decodedRaw.id || 0);
      const doctor = DOCTORS_DB[docId] || {
        doctor_id: docId,
        doctor_nombre: `Médico ID: ${docId}`,
        cedula: "N/A",
        universidad: "N/A"
      };

      const resolvedNombre = decodedRaw.dn || doctor.doctor_nombre || `Médico ID: ${docId}`;
      const resolvedCedula = decodedRaw.dc || doctor.cedula || "N/A";
      const resolvedUniversidad = decodedRaw.du || doctor.universidad || "N/A";
      const resolvedEspecialidad = decodedRaw.de || doctor.especialidad || "Medicina General";

      decoded = {
        documento_tipo: "receta_medica",
        documento_id: decodedRaw.rid,
        fecha_emision: decodedRaw.d,
        emisor: {
          doctor_id: docId,
          doctor_nombre: resolvedNombre,
          cedula: resolvedCedula,
          universidad: resolvedUniversidad,
          especialidad: resolvedEspecialidad
        },
        contenido: {
          medicamentos: (decodedRaw.m || []).map((med: any) => ({
            nombre: med.n || "",
            via_administracion: med.v || "",
            frecuencia_horas: Number(med.f || 24),
            duracion_dias: Number(med.d || med.t || 1),
            indicaciones_extra: med.i || ""
          }))
        }
      };
    } else {
      // Fallback por si viene en formato antiguo
      decoded = decodedRaw;
    }

    setPrescription(decoded);

    // 3. Verificar expiración
    const fechaEmision = decoded.fecha_emision || decoded.fecha || "";
    const medicamentos = decoded.contenido?.medicamentos || decoded.medicamentos;
    
    let isExpired = false;
    try {
      const issueDate = new Date(fechaEmision.replace(' ', 'T'));
      if (!isNaN(issueDate.getTime())) {
        // Por defecto recetas expiran tras su duración de medicamentos; otros documentos en 180 días (o vigencia especificada)
        let maxDurationDays = 180;
        if (medicamentos && medicamentos.length > 0) {
          maxDurationDays = Math.max(...medicamentos.map(m => m.duracion_dias || 30));
        } else if (decoded.contenido?.vigencia_dias) {
          maxDurationDays = Number(decoded.contenido.vigencia_dias);
        }
        
        const expTimestamp = issueDate.getTime() + maxDurationDays * 24 * 60 * 60 * 1000;
        if (Date.now() > expTimestamp) {
          isExpired = true;
        }
      }
    } catch (err) {
      console.error("Error al calcular la expiración:", err);
    }

    if (isExpired) {
      setIsValid(true);
      setErrorType('expired');
    } else {
      setIsValid(true);
      setErrorType('none');
      saveToHistory(token, decoded);
    }

    // 4. Buscar detalles de medicamentos en la base de datos local en paralelo
    const drugMap: { [key: string]: MedicamentoInfo | null } = {};
    if (medicamentos && medicamentos.length > 0) {
      try {
        await Promise.all(
          medicamentos.map(async (m) => {
            const info = await getMedicamentoInfo(m.nombre);
            drugMap[m.nombre] = info;
          })
        );
      } catch (e) {
        console.error("Error al consultar medicamentos_db:", e);
      }
    }
    setResolvedDrugs(drugMap);
    
    setLoading(false);
  };

  const selectHistoryItem = (savedToken: string) => {
    const normalized = normalizeManualTokenInput(savedToken);
    const newUrl = `${window.location.pathname}${normalized.startsWith('RX1:') ? `#${encodeURIComponent(normalized)}` : `?t=${encodeURIComponent(normalized)}`}`;
    window.history.pushState({}, '', newUrl);
    verifyAndLoadRecipe(normalized);
  };

  const handleManualTokenSubmit = () => {
    const normalized = normalizeManualTokenInput(manualToken);
    if (!normalized) {
      setIsValid(false);
      setErrorType('malformed');
      return;
    }

    const newUrl = `${window.location.pathname}${normalized.startsWith('RX1:') ? `#${encodeURIComponent(normalized)}` : `?t=${encodeURIComponent(normalized)}`}`;
    window.history.pushState({}, '', newUrl);
    verifyAndLoadRecipe(normalized);
  };

  const clearCurrentRecipe = () => {
    window.history.pushState({}, '', window.location.pathname);
    setIsValid(null);
    setErrorType('no_token');
    setVerificationSource(null);
    setDoctorValidationStatus(null);
    setManualToken('');
    setPrescription(null);
    setResolvedDrugs({});
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones de escritorio.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      return permission;
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReminder = async (docId: string) => {
    let currentPermission = notifPermission;
    if (currentPermission !== 'granted') {
      const res = await requestNotificationPermission();
      if (res) currentPermission = res;
    }

    if (currentPermission === 'granted') {
      const updated = {
        ...remindersEnabled,
        [docId]: !remindersEnabled[docId]
      };
      setRemindersEnabled(updated);
      localStorage.setItem('celene_recordatorios_activos', JSON.stringify(updated));
      
      if (updated[docId]) {
        showStatusMessage("¡Recordatorios Activados! Notificaremos las tomas de medicamentos.");
      } else {
        showStatusMessage("Recordatorios Desactivados.");
      }
    } else {
      alert("Es necesario otorgar permisos de notificación para habilitar esta función.");
    }
  };

  const showStatusMessage = (msg: string) => {
    setNotifStatusMsg(msg);
    setTimeout(() => {
      setNotifStatusMsg(null);
    }, 4000);
  };

  // Disparar recordatorios nativos staggered
  const triggerTestNotification = () => {
    if (notifPermission !== 'granted') {
      alert("Por favor, habilita primero los permisos de notificación.");
      return;
    }

    showStatusMessage("Simulando recordatorios... Recibirás las alertas en 5 segundos.");
    
    setTimeout(() => {
      if (!prescription) return;
      const medicamentos = prescription.contenido?.medicamentos || prescription.medicamentos;
      if (!medicamentos) return;
      
      const docName = prescription.emisor?.doctor_nombre || prescription.doctor_nombre || "Médico Celene";

      medicamentos.forEach((m, index) => {
        setTimeout(() => {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(`⏰ Recordatorio: Toma tu ${m.nombre}`, {
                body: `Vía: ${m.via_administracion} (Cada ${m.frecuencia_horas} horas).\nIndicaciones: ${m.indicaciones_extra}.\nPrescrito por: ${docName}.`,
                icon: 'https://i.ibb.co/3mwFFhL6/logo-pc-circulo.png',
                badge: 'https://i.ibb.co/3mwFFhL6/logo-pc-circulo.png',
                tag: `receta-reminder-${index}`,
                vibrate: [200, 100, 200]
              } as any);
            });
          } else {
            new Notification(`⏰ Recordatorio: Toma tu ${m.nombre}`, {
              body: `Vía: ${m.via_administracion} (Cada ${m.frecuencia_horas} horas).\n${m.indicaciones_extra}`,
              icon: 'https://i.ibb.co/3mwFFhL6/logo-pc-circulo.png'
            });
          }
        }, index * 1200);
      });
    }, 5000);
  };

  // Iconos dibujados a mano
  const SunIcon = () => (
    <svg className="w-8 h-8 text-yellow-400 animate-float-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" fill="#fff9c4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );

  const MoonIcon = () => (
    <svg className="w-7 h-7 text-indigo-400 animate-wave-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="#e3f2fd" />
    </svg>
  );

  const renderScheduleIcons = (freqHours: number) => {
    if (freqHours === 12) {
      return (
        <div className="flex items-center gap-2 bg-pc-gris-suave p-2 rounded-xl border border-pc-negro border-dashed" title="Tomar en la mañana y en la noche">
          <SunIcon />
          <MoonIcon />
        </div>
      );
    }
    if (freqHours === 8) {
      return (
        <div className="flex items-center gap-1.5 bg-pc-gris-suave p-2 rounded-xl border border-pc-negro border-dashed" title="Tomar en la mañana, tarde y noche">
          <SunIcon />
          <div className="w-6 h-6 flex items-center justify-center bg-orange-100 rounded-full border border-pc-negro text-xs font-bold" title="Tarde">☀️</div>
          <MoonIcon />
        </div>
      );
    }
    if (freqHours === 24) {
      return (
        <div className="flex flex-col items-center bg-pc-gris-suave p-2 rounded-xl border border-pc-negro border-dashed" title="Tomar una vez al día">
          <SunIcon />
        </div>
      );
    }
    return (
      <div className="text-xs bg-pc-gris-suave px-2.5 py-1.5 rounded-lg border border-pc-negro font-black">
        Cada {freqHours}h
      </div>
    );
  };

  const getWhatsAppLink = () => {
    let text = "Hola,%20tengo%20una%20duda%20con%20recepción%20de%20Proyecto%20Celene.";
    if (prescription) {
      const docName = prescription.emisor?.doctor_nombre || prescription.doctor_nombre || "Médico";
      const fecha = prescription.fecha_emision || prescription.fecha || "";
      const medicamentos = prescription.contenido?.medicamentos || prescription.medicamentos;
      
      let detailText = "";
      if (medicamentos && medicamentos.length > 0) {
        detailText = " que contiene: " + medicamentos.map(m => `*${m.nombre}*`).join(', ');
      } else if (prescription.contenido?.resumen) {
        detailText = ` (${prescription.contenido.resumen})`;
      }
      
      text = `Hola!%20Tengo%20una%20duda%20sobre%20el%20documento%20oficial%20emitido%20por%20${encodeURIComponent(docName)}%20el%20${encodeURIComponent(fecha)}${encodeURIComponent(detailText)}.`;
    }
    return `https://wa.me/526611044050?text=${text}`;
  };

  // Mapeo visual de tipos de documentos
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'receta_medica': return '💊';
      case 'certificado_medico': return '🩺';
      case 'carta_medica': return '📝';
      case 'constancia': return '📋';
      case 'referencia': return '🔄';
      case 'orden_laboratorio': return '🧪';
      default: return '📄';
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'receta_medica': return 'Receta Médica';
      case 'certificado_medico': return 'Certificado Médico';
      case 'carta_medica': return 'Carta Médica';
      case 'constancia': return 'Constancia Médica';
      case 'referencia': return 'Hoja de Referencia';
      case 'orden_laboratorio': return 'Orden de Laboratorio';
      default: return 'Documento Oficial';
    }
  };

  return (
    <div className="min-height-screen bg-white text-pc-negro px-4 py-8 md:py-12 flex flex-col items-center">
      
      {/* Botón flotante de WhatsApp */}
      <a 
        href={getWhatsAppLink()} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-50 flex items-center justify-center w-14 h-14 bg-pc-verde-wa border-brutal rounded-full shadow-brutal-sm hover:translate-y-[-2px] hover:shadow-brutal active:translate-y-[2px] active:shadow-none transition-all duration-75 text-white"
        title="Contactar a recepción por WhatsApp"
        id="whatsapp-support-btn"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.067 5.148 5.211 0 11.536 0c3.066.001 5.948 1.196 8.117 3.368 2.168 2.172 3.36 5.057 3.359 8.128-.003 6.386-5.147 11.534-11.473 11.534-.007 0-.014 0-.021 0-2.007-.001-3.982-.528-5.735-1.528L0 24zm6.262-4.148c1.628.966 3.25 1.488 4.954 1.489h.019c5.174 0 9.385-4.187 9.387-9.332.001-2.492-.971-4.836-2.738-6.608-1.767-1.772-4.116-2.748-6.611-2.749-5.178 0-9.39 4.188-9.393 9.333-.001 1.777.473 3.511 1.373 5.04L2.247 21.65l6.072-1.798zM17.18 14.5c-.3-.15-1.773-.874-2.047-.973-.274-.1-.474-.15-.674.15-.2.3-.774.973-.949 1.173-.175.2-.35.225-.65.075-3.565-1.785-4.707-3.08-5.358-4.205-.175-.3-.025-.463.125-.612.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.674-1.624-.924-2.224-.244-.587-.492-.507-.674-.516-.175-.008-.375-.01-.575-.01s-.525.075-.8.375c-.275.3-1.05 1.024-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.224 5.116 4.525.715.31 1.273.495 1.708.633.719.228 1.374.196 1.892.119.577-.087 1.774-.725 2.024-1.425.25-.7.25-1.299.175-1.425-.075-.125-.275-.2-.575-.35z" />
        </svg>
      </a>

      <div className="w-full max-w-xl">
        
        {/* Cabecera Principal */}
        <header className="text-center mb-8 bg-white border-brutal rounded-hand-drawn-card p-6 shadow-brutal-xl">
          <div className="flex justify-center mb-4">
            <img 
              src="https://i.ibb.co/3mwFFhL6/logo-pc-circulo.png" 
              alt="Proyecto Celene A.C." 
              className="w-24 h-24 object-contain animate-float-subtle"
            />
          </div>
          <h1 className="font-hand-drawn text-3xl md:text-4xl text-pc-rosa-fuerte mb-1 font-bold">
            Proyecto Celene A.C.
          </h1>
          <h2 className="font-hand-drawn text-lg text-pc-negro tracking-wider font-semibold">
            Verificación de Recetas y Documentos
          </h2>
          <p className="text-xs text-gray-500 mt-2 font-bold">
            Detección Oportuna del Cáncer de Mama y Salud Comunitaria
          </p>
        </header>

        {/* Mensaje de estado de notificaciones */}
        {notifStatusMsg && (
          <div className="mb-4 bg-pc-azul-suave text-pc-negro text-center text-sm font-bold p-3 border-brutal-thin rounded-xl animate-pop-in">
            🔔 {notifStatusMsg}
          </div>
        )}

        {/* Contenido Principal según el estado */}
        {loading ? (
          <div className="text-center p-12 bg-white border-brutal rounded-hand-drawn-card shadow-brutal mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pc-rosa-fuerte mx-auto mb-4"></div>
            <p className="font-hand-drawn text-xl font-bold">
              {verificationSource === 'hybrid' ? 'Consultando la receta en la nube...' : 'Verificando token QR...'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {verificationSource === 'hybrid'
                ? 'Descargando datos desde Sheets y validando la firma criptográfica.'
                : verificationSource === 'simplified'
                ? 'Decodificando localmente el token simplificado de Proyecto Celene.'
                : 'Validación local del documento en el navegador.'}
            </p>
          </div>
        ) : isValid === true ? (
          /* DOCUMENTO VERIFICADO CON ÉXITO */
          <div className="space-y-6">
            
            {/* Listón de Autenticidad */}
            {errorType === 'expired' ? (
              <div className="bg-yellow-100 text-yellow-800 border-brutal p-4 rounded-xl text-center shadow-brutal animate-wave-subtle">
                <span className="text-2xl mr-2">⚠️</span>
                <span className="font-hand-drawn text-lg font-black uppercase tracking-wide">
                  {verificationSource === 'simplified'
                    ? 'Documento validado por Proyecto Celene pero expirado'
                    : 'Documento verificado por Proyecto Celene pero expirado'}
                </span>
                <p className="text-xs mt-1 text-yellow-900 font-bold">
                  {verificationSource === 'simplified'
                    ? 'El token es auténtico, pero el periodo de validez ha vencido.'
                    : 'La firma es auténtica, pero el periodo de validez ha vencido.'}
                </p>
              </div>
            ) : (
              <div className="bg-[#a3e635] text-pc-negro border-brutal p-4 rounded-xl text-center shadow-brutal-lg animate-wave-subtle">
                <span className="text-2xl mr-2">🎗️</span>
                <span className="font-hand-drawn text-xl font-black uppercase tracking-wider">
                  {verificationSource === 'hybrid'
                    ? 'Receta autenticada por firma'
                    : verificationSource === 'simplified'
                    ? 'Documento validado por Proyecto Celene'
                    : 'Documento verificado por Proyecto Celene'}
                </span>
                <p className="text-xs mt-1 text-green-950 font-bold">
                  {verificationSource === 'hybrid'
                    ? 'La firma es válida y los datos fueron recuperados desde la nube.'
                    : verificationSource === 'simplified'
                    ? 'Documento autenticado mediante token QR simplificado.'
                    : 'Documento auténtico firmado digitalmente.'}
                </p>
              </div>
            )}

            {/* AVISO DE CONFIDENCIALIDAD / COTEJO VISUAL */}
            <div className="bg-blue-50 border-2 border-pc-negro border-dashed p-4 rounded-xl text-left shadow-brutal-sm">
              <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <span>🛡️</span> Cotejo Visual de Identidad
              </h4>
              <p className="text-xs font-bold text-blue-950 leading-relaxed">
                Por políticas de confidencialidad y privacidad de datos de salud, el nombre del paciente se omite de esta página web. Verifique que los datos impresos en la receta física coincidan con la identificación del paciente.
              </p>
            </div>

            {verificationSource === 'hybrid' && (
              <div className={`border-2 ${doctorValidationStatus === 'matched' ? 'border-green-700 bg-green-50' : 'border-yellow-700 bg-yellow-50'} p-4 rounded-xl shadow-brutal-sm`}>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${doctorValidationStatus === 'matched' ? 'text-green-900' : 'text-yellow-900'}`}>
                  Validación del Médico
                </h4>
                <p className="text-xs font-bold leading-relaxed text-gray-800">
                  {doctorValidationStatus === 'matched'
                    ? 'El médico coincide con el registro local y la firma criptográfica valida el folio, la fecha y el ID del médico.'
                    : 'La firma valida el folio, la fecha y el ID del médico, pero ese médico no está en el registro local del visor.'}
                </p>
              </div>
            )}

            {/* DETALLES DE LA RECETA Y MÉDICO */}
            {prescription && (
              <div className="bg-white border-brutal rounded-hand-drawn-card p-6 shadow-brutal animate-pop-in space-y-6">
                
                {/* Datos del Emisor y Documento */}
                <div className="border-b-2 border-pc-negro pb-4 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-gray-400 uppercase">Médico Emisor</p>
                    <h3 className="text-lg font-black text-pc-rosa-fuerte">
                      {prescription.emisor?.doctor_nombre || prescription.doctor_nombre || "Médico Celene"}
                    </h3>
                    <p className="text-xs font-bold text-gray-700">
                      Cédula Profesional: <span className="font-black text-pc-negro">{prescription.emisor?.cedula || prescription.cedula || "N/A"}</span>
                    </p>
                    <p className="text-xs font-bold text-gray-600">
                      Universidad: {prescription.emisor?.universidad || prescription.universidad || "N/A"}
                    </p>
                    {prescription.emisor?.especialidad && (
                      <p className="text-xs font-bold text-gray-600">
                        Especialidad: {prescription.emisor?.especialidad}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-1 md:text-right md:self-end">
                    <span className="inline-block text-xs bg-pc-rosa-pastell text-pc-rosa-oscuro px-2 py-0.5 rounded font-black border border-pc-negro">
                      {getDocumentIcon(prescription.documento_tipo || "receta_medica")} {getDocumentTypeName(prescription.documento_tipo || "receta_medica")}
                    </span>
                    <p className="text-[10px] text-gray-400 font-bold">
                      Folio: {prescription.documento_id || prescription.receta_id || "N/A"}
                    </p>
                    <p className="text-[11px] text-gray-400 font-bold">
                      Emisión: {prescription.fecha_emision || prescription.fecha || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Contenido Dinámico: Receta o Genérico */}
                {(prescription.documento_tipo || "receta_medica") === "receta_medica" ? (
                  /* RENDER RECETA */
                  <div className="space-y-4">
                    <p className="text-xs font-black text-gray-400 uppercase">Medicamentos Prescritos</p>
                    
                    {(prescription.contenido?.medicamentos || prescription.medicamentos)?.map((med, idx) => (
                      <div key={idx} className="border-2 border-pc-negro p-4 rounded-xl bg-pc-gris-suave space-y-2 relative shadow-brutal-sm">
                        <div className="flex justify-between items-start">
                          <h4 className="text-base font-black text-pc-negro flex items-center">
                            <span className="inline-block w-2.5 h-2.5 bg-pc-rosa-medio rounded-full mr-2"></span>
                            {med.nombre}
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-bold text-gray-700 pt-1">
                          <div>
                            <span className="text-gray-400 text-[10px] block uppercase">Vía de Adm.</span>
                            {med.via_administracion}
                          </div>
                          <div>
                            <span className="text-gray-400 text-[10px] block uppercase">Duración</span>
                            {med.duracion_dias} días
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-400 text-[10px] block uppercase">Frecuencia de Toma</span>
                            Cada {med.frecuencia_horas} horas
                          </div>
                        </div>

                        {med.indicaciones_extra && (
                          <div className="bg-white border border-pc-negro border-dashed p-2 rounded-lg text-xs font-bold text-pc-negro mt-2">
                            💡 <span className="text-gray-500">Instrucción:</span> {med.indicaciones_extra}
                          </div>
                        )}

                        <div className="flex justify-end items-center gap-2 pt-2 border-t border-gray-200 mt-2">
                          <span className="text-[10px] text-gray-400 font-bold">Horarios sugeridos:</span>
                          {renderScheduleIcons(med.frecuencia_horas)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* RENDER OTRO DOCUMENTO (Certificados, etc) */
                  <div className="space-y-4">
                    <p className="text-xs font-black text-gray-400 uppercase">Detalles del Documento</p>
                    <div className="border-2 border-pc-negro p-4 rounded-xl bg-pc-gris-suave space-y-3 shadow-brutal-sm">
                      {Object.entries(prescription.contenido || {}).map(([key, val]) => {
                        if (typeof val === 'object' || !val) return null;
                        
                        const friendlyLabels: { [key: string]: string } = {
                          resumen: "Resumen / Concepto",
                          observaciones: "Observaciones",
                          motivo_consulta: "Motivo de Consulta",
                          vigencia_dias: "Días de Vigencia",
                          diagnostico_sintomas: "Síntomas Generales",
                          indicaciones: "Indicaciones Especiales",
                          tipo_examen: "Estudio Solicitado",
                          referido_a: "Referido a Especialidad",
                        };
                        const label = friendlyLabels[key] || key.replace(/_/g, ' ').toUpperCase();
                        
                        return (
                          <div key={key} className="text-xs font-semibold text-gray-700">
                            <span className="text-gray-400 text-[10px] block uppercase font-black">{label}</span>
                            <p className="text-pc-negro text-sm font-bold leading-relaxed">{String(val)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* BOTÓN RECORDATORIOS (Solo para recetas vigentes con medicamentos) */}
                {errorType !== 'expired' && (prescription.contenido?.medicamentos || prescription.medicamentos) && (
                  <div className="border-t-2 border-pc-negro pt-4 space-y-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-pc-rosa-pastell/30 p-3 rounded-xl border border-pc-negro">
                      <div>
                        <h4 className="font-bold text-sm">¿Deseas activar recordatorios en tu celular?</h4>
                        <p className="text-xs text-gray-500 font-semibold">
                          Te enviaremos notificaciones locales según los horarios prescritos.
                        </p>
                      </div>
                      <button
                        onClick={() => toggleReminder(String(prescription.emisor?.doctor_id || prescription.doctor_id) + '-' + (prescription.fecha_emision || prescription.fecha))}
                        className={`px-5 py-2.5 text-xs font-black border-brutal-thin rounded-xl btn-brutal-active shadow-brutal-sm ${
                          remindersEnabled[String(prescription.emisor?.doctor_id || prescription.doctor_id) + '-' + (prescription.fecha_emision || prescription.fecha)] 
                            ? 'bg-pc-rosa-medio text-white' 
                            : 'bg-pc-amarillo text-pc-negro'
                        }`}
                      >
                        {remindersEnabled[String(prescription.emisor?.doctor_id || prescription.doctor_id) + '-' + (prescription.fecha_emision || prescription.fecha)] ? '🔔 Activado' : '🔕 Desactivado'}
                      </button>
                    </div>

                    {remindersEnabled[String(prescription.emisor?.doctor_id || prescription.doctor_id) + '-' + (prescription.fecha_emision || prescription.fecha)] && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={triggerTestNotification}
                          className="bg-pc-azul-suave hover:bg-blue-100 border-brutal-thin px-3 py-1.5 rounded-lg text-xs font-extrabold text-blue-900 flex items-center gap-1 active:translate-y-[1px] transition-all"
                        >
                          🧪 Probar Notificaciones Staggered (5 seg)
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* CTA PWA */}
                <div className="bg-pc-azul-suave border-2 border-pc-negro rounded-xl p-4 text-center shadow-brutal-sm space-y-2">
                  <h4 className="font-black text-sm text-blue-900">
                    Instala la PWA para recordatorios automáticos
                  </h4>
                  <p className="text-xs text-blue-950 font-semibold">
                    Guarda esta app en tu celular para abrir recetas al instante y activar avisos locales de medicamento.
                  </p>
                </div>
              </div>
            )}

            {/* DETALLES DE INTERACCIONES Y GUÍA DE SALUD */}
            {prescription && (prescription.contenido?.medicamentos || prescription.medicamentos) && (
              <div className="bg-white border-brutal rounded-hand-drawn-card p-6 shadow-brutal animate-pop-in space-y-4">
                <h4 className="font-hand-drawn text-xl font-bold text-pc-rosa-oscuro border-b-2 border-pc-negro pb-2">
                  Guía de Salud del Consultorio
                </h4>
                
                <div className="space-y-4">
                  {(prescription.contenido?.medicamentos || prescription.medicamentos)?.map((med, idx) => {
                    const info = resolvedDrugs[med.nombre];
                    if (!info) return null;
                    return (
                      <div key={idx} className="border border-pc-negro p-4 rounded-xl space-y-3">
                        <h5 className="font-black text-sm text-pc-rosa-fuerte flex items-center">
                          <span className="w-2 h-2 bg-pc-rosa-fuerte rounded-full mr-2"></span>
                          Guía para {info.nombre}
                        </h5>
                        
                        <div className="text-xs space-y-2 font-semibold">
                          <div>
                            <span className="text-gray-400 block text-[9px] uppercase font-black">Indicación Médica</span>
                            <p className="text-gray-700 text-xs">{info.funcion}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            <div className="bg-red-50/50 p-2 rounded border border-red-200 text-red-900">
                              <span className="block text-[9px] text-red-700 uppercase font-black mb-0.5">Efectos Secundarios</span>
                              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                                {info.efectos_adversos.map((ef, i) => <li key={i}>{ef}</li>)}
                              </ul>
                            </div>
                            <div className="bg-orange-50/50 p-2 rounded border border-orange-200 text-orange-950">
                              <span className="block text-[9px] text-orange-700 uppercase font-black mb-0.5">Interacciones Críticas</span>
                              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                                {info.interacciones.map((int, i) => <li key={i}>{int}</li>)}
                              </ul>
                            </div>
                          </div>
                          
                          <div className="bg-pc-azul-suave p-2 rounded border border-blue-200 text-blue-950">
                            <span className="block text-[9px] text-blue-800 uppercase font-black mb-0.5">Consejo del Médico</span>
                            <p className="text-[11px] leading-relaxed">{info.recomendaciones}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BOTÓN VOLVER A ESCANEAR */}
            <div className="text-center pt-2">
              <button 
                onClick={clearCurrentRecipe}
                className="bg-white border-brutal px-6 py-2.5 rounded-full font-black text-sm text-pc-negro shadow-brutal-sm hover:translate-y-[-2px] hover:shadow-brutal active:translate-y-[2px] active:shadow-none transition-all duration-75 btn-brutal-active"
              >
                ← Salir / Consultar otro Documento
              </button>
            </div>

          </div>
        ) : isValid === false ? (
          /* PANTALLAS DE ERROR (Firma no reconocida o formato inválido) */
          <div className="bg-red-100 border-brutal rounded-hand-drawn-card p-6 shadow-brutal-lg animate-pop-in space-y-6 text-center">
            <div className="w-20 h-20 bg-red-200 border-brutal rounded-full flex items-center justify-center mx-auto animate-float-subtle">
              <span className="text-4xl text-red-600">
                {errorType === 'malformed' ? '🚫' : '❌'}
              </span>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-hand-drawn text-2xl font-black text-red-700 uppercase">
                {errorType === 'invalid_signature' ? 'Receta Alterada o Inválida' : 'QR Inválido'}
              </h3>
              <p className="text-sm font-bold text-red-950 max-w-md mx-auto leading-relaxed">
                {errorType === 'invalid_signature'
                  ? 'La firma no coincide con el contenido descargado desde la nube o el documento fue alterado.'
                  : 'No se pudo decodificar el contenido del QR.'}
              </p>
              <p className="text-xs font-black text-red-800">
                Este código QR no cuenta con el respaldo legal ni clínico de Proyecto Celene A.C.
              </p>
            </div>

            <div className="border-t border-red-300 pt-4 flex flex-col gap-2">
              <a 
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pc-verde-wa border-brutal-thin text-white font-black px-6 py-2.5 rounded-xl text-sm btn-brutal-active shadow-brutal-sm hover:shadow-brutal inline-block"
              >
                Consultar Alerta con Dirección Médica
              </a>
              <button 
                onClick={clearCurrentRecipe}
                className="bg-white border-brutal-thin text-pc-negro font-bold px-6 py-2 rounded-xl text-xs hover:bg-gray-50 active:translate-y-[1px] transition-all"
              >
                Volver
              </button>
            </div>
          </div>
        ) : (
          /* PANTALLA DE INICIO (SCANNER GUIDE E HISTORIAL) */
          <div className="space-y-6 animate-pop-in">
            
            {/* Guía de uso */}
            <div className="bg-pc-rosa-pastell border-brutal rounded-hand-drawn-card p-6 shadow-brutal space-y-4">
              <h3 className="font-hand-drawn text-2xl font-bold text-pc-rosa-oscuro">
                Verificador de Documentación Oficial
              </h3>
              <p className="text-sm font-semibold leading-relaxed text-gray-700">
                Esta herramienta permite validar la autenticidad de recetas, cartas de referencia, certificados médicos y otros documentos oficiales emitidos por el personal médico de Proyecto Celene.
              </p>
              
              <div className="border-t-2 border-pc-negro border-dashed pt-4">
                <h4 className="text-xs font-black text-pc-rosa-fuerte uppercase tracking-wider mb-2">
                  Instrucciones para el Validador
                </h4>
                <ol className="text-xs font-bold text-gray-600 text-left list-decimal list-inside space-y-2">
                  <li>Abre la URL pública de verificación o escanea el código QR impreso en el documento.</li>
                  <li>Si el enlace contiene <strong>#RX1:...</strong>, el sistema lo leerá desde el hash.</li>
                  <li>El sistema validará el token localmente en el navegador, sin depender de internet.</li>
                  <li>Si el token es válido, verás los detalles en pantalla con un cintillo de verificación.</li>
                  <li><strong>Cotejo de Identidad</strong>: Valida físicamente que el nombre impreso en el papel coincida con la identificación del paciente.</li>
                </ol>
              </div>
            </div>

            {/* Verificación manual */}
            <div className="bg-white border-brutal rounded-hand-drawn-card p-6 shadow-brutal space-y-4">
              <div className="space-y-1">
                <h3 className="font-hand-drawn text-xl font-bold text-pc-negro">
                  Pegar token manualmente
                </h3>
                <p className="text-xs font-semibold text-gray-600">
                  Funciona con enlaces públicos tipo <span className="font-black">https://proyectocelene.org/verificar/#RX1:...</span> o con el token completo copiado desde el QR.
                </p>
              </div>
              <textarea
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="w-full min-h-28 border-brutal-thin rounded-xl p-3 text-sm font-mono text-pc-negro bg-pc-gris-suave outline-none focus:ring-2 focus:ring-pc-rosa-medio"
                placeholder="Pega aquí el enlace completo, el token RX1 o el valor de #"
              />
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <p className="text-[11px] font-bold text-gray-500">
                  Si el token empieza con <span className="font-black">RX1:</span>, la página lo decodifica con Base45 + zlib y valida la estructura.
                </p>
                <button
                  onClick={handleManualTokenSubmit}
                  className="bg-pc-rosa-fuerte text-white border-brutal-thin px-5 py-2.5 rounded-xl text-sm font-black shadow-brutal-sm hover:shadow-brutal active:translate-y-[1px] transition-all"
                >
                  Verificar token
                </button>
              </div>
            </div>

            {/* Historial Local */}
            <div className="bg-white border-brutal rounded-hand-drawn-card p-6 shadow-brutal space-y-4">
              <h3 className="font-hand-drawn text-xl font-bold text-pc-negro flex items-center justify-center">
                📋 Historial de Consultas en este Dispositivo
              </h3>

              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <div 
                      key={index}
                      onClick={() => selectHistoryItem(item.token)}
                      className="border-2 border-pc-negro p-3 rounded-xl hover:bg-pc-rosa-pastell cursor-pointer hover:translate-y-[-2px] transition-all shadow-brutal-sm hover:shadow-brutal text-left flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs text-gray-400 font-bold">
                          Médico: {item.doctor_nombre}
                        </p>
                        <p className="text-sm font-black text-pc-rosa-fuerte">
                          {getDocumentIcon(item.documento_tipo)} {item.medicamentos_summary}
                        </p>
                        <p className="text-xs text-gray-500 font-semibold">
                          Fecha Emisión: {item.fecha_emision}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-green-150 border border-green-700 text-green-800 px-2 py-0.5 rounded font-black">
                          Verificado
                        </span>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">
                          {new Date(item.verifiedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center pt-2">
                    <button 
                      onClick={() => {
                        if (confirm("¿Estás seguro de que deseas borrar el historial de recetas de este dispositivo?")) {
                          localStorage.removeItem('celene_recetas_historial');
                          setHistory([]);
                        }
                      }}
                      className="text-xs text-red-500 hover:text-red-700 font-black underline"
                    >
                      Limpiar todo el Historial
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-pc-negro p-6 rounded-xl text-center">
                  <p className="text-sm font-bold text-gray-400">
                    No tienes documentos registrados en el historial local.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Al escanear y validar un documento de Proyecto Celene por primera vez, el registro aparecerá aquí para consultas offline inmediatas.
                  </p>
                </div>
              )}
            </div>

            {/* PWA Badge */}
            <div className="bg-pc-azul-suave border-2 border-pc-negro p-4 rounded-xl text-center">
              <span className="text-lg">📲</span>
              <h4 className="font-bold text-sm text-blue-900 inline ml-1">Aplicación Instalable</h4>
              <p className="text-xs text-blue-950 font-bold mt-1 max-w-sm mx-auto">
                Instala esta herramienta en tu pantalla de inicio desde tu navegador móvil. Funciona offline para validar los documentos de Proyecto Celene.
              </p>
            </div>

          </div>
        )}

        {/* Footer del Consultorio */}
        <footer className="text-center mt-12 text-xs font-bold text-gray-400 space-y-1">
          <p>© {new Date().getFullYear()} Proyecto Celene A.C. Todos los derechos reservados.</p>
          <p>Ubicación: Playas de Rosarito, B.C., México.</p>
          <p className="text-pc-rosa-medio">Prevenir el cáncer de mama es dar vida. 🎗️</p>
        </footer>

      </div>
    </div>
  );
}
