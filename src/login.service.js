(function () {
  'use strict';

  angular.module('ng-sal').factory('loginService', loginService);

  loginService.$inject = ['$resource', 'authService', '$rootScope', 'ngsalConfig'];

  function loginService ($resource, authService, $rootScope, ngsalConfig) {
      var service = $resource('/' + ngsalConfig.applicationName + '/api/' + ngsalConfig.apiVersion + '/authentication', {
          'username': '@username',
          'password': '@password'
      }, {
          'login': {
              method: 'POST',
              isArray: false,
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              ignoreAuthModule: 'ignoreAuthModule'
          },
          'logoutApi': {
              method: 'GET',
              url: '/' + ngsalConfig.applicationName + '/api/' + ngsalConfig.apiVersion + '/logout',
              isArray: true,
              ignoreAuthModule: 'ignoreAuthModule'
          },
          'authenticate': {
              method: 'GET',
              url: '/' + ngsalConfig.applicationName + '/api/' + ngsalConfig.apiVersion + '/authenticate',
              isArray: false,
              ignoreAuthModule: 'ignoreAuthModule'
          },
          'user': {
              method: 'GET',
              url: '/' + ngsalConfig.applicationName + '/api/' + ngsalConfig.apiVersion + '/user',
              isArray: false
          },
          'goToPerfil': {
              method: 'GET',
              url: '/' + ngsalConfig.applicationName + '/api/' + ngsalConfig.apiVersion + '/goToPerfil/:codigo',
              params: {codigo: '@codigo'},
              isArray: false
          }
      });

      var currentUser = null;

      service.getCurrentUser = function () {
          return currentUser;
      };

      service.activateLogin = function (obj) {
          currentUser = {username: obj.username, permissions: {}, userDetails: {}};
          service.authenticate({}, function (userDetails) {
              service.setUserDetails(userDetails);
              authService.loginConfirmed(obj);
          });

      };

      service.logout = function (data) {
          authService.loginCancelled(data);
          currentUser = null;
          service.logoutApi(function (success) {
              $rootScope.$broadcast('event:userLogout');
          });

      };

      service.setUserDetails = function (data) {
          if (!currentUser) currentUser = {username: data.username, permissions: {}, userDetails: {}};
          currentUser.userDetails = data.userDetails;
          currentUser.permissions = data.permissions;
          $rootScope.currentUser = currentUser;
          $rootScope.$broadcast('event:userDetailsPrepared');
      };

      return service;
  }

})();
