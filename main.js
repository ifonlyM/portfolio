//섹션번호와 섹션의 스크롤 탑 값을 가지는 객체 정의
function section(element,no, scrollTop){
    this.element = element;
    this.no = no;
    this.scrollTop = scrollTop;
    this.slides = [];
    this.slideIndex = 0;
}
function section_slide(element, no, scrollLeft){
    this.element = element;
    this.no = no;
    this.scrollLeft = scrollLeft;
}

// 비순수함수를 의도적으로 사용하기 위해 객체형태로 사용해봄( C의 포인터처럼 함수의 파라미터로 넘긴 값을 함수내에서 변경하기위함. )
var move = {
    scrolling: false,
    sliding: false,
    isImgScroll: false,
    isExpScroll: false,
    imgScrolling : false,
    isModalScroll: false         
}
var myFullpage = $("#my-fullpage");
var html = $("html, body");
var winElement = $(window);
var currSecNum = 0;     // 현재 보여지고 있는 섹션 Index
var secAniTime = 500;   // 섹션 애니메이션 시간
var secStopTime = 25;   // 섹션 애니메이션 정지시간
var modal = $("#modal");   
var modal_aniTime = 300;    //모달 애니메이션 시간 

// 풀 페이지 관련 스크립트 -------------------------------------------------------------------------------------------------------------------------------------------------------
function myFullPageSetUp() {
    var pageHeight = myFullpage.outerHeight();
    var pageWidth = myFullpage.outerWidth();

    // 브라우저 크기가 바뀌어도 현재 섹션 및 슬라이드 위치를 유지
    winElement.resize(function(){
        pageHeight = myFullpage.outerHeight();
        pageWidth = myFullpage.outerWidth();
    
        if(sections){
            for(var i = 0; i < pageLength; i++){
                sections[i].scrollTop = (i) * pageHeight;
                if(sections[i].slides.length > 0) {

                    // 슬라이드가 있는 경우 슬라이드 left다시 설정
                    slideSetUp(sections[i], sections[i].element.find(".slide"));

                    // slide-nav에 scrollLeft값 다시 지정
                    var slideNav = sections[i].element.children(".slides-nav").find("li");
                    for(var j = 0; j < slideNav.length; j++) {
                        slideNav.eq(j).attr("data-scrollLeft", sections[i].slides[j].scrollLeft);
                    }
                }
            }

            // 위에서 지정한 scroll값을 이용해 실제 요소 위치를 브라우저 크기에 맞게 재지정
            var currSection = sections[currSecNum];
            if(currSection.slides.length > 0){
                var slideIndex = currSection.slideIndex;
                var currSlides = currSection.element.children(".slides");
                currSlides.css({"left": -currSection.slides[slideIndex].scrollLeft}); // 슬라이드 위치 재지정
                html.animate({scrollTop: currSection.scrollTop}, 0); // 섹션 위치 재지정 
            }
        }   
    });
    
    // 문서로딩 완료후 세션 개수를 파악하고 각 세션마다 스크롤 탑의 값을 구해본다, 섹션 객체를 생성()
    var pageLength = myFullpage.children(".section").length;
    var sections = [];
    for(var i = 0; i < pageLength; i++){
        var s = new section(myFullpage.find(".section").eq(i), i+1, i * pageHeight);
        var slides = s.element.find(".slide");

        // 섹션에 슬라이드가 있는 경우 
        if(slides.length > 0){

            // 슬라이드가있는 섹션의 경우 슬라이드 css를 셋팅 해준다.
            slideSetUp(s, slides);

            //가로슬라드 전용 버튼및 네비게이션 아이콘 추가 및 네비게이션용 li태그에 scrollLeft 값 저장
            var str = "";
            str += "<button class='left-arrow' style='display:none;'>&laquo;</button>";
            str += "<button class='right-arrow'>&raquo;</button>";
            str += "<ul class='slides-nav'></ul><div class='slides-nav-title'></div>"

            // 없는 경우 append
            if(s.element.children(".slides-nav").length == 0) {

                //myFullpage.find(".section").eq(i).append(str);
                s.element.append(str);

                str = "";
                for(var j = 0; j < s.slides.length; j++ ) {
                    var slide = s.slides[j].element;
                    var slideTitle = slide.find("h1").text();
                    if(j == 0) 
                        str +="<li data-focus='true' data-scrollLeft='"+ s.slides[j].scrollLeft + "' data-title='" + slideTitle + "' data-no='"+ s.slides[j].no +"'></li>";
                    else 
                        str +="<li data-focus='false' data-scrollLeft='"+ s.slides[j].scrollLeft + "' data-title='" + slideTitle + "' data-no='"+ s.slides[j].no +"'></li>";
                }
                //myFullpage.find(".section").eq(i).find(".slides-nav").append(str);
                s.element.find(".slides-nav").append(str);
            }

        }                
        sections.push(s);
    }

    // 슬라이드가있는 섹션의 경우 슬라이드 css를 셋팅 해준다.
    function slideSetUp(section, slides) {
        for(var i = 0; i < slides.length; i++){
            // 슬라이드가 이미 만들어져 있는 경우
            if(section.slides.length == slides.length) {
                var left = section.slides[i].scrollLeft = i * pageWidth;
                section.slides[i].element.css({"left": left});
            }
            else {
                var slide = new section_slide(slides.eq(i), i, i * pageWidth);
                slide.element.css({"left": slide.scrollLeft});
                section.slides.push(slide);
            }
        }
    }

    // 섹션 네비게이션 생성하기
    if(sections) {
        var sectionList = myFullpage.find(".section"); //$(".my-fullpage .section");
        var str = "";
        str += "<ul class='section-nav'></ul>";

        // 없는 경우 만들어 주기
        if(myFullpage.children(".section-nav").length == 0){

            myFullpage.append(str);
            str = "";
            for(var i = 0; i < sectionList.length; i++) {
                if(i === 0) 
                    str += "<li class='curr-section' data-number='" + i + "' title='"+ sectionList.eq(i).data("title") +"'>" + sectionList.eq(i).data("title") + "</li>";
                else 
                    str += "<li class='mouse-out' data-number='" + i + "' title='"+ sectionList.eq(i).data("title") +"'>" + sectionList.eq(i).data("title") + "</li>";
            }
            myFullpage.find(".section-nav").append(str);
        }
    }
    
    // 프로필 뒷면을 확인 안하고 스크롤이동시 프로필 뒷면을 보여줌
    function EdProfileBackCheck(isFlash) {
        currSecNum = 0; // 휠이나 키보드에 영향받은 섹션넘버 변수를 다시 0으로 초기화
        EdProfileTurn();
        setTimeout(function(){
            move.scrolling = false;
        }, 1000);
        
        if(!isFlash) return;
        //애니메이션 시간동안 뒤집기 버튼 점멸
        $(function flash(){
            if(!move.scrolling) return;
            $(".Ed-btn").animate({"opacity": 0}, 100, function(){
                $(".Ed-btn").animate({"opacity": 1}, 250, flash);
            });
        });
    }

    var sectionNav_li = $(".section-nav li");
    var clickSecNum = 0; // 섹션네비를 클릭하면 해당하는 섹션번호를 저장함 

    // 섹션 네비게이션 클릭시 이벤트
    sectionNav_li.click(function(){
        // if(!profile_isBackCheck){
        //     EdProfileBackCheck()
        //     return;
        // }

        // 스크롤 중일땐 실행 안함
        if(move.scrolling) return;

        var currLi = $(this);
        clickSecNum = currLi.data("number");
        currSecNum = clickSecNum;

        // 애니메이션 flag true
        scrolling = true;

        // 애니메이션이 끝나는 시간(+추가시간)에 맞춰서 false
        setTimeout(function(){
            scrolling = false;
            currLi.removeClass().addClass("curr-section");
        }, secAniTime);
        $("html, body").animate({scrollTop: sections[currLi.data("number")].scrollTop}, secAniTime);

        // 섹션 네비게이션 색상 번경 및 폰트 강조위치 변경
        sectionNav_li.removeClass().addClass("mouse-out");
        currLi.removeClass().addClass("curr-section");
    });

    // 섹션 네비 마우스 오버시 색상변경
    sectionNav_li.hover(function(){
        $(this).removeClass().addClass("mouse-over");
    }, function(){ 
        var thisLi = $(this);
        // 마우스 오버에서 벗어날때 
        if(thisLi.data("number") === clickSecNum)
            thisLi.removeClass().addClass("curr-section");
        else 
            thisLi.removeClass().addClass("mouse-out");
    });

    //현재 어느 섹션에 스크롤이 위치해있는지 계산 (브라우저 크기 변경시 부정확성으로 인해 사용안함)
    function currSection( sections, currScrollTop, pageHeight) {
        var currSec = 0;
        for(var i in sections) {
            // 각 세션의 scroll min, scroll max 값을 현재 scrollTop의 위치와 비교
            var min = sections[i].scrollTop;
            var max = sections[i].scrollTop + pageHeight;
            if(currScrollTop >= min  && currScrollTop < max) {
                currSec = i;
            }
        }
        return Number(currSec);
    }
    
    // 이전,다음 섹션 이동 및 애니메이션 처리
    function sectionSequence(afterSectionNum) {
        // 프로필 뒷면을 확인 안하고 스크롤이동시 프로필 뒷면을 보여줌
        // if(!profile_isBackCheck){
        //     EdProfileBackCheck(true);
        //     return;
        // }
        
        // 이동할 섹션이 있는 경우 섹션 이동
        if(sections[afterSectionNum]) {
            // 섹션 네비게이션과 호환성을 위해 섹션번호 저장
            clickSecNum = afterSectionNum;

            // 애니메이션이 끝나는 시간(+추가시간)에 맞춰서 false
            setTimeout(function(){
                move.scrolling = false;
            }, secAniTime);

            // 섹션 애니메이션
            html.animate({
                scrollTop: sections[afterSectionNum].scrollTop
            }, secAniTime);

            // 이동할 섹션이 마지막에 있던 슬라이드로 위치지정
            var afterSection = sections[afterSectionNum];
            var afterSlides = afterSection.element.children(".slides");
            if(afterSlides.hasClass("slides")){
                afterSlides.css({"left": -afterSection.slides[afterSection.slideIndex].scrollLeft});
            }

            // 섹션 네비게이션 색상 번경 및 폰트 강조위치 변경
            sectionNav_li.removeClass().addClass("mouse-out");
            sectionNav_li.eq(afterSectionNum).removeClass().addClass("curr-section");

            // 섹션 이동중에는 슬라이드 버튼 안보이게
            slideArrowHideOn(move);
        }
    }

    // 스크롤이 이동시 다음 섹션 전환 애니메이션
    window.addEventListener("wheel", function(e){
        // 이미지 스크롤인 경우 '섹션 스크롤기능', '기본 스크롤기능', '모달 슬라이드'는 실행하지 않음
        if(move.isImgScroll){
            e.preventDefault();
            return;
        } 

        // 스크롤, 슬라이딩중, 설명부 스크롤 일땐 샐행하지 않음
        if(move.scrolling || move.sliding || move.isExpScroll) return;
        
        // 모달창에서 스크롤시 슬라이드 적용
        if(modal.css("display") == "block") {
            modalWheelSequence(e);
            return;
        }

        // -- 이곳부터 섹션 휠 스크롤링 적용
        move.scrolling = true;

        //휠 다운 일때 -120, 휠 업 일때 120 값을 가지는 e.whellDelta
        var moveCondition = sectionMoveCondition(e.wheelDelta < 0, e.wheelDelta > 0);

        // moveCondition값이 true일 때만 섹션 이동
        if(moveCondition) sectionSequence(currSecNum);
    }, {passive: false});

    // 키보드 위,아래 방향키 입력시 섹션 전환 애니메이션
    $(document).keydown(function(e) {
        // 위,아래 방향키 입력시 기본 keyDown이벤트 막기, 다른버튼입력인 경우 실행안함
        if(e.keyCode == 40 || e.keyCode == 38) e.preventDefault();
        else return;

        // 스크롤, 슬라이딩중 일땐 샐행하지 않음
        if(move.scrolling || move.sliding) return;
        move.scrolling = true;

        // 방향키 코드 40 == 아래, 38 == 위
        var moveCondition = sectionMoveCondition(e.keyCode == 40, e.keyCode == 38);

        // moveCondition값이 true일때만 섹션 이동
        if(moveCondition) sectionSequence(currSecNum);
    });

    // 파라미터 조건에 따라 section 위,아래 방향 결정 및 현재 섹션 인덱스 파악
    function sectionMoveCondition(condition_1, condition_2) {
        // 아래로 이동
        if(condition_1) {
            currSecNum += 1;
            if(currSecNum >= sections.length) {
                currSecNum = sections.length -1;
                move.scrolling = false;
                return false;
            }
        }
        //위로 이동
        else if(condition_2) {
            currSecNum -= 1;
            if(currSecNum < 0) {
                currSecNum = 0;
                //EdProfileTurn(true);
                move.scrolling = false;
                return false;
            }
        }
        return true;
    }

    // 이전,다음 슬라이드 이동 및 애니메이션 처리
    function slideSequence(currSecNum, direction) {
        // var currSection = myFullpage.find(".section").eq(currSecNum);
        var currSection = sections[currSecNum].element;
        if(currSection.children(".slides").length == 0) return; // 슬라이드가 없는 섹션에서는 작동 안함

        // 슬라이드 중일땐 버튼이 눌려도 아무작동 안하게 방지
        if(move.sliding || move.scrolling) return;
        move.sliding = true;

        var slides = currSection.children(".slides");
        var limit = slides.children(".slide").width() * (slides.children().length -1);
        var currNav = currSection.children(".slides-nav").children("[data-focus='true']");
    


        // 다음 슬라이드 이동시
        if(direction === "next") {
            // 슬라이드 '마지막번째미만'에선 하나씩 우측이동
            if(slides.offset().left > -limit){
                slides.animate({ left: slides.offset().left - slides.children(".slide").width() }, secAniTime);
                currNav.attr("data-focus", "false").next().attr("data-focus", "true"); // 슬라이드 네비 색상 변경
            }
            // 슬라이드 '마지막번째'에선 첫번째 슬라이드로 이동 
            else if(slides.offset().left == -limit){
                slides.animate({ left: 0 }, secAniTime); 
                currNav.attr("data-focus", "false").end().children("li").first().attr("data-focus", "true"); // 슬라이드 네비 색상 변경
            }
        }
        // 이전 슬라이드 이동시
        else if(direction === "prev") {
            // 슬라이드 '두번째이상'에선 슬라이드 하나씩 좌측이동
            if(slides.offset().left < 0){
                slides.animate({ left: slides.offset().left + slides.children(".slide").width() }, secAniTime);
                currNav.attr("data-focus", "false").prev().attr("data-focus", "true"); // 슬라이드 네비 색상 변경
            }
            // 슬라이드 '첫번째'에선 슬라이드 마지막으로 이동
            else if(slides.offset().left == 0) {
                slides.animate({left:  -(slides.children(".slide").width() * (slides.children().length -1))}, secAniTime);
                currNav.attr("data-focus", "false").end().children("li").last().attr("data-focus", "true"); // 슬라이드 네비 색상 변경
            }
        }
        else {
            alert("error: slide direction lost");
        }
        slideArrowHideOn(move);

        // 현재 섹션에서 보여지는 슬라이드 번호 구하기
        sections[currSecNum].slideIndex = currSection.children(".slides-nav").find("li[data-focus='true']").data("no");


        // 슬라이드 첫 페이지에서는 좌측 이동버튼 가리기
        if(sections[currSecNum].slideIndex === 0){
            currSection.children(".left-arrow").css("display", "none");
        }
        else {
            currSection.children(".left-arrow").css("display", "block");
        }

        // 슬라이드 마지막 페이지에서는 우측 이동버튼 가리기
        if(sections[currSecNum].slideIndex === currSection.find(".slide").length -1){
            currSection.children(".right-arrow").css("display", "none");
        }
        else {
            currSection.children(".right-arrow").css("display", "block");
        }
    }

    // 슬라이드 우 버튼 클릭시 슬라이드 이동
    myFullpage.find(".section").on("click", ".right-arrow", function(){
        slideSequence(currSecNum, "next");
    });
    
    // 슬라이드 좌 버튼 클릭시 슬라이드 이동
    myFullpage.find(".section").on("click", ".left-arrow", function(){
        slideSequence(currSecNum, "prev");
    });

    // 키보드 좌우 방향키 입력시 슬라이드 애니메이션
    $(document).keydown(function(e) {
        //죄우 방향키 입력일 경우 기본 keyDown이벤트 막기, 다른버튼입력인 경우 실행안함
        if(e.keyCode == 39 || e.keyCode == 37) e.preventDefault();
        else return;

        // 모달 켜져있는 경우 모달 슬라이드만 동작
        if(modal.css("display") == "block") {
            // 오른쪽 방향키
            if(e.keyCode == 39) {
                modalSlideSequence(-modal.width());
            }
            // 왼쪽 방향키
            else if(e.keyCode == 37) {
                modalSlideSequence(modal.width());
            }
            return;
        }

        // 오른쪽 방향키 입력시 섹션 슬라이드
        if(e.keyCode == 39) {
            // 프로필 섹션에서는 카드 뒤집기 애니메이션 적용
            // if(currSecNum == 0){
            //     EdProfileTurn();
            //     return;
            // } 
            slideSequence(currSecNum, "next");
        }
        // 왼쪽 방향 입력시 섹션 슬라이드
        else if(e.keyCode == 37) {
            // 프로필 섹션에서는 카드 뒤집기 애니메이션 적용
            // if(currSecNum == 0) {
            //     // EdProfileTurn(true); // 왼쪽으로 회전함
            //     return;
            // }
            slideSequence(currSecNum, "prev");
        }
    });

    // 슬라이드 네비에 마우스 오버시 해당 슬라이드 타이틀 보여주기 
    var snTimer;
    var navTitle;
    var slideNav_li = $(".slides-nav li");
    slideNav_li.hover( function(){
        var thisLi = $(this);
        if(thisLi.attr("data-focus") == "true") return;
        navTitle = thisLi.closest(".section").children(".slides-nav-title");
        var li = thisLi;

        // 일정시간후 타이틀 보여주기
        snTimer = setTimeout(function(){
            if(thisLi.attr("data-focus") == "true") return;
            navTitle.text(li.data("title")); //먼저 텍스트를 채워넣어 높이를 자동으로 지정하게한다.

            var top = (li.offset().top - navTitle.parent().offset().top) - (navTitle.outerHeight(true));
            var rem1 = 1 * parseFloat(getComputedStyle(document.documentElement).fontSize);

            navTitle.css({
                "display": "block",
                "top": top + rem1,
                "left": (li.offset().left - navTitle.parent().offset().left) - navTitle.outerWidth(true) / 2,
                "opacity": 0
            }).stop().animate({
                "top": top,
                "opacity": 1
            }, 200);
        },300);
        
    }
    , function(){
        if($(this).attr("data-focus") == "true") return;
        clearTimeout(snTimer); // setTimeout 실행중지
        navTitle.text("")
        .css({
            "display": "none"
        });
    });

    // 슬라이드 네비게이션 클릭시 해당 슬라이드로 애니메이션
    slideNav_li.click(function() {
        //애니메이션 실행 스택 중복 방지
        if(move.sliding) return; 
        move.sliding = true;

        var thisLi = $(this);
        var slides = thisLi.parents(".section").children(".slides");
        var slideNav = thisLi.parents(".slides-nav").children("li");
        
        slides.animate({left: -thisLi.attr("data-scrollLeft")}, secAniTime);
        slideNav.attr("data-focus", "false");
        thisLi.attr("data-focus", "true");

        //슬라이드 이동시 sections 객체 slideIndex값 갱신
        sections[currSecNum].slideIndex = thisLi.data("no");
        navTitle.text("")
        .css({
            "display": "none"
        });
        setTimeout(function(){move.sliding = false;}, secAniTime + secStopTime);
        slideArrowHideOn(move);

        
        var currSection = sections[currSecNum].element;
        // 슬라이드 첫번째에서만 좌측 이동버튼 안보이게
        if(sections[currSecNum].slideIndex === 0){
            currSection.children(".left-arrow").css({
                "display" : "none"
            });
        }
        else {
            currSection.children(".left-arrow").css({
                "display" : "block"
            });
        }

        // 슬라이드 마지막에서만 우측 이동버튼 안보이게
        if(sections[currSecNum].slideIndex === currSection.find(".slide").length -1){
            currSection.children(".right-arrow").css({
                "display" : "none"
            });
        }
        else {
            currSection.children(".right-arrow").css({
                "display" : "block"
            });
        }
    });

    // 슬라이드중 슬라이드 버튼 가리기
    function slideArrowHideOn(move) {
        var arrow_btn = $(".left-arrow, .right-arrow");

        if(arrow_btn == null) return;

        // 슬라이드 이동중엔 좌,우 이동 버튼 안보이게
        arrow_btn
            .css({"transition": "0s"})
            .css({"opacity":0});

        // 슬라이이드 이동이 끝난뒤 
        setTimeout(function(){
            move.sliding = false;

            // 좌,우 슬라이드 이동버튼 보이게
            arrow_btn
                .css({"transition": "0.3s"})
                .css({"opacity":1}); 
        }, secAniTime + secStopTime);    
    }

    // 모달에서 마우스 휠 조작시 슬라이드
    function modalWheelSequence(event) {
        if(event.wheelDelta < 0) {
            modalSlideSequence(-modal.width());
        }
        else if(event.wheelDelta > 0) {
            modalSlideSequence(modal.width());
        }
    }

    // 모달에서 몇번째 이미지가 보여지고있는지 확인
    function currModalIndex(images) {
        for(var i = 0; i < images.length; i++) {
            var img = images.eq(i);

            var modal_left = parseInt(modal.css("left"));
            var modal_right = modal_left + parseInt(modal.outerWidth(true));
            var img_left = parseInt(img.css("left"));

            // 모달 안에 위치한 이미지 == 현재 보여지고 있는 이미지
            if(img_left > modal_left && img_left < modal_right) {
                return i;
            }
        }
        // on("load") 를 이용해 이미지 로딩이후 정확한 수치값 구하는법
        // $(images).on("load", $(img), function(){
        //     if($(this).hasClass("tempImg")) return;
        //     console.log(this.offsetWidth);
        //     console.log($(this).offset().left);

        // })
    }

    // 모달 이미지 슬라이드 방향 조정 
    function modalSlideSequence(sequenceValue, pickIndex){
        var modal_images = modal.find("img");

        if(modal_images.length <= 1 || move.sliding) return;
        move.sliding = true;
        
        // 입력된 방향으로 슬라이드
        for(var i = 0; i < modal_images.length; i++) {
            modal_images.eq(i)
            .css({"left": parseInt(modal_images.eq(i).css("left")) + sequenceValue });
        }

        var currViewIdx = currModalIndex(modal_images);
        if(pickIndex) currViewIdx = pickIndex;

        // 모달 인덱스 처리
        if(sequenceValue < 0) {
            currViewIdx++;
            if(currViewIdx > modal_images.length-2) //최대치 넘어가면 다시 1로 (무한 슬라이드이기 때문)
                currViewIdx = 1;
        }
        else if(sequenceValue > 0) {
            currViewIdx--;
            if(currViewIdx < 1) // 최소치보다 작아지면 최대치로 (무한 슬라이드이기 때문)
                currViewIdx = modal_images.length-2;
        }
        modal.children(".img-title").html(modal_images.eq(currViewIdx).attr("alt")); // 모달 이미지 타이틀 변경
        modal.find(".left-index").text(currViewIdx);
        modal.find(".right-index").text(modal_images.length - 2);

        // 무한슬라이드 처리 및 슬라이드 인덱스 처리
        setTimeout(function(){
            currViewIdx = currModalIndex(modal_images);
            if(currViewIdx == 0 || currViewIdx == (modal_images.length - 1)) { // 양쪽 끝에서 넘길경우
                modal_images.css("transition", "0s")
                            .each(function(){
                                var img = $(this);
                                img.css({"left": parseInt(img.css("left")) + (sequenceValue * -(modal_images.length - 2))})
                                    .css("left");
                            })
                            .css("transition", "0.3s");
            }
            //move.sliding = false;
            
            // 슬라이드 인덱스 처리 (반응속도 느려서 타임아웃함수 밖에서 처리함) 코드는 간결한데 흠..
            // modal.find(".left-index").text(currModalIndex(modal_images));
            // modal.find(".right-index").text(modal_images.length - 2);

            modal.children(".slides-index, .img-title").css({"opacity": 1});
        }, secAniTime + secStopTime);

        // 슬라이드중 버튼 가렸다 보이게하기
        slideArrowHideOn(move);
    }

    // 모달 이미지 초기설정
    function modalStartSetUp(images, pickImg) {
        var setLeft = modal.width() / 2; // 모달 가운데에 이미지 위치

        for(var i = 0; i < images.length; i++) {
            modal.children(".img-view").append("<img>"); // 이미지 개수만큼 모달 img 태그 생성
            var modal_img = modal.find("img").eq(i);
            var img = images.eq(i);

            // 모달내 이미지의 src, alt 지정 및 left, height 지정
            modal_img.attr({
                "src": img.attr("src"),
                "alt": img.attr("alt")
            })
            .css({
                "left": setLeft,
                "height": img.data("height"),
                "min-height": img.data("height")
            })

            setLeft += modal.width(); // 다음 이미지 위치값 증가
        }

        // 무한 슬라이드 효과를 위해서 임시 img 생성
        modal.children(".img-view")
                    .prepend("<img class='prevImg tempImg'>")
                    .children(".prevImg")
                        .attr({
                            "src": images.eq(images.length - 1).attr("src"),
                            "alt": images.eq(images.length - 1).attr("alt")
                        })
                        .css({
                            "left":  -(modal.width()/2),
                            "height": images.eq(images.length - 1).data("height")
                        })
                    .end()    
                    .append("<img class='nextImg tempImg'>")
                    .children(".nextImg")
                        .attr({
                            "src": images.eq(0).attr("src"),
                            "alt": images.eq(0).attr("alt")
                        })
                        .css({
                            "left":  setLeft,
                            "height": images.eq(0).data("height")
                        })
        
        // 클릭한 이미지를 사용자가 바로 볼 수 있게 위치 시킴
        for(var i = 0; i < modal.find("img").length; i++) {
            if(pickImg == images[i]) {
                modalSlideSequence(-i * modal.width(), i);
            }
        }
    }

    // 이미지 클릭시 모달창 작동
    $(".modal-img").click(function(e){

        modalStartSetUp($(this).parent().children(), this); // 모달 이미지 위치및 속성 지정
        modal.css("display", "block").animate({opacity: 1}, modal_aniTime);

        // 섹션(모달 뒤 화면)의 이동 버튼 가리기
        if(sections != null){
            
            var currSection = sections[currSecNum].element;
            currSection.children(".right-arrow, .left-arrow").css("display", "none");
        }

        // 커스텀 커서 위치 갱신
        // ### 2024-10-26: 커스텀 커서 사용 안함 ###
        //
        // modal.children(".close-cursor").css({
        //     "left": (e.pageX - scrollX) + "px",
        //     "top": (e.pageY - scrollY) + "px"
        // });
    });
    
    // 모달 이미지 외부 화면 클릭시 창 종료
    $(document).click(function(e){

        var target = $(e.target);

        if(target.hasClass("img-view") || target.hasClass("close-cursor")) {

            closeModal(modal, modal_aniTime);

            // 섹션(모달 뒤 화면)의 이동 버튼 보이기
            if(sections)
            var currSection = sections[currSecNum].element;
            sections[currSecNum].slideIndex = currSection.children(".slides-nav").find("li[data-focus='true']").data("no");

            // 섹션의 슬라이드가 첫 페이지일땐 우측 버튼만 보이게
            if(sections[currSecNum].slideIndex === 0){
                currSection.children(".left-arrow").css("display", "none");
            }
            else {
                currSection.children(".left-arrow").css("display", "block");
            }

            // 섹션의 슬라이드가 마지막 페이지일땐 좌측 버튼만 보이게
            if(sections[currSecNum].slideIndex === currSection.find(".slide").length -1){
                currSection.children(".right-arrow").css("display", "none");
            }
            else {
                currSection.children(".right-arrow").css("display", "block");
            }
        }
    });

    // 모달 끄기
    function closeModal(modal, closeAniSec) {
        modal.animate({opacity: 0}, closeAniSec);
        modal.children(".slides-index, .img-title").css({"opacity": 0});
        setTimeout(function(){
            modal.css("display", "none").find("img").remove();
            move.isModalScroll = false;
        }, closeAniSec);
    }

    // 모달 close버튼 클릭시 창 종료
    modal.on("click", ".close-btn", function(){
        closeModal(modal, modal_aniTime);
    });
    
    // esc키 입력시 모달창 종료
    $(document).keydown(function(e){
        // esc키 입력시 모달창 종료
        if(e.keyCode === 27) {
            if(modal.css("display") === "block") {
                closeModal(modal, modal_aniTime)
            }
        }
    });
    
    // 모달 버튼 입력시 슬라이드
    modal.find(".left-arrow").click(function(){
        modalSlideSequence(modal.width());
    })
    modal.find(".right-arrow").click(function(){
        modalSlideSequence(-modal.width());
    })

    // 모달창 외부에서 커스텀 커서 사용 
    // ### 2024-10-26: 사용안하기로 결정 ###
    //
    // winElement.mousemove(function(e){
    //     if(modal.css("display") === "none") return;
    //
    //     // 마우스를 움직일때마다 비용낭비가 심하다
    //     // var target = $(e.target); 
    //     // if(target.hasClass("img-view") || target.hasClass("close-cursor")) {
    //
    //     //Jquery 사용안하고 바닐라JS로 비용절약
    //     if(e.target.classList.contains("img-view") || e.target.classList.contains("close-cursor")) {
    //         modal.children(".close-cursor").css({
    //             "display": "block",
    //             "left": (e.pageX - scrollX) + "px",
    //             "top": (e.pageY - scrollY) +"px"
    //         });
    //     }
    //     else {
    //         modal.children(".close-cursor").css({
    //             "display": "none"
    //         });
    //     }
    // })

    // 페이지 새로고침시 스크롤위치 초기화 // 스크롤을 없애는 css적용으로 사용할 필요가 없어짐*
    // window.onbeforeunload = function() {
    //     html.animate({scrollTop: sections[0].scrollTop}, 0);
    // }

    /*툴팁 on/off*/
    $(".explain span[data-tooltip]").hover(function(){
        var thisTooltip = $(this);
        // on
        var title = thisTooltip.html().split("<")[0];
        var explain = thisTooltip.data("tooltip");
        thisTooltip.css("text-decoration", "underline");

        if(!explain) {
            explain = "error : 요소의 data-tooltip 속성 값이 없습니다!!";
        }
        else {
            // explain = "- " + title + " -<br>" + explain;
        }

        // 가상의 block 태그를 만들어 툴팁 내용을 넣고 그에 알맞는 width height 가져오기
        if(!thisTooltip.children(".temp")[0]) {
            var tempDiv = "<div class='temp'>";
            thisTooltip.append(tempDiv);
            thisTooltip.children(".temp").html(explain);
        }

        // 툴팁박스 title과 내용, CSS 너비 높이 지정
        $(".tooltip-box").attr("title",title).html(explain)
            .css({
                "width": thisTooltip.children(".temp").outerWidth(),
                "height": thisTooltip.children(".temp").outerHeight()
            });
        
        // 최상위 툴팁 태그 CSS 너비,높이,디스플레이 on 설정
        $(".tooltip").css({
            "width": $(".tooltip-box").outerWidth(),
            "height": $(".tooltip-box").outerHeight(),
            "display": "block",
            "opacity": 0
        });
        $(".tooltip").stop().animate({"opacity": 1}, 300);

        // 최상위 툴팁 태그 포지션 top, left 설정
        var boxTop = thisTooltip.offset().top - ($(".tooltip-box").outerHeight() + ($(".tooltip-tail").outerHeight()/2) + 16);
        var boxLeft = (thisTooltip.offset().left + (thisTooltip.width()/2)) - ($(".tooltip-box").outerWidth()/2);
        $(".tooltip").offset({top: boxTop, left: boxLeft});

    }, function(){
        // off
        $(".tooltip-box").attr("title", "").html("");
        $(".tooltip").css("display", "none");
        $(this).css("text-decoration", "none");
    });

    // 비디오 로드가 완료되었을때 비디오 높이 재설정후 비디오 컨트롤러에 css 적용 
    var video = document.querySelectorAll("video");
        
    for(var i = 0; i < video.length; i++){

        video[i].addEventListener("loadeddata" ,function(){
            var $video = $(this);
            $video.css("height", $video.height() + ($video.height() * 0.4));
            $video.attr("data-state", "window");
        });
        
        video[i].addEventListener("webkitfullscreenchange",function(){
            if(this.webkitDisplayingFullscreen){
                console.log("풀스크린");
                this.setAttribute("data-state", "default");
            }
            else{
                console.log("윈도우");
                this.setAttribute("data-state", "window");
            }
        });  
    }

    // 기타 기능 관련 -------------------------------------------------------------------------------------------------------------------------------------------------------
    // 섹션 슬라이드 이미지 로드후 이미지뷰어 높이에 맞게 각 이미지 높이를 수정
    winElement.on("load",function(){
        var images = myFullpage.find(".images");

        // 섹션 슬라이드 이미지의 크기를 재조정
        function imgsResize(images){
            for(var i = 0; i < images.length; i++){
                images.eq(i).children("img").each(function(){
                    $(this).css({
                        "height": images.eq(i).height() * 0.45,
                        "margin-bottom": images.eq(i).height() * 0.05
                    });
                });
            }
        }

        // 이미지 크기 지정
        imgsResize(images);

        // 브라우저 리사이즈시 이미지 크기 변경
        winElement.resize(function(){
            imgsResize(images);
        });

        // 이미지 위에 마우스 오버시 이미지스크롤만 활성화
        images.hover(function(){
            if($(this).children("img").length <= 2) return;
            move.isImgScroll = true;
        }, function(){
            move.isImgScroll = false;
        });

        // 이미지 여러개인 경우 커스텀 휠 이벤트 적용
        images.on("mousewheel", function(e){
            if(!move.isImgScroll || move.imgScrolling) return;
            move.imgScrolling = true;
            var thisImages = $(this);
            var delta = e.originalEvent.wheelDelta; // 휠 델타값으로 휠업, 휠다운 구분
            e.preventDefault(); // 기본 이벤트 막기

            // 휠 다운
            if(delta < 0){
                thisImages.stop().animate({
                    scrollTop: thisImages.scrollTop() + thisImages.height()
                }, secAniTime);
            }
            // 휠 업
            else if(delta > 0){
                thisImages.stop().animate({
                    scrollTop: thisImages.scrollTop() - thisImages.height()
                }, secAniTime);
            }
            setTimeout(function(){
                move.imgScrolling = false;
            }, secAniTime + secStopTime);
        });

        // 설명부 스크롤 있을때 섹션 스크롤 방지하기
        var explain = myFullpage.find(".explain");

        // 설명부 위에 마우스 오버시 설명부스크롤만 활성화
        explain.hover(function(){
            var $explain = $(this);

            // 스크롤이 없는 경우 
            if($explain.prop('scrollHeight') <= $explain.prop('clientHeight')){
                return;
            } 
            move.isExpScroll = true;

        }, function(){
            move.isExpScroll = false;
        });

    });
}



