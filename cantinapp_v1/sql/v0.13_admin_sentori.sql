-- ============================================================
-- CantinApp v1.07 - Migration: Sistema admin + sentori dinamici
-- ============================================================
-- Aggiunge:
--   1. Ruolo admin sui profili
--   2. Tabelle famiglie_olfattive / sottocategorie_olfattive / sentori
--   3. RLS policies (lettura aperta, scrittura solo admin, insert pending utenti)
--
-- IMPORTANTE: dopo aver eseguito questo SQL, sostituisci l'email
-- in fondo per assegnare il ruolo admin al tuo account.
-- ============================================================


-- 1. RUOLO ADMIN
-- ----------------------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;


-- 2. TABELLA FAMIGLIE OLFATTIVE
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS famiglie_olfattive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  color TEXT,
  ordine INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. TABELLA SOTTOCATEGORIE OLFATTIVE
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sottocategorie_olfattive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  famiglia_key TEXT REFERENCES famiglie_olfattive(key) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  compat TEXT[],
  ordine INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sottocategorie_unique 
  ON sottocategorie_olfattive (famiglia_key, key);


-- 4. TABELLA SENTORI (voci finali: limone, mela, ecc.)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sentori (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sottocategoria_id UUID REFERENCES sottocategorie_olfattive(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  stato TEXT NOT NULL DEFAULT 'attivo',  -- 'attivo' | 'pending' | 'rifiutato'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approvato_at TIMESTAMPTZ,
  approvato_by UUID REFERENCES auth.users(id),
  note_origine TEXT
);

-- Unique index per evitare duplicati case-insensitive nella stessa sottocategoria
CREATE UNIQUE INDEX IF NOT EXISTS idx_sentori_unique 
  ON sentori (sottocategoria_id, LOWER(nome));

-- Index per query frequenti
CREATE INDEX IF NOT EXISTS idx_sentori_stato ON sentori (stato);
CREATE INDEX IF NOT EXISTS idx_sentori_sottocategoria ON sentori (sottocategoria_id);


-- 5. ROW LEVEL SECURITY
-- ----------------------------------------------------------------
ALTER TABLE famiglie_olfattive ENABLE ROW LEVEL SECURITY;
ALTER TABLE sottocategorie_olfattive ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentori ENABLE ROW LEVEL SECURITY;

-- Drop precedenti policy per ri-eseguibilità
DROP POLICY IF EXISTS "famiglie lettura aperta" ON famiglie_olfattive;
DROP POLICY IF EXISTS "famiglie admin write" ON famiglie_olfattive;
DROP POLICY IF EXISTS "sottocategorie lettura aperta" ON sottocategorie_olfattive;
DROP POLICY IF EXISTS "sottocategorie admin write" ON sottocategorie_olfattive;
DROP POLICY IF EXISTS "sentori lettura" ON sentori;
DROP POLICY IF EXISTS "sentori insert pending" ON sentori;
DROP POLICY IF EXISTS "sentori update admin" ON sentori;
DROP POLICY IF EXISTS "sentori delete admin" ON sentori;

-- LETTURA: famiglie e sottocategorie aperte a tutti gli autenticati
CREATE POLICY "famiglie lettura aperta" ON famiglie_olfattive
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "sottocategorie lettura aperta" ON sottocategorie_olfattive
  FOR SELECT USING (auth.role() = 'authenticated');

-- LETTURA sentori: tutti vedono gli attivi, ognuno vede anche i propri pending
CREATE POLICY "sentori lettura" ON sentori
  FOR SELECT USING (
    stato = 'attivo' 
    OR auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- INSERT sentori: utenti normali possono inserire SOLO con stato='pending'
CREATE POLICY "sentori insert pending" ON sentori
  FOR INSERT WITH CHECK (
    auth.uid() = created_by 
    AND (
      stato = 'pending'
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    )
  );

-- UPDATE / DELETE sentori: solo admin
CREATE POLICY "sentori update admin" ON sentori
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "sentori delete admin" ON sentori
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Famiglie / sottocategorie: write solo admin
CREATE POLICY "famiglie admin write" ON famiglie_olfattive
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "sottocategorie admin write" ON sottocategorie_olfattive
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );


-- 6. ASSEGNA RUOLO ADMIN A TE
-- ----------------------------------------------------------------
-- Imposta il tuo account come admin
UPDATE profiles 
SET is_admin = TRUE 
WHERE id = (SELECT id FROM auth.users WHERE email = 'depmassimo@gmail.com');


-- 7. VERIFICA
-- ----------------------------------------------------------------
-- Esegui queste query DOPO la migration per verificare che tutto sia ok:
--
-- SELECT id, email, is_admin FROM profiles JOIN auth.users ON profiles.id = auth.users.id;
-- SELECT COUNT(*) FROM famiglie_olfattive;
-- SELECT COUNT(*) FROM sottocategorie_olfattive;
-- SELECT COUNT(*) FROM sentori;
