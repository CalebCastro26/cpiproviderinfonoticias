/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"cpiprovider/info.noticia/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
