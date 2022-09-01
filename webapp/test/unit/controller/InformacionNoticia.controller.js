/*global QUnit*/

sap.ui.define([
	"cpiprovider/info.noticia/controller/InformacionNoticia.controller"
], function (Controller) {
	"use strict";

	QUnit.module("InformacionNoticia Controller");

	QUnit.test("I should test the InformacionNoticia controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
