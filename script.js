let usuario = "";
let tutorias = JSON.parse(localStorage.getItem("tutorias")) || [];
tutorias.forEach(t => {
  if (!Array.isArray(t.participantes)) {
    t.participantes = [];
  }
  if (!Array.isArray(t.calificaciones)) {
    t.calificaciones = [];
  }
  if (!t.estado) {
    t.estado = "activa"; // 'activa' o 'terminada'
  }
});

function showPage(pageName) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));
  document.getElementById(`page-${pageName}`).classList.add('active');

  const navButtons = document.querySelectorAll('.nav-button');
  navButtons.forEach(button => button.classList.remove('active'));
  const currentNavButton = document.querySelector(`.nav-button[onclick="showPage('${pageName}')"]`);
  if (currentNavButton) {
    currentNavButton.classList.add('active');
  }

  // Controlar visibilidad del botón "Nueva Tutoría"
  const newTutoriaButton = document.getElementById('newTutoriaNavButton');
  if (newTutoriaButton) {
    if (usuario === 'Admin') {
      newTutoriaButton.style.display = 'none';
    } else {
      newTutoriaButton.style.display = 'block';
    }
  }

  // Controlar visibilidad y redirección para el botón "Mi Perfil"
  const profileNavButton = document.getElementById('profileNavButton');
  if (profileNavButton) {
    if (usuario === 'Admin') {
      profileNavButton.style.display = 'none';
      // Si el Admin intenta ir a 'perfil', redirigirlo a 'tutorias'
      if (pageName === 'perfil') {
        showPage('tutorias');
        return; // Salir de esta ejecución de showPage para evitar bucles o inconsistencias
      }
    } else {
      profileNavButton.style.display = 'block';
    }
  }

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

  if (usuario === 'Admin') {
    document.getElementById("confirmUserDisplay").innerText = usuario;
    document.getElementById("adminPassword").value = "";
    document.getElementById("passwordError").style.display = "none";
    openModal('loginConfirmModal');
  } else {
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("userDisplay").innerText = usuario;
    showPage('tutorias');
    render();
  }
}

function checkAdminPassword() {
  const adminPasswordInput = document.getElementById("adminPassword");
  const passwordErrorElement = document.getElementById("passwordError");
  const enteredPassword = adminPasswordInput.value;

  if (enteredPassword === 'admin') {
    passwordErrorElement.style.display = "none";
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("userDisplay").innerText = usuario;
    showPage('tutorias');
    render();
    closeModal('loginConfirmModal');
  } else {
    passwordErrorElement.style.display = "block";
    adminPasswordInput.value = "";
  }
}

function cancelLogin() {
  usuario = "";
  document.getElementById("username").value = "";
  document.getElementById("adminPassword").value = "";
  document.getElementById("passwordError").style.display = "none";
  closeModal('loginConfirmModal');
}

function logout() {
  usuario = "";
  document.getElementById("app").style.display = "none";
  document.getElementById("login").style.display = "flex";
  document.getElementById("username").value = "";
}

function guardarTutorias() {
  localStorage.setItem("tutorias", JSON.stringify(tutorias));
}

function crearTutoria() {
  // Restricción para Admin: no puede crear tutorías
  if (usuario === 'Admin') {
    alert("Los administradores no pueden crear tutorías.");
    showPage('tutorias'); // Redirigir al Admin de vuelta a la lista de tutorías
    return;
  }

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
    calificaciones: [],
    estado: "activa"
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
  // Restricción para Admin: no puede unirse a tutorías
  if (usuario === 'Admin') {
    alert("Los administradores no pueden unirse a tutorías.");
    return;
  }

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
  if (t.estado === "terminada") {
    alert("No puedes unirte a una tutoría terminada.");
    return;
  }
  t.participantes.push(usuario);
  guardarTutorias();
  render();
}

// Nueva función para salirse de una tutoría
function salirse(id) {
  if (usuario === 'Admin') {
    alert("Los administradores no pueden salirse de tutorías.");
    return;
  }

  const t = tutorias.find(t => t.id === id);
  if (!t) return;

  if (!t.participantes.includes(usuario)) {
    alert("No estás unido a esta tutoría.");
    return;
  }

  // Eliminar al usuario del array de participantes
  t.participantes = t.participantes.filter(p => p !== usuario);
  guardarTutorias();
  render(); // Actualizar la lista de tutorías
  renderProfile(); // Actualizar el perfil del usuario
  alert("Te has salido de la tutoría.");
}


function openModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

let currentEditingTutoriaId = null;

