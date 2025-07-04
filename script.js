let usuario = "";
let tutorias = JSON.parse(localStorage.getItem("tutorias")) || [];
tutorias.forEach(t => {
  if (!Array.isArray(t.participantes)) {
    t.participantes = [];
  }
  if (!Array.isArray(t.calificaciones)) {
    t.calificaciones = [];
  }
});

function showPage(pageName) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));
  document.getElementById(`page-${pageName}`).classList.add('active');

  const navButtons = document.querySelectorAll('.nav-button');
  navButtons.forEach(button => button.classList.remove('active'));
  document.querySelector(`.nav-button[onclick="showPage('${pageName}')"]`).classList.add('active');

  if (pageName === 'perfil') {
    renderProfile();
  } else if (pageName === 'tutorias') {
    render();
  }
}

function login() {
  const nombre = document.getElementById("username").value.trim();
  if (!nombre) {
    alert("Ingresa tu nombre");
    return;
  }

  usuario = nombre;

  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("userDisplay").innerText = usuario;
  showPage('tutorias');
  render();
}

function logout() {
  usuario = "";
  // localStorage.removeItem("tutorias"); // Mantener esta línea comentada para persistencia
  location.reload();
}

function guardarTutorias() {
  localStorage.setItem("tutorias", JSON.stringify(tutorias));
}

function crearTutoria() {
  const tema = document.getElementById("subject")?.value.trim();
  const fecha = document.getElementById("date")?.value;
  const inicio = document.getElementById("startTime")?.value;
  const fin = document.getElementById("endTime")?.value;
  const desc = document.getElementById("desc")?.value.trim();

  if (!tema || !fecha || !inicio || !fin || !desc) {
    alert("Completa todos los campos");
    return;
  }

  const nueva = {
    id: Date.now(),
    creador: usuario,
    tema,
    fecha,
    inicio,
    fin,
    desc,
    participantes: [],
    calificaciones: []
  };

  tutorias.push(nueva);
  guardarTutorias();
  render();

  document.getElementById("subject").value = "";
  document.getElementById("date").value = "";
  document.getElementById("startTime").value = "";
  document.getElementById("endTime").value = "";
  document.getElementById("desc").value = "";

  showPage('tutorias');
}

function unirse(id) {
  const t = tutorias.find(t => t.id === id);
  if (!t) return;
  if (t.creador === usuario) {
    alert("No puedes unirte a tu propia tutoría.");
    return;
  }
  if (t.participantes.includes(usuario)) {
    alert("Ya estás unido a esta tutoría.");
    return;
  }
  t.participantes.push(usuario);
  guardarTutorias();
  render();
}

// Funciones para modales
function openModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// Lógica para Editar Tutoría
let currentEditingTutoriaId = null;

function openEditModal(id) {
  const t = tutorias.find(t => t.id === id);
  if (!t) return;

  currentEditingTutoriaId = id;
  document.getElementById("editTutoriaId").value = t.id;
  document.getElementById("editSubject").value = t.tema;
  document.getElementById("editDate").value = t.fecha;
  document.getElementById("editStartTime").value = t.inicio;
  document.getElementById("editEndTime").value = t.fin;
  document.getElementById("editDesc").value = t.desc;
  openModal('editTutoriaModal');
}

function saveEditedTutoria() {
  const id = document.getElementById("editTutoriaId").value;
  const t = tutorias.find(t => t.id == id);
  if (!t) return;

  const nuevoTema = document.getElementById("editSubject").value.trim();
  const nuevaFecha = document.getElementById("editDate").value;
  const nuevoInicio = document.getElementById("editStartTime").value;
  const nuevoFin = document.getElementById("editEndTime").value;
  const nuevaDesc = document.getElementById("editDesc").value.trim();

  if (!nuevoTema || !nuevaFecha || !nuevoInicio || !nuevoFin || !nuevaDesc) {
    alert("Completa todos los campos para editar la tutoría.");
    return;
  }

  t.tema = nuevoTema;
  t.fecha = nuevaFecha;
  t.inicio = nuevoInicio;
  t.fin = nuevoFin;
  t.desc = nuevaDesc;
  guardarTutorias();
  render();
  closeModal('editTutoriaModal');
}

// Lógica para Feedback/Calificación
let currentFeedbackTutoriaId = null;

