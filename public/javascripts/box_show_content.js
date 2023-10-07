// let exitsActive  = JSON.parse(box.exitsActive);

var printer;
function numberCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function makeDMY(date){
    const newDate = {d:date.getUTCDate(), m : date.getUTCMonth()+1,// JavaScript months are 0-11
    y : date.getUTCFullYear()};
    return  ((newDate.d.toString().length>1)?newDate.d:"0"+newDate.d)+ "/" + newDate.m+ "/" + newDate.y;
  }
  function makeDMYHour(date){
    const newDate = {d:date.getUTCDate(), m : date.getUTCMonth()+1,// JavaScript months are 0-11
    y : date.getUTCFullYear(),h:date.getUTCHours(), min:(((""+date.getUTCMinutes()).length>1)?date.getUTCMinutes():"0"+date.getUTCMinutes())};
    return  ((newDate.d.toString().length>1)?newDate.d:"0"+newDate.d)+ "/" + newDate.m+ "/" + newDate.y+ " "+newDate.h+":"+newDate.min;
  }

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


  function makeHour(date){
    const newDate = {d:date.getUTCDate(), m : date.getUTCMonth()+1,// JavaScript months are 0-11
    y : date.getUTCFullYear(),h:date.getUTCHours(), min:(((""+date.getUTCMinutes()).length>1)?date.getUTCMinutes():"0"+date.getUTCMinutes())};
    return  (newDate.h+":"+newDate.min);
  }



