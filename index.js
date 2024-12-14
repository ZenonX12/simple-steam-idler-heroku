const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const chalk = require('chalk');

// Set your credentials and secrets here
const username = ''; // Enter your Steam username
const password = ''; // Enter your Steam password
const sharedSecret = ''; // Enter your shared secret for 2FA

const games = [730, 440, 570]; // AppIDs of games to play
const status = SteamUser.EPersonaState.Online; // 1 (Online), 7 (Invisible), etc.

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
    console.log(chalk.green(`[${new Date().toLocaleString()}] Successfully logged in as ${user.steamID}`));
    user.setPersona(status); // Set the persona state (e.g., online or invisible)
    user.gamesPlayed(games); // Start playing the specified games
    console.log(chalk.green(`[${new Date().toLocaleString()}] Now playing games: ${games.join(', ')}`));
});

// Handle login errors
user.on('error', (err) => {
    if (err.message.includes('InvalidPassword')) {
        console.error(chalk.red(`[${new Date().toLocaleString()}] Login error: Invalid password. Please check your credentials.`));
    } else {
        console.error(chalk.red(`[${new Date().toLocaleString()}] Login error: ${err.message}`));
    }
});

// Handle disconnections with automatic reconnect
user.on('disconnected', (eresult) => {
    console.warn(chalk.yellow(`[${new Date().toLocaleString()}] Disconnected from Steam (eresult: ${eresult}). Retrying in 5 seconds...`));
    setTimeout(() => {
        user.logOn({
            accountName: username,
            password: password,
            twoFactorCode: SteamTotp.generateAuthCode(sharedSecret),
        });
    }, 5000); // Retry after 5 seconds
});

// Handle web session establishment
user.on('webSession', (sessionID, cookies) => {
    console.log(chalk.blue(`[${new Date().toLocaleString()}] Web session established. Session ID: ${sessionID}`));
});

// Handle safe shutdown
process.on('SIGINT', () => {
    console.log(chalk.blue(`[${new Date().toLocaleString()}] Shutting down bot...`));
    user.logOff();
    process.exit();
});

// Credits
console.log(chalk.magenta('Owner: https://github.com/Gunthersuper/'));
console.log(chalk.magenta('Fix by: https://github.com/ZenonX12/'));
