module FreecivCalc{
	export interface FlagsDataSet{
		basic: Array<FlagData>;
		structure: Array<FlagData>;
		roads: Array<FlagData>;
		bases: Array<FlagData>;
		ex: Array<FlagData>;
	}
	export interface FlagData{
		id: string;
		label: string;
		description?: string;
	}
	export interface Flag{
		id: string;
		label: string;
		description: string;
		value: boolean;
	}
	export class FlagManager{
		private _flags: {[key:string]: Flag};
		constructor(){
			this._flags = {};
		}
		init(flags:Array<FlagData>){
			for(var i=0; i<flags.length; i++){
				var dsc = flags[i].description ? flags[i].description : null;
				var f: Flag = {id: flags[i].id, label: flags[i].label, description:dsc, value :false};
				this._flags[f.id] = f;
			}
		}
		set(key:string, value:boolean){
			if(!this._flags[key]) throw new Error("flag \""+key+"\" not exists");
			this._flags[key].value = value;
		}
		get(key:string): Flag {
			if(this._flags[key]) return this._flags[key];
			return null;
		}
	}
}
