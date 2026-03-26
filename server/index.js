const express = require('express');
const cors = require('cors'); // Para que no me tire error de CORS en el navegador al hacer fetch
const app = express();

app.use(cors());
app.use(express.json()); // Necesario para poder leer el req.body en el POST

// Por ahora guardo las tareas en este array temporal (en el futuro irá una BBDD real)
let tareasDB = [];

// GET: Mando todas las tareas al frontend
app.get('/api/tareas', async (req, res) => {
    try {
        // Le pongo un retraso de 1 seg para que el profe pueda ver el mensaje de carga asíncrono
        await new Promise(resolve => setTimeout(resolve, 1000));
        res.status(200).json({ success: true, data: tareasDB });
    } catch (error) {
        console.error("Fallo al pedir las tareas:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
});

// POST: Recibo una tarea nueva y la guardo
app.post('/api/tareas', async (req, res) => {
    try {
        const nuevaTarea = req.body;
        
        // Verifico que no me manden un objeto vacío
        if (!nuevaTarea || !nuevaTarea.title) {
            return res.status(400).json({ success: false, message: "Faltan datos de la tarea" });
        }
        
        tareasDB.unshift(nuevaTarea); // La meto al principio del array
        res.status(201).json({ success: true, data: nuevaTarea });
    } catch (error) {
        console.error("Fallo al guardar la tarea:", error);
        res.status(500).json({ success: false, message: "Error al guardar la tarea" });
    }
});

// Dejo el puerto preparado para Vercel o el 3000 para probar en local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Exporto la app para que Vercel la pueda levantar bien
module.exports = app;