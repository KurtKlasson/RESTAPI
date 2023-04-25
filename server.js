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
    database: "rest-api"
  });

  connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

// GET route for all movies
app.get('/movies', (req, res) => {
  const movies = [
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Godfather', year: 1972 },
    { title: 'The Dark Knight', year: 2008 }
  ];

  res.json(movies);
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
        <li>POST /login - Skapar en ny användare/li>
        <li>PUT /users/:id - Uppdaterar en befintlig användare med ID:t</li>
    </ul>
  `;

  res.send(routes);
});
// GET route for a specific movie
app.get('/movies/:title', (req, res) => {
  const title = req.params.title;
  const movie = { title: title, year: 1994 };

  res.json(movie);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/movies/:userId', (req, res) => {
  const userId = req.params.userId;
  res.send(`User ID: ${userId}`);
  console.log(req.params)
});

app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(`Search query: ${query}`);
  console.log(req.query)
});

app.post('/movie', function(req, res) {
    //kod här för att hantera anrop…
    let sql = `INSERT INTO movies (movie, date)
      VALUES ('${req.body.title}', '${req.body.year}')`
   
    connection.query(sql, function(err, result, fields) {
      if (err) throw err
        //kod här för att hantera returnera data…

        res.send(result)
    });
   });
   

app.put('/movies/:id', (req, res) => {
  const id = req.params.id;
  const updatedUserData = req.body;
  

  connection.query('UPDATE movies SET ? WHERE id = ?', [updatedUserData, id], (error, results) => {
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


app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;


  const salt = crypto.randomBytes(16).toString('hex');

  const passwordHash = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex');

  db.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, passwordHash], (err, result) => {
    if (err) throw err;
    res.send('User created successfully!');
  });
});