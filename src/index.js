const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userExists = users.find((user) => user.username === username);
  if (!userExists)
    return response.status(404).json({ error: "Mensagem do erro" });

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.find((user) => user.username === username);
  if (userAlreadyExists)
    return response.status(400).json({ error: "Mensagem do erro" });
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const [user] = users.filter((user) => user.username === username);
  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  users.forEach((user) => {
    if (user.username === username) {
      user.todos.push(todo);
    }
  });
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;
  const { title, deadline } = request.body;
  users.forEach((user) => {
    if (user.username === username) {
      const index = user.todos.findIndex((todo) => todo.id === id);
      if (index === -1)
        return response.status(404).json({ error: "Mensagem do erro" });
      user.todos[index].title = title;
      user.todos[index].deadline = new Date(deadline);
      return response.status(200).json(user.todos[index]);
    }
  });
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  users.forEach((user) => {
    if (user.username === username) {
      const index = user.todos.findIndex((todo) => todo.id === id);
      if (index === -1)
        return response.status(404).json({ error: "Mensagem do erro" });
      user.todos[index].done = true;
      return response.status(200).json(user.todos[index]);
    }
  });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  users.forEach((user) => {
    if (user.username === username) {
      const index = user.todos.findIndex((todo) => todo.id === id);
      if (index === -1)
        return response.status(404).json({ error: "Mensagem do erro" });
      user.todos.splice(index, 1);
    }
  });
  return response.status(204).send();
});

module.exports = app;
