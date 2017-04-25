import * as s from 'sequelize';

// Load Sequelize module
const Sequelize: s.SequelizeStatic	= require('sequelize');

interface Instances {
	[name: string]: s.Sequelize
}

// Wrapper to singleton-ise Sequelize
export class SequelizeWrapper {
	private static instances: Instances;
	private static sync: boolean = false;

	public static getInstance(name: string): s.Sequelize {
		if(!this.instances) {
			this.instances = new Object() as Instances;
		}
		if(!this.instances[name]) {
			let instance: s.Sequelize = new Sequelize(name, '', '', <s.Options>{
				dialect: 'sqlite',
				logging: false,
				define: <s.DefineOptions<any>>{
					timestamps: false
				},
				storage: __dirname + '/../../../db/' + name + '.db'
			});
			
			// Load and define Sequelize models
			instance.define('post', require('../models/post'), { freezeTableName: true });
			instance.define('friend', require('../models/friend'), { freezeTableName: true });
			instance.define('comment', require('../models/comment'), { freezeTableName: true });
			instance.define('profile', require('../models/profile'), { freezeTableName: true });
			instance.define('reaction', require('../models/reaction'), { freezeTableName: true });
			instance.define('user', require('../models/user'), { freezeTableName: true });
			
			this.instances[name] = instance;
		}

		return this.instances[name];
	}

	// Will only be called by the sync script
	public static async syncModels(name: string, params?: s.SyncOptions) {
		let instance = this.getInstance(name);
		
		try{
			await instance.sync(params)
		} catch(err) {
			console.error(err);
		}

		console.info('Database', name, 'synchronised');
		this.sync = true;
		return;
	}
	
	public static isSync(): boolean {
		return this.sync;
	}
}