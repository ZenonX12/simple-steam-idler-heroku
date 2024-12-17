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
let reconnectAttempts = 0; // Track reconnection attempts

// Validate credentials
if (!username || !password) {
    console.error(chalk.red("❌ Error: Missing username or password. Please provide valid credentials."));
    process.exit(1);
}

// Create a new SteamUser instance
const user = new SteamUser();

// Generate 2FA Code
const getTwoFactorCode = () => {
    if (sharedSecret) {
        return SteamTotp.generateAuthCode(sharedSecret);
    }
    console.warn(chalk.yellow("⚠️ Shared secret not provided. Please manually input the 2FA code."));
    return null;
};

// Log into Steam
const logOnToSteam = () => {
    const twoFactorCode = getTwoFactorCode();

    user.logOn({
        accountName: username,
        password: password,
        twoFactorCode: twoFactorCode,
    });
};

// Handle successful login
user.on('loggedOn', () => {
    reconnectAttempts = 0; // Reset reconnect attempts on success
    loginTime = new Date();

    console.log(chalk.green(`[${loginTime.toLocaleString()}] ✅ Successfully logged in as ${user.steamID}`));
    user.setPersona(status);
    user.gamesPlayed(games);
    console.log(chalk.green(`[${new Date().toLocaleString()}] 🎮 Now playing games: ${games.join(', ')}`));
});

// Handle login errors
user.on('error', (err) => {
    if (err.eresult === SteamUser.EResult.InvalidPassword) {
        console.error(chalk.red(`[${new Date().toLocaleString()}] ❌ Login failed: Invalid password. Please check your credentials.`));
    } else if (err.eresult === SteamUser.EResult.TwoFactorCodeMismatch) {
        console.error(chalk.red(`[${new Date().toLocaleString()}] ❌ Login failed: Incorrect 2FA code. Ensure shared secret is correct.`));
    } else {
        console.error(chalk.red(`[${new Date().toLocaleString()}] ❌ Login error: ${err.message}`));
    }

    process.exit(1);
});

// Handle disconnections with exponential backoff
user.on('disconnected', (eresult) => {
    reconnectAttempts++;
    const retryDelay = Math.min(30000, 5000 * reconnectAttempts); // Cap delay at 30 seconds

    console.warn(chalk.yellow(`[${new Date().toLocaleString()}] 🔄 Disconnected from Steam (eresult: ${eresult}). Retrying in ${retryDelay / 1000} seconds...`));
    setTimeout(logOnToSteam, retryDelay);
});

// Handle web session establishment
user.on('webSession', (sessionID, cookies) => {
    console.log(chalk.blue(`[${new Date().toLocaleString()}] 🌐 Web session established. Session ID: ${sessionID}`));
});

// Handle incoming Steam messages
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
    } else {
        const response = `🤖 Sorry, I didn't understand that! 🚧\n` +
                         `💡 Try asking about:\n` +
                         `- ⏰ "time online" to see how long I've been connected.\n` +
                         `✨ Let’s make this chat awesome! 🎉`;

        user.chatMessage(steamID, response);
    }
});

// Safe shutdown on Ctrl+C
process.on('SIGINT', () => {
    console.log(chalk.blue(`[${new Date().toLocaleString()}] 🛑 Shutting down bot...`));
    user.logOff();
    process.exit();
});

// Start logging in
logOnToSteam();

// Credits
console.log(chalk.magentaBright('\n=============================================='));
console.log(chalk.bold.magentaBright('🛠️  Steam Bot Project'));
console.log(chalk.greenBright('✨ Developed by: ') + chalk.cyanBright('https://github.com/Gunthersuper/'));
console.log(chalk.greenBright('🐛 Fixes & Enhancements: ') + chalk.cyanBright('https://github.com/ZenonX12/'));
console.log(chalk.yellowBright('\n🚀 Thank you for using this bot! 💖 Stay awesome!'));
console.log(chalk.magentaBright('==============================================\n'));
