var app = angular.module('group-analytics', ['ngRoute', 'ngSanitize']);
//import pdfmake
//import pdfMake from 'pdfmake/build/pdfmake.js';
//import pdfFonts from 'pdfmake/build/vfs_fonts.js';
//var manageRules = require('./controllers/rules');

app.config(['$routeProvider',
function($routeProvider) {
$routeProvider
.when('/', {templateUrl: '/allSessions.html',
            controller: 'mainController'})
.when('/addsession', {templateUrl: '/addSession.html',
            controller: 'sessionController'})
.when('/actions/:id', {templateUrl: '/addActionstoSession.html',
            controller: 'actionsessionController'})
.when('/addactions/:id', {templateUrl: '/allActions.html',
            controller: 'actionsController'})
.when('/add', {})
.when('/media/:id', {templateUrl: '/addMedia.html',
            controller: 'mediaController'})
.when('/objects/:id', {templateUrl: '/addObjects.html',
            controller: 'objectsController'})
.when('/manage/:id', {templateUrl: '/controlSources.html',
            controller: 'manageSourcesController'})
.when('/rules/:id', {templateUrl: '../views/rules.html',
            controller:'manageRules'})
.when('/reports/:id', {templateUrl: '../views/reports.html',
            controller:'manageReports'})
.when('/timeLine/:id', {templateUrl: '../views/timeLineRules.html',
            controller:'manageVis'})
.when('/delete/:id', {})
.otherwise({
redirectTo: '/'
});
}
]);

app.factory('socket', ['$rootScope', function($rootScope) {
  var socket = io.connect();

  return {
    on: function(eventName, callback){
      socket.on(eventName, callback);
    },
    emit: function(eventName, data) {
      socket.emit(eventName, data);
    }
  };
}]);

//app.controller('manageRules2', manageRules.managerulesFunc);

app.controller('mainController', function($window, $scope, $location, $routeParams, $http, socket) {
  $scope.formData = {};
  $scope.sessionData = {};
  // Get all sessions
  $http.get('/api/v1/sessions/all')
  .success(function(data){
    $scope.sessionData = data;
      //console.log(data);
  })
  .error(function(error){
    console.log('Error: ' + error);
  });

  $scope.redirectSession = function(){
    $location.path('/addsession');
  };
    // List actions
  $scope.listActions = function(sessionID){
    //alert(sessionID);
    $location.url('/addactions/'+sessionID);
  };

  //redirect to manage data sources
  $scope.redirectSources = function(sessionID) {

    $location.path('/media/'+sessionID);
  };

  $scope.redirectObjects = function(sessionID) {

    $location.path('/objects/'+sessionID);
  };

  $scope.redirectActionstoSession = function(sessionID) {

    $location.path('/actions/'+sessionID);
  };

  $scope.redirectCapture = function(sessionID) {

    $location.path('/manage/'+sessionID);
  };

/*  $scope.redirectTimeline = function(sessionID) {
 
    //$location.path('/timeline/'+sessionID);
    var dataObj = {
        id_session : sessionID
    };
    $http.post('/api/v1/visualisations/getDataforVis',dataObj)
      .success(function(dataActions){
        console.log(dataActions);
          $http.post('/api/v1/visualisations/generateJson2', dataActions)
          .success(function(objs){
              //$scope.nparticipants = objs.n; 
            //$scope.selectedactions = objs;
            console.log('http://localhost:3000/timeline/'+sessionID);
            $window.location.href='http://localhost:3000/timeline/'+sessionID;
          })
          .error(function(error){
            console.log('Error: ' + error);
          });
      })
      .error(function(error){
        console.log('Error: ' + error);
      });
  };*/

  $scope.redirectTimeline = function(sessionID) {
    $location.path('/timeLine/'+sessionID);

  };

  $scope.redirectRules = function(sessionID) {
    console.log(sessionID);
    $location.path('/rules/'+sessionID);
  };

  $scope.redirectReports = function(sessionID) {
    $location.path('/reports/'+sessionID);
  };

});

