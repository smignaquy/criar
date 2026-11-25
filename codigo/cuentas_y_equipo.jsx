/* ==========================================================================
   CriAr · Cuentas, ingreso, Equipo y Mi cuenta
   Se inserta dentro del bundle, antes de function Tf(). Usa los componentes
   y la paleta de la app: d (paleta), $ (tarjeta), _ (botón), Ae (hoja),
   Da (input), j (campo con etiqueta), Vt (banda de título), yf (logo),
   _a (encabezado de tarjeta), F (crear ícono), Ng (estilos base).
   MODO PRUEBA: las cuentas viven en este navegador. El código por SMS se
   muestra en pantalla. Cuando conectemos el servidor, esto se reemplaza.
   ========================================================================== */
var CRX = (function () {
  const C = d, Tarjeta = $, Boton = _, Hoja = Ae, Entrada = Da, Campo = j,
    Banda = Vt, Logo = yf, Encabezado = _a;
  const { useState, useEffect, useRef, useSyncExternalStore } = R;

  /* ------------------------------ íconos ------------------------------ */
  const IcEquipo = F("users-round", [
    ["path", { d: "M18 21a8 8 0 0 0-16 0", key: "a" }],
    ["circle", { cx: "10", cy: "8", r: "5", key: "b" }],
    ["path", { d: "M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3", key: "c" }],
  ]);
  const IcCuenta = F("circle-user-round", [
    ["path", { d: "M18 20a6 6 0 0 0-12 0", key: "a" }],
    ["circle", { cx: "12", cy: "10", r: "4", key: "b" }],
    ["circle", { cx: "12", cy: "12", r: "10", key: "c" }],
  ]);
  const IcSalir = F("log-out", [
    ["path", { d: "m16 17 5-5-5-5", key: "a" }],
    ["path", { d: "M21 12H9", key: "b" }],
    ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "c" }],
  ]);
  const IcTel = F("phone", [
    ["path", { d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z", key: "a" }],
  ]);
  const IcInvitar = F("user-plus", [
    ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "a" }],
    ["circle", { cx: "9", cy: "7", r: "4", key: "b" }],
    ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "c" }],
    ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "d" }],
  ]);
  const IcLink = F("link", [
    ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", key: "a" }],
    ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", key: "b" }],
  ]);
  const IcAtras = Cn, IcFlecha = $o, IcOk = Ke, IcCerrar = Gt, IcMas = ha,
    IcCandado = tu, IcCompartir = An;

  /* ------------------------------ datos ------------------------------ */
  const CLAVE = "criar:cuentas:v1";
  const vacio = () => ({
    usuarios: [], crias: [], miembros: [], invitaciones: [], solicitudes: [],
    sesion: { usuarioId: null, criaId: null, verComo: null },
  });
  function cargar() {
    try {
      const s = localStorage.getItem(CLAVE);
      if (s) return { ...vacio(), ...JSON.parse(s) };
    } catch {}
    return vacio();
  }
  let estado = cargar();
  const subs = new Set();
  const avisar = () => subs.forEach((f) => f());
  function cambiar(fn) {
    estado = fn(estado);
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch {}
    avisar();
  }
  window.addEventListener("storage", (e) => {
    if (e.key === CLAVE) { estado = cargar(); avisar(); }
  });
  const usar = () => useSyncExternalStore(
    (f) => { subs.add(f); return () => subs.delete(f); },
    () => estado
  );

  /* ------------------------------ roles ------------------------------ */
  const ROLES = [
    { id: "admin", l: "Administrador" },
    { id: "dueno", l: "Dueño" },
    { id: "encargado", l: "Encargado" },
    { id: "veterinario", l: "Veterinario" },
    { id: "domador", l: "Domador" },
    { id: "petisero", l: "Petisero" },
    { id: "piloto", l: "Piloto" },
  ];
  const rolNombre = (r) => (ROLES.find((x) => x.id === r) || { l: r }).l;
  const ordenRol = (r) => ROLES.findIndex((x) => x.id === r);

  const AREAS = [
    { id: "caballos", l: "Caballos", niveles: ["ve", "carga", "todo"] },
    { id: "actividad", l: "Actividad", niveles: ["no", "ve", "carga", "todo"] },
    { id: "sanidad", l: "Sanidad", niveles: ["no", "ve", "carga", "todo"] },
    { id: "dinero", l: "Dinero", niveles: ["no", "ve", "carga", "todo"] },
    { id: "categorias", l: "Categorías y lotes", niveles: ["no", "ve", "carga", "todo"] },
    { id: "equipo", l: "Equipo", niveles: ["no", "ve", "todo"] },
  ];
  const NIVEL = { no: "Nada", ve: "Ve", carga: "Carga", todo: "Todo" };
  const NIVEL_AYUDA = {
    no: "No lo ve",
    ve: "Solo mira",
    carga: "Carga y corrige lo suyo",
    todo: "Carga, corrige y borra todo",
  };
  const ORDEN = ["no", "ve", "carga", "todo"];
  const TODO = { caballos: "todo", actividad: "todo", sanidad: "todo", dinero: "todo", categorias: "todo", equipo: "todo", invitar: true };
  const CAMPO = { caballos: "ve", actividad: "carga", sanidad: "todo", dinero: "no", categorias: "ve", equipo: "no", invitar: false };
  const PLANTILLA = {
    admin: TODO,
    dueno: TODO,
    encargado: { caballos: "todo", actividad: "todo", sanidad: "todo", dinero: "no", categorias: "todo", equipo: "ve", invitar: true },
    veterinario: { caballos: "ve", actividad: "ve", sanidad: "todo", dinero: "no", categorias: "ve", equipo: "no", invitar: false },
    domador: CAMPO,
    petisero: CAMPO,
    piloto: CAMPO,
  };
  const permisosDe = (m) => !m ? TODO : m.rol === "admin" ? TODO : { ...PLANTILLA[m.rol], ...(m.permisos || {}) };
  const difiereDePlantilla = (m) => {
    const p = permisosDe(m), t = PLANTILLA[m.rol] || {};
    return Object.keys(t).some((k) => p[k] !== t[k]);
  };

  /* ------------------------------ ayudas ------------------------------ */
  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  const ahora = () => new Date().toISOString();
  const soloNumeros = (t) => String(t || "").replace(/\D/g, "");
  const telLindo = (t) => {
    const n = soloNumeros(t);
    if (n.length === 10) return n.slice(0, 2) === "11" ? `11 ${n.slice(2, 6)}-${n.slice(6)}` : `${n.slice(0, 3)} ${n.slice(3, 6)}-${n.slice(6)}`;
    return n;
  };
  const telWhatsapp = (t) => {
    let n = soloNumeros(t).replace(/^0/, "");
    if (n.length === 10) n = "549" + n;
    return n;
  };
  const nombreDe = (x) => x ? [x.nombre, x.apellido].filter(Boolean).join(" ").trim() : "";
  const normal = (t) => fe(String(t || "").trim());
  const slug = (t) => normal(t).replace(/[^a-z0-9]+/g, "").slice(0, 20);
  const hace = (iso) => {
    if (!iso) return null;
    const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (min < 2) return "recién";
    if (min < 60) return `hace ${min} min`;
    const hs = Math.round(min / 60);
    if (hs < 24) return `hace ${hs} h`;
    const dias = Math.round(hs / 24);
    return dias === 1 ? "ayer" : `hace ${dias} días`;
  };
  const fechaCorta = (iso) => ga(String(iso || "").slice(0, 10));
  const codigoAzar = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
  const codigoInv = () => Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
  const vigente = (i) => !i.usada && !i.cancelada && new Date(i.vence).getTime() > Date.now();
  const linkDe = (i) => location.href.split("#")[0] + "#invitacion=" + i.codigo;
  const copiar = async (t) => {
    try { await navigator.clipboard.writeText(t); return true; } catch { return false; }
  };

  /* --------------------------- sesión actual --------------------------- */
  const usuarioActual = (s = estado) => s.usuarios.find((u) => u.id === s.sesion.usuarioId) || null;
  const criaActual = (s = estado) => s.crias.find((c) => c.id === s.sesion.criaId) || null;
  const miembroActual = (s = estado) => s.miembros.find((m) => m.criaId === s.sesion.criaId && m.usuarioId === s.sesion.usuarioId && m.estado === "activo") || null;
  const membresias = (s, usuarioId) => s.miembros.filter((m) => m.usuarioId === usuarioId && m.estado === "activo");
  const nombreMiembro = (m, s = estado) => {
    if (!m) return "";
    const u = m.usuarioId && s.usuarios.find((x) => x.id === m.usuarioId);
    return nombreDe(u || m);
  };
  const personaDe = (m, s = estado) => (m && m.usuarioId && s.usuarios.find((x) => x.id === m.usuarioId)) || m;

  // "Ver como": el administrador puede mirar la app con el rol o los accesos de otro.
  function miembroEfectivo(s = estado) {
    const m = miembroActual(s), v = s.sesion.verComo;
    if (!m || m.rol !== "admin" || !v) return m;
    if (v.tipo === "rol") return { ...m, rol: v.rol, permisos: {}, simulado: true };
    const otro = s.miembros.find((x) => x.id === v.miembroId && x.estado === "activo");
    return otro ? { ...otro, simulado: true } : m;
  }
  const etiquetaVerComo = (s = estado) => {
    const v = s.sesion.verComo;
    if (!v) return "";
    if (v.tipo === "rol") return rolNombre(v.rol);
    const o = s.miembros.find((x) => x.id === v.miembroId);
    return o ? nombreMiembro(o, s) + " (" + rolNombre(o.rol).toLowerCase() + ")" : "";
  };
  const verComo = (v) => cambiar((st) => ({ ...st, sesion: { ...st.sesion, verComo: v } }));

  function puede(area, nivel = "ve") {
    const m = miembroEfectivo();
    if (!m) return true;
    const p = permisosDe(m);
    if (area === "invitar") return !!p.invitar || p.equipo === "todo";
    return ORDEN.indexOf(p[area] || "no") >= ORDEN.indexOf(nivel);
  }
  const esAdmin = () => { const m = miembroEfectivo(); return !!m && m.rol === "admin"; };

  /* ------------------------ enganches con la app ------------------------ */
  const claveDatos = () => {
    const c = criaActual();
    return !c || c.principal ? "criar:datos:v3" : "criar:datos:v3:" + c.id;
  };
  function semilla(Ss) {
    const base = Ss(), c = criaActual();
    if (!c || c.principal) return base;
    const limpio = { ...base };
    Object.keys(limpio).forEach((k) => {
      if (k === "plan") return;
      if (k === "lotes") limpio.lotes = (base.lotes || []).map((l) => ({ ...l, caballoIds: [] }));
      else if (Array.isArray(limpio[k])) limpio[k] = [];
    });
    limpio.config = { ...base.config, prefijoDefault: c.prefijo || "", criadorDefault: "", quien: "" };
    return limpio;
  }
  const quien = (a) => {
    const m = miembroActual();
    return m ? nombreMiembro(m) : (a && a.config && a.config.quien) || "";
  };
  const navOk = (it) => {
    if (it.id === "dinero") return puede("dinero");
    if (it.id === "equipo") return puede("equipo");
    if (it.id === "lotes") return puede("categorias");
    if (it.id === "trabajo") return puede("actividad");
    if (it.id === "sanidad") return puede("sanidad");
    if (it.id === "ajustes") { const m = miembroEfectivo(); return !m || ["admin", "dueno", "encargado"].includes(m.rol); }
    return true;
  };

  /* ---------------------------- piezas de UI ---------------------------- */
  function Avatar({ persona, tam = 40 }) {
    const foto = persona && persona.foto;
    const ini = ((persona && persona.nombre || "?").trim()[0] || "?") + (((persona && persona.apellido) || "").trim()[0] || "");
    return foto
      ? <img src={foto} alt="" style={{ width: tam, height: tam, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
      : <div className="flex items-center justify-center font-bold shrink-0" style={{ width: tam, height: tam, borderRadius: "50%", background: C.azulSuave, color: C.azul, fontSize: tam * 0.38 }}>{ini.toUpperCase()}</div>;
  }

  function Chip({ children, tono = "azul" }) {
    const t = {
      azul: [C.azulSuave, C.azul], verde: [C.okBg, C.ok], ambar: [C.medioBg, C.medio],
      rojo: [C.malBg, C.mal], gris: [C.campo, C.tinta2],
    }[tono];
    return <span className="inline-flex items-center font-semibold" style={{ background: t[0], color: t[1], fontSize: 12, padding: "2px 9px", borderRadius: 99, whiteSpace: "nowrap" }}>{children}</span>;
  }

  function Nota({ children, tono = "ambar", icono }) {
    const bg = tono === "ambar" ? C.medioBg : tono === "rojo" ? C.malBg : tono === "verde" ? C.okBg : C.azulSuave;
    const fg = tono === "ambar" ? C.medio : tono === "rojo" ? C.mal : tono === "verde" ? C.ok : C.azul;
    const Ic = icono;
    return <div className="flex gap-2 p-3 text-sm" style={{ background: bg, color: fg, borderRadius: 12, lineHeight: 1.4 }}>{Ic ? <Ic size={17} style={{ flexShrink: 0, marginTop: 1 }} /> : null}<div>{children}</div></div>;
  }

  function Interruptor({ activo, onChange, label, ayuda, bloqueado }) {
    return (
      <button onClick={() => !bloqueado && onChange(!activo)} className="cr-tap flex items-center gap-3 w-full text-left py-2" style={{ opacity: bloqueado ? 0.55 : 1 }}>
        <div className="flex-1 min-w-0">
          <p className="font-semibold" style={{ color: C.tinta, fontSize: 15 }}>{label}</p>
          {ayuda ? <p className="text-xs" style={{ color: C.tinta2 }}>{ayuda}</p> : null}
        </div>
        <span style={{ width: 46, height: 28, borderRadius: 99, background: activo ? C.ok : "#C9D6E4", position: "relative", flexShrink: 0, transition: "background .15s" }}>
          <span style={{ position: "absolute", top: 3, left: activo ? 21 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left .15s" }} />
        </span>
      </button>
    );
  }

  function MsgError({ children }) {
    return children ? <p className="text-sm font-semibold mt-2" style={{ color: C.mal }}>{children}</p> : null;
  }

  function useAviso() {
    const [t, setT] = useState(null);
    const ref = useRef();
    const mostrar = (texto) => { setT(texto); clearTimeout(ref.current); ref.current = setTimeout(() => setT(null), 2600); };
    const el = t ? (
      <div className="fixed left-0 right-0 flex justify-center z-50 px-4" style={{ bottom: 86, pointerEvents: "none" }}>
        <div className="cr-fade font-semibold" style={{ background: C.tinta, color: "#fff", borderRadius: 12, padding: "10px 16px", fontSize: 14, boxShadow: "0 6px 20px rgba(11,36,64,.25)" }}>{t}</div>
      </div>
    ) : null;
    return [el, mostrar];
  }

  function Confirmar({ pedido, cerrar }) {
    if (!pedido) return null;
    return (
      <Hoja abierto cerrar={cerrar} titulo={pedido.titulo} ancho={440}>
        <div className="p-5">
          {pedido.texto ? <p style={{ color: C.tinta2, fontSize: 15 }}>{pedido.texto}</p> : null}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Boton tono="fantasma" ancho onClick={cerrar}>Cancelar</Boton>
            <Boton tono={pedido.tono || "peligro"} ancho onClick={() => { pedido.accion(); cerrar(); }}>{pedido.ok || "Sí"}</Boton>
          </div>
        </div>
      </Hoja>
    );
  }

  function FilaSelect({ valor, opciones, onChange }) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {opciones.map((o) => (
          <button key={o.id} onClick={() => onChange(o.id)} className="cr-tap font-semibold"
            style={{ padding: "8px 13px", borderRadius: 10, fontSize: 14, background: valor === o.id ? C.azul : C.campo, color: valor === o.id ? "#fff" : C.tinta2, border: "1px solid " + (valor === o.id ? C.azul : C.linea) }}>
            {o.l}
          </button>
        ))}
      </div>
    );
  }

  /* -------------------------- marco de ingreso -------------------------- */
  function Marco({ titulo, bajada, volver, children }) {
    return (
      <div className="cr min-h-screen" style={{ background: C.fondo, color: C.tinta, fontFamily: "ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif", overflowY: "auto", height: "100vh" }}>
        <style>{Ng}</style>
        <div className="cr-band px-5 pt-5 pb-8" style={{ borderRadius: "0 0 30px 30px" }}>
          <div style={{ maxWidth: 440, margin: "0 auto" }}>
            <div className="flex items-center justify-between mb-4" style={{ minHeight: 28 }}>
              {volver
                ? <button onClick={volver} className="cr-tap flex items-center gap-1 font-semibold" style={{ color: "rgba(255,255,255,.88)" }}><IcAtras size={20} />Volver</button>
                : <Logo tam={24} claro />}
              {volver ? <Logo tam={20} claro /> : null}
            </div>
            <h1 className="font-bold" style={{ color: "#fff", fontSize: 26, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{titulo}</h1>
            {bajada ? <p style={{ color: "rgba(255,255,255,.75)", fontSize: 15, marginTop: 4 }}>{bajada}</p> : null}
          </div>
        </div>
        <div className="px-4 space-y-3" style={{ maxWidth: 440, margin: "-14px auto 0", paddingBottom: 48 }}>{children}</div>
      </div>
    );
  }

  /* ------------------------ invitación en el link ------------------------ */
  const leerInvitacion = () => {
    const m = location.hash.match(/invitacion=([a-z0-9]+)/i);
    return m ? m[1].toLowerCase() : null;
  };
  const limpiarHash = () => { try { history.replaceState(null, "", location.href.split("#")[0]); } catch { location.hash = ""; } };
  const codigoDeTexto = (t) => {
    const m = String(t || "").match(/invitacion=([a-z0-9]+)/i);
    return (m ? m[1] : String(t || "").trim()).toLowerCase();
  };
  function describirInvitacion(s, codigo) {
    const i = s.invitaciones.find((x) => x.codigo === codigo);
    if (!i) return { error: "Ese link no existe. Pedile uno nuevo a quien te invitó." };
    const c = s.crias.find((x) => x.id === i.criaId);
    if (i.cancelada) return { error: "Esa invitación fue cancelada. Pedile una nueva a quien te invitó." };
    if (i.usada) return { error: "Ese link ya se usó. Cada link sirve para una sola persona." };
    if (new Date(i.vence).getTime() < Date.now()) return { error: "Ese link venció. Pedile uno nuevo a quien te invitó." };
    const quienInvita = s.usuarios.find((u) => u.id === i.creadaPor);
    return { inv: i, cria: c, quienInvita };
  }

  /* ------------------------------ INGRESO ------------------------------ */
  function Ingreso({ invitacion }) {
    const s = usar();
    const [paso, setPaso] = useState("inicio");
    const [modo, setModo] = useState("crear");
    const [f, setF] = useState({ nombre: "", apellido: "", telefono: "" });
    const [codigo, setCodigo] = useState("");
    const [esperado, setEsperado] = useState("");
    const [error, setError] = useState("");
    const inv = invitacion ? describirInvitacion(s, invitacion) : null;
    const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setError(""); };

    const mandarCodigo = () => { setEsperado(codigoAzar(6)); setCodigo(""); setError(""); setPaso("codigo"); };

    const pedirCrear = () => {
      if (!f.nombre.trim() || !f.apellido.trim()) return setError("Poné tu nombre y apellido.");
      const tel = soloNumeros(f.telefono);
      if (tel.length < 8) return setError("Revisá el teléfono: poné el código de área sin el 0 y el número sin el 15. Por ejemplo 11 2345 6789.");
      if (s.usuarios.some((u) => u.telefono === tel)) return setError("existe");
      setModo("crear"); mandarCodigo();
    };
    const pedirEntrar = () => {
      const tel = soloNumeros(f.telefono);
      if (tel.length < 8) return setError("Revisá el teléfono.");
      if (!s.usuarios.some((u) => u.telefono === tel)) return setError("noexiste");
      setModo("entrar"); mandarCodigo();
    };
    const verificar = () => {
      if (soloNumeros(codigo) !== esperado) return setError("El código no coincide. Fijate el último SMS que te llegó.");
      const tel = soloNumeros(f.telefono);
      cambiar((st) => {
        let usuarios = st.usuarios, u = st.usuarios.find((x) => x.telefono === tel);
        if (!u) {
          u = { id: uid(), nombre: f.nombre.trim(), apellido: f.apellido.trim(), telefono: tel, foto: "", creado: ahora() };
          usuarios = [...usuarios, u];
        }
        const mias = st.miembros.filter((m) => m.usuarioId === u.id && m.estado === "activo");
        return { ...st, usuarios, sesion: { usuarioId: u.id, criaId: mias.length === 1 && !invitacion ? mias[0].criaId : null } };
      });
    };

    const bannerInv = inv ? (
      inv.error
        ? <Nota tono="rojo">{inv.error}</Nota>
        : <Tarjeta className="p-4"><div className="flex items-center gap-3">
            <div className="flex items-center justify-center shrink-0" style={{ width: 44, height: 44, borderRadius: 14, background: C.okBg, color: C.ok }}><IcInvitar size={22} /></div>
            <div><p className="font-bold" style={{ color: C.tinta }}>Te invitaron a {inv.cria ? inv.cria.nombre : "una cría"}</p>
              <p className="text-sm" style={{ color: C.tinta2 }}>Como {rolNombre(inv.inv.rol).toLowerCase()}{inv.quienInvita ? ` · te invitó ${nombreDe(inv.quienInvita)}` : ""}. Creá tu cuenta o entrá para sumarte.</p></div>
          </div></Tarjeta>
    ) : null;

    if (paso === "inicio") return (
      <Marco titulo="Bienvenido a CriAr" bajada="La cría, los caballos y el trabajo de todos los días, en un solo lugar.">
        {bannerInv}
        <Tarjeta className="p-5">
          <div className="space-y-2.5">
            <Boton tono="pri" ancho icono={IcInvitar} onClick={() => { setPaso("crear"); setError(""); }}>Crear cuenta</Boton>
            <Boton tono="sec" ancho icono={IcTel} onClick={() => { setPaso("entrar"); setError(""); }}>Ya tengo cuenta, entrar</Boton>
          </div>
          <p className="text-sm text-center mt-4" style={{ color: C.tinta2 }}>Entrás con tu número de teléfono. No hay contraseña que recordar.</p>
        </Tarjeta>
      </Marco>
    );

    if (paso === "crear") return (
      <Marco titulo="Crear cuenta" bajada="Te pedimos tres datos y listo." volver={() => setPaso("inicio")}>
        {bannerInv}
        <Tarjeta className="p-5">
          <Campo label="Nombre"><Entrada value={f.nombre} onChange={set("nombre")} placeholder="Juan" autoComplete="given-name" /></Campo>
          <Campo label="Apellido"><Entrada value={f.apellido} onChange={set("apellido")} placeholder="Pérez" autoComplete="family-name" /></Campo>
          <Campo label="Teléfono celular" ayuda="Código de área sin el 0 y el número sin el 15. Te mandamos un código por SMS para confirmar que es tuyo.">
            <Entrada value={f.telefono} onChange={set("telefono")} placeholder="11 2345 6789" inputMode="tel" autoComplete="tel" onKeyDown={(e) => e.key === "Enter" && pedirCrear()} />
          </Campo>
          {error === "existe"
            ? <div className="mb-3"><Nota tono="azul">Ya hay una cuenta con ese teléfono. <button className="underline font-bold" onClick={() => { setError(""); setPaso("entrar"); }}>Entrar con ese número</button></Nota></div>
            : <MsgError>{error}</MsgError>}
          <div className="mt-2"><Boton tono="pri" ancho onClick={pedirCrear}>Mandarme el código</Boton></div>
        </Tarjeta>
      </Marco>
    );

    if (paso === "entrar") return (
      <Marco titulo="Entrar" bajada="Poné el teléfono con el que te registraste." volver={() => setPaso("inicio")}>
        {bannerInv}
        <Tarjeta className="p-5">
          <Campo label="Teléfono celular">
            <Entrada value={f.telefono} onChange={set("telefono")} placeholder="11 2345 6789" inputMode="tel" autoComplete="tel" autoFocus onKeyDown={(e) => e.key === "Enter" && pedirEntrar()} />
          </Campo>
          {error === "noexiste"
            ? <div className="mb-3"><Nota tono="azul">No hay ninguna cuenta con ese teléfono. <button className="underline font-bold" onClick={() => { setError(""); setPaso("crear"); }}>Crear una cuenta</button></Nota></div>
            : <MsgError>{error}</MsgError>}
          <div className="mt-2"><Boton tono="pri" ancho onClick={pedirEntrar}>Mandarme el código</Boton></div>
        </Tarjeta>
      </Marco>
    );

    return (
      <Marco titulo="Poné el código" bajada={"Te lo mandamos por SMS al " + telLindo(f.telefono)} volver={() => setPaso(modo)}>
        <Tarjeta className="p-5">
          <Nota tono="ambar">Modo prueba: todavía no se mandan SMS. Tu código es <strong style={{ letterSpacing: ".12em" }}>{esperado}</strong></Nota>
          <div className="mt-4">
            <input value={codigo} onChange={(e) => { setCodigo(soloNumeros(e.target.value).slice(0, 6)); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && verificar()} inputMode="numeric" autoComplete="one-time-code" autoFocus placeholder="••••••"
              className="cr-input text-center font-bold" style={{ fontSize: 28, letterSpacing: ".35em" }} aria-label="Código" />
          </div>
          <MsgError>{error}</MsgError>
          <div className="mt-3"><Boton tono="pri" ancho icono={IcOk} onClick={verificar}>{modo === "crear" ? "Crear mi cuenta" : "Entrar"}</Boton></div>
          <div className="flex justify-between mt-3 text-sm font-semibold" style={{ color: C.azul }}>
            <button className="cr-tap" onClick={mandarCodigo}>Mandar otro código</button>
            <button className="cr-tap" onClick={() => setPaso(modo)}>Cambiar el número</button>
          </div>
        </Tarjeta>
      </Marco>
    );
  }

  /* ------------------------ aceptar una invitación ------------------------ */
  function AceptarInvitacion({ codigo, despues }) {
    const s = usar();
    const u = usuarioActual(s);
    const info = describirInvitacion(s, codigo);
    const yaEsta = info.inv && s.miembros.some((m) => m.criaId === info.inv.criaId && m.usuarioId === u.id && m.estado === "activo");
    const aceptar = () => {
      const i = info.inv;
      const previo = i.miembroId && estado.miembros.find((x) => x.id === i.miembroId && !x.usuarioId);
      cambiar((st) => ({
        ...st,
        miembros: previo
          ? st.miembros.map((x) => x.id === previo.id ? { ...x, usuarioId: u.id, estado: "activo", hasta: null, via: "link" } : x)
          : [...st.miembros, { id: uid(), criaId: i.criaId, usuarioId: u.id, rol: i.rol, permisos: i.permisos || {}, estado: "activo", desde: ahora(), via: "link", invitadoPor: i.creadaPor }],
        invitaciones: st.invitaciones.map((x) => x.id === i.id ? { ...x, usada: { usuarioId: u.id, fecha: ahora() } } : x),
        solicitudes: st.solicitudes.map((x) => x.criaId === i.criaId && x.usuarioId === u.id && x.estado === "pendiente" ? { ...x, estado: "aceptada", resuelta: ahora() } : x),
        sesion: { ...st.sesion, criaId: i.criaId },
      }));
      despues();
    };
    if (yaEsta) return (
      <Marco titulo={"Ya estás en " + info.cria.nombre} bajada="No hace falta usar el link.">
        <Tarjeta className="p-5"><Boton tono="pri" ancho onClick={() => { cambiar((st) => ({ ...st, sesion: { ...st.sesion, criaId: info.inv.criaId } })); despues(); }}>Entrar a {info.cria.nombre}</Boton></Tarjeta>
      </Marco>
    );
    return (
      <Marco titulo={info.error ? "No pudimos usar el link" : "Te invitaron a " + info.cria.nombre} bajada={info.error ? null : `Hola ${u.nombre}. Vas a entrar como ${rolNombre(info.inv.rol).toLowerCase()}.`}>
        <Tarjeta className="p-5">
          {info.error ? <Nota tono="rojo">{info.error}</Nota> : (
            <>
              {info.quienInvita ? <p className="mb-3" style={{ color: C.tinta2 }}>Te invitó <strong style={{ color: C.tinta }}>{nombreDe(info.quienInvita)}</strong>.</p> : null}
              <ResumenPermisos permisos={info.inv.rol === "admin" ? TODO : { ...PLANTILLA[info.inv.rol], ...(info.inv.permisos || {}) }} />
            </>
          )}
          <div className="space-y-2 mt-4">
            {info.error ? null : <Boton tono="pri" ancho icono={IcOk} onClick={aceptar}>Sumarme a {info.cria.nombre}</Boton>}
            <Boton tono="fantasma" ancho onClick={despues}>{info.error ? "Seguir" : "Ahora no"}</Boton>
          </div>
        </Tarjeta>
      </Marco>
    );
  }

  function ResumenPermisos({ permisos }) {
    return (
      <div style={{ border: "1px solid " + C.linea, borderRadius: 12 }}>
        {AREAS.map((a, i) => (
          <div key={a.id} className="flex items-center justify-between px-3 py-2" style={{ borderTop: i ? "1px solid " + C.linea : "none" }}>
            <span className="text-sm" style={{ color: C.tinta }}>{a.l}</span>
            <span className="text-sm font-semibold" style={{ color: permisos[a.id] === "no" ? C.tinta2 : C.azul }}>{NIVEL_AYUDA[permisos[a.id] || "no"]}</span>
          </div>
        ))}
        {permisos.equipo !== "todo" && permisos.invitar ? <div className="px-3 py-2 text-sm" style={{ borderTop: "1px solid " + C.linea, color: C.azul, fontWeight: 600 }}>Puede invitar gente</div> : null}
      </div>
    );
  }

  /* ------------------------- sin cría / elegir cría ------------------------- */
  function SinCria(props) {
    let aviso = props.aviso;
    const s = usar();
    const u = usuarioActual(s);
    const mias = membresias(s, u.id);
    const mias_crias = mias.map((m) => ({ m, c: s.crias.find((c) => c.id === m.criaId) })).filter((x) => x.c);
    const pendientes = s.solicitudes.filter((x) => x.usuarioId === u.id && x.estado === "pendiente");
    const [vista, setVista] = useState(null); // 'unirme' | 'link' | 'crear'
    const [usuarioCria, setUsuarioCria] = useState("");
    const [encontrada, setEncontrada] = useState(null);
    const [rolPedido, setRolPedido] = useState("petisero");
    const [mensaje, setMensaje] = useState("");
    const [link, setLink] = useState("");
    const [nueva, setNueva] = useState({ nombre: "", usuario: "", prefijo: "", usuarioTocado: false });
    const [error, setError] = useState("");
    const [conf, setConf] = useState(null);
    const [aceptarCodigo, setAceptarCodigo] = useState(null);
    const hayPrincipal = s.crias.some((c) => c.principal);
    const bajas = !mias.length ? s.miembros.filter((m) => m.usuarioId === u.id && m.estado === "baja").map((m) => s.crias.find((c) => c.id === m.criaId)).filter(Boolean) : [];
    if (!aviso && bajas.length) aviso = `Ya no tenés acceso a ${bajas.map((c) => c.nombre).join(" ni a ")}. Si es un error, hablá con el dueño.`;

    const entrar = (criaId) => cambiar((st) => ({ ...st, sesion: { ...st.sesion, criaId, verComo: null } }));
    const salir = () => setConf({ titulo: "¿Cerrar sesión?", texto: "Para volver a entrar te vamos a pedir un código.", ok: "Cerrar sesión", accion: () => cambiar((st) => ({ ...st, sesion: { usuarioId: null, criaId: null, verComo: null } })) });

    const buscar = () => {
      const q = slug(usuarioCria.replace("@", ""));
      const c = s.crias.find((x) => x.usuario === q);
      if (!c) return setError("No encontramos ninguna cría con ese usuario. Revisalo con el dueño.");
      if (mias.some((m) => m.criaId === c.id)) return setError("Ya estás en esa cría.");
      if (pendientes.some((p) => p.criaId === c.id)) return setError("Ya le pediste sumarte a esa cría. Falta que te acepten.");
      if (s.solicitudes.some((p) => p.criaId === c.id && p.usuarioId === u.id && p.estado === "rechazada")) return setError("Esa cría no aceptó tu pedido. Si fue un error, pedile un link al dueño.");
      if (c.recibeSolicitudes === false) return setError("Esa cría no está recibiendo pedidos ahora. Pedile un link al dueño.");
      setError(""); setEncontrada(c);
    };
    const pedir = () => {
      cambiar((st) => ({ ...st, solicitudes: [...st.solicitudes, { id: uid(), criaId: encontrada.id, usuarioId: u.id, rolPedido, mensaje: mensaje.trim(), estado: "pendiente", creada: ahora() }] }));
      setEncontrada(null); setUsuarioCria(""); setMensaje(""); setVista(null);
    };
    const crear = () => {
      const usuario = slug(nueva.usuario || nueva.nombre);
      if (!nueva.nombre.trim()) return setError("Ponele un nombre a la cría.");
      if (usuario.length < 3) return setError("El usuario tiene que tener al menos 3 letras o números.");
      if (s.crias.some((c) => c.usuario === usuario)) return setError("Ese usuario ya lo usa otra cría. Probá con otro.");
      const c = { id: uid(), nombre: nueva.nombre.trim(), usuario, prefijo: nueva.prefijo.trim(), adminId: u.id, recibeSolicitudes: true, principal: !hayPrincipal, creada: ahora() };
      cambiar((st) => ({
        ...st,
        crias: [...st.crias, c],
        miembros: [...st.miembros, { id: uid(), criaId: c.id, usuarioId: u.id, rol: "admin", permisos: {}, estado: "activo", desde: ahora(), via: "creador" }],
        sesion: { ...st.sesion, criaId: c.id },
      }));
    };
    const usarLink = () => {
      const cod = codigoDeTexto(link);
      if (!cod) return setError("Pegá el link que te mandaron.");
      setError(""); setAceptarCodigo(cod);
    };

    if (aceptarCodigo) return <AceptarInvitacion codigo={aceptarCodigo} despues={() => { setAceptarCodigo(null); setLink(""); setVista(null); }} />;

    const Opcion = ({ id, icono, titulo, texto }) => {
      const Ic = icono;
      return (
        <button onClick={() => { setVista(id); setError(""); }} className="cr-tap cr-row flex items-center gap-3 w-full text-left p-4">
          <div className="flex items-center justify-center shrink-0" style={{ width: 42, height: 42, borderRadius: 13, background: C.azulSuave, color: C.azul }}><Ic size={21} /></div>
          <div className="flex-1 min-w-0"><p className="font-bold" style={{ color: C.tinta }}>{titulo}</p><p className="text-sm" style={{ color: C.tinta2 }}>{texto}</p></div>
          <IcFlecha size={19} style={{ color: C.tinta2 }} />
        </button>
      );
    };

    if (vista === "unirme") return (
      <Marco titulo="Unirme a una cría" bajada="El dueño te tiene que aceptar." volver={() => { setVista(null); setEncontrada(null); setError(""); }}>
        {!encontrada ? (
          <Tarjeta className="p-5">
            <Campo label="Usuario de la cría" ayuda="Te lo pasa el dueño o el encargado. Por ejemplo: tango">
              <Entrada value={usuarioCria} onChange={(e) => { setUsuarioCria(e.target.value); setError(""); }} placeholder="tango" autoCapitalize="none" autoFocus onKeyDown={(e) => e.key === "Enter" && buscar()} />
            </Campo>
            <MsgError>{error}</MsgError>
            <div className="mt-2"><Boton tono="pri" ancho onClick={buscar}>Buscar</Boton></div>
          </Tarjeta>
        ) : (
          <Tarjeta className="p-5">
            <p className="font-bold text-lg" style={{ color: C.tinta }}>{encontrada.nombre}</p>
            <p className="text-sm mb-4" style={{ color: C.tinta2 }}>@{encontrada.usuario}</p>
            <Campo label="¿Qué hacés en la cría?" ayuda="Es orientativo: el dueño decide con qué rol entrás.">
              <FilaSelect valor={rolPedido} onChange={setRolPedido} opciones={ROLES.filter((r) => r.id !== "admin")} />
            </Campo>
            <Campo label="Mensaje para el dueño (opcional)">
              <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} rows={2} className="cr-input" placeholder="Soy Juan, el petisero nuevo" />
            </Campo>
            <Boton tono="pri" ancho icono={IcOk} onClick={pedir}>Pedir sumarme</Boton>
          </Tarjeta>
        )}
      </Marco>
    );

    if (vista === "link") return (
      <Marco titulo="Usar un link de invitación" bajada="Si te lo mandaron por WhatsApp, tocalo directamente. Si no, pegalo acá." volver={() => { setVista(null); setError(""); }}>
        <Tarjeta className="p-5">
          <Campo label="Link"><Entrada value={link} onChange={(e) => { setLink(e.target.value); setError(""); }} placeholder="Pegá el link acá" autoFocus /></Campo>
          <MsgError>{error}</MsgError>
          <div className="mt-2"><Boton tono="pri" ancho onClick={usarLink}>Seguir</Boton></div>
        </Tarjeta>
      </Marco>
    );

    if (vista === "crear") {
      const usuarioSug = nueva.usuarioTocado ? nueva.usuario : slug(nueva.nombre);
      return (
        <Marco titulo="Crear mi cría" bajada="Vas a ser el administrador: después sumás a tu gente." volver={() => { setVista(null); setError(""); }}>
          <Tarjeta className="p-5">
            <Campo label="Nombre de la cría"><Entrada value={nueva.nombre} onChange={(e) => { setNueva({ ...nueva, nombre: e.target.value }); setError(""); }} placeholder="Haras Tango" autoFocus /></Campo>
            <Campo label="Usuario" ayuda="Con esto te encuentra tu gente para pedir sumarse. Solo letras y números.">
              <Entrada value={usuarioSug} onChange={(e) => { setNueva({ ...nueva, usuario: slug(e.target.value), usuarioTocado: true }); setError(""); }} placeholder="tango" autoCapitalize="none" />
            </Campo>
            <Campo label="Prefijo de los caballos" ayuda="El que va delante del nombre. Lo podés cambiar en cada caballo.">
              <Entrada value={nueva.prefijo} onChange={(e) => setNueva({ ...nueva, prefijo: e.target.value })} placeholder="Tango" />
            </Campo>
            {!hayPrincipal ? <div className="mb-3"><Nota tono="azul">Los caballos y registros que ya tenés cargados en este teléfono pasan a esta cría.</Nota></div> : null}
            <MsgError>{error}</MsgError>
            <div className="mt-2"><Boton tono="pri" ancho icono={IcOk} onClick={crear}>Crear la cría</Boton></div>
          </Tarjeta>
        </Marco>
      );
    }

    return (
      <Marco titulo={`Hola, ${u.nombre}`} bajada={mias_crias.length ? "¿A qué cría entrás?" : "Todavía no estás en ninguna cría."}>
        {aviso ? <Nota tono="rojo">{aviso}</Nota> : null}
        {mias_crias.length ? (
          <Tarjeta className="overflow-hidden">
            <Encabezado>Tus crías</Encabezado>
            {mias_crias.map(({ m, c }) => (
              <button key={m.id} onClick={() => entrar(c.id)} className="cr-tap cr-row flex items-center gap-3 w-full text-left px-4 py-3" style={{ borderTop: "1px solid " + C.linea }}>
                <div className="flex items-center justify-center font-bold shrink-0" style={{ width: 42, height: 42, borderRadius: 13, background: C.azul, color: "#fff" }}>{(c.nombre[0] || "?").toUpperCase()}</div>
                <div className="flex-1 min-w-0"><p className="font-bold truncate" style={{ color: C.tinta }}>{c.nombre}</p><p className="text-sm" style={{ color: C.tinta2 }}>{rolNombre(m.rol)}</p></div>
                <IcFlecha size={19} style={{ color: C.tinta2 }} />
              </button>
            ))}
          </Tarjeta>
        ) : null}
        {pendientes.length ? (
          <Tarjeta className="overflow-hidden">
            <Encabezado>Esperando respuesta</Encabezado>
            {pendientes.map((p) => {
              const c = s.crias.find((x) => x.id === p.criaId);
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: "1px solid " + C.linea }}>
                  <div className="flex-1 min-w-0"><p className="font-semibold" style={{ color: C.tinta }}>{c ? c.nombre : "Cría"}</p><p className="text-sm" style={{ color: C.tinta2 }}>Pediste entrar como {rolNombre(p.rolPedido).toLowerCase()} · {hace(p.creada)}</p></div>
                  <Boton tono="fantasma" chico onClick={() => cambiar((st) => ({ ...st, solicitudes: st.solicitudes.filter((x) => x.id !== p.id) }))}>Cancelar</Boton>
                </div>
              );
            })}
          </Tarjeta>
        ) : null}
        <Tarjeta className="overflow-hidden">
          <Opcion id="unirme" icono={IcEquipo} titulo="Unirme a una cría" texto="Con el usuario de la cría. El dueño te acepta." />
          <div style={{ borderTop: "1px solid " + C.linea }}><Opcion id="link" icono={IcLink} titulo="Tengo un link de invitación" texto="Si te lo mandaron y no se abrió solo." /></div>
          <div style={{ borderTop: "1px solid " + C.linea }}><Opcion id="crear" icono={IcMas} titulo="Crear mi cría" texto="Si sos el dueño y todavía no la cargaste." /></div>
        </Tarjeta>
        <div className="flex justify-center pt-2">
          <button onClick={salir} className="cr-tap flex items-center gap-2 font-semibold text-sm" style={{ color: C.tinta2 }}><IcSalir size={17} />Cerrar sesión</button>
        </div>
        <Confirmar pedido={conf} cerrar={() => setConf(null)} />
      </Marco>
    );
  }

  /* -------------------------------- PUERTA -------------------------------- */
  function Puerta() {
    const s = usar();
    const [codigoInv, setCodigoInv] = useState(leerInvitacion);
    useEffect(() => {
      const f = () => setCodigoInv(leerInvitacion());
      window.addEventListener("hashchange", f);
      return () => window.removeEventListener("hashchange", f);
    }, []);
    const u = usuarioActual(s);
    const m = miembroActual(s);
    useEffect(() => {
      if (m) cambiar((st) => ({ ...st, miembros: st.miembros.map((x) => x.id === m.id ? { ...x, ultimoUso: ahora() } : x) }));
    }, [m && m.id]);

    if (!u) return <Ingreso invitacion={codigoInv} />;
    if (codigoInv) return <AceptarInvitacion codigo={codigoInv} despues={() => { limpiarHash(); setCodigoInv(null); }} />;
    if (m) return (
      <>
        <Tf key={s.sesion.criaId} />
        <DetalleHost />
        {m.rol === "admin" && s.sesion.verComo ? (
          <div className="fixed left-0 right-0 flex justify-center z-50 px-3" style={{ top: 10, pointerEvents: "none" }}>
            <div className="flex items-center gap-2 font-semibold" style={{ pointerEvents: "auto", background: C.medio, color: "#fff", borderRadius: 99, padding: "6px 6px 6px 14px", fontSize: 13, boxShadow: "0 6px 18px rgba(11,36,64,.3)", maxWidth: "100%" }}>
              <span className="truncate">Viendo como {etiquetaVerComo(s)}</span>
              <button onClick={() => verComo(null)} className="cr-tap font-bold" style={{ background: "#fff", color: C.medio, borderRadius: 99, padding: "4px 12px", whiteSpace: "nowrap" }}>Volver a mi vista</button>
            </div>
          </div>
        ) : null}
      </>
    );
    const perdida = s.sesion.criaId && s.crias.find((c) => c.id === s.sesion.criaId);
    return <SinCria aviso={perdida ? `Ya no tenés acceso a ${perdida.nombre}. Si es un error, hablá con el dueño.` : null} />;
  }

  /* ============================== EQUIPO ============================== */
  function EditorPermisos({ permisos, onChange, rol }) {
    const p = permisos;
    return (
      <div className="space-y-3">
        {AREAS.map((a) => (
          <div key={a.id}>
            <p className="text-sm font-semibold mb-1.5" style={{ color: C.tinta }}>{a.l}</p>
            <FilaSelect valor={p[a.id]} onChange={(v) => onChange({ ...p, [a.id]: v })} opciones={a.niveles.map((n) => ({ id: n, l: NIVEL[n] }))} />
          </div>
        ))}
        {p.equipo !== "todo" ? <Interruptor activo={!!p.invitar} onChange={(v) => onChange({ ...p, invitar: v })} label="Puede invitar gente" ayuda="Manda links para que se sumen otros." /> : null}
        <p className="text-xs" style={{ color: C.tinta2 }}>Ve: solo mira · Carga: carga y corrige lo suyo · Todo: carga, corrige y borra lo de cualquiera.</p>
        {rol && JSON.stringify(p) !== JSON.stringify(PLANTILLA[rol]) ? <button className="cr-tap text-sm font-semibold underline" style={{ color: C.azul }} onClick={() => onChange({ ...PLANTILLA[rol] })}>Volver a los accesos de {rolNombre(rol).toLowerCase()}</button> : null}
      </div>
    );
  }

  function HojaInvitar({ abierto, cerrar, cria, aviso, miembro }) {
    const s = usar();
    const [rol, setRol] = useState("petisero");
    const [inv, setInv] = useState(null);
    const yo = usuarioActual(s);
    useEffect(() => { if (abierto) { setInv(null); setRol(miembro ? miembro.rol : "petisero"); if (miembro) crear(miembro.rol); } }, [abierto]);
    const roles = ROLES.filter((r) => r.id !== "admin" && (r.id !== "dueno" || esAdmin()) && (r.id !== "encargado" || puede("equipo", "todo")));
    const crear = (r = rol) => {
      const i = { id: uid(), criaId: cria.id, rol: miembro ? miembro.rol : r, permisos: miembro ? (miembro.permisos || {}) : {}, miembroId: miembro ? miembro.id : null, codigo: codigoInv(), creadaPor: yo.id, creada: ahora(), vence: new Date(Date.now() + 7 * 864e5).toISOString() };
      cambiar((st) => ({ ...st, invitaciones: [...st.invitaciones.map((x) => miembro && x.miembroId === miembro.id && vigente(x) ? { ...x, cancelada: ahora() } : x), i] }));
      setInv(i);
    };
    const texto = inv ? `Hola! Te invito a sumarte a ${cria.nombre} en CriAr como ${rolNombre(inv.rol).toLowerCase()}. Entrá desde este link y creá tu cuenta: ${linkDe(inv)}` : "";
    return (
      <Hoja abierto={abierto} cerrar={cerrar} titulo={miembro ? "Link para " + nombreMiembro(miembro, s) : "Invitar a alguien"} ancho={480}>
        <div className="p-5">
          {!inv ? (
            <>
              <Campo label="¿Con qué rol entra?"><FilaSelect valor={rol} onChange={setRol} opciones={roles} /></Campo>
              <p className="text-sm font-semibold mb-1.5" style={{ color: C.tinta }}>Va a poder</p>
              <ResumenPermisos permisos={PLANTILLA[rol]} />
              <p className="text-xs mt-2 mb-4" style={{ color: C.tinta2 }}>Después le podés ajustar los accesos desde su ficha.</p>
              <Boton tono="pri" ancho icono={IcLink} onClick={() => crear()}>Crear link</Boton>
            </>
          ) : (
            <>
              <Nota tono="verde" icono={IcOk}>{miembro ? "Mandale este link. Cuando entre, usa la app con el rol y los accesos que le diste. Vence en 7 días." : "Listo. Mandale este link. Sirve para una sola persona y vence en 7 días."}</Nota>
              <div className="mt-3 p-3 text-sm" style={{ background: C.campo, borderRadius: 12, wordBreak: "break-all", color: C.tinta }}>{linkDe(inv)}</div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <a href={"https://wa.me/" + (miembro && miembro.telefono ? telWhatsapp(miembro.telefono) : "") + "?text=" + encodeURIComponent(texto)} target="_blank" rel="noopener" className="cr-tap inline-flex items-center justify-center gap-2 font-semibold px-4 py-3" style={{ background: C.ok, color: "#fff", borderRadius: 12, textDecoration: "none" }}><IcCompartir size={18} />WhatsApp</a>
                <Boton tono="sec" icono={IcLink} onClick={async () => aviso(await copiar(texto) ? "Copiado, pegalo donde quieras" : "No se pudo copiar")}>Copiar</Boton>
              </div>
              <p className="text-xs mt-3" style={{ color: C.tinta2 }}>Modo prueba: para probarlo en este mismo teléfono, cerrá sesión y abrí el link.</p>
            </>
          )}
        </div>
      </Hoja>
    );
  }

  function HojaAceptar({ solicitud, cerrar, aviso }) {
    const s = usar();
    const [rol, setRol] = useState("petisero");
    const [perm, setPerm] = useState(PLANTILLA.petisero);
    useEffect(() => {
      if (solicitud) { const r = solicitud.rolPedido && PLANTILLA[solicitud.rolPedido] ? solicitud.rolPedido : "petisero"; setRol(r); setPerm({ ...PLANTILLA[r] }); }
    }, [solicitud && solicitud.id]);
    if (!solicitud) return null;
    const u = s.usuarios.find((x) => x.id === solicitud.usuarioId);
    const roles = ROLES.filter((r) => r.id !== "admin" && (r.id !== "dueno" || esAdmin()));
    const aceptar = () => {
      const permisos = {};
      Object.keys(perm).forEach((k) => { if (perm[k] !== PLANTILLA[rol][k]) permisos[k] = perm[k]; });
      cambiar((st) => ({
        ...st,
        miembros: [...st.miembros, { id: uid(), criaId: solicitud.criaId, usuarioId: solicitud.usuarioId, rol, permisos, estado: "activo", desde: ahora(), via: "solicitud", invitadoPor: st.sesion.usuarioId }],
        solicitudes: st.solicitudes.map((x) => x.id === solicitud.id ? { ...x, estado: "aceptada", resuelta: ahora(), resolvio: st.sesion.usuarioId } : x),
      }));
      cerrar(); aviso(nombreDe(u) + " ya está en el equipo");
    };
    return (
      <Hoja abierto cerrar={cerrar} titulo="Aceptar en el equipo" ancho={520}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Avatar persona={u} tam={48} />
            <div><p className="font-bold text-lg" style={{ color: C.tinta }}>{nombreDe(u)}</p><p className="text-sm" style={{ color: C.tinta2 }}>{telLindo(u && u.telefono)}</p></div>
          </div>
          {solicitud.mensaje ? <div className="mb-4 p-3 text-sm" style={{ background: C.campo, borderRadius: 12, color: C.tinta }}>“{solicitud.mensaje}”</div> : null}
          <Campo label="Rol"><FilaSelect valor={rol} onChange={(r) => { setRol(r); setPerm({ ...PLANTILLA[r] }); }} opciones={roles} /></Campo>
          <p className="text-sm font-semibold mb-2" style={{ color: C.tinta }}>Permisos</p>
          <EditorPermisos permisos={perm} onChange={setPerm} rol={rol} />
          <div className="mt-5"><Boton tono="verde" ancho icono={IcOk} onClick={aceptar}>Aceptar como {rolNombre(rol).toLowerCase()}</Boton></div>
        </div>
      </Hoja>
    );
  }

  function HojaSinCuenta({ abierto, cerrar, cria, inicial, aviso }) {
    const [f, setF] = useState({ nombre: "", apellido: "", telefono: "", rol: "petisero" });
    const [error, setError] = useState("");
    useEffect(() => { if (abierto) { setF(inicial ? { nombre: inicial.nombre, apellido: inicial.apellido, telefono: inicial.telefono || "", rol: inicial.rol } : { nombre: "", apellido: "", telefono: "", rol: "petisero" }); setError(""); } }, [abierto]);
    const guardar = () => {
      if (!f.nombre.trim()) return setError("Poné al menos el nombre.");
      const datos = { nombre: f.nombre.trim(), apellido: f.apellido.trim(), telefono: soloNumeros(f.telefono), rol: f.rol };
      cambiar((st) => ({
        ...st,
        miembros: inicial
          ? st.miembros.map((m) => m.id === inicial.id ? { ...m, ...datos } : m)
          : [...st.miembros, { id: uid(), criaId: cria.id, usuarioId: null, ...datos, permisos: {}, estado: "activo", desde: ahora(), via: "manual" }],
      }));
      cerrar(); aviso(inicial ? "Datos guardados" : "Agregado al equipo");
    };
    return (
      <Hoja abierto={abierto} cerrar={cerrar} titulo={inicial ? "Editar datos" : "Agregar usuario"} ancho={480}>
        <div className="p-5">
          {!inicial ? <div className="mb-4"><Nota tono="azul">Lo cargás vos. Después, desde su ficha, le das los accesos y, si querés que use la app, le mandás un link.</Nota></div> : null}
          <div className="grid grid-cols-2 gap-2">
            <Campo label="Nombre"><Entrada value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></Campo>
            <Campo label="Apellido"><Entrada value={f.apellido} onChange={(e) => setF({ ...f, apellido: e.target.value })} /></Campo>
          </div>
          <Campo label="Teléfono (opcional)"><Entrada value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} inputMode="tel" placeholder="11 2345 6789" /></Campo>
          {!inicial ? <Campo label="Rol"><FilaSelect valor={f.rol} onChange={(r) => setF({ ...f, rol: r })} opciones={ROLES.filter((r) => r.id !== "admin" && (r.id !== "dueno" || esAdmin()))} /></Campo> : null}
          <MsgError>{error}</MsgError>
          <div className="mt-2"><Boton tono="pri" ancho icono={IcOk} onClick={guardar}>Guardar</Boton></div>
        </div>
      </Hoja>
    );
  }

  function FilaPersona({ m, s, onClick, yoId }) {
    const p = personaDe(m, s);
    const sub = m.estado === "baja"
      ? "Dejó el " + fechaCorta(m.hasta)
      : !m.usuarioId ? "Todavía no usa la app" : m.ultimoUso ? "Usó la app " + hace(m.ultimoUso) : "Todavía no entró";
    return (
      <button onClick={onClick} className="cr-tap cr-row flex items-center gap-3 w-full text-left px-4 py-3" style={{ borderTop: "1px solid " + C.linea }}>
        <Avatar persona={p} tam={42} />
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate" style={{ color: C.tinta }}>{nombreDe(p)}{m.usuarioId && m.usuarioId === yoId ? <span style={{ color: C.tinta2, fontWeight: 500 }}> (vos)</span> : null}</p>
          <p className="text-sm truncate" style={{ color: C.tinta2 }}>{sub}</p>
        </div>
        <Chip tono={m.estado === "baja" ? "gris" : m.rol === "admin" || m.rol === "dueno" ? "azul" : m.usuarioId ? "verde" : "gris"}>{rolNombre(m.rol)}</Chip>
        <IcFlecha size={18} style={{ color: C.tinta2 }} />
      </button>
    );
  }

  function Equipo({ datos, ir }) {
    const s = usar();
    const c = criaActual(s);
    const yo = miembroActual(s);
    const [ficha, setFicha] = useState(null);
    const [hoja, setHoja] = useState(null);
    const [verEx, setVerEx] = useState(false);
    const [conf, setConf] = useState(null);
    const [avisoEl, aviso] = useAviso();
    if (!c) return null;
    const gestiona = puede("equipo", "todo");
    const invita = puede("invitar");

    const todos = s.miembros.filter((m) => m.criaId === c.id);
    const activos = todos.filter((m) => m.estado === "activo").sort((a, b) => ordenRol(a.rol) - ordenRol(b.rol) || nombreMiembro(a, s).localeCompare(nombreMiembro(b, s)));
    const ex = todos.filter((m) => m.estado === "baja");
    const pendientes = s.solicitudes.filter((x) => x.criaId === c.id && x.estado === "pendiente");
    const invs = s.invitaciones.filter((i) => i.criaId === c.id && vigente(i));

    const fichaM = ficha && todos.find((m) => m.id === ficha);
    if (fichaM) return <FichaPersona m={fichaM} datos={datos} ir={ir} volver={() => setFicha(null)} />;

    const conCuenta = activos.filter((m) => m.usuarioId).length;
    return (
      <div>
        <Banda titulo="Equipo" bajada={c.nombre + " · @" + c.usuario} onLogo={() => ir("inicio")}
          accion={invita ? <Boton tono="claro" chico icono={IcInvitar} onClick={() => setHoja("invitar")}>Invitar</Boton> : null}
          metricas={[{ l: "Personas", v: activos.length }, { l: "Usan la app", v: conCuenta }, { l: "Pedidos", v: pendientes.length, color: pendientes.length ? "#FFD38A" : undefined }]} />
        <div className="p-4 space-y-3" style={{ marginTop: -14 }}>
          {gestiona && pendientes.length ? (
            <Tarjeta className="overflow-hidden" style={{ border: "1.5px solid " + C.medio }}>
              <Encabezado>Piden sumarse ({pendientes.length})</Encabezado>
              {pendientes.map((x) => {
                const u = s.usuarios.find((y) => y.id === x.usuarioId);
                return (
                  <div key={x.id} className="px-4 py-3" style={{ borderTop: "1px solid " + C.linea }}>
                    <div className="flex items-center gap-3">
                      <Avatar persona={u} tam={42} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold" style={{ color: C.tinta }}>{nombreDe(u)}</p>
                        <p className="text-sm" style={{ color: C.tinta2 }}>{telLindo(u && u.telefono)} · quiere entrar como {rolNombre(x.rolPedido).toLowerCase()} · {hace(x.creada)}</p>
                      </div>
                    </div>
                    {x.mensaje ? <p className="text-sm mt-2 p-2.5" style={{ background: C.campo, borderRadius: 10, color: C.tinta }}>“{x.mensaje}”</p> : null}
                    <div className="grid grid-cols-2 gap-2 mt-2.5">
                      <Boton tono="fantasma" chico onClick={() => setConf({ titulo: `¿Rechazar a ${nombreDe(u)}?`, texto: "No va a poder volver a pedir sumarse. Si después lo querés, mandale un link.", ok: "Rechazar", accion: () => { cambiar((st) => ({ ...st, solicitudes: st.solicitudes.map((y) => y.id === x.id ? { ...y, estado: "rechazada", resuelta: ahora(), resolvio: st.sesion.usuarioId } : y) })); aviso("Pedido rechazado"); } })}>Rechazar</Boton>
                      <Boton tono="verde" chico icono={IcOk} onClick={() => setHoja({ aceptar: x })}>Aceptar</Boton>
                    </div>
                  </div>
                );
              })}
            </Tarjeta>
          ) : null}

          <Tarjeta className="overflow-hidden">
            <Encabezado accion={gestiona ? <Boton tono="sec" chico icono={IcMas} onClick={() => setHoja("sinCuenta")}>Agregar usuario</Boton> : null}>Personal</Encabezado>
            {activos.map((m) => <FilaPersona key={m.id} m={m} s={s} yoId={yo && yo.usuarioId} onClick={() => setFicha(m.id)} />)}
          </Tarjeta>

          {invita && invs.length ? (
            <Tarjeta className="overflow-hidden">
              <Encabezado>Links enviados, sin usar</Encabezado>
              {invs.map((i) => (
                <div key={i.id} className="flex items-center gap-2 px-4 py-3" style={{ borderTop: "1px solid " + C.linea }}>
                  <div className="flex-1 min-w-0"><p className="font-semibold" style={{ color: C.tinta }}>{rolNombre(i.rol)}</p><p className="text-sm" style={{ color: C.tinta2 }}>Vence el {fechaCorta(i.vence)}</p></div>
                  <Boton tono="sec" chico icono={IcLink} onClick={async () => aviso(await copiar(linkDe(i)) ? "Link copiado" : "No se pudo copiar")}>Copiar</Boton>
                  <Boton tono="fantasma" chico onClick={() => cambiar((st) => ({ ...st, invitaciones: st.invitaciones.map((y) => y.id === i.id ? { ...y, cancelada: ahora() } : y) }))}>Anular</Boton>
                </div>
              ))}
            </Tarjeta>
          ) : null}

          {ex.length ? (
            <Tarjeta className="overflow-hidden">
              <button onClick={() => setVerEx(!verEx)} className="cr-tap flex items-center justify-between w-full px-4 py-3 font-bold" style={{ color: C.tinta }}>
                <span>Ex personal ({ex.length})</span><IcFlecha size={18} style={{ color: C.tinta2, transform: verEx ? "rotate(90deg)" : "none" }} />
              </button>
              {verEx ? ex.map((m) => <FilaPersona key={m.id} m={m} s={s} onClick={() => setFicha(m.id)} />) : null}
            </Tarjeta>
          ) : null}

          {gestiona ? (
            <Tarjeta className="p-4">
              <p className="font-bold mb-1" style={{ color: C.tinta }}>Cómo se suma la gente</p>
              <p className="text-sm mb-3" style={{ color: C.tinta2 }}>Con un link que mandás vos, o creándose una cuenta y escribiendo el usuario de la cría. En ese caso te llega el pedido acá y decidís.</p>
              <div className="flex items-center gap-2 p-3 mb-2" style={{ background: C.campo, borderRadius: 12 }}>
                <span className="flex-1 font-bold" style={{ color: C.tinta, fontSize: 17 }}>@{c.usuario}</span>
                <Boton tono="sec" chico onClick={async () => aviso(await copiar(c.usuario) ? "Usuario copiado" : "No se pudo copiar")}>Copiar</Boton>
              </div>
              <Interruptor activo={c.recibeSolicitudes !== false} onChange={(v) => cambiar((st) => ({ ...st, crias: st.crias.map((x) => x.id === c.id ? { ...x, recibeSolicitudes: v } : x) }))}
                label="Recibir pedidos para sumarse" ayuda={c.recibeSolicitudes !== false ? "Cualquiera con el usuario puede pedirte entrar." : "Apagado: solo entra gente con link."} />
            </Tarjeta>
          ) : null}
        </div>
        <HojaInvitar abierto={hoja === "invitar"} cerrar={() => setHoja(null)} cria={c} aviso={aviso} />
        <HojaSinCuenta abierto={hoja === "sinCuenta"} cerrar={() => setHoja(null)} cria={c} aviso={aviso} />
        {hoja && hoja.aceptar ? <HojaAceptar solicitud={hoja.aceptar} cerrar={() => setHoja(null)} aviso={aviso} /> : null}
        <Confirmar pedido={conf} cerrar={() => setConf(null)} />
        {avisoEl}
      </div>
    );
  }

  /* --------------------------- ficha de persona --------------------------- */
  function FichaPersona({ m, datos, volver, ir }) {
    const s = usar();
    const c = criaActual(s);
    const yo = miembroActual(s);
    const p = personaDe(m, s);
    const nombre = nombreDe(p);
    const [rol, setRol] = useState(m.rol);
    const [perm, setPerm] = useState(permisosDe(m));
    const [hoja, setHoja] = useState(null);
    const [conf, setConf] = useState(null);
    const [avisoEl, aviso] = useAviso();
    useEffect(() => { setRol(m.rol); setPerm(permisosDe(m)); }, [m.id, m.rol, JSON.stringify(m.permisos)]);

    const esYo = yo && m.usuarioId && m.usuarioId === yo.usuarioId;
    const gestiona = puede("equipo", "todo");
    const puedoEditar = gestiona && !esYo && m.rol !== "admin" && (m.rol !== "dueno" || esAdmin()) && m.estado === "activo";
    const cambio = rol !== m.rol || JSON.stringify(perm) !== JSON.stringify(permisosDe(m));
    const roles = ROLES.filter((r) => r.id !== "admin" && (r.id !== "dueno" || esAdmin()));
    const linkPendiente = s.invitaciones.find((i) => i.miembroId === m.id && vigente(i));

    const guardar = () => setConf({
      titulo: "¿Guardar los cambios?", texto: `Cambian el rol y los accesos de ${nombre}.`, ok: "Sí, guardar", tono: "pri",
      accion: () => {
        const permisos = {};
        Object.keys(perm).forEach((k) => { if (perm[k] !== PLANTILLA[rol][k]) permisos[k] = perm[k]; });
        cambiar((st) => ({ ...st, miembros: st.miembros.map((x) => x.id === m.id ? { ...x, rol, permisos } : x) }));
        aviso("Cambios guardados");
      },
    });
    const darDeBaja = () => setConf({
      titulo: `¿Dar de baja a ${nombre}?`,
      texto: m.usuarioId ? "Deja de tener acceso a la cría. Todo lo que cargó queda a su nombre y pasa a ex personal." : "Pasa a ex personal. Lo que tiene cargado queda a su nombre.",
      ok: "Dar de baja",
      accion: () => {
        cambiar((st) => ({
          ...st,
          miembros: st.miembros.map((x) => x.id === m.id ? { ...x, estado: "baja", hasta: ahora() } : x),
          invitaciones: st.invitaciones.map((i) => i.miembroId === m.id && vigente(i) ? { ...i, cancelada: ahora() } : i),
        }));
        aviso(nombre + " pasó a ex personal");
      },
    });
    const reincorporar = () => setConf({
      titulo: `¿Reincorporar a ${nombre}?`, texto: m.usuarioId ? "Vuelve a tener acceso con el mismo rol y los mismos accesos que tenía." : null, ok: "Reincorporar", tono: "pri",
      accion: () => { cambiar((st) => ({ ...st, miembros: st.miembros.map((x) => x.id === m.id ? { ...x, estado: "activo", hasta: null } : x) })); aviso("Reincorporado"); },
    });

    // ---- pagos
    const n = normal(nombre);
    const verPlata = puede("dinero");
    const anio = String(new Date().getFullYear());
    const pagos = (datos.gastos || []).filter((g) => normal(g.proveedor) === n).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
    const totalAnio = pagos.filter((g) => String(g.fecha).startsWith(anio)).reduce((a, g) => a + (Number(g.monto) || 0), 0);

    const tel = p.telefono;
    const yoReal = miembroActual(s);
    const puedoVerComo = yoReal && yoReal.rol === "admin" && !s.sesion.verComo && m.rol !== "admin" && m.estado === "activo";
    return (
      <div>
        <Banda titulo={nombre} bajada={rolNombre(m.rol) + (m.estado === "baja" ? " · ex personal desde el " + fechaCorta(m.hasta) : m.usuarioId ? "" : " · todavía no usa la app")}
          onLogo={volver} accion={<Boton tono="claro" chico icono={IcAtras} onClick={volver}>Equipo</Boton>} />
        <div className="p-4 space-y-3" style={{ marginTop: -14 }}>
          <Tarjeta className="p-4">
            <div className="flex items-center gap-3">
              <Avatar persona={p} tam={56} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg truncate" style={{ color: C.tinta }}>{nombre}</p>
                <p className="text-sm" style={{ color: C.tinta2 }}>{tel ? telLindo(tel) : "Sin teléfono"}{m.desde ? " · en el equipo desde el " + fechaCorta(m.desde) : ""}</p>
              </div>
              {!m.usuarioId && gestiona ? <Boton tono="fantasma" chico onClick={() => setHoja("editar")}>Editar</Boton> : null}
            </div>
            {tel ? (
              <div className="grid grid-cols-2 gap-2 mt-3">
                <a href={"tel:" + soloNumeros(tel)} className="cr-tap inline-flex items-center justify-center gap-2 font-semibold px-3 py-2 text-sm" style={{ background: C.azulSuave, color: C.azul, borderRadius: 12, border: "1px solid #C2D9F0", textDecoration: "none" }}><IcTel size={16} />Llamar</a>
                <a href={"https://wa.me/" + telWhatsapp(tel)} target="_blank" rel="noopener" className="cr-tap inline-flex items-center justify-center gap-2 font-semibold px-3 py-2 text-sm" style={{ background: C.okBg, color: C.ok, borderRadius: 12, textDecoration: "none" }}><IcCompartir size={16} />WhatsApp</a>
              </div>
            ) : null}
            {!m.usuarioId && m.estado === "activo" && puede("invitar") ? (
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid " + C.linea }}>
                <p className="text-sm mb-2" style={{ color: C.tinta2 }}>{linkPendiente ? `Ya le mandaste un link. Vence el ${fechaCorta(linkPendiente.vence)}.` : "Todavía no usa la app. Si querés que entre con estos accesos, mandale un link."}</p>
                <Boton tono="sec" ancho icono={IcLink} onClick={() => setHoja("link")}>{linkPendiente ? "Mandar otro link" : "Mandarle un link"}</Boton>
              </div>
            ) : null}
          </Tarjeta>

          <Tarjeta className="p-4">
            <p className="font-bold mb-3" style={{ color: C.tinta }}>Rol y accesos</p>
            {m.rol === "admin" ? <Nota tono="azul" icono={IcCandado}>Creó la cría. Tiene control total y no se le puede limitar nada.</Nota>
              : puedoEditar ? (
                <>
                  <Campo label="Rol"><FilaSelect valor={rol} onChange={(r) => { setRol(r); setPerm({ ...PLANTILLA[r] }); }} opciones={roles} /></Campo>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.tinta }}>Qué puede hacer en cada parte</p>
                  <EditorPermisos permisos={perm} onChange={setPerm} rol={rol} />
                  {cambio ? <div className="grid grid-cols-2 gap-2 mt-4">
                    <Boton tono="fantasma" onClick={() => { setRol(m.rol); setPerm(permisosDe(m)); }}>Deshacer</Boton>
                    <Boton tono="pri" icono={IcOk} onClick={guardar}>Guardar</Boton>
                  </div> : null}
                </>
              ) : (
                <>
                  <ResumenPermisos permisos={permisosDe(m)} />
                  {m.rol === "dueno" && gestiona && !esAdmin() ? <p className="text-xs mt-2" style={{ color: C.tinta2 }}>Los accesos de un dueño solo los cambia el administrador.</p> : null}
                  {difiereDePlantilla(m) ? <p className="text-xs mt-2" style={{ color: C.tinta2 }}>Tiene accesos ajustados, distintos a los de su rol.</p> : null}
                </>
              )}
            {puedoVerComo ? (
              <div className="mt-4">
                <Boton tono="sec" ancho onClick={() => { verComo({ tipo: "persona", miembroId: m.id }); ir && ir("inicio"); }}>Ver la app como {p.nombre}</Boton>
              </div>
            ) : null}
          </Tarjeta>

          {verPlata ? (
            <Tarjeta className="overflow-hidden">
              <Encabezado accion={<span className="font-bold" style={{ color: C.tinta }}>{ra(totalAnio)} en {anio}</span>}>Pagos</Encabezado>
              {pagos.length ? pagos.slice(0, 6).map((g) => (
                <div key={g.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderTop: "1px solid " + C.linea }}>
                  <span className="text-sm font-semibold shrink-0" style={{ color: C.tinta2, width: 74 }}>{ga(g.fecha)}</span>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate" style={{ color: C.tinta }}>{g.categoria}{g.detalle ? " · " + g.detalle : ""}</p></div>
                  <span className="text-sm font-bold" style={{ color: C.tinta }}>{ra(g.monto)}</span>
                </div>
              )) : <p className="px-4 pb-1 pt-1 text-sm" style={{ color: C.tinta2 }}>Todavía no hay pagos.</p>}
              <p className="px-4 py-3 text-xs" style={{ color: C.tinta2, borderTop: pagos.length ? "1px solid " + C.linea : "none" }}>Suma los gastos que tienen a {nombre} como proveedor: sueldo, variable de doma y lo que sea.</p>
            </Tarjeta>
          ) : null}

          {gestiona && !esYo && m.rol !== "admin" && (m.rol !== "dueno" || esAdmin()) ? (
            <div className="pt-1">{m.estado === "activo"
              ? <Boton tono="peligro" ancho onClick={darDeBaja}>Dar de baja</Boton>
              : <Boton tono="sec" ancho onClick={reincorporar}>Reincorporar</Boton>}</div>
          ) : null}
        </div>
        <HojaSinCuenta abierto={hoja === "editar"} cerrar={() => setHoja(null)} cria={c} inicial={m} aviso={aviso} />
        <HojaInvitar abierto={hoja === "link"} cerrar={() => setHoja(null)} cria={c} aviso={aviso} miembro={m} />
        <Confirmar pedido={conf} cerrar={() => setConf(null)} />
        {avisoEl}
      </div>
    );
  }

  /* ============================== MI CUENTA ============================== */
  function achicarFoto(archivo, lado = 240) {
    return new Promise((ok, mal) => {
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          const k = Math.min(1, lado / Math.min(img.width, img.height));
          const w = Math.round(img.width * k), h = Math.round(img.height * k);
          const cv = document.createElement("canvas"); cv.width = lado; cv.height = lado;
          const cx = cv.getContext("2d");
          cx.drawImage(img, (lado - w) / 2, (lado - h) / 2, w, h);
          ok(cv.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = mal; img.src = r.result;
      };
      r.onerror = mal; r.readAsDataURL(archivo);
    });
  }

  function PanelVerComo({ ir }) {
    const s = usar();
    const c = criaActual(s);
    const v = s.sesion.verComo;
    const gente = s.miembros.filter((m) => m.criaId === c.id && m.estado === "activo" && m.rol !== "admin")
      .sort((a, b) => ordenRol(a.rol) - ordenRol(b.rol) || nombreMiembro(a, s).localeCompare(nombreMiembro(b, s)));
    const ver = (x) => { verComo(x); ir("inicio"); };
    return (
      <Tarjeta className="p-4">
        <p className="font-bold" style={{ color: C.tinta }}>Ver la app como…</p>
        <p className="text-sm mb-3" style={{ color: C.tinta2 }}>Mirá qué ve cada rol o cada persona. No cambia nada, y arriba aparece un botón para volver a tu vista.</p>
        <p className="text-xs font-semibold uppercase mb-1.5" style={{ color: C.tinta2, letterSpacing: ".04em" }}>Un rol</p>
        <FilaSelect valor={v && v.tipo === "rol" ? v.rol : null} onChange={(r) => ver({ tipo: "rol", rol: r })} opciones={ROLES.filter((r) => r.id !== "admin")} />
        {gente.length ? (
          <>
            <p className="text-xs font-semibold uppercase mt-4 mb-1.5" style={{ color: C.tinta2, letterSpacing: ".04em" }}>Una persona, con sus accesos</p>
            <div style={{ border: "1px solid " + C.linea, borderRadius: 12, overflow: "hidden" }}>
              {gente.map((m, i) => (
                <button key={m.id} onClick={() => ver({ tipo: "persona", miembroId: m.id })} className="cr-tap cr-row flex items-center gap-3 w-full text-left px-3 py-2.5" style={{ borderTop: i ? "1px solid " + C.linea : "none" }}>
                  <Avatar persona={personaDe(m, s)} tam={32} />
                  <span className="flex-1 min-w-0 font-semibold truncate" style={{ color: C.tinta }}>{nombreMiembro(m, s)}</span>
                  <Chip tono="gris">{rolNombre(m.rol)}</Chip>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </Tarjeta>
    );
  }

  function MiCuenta({ ir }) {
    const s = usar();
    const u = usuarioActual(s);
    const yo = miembroEfectivo(s);
    const c = criaActual(s);
    const [f, setF] = useState({ nombre: u.nombre, apellido: u.apellido });
    const [conf, setConf] = useState(null);
    const [avisoEl, aviso] = useAviso();
    const archivo = useRef();
    const mias = membresias(s, u.id).map((m) => ({ m, c: s.crias.find((x) => x.id === m.criaId) })).filter((x) => x.c);
    const cambio = f.nombre.trim() !== u.nombre || f.apellido.trim() !== u.apellido;

    const guardarDatos = () => {
      if (!f.nombre.trim()) return aviso("El nombre no puede quedar vacío");
      cambiar((st) => ({ ...st, usuarios: st.usuarios.map((x) => x.id === u.id ? { ...x, nombre: f.nombre.trim(), apellido: f.apellido.trim() } : x) }));
      aviso("Datos guardados");
    };
    const subirFoto = async (e) => {
      const a = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!a) return;
      try {
        const foto = await achicarFoto(a);
        cambiar((st) => ({ ...st, usuarios: st.usuarios.map((x) => x.id === u.id ? { ...x, foto } : x) }));
        aviso("Foto actualizada");
      } catch { aviso("No pudimos usar esa foto"); }
    };
    const irA = (criaId) => cambiar((st) => ({ ...st, sesion: { ...st.sesion, criaId, verComo: null } }));

    return (
      <div>
        <Banda titulo="Mi cuenta" bajada={nombreDe(u) + " · " + telLindo(u.telefono)} onLogo={() => ir("inicio")} />
        <div className="p-4 space-y-3" style={{ marginTop: -14 }}>
          <Tarjeta className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar persona={u} tam={64} />
              <div className="flex-1">
                <Boton tono="sec" chico onClick={() => archivo.current && archivo.current.click()}>{u.foto ? "Cambiar foto" : "Poner foto"}</Boton>
                {u.foto ? <button className="cr-tap text-sm font-semibold ml-3" style={{ color: C.tinta2 }} onClick={() => cambiar((st) => ({ ...st, usuarios: st.usuarios.map((x) => x.id === u.id ? { ...x, foto: "" } : x) }))}>Sacar</button> : null}
                <input ref={archivo} type="file" accept="image/*" onChange={subirFoto} style={{ display: "none" }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Campo label="Nombre"><Entrada value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></Campo>
              <Campo label="Apellido"><Entrada value={f.apellido} onChange={(e) => setF({ ...f, apellido: e.target.value })} /></Campo>
            </div>
            <Campo label="Teléfono" ayuda="Es con el que entrás. Por ahora no se puede cambiar."><Entrada value={telLindo(u.telefono)} disabled style={{ opacity: 0.7 }} /></Campo>
            {cambio ? <Boton tono="pri" ancho icono={IcOk} onClick={guardarDatos}>Guardar</Boton> : null}
          </Tarjeta>

          <Tarjeta className="overflow-hidden">
            <Encabezado>Mis crías</Encabezado>
            {mias.map(({ m, c: cc }) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: "1px solid " + C.linea }}>
                <div className="flex items-center justify-center font-bold shrink-0" style={{ width: 38, height: 38, borderRadius: 12, background: C.azul, color: "#fff" }}>{(cc.nombre[0] || "?").toUpperCase()}</div>
                <div className="flex-1 min-w-0"><p className="font-bold truncate" style={{ color: C.tinta }}>{cc.nombre}</p><p className="text-sm" style={{ color: C.tinta2 }}>{rolNombre(m.rol)}</p></div>
                {cc.id === (c && c.id) ? <Chip tono="verde">Estás acá</Chip> : <Boton tono="sec" chico onClick={() => irA(cc.id)}>Entrar</Boton>}
              </div>
            ))}
            <button onClick={() => irA(null)} className="cr-tap cr-row flex items-center gap-2 w-full px-4 py-3 font-semibold" style={{ borderTop: "1px solid " + C.linea, color: C.azul }}><IcMas size={18} />Unirme a otra cría o crear una</button>
          </Tarjeta>

          {yo && yo.rol !== "admin" ? (
            <Tarjeta className="p-4">
              <p className="font-bold mb-3" style={{ color: C.tinta }}>Lo que podés hacer en {c.nombre}</p>
              <ResumenPermisos permisos={permisosDe(yo)} />
            </Tarjeta>
          ) : null}

          {miembroActual(s) && miembroActual(s).rol === "admin" ? <PanelVerComo ir={ir} /> : null}

          <Nota tono="ambar">Modo prueba: las cuentas viven solo en este teléfono. Cuando conectemos el servidor, cada uno va a entrar desde el suyo.</Nota>

          <Boton tono="fantasma" ancho icono={IcSalir} onClick={() => setConf({ titulo: "¿Cerrar sesión?", texto: "Para volver a entrar te vamos a pedir un código.", ok: "Cerrar sesión", accion: () => cambiar((st) => ({ ...st, sesion: { usuarioId: null, criaId: null, verComo: null } })) })}>Cerrar sesión</Boton>
        </div>
        <Confirmar pedido={conf} cerrar={() => setConf(null)} />
        {avisoEl}
      </div>
    );
  }


  /* ===================== accesos en las acciones de la app ===================== */
  let gActual = null, datosActuales = null, irActual = null;
  const COLECCION = { gasto: "gastos", ingreso: "ingresos", evento: "eventos", trabajo: "trabajos", lote: "lotes", documento: "documentos", lesion: "lesiones", alerta: "alertas" };
  const AREA_DE = { gasto: "dinero", ingreso: "dinero", evento: "sanidad", lesion: "sanidad", trabajo: "actividad", lote: "categorias", documento: "caballos" };
  const esMio = (rec) => !!rec && !!normal(rec.quien) && normal(rec.quien) === normal(quien(datosActuales));
  function puedeBorrar(tipo, rec) {
    const area = AREA_DE[tipo];
    if (!area) return true;
    return puede(area, "todo") || (puede(area, "carga") && esMio(rec));
  }
  function proteger(G, a, ir) {
    datosActuales = a; irActual = ir;
    const no = (texto) => G.aviso("No tenés acceso para " + texto);
    const si = (area, nivel, texto, fn) => (...x) => (puede(area, nivel) ? fn(...x) : no(texto));
    const P2 = {
      ...G,
      nuevoCaballo: si("caballos", "todo", "agregar caballos", G.nuevoCaballo),
      cargarPotrillo: si("caballos", "todo", "agregar caballos", G.cargarPotrillo),
      editar: si("caballos", "todo", "editar caballos", G.editar),
      borrarCaballo: si("caballos", "todo", "borrar caballos", G.borrarCaballo),
      nuevoDoc: si("caballos", "carga", "cargar papeles", G.nuevoDoc),
      vender: si("dinero", "carga", "registrar ventas", G.vender),
      nuevoGasto: si("dinero", "carga", "cargar gastos", G.nuevoGasto),
      gastoLote: si("dinero", "carga", "cargar gastos", G.gastoLote),
      nuevoIngreso: si("dinero", "carga", "cargar ingresos", G.nuevoIngreso),
      nuevoEvento: si("sanidad", "carga", "cargar sanidad", G.nuevoEvento),
      nuevaLesion: si("sanidad", "carga", "registrar lesiones", G.nuevaLesion),
      darAlta: si("sanidad", "carga", "dar de alta", G.darAlta),
      nuevoTrabajo: si("actividad", "carga", "cargar actividad", G.nuevoTrabajo),
      repetirTrabajo: si("actividad", "carga", "cargar actividad", G.repetirTrabajo),
      nuevoLote: (x) => (puede("categorias", x && x.id ? "todo" : "carga") ? G.nuevoLote(x) : no(x && x.id ? "editar categorías" : "crear categorías")),
      borrar: (tipo, id, texto) => {
        const rec = (a[COLECCION[tipo]] || []).find((r) => r.id === id);
        return puedeBorrar(tipo, rec) ? G.borrar(tipo, id, texto) : no(AREA_DE[tipo] && puede(AREA_DE[tipo], "carga") ? "borrar lo que cargó otro" : "borrar esto");
      },
    };
    gActual = P2;
    return P2;
  }

  /* ============================ detalle de un registro ============================ */
  let detalle = null;
  const subsDet = new Set();
  const abrirDetalle = (x) => { detalle = x; subsDet.forEach((f) => f()); };
  function tocarFila(e, tipo, rec) {
    if (e.target.closest && e.target.closest("button,a,input,select,textarea")) return;
    abrirDetalle({ tipo, id: rec.id });
  }
  const TITULO_TIPO = { gasto: "Gasto", ingreso: "Ingreso", evento: "Sanidad", trabajo: "Actividad" };
  const nombrePlan = (a, id) => { const p = ((a && a.plan) || []).find((x) => x.id === id) || (typeof Vg !== "undefined" ? Vg : []).find((x) => x.id === id); return p ? p.nombre : (id || ""); };

  function Dato({ l, children }) {
    if (children === null || children === undefined || children === "" || children === false) return null;
    return (
      <div className="flex gap-3 py-2.5" style={{ borderTop: "1px solid " + C.linea }}>
        <span className="shrink-0 text-sm" style={{ color: C.tinta2, width: 120 }}>{l}</span>
        <span className="flex-1 min-w-0 text-sm font-semibold" style={{ color: C.tinta, wordBreak: "break-word" }}>{children}</span>
      </div>
    );
  }

  function DetalleHost() {
    const sel = useSyncExternalStore((f) => { subsDet.add(f); return () => subsDet.delete(f); }, () => detalle);
    usar();
    const a = datosActuales;
    const rec = sel && a && (a[COLECCION[sel.tipo]] || []).find((r) => r.id === sel.id);
    useEffect(() => { if (sel && !rec) abrirDetalle(null); }, [sel, rec]);
    if (!sel || !rec) return null;
    const cerrar = () => abrirDetalle(null);
    const idx = he(a.caballos || []);
    const caballoBtn = (id) => idx[id] ? <button className="underline" style={{ color: C.azul }} onClick={() => { cerrar(); irActual && irActual("caballo", id); }}>{P(idx[id])}</button> : null;
    const plata = puede("dinero");
    const t = sel.tipo;
    let titulo = "", sub = "", monto = null, filas = null, caballoId = null;
    if (t === "gasto") {
      titulo = rec.detalle || rec.categoria; sub = rec.categoria; monto = rec.monto;
      const asig = rec.asignacion || {};
      if (asig.tipo === "caballo") caballoId = asig.ref;
      filas = (<>
        <Dato l="Fecha">{ga(rec.fecha)}</Dato>
        <Dato l="Categoría">{rec.categoria}</Dato>
        <Dato l="Proveedor">{rec.proveedor}</Dato>
        <Dato l="Se le carga a">{asig.tipo === "caballo" ? caballoBtn(asig.ref) : (typeof Tn === "function" ? Tn(rec, a) : "")}</Dato>
        <Dato l="Desde">{rec.desde}</Dato>
        <Dato l="Hasta">{rec.hasta}</Dato>
        <Dato l="DTE">{rec.dte}</Dato>
        <Dato l="Transportista">{rec.transportista}</Dato>
        <Dato l="Comprobante">{rec.comprobante ? <button className="underline" style={{ color: C.azul }} onClick={() => gActual && gActual.abrirComprobante(rec)}>Ver foto</button> : null}</Dato>
      </>);
    } else if (t === "ingreso") {
      titulo = rec.detalle || rec.categoria; sub = rec.categoria; monto = rec.monto; caballoId = rec.caballoId;
      filas = (<>
        <Dato l="Fecha">{ga(rec.fecha)}</Dato>
        <Dato l="Categoría">{rec.categoria}</Dato>
        <Dato l="De quién">{rec.contraparte}</Dato>
        <Dato l="Caballo">{rec.caballoId ? caballoBtn(rec.caballoId) : null}</Dato>
      </>);
    } else if (t === "evento") {
      titulo = nombrePlan(a, rec.tipo); sub = idx[rec.caballoId] ? P(idx[rec.caballoId]) : ""; caballoId = rec.caballoId;
      filas = (<>
        <Dato l="Caballo">{caballoBtn(rec.caballoId)}</Dato>
        <Dato l="Fecha">{ga(rec.fecha)}</Dato>
        <Dato l="Producto">{rec.producto}</Dato>
        <Dato l="Profesional">{rec.profesional}</Dato>
        <Dato l="Próxima">{rec.proximaFecha ? ga(rec.proximaFecha) : null}</Dato>
        <Dato l="Costo">{plata && Number(rec.costo) ? ra(rec.costo) : null}</Dato>
        <Dato l="Detalle">{rec.detalle}</Dato>
      </>);
    } else if (t === "trabajo") {
      const tt = (typeof eo !== "undefined" ? eo : []).find((x) => x.id === rec.tipo);
      const items = rec.items || [];
      titulo = tt ? tt.l : rec.tipo; sub = items.length + (items.length === 1 ? " caballo" : " caballos");
      filas = (<>
        <Dato l="Fecha">{ga(rec.fecha)}</Dato>
        <Dato l="Lugar">{rec.lugar}</Dato>
        <Dato l="Jinete">{rec.jinete}</Dato>
        <Dato l="Caballos">{items.length ? <div className="space-y-1">{items.map((it) => <div key={it.caballoId} className="flex justify-between gap-2"><span>{caballoBtn(it.caballoId) || "—"}</span><span style={{ color: C.tinta2, fontWeight: 500 }}>{it.montadas} {Number(it.montadas) === 1 ? "montada" : "montadas"}</span></div>)}</div> : null}</Dato>
      </>);
    }
    const borrable = !rec.deEvento && !rec.deVenta && puedeBorrar(t, rec);
    return (
      <Hoja abierto cerrar={cerrar} titulo={TITULO_TIPO[t] || "Detalle"} ancho={520}>
        <div className="p-5">
          <p className="font-bold" style={{ color: C.tinta, fontSize: 21, lineHeight: 1.25 }}>{titulo}</p>
          {sub && sub !== titulo ? <p className="text-sm mt-0.5" style={{ color: C.tinta2 }}>{sub}</p> : null}
          {monto !== null && plata ? <p className="font-bold mt-2" style={{ color: t === "ingreso" ? C.ok : C.tinta, fontSize: 26 }}>{ra(monto)}</p> : null}
          <div className="mt-3">
            {filas}
            <Dato l="Notas">{rec.notas}</Dato>
            <Dato l="Cargado por">{rec.quien}</Dato>
            {rec.deEvento ? <Dato l="Origen">Sale de un registro de sanidad</Dato> : null}
            {rec.deVenta ? <Dato l="Origen">Sale de una venta</Dato> : null}
          </div>
          <div className="grid gap-2 mt-4" style={{ gridTemplateColumns: borrable && caballoId && idx[caballoId] ? "1fr 1fr" : "1fr" }}>
            {caballoId && idx[caballoId] && t !== "trabajo" ? <Boton tono="sec" onClick={() => { cerrar(); irActual && irActual("caballo", caballoId); }}>Ver el caballo</Boton> : null}
            {borrable ? <Boton tono="peligro" onClick={() => { cerrar(); gActual && gActual.borrar(t, rec.id, titulo); }}>Borrar</Boton> : null}
          </div>
        </div>
      </Hoja>
    );
  }

  /* ================================ CALENDARIO ================================ */
  const TIPOS_CAL = [
    { id: "nac", l: "Nacimientos", c: "#1B7A4B", bg: "#E6F4EC", ic: "★" },
    { id: "san", l: "Sanidad", c: "#2E8B8B", bg: "#E3F2F2", ic: "+" },
    { id: "ale", l: "Alertas", c: "#B93A2B", bg: "#FAEAE7", ic: "!" },
    { id: "hit", l: "Hitos (destete, doma, cumpleaños)", lc: "Hitos", c: "#B87209", bg: "#FCF1E0", ic: "◆" },
  ];
  const tipoCal = (id) => TIPOS_CAL.find((t) => t.id === id);
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const DIAS_SEM = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const iso = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  const fechaDe = (s) => new Date(s + "T12:00:00");
  const sumarMeses = (s, n) => { const dt = fechaDe(s); const dia = dt.getDate(); dt.setDate(1); dt.setMonth(dt.getMonth() + n); const ult = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate(); dt.setDate(Math.min(dia, ult)); return iso(dt); };
  const hoyISO = () => iso(new Date());
  const diasHasta = (s) => Math.round((fechaDe(s) - fechaDe(hoyISO())) / 864e5);
  const cuandoTexto = (s) => { const n = diasHasta(s); return n === 0 ? "Hoy" : n === 1 ? "Mañana" : n === -1 ? "Ayer" : n > 0 ? `en ${n} d` : `hace ${-n} d`; };
  const diaLargo = (s) => { const dt = fechaDe(s); const t = dt.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }); return t[0].toUpperCase() + t.slice(1); };

  function eventosCalendario(a, desde, hasta) {
    const ev = [];
    const en = (f) => f && f >= desde && f <= hasta;
    const propios = (a.caballos || []).filter((c) => !c.ficha);
    const activos = propios.filter((c) => !c.vendido);
    propios.forEach((c) => { if (en(c.nacimiento)) ev.push({ id: "n" + c.id, fecha: c.nacimiento, tipo: "nac", titulo: "Nació " + P(c), sub: [c.sexo === "H" ? "Hembra" : c.sexo === "M" ? "Macho" : "", c.pelaje].filter(Boolean).join(" · "), caballoId: c.id }); });
    activos.forEach((c) => {
      if (!c.nacimiento) return;
      const destete = sumarMeses(c.nacimiento, 6), doma = sumarMeses(c.nacimiento, 30);
      if (en(destete)) ev.push({ id: "d" + c.id, fecha: destete, tipo: "hit", titulo: "Destete · " + P(c), sub: "Cumple 6 meses", caballoId: c.id });
      if (en(doma)) ev.push({ id: "m" + c.id, fecha: doma, tipo: "hit", titulo: "Inicio de doma · " + P(c), sub: "Cumple 2 años y medio", caballoId: c.id });
      const y0 = fechaDe(desde).getFullYear(), y1 = fechaDe(hasta).getFullYear();
      for (let y = y0; y <= y1; y++) {
        const nac = fechaDe(c.nacimiento), edad = y - nac.getFullYear();
        if (edad < 1) continue;
        const f = sumarMeses(c.nacimiento, edad * 12);
        if (en(f)) ev.push({ id: "c" + c.id + y, fecha: f, tipo: "hit", titulo: `Cumple ${edad} · ${P(c)}`, sub: "Cumpleaños", caballoId: c.id });
      }
    });
    if (puede("sanidad")) {
      (a.eventos || []).forEach((e) => { if (en(e.fecha)) ev.push({ id: "e" + e.id, fecha: e.fecha, tipo: "san", titulo: nombrePlan(a, e.tipo), sub: idxCal(a)[e.caballoId] ? P(idxCal(a)[e.caballoId]) : "", caballoId: e.caballoId, registro: e }); });
      if (typeof su === "function") activos.forEach((c) => {
        su(c, a.eventos || [], a.plan || [], a.lotes || []).forEach((it) => {
          if (en(it.proxima)) ev.push({ id: "v" + c.id + it.id, fecha: it.proxima, tipo: "san", titulo: "Vence " + it.nombre.toLowerCase(), sub: P(c), caballoId: c.id, vence: true });
        });
      });
    }
    (a.alertas || []).forEach((al) => { if (!al.hecha && en(al.fecha)) ev.push({ id: "a" + al.id, fecha: al.fecha, tipo: "ale", titulo: al.titulo, sub: al.detalle || "Alerta", alerta: al }); });
    const orden = { ale: 0, san: 1, nac: 2, hit: 3 };
    return ev.sort((x, y) => x.fecha.localeCompare(y.fecha) || orden[x.tipo] - orden[y.tipo] || x.titulo.localeCompare(y.titulo));
  }
  let _idxA = null, _idx = null;
  const idxCal = (a) => { if (_idxA !== a) { _idxA = a; _idx = he(a.caballos || []); } return _idx; };

  function useAncho() {
    const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
    useEffect(() => { const f = () => setW(window.innerWidth); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
    return w;
  }

  function FilaEvento({ e, abrir, conCuando }) {
    const t = tipoCal(e.tipo);
    return (
      <button onClick={() => abrir(e)} className="cr-tap cr-row flex items-center gap-3 w-full text-left px-4 py-2.5" style={{ borderTop: "1px solid " + C.linea }}>
        <span className="flex items-center justify-center font-bold shrink-0" style={{ width: 34, height: 34, borderRadius: 10, background: t.bg, color: t.c, fontSize: 15 }}>{t.ic}</span>
        <span className="flex-1 min-w-0">
          <span className="block font-semibold truncate" style={{ color: C.tinta, fontSize: 14 }}>{e.titulo}</span>
          {e.sub ? <span className="block truncate" style={{ color: C.tinta2, fontSize: 12 }}>{e.sub}</span> : null}
        </span>
        {conCuando ? <span className="shrink-0 font-bold" style={{ fontSize: 12, color: diasHasta(e.fecha) < 0 && e.vence ? C.mal : t.c }}>{cuandoTexto(e.fecha)}</span> : null}
      </button>
    );
  }

  function Calendario({ datos, ir, acc }) {
    const ancho = useAncho();
    const movil = ancho < 768;
    const hoy = hoyISO();
    const [mes, setMes] = useState(() => { const d0 = new Date(); return new Date(d0.getFullYear(), d0.getMonth(), 1); });
    const [sel, setSel] = useState(hoy);
    const [vista, setVista] = useState("mes");
    const [ocultos, setOcultos] = useState([]);
    const [caballo, setCaballo] = useState("");
    const [avisoEl, aviso] = useAviso();
    const a = datos;

    const primero = new Date(mes), corrimiento = (primero.getDay() + 6) % 7;
    const inicioGrilla = new Date(primero); inicioGrilla.setDate(1 - corrimiento);
    const celdas = Array.from({ length: 42 }, (_, i) => { const dt = new Date(inicioGrilla); dt.setDate(inicioGrilla.getDate() + i); return iso(dt); });
    const desdeMes = iso(primero), hastaMes = iso(new Date(mes.getFullYear(), mes.getMonth() + 1, 0));
    const todos = eventosCalendario(a, celdas[0], celdas[41] > iso(new Date(Date.now() + 60 * 864e5)) ? celdas[41] : iso(new Date(Date.now() + 60 * 864e5)));
    const visibles = todos.filter((e) => !ocultos.includes(e.tipo) && (!caballo || e.caballoId === caballo));
    const porDia = {};
    visibles.forEach((e) => { (porDia[e.fecha] = porDia[e.fecha] || []).push(e); });
    const delMes = visibles.filter((e) => e.fecha >= desdeMes && e.fecha <= hastaMes);
    const proximos = visibles.filter((e) => e.fecha > hoy).slice(0, 8);
    const delDia = porDia[sel] || [];
    const tiposVisibles = TIPOS_CAL.filter((t) => t.id !== "san" || puede("sanidad"));
    const caballos = ke(a.caballos || []).slice().sort((x, y) => P(x).localeCompare(P(y)));

    const abrir = (e) => {
      if (e.registro) return abrirDetalle({ tipo: "evento", id: e.registro.id });
      if (e.alerta) return acc && acc.editarAlerta ? acc.editarAlerta(e.alerta) : null;
      if (e.caballoId) return ir("caballo", e.caballoId);
    };
    const mover = (n) => { const m2 = new Date(mes.getFullYear(), mes.getMonth() + n, 1); setMes(m2); setSel(m2.getMonth() === new Date().getMonth() && m2.getFullYear() === new Date().getFullYear() ? hoy : iso(m2)); };
    const irHoy = () => { const d0 = new Date(); setMes(new Date(d0.getFullYear(), d0.getMonth(), 1)); setSel(hoy); };
    const exportar = () => {
      const desde = hoy, hasta = iso(new Date(Date.now() + 365 * 864e5));
      const lista = eventosCalendario(a, desde, hasta).filter((e) => !ocultos.includes(e.tipo) && (!caballo || e.caballoId === caballo))
        .map((e) => ({ id: e.id, fecha: e.fecha, titulo: e.titulo, detalle: e.sub || "" }));
      if (!lista.length) return aviso("No hay eventos para pasar");
      Lt("criar-calendario.ics", Pg(lista, "CriAr"), "text/calendar;charset=utf-8");
      aviso(`Listo: ${lista.length} eventos del próximo año. Abrí el archivo para sumarlos a tu calendario`);
    };
    const tituloMes = MESES[mes.getMonth()][0].toUpperCase() + MESES[mes.getMonth()].slice(1) + " " + mes.getFullYear();
    const cuenta = (t) => delMes.filter((e) => e.tipo === t && (t !== "san" || e.vence)).length;

    const filtros = (
      <div className="flex gap-1.5 flex-wrap items-center">
        {tiposVisibles.map((t) => {
          const off = ocultos.includes(t.id);
          return (
            <button key={t.id} onClick={() => setOcultos(off ? ocultos.filter((x) => x !== t.id) : [...ocultos, t.id])} className="cr-tap flex items-center gap-1.5 font-semibold"
              style={{ padding: "5px 11px", borderRadius: 99, fontSize: 12.5, border: "1px solid " + C.linea, background: off ? C.campo : "#fff", color: off ? "#A9BBCE" : C.tinta, textDecoration: off ? "line-through" : "none" }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: off ? "#C9D6E4" : t.c }} />{movil ? (t.lc || t.l) : t.l}
            </button>
          );
        })}
        <select value={caballo} onChange={(e) => setCaballo(e.target.value)} className="cr-tap font-semibold" style={{ padding: "5px 10px", borderRadius: 99, fontSize: 12.5, border: "1px solid " + C.linea, background: caballo ? C.azulSuave : "#fff", color: caballo ? C.azul : C.tinta2, maxWidth: 190 }}>
          <option value="">Todos los caballos</option>
          {caballos.map((c) => <option key={c.id} value={c.id}>{P(c)}</option>)}
        </select>
      </div>
    );

    const panelDia = (
      <Tarjeta className="overflow-hidden">
        <p className="font-bold px-4 pt-3.5 pb-2" style={{ color: C.tinta, fontSize: 16 }}>{diaLargo(sel)}{sel === hoy ? " · hoy" : ""}</p>
        {delDia.length ? delDia.map((e) => <FilaEvento key={e.id} e={e} abrir={abrir} />) : <p className="px-4 pb-4 text-sm" style={{ color: C.tinta2 }}>Nada para este día.</p>}
      </Tarjeta>
    );
    const panelProximos = (
      <Tarjeta className="overflow-hidden">
        <p className="px-4 pt-3 pb-1.5 font-bold uppercase" style={{ color: C.tinta2, fontSize: 11, letterSpacing: ".05em" }}>Próximos días</p>
        {proximos.length ? proximos.map((e) => <FilaEvento key={e.id} e={e} abrir={abrir} conCuando />) : <p className="px-4 pb-4 text-sm" style={{ color: C.tinta2 }}>Nada en los próximos dos meses.</p>}
      </Tarjeta>
    );

    const cabecera = (
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <button onClick={() => mover(-1)} className="cr-tap flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 10, background: C.campo, color: C.tinta2 }} aria-label="Mes anterior"><IcAtras size={18} /></button>
        <p className="font-bold text-center" style={{ color: C.tinta, fontSize: movil ? 17 : 19, minWidth: movil ? 0 : 180, flex: movil ? 1 : "none" }}>{tituloMes}</p>
        <button onClick={() => mover(1)} className="cr-tap flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 10, background: C.campo, color: C.tinta2 }} aria-label="Mes siguiente"><IcFlecha size={18} /></button>
        {!movil ? <>
          <Boton tono="sec" chico onClick={irHoy}>Hoy</Boton>
          <div style={{ flex: 1 }} />
          <FilaSelect valor={vista} onChange={setVista} opciones={[{ id: "mes", l: "Mes" }, { id: "lista", l: "Lista" }]} />
          <Boton tono="sec" chico onClick={exportar}>Pasar a Google / iPhone</Boton>
        </> : null}
      </div>
    );

    const lista = (
      <div>
        {delMes.length ? Object.entries(delMes.reduce((acc2, e) => { (acc2[e.fecha] = acc2[e.fecha] || []).push(e); return acc2; }, {})).map(([f, es]) => (
          <div key={f}>
            <p className="px-4 pt-3 pb-1 font-bold" style={{ color: f === hoy ? C.azul : C.tinta, fontSize: 14 }}>{diaLargo(f)}{f === hoy ? " · hoy" : ""}</p>
            {es.map((e) => <FilaEvento key={e.id} e={e} abrir={abrir} />)}
          </div>
        )) : <p className="p-4 text-sm" style={{ color: C.tinta2 }}>Nada en {tituloMes.toLowerCase()}.</p>}
      </div>
    );

    return (
      <div>
        <Banda titulo="Calendario" bajada={movil ? `${delMes.length} eventos en ${MESES[mes.getMonth()]}` : "Nacimientos, sanidad, alertas e hitos de la cría"} onLogo={() => ir("inicio")}
          accion={movil ? <Boton tono="claro" chico onClick={exportar}>Pasar al teléfono</Boton> : null}
          metricas={movil ? undefined : [{ l: "Este mes", v: delMes.length }, { l: "Nacimientos", v: cuenta("nac") }, { l: "Sanidad que vence", v: cuenta("san"), color: cuenta("san") ? "#FFB4A8" : undefined }, { l: "Alertas", v: cuenta("ale") }]} />
        <div className="p-4" style={{ marginTop: -14 }}>
          {movil ? (
            <div className="space-y-3">
              <Tarjeta className="p-3">
                {cabecera}
                <div className="grid" style={{ gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center" }}>
                  {["L", "M", "M", "J", "V", "S", "D"].map((x, i) => <span key={i} style={{ fontSize: 11, fontWeight: 700, color: C.tinta2, padding: "4px 0" }}>{x}</span>)}
                  {celdas.map((f) => {
                    const fuera = f < desdeMes || f > hastaMes, es = porDia[f] || [], activo = f === sel;
                    const colores = [...new Set(es.map((e) => e.tipo))].slice(0, 4);
                    return (
                      <button key={f} onClick={() => setSel(f)} className="cr-tap flex flex-col items-center" style={{ height: 46, paddingTop: 6, gap: 3, borderRadius: 12, background: activo ? C.azul : f === hoy ? C.azulSuave : "transparent", color: activo ? "#fff" : fuera ? "#B5C3D3" : C.tinta, fontWeight: 700, fontSize: 14 }}>
                        {Number(f.slice(8))}
                        <span className="flex" style={{ gap: 2, height: 6 }}>{colores.map((t) => <span key={t} style={{ width: 5, height: 5, borderRadius: "50%", background: activo ? "#fff" : tipoCal(t).c, opacity: fuera ? 0.5 : 1 }} />)}</span>
                      </button>
                    );
                  })}
                </div>
              </Tarjeta>
              <div style={{ overflowX: "auto" }}>{filtros}</div>
              {panelDia}
              {panelProximos}
            </div>
          ) : (
            <div className="flex gap-3 items-start">
              <Tarjeta className="p-4" style={{ flex: 1, minWidth: 0 }}>
                {cabecera}
                <div className="mb-3">{filtros}</div>
                {vista === "lista" ? <div style={{ border: "1px solid " + C.linea, borderRadius: 12, overflow: "hidden" }}>{lista}</div> : (
                  <div className="grid" style={{ gridTemplateColumns: "repeat(7,minmax(0,1fr))", border: "1px solid " + C.linea, borderRadius: 12, overflow: "hidden" }}>
                    {DIAS_SEM.map((x) => <div key={x} style={{ fontSize: 11, fontWeight: 700, color: C.tinta2, textTransform: "uppercase", letterSpacing: ".05em", padding: "7px 8px", background: C.campo, borderBottom: "1px solid " + C.linea }}>{x}</div>)}
                    {celdas.map((f, i) => {
                      const fuera = f < desdeMes || f > hastaMes, es = porDia[f] || [], activo = f === sel;
                      return (
                        <div key={f} onClick={() => setSel(f)} className="cr-tap" style={{ minHeight: 108, padding: "5px 6px", borderRight: (i + 1) % 7 ? "1px solid " + C.linea : "none", borderBottom: i < 35 ? "1px solid " + C.linea : "none", background: activo ? "#F3F8FE" : "#fff", cursor: "pointer", display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                          <span className="flex items-center justify-center" style={{ width: 24, height: 24, borderRadius: "50%", fontSize: 12.5, fontWeight: 700, background: f === hoy ? C.azul : "transparent", color: f === hoy ? "#fff" : fuera ? "#B5C3D3" : C.tinta, outline: activo && f !== hoy ? "2px solid " + C.azul : "none" }}>{Number(f.slice(8))}</span>
                          {es.slice(0, 3).map((e) => {
                            const t = tipoCal(e.tipo);
                            return <button key={e.id} onClick={(ev) => { ev.stopPropagation(); abrir(e); }} title={e.titulo + (e.sub ? " · " + e.sub : "")} className="text-left font-semibold"
                              style={{ fontSize: 11.5, padding: "2px 6px", borderRadius: 6, background: t.bg, color: t.c, borderLeft: "3px solid " + t.c, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: fuera ? 0.55 : 1 }}>{e.titulo}</button>;
                          })}
                          {es.length > 3 ? <span style={{ fontSize: 11, color: C.tinta2, fontWeight: 600, paddingLeft: 4 }}>+{es.length - 3} más</span> : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Tarjeta>
              <div className="space-y-3" style={{ width: 340, flexShrink: 0 }}>
                {panelDia}
                {panelProximos}
              </div>
            </div>
          )}
        </div>
        {avisoEl}
      </div>
    );
  }

  /* ----------------------- botón de cuenta en el menú ----------------------- */
  function BotonCuenta({ ir, activo, enMas }) {
    const s = usar();
    const u = usuarioActual(s), c = criaActual(s), m = miembroEfectivo(s);
    if (!u) return null;
    return (
      <button onClick={() => ir("cuenta")} className={"cr-tap flex items-center gap-3 w-full text-left " + (enMas ? "px-4 py-3 mb-2" : "px-3 py-2.5 mb-1")}
        style={{ borderRadius: enMas ? 14 : 12, background: activo === "cuenta" ? C.azulSuave : enMas ? C.campo : "transparent", border: enMas ? "none" : "1px solid " + C.linea }}>
        <Avatar persona={u} tam={enMas ? 38 : 34} />
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate" style={{ color: C.tinta, fontSize: 14 }}>{nombreDe(u)}</p>
          <p className="truncate" style={{ color: C.tinta2, fontSize: 12 }}>{c ? c.nombre : ""}{m ? " · " + rolNombre(m.rol) : ""}</p>
        </div>
      </button>
    );
  }
  const botonCuenta = (ir, activo, enMas) => <BotonCuenta key="cuenta" ir={ir} activo={activo} enMas={enMas} />;

  const accesoRapido = (l) => l === "Cargar actividad" ? puede("actividad", "carga") : l === "Cargar sanidad" ? puede("sanidad", "carga") : l === "Cargar gasto" ? puede("dinero", "carga") : l === "Agregar caballo" ? puede("caballos", "todo") : true;
  const IcCalendario = F("calendar-days", [["path", { d: "M8 2v4", key: "a" }], ["path", { d: "M16 2v4", key: "b" }], ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "c" }], ["path", { d: "M3 10h18", key: "d" }], ["path", { d: "M8 14h.01", key: "e" }], ["path", { d: "M12 14h.01", key: "f" }], ["path", { d: "M16 14h.01", key: "g" }], ["path", { d: "M8 18h.01", key: "h" }], ["path", { d: "M12 18h.01", key: "i" }]]);
  return { Puerta, Equipo, Calendario, IcCalendario, accesoRapido, proteger, tocarFila, puedeAgregarCaballo: () => puede("caballos", "todo"), MiCuenta, botonCuenta, IcEquipo, navOk, puede, quien, claveDatos, semilla, usar,
    _prueba: { get: () => estado, cambiar, PLANTILLA, permisosDe } };
})();
