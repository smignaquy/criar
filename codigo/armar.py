import sys
b=open('bundle.js').read(); ext=open('ext.js').read()
def rep(old,new,count=1):
    global b
    n=b.count(old)
    assert n==count, (old[:60], n)
    b=b.replace(old,new)
rep('function Tf(){let[a,e]=(0,R.useState)(null)', ext+'\nfunction Tf(){let[a,e]=(0,R.useState)(null)')
rep('(0,ax.jsx)(Tf,{})','(0,ax.jsx)(CRX.Puerta,{})')
rep('window.storage.get(Zg)','window.storage.get(CRX.claveDatos())')
rep('window.storage.set(Zg','window.storage.set(CRX.claveDatos()')
rep('let X=Ss();e(X),Eg(X)','let X=CRX.semilla(Ss);e(X),Eg(X)')
rep('a.config.quien||""','CRX.quien(a)',7)
rep('verDinero:!a.config.clave||v','verDinero:(!a.config.clave||v)&&CRX.puede("dinero")')
rep('{id:"alertas",l:"Alertas",i:Zl},{id:"ajustes",l:"Ajustes",i:In}],da=','{id:"alertas",l:"Alertas",i:Zl},{id:"equipo",l:"Equipo",i:CRX.IcEquipo},{id:"ajustes",l:"Ajustes",i:In}].filter(CRX.navOk),da=')
rep('Q.find(A=>A.id==="trabajo"),Q.find(A=>A.id==="dinero"),{id:"mas"','Q.find(A=>A.id==="trabajo")||Q.find(A=>A.id==="sanidad"),Q.find(A=>A.id==="dinero")||Q.find(A=>A.id==="alertas"),{id:"mas"')
rep('"Buscar"]}),Q.map(','"Buscar"]}),CRX.botonCuenta(L,sa,!1),Q.map(')
rep('children:[(0,u.jsx)(gt,{size:20}),"Buscar en todo"]})','children:[(0,u.jsx)(gt,{size:20}),"Buscar en todo"]}),CRX.botonCuenta(L,sa,!0)')
rep('children:[t==="inicio"?','children:[t==="equipo"?R.createElement(CRX.Equipo,La):null,t==="cuenta"?R.createElement(CRX.MiCuenta,La):null,t==="inicio"?')
rep('(0,u.jsx)("div",{className:"mt-auto px-3 py-3",children:(0,u.jsx)(_,{tono:"pri",icono:ha,ancho:!0,onClick:G.nuevoCaballo,children:"Agregar caballo"})})','CRX.puedeAgregarCaballo()?(0,u.jsx)("div",{className:"mt-auto px-3 py-3",children:(0,u.jsx)(_,{tono:"pri",icono:ha,ancho:!0,onClick:G.nuevoCaballo,children:"Agregar caballo"})}):null')
rep('fn:()=>t.nuevoCaballo(),color:"#B87209"}];return','fn:()=>t.nuevoCaballo(),color:"#B87209"}].filter(it=>CRX.accesoRapido(it.l));return')
rep('G={nuevoCaballo:','G=CRX.proteger({nuevoCaballo:')
rep('accion:()=>V(A,U)})},Ka=','accion:()=>V(A,U)})},a,L),Ka=')
rep('style:{maxWidth:1240}','style:{maxWidth:"none"}')
rep('{id:"gastos",l:"Dinero"},','...CRX.puede("dinero")?[{id:"gastos",l:"Dinero"}]:[],')
rep('{l:"Gasto",d:"Herrer\\xEDa, veterinario",i:jt,fn:()=>G.nuevoGasto(r.id),color:"#6C6FBF"}','...CRX.puede("dinero","carga")?[{l:"Gasto",d:"Herrer\\xEDa, veterinario",i:jt,fn:()=>G.nuevoGasto(r.id),color:"#6C6FBF"}]:[]')
import re as _re
_n=0
for _m in list(_re.finditer(r'[a-z]\.borrar\("(gasto|ingreso|trabajo|evento)",([A-Za-z]{1,2})\.id', b))[::-1]:
    _tipo,_var=_m.group(1),_m.group(2)
    _st=max(b.rfind('.map(('+_var+',',0,_m.start()), b.rfind('.map('+_var+'=>',0,_m.start()))
    if _m.start()-_st>2000: continue
    _k=b.index('("div",{',_st)+len('("div",{')
    b=b[:_k]+'onClick:__e=>CRX.tocarFila(__e,"%s",%s),"data-fila":"",'%(_tipo,_var)+b[_k:]
    _n+=1
assert _n==7, _n
rep('(0,u.jsx)(_,{chico:!0,tono:"pri",icono:ht,onClick:()=>o.editar(f),children:"Editar"}),','CRX.puede("caballos","todo")?(0,u.jsx)(_,{chico:!0,tono:"pri",icono:ht,onClick:()=>o.editar(f),children:"Editar"}):null,')
rep('...f.sexo==="H"&&!f.ficha?[{l:"Cargar potrillo"','...f.sexo==="H"&&!f.ficha&&CRX.puede("caballos","todo")?[{l:"Cargar potrillo"')
rep('...!h&&!f.ficha?[{l:"Registrar venta"','...!h&&!f.ficha&&CRX.puede("dinero","carga")?[{l:"Registrar venta"')
rep('(0,u.jsxs)("button",{onClick:()=>{r(!1),o.borrarCaballo(f)}','CRX.puede("caballos","todo")&&(0,u.jsxs)("button",{onClick:()=>{r(!1),o.borrarCaballo(f)}')
rep('...w.map(L=>({fecha:L.fecha,tipo:L.categoria,','...(CRX.puede("dinero")?w:[]).map(L=>({fecha:L.fecha,tipo:L.categoria,')
rep('h&&{fecha:h.fecha,tipo:"Venta"','h&&CRX.puede("dinero")&&{fecha:h.fecha,tipo:"Venta"')
rep('className:"cr-tap cr-card text-left p-3.5 flex flex-col gap-2"','className:"cr-tap cr-card cr-rapido text-left p-3.5 flex flex-col gap-2"',2)
h=open('CriAr_12.html').read()
i=h.index('<script>')+8; j=h.rindex('</script>')
out=h[:i]+b+h[j:]
out=out.replace('</style>','@media (max-width:767px){.cr-rapido{align-items:center;text-align:center;justify-content:center}}[data-fila]{cursor:pointer;transition:background .12s}[data-fila]:hover{background:#F3F7FC}</style>',1)
open(sys.argv[1],'w').write(out)
print('ok', len(out)//1024,'KB')
