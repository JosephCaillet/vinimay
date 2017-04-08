export interface Data {
	[name: string]: string | number | null
}

export interface Condition {
	field: string,
	comparator: string,
	value: string | number
}