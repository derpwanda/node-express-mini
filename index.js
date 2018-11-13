// implement your API here
const express = require('express');

const greeter = require('./greeter.js');
const db = require('./data/db.js');

const server = express();

// middleware 
server.use(express.json()); //teaches express how to parse the json request body


server.get('/', (req, res) => {
  res.json('alive!');
})

server.get('/greet', (req, res) => {
  res.json({ hello: 'stranger' })
})

server.get('/api/users', (req, res) => {
  db.find()
    .then(users => {
      res.status(200).json(users);
  })
    .catch(err => {
      res.status(500).json({ message: "we failed you, can't get the users" })
  })
});

server.get('/api/users/:id', (req, res) => {
  const { id } = req.params;

  db.findById(id)
    .then(user => {
      if (user) {
        res.status(200).json(user);
      } else {
    res.status(404).json({ message: 'this user not found' });
    }
  })
  .catch(err => {
    res.status(500).json({ message: "we failed you, can't get the users" })
  });
});

server.post('/api/users', async (req, res) => {
  console.log('body:', req.body);
  try {
    const userData = req.body;
    const userId = await db.insert(userData);
    const user = await db.findById(userId.id);

    res.status(201).json(userId);
  } catch (error) {
    let message = "error creating the user";

    if(error.errno === 19){
      message = "please provide both the name and the bio";
    }

    res.status(500).json({ message: "error creating user", error })
  }
});

//put that also checks when the user is not found
server.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const changes = req.body;
  db.update(id, changes)
    .then(count => {
      if(count) {
        res.status(200).json({ message: `${count} user updated` })
      } else {
        res.status(404).json({ message: "user not found" })
      }
    })
    .catch(err => {
      res.status(500).json({ message: "error updating the user" })
    });
});

server.delete('/api/users/:id', (req, res) => {
  db.remove(req.params.id).
    then(count => {
      res.status(200).json(count); //204 - nothing to send back
  }).catch(err => {
      res.status(500).json({message: 'error deleting user'})
  })
})

server.get('/greet/:person', greeter);

server.listen(9000, () => console.log('the server is alive!'));
