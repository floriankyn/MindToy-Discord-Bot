//ToyCreationManager.js//
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandsLoader } = require("./CommandsLoader.js");
const { Database } = require("../database/Database.js");
const fs = require("fs");

class ToyCreationManager{
    constructor(interaction=null, client=null, config=null) {
        this.interaction = interaction;
        this.client = client;
        this.config = config;

        if(config !== null) {
            this.db = new Database(config);
        }
    }


    loadTables() {
        return [
            `CREATE TABLE IF NOT EXISTS dc_creation_tokens (user_id VARCHAR(30), tokens VARCHAR(10), cooldown VARCHAR(30))`
        ];
    }

    async loadCommands() {
        return [
            new SlashCommandBuilder()
                .setName("toy")
                .setDescription("Create a new toy!")
        ];
    }

    async on() {
        switch (this.interaction.commandName) {
            case "toy":
                if(await this.checkCreationStatus()) {
                    await this.initNewGeneration();
                } else {
                    await this.backToPreviousGeneration();
                }
                break;
        }
    }

    async checkCreationStatus() {
        return await new Promise(async (resolve) => {
            this.db.connection().getConnection(async (err, conn) => {
                if(err) throw err;

                let UserProfile = await this.db.query(conn, `SELECT * FROM dc_creation_tokens WHERE user_id = "${this.interaction.user.id}"`);


                let hasToken;
                if(UserProfile.length >= 1) {
                    if(parseInt(UserProfile[0].tokens) >= 1) {
                        hasToken = true;
                    } else {
                        hasToken = false;
                    }
                } else {
                    await this.db.query(conn, `INSERT INTO dc_creation_tokens (user_id, tokens) VALUES ("${this.interaction.user.id}", "5")`);
                    hasToken = true;
                }

                this.db.connection().releaseConnection(conn)

                resolve(hasToken)
            });
        });
    }

    async backToPreviousGeneration() {

    }

    async initNewGeneration() {

    }
}

module.exports = {
    ToyCreationManager
}