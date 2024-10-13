-- Criação do banco de dados
CREATE DATABASE confeitisys;

-- Tabela de produtos
CREATE TABLE produto (
                         id bigserial NOT NULL PRIMARY KEY,
                         nome varchar(100) NOT NULL,
                         descricao varchar(255),
                         preco numeric(16,2),
                         categoria varchar(20) CHECK (categoria IN (
                                                                    'MATERIA_PRIMA',
                                                                    'BOLO',
                                                                    'DOCE',
                                                                    'QUITANDA',
                                                                    'TORTA',
                                                                    'SOBREMESA',
                                                                    'BEBIDA',
                                                                    'CUPCAKE_MUFFIN',
                                                                    'SALGADO',
                                                                    'RECHEIO_COBERTURA',
                                                                    'UTENSILIO_EMBALAGEM'
                             )) NOT NULL,
                         tipo varchar(10) CHECK (tipo IN (
                                                          'UN',          -- Unidade
                                                          'GR',          -- Gramas
                                                          'ML',          -- Mililitros
                                                          'KG',          -- Quilogramas
                                                          'L',           -- Litros
                                                          'CX',          -- Caixa
                                                          'PC',          -- Pacote
                                                          'FT',          -- Fatia
                                                          'DZ',          -- Dúzia
                                                          'TBSP',        -- Colher de sopa
                                                          'TSP'          -- Colher de chá
                             )) NOT NULL,
                         data_cadastro date
);

-- Tabela de clientes
CREATE TABLE cliente (
                         id bigserial NOT NULL PRIMARY KEY,
                         nascimento date,
                         nome varchar(100) NOT NULL,
                         endereco varchar(255),
                         telefone varchar(14),
                         email varchar(100) UNIQUE,
                         data_cadastro date,
                         observacao varchar(255)
);

-- Tabela de usuários
CREATE TABLE usuario (
                         id bigserial NOT NULL PRIMARY KEY,
                         email varchar(100) UNIQUE NOT NULL,
                         senha varchar(255) NOT NULL
);

-- Tabela de vendas
CREATE TABLE venda (
                       id bigserial NOT NULL PRIMARY KEY,
                       id_cliente bigint REFERENCES cliente (id) NOT NULL,
                       forma_pagamento varchar(8) CHECK (forma_pagamento IN ('DINHEIRO', 'PIX', 'CARTAO')) NOT NULL,
                       status_pagamento varchar(8) CHECK (status_pagamento IN ('PAGO', 'PENDENTE')) NOT NULL,
                       status_pedido varchar(8) CHECK (status_pedido IN ('PRODUCAO', 'ENTREGUE', 'CANCELADO')) NOT NULL,
                       total numeric(16,2) NOT NULL,
                       data_cadastro date,
                       data_entrega date,
                       observacao varchar(255)
);

-- Tabela de itens de venda (produtos vendidos)
CREATE TABLE item_venda (
                            id bigserial NOT NULL PRIMARY KEY,
                            id_venda bigint REFERENCES venda (id) NOT NULL,
                            id_produto bigint REFERENCES produto (id) NOT NULL,
                            quantidade integer NOT NULL,
                            valor_unitario numeric(16, 2) NOT NULL  -- Valor unitário do produto no momento da venda
);

-- Tabela de insumos para os produtos (usados na produção dos produtos)
CREATE TABLE item_produto (
                              id bigserial NOT NULL PRIMARY KEY,
                              produto_id bigint REFERENCES produto (id) NOT NULL,
                              itemProduto bigint REFERENCES produto (id) NOT NULL,
                              quantidade integer NOT NULL
);

-- Tabela de insumos utilizados em cada item da venda (registrando insumos e custos no momento da venda)
CREATE TABLE item_venda_detalhe (
                                    id bigserial NOT NULL PRIMARY KEY,
                                    id_item_venda bigint REFERENCES item_venda (id) NOT NULL,  -- Referência ao item vendido
                                    id_produto bigint REFERENCES produto (id) NOT NULL,        -- Referência ao insumo (produto)
                                    quantidade integer NOT NULL,                               -- Quantidade do insumo utilizada
                                    preco numeric(16,2) NOT NULL                               -- Preço do insumo no momento da venda
);