function makeCut(boxId) {
    // Perform an AJAX request or redirect to the '/makeCut/:id' route using the boxId value
    // Example AJAX request with jQuery:
    $.ajax({
      url: `/exits/makeCut/${boxId}`,
      method: 'PUT',
      success: function (response) {
        // Handle the response after the cut is made
        window.location.reload();
        // Retrieve and display the flash message
        let flashMessage = `<div class="alert alert-success alert-dismissible fade show fixed-top" role="alert">
        Corte realizado correctamente
        <button type="button" id = flashMessage${2323} class="closeAlert" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        </div> `;
        $("main").prepend(flashMessage);
        
      },
      error: function (error) {
        // Handle any error that occurred during the request
      }
    });
  }






 async function printCut() {
    // Handle the printing of a specific transaction here
console.log('TRANSACTIONS FROM PRINT TICKET FUNCTION');
  serviceUuid = 'e7810a71-73ae-499d-8c15-faa9aef0c3f2';
  characteristicUuid = 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f';
  deviceKey = 'lastUsedDevice'; // Key for storing the device address
  const encoder = new TextEncoder();

  printData1 = new Uint8Array([
    0x1B, 0x40, // Initialize the printer
    0x1B, 0x21, 0x20, // Set the font size to double height
    0x1B, 0x61, 0x01, // Align text to center
    ...encoder.encode(`    ${box.name}`),
  ]);

  let receiptContent = '';

  // Print the transactionsActive table
  receiptContent += '              ' + 'Ingresos'+ '\n';
  receiptContent += '           _______________\n\n';
  receiptContent += 'Nombre\n                 Cantidad       Total\n';
  receiptContent += '____________________________________________\n';
  
  var totalTrans = 0;
  activeTransactions.forEach(function (item, index) {
    totalTrans +=item.total;
    receiptContent +=
        `${item.name.padEnd(14)}\n                       ${item.amount.toString().padEnd(8)}  $${item.total.toLocaleString("en-US").padEnd(8)}\n`;
  });

  // Add a line break between the two tables
  receiptContent += '\n';
  receiptContent += '             ' + 'Total Entradas:$'+`${totalTrans.toLocaleString("en-US")}`+'\n';
  receiptContent += '\n\n';


  //Change
  if(box.change.lengh>0){
    receiptContent += '              ' + 'Cambio/Depositos'+ '\n';
      receiptContent += '           _______________\n\n';
      receiptContent += 'Nombre\n              Agregado Por       Total\n';
      receiptContent += '____________________________________________\n';
      
      var totalTrans = 0;
      box.change.forEach(function (item, index) {
        totalTrans +=item.total;
        receiptContent +=
            `${item.name.padEnd(14)}\n                       ${item.addedBy.username.toString().padEnd(8)}  $${item.amount.toLocaleString("en-US").padEnd(8)}\n`;
      });
      receiptContent += '\n';
      receiptContent += '             ' + 'Total Entradas:$'+`${totalTrans.toLocaleString("en-US")}`+'\n';
      receiptContent += '\n\n';
    }

  if(activeExits.length>0){
  receiptContent += '              ' + 'Salidas'+ '\n';
  receiptContent += '           _____________\n\n';
  // Print the exitsActive table
  receiptContent += 'Nombre\n              Categoria            Total\n';
  receiptContent += '____________________________________________\n';
  totalExts = 0
  activeExits.forEach(function (exit) {
    totalExts+=exit.total
    receiptContent +=
      `${exit.name.padEnd(14)}\n               ${exit.category.padEnd(8)}  $${exit.total.toLocaleString("en-US").padEnd(8)}\n`;
  });
  receiptContent += '\n';
  receiptContent += '             ' + 'Total Salidas:$'+`${totalExts.toLocaleString("en-US")}`+'\n';
  receiptContent += '\n';
  receiptContent += '\n\n';
  receiptContent += '             ' + 'Balance total:$'+`${totalTrans-totalExts.toLocaleString("en-US")}`+'\n';
  receiptContent += '\n\n';
  }
 
 dateNow = getMexicoCityTime()
  hour = dateNow.getUTCHours(); // Get the hour component of the datetime
  minutes = dateNow.getUTCMinutes(); // Get the minutes component of the datetime
   amOrPm = hour >= 12 ? 'PM' : 'AM'; // Determine whether the time is in the AM or PM
  formattedHour = hour % 12 === 0 ? 12 : hour % 12; // Convert the hour to 12-hour format
  formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; // Add a leading zero to minutes if necessary
  formattedTime = `${formattedHour}:${formattedMinutes} ${amOrPm}`; 
 
 // Add patient name and services to the ticket body
 printData2 = new Uint8Array([
   0x1B, 0x61, 0x00, // Align text to left
   0x1B, 0x21, 0x00, // Set the font size to normal
   0x0A, // Print a line feed
   ...encoder.encode('               '+dateNow.toLocaleDateString()+' '+formattedTime), 
   0x0A, // Print a line feed
   0x0A, // Print a line feed
   ...encoder.encode(receiptContent),
   0x0A, // Print a line feed
   0x0A, // Print a line feed
   0x0A, // Print a line feed
   0x0A, // Print a line feed
   ...encoder.encode('    _____________          ______________   '),
   ...encoder.encode('            Recibe                  Entrega      '),

   0x0A, // Print a line feed
   0x0A, // Print a line feed
   0x0A, // Print a line feed
   0x0A, // Print a line feed
   0x1D, 0x56, 0x41, 0x10,
   0x1B, 0x70, 0x00, 0x19, 0xFF //linea para abrir la caja
 ]);
 
 // var printData = new Uint8Array([...printData1,...printData2]);
   try {
       if(printer){
         device = printer
       }else{
         device = await navigator.bluetooth.requestDevice({
           filters: [{ name: 'Printer001' ,deviceId:'OsURHI+3wBk8YoxCAZGClg=='}],
           optionalServices: [serviceUuid],
         });
         printer = device;
       }    
 
     const server = await device.gatt.connect();
     const service = await server.getPrimaryService(serviceUuid);
     const characteristic = await service.getCharacteristic(characteristicUuid);
     const encoder = new TextEncoder();
 
     await characteristic.writeValue(printData1);
     const CHUNK_SIZE = 50; // define the size of each chunk
     const chunks = []; // array to hold the chunks
 
    // split the printData2 array into chunks of CHUNK_SIZE bytes
    for (let i = 0; i < printData2.length; i += CHUNK_SIZE) {
      chunks.push(printData2.slice(i, i + CHUNK_SIZE));
    }

    // send each chunk with a delay between them
    for (let i = 0; i < chunks.length; i++) {
      // setTimeout(async () => {
        await characteristic.writeValue(chunks[i]);
      // }, i * 1000); // add a delay of 1 second between each chunk (adjust the delay time as needed)
    }
     await server.disconnect();
 
   } catch (error) {
     console.error(error);
   }  
  }


  document.getElementById('printBtn').addEventListener('click', function () {
    printCut();
  });





  function rebuildTables() {
    // Perform an AJAX request or redirect to the '/makeCut/:id' route using the boxId value
    // Example AJAX request with jQuery:
    let currentRequest = null;

    const data = {
        'search':$("#search_val").val(),
        'begin':$('#beginDate').val(),
        'end':$('#endDate').val(),
        'transactionSort':$('#transactionSort').val(),
        'exitSort':$('#exitSort').val(),
    };
    let tables = '';
    $.ajax({
      url: `/exits/boxRebuild/${box._id}`,
      method: 'GET',
      data: data,
      dataType: 'JSON',
      processData: true,
      beforeSend : function()    {          
        if(currentRequest != null) {
            currentRequest.abort();
        }
      },
      cache: false
    }).done(function( response ){
        box = response.box;
        historyExits = response.historyExits;
        historyTransactions= response.historyTransactions;
        activeExits = response.activeExits;
        activeTransactions= response.activeTransactions;

        tables += `
            <div class="table-container">
              <div class="pop-up-container">
                <p class="display-3 font-weight-bold text-center" style="font-family: Helvetica, Arial, sans-serif; color: #90EE90; text-transform: uppercase; letter-spacing: 2px;  font-size: 20px">Ingresos actuales</p> 
              </div>
              <table class="table table-success">
                <thead class="thead-primary">
                  <tr>
                    <th>Nombre</th>
                    ${
                      $('#transactionSort').val() === 'serviceData.name' || $('#transactionSort').val() === '_id'
                        ? `<th>Usuario</th>
                          <th>Fecha-Hora</th>
                          <th>Cantidad</th>
                          <th>Total</th>`
                        : `
                          <th>Cantidad</th>
                          <th>Total</th>`
                    }
                  </tr>
                </thead>
                <tbody>`;
                totalCurrentIncome = 0;
                response.activeTransactions.forEach(transaction => {
                        tables += `
                        <tr>
                        ${
                          $('#transactionSort').val() === 'serviceData.name' || $('#transactionSort').val() === '_id'
                            ? `<td>${ transaction.name}</td>
                            <td>${ transaction.user.username }</td>
                            <td>${ new Date(transaction.consumtionDate).toISOString().substr(0,10)} a las ${makeHour(new Date(transaction.consumtionDate))}</td>
                            <td>${ transaction.amount}</td>
                            <td>$${numberCommas(transaction.total.toFixed(2))}</td>`
                            : `
                            <td>${ transaction.name}</td>
                            <td>${ transaction.amount}</td>
                            <td>$${numberCommas(transaction.total.toFixed(2))}</td>`
                        }
                        </tr>`;
                        totalCurrentIncome+=transaction.total;
                    }); 
                tables += `
                <tr> ${$('#transactionSort').val() === 'serviceData.name' || $('#transactionSort').val() === '_id'
                ?`<td></td>
                <td></td>
                <td></td>
                <td><b>Total:</b></td>
                <td><b>$${numberCommas(totalCurrentIncome.toFixed(2))}</b></td>`
                :`<td></td>
                <td><b>Total:</b></td>
                <td><b>$${numberCommas(totalCurrentIncome.toFixed(2))}</b></td>`
              }
                    </tr>
                </tbody>
            </table>
        </div>





        <div class="table-container">
            <div class="pop-up-container">
                <p class="display-3 font-weight-bold text-center" style="font-family: Helvetica, Arial, sans-serif; color: #90EE90; text-transform: uppercase; letter-spacing: 2px;  font-size: 20px">Depositos/Cambio</p> 
            </div>
            <table class="table  table-success">
                <thead class="thead-primary">
                    <tr>
                        <th>Nombre</th>
                        <th>Agregado Por</th>
                        <th>Fecha</th>
                        <th>Cantidad</th>
                    </tr>
                </thead>
                <tbody>`;
                    totalChange = 0.0;
                        box.change.forEach(changeItem => { 
                          
                          tables += 
                          `<tr>
                            <td>${changeItem.name}</td>
                            <td>${changeItem.addedBy.username}</td>
                            <td>${new Date(changeItem.dateAdded).toISOString().substr(0,10)} a las ${makeHour(new Date(changeItem.dateAdded)) }</td>
                            <td>${ changeItem.amount }</td>`
                            totalChange+=changeItem.amount
                 });
                 tables += `
                 <tr>
                    <td></td>
                    <td></td>
                    <td><b>Total:</b></td>
                    <td><b>$${numberCommas(totalChange.toFixed(2))}</b></td>
                    </tr>
                </tbody>
            </table>
        </div>




        <div class="table-container">
        <div class="pop-up-container">
                <p class="display-3 font-weight-bold text-center" style="font-family: Helvetica, Arial, sans-serif; color: #FF7F7F; text-transform: uppercase; letter-spacing: 2px;  font-size: 20px">Egresos actuales</p> 
            </div>
            <table class="table table-danger">
                <thead>
                    <tr>`
                    if(data.exitSort != 'category'){
                        tables += `<td>Nombre</td>`
                    }
                    tables += `
                    ${
                      $('#exitSort').val() === 'name' || $('#exitSort').val() === '_id'
                      ?
                       `
                        <th>Categoria   </th>
                        <th>Usuario</th>
                        <th>Fecha-Hora</th>
                        <th>Cantidad</th>
                        <th>Total</th>`
                        :`
                        <th>Categoria   </th>
                        <th>Cantidad</th>
                        <th>Total</th>`
                    }
                    </tr>
                </thead>
                <tbody>`;
                totalCurrentExits = 0
                   response.activeExits.forEach(exit => {
                     
                       tables += `
                        <tr>`
                        if(data.exitSort != 'category'){
                          tables += `<td>Nombre</td>`
                      }
                      tables += `
                        ${
                          $('#exitSort').val() === 'name' || $('#exitSort').val() === '_id'?
                          `
                          <td>${ exit.category }</td>
                          <td>${ exit.user.username}</td>
                          <td>${ new Date(exit.clearDate).toISOString().substr(0,10)} a las ${makeHour(new Date(exit.clearDate))}</td>
                          <td>${ exit.amount }</td>
                          <td>$${numberCommas(exit.total.toFixed(2))}</td>`
                          :`
                          <td>${ exit.category }</td>
                          <td>${ exit.amount }</td>

                           <td>$${numberCommas(exit.total.toFixed(2))}</td>`
                        }
                        </tr>`
                        totalCurrentExits+=exit.total
                    });

                    tables += `
                    <tr> ${$('#exitSort').val() === 'name' || $('#exitSort').val() === '_id'
                    ?`<td></td>
                    <td></td>
                    <td></td>
                    <td></td>

                    <td><b>Total:</b></td>
                    <td><b>$${numberCommas(totalCurrentExits.toFixed(2))}</b></td>`
                    :`<td></td>
                    <td><b>Total:</b></td>
                    <td><b>$${numberCommas(totalCurrentExits.toFixed(2))}</b></td>`
                  }
                    </tr>
                </tbody>
            </table>
            <div style="text-align: right;">
                <p class="display-3 font-weight-bold text-center" style="font-family: Helvetica, Arial, sans-serif; color:#0505ef;text-transform: uppercase; letter-spacing: 2px; font-size: 20px;">Balance de corte:$${numberCommas((totalCurrentIncome+totalChange-totalCurrentExits).toFixed(2))} </p> 
            </div>
        </div>
        


        <div class="table-container">
        <div class="pop-up-container">
                <p class="display-3 font-weight-bold text-center" style="font-family: Helvetica, Arial, sans-serif; text-transform: uppercase; letter-spacing: 2px;  font-size: 20px">Historial de ingresos</p> 
            </div>

            <table class="table table-light">
                <thead class="theady">
                <tr>
                <th>Nombre</th>
                ${
                  $('#transactionSort').val() === 'serviceData.name' || $('#transactionSort').val() === '_id'
                    ? `<th>Usuario</th>
                      <th>Fecha-Hora</th>
                      <th>Cantidad</th>
                      <th>Total</th>`
                    : `
                      <th>Cantidad</th>
                      <th>Total</th>`
                }
              </tr>
                </thead>
                <tbody>
                `;   totalHistoryIncome =0;
                     response.historyTransactions.forEach(transaction => {
                      tables += `
                      <tr>
                      ${
                        $('#transactionSort').val() === 'serviceData.name' || $('#transactionSort').val() === '_id'
                          ? `<td>${ transaction.name}</td>
                          <td>${ transaction.user.username }</td>
                          <td>${ new Date(transaction.consumtionDate).toISOString().substr(0,10)} a las ${makeHour(new Date(transaction.consumtionDate))}</td>
                          <td>${ transaction.amount}</td>
                          <td>$${numberCommas(transaction.total.toFixed(2))}</td>`
                          : `
                          <td>${ transaction.name}</td>
                          <td>${ transaction.amount}</td>
                          <td>$${numberCommas(transaction.total)}</td>`
                      }
                      </tr>`;
                        totalHistoryIncome+=transaction.total;
                    }); 
                tables += `
                <tr> ${$('#transactionSort').val() === 'serviceData.name' || $('#transactionSort').val() === '_id'
                ?`<td></td>
                <td></td>
                <td></td>
                <td><b>Total:</b></td>
                <td><b>$${numberCommas(totalHistoryIncome.toFixed(2))}</b></td>`
                :`<td></td>
                <td><b>Total:</b></td>
                <td><b>$${numberCommas(totalHistoryIncome.toFixed(2))}</b></td>`
              }
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="table-container">
        <div class="pop-up-container">
        <p class="display-3 font-weight-bold text-center" style="font-family: Helvetica, Arial, sans-serif;  text-transform: uppercase; letter-spacing: 2px;  font-size: 20px">Historial de Egresos</p> 
    </div>
            <table class="table table-dark ">
                <thead>
                    <tr>`
                    if(data.exitSort != 'category'){
                        tables += `<td>Nombre</td>`
                    }
                    tables += `
                    ${
                      $('#exitSort').val() === 'name' || $('#exitSort').val() === '_id'
                      ?
                       `
                        <th>Categoria   </th>
                        <th>Usuario</th>
                        <th>Fecha-Hora</th>
                        <th>Cantidad</th>
                        <th>Total</th>`
                        :`
                        <th>Categoria   </th>
                        <th>Cantidad</th>
                        <th>Total</th>`
                    }
                    </tr>
                </thead>
                <tbody>
                `
                totalHistoryExits = 0
                response.historyExits.forEach(exit => { 
                      tables += `
                      <tr>`
                      if(data.exitSort != 'category'){
                        tables += `<td>${exit.name}</td>`
                    }
                    tables += `
                      ${
                        $('#exitSort').val() === 'name' || $('#exitSort').val() === '_id'?
                        `
                        <td>${ exit.category }</td>
                        <td>${ exit.user.username}</td>
                        <td>${ new Date(exit.clearDate).toISOString().substr(0,10)} a las ${makeHour(new Date(exit.clearDate))}</td>
                        <td>${ exit.amount }</td>
                        <td>$${numberCommas(exit.total)}</td>`
                        :`
                        <td>${ exit.category }</td>
                        <td>${ exit.amount }</td>
                        <td>$${numberCommas(exit.total.toFixed(2))}</td>`
                      }
                      </tr>`
                        totalHistoryExits+=parseFloat(exit.total)
                     });

                     tables += `
                <tr> ${$('#exitSort').val() === 'name' || $('#exitSort').val() === '_id'
                ?`<td></td>
                <td></td>
                <td></td>
                <td><b>Total:</b></td>
                <td><b>$${numberCommas(totalHistoryExits.toFixed(2))}</b></td>`
                :`<td></td>
                <td><b>Total:</b></td>
                <td><b>$${numberCommas(totalHistoryExits.toFixed(2))}</b></td>`
              }

                    </tr>
                </tbody>
            </table>
            <div style="text-align: right;">
                <p class="display-3 font-weight-bold text-center" style="font-family: Helvetica, Arial, sans-serif; color:#131372;text-transform: uppercase; letter-spacing: 2px; font-size: 20px;">Balance de historial:$${numberCommas((totalHistoryIncome-totalHistoryExits).toFixed(2))} </p> 
            </div>

        </div>`;
       $('#contentTables').html(tables);  
    //    $("#search_val").val(response.search)
  });
  }



  $(document).ready(function() {
    $('#transactionSort').change(function() {
        // This function will be called every time a .custom-select element changes
        rebuildTables();
    });
    $('#exitSort').change(function() {
        // This function will be called every time a .custom-select element changes
        rebuildTables();
    });

    $('#beginDate').change(function() {
        // This function will be called every time a .custom-select element changes
        rebuildTables();
    });

    $('#endDate').change(function() {
        // This function will be called every time a .custom-select element changes
        rebuildTables();
    });
    // refillOrder();
});



