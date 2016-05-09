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
		onload:()=>any;
		constructor(path:string, cb = ()=>{}) {
			this.onload = cb;
			$.getJSON(path).done((data)=>{
				this.units = data.units;
				this.unitclass = data.unitclass;
				this.veteranlevel = data.veteranlevel;
				this.terrains = data.terrains;
				this.flags = data.flags;
				this.adjustments = data.adjustments;
				this.onload();
			});
		}
	}
}
