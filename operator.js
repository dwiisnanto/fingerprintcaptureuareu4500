
let capturedImages = [];
const maxFingers = 10;
let mergedImageBase64 = null;
const fingerLabels = [
    "Kanan - Jempol",
    "Kanan - Telunjuk",
    "Kanan - Tengah",
    "Kanan - Manis",
    "Kanan - Kelingking",
    "Kiri - Jempol",
    "Kiri - Telunjuk",
    "Kiri - Tengah",
    "Kiri - Manis",
    "Kiri - Kelingking"
];
let userProfile = {
    nama: "",
    tglLahir: "",
    golDarah: ""
};

var test = null;

var myVal = ""; // Drop down selected value of reader 
var disabled = true;
var startEnroll = false;

var currentFormat = Fingerprint.SampleFormat.PngImage;
var deviceTechn = {
    0: "Unknown",
    1: "Optical",
    2: "Capacitive",
    3: "Thermal",
    4: "Pressure"
}

var deviceModality = {
    0: "Unknown",
    1: "Swipe",
    2: "Area",
    3: "AreaMultifinger"
}

var deviceUidType = {
    0: "Persistent",
    1: "Volatile"
}

var FingerprintSdkTest = (function () {
    function FingerprintSdkTest() {
        var _instance = this;
        this.operationToRestart = null;
        this.acquisitionStarted = false;
        this.sdk = new Fingerprint.WebApi;
        this.sdk.onDeviceConnected = function (e) {
            // Detects if the deveice is connected for which acquisition started
            showMessage("Scan your finger");
        };
        this.sdk.onDeviceDisconnected = function (e) {
            // Detects if device gets disconnected - provides deviceUid of disconnected device
            showMessage("Device disconnected");
        };
        this.sdk.onCommunicationFailed = function (e) {
            // Detects if there is a failure in communicating with U.R.U web SDK
            showMessage("Communinication Failed")
        };
        this.sdk.onSamplesAcquired = function (s) {
            // Sample acquired event triggers this function
            sampleAcquired(s);
        };
        this.sdk.onQualityReported = function (e) {
            let q = document.getElementById("qualityInputBox");
            if (q) {
                q.value = Fingerprint.QualityCode[(e.quality)];
            }

            // 🔥 AUTO RETRY jika quality jelek
            // misal quality < 50 → kode Fingerprint.QualityCode < 2
            // sesuaikan dengan enum SDK
            if (e.quality < 2) { // 0: Bad, 1: Poor
                showMessage("Quality rendah, scan ulang jari: " + fingerLabels[capturedImages.length]);
                test.stopCapture();
                setTimeout(() => test.startCapture(), 500); // coba ulang setelah 0.5 detik
            }
        };

    }

    FingerprintSdkTest.prototype.startCapture = function () {
        if (this.acquisitionStarted) return;

        var _instance = this;
        showMessage("Menunggu sidik jari...");

        this.sdk.startAcquisition(currentFormat, myVal).then(function () {
            _instance.acquisitionStarted = true;
            console.log("Capture started"); // 🔍 DEBUG
        }, function (error) {
            showMessage(error.message);
        });
    };

    FingerprintSdkTest.prototype.stopCapture = function () {
        if (!this.acquisitionStarted) return;

        var _instance = this;
        this.sdk.stopAcquisition().then(function () {
            _instance.acquisitionStarted = false;
            console.log("Capture stopped");
        }, function (error) {
            showMessage(error.message);
        });
    };

    FingerprintSdkTest.prototype.getInfo = function () {
        var _instance = this;
        return this.sdk.enumerateDevices();
    };

    FingerprintSdkTest.prototype.getDeviceInfoWithID = function (uid) {
        var _instance = this;
        return this.sdk.getDeviceInfo(uid);
    };


    return FingerprintSdkTest;
})();

function showMessage(message) {
    let statusDiv = document.getElementById("status");
    if (statusDiv) {
        statusDiv.innerHTML = message;
    }
}

window.onload = function () {
    localStorage.clear();
    test = new FingerprintSdkTest();
    readersDropDownPopulate(true); //To populate readers for drop down selection
    disableEnable(); // Disabling enabling buttons - if reader not selected
    disableEnableExport(true);
};

function onStart() {

    if (!myVal) {
        alert("Pilih fingerprint reader terlebih dahulu");
        return;
    }

    if (!inputUserProfile()) return;

    if (capturedImages.length >= maxFingers) {
        alert("10 jari sudah lengkap");
        return;
    }

    assignFormat();

    if (!currentFormat) {
        alert("Pilih format PNG terlebih dahulu");
        return;
    }
    test.startCapture();

    showMessage(
        "Silakan scan: <b>" +
        fingerLabels[capturedImages.length] +
        "</b>"
    );
}

