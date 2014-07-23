/**
 * SessionController
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
var bcrypt = require('bcrypt');

module.exports = {
    
  'new': function (req, res) {

  	res.view('session/new');
  },

  create: function (req, res, next) {

  	//Check for email and passowrd in params sent via the form, if none
  	// redirect the browser back to the sign-in form

  	if(!req.param('email') || !req.param('password')) {
  		//return next ({err: ["Password doesn't match password ocnfirmation. "]});
  		var usernamePasswordRequiredError = [{name: 'usernamePasswordRequired', message: 'You must enter both a username and password.'}]

  		// Remember that err is the object being passed down (a.k.a flash.err), whose value is another object with
  		// the key of usernamePasswordRequiredError
  		req.session.flash = {
  			err: usernamePasswordRequiredError
  		}

  		res.redirect('/session/new');
  		return;
	}

	User.findOneByEmail(req.param('email')).done(function(err, user) {
		if (err) return next(err);

		//If no user is found..
		if (!user) {
			var noAccountError = [{name: 'noAccount', message: 'The email address ' + req.param('email') + ' not found. '}]
			req.session.flash ={
				err: noAccountError
			}
			res.redirect('/session/new');
			return;
		}

		bcrypt.compare(req.param('password'), user.encryptedPassword, function(err, valid) {
			if (err) return next(err);
			// If the password from the form doesn't match the password from the database...
			if (!valid) {
				var usernamePasswordMismatchError = [{name: 'usernamePasswordMismatch', message: 'Invalid username and password combination'}]
				req.session.flash = {
					err : usernamePasswordMismatchError
				}
				res.redirect('/session/new');
				return;
			}

			// Log user in
			req.session.authenticated = true;
			req.session.User = user;

			//Change status to online
			user.online = true;
			user.save(function(err, user) {
				if (err) return next(err);	

			// Inform other sockets (e.g. connected sockets that are subscribed) that this user is now logged in
			User.publishUpdate(user.id, {
				loggedIn: true,
				id: user.id,
				name: user.name,
				action: ' has logged in.'
			});		


			// If the user is also an admin redirect to the user list (e.g. /vies/user/index.ejs)
			// This is used in conjunction with config/policies.js file
			if (req.session.User.admin) {
				res.redirect('/user');
				return;
			}

			//Redirect to the profile page (e.g. /views/user/show.ejs)
			res.redirect('/user/show/' + user.id);

			
			
		  });	
		});
	});

  },

  destroy: function (req, res, next) {

  	User.findOne(req.session.User.id, function foundUser (err, user) {

  		var userId = req.session.User.id;

  		
  		if (user) {
  		// The user is "logging out " (e.g. destroying the session) so change the online attribute to false.
  		User.update(userId, {
  			online: false
  		}, function (err) {
  			if (err) return next(err);

  			// Inform other sockets (e.g. connected sockets that are subscribed) that this user is now logged in
			User.publishUpdate(userId, {
				loggedIn: false,
				id: userId,
				name: user.name,
				action: ' has logged out.'
				});
				// Wipe out session (log out)
				req.session.destroy();

				// Redirect the browser to the sign-in screen
				res.redirect('/session/new');
			});		
		 } else {

  			// Wipe out the session (log out)
  			req.session.destroy();

  			//Redirect the browser to the sign-in screen
  			res.redirect('/session/new');
  		 }
  		});
  	}


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to SessionController)
   */
 // _config: {}

  
};
