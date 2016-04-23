/// <reference path="freecivcalc.ts" />
/// <reference path="unit.ts" />
/// <reference path="adjustment.ts" />
module FreecivCalc{
	export interface BattleResult{
		attacker_raw: Unit;
		defender_raw: Unit;
		attacker_strength: number;
		defender_strength: number;
		attacker_fp: number;
		defender_fp: number;
		attacker_win: number;
		defender_win: number;
		attacker_hp_exp: number;
		defender_hp_exp: number;
		attacker_hp_exp_list: Array<number>;
		defender_hp_exp_list: Array<number>;
		adjustments: Array<Adjustment>;
	}
	export class BattleCalc{
		attacker: Unit;
		defender: Unit;
		adjustments: Array<Adjustment>;
		_binomial_dp: Array<Array<number>>;
		private _initialized;
		constructor(){
			this.attacker = null;
			this.defender = null;
			this.adjustments = null;
			this._initialized = false;
			this._binomial_dp = [];
		}
		set(attacker:Unit, defender:Unit, adjustments: Array<Adjustment>){
			this.attacker = attacker;
			this.defender = defender;
			this.adjustments = adjustments;
			this._initialized = true;
		}
		binomial(n:number, k:number){
			// initialize
			if(this._binomial_dp.length <= n){
				for(var i=this._binomial_dp.length; i<=n; i++){
					var tmp = new Array(i+1);
					for(var ii=0; ii<=i; ii++){
						tmp[ii]=-1;
					}
					this._binomial_dp.push(tmp);
				}
			}
			if(k == 0 || k == n) {
				return 1;
			}
			else{
				var result = this.binomial(n-1,k-1)*n/k;
				this._binomial_dp[n][k] = result;
				this._binomial_dp[n][n-k] = result;
				return result;
			}
		}
		calc(){
			if(!this._initialized || !this.attacker || !this.defender || !this.adjustments){
				throw new Error("calculator not initialized");
			}
			/*var raw_attack = this.attacker.attack;
			var raw_defence = this.defender.defence;
			var raw_attacker_fp = this.attacker.firepower;
			var raw_defender_fp = this.defender.firepower;*/
			var units = this.applyAdjustments();
			// http://freeciv.wikia.com/wiki/Math_of_Freeciv
			var s = units.attacker.attack; // all adjustments applied attack
			var r = units.defender.defence; // all adjustments applied defence
			var a_hp = units.attacker.hp;
			var d_hp = units.defender.hp;
			var a_fp = units.attacker.firepower;
			var d_fp = units.defender.firepower;
			var k = Math.floor((d_hp + a_fp -1)/a_fp);
			var l = Math.floor((a_hp + d_fp -1)/d_fp);
			var p = s/(s+r);
			var q = r/(s+r); // q = 1-p
	

			// DP on pow(p,x), pow(q,x)
			var dp_pow_p = new Array(k+1);
			var dp_pow_q = new Array(l+1);
			dp_pow_p[0] = 1;
			dp_pow_q[0] = 1;
			for(var i=1; i<=k; i++){
				dp_pow_p[i] = dp_pow_p[i-1]*p;
			}
			for(var i=1; i<=l; i++){
				dp_pow_q[i] = dp_pow_q[i-1]*q;
			}
			// calc probability
			var p_a_win = 0;
			var p_a_win_with_hp = new Array(a_hp+1);
			for(var i=0; i<=a_hp; i++) p_a_win_with_hp[i] = 0;
			for(var n=k; n<k+l; n++){
				var probability = this.binomial(n-1,k-1)*dp_pow_p[k]*dp_pow_q[n-k];
				p_a_win += probability;
				p_a_win_with_hp[a_hp - (n-k)*d_fp] = probability;
			}
			var exp_a_hp = 0;
			for(var i=0; i<=a_hp; i++){
				exp_a_hp += i*p_a_win_with_hp[i];
			}
			var p_d_win = 0;
			var p_d_win_with_hp = new Array(d_hp+1);
			for(var i=0; i<=d_hp; i++) p_d_win_with_hp[i] = 0;
			for(var n=l; n<l+k; n++){
				var probability = this.binomial(n-1,l-1)*dp_pow_q[l]*dp_pow_p[n-l];
				p_d_win += probability;
				p_d_win_with_hp[d_hp - (n-l)*a_fp] = probability;
			}
			var exp_d_hp = 0;
			for(var i=0; i<=d_hp; i++){
				exp_d_hp += i*p_d_win_with_hp[i];
			}
			// in case defeated
			p_a_win_with_hp[0] = p_d_win;
			p_d_win_with_hp[0] = p_a_win;
			var result:BattleResult = {
				attacker_raw: this.attacker,
				defender_raw: this.defender,
				attacker_strength: s,
				defender_strength: r,
				attacker_fp: a_fp,
				defender_fp: d_fp,
				attacker_win: p_a_win,
				defender_win: p_d_win,
				attacker_hp_exp: exp_a_hp,
				defender_hp_exp: exp_d_hp,
				attacker_hp_exp_list: p_a_win_with_hp,
				defender_hp_exp_list: p_d_win_with_hp,
				adjustments: this.adjustments
			}
			return result;
		}
		applyAdjustments(){
			var attacker = new UnitManager().copyUnit(this.attacker);
			var defender = new UnitManager().copyUnit(this.defender);
			var s = attacker.attack * 10;
			var r = defender.defence * 10;
			var a_fp = attacker.firepower;
			var d_fp = defender.firepower;
			for(var i=0; i<this.adjustments.length; i++){
				var adj = this.adjustments[i];
				for(var ii=0; ii<adj.effect.length; ii++){
					var effect = adj.effect[ii];
					var val = effect.value;
					if(effect.type == "attacker-strength-multiply"){
						s *= val / 100;
					}
					else if(effect.type == "defender-strength-multiply"){
						r *= val / 100;
					}
					else if(effect.type == "attacker-firepower-multiply"){
						a_fp *= val / 100;
					}
					else if(effect.type == "defender-firepower-multiply"){
						d_fp *= val / 100;
					}
					else if(effect.type == "attacker-firepower-set"){
						a_fp = val;
					}
					else if(effect.type == "defender-firepower-set"){
						d_fp = val;
					}
				}
			}
			attacker.attack = Math.floor(s);
			defender.defence = Math.floor(r);
			attacker.firepower = a_fp;
			defender.firepower = d_fp;
			return {attacker: attacker, defender: defender};
		}
	}
}
