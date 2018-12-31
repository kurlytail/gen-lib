{
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
}