function onStop() {
    test.stopCapture();
}

function onGetInfo() {
    var allReaders = test.getInfo();
    allReaders.then(function (sucessObj) {
        populateReaders(sucessObj);
    }, function (error) {
        showMessage(error.message);
    });
}
function onDeviceInfo(id, element) {
    var myDeviceVal = test.getDeviceInfoWithID(id);
    myDeviceVal.then(function (sucessObj) {
        var deviceId = sucessObj.DeviceID;
        var uidTyp = deviceUidType[sucessObj.eUidType];
        var modality = deviceModality[sucessObj.eDeviceModality];
        var deviceTech = deviceTechn[sucessObj.eDeviceTech];
        //Another method to get Device technology directly from SDK
        //Uncomment the below logging messages to see it working, Similarly for DeviceUidType and DeviceModality
        //console.log(Fingerprint.DeviceTechnology[sucessObj.eDeviceTech]);            
        //console.log(Fingerprint.DeviceModality[sucessObj.eDeviceModality]);
        //console.log(Fingerprint.DeviceUidType[sucessObj.eUidType]);
        var retutnVal = //"Device Info -"
            "Id : " + deviceId
            + "<br> Uid Type : " + uidTyp
            + "<br> Device Tech : " + deviceTech
            + "<br> Device Modality : " + modality;

        document.getElementById(element).innerHTML = retutnVal;

    }, function (error) {
        showMessage(error.message);
    });

}
function onClear() {

    capturedImages = [];
    mergedImageBase64 = null;

    userProfile = {
        nama: "",
        tglLahir: "",
        golDarah: ""
    };

    document.getElementById("imagediv").innerHTML = "";
    document.getElementById("status").innerHTML = "Tekan START untuk mulai scan";

    $("#progressBar")
        .css("width", "0%")
        .text("0 / 10");

    $('#saveImagePng').prop('disabled', true);
}

$("#save").on("click", function () {
    if (localStorage.getItem("imageSrc") == "" || localStorage.getItem("imageSrc") == null || document.getElementById('imagediv').innerHTML == "") {
        alert("Error -> Fingerprint not available");
    } else {
        var vDiv = document.getElementById('imageGallery');
        if (vDiv.children.length < 5) {
            var image = document.createElement("img");
            image.id = "galleryImage";
            image.className = "img-thumbnail";
            image.src = localStorage.getItem("imageSrc");
            vDiv.appendChild(image);

            localStorage.setItem("imageSrc" + vDiv.children.length, localStorage.getItem("imageSrc"));
        } else {
            document.getElementById('imageGallery').innerHTML = "";
            $("#save").click();
        }
    }
});

function populateReaders(readersArray) {
    var _deviceInfoTable = document.getElementById("deviceInfo");
    _deviceInfoTable.innerHTML = "";
    if (readersArray.length != 0) {
        _deviceInfoTable.innerHTML += "<h4>Available Readers</h4>"
        for (i = 0; i < readersArray.length; i++) {
            _deviceInfoTable.innerHTML +=
                "<div id='dynamicInfoDivs' align='left'>" +
                "<div data-toggle='collapse' data-target='#" + readersArray[i] + "'>" +
                "<img src='images/info.png' alt='Info' height='20' width='20'> &nbsp; &nbsp;" + readersArray[i] + "</div>" +
                "<p class='collapse' id=" + '"' + readersArray[i] + '"' + ">" + onDeviceInfo(readersArray[i], readersArray[i]) + "</p>" +
                "</div>";
        }
    }
};

function sampleAcquired(s) {

    if (currentFormat !== Fingerprint.SampleFormat.PngImage) return;
    if (capturedImages.length >= maxFingers) return;

    var samples = JSON.parse(s.samples);
    let imgSrc = "data:image/png;base64," + Fingerprint.b64UrlTo64(samples[0]);

    let img = new Image();
    img.src = imgSrc;

    img.onload = function () {

        // ⬅️ INI YANG SEBELUMNYA HILANG
        capturedImages.push(img);

        // Preview fingerprint terakhir
        let vDiv = document.getElementById('imagediv');
        vDiv.innerHTML = "";
        vDiv.appendChild(img.cloneNode());

        // Update indikator jari
        updateFingerIndicator();

        showMessage(
            "Fingerprint tersimpan: " +
            capturedImages.length + " / " + maxFingers +
            "<br>Silakan scan: <b>" +
            (fingerLabels[capturedImages.length] || "Selesai") +
            "</b>"
        );

        // Jika sudah 10 jari → merge
        if (capturedImages.length === maxFingers) {
            test.stopCapture();
            mergeFingerprints();
            $('#saveImagePng').prop('disabled', false);
        }
    };

    disableEnableExport(false);
}

