import getDesign from '../design';
import lodash from 'lodash';

const FIXTURES = {
    jsonDesign: {
        master_tube_database_sink_responder: {
            clazz: 'MasterTube',
            internalName: 'master_tube_database_sink_responder',
            name: 'database_sink_responder',
            designTubes: ['_4TMKAAeZEemswplt4kY5KA'],
            from: 'master_cell_database_sink',
            to: 'master_cell_responder'
        },
        master_cell_gateway_sink: {
            clazz: 'MasterCell',
            count: 1,
            external: true,
            internalName: 'master_cell_gateway_sink',
            name: 'gateway_sink',
            pinned: false,
            input: ['master_tube_responder_gateway_sink'],
            output: [],
            designCells: ['_qTSEIAeaEemswplt4kY5KA']
        },
        _U9zJwAeZEemswplt4kY5KA: {
            clazz: 'Cell',
            count: 1,
            external: false,
            name: 'record_data',
            input: ['_ZP0_oAeZEemswplt4kY5KA'],
            output: ['_eSAgEAeZEemswplt4kY5KA']
        },
        _A5e08AebEemswplt4kY5KA: {
            clazz: 'Tube',
            name: 'responder_gateway_sink',
            descriptor: [],
            from: '_zAb28AeZEemswplt4kY5KA',
            to: '_qTSEIAeaEemswplt4kY5KA'
        },
        _JBlPYgeZEemswplt4kY5KA: {
            clazz: 'MasterDesign',
            name: 'authentication',
            cell: [
                'master_cell_database_sink',
                'master_cell_gateway_sink',
                'master_cell_gateway_source',
                'master_cell_record_data',
                'master_cell_responder'
            ],
            tube: [
                'master_tube_database_sink_responder',
                'master_tube_record_data_database_sink',
                'master_tube_register_post',
                'master_tube_responder_gateway_sink'
            ]
        },
        master_cell_database_sink: {
            clazz: 'MasterCell',
            count: 1,
            external: true,
            internalName: 'master_cell_database_sink',
            name: 'database_sink',
            pinned: false,
            input: ['master_tube_record_data_database_sink'],
            output: ['master_tube_database_sink_responder'],
            designCells: ['_a-8M0AeZEemswplt4kY5KA']
        },
        _PoggEAeZEemswplt4kY5KA: {
            clazz: 'Cell',
            count: 1,
            external: true,
            name: 'gateway_source',
            input: [],
            output: ['_ZP0_oAeZEemswplt4kY5KA']
        },
        _eSAgEAeZEemswplt4kY5KA: {
            clazz: 'Tube',
            name: 'record_data_database_sink',
            descriptor: [],
            from: '_U9zJwAeZEemswplt4kY5KA',
            to: '_a-8M0AeZEemswplt4kY5KA'
        },
        master_tube_responder_gateway_sink: {
            clazz: 'MasterTube',
            internalName: 'master_tube_responder_gateway_sink',
            name: 'responder_gateway_sink',
            designTubes: ['_A5e08AebEemswplt4kY5KA'],
            from: 'master_cell_responder',
            to: 'master_cell_gateway_sink'
        },
        '_a-8M0AeZEemswplt4kY5KA': {
            clazz: 'Cell',
            count: 1,
            external: true,
            name: 'database_sink',
            input: ['_eSAgEAeZEemswplt4kY5KA'],
            output: ['_4TMKAAeZEemswplt4kY5KA']
        },
        _JAGBoAeZEemswplt4kY5KA: {
            clazz: 'Layer',
            name: 'swarm',
            constraint: []
        },
        master_tube_record_data_database_sink: {
            clazz: 'MasterTube',
            internalName: 'master_tube_record_data_database_sink',
            name: 'record_data_database_sink',
            designTubes: ['_eSAgEAeZEemswplt4kY5KA'],
            from: 'master_cell_record_data',
            to: 'master_cell_database_sink'
        },
        master_cell_gateway_source: {
            clazz: 'MasterCell',
            count: 1,
            external: true,
            internalName: 'master_cell_gateway_source',
            name: 'gateway_source',
            pinned: false,
            input: [],
            output: ['master_tube_register_post'],
            designCells: ['_PoggEAeZEemswplt4kY5KA']
        },
        master_cell_responder: {
            clazz: 'MasterCell',
            count: 1,
            external: false,
            internalName: 'master_cell_responder',
            name: 'responder',
            pinned: false,
            input: ['master_tube_database_sink_responder'],
            output: ['master_tube_responder_gateway_sink'],
            designCells: ['_zAb28AeZEemswplt4kY5KA']
        },
        _qTSEIAeaEemswplt4kY5KA: {
            clazz: 'Cell',
            count: 1,
            external: true,
            name: 'gateway_sink',
            input: ['_A5e08AebEemswplt4kY5KA'],
            output: []
        },
        _zAb28AeZEemswplt4kY5KA: {
            clazz: 'Cell',
            count: 1,
            external: false,
            name: 'responder',
            input: ['_4TMKAAeZEemswplt4kY5KA'],
            output: ['_A5e08AebEemswplt4kY5KA']
        },
        master_cell_record_data: {
            clazz: 'MasterCell',
            count: 1,
            external: false,
            internalName: 'master_cell_record_data',
            name: 'record_data',
            pinned: false,
            input: ['master_tube_register_post'],
            output: ['master_tube_record_data_database_sink'],
            designCells: ['_U9zJwAeZEemswplt4kY5KA']
        },
        _PFZL8AeZEemswplt4kY5KA: {
            clazz: 'Flow',
            name: 'register',
            cell: [
                '_PoggEAeZEemswplt4kY5KA',
                '_U9zJwAeZEemswplt4kY5KA',
                '_a-8M0AeZEemswplt4kY5KA',
                '_zAb28AeZEemswplt4kY5KA',
                '_qTSEIAeaEemswplt4kY5KA'
            ],
            tube: [
                '_ZP0_oAeZEemswplt4kY5KA',
                '_eSAgEAeZEemswplt4kY5KA',
                '_4TMKAAeZEemswplt4kY5KA',
                '_A5e08AebEemswplt4kY5KA'
            ]
        },
        master_tube_register_post: {
            clazz: 'MasterTube',
            internalName: 'master_tube_register_post',
            name: 'register_post',
            designTubes: ['_ZP0_oAeZEemswplt4kY5KA'],
            from: 'master_cell_gateway_source',
            to: 'master_cell_record_data'
        },
        _ZP0_oAeZEemswplt4kY5KA: {
            clazz: 'Tube',
            name: 'register_post',
            descriptor: [],
            from: '_PoggEAeZEemswplt4kY5KA',
            to: '_U9zJwAeZEemswplt4kY5KA'
        },
        _4TMKAAeZEemswplt4kY5KA: {
            clazz: 'Tube',
            name: 'database_sink_responder',
            descriptor: [],
            from: '_a-8M0AeZEemswplt4kY5KA',
            to: '_zAb28AeZEemswplt4kY5KA'
        }
    }
};

describe('# design', () => {
    describe('## getDesign', () => {
        it('### should transform plain json object', () => {
            const transformedDesign = getDesign(FIXTURES.jsonDesign);
            expect(Object.keys(transformedDesign)).toMatchSnapshot();
            expect(Object.keys(transformedDesign.Cell[0])).toMatchSnapshot();
            expect(Object.keys(transformedDesign.Cell[0].Flow[0])).toMatchSnapshot();
        });
    });
});
