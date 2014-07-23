/**
 * Room
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	schema: true,

  attributes: {

  	name: {
  		type: 'string',
  		required: true
  	},

    creator: {
      type: 'string',
      required: true
    }

  	// TODO: ALLOWED USERS
    // TODO: ONLINE USER
  	//add participants
  	/* e.g.
  	nickname: 'string'
  	*/
    
  }

};
