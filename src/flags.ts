module FreecivCalc{
	export interface Flag{
		id: string;
		value: boolean;
		ignore: boolean;
	}
	export class FlagManager{
		private _flags: {[key:string]: Flag};
		constructor(){
			this._flags = {};
		}
		init(flags:Array<string>){
			for(var i=0; i<flags.length; i++){
				var f: Flag = {id: flags[i], value:false, ignore: false};
				this._flags[f.id] = f;
			}
		}
		set(key:string, value:boolean){
			this._flags[key].value = value;
		}
		get(key:string): boolean {
			if(this._flags[key] && this._flags[key].value && !this._flags[key].ignore) return true;
			return false;
		}
		setIgnore(key:string, value:boolean = true){
			if(!this._flags[key]) throw new Error("key does not exist");
			this._flags[key].ignore = value;
		}
		clearIgnore(){
			for(var key in this._flags){
				var flag = this._flags[key];
				flag.ignore = false;
			}
		}
	}
}
