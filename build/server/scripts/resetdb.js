"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelizeWrapper_1 = require("../utils/sequelizeWrapper");
(async () => {
    try {
        let name = await sequelizeWrapper_1.SequelizeWrapper.syncModels('alice', { force: true });
        console.log('Database', name, 'synchronised');
        process.exit(0);
    }
    catch (e) {
        throw e;
    }
})();
