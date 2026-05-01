---
name: Proyecto Celene — Identidad Visual
description: Sistema de diseño del sitio web proyectocelene.org — fundación de lucha contra el cáncer de mama en Rosarito, B.C.
colors:
  rosa-pastell: "#fce4ec"
  rosa-medio: "#f06292"
  rosa-fuerte: "#d81b60"
  rosa-oscuro: "#ad1457"
  negro: "#333333"
  blanco: "#ffffff"
  amarillo: "#fff9c4"
  verde-wa: "#25d366"
  verde-wa-oscuro: "#1b9c4b"
  azul-suave: "#e3f2fd"
  gris-suave: "#f9f9f9"
  retro-amarillo: "#FFD23F"
  retro-rosa: "#EF476F"
  retro-morado: "#2D232E"
typography:
  body:
    fontFamily: Nunito
    fontWeight: 400
    fontSize: 1rem
  body-bold:
    fontFamily: Nunito
    fontWeight: 600
  body-heavy:
    fontFamily: Nunito
    fontWeight: 800
  display-script:
    fontFamily: Handlee
  display-retro:
    fontFamily: Shrikhand
  display-mono:
    fontFamily: Courier Prime
    fontFeature: "mono"
  h1:
    fontFamily: Nunito
    fontWeight: 800
    fontSize: 3.5rem
  h2:
    fontFamily: Nunito
    fontWeight: 800
    fontSize: 2.5rem
  h3:
    fontFamily: Nunito
    fontWeight: 800
    fontSize: 1.4rem
  hero-title:
    fontFamily: Nunito
    fontWeight: 800
    fontSize: 3.5rem
    lineHeight: 1.1
  hero-location:
    fontFamily: Nunito
    fontWeight: 800
    fontSize: 2rem
  hero-subtitle:
    fontFamily: Nunito
    fontWeight: 800
    fontSize: 1.3rem
    fontStyle: italic
rounded:
  pill: 50px
  section: 25px
  card: 20px
  image: 15px
  nav-item: 15px
spacing:
  container-padding: 15px
  section-padding-y: 40px
  section-padding-x: 20px
  grid-gap: 25px
  card-padding: 20px
  nav-gap: 10px
components:
  btn-base:
    padding: 15px 20px
    rounded: "{rounded.pill}"
    borderWidth: 4px
    borderColor: "{colors.negro}"
    fontWeight: 800
    fontSize: 1.1rem
    fontFamily: Nunito
    boxShadow: "0 6px 0 {colors.negro}"
    maxWidth: 350px
  btn-primario:
    backgroundColor: "{colors.rosa-fuerte}"
    textColor: "{colors.blanco}"
  btn-secundario:
    backgroundColor: "{colors.amarillo}"
    textColor: "{colors.negro}"
  btn-wa:
    backgroundColor: "{colors.verde-wa}"
    textColor: "{colors.blanco}"
  btn-llamar:
    backgroundColor: "{colors.azul-suave}"
    textColor: "{colors.negro}"
  btn-social:
    backgroundColor: "{colors.blanco}"
    textColor: "{colors.negro}"
    borderWidth: 3px
    boxShadow: "0 4px 0 {colors.negro}"
    padding: 10px 20px
  wa-float:
    backgroundColor: "{colors.verde-wa}"
    textColor: "{colors.blanco}"
    size: 60px
    rounded: "{rounded.pill}"
    borderWidth: 3px
    borderColor: "{colors.negro}"
    boxShadow: "4px 4px 0 {colors.negro}"
  service-card:
    backgroundColor: "{colors.blanco}"
    borderWidth: 3px
    borderColor: "{colors.negro}"
    rounded: "{rounded.card}"
    boxShadow: "6px 6px 0px {colors.gris-suave}"
    padding: "{spacing.card-padding}"
  section-hero:
    backgroundColor: "{colors.blanco}"
    borderWidth: 4px
    borderColor: "{colors.negro}"
    rounded: "{rounded.section}"
    boxShadow: "10px 10px 0px {colors.rosa-pastell}"
    padding: "{spacing.section-padding-y} {spacing.section-padding-x}"
  section-welcome:
    backgroundColor: "{colors.rosa-pastell}"
    borderWidth: 4px
    borderStyle: dashed
    borderColor: "{colors.negro}"
    rounded: "{rounded.card}"
  section-footer:
    backgroundColor: "{colors.rosa-oscuro}"
    textColor: "{colors.blanco}"
    borderWidth: 4px
    borderColor: "{colors.negro}"
    rounded: "{rounded.section}"
  main-nav:
    borderWidth: 3px
    borderColor: "{colors.negro}"
    rounded: "{rounded.card}"
    boxShadow: "6px 6px 0px {colors.rosa-pastell}"
  nav-link-hover:
    backgroundColor: "{colors.rosa-fuerte}"
    textColor: "{colors.blanco}"
    boxShadow: "3px 3px 0 {colors.negro}"
  modal-content:
    backgroundColor: "{colors.blanco}"
    borderWidth: 4px
    borderColor: "{colors.negro}"
    rounded: "{rounded.section}"
    boxShadow: "12px 12px 0px {colors.amarillo}"
  global-top-pill:
    backgroundColor: "{colors.negro}"
    textColor: "{colors.blanco}"
    rounded: "{rounded.pill}"
    borderWidth: 3px
    borderColor: "{colors.blanco}"
    boxShadow: "4px 4px 0 {colors.rosa-fuerte}"
  retro-banner:
    backgroundColor: "#FFD23F"
    textColor: "#2D232E"
    borderWidth: 4px
    borderColor: "#2D232E"
    rounded: "{rounded.pill}"
    boxShadow: "6px 6px 0px #2D232E"

