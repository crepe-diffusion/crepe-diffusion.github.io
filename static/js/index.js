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

// Iteration panel functions
function updateIterationImages(sliderValue) {
  // Convert slider value (0-149) to iteration number (0, 1000, 2000, ..., 149000)
  var iteration = sliderValue * 1000;
  var iterationStr = String(iteration).padStart(6, '0');
  
  // Calculate snapshot number (iteration / 1000 * 5)
  // From the files: iteration_000000_snapshot_0000, iteration_001000_snapshot_0005, etc.
  var snapshotNum = Math.floor(iteration / 1000) * 5;
  var snapshotStr = String(snapshotNum).padStart(4, '0');
  
  // Update iteration display
  var iterationValueEl = document.getElementById('iteration-value');
  if (iterationValueEl) {
    iterationValueEl.textContent = iteration.toLocaleString();
  }
  
  // Update all 5 task images
  for (var task = 0; task < 5; task++) {
    var imagePath = './static/images/visualizations_task_' + task + '/iteration_' + iterationStr + '_snapshot_' + snapshotStr + '.png';
    var imgElement = document.getElementById('task-' + task + '-img');
    if (imgElement) {
      console.log('Updating task ' + task + ' to:', imagePath);
      // Update image source
      imgElement.src = imagePath;
      // Also handle errors
      imgElement.onerror = function() {
        console.error('Failed to load image:', this.src);
      };
      // Prevent drag and right-click
      imgElement.ondragstart = function() { return false; };
      imgElement.oncontextmenu = function() { return false; };
    } else {
      console.warn('Image element not found for task ' + task);
    }
  }
}


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

    bulmaSlider.attach();

    // Initialize iteration slider
    var iterationSlider = document.getElementById('iteration-slider');
    if (iterationSlider) {
      // Use native event listeners - attach multiple events to ensure it works
      function handleSliderChange() {
        var value = parseInt(iterationSlider.value);
        console.log('Slider value:', value);
        updateIterationImages(value);
      }
      
      iterationSlider.addEventListener('input', handleSliderChange);
      iterationSlider.addEventListener('change', handleSliderChange);
      
      // Also handle mouse events for better responsiveness
      var isDragging = false;
      iterationSlider.addEventListener('mousedown', function() {
        isDragging = true;
      });
      iterationSlider.addEventListener('mouseup', function() {
        isDragging = false;
      });
      iterationSlider.addEventListener('mousemove', function() {
        if (isDragging) {
          handleSliderChange();
        }
      });
      
      // Set initial images
      updateIterationImages(0);
    } else {
      console.error('Iteration slider not found!');
    }

})
