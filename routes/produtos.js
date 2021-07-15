const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        const name = (new Date().toISOString() + '-' + file.originalname).split(':').join('-');
        cb(null, name);
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') return cb(null, true);
    return cb(null, false);
}

const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter
});

// RETORNA TODOS OS PRODUTOS
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            'SELECT * FROM produtos',
            (error, result, fields) => {
                if (error) return res.status(500).send({ error: error, response: null });

                const response = {
                    quantidade: result.length,
                    produtos: result.map(prod => {
                        return {
                            id_produto: prod.id_produto,
                            nome: prod.nome,
                            preco: prod.preco,
                            imagem_produto: prod.imagem_produto,
                            request: {
                                tipo: 'GET',
                                desc: 'Retorna todos os produtos',
                                url: 'http://localhost:3000/produtos'
                            }
                        }
                    })
                }
                res.status(200).send(response);
            }
        )
    })
});


//INSERE UM PRODUTO
router.post('/', upload.single('produto_imagem'), (req, res, next) => {
    console.log(req.file);
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query(
            'INSERT INTO produtos (nome, preco, imagem_produto) VALUES (?, ?, ?)',
            [req.body.nome, req.body.preco, req.file.path],
            (error, result, field) => {
                conn.release();

                if (error) return res.status(500).send({ error: error, response: null });

                const response = {
                    mensagem: 'Produto inserido com sucesso',
                    produtoCriado: {
                        id_produto: result.id_produto,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        imagem_produto: req.file.path,
                        request: {
                            tipo: 'POST',
                            desc: 'Insere um produto',
                            url: 'http://localhost:3000/produtos'
                        }
                    }
                }

                res.status(201).send(response);
            }
        )
    })
});

//RETORNA OS DADOS DE 1 PRODUTO CUJO ID PASSADO NO PARAMS
router.get('/:id_produto', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            'SELECT * FROM produtos WHERE id_produto = ?',
            [req.params.id_produto],
            (error, result, fields) => {
                if (error) return res.status(500).send({ error: error, response: null });

                if (result.length === 0) return res.status(404).send({ mensagem: 'Não foi encontrado produto com esse id' });

                const response = {
                    id_produto: result[0].id_produto,
                    nome: result[0].nome,
                    preco: result[0].preco,
                    imagem_produto: result[0].imagem_produto,
                    request: {
                        tipo: 'GET',
                        desc: 'Retorna os detalhes de um produto específico',
                        url: 'http://localhost:3000/produtos/' + result[0].id_produto
                    }
                }
                res.status(200).send(response);
            }
        )
    })
});

//ALTERA UM PRODUTO
router.patch('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query(
            'UPDATE produtos SET nome = ?, preco = ? WHERE id_produto = ?',
            [req.body.nome, req.body.preco, req.body.id_produto],
            (error, result, field) => {
                conn.release();

                if (error) return res.status(500).send({ error: error, response: null });

                const response = {
                    mensagem: 'Produto alterado com sucesso',
                    produtoAtualizado: {
                        id_produto: req.body.id_produto,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        request: {
                            tipo: 'PATCH',
                            desc: 'Altera um produto',
                            url: 'http://localhost:3000/produtos/' + req.body.id_produto
                        }
                    }
                }

                res.status(202).send(response);
            }
        )
    })
});

//EXCLUI UM PRODUTO
router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query(
            'DELETE FROM produtos WHERE id_produto = ?',
            [req.body.id_produto],
            (error, result, field) => {
                conn.release();

                if (error) return res.status(500).send({ error: error, response: null });

                const response = {
                    mensagem: 'Produto excluído com sucesso',
                    request: {
                        tipo: 'POST',
                        desc: 'Exclui um produto',
                        url: 'http://localhost:3000/produtos/' + req.body.id_produto,
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