document.addEventListener("DOMContentLoaded", function () {
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        navbarContainer.innerHTML = `
            <a href="inicio.html">Inicio</a>
            <a href="quienes-somos.html">Nosotros</a>
            <a href="modulos1.html">Módulos</a>
            <a href="consultorio-comunitario.html">Consultorio</a>
            <a href="servicios.html">Servicios</a>
            <a href="farmacia-solidaria.html">Farmacia</a>
            <a href="unete-a-nuestro-equipo.html">Únete / Apoya</a>
            <a href="mapa-sitio.html" style="background: #fff9c4; border-color: #333333; color: #333333;">🔍 Buscar</a>
        `;
    }

    // Observer global para animaciones fade-in
    const fadeElements = document.querySelectorAll('.fade-in');
    if (fadeElements.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);
        fadeElements.forEach(el => observer.observe(el));
    }

    // Inyectar Botón Flotante de WhatsApp Global y su Modal
    const globalWaHTML = `
        <a href="javascript:void(0)" class="global-wa-float" onclick="openGlobalWaModal()" title="Contacto WhatsApp">
            <span aria-hidden="true">💬</span>
        </a>
        <div id="globalWaModal" class="global-wa-modal" onclick="closeGlobalWaModal(event)">
            <div class="global-wa-modal-content">
                <span class="global-wa-close" onclick="closeGlobalWaModal(event, true)">✕</span>
                <h3 style="font-family: 'Handlee', cursive; color:#d81b60; font-size:1.8rem; margin-top:0; margin-bottom:10px;">Contacto Celene</h3>
                <p style="margin-bottom:15px; font-weight: 600; color: #555; font-size: 0.95rem;">Déjanos tus datos y tu duda, te responderemos a la brevedad posible.</p>
                <input type="text" id="gwa_nombre" placeholder="Tu Nombre Completo" style="width:100%; padding:10px; margin-bottom:10px; border-radius:8px; border:2px solid #333; font-family:'Nunito', sans-serif; outline: none;">
                <input type="number" id="gwa_edad" placeholder="Tu Edad" style="width:100%; padding:10px; margin-bottom:10px; border-radius:8px; border:2px solid #333; font-family:'Nunito', sans-serif; outline: none;">
                <textarea id="gwa_duda" rows="3" placeholder="¿En qué te podemos ayudar?" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:2px solid #333; font-family:'Nunito', sans-serif; outline: none; resize: vertical;"></textarea>
                <button onclick="sendGlobalWa()" style="width:100%; padding:12px; border-radius:50px; background:#25d366; color:white; border:3px solid #333; font-weight:bold; font-size:1.1rem; cursor:pointer; font-family:'Nunito', sans-serif; box-shadow: 0 4px 0 #1b9c4b;">Enviar Mensaje 💬</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', globalWaHTML);

    window.openGlobalWaModal = function () {
        document.getElementById('globalWaModal').style.display = 'flex';
    };
    window.closeGlobalWaModal = function (event, force = false) {
        if (force || event.target.id === 'globalWaModal') {
            document.getElementById('globalWaModal').style.display = 'none';
        }
    };
    window.sendGlobalWa = function () {
        let n = document.getElementById('gwa_nombre').value.trim() || 'No especificado';
        let e = document.getElementById('gwa_edad').value.trim() || '-';
        let d = document.getElementById('gwa_duda').value.trim() || 'Necesito más información.';
        let msg = `Hola Proyecto Celene 🌸.\nSoy *${n}* (${e} años).\n\nMe contacto para lo siguiente:\n"${d}"`;
        window.open(`https://wa.me/526611044050?text=${encodeURIComponent(msg)}`, '_blank');
        document.getElementById('globalWaModal').style.display = 'none';
    };
});
