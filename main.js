// Backend simple con Google Sheets (Código hecho con Gemini)
// https://script.google.com/macros/s/AKfycbzTd-AlhhL0CZUmZLqgrv2umab75_ZrnyqFzIJxWmuhYtscpXXsP0Z-9ADVehMHKgNTeQ/exec
// CONFIGURACIÓN INICIAL

const URL_ENVIAR_MAIL = "https://script.google.com/macros/s/AKfycbzUOdqA9PZCF9t1fhMR7TrERFeVz4IibYRc5BxNZRpVZsai06JpGBI1lfc4GfFf7WUkwQ/exec";



const CLAVE_MAIL = "patukPatonsito";



async function enviarMail(mail, asunto, texto) {

  const datos = {

    clave: CLAVE_MAIL,

    mail: mail,

    asunto: asunto,

    texto: texto

  };



  try {

    await fetch(URL_ENVIAR_MAIL, {

      method: "POST",

      mode: "no-cors",

      headers: {

        "Content-Type": "text/plain"

      },

      body: JSON.stringify(datos)

    });



    console.log("Pedido de envío enviado al Apps Script");

    return true;



  } catch (error) {

    console.error("Error al intentar enviar el mail:", error);

    return false;

  }

}



const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzTd-AlhhL0CZUmZLqgrv2umab75_ZrnyqFzIJxWmuhYtscpXXsP0Z-9ADVehMHKgNTeQ/exec";



// --- TUS FUNCIONES PARA USAR EN EL FRONTEND ---



// 1. Obtener fila disponible (Lectura = GET)

async function getNewLine(nombreHoja) {

    try {

        const url = `${WEB_APP_URL}?action=getNewLine&hoja=${nombreHoja}`;

        const resp = await fetch(url);

        const json = await resp.json();

        return json.data;

    } catch (error) {

        console.error("Error en getNewLine:", error);

    }

}



// 2. Obtener letra de columna disponible (Lectura = GET)

async function getNewColumn(nombreHoja) {

    try {

        const url = `${WEB_APP_URL}?action=getNewColumn&hoja=${nombreHoja}`;

        const resp = await fetch(url);

        const json = await resp.json();

        return json.data;

    } catch (error) {

        console.error("Error en getNewColumn:", error);

    }

}



// 3. Obtener valor de celda (Lectura = GET)

async function getCell(nombreHoja, fila, columna) {

    try {

        const url = `${WEB_APP_URL}?action=get&hoja=${nombreHoja}&fila=${fila}&columna=${columna}`;

        const resp = await fetch(url);

        const json = await resp.json();

        return json.data;

    } catch (error) {

        console.error("Error en getCell:", error);

    }

}



// 4. Asignar valor (Escritura = POST)

async function setCell(nombreHoja, fila, columna, valor) {

    try {

        // En POST, enviamos los datos en el 'body'.

        // No enviamos headers complejos para evitar que el navegador lance un error CORS de "Preflight".

        await fetch(WEB_APP_URL, {

            method: "POST",

            body: JSON.stringify({

                action: "set",

                params: { hoja: nombreHoja, fila, columna, valor }

            })

        });

        console.log(`Valor '${valor}' enviado a la hoja '${nombreHoja}' (Fila: ${fila}, Columna: ${columna})`);

    } catch (error) {

        console.error("Error en setCell:", error);

    }

}


// Código hecho por Andrés Rigoni (productos por David Di Francesca)

let currentAccount = "none";
let currentData = ["", "", 0, "", "", ""];
let currentRequests = [];

let productos = [];
const savedCurrentAccount = localStorage.getItem("currentAccount");
if (savedCurrentAccount !== null) {
    try {
        const parsedAccount = JSON.parse(savedCurrentAccount);
        if (typeof parsedAccount === "number" && !Number.isNaN(parsedAccount)) {
            currentAccount = parsedAccount;
        }
    } catch (err) {
        console.warn("No se pudo leer currentAccount de localStorage:", err);
    }
}

let fotoBase64 = "";

let productImg = "";

async function updateProductos(){
    productos = [];
    productosString = "[";
    const productosCantidad = (await getNewLine("productos")) - 2;
    for(let i = 0; i < productosCantidad; i++){
        const rawProducto = await getCell("productos", i+2, "F");
        console.log(rawProducto);
        if(rawProducto){
            productosString += rawProducto + ",";
        }
        console.log("un producto hecho");
    }
    productosString += "]";
    productos = eval(productosString);
    console.log("productos cargados");
    console.log(productos);
    if(document.getElementsByClassName("contenido")[0].innerHTML == "" || document.getElementsByClassName("contenido")[0].innerHTML == `<button class="addProductBtn" onclick="openNewProduct()">+</button>`){
        openEcommerce();
    }else{
        inicio();
    }
}