---

## Overview

**Calidez comunitaria con personalidad juguetona.** El diseño de Proyecto Celene mezcla una estética amigable y accesible con un toque de rebeldía visual. Bordes gruesos de color negro (#333), sombras "3D" pronunciadas, y botones redondos tipo píldora dominan el lenguaje visual. Es un diseño que no se toma demasiado en serio, pero que comunica confianza y cercanía.

Los acentos en rosa (paleta de mastografía como guiño al propósito médico) con un contrapunto en amarillo suave crean una identidad que se siente tanto institucional como cálida.

## Colors

La paleta está dominada por rosas con distintos pesos y un neutro casi-negro que da estructura.

- **Rosa fuerte (#d81b60):** El color principal de acción. Botones primarios, títulos hero, acentos en hover, enlaces subrayados. Es el ancla visual del sitio.
- **Rosa pastel (#fce4ec):** Fondos de secciones secundarias (bienvenida, sombras decorativas). Aporta suavidad.
- **Rosa medio (#f06292):** Sombras en hover de tarjetas. Transición entre pastel y fuerte.
- **Rosa oscuro (#ad1457):** Fondo del footer. Contraste dramático contra contenido blanco.
- **Negro (#333333):** Color de texto principal, bordes en casi todos los componentes, sombras "3D". Le da el carácter juguetón y estructurado.
- **Amarillo (#fff9c4):** Botones secundarios, sombras de modales. Aporta calidez.
- **Verde WhatsApp (#25d366 / #1b9c4b):** Botones y flotante de WhatsApp. Funcional, sigue el branding de WA.
- **Azul suave (#e3f2fd):** Botón de llamada telefónica.
- **Gris suave (#f9f9f9):** Sombras base de tarjetas, fondos de tarjetas de citas.

## Typography

Tres familias de Google Fonts:

- **Nunito** (400, 600, 800) — El caballo de batalla. Cuerpo, títulos, botones, navegación. Todo lo estructural usa Nunito. Redondeada y amigable.
- **Handlee** — Uso exclusivo para acentos de texto "dibujado a mano". Añade personalidad y calidez artesanal.
- **Shrikhand** — Display gruesa y llamativa. Usada en el banner retro de aniversario. Solo para momentos festivos/especiales.
- **Courier Prime** — Monoespaciada para la fecha del calendario animado.

Jerarquía: h1 (3.5rem) → h2 (2.5rem) → h3 (1.4rem). Títulos siempre en Nunito 800.

## Layout & Spacing

- **Container:** max-width 1100px, centrado, padding 15px.
- **Grillas:** `auto-fit, minmax(250px, 1fr)` para servicios, `minmax(300px, 1fr)` para citas.
- **Espaciado:** 25px entre tarjetas, 20px entre elementos de cita, 10px entre enlaces de navegación.
- **Secciones:** padding vertical de 40px, separadas por 40-50px de margen.
- **Responsive breakpoint:** 768px (cambios layout), 600px (reducción de tamaños tipográficos).

## Elevation & Depth

El sitio usa **sombras estilo "dibujo animado 3D"** como lenguaje de profundidad:

- **Botones:** Sombra hacia abajo de 6px. Al hacer clic, la sombra desaparece y el botón "baja" 6px (efecto físico).
- **Tarjetas de servicio:** Sombra diagonal de 6px en estado normal; en hover escala a 8px con rosa medio.
- **Secciones completas (hero, citas):** Sombra diagonal de 10px con color de acento.
- **Modal:** Sombra diagonal de 12px en amarillo para destacar sobre el overlay oscuro.
- **Transiciones:** `all 0.2s` en hover, animaciones `fade-in` (0.6s) y `float` (4s infinita) para elementos decorativos.

## Shapes

- **Píldora (50px):** Botones, píldora de "volver arriba", banner retro.
- **Secciones (25px):** Hero, sección de citas, footer, modales.
- **Tarjetas (20px):** Tarjetas de servicio, navegación principal, reviews, modales de WA.
- **Imágenes (15px):** Logo, imágenes de servicio, mapa.
- **Bordes:** Predominantemente sólidos de 4px (secciones) y 3px (tarjetas, navegación). La sección de bienvenida usa borde dashed 4px.

## Components

### Botones
Base `btn` con borde negro 4px, relleno 15px 20px, border-radius 50px, peso 800. Variantes: primario (rosa fuerte), secundario (amarillo), WhatsApp (verde), llamada (azul suave), social (blanco). Efecto físico al hacer clic.

### Tarjetas de Servicio
Borde negro 3px, border-radius 20px, sombra 6px base → 8px rosa medio en hover. Imagen cuadrada interna con border-radius 15px.

### Navegación Principal
Flex wrap, border-radius 20px, borde 3px negro, sombra rosa pastel. Links cambian a fondo rosa fuerte en hover.

### WhatsApp Flotante
Círculo de 60px, fijo en bottom-right, verde WA, borde negro 3px, sombra negra 4px.

### Modal
Fondo blanco, borde 4px negro, border-radius 25px, sombra amarilla 12px. Animación popIn al abrir.

### Footer
Fondo rosa oscuro con texto blanco. Grid de 2 columnas en desktop. Incluye mapa, reseñas con estrellas, y redes sociales.

## Do's and Don'ts

- **Do** usar bordes negros gruesos (3-4px) en casi todo — es parte de la identidad.
- **Do** mantener el esquema de sombras 3D (sin box-shadow sutiles, que se note).
- **Do** usar Nunito 800 para cualquier texto que necesite destacar.
- **Do** reservar Handlee para detalles de calidez/frescura artesanal.
- **Don't** usar Shrikhand fuera del contexto festivo/retro.
- **Don't** agregar colores nuevos fuera de la paleta definida — si se necesita un nuevo color, debe negociarse con la paleta existente.
- **Don't** eliminar los bordes negros o hacerlos muy delgados — perdería la personalidad visual.
- **Don't** usar sombras sin el color de acento correspondiente — las sombras siempre llevan un color, nunca "negro al 50%".
- **Don't** modificar el diseño de los botones 3D (el efecto físico al hacer clic debe preservarse).
