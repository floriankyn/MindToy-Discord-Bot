//ToyCreationManager.js//
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder,
    Base,
    Attachment
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandsLoader } = require("./CommandsLoader.js");
const { Database } = require("../database/Database.js");
const fs = require("fs");
const { Base64 } = require('js-base64');
const sdk = require('api')('@scenario-api/v1.0#5lwpphle8jvsvf');
let Initiations = new Set();
const wait = require('util').promisify(setTimeout);
const { createCanvas, loadImage } = require('canvas')
const {use} = require("needle/lib/parsers");


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
            `CREATE TABLE IF NOT EXISTS dc_creation_tokens (user_id VARCHAR(30), tokens VARCHAR(10), cooldown VARCHAR(30))`,
            `CREATE TABLE IF NOT EXISTS dc_generated_toys (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(40), image1 TEXT, image2 TEXT, image3 TEXT, image4 TEXT, date DATETIME)`
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
                        await this.gatherUserInput();
                    } else {
                        await this.backToPreviousGeneration();
                    }
                    break;
            }
        } else {
            await this.displayErrorMessage(`${this.interaction.user}, Please finish your toy before trying to generate a new one.`);
        }
    }

    async backToPreviousGeneration() {

    }

    async fetchCollection() {

    }

    async initNewGeneration(data) {
        let stuff = [
            {
                name: "Style",
                value: `> **${data.style[0]}**`,
                inline: true
            },
            {
                name: `Primary Color`,
                value: `> **${data.color1[0]}**`,
                inline: true
            },
            {
                name: '\u200B',
                value: '\u200B',
                inline: true
            },
            {
                name: "Secondary Color",
                value: `> **${data.color2[0]}**`,
                inline: true
            },
            {
                name: "Words",
                value: `> **${data.words}**`,
                inline: true
            },
            {
                name: '\u200B',
                value: '\u200B',
                inline: true
            },
        ]

        let embed =
            new EmbedBuilder()
                .setTitle("Generation")
                .setColor("Blue")
                .setDescription(`${this.interaction.user} The images are being generated. Please wait!`)
                .setImage("https://miro.medium.com/max/700/1*CsJ05WEGfunYMLGfsT2sXA.gif")
                .addFields(
                    stuff
                )
                .setFooter(
                    {
                        text: this.interaction.guild.name,
                        iconURL: this.interaction.guild.iconURL()
                    }
                )
                .setTimestamp()



        this.interaction.followUp(
            {
                ephemeral: true,
                fetchReply: true,
                embeds: [embed]
            }
        ).then(async (interactionMessage) => {
            let imagesCreation =
                await new Promise(async (resolve) => {
                    sdk.auth('Basic YXBpX0ljeWdJTGR0Unl1RlRIOVo4czFmd1E6MzAxOTQzOTQ0NmU5NTE2ODVhN2M4NzdkYjg5YWM4YTk=');
                    sdk.postModelsModelidInferences(
                        {
                            parameters: {
                                type: 'txt2img',
                                prompt: `Minimal Abstract Art Toy, ${data.style}, ${data.color1}, ${data.color2}, ${data.words}`
                            }
                        },
                        {
                            modelId: 'caVLgv5XSlOF7vQTYQGwfg'
                        }
                    ).then(({ data }) => {
                        resolve(data);
                    }).catch(err => console.error);
                });

            let imageGenerationStatus = false;

            while (!imageGenerationStatus) {
                await wait(3000);

                let generation = await new Promise(async (resolve) => {
                    sdk.getModelsModelidInferencesInferenceid({modelId: 'caVLgv5XSlOF7vQTYQGwfg', inferenceId: imagesCreation.inference.id})
                        .then(({ data }) => {
                            resolve(data);
                        })
                        .catch(err => console.error(err));
                });

                let img = "https://miro.medium.com/max/700/1*CsJ05WEGfunYMLGfsT2sXA.gif";
                let attachment = null;
                let file = [];
                let img1Buffer;
                let img2Buffer;
                let img3Buffer;
                let img4Buffer;

                if(generation.inference.images.length >= 1) {
                    const canvas = createCanvas(1024, 1024);
                    const ctx = canvas.getContext('2d')

                    const img1b = createCanvas(1024, 1024)
                    const img2b = createCanvas(1024, 1024)
                    const img3b = createCanvas(1024, 1024)
                    const img4b = createCanvas(1024, 1024)

                    const ctxImg1b = img1b.getContext("2d")
                    const ctxImg2b = img2b.getContext("2d")
                    const ctxImg3b = img3b.getContext("2d")
                    const ctxImg4b = img4b.getContext("2d")

                    let generation1 = await loadImage(generation.inference.images[0].url);
                    let generation2 = await loadImage(generation.inference.images[1].url);
                    let generation3 = await loadImage(generation.inference.images[2].url);
                    let generation4 = await loadImage(generation.inference.images[3].url);

                    ctxImg1b.drawImage(generation1, 0, 0, 1024, 1024);
                    ctxImg2b.drawImage(generation2, 0, 0, 1024, 1024);
                    ctxImg3b.drawImage(generation3, 0, 0, 1024, 1024);
                    ctxImg4b.drawImage(generation4, 0, 0, 1024, 1024);

                    ctx.drawImage(generation1, 0, 512, 512, 512);
                    ctx.drawImage(generation2, 512, 512, 512, 512);
                    ctx.drawImage(generation3, 0, 0, 512, 512);
                    ctx.drawImage(generation4, 512, 0, 512, 512);

                    img1Buffer = img1b.toBuffer();
                    img2Buffer = img1b.toBuffer();
                    img3Buffer = img1b.toBuffer();
                    img4Buffer = img1b.toBuffer();

                    attachment = new AttachmentBuilder(canvas.toBuffer(), {name: "generation.png"});
                    file.push(attachment)
                    img = "attachment://generation.png"
                }


                await this.interaction.webhook.editMessage(interactionMessage.id,
                    {
                        ephemeral: true,
                        fetchReply: true,
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Generation")
                                .setColor("Blue")
                                .setDescription(`${this.interaction.user} The images are being generated. Please wait!`)
                                .setImage(img)
                                .addFields(
                                    stuff
                                )
                                .setFooter(
                                    {
                                        text: this.interaction.guild.name,
                                        iconURL: this.interaction.guild.iconURL()
                                    }
                                )
                                .setTimestamp()
                        ],
                        files: file
                    }
                ).then().catch(console.error);


                if(generation.inference.progress === 1) {
                    imageGenerationStatus = true;

                    await this.interaction.webhook.editMessage(interactionMessage.id,
                        {
                            ephemeral: true,
                            fetchReply: true,
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Generation")
                                    .setColor("Blue")
                                    .setDescription(`${this.interaction.user} The images are being generated. Please wait!`)
                                    .setImage(img)
                                    .addFields(
                                        stuff
                                    )
                                    .setFooter(
                                        {
                                            text: this.interaction.guild.name,
                                            iconURL: this.interaction.guild.iconURL()
                                        }
                                    )
                                    .setTimestamp()
                            ],
                            files: file,
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setStyle("Secondary")
                                            .setLabel("#1")
                                            .setCustomId("image1")
                                    )
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setStyle("Secondary")
                                            .setLabel("#2")
                                            .setCustomId("image2")
                                    )
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setStyle("Secondary")
                                            .setLabel("#3")
                                            .setCustomId("image3")
                                    )
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setStyle("Secondary")
                                            .setLabel("#4")
                                            .setCustomId("image4")
                                    )
                            ]
                        }
                    ).then(async (message) => {
                        this.db.connection().getConnection(async (err, conn) => {
                            if(err) throw err;

                            let UserProfile = await this.db.query(conn, `SELECT * FROM dc_creation_tokens WHERE user_id = "${this.interaction.user.id}"`);

                            let sql;
                            if(UserProfile.length >= 1) {
                                sql = `UPDATE dc_creation_tokens SET tokens = "${parseInt(UserProfile[0].tokens)-1}" WHERE user_id = "${this.interaction.user.id}"`;
                            } else {
                                sql = `INSERT INTO dc_creation_tokens (user_id, tokens) VALUES ("${this.interaction.user.id}", "4")`
                            }

                            await this.db.query(conn, sql);

                            const filter = (i) => i.user.id === this.interaction.user.id;

                            await this.interaction.channel.awaitMessageComponent({filter, time: 120_000})
                                .then(
                                    async (collected) => {
                                        await collected.deferUpdate().then().catch(console.error);
                                        await collected.deleteReply().then().catch(console.error);
                                        switch (collected.customId) {
                                            case "image1":
                                                await this.magnifyImage(img1Buffer, conn);
                                                break;
                                            case "image2":
                                                await this.magnifyImage(img2Buffer, conn);
                                                break;
                                            case "image3":
                                                await this.magnifyImage(img3Buffer, conn);
                                                break;
                                            case "image4":
                                                await this.magnifyImage(img4Buffer, conn);
                                                break;
                                        }
                                    }
                                )
                                .catch(console.error);

                            this.db.connection().releaseConnection(conn);
                        })
                    }).catch(console.error);
                }
            }
        }).catch(console.error);
    }

    async magnifyImage(img, conn) {
        let attachment = new AttachmentBuilder(img, {name: "generation.png"});
        await this.interaction.followUp(
            {
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setImage("attachment://generation.png")
                        .setColor("Blue")
                        .setDescription("Wonderful! Now you can go ahead and purchase your toy and nft! Hit the payment method you'd like to use.")
                ],
                files: [
                    attachment
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle("Primary")
                                .setLabel("Paypal")
                                .setEmoji("<:paypal:1077766385297522749>")
                                .setCustomId("paypal")
                        )
                ]
            }
        ).then(
            async (message) => {
                const filter = (i) => i.user.id === this.interaction.user.id;

                await this.interaction.channel.awaitMessageComponent({filter, time: 120_000})
                    .then(
                        async (collected) => {
                            switch (collected.customId) {
                                case "paypal":
                                    await this.paypalPayment(conn);
                                    break;
                            }
                        }
                    )
                    .catch(console.error);
            }
        ).catch(console.error);
    }

    async paypalPayment(conn) {

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

    async gatherUserInput() {
        return await new Promise(async (resolve) => {
            let data = {};

            data.style = await this.selectStyle()
            data.color1 = await this.selectColor("first");
            data.color2 = await this.selectColor("second");
            data.words = await this.typeWords();

            data = await this.summerUp(data);

            resolve(data)
        });
    }

    async summerUp(Data) {
        let data = Data;

        let proceed = false;

        while(!proceed) {
            await new Promise(async (resolve) => {
                let stuff = [
                    {
                        name: "Style",
                        value: `> **${data.style[0]}**`,
                        inline: true
                    },
                    {
                        name: `Primary Color`,
                        value: `> **${data.color1[0]}**`,
                        inline: true
                    },
                    {
                        name: '\u200B',
                        value: '\u200B',
                        inline: true
                    },
                    {
                        name: "Secondary Color",
                        value: `> **${data.color2[0]}**`,
                        inline: true
                    },
                    {
                        name: "Words",
                        value: `> **${data.words}**`,
                        inline: true
                    },
                    {
                        name: '\u200B',
                        value: '\u200B',
                        inline: true
                    },
                ]

                let embed =
                    new EmbedBuilder()
                        .setTitle("Summarize")
                        .setColor("Blue")
                        .setDescription(`${this.interaction.user} wonderful! Review the given info. You can edit them by clicking the proper button below.`)
                        .addFields(
                            stuff
                        )
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
                                .setLabel("Style")
                                .setCustomId("style")
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle("Primary")
                                .setLabel("Primary Color")
                                .setCustomId("color1")
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle("Primary")
                                .setLabel("Secondary Color")
                                .setCustomId("color2")
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle("Primary")
                                .setLabel("Words")
                                .setCustomId("words")
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle("Success")
                                .setLabel("Generate")
                                .setCustomId("generate")
                        )

                await this.interaction.followUp(
                    {
                        ephemeral: true,
                        embeds: [embed],
                        components: [component]
                    }
                ).then(async (interactionMessage) => {
                    const filter = (i) => i.user.id === this.interaction.user.id;

                    await interactionMessage.awaitMessageComponent({filter, time: 120_000})
                        .then(
                            async (collected) => {
                                await collected.deferUpdate().then().catch(console.error);
                                await collected.deleteReply().then().catch(console.error);

                                switch (collected.customId) {
                                    case "style":
                                        data.style = await this.selectStyle();
                                        resolve();
                                        break;
                                    case "color1":
                                        data.color1 = await this.selectStyle("first");
                                        resolve();
                                        break;
                                    case "color2":
                                        data.color2 = await this.selectColor("second");
                                        resolve();
                                        break;
                                    case "words":
                                        data.words = await this.typeWords();
                                        resolve();
                                        break;
                                    case "generate":
                                        await this.initNewGeneration(data);
                                        resolve(proceed = true);
                                        break;
                                }
                            }
                        )
                        .catch(
                            async () => {
                                await this.endCollector(1)
                            }
                        )

                }).catch(console.error)
            });
        }
    }

    async selectStyle() {
        return await new Promise(async (resolve) => {
            let styles = [
                {
                    label: "Kawaii",
                    value: "kawaii"
                },
                {
                    label: "Abstract",
                    value: "abstract"
                },
                {
                    label: "Fantasy",
                    value: "fantasy"
                },
                {
                    label: "Wildcard",
                    value: "wildcard"
                }
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

            await this.interaction.followUp(
                {
                    ephemeral: true,
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
                        async () => {
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
                    label: "Blue",
                    value: "blue"
                },
                {
                    label: "Red",
                    value: "red"
                },
                {
                    label: "Yellow",
                    value: "yellow"
                },
                {
                    label: "Pink",
                    value: "pink"
                },
                {
                    label: "Black",
                    value: "black"
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
                        async () => {
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

                let passed = true;

                while (passed) {
                    await new Promise(async (resolve2) => {
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

                                                let input = submission.fields.getTextInputValue("inputtedWords");
                                                input = input.slice().split(/ /);

                                                if(input.length === 2 || input.length === 1) {
                                                    await resolve2(passed = false)
                                                    await collected.deleteReply().then().catch(console.error);
                                                    await resolve(submission.fields.getTextInputValue("inputtedWords"))
                                                } else {
                                                    resolve2(passed = true)
                                                }

                                            }
                                        )
                                        .catch(
                                            async () => {
                                                await this.endCollector(1)
                                                await resolve2(passed = false)
                                            }
                                        );
                                }
                            )
                            .catch(
                                async () => {
                                    await this.endCollector(1)
                                }
                            )
                    });
                }
            }).catch(console.error);
        });
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

    async endCollector(type) {
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
}

module.exports = {
    ToyCreationManager
}