
var passwordRegEx = new RegExp("(?=.{6,})")
var email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/


function signUpValidation () {
	
	var form = document.getElementById('signUpForm');
	var error = document.getElementById('error')
	var pass = form.password.value
    error.innerHTML = ""

	if (!email.test(form.email.value)) { 
		error.innerHTML = ""
		var text = document.createTextNode("الرجاء ادخال عنوان بريد الكتروني صالح")
		error.appendChild(text)	
		error.style.padding = '10px'

	 }
	else if (!passwordRegEx.test(pass)) {
		error.innerHTML = ""
		var text = document.createTextNode("يرجى اختيار كلمة مرور اكثر من ٦ احرف او ارقام")
		error.appendChild(text)	
		error.style.padding = '10px'
	}
	else if (form.password.value !== form.passwordConfirm.value) {
		error.innerHTML = ""
		var text = document.createTextNode("كلمتا المرور غير مطابقة الرجاء التاكد منها")
		error.appendChild(text)	
		error.style.padding = '10px'

	}
	else if (form.sex.value == "") {
		error.innerHTML = ""
		var text = document.createTextNode("يرجى اختيار الجنس")
		error.appendChild(text)	
		error.style.padding = '10px'

	} else if (form.birthday.value == "") {
		error.innerHTML = ""
		var text = document.createTextNode("يرجى اختيار تاريخ الميلاد")
		error.appendChild(text)	
		error.style.padding = '10px'

	} else if (form.college.value == "") {
		error.innerHTML = ""
		var text = document.createTextNode("يرجى اختيار الكلية")
		error.appendChild(text)	
		error.style.padding = '10px'

	} else if (form.stage.value == "") {
		error.innerHTML = ""
		var text = document.createTextNode("يرجى اختيار المرحلة")
		error.appendChild(text)
		error.style.padding = '10px'	

	}
	 else {
        $('.loading2').css('display', 'block');
		var data = {"name":form.name.value,"email":form.email.value,"password":form.password.value,"birthday":form.birthday.value,"sex":form.sex.value,"college":form.college.value,"stage":form.stage.value}
$.ajax({
    type: "POST",
    url: "/register",

    // The key needs to match your method's input parameter (case-sensitive).
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function(data){
          $('.loading2').css('display', 'none');
    	error.innerHTML = ""
    	if (data == 'تم تسجيل الحساب سيتم اعادة توجيهك الان لتسجيل الدخول') {
    		var text = document.createTextNode(data)
    	error.appendChild(text)
    	error.style.padding = '10px'
    	error.style.backgroundColor = 'green'
    	setTimeout(function () {
    		window.location.replace("login");
    	}, 2000);
    	}
    	else {
    		var text = document.createTextNode(data)
    	error.appendChild(text)	
    	error.style.padding = '10px'
    	}
    	
    },
    failure: function(errMsg) {
        alert(errMsg);
    }
});
	}
	

}



function loginValidation () {
	

	var form = document.getElementById('loginForm');
	var error = document.getElementById('error')
	var pass = form.password.value
    error.innerHTML = ""

	if (!email.test(form.email.value)) { 
		error.innerHTML = ""
		var text = document.createTextNode("الرجاء ادخال عنوان بريد الكتروني صالح")
		error.appendChild(text)	
    	error.style.padding = '10px'

	 }
	else if (!passwordRegEx.test(pass)) {
		error.innerHTML = ""
		var text = document.createTextNode("يرجى كتابة كلمة المرور بصورة صحيحة")
		error.appendChild(text)	
    	error.style.padding = '10px'

	} else {
        $('.loading2').css('display', 'block');
		var formdata = {"email":form.email.value,"password":form.password.value}
$.ajax({
    type: "POST",
    url: "/login",
    // The key needs to match your method's input parameter (case-sensitive).
    data: JSON.stringify(formdata),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function(data){
        $('.loading2').css('display', 'none');
    	if (data.message == 'تم تسجيل الدخول بنجاح , سيتم اعادة توجيهك الان') {
    		error.innerHTML = ""
    		var text = document.createTextNode(data.message)
    	error.appendChild(text)	
    	error.style.padding = '10px'
    	error.style.backgroundColor = 'green'
    	localStorage.setItem("token", data.token);
    	localStorage.setItem("email", formdata.email);
    	setTimeout(function () {
    		if (data.isVerified == true) {
    			window.location.replace("api/posts?token="+localStorage.getItem('token')+'&email='+localStorage.getItem('email'));
    		}
    		else {
    			window.location.replace("api/verification?token="+localStorage.getItem('token')+'&email='+localStorage.getItem('email'));
    		}
    	}, 2000);
    	}
    	else {
    	error.innerHTML = ""
    		var text = document.createTextNode(data.message)
    	error.appendChild(text)	
    	error.style.padding = '10px'
    }
    	
    	
    },
    failure: function(errMsg) {
        alert(errMsg);
    }
});
	}


};

