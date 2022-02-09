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

function vai(settore, origine="settorehome"){
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
        accesso(User,Pass,"Driver");
    });

    $("#indietrobutton").on("click", function () {
        var dest=localStorage.getItem('PaginaPrecedente');
        var origine=localStorage.getItem('PaginaAttuale');
        vai(dest, origine="settorehome");
    });

    $("#vaistorico").on("click", function () {
        vai("settorestorico");
    });

    function accesso(pUser,pPass,pTipo) {
        $.ajax({
            type: "POST",
            url: "https://ristostore.it/RPA/Accesso",
            data: {"Tipo":pTipo,"User" : pUser,"Pass" : pPass},
            success: function (response) {
                if(response!="Nessun_Tipo_Specificato"){
                    var risposta=JSON.parse(response);
                    if(risposta.ok){
                        localStorage.setItem('TipoUtenza', pTipo);
                        localStorage.setItem('User', pUser);
                        localStorage.setItem('Pass', pPass);
                        localStorage.setItem('Id_User', risposta.dati.Id);
                        $.getJSON("https://ristostore.it/RPA/ritiri_driver", 
                            {"Id_User":risposta.dati.Id,"In_Corso":"Si"},
                            function (data, textStatus, jqXHR) {
                                $.each( data, function( key, ritiro ) {
                                    let DT_engform = new Date(ritiro.DT_Consegna);
                                    let DT_date = DT_engform.toLocaleDateString("it-It");
                                    let ora = DT_engform.getHours();
                                    let minuti = DT_engform.getMinutes();
                                    var linkattitel="";
                                    if(esi(ritiro.Attitel)!=""){
                                        linkattitel=`<a class='btn btn-sm btn-primary ml-3' href='tel:${ritiro.Telefono}'>Chiama</a>`;
                                    }
                                    var linktelefono="";
                                    if(esi(ritiro.Telefono)!=""){
                                        linktelefono=`<li class='list-group-item'>
                                            <a class='btn btn-sm btn-primary w-100' href='tel:${ritiro.Telefono}'>Chiama il cliente</a>
                                        </li>`;
                                    }
                                    let card=`
                                        <div class='card text-dark bg-light mb-3 w-100'>
                                            <div class='card-header'>
                                                Ritiro <span id='progressivo_ritiro'></span> presso <strong id='rit_rsa'>${ritiro.Ragione_Sociale}</strong> ${linkattitel}
                                            </div>
                                            <ul class='list-group list-group-flush'>
                                                <li class='list-group-item'>
                                                    Consegna: <strong>${ora}:${minuti}</strong> del <span id='rit_dt_consegna'>${DT_date}</span>
                                                </li>
                                                ${linktelefono}
                                                <li class='list-group-item'>
                                                    Totale: <span id='rit_totale'>${ritiro.Totale_D}</span>
                                                </li>
                                                <li class='list-group-item'>
                                                    <div class="btn-group w-100" role="group" aria-label="accettorifiuto">
                                                        <button type="button" class="btn btn-success">Accetto</button>
                                                        <button type="button" class="btn btn-danger">Rifiuto</button>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    `;
                                    $("#rit_lav").append(card);
                                });
                            }
                        );
                        $.getJSON("https://ristostore.it/RPA/ordini_driver", 
                            {"Id_User":risposta.dati.Id,"In_Corso":"Si"},
                            function (data, textStatus, jqXHR) {
                                $.each( data, function( key, ordine ) {
                                    let DT_engform = new Date(ordine.DT_Consegna);
                                    let DT_date = DT_engform.toLocaleDateString("it-It");
                                    let ora = DT_engform.getHours();
                                    let minuti = DT_engform.getMinutes();
                                    var linkattitel="";
                                    if(esi(ordine.Attitel)!=""){
                                        linkattitel=`<a class='btn btn-sm btn-primary ml-3' href='tel:${ordine.Telefono}'>Chiama</a>`;
                                    }
                                    var linktelefono="";
                                    if(esi(ordine.Clientitel)!=""){
                                        linktelefono=`<li class='list-group-item'>
                                            <a class='btn btn-sm btn-primary w-100' href='tel:${ordine.Clientitel}'>Chiama il cliente</a>
                                        </li>`;
                                    }
                                    let card=`
                                        <div class='card text-dark bg-light mb-3 w-100'>
                                            <div class='card-header'>
                                                ordine <span id='progressivo_ordine'></span> presso <strong id='rit_rsa'>${ordine.Ragione_Sociale}</strong> ${linkattitel}
                                            </div>
                                            <ul class='list-group list-group-flush'>
                                                <li class='list-group-item'>
                                                    Consegna: <strong>${ora}:${minuti}</strong> del <span id='rit_dt_consegna'>${DT_date}</span>
                                                </li>
                                                ${linktelefono}
                                                <li class='list-group-item'>
                                                    Totale: <span id='rit_totale'>${ordine.Totale}</span>
                                                </li>
                                                <li class='list-group-item'>
                                                    <div class="btn-group w-100" role="group" aria-label="accettorifiuto">
                                                        <button type="button" class="btn btn-success">Accetto</button>
                                                        <button type="button" class="btn btn-danger">Rifiuto</button>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    `;
                                    $("#ord_lav").append(card);
                                });
                            }
                        );
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
                            ajax:"https://ristostore.it/RPA/ritiri_driver?Id_User="+risposta.dati.Id,
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
                        vai("settorehome");
                    }
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(textStatus + jqXHR.responseText);
            }
        });
    }

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
