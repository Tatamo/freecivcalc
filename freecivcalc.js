var FreecivCalc;
(function (FreecivCalc) {
    (function (UnitSide) {
        UnitSide[UnitSide["attacker"] = 0] = "attacker";
        UnitSide[UnitSide["defender"] = 1] = "defender";
    })(FreecivCalc.UnitSide || (FreecivCalc.UnitSide = {}));
    var UnitSide = FreecivCalc.UnitSide;
    var UnitManager = (function () {
        function UnitManager() {
            this._units = {};
            this._classlist = {};
        }
        UnitManager.prototype.init = function (classlist, units) {
            for (var i = 0; i < classlist.length; i++) {
                var c = classlist[i];
                this._classlist[c.id] = c;
            }
            for (var i = 0; i < units.length; i++) {
                var u = units[i];
                this._units[u.id] = u;
            }
        };
        UnitManager.prototype.get = function (name) {
            if (this._units[name]) {
                // return copy of unit
                return this.copyUnit(this._units[name]);
            }
            else
                return null;
        };
        UnitManager.prototype.getclass = function (name) {
            if (this._classlist[name])
                return this._classlist[name];
            else
                return null;
        };
        UnitManager.prototype.copyUnit = function (unit) {
            var u = {
                id: unit.id,
                label: unit.label,
                pronunciation: unit.pronunciation,
                class: unit.class,
                flags: unit.flags,
                hp: unit.hp,
                attack: unit.attack,
                defence: unit.defence,
                firepower: unit.firepower
            };
            return u;
        };
        return UnitManager;
    }());
    FreecivCalc.UnitManager = UnitManager;
})(FreecivCalc || (FreecivCalc = {}));
var FreecivCalc;
(function (FreecivCalc) {
    var VeteranLevelManager = (function () {
        function VeteranLevelManager() {
            this._veteranlevels = {};
            this._levellist = {};
        }
        VeteranLevelManager.prototype.init = function (vllist) {
            for (var i = 0; i < vllist.length; i++) {
                var vl = vllist[i];
                this._veteranlevels[vl.id] = vl;
                this._levellist[vl.level] = vl.id;
            }
        };
        VeteranLevelManager.prototype.get = function (name) {
            if (this._veteranlevels[name])
                return this._veteranlevels[name];
            else
                return null;
        };
        VeteranLevelManager.prototype.getByLevel = function (lv) {
            return this.get(this._levellist[lv]);
        };
        return VeteranLevelManager;
    }());
    FreecivCalc.VeteranLevelManager = VeteranLevelManager;
})(FreecivCalc || (FreecivCalc = {}));
var FreecivCalc;
(function (FreecivCalc) {
    var TerrainManager = (function () {
        function TerrainManager() {
            this._terrains = {};
            this._current = null;
        }
        TerrainManager.prototype.init = function (terrains) {
            for (var i = 0; i < terrains.length; i++) {
                var t = terrains[i];
                this._terrains[t.id] = t;
            }
        };
        TerrainManager.prototype.get = function (name) {
            if (this._terrains[name])
                return this._terrains[name];
            else
                return null;
        };
        TerrainManager.prototype.current = function (name) {
            if (name === undefined) {
                // get
                return this._current;
            }
            else {
                // set
                if (this.get(name)) {
                    this._current = this.get(name);
                }
                else {
                    throw new Error("no such terrain exists");
                }
                return this._current;
            }
        };
        return TerrainManager;
    }());
    FreecivCalc.TerrainManager = TerrainManager;
})(FreecivCalc || (FreecivCalc = {}));
var FreecivCalc;
(function (FreecivCalc) {
    var FlagManager = (function () {
        function FlagManager() {
            this._flags = {};
        }
        FlagManager.prototype.init = function (flags) {
            for (var i = 0; i < flags.length; i++) {
                var f = { id: flags[i], value: false, ignore: false };
                this._flags[f.id] = f;
            }
        };
        FlagManager.prototype.set = function (key, value) {
            this._flags[key].value = value;
        };
        FlagManager.prototype.get = function (key) {
            if (this._flags[key] && this._flags[key].value && !this._flags[key].ignore)
                return true;
            return false;
        };
        FlagManager.prototype.setIgnore = function (key, value) {
            if (value === void 0) { value = true; }
            if (!this._flags[key])
                throw new Error("key does not exist");
            this._flags[key].ignore = value;
        };
        FlagManager.prototype.clearIgnore = function () {
            for (var key in this._flags) {
                var flag = this._flags[key];
                flag.ignore = false;
            }
        };
        return FlagManager;
    }());
    FreecivCalc.FlagManager = FlagManager;
})(FreecivCalc || (FreecivCalc = {}));
/// <reference path="freecivcalc.ts" />
var FreecivCalc;
(function (FreecivCalc) {
    var AdjustmentManager = (function () {
        function AdjustmentManager(calc) {
            this.freecivcalc = calc;
            this._adjustments = [];
            this._current_adjustments = [];
        }
        AdjustmentManager.prototype.init = function (adjustments) {
            for (var i = 0; i < adjustments.length; i++) {
                var adj = adjustments[i];
                var tmp = { id: adj.id, name: adj.name, condition: null, effect: adj.effect };
                var condition = this.parseCondition(adj.condition);
                tmp.condition = condition;
                this._adjustments.push(tmp);
            }
        };
        AdjustmentManager.prototype.check = function () {
            var result = [];
            for (var i = 0; i < this._adjustments.length; i++) {
                var adj = this._adjustments[i];
                if (this.evalCondition(adj.condition)) {
                    var tmp = { id: adj.id, name: adj.name, effect: [] };
                    for (var ii = 0; ii < adj.effect.length; ii++) {
                        var e = adj.effect[ii];
                        var tmp2 = { type: e.type, value: null };
                        if (this.isNumber(e.value)) {
                            tmp2.value = +e.value;
                        }
                        else {
                            var f = this.parseFunction(e.value);
                            tmp2.value = this.getEffectValueQuery(f.command)(f.arg);
                        }
                        tmp.effect.push(tmp2);
                    }
                    result.push(tmp);
                }
            }
            return result;
        };
        AdjustmentManager.prototype.isNumber = function (s) {
            return (/^([1-9]\d*|0)$/).test(s.trim());
        };
        AdjustmentManager.prototype.evalCondition = function (condition) {
            var _this = this;
            var func = function (command, arg) {
                return _this.getConditionQuery(command)(arg);
            };
            return eval(condition);
        };
        AdjustmentManager.prototype.parseFunction = function (s) {
            // "foo(bar)" -> ("foo", "bar")
            if (s[s.length - 1] != ")" || s.indexOf("(") == -1)
                throw new Error("invalid syntax");
            s = s.substr(0, s.length - 1);
            var tmp = s.split("(");
            return { command: tmp[0], arg: tmp[1] };
        };
        AdjustmentManager.prototype.parseCondition = function (condition) {
            if (typeof condition == "string") {
                if (condition.toLowerCase() == "true") {
                    return "true";
                }
                else if (condition.toLowerCase() == "false") {
                    return "false";
                }
                else {
                    var f = this.parseFunction(condition);
                    return "func(\"" + f.command + "\", \"" + f.arg + "\")";
                }
            }
            else if (Array.isArray(condition)) {
                if (condition.length > 0) {
                    var opr = "AND";
                    if (typeof condition[0] == "string" && condition[0].toUpperCase() == "AND") {
                        condition.shift();
                        opr = "AND";
                    }
                    else if (typeof condition[0] == "string" && condition[0].toUpperCase() == "OR") {
                        condition.shift();
                        opr = "OR";
                    }
                    else if (typeof condition[0] == "string" && condition[0].toUpperCase() == "NOT") {
                        condition.shift();
                        opr = "NOT";
                    }
                    if (condition.length == 0) {
                        throw new Error("conditions not enough");
                    }
                    if (opr == "NOT") {
                        return "!(" + this.parseCondition(condition[0]) + ")";
                    }
                    else {
                        var result = "";
                        for (var i = 0; i < condition.length; i++) {
                            var tmp = "(" + this.parseCondition(condition[i]) + ")";
                            if (i != condition.length - 1) {
                                if (opr == "AND")
                                    tmp += " && ";
                                else if (opr == "OR")
                                    tmp += " || ";
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
        };
        AdjustmentManager.prototype.getConditionQuery = function (command) {
            var _this = this;
            if (command == "flag") {
                return function (arg) {
                    return _this.freecivcalc.flags.get(arg);
                };
            }
            if (command == "attacker-class") {
                return function (arg) {
                    return _this.freecivcalc.attacker.class == arg;
                };
            }
            if (command == "defender-class") {
                return function (arg) {
                    return _this.freecivcalc.defender.class == arg;
                };
            }
            if (command == "attacker-flag") {
                return function (arg) {
                    var flags = _this.freecivcalc.attacker.flags;
                    for (var i = 0; i < flags.length; i++) {
                        if (flags[i] == arg)
                            return true;
                    }
                    return false;
                };
            }
            if (command == "defender-flag") {
                return function (arg) {
                    var flags = _this.freecivcalc.defender.flags;
                    for (var i = 0; i < flags.length; i++) {
                        if (flags[i] == arg)
                            return true;
                    }
                    return false;
                };
            }
        };
        AdjustmentManager.prototype.getEffectValueQuery = function (command) {
            var _this = this;
            if (command == "attacker-veteran") {
                return function (arg) {
                    return _this.freecivcalc.attacker_vl.value;
                };
            }
            if (command == "defender-veteran") {
                return function (arg) {
                    return _this.freecivcalc.defender_vl.value;
                };
            }
            if (command == "terrain") {
                return function (arg) {
                    return _this.freecivcalc.terrains.current().value;
                };
            }
        };
        return AdjustmentManager;
    }());
    FreecivCalc.AdjustmentManager = AdjustmentManager;
})(FreecivCalc || (FreecivCalc = {}));
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
var FreecivCalc;
(function (FreecivCalc) {
    // load JSON files
    // TODO: define interface of JSON items
    var Loader = (function () {
        function Loader(path, cb) {
            var _this = this;
            if (cb === void 0) { cb = function () { }; }
            this.onload = cb;
            $(function () {
                $.getJSON(path).done(function (data) {
                    _this.units = data.units;
                    _this.unitclass = data.unitclass;
                    _this.veteranlevel = data.veteranlevel;
                    _this.terrains = data.terrains;
                    _this.flags = data.flags;
                    _this.adjustments = data.adjustments;
                    _this.onload();
                });
            });
        }
        return Loader;
    }());
    FreecivCalc.Loader = Loader;
})(FreecivCalc || (FreecivCalc = {}));
/// <reference path="freecivcalc.ts" />
/// <reference path="unit.ts" />
/// <reference path="adjustment.ts" />
var FreecivCalc;
(function (FreecivCalc) {
    var BattleCalc = (function () {
        function BattleCalc() {
            this.attacker = null;
            this.defender = null;
            this.adjustments = null;
            this._initialized = false;
            this._binomial_dp = [];
        }
        BattleCalc.prototype.set = function (attacker, defender, adjustments) {
            this.attacker = attacker;
            this.defender = defender;
            this.adjustments = adjustments;
            this._initialized = true;
        };
        BattleCalc.prototype.binomial = function (n, k) {
            // initialize
            if (this._binomial_dp.length <= n) {
                for (var i = this._binomial_dp.length; i <= n; i++) {
                    var tmp = new Array(i + 1);
                    for (var ii = 0; ii <= i; ii++) {
                        tmp[ii] = -1;
                    }
                    this._binomial_dp.push(tmp);
                }
            }
            if (k == 0 || k == n) {
                return 1;
            }
            else {
                var result = this.binomial(n - 1, k - 1) * n / k;
                this._binomial_dp[n][k] = result;
                this._binomial_dp[n][n - k] = result;
                return result;
            }
        };
        BattleCalc.prototype.calc = function () {
            if (!this._initialized || !this.attacker || !this.defender || !this.adjustments) {
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
            var k = Math.floor((d_hp + a_fp - 1) / a_fp);
            var l = Math.floor((a_hp + d_fp - 1) / d_fp);
            var p = s / (s + r);
            var q = r / (s + r); // q = 1-p
            // DP on pow(p,x), pow(q,x)
            var dp_pow_p = new Array(k + 1);
            var dp_pow_q = new Array(l + 1);
            dp_pow_p[0] = 1;
            dp_pow_q[0] = 1;
            for (var i = 1; i <= k; i++) {
                dp_pow_p[i] = dp_pow_p[i - 1] * p;
            }
            for (var i = 1; i <= l; i++) {
                dp_pow_q[i] = dp_pow_q[i - 1] * q;
            }
            // calc probability
            var p_a_win = 0;
            var p_a_win_with_hp = new Array(a_hp + 1);
            for (var i = 0; i <= a_hp; i++)
                p_a_win_with_hp[i] = 0;
            for (var n = k; n < k + l; n++) {
                var probability = this.binomial(n - 1, k - 1) * dp_pow_p[k] * dp_pow_q[n - k];
                p_a_win += probability;
                p_a_win_with_hp[a_hp - (n - k) * d_fp] = probability;
            }
            var exp_a_hp = 0;
            for (var i = 0; i <= a_hp; i++) {
                exp_a_hp += i * p_a_win_with_hp[i];
            }
            var p_d_win = 0;
            var p_d_win_with_hp = new Array(d_hp + 1);
            for (var i = 0; i <= d_hp; i++)
                p_d_win_with_hp[i] = 0;
            for (var n = l; n < l + k; n++) {
                var probability = this.binomial(n - 1, l - 1) * dp_pow_q[l] * dp_pow_p[n - l];
                p_d_win += probability;
                p_d_win_with_hp[d_hp - (n - l) * a_fp] = probability;
            }
            var exp_d_hp = 0;
            for (var i = 0; i <= d_hp; i++) {
                exp_d_hp += i * p_d_win_with_hp[i];
            }
            // in case defeated
            p_a_win_with_hp[0] = p_d_win;
            p_d_win_with_hp[0] = p_a_win;
            var result = {
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
            };
            return result;
        };
        BattleCalc.prototype.applyAdjustments = function () {
            var attacker = new FreecivCalc.UnitManager().copyUnit(this.attacker);
            var defender = new FreecivCalc.UnitManager().copyUnit(this.defender);
            var s = attacker.attack * 10;
            var r = defender.defence * 10;
            var a_fp = attacker.firepower;
            var d_fp = defender.firepower;
            for (var i = 0; i < this.adjustments.length; i++) {
                var adj = this.adjustments[i];
                for (var ii = 0; ii < adj.effect.length; ii++) {
                    var effect = adj.effect[ii];
                    var val = effect.value;
                    if (effect.type == "attacker-strength-multiply") {
                        s *= val / 100;
                    }
                    else if (effect.type == "defender-strength-multiply") {
                        r *= val / 100;
                    }
                    else if (effect.type == "attacker-firepower-multiply") {
                        a_fp *= val / 100;
                    }
                    else if (effect.type == "defender-firepower-multiply") {
                        d_fp *= val / 100;
                    }
                    else if (effect.type == "attacker-firepower-set") {
                        a_fp = val;
                    }
                    else if (effect.type == "defender-firepower-set") {
                        d_fp = val;
                    }
                }
            }
            attacker.attack = Math.floor(s);
            defender.defence = Math.floor(r);
            attacker.firepower = a_fp;
            defender.firepower = d_fp;
            return { attacker: attacker, defender: defender };
        };
        return BattleCalc;
    }());
    FreecivCalc.BattleCalc = BattleCalc;
})(FreecivCalc || (FreecivCalc = {}));
/// <reference path="unit.ts" />
/// <reference path="veteranlevel.ts" />
/// <reference path="terrain.ts" />
/// <reference path="flags.ts" />
/// <reference path="adjustment.ts" />
/// <reference path="loader.ts" />
/// <reference path="calc.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
var FreecivCalc;
(function (FreecivCalc_1) {
    var FreecivCalc = (function () {
        function FreecivCalc() {
            var _this = this;
            this.attacker = null;
            this.defender = null;
            this.attacker_vl = null;
            this.defender_vl = null;
            this.units = new FreecivCalc_1.UnitManager();
            this.veteranlevelmanager = new FreecivCalc_1.VeteranLevelManager();
            this.terrains = new FreecivCalc_1.TerrainManager();
            this.flags = new FreecivCalc_1.FlagManager();
            this.adjustments = new FreecivCalc_1.AdjustmentManager(this);
            this.calculator = new FreecivCalc_1.BattleCalc();
            this.result = null;
            this.loaded = false;
            this.loader = new FreecivCalc_1.Loader("freecivcalc.json", function () {
                _this.loaded = true;
                _this.init();
            });
        }
        FreecivCalc.prototype.init = function () {
            this.units.init(this.loader.unitclass, this.loader.units);
            this.veteranlevelmanager.init(this.loader.veteranlevel);
            this.terrains.init(this.loader.terrains);
            this.flags.init(this.loader.flags);
            this.adjustments.init(this.loader.adjustments);
            this.initElements();
        };
        FreecivCalc.prototype.initElements = function () {
            var _this = this;
            this.createOptions();
            $(function () {
                var _loop_1 = function() {
                    var flag = _this.loader.flags[i];
                    var el = $("#" + flag);
                    el.change(function () {
                        _this.flags.set(flag, el.prop("checked"));
                    });
                    _this.flags.set(flag, el.prop("checked"));
                };
                for (var i = 0; i < _this.loader.flags.length; i++) {
                    _loop_1();
                }
                var in_city = $("#in-city");
                in_city.change(function () {
                    if (in_city.prop("checked")) {
                        $("#fieldset-in-city").prop("disabled", false);
                        $("#fieldset-in-open").prop("disabled", true);
                    }
                });
                in_city.change();
                var in_open = $("#in-open");
                in_open.change(function () {
                    _this.flags.set("in-city", false);
                    if (in_open.prop("checked")) {
                        $("#fieldset-in-open").prop("disabled", false);
                        $("#fieldset-in-city").prop("disabled", true);
                    }
                });
                in_open.prop("checked", true).change();
                var attacker_class = $("#attacker-class");
                attacker_class.change(function () {
                    $("#attacker-class-display").text(_this.units.getclass(attacker_class.val()).label);
                });
                var defender_class = $("#defender-class");
                defender_class.change(function () {
                    $("#defender-class-display").text(_this.units.getclass(defender_class.val()).label);
                    if (defender_class.val() && defender_class.val() != "land") {
                        $("#select-terrain").selectmenu("disable");
                        $("#terrain-river").prop("disabled", true);
                        $("#defender-fortified").prop("disabled", true);
                        $("#in-fortress").prop("disabled", true);
                    }
                    else {
                        $("#select-terrain").selectmenu("enable");
                        $("#terrain-river").prop("disabled", false);
                        $("#defender-fortified").prop("disabled", false);
                        $("#in-fortress").prop("disabled", false);
                    }
                });
                var attacker_max_hp = $("#attacker-max-hp");
                attacker_max_hp.change(function () {
                    var current = $("#attacker-current-hp");
                    var maxhp = +attacker_max_hp.val();
                    current.attr("max", maxhp);
                    if (+current.val() > maxhp) {
                        current.val(maxhp).change();
                    }
                });
                var defender_max_hp = $("#defender-max-hp");
                defender_max_hp.change(function () {
                    var current = $("#defender-current-hp");
                    var maxhp = +defender_max_hp.val();
                    current.attr("max", maxhp);
                    if (+current.val() > maxhp) {
                        current.val(maxhp).change();
                    }
                });
                var attacker_cb = $("#combobox-attack");
                if (attacker_cb.children().length > 1) {
                    _this.setUnit(_this.units.get(attacker_cb.children()[1].value), FreecivCalc_1.UnitSide.attacker);
                }
                var defender_cb = $("#combobox-defence");
                if (defender_cb.children().length > 1) {
                    _this.setUnit(_this.units.get(defender_cb.children()[1].value), FreecivCalc_1.UnitSide.defender);
                }
                var calc = $("#calc");
                calc.click(function () {
                    calc.attr("data-result", JSON.stringify(_this.calc()));
                });
            });
        };
        FreecivCalc.prototype.createOptions = function () {
            var _this = this;
            $(function () {
                // anyキャスト 仕方ないね
                var attacker_cb = $("#combobox-attack");
                attacker_cb.combobox({ list: _this.loader.units,
                    select: function (e, data) {
                        _this.setUnit(_this.units.get(data.item.value), FreecivCalc_1.UnitSide.attacker);
                    } });
                var defender_cb = $("#combobox-defence");
                defender_cb.combobox({ list: _this.loader.units,
                    select: function (e, data) {
                        _this.setUnit(_this.units.get(data.item.value), FreecivCalc_1.UnitSide.defender);
                    } });
                var attacker_vl = $("#attacker-veteranlevel");
                attacker_vl.dataselect({ list: _this.loader.veteranlevel,
                    select: function (e, data) {
                        _this.attacker_vl = _this.veteranlevelmanager.get(data.item.value);
                    } });
                var defender_vl = $("#defender-veteranlevel");
                defender_vl.dataselect({ list: _this.loader.veteranlevel,
                    select: function (e, data) {
                        _this.defender_vl = _this.veteranlevelmanager.get(data.item.value);
                    } });
                var terrain_select = $("#select-terrain");
                terrain_select.dataselect({ list: _this.loader.terrains,
                    select: function (e, data) {
                        _this.terrains.current(data.item.value);
                    } });
            });
        };
        FreecivCalc.prototype.setUnit = function (unit, side) {
            if (!unit)
                return;
            if (side == FreecivCalc_1.UnitSide.attacker) {
                this.attacker = unit;
                $("#attacker-class").val(unit.class).change();
                $("#attacker-current-hp").val(unit.hp).change();
                $("#attacker-max-hp").val(unit.hp).change();
                $("#attacker-strength").val(unit.attack).change();
                $("#attacker-firepower").val(unit.firepower).change();
            }
            else if (side == FreecivCalc_1.UnitSide.defender) {
                this.defender = unit;
                $("#defender-class").val(unit.class).change();
                $("#defender-current-hp").val(unit.hp).change();
                $("#defender-max-hp").val(unit.hp).change();
                $("#defender-strength").val(unit.defence).change();
                $("#defender-firepower").val(unit.firepower).change();
            }
        };
        FreecivCalc.prototype.showResult = function () {
            if (!this.result)
                return;
            var wrapper = $("#result-wrapper");
            wrapper.show();
            var table = $("#result-table tbody");
            var rows = table.children();
            console.log(table);
            for (var i = 1; i < rows.length; i++) {
                console.log(rows[i]);
                rows[i].remove();
            }
            $("<tr></tr>")
                .append("<td>attacker</td>")
                .append("<td>" + this.result.attacker_strength + "</td>")
                .append("<td>" + (this.result.attacker_win * 100).toFixed(2) + "%</td>")
                .append("<td>" + this.result.attacker_hp_exp.toFixed(3) + "</td>")
                .appendTo(table);
            $("<tr></tr>")
                .append("<td>defender</td>")
                .append("<td>" + this.result.defender_strength + "</td>")
                .append("<td>" + (this.result.defender_win * 100).toFixed(2) + "%</td>")
                .append("<td>" + this.result.defender_hp_exp.toFixed(3) + "</td>")
                .appendTo(table);
        };
        FreecivCalc.prototype.calc = function () {
            if (!this.loaded)
                return null;
            var attacker = this.units.copyUnit(this.attacker);
            var defender = this.units.copyUnit(this.defender);
            attacker.hp = +$("#attacker-current-hp").val();
            defender.hp = +$("#defender-current-hp").val();
            attacker.attack = +$("#attacker-strength").val();
            defender.defence = +$("#defender-strength").val();
            attacker.firepower = +$("#attacker-firepower").val();
            defender.firepower = +$("#defender-firepower").val();
            var adjustments = this.adjustments.check();
            this.calculator.set(attacker, defender, adjustments);
            var result = this.calculator.calc();
            this.result = result;
            this.showResult();
            return result;
        };
        return FreecivCalc;
    }());
    FreecivCalc_1.FreecivCalc = FreecivCalc;
    window.onload = function () {
        FreecivCalc_1.freecivcalc = new FreecivCalc();
    };
})(FreecivCalc || (FreecivCalc = {}));
