const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const chalk = require('chalk');

// Set your credentials and secrets here
const username = 'your_steam_username'; // Replace with your Steam username
const password = 'your_steam_password'; // Replace with your Steam password
const sharedSecret = 'your_shared_secret'; // Replace with your shared secret for 2FA

const games = [730, 440, 570]; // AppIDs of games to show (CS:GO, TF2, Dota 2)
const status = SteamUser.EPersonaState.Online; // Online status

// Create a new SteamUser instance
const user = new SteamUser();

// Log into Steam
if (!username || !password || !sharedSecret) {
    console.error(chalk.red("Error: Please provide valid credentials (username, password, and shared secret)."));
    process.exit(1);
}

// Login to Steam with credentials and 2FA code
user.logOn({
    accountName: username,
    password: password,
    twoFactorCode: SteamTotp.generateAuthCode(sharedSecret),
});

// Handle successful login
user.on('loggedOn', () => {
    console.log(chalk.green(`[${new Date().toLocaleString()}] Successfully logged in as ${user.steamID}`));
    user.setPersona(status); // Set the Steam persona state
    user.gamesPlayed(games); // Display games being "played" on your Steam status
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
    }, 5000); // Retry reconnect after 5 seconds
});

// Handle web session establishment
user.on('webSession', (sessionID, cookies) => {
    console.log(chalk.blue(`[${new Date().toLocaleString()}] Web session established. Session ID: ${sessionID}`));
});

// Notify when 2FA token is about to expire
setInterval(() => {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = 30 - (currentTime % 30);

    if (timeRemaining <= 5) {
        console.warn(
            chalk.yellow(`[${new Date().toLocaleString()}] 2FA token is about to expire. Time left: ${timeRemaining}s.`)
        );
    }
}, 1000);

// Flexible game updates
function updateGames(newGames) {
    console.log(chalk.blue(`[${new Date().toLocaleString()}] Updating games to: ${newGames.join(', ')}`));
    user.gamesPlayed(newGames);
}

// Simulate updating game status after 10 seconds
setTimeout(() => {
    updateGames([12345, 67890]); // Replace these with actual AppIDs you want
}, 10000);

// Handle safe shutdown with SIGINT
process.on('SIGINT', () => {
    console.log(chalk.blue(`[${new Date().toLocaleString()}] Shutting down bot...`));
    user.logOff();
    process.exit();
});
