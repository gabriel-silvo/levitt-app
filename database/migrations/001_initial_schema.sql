-- Armazena as informações de cada pessoa cadastrada no aplicativo.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE, -- Opcional para login
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Nulo se for login social
    phone_number VARCHAR(50),
    birth_date DATE,
    avatar_url VARCHAR(255),
    google_id VARCHAR(255) UNIQUE, -- ID único do Google
    apple_id VARCHAR(255) UNIQUE,  -- ID único da Apple
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cadastro das igrejas locais para associar aos ministérios.
CREATE TABLE churches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    state VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela centralizada para as funções/habilidades (Violonista, Vocalista, etc.).
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Associa um usuário a uma ou mais habilidades que ele possui. (Relação N-N entre users e skills)
CREATE TABLE user_skills (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, skill_id)
);

-- Define um ministério, associado a uma igreja e um líder.
CREATE TABLE ministries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    church_id UUID REFERENCES churches(id) ON DELETE SET NULL, -- Se a igreja for deletada, o ministério não é
    leader_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Se o líder sair, o ministério não acaba
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Define quem pertence a qual ministério e seu papel. (Relação N-N entre users e ministries)
CREATE TYPE ministry_role AS ENUM ('member', 'admin');

CREATE TABLE ministry_members (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE,
    role ministry_role NOT NULL DEFAULT 'member',
    PRIMARY KEY (user_id, ministry_id)
);

-- O repertório de músicas de cada ministério.
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    default_key VARCHAR(10), -- Tom padrão
    default_bpm INT,         -- BPM padrão
    lyrics TEXT,
    chords_url VARCHAR(255),
    youtube_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela única para Escalas e Ensaios. Um ensaio pode ser filho de uma escala.
CREATE TYPE event_type AS ENUM ('scale', 'rehearsal');

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE,
    parent_event_id UUID REFERENCES events(id) ON DELETE CASCADE, -- Para linkar ensaio a uma escala
    type event_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quais músicas serão tocadas em qual evento. (Relação N-N entre events e songs)
CREATE TABLE event_songs (
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    key_override VARCHAR(10), -- Permite mudar o tom só para este evento
    notes TEXT,
    PRIMARY KEY (event_id, song_id)
);

-- Quais membros foram escalados para qual evento e com qual função específica.
CREATE TABLE event_participants (
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    PRIMARY KEY (event_id, user_id)
);

-- Rastreia o progresso de estudo de um usuário para uma música de um evento específico.
CREATE TYPE study_status AS ENUM ('pending', 'in_progress', 'completed');

CREATE TABLE user_study_tracking (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    status study_status NOT NULL DEFAULT 'pending',
    last_studied_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id, event_id, song_id)
);

-- Armazena os horários de estudo preferenciais de cada usuário.
CREATE TABLE user_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL, -- 0=Domingo, 1=Segunda, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- Links e recursos que os usuários adicionam para auxiliar no estudo de uma música.
CREATE TABLE user_study_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_user_id UUID NOT NULL,
    tracking_event_id UUID NOT NULL,
    tracking_song_id UUID NOT NULL,
    added_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_url VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (tracking_user_id, tracking_event_id, tracking_song_id) 
        REFERENCES user_study_tracking(user_id, event_id, song_id) ON DELETE CASCADE
);