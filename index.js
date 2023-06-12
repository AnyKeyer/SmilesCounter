import { RefreshingAuthProvider  } from '@twurple/auth';
import { ApiClient } from '@twurple/api';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { ChatClient } from '@twurple/chat';
import { promises as fs } from 'fs';
import { WebSocketServer } from 'ws';
import express from 'express';
import path from 'path';
const wss = new WebSocketServer({ port: 8080 });

const app = express()
app.get('/', (req, res) => {
    res.sendFile('index.html', {root: "./public"});
})
app.use(express.static('public'));
app.listen(process.env.PORT || 3000);

var streamSmiles = new Map();

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {	
    console.log('received: %s', data);
  });
  sendwsData(ws);
});

function sendwsData(ws){
	ws.send(JSON.stringify(Array.from(streamSmiles, ([name, value]) => ({ name, value }))));
	setTimeout(sendwsData,1000,ws);
}

const clientId = 'k4c3bm8v2kei7whnwhevr37ex6cxus';
const clientSecret = '39zubmcf8kh9q99dxput9p7pazch8e';
const tokenData = JSON.parse(await fs.readFile('./tokens.551255103.json', 'UTF-8'));

const authProvider = new RefreshingAuthProvider(
	{
		clientId,
		clientSecret,
		onRefresh: async (userId, newTokenData) => await fs.writeFile(`./tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4), 'UTF-8')
	}
);

await authProvider.addUserForToken(tokenData,['chat']);

const apiClient = new ApiClient({ authProvider });

const listener = new EventSubWsListener({ apiClient });
listener.start();

const userId = '551255103';

const onlineSubscription = listener.onStreamOnline(userId, e => {
	console.log(`${e.broadcasterDisplayName} just went live!`);
	streamSmiles = new Map();
});

const offlineSubscription = listener.onStreamOffline(userId, e => {
	streamSmiles = new Map();
	console.log(`${e.broadcasterDisplayName} just went offline`);
});
const chatClient = new ChatClient({ authProvider, channels: ['kassandr4_','5h4dov_v'] });
chatClient.connect();
chatClient.onMessage(async (channel, user, text, msg) => {
	console.log(msg.emoteOffsets);
	msg.emoteOffsets.forEach((value, key) => {
		for(var i =0;i<value.length;i++){
		incrementCounter(key);
		}
	  });
	console.log(streamSmiles);
});

function incrementCounter(key) {
	// Check if the key already exists in the map
	if (streamSmiles.has(`https://static-cdn.jtvnw.net/emoticons/v2/${key}/static/dark/3.0`)) {
	  // If it exists, increment the counter by 1
	  streamSmiles.set(`https://static-cdn.jtvnw.net/emoticons/v2/${key}/static/dark/3.0`, streamSmiles.get(`https://static-cdn.jtvnw.net/emoticons/v2/${key}/static/dark/3.0`) + 1);
	} else {
	  // If it doesn't exist, set the counter to 1
	  streamSmiles.set(`https://static-cdn.jtvnw.net/emoticons/v2/${key}/static/dark/3.0`, 1);
	}
}