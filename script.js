let usuario = "";
let tutorias = JSON.parse(localStorage.getItem("tutorias")) || [];
tutorias.forEach(t => {
  if (!Array.isArray(t.calificaciones)) {
    t.calificaciones = [];
  }
});
let usuariosConectados = [];

function login() {
  const nombre = document.getElementById("username").value.trim();
  if (!nombre) return alert("Ingresa tu nombre");
  if (usuariosConectados.includes(nombre)) return alert("Ese nombre ya está en uso");
  usuario = nombre;
  usuariosConectados.push(nombre);

  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("userDisplay").innerText = usuario;
  render();
}

function logout() {
  location.reload();
}

function guardarTutorias() {
  localStorage.setItem("tutorias", JSON.stringify(tutorias));
}

function toggleFormulario() {
  const form = document.getElementById("formularioTutorias");
  form.style.display = form.style.display === "none" ? "block" : "none";
}


function unirse(id) {
  const t = tutorias.find(t => t.id === id);
  if (!t) return;
  if (t.participantes.includes(usuario)) return alert("Ya estás unido");
  t.participantes.push(usuario);
  guardarTutorias();
  render();
}

function borrar(id) {
  tutorias = tutorias.filter(t => t.id !== id);
  guardarTutorias();
  render();
}

function editar(id) {
  const t = tutorias.find(t => t.id === id);
  if (!t) return;

  const nuevoTema = prompt("Nuevo tema:", t.tema);
  const nuevaFecha = prompt("Nueva fecha (yyyy-mm-dd):", t.fecha);
  const nuevoInicio = prompt("Hora inicio (hh:mm):", t.inicio);
  const nuevoFin = prompt("Hora fin (hh:mm):", t.fin);
  const nuevaDesc = prompt("Nueva descripción:", t.desc);

  if (nuevoTema && nuevaFecha && nuevoInicio && nuevoFin && nuevaDesc) {
    t.tema = nuevoTema;
    t.fecha = nuevaFecha;
    t.inicio = nuevoInicio;
    t.fin = nuevoFin;
    t.desc = nuevaDesc;
    guardarTutorias();
    render();
  }
}

function calificar(id, valor) {
  const t = tutorias.find(t => t.id === id);
  if (!t || t.creador === usuario) return;

  // evitar calificaciones duplicadas
  t.calificaciones = t.calificaciones.filter(c => c.usuario !== usuario);
  t.calificaciones.push({ usuario, valor });

  guardarTutorias();
  render();
}

function render() {
  const lista = document.getElementById("listaTutorias");
  lista.innerHTML = "";

  tutorias.forEach(t => {
    const promedio =
      t.calificaciones.length > 0
        ? (
          t.calificaciones.reduce((sum, c) => sum + c.valor, 0) /
          t.calificaciones.length
        ).toFixed(1)
        : "Sin calificar";

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${t.tema}</strong> - ${t.fecha} de ${t.inicio} a ${t.fin}<br>
      <em>${t.desc}</em><br>
      Creador: ${t.creador}<br>
      Participantes: ${t.participantes.join(", ") || "ninguno"}<br>
      Calificación: ${promedio} ⭐<br>
      ${t.creador === usuario
        ? `<button onclick="editar(${t.id})">Editar</button>
             <button onclick="borrar(${t.id})">Borrar</button>`
        : `<button onclick="unirse(${t.id})">Unirse</button>
             <div class="estrellas">
               ${[1, 2, 3, 4, 5]
          .map(n => `<span onclick="calificar(${t.id}, ${n})">★</span>`)
          .join("")}
             </div>`
      }
    `;
    lista.appendChild(li);

    // marcar estrellas seleccionadas si ya calificó
    const estrellitas = li.querySelectorAll(".estrellas span");
    const calificacionUsuario = t.calificaciones.find(c => c.usuario === usuario);
    if (calificacionUsuario) {
      for (let i = 0; i < calificacionUsuario.valor; i++) {
        estrellitas[i].classList.add("seleccionada");
      }
    }
  });
}
function crearTutoria() {
  console.log("crearTutoria ejecutada");
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

  // limpiar formulario
  document.getElementById("subject").value = "";
  document.getElementById("date").value = "";
  document.getElementById("startTime").value = "";
  document.getElementById("endTime").value = "";
  document.getElementById("desc").value = "";

  // contraer formulario
  document.getElementById("formularioTutorias").style.display = "none";
}