CREATE TABLE pontos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    descricao TEXT,
    geom GEOMETRY(Point, 3763)
);

CREATE TABLE linhas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    descricao TEXT,
    geom GEOMETRY(LineString, 3763)
);

CREATE TABLE poligonos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    descricao TEXT,
    geom GEOMETRY(Polygon, 3763)
);
