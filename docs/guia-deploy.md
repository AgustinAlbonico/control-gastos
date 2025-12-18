# Guía de Deploy - Control de Gastos

Esta guía explica cómo desplegar la aplicación de forma **gratuita** en diferentes plataformas.

## Opción Recomendada: Vercel

Vercel es la mejor opción para proyectos React/Vite. Es **gratis** para proyectos personales.

### Pasos para Deploy en Vercel

#### 1. Subir el código a GitHub

```bash
# Si todavía no tenés el repo inicializado:
git init
git add .
git commit -m "Initial commit"

# Crear un repo en github.com y luego:
git remote add origin https://github.com/tu-usuario/control-gastos.git
git branch -M main
git push -u origin main
```

#### 2. Conectar con Vercel

1. Ir a [vercel.com](https://vercel.com) y crear cuenta (podés usar GitHub)
2. Click en **"Add New Project"**
3. Importar el repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Vite

#### 3. Configurar Variables de Entorno

En la pantalla de configuración del proyecto:

1. Expandir **"Environment Variables"**
2. Agregar las siguientes variables:

| Variable | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://tu-proyecto.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `tu-anon-key` |

3. Click en **"Deploy"**

#### 4. ¡Listo!

Vercel te dará una URL como: `https://control-gastos-xxx.vercel.app`

---

## Opción Alternativa: Netlify

Netlify también es gratis y muy fácil de usar.

### Pasos para Deploy en Netlify

#### 1. Subir el código a GitHub (igual que arriba)

#### 2. Conectar con Netlify

1. Ir a [netlify.com](https://netlify.com) y crear cuenta
2. Click en **"Add new site"** → **"Import an existing project"**
3. Conectar con GitHub y seleccionar el repositorio

#### 3. Configurar Build

- **Build command:** `npm run build`
- **Publish directory:** `dist`

#### 4. Variables de Entorno

1. Ir a **Site settings** → **Environment variables**
2. Agregar:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

#### 5. Redesplegar

Después de agregar las variables, hacer un redeploy:
- **Deploys** → **Trigger deploy** → **Deploy site**

---

## Opción 3: GitHub Pages (sin backend)

Si querés hostear **sin Supabase** (solo localStorage), podés usar GitHub Pages gratis.

### Pasos

1. Instalar el plugin de Vite:
```bash
npm install -D vite-plugin-gh-pages
```

2. Agregar en `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/control-gastos/', // nombre de tu repo
  // ... resto de config
})
```

3. Agregar script en `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && npx gh-pages -d dist"
  }
}
```

4. Ejecutar:
```bash
npm run deploy
```

5. Habilitar GitHub Pages en el repo: **Settings** → **Pages** → Source: `gh-pages`

---

## Verificar el Deploy

Después del deploy, verificá:

1. ✅ La app carga correctamente
2. ✅ Las categorías se muestran (vienen de Supabase)
3. ✅ Podés crear transacciones
4. ✅ Los datos persisten al recargar

---

## Troubleshooting

### "Las categorías no cargan"
- Verificá que las variables de entorno estén configuradas
- Verificá que ejecutaste el `schema.sql` en Supabase

### "Error 404 al recargar la página"
Para Netlify, creá un archivo `public/_redirects`:
```
/*    /index.html   200
```

Para Vercel, creá `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### "Build falla"
Verificá que `npm run build` funcione localmente sin errores.

---

## Resumen de Plataformas

| Plataforma | Precio | Dificultad | Mejor para |
|------------|--------|------------|------------|
| **Vercel** | Gratis | ⭐ Fácil | Proyectos React/Vite |
| **Netlify** | Gratis | ⭐ Fácil | Proyectos estáticos |
| **GitHub Pages** | Gratis | ⭐⭐ Media | Sin backend |

**Recomendación:** Usá **Vercel** si tenés Supabase configurado.
