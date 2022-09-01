/**
 * Created by MARCELO on 03/10/2017.
 */
sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/routing/History"
    ],
    function (Controller, History){//inicio de funciones generales
        "use strict";

        return Controller.extend("cp.iprovider.info.noticia.controller.BaseController", {//inicio de controller extend

            /**
             * Convenience method for accessing the Ruta server MVC.
             *
             * @public
             * @returns {String} the ruta Server for
             *          this component
             */
            getApiVSM: function () {
                return "./IPROVIDER_BACKEND/api/";
            },
            getBusyDialog: function() {
                var getDialog = sap.ui.getCore().byId("GlobalBusyDialog");

                if(!getDialog) {
                    var oBusyDialog_Global = new sap.m.BusyDialog("GlobalBusyDialog");
                    getDialog = sap.ui.getCore().byId("GlobalBusyDialog");

                }
                return getDialog;
            },

            /**
             * Convenience method for getting the view model by name in every controller of the application.
             * @public
             * @param {string} sName the model name
             * @returns {sap.ui.model.Model} the model instance
             */
            getModel : function (sName) {
                return this.getView().getModel(sName);
            },

            /**
             * Convenience method for setting the view model in every controller of the application.
             * @public
             * @param {sap.ui.model.Model} oModel the model instance
             * @param {string} sName the model name
             * @returns {sap.ui.mvc.View} the view instance
             */
            setModel : function (oModel, sName) {
                return this.getView().setModel(oModel, sName);
            },

            /**
             * Convenience method for accessing the server ODATA.
             *
             * @public
             * @returns {sap.ui.model.odata.ODataModel} the ruta Server ODATA for
             *          this component
             */
            getODataModel : function() {
                var rutaServidor = this.getOwnerComponent().getModel().sServiceUrl;
                var serviceModel = new sap.ui.model.odata.ODataModel(rutaServidor);
                return serviceModel;
            },
            /**
             * Convenience method for getting the resource bundle.
             * @public
             * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
             */
            getResourceBundle : function (sKey) {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey);
            },
            getCloneObject: function(data) {
            return JSON.parse(JSON.stringify(data));
        }
        });//fin de controller extend
    }// fin de funciones generales
);