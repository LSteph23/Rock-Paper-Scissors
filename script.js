
  // Your web app's Firebase configuration
  var config = {
    apiKey: "AIzaSyDKpS-BdKIJqfg97y8HRyWwaTPyJLJoBe8",
    authDomain: "rock-1fd47.firebaseapp.com",
    databaseURL: "https://rock-1fd47.firebaseio.com",
    projectId: "rock-1fd47",
    storageBucket: "",
    messagingSenderId: "874703156880",
    appId: "1:874703156880:web:053794cfc0481176"
  };
  // Initialize Firebase


firebase.initializeApp(config);

//Firebase reference vars
var ref = firebase.database().ref();
var playersRef = firebase.database().ref("players");
var p1Ref = firebase.database().ref("players/1");
var p2Ref = firebase.database().ref("players/2");
var chat = firebase.database().ref("chat");
var connectedRef = firebase.database().ref(".info/connected");
var connectionsRef = firebase.database().ref("connections");

//Local vars
var playerName;
var playerNum;
var playerKey; // unique to session client
var turn = 1;
var timeDelay = 4000;

//Functions
var displayChoices = function(pNum) {
	if(playerNum === pNum) {
		// console.log("display " + pNum);
		var r = $("<div>").text("Rock").attr("data-choice", "Rock").addClass("p" + pNum + "-choice");
		var p = $("<div>").text("Paper").attr("data-choice", "Paper").addClass("p" + pNum + "-choice");
		var s = $("<div>").text("Scissors").attr("data-choice", "Scissors").addClass("p" + pNum + "-choice");
		var rps = $("<div>").append(r, p, s);
		$("#p" + pNum + "-choices").append(rps);	
	}
}

var displayGameMessage = function(type) {
	if(playerNum === 1) {
		if(type === "yourTurn") {
			$("#game-message").text("It's Your Turn!");
			$("#game-message").show();
		} else if(type === "waitingFor") {
			p2Ref.once("value", function(snap) {
				if(snap.exists() === true) {
					$("#game-message").text("Waiting for " + snap.val().name + " to choose...");
				}
			});
			$("#game-message").show();
		}
	} else if(playerNum === 2) {
		if(type === "yourTurn") {
			$("#game-message").text("It's Your Turn!");
			$("#game-message").show();
		} else if(type === "waitingFor") {
			p1Ref.once("value", function(snap) {
				if(snap.exists() === true) {
					$("#game-message").text("Waiting for " + snap.val().name + " to choose...");
				}
			});
			$("#game-message").show();
		}
	}
}

//Player enter event listener
$("#name-submit-button").click(function(e) {
	e.preventDefault();
	playerName = $("#player-name").val().trim();
	$("#player-name").val("");

	playersRef.once("value", function(snap) {
		if(snap.exists() === false) {
			playerNum = 1;
			p1Ref.update({
				name: playerName,
				wins: 0,
				losses: 0,
				key: userKey
			});
			connectionsRef.child(userKey).set(playerName);
		} else if(snap.child(2).exists() === true && snap.child(1).exists() === false) {
			playerNum = 1;
			p1Ref.update({
				name: playerName,
				wins: 0,
				losses: 0,
				key: userKey
			});

			displayChoices(1);
			connectionsRef.child(userKey).set(playerName);
		} else {
			playerNum = 2;
			p2Ref.update({
				name: playerName,
				wins: 0,
				losses: 0,
				key: userKey
			});
			ref.update({
				turn: 1
			});
			connectionsRef.child(userKey).set(playerName);
		}
	}).then(function() {
		$("#p-name").text(playerName);
		$("#p-num").text(playerNum);
		$("#you-are-message").show();
		$("#enter-game-panel").hide();

		var message = " [ HAS ENTERED THE GAME! ]";
		var time = new Date().toLocaleString("en-US", {hour: "numeric", minute: "numeric", second: "numeric"});

		chat.push({
			name: playerName,
			message: message,
			time: time
		});
	});
});

//Firebase event listener for name values
p1Ref.child("name").on("value", function(snap) {
	if(snap.exists() === true) {
		$("#p1-name").text(snap.val());
		$("#p1-name").addClass("p1-name-entered");
		$("#p1-name").removeClass("p-not-entered");
	}
});

p2Ref.child("name").on("value", function(snap) {
	if(snap.exists() === true) {
		$("#p2-name").text(snap.val());
		$("#p2-name").addClass("p2-name-entered");
		$("#p2-name").removeClass("p-not-entered");
	}
});

// Firebase listener for win/loss values
p1Ref.child("wins").on("value", function(snap) {
	if(snap.exists() === true) {
		$("#p1-wins").text(snap.val());
	}
});

p1Ref.child("losses").on("value", function(snap) {
	if(snap.exists() === true) {
		$("#p1-losses").text(snap.val());
	}
});

