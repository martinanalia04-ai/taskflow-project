// Selección de elementos
const formTarea = document.getElementById('form-tarea');
const inputTarea = document.getElementById('input-tarea');
const listaTareas = document.getElementById('lista-tareas');

// Tareas iniciales
let tareas = JSON.parse(localStorage.getItem('tareas')) || [
  "Crear archivo index.html con header, main, aside y section",
  "Definir variables CSS en :root para colores, fuentes y espaciados",
  "Maquetar lista de tareas con display: flex",
  "Agregar Media Queries para que la app sea responsive",
  "Crear app.js para añadir y borrar tareas",
  "Guardar tareas en LocalStorage",
  "Cargar tareas guardadas al iniciar la app"
];

// Guardar tareas iniciales si es la primera vez
guardarTareas();

// Función para renderizar tareas
function renderTareas() {
  listaTareas.innerHTML = '';
  tareas.forEach((tarea, index) => {
    const divTarea = document.createElement('div');
    divTarea.className = 'tarea';
    divTarea.innerHTML = `
      <span>${tarea}</span>
      <button class="borrar">Eliminar</button>
    `;
    divTarea.querySelector('.borrar').addEventListener('click', () => {
      tareas.splice(index, 1);
      guardarTareas();
      renderTareas();
    });
    listaTareas.appendChild(divTarea);
  });
}

// Función para guardar tareas en LocalStorage
function guardarTareas() {
  localStorage.setItem('tareas', JSON.stringify(tareas));
}

// Evento de añadir tarea
formTarea.addEventListener('submit', (e) => {
  e.preventDefault();
  const texto = inputTarea.value.trim();
  if (texto) {
    tareas.push(texto);
    guardarTareas();
    renderTareas();
    inputTarea.value = '';
  }
});

// Render inicial
renderTareas();