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
				id = "tabs-" + tabCounter,
				li = $( tabTemplate.replace( /#\{href\}/g, "#" + id ).replace( /#\{label\}/g, label ) ),
				tabContentHtml = tabContent.val() || "Tab " + tabCounter + " content.";

			tabs.find( ".ui-tabs-nav" ).append( li );

			var clone = $("#result-template").clone().css("display","block");
			setId(clone, tabCounter);
			//tabs.append( "<div id='" + id + "'><p>" + tabContentHtml + "</p></div>" );
			var el = $("<div id='" + id + "'></div>").append(clone);
			tabs.append( el );
			tabs.tabs( "refresh" );
			tabList.push(tabCounter);
			tabs.tabs("option","active",tabList.length-1);
		}
	}
	function setId(el, id){
		console.log(el);
		var attr = el.attr("id");
		if(attr !== undefined) el.attr("id", attr+"-"+id);
		var children = el.children();
		for(var i=0; i<children.length; i++){
			setId(children.eq(i),id);
		}
	}
	function createDetailResult(el, result, id){
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
