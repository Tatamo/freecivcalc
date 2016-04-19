/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
module FreecivCalc{
	export interface Paths{
		units: string;
		veteranlevel: string;
		terrains: string;
		flags: string;
		adjustments: string;
	}
	// load JSON files
	// TODO: define interface of JSON items
	export class Loader{
		units: Array<any>;
		veteranlevel: Array<any>;
		terrains: Array<any>;
		flags: Array<any>;
		adjustments: Array<any>;
		onload:()=>any;
		constructor(paths:Paths, cb = ()=>{}) {
			this.onload = cb;
			console.log(paths);
			$(()=>{
				var loads = [$.getJSON(paths.units).done((data)=>{
					this.units = data;
				}),
				$.getJSON(paths.veteranlevel).done((data)=>{
					this.veteranlevel = data;
				}),
				$.getJSON(paths.terrains).done((data)=>{
					this.terrains = data;
				}),
				$.getJSON(paths.flags).done((data)=>{
					this.flags = data;
				}),
				$.getJSON(paths.adjustments).done((data)=>{
					this.adjustments = data;
				})];
				Promise.all(loads).then(()=>{
					this.onload();
				});
			});
		}
	}
}
