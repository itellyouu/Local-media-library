var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $http, $timeout) {
  $scope.dir_list = []
  $scope.file_list = []
  $scope.active = true
  $scope.dir = ""


  $scope.get_file = function(id, index, e){
    e.stopPropagation()
    $scope.file_list = $scope.dir_list[index].data;
    $scope.dir = $scope.dir_list[index].dir
  }

  $scope.back_fn = function(){
    for (var x in $scope.dir_list) {
      if ($scope.dir_list[x].dir == $scope.dir) {
        return layer.msg("不能返回上一级了")
      }
    }
    $http.get('/back', {
      params: {
        dir: $scope.dir
      }
    })
      .success(function(res){
        if (res.status == 200) {
          $scope.file_list = res.data
          $scope.dir = res.dir
        }
      })
      .error(function(e){
        console.log(e)
      })
  }

  $scope.read_fn = function(dir){
    var dir = `${$scope.dir}/${dir}`
    $http.post('/readfile',{
      dir: dir
    })
      .success(function(res){
        if (res.status == 200) {
          if (res.isFile) {
            if (!res.data) {
              return;
            }
            layer.open({
              title: '文件信息',
              content: res.data
            })
          } else {
            $scope.file_list = res.data
            $scope.dir = res.dir
          }
        }
      })
      .error(function(e){
        console.log(e);
      })
  }

  $scope.remove_dir = function(id, index, e){
    e.stopPropagation()
    if (confirm("确定移除该文件夹？")) {
      $http.delete('/dir/' + index)
        .success(function(res){
          if (res.status == 200) {
            $scope.dir_list.splice(index,1)
            $scope.dir = ""
            $scope.file_list = []
          }
        })
        .error(function(e){
          console.log(e);
        })
    }
  }

  $http.get('/dir')
    .success(function(res){
      $scope.dir_list = res.data
    })
    .error(function(e){
      console.log(e)
    })

  $scope.add_fn = function(){
    $http.post('/dir', {
      dir: $scope.dir_val
    })
      .success( res => {
        if (res.status == 200) {
          $scope.dir_list.push(res.data)
        }
      })
      .error( e => {
        alert('获取文件夹错误或文件夹已存在')
      })
  }

  $scope.handleDirName = function(index, val){
    layer.open({
      title:'修改文件名',
      content: '<input id="dir_name" type="text" value="" />',
      yes: function(){
        $http.put('/dir/' + index, {
          title: $("#dir_name").val()
        })
          .success(function(res){
            layer.closeAll()
            if (res.status == 200) {
              $scope.dir_list[index].title = res.data.title
            }
          })
          .error(function(e){
            console.log(e);
          })
      }
    })
  }
});