function openFeedbackModal(id) {
  currentFeedbackTutoriaId = id;
  document.getElementById("feedbackTutoriaId").value = id;
  const t = tutorias.find(t => t.id === id);
  if (!t) return;

  const feedbackStarsContainer = document.getElementById("feedbackStars");
  const stars = feedbackStarsContainer.querySelectorAll("span");

  // Limpiar TODAS las clases 'seleccionada' y 'hover' al abrir el modal
  stars.forEach(s => {
    s.classList.remove("seleccionada");
    s.classList.remove("hover");
  });
  document.getElementById("selectedRating").value = "";
  document.getElementById("feedbackComment").value = "";

  const calificacionUsuario = t.calificaciones.find(c => c.usuario === usuario);
  if (calificacionUsuario) {
    document.getElementById("selectedRating").value = calificacionUsuario.valor;
    // Marcar visualmente las estrellas en el orden correcto (izquierda a derecha)
    for (let i = 0; i < calificacionUsuario.valor; i++) {
      stars[i].classList.add("seleccionada");
    }
    document.getElementById("feedbackComment").value = calificacionUsuario.comentario || "";
  }

  openModal('feedbackModal');
}

// Función auxiliar para actualizar visualmente las estrellas (hover o seleccionadas)
function updateStarDisplay(value, stars, className) {
  stars.forEach((star, index) => {
    if (index < value) {
      star.classList.add(className);
    } else {
      star.classList.remove(className);
    }
  });
}

// Escuchar el movimiento del mouse sobre las estrellas para el hover
document.getElementById("feedbackStars").addEventListener("mouseover", function(event) {
  if (event.target.tagName === 'SPAN') {
    const value = parseInt(event.target.dataset.value);
    const stars = this.querySelectorAll("span");
    // Limpiar solo los hovers anteriores para no interferir con seleccionadas
    stars.forEach(star => star.classList.remove("hover"));
    updateStarDisplay(value, stars, "hover");
  }
});

// Limpiar el hover cuando el mouse sale del contenedor de estrellas
document.getElementById("feedbackStars").addEventListener("mouseout", function() {
  const stars = this.querySelectorAll("span");
  stars.forEach(star => star.classList.remove("hover"));
});

// Escuchar el clic para seleccionar las estrellas
document.getElementById("feedbackStars").addEventListener("click", function(event) {
  if (event.target.tagName === 'SPAN') {
    const value = parseInt(event.target.dataset.value);
    document.getElementById("selectedRating").value = value;
    const stars = this.querySelectorAll("span");

    // Limpiar todas las clases 'seleccionada' antes de aplicar la nueva selección
    stars.forEach(star => star.classList.remove("seleccionada"));
    // Marcar las estrellas seleccionadas
    updateStarDisplay(value, stars, "seleccionada");
  }
});

function submitFeedback() {
  const id = document.getElementById("feedbackTutoriaId").value;
  const t = tutorias.find(t => t.id == id);
  if (!t) return;

  const valor = parseInt(document.getElementById("selectedRating").value);
  const comentario = document.getElementById("feedbackComment").value.trim();

  if (isNaN(valor) || valor < 1 || valor > 5) {
    alert("Por favor, selecciona una calificación de 1 a 5 estrellas.");
    return;
  }

  if (t.creador === usuario) {
    alert("No puedes calificar tu propia tutoría.");
    return;
  }

  t.calificaciones = t.calificaciones.filter(c => c.usuario !== usuario);
  t.calificaciones.push({
    usuario,
    valor,
    comentario
  });

  guardarTutorias();
  render();
  renderProfile();
  closeModal('feedbackModal');
}

// Lógica para Borrar con Modal
let tutoriaIdToDelete = null;

function openConfirmDeleteModal(id) {
  tutoriaIdToDelete = id; // Guardar el ID de la tutoría a borrar
  openModal('confirmDeleteModal');
}

function confirmDeleteTutoria() {
  if (tutoriaIdToDelete !== null) {
    tutorias = tutorias.filter(t => t.id !== tutoriaIdToDelete);
    guardarTutorias();
    render();
    renderProfile(); // Actualizar el perfil también
    closeModal('confirmDeleteModal');
    tutoriaIdToDelete = null; // Resetear el ID
  }
}

