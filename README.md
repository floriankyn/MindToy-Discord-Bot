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
  <a href="#The-Project">The Project</a> •
  <a href="#Future-Updates">Future Updates</a> •
  <a href="#Last-PatchNote">Last PatchNote</a> •
  <a href="#Credits">Credits</a>
</p>


https://user-images.githubusercontent.com/45848097/222940578-d73aba0e-7d5d-4992-add2-f1d70e43024c.mp4


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
    - Fixing bugs is a thing. We add features every weeks on top of that.

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

## The Project

* Mind Toy is a brand that offers co-creative product design with On-demand manufacture.
* Customers, aided by ai image generative models can design and receive physical items 100% unique to them.
* Brands, IP, and creators can connect with customers via co-creative engagement and sell products together with fans.
* All inside a simple to use Discord bot that allows users create, mint and order physical collectibles.

> 💡Customers design unique physical goods
>
> 🤝Brands co-create products with fans
>
> 🧠Combining fine tuned Stable diffusion with a bespoke pipeline to colour 3D print objects
>
> 🚀Integrating FLOW & Niftory API to mint licence NFTs on the blockchain for a new co-licencing model.

* With FLOW Blockchain, Mind Toy is designing an innovative co-licensing business model using NFTs and split royalty smart contracts.
* Mind Toy is planning solutions for secondary marketplace sales/rentals of NFT licenses.

> #co-creation #NFT #smartcontracts #AI #3Dprinting #Discord #secondarymarketplace

## Future Updates

As for the future we plan many updates. Starting from March 6, 2023 5:00 PM we are about to introduce to more commands. As time goes we we unfold more and more of our vision of mind toy as well as future addition to our app.

> **March 6, 2023 5:00 PM UTC+1**
>
> **/collection**: With this command you'll be able to retrieve all your past generation. From that you'll be able to scroll right by packed image of 4, magnify your creations, delete the useless ones and mode.
>
> **March 13, 2023 5:00 PM UTC+1**
>
> **/collection Additions:** We are planning to allow you to purchase toys from your previous generations. It implies not being scared of missing out something as you'll be able to get your toy and nft at any time.
>
> **March 13, 2023 5:00 PM UTC+1**
>
> **The future will unfold the present!**


## Last PatchNote

__Version:__ `1.0.1`

__New Features:__
- We are introducing the "Shadow" Style. Try it out!
- **25 new colors** added for a total combination of **625** possibilities!

__Improvements:__
- The bot is now hosted on a vps and can be used at any time.

__Known Issues:__
- When minting, a duplicate is creating within our database which. Therefore with /mint you'll have your minted nft twice with the possibility to mint it again. We are taking care of that issue.

__Notes:__
- The project is now open source. You can check it out  here https://github.com/floriankyn/MindToy-Discord-Bot
- A readme is coming soon.


## Credits

### The Team:
> 💻 **Project Head Developer:** [Florian Lepage](https://www.linkedin.com/in/florian-lepage/) <p align="left"> <a href="https://www.dev.to/floriankyn" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/socials/devdotto.svg" width="32" height="32" /></a> <a href="https://discord.gg/ZwsyKz2BuC" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/socials/discord.svg" width="32" height="32" /></a> <a href="https://www.github.com/floriankyn" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/socials/github.svg" width="32" height="32" /></a> <a href="http://www.instagram.com/florian_kyn" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/socials/instagram.svg" width="32" height="32" /></a> <a href="https://www.linkedin.com/in/florian-lepage" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/socials/linkedin.svg" width="32" height="32" /></a> <a href="https://www.stackoverflow.com/users/13493116/florian-lepage" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/socials/stackoverflow.svg" width="32" height="32" /></a> <a href="https://www.twitter.com/florian_kyn" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/socials/twitter.svg" width="32" height="32" /></a></p>
>
> 💡 **The Idea Guy & Project Manager** Josh
>


### Libraries and software used:

<a href="https://nodejs.org/en/">Node.JS</a> •
<a href="https://discord.js.org/#/">Discord.JS</a> •
<a href="https://www.niftory.com/">Niftory</a> •
<a href="https://developer.paypal.com/api/rest/">Paypal</a> •
<a href="https://www.flow.com">Flow Blockchain</a> •
<a href="https://www.scenario.com/">Scenario</a>
