
$(document).ready(function() {

});
// populate body with found elements
$('#search_val').keyup(foundPatients);

$('.custom-select').change(foundPatients);

$('#beginDay').click(foundPatients)
$('#endDay').click(foundPatients)
$(".apply_dates").on("click",foundPatients);


  
$(document).on('click', '.pagination-button', foundPatients);
//======== Functions=====


//function for truncating string to n characters
function truncate(str, n){
    return (str.length > n) ? str.substr(0, n-1) + '...' : str;
  };

function makeYMD(dat){
    const date = new Date(dat);
    console.log('date!')
    console.log('get utc')
const newDate = {d:date.getUTCDate(), m : date.getUTCMonth()+1,// JavaScript months are 0-11
y : date.getUTCFullYear()};
return  newDate.y+ "-" + ((newDate.m.toString().length>1)?newDate.m:"0"+newDate.m)+ "-" + ((newDate.d.toString().length>1)?newDate.d:"0"+newDate.d);
}
function makeHour(dateString) {
    const date = new Date(dateString);
    const options = { hour: 'numeric', minute: 'numeric', hour12: false };
    return date.toLocaleTimeString('en-US', options);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    const day = ('0' + date.getUTCDate()).slice(-2);
    return `${day}/${month}/${year}`;
  }
// Fill table with data
function foundPatients(event) {
    // let currentRequest = null;
    // event.preventDefault();
    console.log("called")
    const target = event.target;
    const alt = $(target).attr("alt");
    console.log(alt)

    const dat = {'search':$("#search_val").val(),'sorted':$(".custom-select").val(),'begin':$("#beginDate").val(),'end':$("#endDate").val(),page:alt};
    let patientsContent = '';
   $.ajax({
    type: 'GET',
    url: '/patients/searchPatients',
    data: dat,
    dataType: 'JSON',
    processData: true,
    cache: false,
    }).done(function( response ){

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        patientsContent+=`<div class="patients row scrollDiv mt-4">`
        $.each(response.patients.sort((a, b) => (a.discharged) ? 1 : -1), function(){
            if(((this.author.role != 'caja')|| ((response.currentUser.role== 'caja')||(response.currentUser.role== 'directAdmin')))&& ((this.author.role != 'medico')||((response.currentUser.role== 'medico')||(response.currentUser.role== 'caja')||(response.currentUser.role== 'directAdmin')))){

                // if(((this.author.role != 'caja')|| ((response.currentUser.role== 'caja')||(response.currentUser.role== 'directAdmin')))&& ((this.author.role != 'medico')||((response.currentUser.role!= 'medico')||(response.currentUser.role!= 'caja')||(response.currentUser.role== 'directAdmin')))){

            patientsContent+= '<div class="col-md-6">'
            let borderColor = (this.discharged)?"#7f8a88":this.author.color; 
            patientsContent+=`
            <div class="card index_card_p mb-4 border border-`+borderColor+`"style="border-color:`+borderColor+`!important;">
                <div class="row">
                    <div class="container">
                        <div class="col-md-16">
                            <div class="card-body">
                              <div class="row justify-content-between">
                                <div class="col-7">
                                <h3 class="card-title">`+this.name+` </h3>
                                </div>
                                <div class="col-1"></div>
                                <div class="col-2">`
                                    if(this.cuarto){
                                        patientsContent+=` <h3 class="card-title border border-`+borderColor+` rounded-circle p-3 float-right"style="border-color:`+borderColor+`!important">`+this.cuarto+`</h3>`
                                    }
                                    patientsContent+=` </div>
                                    </div>
                                <h4 class="card-title text-muted">Fecha de ingreso:`+ new Date(this.admissionDate).toLocaleDateString('es-ES', options)+`</h4>`
                                if(this.discharged){
                                    
                                    patientsContent+=`<h4 class="card-title text-muted">Fecha de egreso:`+ new Date(this.dischargedDate).toLocaleDateString('es-ES', options)+`</h4>`
                                }
                                patientsContent+=`<ul class="list-group list-group-flush mb-4">`
                                
                                if (this.payed && (response.currentUser.role == 'directAdmin')) {
                                    if (!this.discharged) {
                                      patientsContent += `<li class="list-group-item border border-danger">Total:$${this.totalReceived}. Cobrada por: ${this.receivedBy} ${new Date(this.chargedDate).toLocaleDateString('es-US', options)}
                                      ${makeHour(this.chargedDate)} 
                                     
                                       </li>`;
                                    } else {
                                    patientsContent += `<li class="list-group-item border ">Total:$${this.totalReceived}. ${this.receivedBy.username} ${new Date(this.chargedDate).toLocaleDateString('es-US', options)}
                                    ${makeHour(this.chargedDate)} 
                                         </li>`;
                                    }
                                  }
                                      patientsContent+=`
                                    <li class="list-group-item">Telefono: `+this.phone+`</li>
                                    <div class="pop-up-container my-3"> <li class="list-group-item display-3 font-weight-bold text-center" style="font-family: Helvetica, Arial, sans-serif; color: #4A4A4A; text-transform: uppercase; letter-spacing: 2px;  font-size: 10px" >${this.serviceType} </li></div>  
                                    <li class="list-group-item">RFC: `+this.rfc+`</li>
                                    <li class="list-group-item">Dirección: `+this.address+`</li>
                                    <li class="list-group-item">Agregado por:  `+this.author.username+`</li>
                                    <li class="list-group-item">Medico tratante:  `+this.treatingDoctor+`</li>
                                    <li class="list-group-item text-muted">Diagnostico: `+this.diagnosis+`</li>
                                </ul>`
                                if(!this.discharged || (response.currentUser.role == 'directAdmin')){
                                    if(!this.discharged ){

                                        patientsContent+=`<a class="btn btn-primary" href="/patients/`+this._id+`">Ver cuenta</a>`
                                    }
                                    patientsContent+=`
                                    
                                    <form class="d-inline" action="/patients/`+this._id+`?_method=DELETE" method="POST">
                                        <button class="float-right btn btn-outline-danger mx-1 my-1 btn-sm"><i class="fas fa-trash"></i></button>
                                    </form>
                                    <a class="float-right btn btn-outline-info mx-1 my-1 btn-sm" href="/patients/${this._id}/activate">Activar</a>

                                    <a class="float-right btn btn-outline-secondary mx-1 my-1 btn-sm" href="/patients/`+this._id+`/edit"><i class="fas fa-edit"></i></a>`
                                }
                                if(this.discharged && (response.currentUser.role == 'directAdmin')){
                                    
                                    const b = new Date(this.admissionDate).toISOString().substring(0,10);
                                    const e = new Date(this.dischargedDate).toISOString().substring(0,10);
                    
                                    patientsContent+=` <a href = "/patients/`+this._id+`/dischargedPDF">
                                        <button type="button" class="btn btn-outline-secondary">Ver cuenta</button>
                                    </a>`
                                }
                                patientsContent+=`
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
                            }
            
                 });
                 patientsContent+=`</div>`
                 let pagination = `<div class="row my-3 pagination customClass">
                 <div class="btn-group float-right" role="group" aria-label="First group">`;
                    if(response.page >1){
                        pagination += ` <a alt="${response.page-1}" class="btn btn-light pagination-button" role="button" aria-pressed="true"><i class="fas fa-arrow-circle-left"></i></a>`
                    }
                    for(let step = 1; step < response.pages+1; step++) {
                        let act = (step == response.page)?"active":"";
                        pagination += `<a alt="${step}" class="btn btn-light ${act} pagination-button" role="button" aria-pressed="true">${step}</a>`
                    }
                    if(response.page+1 <= response.pages){
                        pagination += `<a alt="${response.page+1}" class="btn btn-light pagination-button" role="button" aria-pressed="true"><i class="fas fa-arrow-circle-right"></i></a>`
                    }
                     pagination += `</div>
                     </div>`
                // Inject the whole content string into our existing HTML table
                 $('.patients').html( patientsContent);
                 $('.pagination').replaceWith( pagination); 
                 $('#beginDate').val(response.begin);
                 $('#endDate').val(response.end);
                 $("selector").find('option[value="'+response.sorted+'"]').attr('selected','selected')
   });
 };
