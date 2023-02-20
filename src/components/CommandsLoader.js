//CommandsLoader.js// -- Created By Florian Lepage
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const cache = [];

class CommandsLoader{
    constructor(client, modules, config) {
        this.client = client;
        this.modules = modules
        this.config = config;
    }

    async loadCommands() {
        const { REST, Routes } = require('discord.js');

        const commands = [];

        for(const e of this.modules) {
            for(const i of await new e(null, this.client, this.config).loadCommands()) {
                commands.push(i)
                cache.push(i);
            }
        };

        const rest = new REST({ version: '10' }).setToken(this.config.discord.token);

        try {
            await rest.put(Routes.applicationGuildCommands(this.client.user.id, this.config.discord.guild_id), { body: commands });
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }

    }

    async refreshCommands(data = {name: null, choices: null, type: null}) { // true = add / false = remove
        const { REST, Routes } = require('discord.js');

        cache.forEach((e) => {
            if(e.options.some(fn => fn.name === data.name)) {
                if(data.type) {
                    e.options.find(fn => fn.name === data.name).choices.push(data.choices[0])
                } else {
                    let array = e.options.find(fn => fn.name === data.name).choices;
                    let dataToSearch = data.choices[0]
                    const testFnc = (element) => element.name === dataToSearch.name;
                    let finalIndex = array.findIndex(testFnc);


                    e.options.find(fn => fn.name === data.name).choices
                        .splice(
                            finalIndex,
                            1
                        );
                }
            }
        });

        const commands = cache;

        const rest = new REST({ version: '10' }).setToken(this.config.discord.token);

        try {
            await rest.put(Routes.applicationGuildCommands(this.client.user.id, this.config.discord.guild_id), { body: commands });
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }

    }
}

module.exports = {
    CommandsLoader
}