$(document).ready(function(){
    var data = [
        ["Ford", 2017, "orange", "20", "30"],
        ["Tesla", 2018, "yellow", "12", "13"],
        ["Toyota", 2019, "orange", "14", "13"],
        ["Honda", 2020, "black", "12", "13"]
    ];

    var container = document.getElementById('handsontable');
    var hot = new Handsontable(container, {
        data: data,
        rowHeaders: true,
        colHeaders: ['Car', 'Year', 'Aaawefwefewfwe', 'Bbbwfewfewfew', 'Cccqwqdqdwqdqwa'],
        filters: true,
        dropdownMenu: true,
        columns: [
            {},
            {type: 'numeric'},
            {
                type: 'dropdown',
                source: ['yellow', 'red', 'orange', 'green', 'blue', 'gray', 'black', 'white']
            },
            {
                type: 'dropdown',
                source: ['yellow', 'red', 'orange', 'green', 'blue', 'gray', 'black', 'white']
            },
            {}
        ]
    });
});
  