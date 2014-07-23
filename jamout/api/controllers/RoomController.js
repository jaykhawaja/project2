/**
 * RoomController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  'new': function (req, res) {
    res.view();
  },

  create: function(req, res, next) {

    var roomObj = {
      name: req.param('name'),
      creator: req.session.User.name,
    }


    Room.create(roomObj, function roomCreated(err, room){
        //console.log("INSIDE ROOM CREATE" + room.id);

        if (err) return next(err);

      if (!room) return next();

        room.save(function (err) { 

          if (err) return res.send(err, 500);
           // Inform other sockets (e.g. connected sockets that are subscribed) when room is created
          Room.publishCreate({
            id: room.id,
            creator: room.creator,
            name: room.name,
            action: ' room has been created.'
          });




      //res.json({room: room});
      return res.redirect('/room/show/' + room.id);
      });
    });
  },
   


  show: function (req, res, next) {

    var room = req.param('id');
    var creator = req.session.User.name;
    


    Room.findOne(room, function foundRoom (err, room) {
      //console.log(room.id);
    
      if (err) return next(err);
      if (!room) return next();
      

      res.view({
        room: room
      });
    });

	 
  	},

    //Get a list of rooms for room admin page
  index: function (req, res, next) {


    //Get an array of all rooms in the room collection(e.g. table)
    Room.find(function foundRooms (err, rooms){
      if (err) return next(err);
      //pass the array downt o the /views/index.ejs page
      res.view({
        rooms: rooms
      });
    });
  },

  //Get a list of rooms for the explore section on user profile
  explore: function (req, res, next) {

    //Get an array of all rooms in the room collection (e.g. table)
    //TODO: ADD CRITERIA FOR SHOWING LIVE ROOMS
    Room.find(function foundRooms (err, rooms){
      if (err) return next(err);

      //pass the array down to user/explore
      res.view({
        rooms: rooms
      });
    });
  },

  destroy: function(req, res, next) {

    Room.findOne(req.param('id'), function foundRoom (err, room) {
      if (err) return next(err);

      if (!room) return next('Room doesn\'t exist.');

    Room.destroy(req.param('id'), function roomDestroyed (err) {
      if (err) return next(err);

      //Inform other sockets (e.g. connected sockets that are subscribed) that this user is now logged in
      //Note: We can only send a room.id update through Room.publishDestroy which is why we have to use Room.publishUpdate
      // to update the logout msg

     Room.publishUpdate(room.id, {
      name: room.name,
      action: ' room has been destroyed.'
     });

     Room.publishDestroy(room.id);

  });
    res.redirect('/room');
 });
},

  

  subscribe: function (req, res) {

  Room.find(function foundRooms(err, rooms) {
    if (err) return next (err);

    //subscribe this socket to the User model classroom
    Room.subscribe(req.socket);

    // subscribe this socket to the user instance rooms
    Room.subscribe(req.socket, rooms);

    // This will avoid a warning from the socket for trying to access
    // htm over the socket.
    res.send(200);
    });
  },





  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to RoomController)
   */
 // _config: {}

  
};
