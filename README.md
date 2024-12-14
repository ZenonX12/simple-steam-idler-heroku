# simple-steam-idler-heroku

24/7 Steam in-game time idler with Heroku (simple version)

---

## **Requirements:**

1. Install Git: [Download Git](https://git-scm.com/downloads)
2. Install Heroku CLI: [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
3. Register an account at [Heroku](https://heroku.com)
4. Connect your Steam account to the Steam Desktop Authenticator : [steaminventoryhelper](https://steaminventoryhelper.com/)

---

## **Setting up:**

### 1. Clone the repository:

Open PowerShell (or Terminal) in the desired folder and enter the following commands:

```bash
# Clone the repository
git clone https://github.com/Gunthersuper/simple-steam-idler-heroku
# Clone the repository
git clone https://github.com/ZenonX12/simple-steam-idler-heroku
```

After cloning, a new folder `simple-steam-idler-heroku` will appear in your directory. Navigate to this folder:

```bash
cd simple-steam-idler-heroku
```

### 2. Configure your Steam account:

Open the file `index.js` in any text editor and update the following fields with your Steam account details:

```javascript
var username = '';       // Your Steam username
var password = '';       // Your Steam password
var shared_secret = '';  // Your Steam shared secret for 2FA

var games = [730, 440, 570];  // Enter the AppIDs of games to idle
var status = 1;               // 1 = Online, 7 = Invisible
```

### 3. Deploy the bot to Heroku:

Run the following commands to deploy your bot:

```bash
# Stage the changes
git add .

# Commit the changes
git commit -m 'commit'

# Login to Heroku
heroku login
```

After running `heroku login`, a browser window will open. Log in with your Heroku account credentials.

Then, create and deploy the application:

```bash
# Create a new Heroku app
heroku create

# Push the code to Heroku
git push heroku main

# Scale the bot process and disable the web process
heroku ps:scale web=0
heroku ps:scale bot=1
```

---

## **Managing your bot:**

### Restarting the bot:

1. Go to the Heroku dashboard: [Heroku Dashboard](https://dashboard.heroku.com/apps)
2. Select your application.
3. Click `More` > `Restart all dynos`.

Your bot will restart and continue idling.

---

## **Notes:**

- Make sure your Steam credentials and shared secret are correct.
- Do not share your credentials or `index.js` file publicly.
- You can modify the `games` array with any valid Steam AppIDs for the games you wish to idle.
- For additional help, refer to Heroku's documentation or the `steam-user` library's [GitHub page](https://github.com/DoctorMcKay/node-steam-user).
