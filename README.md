📱 Alke Wallet – Billetera Digital

Proyecto frontend desarrollado como trabajo práctico para el módulo Fundamentos del Desarrollo Frontend, enfocado en el uso de HTML, CSS, JavaScript, jQuery y Bootstrap.

La aplicación simula una billetera digital básica, permitiendo iniciar sesión, visualizar saldo, realizar depósitos, enviar dinero a contactos y consultar los últimos movimientos, con persistencia de datos mediante Local Storage.

🚀 Demo online (GitHub Pages)

🔗 https://belzambrano.github.io/Alke-Wallet/

🔐 Credenciales de prueba

Email: usuario@alkewallet.com

Contraseña: 123456

🧩 Funcionalidades principales
✅ Inicio de sesión

Validación de credenciales con jQuery

Manejo del envío del formulario con $('#loginForm').submit()

Mensajes de error y éxito utilizando alertas Bootstrap

✅ Menú principal

Visualización del saldo actual

Botones para:

Depositar dinero

Enviar dinero

Ver últimos movimientos

Mensaje animado con jQuery (fadeIn / fadeOut) antes de redirigir a cada sección

✅ Depósito de dinero

Visualización del saldo actual antes de depositar

Validación del monto ingresado

Alerta de éxito creada dinámicamente con jQuery + Bootstrap

Leyenda con el monto depositado

Redirección automática al menú tras un breve retraso

✅ Envío de dinero

Agenda de contactos guardada en Local Storage

Búsqueda dinámica de contactos escribiendo iniciales (sugerencias)

Selección de un único contacto mediante identificador id

Validación de monto y saldo disponible

Confirmación visual del envío realizado

✅ Últimos movimientos

Listado dinámico de transacciones reales (depósitos y envíos)

Filtro por tipo de movimiento utilizando jQuery

Renderizado dinámico del historial desde Local Storage

🛠️ Tecnologías utilizadas

HTML5

CSS3

JavaScript (ES6)

jQuery

Bootstrap 5

Local Storage

GitHub Pages

📂 Estructura del proyecto
/
├─ index.html
├─ login.html
├─ menu.html
├─ deposit.html
├─ sendmoney.html
├─ transactions.html
├─ css/
│   └─ styles.css
├─ js/
│   └─ main.js
└─ img/
    ├─ index-wallet.jpg
    └─ login-people.jpg

🎯 Objetivo del proyecto

Aplicar los conceptos vistos en clase sobre:

Manipulación del DOM con jQuery

Manejo de eventos

Validaciones de formularios

Animaciones y feedback visual

Persistencia de datos en el navegador

Uso de Bootstrap para diseño responsive

👩‍💻 Autora

Bel Zambrano
Proyecto académico – Programa SENCE

📌 Notas finales

Este proyecto es una simulación educativa, no representa una billetera real ni maneja información sensible.
