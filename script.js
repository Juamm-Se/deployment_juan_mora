document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('.star');
    const currentRatingElem = document.getElementById('currentRating');
    const averageRatingElem = document.getElementById('averageRating');
    const voteCountElem = document.getElementById('voteCount');
    const resetBtn = document.getElementById('resetBtn');

    // 1. Cargar datos de localStorage al iniciar
    let appData = JSON.parse(localStorage.getItem('ratingApp_case28')) || {
        totalScore: 0,
        totalVotes: 0,
        myRating: 0
    };

    updateUI();
    highlightStars(appData.myRating);

    // 2. Eventos para las estrellas
    stars.forEach(star => {
        // Al pasar el mouse (Hover)
        star.addEventListener('mouseover', () => {
            const value = parseInt(star.getAttribute('data-value'));
            highlightStars(value);
        });

        // Al quitar el mouse
        star.addEventListener('mouseout', () => {
            highlightStars(appData.myRating); // Volver a la calificación guardada
        });

        // Al hacer clic (Fijar calificación)
        star.addEventListener('click', () => {
            const value = parseInt(star.getAttribute('data-value'));
            
            // Lógica: Si ya votó, actualizamos su voto (restamos el anterior y sumamos el nuevo)
            // Para este ejercicio simple, asumiremos que cada clic es un nuevo voto o actualiza el actual.
            // Vamos a hacerlo acumulativo para simular "varios votos" como pide el ejercicio.
            
            if (appData.myRating === 0) {
                appData.totalVotes++; // Nuevo voto
                appData.totalScore += value;
            } else {
                // El usuario cambia su voto: restamos el anterior y sumamos el nuevo
                appData.totalScore = appData.totalScore - appData.myRating + value;
            }

            appData.myRating = value;
            
            // Guardar en localStorage
            localStorage.setItem('ratingApp_case28', JSON.stringify(appData));
            
            updateUI();
        });
    });

    // Función para colorear estrellas
    function highlightStars(score) {
        stars.forEach(star => {
            const value = parseInt(star.getAttribute('data-value'));
            if (value <= score) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    // Función para actualizar textos en pantalla
    function updateUI() {
        currentRatingElem.textContent = appData.myRating;
        voteCountElem.textContent = appData.totalVotes;

        // Calcular promedio
        let average = 0;
        if (appData.totalVotes > 0) {
            average = (appData.totalScore / appData.totalVotes).toFixed(1);
        }
        averageRatingElem.textContent = average;
    }

    // Botón extra para limpiar localStorage (útil para pruebas)
    resetBtn.addEventListener('click', () => {
        localStorage.removeItem('ratingApp_case28');
        location.reload();
    });
});