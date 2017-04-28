import * as s from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';

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
			let dbRoot = path.resolve('./db');
			let files = fs.readdirSync(dbRoot);
			files = files.filter(file => file.match(/\.db$/))

			if(files.indexOf(name + '.db') < 0) {
				throw new Error('UNKNOWN_USER');
			}

			let instance: s.Sequelize = new Sequelize(name, '', '', <s.Options>{
				dialect: 'sqlite',
				logging: false,
				define: <s.DefineOptions<any>>{
					timestamps: false
				},
				storage: path.join(__dirname, '/../../../db/', name + '.db')
			});
			
			// Load and define Sequelize models
			instance.define('post', require('../models/sequelize/post'), { freezeTableName: true });
			instance.define('friend', require('../models/sequelize/friend'), { freezeTableName: true });
			instance.define('comment', require('../models/sequelize/comment'), { freezeTableName: true });
			instance.define('profile', require('../models/sequelize/profile'), { freezeTableName: true });
			instance.define('reaction', require('../models/sequelize/reaction'), { freezeTableName: true });
			instance.define('user', require('../models/sequelize/user'), { freezeTableName: true });

			// Detail the association between a friend and its local profile
			instance.model('friend').belongsTo(instance.model('profile'), {
				foreignKey: 'username',
				targetKey: 'username'
			});
			instance.model('friend').belongsTo(instance.model('profile'), {
				foreignKey: 'url',
				targetKey: 'url'
			});
			// Detail the association between an user and its profile
			instance.model('user').belongsTo(instance.model('profile'), {
				foreignKey: 'username',
				targetKey: 'username'
			});
			instance.model('user').belongsTo(instance.model('profile'), {
				foreignKey: 'url',
				targetKey: 'url'
			});
			

			this.instances[name] = instance;
		}

		return this.instances[name];
	}

	// Will only be called by the sync script
	public static syncModels(name: string, params?: s.SyncOptions): Promise<any> {
		let instance = this.getInstance(name);
		
		return new Promise((ok, ko) => {
			instance.sync(params).then(() => {
				this.sync = true;
				ok(name);
			}).catch((e) => {
				ko(e);
			})
		});
	}
	
	public static isSync(): boolean {
		return this.sync;
	}
}