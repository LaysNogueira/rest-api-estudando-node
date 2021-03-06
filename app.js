const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const rotaProdutos = require('./routes/produtos');
const rotaPedidos = require('./routes/pedidos');

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads')); // diretório uploads disponível publicamente
app.use(bodyParser.urlencoded({ extended: false })); //apenas dados simples
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); //de onde pode vir as requisições
    res.header(
        'Access-Control-Allow-Header', // o que será aceito no cabeçalho (header)
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET'); // tipos de metodos aceitos
        return res.status(200).send({});
    }

    next();
})

app.use('/produtos', rotaProdutos);
app.use('/pedidos', rotaPedidos);

// Quando não encontra rota, entra aqui:
app.use((req, res, next) => {
    const erro = new Error('Não encontrado');
    erro.status = 400;
    next(erro);
});

// app.use((error, req, res, next) => {
//     res.status(error.status || 500);
//     return res.send({
//         erro: {
//             mensagem: error.message
//         }
//     })
// });

module.exports = app;