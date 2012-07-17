if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {

    var LightDefinition = require( "src/resources/light-definition" );
    var Component = require( "base/component" );
    var extend = require( "common/extend" );
    var math = require( "_math" );

    //Assign all of these values to the cubicvrLight
    var properties = [
      "light_type",
      "diffuse",
      "specular",
      "intensity",
      "distance",
      "cutoff",
      "map_res",
      "method",
      "areaCeiling",
      "areaFloor",
      "areaAxis"
    ];

    var Light = function( service, lightDefinition ){
      Component.call(this, "Light", service, ["Transform"]);

      if (!(lightDefinition instanceof LightDefinition)){
        lightDefinition = new LightDefinition();
      }

      this._cubicvrLight = new service.target.context.Light(lightDefinition);

      this._cubicvrLight.parent = {
        tMatrix: _convertToCVRMatrix(math.matrix4.identity)
      };

      for (var propertyIndex = 0; propertyIndex < properties.length; propertyIndex++){
        this[properties[propertyIndex]] = lightDefinition[properties[propertyIndex]];
      }
    };
    Light.prototype = new Component();
    Light.prototype.constructor = Light;

    function onUpdate( event ){
      for (var propertyIndex = 0; propertyIndex < properties.length; propertyIndex++){
        this._cubicvrLight[properties[propertyIndex]] = this[properties[propertyIndex]];
      }
      this._cubicvrLight.parent.tMatrix = _convertToCVRMatrix(this.owner.findComponent( "Transform" ).worldMatrix().buffer);
    }

    function onEntitySpaceChanged( event ) {
      var data = event.data;
      if( data.previous === null && data.current !== null && this.owner !== null ) {
        this.provider.registerComponent( this.owner.id, this );
      }

      if( this.owner ) {
        this._cubicvrLight.parent.tMatrix = _convertToCVRMatrix(this.owner.findComponent( "Transform" ).worldMatrix().buffer);
      }

      if( data.previous !== null && data.current === null && this.owner !== null ) {
        this.provider.unregisterComponent( this.owner.id, this );
      }
    }

    function onComponentOwnerChanged( event ) {
      var data = event.data;
      if( data.previous === null && this.owner !== null ) {
        this.provider.registerComponent( this.owner.id, this );
      }

      if( this.owner ) {
        this._cubicvrLight.parent.tMatrix = _convertToCVRMatrix(this.owner.findComponent( "Transform" ).worldMatrix().buffer);
      }

      if( this.owner === null && data.previous !== null ) {
        this.provider.unregisterComponent( data.previous.id, this );
      }
    }

    function onEntityActivationChanged( event ) {
      var active = event.data;
      if( active ) {
        this.provider.registerComponent( this.owner.id, this );
      } else {
        this.provider.unregisterComponent( this.owner.id, this );
      }
    }

    function _convertToCVRMatrix(gladiusMatrix){
      //Swap out indexes 12, 13, 14 for 3, 7, 11
      var buffer;
      buffer = gladiusMatrix[12];
      gladiusMatrix[12] = gladiusMatrix[3];
      gladiusMatrix[3] = buffer;
      buffer = gladiusMatrix[13];
      gladiusMatrix[13] = gladiusMatrix[7];
      gladiusMatrix[7] = buffer;
      buffer = gladiusMatrix[14];
      gladiusMatrix[14] = gladiusMatrix[11];
      gladiusMatrix[11] = buffer;
      return gladiusMatrix;
    }

    var prototype = {
      onUpdate: onUpdate,
      onEntitySpaceChanged: onEntitySpaceChanged,
      onComponentOwnerChanged: onComponentOwnerChanged,
      onEntityActivationChanged: onEntityActivationChanged,
      _convertToCVRMatrix : _convertToCVRMatrix
    };
    extend( Light.prototype, prototype );

    return Light;

  });