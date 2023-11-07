const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

async function existsClienteByCpf(cpf) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    const [rows] = await connection.execute('SELECT * FROM Cliente WHERE cpf = ?', [cpf]);
    return rows.length > 0;
  } finally {
    await connection.end();
  }
}

async function generateToken(cpf) {
  const secret = process.env.JWT_SECRET;

  const token = jwt.sign({ cpf }, secret);

  return token;
}

exports.handler = async (event, context) => {
  if (!event.body) {
    return {
      statusCode: 401,
      body: JSON.stringify('Corpo da requisição inválido!'),
      headers: {
        'Content-Type': 'application/json',
      }
    };
  }

  const body = JSON.parse(event.body);

  if (await existsClienteByCpf(body.cpf)) {
    const token = await generateToken(body.cpf);

    return {
      statusCode: 200,
      body: JSON.stringify({ token: token }),
      headers: {
        'Content-Type': 'application/json',
      }
    };
  }

  return {
    statusCode: 401,
    body: JSON.stringify('Corpo da requisição inválido!'),
    headers: {
      'Content-Type': 'application/json',
    }
  };
};
