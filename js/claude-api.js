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

let originalUserMessage = "";
let firstClaudeResponse = "";

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
	let url = `${baseURL}/api/claude/messages`;

	let requestBody = {
		max_tokens: 1024,
		messages: [
			{ content: userInput, role: "user" }
		],
		model: "claude-sonnet-5"
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
		return response.json();
	})
	.then(json => {
		let assistantResponse = json.content[0].text;

		originalUserMessage = userInput;
		firstClaudeResponse = assistantResponse;

		let para = document.createElement("p");
		para.textContent = `Assistant: ${assistantResponse}`;
		results.appendChild(para);

		followUpSection.hidden = false;
	})
	.catch(error => {
		console.error("Error:", error);
	});
}

function sendFollowUpMessage() {
	let followUpInput = followUpMessage.value;
	let url = `${baseURL}/api/claude/messages`;

	let messages = [
		{ content: originalUserMessage, role: "user" },
		{ content: firstClaudeResponse, role: "assistant" },
		{ content: followUpInput, role: "user" }
	];

	let requestBody = {
		max_tokens: 1024,
		messages: messages,
		model: "claude-sonnet-5"
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
		return response.json();
	})
	.then(json => {
		let assistantResponse = json.content[0].text;

		let para = document.createElement("p");
		para.textContent = `Follow-up Assistant: ${assistantResponse}`;
		followUpResults.appendChild(para);
	})
	.catch(error => {
		console.error("Error:", error);
	});
}
