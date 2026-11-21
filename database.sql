-- ============================================================================
-- KAVO ROASTERY — Specialty Coffee Shop PostgreSQL / Supabase Schema & Seed
-- ============================================================================
-- Compatible with PostgreSQL 15+ and Supabase (including Row Level Security).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE (Synced with OAuth / Firebase Auth / Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'pending' CHECK (role IN ('admin', 'pending', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PRODUCTS TABLE (100% Specialty Coffee Catalog — Hot, Iced, Brew, Beans)
CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('hot', 'iced', 'brew', 'beans')),
  name_en TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_ru TEXT NOT NULL,
  description_uz TEXT NOT NULL,
  origin_en TEXT NOT NULL,
  origin_ru TEXT NOT NULL,
  origin_uz TEXT NOT NULL,
  tasting_notes_en TEXT NOT NULL,
  tasting_notes_ru TEXT NOT NULL,
  tasting_notes_uz TEXT NOT NULL,
  base_price_cents INTEGER NOT NULL CHECK (base_price_cents > 0),
  image_url TEXT NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('table', 'delivery')),
  table_or_address TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'brewing', 'ready', 'completed', 'cancelled')),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ru', 'uz')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ORDER ITEMS TABLE (Captures exact customized configuration per cup/bag)
CREATE TABLE IF NOT EXISTS public.order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  size TEXT NOT NULL CHECK (size IN ('S', 'M', 'L')),
  roast_level TEXT NOT NULL CHECK (roast_level IN ('light', 'medium', 'dark')),
  milk_type TEXT NOT NULL CHECK (milk_type IN ('none', 'whole', 'oat', 'almond', 'coconut')),
  sugar_level TEXT NOT NULL CHECK (sugar_level IN ('0', '25', '50', '100')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  line_total_cents INTEGER NOT NULL CHECK (line_total_cents >= 0)
);

-- 5. LOGIN LOGS TABLE (Audits every Google Sign-In attempt to /admin)
CREATE TABLE IF NOT EXISTS public.login_logs (
  id SERIAL PRIMARY KEY,
  uid TEXT NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('granted', 'denied')),
  user_agent TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON public.login_logs (created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (For Supabase / PostgREST deployments)
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check whether current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.uid = auth.uid()::text
      AND u.role = 'admin'
  );
$$;

-- Products: Everyone can read active/all menu items; only admins can insert/update/delete
CREATE POLICY "products_public_read"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "products_admin_write"
  ON public.products FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Orders: Anyone can submit a new order; only admins can view or update all orders
CREATE POLICY "orders_public_insert"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "orders_admin_select"
  ON public.orders FOR SELECT
  USING (public.is_admin_user());

CREATE POLICY "orders_admin_update"
  ON public.orders FOR UPDATE
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Order Items: Anyone can insert order items for a newly created order; only admins can read
CREATE POLICY "order_items_public_insert"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "order_items_admin_select"
  ON public.order_items FOR SELECT
  USING (public.is_admin_user());

-- Users & Login Logs: Users can view their own record; admins can view all
CREATE POLICY "users_self_or_admin_select"
  ON public.users FOR SELECT
  USING (uid = auth.uid()::text OR public.is_admin_user());

CREATE POLICY "login_logs_admin_select"
  ON public.login_logs FOR SELECT
  USING (public.is_admin_user());

-- ============================================================================
-- SEED DATA — 12 SPECIALTY COFFEE OFFERINGS (100% COFFEE ONLY)
-- ============================================================================

