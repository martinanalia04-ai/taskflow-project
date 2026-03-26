// Detecta automáticamente si estás en local o en Vercel
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : '';
let tareas = [];
let fEstado = 'todas'; // Filtro de estado: todas, pendientes, completadas
let fCat = 'Todas';    // Filtro de categoría

window.cargarTareas = async () => {
    toggleLoading(true); 

    // ESTA LÍNEA ES EL TRUCO: Crea una pausa de 1.5 segundos
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    try {
        const res = await fetch(`${API_URL}/api/tareas`);
        const json = await res.json();
        tareas = json.data;
        window.render(); 
    } catch (e) {
        console.error("Error: ¿Prendiste el servidor?", e);
    } finally {
        toggleLoading(false); 
    }
};

// 2. Dibujar en pantalla (CON FILTROS ACTIVOS)
window.render = () => {
    const lista = document.getElementById('lista-tareas');
    const buscador = document.getElementById('buscador');
    if (!lista) return;

    // --- LÓGICA DE FILTRADO ---
    const textoBusqueda = buscador ? buscador.value.toLowerCase() : '';
    
    const tareasFiltradas = tareas.filter(t => {
        const coincideBusqueda = t.title.toLowerCase().includes(textoBusqueda);
        const coincideEstado = fEstado === 'todas' || (fEstado === 'pendientes' ? !t.completed : t.completed);
        const coincideCat = fCat === 'Todas' || t.category === fCat;
        return coincideBusqueda && coincideEstado && coincideCat;
    });

    lista.innerHTML = '';
    tareasFiltradas.forEach(t => {
        const div = document.createElement('div');
        div.className = `flex justify-between items-start p-6 rounded-2xl border border-gray-100 dark:border-slate-800 transition-all ${t.completed ? 'tarea-completada' : 'bg-white dark:bg-slate-900'}`;
        div.innerHTML = `
            <div class="flex items-start gap-5 w-full">
                <input type="checkbox" ${t.completed ? 'checked' : ''} class="w-6 h-6 cursor-pointer" onchange="window.toggleTarea(${t.id})">
                <div class="flex flex-col flex-1">
                    <span class="titulo-txt text-xl font-bold dark:text-slate-100">${t.title}</span>
                    <span class="text-[9px] font-black uppercase text-mint-600 dark:text-mint-400 mt-2">${t.category}</span>
                </div>
            </div>
            <button onclick="window.borrarTarea(${t.id})" class="hover:text-red-500 p-2 ml-4">🗑️</button>
        `;
        lista.appendChild(div);
    });

    // --- ACTUALIZAR BARRA Y CONTADORES ---
    const total = tareas.length;
    const hechas = tareas.filter(t => t.completed).length;
    const porcentaje = total === 0 ? 0 : Math.round((hechas / total) * 100);

    if(document.getElementById('total')) document.getElementById('total').innerText = total;
    if(document.getElementById('porcentaje-txt')) document.getElementById('porcentaje-txt').innerText = porcentaje + '%';
    if(document.getElementById('progreso-bar')) document.getElementById('progreso-bar').style.width = porcentaje + '%';
};

// 3. Funciones de Filtro (Llamadas desde el HTML)
window.cambiarFiltro = (estado) => {
    fEstado = estado;
    window.render();
};

window.cambiarFiltroCat = (categoria) => {
    fCat = categoria;
    window.render();
};

// 4. Acciones CRUD
const toggleLoading = (show) => {
    const loader = document.getElementById('loading-state');
    if (loader) loader.classList.toggle('hidden', !show);
};

window.borrarHechas = async () => {
    if (!confirm("¿Eliminar tareas completadas?")) return;
    const hechas = tareas.filter(t => t.completed);
    if (hechas.length === 0) return;

    toggleLoading(true); // Mostrar carga
    for (let t of hechas) {
        await fetch(`${API_URL}/api/tareas/${t.id}`, { method: 'DELETE' });
    }
    await window.cargarTareas();
    toggleLoading(false); // Ocultar carga
};

window.marcarTodasCompletadas = async () => {
    const pendientes = tareas.filter(t => !t.completed);
    if (pendientes.length === 0) return;

    toggleLoading(true);
    for (let t of pendientes) {
        await fetch(`${API_URL}/api/tareas/${t.id}`, { method: 'PATCH' });
    }
    await window.cargarTareas();
    toggleLoading(false);
};
window.toggleTarea = async (id) => {
    await fetch(`${API_URL}/api/tareas/${id}`, { method: 'PATCH' });
    window.cargarTareas();
};

window.borrarTarea = async (id) => {
    await fetch(`${API_URL}/api/tareas/${id}`, { method: 'DELETE' });
    window.cargarTareas();
};
window.eliminarTodo = async () => {
    if (!confirm("⚠️ ¿Borrar ABSOLUTAMENTE TODO?")) return;
    for (let t of tareas) {
        await fetch(`${API_URL}/api/tareas/${t.id}`, { method: 'DELETE' });
    }
    window.cargarTareas();
};

// 5. Eventos de Formulario y Buscador
const form = document.getElementById('form-tarea');
if(form) {
    form.onsubmit = async (e) => {
        e.preventDefault();
        const titulo = document.getElementById('input-tarea').value;
        const cat = document.getElementById('select-categoria').value;
        
        await fetch(`${API_URL}/api/tareas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: titulo, category: cat, completed: false })
        });
        
        document.getElementById('input-tarea').value = '';
        window.cargarTareas();
    };
}

const buscadorInput = document.getElementById('buscador');
if(buscadorInput) {
    buscadorInput.oninput = () => window.render();
}

// 6. Tema y carga inicial
document.getElementById('dark-mode-toggle').onclick = () => {
    document.documentElement.classList.toggle('dark');
};

window.cargarTareas();