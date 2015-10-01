// Wait till the browser is ready to render the game (avoids glitches)
var game2048;
	game2048 = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
window.myGame = game2048;