app.controller('manageReports', function($window, $scope, $location, $routeParams, $http, socket) {
 $scope.sessionid = $routeParams.id;

    // GET ALL RULES OF A SESSION
  $http.get('/api/v2/rules/all/'+$scope.sessionid)
  .success(function(data){
    $scope.sessionRules = data;
  })
  .error(function(error){
    console.log('Error: ' + error);
  });

  $scope.seeTimeline = ()=>{
    $scope.timeline = true;
    console.log('In the app.js session id: ', $scope.sessionid);
    var dataObj = {
      id : $scope.sessionid
    };
    console.log('In the Obj ', dataObj.id);
   
    $http.get('/api/v1/visualisations/getJsonFromFile/'+dataObj.id, dataObj)
      .success(function(alldata){
        $scope.alldata = alldata;
      })
      .error(function(error){
              console.log('Error: ', error);
      });
  };

  $scope.generateReport=(type)=>{
    console.log('seeVis session id:',$scope.sessionid);
    $scope.Divreport = $scope.Divreport = true;
    var infoReport = {};
    //console.log('seeVis rule id:',rulesID);

    //infoReport["rules"];
    //infoReport["feedback"];

    var dataObj = {
      id_session : $scope.sessionid
    };
    //get rules first
    $http.get('/api/v2/rules/all/'+$scope.sessionid)
    .success(function(data){
      $scope.sessionRules = data;
      $http.post('/api/v1/visualisations/getDataforVis',dataObj)
      .success(function(dataActions){
            //console.log(dataActions);
            // validate each rule
            
            infoReport['dataReport'] = [];
            //infoReport['FeedbackInfo'] =[];
            
            for (rule in data){
              let rulesInfo = {};
              //var feedbackInfo = {};
              rulesID = data[rule].id;
              //console.log('THIS IS WHAT IS BEEN PLOTED:',rulesID);  
              $http.get(`/api/v2/rules/selectOneRule/${rulesID}?id_session=${dataObj.id_session}`)
              .success(function(detailRule){
                rulesInfo['id']=detailRule[0].id;
                rulesInfo['name'] = detailRule[0].name;
                rulesInfo['rule'] = detailRule[0].first_action+ ' - ' + detailRule[0].value_of_mag+' - '+detailRule[0].second_action;
                //console.log('Rules Info: ', rulesInfo);
                //console.log('Info Report: ', infoReport);
                //console.log('Inside selectOneRule: ', detailRule[0].id, detailRule[0].name);
                //infoReport['InfoRule'].push(rulesInfo);
                //rulesInfo = {};
                const toSend = 
                {
                  actions: dataActions,
                  rule: detailRule
                };
                if (detailRule[0].magnitude=='Frequency'){
                  console.log('I am validating a freqency rule');
                  $http.post('/api/v2/rules/validateFrequencyRule/'+rulesID, toSend)
                  .success(function(objs) {
                    rulesInfo['id'] = detailRule[0].id;
                    rulesInfo['status'] = objs.status;
                    rulesInfo['mesage'] = objs.title;
                    infoReport['dataReport'].push(rulesInfo);
                  })
                  .error(function(error){
                      console.log('Error: ', error);
                  });

                }else{
                  $http.post('/api/v2/rules/validateRule/'+rulesID, toSend)
                  .success(function(objs) {
                    //$scope.forReport = objs;
                    //console.log('How to access status', objs);
                    rulesInfo['id'] = detailRule[0].id;
                    rulesInfo['status'] = objs.status;
                    rulesInfo['mesage'] = objs.title;
                    rulesInfo['type'] = type;
                    rulesInfo['resourseLink'] = './data/graphs/'+dataObj.id_session + '_' +detailRule[0].id + '.png'

                    // create a json file    
                    
                    infoReport['dataReport'].push(rulesInfo);
                    //console.log('Inside validateRule: ', detailRule[0].id, objs.title);
                    //rulesInfo = {};
                  })
                  .error(function(error){
                      console.log('Error: ', error);
                  });


                }               
                })
                .error(function(error){
                  console.log('Error: ', error);
                });   
               //$scope.infoReport = infoReport;
            }  // end for
      })
      .error(function(error){
        console.log('Error: ', error);
      });
      $scope.infoReport = infoReport;
      console.log('############', infoReport);
      //createHtml(infoReport);
    })
    .error(function(error){
      console.log('Error: ' + error);
    });
  };

  $scope.seeVis = (rulesID) => {
  //$scope.vis = true;
  //$location.path('/timeline/'+sessionID);
  console.log('seeVis session id:',$scope.sessionid);
  console.log('seeVis rule id:',rulesID);

    var dataObj = {
      id_session : $scope.sessionid,
      id_rule : rulesID
    };
    $http.post('/api/v1/visualisations/getDataforVis',dataObj)
      .success(function(dataActions){
          console.log(dataActions);
          //$scope.dataForVis = dataActions;
          $http.get(`/api/v2/rules/selectOneRule/${rulesID}`)
          .success(function(detailRule){
            //$scope.detailRule = detailRule;
            const toSend = 
            {
              actions: dataActions,
              rule: detailRule
            };
            $http.post('/api/v2/rules/validateRule/'+rulesID, toSend)
            .success(function(objs) {
              $scope.rulesVal = objs;
              console.log('I am in the nested call');
            })
            .error(function(error){
                console.log('Error: ', error);
            });
          })
          .error(function(error){
              console.log('Error: ', error);
          });
      })
      .error(function(error){
        console.log('Error: ', error);
      });
  };

});

