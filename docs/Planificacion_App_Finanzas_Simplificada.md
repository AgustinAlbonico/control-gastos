# PLANIFICACIÓN SIMPLIFICADA
# App de Control de Gastos e Ingresos

**Versión:** Simplificada  
**Fecha:** Diciembre 2025

---

## 1. RESUMEN

**Objetivo:** Desarrollar una aplicación web sencilla para controlar gastos e ingresos personales, con reportes visuales básicos.

**Características principales:**
- ✅ Sin sistema de login/autenticación
- ✅ Registro de gastos e ingresos
- ✅ Categorías predefinidas + personalizables
- ✅ Reportes con gráficos básicos
- ✅ Persistencia en la nube con **Supabase** (gratuito)
- ✅ Deploy gratuito (Vercel)

---

## 2. FUNCIONALIDADES

### 2.1 Transacciones (CRUD)

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| Fecha | Date | ✅ |
| Descripción | Texto (max 200) | ✅ |
| Tipo | Ingreso / Gasto | ✅ |
| Categoría | Selección | ✅ |
| Monto | Número positivo | ✅ |
| Método de pago | Selección | ❌ (opcional) |
| Notas | Texto | ❌ (opcional) |

**Operaciones:**
- ➕ Crear transacción
- 📋 Listar transacciones (con filtros básicos)
- ✏️ Editar transacción
- 🗑️ Eliminar transacción

### 2.2 Categorías

**Predefinidas (no editables):**

| Gastos | Ingresos |
|--------|----------|
| 🍔 Alimentación | 💰 Sueldo |
| 🎮 Ocio/Entretenimiento | 💵 Freelance |
| 🏥 Salud | 🎁 Regalos |
| 🚗 Transporte | 📈 Inversiones |
| 🏠 Hogar | 💳 Otros ingresos |
| 👕 Ropa | |
| 📚 Educación | |
| 💳 Servicios | |
| 🛒 Otros gastos | |

**Personalizadas:**
- El usuario puede agregar nuevas categorías
- Las categorías personalizadas se pueden editar/eliminar

### 2.3 Reportes y Gráficos

**Dashboard Principal:**
- 💰 Total ingresos del mes
- 💸 Total gastos del mes
- 📊 Balance (ingresos - gastos)

**Gráficos incluidos:**
1. **Gráfico de Torta** - Distribución de gastos por categoría
2. **Gráfico de Barras** - Ingresos vs Gastos mensual
3. **Gráfico de Líneas** - Evolución del balance en el tiempo

**Filtros de reportes:**
- Por mes/año
- Por rango de fechas

### 2.4 Exportar Datos

- Exportar a archivo CSV
- Opción de importar datos desde CSV (backup)

---

## 3. STACK TECNOLÓGICO

### Frontend

| Tecnología | Uso |
|------------|-----|
| **React 18** + **TypeScript** | Framework principal |
| **Vite** | Build tool |
| **Tailwind CSS** | Estilos |
| **shadcn/ui** | Componentes UI |
| **Recharts** | Gráficos |
| **date-fns** | Manejo de fechas |

### Backend (Supabase - Gratuito)

| Servicio | Uso |
|----------|-----|
| **Supabase Database** | PostgreSQL en la nube |
| **Supabase JS Client** | Conexión desde React |

### ¿Por qué Supabase?

- **Gratuito**: Tier gratuito generoso (500 MB, 50k requests/mes)
- **PostgreSQL real**: Base de datos relacional completa
- **Fácil de usar**: SDK para JavaScript muy simple
- **Sin servidor propio**: No necesitás mantener infraestructura
- **Sincronización**: Datos accesibles desde cualquier dispositivo

---

## 4. MODELO DE DATOS

### Transacción
```typescript
interface Transaction {
  id: string;              // UUID generado
  date: string;            // ISO date
  description: string;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  amount: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Categoría
```typescript
interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;           // Emoji
  isSystem: boolean;       // true = predefinida
  isActive: boolean;
}
```

---

## 5. ESTRUCTURA DE CARPETAS

```
control-gastos/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionList.tsx
│   │   ├── TransactionFilters.tsx
│   │   ├── CategoryManager.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Charts/
│   │   │   ├── PieChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   └── LineChart.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   ├── hooks/
│   │   ├── useTransactions.ts
│   │   ├── useCategories.ts
│   │   └── useLocalStorage.ts
│   ├── lib/
│   │   ├── storage.ts             # Funciones de localStorage
│   │   ├── utils.ts               # Utilidades generales
│   │   └── constants.ts           # Categorías predefinidas
│   ├── pages/
│   │   ├── HomePage.tsx           # Dashboard
│   │   ├── TransactionsPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── docs/
│   └── Planificacion_App_Finanzas_Simplificada.md
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 6. PLAN DE SPRINTS

### 📅 Sprint 1: Setup y Base (3-4 días)

**Objetivo:** Tener la estructura del proyecto lista y el layout básico.

| Tarea | Prioridad |
|-------|-----------|
| Inicializar proyecto con Vite + React + TypeScript | 🔴 Alta |
| Configurar Tailwind CSS | 🔴 Alta |
| Instalar y configurar shadcn/ui | 🔴 Alta |
| Crear layout principal (Header, Sidebar, Footer) | 🔴 Alta |
| Implementar navegación básica (react-router) | 🔴 Alta |
| Crear tipos TypeScript (Transaction, Category) | 🔴 Alta |
| Implementar hook `useLocalStorage` | 🔴 Alta |

**Entregable:** App con navegación funcionando y layout responsive.

---

