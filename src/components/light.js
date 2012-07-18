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
        tMatrix: []
      };
      _convertToCVRMatrix(this._cubicvrLight.parent.tMatrix, new math.Matrix4(math.matrix4.identity));

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
      _convertToCVRMatrix(this._cubicvrLight.parent.tMatrix, this.owner.findComponent( "Transform" ).worldMatrix());
    }

    function onEntitySpaceChanged( event ) {
      var data = event.data;
      if( data.previous === null && data.current !== null && this.owner !== null ) {
        this.provider.registerComponent( this.owner.id, this );
      }

      if( this.owner ) {
        _convertToCVRMatrix(this._cubicvrLight.parent.tMatrix, this.owner.findComponent( "Transform" ).worldMatrix());
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
        _convertToCVRMatrix(this._cubicvrLight.parent.tMatrix, this.owner.findComponent( "Transform" ).worldMatrix());
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

  function _convertToCVRMatrix(cvrMatrix, gladiusMatrix){
    //Swap out indexes 12, 13, 14 for 3, 7, 11
    cvrMatrix[0] = gladiusMatrix.buffer[0];
    cvrMatrix[1] = gladiusMatrix.buffer[1];
    cvrMatrix[2] = gladiusMatrix.buffer[2];
    cvrMatrix[3] = gladiusMatrix.buffer[12];
    cvrMatrix[4] = gladiusMatrix.buffer[4];
    cvrMatrix[5] = gladiusMatrix.buffer[5];
    cvrMatrix[6] = gladiusMatrix.buffer[6];
    cvrMatrix[7] = gladiusMatrix.buffer[13];
    cvrMatrix[8] = gladiusMatrix.buffer[8];
    cvrMatrix[9] = gladiusMatrix.buffer[9];
    cvrMatrix[10] = gladiusMatrix.buffer[10];
    cvrMatrix[11] = gladiusMatrix.buffer[14];
    cvrMatrix[12] = gladiusMatrix.buffer[3];
    cvrMatrix[13] = gladiusMatrix.buffer[7];
    cvrMatrix[14] = gladiusMatrix.buffer[11];
    cvrMatrix[15] = gladiusMatrix.buffer[15];
    return cvrMatrix;
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