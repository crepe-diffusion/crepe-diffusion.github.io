window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}

// Iteration panel functions - make it globally accessible
window.updateIterationImages = function(sliderValue) {
  console.log('updateIterationImages called with value:', sliderValue);
  
  // Convert slider value (0-149) to iteration number (0, 1000, 2000, ..., 149000)
  var iteration = sliderValue * 1000;
  var iterationStr = String(iteration).padStart(6, '0');
  
  // Calculate snapshot number (iteration / 1000 * 5)
  // From the files: iteration_000000_snapshot_0000, iteration_001000_snapshot_0005, etc.
  var snapshotNum = Math.floor(iteration / 1000) * 5;
  var snapshotStr = String(snapshotNum).padStart(4, '0');
  
  console.log('Iteration:', iteration, 'Snapshot:', snapshotNum);
  
  // Update iteration display
  var iterationValueEl = document.getElementById('iteration-value');
  if (iterationValueEl) {
    iterationValueEl.textContent = iteration.toLocaleString();
    console.log('Updated iteration display to:', iteration.toLocaleString());
  } else {
    console.error('iteration-value element not found!');
  }
  
  // Update all 5 task images
  for (var task = 0; task < 5; task++) {
    var imagePath = './static/images/visualizations_task_' + task + '/iteration_' + iterationStr + '_snapshot_' + snapshotStr + '.png';
    var imgElement = document.getElementById('task-' + task + '-img');
    if (imgElement) {
      var oldSrc = imgElement.src;
      console.log('Task ' + task + ' - Old src:', oldSrc);
      console.log('Task ' + task + ' - New path:', imagePath);
      
      // Always update the src to force reload (remove old src first to break cache)
      var newSrc = imagePath + '?v=' + Date.now();
      if (imgElement.src !== newSrc) {
        // Break the reference by setting to empty first
        imgElement.removeAttribute('src');
        // Then set the new src
        imgElement.setAttribute('src', newSrc);
        console.log('Task ' + task + ' - Set src to:', imgElement.src);
      } else {
        // If same src, force reload by toggling
        imgElement.style.display = 'none';
        imgElement.offsetHeight; // Force reflow
        imgElement.style.display = '';
        imgElement.src = newSrc;
      }
      
      // Handle errors
      imgElement.onerror = function(taskNum) {
        return function() {
          console.error('Failed to load image for task ' + taskNum + ':', this.src);
        };
      }(task);
      
      imgElement.onload = function(taskNum) {
        return function() {
          console.log('Successfully loaded image for task ' + taskNum);
        };
      }(task);
      
      // Prevent drag and right-click
      imgElement.ondragstart = function() { return false; };
      imgElement.oncontextmenu = function() { return false; };
    } else {
      console.error('Image element not found for task ' + task);
    }
  }
};


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    // Initialize iteration slider BEFORE bulmaSlider.attach() to avoid conflicts
    // Use jQuery with event delegation that works even after bulmaSlider modifies the DOM
    $(document).on('input change', '#iteration-slider', function(event) {
      var value = parseInt($(this).val());
      console.log('Iteration slider changed (jQuery):', value);
      if (window.updateIterationImages) {
        window.updateIterationImages(value);
      }
    });
    
    // Also handle mouse events for real-time updates while dragging
    $(document).on('mousemove', '#iteration-slider', function(event) {
      if (event.buttons === 1) { // Left mouse button is pressed
        var value = parseInt($(this).val());
        if (window.updateIterationImages) {
          window.updateIterationImages(value);
        }
      }
    });
    
    // Set initial images
    if (window.updateIterationImages) {
      window.updateIterationImages(0);
    }

    bulmaSlider.attach();

})
