const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');

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
    console.error("Error: Please provide valid credentials (username, password, and shared secret).");
    process.exit(1);
}

user.logOn({
    accountName: username,
    password: password,
    twoFactorCode: SteamTotp.generateAuthCode(sharedSecret),
});

// Handle successful login
user.on('loggedOn', () => {
    console.log(`[${new Date().toLocaleString()}] Successfully logged in as ${user.steamID}`);
    user.setPersona(status); // Set the persona state (e.g., online or invisible)
    user.gamesPlayed(games); // Start playing the specified games
    console.log(`[${new Date().toLocaleString()}] Now playing games: ${games.join(', ')}`);
});

// Handle login errors
user.on('error', (err) => {
    console.error(`[${new Date().toLocaleString()}] Login error: ${err.message}`);
});

// Additional event handlers for improved logging
user.on('disconnected', (eresult) => {
    console.warn(`[${new Date().toLocaleString()}] Disconnected from Steam (eresult: ${eresult}).`);
});

user.on('webSession', (sessionID, cookies) => {
    console.log(`[${new Date().toLocaleString()}] Web session established. Session ID: ${sessionID}`);
});