function readersDropDownPopulate(checkForRedirecting) { // Check for redirecting is a boolean value which monitors to redirect to content tab or not
    myVal = "";
    var allReaders = test.getInfo();
    allReaders.then(function (sucessObj) {
        var readersDropDownElement = document.querySelectorAll("#readersDropDown")[0];
        readersDropDownElement.innerHTML = "";
        //First ELement
        var option = document.createElement("option");
        option.selected = "selected";
        option.value = "";
        option.text = "Select Reader";
        readersDropDownElement.add(option);
        for (i = 0; i < sucessObj.length; i++) {
            var option = document.createElement("option");
            option.value = sucessObj[i];
            option.text = sucessObj[i];
            readersDropDownElement.add(option);
        }

        //Check if readers are available get count and  provide user information if no reader available, 
        //if only one reader available then select the reader by default and sennd user to capture tab
        checkReaderCount(sucessObj, checkForRedirecting);

    }, function (error) {
        showMessage(error.message);
    });
}

function checkReaderCount(sucessObj, checkForRedirecting) {
    if (sucessObj.length == 0) {
        alert("No reader detected. Please connect a reader.");
    } else if (sucessObj.length == 1) {
        document.querySelectorAll("#readersDropDown")[0].selectedIndex = "1";
    }

    selectChangeEvent(); // To make the reader selected
}

function selectChangeEvent() {
    var readersDropDownElement = document.querySelectorAll("#readersDropDown")[0];
    myVal = readersDropDownElement.options[readersDropDownElement.selectedIndex].value;
    disableEnable();
    onClear();
    document.getElementById('imageGallery').innerHTML = "";

    if (myVal == "") {
        $('#capabilities').prop('disabled', true);
    } else {
        $('#capabilities').prop('disabled', false);

        // 🔥 AUTO-START SCAN jika reader dipilih
        if (inputUserProfile()) { // pastikan data user sudah diisi
            onStart();
        } else {
            showMessage("Lengkapi data user sebelum scan otomatis");
        }
    }
}


function populatePopUpModal() {
    var modelWindowElement = document.getElementById("ReaderInformationFromDropDown");
    modelWindowElement.innerHTML = "";
    if (myVal != "") {
        onDeviceInfo(myVal, "ReaderInformationFromDropDown");
    } else {
        modelWindowElement.innerHTML = "Please select a reader";
    }
}

//Enable disable buttons
function disableEnable() {


}


function disableEnableStartStop() {

}

// For Download and formats starts

function onImageDownload() {

    if (!mergedImageBase64) {
        alert("Belum ada 10 fingerprint untuk diexport");
        return;
    }

    let safeName = userProfile.nama.replace(/\s+/g, "_");
    let safeDob = userProfile.tglLahir.replace(/-/g, "");
    let safeBlood = userProfile.golDarah.toUpperCase();

    let fileName = `${safeName}_${safeDob}_${safeBlood}_FINGERPRINT.png`;

    downloadURI(mergedImageBase64, fileName, "image/png");
}


function downloadURI(uri, name, dataURIType) {
    if (IeVersionInfo() > 0) {
        //alert("This is IE " + IeVersionInfo());
        var blob = dataURItoBlob(uri, dataURIType);
        window.navigator.msSaveOrOpenBlob(blob, name);

    } else {
        //alert("This is not IE.");
        var save = document.createElement('a');
        save.href = uri;
        save.download = name;
        var event = document.createEvent("MouseEvents");
        event.initMouseEvent(
            "click", true, false, window, 0, 0, 0, 0, 0
            , false, false, false, false, 0, null
        );
        save.dispatchEvent(event);
    }
}

dataURItoBlob = function (dataURI, dataURIType) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: dataURIType });
}


function IeVersionInfo() {
    var sAgent = window.navigator.userAgent;
    var IEVersion = sAgent.indexOf("MSIE");

    // If IE, return version number.
    if (IEVersion > 0)
        return parseInt(sAgent.substring(IEVersion + 5, sAgent.indexOf(".", IEVersion)));

    // If IE 11 then look for Updated user agent string.
    else if (!!navigator.userAgent.match(/Trident\/7\./))
        return 11;

    // Quick and dirty test for Microsoft Edge
    else if (document.documentMode || /Edge/.test(navigator.userAgent))
        return 12;

    else
        return 0; //If not IE return 0
}


