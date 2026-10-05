# Backend y conexión con el frontend

Backend Express + TypeScript, sin base de datos. Usuarios, hashes de contraseña, sesiones y operaciones viven en la memoria del proceso. El frontend conserva perfil, sesión, saldo y respuestas ficticias de SnailPay en LocalStorage. No guarda contraseñas.

## Ejecutar

Requiere Node.js 22.12 o posterior y npm. Abre dos terminales:

Desde la raíz del proyecto (la carpeta que contiene backend y frontend), abre dos terminales:

1. En `backend`: ejecuta `npm install`, copia `.env.example` como `.env` si todavía no existe y ejecuta `npm run dev` (puerto 3000).
2. En `frontend`: ejecuta `npm install`, copia `.env.example` como `.env` si todavía no existe y ejecuta `npm run dev` (normalmente puerto 5173).

En PowerShell puedes copiar el ejemplo con `Copy-Item .env.example .env` desde cada carpeta. No sobrescribas un `.env` que ya hayas configurado. Abre la URL que imprime Vite; si 5173 está ocupado usará otro puerto. Consulta también [el README del frontend](../frontend/README.md).

Vite redirige `/api` a `http://localhost:3000`, incluso si el puerto del frontend cambia. Para otro servidor define `VITE_API_URL` antes de compilar el frontend; Express acepta `FRONTEND_ORIGIN` para CORS y `PORT` para cambiar su puerto. Si cambias el puerto del backend, ajusta también el proxy en vite.config.ts.

El backend se ejecuta desde `src/server.ts` con `npm start` (tsx), o `npm run dev` para reiniciar al editar. `npm run typecheck` y `npm run build` sólo verifican los tipos, sin generar JavaScript ni dist. Instala también las dependencias de desarrollo (tsx y TypeScript). En frontend, `npm run build` sí genera los archivos del sitio. El servidor estático que sirva el frontend compilado debe reenviar `/api` a Express, o debes compilar con `VITE_API_URL` apuntando al backend y configurar `FRONTEND_ORIGIN`. `vite preview` no sustituye esa configuración de producción.

## Estructura actual

```text
backend/
  src/           Código TypeScript de Express
  tests/         Pruebas del API
  .env.example   Configuración de ejemplo
frontend/
  src/           Componentes, páginas y servicios React
  .env.example   Configuración de ejemplo
```

## Probar SnailPay

Registra una cuenta con nombre, correo válido y contraseña de 8 a 128 caracteres. Inicia sesión y abre Recargar. Los botones de ejemplo rellenan los datos ficticios. Usa cualquier nombre no vacío y un monto de $0.01 a $100,000 con máximo dos decimales.

| Resultado | Tarjeta ficticia | Vencimiento | CVV | HTTP |
| --- | --- | --- | --- | --- |
| Aprobado | 1234123412341234 | 12/26 | 543 | 200 |
| Rechazado | 4000400040004000 | 12/26 | 543 | 422 |
| Error interno | 5000500050005000 | 12/26 | 543 | 503 |

Otras tarjetas o credenciales de tarjeta también se rechazan. Los campos inválidos producen rechazo con detalle legible. Un pagador que no coincide con la sesión produce 403. Sólo un pago aprobado modifica el saldo.

Para simular indisponibilidad global en PowerShell: `$env:SNAILPAY_SYSTEM_ERROR='true'` y luego `npm run dev`. Para desactivarla: detén ese servidor, ejecuta `Remove-Item Env:SNAILPAY_SYSTEM_ERROR` y vuelve a iniciarlo. Reiniciar también borra la caché.

Cada respuesta de pago contiene `id`, `status` (approved/rejected/error), `status_detail`, `transaction_amount`, `date_created` (ISO), `authorization_code` (sólo aprobado), `reference`, `payer_id`, `payer_email`, `card_number`, `cvv` y `balance`. El número y CVV son ficticios. En una solicitud inválida sin monto numérico, transaction_amount es null. No uses información bancaria real.

## Rutas y responsabilidades

