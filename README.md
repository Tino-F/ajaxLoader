# Ajax page loader

### Description
> I wrote this function to make it easier to write single page applications without having to use a entire framework like react or angular.

### Usage

    let loader = new AjaxLoader( { target: 'content-container' } );
    loader.addPage( 'about', '/ajax/about', function() {
      console.log('Complete')
    });
