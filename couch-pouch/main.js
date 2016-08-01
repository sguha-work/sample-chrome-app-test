/**
 * Listens for the app launching then creates the window
 *
 *
 */
chrome.app.runtime.onLaunched.addListener(function(intentData) {
  chrome.app.window.create('index.html', {
  	id: "mainwin",
    innerBounds: {
      width: 400,
      height: 400
    }
  });
});
