/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function vai(settore, origine="settorelogin"){
    localStorage.setItem('PaginaPrecedente', origine);
    localStorage.setItem('PaginaAttuale', settore);
    $(".settore").addClass("d-none");
    $("#"+settore).removeClass("d-none")
}

function onDeviceReady() {
    // Cordova is now initialized. Have fun!
    // console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    // document.getElementById('deviceready').classList.add('ready');
    const StoredUser = localStorage.getItem('User');
    const StoredPass = localStorage.getItem('Pass');
    const StoredTipoUtenza = localStorage.getItem('TipoUtenza');
    if(localStorage.getItem('TipoUtenza')) {
        accesso(StoredUser,StoredPass,StoredTipoUtenza);
    }

    $("#Accedi").on("click", function () {
        var User=$("#User").val();
        var Pass=$("#Pass").val();
        var tipoutenza=$("#tipoutenza").val();
        accesso(User,Pass,tipoutenza);
    });

    $("#indietrobutton").on("click", function () {
        var dest=localStorage.getItem('PaginaPrecedente');
        var origine=localStorage.getItem('PaginaAttuale');
        vai(dest, origine);
    });

    $("#logout").on("click", function () {
        localStorage.clear();
        vai("settorelogin");
    });

    $("#vaistorico").on("click", function () {
        vai("settorestorico");
    });

    // window.pushNotification.registration((token) => {
    // });
    window.pushNotification.registration((token) => {
        if(token!==null && token!="" && token!=="undefined"){
            var oritoken=localStorage.getItem('PushToken');
            //if(token!==oritoken){
                $.ajax({
                    type: "POST",
                    url: "https://ristostore.it/RPA/Accesso",
                    data:{
                        "Tipo":StoredTipoUtenza,
                        "Id_Driver":localStorage.getItem('Id_User'),
                        "Token":token,
                    },
                    success: function (response) {
                        localStorage.setItem('PushToken', token);
                    }
                });
            //}
            // $("#debug1").val(token);
        }
    });
    
    // Catch notification if app launched after user touched on message
    // window.pushNotification.tapped((payload) => {
    //     $("#debug2").val(token);
    // });

    function accesso(pUser,pPass,pTipo) {
        var dataccesso={"Tipo":pTipo,"User" : pUser,"Pass" : pPass};
        switch (pTipo) {
            case "Driver":
                accessoDriver(dataccesso);
                break;
            case "Gestore":
                accessoGestore(dataccesso);
                break;
        
            default:
                return "Nessun_Tipo_Specificato";
                break;
        }
    }

    function accessoGestore(dataccesso){
        $.ajax({
            type: "POST",
            url: "https://ristostore.it/RPA/Accesso",
            data: dataccesso,
            success: function (response) {
                if(response!="Nessun_Tipo_Specificato"){
                    var risposta=JSON.parse(response);
                    if(risposta.ok){
                        localStorage.setItem('TipoUtenza', dataccesso.pTipo);
                        localStorage.setItem('User', dataccesso.pUser);
                        localStorage.setItem('Pass', dataccesso.pPass);
                        localStorage.setItem('Id_User', risposta.dati.Id);
                        getEserciziGestore(risposta.dati.Id,"GetAttivita");
                        vai("settorehomegestore");
                    }
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(textStatus + jqXHR.responseText);
            }
        });
    }

    function accessoDriver(dataccesso){
        $.ajax({
            type: "POST",
            url: "https://ristostore.it/RPA/Accesso",
            data: dataccesso,
            success: function (response) {
                if(response!="Nessun_Tipo_Specificato"){
                    var risposta=JSON.parse(response);
                    if(risposta.ok){
                        localStorage.setItem('TipoUtenza', dataccesso.pTipo);
                        localStorage.setItem('User', dataccesso.pUser);
                        localStorage.setItem('Pass', dataccesso.pPass);
                        localStorage.setItem('Id_User', risposta.dati.Id);
                        getRitiriDriver(risposta.dati.Id,"Si");
                        vai("settorehomedriver");
                    }
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(textStatus + jqXHR.responseText);
            }
        });
    }

    function getEserciziGestore(Id_Gestore,Operazione){
        // console.log("TESTEST "+Operazione);
        $.getJSON("https://ristostore.it/RPA/apiGestori", 
            {"Id_User":Id_Gestore,"Operazione":Operazione},
            function (data, textStatus, jqXHR) {
                $("#bodyhomegestore").html("");
                $.each( data, function( key, attivita ) {
                    let card=`
                        <div class='card text-dark bg-light mb-3 w-100' id='cardattivita${attivita.Id}'>
                            <div class='card-header'>
                                <strong>${attivita.Ragione_Sociale}</strong>
                            </div>
                            <ul class='list-group list-group-flush'>
                                <li class='list-group-item'>
                                    <button class='btn btn-primary w-100 vaicentrocontrollo' data-idatti='${attivita.Id}'>Vai al centro di controllo</button>
                                </li>
                            </ul>
                        </div>
                    `;
                    $("#bodyhomegestore").append(card);
                });
            }
        );
    }

    function generaore(atti){
        $.ajax({
            type: "GET",
            url: "https://ristostore.it/RPA/apiGestori",
            data: {
                "idatti": atti,
                "Operazione":"GetOre"
            },
            success: function (response) {
                let oggettoRitiri=JSON.parse(response);
                var cd = new Date();
                var d = new Date(cd.getTime() + 20*60000);
                var h = d.getHours();
                var m = d.getMinutes();
                var htmlore="";
                for (let index = h; index < 23; index++) {
                  htmlore+="<div class='row mx-0'>";
                    if(index>8) { 
                        if(index!=h) { 
                            let indexora=index+":00";
                            if(typeof(oggettoRitiri[indexora]) == "undefined" || oggettoRitiri[indexora]==="undefined"){
                                oggettoRitiri[indexora]='0';
                            }   
                            htmlore+=setTasti(oggettoRitiri[indexora],indexora);      
                        } else {htmlore+="<div class='col-3 p-1'></div>";}
                        if(index!=h || m<=15) { 
                            let indexora=index+":15";
                            if(typeof(oggettoRitiri[indexora]) == "undefined" || oggettoRitiri[indexora]==="undefined"){
                                oggettoRitiri[indexora]='0';
                            }   
                            htmlore+=setTasti(oggettoRitiri[indexora],indexora);  
                        } else {htmlore+="<div class='col-3 p-1'></div>";}
                        if(index!=h || m<=30) { 
                            let indexora=index+":30";
                            if(typeof(oggettoRitiri[indexora]) == "undefined" || oggettoRitiri[indexora]==="undefined"){
                                  oggettoRitiri[indexora]='0';
                            }   
                            htmlore+=setTasti(oggettoRitiri[indexora],indexora);  
                        } else {htmlore+="<div class='col-3 p-1'></div>";}
                        if((index!=h || m<=45) && index!=22) { 
                            let indexora=index+":45";
                            if(typeof(oggettoRitiri[indexora]) == "undefined" || oggettoRitiri[indexora]==="undefined"){
                                oggettoRitiri[indexora]='0';
                            }   
                            htmlore+=setTasti(oggettoRitiri[indexora],indexora);  
                        } else {htmlore+="<div class='col-3 p-1'></div>";}
                    }
                    htmlore+="</div>";
                }
                $("#bodyorari").html(htmlore);
                vai("settorecentrocontrollo");
            }
        });    
    }

    function setTasti(qora,indexora){
        var htmlore2="";
        if(qora==0){
          htmlore2+="<div class='col-3 p-1'>";
          htmlore2+="<button type='button' id='bo"+indexora.replace(':', '_')+"' class='btn-outline-primary btn-block btn p-1 tastora w-100' data-oras='"+indexora+"'>"+indexora+"</button>";
          htmlore2+="</div>";     
        } else {
          htmlore2+="<div class='col-3 p-1'>";
          htmlore2+="<button type='button' id='bo"+indexora.replace(':', '_')+"' class='btn-outline-primary btn-block btn p-2 tastora w-100' data-oras='"+indexora+"'>"+indexora+"<span class='ml-1'>("+qora+")</span></button>";
          htmlore2+="</div>";     
        }
        return htmlore2;
    }


    function getRitiriDriver(Id_Driver,In_Corso){
        $.getJSON("https://ristostore.it/RPA/ritiri_driver", 
            {"Id_User":Id_Driver,"In_Corso":In_Corso},
            function (data, textStatus, jqXHR) {
                $.each( data, function( key, ritiro ) {
                    let DT_engform = new Date(ritiro.DT_Consegna);
                    let DT_date = DT_engform.toLocaleDateString("it-It");
                    let ora = DT_engform.getHours();
                    let minuti = DT_engform.getMinutes();
                    var idritiro=ritiro.Id;
                    var ido=ritiro.Id;
                    var linkattitel="";
                    if(esi(ritiro.Attitel)!=""){
                        linkattitel=`<li class='list-group-item'>
                            <a class='btn btn-sm btn-info w-100' href='tel:${ritiro.Attitel}'>Chiama l'attività</a>
                        </li>`;
                    }
                    var linktelefono="";
                    if(esi(ritiro.Telefono)!=""){
                        linktelefono=`<li class='list-group-item'>
                            <a class='btn btn-sm btn-primary w-100' href='tel:${ritiro.Telefono}'>Chiama il cliente</a>
                        </li>`;
                    }
                    var datatipo="ritiro";
                    var settoreordine="";
                    var azioni="";
                    //AZIONI RITIRO
                    if(esi(ritiro.Ordine_Associato)=="0"){
                        if(esi(ritiro.Stato)==0){
                            azioni=`<li class='list-group-item liazioni'>
                                <div class="btn-group w-100" role="group" aria-label="accettorifiuto">
                                    <button type="button" data-tipo="${datatipo}" data-ido="${ido}" data-idritiro="${idritiro}" data-processo="accetto" class="tastoprocesso btn btn-success">Accetto</button>
                                    <button type="button" data-tipo="${datatipo}" data-ido="${ido}" data-idritiro="${idritiro}" data-processo="rifiuto" class="tastoprocesso btn btn-danger">Rifiuto</button>
                                </div>
                            </li>`;
                        }
                        if(esi(ritiro.Stato)==1){
                            azioni=`<li class='list-group-item liazioni'>
                                <div class="btn-group w-100" role="group" aria-label="accettorifiuto">
                                    <button type="button" data-tipo="${datatipo}" data-ido="${ido}" data-idritiro="${idritiro}" data-processo="partenza" class="tastoprocesso btn btn-success">Partenza</button>
                                    <button type="button" data-tipo="${datatipo}" data-ido="${ido}" data-idritiro="${idritiro}" data-processo="rifiuto" class="tastoprocesso btn btn-danger">Rifiuto</button>
                                </div>
                            </li>`;
                        }
                        if(esi(ritiro.Stato)==3){
                            azioni=`<li class='list-group-item liazioni'>
                                <div class="btn-group w-100" role="group" aria-label="accettorifiuto">
                                    <button type="button" data-tipo="${datatipo}" data-ido="${ido}" data-idritiro="${idritiro}" data-processo="consegnato" class="tastoprocesso btn btn-success">Consegnato</button>
                                </div>
                            </li>`;
                        }
                    }
                    if(esi(ritiro.Ordine_Associato)!="0"){
                        var datatipo="ordine";
                        ido=ritiro.Ordine_Associato;
                        settoreordine="";
                        if(esi(ritiro.Nominativo)){
                            settoreordine+=`<li class='list-group-item'>
                                Cliente: ${ritiro.Nominativo}
                            </li>`;
                        }
                        if(esi(ritiro.Indirizzo)){
                            settoreordine+=`<li class='list-group-item'>
                                Indirizzo: ${ritiro.Indirizzo}
                            </li>`;
                        }
                        // var prodottiordine=JSON.parse(ritiro.Prodotti);
                        // var prodotti="";
                        // if(Array.isArray(prodottiordine) && prodottiordine.length){
                        //     prodottiordine.forEach(element => {
                        //         prodotti+=`<li class='list-group-item'>
                        //             Indirizzo: ${prodottiordine.Id}
                        //         </li>`;
                        //     });
                        // }

                        
                        //AZIONI ORDINE
                        if(esi(ritiro.Ostato)==1){
                            azioni=`<li class='list-group-item liazioni'>
                                <div class="btn-group w-100" role="group" aria-label="accettorifiuto">
                                    <button type="button" data-tipo="${datatipo}" data-ido="${ido}"  data-idritiro="${idritiro}" data-processo="accetto" class="tastoprocesso btn btn-success">Accetto</button>
                                    <button type="button" data-tipo="${datatipo}" data-ido="${ido}"  data-idritiro="${idritiro}" data-processo="rifiuto" class="tastoprocesso btn btn-danger">Rifiuto</button>
                                    <button type="button" data-tipo="${datatipo}" data-ido="${ido}"  data-idritiro="${idritiro}" data-processo="cancello" class="tastoprocesso btn btn-danger">Cancello</button>
                                </div>
                            </li>`;
                        }
                        if(esi(ritiro.Ostato)==3){
                            azioni=`<li class='list-group-item liazioni'>
                                <div class="btn-group w-100" role="group" aria-label="accettorifiuto">
                                    <button type="button" data-tipo="${datatipo}" data-ido="${ido}"  data-idritiro="${idritiro}" data-processo="consegnato" class="tastoprocesso btn btn-success">Consegnato</button>
                                    <button type="button" data-tipo="${datatipo}" data-ido="${ido}"  data-idritiro="${idritiro}" data-processo="rifiuto" class="tastoprocesso btn btn-danger">Rifiuto</button>
                                    <button type="button" data-tipo="${datatipo}" data-ido="${ido}"  data-idritiro="${idritiro}" data-processo="cancello" class="tastoprocesso btn btn-danger">Cancello</button>
                                </div>
                            </li>`;
                        }
                    }
                    var totale="";
                    if(esi(ritiro.Totale_D)){
                        totale=`<li class='list-group-item'>
                            Totale: <span id='rit_totale'>${ritiro.Totale_D}</span>
                        </li>`;
                    }
                    let card=`
                        <div class='card text-dark bg-light mb-3 w-100' id='card${idritiro}'>
                            <div class='card-header'>
                                Ritiro n.${idritiro} <span id='progressivo_ritiro'></span> presso <strong id='rit_rsa'>${ritiro.Ragione_Sociale}</strong>
                            </div>
                            <ul class='list-group list-group-flush'>
                                <li class='list-group-item'>
                                    Consegna: <strong>${ora}:${minuti}</strong> del <span id='rit_dt_consegna'>${DT_date}</span>
                                </li>
                                ${settoreordine}
                                ${linktelefono}
                                ${linkattitel}
                                ${totale}
                                ${azioni}
                            </ul>
                        </div>
                    `;
                    $("#rit_lav").append(card);
                });
            }
        );
        // $.getJSON("https://ristostore.it/RPA/ordini_driver", 
        //     {"Id_User":risposta.dati.Id,"In_Corso":"Si"},
        //     function (data, textStatus, jqXHR) {
        //         $.each( data, function( key, ordine ) {
        //             let DT_engform = new Date(ordine.DT_Consegna);
        //             let DT_date = DT_engform.toLocaleDateString("it-It");
        //             let ora = DT_engform.getHours();
        //             let minuti = DT_engform.getMinutes();
        //             var linkattitel="";
        //             if(esi(ordine.Attitel)!=""){
        //                 linkattitel=`<a class='btn btn-sm btn-primary ml-3' href='tel:${ordine.Telefono}'>Chiama</a>`;
        //             }
        //             var linktelefono="";
        //             if(esi(ordine.Clientitel)!=""){
        //                 linktelefono=`<li class='list-group-item'>
        //                     <a class='btn btn-sm btn-primary w-100' href='tel:${ordine.Clientitel}'>Chiama il cliente</a>
        //                 </li>`;
        //             }
        //             let card=`
        //                 <div class='card text-dark bg-light mb-3 w-100'>
        //                     <div class='card-header'>
        //                         ordine <span id='progressivo_ordine'></span> presso <strong id='rit_rsa'>${ordine.Ragione_Sociale}</strong> ${linkattitel}
        //                     </div>
        //                     <ul class='list-group list-group-flush'>
        //                         <li class='list-group-item'>
        //                             Consegna: <strong>${ora}:${minuti}</strong> del <span id='rit_dt_consegna'>${DT_date}</span>
        //                         </li>
        //                         ${linktelefono}
        //                         <li class='list-group-item'>
        //                             Totale: <span id='rit_totale'>${ordine.Totale}</span>
        //                         </li>
        //                         <li class='list-group-item'>
        //                             <div class="btn-group w-100" role="group" aria-label="accettorifiuto">
        //                                 <button type="button" class="btn btn-success">Accetto</button>
        //                                 <button type="button" class="btn btn-danger">Rifiuto</button>
        //                             </div>
        //                         </li>
        //                     </ul>
        //                 </div>
        //             `;
        //             $("#ord_lav").append(card);
        //         });
        //     }
        // );
        // $('#tabella_ordini').DataTable({
        //     ajax:"https://ristostore.it/RPA/ordini_driver?Id="+risposta.dati.Id,
        //     "columns": [
        //         { "data": "Id" },
        //         { "data": "Data" },
        //         { "data": "Attivita" }
        //     ],  
        //     "columnDefs": [ {
        //         "targets": -1,
        //         "data": null,
        //         "render": function ( data, type, row, meta ) {
        //             return '<a href="'+data+'">Vai</a>';
        //         }
        //     } ],  				
        //     "language": {
        //         "url": "/js/lib/Italian.json"
        //     },
        //     "bLengthChange": false,
        //     "pageLength": 25
        // });
        $('#tabella_ritiri').DataTable({
            ajax:"https://ristostore.it/RPA/ritiri_driver?Id_User="+Id_Driver,
            "columns": [
                { "data": "Id" },
                { "data": "DT_Consegna" },
                { "data": "Ragione_Sociale" },
                { "data": "Id" }
            ],  
            "columnDefs": [ {
                "targets": -1,
                "data": null,
                "render": function ( data, type, row, meta ) {
                    return "<button class='btn btn-primary vairitiro' type='button' data-ritiro='"+data+"'>Vai</button>";
                }
            } ],  				
            "language": {
                "url": "/js/lib/Italian.json"
            },
            "bLengthChange": false,
            "pageLength": 25
        });
    }

    $(document).on("click", ".vaicentrocontrollo", function(event) {
        let idatti=$(this).data("idatti");
        localStorage.setItem('AttivitaGestore', idatti);
        generaore(idatti);
        vai("settocentrocontrollo");
    });

    $(document).on("click", ".vairitiro", function(event) {
        var Id_User=localStorage.getItem('Id_User');
        let Id_Ritiro=$(this).data("ritiro");
        $.getJSON(
            "https://ristostore.it/RPA/ritiri_driver", 
            {
                "Id_User":Id_User,
                "Id_Ritiro":Id_Ritiro 
            },
            function (data, textStatus, jqXHR) {

                let ritiro =data.ritiro[0];
                $("#progressivo_ritiro").text(esi(ritiro.Progressivo_A));
                $("#ritrsa").text(ritiro.Ragione_Sociale);

                if(esi(ritiro.Attitel)!=""){
                    $("#ritattitel").removeClass("d-none").attr("href","tel:"+ritiro.Attitel);
                } else {
                    $("#ritattitel").addClass("d-none");
                }
                let DT_date = new Date(ritiro.DT_Consegna).toLocaleDateString("it-It");
                $("#ritdtconsegna").text(DT_date);
                $("#rittotale").text(ritiro.Totale_D);
                vai("settoreritiro");
            }
        );
    });

    $(document).on("click", ".tastoprocesso", function(event) {
        var Id_User=localStorage.getItem('Id_User');
        let tipo=$(this).data("tipo");
        let ido=$(this).data("ido");
        let idritiro=$(this).data("idritiro");
        let processo=$(this).data("processo");
        let dati_gestione_ro = {
            "Id_User":Id_User,
            "tipo":tipo,
            "ido":ido,
            "idritiro":idritiro,
            "processo":processo,
        }
        $.ajax({
            type: "POST",
            url: "https://ristostore.it/RPA/gestione_ro",
            data: dati_gestione_ro,
            success: function (response) {
                if(response="roaggiornati"){
                    if(tipo=="ritiro"){
                        switch (processo) {
                            case "accetto":
                                $("#card"+idritiro).find(".liazioni").html(`
                                    <div class="btn-group w-100" role="group" aria-label="accettorifiuto">
                                        <button type="button" data-tipo="${tipo}" data-ido="${ido}" data-idritiro="${idritiro}" data-processo="partenza" class="tastoprocesso btn btn-success">Partenza</button>
                                        <button type="button" data-tipo="${tipo}" data-ido="${ido}" data-idritiro="${idritiro}" data-processo="rifiuto" class="tastoprocesso btn btn-danger">Rifiuto</button>
                                    </div>
                                `);
                                break;
                            case "partenza":
                                $("#card"+idritiro).find(".liazioni").html(`
                                    <div class="btn-group w-100" role="group" aria-label="accettorifiuto">
                                        <button type="button" data-tipo="${datatipo}" data-ido="${ido}" data-idritiro="${idritiro}" data-processo="consegnato" class="tastoprocesso btn btn-success">Consegnato</button>
                                    </div>
                                `);
                            case "rifiuto":
                                $("#card"+idritiro).remove();
                                break;
                            case "consegnato":
                                $("#card"+idritiro).remove();
                                break;
                        }
                    }
                    if(tipo=="ordine"){
                        switch (processo) {
                            case "accetto":
                                $("#card"+idritiro).find(".liazioni").html(`
                                    <div class="btn-group w-100" role="group" aria-label="accettorifiuto">
                                        <button type="button" data-tipo="${datatipo}" data-ido="${ido}"  data-idritiro="${idritiro}" data-processo="consegnato" class="tastoprocesso btn btn-success">Consegnato</button>
                                        <button type="button" data-tipo="${datatipo}" data-ido="${ido}"  data-idritiro="${idritiro}" data-processo="rifiuto" class="tastoprocesso btn btn-danger">Rifiuto</button>
                                        <button type="button" data-tipo="${datatipo}" data-ido="${ido}"  data-idritiro="${idritiro}" data-processo="cancello" class="tastoprocesso btn btn-danger">Cancello</button>
                                    </div>
                                `);
                                break;
                            case "cancello":
                                $("#card"+idritiro).remove();
                            case "rifiuto":
                                $("#card"+idritiro).remove();
                                break;
                            case "consegnato":
                                $("#card"+idritiro).remove();
                                break;
                        }
                    }
                }
            }
        });

    });

    $(".togglexl").on("click", function (e) {
        e.preventDefault();
        var mxl=$("#mxl").val();
        if(mxl==0){
          $("#mxl").val("1");
          $(this).addClass("btn-primary").removeClass("nhsecondary");
        } else {
          $("#mxl").val("0");
          $(this).addClass("nhsecondary").removeClass("btn-primary");
        }
    });
    $(".toggleld").on("click", function (e) {
        e.preventDefault();
        var mld=$("#mld").val();
        if(mld==0){
          $("#mld").val("1");
          $(this).addClass("btn-primary").removeClass("nhsecondary");
        } else {
          $("#mld").val("0");
          $(this).addClass("nhsecondary").removeClass("btn-primary");
        }
    });
}
//console.log(`On easter we decorted ${eggCount}` easter eggs);
function esi(v,alt=""){
    if (typeof v === 'undefined' || v=="" || v==0) {
        console.log("MMhg "+v);
        return alt;
    } else {
        return v;
    }
}
