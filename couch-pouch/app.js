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

onload = function () {
    var submitButton,
        instance_CPSync,
        displayDataInTable;


    displayDataInTable = (function (dataRows) {
        var index,
            html;
        html = "<table border='1'><tr><th>_id</th><th>Data</th></tr>";
        for (index in dataRows) {
            html += "<tr>";
            html += "<td>" + dataRows[index].doc["_id"] + "</td>";
            html += "<td>" + dataRows[index].doc["data"] + "</td>";
            html += "</tr>";
        }
        html += "</table>";
        document.getElementById("txt_pouchData").innerHTML = html;
    });

    instance_CPSync = new CPSync("test-db");

    // displaying existing data
    instance_CPSync.getFromPouch("", function (data) {
        if (typeof data != "undefined" && typeof data.rows != "undefined" && data.rows) {
            displayDataInTable(data.rows);
        }

    });

    submitButton = document.getElementById("btn_submit");
    submitButton.addEventListener('click', function () {
        var data = { "_id": Date.now().toString(), "data": document.getElementById("txt_data").value }; console.log(data);
        instance_CPSync.storeToPouch(data);
        instance_CPSync.getFromPouch("", function (data) {
            displayDataInTable(data.rows);
        });
        return false;
    });
};
