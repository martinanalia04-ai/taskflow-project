⚙️ Documentación Técnica del Servidor (Backend)

Esta carpeta contiene la API REST construida con Node.js y Express para manejar las tareas de TaskFlow Mint. Se ha configurado para ser desplegada en Vercel como una función Serverless.

🛠️ Configuración y Debugging Exhaustivo

Para cumplir con los requisitos técnicos, toda la lógica de los endpoints está envuelta en bloques try...catch. Esto asegura un exhaustivo debug de errores: si algo falla, el servidor no se rompe, sino que imprime el error en la consola del servidor (console.error) y devuelve un código de estado HTTP adecuado (500 Internal Server Error o 400 Bad Request) al frontend.

Se ha integrado el middleware cors para evitar problemas de peticiones cruzadas (CORS policy) entre el cliente y el servidor.

📡 Endpoints de la API

La API maneja los datos (actualmente en un array temporal en memoria) a través de la ruta principal /api/tareas.

1. Obtener todas las tareas

Método: GET

Ruta: /api/tareas

Descripción: Devuelve la lista completa de tareas guardadas.

Detalle técnico (Punto extra): Se ha añadido un setTimeout asíncrono simulando un retraso en la red para que en el frontend se pueda apreciar el renderizado condicional de carga.

Respuesta de Éxito (200 OK):

{
  "success": true,
  "data": [
    { "id": 167890, "title": "Aprobar la tarea 3", "category": "Estudio", "completed": false }
  ]
}


2. Crear una nueva tarea

Método: POST

Ruta: /api/tareas

Body requerido (JSON):

{
  "id": 167895,
  "title": "Subir proyecto a Vercel",
  "category": "Estudio",
  "completed": false
}


Descripción: Recibe una nueva tarea desde el formulario y la guarda al principio de la base de datos temporal (unshift).

Validación: Si el frontend envía un body vacío o sin la propiedad title, el servidor captura el error y devuelve un 400 Bad Request indicando "Faltan datos de la tarea".

Respuesta de Éxito (201 Created):

{
  "success": true,
  "data": { "id": 167895, "title": "Subir proyecto a Vercel", "category": "Estudio", "completed": false }
}
