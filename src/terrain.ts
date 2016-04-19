module FreecivCalc{
	export interface Terrain{
		id: string;
		label: string;
		value: number;
	}
	export class TerrainManager{
		private _terrains: {[key:string]: Terrain};
		private _current: Terrain;
		constructor(){
			this._terrains = {};
			this._current = null;
		}
		init(terrains:Array<Terrain>){
			for(var i=0; i<terrains.length; i++){
				var t = terrains[i];
				this._terrains[t.id] = t;
			}
		}
		get(name:string): Terrain{
			if(this._terrains[name]) return this._terrains[name];
			else return null;
		}
		current(name?:string): Terrain{
			if(name===undefined){
				// get
				return this._current;
			}
			else{
				// set
				if(this.get(name)){
					this._current = this.get(name);
				}
				else{
					throw new Error("no such terrain exists");
				}
				return this._current;
			}
		}
	}
}
