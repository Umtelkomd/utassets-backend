# Instrucciones de Deployment - Fix Fiber Control

## Problema en el Servidor

Al hacer `git pull` en el servidor, aparece un error porque hay archivos compilados en `dist/` que causan conflictos.

## Solución en el Servidor

Ejecuta estos comandos **EN EL SERVIDOR DE PRODUCCIÓN**:

### 1. Limpia la carpeta dist/

```bash
cd /path/to/utassets/utassets-backend
rm -rf dist/
```

### 2. Haz el pull

```bash
git pull origin main
```

### 3. Instala dependencias (si es necesario)

```bash
npm install
```

### 4. Compila el proyecto

```bash
npm run build
```

### 5. Reinicia el servidor

```bash
# Opción 1: Con PM2
pm2 restart utassets-backend

# Opción 2: Con systemd
sudo systemctl restart utassets-backend

# Opción 3: Detén y vuelve a iniciar manualmente
npm start
```

## Cambios Realizados

### 1. **Sincronización TypeORM Activada**
- ✅ `synchronize: true` en `data-source.ts`
- Las tablas se crearán/actualizarán automáticamente

### 2. **Entidades Fiber Control Registradas**
- ✅ FiberActivity
- ✅ FiberEquipment
- ✅ FiberMaterial
- ✅ FiberSettings
- ✅ FiberSubcontractor
- ✅ FiberTechnician
- ✅ FiberWorkOrder

### 3. **.gitignore Actualizado**
- ✅ Carpeta `dist/` ahora es ignorada por git

## Verificación

Después del deployment, verifica que el servidor funcione correctamente:

```bash
# Ver logs del servidor
pm2 logs utassets-backend

# O con systemd
sudo journalctl -u utassets-backend -f
```

El error **"Unknown column 'FiberActivity.id' in 'field list'"** debe estar resuelto.

## Notas Importantes

⚠️ **IMPORTANTE**: La primera vez que el servidor arranque con `synchronize: true`, TypeORM creará todas las tablas automáticamente. Esto es seguro ya que las entidades están correctamente definidas.

⚠️ **PRODUCCIÓN**: Después de verificar que todo funciona, considera cambiar `synchronize: false` y usar migraciones para mayor control en producción.
