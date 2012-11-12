CloudFlare.require(
    ['cloudflare/console', 'cloudflare/dom'],
    function(console, dom) {
        function bindEvent(domEl, event, fn, bubbling){

            bubbling = bubbling || false;
     
            if (window.addEventListener) {
                domEl.addEventListener(event, fn, bubbling);
                return true;
            } else if (domEl.attachEvent) {
                domEl.attachEvent(event, fn, false);
                return true;
            } else {
                return false;
            }
        };

        function unbindEvent(domEl, event, fn, bubbling){

            bubbling = bubbling || false;
     
            if (window.removeEventListener) {
                domEl.removeEventListener(event, fn, bubbling);
                return true;
            } else if (domEl.detachEvent) {
                domEl.detachEvent(event, fn, false);
                return true;
            } else {
                return false;
            }
        };

        function modifyLinkIfVisible(domEl){

            var rect =  domEl.getBoundingClientRect();

            if (rect.top >= 0 && rect.left >= 0 &&
                    rect.bottom <= dom.getViewport().height &&
                        rect.right <= dom.getViewport().width) {

                domEl.target = "_blank";
                return true;
            }
            return false;
        };

        function OpenLinksNewTab() {
        };
        var openLinksNewTab = new OpenLinksNewTab({});

        OpenLinksNewTab.prototype._purgeAnchors = function(anchor, anchors) {

            for (var i = 0, len = anchors.length; i < len; i++) {

                var anchorEL = anchors[i];
                if (anchorEL === anchor) {
                    anchors.splice(i, 1);
                    i = i - 1;
                }
         
            }
        };

        OpenLinksNewTab.prototype._modifyTarget = function() {
            for (var i = 0; i < openLinksNewTab.anchors.length; i++) {

                var anchor = openLinksNewTab.anchors[i];
                
                if (modifyLinkIfVisible(anchor)) {
                    openLinksNewTab._purgeAnchors(anchor, openLinksNewTab.anchors);
                };
            }

            if (openLinksNewTab.anchors.length === 0){
                unbindEvent(window, "scroll", openLinksNewTab._modifyTarget);
                unbindEvent(window, "resize", openLinksNewTab._modifyTarget);
            }
        };

        OpenLinksNewTab.prototype.setup = function() {
            this.anchors = this.stack = [];
            var anchorsCol = document.getElementsByTagName("a");

            for (var i = 0, len = anchorsCol.length; i < len; i++) {
               this.anchors.push(anchorsCol[i]); 
            }

            // this.anchors = Array.prototype.slice.call(document.getElementsByTagName("a");

            this._modifyTarget(this.anchors);

            bindEvent(window, "scroll", this._modifyTarget);
            bindEvent(window, "resize", this._modifyTarget);

        };
        
        openLinksNewTab.setup();
    }
);