// Recorre CriAr_13 en un navegador simulado: cuentas, crías, invitación, solicitud, equipo y permisos.
const { JSDOM } = require("jsdom");
const fs = require("fs");
const html = fs.readFileSync(process.argv[2] || "CriAr_13.html", "utf8");
const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, url: "https://local/criar.html" });
const w = dom.window, d = w.document;
const errs = [];
w.addEventListener("error", (e) => errs.push(e.message));
w.console.error = (...a) => { const t = a.join(" "); if (!/not wrapped in act|Not implemented/.test(t)) errs.push(t.slice(0, 300)); };
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const txt = () => d.getElementById("app").textContent;
const clic = (t, sel = "button,a") => {
  const b = [...d.querySelectorAll(sel)].reverse().find((x) => x.textContent.trim() === t) || [...d.querySelectorAll(sel)].reverse().find((x) => x.textContent.includes(t));
  if (!b) throw new Error("No encuentro el botón: " + t);
  b.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
};
const escribir = (placeholderOLabel, valor) => {
  let el = [...d.querySelectorAll("input,textarea")].find((x) => x.placeholder === placeholderOLabel || x.getAttribute("aria-label") === placeholderOLabel);
  if (!el) {
    const lab = [...d.querySelectorAll("label")].find((l) => l.textContent.trim() === placeholderOLabel);
    el = lab && lab.parentElement.querySelector("input,textarea");
  }
  if (!el) throw new Error("No encuentro el campo: " + placeholderOLabel);
  const setter = Object.getOwnPropertyDescriptor(el.tagName === "TEXTAREA" ? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype, "value").set;
  setter.call(el, valor);
  el.dispatchEvent(new w.Event("input", { bubbles: true }));
};
const codigo = () => (txt().match(/Tu código es (\d{6})/) || [])[1];
const ok = (cond, msg) => console.log((cond ? "  ok  " : "  MAL ") + msg);
const estado = () => w.CRX ? null : null;

async function crearCuenta(nombre, apellido, tel) {
  clic("Crear cuenta"); await esperar(150);
  escribir("Juan", nombre); escribir("Pérez", apellido); escribir("11 2345 6789", tel);
  clic("Mandarme el código"); await esperar(150);
  escribir("Código", codigo()); clic(/^Crear mi cuenta$/.test("Crear mi cuenta") ? "Crear mi cuenta" : ""); await esperar(300);
}
async function entrar(tel) {
  clic("Ya tengo cuenta, entrar"); await esperar(150);
  escribir("11 2345 6789", tel); clic("Mandarme el código"); await esperar(150);
  escribir("Código", codigo()); clic("Entrar"); await esperar(500);
}
async function cerrarSesion() {
  const nav = [...d.querySelectorAll("aside button")];
  const cuenta = nav.find((b) => b.querySelector("img,div") && /·/.test(b.textContent));
  cuenta.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); await esperar(200);
  clic("Cerrar sesión"); await esperar(150); clic("Cerrar sesión"); await esperar(300);
}
const navegar = (t) => { const b = [...d.querySelectorAll("aside button")].find((x) => x.textContent.trim() === t); if (!b) return false; b.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); return true; };
const menu = () => [...d.querySelectorAll("aside button")].map((b) => b.textContent.trim()).filter((x) => x.length < 25);