function phone() {
    var form = document.getElementById("phoneForm")
    var phone = form.phone.value
    var formdata = {'email' : localStorage.getItem('email') , 'token' : localStorage.getItem('token') , 'phone' : phone}
   
           $.ajax({
    type: "POST",
    url: "/api/phone",
    // The key needs to match your method's input parameter (case-sensitive).
    data: JSON.stringify(formdata),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function(data){
        var success =  document.getElementById('success')
        if (data == 'يرجى كتابة رقم الهاتف') {
                success.style.backgroundColor = '#FF8C8C'
        } 
        else {
              success.style.backgroundColor = 'green'
        }
        
       success.innerHTML = data
       success.style.padding = '10px'
    },
    failure: function(errMsg) {
        alert(errMsg);
    }
});
         }

 $(document).ready(function() {

     $('#uploadForm').submit(function() {
      if (document.getElementById("pic1").files.length == 0) {
        $("#status").empty().text(" الرجاء قم باختيار صورة لوجه الهوية");
        $("#status").css('padding', '10px');
        return false;
      } else {

          $("#status").css('backgroundColor', 'green');
          $("#status").empty().text("يتم تحميل الصور الان");
          $("#status").css('padding', '10px');
         
        $(this).ajaxSubmit({

            error: function(xhr) {
        status('Error: ' + xhr.status)
            },

            success: function(response) {

        $("#status").empty().text(response)

            }
    })
        
      }
        
   
       
    });    
});


 function showCollege() {
     $('#stagediv').fadeOut('slow/400/fast', function() {
         
     });
     $('#collegediv').fadeIn('slow/400/fast', function() {
         
     });
 }
 function showStage() {
     $('#collegediv').css('display', 'none');
     $('#stagediv').fadeIn('slow/400/fast', function() {
         
     });
 }


 function getCollegePosts () {

    function afterTimeOut () {
        
    }
$.ajax({
    url: "/api/collegeposts",
    headers: {'x-access-token':localStorage.getItem('token'),'email':localStorage.getItem('email')},
    type: "GET",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function(data){

        setTimeout(function  () {
            $('.loading').css('display', 'none');
        if (data.length < 5) {
            document.getElementById('fewPosts').innerHTML = 'اذا جانت المصارحات مموجودة او قليلة فالسبب لان موقعنا جديد , تشجع واكتب التريد تحجيه وضيف مصارحاتك , كل معلوماتك راح تبقى سرية .'
        }

        for (var i = 0; i < data.length; i++) {
            var post = `<div>\
            <div class="collegePost">\
                <div class="row">\
                  <div class="col-xs-6 text-left date">\
                      `+data[i].date+`\
                  </div>\
                  <div class="col-xs-6 text-right sex">\
                    بواسطة : <i style="color: #FF8C8C ; font-size: 20px ; " class="fa fa-`+data[i].sex+`" aria-hidden="true"></i> \
                  </div>\
                </div>\
                <hr>\
                <div>\
                  <p class="content">\
                    `+data[i].content+`\
                  </p>\
                   <p class="likes">\
                    <span class="`+data[i].id+`"> `+data[i].likes+`</span> <i class="fa fa-heart" aria-hidden="true"></i>\
                  </p>\
                </div>\
            </div>\
            <div>\
                  <button  onclick="addLike('`+data[i].id+`')" id="`+data[i].id+`" class="like_btn `+data[i].isLiked+`">\
                  اعجبني \
                  <i class="fa fa-heart" aria-hidden="true"></i>\
                  </button>\
                </div>\
            </div>`
                var div = document.createElement('div')
                div.id = "collegediv" + i
                document.getElementById('collegediv').appendChild(div)
                document.getElementById("collegediv"+i).innerHTML = post


            
            
        }
        }, 2000)
      
    },
    failure: function(errMsg) {
        alert(errMsg);
    }
});
     
 }

 function getStagePosts () {
$.ajax({
    url: "/api/stageposts",
    headers: {'x-access-token':localStorage.getItem('token'),'email':localStorage.getItem('email')},
    type: "GET",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function(data){

        for (var i = 0; i < data.length; i++) {
            var post = `<div>\
            <div class="collegePost">\
                <div class="row">\
                  <div class="col-xs-6 text-left date">\
                      `+data[i].date+`\
                  </div>\
                  <div class="col-xs-6 text-right sex">\
                    بواسطة : <i style="color: #FF8C8C ; font-size: 20px ; " class="fa fa-`+data[i].sex+`" aria-hidden="true"></i> \
                  </div>\
                </div>\
                <hr>\
                <div>\
                  <p class="content">\
                    `+data[i].content+`\
                  </p>\
                  <p class="likes">\
                    <span class="`+data[i].id+`"> `+data[i].likes+`</span> <i class="fa fa-heart" aria-hidden="true"></i>\
                  </p>\
                </div>\
            </div>\
            <div>\
                  <button  onclick="addLike('`+data[i].id+`')" id="`+data[i].id+`" class="like_btn `+data[i].isLiked+`">\
                  اعجبني \
                  <i class="fa fa-heart" aria-hidden="true"></i>\
                  </button>\
                </div>\
            </div>`
                var div = document.createElement('div')
                div.id = "stagediv" + i
                document.getElementById('stagediv').appendChild(div)
                document.getElementById("stagediv"+i).innerHTML = post


            
            
        }
      
    },
    failure: function(errMsg) {
        alert(errMsg);
    }
});
     
 }



