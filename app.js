const form = document.getElementById('form-tarea');
const input = document.getElementById('input-tarea');
const selectCat = document.getElementById('select-categoria');
const lista = document.getElementById('lista-tareas');
const totalTxt = document.getElementById('total');
const porcentajeTxt = document.getElementById('porcentaje-txt');
const barra = document.getElementById('progreso-bar');
const btnDark = document.getElementById('dark-mode-toggle');
const buscador = document.getElementById('buscador');

// Ahora arranca vacío y se llena con lo que devuelve el backend
let tareas = [];
let fEstado = 'todas';
let fCat = 'Todas';

// --- Lógica del Modo Oscuro ---
const actualizarIcono = () => {
    btnDark.innerText = document.documentElement.classList.contains('dark') ? '☀️' : '🌙';
};

if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
}
actualizarIcono();

btnDark.onclick = () => {
    document.documentElement.classList.toggle('dark');
    const esOscuro = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', esOscuro ? 'dark' : 'light');
    actualizarIcono();
};

// --- Extra: Mensaje de espera mientras el server responde ---
const mostrarCargando = (cargando) => {
    if (cargando) {
        lista.innerHTML = `
            <div class="flex justify-center items-center p-10">
                <div class="text-center">
                    <span class="text-4xl animate-spin block mb-4">⏳</span>
                    <p class="text-mint-600 dark:text-mint-400 font-bold animate-pulse">
                        Cargando tareas del servidor...
                    </p>
                </div>
            </div>`;
    }
};

// --- Conexión con el Backend (API) ---

// Pido las tareas al server al cargar la página
const cargarTareasDesdeAPI = async () => {
    mostrarCargando(true); // Muestro el loader visual
    
    try {
        const response = await fetch('/api/tareas');
        const json = await response.json();
        
        if (json.success) {
            tareas = json.data;
            actualizarApp(); // Pinto las tareas
        }
    } catch (error) {
        console.error("Error al traer los datos:", error);
        lista.innerHTML = `<div class="p-6 text-center text-red-500 font-bold">Uy, no se pudo conectar con el servidor.</div>`;
    }
};

// Mando la tarea nueva al server
const guardarTareaAPI = async (nuevaTarea) => {
    try {
        const response = await fetch('/api/tareas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaTarea)
        });
        
        const json = await response.json();
        if (json.success) {
            tareas.unshift(json.data); // Agrego la tarea que me confirma el server
            actualizarApp();
        }
    } catch (error) {
        console.error("Error al hacer el POST:", error);
        alert("No se pudo guardar la tarea en el servidor");
    }
};

// --- Renderizado y Filtros ---
function actualizarApp() {
    const busq = buscador.value.toLowerCase();
    
    const filtradas = tareas.filter(t => {
        const cBusq = t.title.toLowerCase().includes(busq);
        const cEstado = fEstado === 'todas' || (fEstado === 'pendientes' ? !t.completed : t.completed);
        const cCat = fCat === 'Todas' || t.category === fCat;
        return cBusq && cEstado && cCat;
    });

    lista.innerHTML = '';
    filtradas.forEach(t => {
        const item = document.createElement('div');
        const estadoClase = t.completed ? 'tarea-completada shadow-none' : 'shadow-md shadow-mint-900/5';
        
        item.className = `flex justify-between items-start p-6 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all ${estadoClase}`;
        
        item.innerHTML = `
            <div class="flex items-start gap-5 w-full">
                <input type="checkbox" ${t.completed ? 'checked' : ''} class="w-6 h-6 accent-mint-500 cursor-pointer mt-1 flex-shrink-0">
                <div class="flex flex-col flex-1">
                    <span class="titulo-txt text-xl font-bold dark:text-slate-100 tracking-tight leading-tight break-words">${t.title}</span>
                    <span class="text-[9px] font-black uppercase tracking-widest text-mint-600 dark:text-mint-400 bg-mint-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 px-3 py-1 rounded-full mt-3 w-fit">${t.category}</span>
                </div>
            </div>
            <button class="text-gray-200 dark:text-slate-700 hover:text-red-500 transition-colors p-2 ml-4 flex-shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>`;
        
        // Eventos de los botones de cada tarea
        item.querySelector('input').onchange = () => { t.completed = !t.completed; actualizarApp(); };
        item.querySelector('button').onclick = () => { if(confirm('¿Eliminar?')) { tareas = tareas.filter(o => o.id !== t.id); actualizarApp(); } };
        lista.appendChild(item);
    });

    // Actualizo los contadores de la derecha
    const total = tareas.length;
    const hechas = tareas.filter(x => x.completed).length;
    const porc = total === 0 ? 0 : Math.round((hechas / total) * 100);
    
    totalTxt.innerText = total;
    porcentajeTxt.innerText = porc + '%';
    barra.style.width = porc + '%';
}

// Eventos globales
window.cambiarFiltro = (f) => { fEstado = f; actualizarApp(); };
window.cambiarFiltroCat = (c) => { fCat = c; actualizarApp(); };
window.marcarTodasCompletadas = () => { tareas.forEach(t => t.completed = true); actualizarApp(); };
window.borrarHechas = () => { if (confirm('¿Limpiar hechas?')) { tareas = tareas.filter(t => !t.completed); actualizarApp(); } };
window.eliminarTodo = () => { if (confirm('¿BORRAR TODO?')) { tareas = []; actualizarApp(); } };

// Al enviar el formulario, en vez de LocalStorage hago el POST a la API
form.onsubmit = (e) => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto) return;
    
    const nuevaTarea = { id: Date.now(), title: texto, category: selectCat.value, completed: false };
    guardarTareaAPI(nuevaTarea); // Petición POST al server
    
    input.value = '';
};

buscador.oninput = () => actualizarApp();

// Ejecuto la llamada a la API apenas carga el script
cargarTareasDesdeAPI();