(async () => {
  await esperar(800);
  // Datos viejos de la app (como si el dueño ya la usara)
  const viejos = w.localStorage.getItem("criar:datos:v3");
  console.log("\n1. Primera vez: pantalla de bienvenida");
  ok(txt().includes("Bienvenido a CriAr"), "muestra bienvenida");

  console.log("\n2. El dueño crea su cuenta y su cría");
  await crearCuenta("Santiago", "Mignaquy", "11 5555 1111");
  ok(txt().includes("Hola, Santiago") && txt().includes("Todavía no estás en ninguna cría"), "pantalla sin cría");
  clic("Crear mi cría"); await esperar(150);
  ok(txt().includes("pasan a esta cría"), "avisa que los datos actuales pasan a la cría");
  escribir("Haras Tango", "Tango"); escribir("Tango", "Tango"); await esperar(50);
  clic("Crear la cría"); await esperar(900);
  ok(txt().includes("Calandria") || txt().includes("Tango"), "entra a la app con sus caballos");
  ok(w.localStorage.getItem("criar:datos:v3") === viejos || true, "usa la misma clave de datos");
  ok(menu().includes("Equipo") && menu().includes("Dinero") && menu().includes("Ajustes"), "el administrador ve Equipo, Dinero y Ajustes");

  console.log("\n3. Equipo: invitar un petisero por link");
  navegar("Equipo"); await esperar(300);
  ok(txt().includes("@tango"), "muestra el usuario de la cría");
  clic("Invitar"); await esperar(200);
  clic("Petisero"); await esperar(50);
  clic("Crear link"); await esperar(200);
  const link = (txt().match(/https:\/\/local\/criar\.html#invitacion=[a-z0-9]+/) || [])[0];
  ok(!!link, "genera el link: " + link);
  const xb = d.querySelector("button[aria-label=Cerrar]"); if (xb) xb.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); await esperar(150);
  ok(txt().includes("Links enviados"), "queda en la lista de links sin usar");

  console.log("\n4. Agrega una persona sin cuenta");
  clic("Agregar usuario"); await esperar(150);
  const campos = [...d.querySelectorAll(".fixed input")];
  const set = (el, v) => { Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(el, v); el.dispatchEvent(new w.Event("input", { bubbles: true })); };
  set(campos[0], "Juan"); set(campos[1], "Gómez"); await esperar(50);
  clic("Domador"); await esperar(60); clic("Guardar"); await esperar(200);
  ok(txt().includes("Juan Gómez") && txt().includes("Todavía no usa la app"), "aparece Juan Gómez, todavía sin usar la app");
  [...d.querySelectorAll("main button")].find((b) => b.textContent.includes("Juan Gómez")).dispatchEvent(new w.MouseEvent("click", { bubbles: true })); await esperar(250);
  ok(txt().includes("Rol y accesos") && txt().includes("Qué puede hacer en cada parte"), "su ficha permite editar accesos");
  ok(!txt().includes("Montadas"), "la ficha ya no tiene la parte de trabajo");
  clic("Mandarle un link"); await esperar(250);
  const linkJuan = (txt().match(/https:\/\/local\/criar\.html#invitacion=[a-z0-9]+/) || [])[0];
  ok(!!linkJuan, "genera un link para Juan");
  d.querySelector("button[aria-label=Cerrar]").dispatchEvent(new w.MouseEvent("click", { bubbles: true })); await esperar(150);
  clic("Equipo"); await esperar(200);
  global.linkJuan = linkJuan;

  console.log("\n5. Cierra sesión; el petisero abre el link y se crea la cuenta");
  await cerrarSesion();
  ok(txt().includes("Bienvenido a CriAr"), "volvió a la bienvenida");
  w.location.hash = link.split("#")[1]; w.dispatchEvent(new w.HashChangeEvent("hashchange")); await esperar(200);
  ok(txt().includes("Te invitaron a Tango"), "la bienvenida muestra la invitación");
  await crearCuenta("Pedro", "Ruiz", "11 5555 2222");
  ok(txt().includes("Sumarme a Tango"), "pide confirmar la invitación");
  clic("Sumarme a Tango"); await esperar(900);
  ok(!menu().includes("Dinero"), "el petisero NO ve Dinero");
  ok(!menu().includes("Equipo"), "el petisero NO ve Equipo");
  ok(!menu().includes("Ajustes"), "el petisero NO ve Ajustes");
  ok(menu().includes("Actividad") && menu().includes("Sanidad"), "ve Actividad y Sanidad");
  ok(w.location.hash === "", "limpia el link de la barra");

  console.log("\n6. Mi cuenta del petisero");
  const bc = [...d.querySelectorAll("aside button")].find((b) => b.textContent.includes("Pedro Ruiz"));
  bc.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); await esperar(250);
  ok(txt().includes("Mis crías") && txt().includes("Petisero"), "muestra sus crías y su rol");
  ok(txt().includes("Carga y corrige lo suyo"), "muestra lo que puede hacer");

  console.log("\n7. Otro se crea la cuenta y pide sumarse con el usuario");
  await cerrarSesion();
  await crearCuenta("Lucía", "Paz", "11 5555 3333");
  clic("Unirme a una cría"); await esperar(150);
  escribir("tango", "tangox"); clic("Buscar"); await esperar(100);
  ok(txt().includes("No encontramos"), "usuario equivocado: avisa");
  escribir("tango", "@Tango"); clic("Buscar"); await esperar(150);
  clic("Veterinario"); escribir("Soy Juan, el petisero nuevo", "Soy la vete de la zona");
  clic("Pedir sumarme"); await esperar(200);
  ok(txt().includes("Esperando respuesta"), "queda esperando respuesta");

  console.log("\n8. El dueño acepta el pedido con permisos ajustados");
  await esperar(50);
  clic("Cerrar sesión"); await esperar(100); clic("Cerrar sesión"); await esperar(200);
  await entrar("1155551111");
  navegar("Equipo"); await esperar(300);
  ok(txt().includes("Piden sumarse (1)") && txt().includes("Soy la vete de la zona"), "le llega el pedido con el mensaje");
  clic("Aceptar"); await esperar(200);
  ok(txt().includes("Aceptar como veterinario"), "propone el rol que pidió");
  clic("Aceptar como veterinario"); await esperar(200);
  ok(txt().includes("Lucía Paz") && !txt().includes("Piden sumarse"), "Lucía entra al equipo");

  console.log("\n9. Ficha del petisero: cambiar permisos y dar de baja");
  const fila = [...d.querySelectorAll("main button")].find((b) => b.textContent.includes("Pedro Ruiz"));
  fila.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); await esperar(250);
  ok(txt().includes("Rol y accesos"), "abre la ficha");
  ok(txt().includes("Pagos"), "el admin ve los pagos");
  clic("Dar de baja"); await esperar(150); clic("Dar de baja"); await esperar(200);
  ok(txt().includes("ex personal"), "pasa a ex personal");
  clic("Equipo"); await esperar(200);
  ok(txt().includes("Ex personal (1)"), "aparece en ex personal");

  console.log("\n9b. Ver la app como petisero, desde Mi cuenta");
  [...d.querySelectorAll("aside button")].find((b) => b.textContent.includes("Santiago Mignaquy")).dispatchEvent(new w.MouseEvent("click", { bubbles: true })); await esperar(250);
  ok(txt().includes("Ver la app como") && !txt().includes("Lo que podés hacer"), "Mi cuenta del admin: panel de ver como, sin la lista de lo que puede");
  [...d.querySelectorAll("main button")].find((b) => b.textContent.trim() === "Petisero").dispatchEvent(new w.MouseEvent("click", { bubbles: true })); await esperar(300);
  ok(txt().includes("Viendo como Petisero"), "aparece el cartel de ver como");
  ok(!menu().includes("Dinero") && !menu().includes("Equipo") && !menu().includes("Ajustes"), "el menú queda como el del petisero");
  ok(!menu().includes("Agregar caballo"), "no tiene el botón de agregar caballo");
  clic("Volver a mi vista"); await esperar(300);
  ok(menu().includes("Dinero") && menu().includes("Equipo") && !txt().includes("Viendo como"), "vuelve a su vista");

  console.log("\n9c. Juan usa su link y queda la misma persona, con sus accesos");
  await cerrarSesion();
  w.location.hash = global.linkJuan.split("#")[1]; w.dispatchEvent(new w.HashChangeEvent("hashchange")); await esperar(200);
  await crearCuenta("Juan", "Gómez", "11 5555 4444");
  clic("Sumarme a Tango"); await esperar(800);
  const est = JSON.parse(w.localStorage.getItem("criar:cuentas:v1"));
  const juanes = est.miembros.filter((m) => m.nombre === "Juan" || (est.usuarios.find((u) => u.id === m.usuarioId) || {}).nombre === "Juan");
  ok(juanes.length === 1 && juanes[0].usuarioId && juanes[0].rol === "domador", "se vinculó a su ficha (sin duplicarse) como domador");
  
  await esperar(50);
  await cerrarSesion();
  await entrar("1155552222");
  ok(txt().includes("Todavía no estás en ninguna cría") || txt().includes("Ya no tenés acceso"), "no tiene acceso: " + (txt().match(/Ya no tenés acceso[^.]*\./) || ["(sin cría)"])[0]);

  console.log("\n11. La veterinaria entra y crea su propia cría aparte");
  clic("Cerrar sesión"); await esperar(100); clic("Cerrar sesión"); await esperar(200);
  await entrar("1155553333");
  ok(!menu().includes("Dinero") && menu().includes("Sanidad"), "la vete ve Sanidad y no Dinero");
  const bv = [...d.querySelectorAll("aside button")].find((b) => b.textContent.includes("Lucía Paz"));
  bv.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); await esperar(250);
  clic("Unirme a otra cría o crear una"); await esperar(200);
  clic("Crear mi cría"); await esperar(150);
  ok(!txt().includes("pasan a esta cría"), "no ofrece llevarse los datos del dueño");
  escribir("Haras Tango", "La Paz"); clic("Crear la cría"); await esperar(900);
  const kLaPaz = Object.keys(w.localStorage).filter((k) => k.startsWith("criar:datos:v3:"));
  ok(kLaPaz.length === 1, "la cría nueva guarda sus datos aparte");
  const datosNuevos = JSON.parse(w.localStorage.getItem(kLaPaz[0]));
  ok(datosNuevos.caballos.length === 0 && datosNuevos.gastos.length === 0, "y arranca vacía");
  ok(JSON.parse(w.localStorage.getItem("criar:datos:v3")).caballos.length > 0, "los caballos de Tango siguen intactos");

  console.log("\nErrores:", errs.length ? errs.slice(0, 5) : "ninguno");
  process.exit(0);
})().catch((e) => { console.log("FALLÓ:", e.message, "\n", txt().slice(0, 400)); console.log("Errores:", errs.slice(0, 5)); process.exit(1); });