### 📅 Sprint 2: Transacciones CRUD (4-5 días)

**Objetivo:** Poder registrar, ver, editar y eliminar transacciones.

| Tarea | Prioridad |
|-------|-----------|
| Crear categorías predefinidas en `constants.ts` | 🔴 Alta |
| Implementar `useTransactions` hook | 🔴 Alta |
| Crear `TransactionForm` (crear/editar) | 🔴 Alta |
| Crear `TransactionList` con tabla | 🔴 Alta |
| Implementar eliminación con confirmación | 🔴 Alta |
| Agregar filtros básicos (tipo, categoría, fecha) | 🟡 Media |
| Validación de formularios | 🟡 Media |

**Entregable:** CRUD completo de transacciones funcionando.

---

### 📅 Sprint 3: Dashboard y Reportes (4-5 días)

**Objetivo:** Visualizar resumen financiero y gráficos.

| Tarea | Prioridad |
|-------|-----------|
| Instalar Recharts o Chart.js | 🔴 Alta |
| Crear `Dashboard.tsx` con tarjetas de resumen | 🔴 Alta |
| Implementar gráfico de torta (gastos por categoría) | 🔴 Alta |
| Implementar gráfico de barras (ingresos vs gastos) | 🔴 Alta |
| Implementar gráfico de líneas (evolución temporal) | 🟡 Media |
| Agregar selector de período (mes/año) | 🟡 Media |
| Página de reportes con todos los gráficos | 🟡 Media |

**Entregable:** Dashboard con gráficos funcionando.

---

### 📅 Sprint 4: Categorías y Exportación (3-4 días)

**Objetivo:** Permitir categorías personalizadas y exportar datos.

| Tarea | Prioridad |
|-------|-----------|
| Crear `CategoryManager.tsx` | 🔴 Alta |
| CRUD de categorías personalizadas | 🔴 Alta |
| Exportar transacciones a CSV | 🔴 Alta |
| Importar transacciones desde CSV | 🟡 Media |
| Página de configuración/settings | 🟡 Media |

**Entregable:** Gestión de categorías y exportación CSV.

---

### 📅 Sprint 5: Pulido y Deploy (2-3 días)

**Objetivo:** Mejorar UX y desplegar la aplicación.

| Tarea | Prioridad |
|-------|-----------|
| Agregar toasts/notificaciones de feedback | 🔴 Alta |
| Estados de carga y empty states | 🔴 Alta |
| Responsive design (móvil) | 🔴 Alta |
| Dark mode (opcional) | 🟢 Baja |
| Deploy en Vercel | 🔴 Alta |
| Documentar README | 🟡 Media |

**Entregable:** App desplegada y funcionando en producción.

---

### 📅 Sprint 6: Integración con Supabase (3-4 días)

**Objetivo:** Migrar de localStorage a Supabase para persistencia en la nube.

| Tarea | Prioridad |
|-------|-----------|
| Crear proyecto en Supabase | 🔴 Alta |
| Crear tablas (categories, transactions) | 🔴 Alta |
| Instalar `@supabase/supabase-js` | 🔴 Alta |
| Configurar cliente Supabase | 🔴 Alta |
| Migrar `useTransactions` a Supabase | 🔴 Alta |
| Migrar `useCategories` a Supabase | 🔴 Alta |
| Seed de categorías iniciales | 🟡 Media |
| Testing de CRUD con Supabase | 🟡 Media |

**Entregable:** App funcionando con datos en Supabase.

---

## 7. DEPLOY GRATUITO

### Opción Recomendada: **Vercel**

**Ventajas:**
- Deploy automático desde GitHub
- HTTPS incluido
- Dominio gratuito (tu-app.vercel.app)
- Sin límites para proyectos personales

**Pasos:**
1. Subir código a GitHub
2. Conectar repositorio en vercel.com
3. Vercel detecta Vite automáticamente
4. Deploy automático en cada push

### Alternativas:

| Plataforma | Precio | Notas |
|------------|--------|-------|
| **Netlify** | Gratis | Similar a Vercel |
| **GitHub Pages** | Gratis | Requiere configuración extra |
| **Render** | Gratis | Puede tener cold starts |

---

## 8. ESTIMACIÓN DE TIEMPO

| Sprint | Duración Estimada |
|--------|-------------------|
| Sprint 1: Setup y Base | 3-4 días |
| Sprint 2: Transacciones CRUD | 4-5 días |
| Sprint 3: Dashboard y Reportes | 4-5 días |
| Sprint 4: Categorías y Exportación | 3-4 días |
| Sprint 5: Pulido y Deploy | 2-3 días |
| Sprint 6: Integración Supabase | 3-4 días |
| **TOTAL** | **19-25 días** (~4-5 semanas) |

> **Nota:** Estos tiempos asumen dedicación de 2-4 horas diarias.

---

## 9. FUNCIONALIDADES FUTURAS (No incluidas en MVP)

Para una versión 2.0:
- 🔐 Login con cuenta (autenticación de Supabase)
- 📱 PWA para instalar en móvil
- 🔔 Recordatorios/notificaciones
- 📊 Más tipos de gráficos
- 📁 Múltiples billeteras/cuentas
- 📸 Adjuntar fotos de tickets

---

## 10. PRÓXIMOS PASOS

1. ✅ Aprobar esta planificación
2. 🚀 Iniciar Sprint 1: Setup del proyecto
3. 📋 Crear issues en GitHub para seguimiento
4. 💻 ¡Empezar a codear!

---

**¿Te parece bien esta planificación? ¿Querés agregar o quitar algo?**
