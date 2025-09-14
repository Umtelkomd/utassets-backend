# Sistema de Control de Costos

Sistema moderno de control de costos con dashboard interactivo, gestión de pagos, aprobaciones y métricas en tiempo real.

## 🚀 Características

### Dashboard Moderno
- ✅ **Métricas en tiempo real** con KPIs dinámicos
- ✅ **Selección de períodos** (7 días, 30 días, 3 meses, 1 año, personalizado)
- ✅ **Gráficas interactivas** que se actualizan automáticamente
- ✅ **Diseño responsivo** con tema azul metálico moderno
- ✅ **Actualizaciones automáticas** cada 5 minutos

### Gestión de Pagos Mejorada
- ✅ **CRUD completo** con validaciones
- ✅ **Sistema de aprobación** de pagos
- ✅ **Estados**: Pendiente, Aprobado, Diferido
- ✅ **Notificaciones Slack** automáticas
- ✅ **Edición en línea** de pagos

### Exportación e Importación
- ✅ **Exportación a CSV/JSON** con filtros aplicados
- ✅ **Importación masiva** desde CSV
- ✅ **Validación de datos** durante importación
- ✅ **Reporte de errores** detallado

### Análisis y Reportes
- ✅ **Gráficas por período** de tiempo
- ✅ **Distribución por estado** (donut chart)
- ✅ **Análisis por centro de costo** (bar chart)
- ✅ **Métricas comparativas** vs período anterior

## 🛠️ Tecnologías

### Backend
- **Node.js** + Express
- **TypeORM** con MySQL
- **Slack API** para notificaciones
- **Arquitectura modular** con controladores y servicios

### Frontend
- **HTML5** + **Vanilla JavaScript**
- **Tailwind CSS** para estilos
- **Chart.js** para gráficas
- **Axios** para API calls
- **Diseño glassmorphism** moderno

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js >= 18.0.0
- MySQL >= 8.0
- npm >= 9.0.0

### 1. Clonar el repositorio
```bash
git clone https://github.com/Umtelkomd/costcontrol-backend.git
cd costcontrol-backend
```

### 2. Configurar Backend

#### Instalar dependencias
```bash
cd costcontrol-backend
npm install
```

#### Configurar variables de entorno
```bash
cp env.example .env
```

Editar `.env` con tus datos:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=costcontrol

# Server
PORT=4000

# Slack (opcional)
SLACK_BOT_TOKEN=xoxb-tu-token
SLACK_CHANNEL_ID=tu-canal-id
```

#### Inicializar base de datos
```bash
# TypeORM creará las tablas automáticamente
npm start
```

#### Crear usuarios iniciales (opcional)
```bash
node create-users.js
```

### 3. Configurar Frontend

#### Instalar dependencias
```bash
cd ../costcontrol-frontend
npm install
```

#### Configurar API URL
Editar `js/config.js` si es necesario:
```javascript
API_BASE_URL: 'http://localhost:4000/api'
```

## 🚀 Ejecución

### Desarrollo

#### Backend
```bash
cd costcontrol-backend
npm run dev  # Con nodemon para recarga automática
```

#### Frontend
```bash
cd costcontrol-frontend
npm run dev  # Live server en http://localhost:3000
```

### Producción

#### Backend
```bash
cd costcontrol-backend
npm start
```

#### Frontend
```bash
cd costcontrol-frontend
npm run build
# Servir archivos estáticos con nginx/apache
```

## 📊 Uso del Sistema

### Dashboard Principal
1. **Seleccionar período**: Usa el selector en la navegación
2. **Ver métricas**: KPIs se actualizan automáticamente
3. **Interactuar con gráficas**: Cambiar entre línea/barras
4. **Exportar datos**: Botón de exportación con filtros aplicados

### Gestión de Pagos
1. **Crear pago**: Botón "Nuevo Pago" → Llenar formulario
2. **Ver pendientes**: Botón "Ver Pendientes" → Aprobar/Diferir
3. **Editar pago**: Click en pago pendiente → "Editar"
4. **Importar datos**: Botón "Importar" → Subir CSV

### Formato CSV para Importación
```csv
fecha,proveedor,concepto,monto,centroCostoId,metodoPago,referencia,comentarios
2024-01-15,Proveedor A,Servicios,1000.00,1,transferencia,REF123,Comentario
2024-01-16,Proveedor B,Suministros,500.50,2,efectivo,,
```

## 🔧 API Endpoints

### Pagos
- `GET /api/pagos` - Listar pagos (con filtros)
- `GET /api/pagos/metrics` - Métricas del dashboard
- `GET /api/pagos/pending` - Pagos pendientes
- `GET /api/pagos/approved` - Pagos aprobados
- `POST /api/pagos` - Crear pago
- `PUT /api/pagos/:id` - Actualizar pago
- `DELETE /api/pagos/:id` - Eliminar pago
- `POST /api/pagos/:id/approve` - Aprobar pago
- `POST /api/pagos/:id/defer` - Diferir pago

### Centros de Costo
- `GET /api/centros-costo` - Listar centros
- `POST /api/centros-costo` - Crear centro
- `PUT /api/centros-costo/:id` - Actualizar centro
- `DELETE /api/centros-costo/:id` - Eliminar centro

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

## 🎨 Personalización

### Cambiar Colores del Tema
Editar `costcontrol-frontend/js/config.js`:
```javascript
CHART_COLORS: {
    primary: '#tu-color-primario',
    secondary: '#tu-color-secundario',
    // ...
}
```

### Modificar Intervalos de Actualización
En `costcontrol-frontend/js/dashboard.js`:
```javascript
startAutoRefresh(5 * 60 * 1000); // 5 minutos
```

### Agregar Nuevos Centros de Costo
```bash
curl -X POST http://localhost:4000/api/centros-costo \\
  -H "Content-Type: application/json" \\
  -d '{"nombre": "Nuevo Centro", "descripcion": "Descripción"}'
```

## 🔍 Troubleshooting

### Error de Conexión a Base de Datos
1. Verificar que MySQL esté ejecutándose
2. Comprobar credenciales en `.env`
3. Verificar que la base de datos existe

### Frontend no carga datos
1. Verificar que el backend esté ejecutándose en puerto 4000
2. Comprobar CORS en el navegador
3. Verificar API_BASE_URL en config.js

### Notificaciones Slack no funcionan
1. Verificar SLACK_BOT_TOKEN en `.env`
2. Comprobar permisos del bot en Slack
3. Verificar SLACK_CHANNEL_ID

## 📈 Próximas Mejoras

- [ ] Autenticación y autorización
- [ ] Reportes PDF automáticos
- [ ] Dashboard de administración
- [ ] API REST documentada con Swagger
- [ ] Tests automatizados
- [ ] Docker containerización
- [ ] Deployment automático

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico:
- **Issues**: [GitHub Issues](https://github.com/Umtelkomd/costcontrol-backend/issues)
- **Email**: soporte@umtelkomd.com
- **Slack**: Canal #costcontrol-support

---

Desarrollado con ❤️ por el equipo de UMTELKOMD