async function printHistory() {
    // Handle the printing of a specific transaction here
console.log('TRANSACTIONS FROM PRINT TICKET FUNCTION');
  serviceUuid = 'e7810a71-73ae-499d-8c15-faa9aef0c3f2';
  characteristicUuid = 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f';
  deviceKey = 'lastUsedDevice'; // Key for storing the device address
  const encoder = new TextEncoder();

  printData1 = new Uint8Array([
    0x1B, 0x40, // Initialize the printer
    0x1B, 0x21, 0x20, // Set the font size to double height
    0x1B, 0x61, 0x01, // Align text to center
    ...encoder.encode(`   ${box.name}`),
  ]);

  let receiptContent = '';

  // Print the transactionsActive table
  receiptContent += '              ' + 'Ingresos'+ '\n';
  receiptContent += '           _______________\n\n';
  receiptContent += 'Nombre\n                Cantidad         Total\n';
  receiptContent += '____________________________________________\n';
  transSort = $('#transactionSort').val();
  totalTrans =0;
  historyTransactions.forEach(function (item, index) {
    let discountedTotal =0;
    totalTrans+=item.total
    receiptContent +=
        `${(transSort!='_id')?item.name.padEnd(20):item.service.name.padEnd(20)}\n                   ${item.amount.toString().padEnd(5)}       $${item.total.toLocaleString("en-US").padEnd(8)}\n`;
    
  });
  receiptContent += '\n';
  receiptContent += '             ' + 'Total Entradas:$'+`${totalTrans.toLocaleString("en-US")}`+'\n';
  receiptContent += '\n';

  // Add a line break between the two tables
  receiptContent += '\n';
  receiptContent += '              ' + 'Salidas'+ '\n';
  receiptContent += '           _____________\n\n';
  // Print the exitsActive table
  receiptContent += 'Nombre\n               Categoria         Total\n';
  receiptContent += '____________________________________________\n';
  totalExts =0
  historyExits.forEach(function (exit) {
    totalExts+=exit.total
    receiptContent +=
      `${exit.name.padEnd(20)}\n             ${exit.category.padEnd(15)}  $${exit.total.toLocaleString("en-US").padEnd(8)}\n`;
  });
  receiptContent += '\n';
  receiptContent += '             ' + 'Total Salidas:$'+`${totalExts.toLocaleString("en-US")}`+'\n';
  receiptContent += '\n';

  receiptContent += '\n\n';
  receiptContent += '             ' + 'Balance total:$'+`${(totalTrans-totalExts).toLocaleString("en-US")}`+'\n';
  receiptContent += '\n\n';
 
 dateNow = getMexicoCityTime()
  hour = dateNow.getUTCHours(); // Get the hour component of the datetime
  minutes = dateNow.getUTCMinutes(); // Get the minutes component of the datetime
   amOrPm = hour >= 12 ? 'PM' : 'AM'; // Determine whether the time is in the AM or PM
  formattedHour = hour % 12 === 0 ? 12 : hour % 12; // Convert the hour to 12-hour format
  formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; // Add a leading zero to minutes if necessary
  formattedTime = `${formattedHour}:${formattedMinutes} ${amOrPm}`; 
 
 // Add patient name and services to the ticket body
 printData2 = new Uint8Array([
   0x1B, 0x61, 0x00, // Align text to left
   0x1B, 0x21, 0x00, // Set the font size to normal
   0x0A, // Print a line feed
   ...encoder.encode('               '+dateNow.toLocaleDateString()+' '+formattedTime), 
   0x0A, // Print a line feed
   0x0A, // Print a line feed
   ...encoder.encode(receiptContent),
   0x0A, // Print a line feed
   0x0A, // Print a line feed
   0x0A, // Print a line feed
   0x0A, // Print a line feed
   ...encoder.encode('    _____________          ______________   '),
   ...encoder.encode('            Recibe                  Entrega      '),

   0x0A, // Print a line feed
   0x0A, // Print a line feed
   0x0A, // Print a line feed
   0x0A, // Print a line feed
   0x1D, 0x56, 0x41, 0x10,
//    0x1B, 0x70, 0x00, 0x19, 0xFF //linea para abrir la caja


 ]);
 
 // var printData = new Uint8Array([...printData1,...printData2]);
   try {
       if(printer){
         device = printer
       }else{
         device = await navigator.bluetooth.requestDevice({
           filters: [{ name: 'Printer001' ,deviceId:'OsURHI+3wBk8YoxCAZGClg=='}],
           optionalServices: [serviceUuid],
         });
         printer = device;
       }    
 
     const server = await device.gatt.connect();
     const service = await server.getPrimaryService(serviceUuid);
     const characteristic = await service.getCharacteristic(characteristicUuid);
     const encoder = new TextEncoder();
 
     await characteristic.writeValue(printData1);
     const CHUNK_SIZE = 50; // define the size of each chunk
 const chunks = []; // array to hold the chunks
 
 // split the printData2 array into chunks of CHUNK_SIZE bytes
 for (let i = 0; i < printData2.length; i += CHUNK_SIZE) {
   chunks.push(printData2.slice(i, i + CHUNK_SIZE));
 }
 
 // send each chunk with a delay between them
 for (let i = 0; i < chunks.length; i++) {
   // setTimeout(async () => {
     await characteristic.writeValue(chunks[i]);
   // }, i * 1000); // add a delay of 1 second between each chunk (adjust the delay time as needed)
 }
   console.log('device to be stored');
   console.log(device)
 
     await server.disconnect();
 
   } catch (error) {
     console.error(error);
   }  
  }


  document.getElementById('printBtn').addEventListener('click', function () {
    printCut();
  });


  document.getElementById('printHistory').addEventListener('click', function () {
    printHistory();
  });


