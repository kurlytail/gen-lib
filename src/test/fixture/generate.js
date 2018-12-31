var _ = require('lodash');var swarm_design = {
  "_ODsP4AviEemswplt4kY5KA": {
    "clazz": "Tube",
    "name": "cella_cellb",
    "descriptor": [],
    "from": "_BFc30AviEemswplt4kY5KA",
    "to": "_MiaqYAviEemswplt4kY5KA"
  },
  "_8sJVQgvhEemswplt4kY5KA": {
    "clazz": "MasterDesign",
    "name": "fixture",
    "cell": [
      "master_cell_cella",
      "master_cell_cellb"
    ],
    "tube": [
      "master_tube_cella_cellb"
    ]
  },
  "master_tube_cella_cellb": {
    "clazz": "MasterTube",
    "internalName": "master_tube_cella_cellb",
    "name": "cella_cellb",
    "designTubes": [
      "_ODsP4AviEemswplt4kY5KA"
    ],
    "from": "master_cell_cella",
    "to": "master_cell_cellb"
  },
  "master_cell_cella": {
    "clazz": "MasterCell",
    "count": 1,
    "external": false,
    "internalName": "master_cell_cella",
    "name": "cella",
    "pinned": false,
    "input": [],
    "output": [
      "master_tube_cella_cellb"
    ],
    "designCells": [
      "_BFc30AviEemswplt4kY5KA"
    ]
  },
  "_MiaqYAviEemswplt4kY5KA": {
    "clazz": "Cell",
    "count": 1,
    "external": false,
    "name": "cellb",
    "input": [
      "_ODsP4AviEemswplt4kY5KA"
    ],
    "output": []
  },
  "_8pBv0AvhEemswplt4kY5KA": {
    "clazz": "Layer",
    "name": "swarm",
    "constraint": []
  },
  "master_cell_cellb": {
    "clazz": "MasterCell",
    "count": 1,
    "external": false,
    "internalName": "master_cell_cellb",
    "name": "cellb",
    "pinned": false,
    "input": [
      "master_tube_cella_cellb"
    ],
    "output": [],
    "designCells": [
      "_MiaqYAviEemswplt4kY5KA"
    ]
  },
  "_AhnK8AviEemswplt4kY5KA": {
    "clazz": "Flow",
    "name": "default",
    "cell": [
      "_BFc30AviEemswplt4kY5KA",
      "_MiaqYAviEemswplt4kY5KA"
    ],
    "tube": [
      "_ODsP4AviEemswplt4kY5KA"
    ]
  },
  "_BFc30AviEemswplt4kY5KA": {
    "clazz": "Cell",
    "count": 1,
    "external": false,
    "name": "cella",
    "input": [],
    "output": [
      "_ODsP4AviEemswplt4kY5KA"
    ]
  }
};
var generator_map = {};
var partial_map = {};

// Build structure cache and reference lists
var new_design = {};
var uscore_template_objects = {};

var builder = "core";

// Sort out references
// Convert flat list of objects by first
// 	resolving references to real objects
//	create Arrays of Object types
//	create Arrays of References to the objects inside object types
Object.keys(swarm_design).forEach(function(key) {
    var object = swarm_design[key];
    var clazz = object.clazz;
    var referred_objects = [];
    


    // This loop replaces all ids with objects
    // And builds arrays of objects referred to by
    // this object
    for(var k in object) {
        if(object.hasOwnProperty(k) == false) continue;
        if(k == 'name') continue;
        var new_array = [];
        var old_array = object[k];

        if (typeof old_array == 'string') {
        	// If we got a string property, and if the string property
        	// is an object reference then build the referred objects
        	// array
        	// Replace the id with the object
            if(swarm_design.hasOwnProperty(old_array) == false) {
                /* Not a swarm object, skip this property */
                new_array = old_array;
                continue;
            }

            var referred_object = swarm_design[old_array];
            new_array = referred_object;
            referred_objects.push(referred_object);
            
            if(new_array.hasOwnProperty('name')) {
            	new_array[new_array.name] = new_array; 
            }
        } else if(typeof old_array == 'object'){
        	// If we have an array, iterate all elements of the array
        	// Arrays are always arrays of ids, 
        	// Replace array of ids with array of objects
            for(var element in old_array) {
                if(isNaN(element)) continue;
                if(swarm_design.hasOwnProperty(old_array[element]) == false) {
                    /* Not a swarm object, skip this property property */
                    new_array = old_array;
                    continue;
                }

                var referred_object = swarm_design[old_array[element]];
                referred_objects.push(referred_object);
                new_array.push(referred_object);
                
//                if(referred_object.hasOwnProperty('name')) {
//                	if(new_array.named_array.hasOwnProperty(referred_object.name)) {
//                		new_array[referred_object.name].push(referred_object);
//                	} else {
//                        new_array[referred_object.name] = [referred_object];
//                        for(var k in referred_object) {
//                            if(referred_object.hasOwnProperty(k) == false) continue;
//                            new_array[referred_object.name][k] = referred_object[k];
//                        }
//                	}
//                }
            }
        } else {
        	new_array = old_array;
        	continue;
        }
        
        object[k] = new_array;
    }

    // Build arrays of objects under their respective class names
    if(new_design.hasOwnProperty(clazz)) {
        new_design[clazz].push(object);
    } else {
    	// Build a direct reference for the first object in the class
    	// array
        new_design[clazz] = [object];
        for(var k in object) {
            if(object.hasOwnProperty(k) == false) continue;
            new_design[clazz][k] = object[k];
        }
    }

    // Build the reverse map for each referred object
    for(var i in referred_objects) {
        var ref = referred_objects[i];
        if(!referred_objects.hasOwnProperty(i)) continue;
        
        if(ref.hasOwnProperty(clazz)) {
            ref[clazz].push(object);
        } else {
            ref[clazz] = [object];
            for(var k in object) {
                if(object.hasOwnProperty(k) == false) continue;
                ref[clazz][k] = object[k];
            }
        }
    }
    
    object.id = key;

});

