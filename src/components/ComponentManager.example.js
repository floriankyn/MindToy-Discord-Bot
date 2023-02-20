//ComponentsManager.example.js// -- Created by Florian Lepage
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandsLoader } = require("./CommandsLoader.js");
const { Database } = require("../database/Database.js");
const fs = require("fs");

class ComponentsManager{
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

        ];
    }

    async loadCommands() {
        return [

        ];
    }
}

module.exports = {
    ComponentsManager
}