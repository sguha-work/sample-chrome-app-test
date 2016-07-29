chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('intro.html', {
    'outerBounds': {
      'width': 400,
      'height': 500
    }
  });
});