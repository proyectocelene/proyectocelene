document.addEventListener("DOMContentLoaded", function() {
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        navbarContainer.innerHTML = `
            <a href="inicio.html">Inicio</a>
            <a href="quienes-somos.html">Nosotros</a>
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
});
