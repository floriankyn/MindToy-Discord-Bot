//CollectionManager.js//
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder, Base, Attachment} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { Database } = require("../database/Database.js");
const fs = require("fs");
const wait = require('util').promisify(setTimeout);
const { createCanvas, loadImage } = require('canvas')
const fetch = require('node-fetch');
const { Base64 } = require("js-base64");

class CollectionManager {
    constructor(interaction = null, client = null, config = null) {
        this.interaction = interaction;
        this.client = client;
        this.config = config;

        if (config !== null) {
            this.db = new Database(config);
        }
    }



    loadTables() {
        return [
            `CREATE TABLE IF NOT EXISTS dc_collections (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(30), image_id VARCHAR(255), words VARCHAR(255), color1 VARCHAR(255), color2 VARCHAR(30), style VARCHAR(30))`
        ];
    }

    async loadCommands() {
        return [
            new SlashCommandBuilder()
                .setName("collection")
                .setDescription("All your previous generations here.")
        ];
    }

    async on() {
        switch (this.interaction.commandName) {
            case "collection":
                await this.interaction.deferReply({ephemeral: true, fetchReply: true})
                    .then(async (message) => {
                        await this.initiateCollections(message.id);
                    })
                    .catch(console.error);
                break;
        }
    }

    async initiateCollections(messageId) {
        this.db.connection().getConnection(async (err, conn) => {
            if(err) throw err;

            let UserCollection = await this.db.query(conn, `SELECT * FROM dc_collections WHERE user_id = "${this.interaction.user.id}"`);

            if(UserCollection.length >= 1) {
                let embeds = [];
                let attachment;
                let img;

                for (const [i, e] of UserCollection.entries()) {
                    img = fs.readFileSync(__dirname + `/../assets/images/collections/${UserCollection[i].id}_PACKED.png`);
                    attachment = new AttachmentBuilder(img, {name: `${UserCollection[i].id}_PACKED.png`});

                    let selection = [
                        {
                            label: "Top Left",
                            value: "A"
                        },
                        {
                            label: "Top Right",
                            value: "B"
                        },
                        {
                            label: "Bottom Left",
                            value: "C"
                        },
                        {
                            label: "Bottom Right",
                            value: "D"
                        }
                    ]

                    embeds.push([
                        {
                            ephemeral: true,
                            embeds: [
                                new EmbedBuilder()
                                    .setAuthor({name: `Page: ${i+1}/${UserCollection.length}`})
                                    .setColor("Green")
                                    .addFields(
                                        {
                                            name: "Style",
                                            value: `> **${UserCollection[i].style}**`,
                                            inline: true
                                        },
                                        {
                                            name: `Primary Color`,
                                            value: `> **${UserCollection[i].color1}**`,
                                            inline: true
                                        },
                                        {
                                            name: '\u200B',
                                            value: '\u200B',
                                            inline: true
                                        },
                                        {
                                            name: "Secondary Color",
                                            value: `> **${UserCollection[i].color2}**`,
                                            inline: true
                                        },
                                        {
                                            name: "Words",
                                            value: `> **${UserCollection[i].words}**`,
                                            inline: true
                                        },
                                        {
                                            name: '\u200B',
                                            value: '\u200B',
                                            inline: true
                                        },
                                    )
                                    .setImage(`attachment://${UserCollection[i].id}_PACKED.png`)
                                    .setFooter({text: this.interaction.guild.name, iconURL: this.interaction.guild.iconURL()})
                            ],
                            files: [attachment],
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(
                                        new StringSelectMenuBuilder()
                                            .setCustomId(`selector_${messageId}`)
                                            .setPlaceholder("Nothing Selected")
                                            .addOptions(selection)
                                    ),
                                new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setEmoji("⬅")
                                            .setStyle("Primary")
                                            .setCustomId(`left_${messageId}`)
                                    )
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setEmoji("➡")
                                            .setStyle("Primary")
                                            .setCustomId(`right_${messageId}`)
                                    )

                            ]
                        },
                        e
                    ]);
                }

                let pageIndex = 0;

                await this.interaction.webhook.editMessage(messageId, embeds[pageIndex][0])
                    .then(async (message) => {
                        while (Date.now() < Date.now()+300000) {
                            await new Promise(async (resolve) => {
                                let filterIds = [`right_${messageId}`, `left_${messageId}`, `selector_${messageId}`];

                                const filter = (i) => i.user.id === this.interaction.user.id && filterIds.includes(i.customId);

                                const collector = await this.interaction.channel.createMessageComponentCollector(filter, {time: 300000, maxProcessed: 1});

                                collector.on("collect", async (collected) => {
                                    switch (collected.customId) {
                                        case `left_${messageId}`:
                                            if(pageIndex-1 >= 0) {
                                                pageIndex--
                                                await this.interaction.webhook.editMessage(message.id,
                                                    embeds[pageIndex][0]
                                                ).then().catch(console.error);
                                            }

                                            await collected.deferUpdate().then().catch(console.error);
                                            break;
                                        case `right_${messageId}`:
                                            if(pageIndex+1 <= embeds.length-1) {
                                                pageIndex++
                                                await this.interaction.webhook.editMessage(message.id,
                                                    embeds[pageIndex][0]
                                                ).then().catch(console.error);
                                            }
                                            await collected.deferUpdate().then().catch(console.error);
                                            break;
                                        case `selector_${messageId}`:
                                            let imagePos = collected.values[0];

                                            await this.magnifyImage(`${embeds[pageIndex][1].id}_${imagePos}.png`);
                                            await collected.deferUpdate().then().catch(console.error);
                                            break;
                                    }
                                });
                            });
                        }
                    })
                    .catch(console.error);
            } else {
                await this.interaction.webhook.editMessage(messageId, {
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Error")
                            .setDescription("You haven't generated any images yet.")
                            .setColor("Red")
                            .setTimestamp()
                            .setFooter({text: this.interaction.guild.name, iconURL: this.interaction.guild.iconURL()})
                    ]
                })
            }

            this.db.connection().releaseConnection(conn);
        })
    }

    async magnifyImage(imgSrc) {
        let img = fs.readFileSync(__dirname + `/../assets/images/collections/${imgSrc}`);
        let attachment = new AttachmentBuilder(img, {name: `${imgSrc}`});

        await this.interaction.followUp(
            {
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Magnified Image")
                        .setColor("Green")
                        .setImage(`attachment://${imgSrc}`)
                        .setFooter({text: this.interaction.guild.name, iconURL: this.interaction.guild.iconURL()})
                ],
                files: [attachment]
            }
        ).then().catch(console.error);
    }

    async saveGeneration(images, user_id, metadata) {
        this.db.connection().getConnection(async (err, conn) => {
            if(err) throw err;

            let CurrentIds = await this.db.query(conn, `SELECT * FROM dc_collections`);
            let nextId = CurrentIds.length+1;

            await this.db.query(conn, `INSERT INTO dc_collections (user_id, image_id, words, color1, color2, style) VALUES ("${user_id}", "${nextId}", "${metadata.words}", "${metadata.color1[0]}", "${metadata.color2[0]}", "${metadata.style[0]}")`)

            fs.writeFileSync(__dirname + `/../assets/images/collections/${nextId}_A.png`, images[0]);
            fs.writeFileSync(__dirname + `/../assets/images/collections/${nextId}_B.png`, images[1]);
            fs.writeFileSync(__dirname + `/../assets/images/collections/${nextId}_C.png`, images[2]);
            fs.writeFileSync(__dirname + `/../assets/images/collections/${nextId}_D.png`, images[3]);
            fs.writeFileSync(__dirname + `/../assets/images/collections/${nextId}_PACKED.png`, images[4]);



            this.db.connection().releaseConnection(conn);
        });
    }
}

module.exports = {
    CollectionManager
}