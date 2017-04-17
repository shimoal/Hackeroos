var app = require('./app.js');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;


/************** dynamic rooms ***************/
var users = {};
var userNum = 0;
// rooms = {room_name: {users:[], code: []}}
var rooms = {};

io.on('connection', function(socket) {
  userNum++;
  socket.on('disconnect', function() {
    userNum--;
  });

  /** when client emits 'join-room' */
  socket.on('join-room', function(username, room_name) {
    console.log('a user has entered: ', username, room_name);
    if (rooms[room_name]) {
      if (!rooms[room_name].users.includes(username)) {
        rooms[room_name].users.push(username);
        socket.join(room_name);
        io.in(room_name).emit('info', 'a new user has joined the room');// broadcast to everyone in the room
        // io.to(socket.id).emit('info', 'You joined the room');
        io.to(socket.id).emit('info', '');
        io.to(socket.id).emit('setup-editor', rooms[room_name].code);
      } else {
        console.log('rooms', rooms);
        // io.to(socket.id).emit('info', 'You are already in the room');
        io.to(socket.id).emit('info', '');
      }
    } else {
      rooms[room_name] = {users:[], code:[]};
      rooms[room_name].users.push(username);
      console.log('rooms', rooms);
      socket.join(room_name);
    }
  });

  socket.on('exit_room', function(username, room_name) {
    console.log('exit room is being called');
    if (room_name.charAt(0) === 'D') {
      socket.leave(room_name);
      console.log('left the demo room');
    } else {
      if (rooms[room_name]) {
        var index = rooms[room_name].users.indexOf(username);
        rooms[room_name].users.splice(index, 1);
      } else {
        // delete rooms[room_name];
      }
      io.in(room_name).emit('info', 'the other user exit the room');
      socket.leave(room_name);
      io.to(socket.id).emit('info', 'You left the room. Live coding is disabled');
      io.to(socket.id).emit('exit_room');
      console.log('exit_room', rooms);
    }
  });

  socket.on('editor-content-changes', function(room_name, val) {
    console.log('room_name in server ------> ', room_name);
    console.log('rooms ', rooms);
    if (rooms[room_name]) {
      rooms[room_name].code.push(val);
      socket.broadcast.to(room_name).emit('editor-content-changes', val);
    }
  });

  socket.on('clear-editor', function(room_name) {
    io.in(room_name).emit('clear-editor');
  });

  socket.on('submit-val', function(room_name, val) {
    console.log('run code in server, ', rooms, ": ", val);
    /************ Use vm2 to sandbox untrusted code ************/
    var sandbox = {
      _output: JSON.parse('[]'),
      console: {
        log: function(input) {
          sandbox._output.push(input);
        }
      }
    };
    const {VM, VMScript} = require('vm2');
    const vm = new VM({
      timeout: 1000,
      sandbox: sandbox
    });
    try {
      var script = new VMScript(val).compile();
      vm.run(script);
    } catch (error) {
      console.log('error in vm\n', error.message);
      sandbox._output.push(error.message);
    }
    console.log('vm: ', sandbox._output);
    /****************************************/
    if (room_name) {
      console.log('emit to all', room_name, sandbox._output);
      io.in(room_name).emit('submit-val', sandbox._output);     
    } else {
      console.log('emit to self');
      io.to(socket.id).emit('submit-val', sandbox._output);
    }
  });

  /** for the video chat **/
  socket.on('sendDescription', function(room_name, data) {
    console.log('sending DESCRIPTION to:' + room_name +": " + data);
    io.in(room_name).emit('description', data);
  });

  socket.on('sendCandidate', function(room_name, data){
    console.log('sending CANDIDATE to:' + room_name +": " + data);
    io.in(room_name).emit('candidate', data);
  });

  socket.on('stopCall', function(room_name){

    socket.broadcast.to(room_name).emit('stopCall');
  })

});

http.listen(port, function() {
  console.log('now listening on port ' + port);
});