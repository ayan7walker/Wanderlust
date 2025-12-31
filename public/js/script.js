// Bootstrap custom validation
// This script applies validation ONLY to forms that explicitly ask for it
(function () {
  'use strict';

  // Select only forms that have data-validate="true"
  const forms = document.querySelectorAll('form[data-validate="true"]');

  Array.from(forms).forEach(function (form) {
      form.addEventListener('submit', function (event) {

          if (!form.checkValidity()) {
              event.preventDefault();       // Prevent submit if invalid
              event.stopPropagation();
          }

          form.classList.add('was-validated');
      }, false);
  });
})();
