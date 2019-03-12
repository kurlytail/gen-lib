// @flow
import _ from 'lodash';
import flatten from 'flat';

// eslint-disable-next-line flowtype/no-weak-types
function getDesign(jsonDesign: Object): Object {
    // eslint-disable-next-line flowtype/no-weak-types
    const normalizedDesign = Object.keys(jsonDesign).reduce((newDesign: Object, key: string): Object => {
        const instance = jsonDesign[key];
        const flattened = flatten(jsonDesign[key]);

        if (!newDesign[key]) {
            newDesign[key] = { ...instance, _id: key };
        }

        Object.keys(flattened).forEach((property: string) => {
            const value = flattened[property];
            if (typeof value === 'string' && jsonDesign[value] && value !== key) {
                if (!newDesign[value]) {
                    newDesign[value] = { ...jsonDesign[value] };
                }

                const reference = newDesign[value];
                _.set(newDesign[key], property, reference);

                reference[instance.clazz] = reference[instance.clazz] || [];
                reference[instance.clazz] = [...reference[instance.clazz], newDesign[key]];
            }
        });

        newDesign[instance.clazz] = newDesign[instance.clazz]
            ? [...newDesign[instance.clazz], newDesign[key]]
            : [newDesign[key]];

        return newDesign;
    }, {});

    return normalizedDesign;
}

export default getDesign;
