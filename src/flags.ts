module FreecivCalc{
	export interface Flag{
		id: string;
		value: boolean;
	}
	export class FlagManager{
		private _flags: {[key:string]: Flag};
		constructor(){
			this._flags = {};
		}
		init(flags:Array<string>){
			for(var i=0; i<flags.length; i++){
				var f: Flag = {id: flags[i], value:false};
				this._flags[f.id] = f;
			}
		}
		set(key:string, value:boolean){
			this._flags[key].value = value;
		}
		get(key:string): boolean {
			if(this._flags[key] && this._flags[key].value) return true;
			return false;
		}
	}
}
