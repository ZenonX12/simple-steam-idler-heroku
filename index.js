const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const chalk = require('chalk');

// Set your credentials and secrets here
const username = ''; // Enter your Steam username
const password = ''; // Enter your Steam password
const sharedSecret = ''; // Enter your shared secret for 2FA

const games = [730, 440, 570]; // AppIDs of games to play
const status = SteamUser.EPersonaState.Online; // 1 (Online), 7 (Invisible), etc.

let loginTime = null; // Track the time when bot logs in
let gameStartTime = null; // Track the time when games start

// Create a new SteamUser instance
const user = new SteamUser();

// Log into Steam
if (!username || !password || !sharedSecret) {
    console.error(chalk.red("Error: Please provide valid credentials (username, password, and shared secret)."));
    process.exit(1);
}

user.logOn({
    accountName: username,
    password: password,
    twoFactorCode: SteamTotp.generateAuthCode(sharedSecret),
});

// Handle successful login
user.on('loggedOn', () => {
    loginTime = new Date();
    console.log(chalk.green(`[${loginTime.toLocaleString()}] Successfully logged in as ${user.steamID}`));
    user.setPersona(status);
    user.gamesPlayed(games);
    gameStartTime = new Date();
    console.log(chalk.green(`[${gameStartTime.toLocaleString()}] 🎮 Now playing games: ${games.join(', ')}`));
});

// Handle login errors
user.on('error', (err) => {
    if (err.message.includes('InvalidPassword')) {
        console.error(chalk.red(`[${new Date().toLocaleString()}] ❌ Login error: Invalid password. Please check your credentials.`));
    } else {
        console.error(chalk.red(`[${new Date().toLocaleString()}] ❌ Login error: ${err.message}`));
    }
});

// Handle disconnections with automatic reconnect
user.on('disconnected', (eresult) => {
    console.warn(chalk.yellow(`[${new Date().toLocaleString()}] 🔄 Disconnected from Steam (eresult: ${eresult}). Retrying in 5 seconds...`));
    setTimeout(() => {
        user.logOn({
            accountName: username,
            password: password,
            twoFactorCode: SteamTotp.generateAuthCode(sharedSecret),
        });
    }, 5000);
});

// Handle web session establishment
user.on('webSession', (sessionID, cookies) => {
    console.log(chalk.blue(`[${new Date().toLocaleString()}] 🌐 Web session established. Session ID: ${sessionID}`));
});

// Handle incoming Steam messages with improved responses
user.on('friendMessage', (steamID, message) => {
    console.log(chalk.cyan(`[${new Date().toLocaleString()}] 📩 Message from ${steamID.getSteamID64()}: ${message}`));

    if (message.toLowerCase().includes('time online')) {
        const now = new Date();
        const onlineDuration = Math.floor((now - loginTime) / 1000);
        const hours = Math.floor(onlineDuration / 3600);
        const minutes = Math.floor((onlineDuration % 3600) / 60);

        const response = `✨ Hey there! 🌐 I've been connected to Steam for:\n` +
                         `⏳ **${hours} hours and ${minutes} minutes** 💻\n` +
                         `📌 Need anything else? Let me know! 😎`;

        user.chatMessage(steamID, response);
    } else if (message.toLowerCase().includes('time playing')) {
        const now = new Date();
        const playingDuration = Math.floor((now - gameStartTime) / 1000);
        const hours = Math.floor(playingDuration / 3600);
        const minutes = Math.floor((playingDuration % 3600) / 60);

        const gameNames = games.map(gameID => {
            switch (gameID) {
                case 730: return '🎮 Counter-Strike: Global Offensive';
                case 440: return '🎮 Team Fortress 2';
                case 570: return '🎮 Dota 2';
                default: return `🕹️ AppID ${gameID}`;
            }
        }).join('\n');

        const response = `🔥 Gaming stats incoming! 🎮\n` +
                         `🕒 **Time spent playing:** ${hours} hours and ${minutes} minutes\n` +
                         `🎲 **Current games:**\n${gameNames}\n` +
                         `💬 Need more info? Just ask! 😉`;

        user.chatMessage(steamID, response);
    } else {
        const response = `🤖 Oops, I didn't catch that! 🚧\n` +
                         `💡 Try asking about:\n` +
                         `- ⏰ **"time online"** for connection time\n` +
                         `- ⌛ **"time playing"** for gaming stats\n` +
                         `✨ Let’s make this chat awesome! 🎉`;

        user.chatMessage(steamID, response);
    }
});

// Handle safe shutdown
process.on('SIGINT', () => {
    console.log(chalk.blue(`[${new Date().toLocaleString()}] 🛑 Shutting down bot...`));
    user.logOff();
    process.exit();
});

// Credits
console.log(chalk.magentaBright('\n=============================================='));
console.log(chalk.bold.magentaBright('🛠️  Steam Bot Project'));
console.log(chalk.greenBright('✨ Developed by: ') + chalk.cyanBright('https://github.com/Gunthersuper/'));
console.log(chalk.greenBright('🐛 Fixes & Enhancements: ') + chalk.cyanBright('https://github.com/ZenonX12/'));
console.log(chalk.yellowBright('\n🚀 Thank you for using this bot! 💖 Stay awesome!'));
console.log(chalk.magentaBright('==============================================\n'));
