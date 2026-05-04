# Guía Completa de Configuración Supabase

## 🔧 Paso a Paso

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión con GitHub
3. Click en "New project"
4. Nombre: `Tijuana-Shop`
5. Contraseña de base de datos: usa una contraseña fuerte
6. Region: `us-west-1` (más cercano a Tijuana)
7. Espera a que se cree (5-10 minutos)

### 2. Obtener Credenciales

En el dashboard de Supabase:
- **Settings** → **API**
- Copia:
  - `Project URL` → `VITE_SUPABASE_URL`
  - `anon` key → `VITE_SUPABASE_ANON_KEY`

### 3. Crear Tablas

En **SQL Editor**, ejecuta este script completo:

```sql
-- Crear tabla usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(20),
  bio TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  city VARCHAR(255) DEFAULT 'Tijuana',
  rating DECIMAL(3, 2) DEFAULT 5.0,
  total_sales INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Crear tabla productos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  city VARCHAR(255) NOT NULL DEFAULT 'Tijuana',
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_name VARCHAR(255),
  seller_avatar TEXT,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Crear tabla mensajes
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- Crear tabla favoritos
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Crear indices
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_city ON products(city);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_messages_users ON messages(sender_id, receiver_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
```

### 4. Configurar Row Level Security (RLS)

Ejecuta estas políticas en **SQL Editor**:

#### Para tabla `users`

```sql
-- Todos pueden ver perfiles de usuario
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Usuarios pueden insertar su perfil al registrarse
CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
```

#### Para tabla `products`

```sql
-- Todos pueden ver productos
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Solo el vendedor puede insertar productos
CREATE POLICY "Sellers can insert their own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Solo el vendedor puede actualizar sus productos
CREATE POLICY "Sellers can update their own products"
  ON products FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Solo el vendedor puede eliminar sus productos
CREATE POLICY "Sellers can delete their own products"
  ON products FOR DELETE
  USING (auth.uid() = seller_id);
```

#### Para tabla `messages`

```sql
-- Solo participantes pueden ver mensajes
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (
    auth.uid() IN (sender_id, receiver_id)
  );

-- Solo el remitente puede enviar mensajes
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Solo el receptor puede marcar como leído
CREATE POLICY "Users can update their messages"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);
```

#### Para tabla `favorites`

```sql
-- Solo el propietario puede ver sus favoritos
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Solo el propietario puede agregar favoritos
CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Solo el propietario puede eliminar favoritos
CREATE POLICY "Users can delete favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
```

### 5. Configurar Storage (para imágenes)

1. En Supabase: **Storage** → **New bucket**
2. Nombre: `product-images`
3. Public: ✅ YES (para que las imágenes sean públicas)

Para permitir subidas:

```sql
-- En Storage → product-images → Policies

-- Permitir subida a usuarios autenticados
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Permitir lectura pública
CREATE POLICY "Allow public reads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Permitir eliminar solo al propietario
CREATE POLICY "Allow users to delete their own files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND owner = auth.uid());
```

### 6. Habilitar Auth

1. **Authentication** → **Providers**
2. Email/Password: Habilitar
3. Google OAuth (opcional):
   - Ir a [Google Cloud Console](https://console.cloud.google.com)
   - Crear OAuth 2.0 Client ID
   - Copiar Client ID y Secret
   - Pegarlos en Supabase

### 7. Variables de Entorno

Crear `.env.local` en la raíz:

```env
VITE_SUPABASE_URL=https://iwvptwjkzxfojtmpydup.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dnB0d2prenhmb2p0bXB5ZHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODU0MjcsImV4cCI6MjA5MzI2MTQyN30.x7uB60VvLIedKkhvcKmF15WRC3KzdLhweT3mpo4BBG4E
```

## ✅ Checklist de Configuración

- [ ] Proyecto Supabase creado
- [ ] Credenciales copiadas a `.env.local`
- [ ] Tablas creadas (users, products, messages, favorites)
- [ ] RLS habilitado en todas las tablas
- [ ] Políticas RLS aplicadas
- [ ] Bucket de Storage `product-images` creado
- [ ] Autenticación Email habilitada
- [ ] Dependencias instaladas: `npm install`
- [ ] Servidor dev iniciado: `npm run dev`

## 🧪 Pruebas Rápidas

1. **Test de conexión:**
   ```bash
   npm run dev
   # Ver en consola: "Connected to Supabase" ✅
   ```

2. **Test de geolocalización:**
   - Abrir app en móvil o activar ubicación en navegador
   - Click en botón "+"
   - Debe pedir permisos de ubicación

3. **Test de publicación:**
   - Publicar un producto
   - Debería aparecer en el feed

## 🆘 Troubleshooting

### "Missing Supabase credentials"
- Verifica que `.env.local` exista en la raíz
- Reinicia el servidor: `npm run dev`

### "RLS policy violation"
- Verifica que la política sea correcta
- Asegúrate de que `auth.uid()` esté disponible
- Comprueba que el usuario esté autenticado

### Imágenes no se cargan
- Verifica que el bucket sea público
- Comprueba permisos de Storage
- URL de imagen debe comenzar con `https://`

### Geolocalización no funciona
- La app requiere HTTPS (excepto localhost)
- Usuario debe otorgar permisos
- Requiere conexión GPS/WiFi

---

**¡Configuración completada! 🎉**

Ahora puedes: `npm run dev` y empezar a usar Tijuana Shop
