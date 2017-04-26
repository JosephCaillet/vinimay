import {SequelizeWrapper} from '../utils/sequelizeWrapper';

(async () => {
	try {
		let name = await SequelizeWrapper.syncModels('alice', {force: true});
		console.log('Database', name, 'synchronised');
		process.exit(0);
	} catch(e) {
		throw e;
	}
})();
