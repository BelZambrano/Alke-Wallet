$(document).ready(function () {

  /* =========================
     HELPERS + INIT
     ========================= */
  const formatMoney = (n) => `$ ${Number(n).toLocaleString("es-AR")}`;

  const getSaldo = () => {
    const raw = localStorage.getItem("saldo");
    if (raw === null) {
      localStorage.setItem("saldo", "100000");
      return 100000;
    }
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const setSaldo = (n) => localStorage.setItem("saldo", String(n));

  const getJSON = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  };

  const setJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  // Transactions init
  if (localStorage.getItem("transactions") === null) setJSON("transactions", []);

  const getTransactions = () => getJSON("transactions", []);

  const addTransaction = (type, amount) => {
    const txs = getTransactions();
    txs.push({ type, amount, date: new Date().toISOString() });
    setJSON("transactions", txs);
  };

  // Contacts init + migración si antes era array de strings
  if (localStorage.getItem("contacts") === null) {
    setJSON("contacts", [
      { name: "Juan Pérez", alias: "juan.mp", cbu: "2850590940090418135201" },
      { name: "María Gómez", alias: "maria.mp", cbu: "2850590940090418135202" },
      { name: "Carlos López", alias: "carlos.mp", cbu: "2850590940090418135203" },
      { name: "Ana Martínez", alias: "ana.mp", cbu: "2850590940090418135204" },
      { name: "Pedro Sánchez", alias: "pedro.mp", cbu: "2850590940090418135205" },
    ]);
  } else {
    // Migración simple si hay strings
    const c = getJSON("contacts", []);
    if (Array.isArray(c) && c.length && typeof c[0] === "string") {
      setJSON("contacts", c.map((name, i) => ({
        name,
        alias: `contacto${i + 1}.mp`,
        cbu: String(2850590940090418135200 + (i + 1)),
      })));
    }
  }

  const getContacts = () => getJSON("contacts", []);

  const normalize = (s) => String(s || "").trim().replace(/\s+/g, " ");

  /* =========================
     LOGIN (jQuery)
     ========================= */
  if ($("#loginForm").length) {
    $("#loginForm").on("submit", function (e) {
      e.preventDefault();

      const email = $("#email").val().trim();
      const password = $("#password").val().trim();

      $("#loginError").addClass("d-none");

      if (email === "usuario@alkewallet.com" && password === "123456") {
        localStorage.setItem("usuarioLogueado", email);
        window.location.href = "menu.html";
      } else {
        $("#loginError").removeClass("d-none");
      }
    });
  }

  /* =========================
     MENU: saldo + mensaje "redirigiendo..."
     ========================= */
  if ($("#saldo").length) {
    $("#saldo").text(formatMoney(getSaldo()));

    $(".menu-btn").off("click").on("click", function () {
      const target = $(this).data("target");
      const label = $(this).text().trim().toLowerCase();

      $("#menuMessage")
        .text(`Redirigiendo a ${label}...`)
        .removeClass("d-none")
        .fadeIn(400)
        .delay(600)
      .fadeOut(300);

      setTimeout(() => {
        window.location.href = target;
      }, 1200);
    });
  }

  /* =========================
     DEPOSIT: saldo actual + alerta dinámica + monto depositado + redirect 2s
     ========================= */
  if ($("#depositForm").length) {
    $("#saldoActual").text(formatMoney(getSaldo()));

    $("#depositForm").on("submit", function (e) {
      e.preventDefault();

      const amount = Number($("#depositAmount").val());

      $("#depositAmount").removeClass("is-invalid");

      if (!Number.isFinite(amount) || amount <= 0) {
        $("#depositAmount").addClass("is-invalid");
        return;
      }

      const saldoAntes = getSaldo();
      const saldoNuevo = saldoAntes + amount;

      setSaldo(saldoNuevo);
      addTransaction("Depósito", amount);

      $("#saldoActual").text(formatMoney(saldoNuevo));

     $("#alert-container")
  .hide()
  .html(`
    <div class="alert alert-success" role="alert">
      Depósito exitoso ✅
    </div>
  `)
  .fadeIn(300)
  .delay(800)
  .fadeOut(300);

$("#depositInfo")
  .hide()
  .text(`Monto depositado: ${formatMoney(amount)}`)
  .removeClass("d-none")
  .fadeIn(300)
  .delay(800)
  .fadeOut(300);

setTimeout(() => {
  window.location.href = "menu.html";
}, 1600);

    });
  }

/* =========================
   SEND MONEY: sugerencias al tipear + selección (FIX: data-id único)
   ========================= */
if ($("#sendMoneyForm").length) {
  let selectedContactId = null;

  const normalize = (s) => String(s || "").trim().replace(/\s+/g, " ");

  const getJSON = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  };
  const setJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  const formatMoney = (n) => `$ ${Number(n).toLocaleString("es-AR")}`;
  const getSaldo = () => Number(localStorage.getItem("saldo") || "100000");
  const setSaldo = (n) => localStorage.setItem("saldo", String(n));

  const getTransactions = () => getJSON("transactions", []);
  const addTransaction = (type, amount) => {
    const txs = getTransactions();
    txs.push({ type, amount, date: new Date().toISOString() });
    setJSON("transactions", txs);
  };

  // ---- CONTACTOS: id + name + alias (SIN CBU) ----
  const genId = () => `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  const sanitizeContacts = () => {
    let contacts = getJSON("contacts", []);

    // Si antes eran strings -> migrar a objetos
    if (Array.isArray(contacts) && contacts.length && typeof contacts[0] === "string") {
      contacts = contacts.map((name, i) => ({
        id: genId(),
        name: normalize(name),
        alias: `contacto${i + 1}.mp`
      }));
      setJSON("contacts", contacts);
      return contacts;
    }

    // Si son objetos, asegurar id único y campos válidos
    if (!Array.isArray(contacts)) contacts = [];

    const ids = new Set();
    contacts = contacts.map((c) => {
      let id = c?.id ? String(c.id) : genId();
      while (ids.has(id)) id = genId();
      ids.add(id);

      return {
        id,
        name: normalize(c?.name),
        alias: normalize(c?.alias).replace(/\s/g, ""),
      };
    });

    setJSON("contacts", contacts);
    return contacts;
  };

  const getContacts = () => sanitizeContacts();

  const suggestionsBox = $("#contactSuggestions");
  const selectedLabel = $("#selectedContactLabel");
  const sendBtn = $("#sendBtn");

  const renderSuggestions = (query) => {
    const q = normalize(query).toLowerCase();
    const contacts = getContacts();

    const filtered = !q
      ? contacts.slice(0, 8)
      : contacts
          .filter(c => c.name.toLowerCase().includes(q) || c.alias.toLowerCase().includes(q))
          .slice(0, 8);

    suggestionsBox.empty();

    if (!filtered.length) {
      suggestionsBox.addClass("d-none");
      return;
    }

    filtered.forEach((c) => {
      suggestionsBox.append(`
        <button type="button"
                class="list-group-item list-group-item-action"
                data-id="${c.id}">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="fw-semibold">${c.name}</div>
              <small class="text-muted">@${c.alias}</small>
            </div>
          </div>
        </button>
      `);
    });

    suggestionsBox.removeClass("d-none");
  };

  // Mostrar sugerencias al escribir (no autocompleta el input)
  $("#contactSearch").on("input focus", function () {
    renderSuggestions($(this).val());
  });

  // ✅ Selección: ahora marca SOLO el clickeado (id único)
  $("#contactSuggestions").on("click", ".list-group-item-action", function () {
    const id = String($(this).attr("data-id")); // ✅ SIEMPRE string

    // Visual: marcar sólo uno
    $("#contactSuggestions .list-group-item-action").removeClass("active");
    $(this).addClass("active");

    selectedContactId = id;

    const chosen = getContacts().find(c => c.id === selectedContactId) || null;

    selectedLabel
      .text(chosen ? `${chosen.name} (@${chosen.alias})` : "Ninguno")
      .removeClass("text-muted");

    sendBtn.removeClass("d-none");      // mostrar botón enviar (consigna)
    suggestionsBox.addClass("d-none");  // cerrar sugerencias
  });

  // Cerrar sugerencias al click afuera
  $(document).on("click", function (e) {
    const inside =
      $(e.target).closest("#contactSearch").length ||
      $(e.target).closest("#contactSuggestions").length;
    if (!inside) suggestionsBox.addClass("d-none");
  });

  // Mostrar/ocultar agregar contacto (consigna)
  $("#toggleAddContact").on("click", function () {
    $("#addContactPanel").toggleClass("d-none");
    $("#addContactAlert").empty();
    $("#addContactForm")[0].reset();
    $("#newContactName,#newContactAlias").removeClass("is-invalid");
  });

  $("#cancelAddContact").on("click", function () {
    $("#addContactPanel").addClass("d-none");
    $("#addContactAlert").empty();
  });

  // Validación + guardar contacto (nombre y alias)
  $("#addContactForm").on("submit", function (e) {
    e.preventDefault();

    const name = normalize($("#newContactName").val());
    const alias = normalize($("#newContactAlias").val()).replace(/\s/g, "");

    $("#newContactName,#newContactAlias").removeClass("is-invalid");
    $("#addContactAlert").empty();

    let ok = true;
    if (name.length < 3) { $("#newContactName").addClass("is-invalid"); ok = false; }
    if (alias.length < 3) { $("#newContactAlias").addClass("is-invalid"); ok = false; }
    if (!ok) return;

    const contacts = getContacts();
    const exists = contacts.some(c => c.alias.toLowerCase() === alias.toLowerCase());

    if (exists) {
      $("#addContactAlert").html(`<div class="alert alert-warning">Ese alias ya existe ⚠️</div>`);
      return;
    }

    contacts.push({ id: genId(), name, alias });
    setJSON("contacts", contacts);

    $("#addContactAlert").html(`<div class="alert alert-success">Contacto agregado ✅</div>`);
    renderSuggestions($("#contactSearch").val());

    setTimeout(() => $("#addContactPanel").addClass("d-none"), 900);
  });

  // Enviar dinero
  $("#sendMoneyForm").on("submit", function (e) {
    e.preventDefault();

    $("#sendAlert").empty();
    $("#sendAmount").removeClass("is-invalid");

    const chosen = getContacts().find(c => c.id === selectedContactId) || null;
    if (!chosen) {
      $("#sendAlert").html(`<div class="alert alert-warning">Seleccioná un contacto para enviar.</div>`);
      return;
    }

    const amount = Number($("#sendAmount").val());
    if (!Number.isFinite(amount) || amount <= 0) {
      $("#sendAmount").addClass("is-invalid");
      return;
    }

    const saldo = getSaldo();
    if (amount > saldo) {
      $("#sendAlert").html(`<div class="alert alert-danger">Saldo insuficiente ❌</div>`);
      return;
    }

    setSaldo(saldo - amount);
    addTransaction(`Envío a ${chosen.name}`, -amount);

    $("#sendAlert").html(`
      <div class="alert alert-success">
        Envío realizado ✅ a ${chosen.name} por ${formatMoney(amount)}
      </div>
    `);

    $("#sendMoneyForm")[0].reset();
    setTimeout(() => (window.location.href = "menu.html"), 1400);
  });
}



  /* =========================
     TRANSACTIONS: filtro jQuery + lista real
     ========================= */
  if ($("#transactionList").length) {
    const txs = getTransactions();

    const renderTx = (filtro) => {
      $("#transactionList").empty();

      const filtered = txs.filter((tx) => {
        if (filtro === "all") return true;
        if (filtro === "deposit") return tx.type === "Depósito";
        if (filtro === "send") return tx.type.startsWith("Envío");
        return true;
      });

      if (!filtered.length) {
        $("#transactionList").append(`
          <li class="list-group-item text-center text-muted">
            No hay movimientos para este filtro
          </li>
        `);
        return;
      }

      filtered.slice().reverse().forEach((tx) => {
        const isIngreso = tx.amount > 0;
        const clase = isIngreso ? "transaction-ingreso" : "transaction-egreso";
        const signo = isIngreso ? "+" : "-";
        const fecha = tx.date ? new Date(tx.date).toLocaleString("es-AR") : "";

        $("#transactionList").append(`
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <div class="d-flex flex-column">
              <span class="fw-semibold">${tx.type}</span>
              <small class="text-muted">${fecha}</small>
            </div>
            <strong class="${clase}">
              ${signo} ${formatMoney(Math.abs(tx.amount))}
            </strong>
          </li>
        `);
      });
    };

    renderTx("all");

    $("#filterType").on("change", function () {
      renderTx($(this).val());
    });
  }
});
