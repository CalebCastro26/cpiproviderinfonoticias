sap.ui.define(["cp/iprovider/info/noticia/controller/BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "./utilities",
    'sap/m/MessageToast',
    "sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, MessageToast, History) {
    "use strict";

        return BaseController.extend("cp.iprovider.info.noticia.controller.InformacionNoticia", {
            handleRouteMatched: function (oEvent) {

                var oParams = {};
    
                if (oEvent.mParameters.data.context) {
                    this.sContext = oEvent.mParameters.data.context;
                    var oPath;
                    if (this.sContext) {
                        oPath = { path: "/" + this.sContext, parameters: oParams };
                        this.getView().bindObject(oPath);
                    }
                }
            },
            _onButtonPressAdd: function (oEvent) { // AGREGAR
    
                var sDialogName = "Dialog1";
                this.mDialogs = this.mDialogs || {};
                var oDialog = this.mDialogs[sDialogName];
                var oView;
    
                var oIndex = this.getView().byId("idIconTabBar").getSelectedKey();
                var oData = this.getView().getModel("TipoInfoNoticias").getData()[oIndex - 1];
    
                if (!oDialog) {
                    this.getOwnerComponent().runAsOwner(function () {
                        oView = sap.ui.xmlview({ viewName: "cp.iprovider.info.noticia.view." + sDialogName });
                        this.getView().addDependent(oView);
                        oView.getController().setRouter(this.oRouter);
                        oDialog = oView.getContent()[0];
                        this.mDialogs[sDialogName] = oDialog;
                    }.bind(this));
                }
    
                return new Promise(function (fnResolve) {
                    oDialog.attachEventOnce("afterOpen", null, fnResolve);
                    oDialog.open();
                    if (oView) {
                        oDialog.attachAfterOpen(function () {
                            oDialog.rerender();
                        });
                    } else {
                        oView = oDialog.getParent();
                    }
    
                    var oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData(oData);
                    this.getView().setModel(oModel, "tipoInfoSelectedKey");
                    oView.setModel(oModel, "tipoInfoSelectedKey");
    
                }.bind(this)).catch(function (err) { if (err !== undefined) { MessageBox.error(err.message); } });
    
            },
            _onButtonPressEdit: function (oEvent) {
    
                var that = this;
                var aItems = this.getView().byId("idTableInfoNoticia").getSelectedItems();
                if (aItems.length === 0) {
                    sap.m.MessageBox.alert(this.getResourceBundle("GLOBAL.message.noSelectionItem"), {
                        title: this.getResourceBundle("GLOBAL.message.alert")
                    });
                } else {
                    sap.m.MessageBox.confirm(this.getResourceBundle("GLOBAL.message.edit.confirmacion"), function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            that.openDialogEdit(oEvent, aItems[0]);
                        }
                    }, this.getResourceBundle("GLOBAL.message.confirmacion"));
                }
            },
            _onButtonPressDelete: function (oEvent) {
    
                var oSource = oEvent.getSource();
                var oSourceBindingContext = oSource.getBindingContext();
    
                var that = this;
                var aItems = this.getView().byId("idTableInfoNoticia").getSelectedItems();
                if (aItems.length === 0) {
                    sap.m.MessageBox.alert(this.getResourceBundle("GLOBAL.message.noSelectionItem"), {
                        title: this.getResourceBundle("GLOBAL.message.alert")
                    });
                } else {
                    sap.m.MessageBox.confirm(this.getResourceBundle("GLOBAL.message.delete.confirmacion"),
                        function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.OK) {
                                aItems.forEach(function (oItem) {
                                    that.onDelete(oItem);
                                });
                            }
                        },
                        this.getResourceBundle("GLOBAL.message.confirmacion"));
                }
    
                return new Promise(function (fnResolve, fnReject) {
                    if (oSourceBindingContext) {
                        var oModel = oSourceBindingContext.getModel();
                        oModel.remove(oSourceBindingContext.getPath(), {
                            success: function () {
                                oModel.refresh();
                                fnResolve();
                            },
                            error: function () {
                                oModel.refresh();
                                fnReject(new Error("remove failed"));
                            }
                        });
                    }
                }).catch(function (err) { if (err !== undefined) { MessageBox.error(err.message); } });
    
            },
            loadTipoInfoNoticia: function(){
                var oModel = new sap.ui.model.json.JSONModel();
                var url = this.getApiVSM() + "tipo-informacion-noticia";
                oModel.loadData(url, null, false);
                this.getView().setModel(oModel, "TipoInfoNoticias");
            },
            initIconTabBarFilter: function(){
                var oData = this.getModel("TipoInfoNoticias").getData()[0];
                var url = this.getApiVSM()+"informacion-noticia/"+oData.idTipoInformacionNoticia;
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.loadData(url, null, false);
                this.getView().setModel(oModel, "InfoNoticiaByTipo");
            },
            onInit: function () {
                this.mBindingOptions = {};
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.oRouter.getTarget("InformacionNoticia").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

                this.loadTipoInfoNoticia();
                this.initIconTabBarFilter();
            },
            handleIconTabBarSelect: function (oEvent) {
                var tbInformacion = this.byId("idTableInfoNoticia");
                tbInformacion.setBusy(true);
                var okeySelected = oEvent.getParameters().key;
                var url = this.getApiVSM() + "informacion-noticia/" + okeySelected;
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.loadData(url, null, false);
                this.getView().setModel(oModel, "InfoNoticiaByTipo");
                tbInformacion.setBusy(false);
            },
            onDelete: function (oItem) {
                var url = this.getApiVSM() + "informacion-noticia";
                var sPath = oItem.getBindingContext("InfoNoticiaByTipo").getPath();
                var data = this.getView().getModel("InfoNoticiaByTipo").getProperty(sPath);
                var that = this;
                var getDialog = that.getBusyDialog();
                getDialog.open();
                $.ajax({
                    url: url,
                    type: "DELETE",
                    data: JSON.stringify(data),
                    dataType: 'json',
                    contentType: "application/json",
                    headers: {
                        "Accept": "application/json"
                    },
                    success: function (result) {
                        getDialog.close();
                        that.getView().getModel("InfoNoticiaByTipo").getData().splice(sPath.split("/")[1], 1);
                        that.getView().getModel("InfoNoticiaByTipo").refresh();
                        sap.m.MessageBox.success(that.getResourceBundle("GLOBAL.message.delete.success"), {
                            title: that.getResourceBundle("GLOBAL.message.confirmacion")
                        });
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
            openDialogEdit: function (oEvent, oItem) {
                var sDialogName = "Dialog1";
                this.mDialogs = this.mDialogs || {};
                var oDialog = this.mDialogs[sDialogName];
                var oView;
                var that = this;
    
                var sPath = oItem.getBindingContext("InfoNoticiaByTipo").getPath();
                var oData = this.getView().getModel("InfoNoticiaByTipo").getProperty(sPath);
    
                var oIndex = this.getView().byId("idIconTabBar").getSelectedKey();
                var data = this.getView().getModel("TipoInfoNoticias").getData()[oIndex - 1];
                var model = new sap.ui.model.json.JSONModel();
                model.setData(data);
                this.getView().setModel(model, "tipoInfoSelectedKey");
    
                if (!oDialog) {
                    this.getOwnerComponent().runAsOwner(function () {
                        oView = sap.ui.xmlview({ viewName: "cp.iprovider.info.noticia.view." + sDialogName });
                        this.getView().addDependent(oView);
                        oView.getController().setRouter(this.oRouter);
                        oDialog = oView.getContent()[0];
                        this.mDialogs[sDialogName] = oDialog;
                    }.bind(this));
                }
    
                return new Promise(function (fnResolve) {
                    oDialog.attachEventOnce("afterOpen", null, fnResolve);
                    oDialog.open();
                    if (oView) {
                        oDialog.attachAfterOpen(function () {
                            oDialog.rerender();
                        });
                    } else {
                        oView = oDialog.getParent();
                    }
    
                    var oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData(that.getCloneObject(oData));
                    oView.setModel(oModel, 'newInfo');
    
                }.bind(this)).catch(function (err) { if (err !== undefined) { sap.m.MessageBox.error(err.message); } });
            },
            uploadStart: function (oEvent) {
                var tblCatalogos = this.byId('idTableInfoNoticia');
                tblCatalogos.setBusy(true);
            },
            handleUploadComplete: function (oEvent) {
                var status = oEvent.getParameters().status,
                    response = (oEvent.getParameters().responseRaw === '') ? "" : JSON.parse(oEvent.getParameters().responseRaw),
                    tblCatalogos = this.byId('idTableInfoNoticia');
    
                if (status === 400) {
                    sap.m.MessageBox.error("" + response.message);
                    tblCatalogos.setBusy(false);
                    return;
                }
                oEvent.getSource().setValue("");
                this.loadInformacionBytipo();
    
                tblCatalogos.setBusy(false);
                sap.m.MessageToast.show("Archivo adjuntado!");
            },
            loadInformacionBytipo: function () {
                var oIndex = this.getView().byId("idIconTabBar").getSelectedKey();
                var url = this.getApiVSM() + "informacion-noticia/" + oIndex;
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.loadData(url, null, false);
                this.getView().setModel(oModel, "InfoNoticiaByTipo");
            },
            uploadComplete: function (oEvent) {
                var that = this;
                var oFormData = new FormData();
                if (oEvent.getParameter("files")[0] !== undefined) {
                    oFormData.append("files", oEvent.getParameter("files")[0]);
                    oFormData.append("bucket", "stg-iprovider-dev");
                    oFormData.append("ruta", "Informacion/adjunto");
                    oFormData.append("proyecto", "iprovider");
                    oFormData.append("idInformacionNoticia", oEvent.getSource().getParent().getBindingContext("InfoNoticiaByTipo").getObject().idInformacionNoticia);
                    debugger
                    jQuery.ajax({
                        url: "./GCP_REPOSITORY/subir-archivo",
                        data: oFormData,
                        cache: false,
                        contentType: false,
                        processData: false,
                        enctype: 'multipart/form-data',
                        headers: {
                            'Authorization': "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJJUFJPVklERVItQVBQIiwiaWF0IjoxNjU5NjM0OTE4LCJleHAiOjE2OTExNzA5MTgsImlzcyI6IkNlbWVudG9zIFBhY2FtYXlvIFMuQS5BLiJ9.VIjFNfl8ehdgdUXk_8YcfZlKxmDZPKlGbtrsE2wFjzPwfK6vIZrYZ1VfoX5evWHHQObC0IJzOui0tCAW8ZOWP93mJEs_MgF9gMDcXPp-RYUsITyk6MLOviWOzJ2nV0zKA4FlpHUlCSxrJEWPH98gi48g3PmPrQ2u4cQuQjHg6IrQeVniZmLV0y0RCB2qZUR0CCLiERjZBekAOCg1YW0hR9t9lSpyG8NCZWoywNDzHUDtnSRQJ6XDS6At9EMb2JXBBbyuI-sT0iUDmTZAOiWMjo8Zy9Cnh7kbRoyRrNaD5j2vLh8SL33tcFN2zHz1NPY0QaKNf6mVl1Vsu299ydRWR1YsjggkkZgORLVSYBoHzj4MEkwScmBkJTKcQIAiXy3DhJlau3Z62arZkbccKZo1s4HYsPbHCMecDM5p0wgJ2sAnyb9je7TWHJ13ZlqEeGC_Yfb8ozV0faWxUaeZKxxmJgg0MXHP0o7J1vPZ5NrbflfAMyM1ygGXy_hbtO6lA7VuAX8V-6E_ekmkPyI7OVMDzmIYrpFudbKGhF8ZL-y-y9RSWihNbFY-qeWVmecVKyJs08S6EtEc5nxhUPapvY-ClRJAjzyDd6hF45Ypfx4NPvSEuX_a6Bky_PN35mwxca_74AgOJJH8zScXjALtYIbDdGIN5aoz2JF7PWOO4Jx8uoc"
                        },
                        type: 'POST',
                        beforeSend: function () {
                            //that.getView().setBusyIndicatorDelay(0);
                            //that.getView().setBusy(true);
                            that.byId('idTableInfoNoticia').setBusy(true);
                        },
                        success: function (data) {
                            var json = {
                                "archivoNombre": this.data.get("files").name.replaceAll(" ", "_"),
                                "bucket": this.data.get("bucket"),
                                "proyecto": this.data.get("proyecto"),
                                "rutaCatalogo": this.data.get("ruta"),
                                "url": data.resultado.url,
                                "archivoTipo": this.data.get("files").type,
                                "archivoId": this.data.get("proyecto"),
                                "rutaAdjunto": "",
                                "idInformacionNoticia": this.data.get("idInformacionNoticia")
                            };
                            debugger
                            $.ajax({
                                url: that.getApiVSM() + "InfoNoticiaRepositorio/noticia/" + json.idInformacionNoticia + "/adjuntos",
                                type: "POST",
                                data: JSON.stringify(json),
                                dataType: 'json',
                                contentType: "application/json",
                                headers: {
                                    "Accept": "application/json"
                                },
                                success: function (result) {
                                    that.loadInformacionBytipo();
                                    sap.m.MessageToast.show("Archivo adjuntado!");
                                },
                                error: function (e) {
                                    that.loadInformacionBytipo();
                                    sap.m.MessageToast.show("Archivo adjuntado!");
                                }
                            });
                        },
                        error: function (e) {
                            debugger
                        },
                        complete: function () {
                            //that.getView().setBusy(false);
                            that.byId('idTableInfoNoticia').setBusy(false);
                        }
                    });
                }
            },
            downFile: function (oEvent) {
                var that = this;
                var data = oEvent.getSource().getBindingContext("InfoNoticiaByTipo").getObject();
                var oFormData = {
                    "bucket": data.bucket + "/" + data.rutaCatalogo,
                    "filename": data.archivoNombre,
                    "proyecto": data.proyecto
                };
                jQuery.ajax({
                    url: "./GCP_REPOSITORY/" + "generar-url",
                    data: JSON.stringify(oFormData),
                    cache: false,
                    contentType: "application/json",
                    headers: {
                        'Authorization': "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJJUFJPVklERVItQVBQIiwiaWF0IjoxNjU5NjM0OTE4LCJleHAiOjE2OTExNzA5MTgsImlzcyI6IkNlbWVudG9zIFBhY2FtYXlvIFMuQS5BLiJ9.VIjFNfl8ehdgdUXk_8YcfZlKxmDZPKlGbtrsE2wFjzPwfK6vIZrYZ1VfoX5evWHHQObC0IJzOui0tCAW8ZOWP93mJEs_MgF9gMDcXPp-RYUsITyk6MLOviWOzJ2nV0zKA4FlpHUlCSxrJEWPH98gi48g3PmPrQ2u4cQuQjHg6IrQeVniZmLV0y0RCB2qZUR0CCLiERjZBekAOCg1YW0hR9t9lSpyG8NCZWoywNDzHUDtnSRQJ6XDS6At9EMb2JXBBbyuI-sT0iUDmTZAOiWMjo8Zy9Cnh7kbRoyRrNaD5j2vLh8SL33tcFN2zHz1NPY0QaKNf6mVl1Vsu299ydRWR1YsjggkkZgORLVSYBoHzj4MEkwScmBkJTKcQIAiXy3DhJlau3Z62arZkbccKZo1s4HYsPbHCMecDM5p0wgJ2sAnyb9je7TWHJ13ZlqEeGC_Yfb8ozV0faWxUaeZKxxmJgg0MXHP0o7J1vPZ5NrbflfAMyM1ygGXy_hbtO6lA7VuAX8V-6E_ekmkPyI7OVMDzmIYrpFudbKGhF8ZL-y-y9RSWihNbFY-qeWVmecVKyJs08S6EtEc5nxhUPapvY-ClRJAjzyDd6hF45Ypfx4NPvSEuX_a6Bky_PN35mwxca_74AgOJJH8zScXjALtYIbDdGIN5aoz2JF7PWOO4Jx8uoc"
                    },
                    type: 'POST',
                    beforeSend: function () {
                        that.getView().setBusyIndicatorDelay(0);
                        that.getView().setBusy(true);
                    },
                    success: function (data) {
                        sap.m.URLHelper.redirect(data.resultado.url, true);
                    },
                    error: function (e) { },
                    complete: function () {
                        that.getView().setBusy(false);
                    }
                });
            }
        });
    }, /* bExport= */true);
