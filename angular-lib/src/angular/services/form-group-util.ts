import { AbstractControl, FormArray, FormGroup, FormControl } from '@angular/forms';

export function asFormGroup(object: Object): AbstractControl {
    if (Array.isArray(object)) {
        return new FormArray(object.map(entry => asFormGroup(entry)));
    } else if (typeof object === 'object') {
        return new FormGroup(mapObject(object, (obj: any) => asFormGroup(obj)));
    } else {
        return new FormControl(object);
    }
}

export function mapObject(object: Object, mapFn: Function) {
    return Object.keys(object).reduce(function (result, key) {
        result[key] = mapFn(object[key])
        return result
    }, {})
}
