-- VITALMENTE - ESTRUCTURA DE BASE DE DATOS
-- Ejecutar en Supabase SQL Editor

-- 1. TABLA DE PERFILES DE USUARIO
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  phone TEXT,
  full_name TEXT NOT NULL,
  age INTEGER,
  weight DECIMAL,
  height DECIMAL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  physical_goals TEXT[],
  emotional_goals TEXT[],
  dietary_restrictions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROGRESO DIARIO DE USUARIOS
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  calories_consumed INTEGER DEFAULT 0,
  protein_consumed DECIMAL DEFAULT 0,
  carbs_consumed DECIMAL DEFAULT 0,
  fats_consumed DECIMAL DEFAULT 0,
  workout_completed BOOLEAN DEFAULT FALSE,
  meditation_completed BOOLEAN DEFAULT FALSE,
  water_intake INTEGER DEFAULT 0,
  weight_log DECIMAL,
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 3. SISTEMA DE RACHAS
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  streak_type TEXT CHECK (streak_type IN ('nutrition', 'exercise', 'meditation', 'overall')),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

-- 4. LOGROS Y ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- 5. CONTENIDO DINÁMICO
CREATE TABLE IF NOT EXISTS daily_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('nutrition', 'exercise', 'mindset', 'general')),
  active BOOLEAN DEFAULT TRUE,
  display_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PROMOCIONES DE SUPLEMENTOS
CREATE TABLE IF NOT EXISTS supplement_promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_goals TEXT[],
  image_url TEXT,
  affiliate_link TEXT,
  price DECIMAL,
  discount_percentage INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TRACKING DE PROMOCIONES
CREATE TABLE IF NOT EXISTS promotion_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  promotion_id UUID REFERENCES supplement_promotions(id) ON DELETE CASCADE,
  interaction_type TEXT CHECK (interaction_type IN ('view', 'click', 'purchase')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POLÍTICAS DE SEGURIDAD (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_interactions ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver/editar sus propios datos
CREATE POLICY "Users can view own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can view own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own streaks" ON user_streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own interactions" ON promotion_interactions FOR ALL USING (auth.uid() = user_id);

-- Políticas públicas para contenido
CREATE POLICY "Anyone can view tips" ON daily_tips FOR SELECT USING (active = true);
CREATE POLICY "Anyone can view promotions" ON supplement_promotions FOR SELECT USING (active = true);

-- DATOS INICIALES
INSERT INTO daily_tips (title, content, category) VALUES
('💧 Hidratación Matutina', 'Comienza tu día con un vaso de agua tibia con limón para activar tu metabolismo', 'nutrition'),
('🏃‍♂️ Movimiento Diario', 'Solo 10 minutos de caminata pueden mejorar tu estado de ánimo significativamente', 'exercise'),
('🧘‍♀️ Respiración Consciente', 'Toma 3 respiraciones profundas antes de cada comida para mejorar la digestión', 'mindset'),
('🥗 Colores en tu Plato', 'Incluye al menos 3 colores diferentes en cada comida para máxima nutrición', 'nutrition'),
('💪 Fuerza Progresiva', 'Aumenta gradualmente la intensidad de tus ejercicios cada semana', 'exercise');

INSERT INTO supplement_promotions (name, description, target_goals, price, discount_percentage, affiliate_link) VALUES
('Proteína Whey Premium', 'Proteína de alta calidad para recuperación muscular', ARRAY['gain_muscle', 'lose_weight'], 45.99, 20, 'https://tu-enlace-afiliado.com/proteina'),
('Omega-3 Ultra', 'Ácidos grasos esenciales para salud cardiovascular', ARRAY['general_health', 'brain_health'], 29.99, 15, 'https://tu-enlace-afiliado.com/omega3'),
('Multivitamínico Completo', 'Vitaminas y minerales esenciales diarios', ARRAY['general_health', 'energy'], 24.99, 10, 'https://tu-enlace-afiliado.com/multivitaminico');

-- FUNCIONES AUXILIARES
CREATE OR REPLACE FUNCTION update_streak(user_uuid UUID, streak_type_param TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
  VALUES (user_uuid, streak_type_param, 1, 1, CURRENT_DATE)
  ON CONFLICT (user_id, streak_type)
  DO UPDATE SET
    current_streak = CASE 
      WHEN user_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' 
      THEN user_streaks.current_streak + 1
      WHEN user_streaks.last_activity_date = CURRENT_DATE 
      THEN user_streaks.current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(user_streaks.longest_streak, 
      CASE 
        WHEN user_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' 
        THEN user_streaks.current_streak + 1
        ELSE 1
      END
    ),
    last_activity_date = CURRENT_DATE,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