function toAddPost () {
    $('#postsContainer').css('display', 'none');
    $('#addPostContainer').fadeIn('slow/400/fast', function() {
        
    });
}

function backToPosts () {
    $('#addPostContainer').css('display', 'none');
    $('#postsContainer').fadeIn('slow/400/fast', function() {
        
    });
    
}

function addPost () {
    var form = document.getElementById('addPostForm')
    var textArea = document.getElementById('addposttext')
    var isGeneral = document.getElementById('isGeneral')
    var errorDiv = document.getElementById('addPostError')
    var data = {"email":localStorage.getItem('email'),"token" : localStorage.getItem('token') , "content" : textArea.value , "isGeneral" : form.isGeneral.value }
    errorDiv,innerHTML = ""
     $('.loading2').css('display', 'block');
    $.ajax({
    type: "POST",
    url: "/api/addpost",

    // The key needs to match your method's input parameter (case-sensitive).
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function(data){
         $('.loading2').css('display', 'none');
        if (data === 'تم اضافة المصارحة') {
            errorDiv.innerHTML = data
            errorDiv.style.padding = "10px" ;
            errorDiv.style.backgroundColor = 'green'
            window.location.replace('/api/posts?token='+localStorage.getItem('token')+'&email='+localStorage.getItem('email'))

        }
        else {
            errorDiv.innerHTML = data
            errorDiv.style.padding = "10px" ;
            errorDiv.style.backgroundColor = '#FF8C8C'
        }
    },
    failure: function(errMsg) {
        alert(errMsg);
    }
});
    
}



/* ------------- likes ---------- */

function addLike (id) {
    if ($('#'+id).hasClass('like_btn_clicked')) {
                   $('#'+id).removeClass('like_btn_clicked')
                    var num = parseInt($('.'+id).text())
                      $('.'+id).text(num-1)

         $.ajax({
                url: "/api/removelike",
                headers: {'x-access-token':localStorage.getItem('token'),'email':localStorage.getItem('email')},
                type: "POST",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({"id" : id}),
                dataType: "json",
                success: function(data){
                  
                },
                failure: function(errMsg) {
                    alert(errMsg);
                }
            });
    } else {
            $('#'+id).addClass('like_btn_clicked')
            var num = parseInt($('.'+id).text())
            $('.'+id).text(num+1)

        $.ajax({
                url: "/api/addlike",
                headers: {'x-access-token':localStorage.getItem('token'),'email':localStorage.getItem('email')},
                type: "POST",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({"id" : id}),
                dataType: "json",
                success: function(data){
                  
                },
                failure: function(errMsg) {
                    alert(errMsg);
                }
            });
        
    }
}


