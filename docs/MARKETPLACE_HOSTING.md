# Hosting dinámico del Marketplace

## Estado observado y alcance

Revisión sobre `ef7fec084`, 10 de noviembre de 2026, sin acceso SSH ni cambios al VPS:

| URL pública | Estado observado |
| --- | --- |
| `/marketplace/` | 200, Nginx |
| `/marketplace/publicadores/raulbelloso/` | 404, Nginx |
| `/marketplace/plantillas-studio/cumbre-innovacion-liderazgo-2027/` | 404, Nginx |
| `/marketplace/sitemap.xml` | 404, Nginx |
| Ficha de Cumbre en el Hub | 200, dos previews, paquete de 500632 bytes |

El código declara `output: static` y el adaptador Node standalone. Los perfiles, detalles y sitemap optan por renderizado bajo demanda. El despliegue anterior copiaba sólo `dist/client`: no distribuía `dist/server` ni sus dependencias ni arrancaba Node. El README describía erróneamente una salida enteramente estática. No se inspeccionó el vhost instalado: hay que confirmar su archivo y `root` con `nginx -T` antes de aplicar los comandos.

La solución conserva el resto del sitio estático. Nginx envía sólo los perfiles, detalles de los cuatro tipos y `/marketplace/sitemap.xml` a `127.0.0.1:4398`. No hay fallback SPA ni proxy general. Astro conserva sus 200/404/410/503. Si Node no responde, sólo esas rutas reciben un 503 HTML sin caché y con `noindex`; la portada sigue estática.

## Distribución y transacción

- `prepare` ejecuta **un build**, copia únicamente `dist`, `package.json`, lockfile y snippet, instala dependencias de producción congeladas sin scripts y prueba el artefacto en un puerto temporal. No copia `.env`, checkout, claves ni logs. No activa nada.
- Las releases privadas viven en `/opt/runly-web-runtime/releases/<id>`. El servidor no puede modificarlas y el árbol nunca se sirve como directorio público. Se vinculan cliente, servidor, lockfile y snippet mediante SHA-256 del artefacto. Se comprueban plataforma, arquitectura, versión mayor de Node y enlaces de dependencias dentro de la release.
- `deploy --dry-run` usa el paquete preparado, hace otra comprobación de arranque y muestra el rsync sin cambiar servicio, symlink, Nginx o archivos públicos. No vuelve a compilar ni instalar dependencias.
- `deploy` reutiliza el respaldo y los guardrails de `deploy-static.mjs`, publica los archivos estáticos, cambia `current`, reinicia el servicio, valida/recarga Nginx y comprueba salud local y pública. Conserva el catálogo v1 y los assets con hash anteriores para páginas abiertas durante el cambio. Puede haber un breve 503 dinámico durante el reinicio.
- Un fallo, incluida una copia parcial de rsync, restaura el respaldo estático, runtime anterior, snippet anterior y estado habilitado/activo anterior del servicio. También comprueba la restauración. Un fallo de restauración se informa como `ROLLBACK_FAILED`, nunca como éxito.
- Los journals privados en `transactions` enlazan exactamente el runtime y su respaldo estático. La reversión manual usa ese par. Un intento fallido de reversión intenta recuperar la versión completa que estaba activa.
- El bloqueo impide operaciones simultáneas. Los scripts estáticos antiguos rechazan publicar/revertir sobre un destino ya emparejado con runtime. No se podan backups o releases por separado: revisar espacio y hacer mantenimiento coordinado, conservando las referencias de los journals y la versión actual. No ejecutar limpieza automática de esos directorios.

## Preparación del VPS: una vez

Estos comandos **no se ejecutaron**. Suponen el checkout documentado en `/opt/runly-web`, Ubuntu con systemd/Nginx/rsync, Node compatible con Astro instalado en `/usr/bin/node`, Corepack y espacio para la release y el respaldo. Antes debe llegar al VPS el commit de hosting; `ef7fec084` por sí solo no contiene estos scripts. No se hizo push.

```bash
cd /opt/runly-web
test "$(node -p "require('./package.json').name")" = runly-web
/usr/bin/node --version
corepack --version
rsync --version
sudo nginx -T 2>&1 | grep -nE 'configuration file|server_name|root |marketplace'
```

Confirmar el archivo **real** del server HTTPS que atiende Runly y su `root`. Las siguientes asignaciones reflejan los paths documentados; ajustar sólo si `nginx -T` muestra otros. No crear un segundo server block ni reemplazar TLS, API, charset o ubicaciones existentes.

