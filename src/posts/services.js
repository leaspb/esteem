//angular.module('steem.services', [])
module.exports = function (app) {
	app.service('APIs', ['$http', '$rootScope', function ($http, $rootScope) {
		'use strict';
		
		return {
			login: function (data) {
				return $http.post('', data);
			},
			getconfig: function() {
				return $http.get('');
			}
		};
	}])

	
	app.filter('timeago', function() {
        return function(input, p_allowFuture) {
		
            var substitute = function (stringOrFunction, number, strings) {
                    var string = angular.isFunction(stringOrFunction) ? stringOrFunction(number, dateDifference) : stringOrFunction;
                    var value = (strings.numbers && strings.numbers[number]) || number;
                    return string.replace(/%d/i, value);
                },
                nowTime = (new Date()).getTime(),
                date = (new Date(input)).getTime(),
                //refreshMillis= 6e4, //A minute
                allowFuture = p_allowFuture || false,
                strings= {
                    prefixAgo: '',
                    prefixFromNow: '',
                    suffixAgo: "ago",
                    suffixFromNow: "from now",
                    seconds: "seconds",
                    minute: "a minute",
                    minutes: "%d minutes",
                    hour: "an hour",
                    hours: "%d hours",
                    day: "a day",
                    days: "%d days",
                    month: "a month",
                    months: "%d months",
                    year: "a year",
                    years: "%d years"
                },
                dateDifference = nowTime - date,
                words,
                seconds = Math.abs(dateDifference) / 1000,
                minutes = seconds / 60,
                hours = minutes / 60,
                days = hours / 24,
                years = days / 365,
                separator = strings.wordSeparator === undefined ?  " " : strings.wordSeparator,
            
               
                prefix = strings.prefixAgo,
                suffix = strings.suffixAgo;
                
            if (allowFuture) {
                if (dateDifference < 0) {
                    prefix = strings.prefixFromNow;
                    suffix = strings.suffixFromNow;
                }
            }

            words = seconds < 45 && substitute(strings.seconds, Math.round(seconds), strings) ||
            seconds < 90 && substitute(strings.minute, 1, strings) ||
            minutes < 45 && substitute(strings.minutes, Math.round(minutes), strings) ||
            minutes < 90 && substitute(strings.hour, 1, strings) ||
            hours < 24 && substitute(strings.hours, Math.round(hours), strings) ||
            hours < 42 && substitute(strings.day, 1, strings) ||
            days < 30 && substitute(strings.days, Math.round(days), strings) ||
            days < 45 && substitute(strings.month, 1, strings) ||
            days < 365 && substitute(strings.months, Math.round(days / 30), strings) ||
            years < 1.5 && substitute(strings.year, 1, strings) ||
            substitute(strings.years, Math.round(years), strings);
			//console.log(prefix+words+suffix+separator);
			prefix.replace(/ /g, '')
			words.replace(/ /g, '')
			suffix.replace(/ /g, '')
			return (prefix+' '+words+' '+suffix+' '+separator);
            
        };
    })

    app.filter('parseUrl', function($sce) {
	    var urls = /(\b(https?|ftp):\/\/[A-Z0-9+&@#\/%?=~_|!:,.;-]*[-A-Z0-9+&@#\/%=~_|])/gim;
	    var emails = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
	 	var imgs = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/gim;
		var youtube = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
		var youtubeid = /(?:(?:youtube.com\/watch\?v=)|(?:youtu.be\/))([A-Za-z0-9\_\-]+)/i;
		
	    return function(textu, subpart) {
	        var options = {
	        	/*gfm: true,
				tables: true,
			    breaks: false,
			    pedantic: false,
			    sanitize: true,
			    smartLists: true,
			    smartypants: false*/
			};
			var textu = marked(textu, options);
			if (subpart) {
				var s = $sce.trustAsHtml(textu).toString();
				var text = s.substring(s.indexOf("<p>"), s.indexOf("</p>"));
				return text;
			} else {
				return $sce.trustAsHtml(textu);	
			}
	    };
	})
	app.filter('sp', function($sce, $rootScope) {
	    return function(text) {
	    	if (text) {
	    		return (Number(text.substring(0, text.length-6))/1e6*$rootScope.$storage.steem_per_mvests).toFixed(3);	
	    	}
	    };
	})
	app.filter('sd', function($sce, $rootScope) {
	    return function(text) {
	    	if (text) {
	    		return (Number(text.substring(0, text.length-6))/1e6*$rootScope.$storage.steem_per_mvests*$rootScope.$storage.base).toFixed(3);	
	    	}
	    };
	})
	app.filter('sbd', function($sce, $rootScope) {
	    return function(text) {
	    	if (text) {
	    		return (Number(text.substring(0, text.length-4)).toFixed(3));	
	    	}
	    };
	})
	app.filter('st', function($sce, $rootScope) {
	    return function(text) {
	    	if (text) {
	    		return (Number(text.substring(0, text.length-6)).toFixed(3));	
	    	}
	    };
	})
	app.filter('reputation', function(){
		return function(value) {
			reputation_level = 1;
			neg = false;

			if (value < 0)
				neg = true;

			if (value != 0) {
				reputation_level = Math.log10(Math.abs(value));
				reputation_level = Math.max(reputation_level - 9, 0);
			
				if (reputation_level < 0) 
					reputation_level = 0;
				if (neg) 
					reputation_level *= -1;
				
				reputation_level = (reputation_level*9) + 25;
			} else {
				return 0;
			}

			return reputation_level;
		}
	})
    
    app.directive('identicon', function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                username: '=',
                size: '=',
                marginPx: '='
            },
            template: '<img width={{size}} height={{size}} ng-src="data:image/png;base64,{{data}}" />',
            controller: ["$scope", "md5", function($scope, md5) {

                function centerImage(size, marginPx) {
                    // Identicons are a 5x5 grid (without margins)
                    var NUM_COLUMNS = 5;
                    // With margins, however it's a 6x6 grid where the 6th row and column are split in half
                    // and evenly spaced around the image, thus creating the margin.

                    // Users can pass in their own desired margin in pixels
                    if (typeof marginPx !== 'undefined') {
                        // convert their margin pixels into Identicon's expected percentage of size
                        return {margin: marginPx / size, naturalSize: size};
                    }

                    // Calculate an acceptable natural size and margin
                    var adjustment = (NUM_COLUMNS + 1) - (size % (NUM_COLUMNS + 1)); // adjustment needed to get a square fit for an identicon (divisble by 6)
                    var naturalSize = size + adjustment; // at most, we'd generate an icon that's 5px bigger than the size the user requested and scale it down.
                    marginPx = (naturalSize / (NUM_COLUMNS + 1)) / 2; // take a 6th of the newly calculated natural size and cut it in half for an even margin.

                    // convert the calculated margin pixels into Identicon's expected percentage of size
                    return {margin: marginPx / naturalSize, naturalSize: naturalSize};
                }

                function init() {
                    $scope.size = (typeof($scope.size) !== 'undefined' ? $scope.size : 24);

                    var adjustmentValues = centerImage($scope.size, $scope.marginPx);
                    $scope.margin = adjustmentValues.margin;
                    $scope.naturalSize = adjustmentValues.naturalSize;
                    $scope.options = {
                        background: [56,126,245, 255],
                        margin: $scope.margin,
                        size: $scope.naturalSize
                      };
                }

                init();

                $scope.$watchGroup(['username', 'size', 'marginPx'], function(newVal) {
                    init();
                    $scope.data = new Identicon(md5.createHash($scope.username || ''), $scope.options).toString();
                });
            }]
        };
    });

    app.factory('md5', [function() {

        var md5 = {
            createHash: function(str) {

                var xl;

                var rotateLeft = function (lValue, iShiftBits) {
                    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
                };

                var addUnsigned = function (lX, lY) {
                    var lX4, lY4, lX8, lY8, lResult;
                    lX8 = (lX & 0x80000000);
                    lY8 = (lY & 0x80000000);
                    lX4 = (lX & 0x40000000);
                    lY4 = (lY & 0x40000000);
                    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
                    if (lX4 & lY4) {
                        return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
                    }
                    if (lX4 | lY4) {
                        if (lResult & 0x40000000) {
                            return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                        } else {
                            return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                        }
                    } else {
                        return (lResult ^ lX8 ^ lY8);
                    }
                };

                var _F = function (x, y, z) {
                    return (x & y) | ((~x) & z);
                };
                var _G = function (x, y, z) {
                    return (x & z) | (y & (~z));
                };
                var _H = function (x, y, z) {
                    return (x ^ y ^ z);
                };
                var _I = function (x, y, z) {
                    return (y ^ (x | (~z)));
                };

                var _FF = function (a, b, c, d, x, s, ac) {
                    a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
                    return addUnsigned(rotateLeft(a, s), b);
                };

                var _GG = function (a, b, c, d, x, s, ac) {
                    a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
                    return addUnsigned(rotateLeft(a, s), b);
                };

                var _HH = function (a, b, c, d, x, s, ac) {
                    a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
                    return addUnsigned(rotateLeft(a, s), b);
                };

                var _II = function (a, b, c, d, x, s, ac) {
                    a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
                    return addUnsigned(rotateLeft(a, s), b);
                };

                var convertToWordArray = function (str) {
                    var lWordCount;
                    var lMessageLength = str.length;
                    var lNumberOfWords_temp1 = lMessageLength + 8;
                    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
                    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
                    var lWordArray = new Array(lNumberOfWords - 1);
                    var lBytePosition = 0;
                    var lByteCount = 0;
                    while (lByteCount < lMessageLength) {
                        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                        lBytePosition = (lByteCount % 4) * 8;
                        lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
                        lByteCount++;
                    }
                    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                    lBytePosition = (lByteCount % 4) * 8;
                    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
                    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
                    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
                    return lWordArray;
                };

                var wordToHex = function (lValue) {
                    var wordToHexValue = '',
                        wordToHexValue_temp = '',
                        lByte, lCount;
                    for (lCount = 0; lCount <= 3; lCount++) {
                        lByte = (lValue >>> (lCount * 8)) & 255;
                        wordToHexValue_temp = '0' + lByte.toString(16);
                        wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
                    }
                    return wordToHexValue;
                };

                var x = [],
                    k, AA, BB, CC, DD, a, b, c, d, S11 = 7,
                    S12 = 12,
                    S13 = 17,
                    S14 = 22,
                    S21 = 5,
                    S22 = 9,
                    S23 = 14,
                    S24 = 20,
                    S31 = 4,
                    S32 = 11,
                    S33 = 16,
                    S34 = 23,
                    S41 = 6,
                    S42 = 10,
                    S43 = 15,
                    S44 = 21;

                //str = this.utf8_encode(str);
                x = convertToWordArray(str);
                a = 0x67452301;
                b = 0xEFCDAB89;
                c = 0x98BADCFE;
                d = 0x10325476;

                xl = x.length;
                for (k = 0; k < xl; k += 16) {
                    AA = a;
                    BB = b;
                    CC = c;
                    DD = d;
                    a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
                    d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
                    c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
                    b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
                    a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
                    d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
                    c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
                    b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
                    a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
                    d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
                    c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
                    b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
                    a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
                    d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
                    c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
                    b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
                    a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
                    d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
                    c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
                    b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
                    a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
                    d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
                    c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
                    b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
                    a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
                    d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
                    c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
                    b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
                    a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
                    d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
                    c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
                    b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
                    a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
                    d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
                    c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
                    b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
                    a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
                    d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
                    c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
                    b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
                    a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
                    d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
                    c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
                    b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
                    a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
                    d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
                    c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
                    b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
                    a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
                    d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
                    c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
                    b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
                    a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
                    d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
                    c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
                    b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
                    a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
                    d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
                    c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
                    b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
                    a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
                    d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
                    c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
                    b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
                    a = addUnsigned(a, AA);
                    b = addUnsigned(b, BB);
                    c = addUnsigned(c, CC);
                    d = addUnsigned(d, DD);
                }

                var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

                return temp.toLowerCase();
            }

        };

        return md5;

    }]);

	app.directive('qrcode', function($interpolate) {  
		return {
		    restrict: 'E',
		    link: function($scope, $element, $attrs) {

		      var options = {
		        text: '',
		        width: 128,
		        height: 128,
		        colorDark: '#000000',
		        colorLight: '#ffffff',
		        correctLevel: 'H'
		      };

		      Object.keys(options).forEach(function(key) {
		        options[key] = $interpolate($attrs[key] || '')($scope) || options[key];
		      });

		      options.correctLevel = QRCode.CorrectLevel[options.correctLevel];

		      new QRCode($element[0], options);

		    }
		}
	});

    app.directive('ionComment', ionComment)
    app.directive('ionThread', ionThread);

    function ionComment() {
        return {
            restrict: 'E',
            scope: {
                comment: '='
            },
            template: '<ion-item ng-if="comment.author" class="ion-comment item">\
                        <div class="ion-comment--author">{{comment.author}}:</div>\
                        <div class="ion-comment--score"><span class="ion-android-arrow-dropup"></span> {{comment.net_votes || 0}}</div>\
                        <div class="ion-comment--text" ng-bind-html="comment.body | parseUrl"></div>\
                        <div class="ion-comment--replies">{{comment.children || 0}} replies</div>\
                        <ion-option-button ng-click="upvotePost(comment)"><span class="ion-android-arrow-dropup" style="font-size:30px"></ion-option-button>\
                        <ion-option-button ng-click="downvotePost(comment)"><span class="ion-android-arrow-dropdown" style="font-size:30px"></ion-option-button>\
                        <ion-option-button ng-click="replyToComment(comment)"><span class="ion-ios-chatbubble-outline" style="font-size:30px"></ion-option-button>\
                    </ion-item>',
            controller: function($scope, $rootScope, $state) {
                $scope.upvoteComment = function() {}

                $scope.upvotePost = function(post) {
                    $rootScope.$broadcast('show:loading');
                    if ($rootScope.$storage.user && $rootScope.$storage.user.password) {
                        $scope.mylogin = new window.steemJS.Login();
                        $scope.mylogin.setRoles(["posting"]);
                        var loginSuccess = $scope.mylogin.checkKeys({
                            accountName: $rootScope.$storage.user.username,    
                            password: $rootScope.$storage.user.password,
                            auths: {
                                posting: [[$rootScope.$storage.user.posting.key_auths[0][0], 1]]
                            }}
                        );
                        if (loginSuccess) {
                          var tr = new window.steemJS.TransactionBuilder();
                          tr.add_type_operation("vote", {
                              voter: $rootScope.$storage.user.username,
                              author: post.author,
                              permlink: post.permlink,
                              weight: 10000
                          });
                          tr.process_transaction($scope.mylogin, null, true);
                        } 
                      $rootScope.$broadcast('hide:loading');
                    } else {
                      $rootScope.$broadcast('hide:loading');
                      $rootScope.showAlert("Warning", "Please, login to Vote");
                    }
                  };
                  $scope.downvotePost = function(post) {
                    $rootScope.$broadcast('show:loading');
                    if ($rootScope.$storage.user && $rootScope.$storage.user.password) {
                        $scope.mylogin = new window.steemJS.Login();
                        $scope.mylogin.setRoles(["posting"]);
                        var loginSuccess = $scope.mylogin.checkKeys({
                            accountName: $rootScope.$storage.user.username,    
                            password: $rootScope.$storage.user.password,
                            auths: {
                                posting: [[$rootScope.$storage.user.posting.key_auths[0][0], 1]]
                            }}
                        );
                        if (loginSuccess) {
                          var tr = new window.steemJS.TransactionBuilder();
                          tr.add_type_operation("vote", {
                              voter: $rootScope.$storage.user.username,
                              author: post.author,
                              permlink: post.permlink,
                              weight: -10000
                          });
                          tr.process_transaction($scope.mylogin, null, true);
                        }
                      $rootScope.$broadcast('hide:loading');
                    } else {
                      $rootScope.$broadcast('hide:loading');
                      $rootScope.showAlert("Warning", "Please, login to Vote");
                    }
                  };
                  $scope.unvotePost = function(post) {
                    $rootScope.$broadcast('show:loading');
                    if ($rootScope.$storage.user && $rootScope.$storage.user.password) {
                        console.log('Api ready:');
                        $scope.mylogin = new window.steemJS.Login();
                        $scope.mylogin.setRoles(["posting"]);
                        var loginSuccess = $scope.mylogin.checkKeys({
                            accountName: $rootScope.$storage.user.username,    
                            password: $rootScope.$storage.user.password,
                            auths: {
                                posting: [[$rootScope.$storage.user.posting.key_auths[0][0], 1]]
                            }}
                        );
                        if (loginSuccess) {
                          var tr = new window.steemJS.TransactionBuilder();
                          tr.add_type_operation("vote", {
                              voter: $rootScope.$storage.user.username,
                              author: post.author,
                              permlink: post.permlink,
                              weight: 0
                          });
                          tr.process_transaction($scope.mylogin, null, true);
                        }
                      $rootScope.$broadcast('hide:loading');
                    } else {
                      $rootScope.$broadcast('hide:loading');
                      $rootScope.showAlert("Warning", "Please, login to Vote");
                    }
                  };

                $scope.replyToComment = function(comment) {
                    console.log('reply to comment')
                    $rootScope.$storage.sitem = comment;
                    //console.log(item);
                    $state.go('app.single');
                }
            }
        }
    }

    function ionThread() {
        return {
            restrict: 'E',
            scope: {
                comments: '='
            },
            //Replace ng-if="!comment.showChildren" with ng-if="comment.showChildren" to hide all child comments by default
            //Replace comment.data.replies.data.children according to the API you are using | orderBy:\'-net_votes\'
            template: '<script type="text/ng-template" id="node.html">\
                            <ion-comment ng-click="toggleComment(comment)" comment="comment">\
                            </ion-comment>\
                            <div class="reddit-post--comment--container">\
                                 <ul ng-if="comment.showChildren" class="animate-if ion-comment--children">\
                                    <li ng-repeat="comment in comment.replies track by $index | orderBy:\'-total_pending_payout_value\'">\
                                        <ng-include src="\'node.html\'"/>\
                                    </li>\
                                </ul>\
                            </div>\
                        </script>\
                        <ion-list ng-if="comments && comments.length > 0">\
                          <ul>\
                            <li ng-repeat="comment in comments track by $index | orderBy:\'-total_pending_payout_value\'">\
                                <ng-include src="\'node.html\'"/>\
                            </li>\
                          </ul>\
                        </ion-list>',
            controller: function($scope, $rootScope) {
                $scope.toggleComment = function(comment) {
                    //console.log('toggleComment ',comment)
                    if (comment.children > 0){
                      (new Steem($rootScope.$storage.socket)).getContentReplies(comment.author, comment.permlink, function(err, res1) {
                      //window.Api.database_api().exec("get_content_replies", [comments[i].author, comments[i].permlink]).then(function(res1){
                        comment.replies = res1;
                        //console.log('result',res1);
                        if (comment.showChildren) {
                            comment.showChildren = false;
                        } else {
                            comment.showChildren = true;
                        }
                        if (!$scope.$$phase) {
                          $scope.$apply();
                        }
                      });
                    }
                }           
            }
        }
    }


}