INSERT INTO public.products (
  slug, category,
  name_en, name_ru, name_uz,
  description_en, description_ru, description_uz,
  origin_en, origin_ru, origin_uz,
  tasting_notes_en, tasting_notes_ru, tasting_notes_uz,
  base_price_cents, image_url, in_stock, featured
) VALUES
(
  'double-ristretto-espresso', 'hot',
  'Double Ristretto Espresso', 'Двойной Ристретто Эспрессо', 'Ikki karra Ristretto Espresso',
  'Syrupy, high-extraction double shot pulled at 9 bars from our washed Ethiopian and Brazilian seasonal blend.',
  'Насыщенный двойной шот с бархатистой крема из сезонного купажа мытой Эфиопии и Бразилии.',
  'Yuvilgan Efiopiya va Braziliya mavsumiy aralashmasidan 9 bar bosimda tayyorlangan quyuq ikki karra espresso.',
  'Ethiopia & Brazil', 'Эфиопия и Бразилия', 'Efiopiya va Braziliya',
  'Dark Cacao · Roasted Hazelnut · Blood Orange', 'Тёмное какао · Жареный фундук · Красный апельсин', 'Qora kakao · Qovurilgan funduk · Qizil apelsin',
  350, '/src/assets/images/coffee_hot_espresso_1795267521191.jpg', TRUE, TRUE
),
(
  'velvet-flat-white', 'hot',
  'Velvet Flat White', 'Бархатный Флэт Уайт', 'Baxmal Flet Uayt',
  'Double ristretto layered beneath micro-textured steamed milk at 62°C for a sweet, glossy finish.',
  'Двойной ристретто под шелковистой микропеной при температуре 62°C с натуральной сладостью.',
  '62°C haroratda bugʻlangan mayin sut koʻpigi ostidagi shirin va muvozanatli ikki karra ristretto.',
  'Colombia Huila', 'Колумбия Уила', 'Kolumbiya Uila',
  'Caramel · Toasted Almond · Milk Chocolate', 'Карамель · Жареный миндаль · Молочный шоколад', 'Karamel · Qovurilgan bodom · Sutli shokolad',
  480, '/src/assets/images/obsidian_latte_art_1795271463478.jpg', TRUE, TRUE
),
(
  'artisanal-cappuccino', 'hot',
  'Artisanal Cappuccino', 'Классический Капучино', 'Klassik Kapuchino',
  'Balanced 1:1:1 harmony of rich espresso, warm milk, and dense velvety microfoam dusted with raw cacao.',
  'Идеальный баланс эспрессо, тёплого молока и плотной бархатистой пены с лёгкой пудрой какао.',
  'Quyuq espresso, iliq sut va zich baxmal koʻpikning xom kakao sepilgan mukammal uygʻunligi.',
  'Brazil Cerrado', 'Бразилия Серрадо', 'Braziliya Serrado',
  'Sweet Cream · Roasted Pecan · Cacao', 'Сливки · Жареный пекан · Какао', 'Qaymoq · Qovurilgan pekan · Kakao',
  470, '/src/assets/images/obsidian_latte_art_1795271463478.jpg', TRUE, FALSE
),
(
  'gibraltar-cortado', 'hot',
  'Gibraltar Cortado', 'Кортадо Гибралтар', 'Gibraltar Kortado',
  'Equal parts precision espresso and silky textured milk served warm in fluted glass.',
  'Равные пропорции плотного эспрессо и нежного тёплого молока в классическом гранёном стакане.',
  'Klassik qirrali stakanda teng nisbatda tortilgan espresso va mayin iliq sut uygʻunligi.',
  'Guatemala Antigua', 'Гватемала Антигуа', 'Gvatemala Antigua',
  'Brown Sugar · Praline · Sweet Cream', 'Тростниковый сахар · Пралине · Сливки', 'Jigarrang shakar · Praline · Qaymoq',
  440, '/src/assets/images/obsidian_mocha_cortado_1795271464227.jpg', TRUE, FALSE
),
(
  'single-origin-americano', 'hot',
  'Single-Origin Americano', 'Американо Моносорт', 'Monosort Amerikano',
  'Double shot of bright highland Arabica lengthened with 92°C remineralized water to preserve delicate crema.',
  'Двойной эспрессо из высокогорной арабики, дополненный мягкой водой 92°C с сохранением плотной крема.',
  'Mayin kremasini saqlagan holda 92°C minerallashgan suv bilan tayyorlangan ikki karra arabika amerikano.',
  'Costa Rica Tarrazú', 'Коста-Рика Тарразу', 'Kosta-Rika Tarrazu',
  'Roasted Walnut · Honey · Clean Finish', 'Грецкий орех · Мёд · Чистое послевкусие', 'Yongʻoq · Asal · Tiniq taʼm',
  380, '/src/assets/images/coffee_hot_espresso_1795267521191.jpg', TRUE, FALSE
),
(
  'belgian-dark-mocha', 'hot',
  '70% Cacao Espresso Mocha', 'Мокко с Тёмным Какао 70%', '70% Qora Kakao Mokka',
  'Double espresso melted into single-estate 70% dark chocolate ganache and steamed microfoam.',
  'Двойной эспрессо на основе ганаша из тёмного шоколада 70% и нежного взбитого молока.',
  '70% qora shokolad ganashi va bugʻlangan sut koʻpigi bilan birlashtirilgan ikki karra espresso.',
  'Peru & Ethiopia', 'Перу и Эфиопия', 'Peru va Efiopiya',
  'Single-Estate Cacao · Espresso · Burnt Sugar', 'Тёмный шоколад · Эспрессо · Жжёный сахар', 'Qora shokolad · Espresso · Kuygan shakar',
  540, '/src/assets/images/obsidian_mocha_cortado_1795271464227.jpg', TRUE, FALSE
),
(
  'artisanal-crema-latte', 'hot',
  'Artisanal Crema Latte', 'Фирменный Крема Латте', 'Mualliflik Krema Latte',
  'Generous steamed milk folded seamlessly into a sweet double espresso for slow morning rituals.',
  'Мягкое взбитое молоко и сладкий двойной эспрессо с длительным сливочным послевкусием.',
  'Shirin ikki karra espresso va mayin bugʻlangan sutning uzun qaymoqli uygʻunligi.',
  'Colombia Cauca', 'Колумбия Каука', 'Kolumbiya Kauka',
  'Brioche · Dulce de Leche · Vanilla Bean', 'Бриошь · Варёная сгущёнка · Ваниль', 'Briosh · Karamel · Vanil',
  490, '/src/assets/images/obsidian_latte_art_1795271463478.jpg', TRUE, FALSE
),
(
  'kyoto-cold-brew', 'iced',
  'Kyoto Slow-Drip Cold Brew', 'Колд Брю Киото 14 часов', 'Kioto Sekin Tomchilama Cold Brew',
  'Single-origin Kenyan beans cold-extracted drop by drop over 14 hours for crystalline clarity.',
  'Кенийская арабика медленной холодной экстракции в течение 14 часов с чистейшим вкусом.',
  '14 soat davomida tomchilab sovuq ekstraksiya qilingan Keniya arabikasi — tiniq va tetiklantiruvchi taʼm.',
  'Kenya Nyeri AA', 'Кения Ньери AA', 'Keniya Nyeri AA',
  'Blackcurrant · Molasses · Bergamot', 'Чёрная смородина · Патока · Бергамот', 'Qora smorodina · Shinni · Bergamot',
  520, '/src/assets/images/coffee_iced_coldbrew_1795267521843.jpg', TRUE, TRUE
),
(
  'iced-caramel-macchiato', 'iced',
  'Iced Caramel Macchiato', 'Айс Карамель Маккиато', 'Muzdek Karamel Makkiato',
  'Chilled milk poured over crystal ice, crowned with double espresso and house-scorched amber caramel.',
  'Холодное молоко со льдом, увенчанное двойным эспрессо и домашней янтарной карамелью.',
  'Shaffof muzli sovuq sut ustiga quyilgan ikki karra espresso va uy karamelining muvozanati.',
  'Brazil & Honduras', 'Бразилия и Гондурас', 'Braziliya va Gonduras',
  'Amber Caramel · Espresso Crema · Sea Salt', 'Янтарная карамель · Эспрессо · Морская соль', 'Qahrabo karamel · Espresso · Dengiz tuzi',
  560, '/src/assets/images/obsidian_iced_macchiato_1795271463345.jpg', TRUE, TRUE
),
(
  'yirgacheffe-v60', 'brew',
  'Ethiopia Yirgacheffe V60', 'Эфиопия Иргачеффе V60', 'Efiopiya Yirgacheffe V60',
  'Hand-poured Hario V60 filter brew highlighting delicate jasmine florals and white peach acidity.',
  'Ручное заваривание в воронке Hario V60, раскрывающее жасмин и сочный белый персик.',
  'Yasmin gullari va oq shaftoli nordonligini ochib beruvchi qoʻlda damlangan Hario V60 filter qahvasi.',
  'Gedeb, 2100m', 'Гедеб, 2100м', 'Gedeb, 2100m',
  'Jasmine · White Peach · Meyer Lemon', 'Жасмин · Белый персик · Лимон Мейера', 'Yasmin · Oq shaftoli · Limon',
  580, '/src/assets/images/coffee_v60_pourover_1795267521137.jpg', TRUE, TRUE
),
(
  'guji-natural-beans', 'beans',
  'Ethiopian Single-Origin Beans', 'Эфиопия Гуджи — Зерно', 'Efiopiya Guji — Butun Don',
  'Sun-dried natural process highland beans roasted weekly in small batches for filter or modern espresso.',
  'Высокогорное зерно натуральной сушки, обжаренное малыми партиями под фильтр и современный эспрессо.',
  'Filter va zamonaviy espresso uchun kichik partiyalarda qovurilgan quyoshda quritilgan togʻ donalari.',
  'Guji Zone, Ethiopia', 'Зона Гуджи, Эфиопия', 'Guji hududi, Efiopiya',
  'Wild Blueberry · Cocoa Nib · Rosewater', 'Лесная черника · Какао-бобы · Розовая вода', 'Yovvoyi chernika · Kakao · Atirgul suvi',
  1850, '/src/assets/images/coffee_specialty_beans_1795267522312.jpg', TRUE, TRUE
),
(
  'colombia-pink-bourbon-beans', 'beans',
  'Colombian Pink Bourbon Beans', 'Колумбия Розовый Бурбон — Зерно', 'Kolumbiya Pushti Burbon — Butun Don',
  'Rare micro-lot washed Pink Bourbon showcasing vibrant red berry aromatics and silky caramel sweetness.',
  'Редкий микролот мытого Розового Бурбона с яркой ягодной ароматикой и шёлковой карамелью.',
  'Yorqin qizil rezavor xushboʻyligi va mayin karamel shirinligiga ega noyob Pushti Burbon mikroloti.',
  'Huila, Colombia', 'Уила, Колумбия', 'Uila, Kolumbiya',
  'Raspberry · Pink Grapefruit · Honey', 'Малина · Розовый грейпфрут · Мёд', 'Malina · Pushti greypfrut · Asal',
  2200, '/src/assets/images/coffee_specialty_beans_1795267522312.jpg', TRUE, FALSE
)
ON CONFLICT (slug) DO NOTHING;