function render() {
  const lista = document.getElementById("listaTutorias");
  lista.innerHTML = "";

  if (tutorias.length === 0) {
    lista.innerHTML = "<p>No hay tutorías disponibles en este momento.</p>";
    return;
  }

  tutorias.forEach(t => {
    const promedio =
      t.calificaciones.length > 0
        ? (
          t.calificaciones.reduce((sum, c) => sum + c.valor, 0) /
          t.calificaciones.length
        ).toFixed(1)
        : "Sin calificar";

    const li = document.createElement("li");
    li.classList.add('tutoria-item');
    li.innerHTML = `
      <strong>${t.tema}</strong> - ${t.fecha} de ${t.inicio} a ${t.fin}<br>
      <em>${t.desc}</em><br>
      Creador: ${t.creador}<br>
      Participantes: ${t.participantes.join(", ") || "ninguno"}<br>
      Calificación: ${promedio} ⭐<br>
      ${t.creador === usuario
        ? `<div class="tutoria-actions">
             <button onclick="openEditModal(${t.id})" class="edit-button">Editar</button>
             <button onclick="openConfirmDeleteModal(${t.id})" class="delete-button">Borrar</button>
           </div>`
        : `<div class="tutoria-actions">
             <button onclick="unirse(${t.id})" class="join-button">Unirse</button>
             <button onclick="openFeedbackModal(${t.id})" class="feedback-button">Calificar/Feedback</button>
           </div>`
      }
    `;
    lista.appendChild(li);
  });
}

function renderProfile() {
  const misTutoriasCreadasLista = document.getElementById("misTutoriasCreadas");
  const misTutoriasParticipoLista = document.getElementById("misTutoriasParticipo");

  misTutoriasCreadasLista.innerHTML = "";
  misTutoriasParticipoLista.innerHTML = "";

  const tutoriasCreadas = tutorias.filter(t => t.creador === usuario);
  const tutoriasParticipo = tutorias.filter(t => t.participantes.includes(usuario) && t.creador !== usuario);

  if (tutoriasCreadas.length === 0) {
    misTutoriasCreadasLista.innerHTML = "<p>No has creado ninguna tutoría aún.</p>";
  } else {
    tutoriasCreadas.forEach(t => {
      const promedio =
        t.calificaciones.length > 0
          ? (
            t.calificaciones.reduce((sum, c) => sum + c.valor, 0) /
            t.calificaciones.length
          ).toFixed(1)
          : "Sin calificar";

      let feedbackDetallado = "";
      if (t.calificaciones.length > 0) {
        feedbackDetallado = `<br>Feedback de alumnos:`;
        t.calificaciones.forEach(c => {
          feedbackDetallado += `<br>- ${c.usuario}: ${c.valor} ⭐ (${c.comentario || 'sin comentario'})`;
        });
      }


      const li = document.createElement("li");
      li.classList.add('tutoria-item');
      li.innerHTML = `
        <strong>${t.tema}</strong> - ${t.fecha} de ${t.inicio} a ${t.fin}<br>
        <em>${t.desc}</em><br>
        Participantes: ${t.participantes.join(", ") || "ninguno"}<br>
        Calificación Promedio: ${promedio} ⭐
        ${feedbackDetallado}
        <div class="tutoria-actions">
          <button onclick="openEditModal(${t.id})" class="edit-button">Editar</button>
          <button onclick="openConfirmDeleteModal(${t.id})" class="delete-button">Borrar</button>
        </div>
      `;
      misTutoriasCreadasLista.appendChild(li);
    });
  }

  if (tutoriasParticipo.length === 0) {
    misTutoriasParticipoLista.innerHTML = "<p>No te has unido a ninguna tutoría aún.</p>";
  } else {
    tutoriasParticipo.forEach(t => {
      const calificacionUsuario = t.calificaciones.find(c => c.usuario === usuario);
      const miCalificacion = calificacionUsuario ? `${calificacionUsuario.valor} ⭐` : "No has calificado";
      const miComentario = calificacionUsuario && calificacionUsuario.comentario ? ` (${calificacionUsuario.comentario})` : "";

      const li = document.createElement("li");
      li.classList.add('tutoria-item');
      li.innerHTML = `
        <strong>${t.tema}</strong> - ${t.fecha} de ${t.inicio} a ${t.fin}<br>
        <em>${t.desc}</em><br>
        Creador: ${t.creador}<br>
        Tu calificación: ${miCalificacion}${miComentario}<br>
        <div class="tutoria-actions">
          <button onclick="openFeedbackModal(${t.id})" class="feedback-button">Modificar Feedback</button>
        </div>
      `;
      misTutoriasParticipoLista.appendChild(li);
    });
  }
}