app.controller('manageRules', function($window, $scope, $location, $routeParams, $http, socket){
  //This first line is to assure the session id in rules
  $scope.sessionid = $routeParams.id;
  $scope.formData = {};
  $scope.rulesData = {};
  $scope.typesRules = {};
  $scope.sessionRules = {};
  $scope.actions = {};
  $scope.selectedRoles = {};
  pathHelp = './img/Help'
  
  // GET ALL RULES OF A SESSION

  $http.get('/api/v2/rules/all/'+$scope.sessionid)
  .success(function(data){
    $scope.sessionRules = data;
  })
  .error(function(error){
    console.log('Error: ' + error);
  });

  //get all typeofRules=typesRules
  var dataObj = {
      id_session : $scope.sessionid,
      type : 'type'
  };
  //LIST ALL THE TYPE OF RULES
 $http.get('/api/v2/rules/types', dataObj)
  .success(function(typeR){
    $scope.typeRules = typeR;
  })
  .error(function(error){
    console.log('Error: ' + error);
  });

  //LIST ALL ACTIONS OF A SESSION
  $http.get('/api/v2/rules/actions/'+$scope.sessionid)
  .success(function(objs){
    $scope.actions = objs;
    //console.log('The session id here in actions: ', $scope.sessionid);
  })
  .error(function(error){
    console.log('Error: ' + error);
  });
  //LIST OF ROLES

  $http.get('/api/v2/rules/roles/'+$scope.sessionid)
    .success(function(objs){
      $scope.roles = objs;
      console.log('Is bringing the roles ',$scope.roles);
    })
    .error(function(error){
      console.log('Error: ' + error);
  });

  //PREVIEW RULES
  $scope.seeRule = (idRule) => {
    $scope.editingRules = $scope.editingRules = true;
    const dataObj = {
      id_session : $scope.sessionid,
      id_rule : idRule
    };
    $http.get(`/api/v2/rules/selectOneRule/${idRule}?id_session=${$scope.sessionid}`)
    .success((detailRule) => {
      $scope.detailRule = detailRule;
      $scope.sessionid=dataObj.id_session;
    })
    .error((data) => {
      console.log('Error: ' + data);
    });
  };

  //EDIT RULES
  $scope.editRule = (idRule, name, value_of_mag, feedback_wrong, feedback_ok) => {
    const dataObj = {
      id_session : $scope.sessionid,
      id_rule : idRule,
      name : name,
      value_of_mag : value_of_mag,
      feedback_wrong : feedback_wrong,
      feedback_ok : feedback_ok
    };
    console.log('Value of magnitude', value_of_mag);
    $http.post(`/api/v2/rules/editRule/${idRule}?id_session=${$scope.sessionid}`, dataObj)
    .success((detailRule) => {
      $scope.detailRule = detailRule;
      $scope.sessionid=dataObj.id_session;
      //$scope.name = detailRule[0].name;
    })
    .error((data) => {
      console.log('Error: ' + data);
    });
  };

  //function to show input
  $scope.ShowInput = function(){
      $scope.IsVisible = $scope.IsVisible = true;
      $scope.Help = $scope.Help = false;
  };

  //HELP

  $scope.showPopover = function(){
    $scope.HelpImage = $scope.HelpImage = true;

      if($scope.typeRule==1){
        $scope.path=pathHelp +'1.png';
      }
      if($scope.typeRule==2){
        $scope.path=pathHelp +'2.png';
      }
      if($scope.typeRule==3){
        $scope.path=pathHelp +'3.png';
      }
      if($scope.typeRule==5){
        $scope.path=pathHelp +'5.png';
      }
  };

  $scope.hidePopover = function(){
    $scope.HelpImage = $scope.HelpImage = false;
    $scope.HelpImage='';
    $scope.path='';
  };

    //function Roles
  $scope.valType = function(optionTrack){

    console.log(optionTrack);
    if (optionTrack==1) {
      console.log('All will be tracked a full social network graph will be generated');
      $scope.selectedRole = $scope.selectedRole = '';
      $scope.rolesDiv = $scope.rolesDiv = false;
    }
    if (optionTrack==2) {
      $scope.rolesDiv = $scope.rolesDiv = true;
      console.log('Ego network');
    } 
    else{
      $scope.selectedRole = $scope.selectedRole = '';
      $scope.rolesDiv = $scope.rolesDiv = false;
    }
  };

  //FUNCTION TO SHOW FORM ACCORDING TO THE TYPE OF RULE that has been selected
  $scope.ShowInputTime = function(type){
      $scope.ShowSecond = $scope.ShowSecond = true;
      console.log(type);
      $scope.IsVisibleTime = $scope.IsVisibleTime = true;
      $scope.Help = $scope.Help = true;
      $scope.typeRule=type;
      if (type==2) {
        $scope.causalityR = $scope.causalityR = false;
        $scope.frequencyR = $scope.frequencyR = false;
        $scope.timeR = $scope.timeR = true;
        $scope.proximity = $scope.proximity = false;
      }
      //Rules based on sequence
      if (type==1) {
        $scope.timeR = $scope.timeR = false;
        $scope.causalityR = $scope.causalityR = true;
        $scope.frequencyR = $scope.frequencyR = false;
        $scope.proximity = $scope.proximity = false;
       
      }
      //Rules based on frequency
      if (type==3) {
        $scope.timeR = $scope.timeR = false;
        $scope.causalityR = $scope.causalityR = false;
        $scope.frequencyR = $scope.frequencyR = true;
        $scope.ShowSecond = $scope.ShowSecond = false;
        $scope.proximity = $scope.proximity = false;
      }
      if(type==5){
        $scope.proximity = $scope.proximity = true;
        $scope.ShowSecond = $scope.ShowSecond = true;
        $scope.frequencyR = $scope.frequencyR = false;
        $scope.causalityR = $scope.causalityR = false;
        $scope.ShowSecond = $scope.ShowSecond = true;
        $scope.timeR = $scope.timeR = false;

      }
  };

  //ADD NEW RULE
  $scope.AddNewRule = function(type, first, causality, second){
    console.log('Which value?? ',$scope.selectedRole);
    var magnitude = "";
    var value = '';
    if(causality == 1){causality = 'After'}
    if(causality == 2){causality = 'Before'}
    if(type == 1){magnitude='Sequence'; value = causality}
    if(type == 2){magnitude='Time'; value = $scope.TimeFrame}
    if(type == 3){magnitude='Frequency'; value = $scope.Frequency}
    if(type == 5 && $scope.optionTrack==2){magnitude='Proximity'; value = $scope.selectedRole}
    if(type == 5 && $scope.optionTrack==1){magnitude='Proximity'; value = 'All'}
    if(type == 5 && $scope.optionTrack==3){magnitude='Proximity'; value = 'Priority'}

    const dataObjRule = {
      typeRule : type,
      sessionid : $scope.sessionid,
      name : $scope.Name,
      firstAction : first,
      secondAction : second,
      magnitude : magnitude,
      value : value,
      feedbackCorrect: $scope.inputIfCorrect,
      feedbackWrong: $scope.inputIfWrong
    };
  //console.log(dataObjRule);
  //insert new rule
    $http.post('/api/v2/rules/addRule/', dataObjRule)
    .success(function(allrules){
      $scope.IsVisible = false;
      $scope.IsVisibleTime = false;
      $scope.Name = '';
      $scope.TimeFrame = '';
      $scope.Frequency = '';
      $scope.inputIfCorrect = '';
      $scope.inputIfWrong = '';
      $scope.selectedFirst = '';
      $scope.selectedSecond = '';
      $scope.causality = '';
      $scope.sessionRules = allrules;
      $scope.optionTrack = '';
      $scope.selectedRole = ''
    })
    .error(function(error){
      console.log('Error: ' + error);
    });
  };

  //EDIT RULES
  //TO DO

  //DELETE RULES
  $scope.deleteRule = (idRule) => {
    
    const dataObj = {
      id_session : $scope.sessionid,
      id_rule : idRule
    };
    $http.post('/api/v2/rules/delete/', dataObj)
    .success((allRules) => {
      $scope.sessionRules = allRules;
    })
    .error((data) => {
      console.log('Error: ' + data);
    });
  };

  // VISUALISE THE TIMELINE

  $scope.seeTimeline = ()=>{

    $scope.timeline = true;
    console.log('In the app.js ', $scope.sessionid);
    //var id_session = parseInt(current_url.split("/").slice(-1));
    //console.log('In the app.js ', $scope.sessionid, id_session);
    //id = $scope.sessionid;
    var dataObj = {
      id : $scope.sessionid
    };
    console.log('In the Obj ', dataObj.id);
   
    $http.get('/api/v1/visualisations/getJsonFromFile/'+dataObj.id, dataObj)
      .success(function(alldata){
        $scope.alldata = alldata;
      })
      .error(function(error){
              console.log('Error: ', error);
      });
  };

  //console.log('here we are');
  $scope.endSession = () =>{
    var dataObj = {
        id_session : $scope.sessionid
    };
    $http.post('/api/v1/sessions/stop', dataObj)
    .success(function(data){
      $location.path('/');
      console.log(data);
      $scope.sourceSession = data;
    })
    .error((error) => {
      console.log('Error: ' + error);
    });
  };
});

