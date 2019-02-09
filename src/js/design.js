import _ from 'lodash';
import flatten from 'flat';

function getDesign(jsonDesign) {
    const normalizedDesign = Object.keys(jsonDesign).reduce((newDesign, key) => {
        const instance = jsonDesign[key];
        const flattened = flatten(jsonDesign[key]);

        if (!newDesign[key]) {
            newDesign[key] = { ...instance, _id: key };
        }

        Object.keys(flattened).forEach(property => {
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
