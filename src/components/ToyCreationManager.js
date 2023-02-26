//ToyCreationManager.js//
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder, Base, Attachment} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { Database } = require("../database/Database.js");
const fs = require("fs");
const sdk = require('api')('@scenario-api/v1.0#5lwpphle8jvsvf');
let Initiations = new Set();
const wait = require('util').promisify(setTimeout);
const { createCanvas, loadImage } = require('canvas')
const fetch = require('node-fetch');
const { request } = require('graphql-request');
const axios = require("axios")

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
            `CREATE TABLE IF NOT EXISTS dc_minted_nfts (user_id VARCHAR(30), image_link TEXT, paypal_order_id VARCHAR(255), hash VARCHAR(255), wallet VARCHAR(30), nftData TEXT, status VARCHAR(30))`,
        ];
    }

    async loadCommands() {
        return [
            new SlashCommandBuilder()
                .setName("toy")
                .setDescription("Create a new toy!"),
            new SlashCommandBuilder()
                .setName("mint")
                .setDescription("Something went wont with the toy/nft you bought? Mint it via the command.")
        ];
    }

    async on() {
        switch (this.interaction.commandName) {
            case "toy":
                await this.interaction.deferReply({ephemeral: true, fetchReply: true})
                    .then(async (message) => {
                        if(await this.checkCreationStatus()) {
                            await this.gatherUserInput(message.id);
                        } else {
                            await this.backToPreviousGeneration(message.id);
                        }
                    })
                    .catch(console.error);
                break;
            case "mint":
                await this.interaction.deferReply({ephemeral: true, fetchReply: true})
                    .then(async (message) => {
                        await this.mintInCaseOfIssue(message.id);
                    })
                    .catch(console.error);
                break;
        }
    }

    async mintInCaseOfIssue(messageId) {
        this.db.connection().getConnection(async (err, conn) => {
            if(err) throw err;

            let MintedNfts = await this.db.query(conn, `SELECT * FROM dc_minted_nfts WHERE user_id = "${this.interaction.user.id}"`);

            if(MintedNfts.length >= 1) {
                let embeds = []
                let attachment;
                let img;
                for (const [i, e] of MintedNfts.entries()) {
                    img = fs.readFileSync(__dirname + e.image_link);
                    attachment = new AttachmentBuilder(fs.readFileSync(__dirname + e.image_link), {name: `${e.paypal_order_id}.png`});

                    switch (e.status) {
                        case "PAYED":
                            embeds.push([
                                {
                                    ephemeral: true,
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor("Green")
                                            .setAuthor({name: `Page: ${i+1}/${MintedNfts.length}`})
                                            .setTitle("Payed")
                                            .addFields(
                                                {
                                                    name: `Order ID`,
                                                    value: `${"`" + e.paypal_order_id + "`"}`,
                                                    inline: true
                                                },
                                            )
                                            .setImage(`attachment://${e.paypal_order_id}.png`)
                                            .setFooter({text: this.interaction.guild.name, iconURL: this.interaction.guild.iconURL()})
                                    ],
                                    files: [attachment],
                                    components: [
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
                                            .addComponents(
                                                new ButtonBuilder()
                                                    .setLabel("Mint")
                                                    .setStyle("Success")
                                                    .setCustomId(`mint_${messageId}`)
                                            )
                                    ]
                                },
                                e
                            ]);
                            break;
                        case "MINTING":
                            embeds.push([
                                {
                                    ephemeral: true,
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor("Green")
                                            .setAuthor({name: `Page: ${i+1}/${MintedNfts.length}`})
                                            .setTitle("Minting")
                                            .setDescription("The nft is weather currently minting or had a problem. Please contact the support in case of issues.")
                                            .addFields(
                                                {
                                                    name: `Order ID`,
                                                    value: `> ${"`" + e.paypal_order_id + "`"}`,
                                                    inline: true
                                                },
                                                {
                                                    name: '\u200B',
                                                    value: '\u200B',
                                                    inline: true
                                                },
                                                {
                                                    name: '\u200B',
                                                    value: '\u200B',
                                                    inline: true
                                                },
                                            )
                                            .setImage(`attachment://${e.paypal_order_id}.png`)
                                            .setFooter({text: this.interaction.guild.name, iconURL: this.interaction.guild.iconURL()})
                                    ],
                                    files: [attachment],
                                    components: [
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
                            break;
                        case "MINTED":
                            embeds.push([
                                {
                                    ephemeral: true,
                                    embeds: [
                                        new EmbedBuilder()
                                            .setAuthor({name: `Page: ${i+1}/${MintedNfts.length}`})
                                            .setTitle("Minted NFT")
                                            .setColor("Green")
                                            .addFields(
                                                {
                                                    name: `Order ID`,
                                                    value: `${"`" + e.paypal_order_id + "`"}`,
                                                    inline: true
                                                },
                                                {
                                                    name: `NFT Viewer`,
                                                    value: `[Click Here](https://testnet.flowview.app/account/${e.wallet.address}/collection)`,
                                                    inline: true
                                                },
                                                {
                                                    name: `Wallet Address`,
                                                    value: `${"`" + e.wallet + "`"}`,
                                                    inline: false
                                                },
                                                {
                                                    name: `Hash`,
                                                    value: `${"`" + e.hash + "`"}`,
                                                    inline: false
                                                },
                                            )
                                            .setImage(`attachment://${e.paypal_order_id}.png`)
                                            .setFooter({text: this.interaction.guild.name, iconURL: this.interaction.guild.iconURL()})
                                    ],
                                    files: [attachment],
                                    components: [
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
                            break;
                    }
                }

                let pageIndex = 0;

                await this.interaction.webhook.editMessage(messageId, embeds[pageIndex][0])
                    .then(async (message) => {
                        while (Date.now() < Date.now()+300000) {
                            await new Promise(async (resolve) => {
                                let filterIds = [`right_${messageId}`, `left_${messageId}`, `mint_${messageId}`]
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
                                        case `mint_${messageId}`:
                                            let NftState = await this.db.query(conn, `SELECT * FROM dc_minted_nfts WHERE paypal_order_id = "${embeds[pageIndex][1].paypal_order_id}"`)
                                            
                                            if(NftState[0].status === "PAYED") {
                                                await this.interaction.webhook.deleteMessage(message.id).then().catch(console.error);

                                                let nftRawData = embeds[pageIndex][1].nftData;
                                                let nftUsableData = "";

                                                for (const e of nftRawData) {
                                                    nftUsableData += e.replace("'", '"');
                                                }

                                                nftUsableData = JSON.parse(nftUsableData);

                                                await collected.deferUpdate().then().catch(console.error);

                                                await this.nftManagment(conn, collected, nftUsableData, attachment, img, embeds[pageIndex][1].paypal_order_id);
                                            } else {
                                                await this.interaction.followUp(
                                                    {
                                                        ephemeral: true,
                                                        content: "Your nft is currently minting. Please wait."
                                                    }
                                                ).then().catch(console.error);
                                            }

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
                            .setDescription("You haven't minted / bought an nft/toy yet. Please purchase one. You'll then be able to see it here.")
                            .setColor("Red")
                            .setFooter(
                                {
                                    text: this.interaction.guild.name,
                                    iconURL: this.interaction.guild.iconURL()
                                }
                            )
                            .setTimestamp()
                    ]
                }).then().catch(console.error);
            }
            this.db.connection().releaseConnection(conn);
        });
    }

    async backToPreviousGeneration() {

    }

    async initNewGeneration(data, regeneration, messageId) {
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

        await this.interaction.webhook.editMessage(messageId,
            {
                ephemeral: true,
                fetchReply: true,
                embeds: [embed],
                components: []
            }
        ).then(async (interactionMessage) => {
            let imagesCreation = await this.pickStyle(data.style, data)

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

                    ctx.drawImage(generation1, 0, 0, 512, 512);
                    ctx.drawImage(generation2, 512, 0, 512, 512);
                    ctx.drawImage(generation3, 0, 512, 512, 512);
                    ctx.drawImage(generation4, 512, 512, 512, 512);

                    img1Buffer = img1b.toBuffer();
                    img2Buffer = img2b.toBuffer();
                    img3Buffer = img3b.toBuffer();
                    img4Buffer = img4b.toBuffer();

                    attachment = new AttachmentBuilder(canvas.toBuffer(), {name: "generation.png"});
                    file.push(attachment)
                    img = "attachment://generation.png"
                }

                await this.interaction.webhook.editMessage(messageId,
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

                    await this.interaction.webhook.editMessage(messageId,
                        {
                            ephemeral: true,
                            fetchReply: true,
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Generation")
                                    .setColor("Blue")
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
                                            .setCustomId(`image1_${messageId}`)
                                    )
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setStyle("Secondary")
                                            .setLabel("#2")
                                            .setCustomId(`image2_${messageId}`)
                                    )
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setStyle("Secondary")
                                            .setLabel("#3")
                                            .setCustomId(`image3_${messageId}`)
                                    )
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setStyle("Secondary")
                                            .setLabel("#4")
                                            .setCustomId(`image4_${messageId}`)
                                    )
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setEmoji("🔁")
                                            .setStyle("Secondary")
                                            .setCustomId(`regenerate_${messageId}`)
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

                            let filterIds = [`image1_${messageId}`, `image2_${messageId}`, `image3_${messageId}`, `image4_${messageId}`, `regenerate_${messageId}`]

                            const filter = (i) => i.user.id === this.interaction.user.id && filterIds.includes(i.customId);

                            await this.interaction.channel.awaitMessageComponent({filter})
                                .then(
                                    async (collected) => {

                                        switch (collected.customId) {
                                            case `image1_${messageId}`:
                                                await this.interaction.webhook.editMessage(messageId,
                                                    {
                                                        ephemeral: true,
                                                        fetchReply: true,
                                                        embeds: [
                                                            new EmbedBuilder()
                                                                .setTitle("Generation")
                                                                .setColor("Blue")
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
                                                        components: []
                                                    }
                                                ).then().catch(console.error);
                                                await this.magnifyImage(img1Buffer, conn, data);
                                                break;
                                            case `image2_${messageId}`:
                                                await this.interaction.webhook.editMessage(messageId,
                                                    {
                                                        ephemeral: true,
                                                        fetchReply: true,
                                                        embeds: [
                                                            new EmbedBuilder()
                                                                .setTitle("Generation")
                                                                .setColor("Blue")
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
                                                        components: []
                                                    }
                                                ).then().catch(console.error);
                                                await this.magnifyImage(img2Buffer, conn, data);
                                                break;
                                            case `image3_${messageId}`:
                                                await this.interaction.webhook.editMessage(messageId,
                                                    {
                                                        ephemeral: true,
                                                        fetchReply: true,
                                                        embeds: [
                                                            new EmbedBuilder()
                                                                .setTitle("Generation")
                                                                .setColor("Blue")
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
                                                        components: []
                                                    }
                                                ).then().catch(console.error);
                                                await this.magnifyImage(img3Buffer, conn, data);
                                                break;
                                            case `image4_${messageId}`:
                                                await this.interaction.webhook.editMessage(messageId,
                                                    {
                                                        ephemeral: true,
                                                        fetchReply: true,
                                                        embeds: [
                                                            new EmbedBuilder()
                                                                .setTitle("Generation")
                                                                .setColor("Blue")
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
                                                        components: []
                                                    }
                                                ).then().catch(console.error);

                                                await this.magnifyImage(img4Buffer, conn, data);
                                                break;
                                            case `regenerate_${messageId}`:
                                                await collected.deferUpdate().then().catch(console.error);

                                                await this.interaction.webhook.editMessage(messageId,
                                                    {
                                                        ephemeral: true,
                                                        fetchReply: true,
                                                        embeds: [
                                                            new EmbedBuilder()
                                                                .setTitle("Generation")
                                                                .setColor("Blue")
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
                                                        files: [],
                                                        components: []
                                                    }
                                                ).then().catch(console.error);

                                                await this.summerUp(data, true, messageId);
                                            break;
                                        }
                                    }
                                )
                                .catch(async (err) => {
                                    await this.endCollector(1);
                                });

                            this.db.connection().releaseConnection(conn);
                        })
                    }).catch(console.error);
                }
            }
        }).catch(console.error);
    }

    async pickStyle(style, data) {
        return await new Promise(async (resolve) => {
            let image;
            switch (style[0]) {
                case "headz":
                    image = fs.readFileSync(__dirname + "/../assets/images/styles/headz.png");

                    sdk.auth('Basic YXBpX0ljeWdJTGR0Unl1RlRIOVo4czFmd1E6MzAxOTQzOTQ0NmU5NTE2ODVhN2M4NzdkYjg5YWM4YTk=');
                    sdk.postModelsModelidInferences({
                        parameters: {
                            prompt: `Minimal Abstract Art Toy, ${data.color1}, ${data.color2}, ${data.words}`,
                            type: 'img2img',
                            image: "data:image/png;base64," + image.toString("base64"),
                            strength: 0.75,
                            guidance: 7,
                            numInferenceSteps: 30,
                            numSamples: 4,
                            width: 512,
                            height: 512
                        }
                    },
                        {modelId: 'caVLgv5XSlOF7vQTYQGwfg'}
                    )
                    .then(async ({ data }) => {
                        await resolve(data);
                    })
                    .catch(err => {
                        console.error(err)
                        resolve(err);
                    });
                    break;
                case "flowaii":
                    sdk.auth('Basic YXBpX0ljeWdJTGR0Unl1RlRIOVo4czFmd1E6MzAxOTQzOTQ0NmU5NTE2ODVhN2M4NzdkYjg5YWM4YTk=');
                    sdk.postModelsModelidInferences({
                            parameters: {
                                prompt: `Minimal Abstract Art Toy, ${data.color1}, ${data.color2}, ${data.words}`,
                                type: 'txt2img',
                                guidance: 4.5,
                                numInferenceSteps: 30,
                                numSamples: 4,
                                width: 512,
                                height: 512
                            }
                        },
                        {modelId: 'caVLgv5XSlOF7vQTYQGwfg'}
                    )
                        .then(async ({ data }) => {
                            await resolve(data);
                        })
                        .catch(err => {
                            console.error(err)
                            resolve(err);
                        });
                    break;
                case "shadow":
                    image = fs.readFileSync(__dirname + "/../assets/images/styles/headz.png");

                    sdk.auth('Basic YXBpX0ljeWdJTGR0Unl1RlRIOVo4czFmd1E6MzAxOTQzOTQ0NmU5NTE2ODVhN2M4NzdkYjg5YWM4YTk=');
                    sdk.postModelsModelidInferences({
                            parameters: {
                                prompt: `Minimal Abstract Art Toy, ${data.color1}, ${data.color2}, ${data.words}`,
                                type: 'img2img',
                                image: "data:image/png;base64," + image.toString("base64"),
                                strength: 0.75,
                                guidance: 7,
                                numInferenceSteps: 30,
                                numSamples: 4,
                                width: 512,
                                height: 512
                            }
                        },
                        {modelId: 'caVLgv5XSlOF7vQTYQGwfg'}
                    )
                        .then(async ({ data }) => {
                            await resolve(data);
                        })
                        .catch(err => {
                            console.error(err)
                            resolve(err);
                        });
                    break;
            }
        });

    }

    async magnifyImage(img, conn, data) {
        let access_token = await new Promise(async (resolve) => {
            const clientId = this.config.paypal.client_id;
            const clientSecret = this.config.paypal.client_secret;

            const url = 'https://api-m.sandbox.paypal.com/v1/oauth2/token';
            const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

            const options = {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'grant_type=client_credentials'
            };

            await fetch(url, options)
                .then(res => {
                    resolve(res.json())
                })
                .catch(err => console.error(err));
        });

        let order = await new Promise(async (resolve) => {
            const data = {
                "intent": "CAPTURE",
                "purchase_units": [
                    {
                        "items": [
                            {
                                "name": "Mind Toy",
                                "description": "Physical Art Toy - 55mm Delivered in 3/4 Weeks + Your Licence NFT",
                                "quantity": "1",
                                "unit_amount": {
                                    "currency_code": "USD",
                                    "value": "100.00"
                                }
                            }
                        ],
                        "amount": {
                            "currency_code": "USD",
                            "value": "100.00",
                            "breakdown": {
                                "item_total": {
                                    "currency_code": "USD",
                                    "value": "100.00"
                                }
                            }
                        }
                    }
                ],
                "application_context": {
                    "return_url": "https://discord.gg/Q54G4xTW",
                    "cancel_url": "https://discord.gg/Q54G4xTW"
                }
            }

            await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token.access_token}`,
                },
                body: JSON.stringify(data)
            })
                .then(async res => {
                    await resolve([await res.json(), data])
                })
                .catch(err => console.error(err));
        });

        let attachment = new AttachmentBuilder(img, {name: `${order[0].id}.png`});

        await this.interaction.followUp(
            {
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.avatarURL()})
                        .setImage(`attachment://${order[0].id}.png`)
                        .setColor("Blue")
                        .addFields(
                            {
                                name: `Order ID`,
                                value: `${order[0].id}`,
                                inline: true
                            },
                            {
                                name: `Name`,
                                value: `${order[1].purchase_units[0].items[0].name}`,
                                inline: true
                            },
                            {
                                name: `Description`,
                                value: `55mm Art Toy \n Delivered in 3/4 Weeks \n Your Licence NFT`,
                                inline: false
                            },
                            {
                                name: `Quantity`,
                                value: `1`,
                                inline: true
                            },
                            {
                                name: `Total`,
                                value: `${order[1].purchase_units[0].items[0].unit_amount.value} ${order[1].purchase_units[0].items[0].unit_amount.currency_code}`,
                                inline: true
                            },
                            {
                                name: "Status",
                                value: `Waiting 🟠`,
                                inline: true
                            }
                        )
                        .setDescription("**Nice one!** \n" +
                            "**Want as a PHYSICAL COLLECTIBLE!**\n" +
                            "**+ Exclusive NFT Licence on FLOW ?**" +
                            "Pay using Paypal below."
                        )
                        .setFooter(
                            {
                                text: this.interaction.guild.name,
                                iconURL: this.interaction.guild.iconURL()
                            }
                        )
                        .setTimestamp()
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle("Link")
                                .setLabel("Paypal")
                                .setEmoji("<:paypal:1077766385297522749>")
                                .setURL(order[0].links[1].href)
                        )
                ],
                files: [
                    attachment
                ]
            }
        ).then(async (message) => {
            let orderStatus = "Waiting";

            while (orderStatus !== "CREATED") {
                await wait(2000);

                let status = await new Promise(async (resolve) => {
                    const orderId = order[0].id;
                    const accessToken = access_token.access_token;
                    const apiUrl = `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`;

                    await fetch(apiUrl, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        resolve(response.json());
                    })
                    .catch(error => console.error(error));
                })


                if(status.status === "APPROVED") {
                    orderStatus = "APPROVED";

                    fs.writeFileSync(__dirname + `/../assets/images/nfts/minted/${order[0].id}.png`, img)

                    let dataStr = JSON.stringify(data);
                    let dataToDb = "";

                    for(const e of dataStr) {
                        dataToDb += e.replace('"', "'");
                    }

                    await this.db.query(conn, `INSERT INTO dc_minted_nfts (user_id, image_link, paypal_order_id, nftData, status) VALUES ("${this.interaction.user.id}", "${`/../assets/images/nfts/minted/${order[0].id}.png`}", "${order[0].id}", "${dataToDb}", "PAYED")`)

                    await this.interaction.webhook.editMessage(message.id,{
                        ephemeral: true,
                        embeds: [
                            new EmbedBuilder()
                                .setImage(`attachment://${order[0].id}.png`)
                                .setColor("Green")
                                .addFields(
                                    {
                                        name: `Order ID`,
                                        value: `${order[0].id}`,
                                        inline: true
                                    },
                                    {
                                        name: `Name`,
                                        value: `${order[1].purchase_units[0].items[0].name}`,
                                        inline: true
                                    },
                                    {
                                        name: `Description`,
                                        value: `${order[1].purchase_units[0].items[0].description}`,
                                        inline: false
                                    },
                                    {
                                        name: `Quantity`,
                                        value: `1`,
                                        inline: true
                                    },
                                    {
                                        name: `Total`,
                                        value: `${order[1].purchase_units[0].items[0].unit_amount.value} ${order[1].purchase_units[0].items[0].unit_amount.currency_code}`,
                                        inline: true
                                    },
                                    {
                                        name: "Status",
                                        value: `Approved 🟢`,
                                        inline: true
                                    }
                                )
                                .setFooter(
                                    {
                                        text: this.interaction.guild.name,
                                        iconURL: this.interaction.guild.iconURL()
                                    }
                                )
                                .setTimestamp()
                                .setDescription("> Congratulation! Now hit mint in order to get your nft.")
                        ],
                        components: [
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setLabel("Mint")
                                        .setStyle("Success")
                                        .setCustomId(`mint_${message.id}`)
                                )
                        ]
                    }).then(
                        async (collected) => {
                            const filter = (i) => i.user.id === this.interaction.user.id && i.customId === `mint_${message.id}`;

                            await this.interaction.channel.awaitMessageComponent({filter})
                                .then(
                                    async (collected) => {

                                        await this.interaction.webhook.editMessage(message.id,{
                                            ephemeral: true,
                                            embeds: [
                                                new EmbedBuilder()
                                                    .setImage(`attachment://${order[0].id}.png`)
                                                    .setColor("Green")
                                                    .addFields(
                                                        {
                                                            name: `Order ID`,
                                                            value: `${order[0].id}`,
                                                            inline: true
                                                        },
                                                        {
                                                            name: `Name`,
                                                            value: `${order[1].purchase_units[0].items[0].name}`,
                                                            inline: true
                                                        },
                                                        {
                                                            name: `Description`,
                                                            value: `${order[1].purchase_units[0].items[0].description}`,
                                                            inline: false
                                                        },
                                                        {
                                                            name: `Quantity`,
                                                            value: `1`,
                                                            inline: true
                                                        },
                                                        {
                                                            name: `Total`,
                                                            value: `${order[1].purchase_units[0].items[0].unit_amount.value} ${order[1].purchase_units[0].items[0].unit_amount.currency_code}`,
                                                            inline: true
                                                        },
                                                        {
                                                            name: "Status",
                                                            value: `Approved 🟢`,
                                                            inline: true
                                                        }
                                                    )
                                                    .setFooter(
                                                        {
                                                            text: this.interaction.guild.name,
                                                            iconURL: this.interaction.guild.iconURL()
                                                        }
                                                    )
                                                    .setTimestamp()
                                                    .setDescription("> Congratulation! Now hit mint in order to get your nft.")
                                            ],
                                            components: []
                                        }).then().catch(console.error);

                                        switch (collected.customId) {
                                            case `mint_${message.id}`:
                                                await collected.deferUpdate().then().catch(console.error);
                                                await this.nftManagment(conn, collected, data, attachment, img, order[0].id);
                                                break;
                                        }
                                    }
                                )
                                .catch(console.error);
                        }
                    ).catch(
                        (err) => {

                        }
                    )

                }
            }
        }).catch(console.error);
    }

    async nftManagment(conn, collected, nftData, attachment, img, orderId) {

        await this.db.query(conn, `UPDATE dc_minted_nfts SET status = "MINTING" WHERE paypal_order_id = "${orderId}"`);

        await this.interaction.followUp(
            {
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Minting")
                        .setColor("Blue")
                        .setDescription("We are minting your nft! Please wait.")
                        .setImage(`attachment://${orderId}.png`)
                        .setFooter({text: this.interaction.guild.name, iconURL: this.interaction.guild.iconURL()})
                        .setTimestamp()
                ],
                components: [],
                files: [
                    attachment
                ]
            }
        ).then(
            async (message) => {
                const endpoint = 'https://graphql.api.staging.niftory.com/';
                const api_key = this.config.niftory.api_key;
                const client_secret = this.config.niftory.client_secret;

                let createContent = await new Promise(async (resolve) => {
                    const query = `
                        mutation UploadNFTContent($name: String!, $description: String) {
                            uploadNFTContent(name: $name, description: $description) {
                                id
                                files {
                                    id
                                    state
                                    name
                                    url
                                }
                                poster {
                                    id
                                    state
                                    url
                                }
                            }
                        }
                    `;

                    const headers = {
                        'X-Niftory-API-Key': api_key,
                        'X-Niftory-Client-Secret': client_secret
                    };

                    let variables = {
                        "name": "generation",
                        "description": "this is the generated toy.",
                    }

                    await request(endpoint, query, variables, headers).then(async (data) => {
                        await resolve(data.uploadNFTContent);
                    });
                });

                let contentId = createContent.id;

                let image = await new Promise(async (resolve) => {
                    let file = img;
                    let poster = fs.readFileSync("src/assets/images/nfts/flowaii.png")

                    await axios.put(createContent.files[0].url, file, {headers: {"Content-Type": ""}})
                        .then()
                        .catch(console.error);

                    await axios.put(createContent.poster.url, poster, {headers: {"Content-Type": ""}})
                        .then()
                        .catch(console.error);

                    resolve();
                });

                let nftModel = await new Promise(async (resolve) => {
                    const query = `
                        mutation CreateModel($setId: ID!, $data: NFTModelCreateInput!) {
                            createNFTModel(setId: $setId, data: $data) {
                                id
                                quantity
                                title
                                attributes
                            }
                        }            
                    `;

                    const headers = {
                        'X-Niftory-API-Key': api_key,
                        'X-Niftory-Client-Secret': client_secret
                    };

                    const variables = {
                        "setId": "1b039a39-9008-45c9-b11f-e5827befb642",
                        "data": {
                            "title": `Flowaii`,
                            "description": "This NFT represents an exclusive licence to manufacture this Floawaii art toy",
                            "quantity": 1,
                            "contentId": contentId,
                            "metadata": {
                                "rarity": "RARE",
                                "number": 1,
                                "Style": nftData.style,
                                "Words": nftData.words,
                                "Primary_Color": nftData.color1,
                                "Secondary_Color": nftData.color2,
                                "Artist": nftData.artist,
                            }
                        }
                    }

                    await request(endpoint, query, variables, headers).then(async (data) => {
                        await resolve(data);
                    });
                });

                let mintNFT = await new Promise(async (resolve) => {
                    const query = `
                        mutation mintNFTModel($id: ID!, $quantity: PositiveInt) {
                            mintNFTModel(id: $id, quantity: $quantity) {
                                id
                                quantity
                                quantityMinted
                                nfts {
                                    blockchainState
                                    id
                                    blockchainId
                                    serialNumber
                                    transactions {
                                        blockchain
                                        hash
                                        name
                                    }
                                }
                            }
                        }
                    `;

                    const headers = {
                        'X-Niftory-API-Key': api_key,
                        'X-Niftory-Client-Secret': client_secret
                    };

                    const variables = {
                        "id": nftModel.createNFTModel.id,
                        "quantity": 1
                    }

                    await request(endpoint, query, variables, headers).then(async (data) => {
                        await resolve(data);
                    });
                });

                let mintedNft = await new Promise(async (resolve) => {
                    const query = `
                        query nftModel($id: ID!) {
                          nftModel(id: $id) {
                              id
                              quantity
                              quantityMinted
                              nfts {
                                  blockchainState
                                  id
                                  blockchainId
                                  serialNumber
                                  transactions {
                                      blockchain
                                      hash
                                      name
                                  }
                              }
                          }
                        }
                    `;

                    const headers = {
                        'X-Niftory-API-Key': api_key,
                        'X-Niftory-Client-Secret': client_secret
                    };

                    const variables = {
                        "id": mintNFT.mintNFTModel.id
                    }

                    let isMinted = false
                    while(!isMinted) {
                        await wait(3000);
                        await request(endpoint, query, variables, headers).then(async (data) => {
                            if(data.nftModel.nfts[0].blockchainState === "MINTED") {
                                isMinted = true;
                                await resolve(data);
                            }
                        });
                    }
                });

                let wallet = await new Promise(async (resolve) => {
                    const query = `
                        mutation CreateWallet {
                            createNiftoryWallet {
                                id
                                address
                                state
                            }
                        }
                    `;

                    const headers = {
                        'X-Niftory-API-Key': api_key,
                        'X-Niftory-Client-Secret': client_secret
                    };

                    const variables = {};

                    await request(endpoint, query, variables, headers).then(async (data) => {
                        await resolve(data);
                    });
                });

                let retrieveWallet = await new Promise(async (resolve) => {
                    const query = `
                        query WalletById($id: ID!) {
                            walletById(id: $id) {
                                id
                                address
                                state
                            }
                        }
                    `;

                    const headers = {
                        'X-Niftory-API-Key': api_key,
                        'X-Niftory-Client-Secret': client_secret
                    };

                    const variables = {
                        id: wallet.createNiftoryWallet.id
                    };

                    let isWalletCreated = false;

                    while (!isWalletCreated) {
                        await wait(3000)
                        await request(endpoint, query, variables, headers).then(async (data) => {
                            if(data.walletById.state === "READY") {
                                isWalletCreated = true;
                                await resolve(data);
                            }
                        });
                    }
                });

                let transferNft = await new Promise(async (resolve) => {
                    const query = `
                        mutation Transfer($address: String, $nftModelId: ID) {
                            transfer(address: $address, nftModelId: $nftModelId) {
                                id
                                status
                                model {
                                    id
                                    title
                                }
                            }
                        }
                    `;

                    const headers = {
                        'X-Niftory-API-Key': api_key,
                        'X-Niftory-Client-Secret': client_secret
                    };

                    const variables = {
                        "nftModelId": mintNFT.mintNFTModel.id,
                        "address": retrieveWallet.walletById.address,
                    };


                    await request(endpoint, query, variables, headers).then(async (data) => {
                        await resolve(data);
                    });
                });

                let mintedNftInfo = await new Promise(async (resolve) => {
                    const query = `
                        query nftQuery($id: ID!) {
                          nft(id: $id) {
                            blockchainState
                            id
                            blockchainId
                            serialNumber
                            transactions {
                                blockchain
                                hash
                                name
                            }
                          }
                        }
                    `
                    const headers = {
                        'X-Niftory-API-Key': api_key,
                        'X-Niftory-Client-Secret': client_secret
                    };

                    const variables = {
                        id: mintedNft.nftModel.nfts[0].id
                    };

                    await request(endpoint, query, variables, headers).then(async (data) => {
                        await resolve(data);
                    });
                });

                await this.db.query(conn, `UPDATE dc_minted_nfts SET hash = "${mintedNftInfo.nft.transactions[0].hash}", wallet = "${retrieveWallet.walletById.address}", status = "MINTED" WHERE paypal_order_id = "${orderId}"`);

                await this.interaction.webhook.editMessage(message.id,
                    {
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Minted")
                                .setURL(`https://testnet.flowscan.org/account/${retrieveWallet.walletById.address}`)
                                .setColor("Green")
                                .setDescription("Your nft has been successfully minted! You will be able to withdraw the nft soon. We are working on it!")
                                .addFields(
                                    {
                                        name: "Nft Viewer",
                                        value: `[Click Here](https://testnet.flowview.app/account/${retrieveWallet.walletById.address}/collection)`,
                                        inline: false
                                    },
                                    {
                                        name: "Wallet Address",
                                        value: `${"`" + retrieveWallet.walletById.address + "`"}`,
                                        inline: false
                                    },
                                    {
                                        name: "Hash",
                                        value: `${"`" + mintedNftInfo.nft.transactions[0].hash + "`"}`,
                                        inline: false
                                    },

                                )
                                .setImage(`attachment://${orderId}.png`)
                                .setFooter({text: this.interaction.guild.name, iconURL: this.interaction.guild.iconURL()})
                                .setTimestamp()
                        ],
                        component: [],
                        files: [
                            attachment
                        ]
                    }
                ).then().catch(console.error);
            }
        ).catch(console.error);
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
                    await this.db.query(conn, `INSERT INTO dc_creation_tokens (user_id, tokens) VALUES ("${this.interaction.user.id}", "1000")`);
                    hasToken = true;
                }

                this.db.connection().releaseConnection(conn)

                resolve(hasToken)
            });
        });
    }

    async gatherUserInput(messageId) {
        return await new Promise(async (resolve) => {
            let data = {};

            data.style = await this.selectStyle(messageId)
            data.color1 = await this.selectColor("first", messageId);
            data.color2 = await this.selectColor("second", messageId);
            data.words = await this.typeWords(messageId);

            data = await this.summerUp(data, null, messageId);

            resolve(data)
        });
    }

    async summerUp(Data, regeneration, messageId) {
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
                                .setCustomId(`style_${messageId}`)
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle("Primary")
                                .setLabel("Primary Color")
                                .setCustomId(`color1_${messageId}`)
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle("Primary")
                                .setLabel("Secondary Color")
                                .setCustomId(`color2_${messageId}`)
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle("Primary")
                                .setLabel("Words")
                                .setCustomId(`words_${messageId}`)
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle("Success")
                                .setLabel("Generate")
                                .setCustomId(`generate_${messageId}`)
                        )

                await this.interaction.webhook.editMessage(messageId,
                    {
                        ephemeral: true,
                        embeds: [embed],
                        components: [component]
                    }
                ).then(async (interactionMessage) => {
                    const filterIds = [`style_${messageId}`, `color1_${messageId}`, `color2_${messageId}`, `words_${messageId}`, `generate_${messageId}`]

                    const filter = (i) => i.user.id === this.interaction.user.id && filterIds.includes(i.customId);

                    await interactionMessage.awaitMessageComponent({filter, time: 120_000})
                        .then(
                            async (collected) => {
                                await collected.deferUpdate().then().catch(console.error);

                                switch (collected.customId) {
                                    case `style_${messageId}`:
                                        data.style = await this.selectStyle(messageId);
                                        resolve();
                                        break;
                                    case `color1_${messageId}`:
                                        data.color1 = await this.selectColor("first", messageId);
                                        resolve();
                                        break;
                                    case `color2_${messageId}`:
                                        data.color2 = await this.selectColor("second", messageId);
                                        resolve();
                                        break;
                                    case `words_${messageId}`:
                                        data.words = await this.typeWords(messageId);
                                        resolve();
                                        break;
                                    case `generate_${messageId}`:
                                        await this.initNewGeneration(data, regeneration, messageId);
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

    async selectStyle(messageId) {
        return await new Promise(async (resolve) => {
            let styles = [
                {
                    label: "Headz",
                    value: "headz"
                },
                {
                    label: "Flowaii",
                    value: "flowaii"
                }
            ]

            let embed =
                new EmbedBuilder()
                    .setTitle("Style")
                    .setColor("Blue")
                    .setDescription(`${this.interaction.user}, select the style you wish for the toy in the selection below!`)
                    .setFooter({text: this.interaction.guild.name, iconURL: this.interaction.guild.iconURL()})
                    .setTimestamp()

            let component =
                new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setPlaceholder("Nothing Selected")
                            .setOptions(styles)
                            .setCustomId(`style_selection_${messageId}`)
                    )

            await this.interaction.webhook.editMessage(messageId,
                {
                    ephemeral: true,
                    embeds: [embed],
                    components: [component]
                }
            ).then(async (interactionMessage) => {
                const filter = (i) => i.customId === `style_selection_${messageId}` && i.user.id === this.interaction.user.id;

                await interactionMessage.awaitMessageComponent({filter, time: 120_000})
                    .then(
                        async (collected) => {
                            await collected.deferUpdate().then().catch(console.error);
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

    async selectColor(pos, messageId) {
        return await new Promise(async (resolve) => {
            let colors = [];

            switch (pos) {
                case "first":
                    colors = [
                        {
                            label: "Red",
                            value: "Red"
                        },
                        {
                            label: "Crimson",
                            value: "Crimson"
                        },
                        {
                            label: "Cherry Red",
                            value: "Cherry Red"
                        },
                        {
                            label: "Scarlet",
                            value: "Scarlet"
                        },
                        {
                            label: "Burnt Sienna",
                            value: "Burnt Sienna"
                        },
                        {
                            label: "Orange",
                            value: "Orange"
                        },
                        {
                            label: "Tangerine",
                            value: "Tangerine"
                        },
                        {
                            label: "Burnt Orange",
                            value: "Burnt Orange"
                        },
                        {
                            label: "Peach",
                            value: "Peach"
                        },
                        {
                            label: "Yellow",
                            value: "Yellow"
                        },
                        {
                            label: "Lemon Yellow",
                            value: "Lemon Yellow"
                        },
                        {
                            label: "Canary Yellow",
                            value: "Canary Yellow"
                        },
                        {
                            label: "Golden Yellow",
                            value: "Golden Yellow"
                        },
                        {
                            label: "Lime Green",
                            value: "Lime Green"
                        },
                        {
                            label: "Forest Green",
                            value: "Forest Green"
                        },
                        {
                            label: "Olive Green",
                            value: "Olive Green"
                        },
                        {
                            label: "Teal",
                            value: "Teal"
                        },
                        {
                            label: "Aqua",
                            value: "Aqua"
                        },
                        {
                            label: "Light Blue",
                            value: "Light Blue"
                        },
                        {
                            label: "Royal Blue",
                            value: "Royal Blue"
                        },
                        {
                            label: "Navy Blue",
                            value: "Navy Blue"
                        },
                        {
                            label: "Lavender",
                            value: "Lavender"
                        },
                        {
                            label: "Violet",
                            value: "Violet"
                        },
                        {
                            label: "Magenta",
                            value: "Magenta"
                        },
                        {
                            label: "Pink",
                            value: "Pink"
                        }
                    ];
                    break;
                case "second":
                    colors = [
                        {
                            label: "Red",
                            value: "Red",
                        },
                        {
                            label: "Crimson",
                            value: "Crimson",
                        },
                        {
                            label: "Cherry Red",
                            value: "Cherry Red",
                        },
                        {
                            label: "Scarlet",
                            value: "Scarlet",
                        },
                        {
                            label: "Burnt Sienna",
                            value: "Burnt Sienna",
                        },
                        {
                            label: "Orange",
                            value: "Orange",
                        },
                        {
                            label: "Tangerine",
                            value: "Tangerine",
                        },
                        {
                            label: "Burnt Orange",
                            value: "Burnt Orange",
                        },
                        {
                            label: "Peach",
                            value: "Peach",
                        },
                        {
                            label: "Yellow",
                            value: "Yellow",
                        },
                        {
                            label: "Lemon Yellow",
                            value: "Lemon Yellow",
                        },
                        {
                            label: "Canary Yellow",
                            value: "Canary Yellow",
                        },
                        {
                            label: "Golden Yellow",
                            value: "Golden Yellow",
                        },
                        {
                            label: "Lime Green",
                            value: "Lime Green",
                        },
                        {
                            label: "Forest Green",
                            value: "Forest Green",
                        },
                        {
                            label: "Olive Green",
                            value: "Olive Green",
                        },
                        {
                            label: "Teal",
                            value: "Teal",
                        },
                        {
                            label: "Aqua",
                            value: "Aqua",
                        },
                        {
                            label: "Light Blue",
                            value: "Light Blue",
                        },
                        {
                            label: "Royal Blue",
                            value: "Royal Blue",
                        },
                        {
                            label: "Navy Blue",
                            value: "Navy Blue",
                        },
                        {
                            label: "Lavender",
                            value: "Lavender",
                        },
                        {
                            label: "Violet",
                            value: "Violet",
                        },
                        {
                            label: "Magenta",
                            value: "Magenta",
                        },
                        {
                            label: "Pink",
                            value: "Pink",
                        }
                    ]
                    break;
            }

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
                            .setCustomId(`color_selection_${messageId}`)
                    )

            await this.interaction.webhook.editMessage(messageId,
                {
                    ephemeral: true,
                    embeds: [embed],
                    components: [component]
                }
            ).then(async (interactionMessage) => {
                const filter = (i) => i.customId === `color_selection_${messageId}` && i.user.id === this.interaction.user.id;

                await interactionMessage.awaitMessageComponent({filter, time: 120_000})
                    .then(
                        async (collected) => {
                            await collected.deferUpdate().then().catch(console.error);
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

    async typeWords(messageId) {
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
                            .setCustomId(`input_words_${messageId}`)
                    )

            await this.interaction.webhook.editMessage(messageId,
                {
                    ephemeral: true,
                    embeds: [embed],
                    components: [component]
                }
            ).then(async (interactionMessage) => {
                const filter = (i) => i.customId === `input_words_${messageId}` && i.user.id === this.interaction.user.id;

                let passed = true;

                while (passed) {
                    await new Promise(async (resolve2) => {
                        await interactionMessage.awaitMessageComponent({filter, time: 120_000})
                            .then(
                                async (collected) => {
                                    const modal = new ModalBuilder()
                                        .setCustomId(`words_${messageId}`)
                                        .setTitle('Words');

                                    const wordsInput = new TextInputBuilder()
                                        .setCustomId(`inputtedWords_${messageId}`)
                                        .setLabel("What will be the generation words?")
                                        .setStyle(TextInputStyle.Short);

                                    const firstActionRow = new ActionRowBuilder().addComponents(wordsInput);
                                    modal.addComponents(firstActionRow);


                                    await collected.showModal(modal).then().catch(console.error);
                                    const filter = (interaction) => interaction.customId === `words_${messageId}`;

                                    collected.awaitModalSubmit({ filter, time: 120_000 })
                                        .then(
                                            async (submission) => {
                                                await submission.deferUpdate().then().catch(console.error);

                                                let input = submission.fields.getTextInputValue(`inputtedWords_${messageId}`);
                                                input = input.slice().split(/ /);

                                                let words = [];
                                                for(const e of input) {
                                                    if(e !== "") {
                                                        words.push(e);
                                                    }
                                                }

                                                if(words.length === 2 || words.length === 1) {
                                                    await resolve2(passed = false)
                                                    await resolve(submission.fields.getTextInputValue(`inputtedWords_${messageId}`))
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

    async displayErrorMessage(type, messageId) {
        let msg;

        switch (type) {
            case 1:
                msg = `${this.interaction.user}, you took too much time to interact with the toy creation. No token have been used.`
                Initiations.delete(this.interaction.user.id);
                break;
            case 2:
                msg = `${this.interaction.user}, You've already started creating a toy. Please finish the creation or wait 2 minutes.`;

                setTimeout(() => {
                    Initiations.delete(this.interaction.user.id);
                }, 120000)

                break;
        }

        await this.interaction.webhook.editMessage(messageId,
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

