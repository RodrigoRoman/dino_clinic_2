

$(document).ready(function() {
 
    var selectedSupplies = [];


 function getMexicoCityTime() {
    const now = new Date();
    const mexicoCityOffset = -6 * 60; // Mexico City is UTC-6
    const mexicoCityTime = new Date(now.getTime() + mexicoCityOffset * 60 * 1000);
    return mexicoCityTime;
  }
    function numberCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  const nDate = getMexicoCityTime();

  function makeYMD(dat){
    const date = new Date(dat);
  const newDate = {d:date.getUTCDate(), m : date.getUTCMonth()+1,// JavaScript months are 0-11
  y : date.getUTCFullYear()};
  return  newDate.y+ "-" + ((newDate.m.toString().length>1)?newDate.m:"0"+newDate.m)+ "-" + ((newDate.d.toString().length>1)?newDate.d:"0"+newDate.d);
  }
  function makeDMY(date){
    const newDate = {d:date.getUTCDate(), m : date.getUTCMonth()+1,// JavaScript months are 0-11
    y : date.getUTCFullYear()};
    return  ((newDate.d.toString().length>1)?newDate.d:"0"+newDate.d)+ "/" + newDate.m+ "/" + newDate.y;
  }




//BEGIN ACTIONS SECTION
$("tbody" ).on( "click", ".minus", function() {
    const currentValue = parseInt($(this).parent().children(".quantity").val());
    if(currentValue-1>=0){
        $(this).parent().children(".quantity").val(currentValue-1);
    }
  });

$("tbody" ).on( "click", ".plus", function() {
    const currentValue = parseInt($(this).parent().children(".quantity").val());
    if(currentValue+1<999){
        $(this).parent().children(".quantity").val(currentValue+1);
    }
  });

//located below the search bar
$('#search_val').keyup(populateTable);

// pop modal with search
$('#search').click(populateTableModal);

//Call teh pdf page



$('#search_val').on('keypress', function (e) {
  if(e.which === 13){
      e.preventDefault();
      $('#search')[0].click();
  }
});

//remove search table when modal is closed
//Return the modal table to an empty state
$('.sp').on("click", function (e) {
  //If parent does not have class expanded
  if ($(this).parent().attr("class")=="close"){
    $('#searchList table tbody').html("")
    $('#searchTableModal tbody').html("")
  } 
});;


// Hide search list body when clicked outside it
$("body").on('click',function(e){
  let closed = ["closeAlert","alert-dismissable"]
  if($(e.target).closest("#searchList tbody").length === 0 && $(e.target).parent().attr('class') !="closeAlert" && $(e.target).attr('class') !="closeAlert") { $('#searchList table tbody').html("")};
});

// Add event listener for the "Agregar" button
$("tbody").on('click',".addToCart", function () {
    const $row = $(this).closest('tr');
    const supply = {
    id: $row.find(".identifier").attr("data-id"),
    name: $row.find('#supplyName').text(),
    class: $row.find('small.text-muted').text(),
    expiration: $row.find('small.border').text().split(' ')[2],
    quantity: parseInt($row.find('input.quantity').val()),
    };

    // Add the supply to the selectedSupplies array
    selectedSupplies.push(supply);
    updateSelectedSuppliesTable();
    generateQRCodes();


})
// END OF ACTIONS SECTION


// Search three elements
function populateTable(event) {
    event.preventDefault();
    const timeUnits =  ["Hora", "Dia"];
   // Empty content string
   let tableContent = '';
   // jQuery AJAX call for JSON
   let search = $("#search_val").val();
   $.getJSON( `/services/search3`,{search}, function(data) {
     // For each item in our JSON, add a table row and cells to the content string
     $.each(data, function(){
       tableContent += '<tr>';
       if(this.doctor){
         tableContent += '<td id = "supplyName"><h2>' + this.name + '<h2></td>';
         tableContent += '<td id = "supplyName"></td>';

         tableContent += '<td><h1 alt ="'+this._id+'">$' + numberCommas(this.price) + '</h1></td>';
       }else{
         tableContent += '<td id = "supplyName"><h2>' + this.name + '</h2></td>';
         tableContent += '<td><small alt ="'+this._id+'" class = "cls">' + this.class + '</small></td>';
         tableContent += '<td><h1>$' + numberCommas(this.sell_price) + '</h1></td>';
       }
     });
 
     // Inject the whole content string into our existing HTML table
     $('#searchList table tbody').html(tableContent);
   });
 };
 




//for a popup window
function populateTableModal(event) {
    event.preventDefault();
  // Empty content string
  let tableContent = '';
  // jQuery AJAX call for JSON
  let search = $("#search_val").val();
  let exp = $("#expirDate").val();
  const timeUnits =  ["Hora", "Dia"];
  $.getJSON( `/patients/232323/search`,{search,exp}, function( data ) {
    // For each item in our JSON, add a table row and cells to the content string
    $.each(data, function(){
      tableContent += '<tr>';
      if(this.doctor){
        tableContent += '<td id = "supplyName"><h2>' + this.name + '</h2></td>';
        tableContent += '<td id = "supplyName"></td>';
        tableContent += '<td><h1 alt ="'+this._id+'" >$' + numberCommas(this.price) + '</h1></td>';
      }else{
        tableContent += '<td id = "supplyName"><h2>' + this.name + '</h2></td>';
        tableContent += '<td><small alt ="'+this._id+'"  class = "cls">' + this.class + '</small></td>';
        tableContent += '<td><h1 alt ="'+this._id+'" >$' + numberCommas(this.sell_price) + '</h1></td>';
      }
    });

    // Inject the whole content string into our existing HTML table
    $('.modal-body #searchTableModal tbody').html(tableContent);
  });
};


function updateSelectedSuppliesTable() {
    let tableContent = '';
    selectedSupplies.forEach((supply) => {
      tableContent += '<tr>';
      tableContent += '<td class="text-center">' + supply.name + '</td>';
      tableContent += '<td class="text-center">' + supply.expiration + '</td>';
      tableContent += '<td class="text-center">' + supply.quantity + '</td>';
      tableContent += '<td class="text-center" id="identifier"">' + supply.id + '</td>';
      tableContent += '<td class="text-center"><button type="button" class="removeFromCart btn btn-sm btn-danger">Quitar</button></td>';
      tableContent += '</tr>';
    });
  
    $('#selectedSuppliesList table tbody').html(tableContent);
  }

  function generateQRCodes() {
    const grid = document.getElementById('qrGrid');
    grid.innerHTML = ''; // Clear the grid
    
    selectedSupplies.forEach(supply => {
      const supplyContainer = document.createElement('div');
      supplyContainer.classList.add('supply-container');
      
      // Add the supply name
      const supplyName = document.createElement('h4');
      supplyName.textContent = supply.name+' '+supply.expiration;
      supplyContainer.appendChild(supplyName);
      
      // Add a flex container for the QR codes
      const qrFlexContainer = document.createElement('div');
      qrFlexContainer.classList.add('qr-flex-container');
      supplyContainer.appendChild(qrFlexContainer);
      
      // Generate the QR codes for the selected quantity
      for (let i = 0; i < supply.quantity; i++) {
        const qrCodeContainer = document.createElement('div');
        qrCodeContainer.classList.add('qr-code-container');
        new QRCode(qrCodeContainer, {
          text: supply.id,
          width: 50, // Adjust the size of the QR codes
          height: 50, // Adjust the size of the QR codes
          correctLevel: QRCode.CorrectLevel.L,

        });
        qrFlexContainer.appendChild(qrCodeContainer);
      }
      
      grid.appendChild(supplyContainer);
    });
  }

 
});