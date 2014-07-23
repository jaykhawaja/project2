/**
 * UserController
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
    
    /*user signup page located at views/user/new*/
  
	'new': function (req, res) {
		
		res.view();
		
	},

	create: function (req, res, next) {

  var userObj = {
      name: req.param('name'),
      username: req.param('username'),
      email: req.param('email'),
      password: req.param('password'),
      confirmation: req.param('confirmation')
  }

	//Create a User with the params sent from
	// the sign-up form --> new.ejs
	User.create( userObj, function userCreated(err, user) {


		//if there's an error
		//if (err) return next(err);
		if (err) {
			console.log (err);
			req.session.flash = {
				err: err
			}


		// if error redirect back to sign-up page
		return res.redirect('/user/new')
	}

		//log user in
		req.session.authenticated = true;
		req.session.User = user;

    // Change status to online
    user.online = true;
    user.save(function(err, user){
      if (err) return next(err);

    // add the action attribute to the user object for the flash message.
    user.action = " signed-up and logged-in."

    // Let other subscribed sockets know that the user was created.
    User.publishCreate(user);
    
		// AFter succesfully creating the user
		// redirect to the show action
		//res.json(user);

		 return res.redirect('/user/show/' + user.id);
   });
 });	
},

  // show action: render the profile view (e.g. /views/show.ejs)
  show: function (req, res, next) {
  	User.findOne(req.param('id'), function foundUser (err, user) {
  		if (err) return next(err);
  		if (!user) return next();
  		res.view({
  			user: user
  		});
  	});
  },

  index: function (req, res, next) {


  	//Get an array of all users in the user collection(e.g. table)
  	User.find(function foundUsers (err, users){
  		if (err) return next(err);
  		//pass the array downt o the /views/index.ejs page
  		res.view({
  			users: users
  		});
  	});
  },

  // render the edit view (e.g. /views/edit.ejs)
  edit: function (req, res, next) {

  	// Find the user from the id passed in via params
  	User.findOne(req.param('id'), function foundUser (err, user) {
  		if (err) return next(err);
  		if (!user) return next('User doesn\'t exist.');

  		res.view({
  			user: user
  		});
  	});
  },

  //process the info from edit view
  update: function(req, res, next) {

    if(req.session.User.admin) {
      var userObj = {
        name: req.param('name'),
        username: req.param('username'),
        email: req.param('email'),
        admin: req.param('admin')
      }
    } else {
      var userObj = {
        name: req.param('name'),
        username: req.param('username'),
        email: req.param('email')
      }
    }

  	User.update(req.param('id'), userObj, function userUpdated (err) {
  		if (err) {
  			return res.redirect('/user/edit/' + req.param('id'));
  		}

  		res.redirect('/user/show/' + req.param('id'));
  	});
  },

  destroy: function(req, res, next) {

  	User.findOne(req.param('id'), function foundUser (err, user) {
  		if (err) return next(err);

  		if (!user) return next('User doesn\'t exist.');

  	User.destroy(req.param('id'), function userDestroyed (err) {
  		if (err) return next(err);

     // add the action attribute to the user object for the flash message.
     // user.action = " has been destroyed"

     //Inform other sockets (e.g. connected sockets that are subscribed) that this user is now logged in
     //Note: We can only send a user.id update through User.publishDestroy which is why we have to use User.publishUpdate
     // to update the logout msg

     User.publishUpdate(user.id, {
      name: user.name,
      action: ' has been destroyed.'
     });

      // Let other sockets know that the user instance was destroyed.
      User.publishDestroy(user.id);
  	});


  	res.redirect('/user');
  });
 },

 // for socket.io updates
 subscribe: function(req, res) {

  User.find(function foundUsers(err, users) {
    if (err) return next(err);

    // subscribe this socket to the User model classroom
   User.subscribe (req.socket);

   // subscribe this socket to the user instance rooms
   User.subscribe(req.socket, users);

   // This will avoid a warning from the socket for trying to render
   // html over the socket.
   res.send(200);
 });

}

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
 // _config: {}

  
};

