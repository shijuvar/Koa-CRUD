/**
 * Module dependencies.
 */
var logger = require('koa-logger');
var route = require('koa-route');
var views = require('co-views');
var parse = require('co-body');
var koa = require('koa');
var app = koa();

// "data store"
var todos = []; //To Do : DB change to MongoDB

// middleware
app.use(logger());

// route middleware
app.use(route.get('/', list));
app.use(route.get('/todo/new', add));
app.use(route.get('/todo/:id', show));
app.use(route.get('/todo/delete/:id', remove));
app.use(route.get('/todo/edit/:id', edit));
app.use(route.post('/todo/create', create));
app.use(route.post('/todo/update', update));

//Specifying Swig view engine
var render= views(__dirname + '/views', { map: { html: 'swig' }});

// route definitions

/**
 * Todo item List.
 */
function *list() {
  this.body = yield render('index', { todos: todos });
}

/**
 * Form for create new todo item.
 */
function *add() {
  this.body = yield render('new');
}

/**
 * Form for edit a todo items.
 */
function *edit(id) {
    var todo = todos[id];
    if (!todo) this.throw(404, 'invalid todo id');
    this.body = yield render('edit', { todo: todo });
}

/**
 * Show details of a todo item.
 */

function *show(id) {
  var todo = todos[id];
  if (!todo) this.throw(404, 'invalid todo id');
  this.body = yield render('show', { todo: todo });
}

/**
 * Delete a todo item
 */
function *remove(id) {
    var todo = todos[id];
    if (!todo) this.throw(404, 'invalid todo id');
   todos.splice(id,1);
    //Changing the Id for working with index
    for (var i = 0; i < todos.length; i++)
    {
        todos[i].id=i;
    }
    this.redirect('/');
}

/**
 * Create a todo item into the data store.
 */
function *create() {
  var todo = yield parse(this);
  todo.created_on = new Date;
  todo.updated_on = new Date;
  var id = todos.push(todo);
  todo.id = id-1;//Id with index of the array
  this.redirect('/');
}

/**
 * Update an existing todo item.
 */
function *update() {
    var todo = yield parse(this);
    var index=todo.id;
    todos[index].name=todo.name;
    todos[index].description=todo.description;
    todos[index].updated_on = new Date;
    this.redirect('/');
}

// http server listening
app.listen(3000);
console.log('listening on port 3000');