```bash
RUNLY_WEB_TARGET=/var/www/runly.mx
RUNLY_WEB_VHOST=$(readlink -f /etc/nginx/sites-enabled/runly.mx)
test -f "$RUNLY_WEB_VHOST"
RUNLY_WEB_HOST_BACKUP=$(date -u +%Y%m%dT%H%M%SZ)
sudo cp -p -- "$RUNLY_WEB_VHOST" "$RUNLY_WEB_VHOST.before-marketplace-$RUNLY_WEB_HOST_BACKUP"

getent group runly-web >/dev/null || sudo groupadd --system runly-web
id runly-web >/dev/null 2>&1 || sudo useradd --system --gid runly-web --no-create-home --home-dir /nonexistent --shell /usr/sbin/nologin runly-web
test "$(id -u runly-web)" != 0

sudo install -d -m 755 /opt/runly-web-runtime
if ! sudo test -e /opt/runly-web-runtime/.managed; then
  test -z "$(sudo find /opt/runly-web-runtime -mindepth 1 -maxdepth 1 -print -quit)" || { echo 'Directorio runtime existente sin marca: revisar antes de continuar'; exit 1; }
  printf 'runly-web-runtime-v1\n' | sudo tee /opt/runly-web-runtime/.managed >/dev/null
fi
sudo grep -qx runly-web-runtime-v1 /opt/runly-web-runtime/.managed
sudo install -d -m 755 /opt/runly-web-runtime/releases
sudo install -d -m 700 /opt/runly-web-runtime/transactions

if sudo test -e /etc/systemd/system/runly-web-marketplace.service; then
  sudo cp -p /etc/systemd/system/runly-web-marketplace.service "/etc/systemd/system/runly-web-marketplace.service.before-$RUNLY_WEB_HOST_BACKUP"
fi
sudo install -m 644 infra/runly-web-marketplace.service /etc/systemd/system/runly-web-marketplace.service
sudo systemd-analyze verify /etc/systemd/system/runly-web-marketplace.service
sudo systemctl daemon-reload

sudo install -d -m 755 /etc/nginx/snippets
if ! sudo test -e /etc/nginx/snippets/runly-marketplace.conf; then
  printf '# Runly Marketplace managed (inactive)\n' | sudo tee /etc/nginx/snippets/runly-marketplace.conf >/dev/null
fi
sudo grep -q '^# Runly Marketplace managed' /etc/nginx/snippets/runly-marketplace.conf
```

No iniciar ni habilitar todavía el servicio: aún no hay `current`. Si el snippet ya existe sin esa marca, revisar y respaldar su contenido antes de adoptarlo; no sobrescribirlo con una configuración vacía.

```bash
sudoedit "$RUNLY_WEB_VHOST"
```

Insertar esta línea **dentro del server HTTPS correcto, antes de sus ubicaciones regex genéricas**:

```nginx
include /etc/nginx/snippets/runly-marketplace.conf;
```

El placeholder inicialmente no cambia rutas. Validar y recargar:

```bash
sudo nginx -t && sudo systemctl reload nginx

# Sólo si el destino estático anterior aún no está marcado; no usar --adopt a ciegas:
if ! sudo test -e "$RUNLY_WEB_TARGET/.runly-web-target"; then
  sudo /usr/bin/node scripts/deploy-static.mjs --target "$RUNLY_WEB_TARGET" --adopt --confirm 'ADOPT RUNLY.MX TARGET'
fi
```

## Preparar, revisar y activar una versión

Ejecutar desde `/opt/runly-web`, con el checkout limpio y la configuración pública de build ya revisada en el `.env` ignorado del checkout, sin `MARKETPLACE_SOURCE=fixtures`. No depender de variables que `sudo` elimine ni copiarlas a la release. Corepack usa `pnpm@10.14.0` fijado en `package.json`. Si el repo usa un origen npm privado, configurar la autenticación del operador fuera de la release; no copiar credenciales al paquete.

