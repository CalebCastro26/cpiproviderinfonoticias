sap.ui.define(["cp/iprovider/info/noticia/controller/BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "./utilities",
    "sap/ui/core/routing/History"
], function (BaseController, MessageBox, Utilities, History) {
    "use strict";

    return BaseController.extend("cp.iprovider.info.noticia.controller.Dialog1", {
        setRouter: function (oRouter) {
            this.oRouter = oRouter;

        },
        getBindingParameters: function () {
            return {};

        },
        _onButtonPress13: function () {
            var oDialog = this.getView().getContent()[0];
            var that = this;
            //Guardar documento
            var oIndex = this.getView().getParent().byId("idIconTabBar").getSelectedKey();
            var oTipoInfo = {};
            oTipoInfo.idTipoInformacionNoticia = oIndex;
            var oData = this.getModel("newInfo").getData();
            if (oData.titulo !== '' && oData.contenido !== '') {
                oData.tipoInformacionNoticia = oTipoInfo;
                sap.m.MessageBox.confirm(that.getResourceBundle("GLOBAL.message.save.confirmacion"),
                    function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            if (oData.idInformacionNoticia) {
                                that.edit(oData);
                            } else {
                                that.save(oData);
                            }
                        }
                        that.initNewData();
                    }, that.getResourceBundle("GLOBAL.message.confirmacion"));
            } else {
                that.getView().setModel(new sap.ui.model.json.JSONModel(), "newInfo");
                sap.m.MessageBox.alert(this.getResourceBundle("GLOBAL.message.validacion"), {
                    title: this.getResourceBundle("GLOBAL.message.confirmacion")
                });
            }
            return new Promise(function (fnResolve) {
                oDialog.attachEventOnce("afterClose", null, fnResolve);
                oDialog.close();
            });

        },
        _onButtonPress14: function () {
            var oDialog = this.getView().getContent()[0];


            this.getView().setModel(new sap.ui.model.json.JSONModel(), "newInfo");
            return new Promise(function (fnResolve) {
                oDialog.attachEventOnce("afterClose", null, fnResolve);
                oDialog.close();
            });

        },
        onInit: function () {
            this.mBindingOptions = {};
            this._oDialog = this.getView().getContent()[0];

            this.initNewData();

        },
        initNewData: function () {
            var oData = {};
            oData.titulo = '';
            oData.contenido = '';
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(oData);
            this.getView().setModel(oModel, "newInfo");
        },
        onExit: function () {
            this._oDialog.destroy();

        },
        save: function (data) {
            var url =  this.getApiVSM() + "informacion-noticia";
            var that = this;
            var getDialog = that.getBusyDialog();
            getDialog.open();
            $.ajax({
                context: that,
                url: url,
                type: 'POST',
                data: JSON.stringify(data),
                dataType: 'json',
                contentType: "application/json",
                headers: { "Accept": "application/json" },
                success: function (result) {
                    getDialog.close();
                    if (result.data) {
                        var oData = that.getView().getModel("InfoNoticiaByTipo").getData();
                        oData.push(result.data);
                        that.getView().getModel("InfoNoticiaByTipo").refresh();
                        sap.m.MessageBox.success(that.getResourceBundle("GLOBAL.message.save.success"), {
                            title: that.getResourceBundle("GLOBAL.message.confirmacion")
                        });
                    } else {
                        sap.m.MessageBox.warning(result.message, {
                            title: that.getResourceBundle("GLOBAL.message.titulo.advertencia")
                        });
                    }
                },
                error: function (e) {
                    getDialog.close();
                    var response = "";
                    if (e.responseJSON && e.responseJSON.message) {
                        response = e.responseJSON.message;
                    } else {
                        response = "Error en el servidor, consulte el LOG del sistema";
                    }
                    sap.m.MessageBox.warning(response, {
                        title: that.getResourceBundle("GLOBAL.message.titulo.advertencia")
                    });
                }
            });
        },
        edit: function (data) {
            var url = this.getApiVSM() + "informacion-noticia";
            var that = this;
            var getDialog = that.getBusyDialog();
            getDialog.open();
            $.ajax({
                url: url,
                type: "PUT",
                data: JSON.stringify(data),
                dataType: "json",
                contentType: "application/json",
                header: { "Accept": "application/json" },
                success: function (result) {
                    getDialog.close();
                    if (result.data) {
                        that.updateInfoNoticiaByTipo(result.data);
                        sap.m.MessageBox.success(that.getResourceBundle("GLOBAL.message.save.success"), {
                            title: that.getResourceBundle("GLOBAL.message.confirmacion")
                        });
                    } else {
                        sap.m.MessageBox.warning(result.message, {
                            title: that.getResourceBundle("GLOBAL.message.titulo.advertencia")
                        });
                    }

                },
                error: function (e) {
                    getDialog.close();
                    var response = "";
                    if (e.responseJSON && e.responseJSON.message) {
                        response = e.responseJSON.message;
                    } else {
                        response = "Error en el servidor, consulte el LOG del sistema";
                    }
                    sap.m.MessageBox.warning(that.getResourceBundle("GLOBAL.request.error") + response, {
                        title: that.getResourceBundle("GLOBAL.message.titulo.advertencia")
                    });
                }
            });
        },
        updateInfoNoticiaByTipo: function (data) {
            var okeySelected = data.tipoInformacionNoticia.idTipoInformacionNoticia;
            var url = this.getApiVSM() + "informacion-noticia/" + okeySelected;
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.loadData(url);
            this.getView().getParent().setModel(oModel, "InfoNoticiaByTipo");
        }
    });
}, /* bExport= */true);