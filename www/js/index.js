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

function vai(settore){
    $(".settore").addClass("d-none");
    $("#"+settore).removeClass("d-none")
}

function onDeviceReady() {
    // Cordova is now initialized. Have fun!
    // console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    // document.getElementById('deviceready').classList.add('ready');
    

    $("#Accedi").on("click", function () {
        var User=$("User").val();
        var Pass=$("Pass").val();
        $.ajax({
            type: "post",
            url: "https://ristostore.it/RPA/Accesso",
            data: {"Tipo":"Driver","User" : User,"Pass" : Pass},
            success: function (response) {
                if(response!="Nessun_Tipo_Specificato"){
                    var risposta=JSON.parse(response);
                    if(risposta.ok){
                        console.log(risposta.dati);
                        vai("settoreordini");
                        $('#tabella_ordini').DataTable({
                            ajax:"https://ristostore.it/RPA/ordini_driver",
                            "columns": [
                                { "data": "Id" },
                                { "data": "Data" },
                                { "data": "Attivita" }
                            ],  
                            "columnDefs": [ {
                                "targets": -1,
                                "data": null,
                                "render": function ( data, type, row, meta ) {
                                    return '<a href="'+data+'">Vai</a>';
                                }
                            } ],  		
                            // "columnDefs": [ {
                            //     "targets": -1,
                            //     "data": null,
                            //     "defaultContent": "<button>Click!</button>"
                            // } ],  		
                            "language": {
                                "url": "/js/lib/Italian.json"
                            },
                            "bLengthChange": false,
                            "pageLength": 25
                        });
                    }
                }
            }
        });

    });

}
