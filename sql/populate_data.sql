INSERT INTO pontos (nome, descricao, geom) VALUES
('Ponto A', 'Descrição do Ponto A', ST_SetSRID(ST_MakePoint(-8.682, 41.567), 3763)),
('Ponto B', 'Descrição do Ponto B', ST_SetSRID(ST_MakePoint(-8.671, 41.559), 3763));

INSERT INTO linhas (nome, descricao, geom) VALUES
('Linha A', 'Descrição da Linha A', ST_SetSRID(ST_MakeLine(ARRAY[
    ST_MakePoint(-8.682, 41.567),
    ST_MakePoint(-8.671, 41.559)
]), 3763));

INSERT INTO poligonos (nome, descricao, geom) VALUES
('Polígono A', 'Descrição do Polígono A', ST_SetSRID(ST_MakePolygon(ST_GeomFromText(
    'LINESTRING(-8.682 41.567, -8.671 41.559, -8.678 41.552, -8.682 41.567)'
)), 3763));
