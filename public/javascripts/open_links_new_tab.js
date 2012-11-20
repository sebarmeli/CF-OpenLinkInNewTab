CloudFlare.require(
    ['cloudflare/console', 'cloudflare/dom'],
    function(console, dom) {

        /*
        * Utility method to fire an event
        *
        * @param element - DOM element
        * @param event - event name
        */
        function fireEvent (element, event) {
            if (document.createEventObject) {
                var evt = document.createEventObject();
                return element.fireEvent('on' + event, evt);
            } else {
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent(event, true, true );
                return !element.dispatchEvent(evt);
            }
        };

        /*
        * Creates the HTML and style for the top nav. Handlers are attached if you want to be redirected to a 
        * new tab or if you want to close the top bar.
        *
        * @param targetEl - anchor clicked
        */
        function createTopBar(targetEl){
            // Style
            var rules = "#cloudflare-openlinksnewtab{background:#ccc; width:100%; position:absolute; z-index:10000;height:30px; top:0; left:0; overflow:hidden; padding:8px 0px; font-size:18px/26px Arial; text-align:center;color:#000}";
            rules += "#cloudflare-openlinksnewtab a {text-decoration:underline;color:#000;}";
            rules += "#cloudflare-openlinksnewtab a:hover{text-decoration:none; color:#EEE;}"
            rules += "#cloudflare-openlinksnewtab a#cloudflare-close{background:#393b40;display:block;width:42px;height:42px;position:absolute;text-decoration:none !important;cursor:pointer;top:0;right:0px;font-size:30px;line-height:42px;}";
            
            var style = document.createElement('style');
            style.id = 'cloudflare-openlinksinnewtab';
            style.setAttribute('type', 'text/css');
        
            if (style.styleSheet) {
                style.styleSheet.cssText = rules;
            } else {
                style.appendChild(document.createTextNode(rules));
            }

            // HTML
            var head = document.getElementsByTagName( 'head' )[ 0 ],
                firstChild = head.firstChild;
            head.insertBefore( style, firstChild );

   
            var message = document.createElement( 'div' );
            message.id = 'cloudflare-openlinksnewtab';
            message.innerHTML = "If you want to force <i>" + targetEl.href + "</i> to be opened in a new window, click ";

   
            var redirectButton = document.createElement( 'a' );
            redirectButton.id = 'cloudflare-redirect';
            redirectButton.innerHTML = 'here';

            var closeButton = document.createElement( 'a' );
            closeButton.id = 'cloudflare-close';
            closeButton.innerHTML = '&times;';

            message.appendChild( redirectButton );
            message.appendChild( closeButton );
            document.body.appendChild( message );
            document.body.className += ' cloudflare-open-links-body';

            // Event handlers
            dom.addEventListener(redirectButton, "click", function(){
                if (window.sessionStorage) {
                    window.sessionStorage.setItem("cf-" + dom.getData(targetEl, "cfid"), "_blank");
                }
                message.style.display = "none";
                fireEvent(targetEl, "click");
            });

            dom.addEventListener(closeButton, "click", function(){
                if (window.sessionStorage) {
                    window.sessionStorage.setItem("cf-" + dom.getData(targetEl, "cfid"), targetEl.target);
                }
                message.style.display = "none";
                fireEvent(targetEl, "click");
            });
        }

        /*
        * Event handler triggered clicking on an anchor
        *
        * @param e - event
        */
        function showTopBar (e) {
            var targetEl = e.target;

            // Returns if the anchor doesn't link to any document
            if (!targetEl.href || targetEl.href === "#") {
                return false;
            }

            // Checks if the anchor is already been saved in the sessionStorage
            if (window.sessionStorage) {
                var sess_target = window.sessionStorage.getItem("cf-" + dom.getData(targetEl, "cfid"));

                if (sess_target || sess_target === '') {
                    targetEl.target = sess_target;
                    return true;
                }
            }

            createTopBar(targetEl);
            
            e.preventDefault();
            e.stopPropagation();
        };

        /*
        * Checks whether the anchor is in the visible area. If it is,  "data" attribute is set and the 
        * showBar function is attached to the "click" event.
        *
        * @param domEl - anchor
        */
        function modifyLinkIfVisible(domEl){

            // In case the anchor has the "target" attribute equal to "_blank", the linked document will be opened in a 
            // a new tab by default
            if (domEl.target === "_blank") {
                return true;
            }

            var rect =  domEl.getBoundingClientRect();

            if (rect.top >= 0 && rect.left >= 0 &&
                    rect.bottom <= dom.getViewport().height &&
                        rect.right <= dom.getViewport().width) {

                dom.setData(domEl, "cfid", openLinksNewTab.index++);
                dom.addEventListener(domEl, "click", showTopBar);

                return true;
            }
            return false;
        };

        /*
        *  Constructor function defining initial index for the anchors. Index is 
        * going to be used as key stored in the sessionStorage. 
        */
        function OpenLinksNewTab() {
            this.index = 0;
        };
        var openLinksNewTab = new OpenLinksNewTab({});

        /*
        *  Parse the live collection of anchors and calls 'modifyLinkIfVisible' for each anchor
        */
        OpenLinksNewTab.prototype.parseLinks = function() {
            if (!this.anchorsLive) {
                return false;
            }

            for (var i = 0; i < this.anchorsLive.length; i++) {

                var anchor = this.anchorsLive[i];
                modifyLinkIfVisible(this.anchorsLive[i]);
            }            
        };

        /*
        * Looks for anchors in the page and associates the window's scroll' and 'resize' event to the 'parseLinks' fn.
        * The 'DOMNodeInserted' method is also handled for modern browsers and IE9+. This event looks for DOM elements added
        * dynamically.
        *
        */
        OpenLinksNewTab.prototype.setup = function() {
            var self = this;

            this.anchorsLive = document.getElementsByTagName("a");
            this.anchors = [];
            
            this.parseLinks();

            dom.addEventListener(window, "scroll", function(){
                self.parseLinks();
            });
            dom.addEventListener(window, "resize", function(){
                self.parseLinks();
            });

            dom.addEventListener(document, "DOMNodeInserted", function(e){
                if (e.target.tagName === "A") {
                    modifyLinkIfVisible(e.target);
                }
            });
        };
        
        openLinksNewTab.setup();
    }
);