```bash
cd /opt/runly-web
set -euo pipefail
RUNLY_WEB_TARGET=/var/www/runly.mx
RUNLY_WEB_RELEASE=$(date -u +%Y%m%dT%H%M%SZ)

# Instala las dependencias del checkout para el único build de prepare.
corepack pnpm install --frozen-lockfile
sudo /usr/bin/node scripts/deploy-marketplace.mjs prepare --release "$RUNLY_WEB_RELEASE" --target "$RUNLY_WEB_TARGET"

# Revisa el plan; no reconstruye ni activa.
sudo /usr/bin/node scripts/deploy-marketplace.mjs deploy --release "$RUNLY_WEB_RELEASE" --target "$RUNLY_WEB_TARGET" --health-url https://runly.mx --dry-run

# Ejecutar únicamente al autorizar la activación de esta release concreta.
sudo /usr/bin/node scripts/deploy-marketplace.mjs deploy --release "$RUNLY_WEB_RELEASE" --target "$RUNLY_WEB_TARGET" --health-url https://runly.mx

sudo systemctl status runly-web-marketplace.service --no-pager
sudo systemctl is-enabled runly-web-marketplace.service
curl -I https://runly.mx/marketplace/publicadores/raulbelloso/
curl -I https://runly.mx/marketplace/plantillas-studio/cumbre-innovacion-liderazgo-2027/
```

`prepare` no ejecuta `git pull`, ni instala/deploya imágenes, ni publica releases H7. Una release incompleta permanece para diagnóstico y su ID no se reutiliza. Cambiar Node mayor o plataforma requiere preparar una nueva release. No exponer el puerto 4398 en el firewall. No usar el deploy estático independiente después de activar el hosting emparejado.

### Reversión

```bash
cd /opt/runly-web
sudo /usr/bin/node scripts/deploy-marketplace.mjs rollback --target /var/www/runly.mx
```

Restaura el par anterior, no sólo HTML. En la primera activación el runtime anterior es inexistente: se detiene/deshabilita Node y se restaura el snippet vacío y el sitio estático original. Un rollback posterior puede devolver una versión del runtime anterior con su estático correspondiente.

Si el proceso terminó abruptamente, no borrar `.lock` sin revisar su PID, comando y los journals. Confirmar que no existe un despliegue activo antes de retirarlo:

```bash
sudo cat /opt/runly-web-runtime/.lock
sudo ls -lt /opt/runly-web-runtime/transactions
# Revisar el PID mostrado con: ps -fp <PID>
# Sólo tras confirmar que el proceso ya terminó:
sudo rm -- /opt/runly-web-runtime/.lock
sudo /usr/bin/node scripts/deploy-marketplace.mjs recover --target /var/www/runly.mx
```

`recover` restaura la transacción pendiente, incluso si la caída ocurrió antes de cambiar `current`. Si el resultado es `ROLLBACK_FAILED` o `ROLLBACK_AND_RECOVERY_FAILED`, conservar journal y releases y revisar `journalctl -u runly-web-marketplace` y `nginx -t`; no continuar con otro deploy ni borrar backups.

## Pruebas realizadas

- Un build dirigido del sitio, sin cambios a las páginas ni al diseño.
- 14 pruebas dirigidas de despliegue: rutas de archivos, preservación del catálogo v1, dry-run, respaldo, fallo de rsync, arranque, salud, restauración fallida y protección del despliegue emparejado.
- Artefacto trasladado a Linux con dependencias únicamente de producción, Node 22 y Nginx reales en contenedores locales.
- Un perfil sintético del Hub pasa de 404 a 200 tras el build, sin reconstruir ni reiniciar Astro. No se creó un publicador en producción.
- El proxy conserva 200, 404, 410 y 503 de Astro. Con Node detenido, devuelve 503/noindex sólo en rutas dinámicas y mantiene la portada en 200.
- Cumbre real: ficha renderizada detrás de Nginx, dos previews con SHA-256 correcto y descarga original de 500632 bytes con el hash publicado. Chromium comprobó la galería cargada y el archivo `.runlystudio` descargado.

Reproducción sin reconstruir, con un `dist` ya preparado:

```bash
corepack pnpm test -- scripts/deploy-static.test.js scripts/deploy-marketplace.test.js
node scripts/verify-marketplace-hosting.mjs
```

La prueba Linux necesita Docker e imágenes `node:22.22.3-alpine` y `nginx:alpine`; no monta `.env` ni el checkout completo. Para añadir Chromium, `RUNLY_PLAYWRIGHT_MODULE` puede apuntar al módulo Playwright instalado en el equipo de QA. Sólo se destruyen los dos contenedores con nombres únicos creados por la prueba. La evidencia queda ignorada en `.artifacts/marketplace-hosting/`.

No se ejecutaron suites generales ni se activó systemd/Nginx en el VPS. La producción seguirá con el 404 observado hasta autorizar y aplicar esta configuración. No se modificaron firmas H7, procedencia ni importadores ERP.

Referencia: [adaptador Node standalone de Astro](https://docs.astro.build/en/guides/integrations-guide/node/).
