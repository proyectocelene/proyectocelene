import { useState, useEffect } from 'react';
import { verifyJWT, decodeJWT } from './jwt';
import { getMedicamentoInfo } from './db';
import type { MedicamentoInfo } from './db';

// Llave pública RSA generada por el script de utilería
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtgqnXpZaAnQipb2xvDWL
LZKhw+lyKDJmikpEWGJK212d6VpaVeu1C5aXzordKdT+IUYl/oYkRHvN71vReYk7
6KMTfL73Z3sHrdjeMkL4PPWd1cm7mZ1xPhpwfV0nxG0JciCf4r7sBROvj1JFbbcP
/GmEoN1wcwg2NLpk7MOtpstCOYFWsuoJhdlA+Ep20BiDIZf9dfTno7FoFsBRaJVW
N8a1XtWvGeQSFQ8akkCvKKIymkaQGwK+RxiLSOWrDFRiAeap5/TBmBOsSQleYZbl
yNy6Vq4yBKghd4O7rTPKq1MZM+FQwGkMOz8Jd29Jgka+3+cUoTxAytDxJPFYdDXo
fQIDAQAB
-----END PUBLIC KEY-----`;

interface PrescriptionPayload {
  sub: string;
  patient: string;
  med: string;
  dose: string;
  freq: string;
  dur: string;
  doc: string;
  iat: number;
  exp: number;
}

interface SavedPrescription {
  token: string;
  patient: string;
  med: string;
  dose: string;
  freq: string;
  verifiedAt: number;
}

export default function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorType, setErrorType] = useState<'none' | 'invalid_signature' | 'expired' | 'no_token'>('no_token');
  const [prescription, setPrescription] = useState<PrescriptionPayload | null>(null);
  const [drugInfo, setDrugInfo] = useState<MedicamentoInfo | null>(null);
  
  // Historial y Notificaciones
  const [history, setHistory] = useState<SavedPrescription[]>([]);
  const [notifPermission, setNotifPermission] = useState<string>('default');
  const [remindersEnabled, setRemindersEnabled] = useState<{ [key: string]: boolean }>({});
  const [notifStatusMsg, setNotifStatusMsg] = useState<string | null>(null);

  // Al cargar, obtener historial y permiso de notificaciones
  useEffect(() => {
    loadHistory();
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
    
    // Escuchar cambios de URL (popstate)
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const tParam = params.get('t');
      if (tParam) {
        verifyAndLoadRecipe(tParam);
      } else {
        setIsValid(null);
        setErrorType('no_token');
        setPrescription(null);
        setDrugInfo(null);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    // Ejecución inicial
    handleUrlChange();

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

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
    
    // Evitar duplicados indexando por firma / token completo
    if (current.some(item => item.token === tok)) return;

    const newItem: SavedPrescription = {
      token: tok,
      patient: payload.patient,
      med: payload.med,
      dose: payload.dose,
      freq: payload.freq,
      verifiedAt: Date.now()
    };

    const updated = [newItem, ...current].slice(0, 10); // Límite de 10 recetas en historial
    localStorage.setItem('celene_recetas_historial', JSON.stringify(updated));
    setHistory(updated);
  };

  const verifyAndLoadRecipe = async (rawToken: string) => {
    setLoading(true);
    setIsValid(null);
    setErrorType('none');
    
    // 1. Verificar firma RS256 offline
    const signatureOk = await verifyJWT(rawToken, PUBLIC_KEY_PEM);
    if (!signatureOk) {
      setIsValid(false);
      setErrorType('invalid_signature');
      setPrescription(null);
      setDrugInfo(null);
      setLoading(false);
      return;
    }

    // 2. Decodificar payload
    const decoded: PrescriptionPayload = decodeJWT(rawToken);
    if (!decoded) {
      setIsValid(false);
      setErrorType('invalid_signature');
      setPrescription(null);
      setDrugInfo(null);
      setLoading(false);
      return;
    }

    setPrescription(decoded);

    // 3. Verificar expiración
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (decoded.exp && nowSeconds > decoded.exp) {
      setIsValid(true); // La firma sigue siendo válida estructuralmente
      setErrorType('expired');
    } else {
      setIsValid(true);
      setErrorType('none');
      // Guardar en el historial solo si es una receta válida y vigente
      saveToHistory(rawToken, decoded);
    }

    // 4. Buscar detalles del medicamento en la base de datos estática
    const info = await getMedicamentoInfo(decoded.med);
    setDrugInfo(info);
    
    setLoading(false);
  };

  const selectHistoryItem = (savedToken: string) => {
    // Cambiar URL de forma amigable y disparar la verificación
    const newUrl = `${window.location.pathname}?t=${savedToken}`;
    window.history.pushState({}, '', newUrl);
    verifyAndLoadRecipe(savedToken);
  };

  const clearCurrentRecipe = () => {
    window.history.pushState({}, '', window.location.pathname);
    setIsValid(null);
    setErrorType('no_token');
    setPrescription(null);
    setDrugInfo(null);
  };

  // Solicitar permiso de notificaciones
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

  // Habilitar/Deshabilitar recordatorios
  const toggleReminder = async (medicationKey: string) => {
    let currentPermission = notifPermission;
    if (currentPermission !== 'granted') {
      const res = await requestNotificationPermission();
      if (res) currentPermission = res;
    }

    if (currentPermission === 'granted') {
      const updated = {
        ...remindersEnabled,
        [medicationKey]: !remindersEnabled[medicationKey]
      };
      setRemindersEnabled(updated);
      localStorage.setItem('celene_recordatorios_activos', JSON.stringify(updated));
      
      if (updated[medicationKey]) {
        showStatusMessage("¡Recordatorio Activado! Recibirás avisos para este medicamento.");
      } else {
        showStatusMessage("Recordatorio Desactivado.");
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

  // Disparar una notificación de prueba en 5 segundos
  const triggerTestNotification = () => {
    if (notifPermission !== 'granted') {
      alert("Por favor, habilita primero los permisos de notificación.");
      return;
    }

    showStatusMessage("Simulando recordatorio... Recibirás una notificación en 5 segundos.");
    
    setTimeout(() => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(`⏰ Recordatorio de Receta - Celene`, {
            body: `Es hora de tomar tu ${prescription?.med || 'Medicamento'} (${prescription?.dose || 'Dosis'}).\nReceta verificada de ${prescription?.patient}.`,
            icon: 'https://i.ibb.co/3mwFFhL6/logo-pc-circulo.png',
            badge: 'https://i.ibb.co/3mwFFhL6/logo-pc-circulo.png',
            tag: 'receta-test-reminder',
            vibrate: [200, 100, 200],
            data: {
              url: window.location.href
            }
          } as any);
        });
      } else {
        // Fallback si no está el service worker activo
        new Notification(`⏰ Recordatorio de Receta - Celene`, {
          body: `Es hora de tomar tu ${prescription?.med || 'Medicamento'} (${prescription?.dose || 'Dosis'}).`,
          icon: 'https://i.ibb.co/3mwFFhL6/logo-pc-circulo.png'
        });
      }
    }, 5000);
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Renderizado de iconos hand-drawn
  const SunIcon = () => (
    <svg className="w-12 h-12 text-yellow-400 animate-float-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v1m0 16v1M4.22 4.22l.7.7m12.16 12.16.7.7M1 12h1m20 0h1M4.22 19.78l.7-.7m12.16-12.16.7-.7" />
      <path d="M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" fill="#fff9c4" />
    </svg>
  );

  const MoonIcon = () => (
    <svg className="w-10 h-10 text-indigo-400 animate-wave-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="#e3f2fd" />
    </svg>
  );

  const PillIcon = () => (
    <svg className="w-8 h-8 text-pc-rosa-medio inline-block mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </svg>
  );

  // Lógica para mostrar Sol o Luna según la frecuencia
  const renderScheduleIcons = (freq: string) => {
    const normalized = freq.toLowerCase();
    if (normalized.includes('12 horas') || normalized.includes('2 veces') || normalized.includes('dos veces')) {
      return (
        <div className="flex items-center gap-4 bg-pc-gris-suave p-3 rounded-xl border-2 border-pc-negro border-dashed">
          <div className="flex flex-col items-center">
            <SunIcon />
            <span className="text-xs font-bold mt-1">Mañana</span>
          </div>
          <span className="text-xl font-bold">+</span>
          <div className="flex flex-col items-center">
            <MoonIcon />
            <span className="text-xs font-bold mt-1">Noche</span>
          </div>
        </div>
      );
    }
    
    if (normalized.includes('8 horas') || normalized.includes('3 veces') || normalized.includes('tres veces')) {
      return (
        <div className="flex items-center gap-3 bg-pc-gris-suave p-3 rounded-xl border-2 border-pc-negro border-dashed">
          <div className="flex flex-col items-center">
            <SunIcon />
            <span className="text-xs font-bold mt-1">Mañana</span>
          </div>
          <span className="text-sm font-bold">+</span>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center bg-orange-100 rounded-full border-2 border-pc-negro">
              <span className="text-lg">☀️</span>
            </div>
            <span className="text-xs font-bold mt-2">Tarde</span>
          </div>
          <span className="text-sm font-bold">+</span>
          <div className="flex flex-col items-center">
            <MoonIcon />
            <span className="text-xs font-bold mt-1">Noche</span>
          </div>
        </div>
      );
    }

    if (normalized.includes('noche') || normalized.includes('acostarse')) {
      return (
        <div className="flex flex-col items-center bg-pc-gris-suave p-3 rounded-xl border-2 border-pc-negro border-dashed">
          <MoonIcon />
          <span className="text-xs font-bold mt-1">Noche</span>
        </div>
      );
    }

    // Por defecto (ej. cada 24 horas mañana)
    return (
      <div className="flex flex-col items-center bg-pc-gris-suave p-3 rounded-xl border-2 border-pc-negro border-dashed">
        <SunIcon />
        <span className="text-xs font-bold mt-1">Cada 24 horas</span>
      </div>
    );
  };

  // WhatsApp predefinido
  const getWhatsAppLink = () => {
    let text = "Hola,%20tengo%20una%20duda%20con%20recepción%20de%20Proyecto%20Celene.";
    if (prescription) {
      text = `Hola,%20tengo%20una%20duda%20sobre%20la%20receta%20del%20medicamento%20*${encodeURIComponent(prescription.med)}*%20(${encodeURIComponent(prescription.dose)}%20-%20${encodeURIComponent(prescription.freq)})%20indicado%20por%20${encodeURIComponent(prescription.doc)}%20para%20el%20paciente%20${encodeURIComponent(prescription.patient)}.`;
    }
    return `https://wa.me/526611044050?text=${text}`;
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
            Verificación de Recetas
          </h2>
          <p className="text-xs text-gray-500 mt-2 font-bold">
            Salud y Detección Oportuna del Cáncer de Mama
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
            <p className="font-hand-drawn text-xl font-bold">Verificando firma digital...</p>
            <p className="text-xs text-gray-400 mt-1">Consultando Web Crypto API localmente</p>
          </div>
        ) : isValid === true ? (
          /* RECETA VERIFICADA (PUEDE ESTAR VIGENTE O EXPIRADA) */
          <div className="space-y-6">
            
            {/* CINTILLO / LISTÓN DE AUTENTICIDAD */}
            {errorType === 'expired' ? (
              <div className="bg-yellow-100 text-yellow-800 border-brutal p-4 rounded-xl text-center shadow-brutal animate-wave-subtle">
                <span className="text-2xl mr-2">⚠️</span>
                <span className="font-hand-drawn text-lg font-black uppercase tracking-wide">
                  Receta Auténtica pero Expirada
                </span>
                <p className="text-xs mt-1 text-yellow-900 font-bold">
                  La firma es auténtica, pero el periodo de validez ha vencido.
                </p>
              </div>
            ) : (
              <div className="bg-[#a3e635] text-pc-negro border-brutal p-4 rounded-xl text-center shadow-brutal-lg animate-wave-subtle">
                <span className="text-2xl mr-2">🎗️</span>
                <span className="font-hand-drawn text-xl font-black uppercase tracking-wider">
                  Receta Auténtica Verificada
                </span>
                <p className="text-xs mt-1 text-green-950 font-bold">
                  Documento auténtico firmado digitalmente por Proyecto Celene.
                </p>
              </div>
            )}

            {/* DETALLES DE LA RECETA */}
            {prescription && (
              <div className="bg-white border-brutal rounded-hand-drawn-card p-6 shadow-brutal animate-pop-in space-y-6">
                <div>
                  <div className="flex items-center justify-between border-b-2 border-pc-negro pb-2 mb-4">
                    <span className="text-xs font-bold text-gray-500">ID: {prescription.sub}</span>
                    <span className="text-xs bg-pc-rosa-pastell text-pc-rosa-oscuro px-2 py-1 rounded font-black border-brutal-thin">
                      Receta Médica
                    </span>
                  </div>

                  <h3 className="font-hand-drawn text-2xl font-bold text-pc-rosa-fuerte flex items-center mb-4">
                    <PillIcon />
                    {prescription.med}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-semibold">
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs">PACIENTE</p>
                      <p className="text-pc-negro text-base font-bold">{prescription.patient}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs">MEDICO EMISOR</p>
                      <p className="text-pc-negro text-base font-bold">{prescription.doc}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs">DOSIS Y FRECUENCIA</p>
                      <p className="text-pc-negro text-base font-bold">
                        {prescription.dose} - {prescription.freq}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs">DURACIÓN</p>
                      <p className="text-pc-negro text-base font-bold">{prescription.dur}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs">FECHA DE EMISIÓN</p>
                      <p className="text-pc-negro">{formatDate(prescription.iat)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs">VIGENCIA HASTA</p>
                      <p className="text-pc-negro">{formatDate(prescription.exp)}</p>
                    </div>
                  </div>
                </div>

                {/* BOTÓN PROGRAMAR RECORDATORIOS (Solo vigente) */}
                {errorType !== 'expired' && (
                  <div className="border-t-2 border-pc-negro pt-4 space-y-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm">¿Deseas activar recordatorios?</h4>
                        <p className="text-xs text-gray-500 font-semibold">
                          Te enviaremos avisos en tu teléfono según la frecuencia.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderScheduleIcons(prescription.freq)}
                        <button
                          onClick={() => toggleReminder(prescription.sub)}
                          className={`px-4 py-2 text-xs font-black border-brutal-thin rounded-xl btn-brutal-active ${
                            remindersEnabled[prescription.sub] 
                              ? 'bg-pc-rosa-medio text-white' 
                              : 'bg-pc-amarillo text-pc-negro'
                          }`}
                        >
                          {remindersEnabled[prescription.sub] ? '🔔 Activado' : '🔕 Desactivado'}
                        </button>
                      </div>
                    </div>

                    {remindersEnabled[prescription.sub] && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={triggerTestNotification}
                          className="bg-pc-azul-suave hover:bg-blue-100 border-brutal-thin px-3 py-1.5 rounded-lg text-xs font-extrabold text-blue-900 flex items-center gap-1 active:translate-y-[1px] transition-all"
                        >
                          🧪 Probar Notificación (5 seg)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* DETALLES DE LA INTERACCIÓN DEL MEDICAMENTO */}
            {drugInfo ? (
              <div className="bg-white border-brutal rounded-hand-drawn-card p-6 shadow-brutal animate-pop-in space-y-4">
                <h4 className="font-hand-drawn text-xl font-bold text-pc-rosa-oscuro border-b-2 border-pc-negro pb-2">
                  Guía de Salud del Medicamento
                </h4>
                
                <div>
                  <h5 className="text-xs font-black text-pc-rosa-fuerte uppercase tracking-wider mb-1">
                    ¿Cuál es su función?
                  </h5>
                  <p className="text-sm font-semibold leading-relaxed text-gray-700">
                    {drugInfo.funcion}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50 border-brutal-thin p-3 rounded-lg">
                    <h5 className="text-xs font-black text-red-700 uppercase tracking-wider mb-1">
                      Efectos Adversos
                    </h5>
                    <ul className="text-xs font-bold text-red-900 list-disc list-inside space-y-1">
                      {drugInfo.efectos_adversos.map((ef, idx) => (
                        <li key={idx}>{ef}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-orange-50 border-brutal-thin p-3 rounded-lg">
                    <h5 className="text-xs font-black text-orange-700 uppercase tracking-wider mb-1">
                      Interacciones de Riesgo
                    </h5>
                    <ul className="text-xs font-bold text-orange-950 list-disc list-inside space-y-1">
                      {drugInfo.interacciones.map((int, idx) => (
                        <li key={idx}>{int}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-pc-azul-suave border-brutal-thin p-3 rounded-lg">
                  <h5 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-1">
                    Recomendación del Consultorio
                  </h5>
                  <p className="text-xs font-bold text-blue-950 leading-relaxed">
                    {drugInfo.recomendaciones}
                  </p>
                </div>
              </div>
            ) : prescription && (
              <div className="bg-pc-gris-suave border-2 border-dashed border-pc-negro p-4 rounded-xl text-center">
                <p className="text-xs font-bold text-gray-500">
                  No se encontró información complementaria de "{prescription.med}" en la base de datos estática del consultorio.
                </p>
              </div>
            )}

            {/* BOTÓN VOLVER A ESCANEAR */}
            <div className="text-center pt-2">
              <button 
                onClick={clearCurrentRecipe}
                className="bg-white border-brutal px-6 py-2.5 rounded-full font-black text-sm text-pc-negro shadow-brutal-sm hover:translate-y-[-2px] hover:shadow-brutal active:translate-y-[2px] active:shadow-none transition-all duration-75 btn-brutal-active"
              >
                ← Salir / Consultar otra Receta
              </button>
            </div>

          </div>
        ) : isValid === false ? (
          /* RECETA CON FIRMA INCORRECTA (ERROR DE FALSIFICACIÓN) */
          <div className="bg-red-100 border-brutal rounded-hand-drawn-card p-6 shadow-brutal-lg animate-pop-in space-y-6 text-center">
            <div className="w-20 h-20 bg-red-200 border-brutal rounded-full flex items-center justify-center mx-auto animate-float-subtle">
              <span className="text-4xl text-red-600">🚨</span>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-hand-drawn text-2xl font-black text-red-700 uppercase">
                Error de Falsificación
              </h3>
              <p className="text-sm font-bold text-red-950 max-w-md mx-auto leading-relaxed">
                ¡Atención! La firma digital de esta receta médica es inválida o el contenido ha sido modificado maliciosamente.
              </p>
              <p className="text-xs font-black text-red-800">
                Esta receta no cuenta con el respaldo legal ni clínico de Proyecto Celene A.C.
              </p>
            </div>

            <div className="border-t border-red-300 pt-4 flex flex-col gap-2">
              <a 
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pc-verde-wa border-brutal-thin text-white font-black px-6 py-2 rounded-xl text-sm btn-brutal-active shadow-brutal-sm hover:shadow-brutal inline-block"
              >
                Reportar a Dirección Médica
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
          /* PANTALLA PRINCIPAL: SIN RECETA ESCANEADA / HISTORIAL */
          <div className="space-y-6 animate-pop-in">
            
            {/* BIENVENIDA E INSTRUCCIONES */}
            <div className="bg-pc-rosa-pastell border-brutal rounded-hand-drawn-card p-6 shadow-brutal space-y-4">
              <h3 className="font-hand-drawn text-2xl font-bold text-pc-rosa-oscuro">
                Verificador de Recetas QR
              </h3>
              <p className="text-sm font-semibold leading-relaxed text-gray-700">
                Esta aplicación web te permite verificar de forma segura e instantánea (incluso sin internet) las recetas emitidas por los médicos de nuestro consultorio comunitario.
              </p>
              
              <div className="border-t-2 border-pc-negro border-dashed pt-4">
                <h4 className="text-xs font-black text-pc-rosa-fuerte uppercase tracking-wider mb-2">
                  ¿Cómo funciona?
                </h4>
                <ol className="text-xs font-bold text-gray-600 text-left list-decimal list-inside space-y-2">
                  <li>Escanea el código QR impreso en la parte inferior de tu receta física.</li>
                  <li>El código QR abrirá automáticamente tu navegador en esta sección con un token de verificación.</li>
                  <li>La aplicación validará la firma digital RS256 de manera 100% segura y offline.</li>
                  <li>Podrás ver las contraindicaciones de tu medicamento y configurar tus recordatorios.</li>
                </ol>
              </div>
            </div>

            {/* SECCIÓN DEL HISTORIAL LOCAL */}
            <div className="bg-white border-brutal rounded-hand-drawn-card p-6 shadow-brutal space-y-4">
              <h3 className="font-hand-drawn text-xl font-bold text-pc-negro flex items-center justify-center">
                📋 Recetas Guardadas en este Dispositivo
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
                          Paciente: {item.patient}
                        </p>
                        <p className="text-sm font-black text-pc-rosa-fuerte">
                          {item.med} <span className="text-xs font-semibold text-pc-negro">({item.dose})</span>
                        </p>
                        <p className="text-xs text-gray-500 font-semibold">
                          Intervalo: {item.freq}
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
                        if (confirm("¿Estás seguro de que deseas borrar el historial de recetas de este teléfono?")) {
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
                    No tienes recetas guardadas en este dispositivo.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Las recetas que verifiques exitosamente aparecerán aquí para consultarlas offline en cualquier momento.
                  </p>
                </div>
              )}
            </div>

            {/* SECCIÓN SOBRE LA PWA */}
            <div className="bg-pc-azul-suave border-2 border-pc-negro p-4 rounded-xl text-center">
              <span className="text-lg">📲</span>
              <h4 className="font-bold text-sm text-blue-900 inline ml-1">Puedes instalar esta aplicación</h4>
              <p className="text-xs text-blue-950 font-bold mt-1 max-w-sm mx-auto">
                Presiona "Añadir a pantalla de inicio" en las opciones de tu navegador móvil para instalarla. Funciona completamente sin internet una vez guardada.
              </p>
            </div>

          </div>
        )}

        {/* Footer del Consultorio */}
        <footer className="text-center mt-12 text-xs font-bold text-gray-400 space-y-1">
          <p>© {new Date().getFullYear()} Proyecto Celene A.C. Todos los derechos reservados.</p>
          <p>Ubicación: Rosarito, Baja California, México.</p>
          <p className="text-pc-rosa-medio">Lucha constante contra el cáncer de mama y servicios de salud comunitarios.</p>
        </footer>

      </div>
    </div>
  );
}
