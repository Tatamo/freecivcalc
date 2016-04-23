// Tab
$(function() {
	var tabTitle = $( "#tab_title" ),
		tabContent = $( "#result-template" ),
		tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>",
		tabCounter = 0;
	var tabList = [0];

	var tabs = $( "#tabs" ).tabs();

	// actual addTab function: adds new tab using the input from the form above
	function addTab() {
		console.log("addtab");
		var index = -1;
		for(var i=0; i<tabList.length; i++){
			if(tabList[i] == tabCounter) {
				index = i;
				break;
			}
		}
		console.log("index",index);
		if(index >= 0){
			// select tab
			tabs.tabs("option","active",index);
		}
		else{
			var result = JSON.parse($( "#calc" ).attr("data-result"));
			console.log(result);
			var label = tabTitle.val() || "Tab " + tabCounter,
				tabid = "tabs-" + tabCounter,
				li = $( tabTemplate.replace( /#\{href\}/g, "#" + tabid ).replace( /#\{label\}/g, label ) ),
				tabContentHtml = tabContent.val() || "Tab " + tabCounter + " content.";

			tabs.find( ".ui-tabs-nav" ).append( li );

			var clone = $("#result-template").clone().css("display","block");
			setId(clone, tabCounter);
			//tabs.append( "<div id='" + tabid + "'><p>" + tabContentHtml + "</p></div>" );
			var el = $("<div id='" + tabid + "'></div>").append(clone);
			tabs.append( el );
			tabs.tabs( "refresh" );
			createDetailResult(clone, result, tabCounter);
			tabList.push(tabCounter);
			tabs.tabs("option","active",tabList.length-1);
		}
	}
	function setId(el, id){
		var attr = el.attr("id");
		if(attr !== undefined) el.attr("id", attr+"-"+id);
		var children = el.children();
		for(var i=0; i<children.length; i++){
			setId(children.eq(i),id);
		}
	}
	function createDetailResult(el, result, id){
		// create unit detail
		$( "#attacker-detail-unitname"+"-"+id ).text(result.attacker_raw.label);
		var table = $( "#attacker-detail"+"-"+id );
		table.find("#attacker-detail-hp"+"-"+id).text(result.attacker_raw.hp);
		table.find("#attacker-detail-attack-raw"+"-"+id).text(result.attacker_raw.attack);
		table.find("#attacker-detail-firepower-raw"+"-"+id).text(result.attacker_raw.firepower);
		table.find("#attacker-detail-attack-mod"+"-"+id).text(result.attacker_strength);
		table.find("#attacker-detail-firepower-mod"+"-"+id).text(result.attacker_fp);
		// create adjustments table
		var table = $( "#adjustments-detail"+"-"+id);
		var effect_names = JSON.parse(table.attr("data-effects"));
		for(var i=0; i<result.adjustments.length; i++){
			var adj = result.adjustments[i];
			for(var ii=0; ii<adj.effect.length; ii++){
				var eff = adj.effect[ii];
				var tr = $("<tr></tr>");
				if(ii==0) tr.append("<td>"+adj.name+"</td>");
				else tr.append("<td></td>");
				tr.append("<td>"+effect_names[eff.type]+"</td>");
				tr.append("<td>"+eff.value+"</td>");
				tr.appendTo(table);
			}
		}
		$( "#defender-detail-unitname"+"-"+id ).text(result.defender_raw.label);
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
				if(ii==0) tr.append("<td>"+adj.name+"</td>");
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
		var chart = createUnitHPExpChart(chartData);
		chart.write("chart-exp-attacker-"+id);

		var chartData = [];
		var d_exp = result.defender_hp_exp_list;
		for(var i=d_exp.length-1; i>=0; i--){
			chartData.push({
				"hp": i,
				"prob": d_exp[i]*100
			});
		}
		var chart = createUnitHPExpChart(chartData);
		chart.write("chart-exp-defender"+"-"+id);
	}
	function createUnitHPExpChart(chartData){
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
	// close icon: removing the tab on click
	tabs.delegate( "span.ui-icon-close", "click", function() {
		var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
		$( "#" + panelId ).remove();
		console.log("panelId",panelId);
		var numid = +(panelId.split("-")[1]);
		for(var i=tabList.length-1; i>=0; i--){
			if(tabList[i] == numid){
				tabList.splice(i,1);
				break;
			}
		}
		tabs.tabs( "refresh" );
	});

	$( "#add-tab" ).click(addTab);
	$( "#calc" ).click(function(){
		tabCounter++;
	});
});
