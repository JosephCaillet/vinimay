import {Data, Condition} from './utils';

const sqlite	= require('sqlite3');
const printit	= require('printit');

const log = printit({
	prefix: 'Utils::Database',
	date: true
});

// Class defining the singleton map used below

class Instances {
	[username: string]: DatabaseConnector
}

// Main class

export class DatabaseConnector {
	private readonly connection: any;
	private static instances: Instances;

	/**	
	 * Open connection to the database
	 * @private
	 * @constructor
	 * @param  {string} username: username matching the database to open
	 */	 
	private constructor(username: string) {
		this.connection = new sqlite.Database('db/' + username + '.db');
	}


	/**	
	 * Get single instance of the database connector class
	 * @public 
	 * @static	 
	 * @param  {string} username - username matching the database
	 * @return {DatabaseConnector} An instance of DatabaseConnector
	 */		
	public static getInstance(username: string) {
		if(!this.instances) {
			this.instances = new Instances();
		}
		if(!this.instances[username]) {
			this.instances[username] = new DatabaseConnector(username);
		}
		return this.instances[username];
	}


	/**	
	 * Query database for entries
	 * @public
	 * @param {string} table - The table to query
	 * @param {Condition[]} conditions - Filters for the query
	 * @param {function} next - Retrieve error and data (next(err, data))
	 */	 
	public get(table: string, conditions: Condition[], next: (err: Error, data: Array<Data>) => void) {

		let query: string = 'SELECT * FROM ' + table;
		// parameters will stay empty unless conditions are provided
		let parameters: Data = (new Object() as Data);
		
		if(conditions.length) {
			// Get the WHERE clause, along with updated request parameters
			let whereClause = this.getWhereClause(conditions, parameters);

			// Updating the query
			query += ' ' + whereClause;
		}

		// Run the query
		this.connection.all(query, parameters, next);
	}


	/**	
	 * Get databases entry
	 * @public
	 * @param {string} table - The table to query
	 * @param {Data} data - Data to add into the database
	 * @param {function} next - Retrieve error (next(err))
	 */	 
	public add(table: string, data: Data, next: (err: Error) => void) {
		let query: string = 'INSERT INTO ' + table + '(';
		let values: string = 'VALUES(';

		// Check if we actually have something in data
		if(!Object.keys(data).length) return next(Error('ERRNODATA'));

		// Manually add each value
		for(let field in data) {
			query += field + ',';
			values += '$' + field + ',';
			// Rename the field's key so binding can be done
			data['$' + field] = data[field];
			delete data[field];
		}

		// Remove the trailing comma and close the parenthese
		query = query.substr(0, query.length - 1) + ') ';
		values = values.substr(0, values.length - 1) + ')';

		// Run que query
		this.connection.run(query + values, data, next);
	}


	/**	
	 * Update an entry from the database
	 * @public
	 * @param {string} table - The table to query
	 * @param {Data} newData - Data to update the database with
	 * @param {Condition[]} conditions - Filters for the query
	 * @param {function} next - Retrieve error (next(err))
	 */
	public update(table: string, newData: Data, conditions: Condition[], next: (err: Error) => void) {
		let query: string = 'UPDATE ' + table + ' SET ';
		// parameters will stay empty unless conditions are provided
		let parameters: Data = (new Object() as Data);
		
		// Check if we actually have something in data
		if(!Object.keys(newData).length) return next(Error('ERRNODATA'));

		for(let field in newData) {
			query += field + '=$' + field + ' AND ';
			// Rename the field's key so binding can be done
			parameters['$' + field] = newData[field];
			// Remove the trailing 'AND '
			query = query.substr(0, query.length - 4);
		}

		if(conditions.length) {
			// Get the WHERE clause, along with updated request parameters
			let whereClause = this.getWhereClause(conditions, parameters);

			query += whereClause;
		}
		
		this.connection.run(query, parameters, next);
	}


	/**	
	 * Remove an entry from the database
	 * @public
	 * @param {string} table - The table to query
	 * @param {Condition[]} conditions - Filters for the query
	 * @param {function} next - Retrieve error (next(err))
	 */
	public delete(table: string, conditions: Condition[], next: (err: Error) => void) {
		let query = 'DELETE FROM ' + table;
		
		// parameters will stay empty unless conditions are provided
		let parameters: Data = (new Object() as Data);

		if(conditions.length) {
			// Get the WHERE clause, along with updated request parameters
			let whereClause = this.getWhereClause(conditions, parameters);

			query += ' ' + whereClause;
		}

		this.connection.run(query, parameters, next);
	}


	/**	
	 * Generate a SQL WHERE clause from the given conditions
	 * @private
	 * @param {Condition[]} conditions - Conditions to generate the clause from
	 * @param {Data} parameters - Binding parameters (reference)
	 * @return {string} - SQL WHERE clause (parameters are updated via reference)
	 */
	private getWhereClause(conditions: Condition[], parameters: Data) {
		// parameter is an I/O param here (object are passed as 
		// reference in JS/TS)
		let whereClause: string = 'WHERE ';
		// Iterate over the conditions
		for(let i in conditions) {
			let condition = conditions[i];
			let placeholder: string;
			
			if(parameters['$' + condition.field]) {
				// If an entry already exists in the request parameters, just
				// append the first integer available to its name
				let i = 0;
				while(true) {
					if(!parameters['$' + condition.field + i]) {
						break; // If the name is available, break the loop
					}
					i++;
				}
				placeholder = '$' + condition.field + i;
			} else {
				// Else just use the name
				placeholder = '$' + condition.field;
			}
			
			whereClause += condition.field + condition.comparator + placeholder + ' AND ';
			// Store the parameter so sqlite3 can bind it to the request
			parameters[placeholder] = condition.value;
		}
		
		// Removing the final ' AND '
		whereClause = whereClause.substr(0, whereClause.length - 5);
		
		return whereClause;
	}
}