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
                label_detail: unit.label_detail,
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
                var dsc = flags[i].description ? flags[i].description : null;
                var f = { id: flags[i].id, label: flags[i].label, description: dsc, value: false };
                this._flags[f.id] = f;
            }
        };
        FlagManager.prototype.set = function (key, value) {
            if (!this._flags[key])
                throw new Error("flag \"" + key + "\" not exists");
            this._flags[key].value = value;
        };
        FlagManager.prototype.get = function (key) {
            if (this._flags[key])
                return this._flags[key];
            return null;
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
                var tmp = { id: adj.id, label: adj.label, condition: null, effect: adj.effect };
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
                    var tmp = { id: adj.id, label: adj.label, effect: [] };
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
                    return _this.freecivcalc.flagmanager.get(arg).value;
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
/// <reference path="unit.ts" />
/// <reference path="veteranlevel.ts" />
/// <reference path="terrain.ts" />
/// <reference path="flags.ts" />
/// <reference path="adjustment.ts" />
/// <reference path="../typings/main.d.ts" />
var FreecivCalc;
(function (FreecivCalc) {
    // load JSON files
    // TODO: define interface of JSON items
    var Loader = (function () {
        function Loader() {
            this.units = [];
            this.unitclass = [];
            this.veteranlevel = [];
            this.terrains = [];
            this.flags = null;
            this.adjustments = [];
        }
        Loader.prototype.initByPath = function (path, cb) {
            var _this = this;
            if (cb === void 0) { cb = function (data) { }; }
            $.getJSON(path).done(function (data) {
                if (_this.setDataSet(data))
                    cb(data);
            });
        };
        Loader.prototype.initByObj = function (data, cb) {
            if (cb === void 0) { cb = function (data) { }; }
            if (this.setDataSet(data))
                cb(data);
        };
        Loader.prototype.setDataSet = function (data) {
            if (!this.validate(data))
                return false;
            this.meta = data.meta;
            this.units = data.units;
            this.unitclass = data.unitclass;
            this.veteranlevel = data.veteranlevel;
            this.terrains = data.terrains;
            this.flags = data.flags;
            this.adjustments = data.adjustments;
            return true;
        };
        Loader.prototype.validate = function (data) {
            if (!data)
                return false;
            if (!data.meta)
                return false;
            if (!data.units)
                return false;
            if (!data.unitclass)
                return false;
            if (!data.veteranlevel)
                return false;
            if (!data.terrains)
                return false;
            if (!data.flags)
                return false;
            if (!data.adjustments)
                return false;
            return true;
        };
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
var FreecivCalc;
(function (FreecivCalc) {
    var DetailTabs = (function () {
        function DetailTabs() {
            this.tabTitle = $("#tab_title");
            this.tabContent = $("#result-template"),
                this.tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>",
                this.tabCounter = 0;
            this.tabList = [0];
        }
        DetailTabs.prototype.init = function () {
            var _this = this;
            var self = this;
            this.tabs = $("#tabs").tabs();
            this.tabs.delegate("span.ui-icon-close", "click", function () {
                var panelId = $(this).closest("li").remove().attr("aria-controls");
                $("#" + panelId).remove();
                var numid = +(panelId.split("-")[2]); // tab-detail-N
                for (var i = self.tabList.length - 1; i >= 0; i--) {
                    if (self.tabList[i] == numid) {
                        self.tabList.splice(i, 1);
                        break;
                    }
                }
                self.tabs.tabs("refresh");
            });
            $("#add-tab").click(this.addTab.bind(this));
            $("#calc").click(function () {
                _this.tabCounter++;
            });
        };
        DetailTabs.prototype.addTab = function () {
            var index = -1;
            for (var i = 0; i < this.tabList.length; i++) {
                if (this.tabList[i] == this.tabCounter) {
                    index = i;
                    break;
                }
            }
            if (index >= 0) {
                // select tab
                this.tabs.tabs("option", "active", index);
            }
            else {
                var result = JSON.parse($("#calc").attr("data-result"));
                console.log(result);
                var label = this.tabTitle.val() || "<span class=\"label-tab-detail\">" + result.attacker_raw.label + " - " + result.defender_raw.label + "</span>", tabid = "tab-detail-" + this.tabCounter, li = $(this.tabTemplate.replace(/#\{href\}/g, "#" + tabid).replace(/#\{label\}/g, label));
                this.tabs.find(".ui-tabs-nav :nth-last-of-type(2)").after(li);
                var clone = $(document.importNode($("#result-template")[0].content, true));
                this.setId(clone, this.tabCounter);
                var el = $("<div id='" + tabid + "'></div>").append(clone);
                this.tabs.append(el);
                this.tabs.tabs("refresh");
                this.createDetailResult(clone, result, this.tabCounter);
                this.tabList.push(this.tabCounter);
                this.tabs.tabs("option", "active", this.tabList.length - 1);
            }
        };
        DetailTabs.prototype.setId = function (el, id) {
            var attr = el.attr("id");
            if (attr !== undefined)
                el.attr("id", attr + "-" + id);
            var children = el.children();
            for (var i = 0; i < children.length; i++) {
                this.setId(children.eq(i), id);
            }
        };
        DetailTabs.prototype.createDetailResult = function (el, result, id) {
            // create unit detail
            $("#attacker-detail-unitname" + "-" + id).text(result.attacker_raw.label);
            $("#attacker-detail-prob" + "-" + id).text((result.attacker_win * 100).toFixed(2) + "%");
            $("#attacker-detail-exp" + "-" + id).text(result.attacker_hp_exp.toFixed(3) + " / " + result.attacker_raw.hp);
            var table = $("#attacker-detail" + "-" + id);
            table.find("#attacker-detail-hp" + "-" + id).text(result.attacker_raw.hp);
            table.find("#attacker-detail-attack-raw" + "-" + id).text(result.attacker_raw.attack);
            table.find("#attacker-detail-firepower-raw" + "-" + id).text(result.attacker_raw.firepower);
            table.find("#attacker-detail-attack-mod" + "-" + id).text(result.attacker_strength);
            table.find("#attacker-detail-firepower-mod" + "-" + id).text(result.attacker_fp);
            $("#defender-detail-unitname" + "-" + id).text(result.defender_raw.label);
            $("#defender-detail-prob" + "-" + id).text((result.defender_win * 100).toFixed(2) + "%");
            $("#defender-detail-exp" + "-" + id).text(result.defender_hp_exp.toFixed(3) + " / " + result.defender_raw.hp);
            var table = $("#defender-detail" + "-" + id);
            table.find("#defender-detail-hp" + "-" + id).text(result.defender_raw.hp);
            table.find("#defender-detail-defence-raw" + "-" + id).text(result.defender_raw.defence);
            table.find("#defender-detail-firepower-raw" + "-" + id).text(result.defender_raw.firepower);
            table.find("#defender-detail-defence-mod" + "-" + id).text(result.defender_strength);
            table.find("#defender-detail-firepower-mod" + "-" + id).text(result.defender_fp);
            // create adjustments table
            var table = $("#adjustments-detail" + "-" + id);
            var effect_names = JSON.parse(table.attr("data-effects"));
            for (var i = 0; i < result.adjustments.length; i++) {
                var adj = result.adjustments[i];
                for (var ii = 0; ii < adj.effect.length; ii++) {
                    var eff = adj.effect[ii];
                    var tr = $("<tr></tr>");
                    if (ii == 0)
                        tr.append("<td>" + adj.label + "</td>");
                    else
                        tr.append("<td></td>");
                    tr.append("<td>" + effect_names[eff.type] + "</td>");
                    tr.append("<td>" + eff.value + "</td>");
                    tr.appendTo(table);
                }
            }
            // create charts
            var chartData = [];
            var a_exp = result.attacker_hp_exp_list;
            for (var i = a_exp.length - 1; i >= 0; i--) {
                chartData.push({
                    "hp": i,
                    "prob": a_exp[i] * 100
                });
            }
            var chart = this.createUnitHPExpChart(chartData);
            chart.write("chart-exp-attacker" + "-" + id);
            var chartData = [];
            var d_exp = result.defender_hp_exp_list;
            for (var i = d_exp.length - 1; i >= 0; i--) {
                chartData.push({
                    "hp": i,
                    "prob": d_exp[i] * 100
                });
            }
            var chart = this.createUnitHPExpChart(chartData);
            chart.write("chart-exp-defender" + "-" + id);
        };
        DetailTabs.prototype.createUnitHPExpChart = function (chartData) {
            // SERIAL CHART
            var chart = new AmCharts.AmSerialChart();
            chart.dataProvider = chartData;
            chart.categoryField = "hp";
            chart.startDuration = 1;
            chart.rotate = true;
            // AXES
            // category
            var categoryAxis = chart.categoryAxis;
            categoryAxis.labelRotation = 90;
            categoryAxis.gridPosition = "start";
            // value
            // in case you don't want to change default settings of value axis,
            // you don't need to create it, as one value axis is created automatically.
            // GRAPH
            var graph = new AmCharts.AmGraph();
            graph.valueField = "prob";
            graph.balloonText = "[[category]]: <b>[[value]]%</b>";
            graph.type = "column";
            graph.lineAlpha = 0;
            graph.fillAlphas = 0.8;
            chart.addGraph(graph);
            // CURSOR
            var chartCursor = new AmCharts.ChartCursor();
            chartCursor.cursorAlpha = 0;
            chartCursor.zoomable = false;
            chartCursor.categoryBalloonEnabled = false;
            chart.addChartCursor(chartCursor);
            chart.creditsPosition = "top-right";
            return chart;
        };
        return DetailTabs;
    }());
    FreecivCalc.DetailTabs = DetailTabs;
})(FreecivCalc || (FreecivCalc = {}));
/// <reference path="unit.ts" />
/// <reference path="veteranlevel.ts" />
/// <reference path="terrain.ts" />
/// <reference path="flags.ts" />
/// <reference path="adjustment.ts" />
/// <reference path="loader.ts" />
/// <reference path="calc.ts" />
/// <reference path="tabs.ts" />
/// <reference path="../typings/main.d.ts" />
var FreecivCalc;
(function (FreecivCalc_1) {
    var FreecivCalc = (function () {
        function FreecivCalc(dataset) {
            var _this = this;
            this.attacker = null;
            this.defender = null;
            this.attacker_vl = null;
            this.defender_vl = null;
            this.units = new FreecivCalc_1.UnitManager();
            this.veteranlevelmanager = new FreecivCalc_1.VeteranLevelManager();
            this.terrains = new FreecivCalc_1.TerrainManager();
            this.flagmanager = new FreecivCalc_1.FlagManager();
            this.adjustments = new FreecivCalc_1.AdjustmentManager(this);
            this.calculator = new FreecivCalc_1.BattleCalc();
            this.result = null;
            this.detailtabs = new FreecivCalc_1.DetailTabs();
            this.loaded = false;
            this.loader = new FreecivCalc_1.Loader();
            $("#display-error").text("");
            if (!dataset) {
                // load default dataset
                this.loader.initByPath($("#freecivcalc").attr("data-default-dataset-path"), function () {
                    _this.loaded = true;
                    _this.init();
                });
            }
            else if (typeof dataset == "string") {
                // load from path
                this.loader.initByPath(dataset, function () {
                    _this.loaded = true;
                    _this.init();
                });
            }
            else if (this.loader.validate(dataset)) {
                // load dataset object
                this.loader.initByObj(dataset, function () {
                    _this.loaded = true;
                    _this.init();
                });
            }
            else {
                // cant start freecivcalc
                $("#display-error").text("Error: Failed to load Dataset. cannot start FreecivCalc.");
            }
        }
        FreecivCalc.prototype.init = function () {
            var dest = $("#freecivcalc");
            var template = $("#freecivcalc-template");
            dest.empty();
            var clone = $(document.importNode(template[0].content, true));
            dest.append(clone);
            this.units.init(this.loader.unitclass, this.loader.units);
            this.veteranlevelmanager.init(this.loader.veteranlevel);
            this.terrains.init(this.loader.terrains);
            var f = this.loader.flags;
            var f_all = [];
            for (var k in f) {
                f_all = f_all.concat(f[k]);
            }
            this.flagmanager.init(f_all);
            this.adjustments.init(this.loader.adjustments);
            this.initElements();
            this.createConfigTab();
        };
        FreecivCalc.prototype.initElements = function () {
            var _this = this;
            this.detailtabs.init();
            this.createOptions();
            $(function () {
                // basic
                for (var i = 0; i < _this.loader.flags.basic.length; i++) {
                    var flag = _this.flagmanager.get(_this.loader.flags.basic[i].id);
                    var el = $("label[for=" + flag.id + "]");
                    if (flag.label)
                        el.text(flag.label);
                    if (flag.description)
                        el.attr("title", flag.description);
                }
                var ul = $("#list-structure");
                // structures
                for (var i = 0; i < _this.loader.flags.structure.length; i++) {
                    var flag = _this.flagmanager.get(_this.loader.flags.structure[i].id);
                    $("<li></li>")
                        .append($("<input>")
                        .attr("type", "checkbox")
                        .attr("id", flag.id))
                        .append($("<label></label>")
                        .text(flag.label)
                        .attr("for", flag.id)
                        .attr("title", flag.description ? flag.description : null))
                        .appendTo(ul);
                }
                // bases
                var bases = $("#flags-bases");
                for (var i = 0; i < _this.loader.flags.bases.length; i++) {
                    var flag = _this.flagmanager.get(_this.loader.flags.bases[i].id);
                    bases.append($("<input>")
                        .attr("type", "checkbox")
                        .attr("id", flag.id))
                        .append($("<label></label>")
                        .text(flag.label)
                        .attr("for", flag.id)
                        .attr("title", flag.description ? flag.description : null));
                }
                // roads
                var roads = $("#flags-roads");
                for (var i = 0; i < _this.loader.flags.roads.length; i++) {
                    var flag = _this.flagmanager.get(_this.loader.flags.roads[i].id);
                    roads.append($("<input>")
                        .attr("type", "checkbox")
                        .attr("id", flag.id))
                        .append($("<label></label>")
                        .text(flag.label)
                        .attr("for", flag.id)
                        .attr("title", flag.description ? flag.description : null));
                }
                // ex
                var ex = $("#flags-ex");
                for (var i = 0; i < _this.loader.flags.ex.length; i++) {
                    var flag = _this.flagmanager.get(_this.loader.flags.ex[i].id);
                    ex.append($("<input>")
                        .attr("type", "checkbox")
                        .attr("id", flag.id))
                        .append($("<label></label>")
                        .text(flag.label)
                        .attr("for", flag.id)
                        .attr("title", flag.description ? flag.description : null));
                }
                // all
                var f_all = [];
                for (var k in _this.loader.flags) {
                    f_all = f_all.concat(_this.loader.flags[k]);
                }
                var _loop_1 = function() {
                    var flag_1 = _this.flagmanager.get(f_all[i].id);
                    var el_1 = $("#" + flag_1.id);
                    el_1.change(function () {
                        _this.flagmanager.set(flag_1.id, el_1.prop("checked"));
                    });
                    _this.flagmanager.set(flag_1.id, el_1.prop("checked"));
                };
                for (var i = 0; i < f_all.length; i++) {
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
                    _this.flagmanager.set("in-city", false);
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
                var attacker_max_hp = $("#attacker-max-hp");
                var attacker_current_hp = $("#attacker-current-hp");
                attacker_max_hp.change(function () {
                    var maxhp = +attacker_max_hp.val();
                    attacker_current_hp.attr("max", maxhp);
                    //if(+attacker_current_hp.val() > maxhp) attacker_current_hp.val(maxhp).change();
                    attacker_current_hp.val(maxhp).change();
                });
                attacker_current_hp.change(function () {
                    if (+attacker_current_hp.val() > +attacker_max_hp.val())
                        attacker_current_hp.val(+attacker_max_hp.val()).change();
                });
                var defender_max_hp = $("#defender-max-hp");
                var defender_current_hp = $("#defender-current-hp");
                defender_max_hp.change(function () {
                    var maxhp = +defender_max_hp.val();
                    defender_current_hp.attr("max", maxhp);
                    // if(+defender_current_hp.val() > maxhp) defender_current_hp.val(maxhp).change();
                    defender_current_hp.val(maxhp).change();
                });
                defender_current_hp.change(function () {
                    if (+defender_current_hp.val() > +defender_max_hp.val())
                        defender_current_hp.val(+defender_max_hp.val()).change();
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
        FreecivCalc.prototype.createConfigTab = function () {
            var _this = this;
            $("#current-dataset").text(this.loader.meta.name);
            $("#current-dataset-freeciv-version").text(this.loader.meta.freeciv_version);
            // dataset download button
            var select = $("#select-dataset");
            var apply_selected = $("#selected-dataset-apply");
            var a = $("#dataset-download");
            select.change(function () {
                var option = select.find("option:selected");
                var url = option.val();
                var filename = url.match(".+/(.+?)([\?#;].*)?$")[1];
                a.attr("href", url);
                a.attr("target", "_blank");
                a.attr("download", filename);
                apply_selected.unbind("click");
                apply_selected.click(function () {
                    console.log(url);
                    FreecivCalc_1.freecivcalc = new FreecivCalc(url);
                });
            });
            select.change();
            var loadbutton = $("#dataset-load");
            var apply_loaded = $("#local-dataset-apply");
            var errordisplay = $("#display-error-local-dataset-load");
            loadbutton.change(function (e) {
                var files = e.target.files;
                var file = files[0];
                if (!file)
                    return;
                var reader = new FileReader();
                reader.onload = function (e) {
                    errordisplay.hide();
                    apply_loaded.prop("disabled", false);
                    apply_loaded.unbind("click");
                    apply_loaded.click(function () {
                        var data;
                        try {
                            data = JSON.parse(reader.result);
                            if (!_this.loader.validate(data))
                                throw new Error();
                            FreecivCalc_1.freecivcalc = new FreecivCalc(data);
                        }
                        catch (e) {
                            console.log("Error: failed to load dataset");
                            data = null;
                            errordisplay.show();
                        }
                    });
                };
                reader.readAsText(file);
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
            var table = $("#result-table");
            table.find("#attacker-result-strength").text(this.result.attacker_strength);
            table.find("#attacker-result-prob").text((this.result.attacker_win * 100).toFixed(2) + "%");
            table.find("#attacker-result-exp").text(this.result.attacker_hp_exp.toFixed(3));
            table.find("#defender-result-strength").text(this.result.defender_strength);
            table.find("#defender-result-prob").text((this.result.defender_win * 100).toFixed(2) + "%");
            table.find("#defender-result-exp").text(this.result.defender_hp_exp.toFixed(3));
        };
        FreecivCalc.prototype.calc = function () {
            if (!this.loaded)
                return null;
            var attacker = this.units.copyUnit(this.attacker);
            var defender = this.units.copyUnit(this.defender);
            attacker.hp = Math.max(+$("#attacker-current-hp").val(), 1);
            defender.hp = Math.max(+$("#defender-current-hp").val(), 1);
            attacker.attack = Math.max(+$("#attacker-strength").val(), 1);
            defender.defence = Math.max(+$("#defender-strength").val(), 1);
            attacker.firepower = Math.max(+$("#attacker-firepower").val(), 1);
            defender.firepower = Math.max(+$("#defender-firepower").val(), 1);
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
