function myFunction() {
  
}

function doPost(e) {
  
  var ssId = "1SnEajKEZGu76SvwkoDpjGPLq4aAf_-pHjRgnfJxRmX0";
  var ss = SpreadsheetApp.openById(ssId);
  var sheetData1 = ss.getSheetByName("Sheet1");
  var sheetData2 = ss.getSheetByName("data2");

  //use BetterLog
  Logger = BetterLog.useSpreadsheet(ssId);

  Logger.log("Hello from BetterLog :)");

  var requestJSON = e.postData.contents;
  Logger.log(requestJSON);
  
  var requestObj = JSON.parse(requestJSON).events[0];
  var userMessage = requestObj.message.text;
  Logger.log(userMessage);
  
  var token = requestObj.replyToken;
  var replyText = "unsuccess";
  
  var d = new Date(requestObj.timestamp);
  var humanTime = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear()+" " + d.getHours()+ ":" + d.getMinutes() + ":" + d.getSeconds();
  
  var values = sheetData1.getRange(2, 1, sheetData1.getLastRow(),sheetData1.getLastColumn()).getValues();
  
  var message_Array = userMessage.split(",");
  Logger.log(message_Array);
  
  if(message_Array[0] === "+"){
    Logger.log("++++++");
    ss.appendRow([requestObj.source.userId, humanTime, message_Array[1], message_Array[2]]);
    replyText = "complete: income noted";
  }
  
  else if(message_Array[0] === "-"){
    Logger.log("------");
    ss.appendRow([requestObj.source.userId, humanTime, message_Array[1], message_Array[2]*(-1)]);
    replyText = "complete: expense noted";
  }
  
  else if(userMessage === "review"){

    var income = 0;
    var expense = 0;
    var left = 0;
    for(var i = 0;i<values.length; i++){
      
      if(values[i][0] === requestObj.source.userId ){
        var data = values[i][3];
        if( data > 0){
          income += data;
        }
        else if(data <= 0){
          expense += (-1)*data;
        }
      }
    }
    left = income - expense;
    replyText = "income = " + income + " expense = " + expense + " left = " + left;
  }
  
  else if(userMessage === "clear"){

    
    for(var i = values.length-1; i>=0; i--){
      Logger.log(values[i][0]);
      if(values[i][0] === requestObj.source.userId ){
        Logger.log("clear");
        sheetData1.deleteRow(i+2);
      }
    }
    replyText = "Clear complete";
  }
  
  else if(userMessage === "clear recent"){

    
    for(var i = values.length-1; i>=0; i--){
      Logger.log(values[i][0]);
      if(values[i][0] === requestObj.source.userId ){
        Logger.log("clear");
        sheetData1.deleteRow(i+2);
        break;
      }
    }
    replyText = "Clear recent complete";
  }
  
  else if(userMessage === "help"){
    replyText = "<function>\nincome(\"+,description,value\")\nexpense(\"-,description,value\")\nclear data(\"clear\")\nreview(\"review\")\nall list(\"my list\")\nclear recent(\"clear recent\")";
  }
  
  else if(userMessage === "my list"){
    replyText = "<User Data> "; 

    for(var i = 0;i<values.length; i++){
      
      if(values[i][0] === requestObj.source.userId ){
        replyText = replyText + "\n" + values[i][2] + " " + values[i][3];
      }
    }
  }
  
//  ss.appendRow(["Test1", "Test2"]);
  if (requestObj.message.type === "text") {
  
    replyMessage(token, replyText);
    
  }
}

function replyMessage(token, replyText) {
  var url = "https://api.line.me/v2/bot/message/reply";
  var lineHeader = {
    "Content-Type": "application/json",
    "Authorization": "Bearer xv5fNQob97Bf2zKSyXL5eWEGOWPsUMVHEkxm4axrlU1L4WMVl9d9rRaLtkuZCzHvTu353GGzdspNX6YEheEpH/7u58/Mh38qMnfLBFkKLdmuRNYttrfUQoU8XxuQpfsxpUvSFc9AuVRZQ/lVJmW7rQdB04t89/1O/w1cDnyilFU="
  };

  var postData = {
    "replyToken" : token,
    "messages" : [{
      "type" : "text",
      "text" : replyText
    }]
  };

  var options = {
    "method" : "POST",
    "headers" : lineHeader,
    "payload" : JSON.stringify(postData)
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
  }
  
  catch (error) {
    Logger.log(error.name + "：" + error.message);
    return;
  }
    
  if (response.getResponseCode() === 200) {
    Logger.log("Sending message completed.");
  }
}

