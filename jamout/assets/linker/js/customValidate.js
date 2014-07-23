$(document).ready(function(){
	
	//Validate
	// http://bassistance.de/jquery-plugins/jquery-plugin-validation/
	// http://docs.jquery.com/plugins/validation/
	// http:// docs.jquery.com/plugins/validation/validate#toptions

	$('#sign-up-form').validate({

	  rules: {
	    name: {
	    	required: true
	    },
	    username: {
	    	required: true
	    },
	    email: {
	    	required: true,
	    	email: true
	    },
	    password: {
	    	minlength: 6,
	    	required: true
	    },
	    confirmation: {
	    	minlength: 6,
	    	equalTo: "#password"
	    }
	  },
	  success: function(element) {
	  	element
	  	.text('OK!').addClass('valid')
	  }
	});
});