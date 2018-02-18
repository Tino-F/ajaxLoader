class AjaxLoader {

  addPage ( activator, contentURL, options ) {
    //options: fadeOutStart fadeOutEnd fadeInStart fadeInEnd/complete error

    let defaultFunc = dom => false;

    options.fadeOutStart = options.fadeOutStart || defaultFunc;
    options.fadeOutEnd = options.fadeOutEnd || defaultFunc;
    options.fadeInStart = options.fadeInStart || defaultFunc;
    options.complete = options.complete || defaultFunc;
    options.error = options.error || defaultFunc;
    options.click = options.click || defaultFunc;
    options.progress = options.progress || defaultFunc;

    this.Pages.push({ activator: activator, url: contentURL, options: options });
    this.Nav[ activator ] = true;

    let dom = document.getElementById( activator );

    dom.addEventListener( 'click', ( e ) => {

      e.preventDefault();

      options.click( dom );

      let xhttp = this.newXhttp();

      if ( !this.preLoaded[ activator ] ) {
        //The content has not been loaded yet

        xhttp.onload = ( e ) => {

          if ( e.lengthComputable ) {
            options.progress( dom, e.loaded / e.total * 100 );
          }

        };

        xhttp.onreadystatechange = () => {

          if ( xhttp.readyState === 4 ) {

            if ( xhttp.status === 200 ) {

              window.location.hash = activator;
              this.killfade();
              this.container.innerHTML = xhttp.response;
              this.fadeIn( options.fadeInStart( dom ), options.complete( dom ) );
              this.preLoaded[ activator ] = xhttp.response;

            } else {
              //Error occured when grabbing content

              this.killfade();
              this.container.innerHTML = this.errorMessage;
              this.fadeIn( options.fadeInStart( dom ), options.complete( dom ) );

            }

          }

        }

        xhttp.open( 'GET', contentURL );

        this.fadeOut( options.fadeOutStart( dom ), () => {

          options.fadeOutEnd( dom );
          this.container.innerHTML = this.loadingContent;
          this.container.style.opacity = 1;
          xhttp.send();

        });

      } else {
        //content has been loaded and stored for reuse

        this.killfade();
        window.location.hash = activator;
        this.container.innerHTML = this.preLoaded[ activator ];
        this.fadeIn( options.fadeInStart( dom ), options.complete( dom ) );

      }

    });

  }

  setHome ( options ) {
    //takes .id .url & complete

    if ( !options.complete ) { options.complete = () => false; }

    if ( !options.url ) {

      document.getElementById( options.id ).addEventListener( 'click', () => {

        this.killfade();

        this.fadeOut(() => {

          window.location.hash = '';
          options.complete();

        });

      });

    } else {

      this.addPage( id, options.url, options.complete );

    }

  }

  newXhttp () {
    //returns correct XMLHTTP object depending on browser compatibility

    let xhttp;

    if ( window.XMLHttpRequest ) {
      xhttp = new XMLHttpRequest();
    } else if ( window.ActiveXObject ) {
      xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    return xhttp;

  }

  killfade () {

    clearInterval( this.fade_int );

  }

  fadeIn ( start, end ) {

    if ( !start ) { start = () => false; };
    if ( !end ) { end = () => false; };

    if ( !this.fade_int ) {

      start();

      this.container.style.opacity = 0;

      let fade_int = setInterval(() => {

        if ( +this.container.style.opacity <= 1 ) {

          this.container.style.opacity = +this.container.style.opacity + 0.025;

        } else {

          end();
          this.container.style.opacity = 1;
          clearInterval( fade_int );
          this.fade_int = false;

        }

      }, 10);

    }

  }

  fadeOut ( start, end ) {

    if ( !start ) { start = () => false; };
    if ( !end ) { end = () => false; };

    if ( !this.fade_int ) {

      start();

      this.container.style.opacity = 1;

      this.fade_int = setInterval(() => {

        if ( +this.container.style.opacity >= 0 ) {

          this.container.style.opacity = +this.container.style.opacity - 0.025;

        } else {

          end();
          this.container.style.opacity = 0;
          clearInterval( this.fade_int );
          this.fade_int = false;

        }

      }, 10);

    }

  }

  addVideo ( url, type ) {

    this.videoURLs.push({url: url, type: type, total: false, progress: false, complete: false});

  }

  init ( options ) {

    //Load Videos

    let defaultFunc = () => false;

    if ( !options ) {
      options = {};
    }

    options.progress = options.progress || defaultFunc;
    options.complete = options.complete || defaultFunc;

    let i = 0;
    let videoProgress = () => {

      let total = 0;
      let loaded = 0;
      let valid = true;
      let complete = 0;

      this.videoURLs.forEach( video => {

        if ( video.total ) {
          total += video.total;
        } else {
          valid = false;
        }

        if ( video.progress ) {
          loaded += video.progress;
        } else {
          valid = false;
        }

        if ( video.complete ) {
          complete += 1;
        }

      });

      if ( complete === this.videoURLs.length ) {

        options.complete();

        //Load Content from URL

        this.Pages.forEach( page => {
          if ( ('#' + page.activator) == window.location.hash ) {

            let d = document.getElementById( page.activator );
            let click = document.createEvent('Events');
            click.initEvent('click', true, false);
            d.dispatchEvent(click);

          }
        });

      } else {

        if ( valid ) {

          options.progress( loaded / total * 100 );

        }

      }

    };

    this.videoURLs.forEach( video => {

      let xhr = this.newXhttp();
      xhr.open( 'GET', video.url );
      xhr.responseType = 'arraybuffer';

      xhr.onload = () => {

        this.video.push( URL.createObjectURL( new Blob( [xhr.response], {type: video.type} ) ) );
        video.complete = true;
        videoProgress();

      }

      xhr.onprogress = function(e) {
          if (e.lengthComputable) {

            if ( !video.total ) {

              video.total = e.total;

            }

            video.progress = e.loaded;

            videoProgress();

          }
      };

      xhr.send();
      console.log('Begin loading', video.url );

    });

  }

  constructor ( options ) {

    this.container = document.getElementById( options.target );
    this.container.style.opacity = 1;
    this.loading = () => false || options.loading;
    this.complete = () => false || options.complete;
    this.progress = () => false || options.progress;
    this.errorMessage = 'Failed to load content' || options.error;
    this.loadingContent = 'Loading...';
    this.preLoaded = {};
    this.Pages = [];
    this.Nav = [];
    this.fade_int = false;
    this.video = [];
    this.videoURLs = [];

  }

}
