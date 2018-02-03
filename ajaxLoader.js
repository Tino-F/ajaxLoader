class AjaxLoader {

  addPage ( activator, contentURL, complete ) {

    if ( !complete ) { complete = () => false };

    this.Pages.push({ activator: activator, url: contentURL, complete: complete });

    document.getElementById( activator ).addEventListener( 'click', ( e ) => {

      let xhttp = this.newXhttp();

      if ( !this.preLoaded[ activator ] ) {
        //The content has not been loaded yet

        xhttp.onload = ( e ) => {

          if ( e.lengthComputable ) {
            this.progress( e.loaded / e.total * 100 );
          }

        };

        xhttp.onreadystatechange = () => {

          if ( xhttp.readyState === 4 ) {

            this.complete( xhttp.response );

            if ( xhttp.status === 200 ) {

              this.killfade();
              this.container.innerHTML = xhttp.response;
              complete();
              this.fadeIn();
              this.preLoaded[ activator ] = xhttp.response;

            } else {
              //Error occured when grabbing content

              this.killfade();
              this.container.innerHTML = this.errorMessage;
              complete();
              this.fadeIn();

            }

          }

        }

        xhttp.open( 'GET', contentURL );

        this.fadeOut(() => {

          this.container.innerHTML = this.loadingContent;
          this.container.style.opacity = 1;
          xhttp.send();

        });

      } else {
        //content has been loaded and stored for reuse

        this.killfade();
        this.container.innerHTML = this.preLoaded[ activator ];
        complete();
        this.fadeIn();

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

  fadeIn ( cb ) {

    if ( !cb ) { cb = () => false; };

    if ( !this.fade_int ) {

      this.container.style.opacity = 0;

      let fade_int = setInterval(() => {

        if ( +this.container.style.opacity <= 1 ) {

          this.container.style.opacity = +this.container.style.opacity + 0.025;

        } else {

          cb();
          this.container.style.opacity = 1;
          clearInterval( fade_int );
          this.fade_int = false;

        }

      }, 10);

    }

  }

  fadeOut ( cb ) {

    if ( !cb ) { cb = () => false; };

    if ( !this.fade_int ) {

      this.container.style.opacity = 1;

      this.fade_int = setInterval(() => {

        if ( +this.container.style.opacity >= 0 ) {

          this.container.style.opacity = +this.container.style.opacity - 0.025;

        } else {

          cb();
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
