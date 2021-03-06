const { Client, Collection } = require("discord.js");
const Logger = require("@ayana/logger");
const config = require('../../config.json');
const functions = require("../constants/Functions.js");
const { MongoClient } = require('mongodb');
const Mongo = new MongoClient(config.tokens.mongo, { useNewUrlParser: true, useUnifiedTopology: true });
class ClientStructure extends Client {
    constructor(token, options) {
        super(options);
        this.token = token;
        this.commands = new Collection();
        this.aliases = new Collection();
        this.events = new Collection();
        this.settings = {
            color: this.token == config.tokens.development ? "#E6782B" : "#6283d9",
            disabledCommands: [],
        }
        this.func = functions;
        this.storage = {
            eval: new Map(),
            cooldown: new Collection()
        }

        this.db = {
            database: null,
            prices: null,
        }

        Mongo.connect(err => {
            if (err) return Logger.get("MongoConnect")
                .error(err);
            this.db.database = Mongo.db("ProjectAlpha")
                .collection("Database");
            this.db.prices = Mongo.db("ProjectAlpha")
                .collection("Prices");
        });
    }

    comp(comp) {
        if (comp == 'mongo') return this.db;
    }

    start() {
        this.login(this.token).catch(err => console.log(err));
    }
    
    utils(object, depth, consoled) {
        if (!consoled) consoled = false;
        if (isNaN(depth)) depth = 0;
        if (consoled) console.log(require('util').inspect(object, { depth }));
        return require('util').inspect(object, { depth });
    }

    async getEmoji(name, type) {
        let emoji = this.guilds.cache.get("731355261822042162").emojis.cache.find(emoji => emoji.name == name);
        if (!emoji) return;

        if (type == 'string') return `<:${emoji.name}:${emoji.id}>`;
        if (type == 'id') return emoji.id;
        if (type == 'name') return emoji.name;
        else return `<:${emoji.name}:${emoji.id}>`;
    }

    async fetchRank(data) {
        let rank = await data.monthlyPackageRank;
        if (!rank || rank == 'NONE') rank = await data.rank;
        else if (!rank || rank == 'NONE') rank = await data.newPackageRank;
        else if (!rank || rank == 'NONE') rank = await data.packageRank;
        else if (!rank || rank == 'NONE') rank == null;
        return rank;
    }

    async convertRank(data) {
        let rank = data.monthlyPackageRank;
        if (!rank || rank == 'NONE') rank = await data.rank;
        else if (!rank || rank == 'NONE') rank = await data.newPackageRank;
        else if (!rank || rank == 'NONE') rank = await data.packageRank;
        else if (!rank || rank == 'NONE') rank = 'NON';
        else if (!rank) rank = "NON";
        return rank == "PIG+++" ? "PIG+++" :
            rank == "OWNER" ? "Owner" : 
            rank == "ADMIN" ? "Admin" :
            rank == "BUILD TEAM" ? "Builder" :
            rank == "MODERATOR" ? "Moderator" :
            rank == "HELPER" ? "Helper" :
            rank == "JR HELPER" ? "Jr. Helper" :
            rank == "YOUTUBER" ? "Youtuber" :
            rank == "SUPERSTAR" ? "MVP++" :
            rank == "MVP_PLUS" ? "MVP+" :
            rank == "MVP" ? "MVP" :
            rank == "VIP_PLUS" ? "VIP+" :
            rank == "VIP" ? "VIP" : null;
    }

    async getMember(guild, mention) {
        if (!guild || !mention) return null;
        if (mention) {
            if (mention.length == 18) {
                return guild.members.cache.get(mention)
            } else if (guild.members.cache.find(m => m.user.tag === mention)) return guild.members.cache.find(m => m.user.tag === mention);
            else if (typeof(mention) === "string" && mention.startsWith("<@") && mention.endsWith(">")) {
                mention = mention.slice(2, -1);
                if (mention.startsWith("!")) mention = mention.slice(1);
                return guild.members.cache.get(mention) ? guild.members.cache.get(mention) : null;
            } else return null; 
        }
    };

    romanize(num) {
        if (!+num)
            return false;
        var digits = String(+num)
            .split(""),
            key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
             "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
             "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
            roman = "",
            i = 3;
        while (i--)
            roman = (key[+digits.pop() + (i * 10)] || "") + roman;
        return Array(+digits.join("") + 1)
            .join("M") + roman;
    };

    async getUser(mention) {
        if (!mention) return null;
        if (mention) {
            if (mention.length == 18) try { return await this.users.fetch(mention); } catch (e) { return null; }
            else if (typeof(mention) === "string" && mention.startsWith("<@") && mention.endsWith(">")) {
                mention = mention.slice(2, -1);
                if (mention.startsWith("!")) mention = mention.slice(1);
                try {
                    return await this.users.fetch(mention);
                } catch (e) { return null; }
            } else return null;
        }
    };

    async getChannel(guild, mention) {
        if (mention.length == 18) {
            return guild.channels.cache.get(mention) || null;
        } else if (mention.startsWith("<#") && mention.endsWith(">")) {
            mention = mention.slice(2, -1);
            return guild.channels.cache.get(mention) || null;
        } else if (guild.channels.cache.find(x => x.name == mention)) {
            return guild.channels.cache.find(x => x.name == mention) || null;
        } else return null;
    }
    
    async getRole(guild, mention) {
        if (mention.length == 18) {
            return guild.roles.cache.get(mention) || null;
        } else if (mention.startsWith("<@&") && mention.endsWith(">")) {
            mention = mention.slice(3, -1);
            return guild.roles.cache.get(mention) || null;
        } else if (guild.roles.cache.find(x => x.name == mention)) {
            return guild.roles.cache.find(x => x.name == mention) || null;
        } else return null;
    }
}

module.exports = { ClientStructure };