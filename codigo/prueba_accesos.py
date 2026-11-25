import asyncio, re, json
from playwright.async_api import async_playwright
ARCH="file:///home/claude/criar/CriAr_15.html"
async def cuenta(pg, nom, ape, tel, crear=True):
    if crear:
        await pg.click("text=Crear cuenta"); await pg.fill("input[placeholder=Juan]",nom); await pg.fill("input[placeholder='Pérez']",ape)
    else:
        await pg.click("text=Ya tengo cuenta, entrar")
    await pg.fill("input[placeholder='11 2345 6789']",tel); await pg.click("text=Mandarme el código")
    cod = re.search(r"es (\d{6})", await pg.inner_text("body")).group(1)
    await pg.fill("input[aria-label='Código']", cod); await pg.click("text=Crear mi cuenta" if crear else "button:text-is('Entrar')"); await pg.wait_for_timeout(400)
def ok(c,m): print(("  ok  " if c else "  MAL ")+m)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        pg = await (await b.new_context(viewport={"width":1600,"height":900})).new_page()
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(ARCH); await pg.wait_for_timeout(600)
        await cuenta(pg,"Santiago","Mignaquy","1155551111")
        await pg.click("text=Crear mi cría"); await pg.fill("input[placeholder='Haras Tango']","Tango"); await pg.click("text=Crear la cría"); await pg.wait_for_timeout(900)
        # ancho completo
        w = await pg.evaluate("document.querySelector('main > div').getBoundingClientRect().width")
        mw = await pg.evaluate("document.querySelector('main').getBoundingClientRect().width")
        ok(abs(w-mw)<2, f"el contenido ocupa todo el ancho ({int(w)} de {int(mw)} px)")
        # detalle de gasto
        await pg.click("aside >> text='Dinero'"); await pg.wait_for_timeout(300)
        await pg.click("main button:text-is('Gastos')"); await pg.wait_for_timeout(300)
        await pg.screenshot(path="f0_dinero.png")
        await pg.click("main [data-fila] >> nth=0"); await pg.wait_for_timeout(300)
        t = await pg.locator(".fixed:visible").last.inner_text()
        ok("Gasto" in t and "Proveedor" in t and "Fecha" in t, "tocar un gasto abre su detalle")
        await pg.screenshot(path="f1_detalle_gasto.png")
        await pg.click(".fixed button[aria-label=Cerrar]"); await pg.wait_for_timeout(200)
        # detalle de sanidad
        await pg.click("aside >> text='Sanidad'"); await pg.wait_for_timeout(300)
        await pg.click("main button:text-is('Historial')"); await pg.wait_for_timeout(300)
        n = await pg.locator("main [data-fila]").count()
        if n:
            await pg.click("main [data-fila] >> nth=0"); await pg.wait_for_timeout(300)
            t = await pg.locator(".fixed:visible").last.inner_text(); ok("Caballo" in t and "Fecha" in t, "tocar un registro de sanidad abre su detalle")
            await pg.screenshot(path="f2_detalle_sanidad.png")
            await pg.click(".fixed button[aria-label=Cerrar]"); await pg.wait_for_timeout(200)
        else: print("  (sanidad sin filas tocables en esta vista)")
        # detalle de actividad
        await pg.click("aside >> text='Actividad'"); await pg.wait_for_timeout(300)
        await pg.click("main button:text-is('Por jornada')"); await pg.wait_for_timeout(300)
        n = await pg.locator("main [data-fila]").count()
        if n:
            await pg.click("main [data-fila] >> nth=0"); await pg.wait_for_timeout(300)
            t = await pg.locator(".fixed:visible").last.inner_text(); ok("Caballos" in t and "montada" in t, "tocar una actividad abre su detalle")
            await pg.screenshot(path="f3_detalle_actividad.png")
            await pg.click(".fixed button[aria-label=Cerrar]"); await pg.wait_for_timeout(200)
        else: print("  (actividad sin filas tocables en esta vista)")
        # invitar petisero
        await pg.click("aside >> text='Equipo'"); await pg.wait_for_timeout(300)
        await pg.click("text=Invitar"); await pg.click(".fixed >> text=Petisero"); await pg.click("text=Crear link"); await pg.wait_for_timeout(200)
        link = re.search(r"file://\S+#invitacion=[a-z0-9]+", await pg.locator(".fixed:visible").last.inner_text()).group(0)
        await pg.click(".fixed button[aria-label=Cerrar]")
        await pg.click("aside >> text=Santiago Mignaquy"); await pg.wait_for_timeout(300)
        await pg.locator("main button", has_text="Cerrar sesión").last.click(); await pg.wait_for_timeout(200)
        await pg.locator(".fixed:visible button", has_text="Cerrar sesión").last.click(); await pg.wait_for_timeout(300)
        await pg.goto(link); await pg.wait_for_timeout(500)
        await pg.screenshot(path="f9.png"); await cuenta(pg,"Pedro","Ruiz","1155552222")
        await pg.click("text=Sumarme a Tango"); await pg.wait_for_timeout(800)
        # petisero: perfil de caballo
        await pg.click("aside >> text='Caballos'"); await pg.wait_for_timeout(300)
        await pg.click("main >> text=Tango California >> nth=0"); await pg.wait_for_timeout(400)
        t = await pg.inner_text("main")
        ok("Dinero" not in t, "en el perfil del caballo el petisero no ve la pestaña Dinero")
        await pg.screenshot(path="f4_perfil_petisero.png")
        # intentar cargar gasto por la función protegida
        # menu + en lista
        await pg.click("aside >> text='Caballos'"); await pg.wait_for_timeout(300)
        plus = pg.locator("main button[aria-label='Cargar algo']")
        if await plus.count():
            await plus.first.click(); await pg.wait_for_timeout(250)
            t = await pg.locator(".fixed:visible").last.inner_text(); ok("Gasto" not in t and "Sanidad" in t, "el menú rápido del caballo no ofrece Gasto (sí Sanidad)")
            await pg.locator(".fixed:visible button[aria-label=Cerrar]").last.click(); await pg.wait_for_timeout(200)
        else: print("  (no encontré el + de la lista)")
        # actividad ajena: el petisero tiene "Carga", no puede borrar lo de otro
        await pg.goto(link.split('#')[0]); await pg.wait_for_timeout(700)
        await pg.click("aside >> text='Actividad'"); await pg.wait_for_timeout(300)
        await pg.click("main button:text-is('Por jornada')"); await pg.wait_for_timeout(300)
        nb = await pg.locator("main [data-fila] button[aria-label=Borrar]").count()
        if nb:
            await pg.locator("main [data-fila] button[aria-label=Borrar]").first.click(); await pg.wait_for_timeout(300)
            body = await pg.inner_text("body")
            ok("borrar lo que cargó otro" in body, "no puede borrar una jornada que cargó otro")
            await pg.wait_for_timeout(2800)
        else: print("  (sin botón borrar en jornadas)")
        await pg.click("main [data-fila] >> nth=0"); await pg.wait_for_timeout(300)
        t = await pg.locator(".fixed:visible").last.inner_text()
        ok("Borrar" not in t, "en el detalle de una jornada ajena no aparece Borrar")
        await pg.screenshot(path="f5_detalle_petisero.png")
        await pg.locator(".fixed:visible button[aria-label=Cerrar]").last.click(); await pg.wait_for_timeout(200)
        # sanidad: el petisero tiene "Todo", en el detalle puede borrar
        await pg.click("aside >> text='Sanidad'"); await pg.wait_for_timeout(300)
        await pg.click("main button:text-is('Historial')"); await pg.wait_for_timeout(300)
        await pg.click("main [data-fila] >> nth=0"); await pg.wait_for_timeout(300)
        t = await pg.locator(".fixed:visible").last.inner_text()
        ok("Borrar" in t and "Costo" not in t, "en sanidad (acceso Todo) puede borrar, y no ve el costo")
        print("errores:", errs)
        await b.close()
asyncio.run(main())
