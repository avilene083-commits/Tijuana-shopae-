# Tijuana Shop - PWA Marketplace Local

Una aplicación web progresiva (PWA) moderna, rápida y segura para comprar y vender productos locales en Tijuana.

## 🎯 Características Principales

### 📱 Interfaz Intuitiva
- Diseño responsivo optimizado para móviles (primero)
- Barra de navegación flotante con acceso rápido
- Paleta de colores moderna: Naranja (#FF6B00) y Verde Neón (#39FF14)

### 🛍️ Funcionalidades Marketplace
- **Feed de Productos**: Galería de productos con filtros en tiempo real
- **Búsqueda Avanzada**: Por palabras clave y ciudad
- **Categorías**: Electrónica, Muebles, Ropa, Deportes, Libros, Servicios
- **Favoritos**: Marca productos para guardarlos
- **Detalles Completos**: Imágenes, descripción, precio, ubicación y contacto del vendedor

### 📍 Ubicación Local
- Detección automática de GPS obligatoria para publicar
- Filtro de productos por ciudad
- Visualización de ubicación del vendedor

### 🔐 Seguridad y Autenticación
- Autenticación con Supabase Auth
- Row Level Security (RLS) en base de datos
- Solo el dueño puede editar/eliminar sus productos
- Almacenamiento seguro de imágenes en Supabase Storage

### 💬 Comunicación
- Mensajería interna entre compradores y vendedores
- Historial de conversaciones
- Contacto directo por teléfono

### ⭐ Perfil de Usuario
- Visualización de rating y ventas totales
- Edición de información personal
- Galería de productos activos
- Estadísticas personalizadas

## 🚀 Tecnologías

```
Frontend:
- React 18+ con TypeScript
- Vite para compilación rápida
- Tailwind CSS para estilos
- Lucide Icons para iconografía
- Axios para HTTP requests

Backend/Base de Datos:
- Supabase (PostgreSQL + Auth + Storage)
- Row Level Security para privacidad

PWA:
- Service Worker ready
- Web App Manifest
- Instalable en dispositivos
- Funcionamiento offline

```

## 📦 Instalación

### Prerequisitos
- Node.js 18+
- npm o yarn
- Cuenta en Supabase

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/Tijuana-shopae-.git
cd Tijuana-shopae-
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

5. **Compilar para producción**
```bash
npm run build
```

## 🗄️ Configuración de Base de Datos Supabase

### Tablas Necesarias

#### 1. Tabla `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(20),
  bio TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  city VARCHAR(255),
  rating DECIMAL(3, 2) DEFAULT 5.0,
  total_sales INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### 2. Tabla `products`
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  images TEXT[] NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  city VARCHAR(255) NOT NULL,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_name VARCHAR(255),
  seller_avatar TEXT,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### 3. Tabla `messages`
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
```

#### 4. Tabla `favorites`
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, product_id)
);
```

### Políticas de Row Level Security (RLS)

#### Para tabla `products`
```sql
-- Todos pueden ver productos
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Solo el dueño puede insertar
CREATE POLICY "Users can insert their own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Solo el dueño puede actualizar
CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  USING (auth.uid() = seller_id);

-- Solo el dueño puede eliminar
CREATE POLICY "Users can delete their own products"
  ON products FOR DELETE
  USING (auth.uid() = seller_id);
```

#### Para tabla `messages`
```sql
-- Solo participantes pueden ver mensajes
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (auth.uid() IN (sender_id, receiver_id));

-- Solo el remitente puede insertar
CREATE POLICY "Users can insert messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
```

#### Para tabla `favorites`
```sql
-- Solo el propietario puede verlos
CREATE POLICY "Users can view their favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Solo el propietario puede modificar
CREATE POLICY "Users can manage their favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
```

## 🌳 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── ProductCard.tsx
│   ├── ProductDetail.tsx
│   ├── PublishModal.tsx
│   └── NavBar.tsx
├── hooks/              # Custom React Hooks
│   ├── useAuth.tsx
│   └── useProducts.ts
├── lib/                # Configuraciones y utilidades
│   └── supabase.ts
├── pages/              # Páginas principales
│   ├── HomePage.tsx
│   ├── SearchPage.tsx
│   ├── ProfilePage.tsx
│   └── MessagesPage.tsx
├── types/              # Tipos TypeScript
│   └── index.ts
├── App.tsx             # Componente raíz
├── main.tsx            # Entry point
└── index.css           # Estilos globales
```

## 🎨 Paleta de Colores

- **Primario**: #FF6B00 (Naranja) - Acciones principales
- **Secundario**: #39FF14 (Verde Neón) - Destacados
- **Fondo**: #0F0F11 (Casi Negro) - Fondo principal
- **Tarjeta**: #1A1A1F (Gris oscuro) - Cards y componentes
- **Borde**: #2A2A30 (Gris medio) - Bordes sutiles

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Compilación
npm run build        # Compila para producción
npm run preview      # Preview local de producción

# Linting
npm run lint         # Revisa el código
```

## 📚 Documentación de Componentes

### PublishModal
Modal para publicar nuevos productos con:
- Verificación obligatoria de ubicación (GPS)
- Carga de hasta 5 imágenes
- Selección de categoría
- Validación de formulario

### ProductCard
Tarjeta de producto con:
- Imagen principal
- Precio destacado
- Botones de Like y Share
- Información del vendedor

### NavBar
Navegación inferior con 5 opciones:
- Inicio (Home)
- Búsqueda
- Publicar (botón flotante)
- Mensajes
- Perfil

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
vercel deploy
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### GitHub Pages
```bash
npm run build
# Luego sube la carpeta 'dist'
```

## 🐛 Troubleshooting

### "Cannot find Supabase credentials"
- Verifica que `.env.local` esté en la raíz del proyecto
- Asegúrate de que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén presentes

### Imágenes no se cargan
- Verifica que Supabase Storage tenga el bucket `product-images` creado
- Asegúrate de que RLS en Storage permita acceso público para lectura

### GPS no funciona
- La app requiere HTTPS (excepto localhost)
- El usuario debe otorgar permisos de ubicación

## 📝 Licencia

Este proyecto está bajo licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para reportar bugs o sugerencias:
- GitHub Issues: [Crear issue](https://github.com/avilene083-commits/Tijuana-shopae-/issues)
- Email: soporte@tijuanashop.mx

---

**Hecho con ❤️ para Tijuana**
