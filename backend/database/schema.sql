-- Propuesta para PostgreSQL No conecta ni modifica la aplicación actual.
-- Ejecutar en una base vacía: psql -d nombre_bd -f backend/database/schema.sql
-- Los CREATE TABLE no son idempotentes: este archivo se ejecuta una sola vez
-- Los UUID pueden generarse en PostgreSQL o enviarse desde el backend
BEGIN;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL CHECK (length(trim(full_name)) >= 2),
    email VARCHAR(254) NOT NULL CHECK (length(trim(email)) > 0),
    password_hash TEXT NOT NULL,
    balance NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Un correo no puede registrarse dos veces cambiando espacios o mayúsculas
CREATE UNIQUE INDEX users_email_unique ON users (lower(trim(email)));

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (expires_at > created_at)
);
CREATE INDEX sessions_user_idx ON sessions(user_id);
CREATE INDEX sessions_expiration_idx ON sessions(expires_at);

CREATE TABLE snails (
    id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    color VARCHAR(7) NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Una carrera real tiene su propia fecha y ciclo de vida
CREATE TABLE races (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'running', 'finished', 'cancelled')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (finished_at IS NULL OR
        (started_at IS NOT NULL AND finished_at >= started_at)),
    CHECK (status <> 'finished' OR finished_at IS NOT NULL),
    CHECK (status <> 'running' OR started_at IS NOT NULL)
);
CREATE INDEX races_scheduled_idx ON races(scheduled_at);

-- Relación entre carrera y caracol; aquí se guarda el resultado de cada participante
-- El ganador es el participante con final_position = 1
CREATE TABLE race_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id),
    snail_id VARCHAR(30) NOT NULL REFERENCES snails(id),
    lane INTEGER NOT NULL CHECK (lane > 0),
    final_position INTEGER CHECK (final_position > 0),
    elapsed_ms BIGINT CHECK (elapsed_ms >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'registered'
        CHECK (status IN ('registered', 'racing', 'finished',
                          'did_not_finish', 'disqualified')),
    UNIQUE (race_id, snail_id),
    UNIQUE (race_id, lane),
    UNIQUE (race_id, final_position),
    CHECK (status <> 'finished' OR
        (final_position IS NOT NULL AND elapsed_ms IS NOT NULL)),
    CHECK (status = 'finished' OR final_position IS NULL)
);
CREATE INDEX race_participants_snail_idx ON race_participants(snail_id);

CREATE TABLE bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    participant_id UUID NOT NULL REFERENCES race_participants(id),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX bets_user_idx ON bets(user_id);
CREATE INDEX bets_participant_idx ON bets(participant_id);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    -- Correo utilizado al pagar; conserva el valor histórico
    payer_email VARCHAR(254) NOT NULL,
    reference VARCHAR(100) NOT NULL,
    request_fingerprint TEXT NOT NULL,
    transaction_amount NUMERIC(12, 2),
    status VARCHAR(20) NOT NULL
        CHECK (status IN ('approved', 'rejected', 'error')),
    status_detail TEXT NOT NULL,
    authorization_code VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mock_card_number VARCHAR(16),
    mock_cvv VARCHAR(3),
    UNIQUE (user_id, reference),
    CHECK (status <> 'approved' OR
        (transaction_amount IS NOT NULL AND transaction_amount > 0
         AND authorization_code IS NOT NULL)),
    CHECK (status = 'approved' OR authorization_code IS NULL)
);
-- UNIQUE (user_id, reference) ya permite buscar pagos por usuario

-- Catálogo inicial: coincide con los caracoles de la aplicación
INSERT INTO snails (id, name, color) VALUES
    ('gary', 'Gary', '#34d399'),
    ('rocky', 'Rocky', '#92400e'),
    ('snellie', 'Snellie', '#3b82f6'),
    ('tuffsy', 'Miss Tuffsy', '#ec4899'),
    ('turbo', 'Turbo', '#facc15'),
    ('shelly', 'Shelly', '#a855f7');

COMMIT;

-- Al implementar la integración:
-- 1. Guardar pago aprobado y aumentar saldo dentro de la misma transacción
-- 2. Usar la referencia única para impedir duplicados antes de aumentar el saldo
-- 3. Guardar los puestos y finalizar la carrera en una misma transacción
-- 4. Validar que los puestos no excedan el número de participantes y estén completos
-- 5. No descontar saldo ni ejecutar apuestas en la aplicación mock actual:
--    estas tablas representan una propuesta futura para carreras reales
