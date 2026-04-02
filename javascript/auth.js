function isLogin(){
        let isActive = sessionStorage.getItem("isActive");
        if(isActive==="true"){
          console.log("Active");
          return true;
        }else{
         
          console.log("not Active");
          return false;
        }
      }
          function logOut(){
       sessionStorage.removeItem("isActive");
       window.location.href="./index.html"
      }