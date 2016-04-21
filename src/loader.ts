/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
module FreecivCalc{
	// load JSON files
	// TODO: define interface of JSON items
	export class Loader{
		units: Array<any>;
		unitclass: Array<any>;
		veteranlevel: Array<any>;
		terrains: Array<any>;
		flags: Array<any>;
		adjustments: Array<any>;
		onload:()=>any;
		constructor(path:string, cb = ()=>{}) {
			this.onload = cb;
			$(()=>{
				$.getJSON(path).done((data)=>{
					this.units = data.units;
					this.unitclass = data.unitclass;
					this.veteranlevel = data.veteranlevel;
					this.terrains = data.terrains;
					this.flags = data.flags;
					this.adjustments = data.adjustments;
					this.onload();
				});
			});
		}
	}
}
