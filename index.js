const { ClientStructure } = require("./src/structures/ClientStructure.js");
const { CommandLoader } = require("./src/structures/CommandLoader.js");
const config = require('./config.json');
const Logger = require("@ayana/logger");
const client = new ClientStructure(config.tokens.main);
const DBL = require("dblapi.js");   
CommandLoader.loadCommands(client);
CommandLoader.loadEvents(client);
client.start();

Logger.get("indexjs").info("index.js Successfully Loaded.")

String.prototype.titleCase = function() {
    var splitStr = this.toLowerCase()
        .split(" ");
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] =
            splitStr[i].charAt(0)
            .toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(" ");
};

if (config.tokens.main == client.token) {
    try {
        const dbl = new DBL(config.tokens.DBL, client);
        dbl.on('posted', () => {
            Logger.get("top.gg").info(`Server Count Posted`);
        });
        
        String.prototype.getDBL = function() {
            return dbl;
        }
    } catch (e) {
        Logger.get("top.gg").info(`An error occured with DBL:\n${e}`);
    }
}