swarm_design = new_design;

//// Assign relative tube indices to all tubes
//Object.keys(swarm_design.CellInstance).forEach(function (key) {
//	if(!swarm_design.CellInstance.hasOwnProperty(key)) return;
//	var rIndex = {};
//	var cInstance = swarm_design.CellInstance[key];
//	for(key in cInstance.input) {
//		if(!cInstance.input.hasOwnProperty(key)) continue;
//		if(isNaN(key)) continue;
//		var tube = cInstance.input[key];
//		if(rIndex.hasOwnProperty(tube.tube.name) == false) {
//			rIndex[tube.tube.name] = 0;
//			tube['irindex'] = 0;
//		} else {
//			++rIndex[tube.tube.name];
//			tube['irindex'] = rIndex[tube.tube.name];
//		}
//	}
//	
//	rIndex = {};
//	for(key in cInstance.output) {
//		if(!cInstance.output.hasOwnProperty(key)) continue;
//		if(isNaN(key)) continue;
//		var tube = cInstance.output[key];
//		if(rIndex.hasOwnProperty(tube.tube.name) == false) {
//			rIndex[tube.tube.name] = 0;
//			tube['orindex'] = 0;
//		} else {
//			++rIndex[tube.tube.name];
//			tube['orindex'] = rIndex[tube.tube.name];
//		}
//	}
//});


// Number flows according to constraints
function nameSort(a,b) {
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}
if(swarm_design.hasOwnProperty("Flow")) {
	swarm_design.Flow.sort(nameSort);
	for(var index = 0; index < swarm_design.Flow.length; ++index) {
	    swarm_design.Flow[index]['index'] = index + 1;
	}
}
if(swarm_design.hasOwnProperty("CellInstance")) {
	swarm_design.CellInstance.sort(nameSort);
}
if(swarm_design.hasOwnProperty("MasterCell")) {
	swarm_design.MasterCell.sort(nameSort);
}
if(swarm_design.hasOwnProperty("TubeInstance")) {
	swarm_design.TubeInstance.sort(nameSort);
}
if(swarm_design.hasOwnProperty("MasterTube")) {
	swarm_design.MasterTube.sort(nameSort);
}

if (!exports) exports = {};
exports.swarm_design = swarm_design;


String.prototype.toWordCase = function() {
    return this.replace(/_([a-z])/g, function(match, p) {
        return " " + p.toUpperCase();    
    }).replace(/^([a-z])/, function(match, p1) {
        return p1.toUpperCase() + match.substr(1);
    });;
};

String.prototype.toDashCase = function() {
    return this.replace(/_([a-z])/g, function(match, p) {
        return "-" + p.toLowerCase();    
    });
};

var generator_map = {};
var fs = require("fs");
var mkdirp = require("mkdirp");
var path = require("path");

var source = fs.readFileSync('map._', { 'encoding':'utf8'});
var template = _.template(source);
var source = template({swarm_design: swarm_design});
eval(source);

_.each(generator_map, function(value, key) {
	console.log("Generating File " + key + " from " + value.template);
	
	var template = fs.readFileSync(value.template, { 'encoding' : 'utf8' });
	template = _.template(template);
	template = template(value.object);
	template = template.replace(/\n\s*\n/g, '\n');
	
	var dir = path.dirname(key);
	mkdirp.sync(dir);
	fs.writeFileSync(key, template);
});
