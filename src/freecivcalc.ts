/// <reference path="unit.ts" />
/// <reference path="veteranlevel.ts" />
/// <reference path="terrain.ts" />
/// <reference path="flags.ts" />
/// <reference path="adjustment.ts" />
/// <reference path="loader.ts" />
/// <reference path="calc.ts" />
/// <reference path="tabs.ts" />
/// <reference path="../typings/main.d.ts" />
module FreecivCalc{
	export class FreecivCalc{
		attacker: Unit;
		defender: Unit;
		attacker_vl: VeteranLevel;
		defender_vl: VeteranLevel;
		units: UnitManager;
		veteranlevelmanager: VeteranLevelManager;
		terrains: TerrainManager;
		flagmanager: FlagManager;
		flags_basic: Array<string>;
		adjustments: AdjustmentManager;
		calculator: BattleCalc;
		result: BattleResult;
		detailtabs: DetailTabs;
		loader: Loader;
		loaded: boolean;
		constructor(dataset?){
			this.attacker = null;
			this.defender = null;
			this.attacker_vl = null;
			this.defender_vl = null;
			this.units = new UnitManager();
			this.veteranlevelmanager = new VeteranLevelManager();
			this.terrains = new TerrainManager();
			this.flagmanager = new FlagManager();
			this.adjustments = new AdjustmentManager(this);
			this.calculator = new BattleCalc();
			this.result = null;
			this.detailtabs = new DetailTabs();
			this.loaded = false;
			this.loader = new Loader();
			$( "#display-error" ).text("");
			if(!dataset){
				// load default dataset
				this.loader.initByPath(
					$( "#freecivcalc" ).attr("data-default-dataset-path"),
					()=>{
						this.loaded = true;
						this.init();
					}
				);
			}
			else if(typeof dataset == "string"){
				// load from path
				this.loader.initByPath(
					dataset,
					()=>{
						this.loaded = true;
						this.init();
					}
				);
			}
			else if(this.loader.validate(dataset)) {
				// load dataset object
				this.loader.initByObj(
					dataset,
					()=>{
						this.loaded = true;
						this.init();
					}
				);
			}
			else {
				// cant start freecivcalc
				$( "#display-error" ).text("Error: Failed to load Dataset. cannot start FreecivCalc.");
			}
		}
		init(){
			var dest = $( "#freecivcalc" );
			var template = $( "#freecivcalc-template" );
			dest.empty();
			var clone = $(document.importNode((<any>template[0]).content, true));
			dest.append(clone);
			this.units.init(this.loader.unitclass,this.loader.units);
			this.veteranlevelmanager.init(this.loader.veteranlevel);
			this.terrains.init(this.loader.terrains);
			var f = this.loader.flags;
			var f_all = [];
			for(var k in f){
				f_all = [...f_all,...f[k]];
			}
			this.flagmanager.init(f_all);
			this.adjustments.init(this.loader.adjustments);
			this.initElements();
			this.createConfigTab();
		}
		initElements(){
			this.detailtabs.init();
			this.createOptions();
			$(()=>{
				// basic
				for(var i=0; i<this.loader.flags.basic.length; i++){
					var flag = this.flagmanager.get(this.loader.flags.basic[i].id);
					var el = $("label[for="+flag.id+"]");
					if(flag.label) el.text(flag.label);
					if(flag.description) el.attr("title",flag.description);
				}
				var ul = $( "#list-structure" );
				// structures
				for(var i=0; i<this.loader.flags.structure.length; i++){
					var flag = this.flagmanager.get(this.loader.flags.structure[i].id);
					$( "<li></li>" )
					.append(
						$( "<input>" )
						.attr("type", "checkbox")
						.attr("id", flag.id)
					)
					.append(
						$( "<label></label>" )
						.text(flag.label)
						.attr("for", flag.id)
						.attr("title", flag.description?flag.description:null)
					)
					.appendTo(ul);
				}
				// bases
				var bases = $( "#flags-bases" );
				for(var i=0; i<this.loader.flags.bases.length; i++){
					var flag = this.flagmanager.get(this.loader.flags.bases[i].id);
					bases.append(
						$( "<input>" )
						.attr("type", "checkbox")
						.attr("id", flag.id)
					)
					.append(
						$( "<label></label>" )
						.text(flag.label)
						.attr("for", flag.id)
						.attr("title", flag.description?flag.description:null)
					);
				}
				// roads
				var roads = $( "#flags-roads" );
				for(var i=0; i<this.loader.flags.roads.length; i++){
					var flag = this.flagmanager.get(this.loader.flags.roads[i].id);
					roads.append(
						$( "<input>" )
						.attr("type", "checkbox")
						.attr("id", flag.id)
					)
					.append(
						$( "<label></label>" )
						.text(flag.label)
						.attr("for", flag.id)
						.attr("title", flag.description?flag.description:null)
					);
				}
				// ex
				var ex = $( "#flags-ex" );
				for(var i=0; i<this.loader.flags.ex.length; i++){
					var flag = this.flagmanager.get(this.loader.flags.ex[i].id);
					ex.append(
						$( "<input>" )
						.attr("type", "checkbox")
						.attr("id", flag.id)
					)
					.append(
						$( "<label></label>" )
						.text(flag.label)
						.attr("for", flag.id)
						.attr("title", flag.description?flag.description:null)
					);
				}
				// all
				var f_all = [];
				for(var k in this.loader.flags){
					f_all = [...f_all,...this.loader.flags[k]];
				}
				for(var i=0; i<f_all.length; i++){
					let flag = this.flagmanager.get(f_all[i].id);
					let el = $( "#"+flag.id );
					el.change(()=>{
						this.flagmanager.set(flag.id, el.prop("checked"));
					});
					this.flagmanager.set(flag.id, el.prop("checked"));
				}
				var in_city = $( "#in-city" );
				in_city.change(()=>{
					if(in_city.prop("checked")){
						$( "#fieldset-in-city" ).prop("disabled", false);
						$( "#fieldset-in-open" ).prop("disabled", true);
					}
				});
				in_city.change();
				var in_open = $( "#in-open" );
				in_open.change(()=>{
					this.flagmanager.set("in-city", false);
					if(in_open.prop("checked")){
						$( "#fieldset-in-open" ).prop("disabled", false);
						$( "#fieldset-in-city" ).prop("disabled", true);
					}
				});
				in_open.prop("checked", true).change();
				var attacker_class = $( "#attacker-class" );
				attacker_class.change(()=>{
					$( "#attacker-class-display" ).text(this.units.getclass(attacker_class.val()).label);
				});
				var defender_class = $( "#defender-class" );
				defender_class.change(()=>{
					$( "#defender-class-display" ).text(this.units.getclass(defender_class.val()).label);
					/*
					// depend on ruleset
					if(defender_class.val() && defender_class.val() != "land"){
						(<any>$( "#select-terrain" )).selectmenu("disable");
						$( "#river" ).prop("disabled", true);
						$( "#defender-fortified" ).prop("disabled", true);
						$( "#in-fortress" ).prop("disabled", true);
					}
					else{
						(<any>$( "#select-terrain" )).selectmenu("enable");
						$( "#river" ).prop("disabled", false);
						$( "#defender-fortified" ).prop("disabled", false);
						$( "#in-fortress" ).prop("disabled", false);
					}
					*/
				});
				var attacker_max_hp = $( "#attacker-max-hp" );
				var attacker_current_hp = $( "#attacker-current-hp" );
				attacker_max_hp.change(()=>{
					var maxhp = +attacker_max_hp.val();
					attacker_current_hp.attr("max", maxhp);
					//if(+attacker_current_hp.val() > maxhp) attacker_current_hp.val(maxhp).change();
					attacker_current_hp.val(maxhp).change();
				});
				attacker_current_hp.change(()=>{
					if(+attacker_current_hp.val() > +attacker_max_hp.val()) attacker_current_hp.val(+attacker_max_hp.val()).change();
				});
				var defender_max_hp = $( "#defender-max-hp" );
				var defender_current_hp = $( "#defender-current-hp" );
				defender_max_hp.change(()=>{
					var maxhp = +defender_max_hp.val();
					defender_current_hp.attr("max", maxhp);
					// if(+defender_current_hp.val() > maxhp) defender_current_hp.val(maxhp).change();
					defender_current_hp.val(maxhp).change();
				});
				defender_current_hp.change(()=>{
					if(+defender_current_hp.val() > +defender_max_hp.val()) defender_current_hp.val(+defender_max_hp.val()).change();
				});
				var attacker_cb = $( "#combobox-attack" );
				if(attacker_cb.children().length > 1) {
					this.setUnit(this.units.get((<any>attacker_cb.children()[1]).value), UnitSide.attacker);
				}
				var defender_cb = $( "#combobox-defence" );
				if(defender_cb.children().length > 1){
					this.setUnit(this.units.get((<any>defender_cb.children()[1]).value), UnitSide.defender);
				}
				var calc = $( "#calc" );
				calc.click(()=>{
					calc.attr("data-result", JSON.stringify(this.calc()));
				});
			});
		}
		createConfigTab(){
			$( "#current-dataset" ).text(this.loader.meta.name);
			$( "#current-dataset-freeciv-version" ).text(this.loader.meta.freeciv_version);
			// dataset download button
			var select = $( "#select-dataset" );
			var apply_selected = $( "#selected-dataset-apply" );
			var a = $( "#dataset-download" );
			select.change(()=>{
				var option = select.find("option:selected");
				var url = option.val();
				var filename = option.text();
				a.attr("href", url);
				a.attr("target", "_blank");
				a.attr("download", filename);
				apply_selected.unbind("click");
				apply_selected.click(()=>{
					console.log(url);
					freecivcalc = new FreecivCalc(url);
				});
			});
			select.change();
			var loadbutton = $( "#dataset-load" );
			var apply_loaded = $( "#local-dataset-apply" );
			var errordisplay = $( "#display-error-local-dataset-load" );
			loadbutton.change((e)=>{
				var files = (<any>e.target).files;
				var file = files[0];
				if(!file) return;
				var reader = new FileReader();
				reader.onload = (e)=>{
					errordisplay.hide();
					apply_loaded.prop("disabled",false);
					apply_loaded.unbind("click");
					apply_loaded.click(()=>{
						var data;
						try{
							data = JSON.parse(reader.result);
							if(!this.loader.validate(data)) throw new Error();
							freecivcalc = new FreecivCalc(data);
						}
						catch(e){
							console.log("Error: failed to load dataset");
							data = null;
							errordisplay.show();
						}
					});
				};
				reader.readAsText(file);
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
		showResult(){
			if(!this.result) return;
			var wrapper = $( "#result-wrapper" );
			wrapper.show();
			var table = $( "#result-table" );
			table.find("#attacker-result-strength").text(this.result.attacker_strength);
			table.find("#attacker-result-prob").text((this.result.attacker_win*100).toFixed(2)+"%");
			table.find("#attacker-result-exp").text(this.result.attacker_hp_exp.toFixed(3));
			table.find("#defender-result-strength").text(this.result.defender_strength);
			table.find("#defender-result-prob").text((this.result.defender_win*100).toFixed(2)+"%");
			table.find("#defender-result-exp").text(this.result.defender_hp_exp.toFixed(3));
		}
		calc(){
			if(!this.loaded) return null;
			var attacker = this.units.copyUnit(this.attacker);
			var defender = this.units.copyUnit(this.defender);
			attacker.hp = Math.max(+$( "#attacker-current-hp" ).val(), 1);
			defender.hp = Math.max(+$( "#defender-current-hp" ).val(), 1);
			attacker.attack = Math.max(+$( "#attacker-strength" ).val(), 1);
			defender.defence = Math.max(+$( "#defender-strength" ).val(), 1);
			attacker.firepower = Math.max(+$( "#attacker-firepower" ).val(), 1);
			defender.firepower = Math.max(+$( "#defender-firepower" ).val(), 1);
			var adjustments = this.adjustments.check();
			this.calculator.set(attacker, defender, adjustments);
			var result = this.calculator.calc();
			this.result = result;
			this.showResult();
			return result;
		}
	}
	export var freecivcalc;
	window.onload =()=>{
		freecivcalc = new FreecivCalc();
	}
}