p2Ref.child("wins").on("value", function(snap) {
	if(snap.exists() === true) {
		$("#p2-wins").text(snap.val());
	}
});

p2Ref.child("losses").on("value", function(snap) {
	if(snap.exists() === true) {
		$("#p2-losses").text(snap.val());
	}
});

// hide new player input for 3rd parties
playersRef.on("value", function(snap) {
	if(snap.child(1).exists() === true && snap.child(2).exists() === true) {
		$("#enter-game-panel").hide();
	}
});

//Firebase listener to render choices for p1 as turn value is created/changed
ref.child("turn").on("value", function(snap) {
	//right after p2 enters game and turn = 1
	if(snap.val() === 1) {
		//display p1 choices
		displayChoices(1);	
	}
});

// Event listener for rendering choices for p2
playersRef.on("value", function(snap) {
	if(snap.child(1).child("choice").exists() === true && snap.child(2).child("choice").exists() === false) {
		
		//display p2 choices
		displayChoices(2);
	}
});

// Event listener for game message
playersRef.on("value", function(snap) {
	//display game message when both players exist and choices alternate
	if(playerNum === 1) {
		if(snap.child(2).exists() === true && snap.child(1).child("choice").exists() === false) {
			displayGameMessage("yourTurn");
		} else {
			displayGameMessage("waitingFor");
		}
	} else if(playerNum === 2) {
		if(snap.child(2).child("choice").exists() === false && snap.child(1).child("choice").exists() === false) {
			displayGameMessage("waitingFor");
		} else {
			displayGameMessage("yourTurn");
		}
	}
});

//Event listener for p1 clicking choice
$(document).on("click", ".p1-choice", function() {
	var p1Choice = $(this).attr("data-choice");
	p1Ref.update({
		choice: p1Choice
	});

	$("#p1-choices").text(p1Choice);
});

//Event listener for p2 clicking choice
$(document).on("click", ".p2-choice", function() {
	var p2Choice = $(this).attr("data-choice");
	p2Ref.update({
		choice: p2Choice
	});

	$("#p2-choices").text(p2Choice);
});

//Firebase listener after both players have made choices
playersRef.on("value", function(snap) {
	//only proceed to outcome if both players exist and both have choices
	if(snap.child(1).exists() === true && snap.child(2).exists() === true && snap.child(1).child("choice").exists() === true && snap.child(2).child("choice").exists() === true) {

		var p1Choice = snap.val()[1].choice;
		var p2Choice = snap.val()[2].choice;
		p1Ref.child("choice").remove();
		p2Ref.child("choice").remove();
		var p1Name = snap.val()[1].name;
		var p2Name = snap.val()[2].name;
		var p1Wins = snap.val()[1].wins;
		var p2Wins = snap.val()[2].wins;
		var p1Losses = snap.val()[1].losses;
		var p2Losses = snap.val()[2].losses;
		// console.log(p1Choice, p2Choice);

		//reveal both players choices
		$("#p1-choices").text(p1Choice);
		$("#p2-choices").text(p2Choice);

		if(p1Choice === "Rock" && p2Choice === "Rock") {
			$("#outcome").text("Tie Game!");
			turn++;
			ref.update({
				turn: turn
			});
		} else if(p1Choice === "Rock" && p2Choice === "Paper") {
			p1Losses++;
			p1Ref.update({
				losses: p1Losses
			});
			p2Wins++;
			p2Ref.update({
				wins: p2Wins
			});
			p2Ref.once("value", function(snap) {
				$("#outcome").text(snap.val().name + " Wins!");
			});
			turn++;
			ref.update({
				turn: turn
			});
		} else if(p1Choice === "Rock" && p2Choice === "Scissors") {
			p1Wins++;
			p1Ref.update({
				wins: p1Wins
			});
			p2Losses++;
			p2Ref.update({
				losses: p2Losses
			});
			p1Ref.once("value", function(snap) {
				$("#outcome").text(snap.val().name + " Wins!");
			});
			turn++;
			ref.update({
				turn: turn
			});
		} else if(p1Choice === "Paper" && p2Choice === "Rock") {
			p1Wins++;
			p1Ref.update({
				wins: p1Wins
			});
			p2Losses++;
			p2Ref.update({
				losses: p2Losses
			});
			p1Ref.once("value", function(snap) {
				$("#outcome").text(snap.val().name + " Wins!");
			});
			turn++;
			ref.update({
				turn: turn
			});
		} else if(p1Choice === "Paper" && p2Choice === "Paper") {
			$("#outcome").text("Tie Game!");
			turn++;
			ref.update({
				turn: turn
			});
		} else if(p1Choice === "Paper" && p2Choice === "Scissors") {
			p1Losses++;
			p1Ref.update({
				losses: p1Losses
			});
			p2Wins++;
			p2Ref.update({
				wins: p2Wins
			});
			p2Ref.once("value", function(snap) {
				$("#outcome").text(snap.val().name + " Wins!");
			});
			turn++;
			ref.update({
				turn: turn
			});
		} else if(p1Choice === "Scissors" && p2Choice === "Rock") {
			p1Losses++;
			p1Ref.update({
				losses: p1Losses
			});
			p2Wins++;
			p2Ref.update({
				wins: p2Wins
			});
			p2Ref.once("value", function(snap) {
				$("#outcome").text(snap.val().name + " Wins!");
			});
			turn++;
			ref.update({
				turn: turn
			});
		} else if(p1Choice === "Scissors" && p2Choice === "Paper") {
			p1Wins++;
			p1Ref.update({
				wins: p1Wins
			});
			p2Losses++;
			p2Ref.update({
				losses: p2Losses
			});
			p1Ref.once("value", function(snap) {
				$("#outcome").text(snap.val().name + " Wins!");
			});
			turn++;
			ref.update({
				turn: turn
			});
		} else if(p1Choice === "Scissors" && p2Choice === "Scissors") {
			$("#outcome").text("Tie Game!");
			turn++;
			ref.update({
				turn: turn
			});
		}

		//update win & loss count
		$("#p1-wins").text(p1Wins);
		$("#p2-wins").text(p2Wins);
		$("#p1-losses").text(p1Losses);
		$("#p2-losses").text(p2Losses);

		setTimeout(function() {
			$("#outcome").empty();
			$("#p1-choices").empty();
			$("#p2-choices").empty();
			displayChoices(1);
		}, timeDelay);
	}
});