async function updateCurrentData(){
    updateProductos();
    if(currentAccount !== "none"){
        const currentRaw = await getCell("cuentas", currentAccount+2, "G");
        try{
            currentData = JSON.parse(currentRaw);
        }catch(err){
            currentData = ["", "", 0, "cliente", "", false];
            console.warn("No se pudo parsear currentData:", err, currentRaw);
        }
        console.log("updated current data");
        console.log(currentData);
        if(document.getElementsByClassName("cuentaCont")[0].innerHTML != ""){
            closeSection("cuenta");
            openCuenta();
            console.log("cuenta actualizada")
        }
    }
    const requestsRaw = await getCell("cuentas", 2, "H");
    try{
        currentRequests = JSON.parse(requestsRaw || "[]");
    }catch(err){
        currentRequests = [];
        console.warn("No se pudo parsear currentRequests:", err, requestsRaw);
    }
    console.log("Current Requests Array");
    console.log(currentRequests);
    if(document.getElementsByClassName("socialCont")[0].innerHTML != ""){
        closeSection("social");
        openSocial();
    }
    if(currentAccount != "none"){
        if(currentData[4] != ""){
            document.getElementsByClassName("cuentaImg")[0].src = currentData[4];
        }
    }
}
updateCurrentData();

function openCuenta(){
    openSection("cuenta", `
    <img class="profileAccount" src="assets/account.png">
    <div class="nameAccount"></div>
    <input type="file" class="inputFoto" accept="image/*" onchange="previewFoto(event)">
    <div class="settingsAccount"></div>
    `);
    if(currentAccount == "none"){
        document.getElementsByClassName("nameAccount")[0].innerHTML = "Sin cuenta";
        document.getElementsByClassName("settingsAccount")[0].innerHTML = `
        <button class="socialBtn" onclick="openLogin()">Iniciar Sesión</button>
        <button class="changePasswordBtn" onclick="register()">Registrarse</button>
        `;
        document.getElementsByClassName("inputFoto")[0].remove();
    }
    else{
        document.getElementsByClassName("nameAccount")[0].innerHTML = currentData[0] || "Cargando...";
        document.getElementsByClassName("settingsAccount")[0].innerHTML = `
        <button class="socialBtn" onclick="openSocial()">Social</button>
        <button class="changePasswordBtn" onclick="changePassword()">Cambiar contraseña</button>
        <button class="closeSessionBtn" onclick="closeSession()">Cerrar sesión</button>
        <div class="saldoTxt">Saldo: <b class="saldoNum">$${currentData[2]}</b></div>
        `;
        document.getElementsByClassName("profileAccount")[0].src = currentData[4] || "assets/account.png";
        setTimeout(function(){
            if(document.getElementsByClassName("cuentaCont")[0].innerHTML != ""){
                document.getElementsByClassName("nameAccount")[0].innerHTML = currentData[0] || "Cargando...";
                document.getElementsByClassName("profileAccount")[0].src = currentData[4] || "assets/account.png";
                document.getElementsByClassName("saldoNum")[0].innerHTML = "$" + currentData[2];
            }
        }, 500);
    }
}

async function openSocial(){
    closeSection("cuenta");
    openSection("social", `
    <div class="backToAccount" onclick="closeSection('social'); openCuenta()">VOLVER</div>
    <div class="rolTxt">· ${currentData[3]}</div>
    `);
    if(currentData[3] == "cliente"){
        document.getElementsByClassName("section")[0].innerHTML += `
        <button class="requestButton" onclick="requestVendedor()">Solicitar rol de vendedor</button>
        `;
        if(currentData[5]){
            document.getElementsByClassName("requestButton")[0].innerHTML = `Cancelar`;
        }
    }
    if(currentData[3] == "admin"){
        document.getElementsByClassName("section")[0].innerHTML += `<div class="requestsCont"></div>`;
        for(let i = 0; i < currentRequests.length; i++){
            if(document.getElementsByClassName("socialCont")[0].innerHTML != ""){
                let iData = JSON.parse(await getCell("cuentas", currentRequests[i]+2, "G"));
                let iName = iData[0];
                let iImg = iData[4] || "assets/account.png";
                if(document.getElementsByClassName("socialCont")[0].innerHTML != ""){
                    document.getElementsByClassName("requestsCont")[0].innerHTML += `
                    <div class="requestDiv">
                        <img src="${iImg}" class="socialRequestImg">
                        <div class="socialRequestName">${iName}</div>
                        <button onclick="acceptRequest(${currentRequests[i]})" class="socialBtnAccept">ACEPTAR</button>
                        <button onclick="removeRequest(${currentRequests[i]})" class="socialBtnRemove">🗑️</button>
                    </div>`;
                }else{
                    break;
                }
                console.log("ya renderizamos uno, es:" + currentRequests[i]);
            }
        }
        console.log("ya renderizamos todo");
    }
    document.getElementsByClassName("section")[0].innerHTML += `
    <button class="ingresarDineroBtn" onclick="ingresarDinero(100)">INGRESAR $100 ARS</button>
    <p class="saldoEnSocial">$${currentData[2]}</p>
    <p class="mercadoPagoAclaracion">Mercado Pago: próximamente</p>
    `;
}

