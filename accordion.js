

angular.module('vd.directive.accordion', [])
	/**
	 * 
	 */
	.directive('vdAccordion', function() {
		"use strict";

		return {
			restrict:'AE',
			replace: true,
			transclude: true,
			controller: function($scope, $element, $attrs) {
				$scope.panes = [];
				$scope.openedPanes = [];

				/**
				 * register a pane to the accordion
				 * @param pane : the pane to register
				 */
				this.addPane = function(pane) {
					$scope.panes.push(pane);
				};

				/**
				 * Open a given pane. If the attribute close-all exist in the <accordion> tag,
				 * The last open pane is closed
				 * @param pane : the given pane
				 */
				this.open = function(pane) {

					// Close all panes if needed
					if (angular.isDefined($attrs.closeAll)) {
						angular.forEach($scope.openedPanes, function(p) {
							if (!angular.equals(p, pane)) {
								p.opened = false;
							}
						});
						$scope.openedPanes = [];

					}
					$scope.$apply();

					// Open the pane
					pane.opened = !pane.opened;
					if (pane.opened) {
						$scope.openedPanes.push(pane);
					}
				};
			},
			template: '<div class="accordion" ng-transclude></div>'
		};
	})
	.directive('vdAccordionPane', function($compile) {
		"use strict";
		
		return {
			restrict:'AE',
			require: '^vdAccordion',
			transclude: true,
			scope: true,
			replace: true,
			controller: function($scope) {
				$scope.opened = false;
			},
			link: function(scope, element, attrs, accordionCtrl) {
				
				var REGEXP = /^\s*(.+)\s+in\s+(.*)\s*$/;

				// for repeated panes, get the template and creates the needed panes
				if (attrs.repeat) {
					var parent = element[0].parentNode;

					// get The template transcluded
					var template = element[0].childNodes;

					// Remove the "template pane"
					element[0].parentNode.removeChild(element[0]);

					// Watches the collection, and add panes
					var match = attrs.repeat.match(REGEXP);
					var itemName = match[1];
					var collection = match[2];

					// TODO : save the list of existing panes and remove or add only
					// the panes needed
					scope.$watch(collection, function(items) {
						if (angular.isUndefined(items) || items === null) {
							return;
						}

						for(var i=0, n=items.length; i < n; i++) {

							var item = items[i];
							var childScope = scope.$new();
							childScope[itemName] = item;

							var tpl = document.createElement('vd-accordion-pane');
							
							for(var j=0; j < template.length; j++) {
								tpl.appendChild(template[j].cloneNode(true));
							}
							parent.appendChild(tpl);
							tpl.querySelectorAll('.accordion-content')[0].setAttribute('ng-non-bindable', '');
							
							$compile(tpl)(childScope);
						}
					}, true);

				} else {
					// Register the pane to the accordion
					accordionCtrl.addPane(scope);

					// Open the pane via the accordion
					scope.open = function() {
						accordionCtrl.open(scope);
					};

					// Open/close the accordion by clicking on the head
					element[0].querySelectorAll('.accordion-head')[0].addEventListener('click', function() {
						scope.open(scope);
						scope.$apply();
					});

					var content = element[0].querySelectorAll('.accordion-content')[0];
					var isNonBindable = content.hasAttribute('ng-non-bindable');
					// Apply CSS3 animation when the pane is opened / closed
					scope.$watch('opened', function(opened) {
						if (opened) {
							if (isNonBindable) {
								content.removeAttribute('ng-non-bindable');
								$compile(content)(scope);
								isNonBindable = false;
							}
							content.classList.add('slide-in-setup');
							setTimeout(function() {
								content.classList.add('slide-in-start');
							});
							
						} else {
							content.classList.remove('slide-in');
							setTimeout(function() {
								content.classList.remove('slide-in-start');
							});
						}
					});
				}
			},
			template: '<div ng-transclude></div>'
		};
	});