app.controller('manageVis', function($scope, $location, $routeParams, $http, socket) {
  $scope.sessionid = $routeParams.id;
  $scope.nparticipants = 0;
  var containers = [];
  var actionRules = [];
  var positioningRules = [];
  var otherRules=[];

  //GET ALL RULES OF A SESSION
  $http.get('/api/v2/rules/all/'+$scope.sessionid)
  .success(function(data){

    //$scope.sessionRules = data;
    console.log('This is the data: ',data);
    for(var i=0; i< data.length; i++){
      console.log('Magnitude of the rule: ', data[i].magnitude);
      if(data[i].magnitude == 'Sequence' || data[i].magnitude == 'Time'|| data[i].magnitude == 'Frequency'){
        actionRules.push(data[i]);
      }
      if(data[i].magnitude == 'Proximity'){
        positioningRules.push(data[i]);
      }
      else if(data[i].magnitude == 'Frequency'){
        otherRules.push(data[i]);
      }
    }
    $scope.actionrules = actionRules;
    $scope.positioningrules = positioningRules;
    $scope.othergrules = otherRules;
    //$scope.sessionRules =data;
    //$window.location.href='http://localhost:3000/timeline/'+sessionID;
  })
  .error(function(error){
    console.log('Error: ' + error);
  });
  
  //from here
  $scope.timeline = true;
  console.log('In the app.js session id: ', $scope.sessionid);
  var dataObj1 = {
    id : $scope.sessionid
  };
  console.log('In the Obj ', dataObj1.id);

  var dataObj = {
    id_session : $scope.sessionid
  };
  $http.post('/api/v1/visualisations/getDataforVis',dataObj)
    .success(function(data){
      $http.post('/api/v1/visualisations/generateJson2', data)
      .success(function(objs){
        $http.get('/api/v1/visualisations/getJsonFromFile/'+dataObj1.id, dataObj1)
          .success(function(alldata){
            $scope.alldata = alldata;
          })
          .error(function(error){
            console.log('Error: ', error);
          });
      })
      .error(function(error){
        console.log('Error: ' + error);
      });
  })
  .error(function(error){
    console.log('Error: ' + error);
  });
  // to this point

  $scope.seeVis = (rulesID) => {
  //$scope.vis = true;
  //$location.path('/timeline/'+sessionID);
  console.log('seeVis session id:',$scope.sessionid);
  console.log('seeVis rule id:',rulesID);

    var dataObj = {
      id_session : $scope.sessionid,
      id_rule : rulesID
    };
    console.log('####### HERE: ',$scope)

    $http.post('/api/v1/visualisations/getDataforVis',dataObj)
      .success(function(dataActions){
          console.log(dataActions);
          //$scope.dataForVis = dataActions;
          $http.get(`/api/v2/rules/selectOneRule/${rulesID}?id_session=${dataObj.id_session}`)
          .success(function(detailRule){
            //$scope.detailRule = detailRule;
            const toSend = 
            {
              actions: dataActions,
              rule: detailRule
            };
            
            if (detailRule[0].magnitude=='Frequency'){
              console.log('I am validating a freqency rule');
              $http.post('/api/v2/rules/validateFrequencyRule/'+rulesID, toSend)
              .success(function(objs) {
                $scope.rulesVal = objs;
                console.log('I am in the nested call');
              })
              .error(function(error){
                  console.log('Error: ', error);
              });

            }else{
              $http.post('/api/v2/rules/validateRule/'+rulesID, toSend)
              .success(function(objs) {
                $scope.rulesVal = objs;
                console.log('I am in the nested call');
              })
              .error(function(error){
                  console.log('Error: ', error);
              });
            }

          })
          .error(function(error){
              console.log('Error: ', error);
          });
      })
      .error(function(error){
        console.log('Error: ', error);
      });
  };

  //create the networks according to  the data
  $scope.createNetwork = (idRule,  typeOfRule)  =>{
    console.log('Session for network: ',$scope.sessionid);
    console.log('Rule for network: ', idRule);
    console.log('Type of rule ', typeOfRule);

    // if(typeOfRule=='Priority'){
    //   //GET BARCHAR
    //   $http.get(`/api/v1/visualisations/createBarChar/${idRule}?id_session=${$scope.sessionid}`)
    //   .success(function(data){
    //     //$scope.sessionRules = data;

    //   })
    //   .error(function(error){
    //     console.log('Error: ' + error);
    //   });
    // }
    
    //GET GRAPH
    $http.get(`/api/v1/visualisations/bringGraph/${idRule}?id_session=${$scope.sessionid}`)
    .success(function(data){

      if(data.error!=0 || data.messageError!="none"){
        window.alert('There was an error generating the graph, please try later: '+ data.messageError);
      }else{
        //$scope.sessionRules = data;
        //$http.get('path/to/service', {timeout: 5000});
        $scope.graph = $scope.graph = true;
        $scope.textgraph = data.rule[0].first_action + '  -  ' + data.rule[0].second_action;
        $scope.graphPath = data.path;
        message = '<span>'+ data.message + '</span>';
        //const parser = new DOMParser();
        //message = parser.parseFromString(message, 'text/html');
        console.log('This is parsed', message);
        //console.log('Parser', parser)
        $scope.myFeedback = message;
      }

    })
    .error(function(error){
      console.log('Error: ' + error);
    });
  };

}); //close manageVis controller