async function ingresarDinero(num){
    currentData[2] = Number(currentData[2]) + Number(num);
    if(document.getElementsByClassName("socialCont")[0].innerHTML != ""){
        document.getElementsByClassName("saldoEnSocial")[0].innerHTML = "$" + currentData[2];
    }
    await setCell("cuentas", currentAccount+2, "C", currentData[2]);
}

async function acceptRequest(num){
    document.getElementsByClassName("requestDiv")[currentRequests.indexOf(num)].remove();
    currentRequests = currentRequests.filter(elemento => elemento !== num);
    openSocial();
    await setCell("cuentas", num+2, "D", "vendedor");
    await setCell("cuentas", num+2, "F", "FALSE");
//    for(let i = 0; i < document.getElementsByClassName("requestsCont").length; i++){
//        document.getElementsByClassName("requestDiv")[i].getElementsByClassName("socialBtnAccept")[0].onclick = function(){
//            acceptRequest(currentRequests[i]);
//        };
//        document.getElementsByClassName("requestDiv")[i].getElementsByClassName("socialBtnRemove")[0].onclick = function(){
//            removeRequest(currentRequests[i]);
//        };
//    }
}
async function removeRequest(num){
    document.getElementsByClassName("requestDiv")[currentRequests.indexOf(num)].remove();
    currentRequests = currentRequests.filter(elemento => elemento !== num);
    openSocial();
    await setCell("cuentas", num+2, "D", "cliente");
    await setCell("cuentas", num+2, "F", "FALSE");
//    for(let i = 0; i < document.getElementsByClassName("requestsCont").length; i++){
//        document.getElementsByClassName("requestDiv")[i].getElementsByClassName("socialBtnAccept")[0].onclick = function(){
//            acceptRequest(currentRequests[i]);
//        };
//        document.getElementsByClassName("requestDiv")[i].getElementsByClassName("socialBtnRemove")[0].onclick = function(){
//            removeRequest(currentRequests[i]);
//        };
//    }
}

async function requestVendedor(){
    if(currentData[5]){
        currentData[5] = false;
        await setCell("cuentas", currentAccount+2, "F", "FALSE");
    }else{
        currentData[5] = true;
        alert("Solicitado con éxito");
        await setCell("cuentas", currentAccount+2, "F", "TRUE");
    }
    closeSection("social");
    openCuenta();
    openSocial();
}

async function reducirFoto(base64Original) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Original;
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            let anchoFinal = 200;
            let altoFinal = 200;
            let xSurgente = 0;
            let ySurgente = 0;
            if (img.width > img.height) {
                anchoFinal = (img.width / img.height) * 200;
                xSurgente = (200 - anchoFinal) / 2;
            } else {
                altoFinal = (img.height / img.width) * 200;
                ySurgente = (200 - altoFinal) / 2;
            }
            ctx.drawImage(img, xSurgente, ySurgente, anchoFinal, altoFinal);
            const base64Reducido = canvas.toDataURL('image/jpeg', 0.8);
            resolve(base64Reducido);
        };
    });
}

async function previewFoto(event, producto = false, filaDestino){
    const archivo = event.target.files[0];
    if(archivo){
        const reader = new FileReader();
        reader.onload = async function(e){
            let fotoGigante = e.target.result;
            fotoBase64 = await reducirFoto(fotoGigante);
            if(!producto){
                document.getElementsByClassName('profileAccount')[0].src = fotoBase64;
                await setCell("cuentas", currentAccount+2, "E", fotoBase64);
                currentData[4] = fotoBase64;
            }else{
                await setCell("productos", filaDestino, "E", fotoBase64);
            }
        }
        reader.readAsDataURL(archivo);
    }
}

