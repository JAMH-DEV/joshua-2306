# Frontend

React + TypeScript + Vite. Esta carpeta está al mismo nivel que `backend`. El frontend se conecta a Express mediante el proxy `/api` de `vite.config.ts`.

## Ejecutar

Requiere Node.js 22.12 o posterior y npm. Desde la raíz que contiene ambas carpetas, abre dos terminales.

Terminal del backend:

```powershell
cd backend
npm install
# Sólo si todavía no tienes .env:
Copy-Item .env.example .env
npm run dev
```

Terminal del frontend:

```powershell
cd frontend
npm install
# Sólo si todavía no tienes .env:
Copy-Item .env.example .env
npm run dev
```

Abre la URL que imprime Vite, normalmente http://localhost:5173. Si el puerto está ocupado, Vite elige otro. Registra una cuenta e inicia sesión. El backend escucha en http://localhost:3000.

## Comandos

- `npm run dev`: inicia Vite con actualización al editar.
- `npm run build`: verifica TypeScript y genera el sitio en `dist`.
- `npm run lint`: revisa el código con ESLint.
- `npm run preview`: permite previsualizar el sitio compilado.

La carpeta `dist` del frontend contiene el sitio generado. El backend ejecuta TypeScript desde `src` y no genera su propio `dist`.

## Funcionalidades

- Registro, login, logout y dashboard protegido por sesión.
- Perfil y saldo recibidos desde el backend y conservados en LocalStorage.
- Donut de apuestas ganadas/perdidas y barras de victorias de seis caracoles.
- Un día simulado de seis carreras por arranque del backend; el resumen muestra las seis carreras.
- Nombre del líder y cantidad de victorias, sin porcentajes en la gráfica de caracoles.
- SnailPay con ejemplos de aprobación, rechazo y error interno.
- Loader durante al menos tres segundos. Bloquea nuevas operaciones y limpia todos los campos al terminar, conservando el resultado.
- Reintento de una transacción pendiente después de un fallo de conexión, sin duplicar la recarga.

Los escenarios de SnailPay, pruebas del API, rutas y límites de la caché están documentados en [el README del backend](../backend/README.md).

## Variables de entorno

Copia `.env.example` como `.env` si todavía no existe. Vite lo carga automáticamente; reinicia el frontend después de modificarlo.

| Variable | Valor local | Uso |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | Prefijo del API; utiliza el proxy hacia localhost:3000. |

Las variables `VITE_` se incluyen en el navegador y no deben contener secretos. `.env` está excluido de Git; `.env.example` sí se versiona.

Si cambias el puerto del backend, ajusta el destino del proxy en `vite.config.ts`. Para alojar el frontend compilado, configura un proxy `/api` hacia Express o compila con `VITE_API_URL` apuntando al backend y configura `FRONTEND_ORIGIN` en Express para permitir el origen del sitio.

## Persistencia

Perfil, sesión, saldo y respuestas ficticias de pago se guardan en LocalStorage. El token se valida contra Express al abrir el dashboard. Reiniciar el backend borra su caché y requiere registrar nuevamente la cuenta. La operación pendiente se conserva sólo mientras el componente está montado: confirma su resultado antes de recargar la página o salir del dashboard.

