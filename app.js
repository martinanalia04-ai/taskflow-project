// ELEMENTOS
const form = document.getElementById('form-tarea');
const input = document.getElementById('input-tarea');
const lista = document.getElementById('lista-tareas');
const totalTxt = document.getElementById('total');
const hechasTxt = document.getElementById('completadas');
const faltanTxt = document.getElementById('pendientes');
const barra = document.getElementById('progreso-bar');
const btnDark = document.getElementById('dark-mode-toggle');
const buscador = document.getElementById('buscador');

// DATOS
let tareas = JSON.parse(localStorage.getItem('tareas')) || [];
let filtroActual = 'todas';

// MODO OSCURO
if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark');
btnDark.onclick = () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
};

// RENDERIZADO
function actualizarApp() {
    localStorage.setItem('tareas', JSON.stringify(tareas));
    const textoBusqueda = buscador.value.toLowerCase();
    
    const filtradas = tareas.filter(t => {
        const coincideBusqueda = t.title.toLowerCase().includes(textoBusqueda);
        if (filtroActual === 'pendientes') return coincideBusqueda && !t.completed;
        if (filtroActual === 'completadas') return coincideBusqueda && t.completed;
        return coincideBusqueda;
    });

    lista.innerHTML = '';
    if (filtradas.length === 0) {
        lista.innerHTML = `<div class="text-center p-10 text-gray-400 italic">No hay tareas aquí...</div>`;
    }

    filtradas.forEach((t) => {
        const item = document.createElement('div');
        const estadoClase = t.completed ? 'tarea-completada' : 'tarea-pendiente shadow-md';
        
        item.className = `flex justify-between items-center p-5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all ${estadoClase}`;
        item.innerHTML = `
            <div class="flex items-center gap-4">
                <input type="checkbox" ${t.completed ? 'checked' : ''} class="w-6 h-6 accent-mint-500 cursor-pointer rounded-lg border-2">
                <span class="text-lg font-semibold tracking-tight">${t.title}</span>
            </div>
            <button class="text-gray-300 hover:text-red-500 font-bold p-2 transition-colors">ELIMINAR</button>
        `;

        item.querySelector('input').onchange = () => { t.completed = !t.completed; actualizarApp(); };
        item.querySelector('button').onclick = () => { tareas = tareas.filter(orig => orig.id !== t.id); actualizarApp(); };
        lista.appendChild(item);
    });

    // ESTADÍSTICAS
    const total = tareas.length;
    const hechas = tareas.filter(x => x.completed).length;
    totalTxt.innerText = total;
    hechasTxt.innerText = hechas;
    faltanTxt.innerText = total - hechas;
    barra.style.width = (total === 0 ? 0 : (hechas / total) * 100) + '%';
}

// EVENTOS DE FILTRO Y FORMULARIO
form.onsubmit = (e) => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto) return;
    tareas.push({ id: Date.now(), title: texto, completed: false, createdAt: new Date().toISOString() });
    input.value = '';
    actualizarApp();
};

window.cambiarFiltro = (f) => { filtroActual = f; actualizarApp(); };
buscador.oninput = () => actualizarApp();

// FUNCIONES EXTRA (PASO 8)
window.marcarTodasCompletadas = () => {
    tareas.forEach(t => t.completed = true);
    actualizarApp();
};

window.borrarHechas = () => {
    if (confirm('¿Quieres eliminar las tareas completadas?')) {
        tareas = tareas.filter(t => !t.completed);
        actualizarApp();
    }
};

actualizarApp();