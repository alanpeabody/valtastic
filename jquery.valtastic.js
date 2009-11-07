// Valtastic 0.1 - jQuery Validation for Formtastic
// 
// Copyright (c) 2009 Alan Peabody
//
// Licensed under the MIT License.
//
// TODO:
//  * Minimized Version
//  * Support for select boxes
//  * Support for checks and radios
//  * Add more default classes.
//  * jUnit Testing
//  * Documentation
//  * Support classes on different elements/selectors.


// Unique Array Helper Method.
if (!Array.unique){
  Array.prototype.unique = function () {
    var r = new Array();
      o:for(var i = 0, n = this.length; i < n; i++) {
	      for(var x = 0, y = r.length; x < y; x++) {
		      if(r[x]==this[i]) {
            continue o;
			    }
		    }
		    r[r.length] = this[i];
	    }
	  return r;
  };
}

(function($){
  // Valtastic Namespace
  var Valtastic = {

    // Form Class, handles form wide stuff.
    Form : function(element,options){
      var $element = $(element);

      // Instantiate all inputs as Valtastic.Input objects.
      var inputs = [];
      $element.find('input, select, textarea').not(':submit,:hidden').each(function(){
        inputs.push(new Valtastic.Input(this,options));
      });
      
      // Begin validation on the form.
      this.validate = function(){
        $.each(inputs,function(){
          this.initValidation();
        });   
      };

      // Returns true if the form is valid. At least one field must be marked as valid.
      var form_valid = function(){
        if ($element.find('li.valid').length > 0 && $element.find('li.error').length == 0){
          return true;
        }
        return false;
      }

      // Listen for form submissions.
      $element.submit(function(){
        if(form_valid()) {
          return true;
        } else {
          //focus on invalid...
          $element.find('.error input').get(0).focus();
          return false;
        }
      });

    },// End Form

    // Input Class, each instance validates one field.
    Input : function(input_element,options){
      var $input_element = $(input_element);
      var classes = $input_element.closest('li').attr('class').split(' ').unique();
      var errors = []; //Array of errors.
      
      // Begin validation by starting event listners.
      this.initValidation = function(){
        // Validate on blur everytime.
        $input_element.blur(function(){
          validate();
        });
        // Validate on keypress after an error has already occured.
        $('li.error #'+$input_element.attr('id')).live('keypress', function(){
          validate();
        });
      };

      // Run validation checks on current input value.
      var validate = function(){
        errors = []; //Starting validation again, so reset errors.
        value = $input_element.val();
        $.each(classes,function(){
          if (requirements = options[this]){
            if (requirements.required && value.length < 1) {
              errors.push(requirements.message || "this field is required");
            }
            if (requirements.min_length && value.length <= requirements.min_length && value.length > 0){
              errors.push(requirements.message || "this field must be " + requirements.min_length + " characters");
            }
            if (requirements.max_length && value.length >= requirements.max_length){
              errors.push(requirements.message || "this field must be no more then " + requirements.max_length + " characters");
            }
            if (requirements.regex && !requirements.regex.test(value)) {
              errors.push(requirements.message || "this field must be a valid " + this + " format");
            }
            if (requirements.must_match && $(requirements.must_match).val() != value){
              console.log(requirements.must_match);
              errors.push(requirements.message);
            }
          }
        });
        if (errors.length > 0) {
          displayErrors();
        } else {
          markValid();
        }
      };

      // Reset and display error list. Set wrapper li class to .error
      var displayErrors = function(){
         $input_element.siblings('ul.errors').remove();
         $input_element.closest('li').removeClass('valid').addClass('error').append('<ul class="errors"><li>'+errors.join('</li><li>')+'</li></ul>');
      };

      // Remove error list, set wrapper class to .valid
      var markValid = function(){
        $input_element.siblings('ul.errors').remove();
        $input_element.closest('li').removeClass('error').addClass('valid');
      };

    } // End Input


  }; // End Valtastic
  

  $.fn.valtastic = function(options) {
    var defaults = {
      //Default Options
      required: {
        required: true
      },
      email: {
        min_length: 6,
        regex: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
      },
      password: {
        min_length: 6,
      },
      password_confirmation: {
        must_match: '#password',
        message: 'must match password',
      }
    };
    //Override defaults with options from valtastic call.
    var options = $.extend(defaults,options);
    return this.each(function(){
      var element = $(this);

      // Only one instance per element
      if(element.data('valtastic')) return;

      // Pass options to constructor
      var form = new Valtastic.Form(this,options);

      // Start validating the form.
      form.validate();

      // Store data in elements data
      element.data('valtastic', form);
    });
  };
})(jQuery);