function openEditModal(id) {
  const t = tutorias.find(t => t.id === id);
  if (!t) return;

  if (t.estado === "terminada") {
    alert("No puedes editar una tutoría que ya ha sido terminada.");
    return;
  }

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

let currentFeedbackTutoriaId = null;

function openFeedbackModal(id) {
  const t = tutorias.find(t => t.id === id);
  if (!t) return;

  // New check: Only allow feedback for "terminada" tutorials
  if (t.estado !== "terminada") {
    alert("Solo puedes dejar feedback a tutorías que han sido terminadas.");
    return;
  }

  // Restricción para Admin: no puede dejar feedback
  if (usuario === 'Admin') {
    alert("Los administradores no dejan feedback.");
    return;
  }

  if (!t.participantes.includes(usuario)) {
    alert("Solo puedes dejar feedback si participaste en esta tutoría.");
    return;
  }
  if (t.creador === usuario) {
    alert("No puedes dejar feedback a tu propia tutoría.");
    return;
  }

  currentFeedbackTutoriaId = id;
  document.getElementById("feedbackTutoriaId").value = id;
  const feedbackStarsContainer = document.getElementById("feedbackStars");
  const stars = feedbackStarsContainer.querySelectorAll("span");

  stars.forEach(s => {
    s.classList.remove("seleccionada");
    s.classList.remove("hover");
  });
  document.getElementById("selectedRating").value = "";
  document.getElementById("feedbackComment").value = "";

  const calificacionUsuario = t.calificaciones.find(c => c.usuario === usuario);
  if (calificacionUsuario) {
    document.getElementById("selectedRating").value = calificacionUsuario.valor;
    for (let i = 0; i < calificacionUsuario.valor; i++) {
      stars[i].classList.add("seleccionada");
    }
    document.getElementById("feedbackComment").value = calificacionUsuario.comentario || "";
  }

  openModal('feedbackModal');
}

function updateStarDisplay(value, stars, className) {
  stars.forEach((star, index) => {
    if (index < value) {
      star.classList.add(className);
    } else {
      star.classList.remove(className);
    }
  });
}

document.getElementById("feedbackStars").addEventListener("mouseover", function(event) {
  if (event.target.tagName === 'SPAN') {
    const value = parseInt(event.target.dataset.value);
    const stars = this.querySelectorAll("span");
    stars.forEach(star => star.classList.remove("hover"));
    updateStarDisplay(value, stars, "hover");
  }
});

document.getElementById("feedbackStars").addEventListener("mouseout", function() {
  const stars = this.querySelectorAll("span");
  stars.forEach(star => star.classList.remove("hover"));
});

document.getElementById("feedbackStars").addEventListener("click", function(event) {
  if (event.target.tagName === 'SPAN') {
    const value = parseInt(event.target.dataset.value);
    document.getElementById("selectedRating").value = value;
    const stars = this.querySelectorAll("span");

    stars.forEach(star => star.classList.remove("seleccionada"));
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

let tutoriaIdToDelete = null;

function openConfirmDeleteModal(id) {
  const t = tutorias.find(t => t.id === id);
  if (!t) return;

  // Restricción para Admin: no puede eliminar
  if (usuario === 'Admin') {
    alert("Los administradores no pueden eliminar tutorías directamente.");
    return;
  }

  tutoriaIdToDelete = id;
  openModal('confirmDeleteModal');
}

function confirmDeleteTutoria() {
  if (tutoriaIdToDelete !== null) {
    tutorias = tutorias.filter(t => t.id !== tutoriaIdToDelete);
    guardarTutorias();
    render();
    renderProfile();
    closeModal('confirmDeleteModal');
    tutoriaIdToDelete = null;
  }
}

let tutoriaToTerminateId = null;

function openConfirmTerminateModal(id) {
  const t = tutorias.find(t => t.id === id);
  if (!t) return;

  // Restricción para Admin: no puede terminar
  if (usuario === 'Admin') {
    alert("Los administradores no pueden terminar tutorías directamente.");
    return;
  }

  tutoriaToTerminateId = id;
  openModal('confirmTerminateModal');
}

function confirmTerminateTutoria() {
  if (tutoriaToTerminateId !== null) {
    const t = tutorias.find(t => t.id === tutoriaToTerminateId);
    if (!t) return;

    if (t.creador !== usuario) {
      alert("Solo el creador puede terminar esta tutoría.");
      closeModal('confirmTerminateModal');
      return;
    }

    if (t.estado === "terminada") {
      alert("Esta tutoría ya ha sido terminada.");
      closeModal('confirmTerminateModal');
      return;
    }

    t.estado = "terminada";
    guardarTutorias();
    render();
    renderProfile();
    closeModal('confirmTerminateModal');
    tutoriaToTerminateId = null;
  }
}

function openUserProfileModal(usernameToView) {
  const userProfileName = document.getElementById("userProfileName");
  const userProfileAvgRating = document.getElementById("userProfileAvgRating");
  const userProfileTutoriasList = document.getElementById("userProfileTutoriasList");

  userProfileName.textContent = `Perfil de ${usernameToView}`;
  userProfileTutoriasList.innerHTML = "";

  const tutoriasDelUsuario = tutorias.filter(t => t.creador === usernameToView);

  if (tutoriasDelUsuario.length === 0) {
    userProfileAvgRating.textContent = "Este usuario aún no ha creado tutorías.";
    userProfileTutoriasList.innerHTML = "<p>No hay tutorías para mostrar.</p>";
    openModal('userProfileModal');
    return;
  }

  let totalCalificaciones = 0;
  let numTutoriasConCalificaciones = 0;

  const tutoriasOrdenadas = [...tutoriasDelUsuario].sort((a, b) => {
    if (a.estado === "activa" && b.estado === "terminada") return -1;
    if (a.estado === "terminada" && b.estado === "activa") return 1;
    return 0;
  });


  tutoriasOrdenadas.forEach(t => {
    const promedioTutoria =
      t.calificaciones.length > 0
        ? (
          t.calificaciones.reduce((sum, c) => sum + c.valor, 0) /
          t.calificaciones.length
        )
        : null;

    if (promedioTutoria !== null) {
      totalCalificaciones += promedioTutoria;
      numTutoriasConCalificaciones++;
    }

    const li = document.createElement("li");
    li.classList.add('tutoria-item');
    li.innerHTML = `
      <strong>${t.tema}</strong> - ${t.fecha} (${t.estado === "terminada" ? "Terminada" : "Activa"})<br>
      Calificación: ${promedioTutoria !== null ? promedioTutoria.toFixed(1) + ' ⭐' : 'Sin calificar'}
    `;
    userProfileTutoriasList.appendChild(li);
  });

  const promedioGeneral = numTutoriasConCalificaciones > 0 ? (totalCalificaciones / numTutoriasConCalificaciones).toFixed(1) : "Sin calificar";
  userProfileAvgRating.textContent = `Calificación promedio general: ${promedioGeneral} ⭐`;

  openModal('userProfileModal');
}

function render() {
  const lista = document.getElementById("listaTutorias");
  lista.innerHTML = "";

  // Determinar qué tutorías mostrar (todas para Admin, solo activas para otros)
  let tutoriasToShow;
  if (usuario === 'Admin') {
    tutoriasToShow = [...tutorias]; // Copia de todas las tutorías
  } else {
    tutoriasToShow = [...tutorias.filter(t => t.estado === "activa")]; // Copia de solo las tutorías activas
  }

  // Ordenar tutorías de más reciente a más antigua (por ID de creación)
  tutoriasToShow.sort((a, b) => b.id - a.id);

  if (tutoriasToShow.length === 0) {
    lista.innerHTML = "<p>No hay tutorías disponibles en este momento.</p>";
    return;
  }

  tutoriasToShow.forEach(t => {
    const promedio =
      t.calificaciones.length > 0
        ? (
          t.calificaciones.reduce((sum, c) => sum + c.valor, 0) /
          t.calificaciones.length
        ).toFixed(1)
        : "Sin calificar";

    // Construir HTML para mostrar detalles de feedback para el Admin
    let feedbackDetailsHtml = '';
    if (usuario === 'Admin' && t.calificaciones.length > 0) {
        feedbackDetailsHtml += `<div class="admin-feedback-details" style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;">
                                    <h4>Comentarios de Participantes:</h4>`;
        t.calificaciones.forEach(c => {
            feedbackDetailsHtml += `<p><strong>${c.usuario}:</strong> ${c.valor} ⭐ - <em>${c.comentario || 'Sin comentario'}</em></p>`;
        });
        feedbackDetailsHtml += `</div>`;
    }

    // Determinar qué botones de acción de usuario mostrar (Unirse/Salirse/Calificar)
    let userActionButtons = '';
    if (usuario !== 'Admin' && t.creador !== usuario) { // Si NO es Admin y NO es el creador
        if (t.participantes.includes(usuario)) { // Si el usuario ya está unido
            userActionButtons += `<button onclick="salirse(${t.id})" class="leave-button">Salirse</button>`;
            // Show feedback button ONLY if tutorial is 'terminada'
            if (t.estado === "terminada") {
              userActionButtons += `<button onclick="openFeedbackModal(${t.id})" class="feedback-button">Calificar/Feedback</button>`;
            }
        } else if (t.estado === "activa") { // If the user has not joined and the tutorial is active
            userActionButtons += `<button onclick="unirse(${t.id})" class="join-button">Unirse</button>`;
        }
    }


    const li = document.createElement("li");
    li.classList.add('tutoria-item');
    li.innerHTML = `
      <strong>${t.tema}</strong> - ${t.fecha} de ${t.inicio} a ${t.fin} (${t.estado === "terminada" ? "Terminada" : "Activa"})<br>
      <em>${t.desc}</em><br>
      Creador: <span class="creator-name" onclick="openUserProfileModal('${t.creador}')">${t.creador}</span><br>
      Participantes: ${t.participantes.join(", ") || "ninguno"}<br>
      Calificación: ${promedio} ⭐<br>
      ${feedbackDetailsHtml} ${usuario !== 'Admin' // Solo muestra los botones de acción si NO es Admin
        ? `
          <div class="tutoria-actions">
            ${t.creador === usuario
              ? `<button onclick="openEditModal(${t.id})" class="edit-button">Editar</button>
                 <button onclick="openConfirmTerminateModal(${t.id})" class="terminate-button">Terminar Tutoría</button>
                 <button onclick="openConfirmDeleteModal(${t.id})" class="delete-button">Borrar</button>`
              : ''
            }
            ${userActionButtons}
          </div>`
        : '' // Si es Admin, no se muestran botones de acción
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

  // Lógica específica para el Administrador en su perfil
  if (usuario === 'Admin') {
    misTutoriasCreadasLista.innerHTML = "<p>El administrador no crea ni gestiona tutorías personales en esta sección.</p>";
    misTutoriasParticipoLista.innerHTML = "<p>El administrador no participa en tutorías.</p>";
    return; // Salir de la función ya que la lógica de perfil normal no aplica al Admin
  }

  // Lógica para usuarios normales
  const tutoriasCreadas = tutorias.filter(t => t.creador === usuario);
  const tutoriasParticipo = tutorias.filter(t => t.participantes.includes(usuario) && t.creador !== usuario);

  const tutoriasActivasCreadas = tutoriasCreadas.filter(t => t.estado === "activa");
  const tutoriasTerminadasCreadas = tutoriasCreadas.filter(t => t.estado === "terminada");
  const tutoriasCreadasOrdenadas = [...tutoriasActivasCreadas, ...tutoriasTerminadasCreadas];


  if (tutoriasCreadasOrdenadas.length === 0) {
    misTutoriasCreadasLista.innerHTML = "<p>No has creado ninguna tutoría aún.</p>";
  } else {
    tutoriasCreadasOrdenadas.forEach(t => {
      const promedio =
        t.calificaciones.length > 0
          ? (
            t.calificaciones.reduce((sum, c) => sum + c.valor, 0) /
            t.calificaciones.length
          ).toFixed(1)
          : "Sin calificar";

      let feedbackDetallado = "";

      const li = document.createElement("li");
      li.classList.add('tutoria-item');
      li.innerHTML = `
        <strong>${t.tema}</strong> - ${t.fecha} de ${t.inicio} a ${t.fin} (${t.estado === "terminada" ? "Terminada" : "Activa"})<br>
        <em>${t.desc}</em><br>
        Participantes: ${t.participantes.join(", ") || "ninguno"}<br>
        Calificación Promedio: ${promedio} ⭐
        ${feedbackDetallado}
        <div class="tutoria-actions">
          ${t.estado === "activa" ? `<button onclick="openEditModal(${t.id})" class="edit-button">Editar</button>` : ''}
          ${t.estado === "activa" ? `<button onclick="openConfirmTerminateModal(${t.id})" class="terminate-button">Terminar Tutoría</button>` : ''}
          ${t.estado === "activa" ? `<button onclick="openConfirmDeleteModal(${t.id})" class="delete-button">Borrar</button>` : ''}
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

      let feedbackButtonHtml = '';
      // Show "Modificar Feedback" button ONLY if tutorial is 'terminada'
      if (t.estado === "terminada") {
          feedbackButtonHtml = `<button onclick="openFeedbackModal(${t.id})" class="feedback-button">Modificar Feedback</button>`;
      }

      const li = document.createElement("li");
      li.classList.add('tutoria-item');
      li.innerHTML = `
        <strong>${t.tema}</strong> - ${t.fecha} de ${t.inicio} a ${t.fin} (${t.estado === "terminada" ? "Terminada" : "Activa"})<br>
        <em>${t.desc}</em><br>
        Creador: <span class="creator-name" onclick="openUserProfileModal('${t.creador}')">${t.creador}</span><br>
        Tu calificación: ${miCalificacion}${miComentario}<br>
        <div class="tutoria-actions">
          ${feedbackButtonHtml}
        </div>
      `;
      misTutoriasParticipoLista.appendChild(li);
    });
  }
}
