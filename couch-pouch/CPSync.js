var CPSync = (function (dataBaseName) {
    this.storeToPouch;
    this.getFromPouch;
    var dataBase,
        checkOnline,
        syncWithCouch,
        couchDBURL,
        couchDBName;

    couchDBURL = "http://127.0.0.1:5984/";
    couchDBName = "temp-data-base1";    

    /**
     * @description - This function checks the browser status online or not
     */
    checkOnline = (function () {
        return navigator.onLine;
    });

    syncWithCouch = (function () {
        PouchDB.sync(dataBaseName, couchDBURL+couchDBName , {
            live: true,
            retry: true
        });
    });

    /**
     * @description - This function store a data object to PouchDB
     * @params data {Object} - The data which is going to be inserted
     */
    this.storeToPouch = (function (data) {
        dataBase.put(data);
        console.log("Data stored to pouch DB");
        if (checkOnline()) {
            syncWithCouch();
        }
    });


    /**
     * @description - This function fetch data from PouchDB
     * @params documentName {String} - The document which will be fetched may accept ""
     * @params callBack {Function} - The method which will be called after the fetch data is done
     */
    this.getFromPouch = (function (documentName, callBack) {
        if (typeof documentName != "undefined" && documentName != null && documentName != "") {
            dataBase.get(documentName).then(function (data) {
                if (typeof callBack == "function") {
                    callBack(data);
                }
            }).catch(function (error) {
                console.log(error);
            });
        } else {
            dataBase.allDocs({
                include_docs: true,
                attachments: true
            }).then(function (data) {
                if (typeof callBack == "function") {
                    callBack(data);
                }
            }).catch(function (error) {
                console.log(error);
            });
        }
    });

    (function () {
        dataBase = new PouchDB(dataBaseName);
        if (checkOnline()) {
           PouchDB.sync(dataBaseName, couchDBURL+couchDBName);
        }
    })();

});