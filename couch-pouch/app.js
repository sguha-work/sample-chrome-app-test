var CPSync = (function (dataBaseName) {
    this.storeToPouch;
    this.storeToCouch;
    this.getFromPouch;
    this.getFromCouch;
    var dataBase;

    (function (dataBaseName) {
        console.log(dataBaseName);
        dataBase = new PouchDB(dataBaseName);
    })(dataBaseName);

    this.storeToPouch = (function (data) {
        dataBase.put(data);
        console.log("Data stored to pouch DB");
    });

    this.storeToCouch = (function () {

    });

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

    this.getFromCouch = (function () {

    });


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
