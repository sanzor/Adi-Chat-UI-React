export{showElement,hideElement,postDataAsync,getDataAsync,getItemFromStorage,setItemInStorage};
function showElement(elementId:string){
    var element=document.getElementById(elementId);
    if(element){
        element.style.display="block";
    }
}
function hideElement(elementId:string){    
    var element=document.getElementById(elementId);
    if(element){
        element.style.display="none";
    }
}

async function postDataAsync(url:string = "", data:object = {}) {
    try {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      var d=JSON.stringify(data);
      var requestOptions:RequestInit = {
        credentials:"same-origin" as RequestCredentials,
        method: 'POST',
        headers: myHeaders,
        body: d,
        redirect: 'follow'
      };
      const response=await fetch(url,requestOptions);
        if(response.status==409){
            return {result:"error",reason:"user_already_exists"};
        }
          return response.json(); 
    }catch(error){
        console.error(error);
    }
  }

  async function getDataAsync(url: string = ""): Promise<any> {
    try {
        console.log("Fetching URL:", url);
        const response = await fetch(url, {
            method: "GET", 
            cache: "no-cache", 
            credentials: "same-origin", 
            redirect: "follow", 
            referrerPolicy: "no-referrer", 
        });

        // Check the response status
        if (response.ok) {
            // Status code in the range 200-299
            console.log("Request successful with status:", response.status);
            return await response.json();
        } else {
            // Handle different status codes
            switch (response.status) {
                case 400:
                    console.error("Bad Request (400): The request could not be understood by the server.");
                    break;
                case 401:
                    console.error("Unauthorized (401): Authentication is required and has failed or has not been provided.");
                   
                    break;
                case 403:
                    console.error("Forbidden (403): The server understood the request but refuses to authorize it.");
                    break;
                case 404:
                    console.error("Not Found (404): The requested resource could not be found.");
                    return 404;
                case 500:
                    console.error("Internal Server Error (500): The server encountered an unexpected condition.");
                    break;
                case 503:
                    console.error("Service Unavailable (503): The server is currently unavailable (overloaded or down).");
                    break;
                default:
                    console.error(`Unexpected response status: ${response.status}`);
                    break;
            }
            // Optionally, throw an error to be handled by the caller
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    } catch (error) {
        // Handle network errors or other unexpected issues
        console.error("Network or other error:", error);
        throw error; // Rethrow the error for further handling
    }
}


function getItemFromStorage<Result>(Key:string):Result|null{
  var item=localStorage.getItem(Key);
  console.log(item);
  if(item==null || item=="undefined"){
    return null;
  }
  return JSON.parse(item);
}
function setItemInStorage<T>(Key:string,Value:T){ 
  localStorage.setItem(Key,JSON.stringify(Value));
}