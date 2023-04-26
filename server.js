const express = require('express');
const app = express();
const port = 3000;
const crypto = require('crypto');

var bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var mysql = require('mysql');

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "restapi"
  });

  connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

// GET route for all movies
app.get('/movies', function(req, res) {
  let sql = `SELECT * FROM movies`;
  connection.query(sql, function (err, result, fields) {
    if (err) throw err;
    res.send(result);
  });
});

app.get('/', (req, res) => {
  const routes = `
    <h1>Tillgängliga routes:</h1>
    <ul>
      <li>/movies</li>
      <li>/movies/:title</li>
      <li>/users/:userId</li>
      <li>/search?q=<i>query</i></li>
        <li>GET /movies - Hämtar alla filmer</li>
        <li>POST /movie - Skapar en ny filmer/li>
        <li>POST /users - Skapar en ny användare/li>
        <li>PUT /users/:id - Uppdaterar en befintlig användare med ID:t</li>
    </ul>
  `;

  res.send(routes);
});
// GET route for a specific movie
app.get('/movie/:title', function(req, res) {
  let sql = `SELECT * FROM movies WHERE title = '${req.body.title}'`;
  connection.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result.length)
    if (result.length === 0) {
      res.status(404).json({
        message: "Movie not found"
      });
    } else {
      res.send(result);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(`Search query: ${query}`);
  console.log(req.query)
});

app.post('/movie', function(req, res) {
  let sql = `Select * FROM movies where title = '${req.body.title}'`;
  connection.query(sql, function (err, results, fields) {
    if (err) throw err;
    if (results.length === 0){
      let sql = `INSERT INTO movies (title, year)
      VALUES ('${req.body.title}', '${req.body.year}')`
      connection.query(sql, function(err, result, fields) {
        if (err) throw err;
        //kod här för att hantera returnera data…
        res.send(result);
      });
    } else {
      res.status(400).json({
        message: "Movie already exists"
      });
    }
  });
});
   

app.put('/movies/:title', (req, res) => {
  const id = req.body.title;
  const updatedUserData = req.body.year;
  

  connection.query('UPDATE movies SET year = ? WHERE title = ?', [updatedUserData, id], (error, results) => {
    if (error) {
      console.error('Error updating movie: ', error);
      res.status(400).send('Could not update movie.');
      return;
    }

   
    if (results.affectedRows === 0) {
      res.status(400).send('Movie not found.');
    } else {
      res.status(200).send('Movie updated successfully.');
    }
  });
});


app.post('/users', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;


  const salt = crypto.randomBytes(16).toString('hex');

  const passwordHash = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex');

  connection.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, passwordHash], (err, result) => {
    if (err) throw err;
    res.send('User created successfully!');
  });
});


app.get('/user', function(req, res) {
  let searchQuery = req.query.q;
  let sql = `SELECT * FROM users WHERE id = ${req.body.q} OR username = ${req.body.q}`;
  connection.query(sql, [searchQuery, searchQuery], function (err, results, fields) {
    if (err) throw err;
    if (results.length === 0) {
      res.status(404).send('Användaren hittades inte.');
    } else {
      res.send(results);
    }
  });
});