function closeSession(){
    currentAccount = "none";
    saveAllToLocalStorage();
    alert("Se ha cerrado la sesión");
    closeSection("cuenta");
}

function register(){
    closeSection("cuenta");
    openSection("registrarse",`
        <div class="backToAccount" onclick="closeSection('registrarse'); openCuenta()">VOLVER</div>
        <div class="userRegistrarseText">Usuario: <input type="text" class="userRegistrarseInput"></div>
        <div class="passwordRegistrarseText">Contraseña: <input type="password" class="passwordRegistrarseInput"></div>
        <button class="registrarseBtn" onclick="createAccount()">Registrarse</button>
    `);
    
}

function openSection(title, content){
    document.getElementsByClassName(title+"Cont")[0].innerHTML = `
    <div class="section">
        <div class="sectionTitle">
            ${firstCap(title)}
            <div class="sectionClose" onclick="closeSection('${title}')">❌</div>
        </div>
        ${content}
    </div>
    `;
}

async function createAccount(){
    userInput = document.getElementsByClassName("userRegistrarseInput")[0];
    passwordInput = document.getElementsByClassName("passwordRegistrarseInput")[0];
    if(userInput.value && passwordInput.value){
        document.getElementsByClassName("registrarseBtn")[0].innerHTML = "Por favor, espere...";
        document.getElementsByClassName("registrarseBtn")[0].onclick = "";
        let cuentasNames = [];
        for(let i = 0; i < await getNewLine("cuentas")-1; i++){
            cuentasNames.push(await getCell("cuentas", i+1, "A"));
        }
        if(cuentasNames.includes(userInput.value)){
            alert("Usuario en uso");
        }else{
            let lineNow = await getNewLine("cuentas");
            setCell("cuentas", lineNow, "A", userInput.value);
            setCell("cuentas", lineNow, "B", passwordInput.value);
            setCell("cuentas", lineNow, "C", 0);
            setCell("cuentas", lineNow, "D", "cliente");
            setCell("cuentas", lineNow, "F", "FALSE");
            setCell("cuentas", lineNow, "G", `=SI(A${lineNow}="";"";"["""&A${lineNow}&""","""&B${lineNow}&""","""&${lineNow}&""","""&D${lineNow}&""","""&E${lineNow}&""","&MINUSC(TO_TEXT(F${lineNow}))&"]")`);
            alert(`Cuenta ${userInput.value} creada`);
            closeSection("registrarse");
            currentAccount = lineNow-2
            updateCurrentData();
            openCuenta();
        }
    }else{
        alert("Completa los campos");
    }
    saveAllToLocalStorage();
}

function openLogin(){
    closeSection("cuenta");
    openSection("ingresar", `
        <div class="backToAccount" onclick="closeSection('ingresar'); openCuenta()">VOLVER</div>
        <div class="userLoginText">Usuario: <input type="text" class="userLoginInput"></div>
        <div class="passwordLoginText">Contraseña: <input type="password" class="passwordLoginInput"></div>
        <button class="loginBtn" onclick="login()">Iniciar Sesión</button>
    `);
}

function changePassword(){
    document.getElementsByClassName("settingsAccount")[0].innerHTML = `
    <div class="backToAccount" style="top: 2vh;" onclick="closeSection('cuenta'); openCuenta()">VOLVER</div>
    <div class="actualPasswordText">Contraseña Actual: <input type="text" class="actualPasswordInput"></div>
    <div class="newPasswordText">Nueva Contraseña: <input type="text" class="newPasswordInput"></div>
    <button onclick="newPassword()" class="changePasswordBtn">Cambiar contraseña</button>
    `;
}

async function newPassword(){
    let actualInput = document.getElementsByClassName("actualPasswordInput")[0];
    let newInput = document.getElementsByClassName("newPasswordInput")[0];
    if(actualInput.value && newInput.value){
        if(actualInput.value == currentData[1]){
            document.getElementsByClassName("changePasswordBtn")[0].innerHTML = "Por favor, espere...";
            await setCell("cuentas", currentAccount + 2, "B", newInput.value);
            alert("Contraseña cambiada con éxito");
            await updateCurrentData();
            closeSection('cuenta');
            openCuenta();
        } else {
            alert("La contraseña actual es incorrecta");
        }
    } else {
        alert("Completa los campos");
    }
}

