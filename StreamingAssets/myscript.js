
//３　streamingAssetsPath/myscript.js;

console.log("myscript.js loaded");

// アラート
function jsAlert(message, para2, para3, callbackGameObjectName) {

    alert(message);

    // SendMessageを使ってUnityにメッセージを送る
    if (typeof unityInstance !== "undefined") {

        var combinedData = "jsAlert|" + message + "|";
        unityInstance.SendMessage(callbackGameObjectName, "OnJsCompleteCallback", combinedData);
        //unityInstance.SendMessage(callbackGameObjectName, "OnJsCompleteCallback","jsAlert", message, "");
    } else {
        console.error("Unity instance is not defined.");
    }

}

// para2=tag,para3=null
function jsFileUpload(url, para2, para3, callbackGameObjectName) {

    console.log("ks-jsFileUpload-" + url + "-" + para2 + "-" + para3);

    // 許可する拡張子のリスト
    const allowedExtensions = ['jpg', 'png', 'mp4', 'fbx', 'mp3','vrm','zip'];

    // ファイル選択ダイアログを表示
    const fileInput = document.createElement("input");
    fileInput.type = "file";

    var filetype = "";

    // ファイルが選択されたときの処理
    fileInput.onchange = () => {

        // 選択されたファイルを取得
        const file = fileInput.files[0];

        // ファイルが選択されているか確認
        if (!file) {
            alert("ファイルが選択されていません。");
            return;
        }

        // ファイルの拡張子を取得し、許可リストに含まれているか確認
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            alert("許可されていないファイル形式です。jpg, png, mp4, fbx, mp3, vrm, zip のみアップロード可能です。");
            return;
        }

        switch (fileExtension) {
            case "vrm":
                if (para2 != "VRM") {
                    alert("VRMファイルの場合、VRMを指定する必要があります");
                    return;
                }
                filetype = "VRM";
                break;

            case "fbx":
                
                if (para2 == "Humanoid") {
                    filetype = "Humanoid";
                }
                else if (para2 == "Model") {
                    filetype = "Model";
                } else
                {
                    alert("FBXファイルの場合、Humanoid または Modelを指定する必要があります");
                    return;
                }
                break;

            case "mp4":
                filetype = "Video";
                break;

            case "jpg":
            case "png":
                filetype = "Image";
                break;

            case "mp3":
                filetype = "Sound";
                break;

            case "zip":
                if (para2 != "Humanoid" && para2 != "Model") {
                    alert("ZIPファイルの場合、Humanoid または Modelを指定する必要があります");
                    return;
                }

                if (para2 == "Humanoid") {
                    filetype = "ZIPHumanoid";    
                } else if (para2 == "Model") {
                    filetype = "ZIPModel";
                }

                console.log("jsFileUpload-" + filetype);
                break;

            default:
                alert("許可されていないファイル形式です。jpg, png, mp4, fbx, mp3 のみアップロード可能です。");
                break;
        }


        // フォームデータを作成し、ファイルを追加
        const formData = new FormData();
        formData.append("file", file);

        // AJAXリクエストを作成
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);

        // アップロード進行状況の表示
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                console.log(`アップロード進行状況: ${percentComplete.toFixed(2)}%`);
            }
        };

        // リクエストが成功した場合の処理
        xhr.onload = () => {

            if (xhr.status === 200) {

                const response = JSON.parse(xhr.responseText);

                if (response.status === "success") {

                    // Unityに通知
                    if (typeof unityInstance !== "undefined" && unityInstance !== null) {
                        //console.log(filetype);
                        //console.log(response.file);
                        //console.log(para2);
                        //console.log(callbackGameObjectName);
                        var combinedData = "jsFileUpload|" + response.file + "|" + filetype;
                        console.log(combinedData.length); // 長さをログに出力
                        unityInstance.SendMessage(callbackGameObjectName, "OnJsCompleteCallback", combinedData);
                    } else {
                        console.error("Unity instance is not defined.");
                    }

                } else {
                    alert("アップロードに失敗しました。");
                }

            } else {
                alert("アップロードに失敗しました。");
            }

        };

        // リクエストのエラーハンドリング
        xhr.onerror = () => {
            alert("通信エラーが発生しました。");
        };

        // リクエスト送信
        xhr.send(formData);
    };

    // ファイルダイアログを表示
    fileInput.click();

}

// ファイルアプロード
function jsTextureUpload(url, base64Data, para3, callbackGameObjectName) {

    console.log("受信したBase64データ:", base64Data);

    // Base64 を Blob に変換
    const binaryData = atob(base64Data);
    const arrayBuffer = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
        arrayBuffer[i] = binaryData.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: "image/png" });

    // フォームデータを作成
    const formData = new FormData();

    const timestamp = Date.now(); // 現在のタイムスタンプ
    const randomString = Math.random().toString(36).substr(2, 9); // ランダムな文字列
    formData.append("file", blob, "uptex" + randomString + randomString + ".png");

    // AJAX リクエストを作成
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            console.log(`アップロード進行状況: ${percentComplete.toFixed(2)}%`);
        }
    };

    // リクエストが成功した場合の処理
    xhr.onload = () => {

        if (xhr.status === 200) {

            const response = JSON.parse(xhr.responseText);

            if (response.status === "success") {

                // Unityに通知
                if (typeof unityInstance !== "undefined") {
                    var combinedData = "jsTextureUpload|" + response.file + "|" + para3;
                    unityInstance.SendMessage(callbackGameObjectName, "OnJsCompleteCallback", combinedData);
                } else {
                    console.error("Unity instance is not defined.");
                }

            } else {
                alert("アップロードに失敗しました。");
            }

        } else {
            alert("アップロードに失敗しました。");
        }

    };

    xhr.onerror = () => {
        console.error("通信エラーが発生しました");
    };

    xhr.send(formData);


}

