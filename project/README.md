# MAIS Centro de Mando Político

**MAIS Centro de Mando Político** es una plataforma política completa en producción que gestiona 5 zonas territoriales del Cauca con 25 municipios implementados, sirviendo a más de 96 representantes políticos activos.

---

## 🛠️ Arquitectura y Flujo de Trabajo de Desarrollo

Este proyecto ha sido refactorizado para seguir una **arquitectura orientada a dominios** y un **flujo de trabajo de desarrollo local profesional** basado en la CLI de Supabase.

- **Arquitectura de Dominios:** El código fuente en `src` no está organizado por tipo (e.g., `components`, `hooks`), sino por dominio de negocio (`auth`, `users`, `messages`, `territory`). Esto hace que el propósito de la aplicación sea explícito y facilita la escalabilidad y el mantenimiento.
- **Desarrollo Local:** El proyecto está configurado para correr en un entorno local completo y aislado, utilizando Docker a través de la CLI de Supabase. Esto asegura que el desarrollo no afecte a los entornos de producción o staging.

---

## 🚀 Desarrollo Local: Instalación y Ejecución

Sigue estos pasos para levantar un entorno de desarrollo completo en tu máquina local.

### Prerrequisitos
- **Node.js 18+**
- **Docker Desktop**: Debe estar instalado y en ejecución.
- **Supabase CLI**: No es necesario instalarla globalmente, se utilizará a través de `npx`.

### 1. Configuración Inicial

Clona el repositorio e instala las dependencias de Node.js.

```bash
git clone [repository-url]
cd project
npm install
```

### 2. Variables de Entorno

Crea un archivo `.env` a partir del ejemplo. No necesitas llenarlo para el desarrollo local, ya que la CLI de Supabase proporcionará sus propias variables.

```bash
cp .env.example .env
```

### 3. Vincular el Proyecto a Supabase (Solo una vez)

Este paso conecta tu repositorio local con tu proyecto de Supabase en la nube para poder gestionar las migraciones. **Este comando requiere tu contraseña de la base de datos y debe ser ejecutado manualmente.**

```bash
# Desde el directorio raíz del proyecto
npx supabase link --project-ref qbsmayqqwwqqjzxcpfde -p "[TU_CONTRASENA_DE_BD]"
```

### 4. Iniciar el Entorno de Desarrollo Local

Este es el comando principal que usarás para trabajar en el proyecto. Ejecuta la siguiente secuencia de comandos en la raíz del proyecto para detener cualquier instancia antigua, iniciar una nueva y poblarla con el esquema y los datos de prueba correctos.

```bash
# 1. Detener cualquier instancia previa (si existe)
npx supabase --workdir project stop

# 2. Iniciar los servicios de Supabase (Docker)
npx supabase --workdir project start

# 3. Resetear la base de datos local con el esquema y los datos de prueba
npx supabase --workdir project db reset
```

Una vez que `db reset` se complete con éxito, tendrás un entorno local completamente funcional.

### 5. Iniciar la Aplicación Frontend

Con el backend de Supabase corriendo localmente, inicia el servidor de desarrollo de Vite.

```bash
# Desde el directorio 'project'
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## 👥 Credenciales de Usuarios de Prueba

El entorno de desarrollo local se inicializa con un conjunto de usuarios de prueba. Puedes usarlos para probar los diferentes roles y vistas de la aplicación.

- **Contraseña Universal:** `password123`

- **Emails:**
  - `nacional@mais.com` (Rol: `comite_ejecutivo_nacional`)
  - `regional@mais.com` (Rol: `lider_regional`)
  - `departamental@mais.com` (Rol: `comite_departamental`)
  - `candidato@mais.com` (Rol: `candidato`)

---

## 🛠️ Tecnologías Implementadas

### Frontend
- **React 18** + TypeScript
- **Vite** para desarrollo y build
- **Tailwind CSS** para estilos

### Backend & Infraestructura
- **Supabase** (PostgreSQL)
- **Supabase CLI** para desarrollo local y migraciones
- **Docker** para contenerización del entorno local