//Firebase listener for messages
chat.on("child_added", function(snap) {
	var name = snap.val().name;
	var time = snap.val().time;
	var message = snap.val().message;

	var li = $("<li class='message'>").text(": " + message + " ");
	li.prepend($("<span class='name'>").text(name));
	li.append($("<span class='timestamp'>").text(time));
	$("#message-view").append(li);

	$("#message-view").animate({ scrollTop: $("#message-view")[0].scrollHeight}, 500);
});

//Send button for chat click even listener
$("#send-button").on("click", function(e) {
	e.preventDefault();

	if(playerName !== undefined) {
		var message = $("#chat-message").val();
		var time = new Date().toLocaleString("en-US", {hour: "numeric", minute: "numeric", second: "numeric"});

		chat.push({
			name: playerName,
			message: message,
			time: time
		});

		$("#message-view").animate({ scrollTop: $("#message-view")[0].scrollHeight}, 500);
	}

	$("#chat-message").val("");
});

// Firebase connection listener
connectedRef.on("value", function(snap) {
	if(snap.val()) {
		var user = connectionsRef.push(true);
		userKey = user.getKey();
		user.onDisconnect().remove();
	}
});

connectionsRef.on("child_removed", function(snap) {
	var leftKey = snap.getKey();
	var p1Key;
	p1Ref.once("value", function(snap) {
		if(snap.exists() === true) {
			p1Key = snap.val().key;
		}
	});

	if(leftKey === p1Key) {
		p1Ref.remove();
		p2Ref.child("choice").remove();
		ref.child("turn").remove();
		$("#p1-name").empty();
		$("#p1-name").text("Waiting for Player 1");
		$("#p1-name").removeClass("p1-name-entered");
		$("#p1-name").addClass("p-not-entered");
		$("#p1-choices").empty();
		$("#p2-choices").empty();
		$("#game-message").empty();

		var message = " [ HAS LEFT THE GAME! ]";
		console.log("p1 has left");
		var time = new Date().toLocaleString("en-US", {hour: "numeric", minute: "numeric", second: "numeric"});

		chat.push({
			name: snap.val(),
			message: message,
			time: time
		});
	}
});

connectionsRef.on("child_removed", function(snap) {
	var leftKey = snap.getKey();
	var p2Key;

	p2Ref.once("value", function(snap) {
		if(snap.exists() === true) {
			p2Key = snap.val().key;
		}
	});

	if(leftKey === p2Key) {
		p2Ref.remove();
		p1Ref.child("choice").remove();
		ref.child("turn").remove();
		$("#p2-name").empty();
		$("#p2-name").text("Waiting for Player 2");
		$("#p2-name").removeClass("p2-name-entered");
		$("#p2-name").addClass("p-not-entered");
		$("#p1-choices").empty();
		$("#p2-choices").empty();
		$("#game-message").empty();

		var message = " [ HAS LEFT THE GAME! ]";
		console.log("p2 has left");
		var time = new Date().toLocaleString("en-US", {hour: "numeric", minute: "numeric", second: "numeric"});

		chat.push({
			name: snap.val(),
			message: message,
			time: time
		});
	}
});