app.controller('visController', function($scope, $location, $routeParams, $http, socket) {
  $scope.sessionid = $routeParams.id;
  $scope.nparticipants = 0;
  var containers = [];

  wrapper = document.getElementById('timelines');
  var dataObj = {
        id_session : $scope.sessionid
    };
  $http.post('/api/v1/visualisations/getDataforVis',dataObj)
      .success(function(data){
          $http.post('/api/v1/visualisations/generateJson', data)
          .success(function(objs){
              //$scope.nparticipants = objs.n; 
            //$scope.selectedactions = objs;
            //$location.path('/timelines.html');
          })
          .error(function(error){
            console.log('Error: ' + error);
          });
      })
      .error(function(error){
        console.log('Error: ' + error);
      });
});

app.controller('sessionController', function($scope, $location, $routeParams, $http, socket) {
  $scope.formData = {};
  $scope.sessionData = {};
  // Create a new session
  $scope.createSession = function(){
    $http.post('/api/v1/sessions/create', $scope.formData)
    .success(function(data){
      $scope.formData = {};
      $scope.sessionData = data;
      console.log(data.id);
      $location.path('/actions/'+data.id);
    })
    .error((error) => {
      console.log('Error: ' + error);
    });
  };
  // Delete a todo
  $scope.deleteSession = (sessionID) => {
    $http.delete('/api/v1/session/delete' + sessionID)
    .success((data) => {
      $scope.todoData = data;
      console.log(data);
    })
    .error((data) => {
      console.log('Error: ' + data);
    });
  };

});

