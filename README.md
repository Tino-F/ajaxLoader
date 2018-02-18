# Ajax page loader

### Description
> I wrote this function to make it easier to write single page applications without having to use a entire framework like react or angular.

### Usage

    let loader = new AjaxLoader( { target: 'content-container' } );

    let navOptions = {
      fadeInStart: () => console.log( 'Begin fading in'),
      fadeOutStart: () => console.log( 'Begin fading out'),
      fadeOutEnd: () => console.log( 'Done fading out' ),
      complete: () => console.log( 'Done fading in and finished loading' )
    };

    loader.addPage( 'about', '/ajax/about', navOptions );
    loader.addPage( 'contact', '/contact', options );

    loader.addHome( {id: 'home', complete: () => document.getElementById('navContainer').remove() } );

    loader.addVideo( '/exampleVideo.mp4', 'video/mp4' );

    loader.init({
      progress: loaded => console.log( 'Preloading ', Math.floor( loaded ), '% done.' ),
      complete: () => document.getElementById('loadingScreen').remove()
    });
