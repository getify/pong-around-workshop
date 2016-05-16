"use strict";

var Game = (function Game(){

	// elements from the HTML
	var cnv = document.getElementById("game");
	var ctx = cnv.getContext("2d");

	// TODO(4): add a variable to track the score

	var ballSize;
	var ballX;
	var ballY;
	var ballMovementX;
	var ballMovementY;

	var centerX;
	var centerY;

	var horizontalPaddleSize;
	var horizontalPaddlePosition;
	var minHoriztonalPaddlePosition;
	var maxHorizontalPaddlePosition;

	var verticalPaddleSize;
	var verticalPaddlePosition;
	var minVerticalPaddlePosition;
	var maxVerticalPaddlePosition;

	var outerPadding = 25;
	var paddleThickness = 15;


	var publicAPI = {
		start: start
	};

	return publicAPI;


	// ****************************

	function start() {
		window.addEventListener( "resize", debounce( onViewportResize, 100 ) );
		document.addEventListener( "mousemove", movePaddles );

		onViewportResize();
		setupGame();
		fixPaddlePositions();
		runGame();
	}

	function setupGame() {
		// setup initial paddle positions (in the middle)
		horizontalPaddlePosition = (cnv.width - horizontalPaddleSize) / 2;
		verticalPaddlePosition = (cnv.height - verticalPaddleSize) / 2;

		// setup initial ball position/speed
		ballX = centerX - (ballSize / 2);
		ballY = centerY - (ballSize / 2);
		ballMovementX = ballSize / 20;
		ballMovementY = ballSize / 25;
	}

	// called any time the browser window is resized
	function onViewportResize() {
		// keep canvas sized to full viewport
		if (cnv.width != window.innerWidth || cnv.height != window.innerHeight) {
			cnv.width = window.innerWidth;
			cnv.height = window.innerHeight;
		}

		// recalculate dimensions to viewport size
		centerX = cnv.width / 2;
		centerY = cnv.height / 2;

		horizontalPaddleSize = Math.max( 50, Math.floor( cnv.width / 5 ) );
		verticalPaddleSize = Math.max( 50, Math.floor( cnv.height / 4 ) );

		minHoriztonalPaddlePosition = outerPadding + paddleThickness;
		maxHorizontalPaddlePosition = cnv.width - horizontalPaddleSize - outerPadding - paddleThickness;
		minVerticalPaddlePosition = outerPadding + paddleThickness;
		maxVerticalPaddlePosition = cnv.height - verticalPaddleSize - outerPadding - paddleThickness;

		ballSize = Math.ceil( Math.max( horizontalPaddleSize, verticalPaddleSize ) / 6 );

		fixPaddlePositions();
	}

	function runGame() {
		var gameOver = false;

		if (!gameOver) {
			moveBall();

			var check = checkBallPosition();
			// hit or miss?
			if ( check !== true) {
				// ball missed a paddle?
				if (check === false) {
					gameOver = true;
				}
				// ball hit one or more paddles
				else {
					bounceBall( check );
				}
			}
		}

		drawBoard( gameOver );

		// keep the game loop going?
		if (!gameOver) {
			requestAnimationFrame( runGame );
		}
		else {
			document.addEventListener( "click", restartGame );
		}
	}

	function restartGame() {
		document.removeEventListener( "click", restartGame );

		setupGame();
		fixPaddlePositions();
		runGame();
	}

	function drawBoard(gameOver) {
		// clear the canvas
		ctx.fillStyle = "#fff";
		ctx.fillRect( 0, 0, cnv.width, cnv.height );

		drawBall( gameOver );
		drawPaddles();

		// TODO(4): show the score

		// TODO(4): if game is over, show message:
		// "Click anywhere to replay..."

	}

	function drawLine(startX,startY,endX,endY) {
		ctx.beginPath();
		ctx.moveTo( startX, startY );
		ctx.lineTo( endX, endY );
		ctx.stroke();
	}

	function drawBall(gameOver) {
		ctx.save();

		if (gameOver) {
			ctx.fillStyle = "#f00";
		}
		else {
			ctx.fillStyle = "#000";
		}

		ctx.beginPath();
		ctx.arc( ballX, ballY, ballSize / 2, 0, 2 * Math.PI );
		ctx.fill();
		ctx.restore();
	}

	function drawPaddles() {
		ctx.save();
		ctx.lineWidth = paddleThickness;
		ctx.lineCap = "round";

		// left paddle
		drawLine( outerPadding, verticalPaddlePosition, outerPadding, verticalPaddlePosition + verticalPaddleSize );
		// right paddle
		drawLine( cnv.width - outerPadding, verticalPaddlePosition, cnv.width - outerPadding, verticalPaddlePosition + verticalPaddleSize );
		// top paddle
		drawLine( horizontalPaddlePosition, outerPadding, horizontalPaddlePosition + horizontalPaddleSize, outerPadding );
		// bottom paddle
		drawLine( horizontalPaddlePosition, cnv.height - outerPadding, horizontalPaddlePosition + horizontalPaddleSize, cnv.height - outerPadding );

		ctx.restore();
	}

	function moveBall() {
		ballX = ballX + ballMovementX;
		ballY = ballY + ballMovementY;
	}

	function checkBallPosition() {
		var paddlesHit = [];
		var halfPaddleThickness = paddleThickness / 2;
		var oneFourthPaddleThickness = halfPaddleThickness / 2;
		var halfBallSize = ballSize / 2;
		var oneFourthBallSize = halfBallSize / 2;
		var missedPaddle = false;

		// at left side?
		if ((ballX - halfBallSize) <= (outerPadding + halfPaddleThickness)) {
			// hit left paddle?
			if (
				(ballY + oneFourthBallSize) >= (verticalPaddlePosition - oneFourthPaddleThickness) &&
				(ballY - oneFourthBallSize) <= (verticalPaddlePosition + verticalPaddleSize + oneFourthPaddleThickness)
			) {
				paddlesHit.push( 1 );
			}
			// went past the paddle?
			else if (ballX <= outerPadding) {
				missedPaddle = true;
			}
		}
		// at right side?
		if ((ballX + halfBallSize) >= (cnv.width - outerPadding - halfPaddleThickness)) {
			// hit right paddle?
			if (
				(ballY + oneFourthBallSize) >= (verticalPaddlePosition - oneFourthPaddleThickness) &&
				(ballY - oneFourthBallSize) <= (verticalPaddlePosition + verticalPaddleSize + oneFourthPaddleThickness)
			) {
				paddlesHit.push( 2 );
			}
			// went past the paddle?
			else if (ballX >= (cnv.width - outerPadding)) {
				missedPaddle = true;
			}
		}
		// at top side?
		if ((ballY - halfBallSize) <= (outerPadding + halfPaddleThickness)) {
			// hit top paddle?
			if (
				(ballX + oneFourthBallSize) >= (horizontalPaddlePosition - oneFourthPaddleThickness) &&
				(ballX - oneFourthBallSize) <= (horizontalPaddlePosition + horizontalPaddleSize + oneFourthPaddleThickness)
			) {
				paddlesHit.push( 3 );
			}
			// went past the paddle?
			else if (ballY <= outerPadding) {
				missedPaddle = true;
			}
		}
		// at bottom side?
		if ((ballY + halfBallSize) >= (cnv.height - outerPadding - halfPaddleThickness)) {
			// hit bottom paddle?
			if (
				(ballX + oneFourthBallSize) >= (horizontalPaddlePosition - oneFourthPaddleThickness) &&
				(ballX - oneFourthBallSize) <= (horizontalPaddlePosition + horizontalPaddleSize + oneFourthPaddleThickness)
			) {
				paddlesHit.push( 4 );
			}
			// went past the paddle?
			else if (ballY >= (cnv.height - outerPadding)) {
				missedPaddle = true;
			}
		}

		// no paddles hit?
		if (paddlesHit.length == 0) {
			// ball went past the paddle(s)?
			if (missedPaddle) {
				return false;
			}
			// ball still in play
			else {
				return true;
			}
		}
		// one or more paddles hit
		else {
			return paddlesHit;
		}
	}

	function bounceBall(paddlesHit) {
		var hit = paddlesHit.shift();

		// hit left or right paddle?
		if (
			(hit == 1 && ballMovementX < 0) ||
			(hit == 2 && ballMovementX > 0)
		) {
			// flip X direction
			ballMovementX = ballMovementX * -1;
			hit = true;
		}
		// hit top or bottom paddle?
		else if (
			(hit == 3 && ballMovementY < 0) ||
			(hit == 4 && ballMovementY > 0)
		) {
			// flip Y direction
			ballMovementY = ballMovementY * -1;
			hit = true;
		}

		if (paddlesHit.length > 0) {
			bounceBall( paddlesHit );
		}
		else if (hit === true) {

			// TODO(4): increment the score

			// speed up the ball a little bit, but not by too much
			if (ballMovementX < 0) {
				ballMovementX = Math.max( -15, ballMovementX * 1.05 );
			}
			else {
				ballMovementX = Math.min( 15, ballMovementX * 1.05 );
			}
			if (ballMovementY < 0) {
				ballMovementY = Math.max( -10, ballMovementY * 1.05 );
			}
			else {
				ballMovementY = Math.min( 10, ballMovementY * 1.05 );
			}
		}
	}

	function movePaddles(evt) {
		var mouseX = evt.pageX;
		var mouseY = evt.pageY;

		horizontalPaddlePosition = centerX + (1.8 * (mouseX - centerX)) - (horizontalPaddleSize / 2);
		verticalPaddlePosition = centerY + (1.8 * (mouseY - centerY)) - (verticalPaddleSize / 2);

		fixPaddlePositions();
	}

	function fixPaddlePositions() {
		horizontalPaddlePosition = Math.max( minHoriztonalPaddlePosition, Math.min( maxHorizontalPaddlePosition, horizontalPaddlePosition || 0 ) );
		verticalPaddlePosition = Math.max( minVerticalPaddlePosition, Math.min( maxVerticalPaddlePosition, verticalPaddlePosition || 0 ) );
	}

	// Adapted from: https://davidwalsh.name/javascript-debounce-function
	function debounce(func,wait,immediate) {
		var timeout;
		return fnDebounced;

		// ******************************

		function fnDebounced() {
			var context = this,
				args = arguments,
				callNow = immediate && !timeout
			;
			clearTimeout(timeout);
			timeout = setTimeout(later,wait);
			if (callNow) {
				func.apply(context,args);
			}

			// ******************************

			function later() {
				timeout = null;
				if (!immediate) {
					func.apply(context,args);
				}
			}
		}
	}

})();
