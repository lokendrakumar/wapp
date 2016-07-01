(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define([], function () {
      return (root['Autolinker'] = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['Autolinker'] = factory();
  }
}(this, function () {

/*!
 * Autolinker.js
 * 0.17.1
 *
 * Copyright(c) 2015 Gregory Jacobs <greg@greg-jacobs.com>
 * MIT Licensed. http://www.opensource.org/licenses/mit-license.php
 *
 * https://github.com/gregjacobs/Autolinker.js
 */
/**
 * @class Autolinker
 * @extends Object
 *
 * Utility class used to process a given string of text, and wrap the matches in
 * the appropriate anchor (&lt;a&gt;) tags to turn them into links.
 *
 * Any of the configuration options may be provided in an Object (map) provided
 * to the Autolinker constructor, which will configure how the {@link #link link()}
 * method will process the links.
 *
 * For example:
 *
 *     var autolinker = new Autolinker( {
 *         newWindow : false,
 *         truncate  : 30
 *     } );
 *
 *     var html = autolinker.link( "Joe went to www.yahoo.com" );
 *     // produces: 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>'
 *
 *
 * The {@link #static-link static link()} method may also be used to inline options into a single call, which may
 * be more convenient for one-off uses. For example:
 *
 *     var html = Autolinker.link( "Joe went to www.yahoo.com", {
 *         newWindow : false,
 *         truncate  : 30
 *     } );
 *     // produces: 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>'
 *
 *
 * ## Custom Replacements of Links
 *
 * If the configuration options do not provide enough flexibility, a {@link #replaceFn}
 * may be provided to fully customize the output of Autolinker. This function is
 * called once for each URL/Email/Phone#/Twitter Handle/Hashtag match that is
 * encountered.
 *
 * For example:
 *
 *     var input = "...";  // string with URLs, Email Addresses, Phone #s, Twitter Handles, and Hashtags
 *
 *     var linkedText = Autolinker.link( input, {
 *         replaceFn : function( autolinker, match ) {
 *             console.log( "href = ", match.getAnchorHref() );
 *             console.log( "text = ", match.getAnchorText() );
 *
 *             switch( match.getType() ) {
 *                 case 'url' :
 *                     console.log( "url: ", match.getUrl() );
 *
 *                     if( match.getUrl().indexOf( 'mysite.com' ) === -1 ) {
 *                         var tag = autolinker.getTagBuilder().build( match );  // returns an `Autolinker.HtmlTag` instance, which provides mutator methods for easy changes
 *                         tag.setAttr( 'rel', 'nofollow' );
 *                         tag.addClass( 'external-link' );
 *
 *                         return tag;
 *
 *                     } else {
 *                         return true;  // let Autolinker perform its normal anchor tag replacement
 *                     }
 *
 *                 case 'email' :
 *                     var email = match.getEmail();
 *                     console.log( "email: ", email );
 *
 *                     if( email === "my@own.address" ) {
 *                         return false;  // don't auto-link this particular email address; leave as-is
 *                     } else {
 *                         return;  // no return value will have Autolinker perform its normal anchor tag replacement (same as returning `true`)
 *                     }
 *
 *                 case 'phone' :
 *                     var phoneNumber = match.getPhoneNumber();
 *                     console.log( phoneNumber );
 *
 *                     return '<a href="http://newplace.to.link.phone.numbers.to/">' + phoneNumber + '</a>';
 *
 *                 case 'twitter' :
 *                     var twitterHandle = match.getTwitterHandle();
 *                     console.log( twitterHandle );
 *
 *                     return '<a href="http://newplace.to.link.twitter.handles.to/">' + twitterHandle + '</a>';
 *
 *                 case 'hashtag' :
 *                     var hashtag = match.getHashtag();
 *                     console.log( hashtag );
 *
 *                     return '<a href="http://newplace.to.link.hashtag.handles.to/">' + hashtag + '</a>';
 *             }
 *         }
 *     } );
 *
 *
 * The function may return the following values:
 *
 * - `true` (Boolean): Allow Autolinker to replace the match as it normally would.
 * - `false` (Boolean): Do not replace the current match at all - leave as-is.
 * - Any String: If a string is returned from the function, the string will be used directly as the replacement HTML for
 *   the match.
 * - An {@link Autolinker.HtmlTag} instance, which can be used to build/modify an HTML tag before writing out its HTML text.
 *
 * @constructor
 * @param {Object} [config] The configuration options for the Autolinker instance, specified in an Object (map).
 */
var Autolinker = function( cfg ) {
	Autolinker.Util.assign( this, cfg );  // assign the properties of `cfg` onto the Autolinker instance. Prototype properties will be used for missing configs.

	// Validate the value of the `hashtag` cfg.
	var hashtag = this.hashtag;
	if( hashtag !== false && hashtag !== 'twitter' && hashtag !== 'facebook' ) {
		throw new Error( "invalid `hashtag` cfg - see docs" );
	}
};

Autolinker.prototype = {
	constructor : Autolinker,  // fix constructor property

	/**
	 * @cfg {Boolean} urls
	 *
	 * `true` if miscellaneous URLs should be automatically linked, `false` if they should not be.
	 */
	urls : true,

	/**
	 * @cfg {Boolean} email
	 *
	 * `true` if email addresses should be automatically linked, `false` if they should not be.
	 */
	email : true,

	/**
	 * @cfg {Boolean} twitter
	 *
	 * `true` if Twitter handles ("@example") should be automatically linked, `false` if they should not be.
	 */
	twitter : true,

	/**
	 * @cfg {Boolean} phone
	 *
	 * `true` if Phone numbers ("(555)555-5555") should be automatically linked, `false` if they should not be.
	 */
	phone: true,

	/**
	 * @cfg {Boolean/String} hashtag
	 *
	 * A string for the service name to have hashtags (ex: "#myHashtag")
	 * auto-linked to. The currently-supported values are:
	 *
	 * - 'twitter'
	 * - 'facebook'
	 *
	 * Pass `false` to skip auto-linking of hashtags.
	 */
	hashtag : false,

	/**
	 * @cfg {Boolean} newWindow
	 *
	 * `true` if the links should open in a new window, `false` otherwise.
	 */
	newWindow : true,

	/**
	 * @cfg {Boolean} stripPrefix
	 *
	 * `true` if 'http://' or 'https://' and/or the 'www.' should be stripped
	 * from the beginning of URL links' text, `false` otherwise.
	 */
	stripPrefix : true,

	/**
	 * @cfg {Number} truncate
	 *
	 * A number for how many characters long matched text should be truncated to inside the text of
	 * a link. If the matched text is over this number of characters, it will be truncated to this length by
	 * adding a two period ellipsis ('..') to the end of the string.
	 *
	 * For example: A url like 'http://www.yahoo.com/some/long/path/to/a/file' truncated to 25 characters might look
	 * something like this: 'yahoo.com/some/long/pat..'
	 */
	truncate : undefined,

	/**
	 * @cfg {String} className
	 *
	 * A CSS class name to add to the generated links. This class will be added to all links, as well as this class
	 * plus match suffixes for styling url/email/phone/twitter/hashtag links differently.
	 *
	 * For example, if this config is provided as "myLink", then:
	 *
	 * - URL links will have the CSS classes: "myLink myLink-url"
	 * - Email links will have the CSS classes: "myLink myLink-email", and
	 * - Twitter links will have the CSS classes: "myLink myLink-twitter"
	 * - Phone links will have the CSS classes: "myLink myLink-phone"
	 * - Hashtag links will have the CSS classes: "myLink myLink-hashtag"
	 */
	className : "",

	/**
	 * @cfg {Function} replaceFn
	 *
	 * A function to individually process each match found in the input string.
	 *
	 * See the class's description for usage.
	 *
	 * This function is called with the following parameters:
	 *
	 * @cfg {Autolinker} replaceFn.autolinker The Autolinker instance, which may be used to retrieve child objects from (such
	 *   as the instance's {@link #getTagBuilder tag builder}).
	 * @cfg {Autolinker.match.Match} replaceFn.match The Match instance which can be used to retrieve information about the
	 *   match that the `replaceFn` is currently processing. See {@link Autolinker.match.Match} subclasses for details.
	 */


	/**
	 * @private
	 * @property {Autolinker.htmlParser.HtmlParser} htmlParser
	 *
	 * The HtmlParser instance used to skip over HTML tags, while finding text nodes to process. This is lazily instantiated
	 * in the {@link #getHtmlParser} method.
	 */
	htmlParser : undefined,

	/**
	 * @private
	 * @property {Autolinker.matchParser.MatchParser} matchParser
	 *
	 * The MatchParser instance used to find matches in the text nodes of an input string passed to
	 * {@link #link}. This is lazily instantiated in the {@link #getMatchParser} method.
	 */
	matchParser : undefined,

	/**
	 * @private
	 * @property {Autolinker.AnchorTagBuilder} tagBuilder
	 *
	 * The AnchorTagBuilder instance used to build match replacement anchor tags. Note: this is lazily instantiated
	 * in the {@link #getTagBuilder} method.
	 */
	tagBuilder : undefined,

	/**
	 * Automatically links URLs, Email addresses, Phone numbers, Twitter
	 * handles, and Hashtags found in the given chunk of HTML. Does not link
	 * URLs found within HTML tags.
	 *
	 * For instance, if given the text: `You should go to http://www.yahoo.com`,
	 * then the result will be `You should go to
	 * &lt;a href="http://www.yahoo.com"&gt;http://www.yahoo.com&lt;/a&gt;`
	 *
	 * This method finds the text around any HTML elements in the input
	 * `textOrHtml`, which will be the text that is processed. Any original HTML
	 * elements will be left as-is, as well as the text that is already wrapped
	 * in anchor (&lt;a&gt;) tags.
	 *
	 * @param {String} textOrHtml The HTML or text to autolink matches within
	 *   (depending on if the {@link #urls}, {@link #email}, {@link #phone},
	 *   {@link #twitter}, and {@link #hashtag} options are enabled).
	 * @return {String} The HTML, with matches automatically linked.
	 */
	link : function( textOrHtml ) {
		var htmlParser = this.getHtmlParser(),
		    htmlNodes = htmlParser.parse( textOrHtml ),
		    anchorTagStackCount = 0,  // used to only process text around anchor tags, and any inner text/html they may have
		    resultHtml = [];

		for( var i = 0, len = htmlNodes.length; i < len; i++ ) {
			var node = htmlNodes[ i ],
			    nodeType = node.getType(),
			    nodeText = node.getText();

			if( nodeType === 'element' ) {
				// Process HTML nodes in the input `textOrHtml`
				if( node.getTagName() === 'a' ) {
					if( !node.isClosing() ) {  // it's the start <a> tag
						anchorTagStackCount++;
					} else {   // it's the end </a> tag
						anchorTagStackCount = Math.max( anchorTagStackCount - 1, 0 );  // attempt to handle extraneous </a> tags by making sure the stack count never goes below 0
					}
				}
				resultHtml.push( nodeText );  // now add the text of the tag itself verbatim

			} else if( nodeType === 'entity' || nodeType === 'comment' ) {
				resultHtml.push( nodeText );  // append HTML entity nodes (such as '&nbsp;') or HTML comments (such as '<!-- Comment -->') verbatim

			} else {
				// Process text nodes in the input `textOrHtml`
				if( anchorTagStackCount === 0 ) {
					// If we're not within an <a> tag, process the text node to linkify
					var linkifiedStr = this.linkifyStr( nodeText );
					resultHtml.push( linkifiedStr );

				} else {
					// `text` is within an <a> tag, simply append the text - we do not want to autolink anything
					// already within an <a>...</a> tag
					resultHtml.push( nodeText );
				}
			}
		}

		return resultHtml.join( "" );
	},

	/**
	 * Process the text that lies in between HTML tags, performing the anchor
	 * tag replacements for the matches, and returns the string with the
	 * replacements made.
	 *
	 * This method does the actual wrapping of matches with anchor tags.
	 *
	 * @private
	 * @param {String} str The string of text to auto-link.
	 * @return {String} The text with anchor tags auto-filled.
	 */
	linkifyStr : function( str ) {
		return this.getMatchParser().replace( str, this.createMatchReturnVal, this );
	},


	/**
	 * Creates the return string value for a given match in the input string,
	 * for the {@link #linkifyStr} method.
	 *
	 * This method handles the {@link #replaceFn}, if one was provided.
	 *
	 * @private
	 * @param {Autolinker.match.Match} match The Match object that represents the match.
	 * @return {String} The string that the `match` should be replaced with. This is usually the anchor tag string, but
	 *   may be the `matchStr` itself if the match is not to be replaced.
	 */
	createMatchReturnVal : function( match ) {
		// Handle a custom `replaceFn` being provided
		var replaceFnResult;
		if( this.replaceFn ) {
			replaceFnResult = this.replaceFn.call( this, this, match );  // Autolinker instance is the context, and the first arg
		}

		if( typeof replaceFnResult === 'string' ) {
			return replaceFnResult;  // `replaceFn` returned a string, use that

		} else if( replaceFnResult === false ) {
			return match.getMatchedText();  // no replacement for the match

		} else if( replaceFnResult instanceof Autolinker.HtmlTag ) {
			return replaceFnResult.toAnchorString();

		} else {  // replaceFnResult === true, or no/unknown return value from function
			// Perform Autolinker's default anchor tag generation
			var tagBuilder = this.getTagBuilder(),
			    anchorTag = tagBuilder.build( match );  // returns an Autolinker.HtmlTag instance

			return anchorTag.toAnchorString();
		}
	},


	/**
	 * Lazily instantiates and returns the {@link #htmlParser} instance for this Autolinker instance.
	 *
	 * @protected
	 * @return {Autolinker.htmlParser.HtmlParser}
	 */
	getHtmlParser : function() {
		var htmlParser = this.htmlParser;

		if( !htmlParser ) {
			htmlParser = this.htmlParser = new Autolinker.htmlParser.HtmlParser();
		}

		return htmlParser;
	},


	/**
	 * Lazily instantiates and returns the {@link #matchParser} instance for this Autolinker instance.
	 *
	 * @protected
	 * @return {Autolinker.matchParser.MatchParser}
	 */
	getMatchParser : function() {
		var matchParser = this.matchParser;

		if( !matchParser ) {
			matchParser = this.matchParser = new Autolinker.matchParser.MatchParser( {
				urls        : this.urls,
				email       : this.email,
				twitter     : this.twitter,
				phone       : this.phone,
				hashtag     : this.hashtag,
				stripPrefix : this.stripPrefix
			} );
		}

		return matchParser;
	},


	/**
	 * Returns the {@link #tagBuilder} instance for this Autolinker instance, lazily instantiating it
	 * if it does not yet exist.
	 *
	 * This method may be used in a {@link #replaceFn} to generate the {@link Autolinker.HtmlTag HtmlTag} instance that
	 * Autolinker would normally generate, and then allow for modifications before returning it. For example:
	 *
	 *     var html = Autolinker.link( "Test google.com", {
	 *         replaceFn : function( autolinker, match ) {
	 *             var tag = autolinker.getTagBuilder().build( match );  // returns an {@link Autolinker.HtmlTag} instance
	 *             tag.setAttr( 'rel', 'nofollow' );
	 *
	 *             return tag;
	 *         }
	 *     } );
	 *
	 *     // generated html:
	 *     //   Test <a href="http://google.com" target="_blank" rel="nofollow">google.com</a>
	 *
	 * @return {Autolinker.AnchorTagBuilder}
	 */
	getTagBuilder : function() {
		var tagBuilder = this.tagBuilder;

		if( !tagBuilder ) {
			tagBuilder = this.tagBuilder = new Autolinker.AnchorTagBuilder( {
				newWindow   : this.newWindow,
				truncate    : this.truncate,
				className   : this.className
			} );
		}

		return tagBuilder;
	}

};


/**
 * Automatically links URLs, Email addresses, Phone Numbers, Twitter handles,
 * and Hashtags found in the given chunk of HTML. Does not link URLs found
 * within HTML tags.
 *
 * For instance, if given the text: `You should go to http://www.yahoo.com`,
 * then the result will be `You should go to &lt;a href="http://www.yahoo.com"&gt;http://www.yahoo.com&lt;/a&gt;`
 *
 * Example:
 *
 *     var linkedText = Autolinker.link( "Go to google.com", { newWindow: false } );
 *     // Produces: "Go to <a href="http://google.com">google.com</a>"
 *
 * @static
 * @param {String} textOrHtml The HTML or text to find matches within (depending
 *   on if the {@link #urls}, {@link #email}, {@link #phone}, {@link #twitter},
 *   and {@link #hashtag} options are enabled).
 * @param {Object} [options] Any of the configuration options for the Autolinker
 *   class, specified in an Object (map). See the class description for an
 *   example call.
 * @return {String} The HTML text, with matches automatically linked.
 */
Autolinker.link = function( textOrHtml, options ) {
	var autolinker = new Autolinker( options );
	return autolinker.link( textOrHtml );
};


// Autolinker Namespaces
Autolinker.match = {};
Autolinker.htmlParser = {};
Autolinker.matchParser = {};

/*global Autolinker */
/*jshint eqnull:true, boss:true */
/**
 * @class Autolinker.Util
 * @singleton
 *
 * A few utility methods for Autolinker.
 */
Autolinker.Util = {

	/**
	 * @property {Function} abstractMethod
	 *
	 * A function object which represents an abstract method.
	 */
	abstractMethod : function() { throw "abstract"; },


	/**
	 * @private
	 * @property {RegExp} trimRegex
	 *
	 * The regular expression used to trim the leading and trailing whitespace
	 * from a string.
	 */
	trimRegex : /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,


	/**
	 * Assigns (shallow copies) the properties of `src` onto `dest`.
	 *
	 * @param {Object} dest The destination object.
	 * @param {Object} src The source object.
	 * @return {Object} The destination object (`dest`)
	 */
	assign : function( dest, src ) {
		for( var prop in src ) {
			if( src.hasOwnProperty( prop ) ) {
				dest[ prop ] = src[ prop ];
			}
		}

		return dest;
	},


	/**
	 * Extends `superclass` to create a new subclass, adding the `protoProps` to the new subclass's prototype.
	 *
	 * @param {Function} superclass The constructor function for the superclass.
	 * @param {Object} protoProps The methods/properties to add to the subclass's prototype. This may contain the
	 *   special property `constructor`, which will be used as the new subclass's constructor function.
	 * @return {Function} The new subclass function.
	 */
	extend : function( superclass, protoProps ) {
		var superclassProto = superclass.prototype;

		var F = function() {};
		F.prototype = superclassProto;

		var subclass;
		if( protoProps.hasOwnProperty( 'constructor' ) ) {
			subclass = protoProps.constructor;
		} else {
			subclass = function() { superclassProto.constructor.apply( this, arguments ); };
		}

		var subclassProto = subclass.prototype = new F();  // set up prototype chain
		subclassProto.constructor = subclass;  // fix constructor property
		subclassProto.superclass = superclassProto;

		delete protoProps.constructor;  // don't re-assign constructor property to the prototype, since a new function may have been created (`subclass`), which is now already there
		Autolinker.Util.assign( subclassProto, protoProps );

		return subclass;
	},


	/**
	 * Truncates the `str` at `len - ellipsisChars.length`, and adds the `ellipsisChars` to the
	 * end of the string (by default, two periods: '..'). If the `str` length does not exceed
	 * `len`, the string will be returned unchanged.
	 *
	 * @param {String} str The string to truncate and add an ellipsis to.
	 * @param {Number} truncateLen The length to truncate the string at.
	 * @param {String} [ellipsisChars=..] The ellipsis character(s) to add to the end of `str`
	 *   when truncated. Defaults to '..'
	 */
	ellipsis : function( str, truncateLen, ellipsisChars ) {
		if( str.length > truncateLen ) {
			ellipsisChars = ( ellipsisChars == null ) ? '..' : ellipsisChars;
			str = str.substring( 0, truncateLen - ellipsisChars.length ) + ellipsisChars;
		}
		return str;
	},


	/**
	 * Supports `Array.prototype.indexOf()` functionality for old IE (IE8 and below).
	 *
	 * @param {Array} arr The array to find an element of.
	 * @param {*} element The element to find in the array, and return the index of.
	 * @return {Number} The index of the `element`, or -1 if it was not found.
	 */
	indexOf : function( arr, element ) {
		if( Array.prototype.indexOf ) {
			return arr.indexOf( element );

		} else {
			for( var i = 0, len = arr.length; i < len; i++ ) {
				if( arr[ i ] === element ) return i;
			}
			return -1;
		}
	},



	/**
	 * Performs the functionality of what modern browsers do when `String.prototype.split()` is called
	 * with a regular expression that contains capturing parenthesis.
	 *
	 * For example:
	 *
	 *     // Modern browsers:
	 *     "a,b,c".split( /(,)/ );  // --> [ 'a', ',', 'b', ',', 'c' ]
	 *
	 *     // Old IE (including IE8):
	 *     "a,b,c".split( /(,)/ );  // --> [ 'a', 'b', 'c' ]
	 *
	 * This method emulates the functionality of modern browsers for the old IE case.
	 *
	 * @param {String} str The string to split.
	 * @param {RegExp} splitRegex The regular expression to split the input `str` on. The splitting
	 *   character(s) will be spliced into the array, as in the "modern browsers" example in the
	 *   description of this method.
	 *   Note #1: the supplied regular expression **must** have the 'g' flag specified.
	 *   Note #2: for simplicity's sake, the regular expression does not need
	 *   to contain capturing parenthesis - it will be assumed that any match has them.
	 * @return {String[]} The split array of strings, with the splitting character(s) included.
	 */
	splitAndCapture : function( str, splitRegex ) {
		if( !splitRegex.global ) throw new Error( "`splitRegex` must have the 'g' flag set" );

		var result = [],
		    lastIdx = 0,
		    match;

		while( match = splitRegex.exec( str ) ) {
			result.push( str.substring( lastIdx, match.index ) );
			result.push( match[ 0 ] );  // push the splitting char(s)

			lastIdx = match.index + match[ 0 ].length;
		}
		result.push( str.substring( lastIdx ) );

		return result;
	},


	/**
	 * Trims the leading and trailing whitespace from a string.
	 *
	 * @param {String} str The string to trim.
	 * @return {String}
	 */
	trim : function( str ) {
		return str.replace( this.trimRegex, '' );
	}

};
/*global Autolinker */
/*jshint boss:true */
/**
 * @class Autolinker.HtmlTag
 * @extends Object
 *
 * Represents an HTML tag, which can be used to easily build/modify HTML tags programmatically.
 *
 * Autolinker uses this abstraction to create HTML tags, and then write them out as strings. You may also use
 * this class in your code, especially within a {@link Autolinker#replaceFn replaceFn}.
 *
 * ## Examples
 *
 * Example instantiation:
 *
 *     var tag = new Autolinker.HtmlTag( {
 *         tagName : 'a',
 *         attrs   : { 'href': 'http://google.com', 'class': 'external-link' },
 *         innerHtml : 'Google'
 *     } );
 *
 *     tag.toAnchorString();  // <a href="http://google.com" class="external-link">Google</a>
 *
 *     // Individual accessor methods
 *     tag.getTagName();                 // 'a'
 *     tag.getAttr( 'href' );            // 'http://google.com'
 *     tag.hasClass( 'external-link' );  // true
 *
 *
 * Using mutator methods (which may be used in combination with instantiation config properties):
 *
 *     var tag = new Autolinker.HtmlTag();
 *     tag.setTagName( 'a' );
 *     tag.setAttr( 'href', 'http://google.com' );
 *     tag.addClass( 'external-link' );
 *     tag.setInnerHtml( 'Google' );
 *
 *     tag.getTagName();                 // 'a'
 *     tag.getAttr( 'href' );            // 'http://google.com'
 *     tag.hasClass( 'external-link' );  // true
 *
 *     tag.toAnchorString();  // <a href="http://google.com" class="external-link">Google</a>
 *
 *
 * ## Example use within a {@link Autolinker#replaceFn replaceFn}
 *
 *     var html = Autolinker.link( "Test google.com", {
 *         replaceFn : function( autolinker, match ) {
 *             var tag = autolinker.getTagBuilder().build( match );  // returns an {@link Autolinker.HtmlTag} instance, configured with the Match's href and anchor text
 *             tag.setAttr( 'rel', 'nofollow' );
 *
 *             return tag;
 *         }
 *     } );
 *
 *     // generated html:
 *     //   Test <a href="http://google.com" target="_blank" rel="nofollow">google.com</a>
 *
 *
 * ## Example use with a new tag for the replacement
 *
 *     var html = Autolinker.link( "Test google.com", {
 *         replaceFn : function( autolinker, match ) {
 *             var tag = new Autolinker.HtmlTag( {
 *                 tagName : 'button',
 *                 attrs   : { 'title': 'Load URL: ' + match.getAnchorHref() },
 *                 innerHtml : 'Load URL: ' + match.getAnchorText()
 *             } );
 *
 *             return tag;
 *         }
 *     } );
 *
 *     // generated html:
 *     //   Test <button title="Load URL: http://google.com">Load URL: google.com</button>
 */
Autolinker.HtmlTag = Autolinker.Util.extend( Object, {

	/**
	 * @cfg {String} tagName
	 *
	 * The tag name. Ex: 'a', 'button', etc.
	 *
	 * Not required at instantiation time, but should be set using {@link #setTagName} before {@link #toAnchorString}
	 * is executed.
	 */

	/**
	 * @cfg {Object.<String, String>} attrs
	 *
	 * An key/value Object (map) of attributes to create the tag with. The keys are the attribute names, and the
	 * values are the attribute values.
	 */

	/**
	 * @cfg {String} innerHtml
	 *
	 * The inner HTML for the tag.
	 *
	 * Note the camel case name on `innerHtml`. Acronyms are camelCased in this utility (such as not to run into the acronym
	 * naming inconsistency that the DOM developers created with `XMLHttpRequest`). You may alternatively use {@link #innerHTML}
	 * if you prefer, but this one is recommended.
	 */

	/**
	 * @cfg {String} innerHTML
	 *
	 * Alias of {@link #innerHtml}, accepted for consistency with the browser DOM api, but prefer the camelCased version
	 * for acronym names.
	 */


	/**
	 * @protected
	 * @property {RegExp} whitespaceRegex
	 *
	 * Regular expression used to match whitespace in a string of CSS classes.
	 */
	whitespaceRegex : /\s+/,


	/**
	 * @constructor
	 * @param {Object} [cfg] The configuration properties for this class, in an Object (map)
	 */
	constructor : function( cfg ) {
		Autolinker.Util.assign( this, cfg );

		this.innerHtml = this.innerHtml || this.innerHTML;  // accept either the camelCased form or the fully capitalized acronym
	},


	/**
	 * Sets the tag name that will be used to generate the tag with.
	 *
	 * @param {String} tagName
	 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
	 */
	setTagName : function( tagName ) {
		this.tagName = tagName;
		return this;
	},


	/**
	 * Retrieves the tag name.
	 *
	 * @return {String}
	 */
	getTagName : function() {
		return this.tagName || "";
	},


	/**
	 * Sets an attribute on the HtmlTag.
	 *
	 * @param {String} attrName The attribute name to set.
	 * @param {String} attrValue The attribute value to set.
	 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
	 */
	setAttr : function( attrName, attrValue ) {
		var tagAttrs = this.getAttrs();
		tagAttrs[ attrName ] = attrValue;

		return this;
	},


	/**
	 * Retrieves an attribute from the HtmlTag. If the attribute does not exist, returns `undefined`.
	 *
	 * @param {String} name The attribute name to retrieve.
	 * @return {String} The attribute's value, or `undefined` if it does not exist on the HtmlTag.
	 */
	getAttr : function( attrName ) {
		return this.getAttrs()[ attrName ];
	},


	/**
	 * Sets one or more attributes on the HtmlTag.
	 *
	 * @param {Object.<String, String>} attrs A key/value Object (map) of the attributes to set.
	 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
	 */
	setAttrs : function( attrs ) {
		var tagAttrs = this.getAttrs();
		Autolinker.Util.assign( tagAttrs, attrs );

		return this;
	},


	/**
	 * Retrieves the attributes Object (map) for the HtmlTag.
	 *
	 * @return {Object.<String, String>} A key/value object of the attributes for the HtmlTag.
	 */
	getAttrs : function() {
		return this.attrs || ( this.attrs = {} );
	},


	/**
	 * Sets the provided `cssClass`, overwriting any current CSS classes on the HtmlTag.
	 *
	 * @param {String} cssClass One or more space-separated CSS classes to set (overwrite).
	 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
	 */
	setClass : function( cssClass ) {
		return this.setAttr( 'class', cssClass );
	},


	/**
	 * Convenience method to add one or more CSS classes to the HtmlTag. Will not add duplicate CSS classes.
	 *
	 * @param {String} cssClass One or more space-separated CSS classes to add.
	 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
	 */
	addClass : function( cssClass ) {
		var classAttr = this.getClass(),
		    whitespaceRegex = this.whitespaceRegex,
		    indexOf = Autolinker.Util.indexOf,  // to support IE8 and below
		    classes = ( !classAttr ) ? [] : classAttr.split( whitespaceRegex ),
		    newClasses = cssClass.split( whitespaceRegex ),
		    newClass;

		while( newClass = newClasses.shift() ) {
			if( indexOf( classes, newClass ) === -1 ) {
				classes.push( newClass );
			}
		}

		this.getAttrs()[ 'class' ] = classes.join( " " );
		return this;
	},


	/**
	 * Convenience method to remove one or more CSS classes from the HtmlTag.
	 *
	 * @param {String} cssClass One or more space-separated CSS classes to remove.
	 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
	 */
	removeClass : function( cssClass ) {
		var classAttr = this.getClass(),
		    whitespaceRegex = this.whitespaceRegex,
		    indexOf = Autolinker.Util.indexOf,  // to support IE8 and below
		    classes = ( !classAttr ) ? [] : classAttr.split( whitespaceRegex ),
		    removeClasses = cssClass.split( whitespaceRegex ),
		    removeClass;

		while( classes.length && ( removeClass = removeClasses.shift() ) ) {
			var idx = indexOf( classes, removeClass );
			if( idx !== -1 ) {
				classes.splice( idx, 1 );
			}
		}

		this.getAttrs()[ 'class' ] = classes.join( " " );
		return this;
	},


	/**
	 * Convenience method to retrieve the CSS class(es) for the HtmlTag, which will each be separated by spaces when
	 * there are multiple.
	 *
	 * @return {String}
	 */
	getClass : function() {
		return this.getAttrs()[ 'class' ] || "";
	},


	/**
	 * Convenience method to check if the tag has a CSS class or not.
	 *
	 * @param {String} cssClass The CSS class to check for.
	 * @return {Boolean} `true` if the HtmlTag has the CSS class, `false` otherwise.
	 */
	hasClass : function( cssClass ) {
		return ( ' ' + this.getClass() + ' ' ).indexOf( ' ' + cssClass + ' ' ) !== -1;
	},


	/**
	 * Sets the inner HTML for the tag.
	 *
	 * @param {String} html The inner HTML to set.
	 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
	 */
	setInnerHtml : function( html ) {
		this.innerHtml = html;

		return this;
	},


	/**
	 * Retrieves the inner HTML for the tag.
	 *
	 * @return {String}
	 */
	getInnerHtml : function() {
		return this.innerHtml || "";
	},


	/**
	 * Override of superclass method used to generate the HTML string for the tag.
	 *
	 * @return {String}
	 */
	toAnchorString : function() {
		var tagName = this.getTagName(),
		    attrsStr = this.buildAttrsStr();

		attrsStr = ( attrsStr ) ? ' ' + attrsStr : '';  // prepend a space if there are actually attributes

		return [ '<', tagName, attrsStr, '>', this.getInnerHtml(), '</', tagName, '>' ].join( "" );
	},


	/**
	 * Support method for {@link #toAnchorString}, returns the string space-separated key="value" pairs, used to populate
	 * the stringified HtmlTag.
	 *
	 * @protected
	 * @return {String} Example return: `attr1="value1" attr2="value2"`
	 */
	buildAttrsStr : function() {
		if( !this.attrs ) return "";  // no `attrs` Object (map) has been set, return empty string

		var attrs = this.getAttrs(),
		    attrsArr = [];

		for( var prop in attrs ) {
			if( attrs.hasOwnProperty( prop ) ) {
				attrsArr.push( prop + '="' + attrs[ prop ] + '"' );
			}
		}
		return attrsArr.join( " " );
	}

} );

/*global Autolinker */
/*jshint sub:true */
/**
 * @protected
 * @class Autolinker.AnchorTagBuilder
 * @extends Object
 *
 * Builds anchor (&lt;a&gt;) tags for the Autolinker utility when a match is found.
 *
 * Normally this class is instantiated, configured, and used internally by an {@link Autolinker} instance, but may
 * actually be retrieved in a {@link Autolinker#replaceFn replaceFn} to create {@link Autolinker.HtmlTag HtmlTag} instances
 * which may be modified before returning from the {@link Autolinker#replaceFn replaceFn}. For example:
 *
 *     var html = Autolinker.link( "Test google.com", {
 *         replaceFn : function( autolinker, match ) {
 *             var tag = autolinker.getTagBuilder().build( match );  // returns an {@link Autolinker.HtmlTag} instance
 *             tag.setAttr( 'rel', 'nofollow' );
 *
 *             return tag;
 *         }
 *     } );
 *
 *     // generated html:
 *     //   Test <a href="http://google.com" target="_blank" rel="nofollow">google.com</a>
 */
Autolinker.AnchorTagBuilder = Autolinker.Util.extend( Object, {

	/**
	 * @cfg {Boolean} newWindow
	 * @inheritdoc Autolinker#newWindow
	 */

	/**
	 * @cfg {Number} truncate
	 * @inheritdoc Autolinker#truncate
	 */

	/**
	 * @cfg {String} className
	 * @inheritdoc Autolinker#className
	 */


	/**
	 * @constructor
	 * @param {Object} [cfg] The configuration options for the AnchorTagBuilder instance, specified in an Object (map).
	 */
	constructor : function( cfg ) {
		Autolinker.Util.assign( this, cfg );
	},


	/**
	 * Generates the actual anchor (&lt;a&gt;) tag to use in place of the
	 * matched text, via its `match` object.
	 *
	 * @param {Autolinker.match.Match} match The Match instance to generate an
	 *   anchor tag from.
	 * @return {Autolinker.HtmlTag} The HtmlTag instance for the anchor tag.
	 */
	build : function( match ) {
		var tag = new Autolinker.HtmlTag( {
			tagName   : 'a',
			attrs     : this.createAttrs( match.getType(), match.getAnchorHref() ),
			innerHtml : this.processAnchorText( match.getAnchorText() )
		} );

		return tag;
	},


	/**
	 * Creates the Object (map) of the HTML attributes for the anchor (&lt;a&gt;)
	 *   tag being generated.
	 *
	 * @protected
	 * @param {"url"/"email"/"phone"/"twitter"/"hashtag"} matchType The type of
	 *   match that an anchor tag is being generated for.
	 * @param {String} href The href for the anchor tag.
	 * @return {Object} A key/value Object (map) of the anchor tag's attributes.
	 */
	createAttrs : function( matchType, anchorHref ) {
		var attrs = {
			'href' : anchorHref  // we'll always have the `href` attribute
		};

		var cssClass = this.createCssClass( matchType );
		if( cssClass ) {
			attrs[ 'class' ] = cssClass;
		}
		if( this.newWindow ) {
			attrs[ 'target' ] = "_blank";
		}

		return attrs;
	},


	/**
	 * Creates the CSS class that will be used for a given anchor tag, based on
	 * the `matchType` and the {@link #className} config.
	 *
	 * @private
	 * @param {"url"/"email"/"phone"/"twitter"/"hashtag"} matchType The type of
	 *   match that an anchor tag is being generated for.
	 * @return {String} The CSS class string for the link. Example return:
	 *   "myLink myLink-url". If no {@link #className} was configured, returns
	 *   an empty string.
	 */
	createCssClass : function( matchType ) {
		var className = this.className;

		if( !className )
			return "";
		else
			return className + " " + className + "-" + matchType;  // ex: "myLink myLink-url", "myLink myLink-email", "myLink myLink-phone", "myLink myLink-twitter", or "myLink myLink-hashtag"
	},


	/**
	 * Processes the `anchorText` by truncating the text according to the
	 * {@link #truncate} config.
	 *
	 * @private
	 * @param {String} anchorText The anchor tag's text (i.e. what will be
	 *   displayed).
	 * @return {String} The processed `anchorText`.
	 */
	processAnchorText : function( anchorText ) {
		anchorText = this.doTruncate( anchorText );

		return anchorText;
	},


	/**
	 * Performs the truncation of the `anchorText`, if the `anchorText` is
	 * longer than the {@link #truncate} option. Truncates the text to 2
	 * characters fewer than the {@link #truncate} option, and adds ".." to the
	 * end.
	 *
	 * @private
	 * @param {String} text The anchor tag's text (i.e. what will be displayed).
	 * @return {String} The truncated anchor text.
	 */
	doTruncate : function( anchorText ) {
		return Autolinker.Util.ellipsis( anchorText, this.truncate || Number.POSITIVE_INFINITY );
	}

} );
/*global Autolinker */
/**
 * @private
 * @class Autolinker.htmlParser.HtmlParser
 * @extends Object
 *
 * An HTML parser implementation which simply walks an HTML string and returns an array of
 * {@link Autolinker.htmlParser.HtmlNode HtmlNodes} that represent the basic HTML structure of the input string.
 *
 * Autolinker uses this to only link URLs/emails/Twitter handles within text nodes, effectively ignoring / "walking
 * around" HTML tags.
 */
Autolinker.htmlParser.HtmlParser = Autolinker.Util.extend( Object, {

	/**
	 * @private
	 * @property {RegExp} htmlRegex
	 *
	 * The regular expression used to pull out HTML tags from a string. Handles namespaced HTML tags and
	 * attribute names, as specified by http://www.w3.org/TR/html-markup/syntax.html.
	 *
	 * Capturing groups:
	 *
	 * 1. The "!DOCTYPE" tag name, if a tag is a &lt;!DOCTYPE&gt; tag.
	 * 2. If it is an end tag, this group will have the '/'.
	 * 3. If it is a comment tag, this group will hold the comment text (i.e.
	 *    the text inside the `&lt;!--` and `--&gt;`.
	 * 4. The tag name for all tags (other than the &lt;!DOCTYPE&gt; tag)
	 */
	htmlRegex : (function() {
		var commentTagRegex = /!--([\s\S]+?)--/,
		    tagNameRegex = /[0-9a-zA-Z][0-9a-zA-Z:]*/,
		    attrNameRegex = /[^\s\0"'>\/=\x01-\x1F\x7F]+/,   // the unicode range accounts for excluding control chars, and the delete char
		    attrValueRegex = /(?:"[^"]*?"|'[^']*?'|[^'"=<>`\s]+)/, // double quoted, single quoted, or unquoted attribute values
		    nameEqualsValueRegex = attrNameRegex.source + '(?:\\s*=\\s*' + attrValueRegex.source + ')?';  // optional '=[value]'

		return new RegExp( [
			// for <!DOCTYPE> tag. Ex: <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">)
			'(?:',
				'<(!DOCTYPE)',  // *** Capturing Group 1 - If it's a doctype tag

					// Zero or more attributes following the tag name
					'(?:',
						'\\s+',  // one or more whitespace chars before an attribute

						// Either:
						// A. attr="value", or
						// B. "value" alone (To cover example doctype tag: <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">)
						'(?:', nameEqualsValueRegex, '|', attrValueRegex.source + ')',
					')*',
				'>',
			')',

			'|',

			// All other HTML tags (i.e. tags that are not <!DOCTYPE>)
			'(?:',
				'<(/)?',  // Beginning of a tag or comment. Either '<' for a start tag, or '</' for an end tag.
				          // *** Capturing Group 2: The slash or an empty string. Slash ('/') for end tag, empty string for start or self-closing tag.

					'(?:',
						commentTagRegex.source,  // *** Capturing Group 3 - A Comment Tag's Text

						'|',

						'(?:',

							// *** Capturing Group 4 - The tag name
							'(' + tagNameRegex.source + ')',

							// Zero or more attributes following the tag name
							'(?:',
								'\\s+',                // one or more whitespace chars before an attribute
								nameEqualsValueRegex,  // attr="value" (with optional ="value" part)
							')*',

							'\\s*/?',  // any trailing spaces and optional '/' before the closing '>'

						')',
					')',
				'>',
			')'
		].join( "" ), 'gi' );
	} )(),

	/**
	 * @private
	 * @property {RegExp} htmlCharacterEntitiesRegex
	 *
	 * The regular expression that matches common HTML character entities.
	 *
	 * Ignoring &amp; as it could be part of a query string -- handling it separately.
	 */
	htmlCharacterEntitiesRegex: /(&nbsp;|&#160;|&lt;|&#60;|&gt;|&#62;|&quot;|&#34;|&#39;)/gi,


	/**
	 * Parses an HTML string and returns a simple array of {@link Autolinker.htmlParser.HtmlNode HtmlNodes}
	 * to represent the HTML structure of the input string.
	 *
	 * @param {String} html The HTML to parse.
	 * @return {Autolinker.htmlParser.HtmlNode[]}
	 */
	parse : function( html ) {
		var htmlRegex = this.htmlRegex,
		    currentResult,
		    lastIndex = 0,
		    textAndEntityNodes,
		    nodes = [];  // will be the result of the method

		while( ( currentResult = htmlRegex.exec( html ) ) !== null ) {
			var tagText = currentResult[ 0 ],
			    commentText = currentResult[ 3 ], // if we've matched a comment
			    tagName = currentResult[ 1 ] || currentResult[ 4 ],  // The <!DOCTYPE> tag (ex: "!DOCTYPE"), or another tag (ex: "a" or "img")
			    isClosingTag = !!currentResult[ 2 ],
			    inBetweenTagsText = html.substring( lastIndex, currentResult.index );

			// Push TextNodes and EntityNodes for any text found between tags
			if( inBetweenTagsText ) {
				textAndEntityNodes = this.parseTextAndEntityNodes( inBetweenTagsText );
				nodes.push.apply( nodes, textAndEntityNodes );
			}

			// Push the CommentNode or ElementNode
			if( commentText ) {
				nodes.push( this.createCommentNode( tagText, commentText ) );
			} else {
				nodes.push( this.createElementNode( tagText, tagName, isClosingTag ) );
			}

			lastIndex = currentResult.index + tagText.length;
		}

		// Process any remaining text after the last HTML element. Will process all of the text if there were no HTML elements.
		if( lastIndex < html.length ) {
			var text = html.substring( lastIndex );

			// Push TextNodes and EntityNodes for any text found between tags
			if( text ) {
				textAndEntityNodes = this.parseTextAndEntityNodes( text );
				nodes.push.apply( nodes, textAndEntityNodes );
			}
		}

		return nodes;
	},


	/**
	 * Parses text and HTML entity nodes from a given string. The input string
	 * should not have any HTML tags (elements) within it.
	 *
	 * @private
	 * @param {String} text The text to parse.
	 * @return {Autolinker.htmlParser.HtmlNode[]} An array of HtmlNodes to
	 *   represent the {@link Autolinker.htmlParser.TextNode TextNodes} and
	 *   {@link Autolinker.htmlParser.EntityNode EntityNodes} found.
	 */
	parseTextAndEntityNodes : function( text ) {
		var nodes = [],
		    textAndEntityTokens = Autolinker.Util.splitAndCapture( text, this.htmlCharacterEntitiesRegex );  // split at HTML entities, but include the HTML entities in the results array

		// Every even numbered token is a TextNode, and every odd numbered token is an EntityNode
		// For example: an input `text` of "Test &quot;this&quot; today" would turn into the
		//   `textAndEntityTokens`: [ 'Test ', '&quot;', 'this', '&quot;', ' today' ]
		for( var i = 0, len = textAndEntityTokens.length; i < len; i += 2 ) {
			var textToken = textAndEntityTokens[ i ],
			    entityToken = textAndEntityTokens[ i + 1 ];

			if( textToken ) nodes.push( this.createTextNode( textToken ) );
			if( entityToken ) nodes.push( this.createEntityNode( entityToken ) );
		}
		return nodes;
	},


	/**
	 * Factory method to create an {@link Autolinker.htmlParser.CommentNode CommentNode}.
	 *
	 * @private
	 * @param {String} tagText The full text of the tag (comment) that was
	 *   matched, including its &lt;!-- and --&gt;.
	 * @param {String} comment The full text of the comment that was matched.
	 */
	createCommentNode : function( tagText, commentText ) {
		return new Autolinker.htmlParser.CommentNode( {
			text: tagText,
			comment: Autolinker.Util.trim( commentText )
		} );
	},


	/**
	 * Factory method to create an {@link Autolinker.htmlParser.ElementNode ElementNode}.
	 *
	 * @private
	 * @param {String} tagText The full text of the tag (element) that was
	 *   matched, including its attributes.
	 * @param {String} tagName The name of the tag. Ex: An &lt;img&gt; tag would
	 *   be passed to this method as "img".
	 * @param {Boolean} isClosingTag `true` if it's a closing tag, false
	 *   otherwise.
	 * @return {Autolinker.htmlParser.ElementNode}
	 */
	createElementNode : function( tagText, tagName, isClosingTag ) {
		return new Autolinker.htmlParser.ElementNode( {
			text    : tagText,
			tagName : tagName.toLowerCase(),
			closing : isClosingTag
		} );
	},


	/**
	 * Factory method to create a {@link Autolinker.htmlParser.EntityNode EntityNode}.
	 *
	 * @private
	 * @param {String} text The text that was matched for the HTML entity (such
	 *   as '&amp;nbsp;').
	 * @return {Autolinker.htmlParser.EntityNode}
	 */
	createEntityNode : function( text ) {
		return new Autolinker.htmlParser.EntityNode( { text: text } );
	},


	/**
	 * Factory method to create a {@link Autolinker.htmlParser.TextNode TextNode}.
	 *
	 * @private
	 * @param {String} text The text that was matched.
	 * @return {Autolinker.htmlParser.TextNode}
	 */
	createTextNode : function( text ) {
		return new Autolinker.htmlParser.TextNode( { text: text } );
	}

} );
/*global Autolinker */
/**
 * @abstract
 * @class Autolinker.htmlParser.HtmlNode
 * 
 * Represents an HTML node found in an input string. An HTML node is one of the following:
 * 
 * 1. An {@link Autolinker.htmlParser.ElementNode ElementNode}, which represents HTML tags.
 * 2. A {@link Autolinker.htmlParser.TextNode TextNode}, which represents text outside or within HTML tags.
 * 3. A {@link Autolinker.htmlParser.EntityNode EntityNode}, which represents one of the known HTML
 *    entities that Autolinker looks for. This includes common ones such as &amp;quot; and &amp;nbsp;
 */
Autolinker.htmlParser.HtmlNode = Autolinker.Util.extend( Object, {
	
	/**
	 * @cfg {String} text (required)
	 * 
	 * The original text that was matched for the HtmlNode. 
	 * 
	 * - In the case of an {@link Autolinker.htmlParser.ElementNode ElementNode}, this will be the tag's
	 *   text.
	 * - In the case of a {@link Autolinker.htmlParser.TextNode TextNode}, this will be the text itself.
	 * - In the case of a {@link Autolinker.htmlParser.EntityNode EntityNode}, this will be the text of
	 *   the HTML entity.
	 */
	text : "",
	
	
	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match instance, specified in an Object (map).
	 */
	constructor : function( cfg ) {
		Autolinker.Util.assign( this, cfg );
	},

	
	/**
	 * Returns a string name for the type of node that this class represents.
	 * 
	 * @abstract
	 * @return {String}
	 */
	getType : Autolinker.Util.abstractMethod,
	
	
	/**
	 * Retrieves the {@link #text} for the HtmlNode.
	 * 
	 * @return {String}
	 */
	getText : function() {
		return this.text;
	}

} );
/*global Autolinker */
/**
 * @class Autolinker.htmlParser.CommentNode
 * @extends Autolinker.htmlParser.HtmlNode
 *
 * Represents an HTML comment node that has been parsed by the
 * {@link Autolinker.htmlParser.HtmlParser}.
 *
 * See this class's superclass ({@link Autolinker.htmlParser.HtmlNode}) for more
 * details.
 */
Autolinker.htmlParser.CommentNode = Autolinker.Util.extend( Autolinker.htmlParser.HtmlNode, {

	/**
	 * @cfg {String} comment (required)
	 *
	 * The text inside the comment tag. This text is stripped of any leading or
	 * trailing whitespace.
	 */
	comment : '',


	/**
	 * Returns a string name for the type of node that this class represents.
	 *
	 * @return {String}
	 */
	getType : function() {
		return 'comment';
	},


	/**
	 * Returns the comment inside the comment tag.
	 *
	 * @return {String}
	 */
	getComment : function() {
		return this.comment;
	}

} );
/*global Autolinker */
/**
 * @class Autolinker.htmlParser.ElementNode
 * @extends Autolinker.htmlParser.HtmlNode
 * 
 * Represents an HTML element node that has been parsed by the {@link Autolinker.htmlParser.HtmlParser}.
 * 
 * See this class's superclass ({@link Autolinker.htmlParser.HtmlNode}) for more details.
 */
Autolinker.htmlParser.ElementNode = Autolinker.Util.extend( Autolinker.htmlParser.HtmlNode, {
	
	/**
	 * @cfg {String} tagName (required)
	 * 
	 * The name of the tag that was matched.
	 */
	tagName : '',
	
	/**
	 * @cfg {Boolean} closing (required)
	 * 
	 * `true` if the element (tag) is a closing tag, `false` if its an opening tag.
	 */
	closing : false,

	
	/**
	 * Returns a string name for the type of node that this class represents.
	 * 
	 * @return {String}
	 */
	getType : function() {
		return 'element';
	},
	

	/**
	 * Returns the HTML element's (tag's) name. Ex: for an &lt;img&gt; tag, returns "img".
	 * 
	 * @return {String}
	 */
	getTagName : function() {
		return this.tagName;
	},
	
	
	/**
	 * Determines if the HTML element (tag) is a closing tag. Ex: &lt;div&gt; returns
	 * `false`, while &lt;/div&gt; returns `true`.
	 * 
	 * @return {Boolean}
	 */
	isClosing : function() {
		return this.closing;
	}
	
} );
/*global Autolinker */
/**
 * @class Autolinker.htmlParser.EntityNode
 * @extends Autolinker.htmlParser.HtmlNode
 * 
 * Represents a known HTML entity node that has been parsed by the {@link Autolinker.htmlParser.HtmlParser}.
 * Ex: '&amp;nbsp;', or '&amp#160;' (which will be retrievable from the {@link #getText} method.
 * 
 * Note that this class will only be returned from the HtmlParser for the set of checked HTML entity nodes 
 * defined by the {@link Autolinker.htmlParser.HtmlParser#htmlCharacterEntitiesRegex}.
 * 
 * See this class's superclass ({@link Autolinker.htmlParser.HtmlNode}) for more details.
 */
Autolinker.htmlParser.EntityNode = Autolinker.Util.extend( Autolinker.htmlParser.HtmlNode, {
	
	/**
	 * Returns a string name for the type of node that this class represents.
	 * 
	 * @return {String}
	 */
	getType : function() {
		return 'entity';
	}
	
} );
/*global Autolinker */
/**
 * @class Autolinker.htmlParser.TextNode
 * @extends Autolinker.htmlParser.HtmlNode
 * 
 * Represents a text node that has been parsed by the {@link Autolinker.htmlParser.HtmlParser}.
 * 
 * See this class's superclass ({@link Autolinker.htmlParser.HtmlNode}) for more details.
 */
Autolinker.htmlParser.TextNode = Autolinker.Util.extend( Autolinker.htmlParser.HtmlNode, {
	
	/**
	 * Returns a string name for the type of node that this class represents.
	 * 
	 * @return {String}
	 */
	getType : function() {
		return 'text';
	}
	
} );
/*global Autolinker */
/**
 * @private
 * @class Autolinker.matchParser.MatchParser
 * @extends Object
 *
 * Used by Autolinker to parse potential matches, given an input string of text.
 *
 * The MatchParser is fed a non-HTML string in order to search for matches.
 * Autolinker first uses the {@link Autolinker.htmlParser.HtmlParser} to "walk
 * around" HTML tags, and then the text around the HTML tags is passed into the
 * MatchParser in order to find the actual matches.
 */
Autolinker.matchParser.MatchParser = Autolinker.Util.extend( Object, {

	/**
	 * @cfg {Boolean} urls
	 * @inheritdoc Autolinker#urls
	 */
	urls : true,

	/**
	 * @cfg {Boolean} email
	 * @inheritdoc Autolinker#email
	 */
	email : true,

	/**
	 * @cfg {Boolean} twitter
	 * @inheritdoc Autolinker#twitter
	 */
	twitter : true,

	/**
	 * @cfg {Boolean} phone
	 * @inheritdoc Autolinker#phone
	 */
	phone: true,

	/**
	 * @cfg {Boolean/String} hashtag
	 * @inheritdoc Autolinker#hashtag
	 */
	hashtag : false,

	/**
	 * @cfg {Boolean} stripPrefix
	 * @inheritdoc Autolinker#stripPrefix
	 */
	stripPrefix : true,


	/**
	 * @private
	 * @property {RegExp} matcherRegex
	 *
	 * The regular expression that matches URLs, email addresses, phone #s,
	 * Twitter handles, and Hashtags.
	 *
	 * This regular expression has the following capturing groups:
	 *
	 * 1.  Group that is used to determine if there is a Twitter handle match
	 *     (i.e. \@someTwitterUser). Simply check for its existence to determine
	 *     if there is a Twitter handle match. The next couple of capturing
	 *     groups give information about the Twitter handle match.
	 * 2.  The whitespace character before the \@sign in a Twitter handle. This
	 *     is needed because there are no lookbehinds in JS regular expressions,
	 *     and can be used to reconstruct the original string in a replace().
	 * 3.  The Twitter handle itself in a Twitter match. If the match is
	 *     '@someTwitterUser', the handle is 'someTwitterUser'.
	 * 4.  Group that matches an email address. Used to determine if the match
	 *     is an email address, as well as holding the full address. Ex:
	 *     'me@my.com'
	 * 5.  Group that matches a URL in the input text. Ex: 'http://google.com',
	 *     'www.google.com', or just 'google.com'. This also includes a path,
	 *     url parameters, or hash anchors. Ex: google.com/path/to/file?q1=1&q2=2#myAnchor
	 * 6.  Group that matches a protocol URL (i.e. 'http://google.com'). This is
	 *     used to match protocol URLs with just a single word, like 'http://localhost',
	 *     where we won't double check that the domain name has at least one '.'
	 *     in it.
	 * 7.  A protocol-relative ('//') match for the case of a 'www.' prefixed
	 *     URL. Will be an empty string if it is not a protocol-relative match.
	 *     We need to know the character before the '//' in order to determine
	 *     if it is a valid match or the // was in a string we don't want to
	 *     auto-link.
	 * 8.  A protocol-relative ('//') match for the case of a known TLD prefixed
	 *     URL. Will be an empty string if it is not a protocol-relative match.
	 *     See #6 for more info.
	 * 9.  Group that is used to determine if there is a phone number match. The
	 *     next 3 groups give segments of the phone number.
	 * 10. Group that is used to determine if there is a Hashtag match
	 *     (i.e. \#someHashtag). Simply check for its existence to determine if
	 *     there is a Hashtag match. The next couple of capturing groups give
	 *     information about the Hashtag match.
	 * 11. The whitespace character before the #sign in a Hashtag handle. This
	 *     is needed because there are no look-behinds in JS regular
	 *     expressions, and can be used to reconstruct the original string in a
	 *     replace().
	 * 12. The Hashtag itself in a Hashtag match. If the match is
	 *     '#someHashtag', the hashtag is 'someHashtag'.
	 */
	matcherRegex : (function() {
		var twitterRegex = /(^|[^\w])@(\w{1,15})/,              // For matching a twitter handle. Ex: @gregory_jacobs

		    hashtagRegex = /(^|[^\w])#(\w{1,15})/,              // For matching a Hashtag. Ex: #games

		    emailRegex = /(?:[\-;:&=\+\$,\w\.]+@)/,             // something@ for email addresses (a.k.a. local-part)
		    phoneRegex = /(?:\+?\d{1,3}[-\s.])?\(?\d{3}\)?[-\s.]?\d{3}[-\s.]\d{4}/,  // ex: (123) 456-7890, 123 456 7890, 123-456-7890, etc.
		    protocolRegex = /(?:[A-Za-z][-.+A-Za-z0-9]+:(?![A-Za-z][-.+A-Za-z0-9]+:\/\/)(?!\d+\/?)(?:\/\/)?)/,  // match protocol, allow in format "http://" or "mailto:". However, do not match the first part of something like 'link:http://www.google.com' (i.e. don't match "link:"). Also, make sure we don't interpret 'google.com:8000' as if 'google.com' was a protocol here (i.e. ignore a trailing port number in this regex)
		    wwwRegex = /(?:www\.)/,                             // starting with 'www.'
		    domainNameRegex = /[A-Za-z0-9\.\-]*[A-Za-z0-9\-]/,  // anything looking at all like a domain, non-unicode domains, not ending in a period
		    tldRegex = /\.(?:international|construction|contractors|enterprises|photography|productions|foundation|immobilien|industries|management|properties|technology|christmas|community|directory|education|equipment|institute|marketing|solutions|vacations|bargains|boutique|builders|catering|cleaning|clothing|computer|democrat|diamonds|graphics|holdings|lighting|partners|plumbing|supplies|training|ventures|academy|careers|company|cruises|domains|exposed|flights|florist|gallery|guitars|holiday|kitchen|neustar|okinawa|recipes|rentals|reviews|shiksha|singles|support|systems|agency|berlin|camera|center|coffee|condos|dating|estate|events|expert|futbol|kaufen|luxury|maison|monash|museum|nagoya|photos|repair|report|social|supply|tattoo|tienda|travel|viajes|villas|vision|voting|voyage|actor|build|cards|cheap|codes|dance|email|glass|house|mango|ninja|parts|photo|shoes|solar|today|tokyo|tools|watch|works|aero|arpa|asia|best|bike|blue|buzz|camp|club|cool|coop|farm|fish|gift|guru|info|jobs|kiwi|kred|land|limo|link|menu|mobi|moda|name|pics|pink|post|qpon|rich|ruhr|sexy|tips|vote|voto|wang|wien|wiki|zone|bar|bid|biz|cab|cat|ceo|com|edu|gov|int|kim|mil|net|onl|org|pro|pub|red|tel|uno|wed|xxx|xyz|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw)\b/,   // match our known top level domains (TLDs)

		    // Allow optional path, query string, and hash anchor, not ending in the following characters: "?!:,.;"
		    // http://blog.codinghorror.com/the-problem-with-urls/
		    urlSuffixRegex = /[\-A-Za-z0-9+&@#\/%=~_()|'$*\[\]?!:,.;]*[\-A-Za-z0-9+&@#\/%=~_()|'$*\[\]]/;

		return new RegExp( [
			'(',  // *** Capturing group $1, which can be used to check for a twitter handle match. Use group $3 for the actual twitter handle though. $2 may be used to reconstruct the original string in a replace()
				// *** Capturing group $2, which matches the whitespace character before the '@' sign (needed because of no lookbehinds), and
				// *** Capturing group $3, which matches the actual twitter handle
				twitterRegex.source,
			')',

			'|',

			'(',  // *** Capturing group $4, which is used to determine an email match
				emailRegex.source,
				domainNameRegex.source,
				tldRegex.source,
			')',

			'|',

			'(',  // *** Capturing group $5, which is used to match a URL
				'(?:', // parens to cover match for protocol (optional), and domain
					'(',  // *** Capturing group $6, for a protocol-prefixed url (ex: http://google.com)
						protocolRegex.source,
						domainNameRegex.source,
					')',

					'|',

					'(?:',  // non-capturing paren for a 'www.' prefixed url (ex: www.google.com)
						'(.?//)?',  // *** Capturing group $7 for an optional protocol-relative URL. Must be at the beginning of the string or start with a non-word character
						wwwRegex.source,
						domainNameRegex.source,
					')',

					'|',

					'(?:',  // non-capturing paren for known a TLD url (ex: google.com)
						'(.?//)?',  // *** Capturing group $8 for an optional protocol-relative URL. Must be at the beginning of the string or start with a non-word character
						domainNameRegex.source,
						tldRegex.source,
					')',
				')',

				'(?:' + urlSuffixRegex.source + ')?',  // match for path, query string, and/or hash anchor - optional
			')',

			'|',

			// this setup does not scale well for open extension :( Need to rethink design of autolinker...
			// ***  Capturing group $9, which matches a (USA for now) phone number
			'(',
				phoneRegex.source,
			')',

			'|',

			'(',  // *** Capturing group $10, which can be used to check for a Hashtag match. Use group $12 for the actual Hashtag though. $11 may be used to reconstruct the original string in a replace()
				// *** Capturing group $11, which matches the whitespace character before the '#' sign (needed because of no lookbehinds), and
				// *** Capturing group $12, which matches the actual Hashtag
				hashtagRegex.source,
			')'
		].join( "" ), 'gi' );
	} )(),

	/**
	 * @private
	 * @property {RegExp} charBeforeProtocolRelMatchRegex
	 *
	 * The regular expression used to retrieve the character before a
	 * protocol-relative URL match.
	 *
	 * This is used in conjunction with the {@link #matcherRegex}, which needs
	 * to grab the character before a protocol-relative '//' due to the lack of
	 * a negative look-behind in JavaScript regular expressions. The character
	 * before the match is stripped from the URL.
	 */
	charBeforeProtocolRelMatchRegex : /^(.)?\/\//,

	/**
	 * @private
	 * @property {Autolinker.MatchValidator} matchValidator
	 *
	 * The MatchValidator object, used to filter out any false positives from
	 * the {@link #matcherRegex}. See {@link Autolinker.MatchValidator} for details.
	 */


	/**
	 * @constructor
	 * @param {Object} [cfg] The configuration options for the AnchorTagBuilder
	 * instance, specified in an Object (map).
	 */
	constructor : function( cfg ) {
		Autolinker.Util.assign( this, cfg );

		this.matchValidator = new Autolinker.MatchValidator();
	},


	/**
	 * Parses the input `text` to search for matches, and calls the `replaceFn`
	 * to allow replacements of the matches. Returns the `text` with matches
	 * replaced.
	 *
	 * @param {String} text The text to search and repace matches in.
	 * @param {Function} replaceFn The iterator function to handle the
	 *   replacements. The function takes a single argument, a {@link Autolinker.match.Match}
	 *   object, and should return the text that should make the replacement.
	 * @param {Object} [contextObj=window] The context object ("scope") to run
	 *   the `replaceFn` in.
	 * @return {String}
	 */
	replace : function( text, replaceFn, contextObj ) {
		var me = this;  // for closure

		return text.replace( this.matcherRegex, function( matchStr, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12 ) {
			var matchDescObj = me.processCandidateMatch( matchStr, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12 );  // "match description" object

			// Return out with no changes for match types that are disabled (url,
			// email, phone, etc.), or for matches that are invalid (false
			// positives from the matcherRegex, which can't use look-behinds
			// since they are unavailable in JS).
			if( !matchDescObj ) {
				return matchStr;

			} else {
				// Generate replacement text for the match from the `replaceFn`
				var replaceStr = replaceFn.call( contextObj, matchDescObj.match );
				return matchDescObj.prefixStr + replaceStr + matchDescObj.suffixStr;
			}
		} );
	},


	/**
	 * Processes a candidate match from the {@link #matcherRegex}.
	 *
	 * Not all matches found by the regex are actual URL/Email/Phone/Twitter/Hashtag
	 * matches, as determined by the {@link #matchValidator}. In this case, the
	 * method returns `null`. Otherwise, a valid Object with `prefixStr`,
	 * `match`, and `suffixStr` is returned.
	 *
	 * @private
	 * @param {String} matchStr The full match that was found by the
	 *   {@link #matcherRegex}.
	 * @param {String} twitterMatch The matched text of a Twitter handle, if the
	 *   match is a Twitter match.
	 * @param {String} twitterHandlePrefixWhitespaceChar The whitespace char
	 *   before the @ sign in a Twitter handle match. This is needed because of
	 *   no lookbehinds in JS regexes, and is need to re-include the character
	 *   for the anchor tag replacement.
	 * @param {String} twitterHandle The actual Twitter user (i.e the word after
	 *   the @ sign in a Twitter match).
	 * @param {String} emailAddressMatch The matched email address for an email
	 *   address match.
	 * @param {String} urlMatch The matched URL string for a URL match.
	 * @param {String} protocolUrlMatch The match URL string for a protocol
	 *   match. Ex: 'http://yahoo.com'. This is used to match something like
	 *   'http://localhost', where we won't double check that the domain name
	 *   has at least one '.' in it.
	 * @param {String} wwwProtocolRelativeMatch The '//' for a protocol-relative
	 *   match from a 'www' url, with the character that comes before the '//'.
	 * @param {String} tldProtocolRelativeMatch The '//' for a protocol-relative
	 *   match from a TLD (top level domain) match, with the character that
	 *   comes before the '//'.
	 * @param {String} phoneMatch The matched text of a phone number
	 * @param {String} hashtagMatch The matched text of a Twitter
	 *   Hashtag, if the match is a Hashtag match.
	 * @param {String} hashtagPrefixWhitespaceChar The whitespace char
	 *   before the # sign in a Hashtag match. This is needed because of no
	 *   lookbehinds in JS regexes, and is need to re-include the character for
	 *   the anchor tag replacement.
	 * @param {String} hashtag The actual Hashtag (i.e the word
	 *   after the # sign in a Hashtag match).
	 *
	 * @return {Object} A "match description object". This will be `null` if the
	 *   match was invalid, or if a match type is disabled. Otherwise, this will
	 *   be an Object (map) with the following properties:
	 * @return {String} return.prefixStr The char(s) that should be prepended to
	 *   the replacement string. These are char(s) that were needed to be
	 *   included from the regex match that were ignored by processing code, and
	 *   should be re-inserted into the replacement stream.
	 * @return {String} return.suffixStr The char(s) that should be appended to
	 *   the replacement string. These are char(s) that were needed to be
	 *   included from the regex match that were ignored by processing code, and
	 *   should be re-inserted into the replacement stream.
	 * @return {Autolinker.match.Match} return.match The Match object that
	 *   represents the match that was found.
	 */
	processCandidateMatch : function(
		matchStr, twitterMatch, twitterHandlePrefixWhitespaceChar, twitterHandle,
		emailAddressMatch, urlMatch, protocolUrlMatch, wwwProtocolRelativeMatch,
		tldProtocolRelativeMatch, phoneMatch, hashtagMatch,
		hashtagPrefixWhitespaceChar, hashtag
	) {
		// Note: The `matchStr` variable wil be fixed up to remove characters that are no longer needed (which will
		// be added to `prefixStr` and `suffixStr`).

		var protocolRelativeMatch = wwwProtocolRelativeMatch || tldProtocolRelativeMatch,
		    match,  // Will be an Autolinker.match.Match object

		    prefixStr = "",  // A string to use to prefix the anchor tag that is created. This is needed for the Twitter and Hashtag matches.
		    suffixStr = "";  // A string to suffix the anchor tag that is created. This is used if there is a trailing parenthesis that should not be auto-linked.

		// Return out with `null` for match types that are disabled (url, email,
		// twitter, hashtag), or for matches that are invalid (false positives
		// from the matcherRegex, which can't use look-behinds since they are
		// unavailable in JS).
		if(
			( urlMatch && !this.urls ) ||
			( emailAddressMatch && !this.email ) ||
			( phoneMatch && !this.phone ) ||
			( twitterMatch && !this.twitter ) ||
			( hashtagMatch && !this.hashtag ) ||
			!this.matchValidator.isValidMatch( urlMatch, protocolUrlMatch, protocolRelativeMatch )
		) {
			return null;
		}

		// Handle a closing parenthesis at the end of the match, and exclude it
		// if there is not a matching open parenthesis
		// in the match itself.
		if( this.matchHasUnbalancedClosingParen( matchStr ) ) {
			matchStr = matchStr.substr( 0, matchStr.length - 1 );  // remove the trailing ")"
			suffixStr = ")";  // this will be added after the generated <a> tag
		}

		if( emailAddressMatch ) {
			match = new Autolinker.match.Email( { matchedText: matchStr, email: emailAddressMatch } );

		} else if( twitterMatch ) {
			// fix up the `matchStr` if there was a preceding whitespace char,
			// which was needed to determine the match itself (since there are
			// no look-behinds in JS regexes)
			if( twitterHandlePrefixWhitespaceChar ) {
				prefixStr = twitterHandlePrefixWhitespaceChar;
				matchStr = matchStr.slice( 1 );  // remove the prefixed whitespace char from the match
			}
			match = new Autolinker.match.Twitter( { matchedText: matchStr, twitterHandle: twitterHandle } );

		} else if( phoneMatch ) {
			// remove non-numeric values from phone number string
			var cleanNumber = matchStr.replace( /\D/g, '' );
 			match = new Autolinker.match.Phone( { matchedText: matchStr, number: cleanNumber } );

		} else if( hashtagMatch ) {
			// fix up the `matchStr` if there was a preceding whitespace char,
			// which was needed to determine the match itself (since there are
			// no look-behinds in JS regexes)
			if( hashtagPrefixWhitespaceChar ) {
				prefixStr = hashtagPrefixWhitespaceChar;
				matchStr = matchStr.slice( 1 );  // remove the prefixed whitespace char from the match
			}
			match = new Autolinker.match.Hashtag( { matchedText: matchStr, serviceName: this.hashtag, hashtag: hashtag } );

		} else {  // url match
			// If it's a protocol-relative '//' match, remove the character
			// before the '//' (which the matcherRegex needed to match due to
			// the lack of a negative look-behind in JavaScript regular
			// expressions)
			if( protocolRelativeMatch ) {
				var charBeforeMatch = protocolRelativeMatch.match( this.charBeforeProtocolRelMatchRegex )[ 1 ] || "";

				if( charBeforeMatch ) {  // fix up the `matchStr` if there was a preceding char before a protocol-relative match, which was needed to determine the match itself (since there are no look-behinds in JS regexes)
					prefixStr = charBeforeMatch;
					matchStr = matchStr.slice( 1 );  // remove the prefixed char from the match
				}
			}

			match = new Autolinker.match.Url( {
				matchedText : matchStr,
				url : matchStr,
				protocolUrlMatch : !!protocolUrlMatch,
				protocolRelativeMatch : !!protocolRelativeMatch,
				stripPrefix : this.stripPrefix
			} );
		}

		return {
			prefixStr : prefixStr,
			suffixStr : suffixStr,
			match     : match
		};
	},


	/**
	 * Determines if a match found has an unmatched closing parenthesis. If so,
	 * this parenthesis will be removed from the match itself, and appended
	 * after the generated anchor tag in {@link #processCandidateMatch}.
	 *
	 * A match may have an extra closing parenthesis at the end of the match
	 * because the regular expression must include parenthesis for URLs such as
	 * "wikipedia.com/something_(disambiguation)", which should be auto-linked.
	 *
	 * However, an extra parenthesis *will* be included when the URL itself is
	 * wrapped in parenthesis, such as in the case of "(wikipedia.com/something_(disambiguation))".
	 * In this case, the last closing parenthesis should *not* be part of the
	 * URL itself, and this method will return `true`.
	 *
	 * @private
	 * @param {String} matchStr The full match string from the {@link #matcherRegex}.
	 * @return {Boolean} `true` if there is an unbalanced closing parenthesis at
	 *   the end of the `matchStr`, `false` otherwise.
	 */
	matchHasUnbalancedClosingParen : function( matchStr ) {
		var lastChar = matchStr.charAt( matchStr.length - 1 );

		if( lastChar === ')' ) {
			var openParensMatch = matchStr.match( /\(/g ),
			    closeParensMatch = matchStr.match( /\)/g ),
			    numOpenParens = ( openParensMatch && openParensMatch.length ) || 0,
			    numCloseParens = ( closeParensMatch && closeParensMatch.length ) || 0;

			if( numOpenParens < numCloseParens ) {
				return true;
			}
		}

		return false;
	}

} );
/*global Autolinker */
/*jshint scripturl:true */
/**
 * @private
 * @class Autolinker.MatchValidator
 * @extends Object
 *
 * Used by Autolinker to filter out false positives from the
 * {@link Autolinker.matchParser.MatchParser#matcherRegex}.
 *
 * Due to the limitations of regular expressions (including the missing feature
 * of look-behinds in JS regular expressions), we cannot always determine the
 * validity of a given match. This class applies a bit of additional logic to
 * filter out any false positives that have been matched by the
 * {@link Autolinker.matchParser.MatchParser#matcherRegex}.
 */
Autolinker.MatchValidator = Autolinker.Util.extend( Object, {

	/**
	 * @private
	 * @property {RegExp} invalidProtocolRelMatchRegex
	 *
	 * The regular expression used to check a potential protocol-relative URL
	 * match, coming from the {@link Autolinker.matchParser.MatchParser#matcherRegex}.
	 * A protocol-relative URL is, for example, "//yahoo.com"
	 *
	 * This regular expression checks to see if there is a word character before
	 * the '//' match in order to determine if we should actually autolink a
	 * protocol-relative URL. This is needed because there is no negative
	 * look-behind in JavaScript regular expressions.
	 *
	 * For instance, we want to autolink something like "Go to: //google.com",
	 * but we don't want to autolink something like "abc//google.com"
	 */
	invalidProtocolRelMatchRegex : /^[\w]\/\//,

	/**
	 * Regex to test for a full protocol, with the two trailing slashes. Ex: 'http://'
	 *
	 * @private
	 * @property {RegExp} hasFullProtocolRegex
	 */
	hasFullProtocolRegex : /^[A-Za-z][-.+A-Za-z0-9]+:\/\//,

	/**
	 * Regex to find the URI scheme, such as 'mailto:'.
	 *
	 * This is used to filter out 'javascript:' and 'vbscript:' schemes.
	 *
	 * @private
	 * @property {RegExp} uriSchemeRegex
	 */
	uriSchemeRegex : /^[A-Za-z][-.+A-Za-z0-9]+:/,

	/**
	 * Regex to determine if at least one word char exists after the protocol (i.e. after the ':')
	 *
	 * @private
	 * @property {RegExp} hasWordCharAfterProtocolRegex
	 */
	hasWordCharAfterProtocolRegex : /:[^\s]*?[A-Za-z]/,


	/**
	 * Determines if a given match found by the {@link Autolinker.matchParser.MatchParser}
	 * is valid. Will return `false` for:
	 *
	 * 1) URL matches which do not have at least have one period ('.') in the
	 *    domain name (effectively skipping over matches like "abc:def").
	 *    However, URL matches with a protocol will be allowed (ex: 'http://localhost')
	 * 2) URL matches which do not have at least one word character in the
	 *    domain name (effectively skipping over matches like "git:1.0").
	 * 3) A protocol-relative url match (a URL beginning with '//') whose
	 *    previous character is a word character (effectively skipping over
	 *    strings like "abc//google.com")
	 *
	 * Otherwise, returns `true`.
	 *
	 * @param {String} urlMatch The matched URL, if there was one. Will be an
	 *   empty string if the match is not a URL match.
	 * @param {String} protocolUrlMatch The match URL string for a protocol
	 *   match. Ex: 'http://yahoo.com'. This is used to match something like
	 *   'http://localhost', where we won't double check that the domain name
	 *   has at least one '.' in it.
	 * @param {String} protocolRelativeMatch The protocol-relative string for a
	 *   URL match (i.e. '//'), possibly with a preceding character (ex, a
	 *   space, such as: ' //', or a letter, such as: 'a//'). The match is
	 *   invalid if there is a word character preceding the '//'.
	 * @return {Boolean} `true` if the match given is valid and should be
	 *   processed, or `false` if the match is invalid and/or should just not be
	 *   processed.
	 */
	isValidMatch : function( urlMatch, protocolUrlMatch, protocolRelativeMatch ) {
		if(
			( protocolUrlMatch && !this.isValidUriScheme( protocolUrlMatch ) ) ||
			this.urlMatchDoesNotHaveProtocolOrDot( urlMatch, protocolUrlMatch ) ||       // At least one period ('.') must exist in the URL match for us to consider it an actual URL, *unless* it was a full protocol match (like 'http://localhost')
			this.urlMatchDoesNotHaveAtLeastOneWordChar( urlMatch, protocolUrlMatch ) ||  // At least one letter character must exist in the domain name after a protocol match. Ex: skip over something like "git:1.0"
			this.isInvalidProtocolRelativeMatch( protocolRelativeMatch )                 // A protocol-relative match which has a word character in front of it (so we can skip something like "abc//google.com")
		) {
			return false;
		}

		return true;
	},


	/**
	 * Determines if the URI scheme is a valid scheme to be autolinked. Returns
	 * `false` if the scheme is 'javascript:' or 'vbscript:'
	 *
	 * @private
	 * @param {String} uriSchemeMatch The match URL string for a full URI scheme
	 *   match. Ex: 'http://yahoo.com' or 'mailto:a@a.com'.
	 * @return {Boolean} `true` if the scheme is a valid one, `false` otherwise.
	 */
	isValidUriScheme : function( uriSchemeMatch ) {
		var uriScheme = uriSchemeMatch.match( this.uriSchemeRegex )[ 0 ].toLowerCase();

		return ( uriScheme !== 'javascript:' && uriScheme !== 'vbscript:' );
	},


	/**
	 * Determines if a URL match does not have either:
	 *
	 * a) a full protocol (i.e. 'http://'), or
	 * b) at least one dot ('.') in the domain name (for a non-full-protocol
	 *    match).
	 *
	 * Either situation is considered an invalid URL (ex: 'git:d' does not have
	 * either the '://' part, or at least one dot in the domain name. If the
	 * match was 'git:abc.com', we would consider this valid.)
	 *
	 * @private
	 * @param {String} urlMatch The matched URL, if there was one. Will be an
	 *   empty string if the match is not a URL match.
	 * @param {String} protocolUrlMatch The match URL string for a protocol
	 *   match. Ex: 'http://yahoo.com'. This is used to match something like
	 *   'http://localhost', where we won't double check that the domain name
	 *   has at least one '.' in it.
	 * @return {Boolean} `true` if the URL match does not have a full protocol,
	 *   or at least one dot ('.') in a non-full-protocol match.
	 */
	urlMatchDoesNotHaveProtocolOrDot : function( urlMatch, protocolUrlMatch ) {
		return ( !!urlMatch && ( !protocolUrlMatch || !this.hasFullProtocolRegex.test( protocolUrlMatch ) ) && urlMatch.indexOf( '.' ) === -1 );
	},


	/**
	 * Determines if a URL match does not have at least one word character after
	 * the protocol (i.e. in the domain name).
	 *
	 * At least one letter character must exist in the domain name after a
	 * protocol match. Ex: skip over something like "git:1.0"
	 *
	 * @private
	 * @param {String} urlMatch The matched URL, if there was one. Will be an
	 *   empty string if the match is not a URL match.
	 * @param {String} protocolUrlMatch The match URL string for a protocol
	 *   match. Ex: 'http://yahoo.com'. This is used to know whether or not we
	 *   have a protocol in the URL string, in order to check for a word
	 *   character after the protocol separator (':').
	 * @return {Boolean} `true` if the URL match does not have at least one word
	 *   character in it after the protocol, `false` otherwise.
	 */
	urlMatchDoesNotHaveAtLeastOneWordChar : function( urlMatch, protocolUrlMatch ) {
		if( urlMatch && protocolUrlMatch ) {
			return !this.hasWordCharAfterProtocolRegex.test( urlMatch );
		} else {
			return false;
		}
	},


	/**
	 * Determines if a protocol-relative match is an invalid one. This method
	 * returns `true` if there is a `protocolRelativeMatch`, and that match
	 * contains a word character before the '//' (i.e. it must contain
	 * whitespace or nothing before the '//' in order to be considered valid).
	 *
	 * @private
	 * @param {String} protocolRelativeMatch The protocol-relative string for a
	 *   URL match (i.e. '//'), possibly with a preceding character (ex, a
	 *   space, such as: ' //', or a letter, such as: 'a//'). The match is
	 *   invalid if there is a word character preceding the '//'.
	 * @return {Boolean} `true` if it is an invalid protocol-relative match,
	 *   `false` otherwise.
	 */
	isInvalidProtocolRelativeMatch : function( protocolRelativeMatch ) {
		return ( !!protocolRelativeMatch && this.invalidProtocolRelMatchRegex.test( protocolRelativeMatch ) );
	}

} );
/*global Autolinker */
/**
 * @abstract
 * @class Autolinker.match.Match
 * 
 * Represents a match found in an input string which should be Autolinked. A Match object is what is provided in a 
 * {@link Autolinker#replaceFn replaceFn}, and may be used to query for details about the match.
 * 
 * For example:
 * 
 *     var input = "...";  // string with URLs, Email Addresses, and Twitter Handles
 *     
 *     var linkedText = Autolinker.link( input, {
 *         replaceFn : function( autolinker, match ) {
 *             console.log( "href = ", match.getAnchorHref() );
 *             console.log( "text = ", match.getAnchorText() );
 *         
 *             switch( match.getType() ) {
 *                 case 'url' : 
 *                     console.log( "url: ", match.getUrl() );
 *                     
 *                 case 'email' :
 *                     console.log( "email: ", match.getEmail() );
 *                     
 *                 case 'twitter' :
 *                     console.log( "twitter: ", match.getTwitterHandle() );
 *             }
 *         }
 *     } );
 *     
 * See the {@link Autolinker} class for more details on using the {@link Autolinker#replaceFn replaceFn}.
 */
Autolinker.match.Match = Autolinker.Util.extend( Object, {
	
	/**
	 * @cfg {String} matchedText (required)
	 * 
	 * The original text that was matched.
	 */
	
	
	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match instance, specified in an Object (map).
	 */
	constructor : function( cfg ) {
		Autolinker.Util.assign( this, cfg );
	},

	
	/**
	 * Returns a string name for the type of match that this class represents.
	 * 
	 * @abstract
	 * @return {String}
	 */
	getType : Autolinker.Util.abstractMethod,
	
	
	/**
	 * Returns the original text that was matched.
	 * 
	 * @return {String}
	 */
	getMatchedText : function() {
		return this.matchedText;
	},
	

	/**
	 * Returns the anchor href that should be generated for the match.
	 * 
	 * @abstract
	 * @return {String}
	 */
	getAnchorHref : Autolinker.Util.abstractMethod,
	
	
	/**
	 * Returns the anchor text that should be generated for the match.
	 * 
	 * @abstract
	 * @return {String}
	 */
	getAnchorText : Autolinker.Util.abstractMethod

} );
/*global Autolinker */
/**
 * @class Autolinker.match.Email
 * @extends Autolinker.match.Match
 * 
 * Represents a Email match found in an input string which should be Autolinked.
 * 
 * See this class's superclass ({@link Autolinker.match.Match}) for more details.
 */
Autolinker.match.Email = Autolinker.Util.extend( Autolinker.match.Match, {
	
	/**
	 * @cfg {String} email (required)
	 * 
	 * The email address that was matched.
	 */
	

	/**
	 * Returns a string name for the type of match that this class represents.
	 * 
	 * @return {String}
	 */
	getType : function() {
		return 'email';
	},
	
	
	/**
	 * Returns the email address that was matched.
	 * 
	 * @return {String}
	 */
	getEmail : function() {
		return this.email;
	},
	

	/**
	 * Returns the anchor href that should be generated for the match.
	 * 
	 * @return {String}
	 */
	getAnchorHref : function() {
		return 'mailto:' + this.email;
	},
	
	
	/**
	 * Returns the anchor text that should be generated for the match.
	 * 
	 * @return {String}
	 */
	getAnchorText : function() {
		return this.email;
	}
	
} );
/*global Autolinker */
/**
 * @class Autolinker.match.Hashtag
 * @extends Autolinker.match.Match
 *
 * Represents a Hashtag match found in an input string which should be
 * Autolinked.
 *
 * See this class's superclass ({@link Autolinker.match.Match}) for more
 * details.
 */
Autolinker.match.Hashtag = Autolinker.Util.extend( Autolinker.match.Match, {

	/**
	 * @cfg {String} serviceName (required)
	 *
	 * The service to point hashtag matches to. See {@link Autolinker#hashtag}
	 * for available values.
	 */

	/**
	 * @cfg {String} hashtag (required)
	 *
	 * The Hashtag that was matched, without the '#'.
	 */


	/**
	 * Returns the type of match that this class represents.
	 *
	 * @return {String}
	 */
	getType : function() {
		return 'hashtag';
	},


	/**
	 * Returns the matched hashtag.
	 *
	 * @return {String}
	 */
	getHashtag : function() {
		return this.hashtag;
	},


	/**
	 * Returns the anchor href that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorHref : function() {
		var serviceName = this.serviceName,
		    hashtag = this.hashtag;

		switch( serviceName ) {
			case 'twitter' :
				return 'https://twitter.com/hashtag/' + hashtag;
			case 'facebook' :
				return 'https://www.facebook.com/hashtag/' + hashtag;

			default :  // Shouldn't happen because Autolinker's constructor should block any invalid values, but just in case.
				throw new Error( 'Unknown service name to point hashtag to: ', serviceName );
		}
	},


	/**
	 * Returns the anchor text that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorText : function() {
		return '#' + this.hashtag;
	}

} );
/*global Autolinker */
/**
 * @class Autolinker.match.Phone
 * @extends Autolinker.match.Match
 *
 * Represents a Phone number match found in an input string which should be
 * Autolinked.
 *
 * See this class's superclass ({@link Autolinker.match.Match}) for more
 * details.
 */
Autolinker.match.Phone = Autolinker.Util.extend( Autolinker.match.Match, {

	/**
	 * @cfg {String} number (required)
	 *
	 * The phone number that was matched.
	 */


	/**
	 * Returns a string name for the type of match that this class represents.
	 *
	 * @return {String}
	 */
	getType : function() {
		return 'phone';
	},


	/**
	 * Returns the phone number that was matched.
	 *
	 * @return {String}
	 */
	getNumber: function() {
		return this.number;
	},


	/**
	 * Returns the anchor href that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorHref : function() {
		return 'tel:' + this.number;
	},


	/**
	 * Returns the anchor text that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorText : function() {
		return this.matchedText;
	}

} );

/*global Autolinker */
/**
 * @class Autolinker.match.Twitter
 * @extends Autolinker.match.Match
 * 
 * Represents a Twitter match found in an input string which should be Autolinked.
 * 
 * See this class's superclass ({@link Autolinker.match.Match}) for more details.
 */
Autolinker.match.Twitter = Autolinker.Util.extend( Autolinker.match.Match, {
	
	/**
	 * @cfg {String} twitterHandle (required)
	 * 
	 * The Twitter handle that was matched.
	 */
	

	/**
	 * Returns the type of match that this class represents.
	 * 
	 * @return {String}
	 */
	getType : function() {
		return 'twitter';
	},
	
	
	/**
	 * Returns a string name for the type of match that this class represents.
	 * 
	 * @return {String}
	 */
	getTwitterHandle : function() {
		return this.twitterHandle;
	},
	

	/**
	 * Returns the anchor href that should be generated for the match.
	 * 
	 * @return {String}
	 */
	getAnchorHref : function() {
		return 'https://twitter.com/' + this.twitterHandle;
	},
	
	
	/**
	 * Returns the anchor text that should be generated for the match.
	 * 
	 * @return {String}
	 */
	getAnchorText : function() {
		return '@' + this.twitterHandle;
	}
	
} );
/*global Autolinker */
/**
 * @class Autolinker.match.Url
 * @extends Autolinker.match.Match
 * 
 * Represents a Url match found in an input string which should be Autolinked.
 * 
 * See this class's superclass ({@link Autolinker.match.Match}) for more details.
 */
Autolinker.match.Url = Autolinker.Util.extend( Autolinker.match.Match, {
	
	/**
	 * @cfg {String} url (required)
	 * 
	 * The url that was matched.
	 */
	
	/**
	 * @cfg {Boolean} protocolUrlMatch (required)
	 * 
	 * `true` if the URL is a match which already has a protocol (i.e. 'http://'), `false` if the match was from a 'www' or
	 * known TLD match.
	 */
	
	/**
	 * @cfg {Boolean} protocolRelativeMatch (required)
	 * 
	 * `true` if the URL is a protocol-relative match. A protocol-relative match is a URL that starts with '//',
	 * and will be either http:// or https:// based on the protocol that the site is loaded under.
	 */
	
	/**
	 * @cfg {Boolean} stripPrefix (required)
	 * @inheritdoc Autolinker#stripPrefix
	 */
	

	/**
	 * @private
	 * @property {RegExp} urlPrefixRegex
	 * 
	 * A regular expression used to remove the 'http://' or 'https://' and/or the 'www.' from URLs.
	 */
	urlPrefixRegex: /^(https?:\/\/)?(www\.)?/i,
	
	/**
	 * @private
	 * @property {RegExp} protocolRelativeRegex
	 * 
	 * The regular expression used to remove the protocol-relative '//' from the {@link #url} string, for purposes
	 * of {@link #getAnchorText}. A protocol-relative URL is, for example, "//yahoo.com"
	 */
	protocolRelativeRegex : /^\/\//,
	
	/**
	 * @private
	 * @property {Boolean} protocolPrepended
	 * 
	 * Will be set to `true` if the 'http://' protocol has been prepended to the {@link #url} (because the
	 * {@link #url} did not have a protocol)
	 */
	protocolPrepended : false,
	

	/**
	 * Returns a string name for the type of match that this class represents.
	 * 
	 * @return {String}
	 */
	getType : function() {
		return 'url';
	},
	
	
	/**
	 * Returns the url that was matched, assuming the protocol to be 'http://' if the original
	 * match was missing a protocol.
	 * 
	 * @return {String}
	 */
	getUrl : function() {
		var url = this.url;
		
		// if the url string doesn't begin with a protocol, assume 'http://'
		if( !this.protocolRelativeMatch && !this.protocolUrlMatch && !this.protocolPrepended ) {
			url = this.url = 'http://' + url;
			
			this.protocolPrepended = true;
		}
		
		return url;
	},
	

	/**
	 * Returns the anchor href that should be generated for the match.
	 * 
	 * @return {String}
	 */
	getAnchorHref : function() {
		var url = this.getUrl();
		
		return url.replace( /&amp;/g, '&' );  // any &amp;'s in the URL should be converted back to '&' if they were displayed as &amp; in the source html 
	},
	
	
	/**
	 * Returns the anchor text that should be generated for the match.
	 * 
	 * @return {String}
	 */
	getAnchorText : function() {
		var anchorText = this.getUrl();
		
		if( this.protocolRelativeMatch ) {
			// Strip off any protocol-relative '//' from the anchor text
			anchorText = this.stripProtocolRelativePrefix( anchorText );
		}
		if( this.stripPrefix ) {
			anchorText = this.stripUrlPrefix( anchorText );
		}
		anchorText = this.removeTrailingSlash( anchorText );  // remove trailing slash, if there is one
		
		return anchorText;
	},
	
	
	// ---------------------------------------
	
	// Utility Functionality
	
	/**
	 * Strips the URL prefix (such as "http://" or "https://") from the given text.
	 * 
	 * @private
	 * @param {String} text The text of the anchor that is being generated, for which to strip off the
	 *   url prefix (such as stripping off "http://")
	 * @return {String} The `anchorText`, with the prefix stripped.
	 */
	stripUrlPrefix : function( text ) {
		return text.replace( this.urlPrefixRegex, '' );
	},
	
	
	/**
	 * Strips any protocol-relative '//' from the anchor text.
	 * 
	 * @private
	 * @param {String} text The text of the anchor that is being generated, for which to strip off the
	 *   protocol-relative prefix (such as stripping off "//")
	 * @return {String} The `anchorText`, with the protocol-relative prefix stripped.
	 */
	stripProtocolRelativePrefix : function( text ) {
		return text.replace( this.protocolRelativeRegex, '' );
	},
	
	
	/**
	 * Removes any trailing slash from the given `anchorText`, in preparation for the text to be displayed.
	 * 
	 * @private
	 * @param {String} anchorText The text of the anchor that is being generated, for which to remove any trailing
	 *   slash ('/') that may exist.
	 * @return {String} The `anchorText`, with the trailing slash removed.
	 */
	removeTrailingSlash : function( anchorText ) {
		if( anchorText.charAt( anchorText.length - 1 ) === '/' ) {
			anchorText = anchorText.slice( 0, -1 );
		}
		return anchorText;
	}
	
} );
return Autolinker;

}));

// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.webrtc-experiment.com/licence
// Documentation - github.com/streamproc/MediaStreamRecorder

// ______________________
// MediaStreamRecorder.js

function MediaStreamRecorder(mediaStream) {
    if (!mediaStream) throw 'MediaStream is mandatory.';

    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"
    this.start = function(timeSlice) {
        // Media Stream Recording API has not been implemented in chrome yet;
        // That's why using WebAudio API to record stereo audio in WAV format
        var Recorder = IsChrome ? window.StereoRecorder : window.MediaRecorderWrapper;

        // video recorder (in WebM format)
        if (this.mimeType.indexOf('video') != -1) {
            Recorder = IsChrome ? window.WhammyRecorder : window.MediaRecorderWrapper;
        }

        // video recorder (in GIF format)
        if (this.mimeType === 'image/gif') Recorder = window.GifRecorder;

        mediaRecorder = new Recorder(mediaStream);
        mediaRecorder.ondataavailable = this.ondataavailable;
        mediaRecorder.onstop = this.onstop;
        mediaRecorder.onStartedDrawingNonBlankFrames = this.onStartedDrawingNonBlankFrames;

        // Merge all data-types except "function"
        mediaRecorder = mergeProps(mediaRecorder, this);

        mediaRecorder.start(timeSlice);
    };

    this.onStartedDrawingNonBlankFrames = function() {};
    this.clearOldRecordedFrames = function() {
        if (!mediaRecorder) return;
        mediaRecorder.clearOldRecordedFrames();
    };

    this.stop = function() {
        if (mediaRecorder) mediaRecorder.stop();
    };

    this.ondataavailable = function(blob) {
        console.log('ondataavailable..', blob);
    };

    this.onstop = function(error) {
        console.warn('stopped..', error);
    };

    // Reference to "MediaRecorder.js"
    var mediaRecorder;
}

// below scripts are used to auto-load required files.

function loadScript(src, onload) {
    var root = window.MediaStreamRecorderScriptsDir;

    var script = document.createElement('script');
    script.src = root + src;
    script.onload = onload || function() {};
    document.documentElement.appendChild(script);
}

// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.webrtc-experiment.com/licence
// Documentation - github.com/streamproc/MediaStreamRecorder

// _____________________________
// Cross-Browser-Declarations.js

// animation-frame used in WebM recording
if (!window.requestAnimationFrame) {
    requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
}

if (!window.cancelAnimationFrame) {
    cancelAnimationFrame = window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame;
}

// WebAudio API representer
if (!window.AudioContext) {
    window.AudioContext = window.webkitAudioContext || window.mozAudioContext;
}

URL = window.URL || window.webkitURL;
navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

if (window.webkitMediaStream) window.MediaStream = window.webkitMediaStream;

window.IsChrome = !!navigator.webkitGetUserMedia;

// Merge all other data-types except "function"

function mergeProps(mergein, mergeto) {
    mergeto = reformatProps(mergeto);
    for (var t in mergeto) {
        if (typeof mergeto[t] !== 'function') {
            mergein[t] = mergeto[t];
        }
    }
    return mergein;
}

function reformatProps(obj) {
    var output = {};
    for (var o in obj) {
        if (o.indexOf('-') != -1) {
            var splitted = o.split('-');
            var name = splitted[0] + splitted[1].split('')[0].toUpperCase() + splitted[1].substr(1);
            output[name] = obj[o];
        } else output[o] = obj[o];
    }
    return output;
}

// ______________ (used to handle stuff like http://goo.gl/xmE5eg) issue #129
// ObjectStore.js
var ObjectStore = {
    AudioContext: window.AudioContext || window.webkitAudioContext
};

// ================
// MediaRecorder.js

/**
 * Implementation of https://dvcs.w3.org/hg/dap/raw-file/default/media-stream-capture/MediaRecorder.html
 * The MediaRecorder accepts a mediaStream as input source passed from UA. When recorder starts,
 * a MediaEncoder will be created and accept the mediaStream as input source.
 * Encoder will get the raw data by track data changes, encode it by selected MIME Type, then store the encoded in EncodedBufferCache object.
 * The encoded data will be extracted on every timeslice passed from Start function call or by RequestData function.
 * Thread model:
 * When the recorder starts, it creates a "Media Encoder" thread to read data from MediaEncoder object and store buffer in EncodedBufferCache object.
 * Also extract the encoded data and create blobs on every timeslice passed from start function or RequestData function called by UA.
 */

function MediaRecorderWrapper(mediaStream) {
    // if user chosen only audio option; and he tried to pass MediaStream with
    // both audio and video tracks;
    // using a dirty workaround to generate audio-only stream so that we can get audio/ogg output.
    if (this.type == 'audio' && mediaStream.getVideoTracks && mediaStream.getVideoTracks().length && !navigator.mozGetUserMedia) {
        var context = new AudioContext();
        var mediaStreamSource = context.createMediaStreamSource(mediaStream);

        var destination = context.createMediaStreamDestination();
        mediaStreamSource.connect(destination);

        mediaStream = destination.stream;
    }

    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"

    // starting a recording session; which will initiate "Reading Thread"
    // "Reading Thread" are used to prevent main-thread blocking scenarios
    this.start = function(mTimeSlice) {
        mTimeSlice = mTimeSlice || 1000;
        isStopRecording = false;

        function startRecording() {
            if (isStopRecording) return;

            mediaRecorder = new MediaRecorder(mediaStream);

            mediaRecorder.ondataavailable = function(e) {
                console.log('ondataavailable', e.data.type, e.data.size, e.data);
                // mediaRecorder.state == 'recording' means that media recorder is associated with "session"
                // mediaRecorder.state == 'stopped' means that media recorder is detached from the "session" ... in this case; "session" will also be deleted.

                if (!e.data.size) {
                    console.warn('Recording of', e.data.type, 'failed.');
                    return;
                }

                // at this stage, Firefox MediaRecorder API doesn't allow to choose the output mimeType format!
                var blob = new window.Blob([e.data], {
                    type: e.data.type || self.mimeType || 'audio/ogg' // It specifies the container format as well as the audio and video capture formats.
                });

                // Dispatching OnDataAvailable Handler
                self.ondataavailable(blob);
            };

            mediaRecorder.onstop = function(error) {
                // for video recording on Firefox, it will be fired quickly.
                // because work on VideoFrameContainer is still in progress
                // https://wiki.mozilla.org/Gecko:MediaRecorder

                // self.onstop(error);
            };

            // http://www.w3.org/TR/2012/WD-dom-20121206/#error-names-table
            // showBrowserSpecificIndicator: got neither video nor audio access
            // "VideoFrameContainer" can't be accessed directly; unable to find any wrapper using it.
            // that's why there is no video recording support on firefox

            // video recording fails because there is no encoder available there
            // http://dxr.mozilla.org/mozilla-central/source/content/media/MediaRecorder.cpp#317

            // Maybe "Read Thread" doesn't fire video-track read notification;
            // that's why shutdown notification is received; and "Read Thread" is stopped.

            // https://dvcs.w3.org/hg/dap/raw-file/default/media-stream-capture/MediaRecorder.html#error-handling
            mediaRecorder.onerror = function(error) {
                console.error(error);
                self.start(mTimeSlice);
            };

            mediaRecorder.onwarning = function(warning) {
                console.warn(warning);
            };

            // void start(optional long mTimeSlice)
            // The interval of passing encoded data from EncodedBufferCache to onDataAvailable
            // handler. "mTimeSlice < 0" means Session object does not push encoded data to
            // onDataAvailable, instead, it passive wait the client side pull encoded data
            // by calling requestData API.
            mediaRecorder.start(0);

            // Start recording. If timeSlice has been provided, mediaRecorder will
            // raise a dataavailable event containing the Blob of collected data on every timeSlice milliseconds.
            // If timeSlice isn't provided, UA should call the RequestData to obtain the Blob data, also set the mTimeSlice to zero.

            setTimeout(function() {
                mediaRecorder.stop();
                startRecording();
            }, mTimeSlice);
        }

        // dirty workaround to fix Firefox 2nd+ intervals
        startRecording();
    };

    var isStopRecording = false;

    this.stop = function() {
        isStopRecording = true;

        if (self.onstop) {
            self.onstop({});
        }
    };

    this.ondataavailable = this.onstop = function() {};

    // Reference to itself
    var self = this;

    if (!self.mimeType && !!mediaStream.getAudioTracks) {
        self.mimeType = mediaStream.getAudioTracks().length && mediaStream.getVideoTracks().length ? 'video/webm' : 'audio/ogg';
    }

    // Reference to "MediaRecorderWrapper" object
    var mediaRecorder;
}

// =================
// StereoRecorder.js

function StereoRecorder(mediaStream) {
    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"
    this.start = function(timeSlice) {
        timeSlice = timeSlice || 1000;

        mediaRecorder = new StereoAudioRecorder(mediaStream, this);

        mediaRecorder.record();

        timeout = setInterval(function() {
            mediaRecorder.requestData();
        }, timeSlice);
    };

    this.stop = function() {
        if (mediaRecorder) {
            mediaRecorder.stop();
            clearTimeout(timeout);
        }
    };

    this.ondataavailable = function() {};

    // Reference to "StereoAudioRecorder" object
    var mediaRecorder;
    var timeout;
}

// ======================
// StereoAudioRecorder.js

// source code from: http://typedarray.org/wp-content/projects/WebAudioRecorder/script.js

function StereoAudioRecorder(mediaStream, root) {
    // variables
    var leftchannel = [];
    var rightchannel = [];
    var scriptprocessornode;
    var recording = false;
    var recordingLength = 0;
    var volume;
    var audioInput;
    var sampleRate = root.sampleRate || 44100; // range: 22050 to 96000
    var audioContext;
    var context;

    var numChannels = root.audioChannels || 2;

    this.record = function() {
        recording = true;
        // reset the buffers for the new recording
        leftchannel.length = rightchannel.length = 0;
        recordingLength = 0;
    };

    this.requestData = function() {
        if (recordingLength == 0) {
            requestDataInvoked = false;
            return;
        }

        requestDataInvoked = true;
        // clone stuff
        var internal_leftchannel = leftchannel.slice(0);
        var internal_rightchannel = rightchannel.slice(0);
        var internal_recordingLength = recordingLength;

        // reset the buffers for the new recording
        leftchannel.length = rightchannel.length = [];
        recordingLength = 0;
        requestDataInvoked = false;

        // we flat the left and right channels down
        var leftBuffer = mergeBuffers(internal_leftchannel, internal_recordingLength);
        var rightBuffer = mergeBuffers(internal_leftchannel, internal_recordingLength);

        // we interleave both channels together
        if (numChannels === 2) {
            var interleaved = interleave(leftBuffer, rightBuffer);
        } else {
            var interleaved = leftBuffer;
        }

        // we create our wav file
        var buffer = new ArrayBuffer(44 + interleaved.length * 2);
        var view = new DataView(buffer);

        // RIFF chunk descriptor
        writeUTFBytes(view, 0, 'RIFF');
        view.setUint32(4, 44 + interleaved.length * 2, true);
        writeUTFBytes(view, 8, 'WAVE');
        // FMT sub-chunk
        writeUTFBytes(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        // stereo (2 channels)
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 4, true);
        view.setUint16(32, numChannels * 2, true);
        view.setUint16(34, 16, true);
        // data sub-chunk
        writeUTFBytes(view, 36, 'data');
        view.setUint32(40, interleaved.length * 2, true);

        // write the PCM samples
        var lng = interleaved.length;
        var index = 44;
        var volume = 1;
        for (var i = 0; i < lng; i++) {
            view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
            index += 2;
        }

        // our final binary blob
        var blob = new Blob([view], {
            type: 'audio/wav'
        });

        console.debug('audio recorded blob size:', bytesToSize(blob.size));

        root.ondataavailable(blob);
    };

    this.stop = function() {
        // we stop recording
        recording = false;
        this.requestData();
    };

    function interleave(leftChannel, rightChannel) {
        var length = leftChannel.length + rightChannel.length;
        var result = new Float32Array(length);

        var inputIndex = 0;

        for (var index = 0; index < length;) {
            result[index++] = leftChannel[inputIndex];
            result[index++] = rightChannel[inputIndex];
            inputIndex++;
        }
        return result;
    }

    function mergeBuffers(channelBuffer, recordingLength) {
        var result = new Float32Array(recordingLength);
        var offset = 0;
        var lng = channelBuffer.length;
        for (var i = 0; i < lng; i++) {
            var buffer = channelBuffer[i];
            result.set(buffer, offset);
            offset += buffer.length;
        }
        return result;
    }

    function writeUTFBytes(view, offset, string) {
        var lng = string.length;
        for (var i = 0; i < lng; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    // creates the audio context

    // creates the audio context
    var audioContext = ObjectStore.AudioContext;

    if (!ObjectStore.AudioContextConstructor)
        ObjectStore.AudioContextConstructor = new audioContext();

    var context = ObjectStore.AudioContextConstructor;

    // creates a gain node
    if (!ObjectStore.VolumeGainNode)
        ObjectStore.VolumeGainNode = context.createGain();

    var volume = ObjectStore.VolumeGainNode;

    // creates an audio node from the microphone incoming stream
    if (!ObjectStore.AudioInput)
        ObjectStore.AudioInput = context.createMediaStreamSource(mediaStream);

    // creates an audio node from the microphone incoming stream
    var audioInput = ObjectStore.AudioInput;

    // connect the stream to the gain node
    audioInput.connect(volume);

    /* From the spec: This value controls how frequently the audioprocess event is
    dispatched and how many sample-frames need to be processed each call.
    Lower values for buffer size will result in a lower (better) latency.
    Higher values will be necessary to avoid audio breakup and glitches 
    Legal values are 256, 512, 1024, 2048, 4096, 8192, and 16384.*/
    var bufferSize = root.bufferSize || 2048;
    if (root.bufferSize == 0) bufferSize = 0;

    if (context.createJavaScriptNode) {
        scriptprocessornode = context.createJavaScriptNode(bufferSize, numChannels, numChannels);
    } else if (context.createScriptProcessor) {
        scriptprocessornode = context.createScriptProcessor(bufferSize, numChannels, numChannels);
    } else {
        throw 'WebAudio API has no support on this browser.';
    }

    bufferSize = scriptprocessornode.bufferSize;

    console.debug('using audio buffer-size:', bufferSize);

    var requestDataInvoked = false;

    // sometimes "scriptprocessornode" disconnects from he destination-node
    // and there is no exception thrown in this case.
    // and obviously no further "ondataavailable" events will be emitted.
    // below global-scope variable is added to debug such unexpected but "rare" cases.
    window.scriptprocessornode = scriptprocessornode;

    if (numChannels == 1) {
        console.debug('All right-channels are skipped.');
    }

    // http://webaudio.github.io/web-audio-api/#the-scriptprocessornode-interface
    scriptprocessornode.onaudioprocess = function(e) {
        if (!recording || requestDataInvoked) return;

        var left = e.inputBuffer.getChannelData(0);
        leftchannel.push(new Float32Array(left));

        if (numChannels == 2) {
            var right = e.inputBuffer.getChannelData(1);
            rightchannel.push(new Float32Array(right));
        }
        recordingLength += bufferSize;
    };

    volume.connect(scriptprocessornode);
    scriptprocessornode.connect(context.destination);
}

// =======================
// WhammyRecorderHelper.js

function WhammyRecorderHelper(mediaStream, root) {
    this.record = function(timeSlice) {
        if (!this.width) this.width = 320;
        if (!this.height) this.height = 240;

        if (this.video && this.video instanceof HTMLVideoElement) {
            if (!this.width) this.width = video.videoWidth || 320;
            if (!this.height) this.height = video.videoHeight || 240;
        }

        if (!this.video) {
            this.video = {
                width: this.width,
                height: this.height
            };
        }

        if (!this.canvas) {
            this.canvas = {
                width: this.width,
                height: this.height
            };
        }

        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;

        // setting defaults
        if (this.video && this.video instanceof HTMLVideoElement) {
            video = this.video.cloneNode();
        } else {
            video = document.createElement('video');
            video.src = URL.createObjectURL(mediaStream);

            video.width = this.video.width;
            video.height = this.video.height;
        }

        video.muted = true;
        video.play();

        lastTime = new Date().getTime();
        whammy = new Whammy.Video();

        console.log('canvas resolutions', canvas.width, '*', canvas.height);
        console.log('video width/height', video.width || canvas.width, '*', video.height || canvas.height);

        drawFrames();
    };

    this.clearOldRecordedFrames = function() {
        frames = [];
    };

    var requestDataInvoked = false;
    this.requestData = function() {
        if (!frames.length) {
            requestDataInvoked = false;
            return;
        }

        requestDataInvoked = true;
        // clone stuff
        var internal_frames = frames.slice(0);

        // reset the frames for the new recording
        frames = [];

        whammy.frames = dropBlackFrames(internal_frames, -1);

        var WebM_Blob = whammy.compile();
        root.ondataavailable(WebM_Blob);

        console.debug('video recorded blob size:', bytesToSize(WebM_Blob.size));

        requestDataInvoked = false;
    };

    var frames = [];

    var isOnStartedDrawingNonBlankFramesInvoked = false;

    function drawFrames() {
        if (isStopDrawing) return;

        if (requestDataInvoked) return setTimeout(drawFrames, 100);

        var duration = new Date().getTime() - lastTime;
        if (!duration) return drawFrames();

        // via webrtc-experiment#206, by Jack i.e. @Seymourr
        lastTime = new Date().getTime();

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        !isStopDrawing && frames.push({
            duration: duration,
            image: canvas.toDataURL('image/webp')
        });

        if (!isOnStartedDrawingNonBlankFramesInvoked && !isBlankFrame(frames[frames.length - 1])) {
            isOnStartedDrawingNonBlankFramesInvoked = true;
            root.onStartedDrawingNonBlankFrames();
        }

        setTimeout(drawFrames, 10);
    }

    var isStopDrawing = false;

    this.stop = function() {
        isStopDrawing = true;
        this.requestData();
    };

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    var video;
    var lastTime;
    var whammy;

    var self = this;

    function isBlankFrame(frame, _pixTolerance, _frameTolerance) {
        var localCanvas = document.createElement('canvas');
        localCanvas.width = canvas.width;
        localCanvas.height = canvas.height;
        var context2d = localCanvas.getContext('2d');

        var sampleColor = {
            r: 0,
            g: 0,
            b: 0
        };
        var maxColorDifference = Math.sqrt(
            Math.pow(255, 2) +
            Math.pow(255, 2) +
            Math.pow(255, 2)
        );
        var pixTolerance = _pixTolerance && _pixTolerance >= 0 && _pixTolerance <= 1 ? _pixTolerance : 0;
        var frameTolerance = _frameTolerance && _frameTolerance >= 0 && _frameTolerance <= 1 ? _frameTolerance : 0;

        var matchPixCount, endPixCheck, maxPixCount;

        var image = new Image();
        image.src = frame.image;
        context2d.drawImage(image, 0, 0, canvas.width, canvas.height);
        var imageData = context2d.getImageData(0, 0, canvas.width, canvas.height);
        matchPixCount = 0;
        endPixCheck = imageData.data.length;
        maxPixCount = imageData.data.length / 4;

        for (var pix = 0; pix < endPixCheck; pix += 4) {
            var currentColor = {
                r: imageData.data[pix],
                g: imageData.data[pix + 1],
                b: imageData.data[pix + 2]
            };
            var colorDifference = Math.sqrt(
                Math.pow(currentColor.r - sampleColor.r, 2) +
                Math.pow(currentColor.g - sampleColor.g, 2) +
                Math.pow(currentColor.b - sampleColor.b, 2)
            );
            // difference in color it is difference in color vectors (r1,g1,b1) <=> (r2,g2,b2)
            if (colorDifference <= maxColorDifference * pixTolerance) {
                matchPixCount++;
            }
        }

        if (maxPixCount - matchPixCount <= maxPixCount * frameTolerance) {
            return false;
        } else {
            return true;
        }
    }

    function dropBlackFrames(_frames, _framesToCheck, _pixTolerance, _frameTolerance) {
        var localCanvas = document.createElement('canvas');
        localCanvas.width = canvas.width;
        localCanvas.height = canvas.height;
        var context2d = localCanvas.getContext('2d');
        var resultFrames = [];

        var checkUntilNotBlack = _framesToCheck === -1;
        var endCheckFrame = (_framesToCheck && _framesToCheck > 0 && _framesToCheck <= _frames.length) ?
            _framesToCheck : _frames.length;
        var sampleColor = {
            r: 0,
            g: 0,
            b: 0
        };
        var maxColorDifference = Math.sqrt(
            Math.pow(255, 2) +
            Math.pow(255, 2) +
            Math.pow(255, 2)
        );
        var pixTolerance = _pixTolerance && _pixTolerance >= 0 && _pixTolerance <= 1 ? _pixTolerance : 0;
        var frameTolerance = _frameTolerance && _frameTolerance >= 0 && _frameTolerance <= 1 ? _frameTolerance : 0;
        var doNotCheckNext = false;

        for (var f = 0; f < endCheckFrame; f++) {
            var matchPixCount, endPixCheck, maxPixCount;

            if (!doNotCheckNext) {
                var image = new Image();
                image.src = _frames[f].image;
                context2d.drawImage(image, 0, 0, canvas.width, canvas.height);
                var imageData = context2d.getImageData(0, 0, canvas.width, canvas.height);
                matchPixCount = 0;
                endPixCheck = imageData.data.length;
                maxPixCount = imageData.data.length / 4;

                for (var pix = 0; pix < endPixCheck; pix += 4) {
                    var currentColor = {
                        r: imageData.data[pix],
                        g: imageData.data[pix + 1],
                        b: imageData.data[pix + 2]
                    };
                    var colorDifference = Math.sqrt(
                        Math.pow(currentColor.r - sampleColor.r, 2) +
                        Math.pow(currentColor.g - sampleColor.g, 2) +
                        Math.pow(currentColor.b - sampleColor.b, 2)
                    );
                    // difference in color it is difference in color vectors (r1,g1,b1) <=> (r2,g2,b2)
                    if (colorDifference <= maxColorDifference * pixTolerance) {
                        matchPixCount++;
                    }
                }
            }

            if (!doNotCheckNext && maxPixCount - matchPixCount <= maxPixCount * frameTolerance) {
                // console.log('removed black frame : ' + f + ' ; frame duration ' + _frames[f].duration);
            } else {
                // console.log('frame is passed : ' + f);
                if (checkUntilNotBlack) {
                    doNotCheckNext = true;
                }
                resultFrames.push(_frames[f]);
            }
        }

        resultFrames = resultFrames.concat(_frames.slice(endCheckFrame));

        if (resultFrames.length <= 0) {
            // at least one last frame should be available for next manipulation
            // if total duration of all frames will be < 1000 than ffmpeg doesn't work well...
            resultFrames.push(_frames[_frames.length - 1]);
        }

        return resultFrames;
    }
}

// =================
// WhammyRecorder.js

function WhammyRecorder(mediaStream) {
    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"
    this.start = function(timeSlice) {
        timeSlice = timeSlice || 1000;

        mediaRecorder = new WhammyRecorderHelper(mediaStream, this);

        for (var prop in this) {
            if (typeof this[prop] !== 'function') {
                mediaRecorder[prop] = this[prop];
            }
        }

        mediaRecorder.record();

        timeout = setInterval(function() {
            mediaRecorder.requestData();
        }, timeSlice);
    };

    this.stop = function() {
        if (mediaRecorder) {
            mediaRecorder.stop();
            clearTimeout(timeout);
        }
    };

    this.clearOldRecordedFrames = function() {
        if (mediaRecorder) {
            mediaRecorder.clearOldRecordedFrames();
        }
    };

    this.ondataavailable = function() {};

    // Reference to "WhammyRecorder" object
    var mediaRecorder;
    var timeout;
}


// Muaz Khan     - https://github.com/muaz-khan 
// neizerth      - https://github.com/neizerth
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/streamproc/MediaStreamRecorder

// Note:
// ==========================================================
// whammy.js is an "external library" 
// and has its own copyrights. Taken from "Whammy" project.


// https://github.com/antimatter15/whammy/blob/master/LICENSE
// =========
// Whammy.js

// todo: Firefox now supports webp for webm containers!
// their MediaRecorder implementation works well!
// should we provide an option to record via Whammy.js or MediaRecorder API is a better solution?

var Whammy = (function() {

    function toWebM(frames) {
        var info = checkFrames(frames);

        var CLUSTER_MAX_DURATION = 30000;

        var EBML = [{
            "id": 0x1a45dfa3, // EBML
            "data": [{
                "data": 1,
                "id": 0x4286 // EBMLVersion
            }, {
                "data": 1,
                "id": 0x42f7 // EBMLReadVersion
            }, {
                "data": 4,
                "id": 0x42f2 // EBMLMaxIDLength
            }, {
                "data": 8,
                "id": 0x42f3 // EBMLMaxSizeLength
            }, {
                "data": "webm",
                "id": 0x4282 // DocType
            }, {
                "data": 2,
                "id": 0x4287 // DocTypeVersion
            }, {
                "data": 2,
                "id": 0x4285 // DocTypeReadVersion
            }]
        }, {
            "id": 0x18538067, // Segment
            "data": [{
                "id": 0x1549a966, // Info
                "data": [{
                    "data": 1e6, //do things in millisecs (num of nanosecs for duration scale)
                    "id": 0x2ad7b1 // TimecodeScale
                }, {
                    "data": "whammy",
                    "id": 0x4d80 // MuxingApp
                }, {
                    "data": "whammy",
                    "id": 0x5741 // WritingApp
                }, {
                    "data": doubleToString(info.duration),
                    "id": 0x4489 // Duration
                }]
            }, {
                "id": 0x1654ae6b, // Tracks
                "data": [{
                    "id": 0xae, // TrackEntry
                    "data": [{
                        "data": 1,
                        "id": 0xd7 // TrackNumber
                    }, {
                        "data": 1,
                        "id": 0x63c5 // TrackUID
                    }, {
                        "data": 0,
                        "id": 0x9c // FlagLacing
                    }, {
                        "data": "und",
                        "id": 0x22b59c // Language
                    }, {
                        "data": "V_VP8",
                        "id": 0x86 // CodecID
                    }, {
                        "data": "VP8",
                        "id": 0x258688 // CodecName
                    }, {
                        "data": 1,
                        "id": 0x83 // TrackType
                    }, {
                        "id": 0xe0, // Video
                        "data": [{
                            "data": info.width,
                            "id": 0xb0 // PixelWidth
                        }, {
                            "data": info.height,
                            "id": 0xba // PixelHeight
                        }]
                    }]
                }]
            }]
        }];

        //Generate clusters (max duration)
        var frameNumber = 0;
        var clusterTimecode = 0;
        while (frameNumber < frames.length) {

            var clusterFrames = [];
            var clusterDuration = 0;
            do {
                clusterFrames.push(frames[frameNumber]);
                clusterDuration += frames[frameNumber].duration;
                frameNumber++;
            } while (frameNumber < frames.length && clusterDuration < CLUSTER_MAX_DURATION);

            var clusterCounter = 0;
            var cluster = {
                "id": 0x1f43b675, // Cluster
                "data": [{
                    "data": clusterTimecode,
                    "id": 0xe7 // Timecode
                }].concat(clusterFrames.map(function(webp) {
                    var block = makeSimpleBlock({
                        discardable: 0,
                        frame: webp.data.slice(4),
                        invisible: 0,
                        keyframe: 1,
                        lacing: 0,
                        trackNum: 1,
                        timecode: Math.round(clusterCounter)
                    });
                    clusterCounter += webp.duration;
                    return {
                        data: block,
                        id: 0xa3
                    };
                }))
            }; //Add cluster to segment
            EBML[1].data.push(cluster);
            clusterTimecode += clusterDuration;
        }

        return generateEBML(EBML);
    }

    // sums the lengths of all the frames and gets the duration

    function checkFrames(frames) {
        if (!frames[0]) {
            console.warn('Something went wrong. Maybe WebP format is not supported in the current browser.');
            return;
        }

        var width = frames[0].width,
            height = frames[0].height,
            duration = frames[0].duration;

        for (var i = 1; i < frames.length; i++) {
            duration += frames[i].duration;
        }
        return {
            duration: duration,
            width: width,
            height: height
        };
    }

    function numToBuffer(num) {
        var parts = [];
        while (num > 0) {
            parts.push(num & 0xff);
            num = num >> 8;
        }
        return new Uint8Array(parts.reverse());
    }

    function strToBuffer(str) {
        return new Uint8Array(str.split('').map(function(e) {
            return e.charCodeAt(0);
        }));
    }

    function bitsToBuffer(bits) {
        var data = [];
        var pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : '';
        bits = pad + bits;
        for (var i = 0; i < bits.length; i += 8) {
            data.push(parseInt(bits.substr(i, 8), 2));
        }
        return new Uint8Array(data);
    }

    function generateEBML(json) {
        var ebml = [];
        for (var i = 0; i < json.length; i++) {
            var data = json[i].data;
            if (typeof data == 'object') data = generateEBML(data);
            if (typeof data == 'number') data = bitsToBuffer(data.toString(2));
            if (typeof data == 'string') data = strToBuffer(data);

            var len = data.size || data.byteLength || data.length;
            var zeroes = Math.ceil(Math.ceil(Math.log(len) / Math.log(2)) / 8);
            var size_str = len.toString(2);
            var padded = (new Array((zeroes * 7 + 7 + 1) - size_str.length)).join('0') + size_str;
            var size = (new Array(zeroes)).join('0') + '1' + padded;

            ebml.push(numToBuffer(json[i].id));
            ebml.push(bitsToBuffer(size));
            ebml.push(data);
        }

        return new Blob(ebml, {
            type: "video/webm"
        });
    }

    function toBinStr_old(bits) {
        var data = '';
        var pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : '';
        bits = pad + bits;
        for (var i = 0; i < bits.length; i += 8) {
            data += String.fromCharCode(parseInt(bits.substr(i, 8), 2));
        }
        return data;
    }

    function generateEBML_old(json) {
        var ebml = '';
        for (var i = 0; i < json.length; i++) {
            var data = json[i].data;
            if (typeof data == 'object') data = generateEBML_old(data);
            if (typeof data == 'number') data = toBinStr_old(data.toString(2));

            var len = data.length;
            var zeroes = Math.ceil(Math.ceil(Math.log(len) / Math.log(2)) / 8);
            var size_str = len.toString(2);
            var padded = (new Array((zeroes * 7 + 7 + 1) - size_str.length)).join('0') + size_str;
            var size = (new Array(zeroes)).join('0') + '1' + padded;

            ebml += toBinStr_old(json[i].id.toString(2)) + toBinStr_old(size) + data;

        }
        return ebml;
    }

    function makeSimpleBlock(data) {
        var flags = 0;
        if (data.keyframe) flags |= 128;
        if (data.invisible) flags |= 8;
        if (data.lacing) flags |= (data.lacing << 1);
        if (data.discardable) flags |= 1;
        if (data.trackNum > 127) {
            throw "TrackNumber > 127 not supported";
        }
        var out = [data.trackNum | 0x80, data.timecode >> 8, data.timecode & 0xff, flags].map(function(e) {
            return String.fromCharCode(e);
        }).join('') + data.frame;

        return out;
    }

    function parseWebP(riff) {
        var VP8 = riff.RIFF[0].WEBP[0];

        var frame_start = VP8.indexOf('\x9d\x01\x2a'); // A VP8 keyframe starts with the 0x9d012a header
        for (var i = 0, c = []; i < 4; i++) c[i] = VP8.charCodeAt(frame_start + 3 + i);

        var width, height, tmp;

        //the code below is literally copied verbatim from the bitstream spec
        tmp = (c[1] << 8) | c[0];
        width = tmp & 0x3FFF;
        tmp = (c[3] << 8) | c[2];
        height = tmp & 0x3FFF;
        return {
            width: width,
            height: height,
            data: VP8,
            riff: riff
        };
    }

    function parseRIFF(string) {
        var offset = 0;
        var chunks = {};

        while (offset < string.length) {
            var id = string.substr(offset, 4);
            var len = parseInt(string.substr(offset + 4, 4).split('').map(function(i) {
                var unpadded = i.charCodeAt(0).toString(2);
                return (new Array(8 - unpadded.length + 1)).join('0') + unpadded;
            }).join(''), 2);
            var data = string.substr(offset + 4 + 4, len);
            offset += 4 + 4 + len;
            chunks[id] = chunks[id] || [];

            if (id == 'RIFF' || id == 'LIST') {
                chunks[id].push(parseRIFF(data));
            } else {
                chunks[id].push(data);
            }
        }
        return chunks;
    }

    function doubleToString(num) {
        return [].slice.call(
            new Uint8Array((new Float64Array([num])).buffer), 0).map(function(e) {
            return String.fromCharCode(e);
        }).reverse().join('');
    }

    // a more abstract-ish API

    function WhammyVideo(duration) {
        this.frames = [];
        this.duration = duration || 1;
        this.quality = 100;
    }

    WhammyVideo.prototype.add = function(frame, duration) {
        if ('canvas' in frame) { //CanvasRenderingContext2D
            frame = frame.canvas;
        }

        if ('toDataURL' in frame) {
            frame = frame.toDataURL('image/webp', this.quality);
        }

        if (!(/^data:image\/webp;base64,/ig).test(frame)) {
            throw "Input must be formatted properly as a base64 encoded DataURI of type image/webp";
        }
        this.frames.push({
            image: frame,
            duration: duration || this.duration
        });
    };
    WhammyVideo.prototype.compile = function() {
        return new toWebM(this.frames.map(function(frame) {
            var webp = parseWebP(parseRIFF(atob(frame.image.slice(23))));
            webp.duration = frame.duration;
            return webp;
        }));
    };
    return {
        Video: WhammyVideo,
        toWebM: toWebM
    };
})();

// Muaz Khan     - https://github.com/muaz-khan 
// neizerth      - https://github.com/neizerth
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/streamproc/MediaStreamRecorder
// ==========================================================
// GifRecorder.js

function GifRecorder(mediaStream) {
    if (!window.GIFEncoder) {
        throw 'Please link: https://cdn.webrtc-experiment.com/gif-recorder.js';
    }

    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"
    this.start = function(timeSlice) {
        timeSlice = timeSlice || 1000;

        var imageWidth = this.videoWidth || 320;
        var imageHeight = this.videoHeight || 240;

        canvas.width = video.width = imageWidth;
        canvas.height = video.height = imageHeight;

        // external library to record as GIF images
        gifEncoder = new GIFEncoder();

        // void setRepeat(int iter)
        // Sets the number of times the set of GIF frames should be played.
        // Default is 1; 0 means play indefinitely.
        gifEncoder.setRepeat(0);

        // void setFrameRate(Number fps)
        // Sets frame rate in frames per second.
        // Equivalent to setDelay(1000/fps).
        // Using "setDelay" instead of "setFrameRate"
        gifEncoder.setDelay(this.frameRate || 200);

        // void setQuality(int quality)
        // Sets quality of color quantization (conversion of images to the
        // maximum 256 colors allowed by the GIF specification).
        // Lower values (minimum = 1) produce better colors,
        // but slow processing significantly. 10 is the default,
        // and produces good color mapping at reasonable speeds.
        // Values greater than 20 do not yield significant improvements in speed.
        gifEncoder.setQuality(this.quality || 1);

        // Boolean start()
        // This writes the GIF Header and returns false if it fails.
        gifEncoder.start();

        startTime = Date.now();

        function drawVideoFrame(time) {
            lastAnimationFrame = requestAnimationFrame(drawVideoFrame);

            if (typeof lastFrameTime === undefined) {
                lastFrameTime = time;
            }

            // ~10 fps
            if (time - lastFrameTime < 90) return;

            context.drawImage(video, 0, 0, imageWidth, imageHeight);

            gifEncoder.addFrame(context);

            // console.log('Recording...' + Math.round((Date.now() - startTime) / 1000) + 's');
            // console.log("fps: ", 1000 / (time - lastFrameTime));

            lastFrameTime = time;
        }

        lastAnimationFrame = requestAnimationFrame(drawVideoFrame);

        timeout = setTimeout(doneRecording, timeSlice);
    };

    function doneRecording() {
        endTime = Date.now();

        var gifBlob = new Blob([new Uint8Array(gifEncoder.stream().bin)], {
            type: 'image/gif'
        });
        self.ondataavailable(gifBlob);

        // todo: find a way to clear old recorded blobs
        gifEncoder.stream().bin = [];
    };

    this.stop = function() {
        if (lastAnimationFrame) {
            cancelAnimationFrame(lastAnimationFrame);
            clearTimeout(timeout);
            doneRecording();
        }
    };

    this.ondataavailable = function() {};
    this.onstop = function() {};

    // Reference to itself
    var self = this;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    var video = document.createElement('video');
    video.muted = true;
    video.autoplay = true;
    video.src = URL.createObjectURL(mediaStream);
    video.play();

    var lastAnimationFrame = null;
    var startTime, endTime, lastFrameTime;

    var gifEncoder;
    var timeout;
}

// ______________________
// MultiStreamRecorder.js

function MultiStreamRecorder(mediaStream) {
    if (!mediaStream) throw 'MediaStream is mandatory.';

    var self = this;
    var isFirefox = !!navigator.mozGetUserMedia;

    this.stream = mediaStream;

    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"
    this.start = function(timeSlice) {
        audioRecorder = new MediaStreamRecorder(mediaStream);
        videoRecorder = new MediaStreamRecorder(mediaStream);

        audioRecorder.mimeType = 'audio/ogg';
        videoRecorder.mimeType = 'video/webm';

        for (var prop in this) {
            if (typeof this[prop] !== 'function') {
                audioRecorder[prop] = videoRecorder[prop] = this[prop];
            }
        }

        audioRecorder.ondataavailable = function(blob) {
            if (!audioVideoBlobs[recordingInterval]) {
                audioVideoBlobs[recordingInterval] = {};
            }

            audioVideoBlobs[recordingInterval].audio = blob;

            if (audioVideoBlobs[recordingInterval].video && !audioVideoBlobs[recordingInterval].onDataAvailableEventFired) {
                audioVideoBlobs[recordingInterval].onDataAvailableEventFired = true;
                fireOnDataAvailableEvent(audioVideoBlobs[recordingInterval]);
            }
        };

        videoRecorder.ondataavailable = function(blob) {
            if (isFirefox) {
                return self.ondataavailable({
                    video: blob,
                    audio: blob
                });
            }

            if (!audioVideoBlobs[recordingInterval]) {
                audioVideoBlobs[recordingInterval] = {};
            }

            audioVideoBlobs[recordingInterval].video = blob;

            if (audioVideoBlobs[recordingInterval].audio && !audioVideoBlobs[recordingInterval].onDataAvailableEventFired) {
                audioVideoBlobs[recordingInterval].onDataAvailableEventFired = true;
                fireOnDataAvailableEvent(audioVideoBlobs[recordingInterval]);
            }
        };

        function fireOnDataAvailableEvent(blobs) {
            recordingInterval++;
            self.ondataavailable(blobs);
        }

        videoRecorder.onstop = audioRecorder.onstop = function(error) {
            self.onstop(error);
        };

        if (!isFirefox) {
            // to make sure both audio/video are synced.
            videoRecorder.onStartedDrawingNonBlankFrames = function() {
                videoRecorder.clearOldRecordedFrames();
                audioRecorder.start(timeSlice);
            };
            videoRecorder.start(timeSlice);
        } else {
            videoRecorder.start(timeSlice);
        }
    };

    this.stop = function() {
        if (audioRecorder) audioRecorder.stop();
        if (videoRecorder) videoRecorder.stop();
    };

    this.ondataavailable = function(blob) {
        console.log('ondataavailable..', blob);
    };

    this.onstop = function(error) {
        console.warn('stopped..', error);
    };

    var audioRecorder;
    var videoRecorder;

    var audioVideoBlobs = {};
    var recordingInterval = 0;
}

function bytesToSize(bytes) {
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return '0 Bytes';
    }
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

/*!
 * imagesLoaded PACKAGED v3.1.8
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */


/*!
 * EventEmitter v4.2.6 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */

(function () {
  

  /**
   * Class for managing events.
   * Can be extended to provide event functionality in other classes.
   *
   * @class EventEmitter Manages event registering and emitting.
   */
  function EventEmitter() {}

  // Shortcuts to improve speed and size
  var proto = EventEmitter.prototype;
  var exports = this;
  var originalGlobalValue = exports.EventEmitter;

  /**
   * Finds the index of the listener for the event in it's storage array.
   *
   * @param {Function[]} listeners Array of listeners to search through.
   * @param {Function} listener Method to look for.
   * @return {Number} Index of the specified listener, -1 if not found
   * @api private
   */
  function indexOfListener(listeners, listener) {
    var i = listeners.length;
    while (i--) {
      if (listeners[i].listener === listener) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Alias a method while keeping the context correct, to allow for overwriting of target method.
   *
   * @param {String} name The name of the target method.
   * @return {Function} The aliased method
   * @api private
   */
  function alias(name) {
    return function aliasClosure() {
      return this[name].apply(this, arguments);
    };
  }

  /**
   * Returns the listener array for the specified event.
   * Will initialise the event object and listener arrays if required.
   * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
   * Each property in the object response is an array of listener functions.
   *
   * @param {String|RegExp} evt Name of the event to return the listeners from.
   * @return {Function[]|Object} All listener functions for the event.
   */
  proto.getListeners = function getListeners(evt) {
    var events = this._getEvents();
    var response;
    var key;

    // Return a concatenated array of all matching events if
    // the selector is a regular expression.
    if (typeof evt === 'object') {
      response = {};
      for (key in events) {
        if (events.hasOwnProperty(key) && evt.test(key)) {
          response[key] = events[key];
        }
      }
    }
    else {
      response = events[evt] || (events[evt] = []);
    }

    return response;
  };

  /**
   * Takes a list of listener objects and flattens it into a list of listener functions.
   *
   * @param {Object[]} listeners Raw listener objects.
   * @return {Function[]} Just the listener functions.
   */
  proto.flattenListeners = function flattenListeners(listeners) {
    var flatListeners = [];
    var i;

    for (i = 0; i < listeners.length; i += 1) {
      flatListeners.push(listeners[i].listener);
    }

    return flatListeners;
  };

  /**
   * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
   *
   * @param {String|RegExp} evt Name of the event to return the listeners from.
   * @return {Object} All listener functions for an event in an object.
   */
  proto.getListenersAsObject = function getListenersAsObject(evt) {
    var listeners = this.getListeners(evt);
    var response;

    if (listeners instanceof Array) {
      response = {};
      response[evt] = listeners;
    }

    return response || listeners;
  };

  /**
   * Adds a listener function to the specified event.
   * The listener will not be added if it is a duplicate.
   * If the listener returns true then it will be removed after it is called.
   * If you pass a regular expression as the event name then the listener will be added to all events that match it.
   *
   * @param {String|RegExp} evt Name of the event to attach the listener to.
   * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.addListener = function addListener(evt, listener) {
    var listeners = this.getListenersAsObject(evt);
    var listenerIsWrapped = typeof listener === 'object';
    var key;

    for (key in listeners) {
      if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
        listeners[key].push(listenerIsWrapped ? listener : {
          listener: listener,
          once: false
        });
      }
    }

    return this;
  };

  /**
   * Alias of addListener
   */
  proto.on = alias('addListener');

  /**
   * Semi-alias of addListener. It will add a listener that will be
   * automatically removed after it's first execution.
   *
   * @param {String|RegExp} evt Name of the event to attach the listener to.
   * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.addOnceListener = function addOnceListener(evt, listener) {
    return this.addListener(evt, {
      listener: listener,
      once: true
    });
  };

  /**
   * Alias of addOnceListener.
   */
  proto.once = alias('addOnceListener');

  /**
   * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
   * You need to tell it what event names should be matched by a regex.
   *
   * @param {String} evt Name of the event to create.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.defineEvent = function defineEvent(evt) {
    this.getListeners(evt);
    return this;
  };

  /**
   * Uses defineEvent to define multiple events.
   *
   * @param {String[]} evts An array of event names to define.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.defineEvents = function defineEvents(evts) {
    for (var i = 0; i < evts.length; i += 1) {
      this.defineEvent(evts[i]);
    }
    return this;
  };

  /**
   * Removes a listener function from the specified event.
   * When passed a regular expression as the event name, it will remove the listener from all events that match it.
   *
   * @param {String|RegExp} evt Name of the event to remove the listener from.
   * @param {Function} listener Method to remove from the event.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.removeListener = function removeListener(evt, listener) {
    var listeners = this.getListenersAsObject(evt);
    var index;
    var key;

    for (key in listeners) {
      if (listeners.hasOwnProperty(key)) {
        index = indexOfListener(listeners[key], listener);

        if (index !== -1) {
          listeners[key].splice(index, 1);
        }
      }
    }

    return this;
  };

  /**
   * Alias of removeListener
   */
  proto.off = alias('removeListener');

  /**
   * Adds listeners in bulk using the manipulateListeners method.
   * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
   * You can also pass it a regular expression to add the array of listeners to all events that match it.
   * Yeah, this function does quite a bit. That's probably a bad thing.
   *
   * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
   * @param {Function[]} [listeners] An optional array of listener functions to add.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.addListeners = function addListeners(evt, listeners) {
    // Pass through to manipulateListeners
    return this.manipulateListeners(false, evt, listeners);
  };

  /**
   * Removes listeners in bulk using the manipulateListeners method.
   * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
   * You can also pass it an event name and an array of listeners to be removed.
   * You can also pass it a regular expression to remove the listeners from all events that match it.
   *
   * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
   * @param {Function[]} [listeners] An optional array of listener functions to remove.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.removeListeners = function removeListeners(evt, listeners) {
    // Pass through to manipulateListeners
    return this.manipulateListeners(true, evt, listeners);
  };

  /**
   * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
   * The first argument will determine if the listeners are removed (true) or added (false).
   * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
   * You can also pass it an event name and an array of listeners to be added/removed.
   * You can also pass it a regular expression to manipulate the listeners of all events that match it.
   *
   * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
   * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
   * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
    var i;
    var value;
    var single = remove ? this.removeListener : this.addListener;
    var multiple = remove ? this.removeListeners : this.addListeners;

    // If evt is an object then pass each of it's properties to this method
    if (typeof evt === 'object' && !(evt instanceof RegExp)) {
      for (i in evt) {
        if (evt.hasOwnProperty(i) && (value = evt[i])) {
          // Pass the single listener straight through to the singular method
          if (typeof value === 'function') {
            single.call(this, i, value);
          }
          else {
            // Otherwise pass back to the multiple function
            multiple.call(this, i, value);
          }
        }
      }
    }
    else {
      // So evt must be a string
      // And listeners must be an array of listeners
      // Loop over it and pass each one to the multiple method
      i = listeners.length;
      while (i--) {
        single.call(this, evt, listeners[i]);
      }
    }

    return this;
  };

  /**
   * Removes all listeners from a specified event.
   * If you do not specify an event then all listeners will be removed.
   * That means every event will be emptied.
   * You can also pass a regex to remove all events that match it.
   *
   * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.removeEvent = function removeEvent(evt) {
    var type = typeof evt;
    var events = this._getEvents();
    var key;

    // Remove different things depending on the state of evt
    if (type === 'string') {
      // Remove all listeners for the specified event
      delete events[evt];
    }
    else if (type === 'object') {
      // Remove all events matching the regex.
      for (key in events) {
        if (events.hasOwnProperty(key) && evt.test(key)) {
          delete events[key];
        }
      }
    }
    else {
      // Remove all listeners in all events
      delete this._events;
    }

    return this;
  };

  /**
   * Alias of removeEvent.
   *
   * Added to mirror the node API.
   */
  proto.removeAllListeners = alias('removeEvent');

  /**
   * Emits an event of your choice.
   * When emitted, every listener attached to that event will be executed.
   * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
   * Because it uses apply, your array of arguments will be passed as if you wrote them out separately.
   * So they will not arrive within the array on the other side, they will be separate.
   * You can also pass a regular expression to emit to all events that match it.
   *
   * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
   * @param {Array} [args] Optional array of arguments to be passed to each listener.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.emitEvent = function emitEvent(evt, args) {
    var listeners = this.getListenersAsObject(evt);
    var listener;
    var i;
    var key;
    var response;

    for (key in listeners) {
      if (listeners.hasOwnProperty(key)) {
        i = listeners[key].length;

        while (i--) {
          // If the listener returns true then it shall be removed from the event
          // The function is executed either with a basic call or an apply if there is an args array
          listener = listeners[key][i];

          if (listener.once === true) {
            this.removeListener(evt, listener.listener);
          }

          response = listener.listener.apply(this, args || []);

          if (response === this._getOnceReturnValue()) {
            this.removeListener(evt, listener.listener);
          }
        }
      }
    }

    return this;
  };

  /**
   * Alias of emitEvent
   */
  proto.trigger = alias('emitEvent');

  /**
   * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
   * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
   *
   * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
   * @param {...*} Optional additional arguments to be passed to each listener.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.emit = function emit(evt) {
    var args = Array.prototype.slice.call(arguments, 1);
    return this.emitEvent(evt, args);
  };

  /**
   * Sets the current value to check against when executing listeners. If a
   * listeners return value matches the one set here then it will be removed
   * after execution. This value defaults to true.
   *
   * @param {*} value The new value to check for when executing listeners.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.setOnceReturnValue = function setOnceReturnValue(value) {
    this._onceReturnValue = value;
    return this;
  };

  /**
   * Fetches the current value to check against when executing listeners. If
   * the listeners return value matches this one then it should be removed
   * automatically. It will return true by default.
   *
   * @return {*|Boolean} The current value to check for or the default, true.
   * @api private
   */
  proto._getOnceReturnValue = function _getOnceReturnValue() {
    if (this.hasOwnProperty('_onceReturnValue')) {
      return this._onceReturnValue;
    }
    else {
      return true;
    }
  };

  /**
   * Fetches the events object and creates one if required.
   *
   * @return {Object} The events storage object.
   * @api private
   */
  proto._getEvents = function _getEvents() {
    return this._events || (this._events = {});
  };

  /**
   * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
   *
   * @return {Function} Non conflicting EventEmitter class.
   */
  EventEmitter.noConflict = function noConflict() {
    exports.EventEmitter = originalGlobalValue;
    return EventEmitter;
  };

  // Expose the class either via AMD, CommonJS or the global object
  if (typeof define === 'function' && define.amd) {
    define('eventEmitter/EventEmitter',[],function () {
      return EventEmitter;
    });
  }
  else if (typeof module === 'object' && module.exports){
    module.exports = EventEmitter;
  }
  else {
    this.EventEmitter = EventEmitter;
  }
}.call(this));

/*!
 * eventie v1.0.4
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false */

( function( window ) {



var docElem = document.documentElement;

var bind = function() {};

function getIEEvent( obj ) {
  var event = window.event;
  // add event.target
  event.target = event.target || event.srcElement || obj;
  return event;
}

if ( docElem.addEventListener ) {
  bind = function( obj, type, fn ) {
    obj.addEventListener( type, fn, false );
  };
} else if ( docElem.attachEvent ) {
  bind = function( obj, type, fn ) {
    obj[ type + fn ] = fn.handleEvent ?
      function() {
        var event = getIEEvent( obj );
        fn.handleEvent.call( fn, event );
      } :
      function() {
        var event = getIEEvent( obj );
        fn.call( obj, event );
      };
    obj.attachEvent( "on" + type, obj[ type + fn ] );
  };
}

var unbind = function() {};

if ( docElem.removeEventListener ) {
  unbind = function( obj, type, fn ) {
    obj.removeEventListener( type, fn, false );
  };
} else if ( docElem.detachEvent ) {
  unbind = function( obj, type, fn ) {
    obj.detachEvent( "on" + type, obj[ type + fn ] );
    try {
      delete obj[ type + fn ];
    } catch ( err ) {
      // can't delete window object properties
      obj[ type + fn ] = undefined;
    }
  };
}

var eventie = {
  bind: bind,
  unbind: unbind
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( 'eventie/eventie',eventie );
} else {
  // browser global
  window.eventie = eventie;
}

})( this );

/*!
 * imagesLoaded v3.1.8
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

( function( window, factory ) { 
  // universal module definition

  /*global define: false, module: false, require: false */

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( [
      'eventEmitter/EventEmitter',
      'eventie/eventie'
    ], function( EventEmitter, eventie ) {
      return factory( window, EventEmitter, eventie );
    });
  } else if ( typeof exports === 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require('wolfy87-eventemitter'),
      require('eventie')
    );
  } else {
    // browser global
    window.imagesLoaded = factory(
      window,
      window.EventEmitter,
      window.eventie
    );
  }

})( window,

// --------------------------  factory -------------------------- //

function factory( window, EventEmitter, eventie ) {



var $ = window.jQuery;
var console = window.console;
var hasConsole = typeof console !== 'undefined';

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

var objToString = Object.prototype.toString;
function isArray( obj ) {
  return objToString.call( obj ) === '[object Array]';
}

// turn element or nodeList into an array
function makeArray( obj ) {
  var ary = [];
  if ( isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( typeof obj.length === 'number' ) {
    // convert nodeList to array
    for ( var i=0, len = obj.length; i < len; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
}

  // -------------------------- imagesLoaded -------------------------- //

  /**
   * @param {Array, Element, NodeList, String} elem
   * @param {Object or Function} options - if function, use as callback
   * @param {Function} onAlways - callback function
   */
  function ImagesLoaded( elem, options, onAlways ) {
    // coerce ImagesLoaded() without new, to be new ImagesLoaded()
    if ( !( this instanceof ImagesLoaded ) ) {
      return new ImagesLoaded( elem, options );
    }
    // use elem as selector string
    if ( typeof elem === 'string' ) {
      elem = document.querySelectorAll( elem );
    }

    this.elements = makeArray( elem );
    this.options = extend( {}, this.options );

    if ( typeof options === 'function' ) {
      onAlways = options;
    } else {
      extend( this.options, options );
    }

    if ( onAlways ) {
      this.on( 'always', onAlways );
    }

    this.getImages();

    if ( $ ) {
      // add jQuery Deferred object
      this.jqDeferred = new $.Deferred();
    }

    // HACK check async to allow time to bind listeners
    var _this = this;
    setTimeout( function() {
      _this.check();
    });
  }

  ImagesLoaded.prototype = new EventEmitter();

  ImagesLoaded.prototype.options = {};

  ImagesLoaded.prototype.getImages = function() {
    this.images = [];

    // filter & find items if we have an item selector
    for ( var i=0, len = this.elements.length; i < len; i++ ) {
      var elem = this.elements[i];
      // filter siblings
      if ( elem.nodeName === 'IMG' ) {
        this.addImage( elem );
      }
      // find children
      // no non-element nodes, #143
      var nodeType = elem.nodeType;
      if ( !nodeType || !( nodeType === 1 || nodeType === 9 || nodeType === 11 ) ) {
        continue;
      }
      var childElems = elem.querySelectorAll('img');
      // concat childElems to filterFound array
      for ( var j=0, jLen = childElems.length; j < jLen; j++ ) {
        var img = childElems[j];
        this.addImage( img );
      }
    }
  };

  /**
   * @param {Image} img
   */
  ImagesLoaded.prototype.addImage = function( img ) {
    var loadingImage = new LoadingImage( img );
    this.images.push( loadingImage );
  };

  ImagesLoaded.prototype.check = function() {
    var _this = this;
    var checkedCount = 0;
    var length = this.images.length;
    this.hasAnyBroken = false;
    // complete if no images
    if ( !length ) {
      this.complete();
      return;
    }

    function onConfirm( image, message ) {
      if ( _this.options.debug && hasConsole ) {
        console.log( 'confirm', image, message );
      }

      _this.progress( image );
      checkedCount++;
      if ( checkedCount === length ) {
        _this.complete();
      }
      return true; // bind once
    }

    for ( var i=0; i < length; i++ ) {
      var loadingImage = this.images[i];
      loadingImage.on( 'confirm', onConfirm );
      loadingImage.check();
    }
  };

  ImagesLoaded.prototype.progress = function( image ) {
    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
    // HACK - Chrome triggers event before object properties have changed. #83
    var _this = this;
    setTimeout( function() {
      _this.emit( 'progress', _this, image );
      if ( _this.jqDeferred && _this.jqDeferred.notify ) {
        _this.jqDeferred.notify( _this, image );
      }
    });
  };

  ImagesLoaded.prototype.complete = function() {
    var eventName = this.hasAnyBroken ? 'fail' : 'done';
    this.isComplete = true;
    var _this = this;
    // HACK - another setTimeout so that confirm happens after progress
    setTimeout( function() {
      _this.emit( eventName, _this );
      _this.emit( 'always', _this );
      if ( _this.jqDeferred ) {
        var jqMethod = _this.hasAnyBroken ? 'reject' : 'resolve';
        _this.jqDeferred[ jqMethod ]( _this );
      }
    });
  };

  // -------------------------- jquery -------------------------- //

  if ( $ ) {
    $.fn.imagesLoaded = function( options, callback ) {
      var instance = new ImagesLoaded( this, options, callback );
      return instance.jqDeferred.promise( $(this) );
    };
  }


  // --------------------------  -------------------------- //

  function LoadingImage( img ) {
    this.img = img;
  }

  LoadingImage.prototype = new EventEmitter();

  LoadingImage.prototype.check = function() {
    // first check cached any previous images that have same src
    var resource = cache[ this.img.src ] || new Resource( this.img.src );
    if ( resource.isConfirmed ) {
      this.confirm( resource.isLoaded, 'cached was confirmed' );
      return;
    }

    // If complete is true and browser supports natural sizes,
    // try to check for image status manually.
    if ( this.img.complete && this.img.naturalWidth !== undefined ) {
      // report based on naturalWidth
      this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
      return;
    }

    // If none of the checks above matched, simulate loading on detached element.
    var _this = this;
    resource.on( 'confirm', function( resrc, message ) {
      _this.confirm( resrc.isLoaded, message );
      return true;
    });

    resource.check();
  };

  LoadingImage.prototype.confirm = function( isLoaded, message ) {
    this.isLoaded = isLoaded;
    this.emit( 'confirm', this, message );
  };

  // -------------------------- Resource -------------------------- //

  // Resource checks each src, only once
  // separate class from LoadingImage to prevent memory leaks. See #115

  var cache = {};

  function Resource( src ) {
    this.src = src;
    // add to cache
    cache[ src ] = this;
  }

  Resource.prototype = new EventEmitter();

  Resource.prototype.check = function() {
    // only trigger checking once
    if ( this.isChecked ) {
      return;
    }
    // simulate loading on detached element
    var proxyImage = new Image();
    eventie.bind( proxyImage, 'load', this );
    eventie.bind( proxyImage, 'error', this );
    proxyImage.src = this.src;
    // set flag
    this.isChecked = true;
  };

  // ----- events ----- //

  // trigger specified handler for event type
  Resource.prototype.handleEvent = function( event ) {
    var method = 'on' + event.type;
    if ( this[ method ] ) {
      this[ method ]( event );
    }
  };

  Resource.prototype.onload = function( event ) {
    this.confirm( true, 'onload' );
    this.unbindProxyEvents( event );
  };

  Resource.prototype.onerror = function( event ) {
    this.confirm( false, 'onerror' );
    this.unbindProxyEvents( event );
  };

  // ----- confirm ----- //

  Resource.prototype.confirm = function( isLoaded, message ) {
    this.isConfirmed = true;
    this.isLoaded = isLoaded;
    this.emit( 'confirm', this, message );
  };

  Resource.prototype.unbindProxyEvents = function( event ) {
    eventie.unbind( event.target, 'load', this );
    eventie.unbind( event.target, 'error', this );
  };

  // -----  ----- //

  return ImagesLoaded;

});
!function(a,b){function c(a){return function(){var b={method:a},c=Array.prototype.slice.call(arguments);/^get/.test(a)?(d.assert(c.length>0,"Get methods require a callback."),c.unshift(b)):(/^set/.test(a)&&(d.assert(0!==c.length,"Set methods require a value."),b.value=c[0]),c=[b]),this.send.apply(this,c)}}var d={};d.DEBUG=!1,d.VERSION="0.0.10",d.CONTEXT="player.js",d.POST_MESSAGE=!!a.postMessage,d.ENABLE_CONTEXT=!1,d.origin=function(b){return"//"===b.substr(0,2)&&(b=a.location.protocol+b),b.split("/").slice(0,3).join("/")},d.addEvent=function(a,b,c){a&&(a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent?a.attachEvent("on"+b,c):a["on"+b]=c)},d.log=function(){d.log.history=d.log.history||[],d.log.history.push(arguments),a.console&&d.DEBUG&&a.console.log(Array.prototype.slice.call(arguments))},d.isString=function(a){return"[object String]"===Object.prototype.toString.call(a)},d.isObject=function(a){return"[object Object]"===Object.prototype.toString.call(a)},d.isArray=function(a){return"[object Array]"===Object.prototype.toString.call(a)},d.isNone=function(a){return null===a||void 0===a},d.has=function(a,b){return Object.prototype.hasOwnProperty.call(a,b)},d.indexOf=function(a,b){if(null==a)return-1;var c=0,d=a.length;if(Array.prototype.IndexOf&&a.indexOf===Array.prototype.IndexOf)return a.indexOf(b);for(;d>c;c++)if(a[c]===b)return c;return-1},d.assert=function(a,b){if(!a)throw b||"Player.js Assert Failed"},d.Keeper=function(){this.init()},d.Keeper.prototype.init=function(){this.data={}},d.Keeper.prototype.getUUID=function(){return"listener-xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"===a?b:3&b|8;return c.toString(16)})},d.Keeper.prototype.has=function(a,b){if(!this.data.hasOwnProperty(a))return!1;if(d.isNone(b))return!0;for(var c=this.data[a],e=0;e<c.length;e++)if(c[e].id===b)return!0;return!1},d.Keeper.prototype.add=function(a,b,c,d,e){var f={id:a,event:b,cb:c,ctx:d,one:e};this.has(b)?this.data[b].push(f):this.data[b]=[f]},d.Keeper.prototype.execute=function(a,b,c,e){if(!this.has(a,b))return!1;for(var f=[],g=[],h=0;h<this.data[a].length;h++){var i=this.data[a][h];d.isNone(b)||!d.isNone(b)&&i.id===b?(g.push({cb:i.cb,ctx:i.ctx?i.ctx:e,data:c}),i.one===!1&&f.push(i)):f.push(i)}0===f.length?delete this.data[a]:this.data[a]=f;for(var j=0;j<g.length;j++){var k=g[j];k.cb.call(k.ctx,k.data)}},d.Keeper.prototype.on=function(a,b,c,d){this.add(a,b,c,d,!1)},d.Keeper.prototype.one=function(a,b,c,d){this.add(a,b,c,d,!0)},d.Keeper.prototype.off=function(a,b){var c=[];if(!this.data.hasOwnProperty(a))return c;for(var e=[],f=0;f<this.data[a].length;f++){var g=this.data[a][f];d.isNone(b)||g.cb===b?d.isNone(g.id)||c.push(g.id):e.push(g)}return 0===e.length?delete this.data[a]:this.data[a]=e,c},d.Player=function(a,b){return this instanceof d.Player?void this.init(a,b):new d.Player(a,b)},d.EVENTS={READY:"ready",PLAY:"play",PAUSE:"pause",ENDED:"ended",TIMEUPDATE:"timeupdate",PROGRESS:"progress",ERROR:"error"},d.EVENTS.all=function(){var a=[];for(var b in d.EVENTS)d.has(d.EVENTS,b)&&d.isString(d.EVENTS[b])&&a.push(d.EVENTS[b]);return a},d.METHODS={PLAY:"play",PAUSE:"pause",GETPAUSED:"getPaused",MUTE:"mute",UNMUTE:"unmute",GETMUTED:"getMuted",SETVOLUME:"setVolume",GETVOLUME:"getVolume",GETDURATION:"getDuration",SETCURRENTTIME:"setCurrentTime",GETCURRENTTIME:"getCurrentTime",SETLOOP:"setLoop",GETLOOP:"getLoop",REMOVEEVENTLISTENER:"removeEventListener",ADDEVENTLISTENER:"addEventListener"},d.METHODS.all=function(){var a=[];for(var b in d.METHODS)d.has(d.METHODS,b)&&d.isString(d.METHODS[b])&&a.push(d.METHODS[b]);return a},d.READIED=[],d.Player.prototype.init=function(c){var e=this;d.isString(c)&&(c=b.getElementById(c)),this.elem=c,this.origin=d.origin(c.src),this.keeper=new d.Keeper,this.isReady=!1,this.queue=[],this.events=d.EVENTS.all(),this.methods=d.METHODS.all(),d.POST_MESSAGE?d.addEvent(a,"message",function(a){e.receive(a)}):d.log("Post Message is not Available."),d.indexOf(d.READIED,c.src)>-1?e.loaded=!0:this.elem.onload=function(){e.loaded=!0}},d.Player.prototype.send=function(a,b,c){if(a.context=d.CONTEXT,a.version=d.VERSION,b){var e=this.keeper.getUUID();a.listener=e,this.keeper.one(e,a.method,b,c)}return this.isReady||"ready"===a.value?(d.log("Player.send",a,this.origin),this.loaded===!0&&this.elem.contentWindow.postMessage(JSON.stringify(a),this.origin),!0):(d.log("Player.queue",a),this.queue.push(a),!1)},d.Player.prototype.receive=function(a){if(d.log("Player.receive",a),a.origin!==this.origin)return!1;var b;try{b=JSON.parse(a.data)}catch(c){return!1}return d.ENABLE_CONTEXT&&b.context!==d.CONTEXT?!1:("ready"===b.event&&b.value&&b.value.src===this.elem.src&&this.ready(b),void(this.keeper.has(b.event,b.listener)&&this.keeper.execute(b.event,b.listener,b.value,this)))},d.Player.prototype.ready=function(a){if(this.isReady===!0)return!1;a.value.events&&(this.events=a.value.events),a.value.methods&&(this.methods=a.value.methods),this.isReady=!0,this.loaded=!0;for(var b=0;b<this.queue.length;b++){var c=this.queue[b];d.log("Player.dequeue",c),"ready"===a.event&&this.keeper.execute(c.event,c.listener,!0,this),this.send(c)}this.queue=[]},d.Player.prototype.on=function(a,b,c){var d=this.keeper.getUUID();return"ready"===a?this.keeper.one(d,a,b,c):this.keeper.on(d,a,b,c),this.send({method:"addEventListener",value:a,listener:d}),!0},d.Player.prototype.off=function(a,b){var c=this.keeper.off(a,b);if(d.log("Player.off",c),c.length>0)for(var e in c)return this.send({method:"removeEventListener",value:a,listener:c[e]}),!0;return!1},d.Player.prototype.supports=function(a,b){d.assert(d.indexOf(["method","event"],a)>-1,'evtOrMethod needs to be either "event" or "method" got '+a),b=d.isArray(b)?b:[b];for(var c="event"===a?this.events:this.methods,e=0;e<b.length;e++)if(-1===d.indexOf(c,b[e]))return!1;return!0};for(var e=0,f=d.METHODS.all().length;f>e;e++){var g=d.METHODS.all()[e];d.Player.prototype.hasOwnProperty(g)||(d.Player.prototype[g]=c(g))}a.playerjs=d,d.addEvent(a,"message",function(a){var b;try{b=JSON.parse(a.data)}catch(c){return!1}return d.ENABLE_CONTEXT&&b.context!==d.CONTEXT?!1:void("ready"===b.event&&b.value&&b.value.src&&d.READIED.push(b.value.src))}),d.Receiver=function(a,b){this.init(a,b)},d.Receiver.prototype.init=function(c,e){var f=this;this.isReady=!1,this.origin=d.origin(b.referrer),this.methods={},this.supported={events:c?c:d.EVENTS.all(),methods:e?e:d.METHODS.all()},this.eventListeners={},this.reject=!(a.self!==a.top&&d.POST_MESSAGE),this.reject||d.addEvent(a,"message",function(a){f.receive(a)})},d.Receiver.prototype.receive=function(b){if(b.origin!==this.origin)return!1;var c={};if(d.isObject(b.data))c=b.data;else try{c=a.JSON.parse(b.data)}catch(e){d.log("JSON Parse Error",e)}if(d.log("Receiver.receive",b,c),!c.method)return!1;if(d.ENABLE_CONTEXT&&c.context!==d.CONTEXT)return!1;if(-1===d.indexOf(d.METHODS.all(),c.method))return this.emit("error",{code:2,msg:'Invalid Method "'+c.method+'"'}),!1;var f=d.isNone(c.listener)?null:c.listener;if("addEventListener"===c.method)this.eventListeners.hasOwnProperty(c.value)?-1===d.indexOf(this.eventListeners[c.value],f)&&this.eventListeners[c.value].push(f):this.eventListeners[c.value]=[f],"ready"===c.value&&this.isReady&&this.ready();else if("removeEventListener"===c.method){if(this.eventListeners.hasOwnProperty(c.value)){var g=d.indexOf(this.eventListeners[c.value],f);g>-1&&this.eventListeners[c.value].splice(g,1),0===this.eventListeners[c.value].length&&delete this.eventListeners[c.value]}}else this.get(c.method,c.value,f)},d.Receiver.prototype.get=function(a,b,c){var d=this;if(!this.methods.hasOwnProperty(a))return this.emit("error",{code:3,msg:'Method Not Supported"'+a+'"'}),!1;var e=this.methods[a];if("get"===a.substr(0,3)){var f=function(b){d.send(a,b,c)};e.call(this,f)}else e.call(this,b)},d.Receiver.prototype.on=function(a,b){this.methods[a]=b},d.Receiver.prototype.send=function(b,c,e){if(d.log("Receiver.send",b,c,e),this.reject)return d.log("Receiver.send.reject",b,c,e),!1;var f={context:d.CONTEXT,version:d.VERSION,event:b};d.isNone(c)||(f.value=c),d.isNone(e)||(f.listener=e);var g=JSON.stringify(f);a.parent.postMessage(g,""===this.origin?"*":this.origin)},d.Receiver.prototype.emit=function(a,b){if(!this.eventListeners.hasOwnProperty(a))return!1;d.log("Instance.emit",a,b,this.eventListeners[a]);for(var c=0;c<this.eventListeners[a].length;c++){var e=this.eventListeners[a][c];this.send(a,b,e)}return!0},d.Receiver.prototype.ready=function(){d.log("Receiver.ready"),this.isReady=!0;var b={src:a.location.toString(),events:this.supported.events,methods:this.supported.methods};this.emit("ready",b)||this.send("ready",b)},d.HTML5Adapter=function(a){return this instanceof d.HTML5Adapter?void this.init(a):new d.HTML5Adapter(a)},d.HTML5Adapter.prototype.init=function(a){d.assert(a,"playerjs.VideoJSReceiver requires a video element");var b=this.receiver=new d.Receiver;a.addEventListener("playing",function(){b.emit("play")}),a.addEventListener("pause",function(){b.emit("pause")}),a.addEventListener("ended",function(){b.emit("ended")}),a.addEventListener("timeupdate",function(){b.emit("timeupdate",{seconds:a.currentTime,duration:a.duration})}),a.addEventListener("progress",function(){b.emit("buffered",{percent:a.buffered.length})}),b.on("play",function(){a.play()}),b.on("pause",function(){a.pause()}),b.on("getPaused",function(b){b(a.paused)}),b.on("getCurrentTime",function(b){b(a.currentTime)}),b.on("setCurrentTime",function(b){a.currentTime=b}),b.on("getDuration",function(b){b(a.duration)}),b.on("getVolume",function(b){b(100*a.volume)}),b.on("setVolume",function(b){a.volume=b/100}),b.on("mute",function(){a.muted=!0}),b.on("unmute",function(){a.muted=!1}),b.on("getMuted",function(b){b(a.muted)}),b.on("getLoop",function(b){b(a.loop)}),b.on("setLoop",function(b){a.loop=b})},d.HTML5Adapter.prototype.ready=function(){this.receiver.ready()},d.JWPlayerAdapter=function(a){return this instanceof d.JWPlayerAdapter?void this.init(a):new d.JWPlayerAdapter(a)},d.JWPlayerAdapter.prototype.init=function(a){d.assert(a,"playerjs.JWPlayerAdapter requires a player object");var b=this.receiver=new d.Receiver;this.looped=!1,a.onPause(function(){b.emit("pause")}),a.onPlay(function(){b.emit("play")}),a.onTime(function(a){var c=a.position,d=a.duration;if(!c||!d)return!1;var e={seconds:c,duration:d};b.emit("timeupdate",e)});var c=this;a.onComplete(function(){c.looped===!0?a.seek(0):b.emit("ended")}),a.onError(function(){b.emit("error")}),b.on("play",function(){a.play(!0)}),b.on("pause",function(){a.pause(!0)}),b.on("getPaused",function(b){b("PLAYING"!==a.getState())}),b.on("getCurrentTime",function(b){b(a.getPosition())}),b.on("setCurrentTime",function(b){a.seek(b)}),b.on("getDuration",function(b){b(a.getDuration())}),b.on("getVolume",function(b){b(a.getVolume())}),b.on("setVolume",function(b){a.setVolume(b)}),b.on("mute",function(){a.setMute(!0)}),b.on("unmute",function(){a.setMute(!1)}),b.on("getMuted",function(b){b(a.getMute()===!0)}),b.on("getLoop",function(a){a(this.looped)},this),b.on("setLoop",function(a){this.looped=a},this)},d.JWPlayerAdapter.prototype.ready=function(){this.receiver.ready()},d.MockAdapter=function(){return this instanceof d.MockAdapter?void this.init():new d.MockAdapter},d.MockAdapter.prototype.init=function(){var a={duration:20,currentTime:0,interval:null,timeupdate:function(){},volume:100,mute:!1,playing:!1,loop:!1,play:function(){a.interval=setInterval(function(){a.currentTime+=.25,a.timeupdate({seconds:a.currentTime,duration:a.duration})},250),a.playing=!0},pause:function(){clearInterval(a.interval),a.playing=!1}},b=this.receiver=new d.Receiver;b.on("play",function(){var b=this;a.play(),this.emit("play"),a.timeupdate=function(a){b.emit("timeupdate",a)}}),b.on("pause",function(){a.pause(),this.emit("pause")}),b.on("getPaused",function(b){b(!a.playing)}),b.on("getCurrentTime",function(b){b(a.currentTime)}),b.on("setCurrentTime",function(b){a.currentTime=b}),b.on("getDuration",function(b){b(a.duration)}),b.on("getVolume",function(b){b(a.volume)}),b.on("setVolume",function(b){a.volume=b}),b.on("mute",function(){a.mute=!0}),b.on("unmute",function(){a.mute=!1}),b.on("getMuted",function(b){b(a.mute)}),b.on("getLoop",function(b){b(a.loop)}),b.on("setLoop",function(b){a.loop=b})},d.MockAdapter.prototype.ready=function(){this.receiver.ready()},d.SublimeAdapter=function(a){return this instanceof d.SublimeAdapter?void this.init(a):new d.SublimeAdapter(a)},d.SublimeAdapter.prototype.events=[d.EVENTS.READY,d.EVENTS.PLAY,d.EVENTS.PAUSE,d.EVENTS.ENDED,d.EVENTS.TIMEUPDATE,d.EVENTS.ERROR],d.SublimeAdapter.prototype.methods=[d.METHODS.PLAY,d.METHODS.PAUSE,d.METHODS.GETDURATION,d.METHODS.SETCURRENTTIME,d.METHODS.GETCURRENTTIME,d.METHODS.REMOVEEVENTLISTENER,d.METHODS.ADDEVENTLISTENER],d.SublimeAdapter.prototype.init=function(a){d.assert(a,"playerjs.SublimeAdapter requires a player object");var b=this.receiver=new d.Receiver(this.events,this.methods);a.on("pause",function(){b.emit("pause")}),a.on("play",function(){b.emit("play")}),a.on("timeUpdate",function(a,c){var d=a.duration();if(!c||!d)return!1;var e={seconds:c,duration:d};b.emit("timeupdate",e)}),a.on("end",function(){b.emit("ended")}),b.on("play",function(){a.play()}),b.on("pause",function(){a.pause()}),b.on("getCurrentTime",function(b){b(a.playbackTime())}),b.on("setCurrentTime",function(b){a.seekTo(b)}),b.on("getDuration",function(b){b(a.duration())})},d.SublimeAdapter.prototype.ready=function(){this.receiver.ready()},d.VideoJSAdapter=function(a){return this instanceof d.VideoJSAdapter?void this.init(a):new d.VideoJSAdapter(a)},d.VideoJSAdapter.prototype.init=function(a){d.assert(a,"playerjs.VideoJSReceiver requires a player object");var b=this.receiver=new d.Receiver;a.on("pause",function(){b.emit("pause")}),a.on("play",function(){b.emit("play")}),a.on("timeupdate",function(){var c=a.currentTime(),d=a.duration();if(!c||!d)return!1;var e={seconds:c,duration:d};b.emit("timeupdate",e)}),a.on("ended",function(){b.emit("ended")}),a.on("error",function(){b.emit("error")}),b.on("play",function(){a.play()}),b.on("pause",function(){a.pause()}),b.on("getPaused",function(b){b(a.paused())}),b.on("getCurrentTime",function(b){b(a.currentTime())}),b.on("setCurrentTime",function(b){a.currentTime(b)}),b.on("getDuration",function(b){b(a.duration())}),b.on("getVolume",function(b){b(100*a.volume())}),b.on("setVolume",function(b){a.volume(b/100)}),b.on("mute",function(){a.volume(0)}),b.on("unmute",function(){a.volume(1)}),b.on("getMuted",function(b){b(0===a.volume())}),b.on("getLoop",function(b){b(a.loop())}),b.on("setLoop",function(b){a.loop(b)})},d.VideoJSAdapter.prototype.ready=function(){this.receiver.ready()}}(window,document);

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Share = f()}})(function(){var define,module,exports;
function getStyles(config){ return ""+config.selector+" .social.bottom,"+config.selector+" .social.top{-webkit-transform-origin:0 0;-moz-transform-origin:0 0;-o-transform-origin:0 0}"+config.selector+"{width:92px;height:20px;-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}"+config.selector+" [class*=entypo-]:before{font-family:entypo,sans-serif}"+config.selector+" label{font-size:16px;cursor:pointer;margin:0;padding:5px 10px;border-radius:5px;background:#a29baa;color:#333;transition:all .3s ease}"+config.selector+" label:hover{opacity:.8}"+config.selector+" label span{text-transform:uppercase;font-size:.9em;font-family:Lato,sans-serif;font-weight:700;-webkit-font-smoothing:antialiased;padding-left:6px}"+config.selector+" .social{opacity:0;transition:all .4s ease;margin-left:-15px;visibility:hidden}"+config.selector+" .social.top{-ms-transform-origin:0 0;transform-origin:0 0;margin-top:-80px}"+config.selector+" .social.bottom{-ms-transform-origin:0 0;transform-origin:0 0;margin-top:5px}"+config.selector+" .social.middle.left,"+config.selector+" .social.middle.right{-ms-transform-origin:5% 50%;transform-origin:5% 50%;-webkit-transform-origin:5% 50%;-moz-transform-origin:5% 50%;-o-transform-origin:5% 50%}"+config.selector+" .social.middle{margin-top:-34px}"+config.selector+" .social.middle.right{margin-left:105px}"+config.selector+" .social.networks-1.center,"+config.selector+" .social.networks-1.left,"+config.selector+" .social.right{margin-left:14px}"+config.selector+" .social.load{transition:none!important}"+config.selector+" .social.networks-1{width:60px}"+config.selector+" .social.networks-1.middle.left{margin-left:-70px}"+config.selector+" .social.networks-1 ul{width:60px}"+config.selector+" .social.networks-2,"+config.selector+" .social.networks-2 ul{width:120px}"+config.selector+" .social.networks-2.center{margin-left:-13px}"+config.selector+" .social.networks-2.left{margin-left:-44px}"+config.selector+" .social.networks-2.middle.left{margin-left:-130px}"+config.selector+" .social.networks-3,"+config.selector+" .social.networks-3 ul{width:180px}"+config.selector+" .social.networks-3.center{margin-left:-45px}"+config.selector+" .social.networks-3.left{margin-left:-102px}"+config.selector+" .social.networks-3.middle.left{margin-left:-190px}"+config.selector+" .social.networks-4,"+config.selector+" .social.networks-4 ul{width:240px}"+config.selector+" .social.networks-4.center{margin-left:-75px}"+config.selector+" .social.networks-4.left{margin-left:162px}"+config.selector+" .social.networks-4.middle.left{margin-left:-250px}"+config.selector+" .social.networks-5,"+config.selector+" .social.networks-5 ul{width:300px}"+config.selector+" .social.networks-5.center{margin-left: -65px}"+config.selector+" .social.networks-5.left{margin-left:-225px}"+config.selector+" .social.networks-5.middle.left{margin-left:-320px}"+config.selector+" .social.active{opacity:1;transition:all .4s ease;visibility:visible}"+config.selector+" .social.active.top{-webkit-transform:scale(1)translateY(-10px);-moz-transform:scale(1)translateY(-10px);-o-transform:scale(1)translateY(-10px);-ms-transform:scale(1)translateY(-10px);transform:scale(1)translateY(-10px)}"+config.selector+" .social.active.bottom{-webkit-transform:scale(1)translateY(15px);-moz-transform:scale(1)translateY(15px);-o-transform:scale(1)translateY(15px);-ms-transform:scale(1)translateY(15px);transform:scale(1)translateY(15px)}"+config.selector+" .social.active.middle.right{-webkit-transform:scale(1)translateX(10px);-moz-transform:scale(1)translateX(10px);-o-transform:scale(1)translateX(10px);-ms-transform:scale(1)translateX(10px);transform:scale(1)translateX(10px)}"+config.selector+" .social.active.middle.left{-webkit-transform:scale(1)translateX(-10px);-moz-transform:scale(1)translateX(-10px);-o-transform:scale(1)translateX(-10px);-ms-transform:scale(1)translateX(-10px);transform:scale(1)translateX(-10px)}"+config.selector+" .social ul{position:relative;left:0;right:0;height:46px;color:#fff;margin:auto;padding:0;list-style:none}"+config.selector+" .social ul li{font-size:20px;cursor:pointer;width:60px;margin:0;padding:12px 0;text-align:center;float:left;display:none;height:22px;position:relative;z-index:2;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;transition:all .3s ease}"+config.selector+" .social ul li:hover{color:rgba(0,0,0,.5)}"+config.selector+" .social li[class*=facebook]{background:#3b5998;display:"+config.networks.facebook.display+"}"+config.selector+" .social li[class*=twitter]{background:#6cdfea;display:"+config.networks.twitter.display+"}"+config.selector+" .social li[class*=gplus]{background:#e34429;display:"+config.networks.google_plus.display+"}"+config.selector+" .social li[class*=pinterest]{background:#c5282f;display:"+config.networks.pinterest.display+"}"+config.selector+" .social li[class*=paper-plane]{background:#42c5b0;display:"+config.networks.email.display+"}"};var ShareUtils;

if ((!("classList" in document.documentElement)) && Object.defineProperty && typeof HTMLElement !== "undefined") {
  Object.defineProperty(HTMLElement.prototype, "classList", {
    get: function() {
      var ret, self, update;
      update = function(fn) {
        return function(value) {
          var classes, index;
          classes = self.className.split(/\s+/);
          index = classes.indexOf(value);
          fn(classes, index, value);
          self.className = classes.join(" ");
        };
      };
      self = this;
      ret = {
        add: update(function(classes, index, value) {
          ~index || classes.push(value);
        }),
        remove: update(function(classes, index) {
          ~index && classes.splice(index, 1);
        }),
        toggle: update(function(classes, index, value) {
          if (~index) {
            classes.splice(index, 1);
          } else {
            classes.push(value);
          }
        }),
        contains: function(value) {
          return !!~self.className.split(/\s+/).indexOf(value);
        },
        item: function(i) {
          return self.className.split(/\s+/)[i] || null;
        }
      };
      Object.defineProperty(ret, "length", {
        get: function() {
          return self.className.split(/\s+/).length;
        }
      });
      return ret;
    }
  });
}

String.prototype.to_rfc3986 = function() {
  var tmp;
  tmp = encodeURIComponent(this);
  return tmp.replace(/[!'()*]/g, function(c) {
    return "%" + c.charCodeAt(0).toString(16);
  });
};

ShareUtils = (function() {
  function ShareUtils() {}

  ShareUtils.prototype.extend = function(to, from, overwrite) {
    var hasProp, prop;
    for (prop in from) {
      hasProp = to[prop] !== undefined;
      if (hasProp && typeof from[prop] === "object") {
        this.extend(to[prop], from[prop], overwrite);
      } else {
        if (overwrite || !hasProp) {
          to[prop] = from[prop];
        }
      }
    }
  };

  ShareUtils.prototype.hide = function(el) {
    return el.style.display = "none";
  };

  ShareUtils.prototype.show = function(el) {
    return el.style.display = "block";
  };

  ShareUtils.prototype.has_class = function(el, class_name) {
    return el.classList.contains(class_name);
  };

  ShareUtils.prototype.add_class = function(el, class_name) {
    return el.classList.add(class_name);
  };

  ShareUtils.prototype.remove_class = function(el, class_name) {
    return el.classList.remove(class_name);
  };

  ShareUtils.prototype.is_encoded = function(str) {
    str = str.to_rfc3986();
    return decodeURIComponent(str) !== str;
  };

  ShareUtils.prototype.encode = function(str) {
    if (typeof str === "undefined" || this.is_encoded(str)) {
      return str;
    } else {
      return str.to_rfc3986();
    }
  };

  ShareUtils.prototype.popup = function(url, params) {
    var k, popup, qs, v;
    if (params == null) {
      params = {};
    }
    popup = {
      width: 500,
      height: 350
    };
    popup.top = (screen.height / 2) - (popup.height / 2);
    popup.left = (screen.width / 2) - (popup.width / 2);
    qs = ((function() {
      var results;
      results = [];
      for (k in params) {
        v = params[k];
        results.push(k + "=" + (this.encode(v)));
      }
      return results;
    }).call(this)).join('&');
    if (qs) {
      qs = "?" + qs;
    }
    return window.open(url + qs, 'targetWindow', "toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,left=" + popup.left + ",top=" + popup.top + ",width=" + popup.width + ",height=" + popup.height);
  };

  return ShareUtils;

})();
var Share,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Share = (function(superClass) {
  extend(Share, superClass);

  function Share(element1, options) {
    this.element = element1;
    this.el = {
      head: document.getElementsByTagName('head')[0],
      body: document.getElementsByTagName('body')[0]
    };
    this.config = {
      enabled_networks: 0,
      protocol: ['http', 'https'].indexOf(window.location.href.split(':')[0]) === -1 ? 'https://' : '//',
      url: window.location.href,
      caption: null,
      title: this.default_title(),
      image: this.default_image(),
      description: this.default_description(),
      ui: {
        flyout: 'top center',
        button_text: 'Share',
        button_font: true,
        icon_font: true
      },
      networks: {
        google_plus: {
          enabled: true,
          url: null
        },
        twitter: {
          enabled: true,
          url: null,
          description: null
        },
        facebook: {
          enabled: true,
          load_sdk: true,
          url: null,
          app_id: null,
          title: null,
          caption: null,
          description: null,
          image: null
        },
        pinterest: {
          enabled: true,
          url: null,
          image: null,
          description: null
        },
        email: {
          enabled: true,
          title: null,
          description: null
        }
      }
    };
    this.setup(this.element, options);
    return this;
  }

  Share.prototype.setup = function(element, opts) {
    var i, index, instance, instances, len;
    instances = document.querySelectorAll(element);
    this.extend(this.config, opts, true);
    this.set_global_configuration();
    this.normalize_network_configuration();
    if (this.config.ui.icon_font) {
      //this.inject_icons();
    }
    if (this.config.ui.button_font) {
      //this.inject_fonts();
    }
    if (this.config.networks.facebook.enabled && this.config.networks.facebook.load_sdk) {
      this.inject_facebook_sdk();
    }
    for (index = i = 0, len = instances.length; i < len; index = ++i) {
      instance = instances[index];
      this.setup_instance(element, index);
    }
  };

  Share.prototype.setup_instance = function(element, index) {
    var _this, button, i, instance, label, len, network, networks, results;
    instance = document.querySelectorAll(element)[index];
    this.hide(instance);
    this.add_class(instance, "sharer-" + index);
    instance = document.querySelectorAll(element)[index];
    this.inject_css(instance);
    this.inject_html(instance);
    this.show(instance);
    label = instance.getElementsByTagName("i")[0];
    button = instance.getElementsByClassName("social")[0];
    networks = instance.getElementsByTagName('li');
    this.add_class(button, "networks-" + this.config.enabled_networks);
    label.addEventListener("click", (function(_this) {
      return function() {
        return _this.event_toggle(button);
      };
    })(this));
    _this = this;
    results = [];
    for (index = i = 0, len = networks.length; i < len; index = ++i) {
      network = networks[index];
      results.push(network.addEventListener("click", function() {
        _this.event_network(instance, this);
        return _this.event_close(button);
      }));
    }
    return results;
  };

  Share.prototype.event_toggle = function(button) {
    if (this.has_class(button, "active")) {
      return this.event_close(button);
    } else {
      return this.event_open(button);
    }
  };

  Share.prototype.event_open = function(button) {
    if (this.has_class(button, "load")) {
      this.remove_class(button, "load");
    }
    return this.add_class(button, "active");
  };

  Share.prototype.event_close = function(button) {
    return this.remove_class(button, "active");
  };

  Share.prototype.event_network = function(instance, network) {
    var name;
    name = network.getAttribute("data-network");
    this.hook("before", name, instance);
    this["network_" + name]();
    return this.hook("after", name, instance);
  };

  Share.prototype.open = function() {
    return this["public"]("open");
  };

  Share.prototype.close = function() {
    return this["public"]("close");
  };

  Share.prototype.toggle = function() {
    return this["public"]("toggle");
  };

  Share.prototype["public"] = function(action) {
    var button, i, index, instance, len, ref, results;
    ref = document.querySelectorAll(this.element);
    results = [];
    for (index = i = 0, len = ref.length; i < len; index = ++i) {
      instance = ref[index];
      button = instance.getElementsByClassName("social")[0];
      results.push(this["event_" + action](button));
    }
    return results;
  };

  Share.prototype.network_facebook = function() {
    if (this.config.networks.facebook.load_sdk) {
      if (!window.FB) {
        return console.error("The Facebook JS SDK hasn't loaded yet.");
      }
      return FB.ui({
        method: 'feed',
        name: this.config.networks.facebook.title,
        link: this.config.networks.facebook.url,
        picture: this.config.networks.facebook.image,
        caption: this.config.networks.facebook.caption,
        description: this.config.networks.facebook.description
      });
    } else {
      return this.popup('https://www.facebook.com/sharer/sharer.php', {
        u: this.config.networks.facebook.url
      });
    }
  };

  Share.prototype.network_twitter = function() {
    return this.popup('https://twitter.com/intent/tweet', {
      text: this.config.networks.twitter.description,
      url: this.config.networks.twitter.url
    });
  };

  Share.prototype.network_google_plus = function() {
    return this.popup('https://plus.google.com/share', {
      url: this.config.networks.google_plus.url
    });
  };

  Share.prototype.network_pinterest = function() {
    return this.popup('https://www.pinterest.com/pin/create/button', {
      url: this.config.networks.pinterest.url,
      media: this.config.networks.pinterest.image,
      description: this.config.networks.pinterest.description
    });
  };

  Share.prototype.network_email = function() {
    return this.popup('mailto:', {
      subject: this.config.networks.email.title,
      body: this.config.networks.email.description
    });
  };

  Share.prototype.inject_stylesheet = function(url) {
    var link;
    if (!this.el.head.querySelector("link[href=\"" + url + "\"]")) {
      link = document.createElement("link");
      link.setAttribute("rel", "stylesheet");
      link.setAttribute("href", url);
      return this.el.head.appendChild(link);
    }
  };

  Share.prototype.inject_css = function(instance) {
    var css, meta, selector, style;
    selector = "." + (instance.getAttribute('class').split(" ").join("."));
    if (!this.el.head.querySelector("meta[name='sharer" + selector + "']")) {
      this.config.selector = selector;
      css = getStyles(this.config);
      style = document.createElement("style");
      style.type = "text/css";
      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      this.el.head.appendChild(style);
      delete this.config.selector;
      meta = document.createElement("meta");
      meta.setAttribute("name", "sharer" + selector);
      return this.el.head.appendChild(meta);
    }
  };

  Share.prototype.inject_html = function(instance) {
    return instance.innerHTML = "<i class='f-1-5x icon-share tr entypo-export'></i><div class='social load " + this.config.ui.flyout + "'><ul><li class='icon-twitter' data-network='twitter'></li><li class='icon-facebook' data-network='facebook'></li><li class='icon-google' data-network='google_plus'></li><li class='icon-email' data-network='email'></li><li class='icon-pinterest' data-network='pinterest'></li></ul></div>";
  };

  Share.prototype.inject_facebook_sdk = function() {
    var fb_root, script;
    if (!window.FB && this.config.networks.facebook.app_id && !this.el.body.querySelector('#fb-root')) {
      script = document.createElement("script");
      script.text = "window.fbAsyncInit=function(){FB.init({appId:'" + this.config.networks.facebook.app_id + "',status:true,xfbml:true, version:'v2.2'})};(function(e,t,n){var r,i=e.getElementsByTagName(t)[0];if(e.getElementById(n)){return}r=e.createElement(t);r.id=n;r.src='" + this.config.protocol + "connect.facebook.net/en_US/sdk.js';i.parentNode.insertBefore(r,i)})(document,'script','facebook-jssdk')";
      fb_root = document.createElement("div");
      fb_root.id = "fb-root";
      this.el.body.appendChild(fb_root);
      return this.el.body.appendChild(script);
    }
  };

  Share.prototype.hook = function(type, network, instance) {
    var fn, opts;
    fn = this.config.networks[network][type];
    if (typeof fn === "function") {
      opts = fn.call(this.config.networks[network], instance);
      if (opts !== void 0) {
        opts = this.normalize_filter_config_updates(opts);
        this.extend(this.config.networks[network], opts, true);
        this.normalize_network_configuration();
      }
    }
  };

  Share.prototype.default_title = function() {
    var content;
    if (content = document.querySelector('meta[property="og:title"]') || document.querySelector('meta[name="twitter:title"]')) {
      return content.getAttribute('content');
    } else if (content = document.querySelector('title')) {
      return content.innerText;
    }
  };

  Share.prototype.default_image = function() {
    var content;
    if (content = document.querySelector('meta[property="og:image"]') || document.querySelector('meta[name="twitter:image"]')) {
      return content.getAttribute('content');
    }
  };

  Share.prototype.default_description = function() {
    var content;
    if (content = document.querySelector('meta[property="og:description"]') || document.querySelector('meta[name="twitter:description"]') || document.querySelector('meta[name="description"]')) {
      return content.getAttribute('content');
    } else {
      return '';
    }
  };

  Share.prototype.set_global_configuration = function() {
    var display, network, option, options, ref, results;
    ref = this.config.networks;
    results = [];
    for (network in ref) {
      options = ref[network];
      for (option in options) {
        if (this.config.networks[network][option] == null) {
          this.config.networks[network][option] = this.config[option];
        }
      }
      if (this.config.networks[network].enabled) {
        display = 'block';
        this.config.enabled_networks += 1;
      } else {
        display = 'none';
      }
      results.push(this.config.networks[network].display = display);
    }
    return results;
  };

  Share.prototype.normalize_network_configuration = function() {
    if (!this.config.networks.facebook.app_id) {
      this.config.networks.facebook.load_sdk = false;
    }
    if (!this.is_encoded(this.config.networks.twitter.description)) {
      this.config.networks.twitter.description = encodeURIComponent(this.config.networks.twitter.description);
    }
    if (typeof this.config.networks.facebook.app_id === 'number') {
      return this.config.networks.facebook.app_id = this.config.networks.facebook.app_id.toString();
    }
  };

  Share.prototype.normalize_filter_config_updates = function(opts) {
    if (this.config.networks.facebook.app_id !== opts.app_id) {
      console.warn("You are unable to change the Facebook app_id after the button has been initialized. Please update your Facebook filters accordingly.");
      delete opts.app_id;
    }
    if (this.config.networks.facebook.load_sdk !== opts.load_sdk) {
      console.warn("You are unable to change the Facebook load_sdk option after the button has been initialized. Please update your Facebook filters accordingly.");
      delete opts.app_id;
    }
    return opts;
  };

  return Share;

})(ShareUtils);
 return Share;
}); 
'use strict';


// defining 
window.app = window.app === undefined ? {} : window.app;

// setting up commonly used vars
app.vent = $({});
app.$document = $(document);
app.$window = $(window);
app.$body = $('body');
app.isTrendingData = true;
app.isPopularData = true;
app.categoryName = false;
app.repeatCall = true; 
app.pageNum = 1;
app.repeatActivityCall = false;

// ovverriding navigator for cross browser stuff
navigator.getUserMedia = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia;

// defining BEHAVIORS - methods in browser/behaviors
app.behaviors = app.behaviors === undefined ? {} :  app.behaviors;

// defining COMPONENTS - methods in browser/components
app.components = app.components === undefined ? {} : app.components;

// defining UTILITIES - methods in browser/utils
app.utils = app.utils === undefined ? {} : app.utils;

// app in memory cache
app.cache = {};

app.requestArgs = {};

// use this instead of $.ajax
// performs some utility functions too
app.utils.ajax = function (method, url, params) {
  params = params === undefined ? {} : params;
  params.method = method;
  params.url = url;

  return $.ajax(params).always(function (argOne, status, argThree) {
    if (status === 'success') {
      var data = argOne;
      var xhr = argThree;
      var err = undefined;
    } else if (status === 'error') {
      var data = undefined;
      var xhr = argOne;
      var err = argThree;
    }

    // handle authentication modal
    if (xhr.status === 401) {
      app.utils.requestSerializer(method, url, params);
      $('#frankly-auth-modal').openModal();
    }

    // handle behavior for changing nav automatically
    if (method === 'GET' && data && data.nav && typeof(data.nav) === 'string') {
      $('#nav').html(data.nav);
    }

    if (method === 'GET' && data && data.panel && typeof(data.panel) === 'string') {
      $('#panel').html(data.panel);
    }
  });
};

// adding utility methods to app.utils.ajax
['GET', 'PUT', 'POST', 'DELETE'].forEach(function (method) {
  app.utils.ajax[method.toLowerCase()] = function (url, params) {
    return app.utils.ajax(method, url, params);
  };
});

// get current page url
app.utils.currentUrl = function (withSearch) {
  var urlParts = [location.protocol, '//', location.host, location.pathname];
  if (withSearch === true) {
    return urlParts.concat([location.search]).join('');
  } else {
    return urlParts.join('');
  }
};

// get website domain
app.utils.domain = function () {
  return [location.protocol, '//', location.host].join('');
};

app.utils.site = function (path) {
  return [location.protocol, '//', location.host,'/',path].join('');
};

app.utils.runningVideos = [];

app.utils.preloaderHtml = function () {
  return (
    '<div class="row text-center">'+
      '<div class="div col s8 offset-s2">'+
        '<div class="progress red lighten-5">'+
            '<div class="indeterminate red lighten-2"></div>'+
        '</div>'+
      '</div>'+
    '</div>'
  );
};

// setting up commonly used functions
app.utils.$elInViewport = function($el) {
  var el = $el.get(0);

  var top = el.offsetTop;
  var left = el.offsetLeft;
  var width = el.offsetWidth;
  var height = el.offsetHeight;
  while(el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }
  // console.log('top'+top+'left'+left+'width'+width+'height'+height);
  // console.log('wtop'+window.pageYOffset+'wleft'+window.pageXOffset+'Wwidth'+window.innerWidth+'wheight'+window.innerHeight);
  return (
    top >= window.pageYOffset &&
    left >= window.pageXOffset &&
    (top + height) <= (window.pageYOffset + window.innerHeight) &&
    (left + width) <= (window.pageXOffset + window.innerWidth)
  );
};

// check if $el was removed
app.utils.$elRemoved = function(domNodeRemovedEvent, $el) {
  var $evTarget = $(domNodeRemovedEvent.target);

  return $evTarget.get(0) === $el.get(0) || $.contains($evTarget.get(0), $el.get(0));
};

app.utils.loadingBtn = function(id,d){
  var ID = $('#'+id);
  var org=ID.text();
  var orgVal=ID.val();
  ID.val("Processing...");
  ID.text("Processing...");
  ID.addClass('loading disabled');
  //var ref=this;
    if (d!=0){
     setTimeout(function() {
      ID.removeClass('loading disabled');
      ID.text(org);
      //ID.val(orgVal);
    }, d*1000);
  }
};

app.utils.loadingBtnStop = function(id,value,result){
  var org=value;
  var ID = $('#'+id);
  ID.removeClass('loading').val(org);
  if (result=='success'){
    app.utils.notify('Your question was asked successfully','success', 2);
  } else {
    app.utils.notify('{{error code}} Error message from server','error', 2);
  }
};

app.utils.notify = function(text,type,duration){

    $('#alert-box').fadeIn().addClass(type).html(text + '<a href="#" class="close">&times;</a>');

  //Types are: alert, success, warning, info
    if (duration!=0){
    setTimeout(function() {
      $('.alert-box').removeClass(type).fadeOut().html('loading <a href="#" class="close">&times;</a>');
    }, duration*1000);
  }
  $(document).on('close.alert', function(event) {
    $('#alert-hook').html('<div data-alert id="alert-box" class="alert-box-wrapper alert-box alert radius" style="display:none;"> Loading... <a href="#" class="close">&times;</a> </div>');
  });
};

app.utils.notifyLogin = function(text,type,duration){


     $('#alert-hook2').fadeIn();
    $('#alert-box2').fadeIn().addClass(type).html(text + '<a href="#" class="close">&times;</a>');

  // Types are: alert, success, warning, info
    if (duration!=0){
    setTimeout(function() {
      $('.alert-box').removeClass(type).fadeOut().html('loading <a href="#" class="close">&times;</a>');
    }, duration*1000);
  }
  $(document).on('close.alert', function(event) {
    $('#alert-hook2').html('<div data-alert id="alert-box" class=" alert-box alert radius" style="display:none;"> Loading... <a href="#" class="close">&times;</a> </div>');
  });
};


app.utils.internet = function() {
  //console.log('connectivty being monitored');
  window.addEventListener("offline", function(e) {
    app.utils.notify('internet connectivty lost. Please check your connection.', 'error', 0);
  }, false);

  window.addEventListener("online", function(e) {
    app.utils.notify('internet connectivty restored', 'success', 3);
  }, false);
};

app.utils.redirectTo = function (path) {
  window.location.href = app.utils.domain()+path;
};

app.utils.reloadNavAndPanel = function () {
  NProgress.start();
  app.utils.ajax.get(app.utils.currentUrl(true), {
    data: {partials: ['nav', 'panel','bottom','auth']}
  }).then(function (data) {
    // app.$body.find('#nav').html(data.nav);
    // app.$body.find('#panel').html(data.panel);
    app.$body.find('#auth').html(data.auth);
    app.$body.find('#bottom').html(data.bottom);
    NProgress.done();
  });
};

app.utils.reloadNavOnly = function () {
  NProgress.start();
  app.utils.ajax.get(app.utils.currentUrl(true), {
    data: {partials: ['nav']}
  }).then(function (data) {
    app.$body.find('#nav').html(data.nav);
    NProgress.done();
  });
};

app.utils.get$videoSnapshotUrl = function ($video) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var video = $video[0];
  var videoWidth = video.videoWidth;
  var videoHeight = isNaN(video.videoHeight) ? (0.75 * videoWidth) : videoWidth;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  context.drawImage(video, 0, 0, videoWidth, videoHeight);
  return canvas.toDataURL('image/png');
};

app.utils.dataURLToBlob = function (dataURL) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURL.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURL.split(',')[1]);
  else
    byteString = unescape(dataURL.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {type: mimeString});
};

app.utils.blobToFile = function (blob, fileName) {
  //A Blob() is almost a File() - it's just missing the two properties below which we will add
  blob.lastModifiedDate = new Date();
  var ext = blob.type.split('/').reverse()[0];
  blob.name = fileName+'.'+ext;
  return blob;
};

app.utils.dataURLToFile = function (dataURL, fileName) {
  return app.utils.blobToFile(app.utils.dataURLToBlob(dataURL), fileName);
};

app.utils.btnStateChange = function (button, message, disabled) {
  var $button = button;
  var imgHtml =  '<img src="/img/preloader.gif" class="left"/>'+
                  '<div class="inBtnState">'+
                  '</div>';
  var imgHtml =  '<div class="preloader-wrapper small active">'+
                    '<div class="spinner-layer spinner-red-only">'+
                      '<div class="circle-clipper left">'+
                        '<div class="circle"></div>'+
                      '</div><div class="gap-patch">'+
                        '<div class="circle"></div>'+
                      '</div><div class="circle-clipper right">'+
                        '<div class="circle"></div>'+
                      '</div>'+
                    '</div>'+
                  '</div>';


  if (disabled) {
    // $button.addClass('fullbtn');
    $button.html(imgHtml);
    var $inBtnState = $button.find('.inBtnState');
    $inBtnState.html(message);
    $button.css('pointer-events', 'none');
    // $button.addClass('disabled');
  } else {
    // $button.removeClass('fullbtn');
    // $button.removeClass('disabled');
    $button.css('pointer-events', 'auto');
    $button.html(message);
  }

};

app.utils.requestSerializer = function (method, url, params) {
  app.requestArgs.method = method;
  app.requestArgs.url = url;
  app.requestArgs.params = params;
}

app.utils.requestDeserializer = function (args) {
  app.utils.ajax(args.method, args.url, args.params);
  app.utils.reloadNavAndPanel();
}

app.utils.redirect = function (path) {
  window.location.href = "http://" + path;
};

// modal bg-z-index
app.utils.modalBgZIndex = 1000;

// load a particular modal via its selector
// optionally provide html via a url
// and run an optional callback on completion
app.utils.loadModal = function (selector, url, callback, stacked) {
  // modals stack by default, ie. more than one modals can open at a time
  var stacked = stacked === false ? false : true;

  var modalLoader = function () {
    callback = typeof(callback) === 'function' ? callback : function () { };

    // if selector provided is an instance of jquery, then that is our modal
    // otherwise we try to find the modal using jquery
    var $modal = selector instanceof $ ? selector : $(selector);

    // if the modal provided is not one single modal, do nothing
    if ($modal.length !== 1) return;

    // attach and animate modal bg if it is not loaded already
    var $modalBg = $('div.reveal-modal-bg');
    if ($modalBg.length === 0) {
      $modalBg = $($.parseHTML('<div class="reveal-modal-bg" style="display: none;"></div>'));
      app.$body.append($modalBg);
      $modalBg.css({zIndex: app.utils.modalBgZIndex}).fadeIn(200);
    }

    var openModal = function () {
      // get modalIndex
      var modalIndex = $('div.reveal-modal.open').length + 1;

      // hook in the modal closer
      $modal.find('i.icon-close').on('click', function () { app.utils.unloadModal($modal); });
      $modal.addClass('open').css({
        display: 'block',
        visibility: 'visible',
        zIndex: app.utils.modalBgZIndex + modalIndex + 1
      });

      // open the modal
      $modal.css('top', '50px');
      $modal.animate(
        {
          opacity: 1
        }, 
        {
          complete: function () {
            app.vent.trigger('modal.opened', $modal);
            callback();
          }
        }
      );
    };

    if (url === undefined || url === null) {
      openModal();
    } else {
      app.utils.ajax.get(url).then(function (html) {
        $modal.html(html);
        openModal();        
      });
    }

    // close modal on clicking modal bg
    $modalBg.on('click', app.utils.unloadOpenModals);
  };

  // if the loadModal call is not stacked, then unloadOpenModals before
  // loading our target modal. Otherwise just load our modal
  if (! stacked) {
    app.utils.unloadOpenModals(modalLoader);
  } else {
    modalLoader();
  }
};

// unload $modal
app.utils.unloadModal = function ($modal, callback) {
  callback = typeof(callback) === 'function' ? callback : function () { };

  if ($modal.length > 0) {
    $modal.animate(
      {
        opacity: 0,
        top: '-'+(app.$window.scrollTop() + 100)+'px'
      },
      {
        done: function () {
          $modal.removeClass('open').css({display: 'none', visibility: 'none'});

          app.vent.trigger('modal.closed', $modal[0]);
          callback();

          var $openModals = $('div.reveal-modal.open');
          if ($openModals.length === 0) {
            var $modalBg = $('div.reveal-modal-bg');
            $modalBg.fadeOut(200, function () {
              $modalBg.remove();
            });
          }
        }
      }
    );
  } else {
    callback();
  }
};

// unload already opened modal and call a callback
app.utils.unloadOpenModals = function (callback) {
  callback = typeof(callback) === 'function' ? callback : function () { };

  var $modals = $('div.reveal-modal.open');

  app.utils.unloadModal($modals, callback);
}

// close any open modal escape key press event
app.$document.on('keyup', function (ev) {
  if (ev.keyCode === 27) {
    app.utils.unloadOpenModals();
  }
});
app.behaviors.commentBtn = function ($comments) {
  var $commentsHolder = $comments.find('.comment-box-inner');
  var $commentsOpener = $comments.find('.opener');
  var $commentsLoader = $comments.find('.load-more');
  var $commentInputBox = $comments.find('.input-textarea');
  var $commentInfo = $comments.find('.commentinfo');
  var totalComments = parseInt($commentInfo.data('total-comments'));
  var pageNum = 1;


  /**
   * for mixPanel Data
   */
  var $commentData = $comments.find('.answer-comments');
  var screen = app.$body.data('pagename');
  //var screenType = app.$body.data('userpage')
  var username = $commentData.data('username');
  var userid = $commentData.data('userid');
  var link = $commentData.data('entity-link');
  var type = $commentData.data('entity-type');

  var pageNum = 1;
  var sourceUrl = $commentInfo.data('source');
  var isLoadedOnce = false;
  var loadedComments = function () {
    return parseInt($commentInfo.data('loaded-comments'));
  };

  var loadMoreComments = function (callback) {
    // Google Analytics function
    ga(['send', 'Comments', 'LoadMore Comments', 'Widgets']);
    mixpanel.track(
      'LoadMore Comments',
      {
        'screen_type': screen,
        'platform': navigator.platform,
        'entity_username': username,
        'entity_userid': userid,
        'entity_link': link,
        //'entity_type': type
      }
    );
    if (totalComments === 0) return;

    callback = typeof(callback) === 'function' ? callback : function () {
    };

    var answerId = $commentInfo.data('id');
    app.utils.ajax.get('/widgets' + sourceUrl, {data: {page: pageNum}}).then(function (html) {
      if (isLoadedOnce) {
        $commentsHolder.append(html);
      } else {
        isLoadedOnce = true;
        $commentsHolder.html(html);
      }
      $commentInfo.data('loaded-comments', $commentsHolder.children().length);
      pageNum += 1;
      if (totalComments <= loadedComments()) {
        $commentsLoader.remove();
      }
      $comments.find('span.count').html(loadedComments());

      callback();
    }, function (xhr) {
      console.log(xhr)
    });
  };

  $commentsOpener.on('click', function (ev) {
    ev.preventDefault();
    loadMoreComments(function () {
      $commentsOpener.fadeOut();
    });
  });

  $commentsLoader.on('click', function (ev) {
    ev.preventDefault();
    loadMoreComments();
  });

  var commentHtml = function (commentText, userImg, userName, commentTime) {

    var commentHtml = '' +
      '<div class="row answer-comment-list">' +
      '<div class="col s3 pading-none" style="padding: 0px;">' +
      '<img class=" circle responsive-img" style ="height:65px;width:65px" src="' + (userImg || '/img/user.png') + '">' +
      '</div>' +
      '<div class="col s9 right valign">' +
      '<span class="white-text user-name">' + commentText + '</span>' +
      '<span class="white-text user-comment"><a href="' + app.utils.site(userName) + '" class="scolor2">' + userName + '</a></span>' +
      '</div>' +
      '</div>';
    return commentHtml;
  };
  //'<span class="white-text user-mintues">' + commentTime + '</span>' +

  $commentInputBox.on('keyup', function (ev) {
    ev.stopPropagation();
    // check if the key was enter key and some comment has been
    // entered
    if (ev.keyCode === 13 && $commentInputBox.val().length > 0) {
      var commentText = $commentInputBox.val();
      var commentTime = new Date();
      //$commentInput.disabled = true;
      //console.log('sourceurl',sourceUrl);
      app.utils.ajax.post(sourceUrl, {data: {body: commentText}})
        .then(function () {
          //$commentInput.disabled = false;
          // ga(['send', 'Comments', 'Added', 'Widgets']);
          // mixpanel.track(
          //   'Comment Posted',
          //   {
          //     'screen_type': screen,

          //     'platform': navigator.platform,
          //     'entity_username': username,
          //     'entity_userid': userid,
          //     'entity_link': link,
          //     //'entity_type': type
          //   }
          // );
          $commentInputBox.val('');
          $commentsHolder.prepend(commentHtml(commentText, $commentInputBox.data('user-img'), $commentInputBox.data('user-name'), commentTime));

          totalComments += 1;
          $comments.data('total-comments', totalComments);
          $comments.find('span.total').html(totalComments);
          $comments.find('.comment-showing').show();
          $comments.find('.no-comment').hide();
          var newLoadedComments = loadedComments() + 1;
          $commentInfo.data('loaded-comments', newLoadedComments);
          $comments.find('span.count').html(newLoadedComments);
        });
    }
  });
};

app.behaviors.dropdown = function ($card) {
  $card.find('i.icon-options').on('click', function (e) {
    e.preventDefault();
    var flag = $(this).closest('i').find('ul.dropdown-content-new').css('display');
    $('i ul').hide('slow');
    if(flag == 'none'){
      $(this).closest('i').find('ul.dropdown-content-new').show('slow');
    } else {
      $(this).closest('i').find('ul.dropdown-content-new').hide('slow');
    }
  });
}

app.behaviors.followBtn = function ($followBtn, $followersCount) {

  /**
   * for mixPanel Data
   */
  var screen = app.$body.data('pagename');
  //var screenType = app.$body.data('userpage')
  var username = $followBtn.data('username');
  var userid = $followBtn.data('user-id');
  var link = $followBtn.data('entity-link');
  var type = $followBtn.data('entity-type');

  var targetUrl = $followBtn.data('target');
  var followActionUrl = function (type) {
    var parts = targetUrl.split('/');
    parts[1] = type;
    return parts.join('/');
  };

  var attachFollowingBehavior = function () {
    $followBtn.hover(
      function () {

        $followBtn.html('Unfollow');
      },
      function () {
        $followBtn.html('Followed');

      }
    );
  };

  var detachFollowingBehavior = function () {
    $followBtn.off('mouseenter');
    $followBtn.off('mouseleave');
    $followBtn.html('Follow');
  };

  var profile = $followBtn.data('profile');
  var username = $followBtn.data('username');
  var page = app.$body.data('source');
  //app.utils.btnStateChange($followBtn, "Processing...", true);

  $followBtn.on('click', function (ev) {
    ev.stopPropagation();
    $followBtn.html('Loading');
    app.utils.ajax.post(targetUrl)
      .then(
      function () {
        var state = $followBtn.data('state');
        // ga(['send', 'Follow', 'Follow', 'Widgets']);
        // mixpanel.track(
        //   'Follow',
        //   {
        //     'screen_type': screen,

        //     'platform': navigator.platform,
        //     'entity_username': username,
        //     'entity_userid': userid,
        //     'entity_link': link,
        //     //'entity_type': type
        //   }
        // );
        if (state === 'not-following') {
          // if existing state is not-following, that means the user
          // was followed
          // if (page === 'askPopup') {
          //   mixpanel.track(
          //   "Followed",
          //   { "Source": app.$body.data('source'),
          //     "User": username
          //   }
          //   );
          // }
          $followBtn.data('state', 'following');
          $followBtn.addClass('following');
          var url = followActionUrl('unfollow')
          $followBtn.attr("data-target", followActionUrl('unfollow'));
          //targetUrl = $followBtn.data('target');

          if ($followersCount !== undefined) {
            $followersCount.length > 0 && $followersCount.html(parseInt($followersCount.html()) + 1);
          }

          $followBtn.html('Followed');
        } else if (state === 'following') {
          // if existing state is not-following, that means the user
          // was unfollowed
          // if (page === 'askPopup') {
          //   mixpanel.track(
          //   "UnFollowed",
          //   { "Source": app.$body.data('source'),
          //     "User": username
          //   }
          //   );
          // }
          // ga(['send', 'Follow', 'Unfollow', 'Widgets']);
          // mixpanel.track(
          //   'Unfollow',
          //   {
          //     'screen_type': screen,

          //     'platform': navigator.platform,
          //     'entity_username': username,
          //     'entity_userid': userid,
          //     'entity_link': link,
          //     //'entity_type': type
          //   }
          // );
          $followBtn.data('state', 'not-following');
          $followBtn.attr("data-target", followActionUrl('follow'));
          //targetUrl = $followBtn.data('target');

          $followBtn.removeClass('following');
          if ($followersCount !== undefined) {
            $followersCount.length > 0 && $followersCount.html(parseInt($followersCount.html()) - 1);
          }

          $followBtn.html('Follow');
        }
        var page = app.$body.data('page');
      },
      function (xhr) {
        app.utils.btnStateChange($followBtn, "Follow", false);
        if (xhr.status !== 401) {

        }
        ;
      });
  });

}

app.behaviors.global = function () {
  /**
   * top level post button
   */
  app.$window.on('scroll', function (ev) {
    var $postBtnTop = $('#postBtnTop');
    if ($postBtnTop.length > 0) {
      if (app.$window.scrollTop() > 200) {
        $postBtnTop.fadeIn();
      } else {
        $postBtnTop.fadeOut();
      }
    }
  });

  app.utils.internet();
};

$(function () {
  app.behaviors.global();
});
app.behaviors.likeBtn = function ($likeBtnTrg, $likeBtn) {
  var likeActionUrl = function (action) {
    var targetUrl = $likeBtnTrg.data('target');
    var parts = targetUrl.split('/');
    parts[1] = action;
    return parts.join('/');
  };

  var $icon = $likeBtnTrg.find('.likeBtnIcon');
  var $numLikes = $likeBtnTrg.find('.num_likes');
  var isWorking = false;

  $likeBtnTrg.on('click', likeButtonHandler);

  function likeButtonHandler (ev) {

    ev.stopPropagation();
    var targetUrl = $likeBtnTrg.data('target');
    var state = $likeBtnTrg.data('state');

    //$likeBtnTrg.unbind('click');
    if (!isWorking) {
      isWorking = true;
      app.utils.ajax.post(targetUrl)
        .then(
        function () {
          if (state === 'unliked') {
            // if current state is unliked, that means the
            // answer was liked
            $likeBtnTrg.data('target', likeActionUrl('unlike'));
            $likeBtnTrg.data('state', 'liked');
            $likeBtnTrg.trigger('liked.widget');
            $icon.addClass('brandc');
            $numLikes.html(parseInt($numLikes.html()) + 1);
            $likeBtn.text("Liked");
            //$likeBtn.bind('click', likeButtonHandler);
            isWorking = false;
          } else if (state === 'liked') {
            // if current state is liked, that means the
            // answer was unliked
            $likeBtnTrg.data('target', likeActionUrl('like'));
            $likeBtnTrg.data('state', 'unliked');
            $likeBtnTrg.trigger('unliked.widget');
            $icon.removeClass('brandc');
            $numLikes.html(parseInt($numLikes.html()) - 1);
            $likeBtn.text("Like");
            isWorking = false;
            //$likeBtn.bind('click', likeButtonHandler);
          }
        },
        function (xhr) {
          if (xhr.status !== 401) {

          }
          isWorking = false;
        }
      );
    }
  }
};

app.behaviors.linkify = function ($input) {
  var originalText = $input.html();
  var linkifiedText = Autolinker.link(originalText);
  $input.html(linkifiedText);
};
app.behaviors.report = function ($reportButton) {

  var id = $reportButton.data('id');
  var type = $reportButton.data('type');

  $reportButton.on('click', function (ev) {
    ev.preventDefault();
    app.utils.ajax.post('/report-abuse', {
      data: {
        id: id,
        type: type,
      }
    }).then(
      function (data) {
        Materialize.toast('Your report has been registered successfully. The ' + type + ' has been reported.', 4000);
      },
      function (err) {
        Materialize.toast('Unable to report. Please try again later.', 4000);
      }
    );
  });
};
app.behaviors.requestAnswer = function ($requestBtn, isShare) {

  var buttonBehavior = function (state, requestUrl) {

    if (state === "request") {

      $requestBtn.addClass('success');
      $requestBtn.data('target', requestUrl.replace('request-answer', 'downvote-answer'));
      $requestBtn.data('state', 'downvote');
      $requestBtn.removeClass('sec');
      $requestBtn.html('<i class="icon-check"></i> Answer Requested');
      $requestBtn.removeClass("disabled");
      //app.utils.btnStateChange($requestBtn, '<i class="icon-check"></i> Answer Requested', false);
    } else if (state === "downvote") {

      $requestBtn.removeClass('success');
      $requestBtn.data('target', requestUrl.replace('downvote-answer', 'request-answer'));
      $requestBtn.data('state', 'request');
      $requestBtn.addClass('sec');
      $requestBtn.html('Request Answer');
      $requestBtn.removeClass("disabled");

      app.utils.btnStateChange($requestBtn, "Request Answer", false)
    }
    $requestBtn.fadeIn(100);
  };

  $requestBtn.on('click', function (ev) {
    app.utils.btnStateChange($requestBtn, "Processing...", true);
    var requestUrl = $requestBtn.data('target');
    var state = $requestBtn.data('state');
    app.utils.ajax.post(requestUrl)
      .then(function () {
        console.log("yes");
        buttonBehavior(state, requestUrl);
      },
      function (xhr) {
        app.utils.btnStateChange($requestBtn, "Request Answer", false);
        if (xhr.status !== 401) {

        }
      });
  });
};

app.behaviors.shareBtn = function (shareSelector, $shareIcon) {
  var share = new Share(shareSelector, {
    url: $shareIcon.data('url')
  });

  $shareIcon.hover(
    function () {
      share.open();
    },
    function () {
      share.close();
    }
  );
};
app.behaviors.textArea = function ($textArea, $countDisplay, $actionBtn, displayCutoff) {
  var supportOnInput = 'oninput' in document.createElement('input');
  var maxLength = parseInt($textArea.data('maxlength'));
  $textArea.on(supportOnInput ? 'input' : 'keyup', function (ev) {
    var charCount = $textArea.val().length;
    if (charCount >= displayCutoff) {
      $countDisplay.find('.character-count').html(maxLength - charCount);
    } else {
      $countDisplay.find('.character-count').html('');
    }

    if (charCount > maxLength) {
      $countDisplay.addClass('rc').removeClass('scolor yc');
      $actionBtn.addClass('disabled');
      app.utils.notify('Limit(' + maxLength + ') Exceeded', "error", 2);
      $actionBtn.css('pointer-events', 'none');
    } else if (charCount > Math.floor(maxLength / 2)) {
      $countDisplay.addClass('yc').removeClass('scolor rc');
      $actionBtn.removeClass('disabled');
      $actionBtn.css('pointer-events', 'auto');
    } else {
      $countDisplay.addClass('scolor').removeClass('rc yc');
      $actionBtn.removeClass('disabled');
      $actionBtn.css('pointer-events', 'auto');
    }
  });

  $textArea.on('blur', function () {
    $countDisplay.fadeOut();
  });

  $textArea.on('focus', function () {
    $countDisplay.fadeIn();
  });
};
//Video play-pause functionality
app.behaviors.video = function ($video, attachClickBehavior) {

  /**
   * for mixPanel Data
   */
  var screen = app.$body.data('pagename');
  //var screenType = app.$body.data('userpage')
  var username = $video.data('username');
  var userid = $video.data('userid');
  var link = $video.data('entity-link');
  var type = $video.data('entity-type');

  if (attachClickBehavior !== false) {
    attachClickBehavior = true;
  }

  var videoComesWithSrc = $video.attr('src') !== undefined && $video.attr('src').indexOf('http') === 0;
  var uuid = $video.attr('data-uuid');
  var isPlaying = false;
  var isViewed = false;
  var page = app.$body.data('source');
  var isCropped = false;
  if ($video.data('record') === undefined && $video.attr('poster') === null) {
    $video.attr('poster', '/img/video_loader.gif');
  }
  //var adapter = playerjs.HTML5Adapter($video[0]);
  // // Start accepting events
  //adapter.ready();

  var isMpd = false;
  var isDashSupported = $video.data('dash');
  var url = $video.attr('src');

  if (videoComesWithSrc) {
    if (url.indexOf('.mpd') >= 0) {
      // console.log('mpd');
      isMpd = true;
    }
  }

 // var context = new Dash.di.DashContext();
 // var player = new MediaPlayer(context);
 // if (isMpd && isDashSupported) {
 //   player.startup();
 //   player.attachView($video[0]);
 //   player.attachSource(url);
 // }

  $video.on('play', function (ev) {
    ga(['send', 'Video', 'Play', 'Widgets']);

    if (!isCropped) {
      isCropped = applyCropToFit();
      // isCropped = true;
    }

    // mixpanel.track(
    //   'Video Play',
    //   {
    //     'screen_type': screen,

    //     'platform': navigator.platform,
    //     'entity_username': username,
    //     'entity_userid': userid,
    //     'entity_link': link,
    //     //'entity_type': type
    //   }
    // );

    isPlaying = true;
    app.vent.trigger('video-played', $video.data('uuid'));
    if (!isViewed && videoComesWithSrc) {
      $video.trigger("video.playing");
      app.utils.ajax.post('/view', {
        data: {
          vurl: $video.attr('src')
        }
      });
      mixpanel.track("Video played", {
        "Source": 'Widget'
      });
      isViewed = true;
    }
  });

  $video.on('pause', function (ev) {
    ga(['send', 'Video', 'Paused', 'Widgets']);
    // mixpanel.track(
    //   'Video Paused',
    //   {
    //     'screen_type': screen,

    //     'platform': navigator.platform,
    //     'entity_username': username,
    //     'entity_userid': userid,
    //     'entity_link': link,
    //     //'entity_type': type
    //   }
    // );
    isPlaying = false;
  });

  $video.on('ended', function (ev) {
    ga(['send', 'Video', 'Ended', 'Widgets']);
    // mixpanel.track(
    //   'Video Ended',
    //   {
    //     'screen_type': screen,

    //     'platform': navigator.platform,
    //     'entity_username': username,
    //     'entity_userid': userid,
    //     'entity_link': link,
    //     //'entity_type': type
    //   }
    // );
    isPlaying = false;
  });

  if (attachClickBehavior) {
    $video.on('click', function (ev) {
      ga(['send', 'Videos', 'Clicked', 'Widgets']);
      if (isPlaying) {
        $video.trigger('pause');
        $video.siblings('audio').length > 0 && $video.siblings('audio').trigger('pause');
      } else {
        $video.trigger('play');
        $video.siblings('audio').length > 0 && $video.siblings('audio').trigger('play');
      }
    });
  }

  //// video positioning etc
  var $videoHolder = $video.parent();
  var $videoContainer = $videoHolder.parent();
  var $cardContainer = $videoContainer.parent();

  var applyCropToFit = function () {
    // console.log($video[0].videoWidth , $video[0].videoHeight,'css');
    var cropToFit = $video.attr('data-crop-to-fit');
    if (cropToFit !== false && cropToFit !== undefined) {
      var squareVideo = $video.attr('data-square-video') !== false &&
        $video.attr('data-square-video') !== undefined;

      // height/width ratio
      var heightWidthRatio = squareVideo ? 1 : 16 / 9;

      var containerWidth = $videoContainer.width();
      if (containerWidth >= 280){
        containerWidth = $cardContainer.width();
      }
      // console.log($videoContainer.width());
      var containerHeight = squareVideo ? containerWidth : Math.floor(heightWidthRatio * containerWidth);

      $videoContainer.css({
        height: containerHeight,
        minHeight: containerHeight,
        minWidth: containerHeight,
        position: 'relative',
        overflow: 'hidden'
      });
      if (Math.round(((heightWidthRatio * $video[0].videoWidth) / $video[0].videoHeight) - .28) === 1 ) {
        var videoMargin = (containerWidth - ((containerHeight / $video[0].videoHeight) * $video[0].videoWidth)) / 2;
        $videoHolder.css({
          height: $videoContainer.height(),
          width: (containerHeight / $video[0].videoHeight) * $video[0].videoWidth,
          marginLeft: videoMargin
        });
        $video.css({height: '100%', width: '100%'});
      } else {
        var videoMargin = (containerHeight - ((containerWidth / $video[0].videoWidth) * $video[0].videoHeight)) / 2;
        $videoHolder.css({
          width: containerWidth,
          height: (containerWidth / $video[0].videoWidth) * $video[0].videoHeight,
          marginTop: videoMargin
        });
        if ($video[0].videoWidth == 318 && $video[0].videoHeight == 572) {
          var videoMargin = (containerWidth - ((containerHeight / $video[0].videoHeight) * $video[0].videoWidth)) / 2;
          $videoHolder.css({
            height: $videoContainer.height(),
            width: (containerHeight / $video[0].videoHeight) * $video[0].videoWidth,
            marginLeft: videoMargin
          });
        }

        $video.css({height: '100%', width: '100%'});
      }
    }
    if ($videoContainer.width() == 280 && $videoContainer.height() == 503) {
      $video[0].videoWidth = containerWidth;
      $video[0].videoHeight = $videoContainer.height();
    }

    return ($video[0].videoWidth > 0 ? true : false );

  };

  if ($videoHolder.hasClass('videoHolder') && $videoContainer.hasClass('videoContainer')) {
    $videoHolder.css({
      backgroundColor: '#fff',
      overflow: 'hidden'
    });

    $video.on('loadedmetadata', function (ev) {
      if (!isCropped) {
        isCropped = applyCropToFit();
        //isCropped = true;
      }
    });

    $video.on('croptofit', function (ev) {
      if (!isCropped) {
        isCropped = applyCropToFit();
        //isCropped = true;
      }
    });
  }

  /**
   * Playing one video at a time
   */
  var autoPauseListener = function (ev, uuid) {
    if ($video.data('uuid') !== uuid) {
      var endedVideo = false;
      // $video.on('ended', function (ev){
      //   console.log("herererwerwer");
      //   endedVideo = true;
      // });
      if (!endedVideo) {
        $video.trigger('pause');
      }
      $video.siblings('audio').length > 0 && $video.siblings('audio').trigger('pause');
    }
  };

  app.vent.on('video-played', autoPauseListener);

  /**
   * tackling dynamic dom removal
   */
  var domNodeRemovalListener = function (ev) {
    if (app.utils.$elRemoved(ev, $video)) {
      app.vent.off('video-played', autoPauseListener);
      app.$document.off('DOMNodeRemoved', domNodeRemovalListener);
    }
  };

  app.$document.on('DOMNodeRemoved', domNodeRemovalListener);
};
app.components.profileFeedHolder = function ($feedHolder) {

  var $feedEnd = $feedHolder.find('.feed-end');
  var working = false;
  var done = false;

  var loadMore = function () {
    if (! working && ! done) {
      app.FRANKLY.currentfeed = (app.FRANKLY.currentfeed === undefined || app.FRANKLY.currentfeed === '') ? 'All' : app.FRANKLY.currentfeed;
      working = true;
      $feedEnd.html(app.utils.preloaderHtml());
      var questionIndex = parseInt($feedEnd.data('question-index'));
      questionIndex = isNaN(questionIndex) ? 0 : questionIndex;
      var postIndex = parseInt($feedEnd.data('post-index'));
      postIndex = isNaN(postIndex) ? 0 : postIndex;
      var userIndex = parseInt($feedEnd.data('user-index'));
      userIndex = isNaN(userIndex) ? 0 : userIndex;
      var pageUrl = app.utils.currentUrl(true);
      var pageNum = 0;
      if(app.FRANKLY.currentfeed === 'All'){
        pageNum = userIndex;
      }
      else if(app.FRANKLY.currentfeed === 'post'){
        pageNum = postIndex;
      }
      else{
        pageNum = questionIndex;
      }
      if(pageNum>=0){
        app.utils.ajax.get(pageUrl, {
            data: {
              questionIndex: isNaN(questionIndex) ? 0 : questionIndex,
              postIndex: isNaN(postIndex) ? 0 : postIndex,
              userIndex: isNaN(userIndex) ? 0 : userIndex,
              partials: ['profileall'],
              feedParam: app.FRANKLY.currentfeed
            }
          })
          .then(function (partials) {
            // extracting feedDiv without using jquery
            // so that script tags remain intact
            var el = document.createElement('div');
            el.innerHTML = partials.profileall;
            var $feedDiv = $(el).find('.feed');
            var $elFeedEnd = $(el).find('.feed-end');

            if ($feedDiv[0].childElementCount > 0) {
              $feedHolder.find('.column1').append($feedDiv.find('.column1').html());
              $feedHolder.find('.column2').append($feedDiv.find('.column2').html());
              $feedEnd.data('question-index', $elFeedEnd.data('question-index'));
              $feedEnd.data('post-index', $elFeedEnd.data('post-index'));
              $feedEnd.data('user-index', $elFeedEnd.data('user-index'));
            } else {
              $feedEnd.replaceWith('');
              done = true;
            }
            app.FRANKLY.dataelem = (app.FRANKLY.dataelem === undefined) ? {} : app.FRANKLY.dataelem;
            app.FRANKLY.dataelem[app.FRANKLY.currentfeed] = $feedHolder.parent().html();
            working = false;
          }, function (res) {
            console.log(res);
          });
        }
        else{
          $feedEnd.replaceWith('');
          done = true;
        }
    }
  };

  var scrollListener = function () {
    if (app.utils.$elInViewport($feedEnd) && ! done && ! working) {
      loadMore();
    }
  };

  app.$window.on('scroll', scrollListener);

  var domNodeRemovalListener = function (ev) {
    if (app.utils.$elRemoved(ev, $feedHolder)) {
      app.$window.off('scroll', scrollListener);
      app.$document.off('DOMNodeRemoved', domNodeRemovalListener);
    }
  };

  app.$document.on('DOMNodeRemoved', domNodeRemovalListener);

  // call a load more as soon as feed gets rendered
  //loadMore();

};

app.components.PushStreamConnecter = function(susbscriber) {
    var $susbscriber = $('#'+ susbscriber);
    var $notificationlist = $susbscriber.find('.notifications-list');
    // console.log($notificationlist.html());

    if (Notification.permission !== "granted"){
      Notification.requestPermission();
    }
    PushStream.LOG_LEVEL = 'PRODUCTION';
    var pushstream = new PushStream({
        host: 'webnotification.frankly.me',
        modes: "eventsource|websocket|stream",
        useSSL: true
    });
    pushstream.onmessage = _manageEvent;
    pushstream.onstatuschange = _statuschanged;
    $(document).on('click','.notification-click',function(){
        window.location.href = $(this).data('url');
    });


    function _manageEvent(eventMessage) {
        //console.logeventMessage["job"]);
        var dataOb = eventMessage;
        var parsedNotify = JSON.parse(dataOb.message);
        console.log(parsedNotify);
        //app.utils.notifyWs('Hi ' + "<%= me.username %>, " + dataOb.message + "From :" + dataOb.author, "success", 5);
        if (!Notification) {
            alert('Desktop notifications not available in your browser. Try Chromium.');
            return;
        }

        if (Notification.permission !== "granted")
            Notification.requestPermission();
        else {
            var args = {
                icon: parsedNotify.icon,
                body: parsedNotify.text.replace('<b>', '').replace('</b>', '')
            };
            var $template = $(".notification-template");
            var $icon = $template.find(".notificationimg");
            var $text = $template.find(".notificationtext");
            var $containingdiv = $template.find(".notification-click");
            $containingdiv.attr('data-url', parsedNotify.link);

            $icon.attr('src', args.icon);
            $text.empty();
            $text.append(parsedNotify.text);

            $notificationlist.prepend($template.html());

            var notification = new Notification(dataOb.author, args);

            notification.onclick = function() {
                window.open(parsedNotify.link);
            };

        }
        //var dataOb = eventMessage;
        //console.warn("recvied event" + new Date()  + ' ' + dataOb.message);
    };

    function _statuschanged(state) {
        if (state == PushStream.OPEN) {
            app.utils.notify("Notification Connected" + pushstream.wrapper.type , "success", 2);
        } else {
            app.utils.notify("Disconnected" , "error", 2);
        }
    };

    function _connect(channel) {
        pushstream.removeAllChannels();
        try {
            pushstream.addChannel(channel);
            pushstream.connect();
        } catch (e) {
            alert(e)
        };
    };
    _connect(susbscriber);
};

app.components.answerCard = function ($answerCard) {

  var $introVideo = $answerCard.find('.answer-first .introVideo');
  var $answerVideo = $answerCard.find('.answerVideo');
  var $answerImg = $answerCard.find('.answerImg');
  var $answerVideoContainer = $answerCard.find('.answer-video');
  var $videoContainer = $answerVideoContainer.find('.videoContainer');
  var $answerFirst = $answerCard.find('.answer-first');
  var $answerPaused = $answerCard.find('.answer-paused');
  var $answerBlank = $answerCard.find('.answer-blank');
  var $answerAdvertisement = $answerCard.find('.answer-advertisement');
  var $answerComments = $answerCard.find('.answer-comments');
  var $arrowUp = $answerCard.find('.arrow-up-icon');
  var $CommentPopup = $answerCard.find('.comment-popup');
  var $showCommentBox = $answerCard.find('.show-comment-box');
  var $followBtn = $answerCard.find('.followBtn');
  var $embedBtn = $answerCard.find('.embedBtn');

  var $videoHolder = $introVideo.parent();
  var $introVideoImage = $introVideo.parent().find('img.userImg');
  var $replayBtn = $answerBlank.find('.replay-video-icon');
  var videoEnded = false;

  var $deleteVideo = $answerCard.find('.delete-video');

  app.behaviors.dropdown($answerCard);

  $answerCard.find('a[download]').on('click', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    var link = document.createElement("a");
    link.download = $(this).attr('href');
    link.href = $(this).attr('href');
    link.click();
  });

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });

  $introVideoImage.on('click', function () {
    $introVideoImage.fadeOut('slow');
    $introVideo.fadeIn('slow');
    app.behaviors.video($introVideo);
    $introVideo.trigger('click');
  });

  var user_id = $answerVideo.data('user-id');

  // app.behaviors.video($introVideo);

  $answerImg.on('click', function () {
    app.behaviors.video($answerVideo, true);
    $answerVideoContainer.attr('style', 'display:block;');
    $answerFirst.css("display", 'none');
    $answerVideo.trigger('play');
  });

  var $pausedPlayBtn = $answerPaused.find('.play-video-icon');

  $pausedPlayBtn.on('click', function () {

    $answerVideo.trigger('click');
    $answerVideoContainer.css('display', 'block');
    $answerPaused.css('display', 'none');
    videoEnded = false;

  });

  $answerVideo.on('pause ended', function (ev) {
    $answerVideoContainer.css('display', 'none');
    $answerPaused.css('display', 'block');
    $answerBlank.css('display', 'none');
    $answerComments.css('display', 'none');
    videoEnded = false;
  });

  $answerVideo.on('ended', function () {

    videoEnded = true;
    $answerPaused.css('display', 'none');
    $answerBlank.css('display', 'block');
    //$replayBtn.css('display','none');

    // app.utils.ajax.get('/widgets/getUserType', {
    //   data: {
    //     user_id: user_id,
    //   }
    // }).then(function (data) {
    //   console.log(data);
    //   $answerBlank.css('display','block');
    // });
  });

  $CommentPopup.on('click', function (ev) {
    ev.preventDefault();
    $answerPaused.css('display', 'none');
    $answerAdvertisement.css('display', 'none');
    $answerBlank.css('display', 'none');
    $answerComments.css('display', 'block');

  });

  $arrowUp.on('click', function (ev) {
    ev.preventDefault();
    if (!videoEnded) {
      $answerPaused.css('display', 'block');
    }
    else {
      $answerBlank.css('display', 'block');
    }
    $answerComments.css('display', 'none');
  });

  $replayBtn.on('click', function (ev) {
    //ev.preventDefault();
    //$replayBtn.css('display','none');
    $answerBlank.css('display', 'none');
    $answerVideoContainer.css('display', 'block');
    $answerPaused.css('display', 'none');
    $answerVideo.trigger('click');
  });

  $deleteVideo.on('click', function (ev) {

    var postId = $(this).data('user-id');
    app.utils.ajax.post('/widgets/answer/delete', {
      data: {
        post_id: postId,
      }
    }).then(function (data) {
      $answerCard.remove();
    });
  })

  //follow functionality

  var $followBtn = $answerCard.find('.followBtn');
  // var $followersCount = $answerCard.find('.followers-count');
  app.behaviors.followBtn($followBtn);

  /**
   * like button functionality
   */
  var $likeBtnTrg = $answerCard.find('.likeBtnTrg');
  var $likeBtn = $answerCard.find('.likeBtn');
  app.behaviors.likeBtn($likeBtnTrg, $likeBtn);

  /**
   * comments functionality
   */
  var $comments = $answerCard.find('.answer-comments');
  app.behaviors.commentBtn($comments);

  /*
   * Share question on fb/twt/g+
   */
  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  var shareUrl = $answerCard.data('share-url');
  var shareText = $answerCard.data('share-text');
  var $fbShare = $answerCard.find(".icon-facebook");
  var $twtShare = $answerCard.find(".icon-twitter");
  var $fbShareCount = $answerCard.find(".fb-share-count");
  var $twtShareCount = $answerCard.find(".twt-share-count");
  var postId = $answerCard.data('post-id');

  $fbShare.on('click', function (ev) {
    ev.preventDefault();
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + shareUrl, 'facebook', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left)
    var current_count = parseInt($fbShareCount.html());
    $fbShareCount.html(current_count + 1);
    app.utils.ajax.post('/widgets/share/update', {
      data: {
        platform: 'facebook',
        post_id: postId,
      }
    }).then(function (data) {
      //write some fn here for success on count added
    });
  });

  $twtShare.on('click', function (ev) {
    ev.preventDefault();
    window.open('https://twitter.com/intent/tweet?url=' + shareUrl + '&text=' + shareText, 'twitter', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left)
    var current_count = parseInt($twtShareCount.html());
    $twtShareCount.html(current_count + 1);
    app.utils.ajax.post('/widgets/share/update', {
      data: {
        platform: 'twitter',
        post_id: postId,
      }
    }).then(function (data) {
      //write some fn here for success on count added
    });
  });

  var $reportButton = $answerCard.find('.report-user');
  app.behaviors.report($reportButton);

}

app.components.askBox = function($askBox, modal) {

  var $postArea = $askBox.find('.postArea');
  var $postBtn = $askBox.find('.postBtn');
  var $countDisplay = $askBox.find('.countDisplay');
  var $anonymousDiv = $askBox.find('.anonymousDiv');
  var $anon = $askBox.find('#anon');
  var $anonymousSpan = $askBox.find('.anonymousSpan');
  var $label = $askBox.find('.anonLabel');
  var anonymous = false;
  var minLength = $postArea.data('minlength');
  var $alertHookBar = $askBox.find('.alert-hookBar');
  var $alertBoxBar = $askBox.find('.alert-boxBar');
  var $alertBox = $askBox.find('.alert-box');

  var notifyAskBox = function(text, type, duration) {
    $alertHookBar.fadeIn();
    $alertBoxBar.fadeIn().addClass(type).html(text + '<a href="#" class="close">&times;</a>');

    // Types are: alert, success, warning, info
    if (duration != 0) {
      setTimeout(function() {
        $alertBox.removeClass(type).fadeOut().html('loading <a href="#" class="close">&times;</a>');
      }, duration * 1000);
    }
    $(document).on('close.alert', function(event) {
      $alertHookBar.html('<div data-alert  class=" alert-box alert radius alert-boxBar" style="display:none;"> Loading... <a href="#" class="close">&times;</a> </div>');
    });
  };
  // if (modal === false) {
  //   $postArea.on('click', function (ev) {
  //     ev.stopPropagation();
  //     $postArea.animate({height: '120px'}, 100).addClass('active');
  //     $anonymousDiv.delay('slow').fadeIn();
  //   });
  //   app.behaviors.textArea($postArea, $countDisplay, $postBtn, 225);

  //   app.$document.click(function() {
  //     if ($postArea.val().length === 0) {
  //       $anonymousDiv.fadeOut();
  //       $postArea.animate({height: '39px'}, 100).removeClass('active');

  //     }
  //   });
  // } else {
  $anonymousDiv.delay().fadeIn();
  var supportOnInput = 'oninput' in document.createElement('input');
  var maxLength = parseInt($postArea.data('maxlength'));
  var displayCutoff = 225;

  $postArea.on(supportOnInput ? 'input' : 'keyup', function(ev) {

    var charCount = $postArea.val().length;
    if (charCount >= displayCutoff) {
      $countDisplay.find('.character-count').html(maxLength - charCount);
    } else {
      $countDisplay.find('.character-count').html('');
    }

    if (charCount > maxLength) {
      $countDisplay.addClass('rc').removeClass('scolor yc');
      $postBtn.addClass('disabled');
      notifyAskBox('Limit(' + maxLength + ') Exceeded', "error", 2);
    } else if (charCount > Math.floor(maxLength / 2)) {
      $countDisplay.addClass('yc').removeClass('scolor rc');
      $postBtn.removeClass('disabled');
    } else {
      $countDisplay.addClass('scolor').removeClass('rc yc');
      $postBtn.removeClass('disabled');
    }
  });

  $postArea.on('blur', function() {
    $countDisplay.fadeOut();
  });

  $postArea.on('focus', function() {
    $countDisplay.fadeIn();
  });
  delete(app.cache.userQuestion);
  // }

  $anonymousDiv.on('click', function(ev) {
    ev.stopPropagation();
    return;
  });

  $anon.on('change', function(ev) {
    ev.stopPropagation();
    if (this.checked) {
      anonymous = true;
      $anonymousSpan.removeClass('scolor2');
    } else {
      anonymous = false;
      $anonymousSpan.addClass('scolor2');
    }
  });

  // store postArea question in a cache
  $postArea.on('keyup', function(ev) {
    app.cache.userQuestion = $postArea.val();
  });

  // set postArea val to cache value
  if (typeof(app.cache.userQuestion) === 'string' && app.cache.userQuestion.length > 0) {
    $postArea.val(app.cache.userQuestion);
  }

  // handle post submission
  var $shareAlert = $askBox.find('.share-alert');
  var targetUrl = $askBox.data('target');
  var shareAlertHtml = $shareAlert.html();

  $postArea.on('focus', function(ev) {
    $postArea.removeClass('rbr');
    $shareAlert.slideUp(1000);
  });

  var shareSelector = '#icon-share-' + $askBox.attr('id');
  var $shareIcon = $askBox.find(shareSelector);

  /**
   * Ask question button click
   */
  $postBtn.on('click', function(ev) {
    ev.stopPropagation();
    if ($postArea.val()) {
      app.utils.btnStateChange($postBtn, "Asking...", true);
      $shareAlert.html(shareAlertHtml);
      if ($postArea.val().length === 0 || $postBtn.hasClass('disabled') || $postArea.val().length <= 15) {
        $postArea.addClass('rbr');
        $postArea.trigger('click');
        if ($postArea.val().length <= 15) {
          Materialize.toast('Ask question in more than 15 characters', 3000);
        }
      } else {

      }

      var formData = {
        question: {
          body: $postArea.val(),
          is_anonymous: anonymous
        }
      };
      app.utils.ajax.post(targetUrl, {
        data: formData,
      }).then(
        function(data) {
          var editData = document.createElement('div');
          $(editData).addClass('col s12 m6');
          if (data.openQuestionCard) {
            $(editData).html(data.openQuestionCard);
          } else {
            $(editData).html(data.questionCard);
          }

          $('[data-feed-class]').prepend($(editData));
          Materialize.toast('Open question posted succesfully', 3000);
          // var question = data.question;
          // $shareAlert.slideDown(1000);
          // $shareAlert.find('i.last-question').html($postArea.val());
          // var urlShare = "http://frankly.me/"+question.to.username+"/"+question.slug;
          // $shareIcon.data('url',urlShare);
          // app.behaviors.shareBtn(shareSelector, $shareIcon);
          if (targetUrl.indexOf("openquestion") > 0) {
            app.utils.btnStateChange($postBtn, "Ask Open Question", false);
          } else {
            app.utils.btnStateChange($postBtn, "Ask Question", false);
          }
          // // $postBtn.html("Ask Question");
          // // $postBtn.removeClass("disabled");
          $postArea.val('');
          // $countDisplay.find('.character-count').html($postArea.data('maxlength'));
          delete(app.cache.userQuestion);
          //setTimeout(function () { app.utils.reloadNavAndPanel(); }, 2000);
        },
        function(xhr) {
          if (targetUrl.indexOf("openquestion") > 0) {
            app.utils.btnStateChange($postBtn, "Ask Open Question", false);
          } else {
            app.utils.btnStateChange($postBtn, "Ask Question", false);
          }
          console.log(xhr);
        }
      );
    } else {
      Materialize.toast('Enter Question', 2000);
    }

  });

  var domNodeRemovalListener = function(ev) {
    if (app.utils.$elRemoved(ev, $askBox)) {
      app.$document.off('DOMNodeRemoved', domNodeRemovalListener);
    }
  };

  app.$document.on('DOMNodeRemoved', domNodeRemovalListener);
};

app.components.authModal = function ($modal) {

  var $divSocialLogin = $modal.find('.section-social');
  var $fb = $divSocialLogin.find('.btn-facebook');
  var $twt = $divSocialLogin.find('.btn-twitter');
  var $ggl = $divSocialLogin.find('.btn-google');
  var $buttonOpenEmail = $divSocialLogin.find('.button-open-email');
  var $divEmail = $modal.find('.section-email');
  var $buttonEmailNext = $modal.find('.button-email-next');
  var $divPassword = $modal.find('.section-password');
  var $divName = $modal.find('.section-name');
  var $buttonLogin = $divPassword.find('.button-login');
  var $inputEmail = $divEmail.find('.input-email');
  var $inputName = $divName.find('.input-name');
  var $buttonNameNext = $divName.find('.button-name-done')
  var $inputPassword = $divPassword.find('.input-password');
  var $buttonBack = $modal.find('.back-button');
  var $divforgetPassword = $modal.find('.section-password-recover');
  var $forgetLabel = $divPassword.find('.forget-password-label');
  var $inputforgetPassword = $divforgetPassword.find('.input-forget-password');
  var $buttonSendEmail = $divforgetPassword.find('.button-send-email');
  var $createAccount = $modal.find('.create-account');
  var $userExist = $modal.find('.user-exist');
  var createAccount = false;

  var delayTime = 600;
  var userAction = false;
  var regexNameValidator = /^[ A-Za-z0-9]*$/i;
  var regexUserValidator = /^[A-Za-z0-9]*$/i;
  var regexEmailValidator = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;

  var userLoginDetail = {
    username: null,
    password: null
  }

  var startEmailLogin = function () {
    $divSocialLogin.fadeOut('slow');
    $divEmail.delay(delayTime).fadeIn('slow');
    setTimeout(function () {$inputEmail.focus();}, 1000);
  }

  $createAccount.on('click', function(ev) {
    ev.preventDefault();
    $inputEmail.attr('placeholder', 'Enter your email');
    createAccount = true;
    startEmailLogin();
  });

  $userExist.on('click', function(ev) {
    ev.preventDefault();
    createAccount = false;
    $inputEmail.attr('placeholder', 'Enter your email/username');
    startEmailLogin();
  });

  $('input').keypress(function (ev) {
    if(ev.keyCode == '13') {
      $(this).parent().parent().find('button').trigger('click');
    }
  });

  $buttonSendEmail.on('click', function () {
    var email = $inputforgetPassword.val();
    var isEmailValid = regexEmailValidator.test(email);
    if (email){
      if (isEmailValid) {
        var formData = {
          username: email.trim()
        };
        app.utils.ajax.post('/auth/reset-password', {
          data: formData
        }).then(
          function (data) {
            Materialize.toast('Password reset request sent. You\'ll receive an email shortly', 2000);
            window.location.reload();
          },
          function (res) {
            Materialize.toast('Something went wrong. Please try again later', 2000);
          }
        );
      } else {
        Materialize.toast('Invalid Email', 4000);
      }
    } else {
      Materialize.toast('Enter Email', 4000);
    }
  });

  $forgetLabel.on('click', function () {
    $divPassword.fadeOut('slow');
    $divforgetPassword.delay(delayTime).fadeIn('slow');
    setTimeout(function () {$inputforgetPassword.focus()}, 1000);
  });

  $buttonOpenEmail.on('click', function () {
    startEmailLogin();
  });

  //Email Div functionality
  $buttonEmailNext.on('click', function () {
    if ($inputEmail.val()) {
      var emailId = $inputEmail.val();
      var isValidEmail = createAccount ? regexEmailValidator.test(emailId) : (regexUserValidator.test(emailId) || regexEmailValidator.test(emailId));
      if (isValidEmail) {
        app.utils.ajax.post('/widgets/user/exists', {
          data: {
            email: $inputEmail.val()
          }
        }).then(function (data) {
          userLoginDetail.username = data.email;
          if (data.exists) {
            userAction = data.exists;
            $divEmail.fadeOut('slow');
            $divPassword.delay(delayTime).fadeIn('slow');
            setTimeout(function() {$inputPassword.focus();}, 1000);
          } else {
            $divEmail.fadeOut('slow');
            $divName.delay(delayTime).fadeIn('slow');
            setTimeout(function () {$inputName.focus()}, 1000);
          }
        }, function (err) {
          Materialize.toast('Something went wrong', 4000);
        });
      } else {
        Materialize.toast('Enter Valid Email', 4000);
      }
    } else {
      Materialize.toast('Enter Email', 4000);
    }
  });

  //Name Div functionality
  $buttonNameNext.on('click', function () {
    if ($inputName.val()) {
      var isNameValid = regexNameValidator.test($inputName.val());
      if (isNameValid) {
        userLoginDetail['fullname'] = $inputName.val();
        $divName.fadeOut('slow');
        $divPassword.delay(delayTime).fadeIn('slow');
        setTimeout(function () {$inputPassword.focus()}, 1000);
      } else {
        Materialize.toast('Invalid Input', 4000);
      }
    } else {
      Materialize.toast('Enter Name', 4000);
    }
  });

  //Login div functionality
  $buttonLogin.on('click', function () {
    if ($inputPassword.val()) {
      userLoginDetail.password = $inputPassword.val();
      var userDetailCount = Object.keys(userLoginDetail).length;
      if (userDetailCount === 2) {
        app.utils.ajax.post('/auth/local', {
          data: userLoginDetail
        }).then(function () {
            Materialize.toast('Login Successful', 2000);
            ga(['send', 'Authentication', 'LogIn', 'Widgets']);
            mixpanel.identify;
            var page = app.$body.data('page');
            if (page == 'userWidgetBatch') {
              app.utils.reloadNavAndPanelAndHeader();
            } else {
              app.utils.reloadNavAndPanel();
            }
            if (page == "openQuestionPage") {
              window.location.reload();
            }
            authSuccess();
            //$('#frankly-auth-modal').closeModal();
          },
          function () {
            Materialize.toast('Incorrect Credentials', 4000);
          })

      } else if (userDetailCount === 3) {
        if ((userLoginDetail.password).length >= 6) {
          console.log(userLoginDetail);
          app.utils.ajax.post('/auth/register', {
            data: userLoginDetail
          }).then(function () {
              console.log("here");
              ga(['send', 'Authentication', 'SignUp', 'Widgets']);
              mixpanel.identify;
              Materialize.toast('SignUp Successful', 2000);
              //goog_report_conversion();
              authSuccess();
              //app.utils.reloadNavAndPanel();
            },
            function () {
              Materialize.toast('Something went wrong', 4000);
            })
        } else {
          Materialize.toast('Password should be more than 6 characters', 4000);
        }
      }
    } else {
      Materialize.toast('Enter Password', 4000);
    }
  });

  /**
   * Back button functionality
   */
  $buttonBack.on('click', function () {
    if ($divEmail.is(':visible')) {
      $divEmail.fadeOut('slow');
      $divSocialLogin.delay(delayTime).fadeIn('slow');
    } else if ($divforgetPassword.is(':visible')) {
      $divforgetPassword.fadeOut('slow');
      $divPassword.delay(delayTime).fadeIn('slow');
      setTimeout(function () {$inputPassword.focus()}, 1000);
    } else if ($divName.is(':visible')) {
      $divName.fadeOut('slow');
      $divEmail.delay(delayTime).fadeIn('slow');
      setTimeout(function () {$inputEmail.focus()}, 1000);
    } else if ($divPassword.is(':visible')) {
      if (userAction) {
        $divPassword.fadeOut('slow');
        $divEmail.delay(delayTime).fadeIn('slow');
        setTimeout(function () {$inputEmail.focus()}, 1000);
      } else {
        $divPassword.fadeOut('slow');
        $divName.delay(delayTime).fadeIn('slow');
        setTimeout(function () {$inputName.focus()}, 1000);
      }
    }
  });

  var authSuccess = function (windowName) {
    if (app.utils.currentUrl() === app.utils.domain() + '/') {
      app.utils.redirectTo('/discover');
    } else {
      app.utils.reloadNavAndPanel();
    }

    app.utils.requestDeserializer(app.requestArgs);
    app.requestArgs = {};
    $('#frankly-auth-modal').closeModal();
    var page = app.$body.data('page');
    if (page == "openQuestionPage") {
      window.location.reload();
    }

    //addTrackingScripts();
  };

  (function initializeOpenUniquePopUp() {
    //set this to domain name
    var openedDomain = app.utils.domain(); //'http://frankly.me'
    var trackedWindows = {};
    var wName;
    window.openUniquePopUp = function (path, windowName, specs) {
      trackedWindows[windowName] = false;
      var popUp = window.open(null, windowName, specs);
      popUp.postMessage(wName, openedDomain);
      setTimeout(checkIfOpen, 1000);
      setInterval(checkIfPinged, 1000);
      wName = windowName;
      function checkIfOpen() {
        if (!trackedWindows[windowName]) {
          window.open(openedDomain + path, windowName, specs);
          popUp.postMessage(wName, openedDomain);
        }
      }

      function checkIfPinged() {
        popUp.postMessage(wName, openedDomain);
      }
    };

    if (window.addEventListener) {
      window.addEventListener('message', onPingBackMessage, false);

    } else if (window.attachEvent) {
      window.attachEvent('message', onPingBackMessage, false);
    }

    function onPingBackMessage(event) {

      if (event.origin == openedDomain && event.data === wName) {
        var winst = event.source;
        winst.close();
        authSuccess(event.data);
        trackedWindows[event.data] = true;
      }
    };
  })();

  /**
   * Social login
   */

  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);

  $fb.on('click', function (ev) {
    window.openUniquePopUp('/auth/facebook', 'twitter', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $twt.on('click', function (ev) {
    window.openUniquePopUp('/auth/twitter', 'twitter', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $ggl.on('click', function (ev) {
    window.openUniquePopUp('/auth/google', 'twitter', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });

};

app.components.authModalSuccess = function ($modal) {
  // window.close();
  (function listenForPings() {
    var openerDomain = app.utils.domain();
    console.log("child active");
    console.log(openerDomain);
    
    if (window.addEventListener) {
      window.addEventListener('message', onPingMessage, false);
    } else if (window.attachEvent) {
      window.attachEvent('message', onPingMessage, false);
    }

    function onPingMessage(event) {
      console.log('ping message sending back');
      if (event.origin == openerDomain)
        event.source.postMessage(event.data, event.origin);
    }
  })();
};
app.components.campaignCard = function($pane) {

  var $askUser = $pane.find('.askUser');
  var username = $askUser.data('username');
  $askUser.click(function() {
    mixpanel.track("Button clicked", {
      "Source": app.$body.data('source'),
      "User": username
    });
    var w = 700;
    var h = 450;
    var left = (screen.width / 2) - (w / 2);
    var top = (screen.height / 2) - (h / 2);
    
    var url = 'http://frankly.me/ask/' + username + '/question';
    return window.open(url, 'Ask anything',
      'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' +
      w + ', height=' + h + ', top=' + top + ', left=' + left);
  });
  

 var $video = $pane.find('.introVideo1');
  var $videoHolder = $video.parent();
  var $introVideoImage = $video.parent().find('img.userImg');
  var $followContainer = $pane.find('.follow-container');

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });
  $introVideoImage.on('click', function () {
    $introVideoImage.fadeOut('slow');
    $video.fadeIn('slow');
    app.behaviors.video($video);
    $video.trigger('click');
  });
};
app.components.category = function($category) {

  $customCategory = $category.find('.custom-category');
  $appendTo =   $category.find('.append-feed');
  $dropDown =  $category.find('.dropdown-selected');
  $categoryList =$category.find('.category-group-list');
  var category_Url = document.URL;
  $customCategory.on('click', function(){

    var $franksters = $category.find('.franksters');
    var $activity = $category.find('.activity');
    app.categoryFilter = $(this).data('filter-id');
    //console.log('here',app.categoryFilter);
    if(app.categoryFilter === 'franksters') {
      $franksters.css('display','block');
      $activity.css('display','none');

    }
    else if(app.categoryFilter === 'activity'){

      if(!app.repeatActivityCall) {
        $franksters.css('display','none');
        app.repeatActivityCall = true;
        $appendTo.prepend(app.utils.preloaderHtml());
        $appendTo.show();
        app.utils.ajax.get(category_Url, {
        data: {
            category_Name: app.categoryFilter,
            partials :['feed']
          }
          }).then(function (data) {
           $category.find('.text-center').hide();
          $appendTo.append(data.feed);
          $franksters.css('display','none');
          $activity.css('display','block');
    
        });       
      }
      else if(app.repeatActivityCall){

        $franksters.css('display','none');
        $activity.css('display','block');

      }
    }
  })
  var isListShown = false;
  $dropDown.on('click', function(){

    if(!isListShown) {
      $categoryList.css('display','block');
      isListShown =true;
    }
    else {
      $categoryList.css('display','none');
      isListShown =false;
    }

  })

}
app.components.discover = function($discover) {

  var $category = $discover.find('.custom-category');
  var $appendList = $discover.find('.feed-holder');

  if(app.$body.data('from')){

     app.utils.redirect(app.$body.data('from')+'/'+app.$body.data('username')+'/auth/'+app.$body.data('tok'));
     return;
  }
  $category.on('click',function() {
    var $featured = $discover.find('.featured');
    var $trending = $discover.find('.trending');

    app.categoryName = $(this).data('id');

    if(app.categoryName == 'featured'){
      $trending.css('display','none');
      $featured.css('display','block');
    }
    else if(app.isTrendingData && app.repeatCall){

      if(app.categoryName === 'trending' && app.isTrendingData === false){
        //do noting stop repeated data call
      }
      else{
        $featured.css('display','none');
        app.repeatCall = false;
        $appendList.prepend(app.utils.preloaderHtml());
        $appendList.show();
        //$('.trending').prop('disabled',true);
        //$trending.prop('disabled', true);
        app.utils.ajax.get('/discover', {
          data: {
            category_Name: app.categoryName,
            partials :['feed']
          }
          }).then(function (data) {
            $discover.find('.text-center').hide();
            $appendList.append(data.feed);
            if(app.categoryName == 'trending'){
              app.isTrendingData = false;
              $featured.css('display','none');
              $trending.css('display','block');
            }
           // $appendList.fadeIn(200);
           // $trending.prop('disabled', false);
           app.repeatCall = true;
        });
      }
    }
    else if(app.categoryName == 'trending'){
      $featured.css('display','none');
      $trending.css('display','block');
    }
  })

}

app.components.feedCreateVideo = function ($createVideoPane) {

  var $buttonCreateVideo = $createVideoPane.find('.btn-upload-video');
  var $inputVideoCaption = $createVideoPane.find('.input-video-caption');
  var url = '/recorder/recorder?type=blog&resourceId=';
  var w = 700;
  var h = 600;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);

  $buttonCreateVideo.on('click', function (ev) {
    ev.preventDefault();
    if ($inputVideoCaption.val()) {
      url = url + $inputVideoCaption.val()
      window.open(url, '', 'width=' + 300 + ',height=' + 500 + ',top=' + top + ',left=' + left);
      $inputVideoCaption.val('');
    } else {
      Materialize.toast('Enter a nice caption', 4000, 'red lighten-2');
    }
  });
}

app.components.homePage = function ($home){

  var $signUp = $home.find('.signUp');
  var $email = $home.find('.email');
  var $password = $home.find('.password'); 
  var $name = $home.find('.name');
  var userLoginDetail = {
    username: null,
    password: null
  }
  var regexNameValidator = /^[ A-Za-z0-9]*$/i;
  var regexEmailValidator = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
  $signUp.on('click', function (ev){
    var userExists = false;
    var email = $email.val();
    var isEmailValid = regexEmailValidator.test(email);
    if (!isEmailValid) {
      Materialize.toast('Enter Valid Email', 4000);
      return;
    }
    var name = $name.val();
    var isNameValid = regexNameValidator.test(name);
    if (!isNameValid) {
      Materialize.toast('Name can contain alphabets and numbers only', 4000);
      return;
    }
    app.utils.ajax.post('/widgets/user/exists', {
      data: {
        email: email
      }
    }).then(function (data) {
      if (!data.exists) {
        userExists = data.exists;
        if (!userExists) {
          if ($password.val()) {
            userLoginDetail.username = email;
            userLoginDetail['fullname'] = name;
            userLoginDetail.password = $password.val();
            //console.log(userExists);
              if ((userLoginDetail.password).length >= 6) {
                app.utils.ajax.post('/auth/register', {
                  data: userLoginDetail
                }).then(function () {
                    Materialize.toast('SignUp Successful', 2000);
                    authSuccess();
                  },
                  function () {
                    Materialize.toast('Something went wrong', 4000);
                  })
              } else {
                Materialize.toast('Password should be more than 6 characters', 4000);
              }
            
          } else {
            Materialize.toast('Enter Password', 4000);
          }
        } else {
          Materialize.toast('Email Already Exists', 4000);
        }
      }
    }, function (err) {
      Materialize.toast('Something went wrong', 4000);
    });

  })
  var authSuccess = function (windowName) {
    app.utils.requestDeserializer(app.requestArgs);
    app.requestArgs = {};
    if (app.utils.currentUrl() === app.utils.domain() + '/') {
      app.utils.redirectTo('/discover');
    } else {
      app.utils.reloadNavAndPanel();
    }

    //addTrackingScripts();
  };

  


}
app.components.loginPage = function ($modal) {

  var $divSocialLogin = $modal.find('.section-social');
  var $fb = $divSocialLogin.find('.btn-facebook');
  var $twt = $divSocialLogin.find('.btn-twitter');
  var $ggl = $divSocialLogin.find('.btn-google');
  var $buttonOpenEmail = $divSocialLogin.find('.button-open-email');
  var $divEmail = $modal.find('.section-email');
  var $buttonEmailNext = $modal.find('.button-email-next');
  var $divPassword = $modal.find('.section-password');
  var $divName = $modal.find('.section-name');
  var $buttonLogin = $divPassword.find('.button-login');
  var $inputEmail = $divEmail.find('.input-email');
  var $inputName = $divName.find('.input-name');
  var $buttonNameNext = $divName.find('.button-name-done')
  var $inputPassword = $divPassword.find('.input-password');
  var $buttonBack = $modal.find('.back-button');
  var $divforgetPassword = $modal.find('.section-password-recover');
  var $forgetLabel = $divPassword.find('.forget-password-label');
  var $inputforgetPassword = $divforgetPassword.find('.input-forget-password');
  var $buttonSendEmail = $divforgetPassword.find('.button-send-email');
  var $createAccount = $modal.find('.create-account');
  var $userExist = $modal.find('.user-exist');
  var $hiringRedirectionField = $modal.find('.hiring-redirection-field');
  var createAccount = false;

  var delayTime = 600;
  var userAction = false;
  var regexNameValidator = /^[ A-Za-z0-9]*$/i;
  var regexUserValidator = /^[A-Za-z0-9]*$/i;
  var regexEmailValidator = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;

  var userLoginDetail = {
    username: null,
    password: null
  }

  var startEmailLogin = function () {
    $divSocialLogin.fadeOut('slow');
    $divEmail.delay(delayTime).fadeIn('slow');
  }

  $createAccount.on('click', function (ev) {
    ev.preventDefault();
    $inputEmail.attr('placeholder', 'Enter your email')
    createAccount = true;
    startEmailLogin();
  });

  $userExist.on('click', function (ev) {
    ev.preventDefault();
    createAccount = false;
    $inputEmail.attr('placeholder', 'Enter your email/username');
    startEmailLogin();
  });

  $('input').keypress(function (ev) {
    if (ev.keyCode == '13') {
      $(this).parent().parent().find('button').trigger('click');
    }
  });

  $buttonSendEmail.on('click', function () {
    var email = $inputforgetPassword.val();
    var isEmailValid = regexEmailValidator.test(email);
    if (email) {
      if (isEmailValid) {
        var formData = {
          username: email.trim()
        };
        app.utils.ajax.post('/auth/reset-password', {
          data: formData
        }).then(
          function (data) {
            Materialize.toast('Password reset request sent. You\'ll receive an email shortly', 2000);
            window.location.reload();
          },
          function (res) {
            Materialize.toast('Something went wrong. Please try again later', 2000);
          }
        );
      } else {
        Materialize.toast('Invalid Email', 4000);
      }
    } else {
      Materialize.toast('Enter Email', 4000);
    }
  });

  $forgetLabel.on('click', function () {
    $divPassword.fadeOut('slow');
    $divforgetPassword.delay(delayTime).fadeIn('slow')
  });

  $buttonOpenEmail.on('click', function () {
    startEmailLogin();
  });

  //Email Div functionality
  $buttonEmailNext.on('click', function () {
    if ($inputEmail.val()) {
      var emailId = $inputEmail.val();
      var isValidEmail = createAccount ? regexEmailValidator.test(emailId) : (regexUserValidator.test(emailId) || regexEmailValidator.test(emailId));
      if (isValidEmail) {
        app.utils.ajax.post('/widgets/user/exists', {
          data: {
            email: $inputEmail.val()
          }
        }).then(function (data) {
          userLoginDetail.username = data.email;
          if (data.exists) {
            userAction = data.exists;
            $divEmail.fadeOut('slow');
            $divPassword.delay(delayTime).fadeIn('slow');
          } else {
            $divEmail.fadeOut('slow');
            $divName.delay(delayTime).fadeIn('slow');
          }
        }, function (err) {
          Materialize.toast('Something went wrong', 4000);
        });
      } else {
        Materialize.toast('Enter Valid Email', 4000);
      }
    } else {
      Materialize.toast('Enter Email', 4000);
    }
  });

  //Name Div functionality
  $buttonNameNext.on('click', function () {
    if ($inputName.val()) {
      var isNameValid = regexNameValidator.test($inputName.val());
      if (isNameValid) {
        userLoginDetail['fullname'] = $inputName.val();
        $divName.fadeOut('slow');
        $divPassword.delay(delayTime).fadeIn('slow');
      } else {
        Materialize.toast('Invalid Input', 4000);
      }
    } else {
      Materialize.toast('Enter Name', 4000);
    }
  });

  //Login div functionality
  $buttonLogin.on('click', function () {
    if ($inputPassword.val()) {
      userLoginDetail.password = $inputPassword.val();
      var userDetailCount = Object.keys(userLoginDetail).length;
      if (userDetailCount === 2) {
        app.utils.ajax.post('/auth/local', {
          data: userLoginDetail
        }).then(function () {
            Materialize.toast('Login Successful', 2000);
            ga(['send', 'Authentication', 'LogIn', 'Widgets']);
            mixpanel.identify;
            var page = app.$body.data('page');
            if (page == 'userWidgetBatch') {
              app.utils.reloadNavAndPanelAndHeader();
            } else {
              app.utils.reloadNavAndPanel();
            }
            if (page == "openQuestionPage") {
              window.location.reload();
            }
            authSuccess();
            //$('#frankly-auth-modal').closeModal();
          },
          function () {
            Materialize.toast('Incorrect Credentials', 4000);
          })

      } else if (userDetailCount === 3) {
        if ((userLoginDetail.password).length >= 6) {
          app.utils.ajax.post('/auth/register', {
            data: userLoginDetail
          }).then(function () {
              ga(['send', 'Authentication', 'SignUp', 'Widgets']);
              mixpanel.identify;
              Materialize.toast('SignUp Successful', 2000);
              //goog_report_conversion();
              authSuccess();
              //app.utils.reloadNavAndPanel();
            },
            function () {
              Materialize.toast('Something went wrong', 4000);
            })
        } else {
          Materialize.toast('Password should be more than 6 characters', 4000);
        }
      }
    } else {
      Materialize.toast('Enter Password', 4000);
    }
  });

  /**
   * Back button functionality
   */
  $buttonBack.on('click', function () {
    if ($divEmail.is(':visible')) {
      $divEmail.fadeOut('slow');
      $divSocialLogin.delay(delayTime).fadeIn('slow');
    } else if ($divforgetPassword.is(':visible')) {
      $divforgetPassword.fadeOut('slow');
      $divPassword.delay(delayTime).fadeIn('slow');
    } else if ($divName.is(':visible')) {
      $divName.fadeOut('slow');
      $divEmail.delay(delayTime).fadeIn('slow');
    } else if ($divPassword.is(':visible')) {
      if (userAction) {
        $divPassword.fadeOut('slow');
        $divEmail.delay(delayTime).fadeIn('slow');
      } else {
        $divPassword.fadeOut('slow');
        $divName.delay(delayTime).fadeIn('slow');
      }
    }
  });

  var authSuccess = function (windowName) {

    app.utils.requestDeserializer(app.requestArgs);
    app.requestArgs = {};
    $('#frankly-auth-modal').closeModal();
    var page = app.$body.data('page');
    if (page == "openQuestionPage") {
      window.location.reload();
    }
    if(app.$body.data('from')){
       //app.utils.redirect(app.$body.data('from')+'?username='+app.$body.data('username'));
       app.utils.redirectTo('/discover?redirect='+app.$body.data('from'));
       return;
    }
    if ($hiringRedirectionField.data('value') !== null) {
      console.log($hiringRedirectionField.data('value'));
      app.utils.redirectTo($hiringRedirectionField.data('value'));
      return;
    }
    if (app.utils.currentUrl() === app.utils.domain() + '/') {
      app.utils.redirectTo('/discover');
    } else {
      app.utils.reloadNavAndPanel();
    }

    //addTrackingScripts();
  };

  (function initializeOpenUniquePopUp () {
    //set this to domain name
    var openedDomain = app.utils.domain(); //'http://frankly.me'
    var trackedWindows = {};
    var wName;
    window.openUniquePopUp = function (path, windowName, specs) {
      trackedWindows[windowName] = false;
      var popUp = window.open(null, windowName, specs);
      popUp.postMessage(wName, openedDomain);
      setTimeout(checkIfOpen, 1000);
      setInterval(checkIfPinged, 1000);
      wName = windowName;

      function checkIfOpen () {
        if (!trackedWindows[windowName]) {
          window.open(openedDomain + path, windowName, specs);
          popUp.postMessage(wName, openedDomain);
        }
      }

      function checkIfPinged () {
        popUp.postMessage(wName, openedDomain);
      }
    };

    if (window.addEventListener) {
      window.addEventListener('message', onPingBackMessage, false);

    } else if (window.attachEvent) {
      window.attachEvent('message', onPingBackMessage, false);
    }

    function onPingBackMessage (event) {
      if (event.origin == openedDomain && event.data == wName) {
        var winst = event.source;
        winst.close();
        authSuccess(event.data);
        trackedWindows[event.data] = true;
      }
    };
  })();

  /**
   * Social login
   */

  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);

  $fb.on('click', function (ev) {
    window.openUniquePopUp('/auth/facebook', 'twitter', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $twt.on('click', function (ev) {
    window.openUniquePopUp('/auth/twitter', 'twitter', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $ggl.on('click', function (ev) {
    window.openUniquePopUp('/auth/google', 'twitter', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });

};

app.components.navBar = function($navBar) {
  var link = window.location.pathname;
  if (link.indexOf('/discover') > -1) {
    $navBar.find('[data-link-discover]').addClass('active');
  } else if (link.indexOf('/feed') > -1) {
    $navBar.find('[data-link-home]').addClass('active');
  }


  var $logOutBtn = $('.logout');

  $logOutBtn.on('click', function (ev) {
     ev.preventDefault();
     app.utils.ajax.post("/logout").then(function (){
       if (app.utils.currentUrl() === app.utils.domain() + '/feed') {
        app.utils.redirectTo('/discover');
       }
       else {
        app.utils.reloadNavAndPanel();
     }
     Materialize.toast('Logged Out', 5000);
    });
  });
}

app.components.notificationPanel = function ($id){

  var $taball = $id.find('.tab-all');
  var $tabnews = $id.find('.tab-post');
  var $feedEnd = $id.find('.feed-end');
  var $divall = $id.find('.my-tab-content');

  var NotificationPartial = function (param){
    var pageUrl = app.utils.currentUrl(true);
    var userIndex = parseInt($feedEnd.data('post-index'));
    var newsIndex = parseInt($feedEnd.data('news-index'));
    userIndex = isNaN(userIndex) ? 0 : userIndex;
    newsIndex = isNaN(newsIndex) ? 0 : newsIndex;

  app.utils.ajax.get(pageUrl, {
      data: {
        userIndex: userIndex, 
        partials: ['feed'],
        feedParam: param,
        nextindex: userIndex,
        newsindex: newsIndex
      }
    })
    .then(function (partials) {
      $divall.empty();
      $divall.append(partials.feed);
      $divall.css('display','block');
    });
  }



  $taball.on('click', function(){
    $taball.addClass('current');
    $tabnews.removeClass('current');
    NotificationPartial('me');
  });

  $tabnews.on('click', function (){
    $taball.removeClass('current');
    $tabnews.addClass('current');
    NotificationPartial('news');
  });


}
app.components.openQuestion = function ($card) {

  var $introVideo = $card.find('.introVideo');
  var $answerVideo = $card.find('.answerVideo');
  var $viewAll = $card.find('.viewAll');
  var $questionCardContent = $card.find('.question-card-content');
  var $recorder = $card.find('.popupRecorder');
  app.behaviors.video($introVideo);
  var w = 700;
  var h = 600;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);

  $('body').attr('class', '');

  $answerVideo.on('click', function (ev){
    window.open($(this).data('url'), '', 'width=' + 320 + ',height=' + 530 + ',top=' + top + ',left=' + left);
  });
    
  $viewAll.on('click', function (ev){
    window.open($(this).data('url'));
  });

  $recorder.on('click', function (ev){
    window.open($(this).data('url'), '', 'width=' + 300 + ',height=' + 500 + ',top=' + top + ',left=' + left);
  });

  /*
   * Share question on fb/twt/g+
   */
  var $fbShare = $card.find(".facebook-icon");
  var $twtShare = $card.find(".twitter-icon");
  var $gglShare = $card.find(".google-icon");
  var shareUrl = $questionCardContent.attr('data-url');
   
  
  $fbShare.on('click', function () {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left);
  });

  $twtShare.on('click', function () {
    var shareText = $twtShare.attr('data-text');
    window.open('https://twitter.com/intent/tweet?text=' + shareText + '&url=' + shareUrl, 'twitter', 'width='+w+',height='+h+',top='+top+',left='+left);
  });

  $gglShare.on('click', function () {
    window.open('https://plus.google.com/share?url=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left);
  });

};
app.components.profileFeedRight = function($card){
  var $taball = $card.find('.tab-all');
  var $tabquestion = $card.find('.tab-question');
  var $tabpost =  $card.find('.tab-post');

  var $divall = $card.find('#tab-all');

  var taballflag = true;
  var tabquestionflag = false;
  var tabpostflag = false;
  app.FRANKLY = (app.FRANKLY === undefined) ? {currentfeed: ""} : app.FRANKLY;
  app.FRANKLY.dataelem = (app.FRANKLY.dataelem === undefined) ? {} : app.FRANKLY.dataelem;
  app.FRANKLY.dataelem['All'] = $divall.html();
  var QuestionPostPartial = function (param, requestparam){
    if (!app.FRANKLY.dataelem[requestparam]){
      app.utils.ajax.get('/'+param,{data:{
          username: param,
          partials: ['profileall'],
          feedParam: requestparam
        }}).then(
        function(data){
          $divall.empty();
          $divall.append(data.profileall);
          app.FRANKLY.dataelem[requestparam] = data.profileall;
          $divall.css('display','block');
        });
    }
    else{
        $divall.empty();
        $divall.append(app.FRANKLY.dataelem[requestparam]);
    }
  }

  $taball.on('click', function(){
    app.FRANKLY.currentfeed = 'All';
    $tabquestion.removeClass('current');
    $tabpost.removeClass('current');
    $taball.addClass('current');
    var username = app.utils.currentUrl().split('/');
    var data = username[username.length-1];
    var feedParam = 'All';
    QuestionPostPartial(data, feedParam);
  });

  $tabquestion.on('click', function(){
    app.FRANKLY.currentfeed = 'Question';
    $tabpost.removeClass('current');
    $taball.removeClass('current');
    $tabquestion.addClass('current');
    var username = app.utils.currentUrl().split('/');
    var data = username[username.length-1];
    var feedParam = 'Question';
    QuestionPostPartial(data, feedParam);
  });

  $tabpost.on('click', function(){
    app.FRANKLY.currentfeed = 'Post';
    $taball.removeClass('current');
    $tabquestion.removeClass('current');
    $tabpost.addClass('current');
    var username = app.utils.currentUrl().split('/');
    var data = username[username.length-1];
    var feedParam = 'Post';
    QuestionPostPartial(data, feedParam);
  });
}

app.components.profileHeader = function ($card) {
	 var $video = $card.find('.introVideo');
  var $videoHolder = $video.parent();
  var $introVideoImage = $video.parent().find('img.userImg');
  var $followContainer = $card.find('.follow-container');

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });
  $introVideoImage.on('click', function () {
    $introVideoImage.fadeOut('slow');
    $video.fadeIn('slow');
    app.behaviors.video($video);
    $video.trigger('click');
  });

  var $followBtn = $card.find('.followBtn');
  var $followersCount = $card.find('.followers-count');
  app.behaviors.followBtn($followBtn, $followersCount);
};
  
app.components.profilepanel = function ($card) {
  //var $openQuestion = $card.find('.openQuestionPartial').toArray();
  var $video = $card.find('.introVideo');
  var $videoHolder = $video.parent();
  var $introVideoImage = $video.parent().find('img.userImg');
  // var $followContainer = $card.find('.follow-container');

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });
  $introVideoImage.on('click', function () {
    $introVideoImage.fadeOut('slow');
    $video.fadeIn('slow');
    app.behaviors.video($video);
    $video.trigger('click');
  });
  var toggle_view = false;
  $(window).scroll(function() {
    if($(window).scrollTop() > 200 && !toggle_view){

      $('.profile-wrapper').addClass('profile-wrapper-fixed');
      $('.profile-video').addClass('profile-video-fixed');
      // console.log($followContainer[0]);
      // $followContainer.addClass('btn-profile-fixed');
      $('.profile-user').addClass('profile-user-fixed ');
      $('.profile-links').hide();
      setTimeout(function () {
        $video.parent().attr('style', '');
        $video.parent().parent().attr('style', '');
        var width = $videoHolder.parent().parent().width();
        $videoHolder.css("height", width);
        app.behaviors.video($video);
        $video.trigger('croptofit');
      }, 1000);
      toggle_view = true;

     } else if ($(window).scrollTop() <= 200 && toggle_view){

      $('.profile-wrapper').removeClass('profile-wrapper-fixed');
      $('.profile-video').removeClass('profile-video-fixed');
      // $followContainer.removeClass('btn-profile-fixed');
      $('.profile-user').removeClass('profile-user-fixed ');
      $('.profile-links').show();
      setTimeout(function () {
        var width = $videoHolder.parent().parent().width();
        $videoHolder.css("height", width);
        app.behaviors.video($video);
        $video.trigger('croptofit');
      }, 1000);
       
      toggle_view = false;
    }

  });
  // app.behaviors.video($video);

  //follow functionality

  var $followBtn = $card.find('.followBtn');
  var $followersCount = $card.find('.followers-count');
  app.behaviors.followBtn($followBtn, $followersCount);
  
};



app.components.questionCard = function($questionCard) {

  var $introVideo = $questionCard.find('.qustionCardIntroVideo');
  var $videoHolder = $introVideo.parent();
  var $introVideoImage = $introVideo.parent().find('img.userImg');
  var $recorder = $questionCard.find('.recordBtn');

  app.behaviors.dropdown($questionCard);

  var w = 700;
  var h = 600;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });

  $introVideoImage.on('click', function () {
    $introVideoImage.fadeOut('slow');
    $introVideo.fadeIn('slow');
    $introVideo.trigger('click');
    $introVideo.trigger('play');
    app.behaviors.video($introVideo);
  });

  $recorder.on('click', function (ev){
    window.open($(this).data('target'), '', 'width=' + 300 + ',height=' + 500 + ',top=' + top + ',left=' + left);
  });
   /**
   * request answer functionality
   */
  var $requestBtn = $questionCard.find('.requestBtn');
  var isShare = !($requestBtn.data('share') === undefined);

  app.behaviors.requestAnswer($requestBtn, isShare);


  var $reportButton = $questionCard.find('.report-user');
  app.behaviors.report($reportButton);



}

app.components.resetPassword = function ($resetPassword) {
  var $newPasswordInput = $resetPassword.find('.newPassword');
  var $confirmNewPasswordInput = $resetPassword.find('.confirmNewPassword');
  var $resetPasswordBtn = $resetPassword.find('.reset-password-btn');
  var $passwordBlankMessage = $resetPassword.find('.passwordBlankMessage');
  var $confirmPasswordBlankMessage = $resetPassword.find('.confirmPasswordBlankMessage');
  var $passwordNotMatchingMessage = $resetPassword.find('.passwordMatchError');
  var resetToken = $resetPassword.data('token');

  $resetPasswordBtn.on('click', function () {
    if ($newPasswordInput.val().length === 0 || !$newPasswordInput.val().toString().trim()) {
      $passwordBlankMessage.slideDown('slow');
    }
    else if ($confirmNewPasswordInput.val().length === 0 || !$confirmNewPasswordInput.val().toString().trim()) {
      $confirmPasswordBlankMessage.slideDown('slow');
    } else if (
      $newPasswordInput.val().toString() !== $confirmNewPasswordInput.val().toString() ||
      $newPasswordInput.val().length === 0 || !$newPasswordInput.val().toString().trim()
    ) {
      $passwordNotMatchingMessage.slideDown('slow');
    } else {
      app.utils.ajax.post('/reset-password', {
        data: {
          password: $newPasswordInput.val(),
          resetToken: resetToken
        }
      }).then(
        function (data) {
          app.utils.redirectTo('/auth/login');
        },
        function (err) {
          alert('Something bad occurred. We are looking into the issue');
        }
      );
    }
  });

  $newPasswordInput.keydown(function (ev) {
    $passwordBlankMessage.slideUp('slow');
    $passwordNotMatchingMessage.slideUp('slow');
  });

  $confirmNewPasswordInput.keydown(function (ev) {
    $confirmPasswordBlankMessage.slideUp('slow');
    $passwordNotMatchingMessage.slideUp('slow');
  });
};
app.components.searchClick = function($click){
  var $searchBar = $click.find('#search');
  var $searchDiv = $click.find('.search');
  var searchUrl = $searchDiv.data('search-url')
  $searchBar.keyup(function (event){
    //console.log('here');
    if(event.keyCode == 13){
      window.location = searchUrl + "?searchcontent="+$searchBar.val();
    }
  });

}
app.components.settings = function ($card) {
  
}

app.components.stdFeed = function ($feedHolder) {

  var $feedEnd = $feedHolder.find('.feed-end');
  var working = false;
  var done = false;

  var loadMore = function () {
    var categoryName = $feedHolder.data('category-id');
    var categoryFilter =$feedHolder.data('categoryFilter')
    if (! working && ! done) {
      working = true;
      $feedEnd.html(app.utils.preloaderHtml());
      var postIndex = parseInt($feedEnd.data('post-index'));
      var userPostIndex = parseInt($feedEnd.data('userpost-index'));
      var categoryIndex = parseInt($feedEnd.data('category-index'));

      categoryIndex = isNaN(categoryIndex) ? 0:categoryIndex;
      var pageUrl = app.utils.currentUrl(true);

      if (postIndex>=0){
        app.utils.ajax.get(pageUrl, {
            data: {
              postIndex: isNaN(postIndex) ? 0 : postIndex,
              userPostIndex:isNaN(userPostIndex) ? 0 : userPostIndex,
              categoryIndex:isNaN(categoryIndex) ? 0:categoryIndex,
              partials: ['feed'],
              category_Name: categoryName,
              category_Filter: categoryName,

            }
          })
          .then(function (partials) {
            // extracting feedDiv without using jquery
            // so that script tags remain intact
            var el = document.createElement('div');

            el.innerHTML = partials.feed;

            var $feedDiv = $(el).find('.feed');
            var $elFeedEnd = $(el).find('.feed-end');

            if ($feedDiv[0].childElementCount > 0) {
              $feedHolder.find('.feed').append($feedDiv.html());
              $feedEnd.data('post-index', $elFeedEnd.data('post-index'));
              $feedEnd.data('userpost-index', $elFeedEnd.data('userpost-index'));
              $feedEnd.data('category-index', $elFeedEnd.data('category-index'));
            } else {            
              $feedEnd.replaceWith('');
              done = true;
            }
            working = false;

          }, function (res) {
            console.log(res);
          });
      } else {
        $feedEnd.replaceWith('');
        done = true;
      }
    }
  };

  var scrollListener = function () {
    if (app.utils.$elInViewport($feedEnd) && ! done && ! working) {
      loadMore();
    }
  };

  app.$window.on('scroll', scrollListener);

  var domNodeRemovalListener = function (ev) {
    if (app.utils.$elRemoved(ev, $feedHolder)) {
      app.$window.off('scroll', scrollListener);
      app.$document.off('DOMNodeRemoved', domNodeRemovalListener);
    }
  };

  app.$document.on('DOMNodeRemoved', domNodeRemovalListener);

  // call a load more as soon as feed gets rendered
  //loadMore();

};

app.components.stdFeedHolder = function ($feedHolder) {

  var $feedEnd = $feedHolder.find('.feed-end');
  var working = false;
  var done = false;
 

  var loadMore = function () {
    if (! working && ! done) {
      working = true;

      $feedEnd.html(app.utils.preloaderHtml());
      var questionIndex = parseInt($feedEnd.data('question-index'));
      questionIndex = isNaN(questionIndex) ? 0 : questionIndex;
      var postIndex = parseInt($feedEnd.data('post-index'));
      postIndex = isNaN(postIndex) ? 0 : postIndex;
      var userIndex = parseInt($feedEnd.data('user-index'));
      userIndex = isNaN(userIndex) ? 0 : userIndex;
      var newsIndex = parseInt($feedEnd.data('news-index'));
      newsIndex = isNaN(userIndex) ? 0 : userIndex;
      var pageUrl = app.utils.currentUrl(true);
      console.log(postIndex);
      if (postIndex>=0){
        app.utils.ajax.get(pageUrl, {
            data: {
              questionIndex: isNaN(questionIndex) ? 0 : questionIndex,
              postIndex: isNaN(postIndex) ? 0 : postIndex,
              userIndex: isNaN(userIndex) ? 0 : userIndex, 
              newsIndex: isNaN(newsIndex) ? 0 : newsIndex,
              partials: ['feed']
            }
          })
          .then(function (partials) {
            // extracting feedDiv without using jquery
            // so that script tags remain intact
            var el = document.createElement('div');
            el.innerHTML = partials.feed;
            var $feedDiv = $(el).find('.feed');
            var $elFeedEnd = $(el).find('.feed-end');

            if ($feedDiv[0].childElementCount > 0) {
              $feedHolder.find('.feed').append($feedDiv.html());
              $feedEnd.data('question-index', $elFeedEnd.data('question-index'));
              $feedEnd.data('post-index', $elFeedEnd.data('post-index'));
              $feedEnd.data('user-index', $elFeedEnd.data('user-index'));
            } else {            
              // $feedEnd.replaceWith('');
              done = true;
            }

            working = false;
              
          }, function (res) { console.log(res); });
    } else {
      $feedEnd.replaceWith('');
      done = true;
    }
  }
  };




  var scrollListener = function () {
    if (app.utils.$elInViewport($feedEnd) && ! done && ! working) {
      loadMore();
    }
  };

  app.$window.on('scroll', scrollListener);

  var domNodeRemovalListener = function (ev) {
    if (app.utils.$elRemoved(ev, $feedHolder)) {
      app.$window.off('scroll', scrollListener);
      app.$document.off('DOMNodeRemoved', domNodeRemovalListener);
    }
  };

  app.$document.on('DOMNodeRemoved', domNodeRemovalListener);

  // call a load more as soon as feed gets rendered
  //loadMore();

};
app.components.stdFeedNew = function ($feedHolder) {

  var $feedEnd = $feedHolder.find('.feed-end');
  var working = false;
  var done = false;

  var loadMore = function () {
    var categoryName = $feedHolder.data('category-id');
    if (! working && ! done) {
      working = true;
      $feedEnd.html(app.utils.preloaderHtml());
      var postIndex = parseInt($feedEnd.data('post-index'));
      var userPostIndex = parseInt($feedEnd.data('userpost-index'));
      var categoryIndex = parseInt($feedEnd.data('category-index'));

      categoryIndex = isNaN(categoryIndex) ? 0:categoryIndex;
      var pageUrl = app.utils.currentUrl(true);
      if (postIndex>=0){
      app.utils.ajax.get(pageUrl, {
          data: {
            postIndex: isNaN(postIndex) ? 0 : postIndex,
            userPostIndex:isNaN(userPostIndex) ? 0 : userPostIndex,
            categoryIndex:isNaN(categoryIndex) ? 0:categoryIndex,
            partials: ['feed'],
            category_Name: categoryName,
          }
        })
        .then(function (partials) {
          // extracting feedDiv without using jquery
          // so that script tags remain intact
          var el = document.createElement('div');

          el.innerHTML = partials.feed;

          var $feedDiv = $(el).find('.feed');
          var $elFeedEnd = $(el).find('.feed-end');
          if ($feedDiv[0].childElementCount > 0) {
            $feedHolder.find('.column1').append($(el).find('.column1').html());
            $feedHolder.find('.column2').append($(el).find('.column2').html());
            $feedHolder.find('.column3').append($(el).find('.column3').html());
            $feedHolder.find('.column4').append($(el).find('.column4').html());
            // $feedHolder.find('.feed').append($feedDiv.html());
            $feedEnd.data('post-index', $elFeedEnd.data('post-index'));
            $feedEnd.data('userpost-index', $elFeedEnd.data('userpost-index'));
            $feedEnd.data('category-index', $elFeedEnd.data('category-index'));
          } else {
            $feedEnd.replaceWith('');
            done = true;
          }
          working = false;

        }, function (res) {
          console.log(res);
        });
      }
      else{
        $feedEnd.replaceWith('');
        done = true;
      }
    }
  };

  var scrollListener = function () {
    if (app.utils.$elInViewport($feedEnd) && ! done && ! working) {
      loadMore();
    }
  };

  app.$window.on('scroll', scrollListener);

  var domNodeRemovalListener = function (ev) {
    if (app.utils.$elRemoved(ev, $feedHolder)) {
      app.$window.off('scroll', scrollListener);
      app.$document.off('DOMNodeRemoved', domNodeRemovalListener);
    }
  };

  app.$document.on('DOMNodeRemoved', domNodeRemovalListener);

  // call a load more as soon as feed gets rendered
  //loadMore();

};

app.components.userBio = function($card) {
  var $userBio = $card.find(".userbio");
  app.behaviors.linkify($userBio);
}
app.components.userCard = function ($container) {
  var $introVideo = $container.find('.introVideo');
  var $introVideoImage = $introVideo.parent().find('img.userImg');
  var $videoHolder = $introVideo.parent();
  var $followBtn = $container.find('.followBtn');

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });

  $introVideoImage.on('click', function () {
    $introVideoImage.fadeOut('slow');
    $introVideo.trigger('play');
    $introVideo.fadeIn('slow');
    app.behaviors.video($introVideo);
  });
  app.behaviors.followBtn($followBtn);
}
