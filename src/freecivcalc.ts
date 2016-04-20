/// <reference path="unit.ts" />
/// <reference path="veteranlevel.ts" />
/// <reference path="terrain.ts" />
/// <reference path="flags.ts" />
/// <reference path="adjustment.ts" />
/// <reference path="loader.ts" />
/// <reference path="calc.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
module FreecivCalc{
	export class FreecivCalc{
		attacker: Unit;
		defender: Unit;
		attacker_vl: VeteranLevel;
		defender_vl: VeteranLevel;
		units: UnitManager;
		veteranlevelmanager: VeteranLevelManager;
		terrains: TerrainManager;
		flags: FlagManager;
		adjustments: AdjustmentManager;
		calculator: BattleCalc;
		loader: Loader;
		loaded: boolean;
		constructor(){
			this.attacker = null;
			this.defender = null;
			this.attacker_vl = null;
			this.defender_vl = null;
			this.units = new UnitManager();
			this.veteranlevelmanager = new VeteranLevelManager();
			this.terrains = new TerrainManager();
			this.flags = new FlagManager();
			this.adjustments = new AdjustmentManager(this);
			this.calculator = new BattleCalc();
			this.loaded = false;
			this.loader = new Loader(
				{units:"units.json", veteranlevel:"veteranlevel.json", terrains:"terrains.json", flags:"flags.json", adjustments:"adjustments.json"},
				()=>{
					this.loaded = true;
					this.init();
				}
			);
		}
		init(){
			console.log("FreecivCalc#init");
			var classlist = [
				{id:"land", label:"陸上ユニット"},
				{id:"sea", label:"海上ユニット"},
				{id:"trireme", label:"トライリーム"},
				{id:"air", label:"航空ユニット"},
				{id:"helicopter", label:"ヘリコプター"},
				{id:"missile", label:"ミサイル"},
			];
			this.units.init(classlist,this.loader.units);
			this.veteranlevelmanager.init(this.loader.veteranlevel);
			this.terrains.init(this.loader.terrains);
			this.flags.init(this.loader.flags);
			this.adjustments.init(this.loader.adjustments);
			this.initElements();
		}
		initElements(){
			this.createOptions();
			$(()=>{
				for(var i=0; i<this.loader.flags.length; i++){
					let flag = this.loader.flags[i];
					let el = $( "#"+flag );
					el.change(()=>{
						this.flags.set(flag, el.prop("checked"));
					});
					this.flags.set(flag,el.prop("checked"));
				}
				var in_open = $( "#in-open" );
				in_open.change(()=>{
					this.flags.set("in-city", false);
				});
				in_open.prop("checked", true).change();
				var attacker_class = $( "#attacker-class" );
				attacker_class.change(()=>{
					$( "#attacker-class-display" ).text(this.units.getclass(attacker_class.val()).label);
				});
				var defender_class = $( "#defender-class" );
				defender_class.change(()=>{
					$( "#defender-class-display" ).text(this.units.getclass(defender_class.val()).label);
				});
				var attacker_max_hp = $( "#attacker-max-hp" );
				attacker_max_hp.change(()=>{
					var current = $( "#attacker-current-hp" );
					var maxhp = +attacker_max_hp.val();
					current.attr("max", maxhp);
					if(+current.val() > maxhp) {
						current.val(maxhp).change();
					}
				});
				var defender_max_hp = $( "#defender-max-hp" );
				defender_max_hp.change(()=>{
					var current = $( "#defender-current-hp" );
					var maxhp = +defender_max_hp.val();
					current.attr("max", maxhp);
					if(+current.val() > maxhp) {
						current.val(maxhp).change();
					}
				});
				var attacker_cb = $( "#combobox-attack" );
				if(attacker_cb.children().length > 1) {
					this.setUnit(this.units.get((<any>attacker_cb.children()[1]).value), UnitSide.attacker);
				}
				var defender_cb = $( "#combobox-defence" );
				if(defender_cb.children().length > 1){
					this.setUnit(this.units.get((<any>defender_cb.children()[1]).value), UnitSide.defender);
				}
			});
		}
		createOptions(){
			$(()=>{
				// anyキャスト 仕方ないね
				var attacker_cb = $( "#combobox-attack" );
				(<any>attacker_cb).combobox({list:this.loader.units,
				select: (e,data) =>{
					this.setUnit(this.units.get(data.item.value), UnitSide.attacker);
				}});
				var defender_cb = $( "#combobox-defence" );
				(<any>defender_cb).combobox({list:this.loader.units,
				select: (e,data) =>{
					this.setUnit(this.units.get(data.item.value), UnitSide.defender);
				}});
				var attacker_vl = $( "#attacker-veteranlevel" );
				(<any>attacker_vl).dataselect({list:this.loader.veteranlevel,
				select: (e,data) =>{
					this.attacker_vl = this.veteranlevelmanager.get(data.item.value);
				}});
				var defender_vl = $( "#defender-veteranlevel" );
				(<any>defender_vl).dataselect({list:this.loader.veteranlevel,
				select: (e,data) =>{
					this.defender_vl = this.veteranlevelmanager.get(data.item.value);
				}});
				var terrain_select = $( "#select-terrain" );
				(<any>terrain_select).dataselect({list:this.loader.terrains,
				select: (e,data) =>{
					this.terrains.current(data.item.value);
				}});
			});
		}
		setUnit(unit:Unit, side:UnitSide){
			if(!unit) return;
			if(side == UnitSide.attacker){
				this.attacker = unit;
				$( "#attacker-class" ).val(unit.class).change();
				$( "#attacker-current-hp" ).val(unit.hp).change();
				$( "#attacker-max-hp" ).val(unit.hp).change();
				$( "#attacker-strength" ).val(unit.attack).change();
				$( "#attacker-firepower" ).val(unit.firepower).change();
			}
			else if(side == UnitSide.defender){
				this.defender = unit;
				$( "#defender-class" ).val(unit.class).change();
				$( "#defender-current-hp" ).val(unit.hp).change();
				$( "#defender-max-hp" ).val(unit.hp).change();
				$( "#defender-strength" ).val(unit.defence).change();
				$( "#defender-firepower" ).val(unit.firepower).change();
			}
		}
		calc(){
			var attacker = this.units.copyUnit(this.attacker);
			var defender = this.units.copyUnit(this.defender);
			attacker.hp = +$( "#attacker-current-hp" ).val();
			defender.hp = +$( "#defender-current-hp" ).val();
			attacker.attack = +$( "#attacker-strength" ).val();
			defender.defence = +$( "#defender-strength" ).val();
			attacker.firepower = +$( "#attacker-firepower" ).val();
			defender.firepower = +$( "#defender-firepower" ).val();
			var adjustments = this.adjustments.check();
			this.calculator.set(attacker, defender, adjustments);
			return this.calculator.calc();
		}
	}
	export var freecivcalc;
	window.onload =()=>{
		console.log("test");
		freecivcalc = new FreecivCalc();
	}
}
