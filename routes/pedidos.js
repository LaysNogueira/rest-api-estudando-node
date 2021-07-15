const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

// RETORNA TODOS OS PEDIDOS
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            `SELECT pedidos.id_pedido,
                    pedidos.quantidade,
                    produtos.id_produto,
                    produtos.nome,
                    produtos.preco
                FROM pedidos
            INNER JOIN produtos
                ON produtos.id_produto = pedidos.id_produto;`,
            (error, result, fields) => {
                if (error) return res.status(500).send({ error: error, response: null });

                const response = {
                    quantidade: result.length,
                    pedidos: result.map(pedido => {
                        return {
                            id_pedido: pedido.id_pedido,
                            quantidade: pedido.quantidade,
                            produto: {
                                id_produto: pedido.id_produto,
                                nome: pedido.nome,
                                preco: pedido.preco
                            },
                            request: {
                                tipo: 'GET',
                                desc: 'Retorna todos os pedidos',
                                url: 'http://localhost:3000/pedidos'
                            }
                        }
                    })
                }
                res.status(200).send(response);
            }
        )
    })
});


//INSERE UM PEDIDOS
router.post('/', (req, res, next) => {

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: error, response: null });
        conn.query(
            'SELECT * FROM produtos WHERE id_produto = ?',
            [req.body.id_produto],
            (error, result, fields) => {

                if (error) return res.status(500).send({ error: error, response: null });
                if (result.length === 0) return res.status(404).send({ mensagem: 'Produto não encontrado' });

                conn.query(
                    'INSERT INTO pedidos (id_produto, quantidade) VALUES (?, ?)',
                    [req.body.id_produto, req.body.quantidade],
                    (error, result, field) => {
                        conn.release();

                        if (error) return res.status(500).send({ error: error, response: null });

                        const response = {
                            mensagem: 'Pedido inserido com sucesso',
                            pedidoCriado: {
                                id_pedido: result.id_pedido,
                                id_produto: req.body.id_produto,
                                quantidade: req.body.quantidade,
                                request: {
                                    tipo: 'POST',
                                    desc: 'Insere um pedido',
                                    url: 'http://localhost:3000/pedidos'
                                }
                            }
                        }
                        res.status(201).send(response);
                    }
                )
            }
        )
    })
});

//RETORNA OS DADOS DE 1 PEDIDOS CUJO ID PASSADO NO PARAMS
router.get('/:id_pedido', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            'SELECT * FROM pedidos WHERE id_pedido = ?',
            [req.params.id_pedido],
            (error, result, fields) => {
                if (error) return res.status(500).send({ error: error, response: null });

                if (result.length === 0) return res.status(404).send({ mensagem: 'Não foi encontrado pedido com esse id' });

                const response = {
                    id_pedido: result[0].id_pedido,
                    id_produto: result[0].id_produto,
                    quantidade: result[0].quantidade,
                    request: {
                        tipo: 'GET',
                        desc: 'Retorna os detalhes de um pedido específico',
                        url: 'http://localhost:3000/produtos/' + result[0].id_pedido
                    }
                }
                res.status(200).send(response);
            }
        )
    })
});

//ALTERA UM PEDIDOS
router.patch('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query(
            'UPDATE pedidos SET quantidade = ? WHERE id_pedido = ?',
            [req.body.quantidade, req.body.id_pedido],
            (error, result, field) => {
                conn.release();

                if (error) return res.status(500).send({ error: error, response: null });

                const response = {
                    mensagem: 'Pedido alterado com sucesso',
                    produtoAtualizado: {
                        id_pedido: req.body.id_pedido,
                        quantidade: req.body.quantidade,
                        request: {
                            tipo: 'PATCH',
                            desc: 'Altera um pedido',
                            url: 'http://localhost:3000/pedidos/' + req.body.id_pedido
                        }
                    }
                }

                res.status(202).send(response);
            }
        )
    })
});

//EXCLUI UM PEDIDOS
router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query(
            'DELETE FROM pedidos WHERE id_pedido = ?',
            [req.body.id_pedido],
            (error, result, field) => {
                conn.release();

                if (error) return res.status(500).send({ error: error, response: null });

                const response = {
                    mensagem: 'Pedido excluído com sucesso',
                    request: {
                        tipo: 'POST',
                        desc: 'Exclui um pedido',
                        url: 'http://localhost:3000/pedidos/' + req.body.id_pedido,
                        body: {
                            nome: 'String',
                            preco: 'Number'
                        }
                    }
                }

                res.status(202).send(response);
            }
        )
    })
});

module.exports = router;