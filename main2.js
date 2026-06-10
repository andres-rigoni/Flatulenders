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
let currentRequests = ["nothing"];

let productos = [];
currentAccount = JSON.parse(localStorage.getItem("currentAccount")) || currentAccount;

let fotoBase64 = "";

async function updateCurrentData(){
    if(currentAccount != "none"){
        currentData = [await getCell("cuentas", currentAccount+2, "A"), await getCell("cuentas", currentAccount+2, "B"), Number(await getCell("cuentas", currentAccount+2, "C")), await getCell("cuentas", currentAccount+2, "D"), await getCell("cuentas", currentAccount+2, "E"), await getCell("cuentas", currentAccount+2, "F")];
        console.log("updated current data");
    }
    let lengthOfRequests = await getNewLine("cuentas")-2
    for(let i = 0; i < lengthOfRequests; i++){
        if(await getCell("cuentas", i+2, "F")){
            currentRequests.push(i);
        }
    }
    console.log("Current Requests Array");
    console.log(currentRequests);
    currentRequests.shift();
    if(document.getElementsByClassName("socialCont")[0].innerHTML != ""){
        closeSection("social");
        openSocial();
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
        let timeI = 0;
        function recursiveUpdateName(){
            setTimeout(function(){
                if(document.getElementsByClassName("cuentaCont")[0].innerHTML != ""){
                    if(document.getElementsByClassName("nameAccount")[0].innerHTML == "Cargando..."){
                        document.getElementsByClassName("nameAccount")[0].innerHTML = currentData[0] || "Cargando...";
                        document.getElementsByClassName("profileAccount")[0].src = currentData[4] || "assets/account.png";
                        document.getElementsByClassName("saldoNum")[0].innerHTML = currentData[2];
                        recursiveUpdateName();
                    }
                }
                timeI+=500;
            }, timeI);
        }
        recursiveUpdateName();
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
            let iName = await getCell("cuentas", currentRequests[i]+2, "A");
            let iImg = await getCell("cuentas", currentRequests[i]+2, "E");
            document.getElementsByClassName("requestsCont")[0].innerHTML += `
            <div class="requestDiv">
                <img src="${iImg}" class="socialRequestImg">
                <div class="socialRequestName">${iName}</div>
                <button onclick="acceptRequest(${currentRequests[i]})" class="socialBtnAccept">ACEPTAR</button>
                <button onclick="removeRequest(${currentRequests[i]})" class="socialBtnRemove">🗑️</button>
            </div>
            `;
            console.log("ya renderizamos uno");
        }
        console.log("ya renderizamos todo");
    }
}

async function acceptRequest(num){
    document.getElementsByClassName("requestDiv")[currentRequests.indexOf(num)].remove();
    await setCell("cuentas", num+2, "D", "vendedor");
    await setCell("cuentas", num+2, "F", "FALSE");
    currentRequests = currentRequests.filter(elemento => elemento !== num);
}
async function removeRequest(num){
    document.getElementsByClassName("requestDiv")[currentRequests.indexOf(num)].remove();
    await setCell("cuentas", num+2, "D", "cliente");
    await setCell("cuentas", num+2, "F", "FALSE");
    currentRequests = currentRequests.filter(elemento => elemento !== num);
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

async function previewFoto(event){
    const archivo = event.target.files[0];
    if(archivo){
        const reader = new FileReader();
        reader.onload = async function(e){
            let fotoGigante = e.target.result;
            fotoBase64 = await reducirFoto(fotoGigante);
            document.getElementsByClassName('profileAccount')[0].src = fotoBase64;
            await setCell("cuentas", currentAccount+2, "E", fotoBase64);
        }
        reader.readAsDataURL(archivo);
        currentData[4] = fotoBase64;
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
        document.getElementsByClassName("loginBtn")[0].innerHTML = "Por favor, espere...";
        let totalLines = await getNewLine("cuentas");
        let encontrado = false;
        for(let i = 2; i < totalLines; i++){
            let userSheet = await getCell("cuentas", i, "A");
            let passSheet = await getCell("cuentas", i, "B");
            if(userSheet == userInput.value && passSheet == passwordInput.value){
                currentAccount = i - 2;
                await updateCurrentData();
                saveAllToLocalStorage();
                alert("Sesión iniciada correctamente");
                closeSection("ingresar");
                openCuenta();
                encontrado = true;
                break;
            }
        }
        if(!encontrado){
            alert("Usuario o contraseña incorrectos");
            document.getElementsByClassName("loginBtn")[0].innerHTML = "Iniciar Sesión";
        }
    } else {
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
    <div class="inicioPromociones">
        <h2>🔥Promociones destacadas</h2>
    </div>
    <div class="inicioProductos">
        <h2>🛒Productos destacados</h2>
    </div>
    `;
}
inicio()

function openEcommerce(){
    closeSection("cuenta");
    closeSection("registrarse");
    closeSection("ingresar");
    closeSection("social");
    if(currentData[3] == "admin" || currentData[3] == "vendedor"){
        document.getElementsByClassName("contenido")[0].innerHTML = `
        <button class="addProductBtn" onclick="openNewProduct()">+<button>
        `;
    }else{
        document.getElementsByClassName("contenido")[0].innerHTML = `

        `
    };
}

function openContacto(){

}

function openAboutUs(){
    
}

function openNewProduct(){
    openSection("producto", `
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
            <input class="newProductImg" type="file">
        </div>
        <br>
        <button class="publishBtn" onclick="createProduct()">Publicar</button>
    `);
}

async function createProduct(){
    document.getElementsByClassName("publishBtn")[0].innerHTML = "Por favor, espere...";
    document.getElementsByClassName("publishBtn")[0].onclick = "";
    let productName = document.getElementsByClassName("newProductName")[0].value;
    let productPrice = document.getElementsByClassName("newProductPrice")[0].value;
    let productDiscount = document.getElementsByClassName("newProductDiscount")[0].value;
    let productImg = document.getElementsByClassName("newProductImg")[0].value;
    let lineNow = await getNewLine("productos");
    setCell("productos", lineNow, "A", productName);
    setCell("productos", lineNow, "B", productPrice);
    setCell("productos", lineNow, "C", currentData[0]);
    setCell("productos", lineNow, "D", productDiscount);
    setCell("productos", lineNow, "E", productImg;
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