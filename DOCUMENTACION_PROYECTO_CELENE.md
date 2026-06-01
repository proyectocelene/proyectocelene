# 🌸 DOCUMENTACIÓN COMPLETA: PROYECTO CELENE A.C.

> **Fecha de esta documentación:** 9 de mayo de 2026  
> **Sitio web:** https://proyectocelene.org  
> **Propósito:** Documentación exhaustiva para que otra IA pueda comprender, referenciar y dar información precisa sobre Proyecto Celene y todos sus servicios.

---

## 📋 ÍNDICE

1. [INFORMACIÓN GENERAL](#1-información-general)
2. [IDENTIDAD VISUAL (DESIGN.md)](#2-identidad-visual)
3. [NAVEGACIÓN Y ESTRUCTURA DEL SITIO](#3-navegación-y-estructura-del-sitio)
4. [PÁGINAS PRINCIPALES](#4-páginas-principales)
5. [SERVICIOS MÉDICOS (con precios)](#5-servicios-médicos-con-precios)
6. [GUÍAS EDUCATIVAS Y HERRAMIENTAS](#6-guías-educativas-y-herramientas)
7. [PROFESIONALES DE LA SALUD](#7-profesionales-de-la-salud)
8. [PROGRAMAS SOCIALES Y GRATUITOS](#8-programas-sociales-y-gratuitos)
9. [PARTICIPACIÓN COMUNITARIA](#9-participación-comunitaria)
10. [MAPA DE RELACIONES ENTRE PÁGINAS](#10-mapa-de-relaciones-entre-páginas)
11. [SISTEMA DE RESERVAS Y PAGOS](#11-sistema-de-reservas-y-pagos)
12. [RESEÑAS Y REPUTACIÓN](#12-reseñas-y-reputación)
13. [CONTACTO Y REDES SOCIALES](#13-contacto-y-redes-sociales)
14. [NOTAS TÉCNICAS DEL SITIO](#14-notas-técnicas-del-sitio)

---

## 1. INFORMACIÓN GENERAL

### Identidad
- **Nombre:** Proyecto Celene A.C.
- **Tipo:** Asociación Civil sin fines de lucro (fundación)
- **Ubicación:** Rosarito, Baja California, México
- **Sitio web:** https://proyectocelene.org
- **Años operando:** 18 años (fundado ~2008)
- **Nicho:** Detección temprana del cáncer de mama y servicios de salud integrales accesibles

### 😊 Misión
Luchar contra el cáncer de mama y brindar servicios de salud integrales y accesibles para toda la comunidad en Rosarito, B.C.

### 💎 Valores
- Atención empática y sin juicios
- Cuotas de recuperación accesibles (sin fines de lucro)
- Espacio seguro y confidencial
- Compromiso con la comunidad

### ⏰ HORARIO DE ATENCIÓN (ACTUALIZADO)
> **Lunes a Sábado:** 9:00 AM - 4:00 PM  
> **Domingo:** Cerrado

### 📞 Contacto General
- **WhatsApp:** +52 661 104 4050
- **Teléfono fijo:** +52 661 104 4050

### 📍 Ubicación
Rosarito, Baja California, México  
(Mapas incrustados en varias páginas del sitio)

---

## 2. IDENTIDAD VISUAL

Basado en el archivo `DESIGN.md` del proyecto.

### Paleta de Colores
| Color | Hex | Uso |
|-------|-----|-----|
| Rosa pastel | `#fce4ec` | Fondos de secciones secundarias |
| Rosa medio | `#f06292` | Sombras hover, acentos |
| Rosa fuerte | `#d81b60` | Botones primarios, títulos hero, enlaces |
| Rosa oscuro | `#ad1457` | Footer, fondos de alto contraste |
| Negro | `#333333` | Texto principal, bordes, sombras 3D |
| Blanco | `#ffffff` | Fondos, tarjetas |
| Amarillo | `#fff9c4` | Botones secundarios, sombras de modales |
| Verde WA | `#25d366` | Botones WhatsApp |
| Verde WA oscuro | `#1b9c4b` | Sombra botón WhatsApp |
| Azul suave | `#e3f2fd` | Botón de llamada |
| Gris suave | `#f9f9f9` | Fondos alternos |

### Tipografía
- **Nunito** (400, 600, 800) — Texto principal, títulos, botones
- **Handlee** (cursiva) — Acentos "dibujados a mano", calidez
- **Shrikhand** (display) — Solo para banners festivos/aniversario
- **Courier Prime** (monoespaciada) — Fecha en calendario animado

### Estilo de Diseño
- **Neo-brutalismo amigable:** Bordes negros gruesos, sombras 3D pronunciadas, botones tipo píldora
- **Estilo "retro-pop"** para ocasiones especiales (aniversario)
- **Animaciones:** fade-in con Intersection Observer, flotación sutil, botones con efecto de presión 3D

---

## 3. NAVEGACIÓN Y ESTRUCTURA DEL SITIO

### Barra de navegación principal (global.js)
Se inyecta en todas las páginas mediante `id="navbar-container"` y contiene:

| Enlace | URL |
|--------|-----|
| Inicio | `index.html` |
| Nosotros | `quienes-somos.html` |
| Módulos | `modulos1.html` |
| Consultorio | `consultorio-comunitario.html` |
| Servicios | `servicios.html` |
| Farmacia | `farmacia-solidaria.html` |
| Únete / Apoya | `unete-a-nuestro-equipo.html` |
| 🔍 Buscar | `mapa-sitio.html` |

### Componentes globales (inyectados por global.js)
1. **Botón flotante WhatsApp** — en todas las páginas, abre modal con formulario de contacto
2. **Modal WhatsApp global** — formulario: nombre, edad, duda, envía a WhatsApp
3. **Píldora "Volver arriba"** — aparece al scrollear >400px
4. **Animaciones fade-in** — Intersection Observer en elementos con clase `.fade-in`

### ¿index.html o inicio.html?
- `index.html` — Página principal por defecto (tiene el banner retro de 18 aniversario)
- `inicio.html` — Misma página principal, URL alternativa (tiene el mismo contenido con banner retro)

---

## 4. PÁGINAS PRINCIPALES

### 🏠 4.1 Inicio / Portada
- **URL:** https://proyectocelene.org/ (o `index.html` / `inicio.html`)
- **Meta:** Fundación en Rosarito, B.C. dedicada a la detección temprana del cáncer de mama
- **Contenido:** Banner retro de 18° aniversario, bienvenida, servicios destacados, CTA a servicios
- **Open Graph:** Tiene OG tags completos con imagen

### 👥 4.2 ¿Quiénes Somos?
- **URL:** https://proyectocelene.org/quienes-somos.html
- **Meta:** Conoce al equipo, misión, visión y valores
- **Contenido:** Misión, Visión, Valores, equipo de colaboradores
- **Equipo listado:** Dr. Carlos Donato, Dra. Daniela Huerta, y otros miembros del equipo

### 📜 4.3 Nuestra Historia
- **URL:** https://proyectocelene.org/nuestra-historia.html
- **Meta:** La historia de Proyecto Celene, una promesa nacida del amor y la pérdida
- **Contenido:** Timeline con fases, imágenes históricas, el origen de la fundación
- **Estilo:** Diseño tipo timeline con fotos de periódico y volantes históricos

### 🏥 4.4 Consultorio Comunitario
- **URL:** https://proyectocelene.org/consultorio-comunitario.html
- **Meta:** El área médica de Proyecto Celene: salud integral, consultas y prevención
- **Contenido:** Grid de áreas médicas con tarjetas interactivas

### 📋 4.5 Servicios (Catálogo Completo)
- **URL:** https://proyectocelene.org/servicios.html
- **Meta:** Catálogo de servicios médicos con cuotas de recuperación accesibles
- **Características:** Buscador interno, filtros por categoría, tarjetas con precios, modales de detalle
- **Ver sección 5 para lista completa de servicios y precios**

### 💊 4.6 Farmacia Solidaria
- **URL:** https://proyectocelene.org/farmacia-solidaria.html
- **Meta:** Distribución de medicamentos mediante cuotas de recuperación simbólicas
- **Contenido:** Formulario de solicitud de medicamentos, checklist, guía de donación

### 🗺️ 4.7 Mapa del Sitio
- **URL:** https://proyectocelene.org/mapa-sitio.html
- **Meta:** Encuentra rápidamente todos los servicios, guías y contactos
- **Contenido:** Directorio completo de todas las páginas del sitio

### 🏢 4.8 Módulos de Atención (Nayarit)
- **URL:** https://proyectocelene.org/modulos1.html
- **Meta:** Red de módulos de atención en Nayarit
- **Contenido:** Grid de módulos con imágenes, mapas de Google Maps incrustados, servicios ofrecidos
- **Detalle:** El espíritu de Celene sin fronteras, llevando salud a comunidades de Nayarit

### 🤝 4.9 Nuestros Aliados
- **URL:** https://proyectocelene.org/nuestros-aliados.html
- **Meta:** Empresas y ciudadanos que hacen posible la misión
- **Contenido:** "El Club de los Héroes" — lista de aliados y patrocinadores

### 🎉 4.10 18° Aniversario
- **URL:** https://proyectocelene.org/aniversario.html
- **Meta:** Celebración de 18 años - Noche de Gala Vintage 50s-60s
- **Estilo:** Diseño retro-pop con colores vibrantes (naranja, amarillo, azul, rosa)
- **Banner promocional** visible en la página de inicio

---

## 5. SERVICIOS MÉDICOS (CON PRECIOS)

> **Nota:** Todos los precios son "cuotas de recuperación" (no lucro).  
> **Forma de pago:** Efectivo y transferencia (ver sección 11).

### 🔬 5.1 Mastografía

| Servicio | Precio | Enlace |
|----------|--------|--------|
| Mastografía Gratis | **GRATIS** | `mastografia-gratuita.html` |
| Vale de Mastografía Gratis | GRATIS | `mastografia-gratuita.html` |

### 🩺 5.2 Consultas Médicas

| Servicio | Precio | Enlace |
|----------|--------|--------|
| Consulta Médica General | **$150 m.n.** | `servicios.html` |
| Consulta Médica Virtual (Telemedicina) | **$150 m.n.** | `telemedicina.html` |
| Control de Peso | **$200 m.n.** | `control-de-peso.html` |
| Certificado Médico | **$100 m.n.** | `servicios.html` |
| Orientación Médica Gratuita | **GRATIS** | `orientacion-medica-gratuita.html` |

### 👩 5.3 Salud de la Mujer

| Servicio | Precio | Enlace |
|----------|--------|--------|
| Toma de Papanicolaou | **$150 m.n.** | `servicios.html` |
| Inspección Visual (IVAA) | **$150 m.n.** | `guia-ivaa.html` |
| Colocación de Implante Subdérmico | **$400 m.n.** | `servicios.html` |
| Colocación de DIU | **$450 m.n.** | `servicios.html` |
| Retiro de DIU | **$450 m.n.** | `retiro-diu.html` |
| Retiro de Implante (ISD) | **$400 m.n.** | `retiro-isd.html` |
| Inyección Anticonceptiva | **$50 m.n.** | `servicios.html` |
| Control del Dolor Menstrual | Consulta Médica | `servicios.html` |
| Manejo de Menopausia | Consulta Médica | `guia-menopausia.html` |
| Control Prenatal | Consulta Médica | `servicios.html` |
| Infecciones Urinarias/Vaginales | Consulta Médica | `servicios.html` |
| Orientación ILE (Aborto Seguro) | Consulta Confidencial | `servicios.html` |
| Anticoncepción de Emergencia | Consulta Confidencial | `servicios.html` |
| Métodos Anticonceptivos Sin Costo | **GRATIS** | `servicios.html` |
| Referencia a Ginecología | Parte de consulta | `servicios.html` |

### 👨 5.4 Salud del Hombre

| Servicio | Precio | Enlace |
|----------|--------|--------|
| Hiperplasia Prostática | Consulta Médica | `servicios.html` |
| Disfunción Eréctil | Consulta Médica | `servicios.html` |
| Eyaculación Precoz | Consulta Médica | `servicios.html` |
| Test de Síntomas Prostáticos | Parte de consulta | `servicios.html` |
| Referencia a Urología | Parte de consulta | `servicios.html` |

### 🛡️ 5.5 Paquetes Preventivos (Combos)

| Paquete | Precio | Incluye |
|---------|--------|---------|
| **Mujer Saludable Integral** | **$500 m.n.** | Evaluación preventiva anual completa |
| **Mujer Saludable Básico** | **$300 m.n.** | Papanicolaou, Consulta, Mastografía, VIH |
| **Mantenimiento Anual Masculino** | **$300 m.n.** | Chequeo preventivo próstata y diabetes |

### 🧪 5.6 Salud Sexual e ITS

| Servicio | Precio | Enlace |
|----------|--------|--------|
| Prueba Rápida de VIH | **GRATIS** | `servicios.html` |
| Condones Masculinos Gratis | **GRATIS** | `servicios.html` |
| Orientación en Planificación Familiar | **Sin Costo** | `servicios.html` |
| **Paquete ITS: Básico Seguro** | **$400 m.n.** | VIH, Sífilis, Hepatitis B y C |
| **Paquete ITS: Pareja Atenta** | **$350 m.n.** | Gonorrea y Clamidia |
| **Paquete ITS: Completo Tranquilo** | **$600 m.n.** | Panel integral completo |
| **Paquete ITS: Juntos es Mejor** | **$1,000 m.n.** (x2 personas) | Panel completo para pareja |

### 🔬 5.7 Laboratorios

| Servicio | Precio |
|----------|--------|
| Prueba de Embarazo (Orina) | **$50 m.n.** |
| Prueba de Embarazo (Sangre) | **$150 m.n.** |
| Prueba Rápida COVID-19 | **$150 m.n.** |
| Glucosa Capilar | **$30 m.n.** |
| Hemoglobina Glucosilada (HbA1c) | **$150 m.n.** |
| Examen General de Orina | **$50 m.n.** |
| Antígeno Prostático (PSA) | **$150 m.n.** |

> **Beneficio Laboratorios:** Al pagar en Celene, recibes hasta **70% de descuento** con Laboratorios Oropeza + **tele-lectura de resultados GRATIS** con médicos de Celene.

### 🧠 5.8 Psicología

| Área | Precio |
|------|--------|
| Acompañamiento Oncológico | Consulta |
| Manejo de Duelo | Consulta |
| Ansiedad y Depresión | Consulta |
| Terapia de Pareja/Familiar | Consulta |

### 💆 5.9 Fisioterapia y Terapias

| Servicio | Precio | Contacto |
|----------|--------|----------|
| Sobador Tony (Primo Tapia) | Contactar | Tel: 661 123 2010 / WA: +52 661 123 2010 |
| Fisioterapeuta Lupita | Contactar | Tel: 661 123 2826 / WA: +52 661 123 2826 |
| Inyección de Puntos Gatillo (TPI) | **$300 m.n.** | `puntos-gatillo.html` |
| Terapia con Ventosas | **$300 m.n.** | `servicios.html` |
| Reflexología Podal | **$450 m.n.** | `servicios.html` |

### 🦶 5.10 Podología

| Servicio | Precio |
|----------|--------|
| Corte Clínico de Uñas | **$380 m.n.** |
| Extracción de Uña Encarnada | **$350 m.n.** |
| Uña Encarnada (Óxido Nítrico) | **$400 m.n.** |
| Deslaminación / Hiperqueratosis | **$350 m.n.** |
| Tratamiento de Callosidades | **$350 m.n.** |
| Hongos y Pie de Atleta | **$350 m.n.** |
| Pie Diabético (1ra Consulta) | **$400 m.n.** |
| Reflexología Podal | **$450 m.n.** |

### 💉 5.11 Enfermería y Procedimientos

| Servicio | Precio |
|----------|--------|
| Toma de Presión Arterial | **$15 m.n.** |
| Toma de Peso/Talla | **$15 m.n.** |
| Aplicación de Inyecciones | **$40 m.n.** |
| Inyección de Puntos Gatillo (TPI) | **$300 m.n.** |

---

## 6. GUÍAS EDUCATIVAS Y HERRAMIENTAS

### 📚 Catálogo de Recursos Educativos
- **URL:** https://proyectocelene.org/recursos-educativos.html
- **Meta:** Guías médicas, manuales y herramientas de prevención
- **Características:** Buscador, tarjetas con categorías, enlaces a guías individuales

### Guías Disponibles

| Guía | URL | Autor | Descripción |
|------|-----|-------|-------------|
| **Cáncer de Mama** 🎗️ | `guia-cancer-mama.html` | Dr. Carlos Donato | Detección temprana, factores de riesgo, autoexploración, mitos y verdades |
| **Menopausia** 🌸 | `guia-menopausia.html` | Dr. Carlos Donato | Síntomas, terapia hormonal, opciones no hormonales, cuestionarios |
| **Diabetes** 🩸 | `guia-diabetes.html` | Dr. Carlos Donato | Nutrición, insulinas, cuidado de pies, pilares de tratamiento |
| **Inspección Visual (IVAA)** 🔬 | `guia-ivaa.html` | Proyecto Celene | "Prueba del Vinagrito", detección de cáncer cervicouterino |
| **Cáncer Cervicouterino y VPH** 🌸 | `guia-cacu.html` | Proyecto Celene | VPH, Papanicolaou, pruebas moleculares |
| **Quistes Mamarios** 💧 | `guia-quistes-mamarios.html` | Proyecto Celene | "Bolitas de agua" en el seno, causas y tratamientos |
| **Resultados Mastografía (BI-RADS)** 📊 | `guia-resultados-mastografia.html` | Proyecto Celene | Simulador interactivo para entender resultados |
| **Puntos Gatillo (TPI)** 💉 | `puntos-gatillo.html` | Proyecto Celene | Cuestionario clínico, guía de tratamiento |
| **Retiro de DIU** 🩱 | `retiro-diu.html` | Proyecto Celene | Guía paso a paso del procedimiento |
| **Retiro de ISD** 🩹 | `retiro-isd.html` | Proyecto Celene | Guía ilustrada del procedimiento |
| **Consejería VIH** 🛡️ | `guia-consejeria-vih.html` | Proyecto Celene | Pre y post consejería, PrEP, PEP, I=I |
| **Derechos Sexuales e ILE** ⚖️ | `salud-sexual.html` | Proyecto Celene | Educación sexual, ILE, consentimiento |

### Herramientas Interactivas

| Herramienta | URL | Tecnología | Descripción |
|-------------|-----|------------|-------------|
| **Calculadora de Riesgo de Cáncer de Mama** 🧮 | `calculadora-riesgo-mama.html` | React + Tailwind | Basada en modelos Gail/IBIS Tyrer-Cuzick |
| **Cuestionario de Salud Sexual** 📝 | `cuestionario-salud-sexual.html` | HTML/CSS/JS | Evalúa prácticas de riesgo, envía resultados por WhatsApp |
| **Dr. Donato de Bolsillo** 📱 | `drdonato-de-bolsillo.html` | Tailwind + Chart.js + PWA | Bitácora médica personal (PWA instalable) |
| **Cuestionario Pre-Consulta** | `cuestionario-pre-consulta.html` | HTML/CSS/JS | Evaluación previa a consulta |
| **Cuestionario Menopausia** | `cuestionario-menopausia.html` | HTML/CSS/JS | Evaluación de síntomas menopáusicos |

---

## 7. PROFESIONALES DE LA SALUD

### 👨‍⚕️ Dr. Carlos Donato
- **Perfil:** Coordinador Médico y Operativo de Proyecto Celene
- **URL:** https://proyectocelene.org/dr-donato.html
- **Especialidad:** Medicina General, creador de contenido educativo
- **Redes/Links:** WhatsApp, teléfono
- **Herramienta propia:** "Dr. Donato de Bolsillo" (bitácora médica PWA)
- **Título:** Dr. Carlos Donato
- **Estilo de página:** Azul suave con fotografía profesional

### 👩‍⚕️ Dra. Erika Daniela Huerta Rivas
- **Perfil:** Coordinadora de Telemedicina, Agente de Salud Digital, Médica General
- **URL:** https://proyectocelene.org/dra-daniela.html
- **Especialidad:** Telemedicina, Salud Digital
- **Estilo de página:** Morado/cyan con diseño skeuomorphic "digital"
- **Badge:** "EN VIVO" animado

### Perfiles de Especialistas Aliados
| Especialista | URL | Contacto |
|-------------|-----|----------|
| Sobador Tony (Primo Tapia) | `sobador-tony.html` | 661 123 2010 |
| Fisioterapeuta Lupita | `fisioterapeuta-lupita.html` | 661 123 2826 |
| Perfil de Sara | `perfil-sara.html` | (pendiente de leer) |

---

## 8. PROGRAMAS SOCIALES Y GRATUITOS

### 🆓 8.1 Mastografía Gratuita
- **URL:** https://proyectocelene.org/mastografia-gratuita.html
- **Descripción:** Guía paso a paso para usar el vale de Mastografía Gratis
- **Pasos:** Solicitar cita → Recibir indicaciones → Presentarse → Resultados

### 🆓 8.2 Atención Médica Gratuita (Trabajo Social)
- **URL:** https://proyectocelene.org/atencion-medica-gratuita.html
- **Descripción:** Programa de Trabajo Social para exentar cuotas de recuperación a personas vulnerables
- **Lema:** "En Proyecto Celene a nadie se le niega el servicio"

### 🆓 8.3 Orientación Médica Gratuita
- **URL:** https://proyectocelene.org/orientacion-medica-gratuita.html
- **Descripción:** Resuelve dudas rápidas, conoce a qué especialista acudir o recibe información preventiva sin salir de casa

### 🆓 8.4 Prueba Rápida de VIH Gratis
- **Precio:** GRATIS
- **Descripción:** Prueba rápida, confidencial, resultados en minutos

### 🆓 8.5 Métodos Anticonceptivos Sin Costo
- **Descripción:** Sujetos a disponibilidad de inventario solidario
- Incluye: condones masculinos gratis, pastillas anticonceptivas (sujeto a disponibilidad)

### 🆓 8.6 Farmacia Solidaria
- **URL:** https://proyectocelene.org/farmacia-solidaria.html
- **Modelo:** Cuotas de recuperación simbólicas para medicamentos
- **Proceso:** Solicitud por formulario, checklist de requisitos

---

## 9. PARTICIPACIÓN COMUNITARIA

### 🙋 9.1 Voluntariado
- **URL:** https://proyectocelene.org/unete-a-nuestro-equipo.html
- **Modalidades:**
  - **Voluntariado Libre:** Personas con tiempo disponible para jornadas, eventos, apoyo comunitario
  - **Servicio Social:** Estudiantes de prepa o universidad
  - **Empresas (Alianza Rosa):** Beneficios ESR para empresas

### 🎓 9.2 Servicio Social y Prácticas
- **URL:** https://proyectocelene.org/servicio-social.html
- **Para:** Estudiantes de preparatoria y universidad
- **Áreas:** Aplicar conocimientos y realizar prácticas profesionales

### 🤝 9.3 Alianza Rosa (Empresas)
- **URL:** https://proyectocelene.org/patrocinadores.html
- **Beneficios:** Salud para el equipo, Responsabilidad Social (ESR), patrocinio del 18° Aniversario

### 🏢 9.4 Aliados y Patrocinadores
- **URL:** https://proyectocelene.org/nuestros-aliados.html
- **Concepto:** "El Club de los Héroes" — empresas y ciudadanos que apoyan la misión

---

## 10. MAPA DE RELACIONES ENTRE PÁGINAS

### 📌 Navegación Principal (barra global)
```
index.html (Inicio)
  ├── quienes-somos.html (Nosotros)
  ├── modulos1.html (Módulos - Nayarit)
  ├── consultorio-comunitario.html (Consultorio)
  ├── servicios.html (Servicios - Catálogo con precios)
  ├── farmacia-solidaria.html (Farmacia Solidaria)
  ├── unete-a-nuestro-equipo.html (Únete/Apoya)
  └── mapa-sitio.html (Mapa del sitio / Buscar)
```

### 🔗 Relaciones entre Páginas de Servicios

```
servicios.html (Catálogo central)
  ├── mastografia-gratuita.html (Guía mastografía gratis)
  │     └── guia-resultados-mastografia.html (Simulador BI-RADS)
  ├── control-de-peso.html (Programa)
  ├── guia-ivaa.html (Guía IVAA)
  │     └── guia-cacu.html (Guía Cáncer Cervicouterino)
  ├── guia-menopausia.html (Guía Menopausia)
  ├── retiro-diu.html (Guía Retiro DIU)
  ├── retiro-isd.html (Guía Retiro ISD)
  ├── puntos-gatillo.html (Guía Puntos Gatillo)
  ├── podologia.html (Clínica Podología)
  ├── sobador-tony.html (Perfil Sobador)
  ├── fisioterapeuta-lupita.html (Perfil Fisioterapeuta)
  ├── telemedicina.html (Consulta Virtual)
  └── salud-sexual.html (Clínica Salud Sexual)
        ├── guia-consejeria-vih.html (Consejería VIH)
        ├── cuestionario-salud-sexual.html (Test)
        └── cuestionario-pre-consulta.html

recursos-educativos.html (Catálogo de Guías)
  ├── guia-cancer-mama.html
  │     └── calculadora-riesgo-mama.html
  ├── guia-menopausia.html
  ├── guia-ivaa.html
  ├── guia-cacu.html
  ├── guia-quistes-mamarios.html
  ├── guia-resultados-mastografia.html
  ├── guia-diabetes.html
  ├── puntos-gatillo.html
  ├── retiro-diu.html
  ├── retiro-isd.html
  ├── guia-consejeria-vih.html
  ├── cuestionario-salud-sexual.html
  └── salud-sexual.html
```

### 🔗 Páginas Informativas
```
quienes-somos.html (Nosotros)
  ├── nuestra-historia.html (Historia detallada)
  ├── dr-donato.html (Perfil Dr. Donato)
  │     └── drdonato-de-bolsillo.html (App PWA)
  └── dra-daniela.html (Perfil Dra. Daniela)
        └── telemedicina.html (Telemedicina)

unete-a-nuestro-equipo.html (Únete)
  ├── servicio-social.html (Servicio Social)
  ├── patrocinadores.html (Patrocinadores)
  └── nuestros-aliados.html (Aliados)

aniversario.html (18° Aniversario)
  └── epoca-vintage.html (Época Vintage - temática)
```

### 📄 Páginas Independientes
- `resena.html` — Página de reseñas de Google
- `consulta-general.html` — Info consulta general
- `atencion-medica-gratuita.html` — Programa trabajo social
- `orientacion-medica-gratuita.html` — Orientación gratuita
- `salud-mental.html` — Salud mental
- `cuestionario-menopausia.html` — Test menopausia
- `cuestionario-pre-consulta.html` — Pre-consulta
- `cuestionario-salud-sexual.html` — Test salud sexual

---

## 11. SISTEMA DE RESERVAS Y PAGOS

### 📅 Reservar Consulta
- **URL:** https://proyectocelene.org/reservar-consulta.html
- **Descripción:** Agenda tu cita médica con el Dr. Carlos Donato
- **Características:** Calendario interactivo, selección de fecha/hora, tabs de navegación rápida
- **Sección de pagos:** Múltiples métodos de pago con instrucciones

### 💳 Métodos de Pago Aceptados
1. **Efectivo** — En clínica (cuotas de recuperación)
2. **Transferencia bancaria** — Datos bancarios disponibles en `servicios.html` y `reservar-consulta.html`
   - Cuentas con copy-box moderno para copiar fácilmente
3. **Pago en laboratorios** — Descuento directo al pagar en Celene

### 📱 WhatsApp para Agendar
Casi todos los servicios tienen un botón "Agendar" que abre WhatsApp al número +52 661 104 4050 con un mensaje predefinido según el servicio.

---

## 12. RESEÑAS Y REPUTACIÓN

### ⭐ Página de Reseñas
- **URL:** https://proyectocelene.org/resena.html
- **Propósito:** Invitar a pacientes a dejar reseña en Google
- **Enlace directo a Google Reviews:** https://g.page/r/CSyqpg-XraHKEBM/review
- **Diseño:** Fondo con estrellas animadas, instrucciones paso a paso, botón llamativo 3D
- **Mensaje clave:** "Cuando una mujer tiene miedo y busca ayuda, leer tu comentario le da la valentía para cruzar nuestra puerta"

---

## 13. CONTACTO Y REDES SOCIALES

### 📞 Contacto Directo
| Vía | Dato |
|-----|------|
| **WhatsApp** | +52 661 104 4050 |
| **Teléfono** | +52 661 104 4050 |

### 🌐 Presencia Web
- **Sitio principal:** https://proyectocelene.org
- **Google Reviews:** https://g.page/r/CSyqpg-XraHKEBM/review
- **Subdominio personal:** `personal/index.html` (herramientas internas)
  - `personal/algoritmos/resfriado-comun.html` — Algoritmo médico
  - `personal/herramientas/generar-recibos.html` — Generador de recibos (PWA)

---

## 14. NOTAS TÉCNICAS DEL SITIO

### 🛠 Stack Tecnológico
- **Frontend:** HTML5, CSS3, JavaScript (vanilla)
- **Frameworks adicionales:** Tailwind CSS (en `calculadora-riesgo-mama.html` y `drdonato-de-bolsillo.html`)
- **Librerías:** React 18 + Babel (en `calculadora-riesgo-mama.html`), Chart.js (en `drdonato-de-bolsillo.html`)
- **PWA:** `manifest.json` y `sw.js` (Service Worker) para instalación en celular
- **Fuentes:** Google Fonts (Nunito, Handlee, Shrikhand, Courier Prime, Inter)
- **Hosting de imágenes:** i.ibb.co (enlaces directos)
- **SEO:** Open Graph tags, Twitter cards, meta descriptions, canónicos

### 📁 Estructura de Archivos
```
proyecto celene web page/
├── *.html (40+ páginas HTML)
├── css/
│   └── global.css (Estilos globales: nav, botón WA flotante, calendario, top pill)
├── js/
│   └── global.js (Nav dinámico, modal WA, animaciones, botón arriba)
├── imagenes/
│   ├── backup/ (respaldos)
│   ├── gyo/ (ginecología y obstetricia)
│   │   ├── ivaa cacu/
│   │   └── mama/
│   ├── its/ (infecciones de transmisión sexual)
│   └── no-organizadas/ (imágenes sin organizar)
├── personal/
│   ├── index.html
│   ├── algoritmos/resfriado-comun.html
│   └── herramientas/generar-recibos.html (PWA propia con manifest y sw)
├── saludmental/
│   ├── cuestionarios.html
│   ├── depresion.html
│   ├── funcionamiento-diario.html
│   ├── reduccion-estres.html
│   └── tratamientos-psicologicos.html
├── videos/ (carpeta de videos)
├── manifest.json (PWA manifest)
├── sw.js (Service Worker)
└── CNAME (para dominio personalizado)
```

### 🔄 Scripts de Utilidad (Python)
- `refactor.py` — Script de refactorización
- `refactor_cuestionario.py` — Refactorización de cuestionarios
- `optimizar_imagenes.py` — Optimización de imágenes
- `check_tab_ids.py` — Verificación de IDs en tabs
- `check_tab_quotes.py` — Verificación de quotes en tabs
- `check_tabs_tags.py` — Verificación de tags en tabs

### 🌐 SEO por Página
Cada página HTML tiene (generalmente):
- Meta description única
- Open Graph tags (og:title, og:description, og:image, og:url)
- Twitter cards
- Link canónico (rel="canonical")
- Meta robots (index, follow)
- Favicon (logo circular)

---

## 📊 ESTADÍSTICAS DEL PROYECTO

| Categoría | Cantidad |
|-----------|----------|
| Páginas HTML totales | 40+ |
| Servicios con precio | 30+ |
| Guías educativas | 12 |
| Herramientas interactivas | 5 |
| Perfiles de doctores | 2 (Dr. Donato, Dra. Daniela) |
| Especialistas aliados | 3+ (Tony, Lupita, Sara) |
| Programas gratuitos | 6 |
| Paquetes/Combos | 3 |
| Profesionales listados | Dr. Carlos Donato, Dra. Daniela Huerta |

---

## ⚠️ NOTAS IMPORTANTES PARA LA IA

1. **El horario cambió:** Ahora es **Lunes a Sábado de 9 AM a 4 PM** (ya no domingo, ya no hasta 5pm)
2. **No es un hospital de gobierno:** Es una asociación civil sin fines de lucro, los precios son "cuotas de recuperación"
3. **A nadie se le niega el servicio:** Existe un programa de trabajo social para exentar cuotas
4. **La mastografía es GRATIS** si se tiene vale (hay guía paso a paso en el sitio)
5. **Los métodos de pago son:** Efectivo en clínica o transferencia bancaria
6. **Para agendar citas:** Se usa WhatsApp al +52 661 104 4050
7. **18° Aniversario en curso** (2026) — hay promociones y eventos especiales
8. **Red de módulos en Nayarit** además de la base en Rosarito
9. **Farmacia Solidaria** opera con donativos y cuotas simbólicas
10. **El sitio tiene PWA** para instalar en celular como app

---

*Documento generado el 9 de mayo de 2026 para referencia de sistemas de IA.*  
*Proyecto Celene A.C. — "Que ninguna mujer enfrente el cáncer de mama sola"* 🌸