$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
});

function checkOnly(stayChecked) {
    disableEnableExport(true);
    onClear();
    onStop();
    with (document.myForm) {
        for (i = 0; i < elements.length; i++) {
            if (elements[i].checked == true && elements[i].name != stayChecked.name) {
                elements[i].checked = false;
            }
        }
        //Enable disable save button
        for (i = 0; i < elements.length; i++) {
            if (elements[i].checked == true) {
                if (elements[i].name == "PngImage") {
                    disableEnableSaveThumbnails(false);
                } else {
                    disableEnableSaveThumbnails(true);
                }
            }
        }
    }
}

function assignFormat() {
    currentFormat = "";
    with (document.myForm) {
        for (i = 0; i < elements.length; i++) {
            if (elements[i].checked == true) {
                if (elements[i].name == "Raw") {
                    currentFormat = Fingerprint.SampleFormat.Raw;
                }
                if (elements[i].name == "Intermediate") {
                    currentFormat = Fingerprint.SampleFormat.Intermediate;
                }
                if (elements[i].name == "Compressed") {
                    currentFormat = Fingerprint.SampleFormat.Compressed;
                }
                if (elements[i].name == "PngImage") {
                    currentFormat = Fingerprint.SampleFormat.PngImage;
                }
            }
        }
    }
}


function disableEnableExport(val) {
    if (val) {
        $('#saveImagePng').prop('disabled', true);
    } else {
        $('#saveImagePng').prop('disabled', false);
    }
}


function disableEnableSaveThumbnails(val) {
    if (val) {
        $('#save').prop('disabled', true);
    } else {
        $('#save').prop('disabled', false);
    }
}


function delayAnimate(id, visibility) {
    document.getElementById(id).style.display = visibility;
}

function mergeFingerprints() {

    const headerHeight = 60;
    const cols = 5;
    const rows = 2;

    const imgWidth = capturedImages[0].width;
    const imgHeight = capturedImages[0].height;

    const labelHeight = 30;

    let canvas = document.createElement("canvas");
    canvas.width = cols * imgWidth;
    canvas.height = headerHeight + rows * (imgHeight + labelHeight);

    let ctx = canvas.getContext("2d");
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#000";

    capturedImages.forEach((img, index) => {

        let col = index % cols;
        let row = index < 5 ? 0 : 1;

        let x = col * imgWidth;
        let y = headerHeight + row * (imgHeight + labelHeight);
        ctx.font = "16px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Nama        : " + userProfile.nama, 10, 20);
        ctx.fillText("Tgl Lahir   : " + userProfile.tglLahir, 10, 40);
        ctx.fillText("Gol. Darah  : " + userProfile.golDarah, 10, 60);
        // Draw fingerprint
        ctx.drawImage(img, x, y, imgWidth, imgHeight);

        // Draw label
        ctx.fillText(
            fingerLabels[index],
            x + imgWidth / 2,
            y + imgHeight + 20
        );
    });

    mergedImageBase64 = canvas.toDataURL("image/png");

    // Preview hasil akhir
    let vDiv = document.getElementById("imagediv");
    vDiv.innerHTML = "";
    let finalImg = document.createElement("img");
    finalImg.src = mergedImageBase64;
    finalImg.style.width = "100%";
    vDiv.appendChild(finalImg);

    alert("10-print FBI berhasil dibuat");
}

function updateFingerIndicator() {
    let statusDiv = document.getElementById("status");

    let html = "<b>Progress 10-Print:</b><br>";
    fingerLabels.forEach((label, i) => {
        if (i < capturedImages.length) {
            html += "✅ " + (i + 1) + ". " + label + "<br>";
        } else if (i === capturedImages.length) {
            html += "👉 " + (i + 1) + ". " + label + " (Scan sekarang)<br>";
        } else {
            html += "⬜ " + (i + 1) + ". " + label + "<br>";
        }
    });

    statusDiv.innerHTML = html;
    let progress = Math.round((capturedImages.length / maxFingers) * 100);

    $("#progressBar")
        .css("width", progress + "%")
        .text(capturedImages.length + " / " + maxFingers);
}

function inputUserProfile() {

    userProfile.nama = document.getElementById("namaUser").value.trim();
    userProfile.tglLahir = document.getElementById("tglLahir").value;
    userProfile.golDarah = document.getElementById("golDarah").value;

    if (!userProfile.nama || !userProfile.tglLahir || !userProfile.golDarah) {
        alert("Lengkapi data pemilik sidik jari terlebih dahulu");
        return false;
    }

    return true;
}

// For Download and formats ends