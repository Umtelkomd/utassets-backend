#!/bin/bash

# Script de inicio para el backend
echo "Iniciando el servidor backend..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "PWD: $(pwd)"
echo "Archivos en directorio: $(ls -la)"

# Verificar si package.json existe
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json no encontrado"
    exit 1
fi

# Instalar dependencias si no existen o están incompletas
if [ ! -d "node_modules" ] || [ ! -f "node_modules/express/package.json" ]; then
    echo "Instalando dependencias..."
    npm ci --only=production
fi

# Verificar que express esté instalado
if [ ! -f "node_modules/express/package.json" ]; then
    echo "ERROR: Express no está instalado. Intentando instalación completa..."
    npm install express cors body-parser dotenv mysql2 typeorm reflect-metadata
fi

# Verificar que server.js exista
if [ ! -f "server.js" ]; then
    echo "ERROR: server.js no encontrado"
    exit 1
fi

# Iniciar el servidor
echo "Iniciando servidor..."
node server.js 