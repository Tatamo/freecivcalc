/// <reference path="unit.ts" />
/// <reference path="veteranlevel.ts" />
/// <reference path="terrain.ts" />
/// <reference path="flags.ts" />
/// <reference path="adjustment.ts" />
/// <reference path="../typings/main.d.ts" />
module FreecivCalc{
	// load JSON files
	// TODO: define interface of JSON items
	export class Loader{
		units: Array<Unit>;
		unitclass: Array<UnitClass>;
		veteranlevel: Array<VeteranLevel>;
		terrains: Array<Terrain>;
		flags: FlagsDataSet;
		adjustments: Array<AdjustmentData>;
		constructor() {
			this.units = [];
			this.unitclass = [];
			this.veteranlevel = [];
			this.terrains = [];
			this.flags = null;
			this.adjustments = [];
		}
		init(path:string, cb = (data)=>{}) {
			$.getJSON(path).done((data)=>{
				if(this.setDataSet(data)) cb(data);
			});
		}
		setDataSet(data: any): boolean{
			if(!this.validate(data)) return false;
			this.units = data.units;
			this.unitclass = data.unitclass;
			this.veteranlevel = data.veteranlevel;
			this.terrains = data.terrains;
			this.flags = data.flags;
			this.adjustments = data.adjustments;
			return true;
		}
		validate(data: any): boolean{
			if(!data) return false;
			if(!data.units) return false;
			if(!data.unitclass) return false;
			if(!data.veteranlevel) return false;
			if(!data.terrains) return false;
			if(!data.flags) return false;
			if(!data.adjustments) return false;
			return true;
		}
	}
}