async function login(){
    let userInput = document.getElementsByClassName("userLoginInput")[0];
    let passwordInput = document.getElementsByClassName("passwordLoginInput")[0];
    if(userInput.value && passwordInput.value){
        const loginBtn = document.getElementsByClassName("loginBtn")[0];
        loginBtn.innerHTML = "Por favor, espere...";
        loginBtn.onclick = function(){
            alert("Esperá");
        };
        const totalLines = (await getNewLine("cuentas")) - 1;
        let encontrado = -1;
        for(let i = 0; i < totalLines; i++){
            const crudo = await getCell("cuentas", i+2, "G");
            let userData;
            try{
                userData = JSON.parse(crudo);
            }catch(e){
                continue;
            }
            if(userData[0] === userInput.value){
                encontrado = i;
                break;
            }
        }
        if(encontrado === -1){
            alert("Usuario o contraseña incorrectos");
            loginBtn.innerHTML = "Iniciar Sesión";
            loginBtn.onclick = login;
            return;
        }
        const crudo = await getCell("cuentas", encontrado+2, "G");
        const userData = JSON.parse(crudo);
        if(userData[1] !== passwordInput.value){
            alert("Usuario o contraseña incorrectos");
            loginBtn.innerHTML = "Iniciar Sesión";
            loginBtn.onclick = login;
            return;
        }
        currentAccount = encontrado;
        saveAllToLocalStorage();
        alert("Sesión iniciada correctamente");
        loginBtn.innerHTML = "Sincronizando...";
        await updateCurrentData();
        closeSection("ingresar");
        openCuenta();
    }else {
        alert("Completa los campos");
    }
}

function inicio(){
    closeSection("cuenta");
    closeSection("registrarse");
    closeSection("ingresar");
    closeSection("social");
    document.getElementsByClassName("contenido")[0].innerHTML = `
    <div class="inicioBienvenida">
        <h2>¡Bienvenido a <div style="color: #77d9fa">Flatulenders</div>!</h2>
        <p>Plataforma digital de compra y venta de productos. La mejor, con el mejor servicio.</p>
        <img class="inicioBienvenidaLogo" src="assets/flatulenders.png">
        <button class="inicioBienvenidaExplorarBtn" onclick="openEcommerce()">Explorar productos <div class="inicioBienvenidaFlechita">➡️</div></button>
    </div>
    <div class="inicioNav">
        Navegación
        <div class="inicioNavItemsCont">
            <div class="inicioNavItem">
                <img class="inicioNavLogo" src="https://images.vexels.com/media/users/3/157512/isolated/lists/d737a872708b488d89d0341ac9b8bc5a-people-contact-icon-people.png">
                <h3>About Us</h3>
                <p>Conocé más sobre nosotros</p>
                <button onclick="openAboutUs()">
                    <div class="inicioNavItemsBtn">Conocer más</div>
                    <div class="inicioNavItemsFlechita">➡️</div>
                </button>
            </div>
            <div class="inicioNavItem">
                <img class="inicioNavLogo" src="https://logospng.org/download/gmail/logo-gmail-4096.png">
                <h3>Contacto</h3>
                <p>Contactanos si tenés dudas o sugerencias</p>
                <button onclick="openContacto()">
                    <div class="inicioNavItemsBtn">Contactar</div>
                    <div class="inicioNavItemsFlechita">➡️</div>
                </button>
            </div>
            <div class="inicioNavItem">
                <img class="inicioNavLogo" src="https://cdn.icon-icons.com/icons2/1138/PNG/512/1486395294-02-shopping-bag_80566.png">
                <h3>e-commerce</h3>
                <p>Explorá nuestro catálogo de productos</p>
                <button onclick="openEcommerce()">
                    <div class="inicioNavItemsBtn">Ver productos</div>
                    <div class="inicioNavItemsFlechita">➡️</div>
                </button>
            </div>
        </div>
    </div>
    <div class="inicioAccount">
        <h2>
            <img src="https://icons.veryicon.com/png/o/miscellaneous/administration/account-25.png" class="inicioAccountImg">
            Tu rol actual: 
            <div class="inicioAccountRol"></div>
            <div class="barritaLateral"></div>
        </h2>
        <p>Funciones disponibles para ${currentData[3] || "cliente"}:</p>
        <ul class="inicioAccountFuncionesDisponibles"></ul>
        <button class="inicioAccountBtn" onclick="openCuenta()">Ir a mi cuenta <div class="inicioAccountFlechita">➡</div></button>
    </div>
    <div class="inicioPromociones">
        <h2>🔥Promociones destacadas</h2>
        <div class="tematicaProductosCont" id="contPromociones"></div>
    </div>
    <div class="inicioProductos">
        <h2>🛒Productos destacados</h2>
        <div class="tematicaProductosCont" id="contDestacados"></div>
    </div>
    `;
    
    document.getElementsByClassName("inicioAccountRol")[0].innerHTML = firstCap(currentData[3] || "cliente");
    if(currentData[3] == "admin"){
        document.getElementsByClassName("inicioAccountFuncionesDisponibles")[0].innerHTML = `
        <li>Aceptar solicitudes para vendedor</li>
        <li>Gestionar todo</li>
        <li>Subir productos</li>
        <li>Brindar soporte</li>
        `;
    }else if(currentData[3] == "vendedor"){
        document.getElementsByClassName("inicioAccountFuncionesDisponibles")[0].innerHTML = `
        <li>Subir productos</li>
        <li>Comprar productos</li>
        <li>Gestionar tu saldo</li>
        <li>Administrar promociones</li>
        `;
    }else{
        document.getElementsByClassName("inicioAccountFuncionesDisponibles")[0].innerHTML = `
        <li>Explorar y comprar productos</li>
        <li>Ver promociones exclusivas</li>
        <li>Gestionar tu saldo</li>
        <li>Solicitar rol de vendedor</li>
        <li>Contactar soporte</li>
        `;
    }
    let promos = productos.filter(p => p.descuento > 0).slice(0, 10);
    let promosHTML = "";
    promos.forEach(p => {
        let originalIndex = productos.indexOf(p);
        promosHTML += `
            <div class="producto">
                <img src="${p.img}">
                <h2>${p.producto} <span style="color: #77d9fa; font-size: 1.5vh;">(-${p.descuento}%)</span></h2>
                <p>$${(p.precio * (1 - p.descuento / 100)).toFixed(2)}</p>
                <button onclick="verProducto(${originalIndex})">Ver más</button>
            </div>
        `;
    });
    document.getElementById("contPromociones").innerHTML = promosHTML || "<p style='margin-left: 2vw; color: lightgray;'>No hay promociones en este momento.</p>";
    let mezclados = [...productos].sort(() => 0.5 - Math.random());
    let destacados = mezclados.slice(0, 10);
    let destacadosHTML = "";
    destacados.forEach(p => {
        let originalIndex = productos.indexOf(p);
        destacadosHTML += `
            <div class="producto">
                <img src="${p.img}">
                <h2>${p.producto}</h2>
                <p>$${p.precio}</p>
                <button onclick="verProducto(${originalIndex})">Ver más</button>
            </div>
        `;
    });
    document.getElementById("contDestacados").innerHTML = destacadosHTML || "<p style='margin-left: 2vw; color: lightgray;'>Cargando catálogo...</p>";
}
inicio()

