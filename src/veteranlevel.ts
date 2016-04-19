module FreecivCalc{
	export interface VeteranLevel{
		level: number;
		id: string;
		label: string;
		value: number;
		chance_for_promotion: number;
	}
	export class VeteranLevelManager{
		private _veteranlevels: {[key:string]: VeteranLevel};
		private _levellist: {[key:number]: string}
		constructor(){
			this._veteranlevels = {};
			this._levellist = {};
		}
		init(vllist:Array<VeteranLevel>){
			for(var i=0; i<vllist.length; i++){
				var vl = vllist[i];
				this._veteranlevels[vl.id] = vl;
				this._levellist[vl.level] = vl.id;
			}
		}
		get(name:string): VeteranLevel{
			if(this._veteranlevels[name]) return this._veteranlevels[name];
			else return null;
		}
		getByLevel(lv:number): VeteranLevel{
			return this.get(this._levellist[lv]);
		}
	}
}
