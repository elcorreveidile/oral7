-- Script para añadir tablas de votación de debates sin modificar lo existente
-- Ejecutar directamente en la base de datos

-- Tabla de temas de debate
CREATE TABLE IF NOT EXISTS "debate_topics" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debate_topics_pkey" PRIMARY KEY ("id")
);

-- Tabla de votos de debates
CREATE TABLE IF NOT EXISTS "debate_votes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "debate_votes_pkey" PRIMARY KEY ("id")
);

-- Crear índices
CREATE INDEX IF NOT EXISTS "debate_votes_userId_idx" ON "debate_votes"("userId");
CREATE INDEX IF NOT EXISTS "debate_votes_topicId_idx" ON "debate_votes"("topicId");

-- Crear constraint único para un voto por usuario por tema
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'debate_votes_userId_topicId_key'
    ) THEN
        ALTER TABLE "debate_votes" ADD CONSTRAINT "debate_votes_userId_topicId_key" UNIQUE ("userId", "topicId");
    END IF;
END $$;

-- Crear foreign keys (si las tablas users existen)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'debate_votes_userId_fkey'
    ) THEN
        ALTER TABLE "debate_votes" ADD CONSTRAINT "debate_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'debate_votes_topicId_fkey'
    ) THEN
        ALTER TABLE "debate_votes" ADD CONSTRAINT "debate_votes_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "debate_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
