$(document).ready(function() {

  /* ===============================
     UTILIDADES
  =============================== */

  function obtenerSaldo() {
    return Number(localStorage.getItem("saldo")) || 60000;
  }

  function guardarSaldo(saldo) {
    localStorage.setItem("saldo", saldo);
  }

  function obtenerMovimientos() {
    return JSON.parse(localStorage.getItem("movimientos")) || [];
  }

  function guardarMovimiento(tipo, monto) {
    const movimientos = obtenerMovimientos();
    movimientos.unshift({
      tipo,
      monto,
      fecha: new Date().toLocaleString("es-CL")
    });
    localStorage.setItem("movimientos", JSON.stringify(movimientos));
  }

  function mostrarAlerta(tipo, mensaje, contenedor = "#alert-container") {
    const alerta = $(`
      <div class="alert alert-${tipo} alert-dismissible fade show mt-2" role="alert">
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `);
    $(contenedor).append(alerta);
    // Opcional: autodesaparecer después de 3s
    setTimeout(() => alerta.alert('close'), 3000);
  }

  /* ===============================
     LOGIN
  =============================== */
  if ($("#loginForm").length) {
    $("#loginForm").submit(function(e) {
      e.preventDefault();

      const email = $("#email").val().trim();
      const password = $("#password").val().trim();

      if (!email || !password) {
        mostrarAlerta("warning", "Por favor completa todos los campos");
        return;
      }

      if (email === "admin@wallet.cl" && password === "1234") {
        localStorage.setItem("usuario", email);
        mostrarAlerta("success", "Inicio de sesión correcto, redirigiendo...");
        setTimeout(() => window.location.href = "menu.html", 1000);
      } else {
        mostrarAlerta("danger", "Credenciales incorrectas");
      }
    });
  }

  /* ===============================
     MENU PRINCIPAL
  =============================== */
  if ($("#saldo").length) {
    $("#saldo").text(`$${obtenerSaldo().toLocaleString("es-CL")}`);

    $("#btnDepositar").click(function() {
      mostrarAlerta("info", "Redirigiendo a depósito...");
      setTimeout(() => window.location.href = "deposit.html", 500);
    });

    $("#btnEnviar").click(function() {
      mostrarAlerta("info", "Redirigiendo a enviar dinero...");
      setTimeout(() => window.location.href = "sendmoney.html", 500);
    });

    $("#btnMovimientos").click(function() {
      mostrarAlerta("info", "Redirigiendo a últimos movimientos...");
      setTimeout(() => window.location.href = "transactions.html", 500);
    });
  }

  /* ===============================
     DEPOSITO
  =============================== */
  if ($("#depositForm").length) {
    $("#saldo").text(`$${obtenerSaldo().toLocaleString("es-CL")}`);

    $("#depositForm").submit(function(e) {
      e.preventDefault();

      const amount = Number($("#depositAmount").val());
      if (!amount || amount <= 0) {
        mostrarAlerta("warning", "Monto inválido");
        return;
      }

      const nuevoSaldo = obtenerSaldo() + amount;
      guardarSaldo(nuevoSaldo);
      guardarMovimiento("Depósito", amount);

      mostrarAlerta("success", `Depósito realizado: $${amount.toLocaleString("es-CL")}`);

      // Opcional: mostrar leyenda debajo del formulario
      if (!$("#deposit-msg").length) {
        $("#depositForm").after(`<p id="deposit-msg" class="text-success mt-2">Depositaste $${amount.toLocaleString("es-CL")}</p>`);
      } else {
        $("#deposit-msg").text(`Depositaste $${amount.toLocaleString("es-CL")}`);
      }

      setTimeout(() => window.location.href = "menu.html", 2000);
    });
  }

  /* ===============================
     ENVIAR DINERO
  =============================== */
  if ($("#sendForm").length) {

    // Inicializar contactos
    const contactos = JSON.parse(localStorage.getItem("contactos")) || [
      { id: 1, nombre: "Ana Pérez" },
      { id: 2, nombre: "Carlos Soto" },
      { id: 3, nombre: "María López" }
    ];

    const $contactSelect = $("#contactSelect");
    $contactSelect.empty();
    contactos.forEach(c => $contactSelect.append(`<option value="${c.nombre}">${c.nombre}</option>`));

    // Agregar nuevo contacto
    $("#btnNuevoContacto").click(function() {
      const nombre = prompt("Nombre del nuevo contacto");
      if (!nombre || nombre.trim() === "") return;

      contactos.push({ id: Date.now(), nombre: nombre.trim() });
      localStorage.setItem("contactos", JSON.stringify(contactos));
      $contactSelect.append(`<option value="${nombre.trim()}">${nombre.trim()}</option>`);
      $contactSelect.val(nombre.trim());
      mostrarAlerta("success", `Contacto ${nombre.trim()} agregado`);
    });

    // Enviar dinero
    $("#sendForm").submit(function(e) {
      e.preventDefault();

      const destinatario = $contactSelect.val();
      const monto = Number($("#sendAmount").val());
      const saldoActual = obtenerSaldo();

      if (!monto || monto <= 0) {
        mostrarAlerta("warning", "Monto inválido");
        return;
      }

      if (monto > saldoActual) {
        mostrarAlerta("danger", "Saldo insuficiente");
        return;
      }

      guardarSaldo(saldoActual - monto);
      guardarMovimiento(`Envío a ${destinatario}`, monto);

      mostrarAlerta("success", `Se envió $${monto.toLocaleString("es-CL")} a ${destinatario}`);
      setTimeout(() => window.location.href = "menu.html", 2000);
    });
  }

  /* ===============================
     TRANSACCIONES
  =============================== */
  if ($("#txList").length) {

    function mostrarMovimientos(filtro = "todos") {
      const movimientos = obtenerMovimientos();
      let filtrados = movimientos;

      if (filtro !== "todos") {
        filtrados = movimientos.filter(m => m.tipo.startsWith(filtro));
      }

      if (filtrados.length === 0) {
        $("#txList").html('<p class="text-center text-muted">Sin movimientos</p>');
        return;
      }

      const html = filtrados.map(m => `
        <div class="tx-item d-flex justify-content-between mb-2">
          <div>
            <strong>${m.tipo}</strong><br>
            <small>${m.fecha}</small>
          </div>
          <span>${m.tipo === "Depósito" ? "+" : "-"} $${m.monto.toLocaleString("es-CL")}</span>
        </div>
      `).join("");

      $("#txList").html(html);
      $("#saldoActual").text(`$${obtenerSaldo().toLocaleString("es-CL")}`);
    }

    // Mostrar todos los movimientos al cargar
    mostrarMovimientos();

    // Filtrar por tipo
    $("#tipoFiltro").change(function() {
      mostrarMovimientos($(this).val());
    });

    // Botón reset
    $("#btnReset").click(function() {
      if (confirm("¿Eliminar movimientos?")) {
        localStorage.removeItem("movimientos");
        mostrarMovimientos();
        mostrarAlerta("info", "Movimientos eliminados");
      }
    });
  }

});
