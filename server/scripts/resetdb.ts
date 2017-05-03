import {SequelizeWrapper} from '../utils/sequelizeWrapper';

(async () => {
	let users = process.argv.slice(2, process.argv.length);
	for(let i in users) {
		let user = users[i];
		try {
			let name = await SequelizeWrapper.syncModels(user, {force: true});
			console.log('Database', name, 'synchronised');
			process.exit(0);
		} catch(e) {
			throw e;
		}
	}
})();
