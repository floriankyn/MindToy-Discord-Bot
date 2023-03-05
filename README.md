<h1 align="center">
  <br>
  <a href="https://discord.gg/DrBvwzpt5B"><img src="https://i.imgur.com/rL8S37S.png" alt="MindToy" width="200"></a>
  <br>
    Mind Toy
  <br>
</h1>

<h4 align="center">Create toys from your mind with our <a href="https://discord.gg/DrBvwzpt5B" target="_blank">Discord app</a> and get it shipped to your address with a <a href="https://flow.com/">Flow NFT</a>.</h4>

<p align="center">
  <a href="https://badge.fury.io/js/electron-markdownify"><img src="https://img.shields.io/github/package-json/dependency-version/floriankyn/MindToy-Discord-Bot/discord.js"></a>
  <a href="https://flow.com/"><img src="https://img.shields.io/badge/Flow-chain-green"></a>
  <a href="https://www.niftory.com/"> <img src="https://img.shields.io/badge/Niftory-%5E1.0.0-blueviolet"></a>
  <a href="https://developer.paypal.com/api/rest/"><img src="https://img.shields.io/badge/Paypal%20API-v1-blue"></a>
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#download">The Project</a> •
  <a href="#credits">Future Updates</a> •
  <a href="#credits">Known Issues</a> •
  <a href="#credits">Credits</a>
</p>

<p align="center">
    <img src="https://github.com/floriankyn/MindToy-Discord-Bot/blob/main/src/assets/images/example.gif?raw=true">
</p>

## Key Features

* Input colors, words, styles 
    - Within seconds watch the image being generated.
* Edit your input in case of mistake
    - You miss one of the inputs? Don't worry, you can edit them before the generation.
* Initiate and handle several generation at the same time.
    - Let your mind talk freely by launching several generation. 
* Interactive Inputs
    - We let you chose among 25 different colors. 625 combination possible.
* [Discord](https://discord.gg/dHbBAPnySx/) Support Available
    - In case of any issues come to our discord. We help for free ;)
* Feedbacks are important
    - We listen to our user. Come to our discord over #Feedback.
* Weekly updates
    - Fixing bugs is a thing. We add features every weeks on top of solving issues

## How To Use

To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone https://github.com/floriankyn/MindToy-Discord-Bot.git

# Go into the repository
$ cd MindToy-Discord-Bot

# Install dependencies
$ npm install

# Setup Mysql Database
$ sudo apt update
$ sudo apt install mysql-server
$ sudo mysql_secure_installation

# Create a user
$ CREATE USER 'bot'@'host' IDENTIFIED WITH authentication_plugin BY '123456789';
$ GRANT ALL PRIVILEGES ON *.* TO 'bot'@'localhost' WITH GRANT OPTION;

# Add the credentials to ./src/config/config.json
$ cd /src/config/config.json
$ nano config.json

# Replace Paypal REST API KEY
# Replace Scenario API KEY
# Replace Discord bot Token
# Replace Main Discord Guild ID
# Replace Niftory API KEY

# Run the app
$ cd src
$ node index.js
```

> **APIS**
> get your credentials for the api we uses below.
> 
> **Paypal:** [Get started with PayPal Developer](https://developer.paypal.com/api/rest/)
> 
> **Scenario:** [Getting Started with Scenario API](https://docs.scenario.gg/docs/getting-started)
> 
> **Discord:** [Get your discord bot token](https://www.writebots.com/discord-bot-token/)
> 
> **Niftory:** [Getting Started with Niftory](https://docs.niftory.com/home/get-your-api-keys)
>

> **Note**
> If you're willing to help the project, [see this guide](https://blog.scottlowe.org/2015/01/27/using-fork-branch-git-workflow/) to fork the repo and build additional features.