- `POST /api/auth/register`: valida y registra un usuario con saldo cero; scrypt con sal protege la contraseña.
- `POST /api/auth/login`: verifica contraseña y entrega un token aleatorio válido por 24 horas.
- `GET /api/auth/me`: verifica token y devuelve perfil/saldo actuales.
- `POST /api/auth/logout`: invalida el token.
- `GET /api/dashboard`: seis caracoles y seis carreras aleatorias de un día simulado generadas una sola vez al arrancar Express. Cada carrera tiene una apuesta ficticia; ganadas y perdidas se calculan comparando la selección con el ganador. Las victorias suman seis. El frontend muestra el número de victorias del líder (incluyendo empates) y las últimas seis carreras. Consultar el API no cambia la simulación; reiniciar el backend genera otra.
- `POST /api/snailpay/charges`: recibe card_number, expiration_date, cvv, full_name, transaction_amount, payer_id y payer_email; exige `Idempotency-Key`.
- `GET /api/health`: comprueba disponibilidad.

Las rutas protegidas requieren `Authorization: Bearer <token>`. El frontend añade este encabezado automáticamente. Reutilizar una referencia con el mismo cuerpo devuelve la operación anterior sin sumar otra vez. Reutilizarla con otro cuerpo produce 409. El loader cubre SnailPay durante al menos tres segundos, bloquea nuevas operaciones y, al terminar, vacía todos los campos sin borrar el mensaje de resultado. Ante timeout o pérdida de conexión se conserva la operación original en memoria: utiliza el botón **Reintentar transacción pendiente** para consultar su resultado con la misma referencia y los mismos datos.

`src/data` contiene la caché, `src/services` las reglas y `src/controllers`/`src/routes` el transporte HTTP. `src/app.ts` conecta las rutas y traduce errores. Hay comentarios en los puntos de validación, sesión, hash, saldo e idempotencia. En frontend, `services/api.ts` centraliza peticiones y timeout de diez segundos; `services/snailpay.service.ts` guarda los últimos 50 resultados por usuario.

## Verificación

En backend: `npm test` ejecuta nueve pruebas del API con un servidor temporal real. Cubren validación, correo duplicado, hash privado, login/logout/expiración, rutas protegidas, coherencia de estadísticas, aprobación, contrato de pago, idempotencia, errores sin modificar saldo y aritmética en centavos.

En frontend: `npm run build` y `npm run lint`. También se verificó con navegador automatizado el flujo de registro, login, tres resultados de pago, LocalStorage, recarga de página, logout y nuevo login.

## Límites de la simulación

Recargar la página conserva la sesión y el saldo mientras Express siga ejecutándose. Reiniciar Express elimina usuarios, sesiones, saldo y referencias del servidor; los datos del navegador no restauran la caché. Al detectar el token inválido se solicita iniciar sesión y hay que registrar de nuevo el usuario. Una sesión dura 24 horas. LocalStorage contiene un perfil de consulta, no una fuente de saldo confiable para el backend.

La referencia pendiente vive en el formulario: ante un problema de conexión, utiliza **Reintentar transacción pendiente** antes de recargar la página o salir del dashboard. No hay cobros reales ni lógica para ejecutar apuestas o carreras. La caché está pensada para un único proceso local y no tiene limpieza periódica ni persistencia entre reinicios.


## Variables de entorno

Copia .env.example como .env. Los comandos npm start y npm run dev cargan .env automáticamente mediante Node.js. Reinicia Express después de cambiarlo. PORT configura el puerto, FRONTEND_ORIGIN el origen permitido y SNAILPAY_SYSTEM_ERROR activa el error global con true. Los archivos .env están excluidos de Git y .env.example sí se puede versionar.


## Propuesta de base de datos

[database/schema.sql](database/schema.sql) contiene una propuesta PostgreSQL para usuarios, sesiones, caracoles, carreras reales, participantes con sus puestos finales, apuestas y pagos. Incluye el catálogo inicial de seis caracoles. Esta propuesta no está conectada a Express: la aplicación sigue usando memoria.

El SQL está pensado para ejecutarse una sola vez en una base vacía, con PostgreSQL 13 o posterior. No se ha ejecutado contra una instancia PostgreSQL en este workspace. Las validaciones entre registros (cierre de carreras, puestos completos, apuestas antes del inicio) y las actualizaciones transaccionales del saldo requieren implementación en el backend. El diseño de puestos supone que no existen empates.