async function openEcommerce(){
    closeSection("cuenta");
    closeSection("registrarse");
    closeSection("ingresar");
    closeSection("social");
    if(currentData[3] == "admin" || currentData[3] == "vendedor"){
        document.getElementsByClassName("contenido")[0].innerHTML = `<button class="addProductBtn" onclick="openNewProduct()">+</button>`;
    }else{
        document.getElementsByClassName("contenido")[0].innerHTML = "";
    }
    const productosCantidad = productos.length;
    for(let i = 0; i < productosCantidad; i++){
        let productoData = productos[i];
        document.getElementsByClassName("contenido")[0].innerHTML += `
            <div class="producto">
                <img src="${productoData.img}">
                <h2>${productoData.producto}</h2>
                <p>$${productoData.precio}</p>
                <button onclick="verProducto(${i})">Ver más</button>
            </div>
        `;   
    }
}

function openContacto(){
    closeSection("cuenta");
    closeSection("registrarse");
    closeSection("ingresar");
    closeSection("social");
    document.getElementsByClassName("contenido")[0].innerHTML = `
    <div style="color: white; text-align: center; padding-top: 5vh;  width: 100vw; height: 80vh; position: absolute; bottom 10vh; display: flex; justify-content: center; flex-direction: column; align-items: center;">
        <h1 style="color: #77d9fa; margin-bottom: 2vh;">Contacto</h1>
        <p style="margin-bottom: 3vh; color: lightgray;">¿Tenés dudas o sugerencias? Dejanos tu mensaje.</p>
        
        <input type="text" id="asuntoInput" placeholder="Asunto" style="width: 40vw; padding: 1.5vh; border-radius: 1vh; border: none; margin-bottom: 2vh; font-size: 2vh;"><br>
        <textarea id="mensajeInput" placeholder="Tu mensaje..." style="width: 40vw; height: 15vh; padding: 1.5vh; border-radius: 1vh; border: none; margin-bottom: 3vh; font-size: 2vh; resize: none; font-family: sans-serif;"></textarea><br>
        
        <button class="inicioBienvenidaExplorarBtn" id="btnEnviarCorreo" style="position: relative; left: 0; bottom: 0; width: 20vw; margin-bottom: 4vh;" onclick="mandarContacto()">Enviar Mensaje</button>
        
        <p style="color: lightgray; font-size: 2vh;">O envianos un mail directo a:</p>
        <p style="color: #77d9fa; font-size: 2vh; margin-top: 1vh; line-height: 1.5;">
            rigoni.andres@cesd.edu.ar<br>
            difrancesca.david@cesd.edu.ar
        </p>
    </div>
    `;
}

