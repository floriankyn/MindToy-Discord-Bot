//SQLTablesManager.js// -- Created By Florian Lepage
const { Database } = require("../database/Database.js");

class SQLTablesManager{
    constructor(config, modules) {
        this.config = config;
        this.modules = modules;
        this.db = new Database(config);
    }

    async loadTables() {
        let modules = [];

        this.modules.forEach((e) => {
            modules.push(
                new e(null, null, null).loadTables()
            )
        });

        this.db.connection().getConnection(async (err, conn) => {
            if(err) throw err;

            for(const m of modules) {
                for(const e of m) {
                    await this.db.query(conn, e);
                };
            }

            this.db.connection().releaseConnection(conn);
        });
    }
}

module.exports = {
    SQLTablesManager
}