//ToyCreationManager.js//
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandsLoader } = require("./CommandsLoader.js");
const { Database } = require("../database/Database.js");
const fs = require("fs");
let Initiations = new Set();

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
        if(true) {//!Initiations.has(this.interaction.user.id)) {
            Initiations.add(this.interaction.user.id);
            switch (this.interaction.commandName) {
                case "toy":
                    await this.interaction.deferReply({ephemeral: true}).then().catch(console.error);

                    if(await this.checkCreationStatus()) {
                        await this.initNewGeneration();
                    } else {
                        await this.backToPreviousGeneration();
                    }
                    break;
            }
        } else {
            await this.displayErrorMessage(`${this.interaction.user}, Please finish your toy before trying to generate a new one.`);
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
        let userInputData = await this.gatherUserInput();

        console.log(userInputData)
    }

    async gatherUserInput() {
        return await new Promise(async (resolve) => {
            let data = {};

            data.style = await this.selectStyle()
            data.color1 = await this.selectColor("first");
            data.color2 = await this.selectColor("second");
            data.words = await this.typeWords()

            resolve(data)
        });
    }

    async selectStyle() {
        return await new Promise(async (resolve) => {
            let styles = [
                {
                    label: "style1",
                    value: "style1"
                },
                {
                    label: "style2",
                    value: "style2"
                },
                {
                    label: "style3",
                    value: "style3"
                },
                {
                    label: "style4",
                    value: "style4"
                },
                {
                    label: "style5",
                    value: "style5"
                },
            ]

            let embed =
                new EmbedBuilder()
                    .setTitle("Style")
                    .setColor("Blue")
                    .setDescription(`${this.interaction.user}, select the style you wish for the toy in the selection below!`)
                    .setFooter(
                        {
                            text: this.interaction.guild.name,
                            iconURL: this.interaction.guild.iconURL()
                        }
                    )
                    .setTimestamp()

            let component =
                new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setPlaceholder("Nothing Selected")
                            .setOptions(styles)
                            .setCustomId("style_selection")
                    )

            await this.interaction.editReply(
                {
                    embeds: [embed],
                    components: [component]
                }
            ).then(async (interactionMessage) => {
                const filter = (i) => i.customId === 'style_selection' && i.user.id === this.interaction.user.id;

                await interactionMessage.awaitMessageComponent({filter, time: 120_000})
                    .then(
                        async (collected) => {
                            await collected.deferUpdate().then().catch(console.error);
                            await collected.deleteReply().then().catch(console.error);

                            await resolve(collected.values);
                        }
                    )
                    .catch(
                        async (err) => {
                            await this.endCollector(1)
                        }
                    )
            }).catch(console.error)
        });
    }

    async selectColor(pos) {
        return await new Promise(async (resolve) => {
            let colors = [
                {
                    label: "color1",
                    value: "color1"
                },
                {
                    label: "color2",
                    value: "color2"
                },
                {
                    label: "color3",
                    value: "color3"
                },
                {
                    label: "color4",
                    value: "color4"
                },
                {
                    label: "color5",
                    value: "color5"
                },
            ]

            let embed =
                new EmbedBuilder()
                    .setTitle("Color")
                    .setColor("Blue")
                    .setDescription(`${this.interaction.user}, select the ${pos} color you wish for the toy to have using the selection below!`)
                    .setFooter(
                        {
                            text: this.interaction.guild.name,
                            iconURL: this.interaction.guild.iconURL()
                        }
                    )
                    .setTimestamp()

            let component =
                new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setPlaceholder("Nothing Selected")
                            .setOptions(colors)
                            .setCustomId("color_selection")
                    )

            await this.interaction.followUp(
                {
                    ephemeral: true,
                    embeds: [embed],
                    components: [component]
                }
            ).then(async (interactionMessage) => {
                const filter = (i) => i.customId === 'color_selection' && i.user.id === this.interaction.user.id;

                await interactionMessage.awaitMessageComponent({filter, time: 120_000})
                    .then(
                        async (collected) => {
                            await collected.deferUpdate().then().catch(console.error);
                            await collected.deleteReply().then().catch(console.error);

                            await resolve(collected.values);
                        }
                    )
                    .catch(
                        async (err) => {
                            await this.endCollector(1)
                        }
                    )
            }).catch(console.error);
        });
    }


    async typeWords() {
        return await new Promise(async (resolve) => {
            let embed =
                new EmbedBuilder()
                    .setTitle("Color")
                    .setColor("Blue")
                    .setDescription(`${this.interaction.user} great! Now please hit the button below and type max 2 words.`)
                    .setFooter(
                        {
                            text: this.interaction.guild.name,
                            iconURL: this.interaction.guild.iconURL()
                        }
                    )
                    .setTimestamp()

            let component =
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle("Primary")
                            .setLabel("Input")
                            .setCustomId("input_words")
                    )

            await this.interaction.followUp(
                {
                    ephemeral: true,
                    embeds: [embed],
                    components: [component]
                }
            ).then(async (interactionMessage) => {
                const filter = (i) => i.customId === 'input_words' && i.user.id === this.interaction.user.id;
                await interactionMessage.awaitMessageComponent({filter, time: 120_000})
                    .then(
                        async (collected) => {
                            const modal = new ModalBuilder()
                                .setCustomId('words')
                                .setTitle('Words');

                            const wordsInput = new TextInputBuilder()
                                .setCustomId('inputtedWords')
                                .setLabel("What will be the generation words?")
                                .setStyle(TextInputStyle.Short);

                            const firstActionRow = new ActionRowBuilder().addComponents(wordsInput);
                            modal.addComponents(firstActionRow);

                            await collected.showModal(modal).then().catch(console.error);

                            const filter = (interaction) => interaction.customId === 'words';
                            collected.awaitModalSubmit({ filter, time: 120_000 })
                                .then(
                                    async (submission) => {
                                        await submission.deferUpdate().then().catch(console.error);
                                        resolve(submission.fields.getTextInputValue("inputtedWords"))
                                    }
                                )
                                .catch(
                                    async (err) => {
                                        await this.endCollector(1)
                                    }
                                );
                        }
                    )
                    .catch(
                        async (err) => {
                            await this.endCollector(1)
                        }
                    )
            }).catch(console.error);
        });
    }

    async fetchCollection() {

    }
    
    async displayErrorMessage(type) {
        let msg;

        Initiations.delete(this.interaction.user.id);

        switch (type) {
            case 1:
                msg = `${this.interaction.user}, you took too much time to interact with the toy creation. No token have been used.`
                break;
        }

        await this.interaction.editReply(
            {
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription(msg)
                        .setColor("Red")
                        .setFooter(
                            {
                                text: this.interaction.guild.name,
                                iconURL: this.interaction.guild.iconURL()
                            }
                        )
                        .setTimestamp()
                ]
            }
        ).then().catch(console.error);
    }

    async endCollector(msg) {
        await this.interaction.editReply(
            {
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription(msg)
                        .setColor("Red")
                        .setFooter(
                            {
                                text: this.interaction.guild.name,
                                iconURL: this.interaction.guild.iconURL()
                            }
                        )
                        .setTimestamp()
                ]
            }
        ).then().catch(console.error);
    }
}

module.exports = {
    ToyCreationManager
}