async function mandarContacto() {
    const asunto = document.getElementById("asuntoInput").value;
    const mensaje = document.getElementById("mensajeInput").value;
    const btn = document.getElementById("btnEnviarCorreo");

    if (asunto && mensaje) {
        btn.innerHTML = "Enviando...";
        btn.onclick = null; // Desactiva el botón para que no hagan doble clic
        
        const textoCompleto = "Mensaje enviado desde la web de Flatulenders:\\n\\n" + mensaje;
        
        // Se manda a las dos cuentas de los admins usando tu función
        await enviarMail("rigoni.andres@cesd.edu.ar", asunto, textoCompleto);
        await enviarMail("difrancesca.david@cesd.edu.ar", asunto, textoCompleto);
        
        alert("¡Mensaje enviado con éxito! Nos contactaremos a la brevedad.");
        openContacto(); // Vuelve a cargar la sección para limpiar los inputs
    } else {
        alert("Por favor, completá el asunto y el mensaje.");
    }
}

async function openAboutUs(){
    closeSection("cuenta");
    closeSection("registrarse");
    closeSection("ingresar");
    closeSection("social");
    document.getElementsByClassName("contenido")[0].innerHTML = `
    <div style="color: white; text-align: center; padding-top: 5vh; width: 100vw; height: 80vh; position: absolute; bottom 10vh; display: flex; justify-content: center; flex-direction: column; align-items: center;">
        <h1 style="color: #77d9fa; margin-bottom: 5vh;">Sobre Nosotros</h1>
        
        <div style="display: flex; justify-content: center; gap: 5vw;">
            <div style="width: 25vw; background: #272727; border: 2px solid #00f7ff; border-radius: 2vh; padding: 3vh; box-shadow: 0 0 1vh black;">
                <img src="${await getCell("cuentas", 2, "E")}" style="width: 15vh; height: 15vh; border-radius: 50%; border: 2px solid #77d9fa; margin-bottom: 2vh;">
                <h2 style="color: #77d9fa; margin-bottom: 1vh;">Gamiori (Andrés)</h2>
                <h3 style="color: lightgray; font-size: 2vh; margin-bottom: 2vh;">Admin / Desarrollador</h3>
                <ul style="text-align: left; color: white; font-size: 2vh; line-height: 1.8; margin-left: 2vw;">
                    <li>14 años</li>
                    <li>Gestión del Frontend</li>
                    <li>Pianista, programador.</li>
                </ul>
            </div>

            <div style="width: 25vw; background: #272727; border: 2px solid #00f7ff; border-radius: 2vh; padding: 3vh; box-shadow: 0 0 1vh black;">
                <img src="${await getCell("cuentas", 3, "E")}" style="width: 15vh; height: 15vh; border-radius: 50%; border: 2px solid #77d9fa; margin-bottom: 2vh;">
                <h2 style="color: #77d9fa; margin-bottom: 1vh;">Davo777 (David)</h2>
                <h3 style="color: lightgray; font-size: 2vh; margin-bottom: 2vh;">Admin / Productos</h3>
                <ul style="text-align: left; color: white; font-size: 2vh; line-height: 1.8; margin-left: 2vw;">
                    <li>14 años</li>
                    <li>Gestión de productos y Backend</li>
                    <li>Fútbol, fútbol.</li>
                </ul>
            </div>
        </div>
    </div>
    `;
}

function openNewProduct(){
    openSection("producto", `
        <center>
            <div class="newProductNameText">
                Nombre del producto:
                <input class="newProductName" type="text">
            </div>
            <br>
            <div class="newProductPriceText">
                Precio: $
                <input class="newProductPrice" type="number" min="0">
            </div>
            <br>
            <div class="newProductDiscountText">
                Descuento (opcional):
                <input class="newProductDiscount" type="number" value="0" min="0" max="100">%
            </div>
            <br>
            <div class="newProductImgText">
                Imagen:
                <input class="newProductImg" type="file" accept="image/*" onchange="productImg = this.files[0]">
            </div>
            <br>
            <button class="publishBtn" onclick="createProduct()">Publicar</button>
        </center>
    `);
}

