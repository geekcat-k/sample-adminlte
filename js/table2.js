$(document).ready(function(){
    $.ajax({
        type: "GET",
        url: "./data/griddata.json?dummy"
    })
    .done( (data) => {
        var elementType = [
            { Name: "BUTTON", Id: "BUTTON" },
            { Name: "TEXT", Id: "TEXT" },
            { Name: "SELECT", Id: "SELECT" },
            { Name: "RADIO", Id: "RADIO" },
            { Name: "CHECKBOX", Id: "CHECKBOX" },
            { Name: "TEXTAREA", Id: "TEXTAREA" }
        ];

        $("#jsGrid").jsGrid({
        width: "100%",
        height: "400px",

        inserting: true,
        editing: true,
        sorting: true,
        paging: true,

        data: data,

        controller: {
            insertItem: function (d) {alert(d.itemCount)},
            updateItem: function (d) {alert(d.itemCount)},
            deleteItem: function (d) {alert(d.data)}
        },

        fields: [
            { title: "画面名", name: "pageName", type: "text", width: 150, validate: "required" },
            { title: "エレメント名", name: "elementName", type: "text", width: 200, validate: "required" },
            { title: "タイプ", name: "elementType", type: "select", items: elementType, valueField: "Id", textField: "Name", validate: "required" },
            { title: "XPath", name: "XPath", type: "text", width: 250, validate: "required" },
            { type: "control" }
        ]
        });
    });
});
  