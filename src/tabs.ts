module FreecivCalc{
	export class DetailTabs{
		tabTitle: any;
		tabContent: any;
		tabTemplate: string;
		tabCounter: number;
		tabList: Array<number>;
		tabs: any;
		constructor(){
			this.tabTitle = $( "#tab_title" );
			this.tabContent = $( "#result-template" ),
				this.tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>",
				this.tabCounter = 0;
			this.tabList = [0];
		}
		init(){
			var self = this;
			this.tabs = $( "#tabs" ).tabs();
			this.tabs.delegate( "span.ui-icon-close", "click", function() {
				var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
				$( "#" + panelId ).remove();
				var numid = +(panelId.split("-")[2]); // tab-detail-N
				for(var i=self.tabList.length-1; i>=0; i--){
					if(self.tabList[i] == numid){
						self.tabList.splice(i,1);
						break;
					}
				}
				self.tabs.tabs( "refresh" );
			});

			$( "#add-tab" ).click(this.addTab.bind(this));
			$( "#calc" ).click(()=>{
				this.tabCounter++;
			});
		}
		addTab() {
			var index = -1;
			for(var i=0; i<this.tabList.length; i++){
				if(this.tabList[i] == this.tabCounter) {
					index = i;
					break;
				}
			}
			if(index >= 0){
				// select tab
				this.tabs.tabs("option","active",index);
			}
			else{
				var result = JSON.parse($( "#calc" ).attr("data-result"));
				console.log(result);
				var label = this.tabTitle.val() || "<span class=\"label-tab-detail\">"+result.attacker_raw.label+" - "+result.defender_raw.label+"</span>",
					tabid = "tab-detail-" + this.tabCounter,
					li = $( this.tabTemplate.replace( /#\{href\}/g, "#" + tabid ).replace( /#\{label\}/g, label ) );

				this.tabs.find( ".ui-tabs-nav :nth-last-of-type(2)" ).after( li );
				console.log(this.tabs.find( ".ui-tabs-nav" ));

				var clone = $("#result-template").clone().css("display","block");
				this.setId(clone, this.tabCounter);
				var el = $("<div id='" + tabid + "'></div>").append(clone);
				this.tabs.append( el );
				this.tabs.tabs( "refresh" );
				this.createDetailResult(clone, result, this.tabCounter);
				this.tabList.push(this.tabCounter);
				this.tabs.tabs("option","active",this.tabList.length-1);
			}
		}
		setId(el, id){
			var attr = el.attr("id");
			if(attr !== undefined) el.attr("id", attr+"-"+id);
			var children = el.children();
			for(var i=0; i<children.length; i++){
				this.setId(children.eq(i),id);
			}
		}
		createDetailResult(el, result, id){
			// create unit detail
			$( "#attacker-detail-unitname"+"-"+id ).text(result.attacker_raw.label);
			$( "#attacker-detail-prob"+"-"+id ).text((result.attacker_win*100).toFixed(2)+"%");
			$( "#attacker-detail-exp"+"-"+id ).text(result.attacker_hp_exp.toFixed(3)+" / "+result.attacker_raw.hp);
			var table = $( "#attacker-detail"+"-"+id );
			table.find("#attacker-detail-hp"+"-"+id).text(result.attacker_raw.hp);
			table.find("#attacker-detail-attack-raw"+"-"+id).text(result.attacker_raw.attack);
			table.find("#attacker-detail-firepower-raw"+"-"+id).text(result.attacker_raw.firepower);
			table.find("#attacker-detail-attack-mod"+"-"+id).text(result.attacker_strength);
			table.find("#attacker-detail-firepower-mod"+"-"+id).text(result.attacker_fp);

			$( "#defender-detail-unitname"+"-"+id ).text(result.defender_raw.label);
			$( "#defender-detail-prob"+"-"+id ).text((result.defender_win*100).toFixed(2)+"%");
			$( "#defender-detail-exp"+"-"+id ).text(result.defender_hp_exp.toFixed(3)+" / "+result.defender_raw.hp);
			var table = $( "#defender-detail"+"-"+id );
			table.find("#defender-detail-hp"+"-"+id).text(result.defender_raw.hp);
			table.find("#defender-detail-defence-raw"+"-"+id).text(result.defender_raw.defence);
			table.find("#defender-detail-firepower-raw"+"-"+id).text(result.defender_raw.firepower);
			table.find("#defender-detail-defence-mod"+"-"+id).text(result.defender_strength);
			table.find("#defender-detail-firepower-mod"+"-"+id).text(result.defender_fp);

			// create adjustments table
			var table = $( "#adjustments-detail"+"-"+id);
			var effect_names = JSON.parse(table.attr("data-effects"));
			for(var i=0; i<result.adjustments.length; i++){
				var adj = result.adjustments[i];
				for(var ii=0; ii<adj.effect.length; ii++){
					var eff = adj.effect[ii];
					var tr = $("<tr></tr>");
					if(ii==0) tr.append("<td>"+adj.label+"</td>");
					else tr.append("<td></td>");
					tr.append("<td>"+effect_names[eff.type]+"</td>");
					tr.append("<td>"+eff.value+"</td>");
					tr.appendTo(table);
				}
			}
			// create charts
			var chartData = [];
			var a_exp = result.attacker_hp_exp_list;
			for(var i=a_exp.length-1; i>=0; i--){
				chartData.push({
					"hp": i,
					"prob": a_exp[i]*100
				});
			}
			var chart = this.createUnitHPExpChart(chartData);
			chart.write("chart-exp-attacker"+"-"+id);

			var chartData = [];
			var d_exp = result.defender_hp_exp_list;
			for(var i=d_exp.length-1; i>=0; i--){
				chartData.push({
					"hp": i,
					"prob": d_exp[i]*100
				});
			}
			var chart = this.createUnitHPExpChart(chartData);
			chart.write("chart-exp-defender"+"-"+id);
		}
		createUnitHPExpChart(chartData){
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
		}
	}
}
