"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelizeWrapper_1 = require("../utils/sequelizeWrapper");
(async () => {
    let users = process.argv.slice(2, process.argv.length);
    for (let i in users) {
        let user = users[i];
        try {
            let name = await sequelizeWrapper_1.SequelizeWrapper.syncModels(user, { force: true });
            console.log('Database', name, 'synchronised');
            process.exit(0);
        }
        catch (e) {
            throw e;
        }
    }
})();