async function createProduct(){
    let productName = document.getElementsByClassName("newProductName")[0];
    let productPrice = document.getElementsByClassName("newProductPrice")[0];
    let productDiscount = document.getElementsByClassName("newProductDiscount")[0];
    if(productName.value && productPrice.value && productImg){
        document.getElementsByClassName("publishBtn")[0].innerHTML = "Por favor, espere...";
        document.getElementsByClassName("publishBtn")[0].onclick = function(){
            alert("Esperá");
        };
        let lineNow = await getNewLine("productos");
        await setCell("productos", lineNow, "A", productName.value);
        await setCell("productos", lineNow, "B", productPrice.value);
        await setCell("productos", lineNow, "C", currentData[0]);
        await setCell("productos", lineNow, "D", productDiscount.value);
        await setCell("productos", lineNow, "F", `=SI(A${lineNow} <> ""; "{ producto: '" & A${lineNow} & "', precio: " & SI(B${lineNow}=""; 0; B${lineNow}) & ", proveedor: '" & C${lineNow} & "', descuento: " & SI(D${lineNow}=""; 0; D${lineNow}) & ", img: '" & E${lineNow} & "' }"; "")`);
        previewFoto({ target: { files: [productImg] } }, true, lineNow);
        alert("Producto " + productName.value + " añadido a tu puesto de venta.")
        setTimeout(function(){
            closeSection("producto");
            updateProductos();
            openEcommerce();
        }, 500);
    }else{
        alert("Completa los campos")
    }
    updateCurrentData();
    openEcommerce();
}

function verProducto(num){
    let productosCantidad = productos.length;
    let productoData = productos[num];
    document.getElementsByClassName("contenido")[0].innerHTML = `
    <img src="${productoData.img}" class="productoVistaImg">
    <p class="productoVistaPrecio">Precio: $${(productoData.precio * (1 - productoData.descuento / 100)).toFixed(2)} ARS</p>
    <h1 class="productoVistaNombre"><u>${productoData.producto}</u></h1>
    <p class="productoVistaProveedor">Por ${productoData.proveedor}</p>
    <ul class="productoVistaLista">
        <li>Envío gratis (a Córdoba)</li>
        <li>Llega en 3 días hábiles</li>
        <li>Alta calidad</li>
    </ul>
    <button class="productoVistaComprar" onclick="buy(${num})">Comprar</button>
    <p class="productoVistaSaldo">Saldo: $${currentData[2]}</p>
    `;
}

async function buy(num){
    if(Number(currentData[2]) >= Number(productos[num].precio * (1 - productos[num].descuento / 100))){
        currentData[2] = Number(currentData[2]) - (Number(productos[num].precio * (1 - productos[num].descuento / 100)));
        alert("Artículo " + productos[num].producto + " comprado con éxito. Saldo: " + currentData[2] + " ARS.");
        document.getElementsByClassName("productoVistaSaldo")[0].innerHTML = `Saldo: $${currentData[2]}`;
        await setCell("cuentas", currentAccount+2, "C", currentData[2]);
        let allNames = eval(await getCell("cuentas", 3, "H"));
        let proveedorUser = allNames.indexOf(productos[num].proveedor);
        if(proveedorUser !== -1){
            let proveedorData = JSON.parse(await getCell("cuentas", proveedorUser+2, "G"));
            console.log(proveedorData);
            proveedorData[2] = Number(proveedorData[2]) + Number(productos[num].precio * (1 - productos[num].descuento / 100));
            await setCell("cuentas", proveedorUser+2, "C", proveedorData[2]);
            if(productos[num].proveedor == currentData[0]){
                currentData[2] = proveedorData[2];
                document.getElementsByClassName("productoVistaSaldo")[0].innerHTML = `Saldo: $${currentData[2]}`;
            }
        }else{
            console.warn("No se encontró al proveedor en la lista de cuentas:", productos[num].proveedor);
        }
    }else{
        alert("Saldo insuficiente.")
    }
}

function closeSection(title){
    document.getElementsByClassName(title+"Cont")[0].innerHTML = "";
}

function firstCap(title){
    return title.charAt(0).toUpperCase() + title.slice(1);
}

function saveAllToLocalStorage(){
    localStorage.setItem("currentAccount", JSON.stringify(currentAccount));
}