$(document).ready(function() {

$('#genPDf').click(generatePDF)

function generatePDF() {
  fetch('https://clinicaabasolo2-production.up.railway.app/exits/generate-pdf-account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: document.getElementById('contentTables').innerHTML, // Get the content of your div
    }),
  })
  .then(response => response.blob())
  .then(blob => {

    
    // Create a blob URL and download the file
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${nDate.toISOString()}.pdf`;
    a.click();
  })
  .catch(error => console.error('Error:', error));
}
})

$(document).on('click', '.cut-button', function() {
  const boxId = $(this).data('box-id');
  makeCut(boxId);
});



$(document).ready(function() {
  // Handle button click event
  $('#change').click(function() {
    // Show the modal
    $('#changeModal').modal('show');
  });

  // Handle save button click event
  $('#saveChange').click(function() {
    // Get the entered name and amount
    var name = $('#changeName').val();
    var amount = parseInt($('#changeAmount').val());

    // Perform validation if needed

    // Create a new change object
    var change = {
      name: name,
      amount: amount
    };

    // Perform further actions with the change object
    console.log(change);

    // Hide the modal
    $('#changeModal').modal('hide');
  });
});


// Minus button click event handler
$(document).on("click", ".minus", function() {
  const inputElement = $(this).closest(".modal").find(".quantity");
  const currentValue = parseInt(inputElement.val());
  if (currentValue - 1 >= 0) {
    inputElement.val(currentValue - 1);
  }
});

// Plus button click event handler
$(document).on("click", ".plus", function() {
  const inputElement = $(this).closest(".modal").find(".quantity");
  const currentValue = parseInt(inputElement.val());
  if (currentValue + 1 < 999) {
    inputElement.val(currentValue + 1);
  }
});


function addChangeToBox(id,event) {
  // Get the input values from the modal
  const name = $('#changeName').val();
  const amount = parseInt($('#changeAmount').val());
  // Create the object to be sent in the request body
  const objectToAdd = {
    name: name,
    amount: amount,
    boxID:box._id
  };
  
  console.log('from add change to box')
  console.log(objectToAdd)
  console.log('from add change id')
  console.log(box._id)
  // Make the AJAX request
  $.ajax({
    type: 'PUT',
    url: `/exits/addChangeToBox`,
    data: objectToAdd,
    dataType: 'JSON'
  }).done(async function(response) {
    // Handle the response if needed
    console.log(response);
    // window.location.reload();
    let flashMessage = `<div class="alert alert-success alert-dismissible fade show fixed-top" role="alert">
        Cambio agregado
        <button type="button" id = flashMessage${2323} class="closeAlert" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        </div> `;
        $("main").prepend(flashMessage);
     await openBox(event)
     window.location.reload();

  });
}

$('#saveChange').on('click', async function(event) {
  // Get the box ID from somewhere (e.g., a data attribute)
  const boxId = box._id;

  // Call the addChangeToBox function with the box ID
  await addChangeToBox(boxId,event);
});

async function openBox(e) { 
      e.preventDefault();

  serviceUuid = 'e7810a71-73ae-499d-8c15-faa9aef0c3f2';
 characteristicUuid = 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f';
  deviceKey = 'lastUsedDevice'; // Key for storing the device address



  // Add patient name and services to the ticket body
  printData1 = new Uint8Array([
  0x1B, 0x70, 0x00, 0x19, 0xFF //linea para abrir la caja
  ]);

// var printData = new Uint8Array([...printData1,...printData2]);
try {
  //   if(printer){
  //     device = printer
  //   }else{
      device = await navigator.bluetooth.requestDevice({
        filters: [{ name: 'Printer001' ,deviceId:'OsURHI+3wBk8YoxCAZGClg=='}],
        optionalServices: [serviceUuid],
      });
      printer = device;
  //   }    

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(serviceUuid);
  const characteristic = await service.getCharacteristic(characteristicUuid);
  const encoder = new TextEncoder();

  await characteristic.writeValue(printData1);
  await server.disconnect();
  this.submit();
} catch (error) {
  console.error(error);
}
}  
