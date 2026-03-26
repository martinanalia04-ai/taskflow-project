const express = require('express');
const cors = require('cors');
const app = express();

// Habilitamos CORS para que el frontend pueda hablar con el backend
app.use(cors());
app.use(express.json());

// Base de datos temporal en memoria
let tareas = [
  { id: 1, title: '¡Servidor conectado! 🌿', category: 'General', completed: false }
];

// 1. Obtener tareas (Corresponde a window.cargarTareas en app.js)
app.get('/api/tareas', (req, res) => {
  res.json({ success: true, data: tareas });
});

// 2. Crear tarea (Corresponde a form.onsubmit en app.js)
app.post('/api/tareas', (req, res) => {
  const nueva = { ...req.body, id: Date.now() };
  tareas.push(nueva);
  res.status(201).json({ success: true, data: nueva });
});

// 3. Editar estado (Corresponde a window.toggleTarea y marcarTodas en app.js)
app.patch('/api/tareas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tareas.findIndex(t => t.id === id);
  if (index !== -1) {
    tareas[index].completed = !tareas[index].completed;
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

// 4. Borrar (Corresponde a window.borrarTarea y eliminarTodo en app.js)
app.delete('/api/tareas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  tareas = tareas.filter(t => t.id !== id);
  res.json({ success: true });
});

// Configuración para Vercel
module.exports = app;

// Inicio del servidor en local
if (process.env.NODE_ENV !== 'production') {
  const PORT = 3000;
  app.listen(PORT, () => console.log(`✅ Servidor en http://localhost:${PORT}`));
}