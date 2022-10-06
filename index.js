var username, password;
// Initializes the Web client
WebIM.conn = new WebIM.connection({
	appKey: "41117440#383391",
});
// Adds the event handler
WebIM.conn.addEventHandler("connection&message", {
	// Occurs when the app is connected to Chat
	onConnected: () => {
		document
			.getElementById("log")
			.appendChild(document.createElement("div"))
			.append("Connect success !");
	},
	// Occurs when the app is disconnected from Chat
	onDisconnected: () => {
		document
			.getElementById("log")
			.appendChild(document.createElement("div"))
			.append("Logout success !");
	},
	// Occurs when a text message is received
	onTextMessage: (message) => {
		console.log(message);
		document
			.getElementById("log")
			.appendChild(document.createElement("div"))
			.append("Message from: " + message.from + " Message: " + message.msg);
	},
	// Occurs when the token is about to expire
	onTokenWillExpire: (params) => {
		document
			.getElementById("log")
			.appendChild(document.createElement("div"))
			.append("Token is about to expire");
		refreshToken(username, password);
	},
	// Occurs when the token has expired. You need to get a token from your app server to log in to Chat
	onTokenExpired: (params) => {
		document
			.getElementById("log")
			.appendChild(document.createElement("div"))
			.append("The token has expired");
		refreshToken(username, password);
	},
	onError: (error) => {
		console.log("on error", error);
	},
});

// Gets the token from the app server
function refreshToken(username, password) {
	postData("https://a41.chat.agora.io/app/chat/user/login", {
		userAccount: username,
		userPassword: password,
	}).then((res) => {
		let agoraToken = res.accessToken;
		WebIM.conn.renewToken(agoraToken);
		document
			.getElementById("log")
			.appendChild(document.createElement("div"))
			.append("Token has been updated");
	});
}
// Sends a request for token
function postData(url, data) {
	return fetch(url, {
		body: JSON.stringify(data),
		cache: "no-cache",
		headers: {
			"content-type": "application/json",
		},
		method: "POST",
		mode: "cors",
		redirect: "follow",
		referrer: "no-referrer",
	}).then((response) => response.json());
}

// Defines the functions of the buttons
window.onload = function () {
	// Registration
	document.getElementById("register").onclick = function () {
		username = document.getElementById("userID").value.toString();
		password = document.getElementById("password").value.toString();
		// 1. Uses token to authenticate the user
		postData("https://a41.chat.agora.io/app/chat/user/register", {
			userAccount: username,
			userPassword: password,
		})
			.then((res) => {
				document
					.getElementById("log")
					.appendChild(document.createElement("div"))
					.append(`register user ${username} success`);
			})
			.catch((res) => {
				document
					.getElementById("log")
					.appendChild(document.createElement("div"))
					.append(`${username} already exists`);
			});
	};
	// Logs into Chat
	document.getElementById("login").onclick = function () {
		document
			.getElementById("log")
			.appendChild(document.createElement("div"))
			.append("Logging in...");
		username = document.getElementById("userID").value.toString();
		password = document.getElementById("password").value.toString();
		// 1. Uses a token for authentication
		postData("https://a41.chat.agora.io/app/chat/user/login", {
			userAccount: username,
			userPassword: password,
		})
			.then((res) => {
				let agoraToken = res.accessToken;
				let easemobUserName = res.chatUserName;
				WebIM.conn.open({
					user: easemobUserName,
					agoraToken: agoraToken,
				});
			})
			.catch((res) => {
				document
					.getElementById("log")
					.appendChild(document.createElement("div"))
					.append(`Login failed`);
			});
	};

	// Logs out
	document.getElementById("logout").onclick = function () {
		WebIM.conn.close();
		document
			.getElementById("log")
			.appendChild(document.createElement("div"))
			.append("logout");
	};

	// Sends a peer-to-peer message
	document.getElementById("send_peer_message").onclick = function () {
		let peerId = document.getElementById("peerId").value.toString();
		let peerMessage = document.getElementById("peerMessage").value.toString();
		let option = {
			chatType: "singleChat", // Sets the chat type as single chat
			type: "txt", // Sets the message type
			to: peerId, // Sets the recipient of the meesage (userId)
			msg: peerMessage, // Sets the message content
		};
		let msg = WebIM.message.create(option);
		WebIM.conn
			.send(msg)
			.then((res) => {
				console.log("send private text success");
				document
					.getElementById("log")
					.appendChild(document.createElement("div"))
					.append("Message send to: " + peerId + " Message: " + peerMessage);
			})
			.catch(() => {
				console.log("send private text fail");
			});
	};
};
s