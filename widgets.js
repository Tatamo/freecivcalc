(function( $ ) {
	$.widget( "custom.combobox", {
		options: {
			list: [],
			select: function(e,data){}
		},
		_map: {},
		_create: function() {
			this.wrapper = $( "<span>" )
				.addClass( "custom-combobox" )
				.insertAfter( this.element );

			this._createOptions();
			this.element.hide();
			this._createAutocomplete();
			this._createShowAllButton();
		},
		_createOptions: function() {
			$( "<option>" )
				.appendTo(this.element)
				.val( "" )
				.text( "select unit..." );
			for(var i=0; i<this.options.list.length; i++){
				var item = this.options.list[i];
				$( "<option>" )
					.appendTo(this.element)
					.val( item.id )
					.text( item.label_detail );
				this._map[item.id] = i;
			}
		},
		_createAutocomplete: function() {
			var selected = this.element.children( ":selected" ),
				value = selected.val() ? selected.text() : "";

			this.input = $( "<input>" )
				.appendTo( this.wrapper )
				.val( value )
				.attr( "title", "" )
				.addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
				.autocomplete({
					delay: 0,
					minLength: 0,
					source: $.proxy( this, "_source" )
				})
				.tooltip({
					tooltipClass: "ui-state-highlight"
				});

			this._on( this.input, {
				autocompleteselect: function( event, ui ) {
					ui.item.option.selected = true;
					this._trigger( "select", event, {
						item: ui.item.option
					});
				},

				autocompletechange: "_removeIfInvalid"
			});
		},

		_createShowAllButton: function() {
			var input = this.input,
				wasOpen = false;

			$( "<a>" )
				.attr( "tabIndex", -1 )
				.attr( "title", "Show All Items" )
				.tooltip()
				.appendTo( this.wrapper )
				.button({
					icons: {
						primary: "ui-icon-triangle-1-s"
					},
					text: false
				})
				.removeClass( "ui-corner-all" )
				.addClass( "custom-combobox-toggle ui-corner-right" )
				.mousedown(function() {
					wasOpen = input.autocomplete( "widget" ).is( ":visible" );
				})
				.click(function() {
					input.focus();

					// Close if already visible
					if ( wasOpen ) {
						return;
					}

					// Pass empty string as value to search for, displaying all results
					input.autocomplete( "search", "" );
				});
		},

		_source: function( request, response ) {
			var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
			var _self = this;
			response( this.element.children( "option" ).map(function() {
				var data = this.value?_self.options.list[_self._map[this.value]]:{};
				if ( this.value && ( !request.term || (function(list){
					for(var i=0; i<list.length; i++){
						if(matcher.test(list[i])) return true;
					}
					if(matcher.test(data.label_detail)) return true;
					return false;
				}( data.pronunciation )) ) )
					return {
						label: data.label_detail,
						value: data.value,
						option: this
					};
			}) );
		},
		_removeIfInvalid: function( event, ui ) {

			// Selected an item, nothing to do
			if ( ui.item ) {
				return;
			}

			// Search for a match (case-insensitive)
			var value = this.input.val(),
				valueLowerCase = value.toLowerCase(),
				valid = false;
			this.element.children( "option" ).each(function() {
				if ( $( this ).text().toLowerCase() === valueLowerCase ) {
					this.selected = valid = true;
					return false;
				}
			});

			// Found a match, nothing to do
			if ( valid ) {
				return;
			}

			// the value is "", do not open tooltip
			if(!value) {
				this.input.val("");
				this.element.val( "" );
				return;
			}

			// Remove invalid value
			this.input
				.val( "" )
				.attr( "title", value + " didn't match any item" )
				.tooltip( "open" );
			this.element.val( "" );
			this._delay(function() {
				this.input.tooltip( "close" ).attr( "title", "" );
			}, 2500 );
			this.input.autocomplete( "instance" ).term = "";
		},

		_destroy: function() {
			this.wrapper.remove();
			this.element.show();
		}
	});
	$.widget( "custom.dataselect", {
		options: {
			list: [],
			select: function(e,data){}
		},
		_create: function() {
			this._createOptions();
			var _self = this;
			this.element.selectmenu({
				select: function( event, data ){
					_self.options.select(event, data);
				}
			});
			// 最初はselectイベントが発火されないので手動で行う
			var options = this.element.children("option");
			if(options.length > 0) {
				this._trigger( "select", event, {
					item: options[0]
				});
			}
		},
		_createOptions: function() {
			for(var i=0; i<this.options.list.length; i++){
				var item = this.options.list[i];
				var option = $( "<option>" )
					.appendTo(this.element)
					.val( item.id )
					.text( item.label );
			}
		}
	});
})( jQuery );

$(function() {
	
	$( document ).tooltip();
});
