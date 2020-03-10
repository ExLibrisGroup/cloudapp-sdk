import { AbstractControl, FormArray, FormGroup, FormControl } from '@angular/forms';

export function toFormGroup(object: Object): FormGroup {
    return _toFormGroup(object) as FormGroup;
}

function _toFormGroup(object: Object): AbstractControl {
    if (Array.isArray(object)) {
        return new FormArray(object.map(entry => _toFormGroup(entry)));
    } else if (typeof object === 'object' && object != null) {
        return new FormGroup(mapObject(object, (obj: any) => _toFormGroup(obj)));
    } else {
        return new FormControl(object);
    }
}

function mapObject(object: Object, mapFn: Function) {
    return Object.keys(object).reduce(function (result, key) {
        result[key] = mapFn(object[key])
        return result
    }, {})
}
