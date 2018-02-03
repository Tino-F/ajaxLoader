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

    let dom = document.getElementById( activator );

    dom.addEventListener( 'click', ( e ) => {

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
    this.fade_int = false;

  }

}