// 모바일 페이지 관련 스크립트 ---------------------------------------------------------------------------------------------------------------------------------------------------
var m_prevScrollTop = 0; // '접 기' 버튼 사용 후 스크롤이 제자리를 찾아가게 하기위한 전역 변수

function mobilePageSetUp() {

    // 모바일 환경에서 이미지 모달 설정 ------------------------------------------------------
    var $img_view = $(".img-view");

    // 이미지 클릭시, 모달 이미지 설정 후 모달 ON
    $(".modal-img").click(function() {
        var $this = $(this);
        var $images = $this.parent().children();

        modal.children(".img-view").append("<img>");

        var img = $images.eq($this.index()); // 실제 이미지
        var modal_img = $img_view.children("img"); // 모달로 복사된 이미지

        // 모달내 이미지의 src, alt 지정 및 height 지정
        modal_img.attr({
            "src": img.attr("src"),
            "alt": img.attr("alt")
        })
        .css({
            "height": img.data("height"),
            "min-height": img.data("height")
        });
        
        // 이미지 모달 보이게하기
        $("#modal").css("display", "block");
        
        // 모달 외부 스크롤 불가
        $("body").css("overflow", "hidden");
    });

    // 모달 이미지 외부 클릭시 모달 OFF
    modal.on("click", function() {

        $img_view.empty(); // 모달내 이미지 제거

        modal
            .css("display", "none")
                .children(".img-view")
                    .css("left", "0");

        // 모달 외부 스크롤 가능
        $("body").css("overflow", "auto");
    });

     // 모달 이미지 클릭시 이벤트 전파 막기
     modal.on("click",  "img",function(e){
        e.stopPropagation();
    });


    // read-project 클릭시 프로젝트 설명화면으로 이동
    $(".read-project a").click(function(e){
        e.preventDefault();
        
        $('html,body').stop().animate({scrollTop:$(this.hash).offset().top + 1}, 500);
    });


    // About 섹션 벗어나면 move-top 버튼 활성화
    $(window).on('scroll', function() {
        var scrollTop = $(this).scrollTop(); // 현재 스크롤 위치
        
        if (scrollTop > 800) { // 800px 이상일 때
            $(".move-top").css({
                "display": "block"
            });

        } else {
            $(".move-top").css({
                "display": "none"
            });
        }
    });

    // move-top 클릭시 about으로 이동
    $(".move-top").click(function(e){
        e.preventDefault();

        $('html,body').stop().animate({scrollTop:$("#about").offset().top + 1}, 500);
    });

    // 슬라이드 자세히 , 접기 로직 -------------------------------------
    // 서브 슬라이드 접기 및 '자세히 보기' 버튼 생성
    var $sections = $("#my-fullpage").children(".section");
    for(var i = 0; i < $sections.length; i++) {
        
        var $sec_child = $sections.eq(i).children();
        if($sec_child.hasClass("slides")) {
            
            var $slides = $sec_child;
            // 첫번째 슬라이드를 제외하고, 디스플레이 none
            $slides.children().not(":first-child").css("display", "none");

            var $slide_title = $slides.children().first().find(".slide-title");
            // 슬라이즈의 마지막 자식으로 '주요 경험 자세히 보기' 버튼 생성 및 슬라이드 타이틀과 같은 색상으로 CSS 설정
            $("<div class='more-detail'>주요 경험 자세히 보기 👈</div>")
            .appendTo($slides)
            .css({
                "background-color": $slide_title.css("background-color"),
                "color": $slide_title.css("color")
            });
        }
    }

    // '자세히 보기' 클릭시 서브 슬라이드 켜고 끄기
    $(".more-detail").click(function(){

        var $this = $(this);
        var $slides = $this.closest(".slides");
        var $sub_slide = $slides.children().not(":first-child").not(":last-child");
        var is_sub_slide_on = $sub_slide.css("display") === "block" ? true : false;

        // 서브 슬라이드 ON 일때 (ON일때 클릭은 접는 행위), 디스플레이 none 및 '접기' 버튼을 '주요 경험 자세히 보기'로 변경 +..
        if(is_sub_slide_on) {
            $sub_slide.css("display", "none");
            $this.text("주요 경험 자세히 보기 👈");

            // 접었을때, 엉뚱한 위치로 스크롤이 가게하는거 방지
            var gap = ($this.offset().top - $slides.offset().top) - window.innerHeight; // 자세히 버튼 top 까지 계산
            var detail_gap = gap + window.innerHeight / 2; // 버튼을 화면 중앙쯤 오게끔 top 조절
            winElement.scrollTop($slides.offset().top + detail_gap); 
        }
        // 서브 슬라이드 OFF 일때, 디스플레이 block 및 '주요 경험 자세히 보기' 버튼을 '접기'로 변경
        else {
            $sub_slide.css("display", "block");
            $this.text("접 기");
        }
    });
}

// 브라우저 사이즈 변경시 풀페이지 셋팅 여부 파악
function checkWidthAndRun() {

    winElement.off();
    $(document).off();
    $("html, body").off();

    if(window.innerWidth > 800) {
        myFullPageSetUp();
    }
    else {
        mobilePageSetUp();
    }
}

// Ready
$(function(){

    // 모바일 브라우저에서 빈번하게 resize가 일어나므로 버그와 자원낭비가 많이 발생함. 방법을 찾아보자~
    // 방법 1. 최초 화면 너비를 잰뒤 사용자가 창 크기를 변경했을때 PC화면 or 모바일 화면으로 보시겠냐고 유도한다.
    // window.addEventListener('resize', checkWidthAndRun); 
    checkWidthAndRun();
});