app.controller('actionsController', function($window, $scope, $location, $route, $routeParams, $http, socket) {
  $scope.actionData = {};
  $scope.objectData = {};
  $scope.selectedactions = {}
  $scope.sessionid = $routeParams.id;
  $scope.fNotes = [];

  var dataObj = {
        id_session : $scope.sessionid
    };
  
  //get all actions that were selected to this session
  $http.post('/api/v1/actions/allactionssession/', dataObj)
  .success(function(actionspersession){
    $scope.actionData = actionspersession;
    console.log(actionspersession);
  })
  .error(function(error){
    console.log('Error: ' + error);
  });

  //this gets all actions that has an object associated (has been logged by user)
  $http.post('/api/v1/actions/actionswithobjects', dataObj)
  .success(function(objs){
    $scope.selectedactions = objs;
    console.log(objs);
  })
  .error(function(error){
    console.log('Error: ' + error);
  });
  //getStudentsperSession
  $http.get('/api/v1/objects/studentsession/'+$scope.sessionid)
  .success(function(objs){
    $scope.objectData = objs;
  })
  .error(function(error){
    console.log('Error: ' + error);
  });


  $scope.logActionObject = function(objID,actsessionID,actID,actDesc){
    
    const dataObj = {
        id_session : $scope.sessionid,
        id_object : objID,
        id_action: actID,
        id_actionsession : actsessionID,
        desc: actDesc
    };
    //console.log(dataObj);
    //add action-session-object
    $http.post('/api/v1/actions/addactionsectionobject', dataObj )
        .success(function(data){
          $scope.selectedactions = data;
          console.log(data);
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

  };//end log

  $scope.logStartStopActionSession = function(actID,actDesc){
    
    const dataObj = {
        id_session : $scope.sessionid,
        id_action: actID,
        desc: actDesc
    };
    console.log('$$$$$$ ',dataObj);
    //add action-session-object
    $http.post('/api/v1/actions/addstartstopaction', dataObj)
        .success(function(data){
          if(data.error!=''){
            window.alert("An error ocurred, please try later: " + data.error);
          }
          $scope.selectedactions = data.results;
          //window.alert("All works properly: " + data.error);
        })
        .error((error) => {
          console.log('Error: ' + data.error);
        });

  };//end log

  $scope.deleteActionObject = function(actID){
    
    const dataObj = {
        id_session : $scope.sessionid,
        id_actionsessionobject : actID      
      };
    //console.log(dataObj);
    $http.post('/api/v1/actions/deleteactionobject', dataObj )
        .success(function(data){
          $scope.selectedactions = data;
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

  };//end delete

  $scope.updateNotes=function(actSessObjID){
        
        //alert()

        const dataObj = {
        notes : $scope.fNotes[actSessObjID],
        id_actionsessionobject : actSessObjID      
      };
      //console.log(dataObj);
        //update action session object with notes
      $http.post('/api/v1/actions/updatenotes', dataObj )
        .success(function(data){
          //$scope.selectedactions = data;
          //console.log(data);
              $http.post('/api/v1/actions/getnotebyid', dataObj )
            .success(function(data){
              //$scope.selectedactions = data;
              console.log(data)
              $scope.fNotes[actSessObjID] = data.notes;
            })
            .error((error) => {
              console.log('Error: ' + error);
           });
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

  }; //end update note

  $scope.getNote=function(actSessObjID){
        
        //alert()

        const dataObj = {
        id_actionsessionobject : actSessObjID      
      };
      //console.log(dataObj);
        //get note 
      $http.post('/api/v1/actions/getnotebyid', dataObj )
        .success(function(data){
          //$scope.selectedactions = data;
          console.log(data)
          $scope.fNotes[actSessObjID] = data.notes;
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

  }; //end get name

//draw timeline
  $scope.redirectTimeline = function(sessionID) {
    
    //$location.path('/timeline/'+sessionID);
    var dataObj = {
        id_session : sessionID
    };
    $http.post('/api/v1/visualisations/getDataforVis',dataObj)
      .success(function(data){
        console.log(data);
          $http.post('/api/v1/visualisations/generateJson2', data)
          .success(function(objs){
              //$scope.nparticipants = objs.n; 
            //$scope.selectedactions = objs;
            console.log('http://localhost:3000/timeline/'+sessionID);
            $window.location.href='http://localhost:3000/timeline/'+sessionID;
          })
          .error(function(error){
            console.log('Error: ' + error);
          });
      })
      .error(function(error){
        console.log('Error: ' + error);
      });
  };//end function
  
});//end controller

app.controller('mediaController', function($scope, $location, $routeParams, $http) {
  $scope.sourceSession = {};
  $scope.sourceData = {};
  $scope.trackers_empatica = {};
  $scope.sessionid = $routeParams.id;
  // Get all sessions
  $http.get('/api/v1/media/all')
  .success(function(data){
    $scope.sourceData = data;
  })
  .error(function(error){
    console.log('Error: ' + error);
  });
  //get all sources by session
  $http.get('/api/v1/media/datasession/'+$scope.sessionid)
  .success(function(datapersession){
    $scope.sourceSession = datapersession;
  })
  .error(function(error){
    console.log('Error: ' + error);
  });

//get all trackers=empatica serials
  $http.get('/api/v1/objects/trackers/'+'empatica')
    .success(function(tracker){
      $scope.trackers_empatica = tracker;
      //console.log($scope.trackers_empatica);
    })
    .error(function(error){
      console.log('Error: ' + error);
    });

// add source media to database
  $scope.addSourceMedia = function(sourceId, sourceName){
    console.log(sourceId);

    var id_source_session = 0;
    var dataObj = {
        id_session : $scope.sessionid,
        id_datatype : sourceId
    };

    $http.post('/api/v1/media/datasession', dataObj )
    .success(function(data){
    if(data.length == 0){
      id_source_session = 1;
      }
      else{
        id_source_session = data.length+1;
      }
          //console.log(id_source_session);

      dataObj = {
              id_session : $scope.sessionid,
              id_datatype : sourceId,
              id_datatype_session : id_source_session,
              name : sourceName+'-'+id_source_session
          };
      $http.post('/api/v1/media/addsourceSession', dataObj )
        .success(function(data){
        $scope.sourceSession = data;
        id_source_session = 0;
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

    })
    .error((error) => {
      console.log('Error: ' + error);
    });    
    };

  //redirect to assign Objects to session
  $scope.assignObjects = function() {
    $location.path('/objects/'+$scope.sessionid);
  };

  //added 30-04-2019
  $scope.deleteSourceSession = function(datatypeID, sessionDatatypeID){
    
    const dataObj = {
        id_session : $scope.sessionid,
        id_datatype : datatypeID,
        id_session_datatype: sessionDatatypeID
      };
    //console.log(dataObj);
    $http.post('/api/v1/media/deletesourcesession', dataObj )
        .success(function(data){
          $scope.sourceSession = data;
          //console.log(data);
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

  };//end log

  $scope.updateWristbandDatatypeSession = function(sessionDatatypeID,item){
    //alert(item);
    var dataObj = {
        id_session : $scope.sessionid,
        id_datatype : 3,
        id_session_datatype : sessionDatatypeID,
        serial : item
    };

     $http.post('/api/v1/media/updateempatica', dataObj )
        .success(function(data){
        //$scope.objectsperSessionData = data;
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

  };//end updatewristband

}); //end controller

app.controller('objectsController', function($scope, $location, $routeParams, $http) {
  $scope.objectsData = {};
  $scope.objectsperSessionData = {};
  $scope.trackers_pozyx = {};
  $scope.trackers_empatica = {};
  $scope.sessionid = $routeParams.id;
  $scope.fObjectName = [];
  // Get all objects
  $http.get('/api/v1/objects/all')
  .success(function(data){
    $scope.objectsData = data;
  })
  .error(function(error){
    console.log('Error: ' + error);
  });
  //get all objects per session
  $http.get('/api/v1/objects/objectsession/'+$scope.sessionid)
  .success(function(datapersession){
    $scope.objectsperSessionData = datapersession;

    //$scope.x=datapersession.coordinates.split(',')[0];
    console.log('Session objects: ',datapersession)
  })
  .error(function(error){
    console.log('Error: ' + error);
  });

  //get all trackers=pozyx serials
   var dataObj = {
        id_session : $scope.sessionid,
        type : 'pozyx'
    };
  $http.post('/api/v1/objects/trackers/', dataObj)
    .success(function(tracker){
      $scope.trackers_pozyx = tracker;
      //console.log($scope.trackers_pozyx);
    })
    .error(function(error){
      console.log('Error: ' + error);
    });

//get all trackers=empatica serials
  var dataObj = {
        id_session : $scope.sessionid,
        type : 'empatica'
    };
  $http.post('/api/v1/objects/trackers/',dataObj)
    .success(function(tracker){
      $scope.trackers_empatica = tracker;
      //console.log($scope.trackers_empatica);
    })
    .error(function(error){
      console.log('Error: ' + error);
    });

// add source media to database
  $scope.addObjectSession = function(objId, objName){
    console.log(objId);
    var dataObj = {
        id_session : $scope.sessionid,
        id_obj : objId,
        name : objName
    };
    $http.post('/api/v1/objects/countobjssession', dataObj )
    .success(function(objNname){
       dataObj.name = objNname;

       $http.post('/api/v1/objects/addobjsession', dataObj )
        .success(function(datapersession){
           $scope.objectsperSessionData = datapersession;
        })
        .error((error) => {
          console.log('Error: ' + error);
        }); 

    })
    .error((error) => {
      console.log('Error: ' + error);
    }); 
   
    };

  $scope.updateTagObjSession = function(objsId,item){
    //alert(item);
    var dataObj = {
        id_session : $scope.sessionid,
        id_objs : objsId,
        serial : item,
        type: 'pozyx'
    };

     $http.post('/api/v1/objects/updateserial', dataObj )
        .success(function(data){
        //$scope.objectsperSessionData = data;
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

  };//end update

  $scope.updateWristbandObjSession = function(objsId,item){
    //alert(item);
    var dataObj = {
        id_session : $scope.sessionid,
        id_objs : objsId,
        serial : item,
        type: 'empatica'
    };

     $http.post('/api/v1/objects/updateserial', dataObj )
        .success(function(data){
        //$scope.objectsperSessionData = data;
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

  };//end updatewristband

//added 30-04-2019
$scope.updateObjectName = function(objsId){
    //alert(item);
    var dataObj = {
        id_session : $scope.sessionid,
        id_objsession : objsId,
        newname: $scope.fObjectName[objsId]
      };

     $http.post('/api/v1/objects/updateobjname', dataObj )
        .success(function(data){
        $scope.objectsperSessionData = data;
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

  };//end updateObjectName

  $scope.addFixedCoordinates = function(objsId, coordinates){
    //alert(item);
    console.log(coordinates);
    var dataObj = {
        id_session : $scope.sessionid,
        id_objsession : objsId,
        coordinates: coordinates
      };

     $http.post('/api/v1/objects/updateobjcoordinates', dataObj )
        .success(function(data){
        $scope.objectsperSessionData = data;

        })
        .error((error) => {
          console.log('Error: ' + error);
        });

  };//end updateObjectName

//added 30-04-2019
  $scope.deleteObjectSession = function(objSessID){
    
    const dataObj = {
        id_session : $scope.sessionid,
        id_objectsession : objSessID
      };
    //console.log(dataObj);
    $http.post('/api/v1/objects/deleteobjectsession', dataObj )
        .success(function(data){
          $scope.objectsperSessionData = data;
          //console.log(data);
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

  };//end log


  $scope.controlSources = function() {
    $location.path('/manage/'+$scope.sessionid);
  };
}); //end controller

app.controller('manageSourcesController', function($scope, $location, $routeParams, $http, socket) {
  $scope.sourceSession = {}
  $scope.sessionid = $routeParams.id;
  //get all sources by session
  $http.get('/api/v1/media/datasession/'+$scope.sessionid)
  .success(function(datapersession){
    $scope.sourceSession = datapersession;
      //console.log(datapersession);
  })
  .error(function(error){
    console.log('Error: ' + error);
  });



///To this point
  $scope.startCapture = function(sessionId, datatypeId, datasessionId){
    var dataObj = {
        id_session : sessionId,
        id_datatype : datatypeId,
        id_datatype_session: datasessionId,
        status : 1
    };
    //if datatypeId is pozyx
    if(datatypeId == 1){

      $http.post('/api/v1/media/updateSourceSession', dataObj )
        .success(function(data){
        console.log(data);
        $scope.sourceSession = data;
           /* $http.post('api/v1/location/startLocationCapture', {id_session:sessionId})
            .success(function(){
              })
              .error((error) => {
                console.log('Error: ' + error);
              });*/
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

      }//end if
      else if(datatypeId == 4){
        console.log('manikin');
      $http.post('/api/v1/media/updateSourceSession', dataObj )
        .success(function(data){
        console.log(data);
        $scope.sourceSession = data;
            $http.post('api/v1/actions/startActionsCapture', {id_session:sessionId})
            .success(function(){
              })
              .error((error) => {
                console.log('Error: ' + error);
              });
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

      }//end if

    else{
      $http.post('/api/v1/media/updateSourceSession', dataObj )
      .success(function(data){
      console.log(data);
      $scope.sourceSession = data;
      })
      .error((error) => {
        console.log('Error: ' + error);
      });
    } //end else
  };

  $scope.stopCapture = function(sessionId, datatypeId, datasessionId){
    var dataObj = {
        id_session : sessionId,
        id_datatype : datatypeId,
        id_datatype_session: datasessionId,
        status : 0
    };
    //datatypeId == 1 - pozyx
    if(datatypeId == 1){
      
      $http.post('/api/v1/media/updateSourceSession', dataObj )
          .success(function(data){
          console.log(data);
          $scope.sourceSession = data;
          /*
              $http.post('api/v1/location/stopLocationCapture', {id_session:sessionId})
              .success(function(data){
                console.log(data);
                  //$scope.sourceSession = data;
                  
                })
                .error((error) => {
                  console.log('Error: ' + error);
                });*/
          })
          .error((error) => {
            console.log('Error: ' + error);
          });
   }//end if
   else if(datatypeId == 4){
      
      $http.post('/api/v1/media/updateSourceSession', dataObj )
          .success(function(data){
          //console.log(data);
          $scope.sourceSession = data;

              $http.post('api/v1/actions/stopActionsCapture', {id_session:sessionId})
              .success(function(data){
                console.log(data);
                  //$scope.sourceSession = data;
                  
                })
                .error((error) => {
                  console.log('Error: ' + error);
                });
          })
          .error((error) => {
            console.log('Error: ' + error);
          });
    }//end if
    else{
    $http.post('/api/v1/media/updateSourceSession', dataObj )
    .success(function(data){
    //console.log(data);
    $scope.sourceSession = data;
    })
    .error((error) => {
      console.log('Error: ' + error);
    });
  } //end else
  };

$scope.startAll = function(sessionId) {

    console.log("start all");
    var oReqBio = new XMLHttpRequest();
    oReqBio.open('GET', 'http://localhost:7301/bio/start/' + sessionId, true);
    oReqBio.setRequestHeader("Access-Control-Allow-Origin", "http://localhost");
    oReqBio.send();
    oReqBio.onreadystatechange = function () {
        if (oReqBio.readyState === 4 && oReqBio.status === 200) {
            console.log(oReqBio.responseText);
        }
    };

    var oReqPos = new XMLHttpRequest();
    oReqPos.open('GET', 'http://localhost:7201/pos/start/' + sessionId, true);
    oReqPos.setRequestHeader("Access-Control-Allow-Origin", "http://localhost");
    oReqPos.send();
    oReqPos.onreadystatechange = function () {
        if (oReqPos.readyState === 4 && oReqPos.status === 200) {
            console.log(oReqPos.responseText);
        }
    };
    var oReqAudio = new XMLHttpRequest();
    oReqAudio.open('GET', 'http://localhost:7501/audio/start/' + sessionId, true);
    oReqAudio.setRequestHeader("Access-Control-Allow-Origin", "http://localhost");
    oReqAudio.send();
    oReqAudio.onreadystatechange = function () {
        if (oReqAudio.readyState === 4 && oReqAudio.status === 200) {
            console.log(oReqAudio.responseText);
        }
    };

    var oReqVideo = new XMLHttpRequest();
    oReqVideo.open('GET', 'http://localhost:7101/video/start/' + sessionId, true);
    oReqVideo.setRequestHeader("Access-Control-Allow-Origin", "http://localhost");
    oReqVideo.send();
    oReqVideo.onreadystatechange = function () {
        if (oReqVideo.readyState === 4 && oReqVideo.status === 200) {
            console.log(oReqVideo.responseText);
        }
    };

    console.log("recording start");
};

$scope.stopAll = function(sessionId) {
    console.log("recording stop");

    var oReqVideo = new XMLHttpRequest();
    oReqVideo.open('GET', 'http://localhost:7101/video/stop', true);
    oReqVideo.setRequestHeader("Access-Control-Allow-Origin", "http://localhost");
    oReqVideo.send();
    oReqVideo.onreadystatechange = function () {
        if (oReqVideo.readyState === 4 && oReqVideo.status === 200) {
            console.log(oReqVideo.responseText);
        }
    };

    var oReqPos = new XMLHttpRequest();
    oReqPos.open('GET', 'http://localhost:7201/pos/stop', true);
    oReqPos.setRequestHeader("Access-Control-Allow-Origin", "http://localhost");
    oReqPos.send();
    oReqPos.onreadystatechange = function () {
        if (oReqPos.readyState === 4 && oReqPos.status === 200) {
            console.log(oReqPos.responseText);
        }
    };
    var oReqBio = new XMLHttpRequest();
    oReqBio.open('GET', 'http://localhost:7301/bio/stop', true);
    oReqBio.setRequestHeader("Access-Control-Allow-Origin", "http://localhost");
    oReqBio.send();
    oReqBio.onreadystatechange = function () {
        if (oReqBio.readyState === 4 && oReqBio.status === 200) {
            console.log(oReqBio.responseText);
        }
    };

    var oReqAudio = new XMLHttpRequest();
    oReqAudio.open('GET', 'http://49.127.:7501/audio/stop', true);
    oReqAudio.setRequestHeader("Access-Control-Allow-Origin", "http://localhost");
    oReqAudio.send();
    oReqAudio.onreadystatechange = function () {
        if (oReqAudio.readyState === 4 && oReqAudio.status === 200) {
            console.log(oReqAudio.responseText);
        }
    };

};


  // $scope.endSession = function(){
  //   var dataObj = {
  //       id_session : $scope.sessionid,
  //   };

  //   $http.post('/api/v1/sessions/stop', dataObj )
  //   .success(function(data){
  //   console.log(data);
  //   $scope.sourceSession = data;
  //   })
  //   .error((error) => {
  //     console.log('Error: ' + error);
  //   });
  //   $location.path('/');
  //   };

}); //end controller

app.controller('actionsessionController', function($scope, $location, $routeParams, $http) {
  $scope.addedActions = {};
  $scope.actionData = {};
  $scope.sessionid = $routeParams.id;
  $scope.IsVisible = false;
  $scope.inputActionName = '';
  $scope.inputActionType = false;

  //function to show input
  $scope.ShowInput = function(){
            $scope.IsVisible = $scope.IsVisible = true;
        }
  //function to add a new action to the list
  $scope.AddNewAction = function(){
      var type = 'event';
      if($scope.inputActionType == true){type='critical'}
      const dataObjAction = {
        newactionname: $scope.inputActionName,
        newactiontype: type
        };
    //console.log(dataObjAction);
    //insert new action
    $http.post('/api/v1/actions/newaction/', dataObjAction)
    .success(function(allactions){
      $scope.actionData = allactions;
      $scope.IsVisible = false;
      $scope.inputActionName = '';
      $scope.inputActionType = false;
      //console.log(allactions);
    })
    .error(function(error){
      console.log('Error: ' + error);
    });
  }
  

  //get all actions
  $http.get('/api/v1/actions/all')
  .success(function(objs){
    $scope.actionData = objs;
    console.log(objs);
  })
  .error(function(error){
    console.log('Error: ' + error);
  });


  var dataObj = {
        id_session : $scope.sessionid,
    };
  //get all actions per session
  $http.post('/api/v1/actions/allactionssession/', dataObj)
  .success(function(actionspersession){
    $scope.addedActions = actionspersession;
    console.log(actionspersession);
  })
  .error(function(error){
    console.log('Error: ' + error);
  });

// associate selected actions per session
  $scope.addActionToSession = function(actionId, actionName){
    console.log(actionId);
   
    var dataObj = {
        id_session : parseInt($scope.sessionid),
        id_action : actionId,
        action_name: actionName
    };

    
    $http.post('/api/v1/actions/actionsessionexists', dataObj )
    .success(function(data){ 
      if(data==0){
       
        $http.post('/api/v1/actions/addactiontothissession', dataObj )
        .success(function(data2){
          
          $scope.addedActions = data2;
           console.log(data2);
        })
        .error((error) => {
          console.log('Error: ' + error);
        }); 
       }//end if

       else{
        window.alert("This action was already added to the session");
       }
    })
    .error((error) => {
      console.log('Error: ' + error);
    });   

  };//end scope

    //added 1-05-2019
     $scope.deleteAction = function(actID){
    
    const dataObj = {
        id_session : $scope.sessionid,
        id_action : actID      
      };
    //console.log(dataObj);
    $http.post('/api/v1/actions/deleteaction', dataObj )
        .success(function(data){
          if(data.error!=''){
            window.alert('An error ocurred: ' + data.error);
          }
          $scope.actionData = data.results;
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

  };//end delete

    $scope.deleteActionSession = function(actsessionID){
    
    const dataObj = {
        id_session : $scope.sessionid,
        id_actionsession : actsessionID
      };
    //console.log(dataObj);
    $http.post('/api/v1/actions/deleteactionsession', dataObj )
        .success(function(data){
          $scope.addedActions = data;
          console.log(data);
        })
        .error((error) => {
          console.log('Error: ' + error);
        });

  };//end log
  //redirect to assign Objects to session
  $scope.assignDataSources = function() {
    //$location.path('/objects/'+$scope.sessionid);
    $location.path('/media/'+$scope.sessionid);
  };
  // //redirect to assign Objects to session
  // $scope.assignObjects = function() {
  //   $location.path('/objects/'+$scope.sessionid);
  // };
    // List actions
  $scope.listRules = function(sessionID){
    //alert(sessionID);
    $location.url('/rules');
  };

}); //end controller