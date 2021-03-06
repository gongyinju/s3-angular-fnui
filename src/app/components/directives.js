/**
 * Created by chent on 2017/1/18.
 */

myApp.directive('butterToast', ['$rootScope',
    function($rootScope) {
        return {
            link: function(scope, element, attrs) {
                var toast = $.toast.show('loading');
                $(function() {
                    if(toast)
                       setTimeout(function(){
                            toast.close();
                       },0);
                });
            }
        };
    }]).directive("goTop",function ($window,$rootScope,$location,$anchorScroll) {
    return {
        restrict: 'E',
        replace: true,
        template: '<a class="go-top" ng-click="goTop()" >' +
                        '<i class="fn-gotop fn-gotop-icon fn-icon-chevron-up"></i></a>',
        link: function(scope, element, attrs) {
            $(element).hide();
            $(document).on('scroll',function(){
                var top = document.body.scrollTop;
                if(top>100)
                    $(element).show();
                else
                    $(element).hide();
            });
            scope.goTop = function(){
                $location.hash('topbar');
                $anchorScroll();
            }
        }
    }
}).directive('headBar',['$rootScope','$state',function($rootScope,$state){
    return {
        restrict:'E',
        transclude:true,
        templateUrl:'templates/headbar.tpl.html',
        link:function(scope,element,attr){
            scope.goBack = function(){
                if(scope.backState)
                    $state.go(scope.backState);
                else
                    $state.go($rootScope.previousState_name, $rootScope.previousState_params);
            };
            scope.closeOffCanvas = function(){
                $("#doc-oc-demo1").offCanvas('close');
            }
        }
    }
}])
    .directive("bottomBar",function(){
        return{
            restrict:'E',
            replace:true,
            templateUrl:'templates/bottombar.tpl.html'
        }
    })
    .directive("dropDown",function(){
        return {
            restrict:'E',
            transclude:true,
            template:'<div class="fn-dropdown" data-fn-dropdown ng-transclude></div>',
            link:function(){
                $(function() {
                    var selector = $('[data-fn-dropdown]');
                    selector.dropdown().on('click',function(){
                        $(this).dropdown('toggle');
                    });
                    selector.find('li').on('click',function () {
                        selector.find('li').removeClass('fn-active');
                        $(this).addClass('fn-active')
                    })

                });
            }
        }
    })
    .directive("iscrollWrapper",function(){
        return{
            restrict:'E',
            transclude:true,
            templateUrl:'templates/iscroll.tpl.html',
            link:function(){
                var myScroll;
                function createScroll(){
                    var pullUp = $('#pullUp'),
                        pullDown = $("#pullDown"),
                        pullDownLabel = $(".pullDownLabel"),
                        pullUpLabel = $(".pullUpLabel"),
                        loadingStep = 0;
                    pullDown.hide();
                    pullUp.hide();

                    //下拉刷新
                    function pullDownAction () {
                        setTimeout(function() {
                            $('#pullDown').click();
                            pullDown.removeClass('loading');
                            pullDownLabel.html('下拉刷新...');
                            pullDown['class'] = pullDown.attr('class');
                            pullDown.attr('class', '').hide();
                            myScroll.refresh();
                            loadingStep = 0;
                        },0);
                    }
                    // 上拉加载
                    function pullUpAction () {
                        setTimeout(function(){
                            $('#pullUp').click();
                            pullUp.removeClass('loading');
                            pullUpLabel.html('上拉加载更多...');
                            pullUp['class'] = pullUp.attr('class');
                            pullUp.attr('class','').hide();
                            myScroll.refresh();
                            loadingStep = 0;
                        },0);
                    }

                    //init
                    var wrapper = document.getElementById('iscroll-wrapper');
                    if(wrapper)
                        myScroll = new IScroll(wrapper,{probeType: 2});
                    $("#iscroll-wrapper").height($(window).height()-150);
                    //滚动时
                    myScroll.on('scroll', function(){
                        if(loadingStep == 0 && !pullDown.attr('class').match('flip|loading')
                            && !pullUp.attr('class').match('flip|loading')){
                            if(this.y < 15 && this.y>0){
                                pullDown.hide();
                            }
                            else if(this.y <40 && this.y>15){
                                //下拉刷新效果
                                pullDown.attr('class',pullUp['class']);
                                pullDown.show();
                                pullDownLabel.html('下拉刷新...');
                            }else if (this.y > 40) {
                                //下拉刷新效果
                                pullDown.attr('class',pullUp['class']);
                                pullDown.show();
                                myScroll.refresh();
                                pullDown.addClass('flip');
                                pullDownLabel.html('松开刷新...');
                                loadingStep = 1;
                            }else if(this.y > (this.maxScrollY -5) && this.y < this.maxScrollY){
                                pullUp.hide();
                            }
                            else if(this.y > (this.maxScrollY - 60) && this.y < (this.maxScrollY -5)){
                                pullUp.attr('class',pullUp['class']);
                                pullUp.show();
                                pullUpLabel.html('上拉加载更多...');
                            }else if (this.y < (this.maxScrollY - 60)) {
                                //上拉刷新效果
                                pullUp.attr('class',pullUp['class']);
                                pullUp.show();
                                myScroll.refresh();
                                pullUp.addClass('flip');
                                pullUpLabel.html('松开加载更多...');
                                loadingStep = 1;
                            }
                        }
                    });
                    //滚动完毕
                    myScroll.on('scrollEnd',function(){
                        if(loadingStep == 1){
                            if (pullUp.attr('class').match('flip|loading')) {
                                pullUp.removeClass('flip').addClass('loading');
                                pullUpLabel.html('Loading...');
                                loadingStep = 2;
                                pullUpAction();
                            }else if(pullDown.attr('class').match('flip|loading')){
                                pullDown.removeClass('flip').addClass('loading');
                                pullDownLabel.html('Loading...');
                                loadingStep = 2;
                                pullDownAction();
                            }
                        }else{
                            if(this.y < 15){
                                pullDown.slideUp();
                            }
                            if(this.y > (this.maxScrollY -5)){
                                pullUp.hide();
                            }
                        }
                    });
                    wrapper.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
                }
                $(function(){
                    if(!myScroll)
                        createScroll();
                });
            }
        }
    })
    /**
     * 用来在页面中间弹出一个警告框
     * 用法 1、在需要弹出的内容外加上<fn-confirm></fn-confirm>标签
     *      2、在需要弹出的时候调用modal.confirm(title,content,confirm,cancel)
     */
    .directive('fnAlert',function(){
    return {
        restrict:'E',
        template:'<div class = "fn-modal fn-modal-alert" id="fn-alert">'
        +' <div class="fn-modal-dialog">'
        +'<div class="fn-modal-hd"></div>'
        +'<div class="fn-modal-bd"></div>'
        +' <div class="fn-modal-footer">'
        + '<span class="fn-modal-btn fn-modal-btn-bold">确定</span>'
        +'</div></div></div>'
    }
})
    /**
     * 用来在页面中间弹出一个确定框
     * 用法 1、在需要弹出的内容外加上<fn-alert></fn-alert>标签
     *      2、在需要弹出的时候调用modal.alert(title,content)
     */
    .directive('fnConfirm',function(){
    return {
        restrict:'E',
        template:'<div class = "fn-modal fn-modal-alert" id="fn-confirm">'
        +' <div class="fn-modal-dialog">'
        +'<div class="fn-modal-hd"></div>'
        +'<div class="fn-modal-bd"></div>'
        +' <div class="fn-modal-footer">'
        + '<span class="fn-modal-btn fn-modal-btn-cancel" data-fn-modal-cancel>取消</span>'
        + '<span class="fn-modal-btn fn-modal-btn-bold"  data-fn-modal-confirm>确定</span>'
        +'</div></div></div>',
        link:function () {
            modal.confirm('标题','你确定吗？');
        }
    }
})
    /**
     * 用来在页面下部弹出一个框，超出的内容可以滚动
     * 用法 1、在需要弹出的内容外加上<fn-action></fn-action>标签
     *      2、在需要弹出的时候调用modal.action()
     */
    .directive('fnAction',function () {
    return {
        restrict:'E',
        transclude:true,
        template:'<div class = "fn-modal-actions" id="fn-actions">'
        +' <div class="fn-modal-actions-group"  style="overflow:scroll;height:10rem;" ng-transclude>'
        +'</div>'
        +'<div class="fn-modal-actions-group">' +
        '<button class="fn-btn fn-btn-secondary fn-btn-block" data-fn-modal-close>取消</button>' +
        '</div>'+
        '</div>'
    }
});

