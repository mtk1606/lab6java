const baseURL = "https://georgian.polaristechservices.com";
const studentApiKey = "200630733";
const maxTokens = 1000;

const userMessage = document.querySelector("#user-message");
const sendMessageBtn = document.querySelector("#send-message");
const checkUsageBtn = document.querySelector("#check-usage");
const results = document.querySelector("#results");

const followUpSection = document.querySelector("#follow-up-section");
const followUpMessage = document.querySelector("#follow-up-message");
const sendFollowUpBtn = document.querySelector("#send-follow-up");
const followUpResults = document.querySelector("#follow-up-results");

let conversationHistory = [];

sendMessageBtn.addEventListener("click", sendChatMessage);
checkUsageBtn.addEventListener("click", checkTokenUsage);
sendFollowUpBtn.addEventListener("click", sendFollowUpMessage);

function checkTokenUsage() {
	let url = `${baseURL}/api/claude/status`;

	fetch(url, {
		headers: {
			"X-Student-API-Key": studentApiKey
		}
	})
	.then(response => {
		return response.json();
	})
	.then(json => {
		displayStatus(json);
	})
	.catch(error => {
		console.error("Error:", error);
	});
}

function displayStatus(json) {
	let pre = document.createElement("pre");

	pre.textContent = `IS Enabled ${json.is_enabled}
last Used at: ${json.last_used_at}
Student ID: ${json.student_id}
Student Name: ${json.student_name}
Tokens Allocated: ${json.tokens_allocated}
Tokens Remaining: ${json.tokens_remaining}
Tokens Used: ${json.tokens_used}`;

	results.appendChild(pre);
}

function sendChatMessage() {
	let userInput = userMessage.value;

	if (userInput.trim() === "") {
		return;
	}

	conversationHistory = [];

	conversationHistory.push({
		role: "user",
		content: userInput
	});

	sendMessage(conversationHistory, results, false);
}

function sendFollowUpMessage() {
	let followUpInput = followUpMessage.value;

	if (followUpInput.trim() === "") {
		return;
	}

	conversationHistory.push({
		role: "user",
		content: followUpInput
	});

	sendMessage(conversationHistory, followUpResults, true);
}

function sendMessage(messages, output, isFollowUp) {
	let url = `${baseURL}/api/claude/messages`;

	let requestBody = {
		model: "claude-3-5-sonnet-20241022",
		max_tokens: maxTokens,
		messages: messages
	};

	fetch(url, {
		method: "POST",
		headers: {
			"X-Student-API-Key": studentApiKey,
			"Content-Type": "application/json"
		},
		body: JSON.stringify(requestBody)
	})
	.then(response => {
		if (!response.ok) {
			throw new Error("Request failed");
		}

		return response.json();
	})
	.then(json => {
		let assistantResponse = json.content[0].text;

		conversationHistory.push({
			role: "assistant",
			content: assistantResponse
		});

		let para = document.createElement("p");

		if (isFollowUp) {
			para.textContent = `Follow-up Assistant: ${assistantResponse}`;
		} else {
			para.textContent = `Assistant: ${assistantResponse}`;
		}

		output.appendChild(para);

		followUpSection.hidden = false;
		followUpMessage.value = "";
	})
	.catch(error => {
		console.error("Error:", error);

		if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role === "user") {
			conversationHistory.pop();
		}
	});
}
