module FreecivCalc{
	export enum UnitSide{
		attacker,
		defender
	}
	export interface Unit{
		id :string;
		value :string;
		pronunciation :Array<string>;
		class :string;
		flags :Array<string>;
		hp :number;
		attack :number;
		defence :number;
		firepower :number;
	}
	export interface UnitClass{
		id:string;
		label:string;
	}
	export class UnitManager{
		private _units: {[key:string]: Unit};
		private _classlist: {[key:string]: UnitClass};
		constructor(){
			this._units = {};
			this._classlist = {};
		}
		init(classlist:Array<UnitClass>, units:Array<Unit>){
			for(var i=0; i<classlist.length; i++){
				var c = classlist[i];
				this._classlist[c.id] = c;
			}
			for(var i=0; i<units.length; i++){
				var u = units[i];
				this._units[u.id] = u;
			}
		}
		get(name:string): Unit{
			if(this._units[name]) {
				// return copy of unit
				return this.copyUnit(this._units[name]);
			}
			else return null;
		}
		getclass(name:string): UnitClass{
			if(this._classlist[name]) return this._classlist[name];
			else return null;
		}
		copyUnit(unit:Unit): Unit{
			var u: Unit = {
				id : unit.id,
				value : unit.value,
				pronunciation : unit.pronunciation,
				class : unit.class,
				flags : unit.flags,
				hp : unit.hp,
				attack : unit.attack,
				defence : unit.defence,
				firepower : unit.firepower,
			}
			return u;
		}
	}
}
