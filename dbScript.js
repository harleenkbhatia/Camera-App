let request = indexedDB.open("camera", 1);
let db;

request.onsuccess= function(e){
    db = request.result;
}

request.onerror = function () {
    console.log("error");
}

request.onupgradeneeded = function(e){
    db = request.result;
    db.createObjectStore("gallery", {keyPath : "nId"});
}
function addData(type, data) {
    let tx = db.transaction("gallery", "readwrite");
    let store = tx.objectStore("gallery");
    store.add({ nId: Date.now(), type: type, data: data });//date.now gives timestamp of the present day in form of milliseconds elapsed since 1 jan 1970
}
function getData(){
    let tx = db.transaction("gallery", "readonly");
    let store = tx.objectStore("gallery");
    let req = store.openCursor();
    let gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";
    req.onsuccess = function(e){
        let cursor = req.result;
        if(cursor){
            if(cursor.value.type == "image"){
                let image = document.createElement("div");
                image.classList.add("image");
                image.innerHTML = `<img src='${cursor.value.data}'></img>
                <div class = "buttons">
                    <button class= "download${cursor.value.nId}">Download</button>
                    <button class= "delete${cursor.value.nId}">Delete</button>
                </div>`;
                // made it unique class taki unique eventListeners lga paye
                gallery.append(image);
                let url = cursor.value.data;
                let fileName = cursor.value.nId + ".png";
                let nId = cursor.value.nId;
                document.querySelector(`.download${cursor.value.nId}`).addEventListener("click", function(){
                    download(url,fileName);
                });
                document.querySelector(`.delete${cursor.value.nId}`).addEventListener("click", function(){
                    deleteFromGallery(nId);
                });

            } else{
                let video = document.createElement("div");
                let videoURL = URL.createObjectURL(cursor.value.data);
                video.classList.add("video");
                video.innerHTML = `<video autoplay src='${videoURL}' loop></video>
                <div class = "buttons">
                    <button class= "download${cursor.value.nId}">Download</button> 
                    <button class= "delete${cursor.value.nId}">Delete</button>
                </div>`; //loop-to keep playing the video
                gallery.append(video);
                let nId = cursor.value.nId;
                let fileName = cursor.value.nId + ".mp4";
                document.querySelector(`.download${cursor.value.nId}`).addEventListener("click", function(){
                    download(videoURL,fileName);
                });
                document.querySelector(`.delete${cursor.value.nId}`).addEventListener("click", function(){
                    deleteFromGallery(nId);
                });
            }
            //console.log(cursor);
            cursor.continue();
        }
        else{
            console.log("all data fetched");
        }
    }

}
function download(url, name){
    let a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
}

function deleteFromGallery(nId){
    let tx = db.transaction("gallery", "readwrite");
    let store = tx.objectStore("gallery");
    store.delete(Number(nId)); //converted string to number not sure the no. will be an integer or not thats why
    //parseInt ni kia typecasting krdi nId ki
    getData();
}