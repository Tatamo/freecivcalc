/// <reference path="freecivcalc.ts" />
module FreecivCalc{
	export interface AdjustmentData{
		id: string;
		label: string;
		condition: Array<any>;
		effect: Array<{type: string; value: string;}>;
	}
	// internal interface
	interface ParsedAdjustment{
		id: string;
		label: string;
		condition: string;
		effect: Array<{type: string; value: string;}>;
	}
	export interface Adjustment{
		id: string;
		label: string;
		effect: Array<{type: string; value: number;}>;
	}
	export class AdjustmentManager{
		freecivcalc: FreecivCalc;
		_adjustments: Array<ParsedAdjustment>;
		_current_adjustments: Array<any>;
		constructor(calc: FreecivCalc){
			this.freecivcalc = calc;
			this._adjustments = [];
			this._current_adjustments = [];
		}
		init(adjustments: Array<AdjustmentData>){
			for(var i=0; i<adjustments.length; i++){
				var adj = adjustments[i];
				var tmp:ParsedAdjustment = {id:adj.id, label:adj.label, condition:null, effect: adj.effect};
				var condition = this.parseCondition(adj.condition);
				tmp.condition = condition;
				this._adjustments.push(tmp);
			}
		}
		check(): Array<Adjustment>{
			var result = [];
			for(var i=0; i<this._adjustments.length; i++){
				var adj = this._adjustments[i];
				if(this.evalCondition(adj.condition)){
					var tmp:Adjustment = {id:adj.id, label:adj.label, effect:[]};
					for(var ii=0; ii<adj.effect.length; ii++){
						var e = adj.effect[ii];
						var tmp2 = {type: e.type, value: null};
						if(this.isNumber(e.value)){
							tmp2.value = +e.value;
						}
						else{
							var f = this.parseFunction(e.value);
							tmp2.value = this.getEffectValueQuery(f.command)(f.arg);
						}
						tmp.effect.push(tmp2);
					}
					result.push(tmp);
				}
			}
			return result;
		}
		private isNumber(s: string): boolean{
			return (/^([1-9]\d*|0)$/).test(s.trim());
		}
		private evalCondition(condition: string): boolean{
			var func = (command: string, arg: string)=>{
				return this.getConditionQuery(command)(arg);
			}
			return eval(condition);
		}
		private parseFunction(s:string): {command:string, arg:string}{
			// "foo(bar)" -> ("foo", "bar")
			if(s[s.length-1] != ")" || s.indexOf("(") == -1) throw new Error("invalid syntax");
			s = s.substr(0,s.length-1);
			var tmp = s.split("(");
			return  {command: tmp[0], arg:tmp[1]};
		}
		private parseCondition(condition:Array<any>|string): string{
			if(typeof condition == "string"){
				if((<string>condition).toLowerCase() == "true"){
					return "true";
				}
				else if((<string>condition).toLowerCase() == "false"){
					return "false";
				}
				else{
					var f = this.parseFunction(<string>condition);
					return "func(\"" + f.command + "\", \""+ f.arg + "\")";
				}
			}
			else if(Array.isArray(condition)){
				if(condition.length > 0){
					var opr = "AND";
					if(typeof condition[0] == "string" && condition[0].toUpperCase()  == "AND"){
						condition.shift();
						opr = "AND";
					}
					else if(typeof condition[0] == "string" && condition[0].toUpperCase() == "OR"){
						condition.shift();
						opr = "OR";
					}
					else if(typeof condition[0] == "string" && condition[0].toUpperCase() == "NOT"){
						condition.shift();
						opr = "NOT";
					}
					if(condition.length == 0){
						throw new Error("conditions not enough");
					}
					if(opr == "NOT"){
						return "!(" + this.parseCondition(condition[0]) + ")";
					}
					else {
						var result = "";
						for(var i=0; i<condition.length; i++){
							var tmp = "("+this.parseCondition(condition[i])+")";
							if(i != condition.length - 1){
								if(opr == "AND") tmp += " && ";
								else if(opr == "OR") tmp += " || ";
							}
							result += tmp;
						}
						return result;
					}
				}
				else {
					throw new Error("empty conditions");
				}
			}
		}
		private getConditionQuery(command:string): (arg?:string)=>boolean {
			if(command == "flag"){
				return (arg:string)=>{
					return this.freecivcalc.flagmanager.get(arg).value;
				}
			}
			if(command == "attacker-class"){
				return (arg:string)=>{
					return this.freecivcalc.attacker.class == arg;
				}
			}
			if(command == "defender-class"){
				return (arg:string)=>{
					return this.freecivcalc.defender.class == arg;
				}
			}
			if(command == "attacker-flag"){
				return (arg:string)=>{
					var flags = this.freecivcalc.attacker.flags;
					for(var i=0; i<flags.length; i++){
						if(flags[i] == arg) return true;
					}
					return false;
				}
			}
			if(command == "defender-flag"){
				return (arg:string)=>{
					var flags = this.freecivcalc.defender.flags;
					for(var i=0; i<flags.length; i++){
						if(flags[i] == arg) return true;
					}
					return false;
				}
			}
		}
		private getEffectValueQuery(command:string): (arg?:string)=>number {
			if(command == "attacker-veteran"){
				return (arg:string)=>{
					return this.freecivcalc.attacker_vl.value;
				}
			}
			if(command == "defender-veteran"){
				return (arg:string)=>{
					return this.freecivcalc.defender_vl.value;
				}
			}
			if(command == "terrain"){
				return (arg:string)=>{
					return this.freecivcalc.terrains.current().value;
				}
			}
		}
	}
}
