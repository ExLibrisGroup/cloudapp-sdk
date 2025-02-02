import { AbstractControl, UntypedFormArray, UntypedFormGroup, UntypedFormControl } from '@angular/forms';

export function toFormGroup(object: Object): UntypedFormGroup {
    return _toFormGroup(object) as UntypedFormGroup;
}

function _toFormGroup(object: Object): AbstractControl {
    if (Array.isArray(object)) {
        return new UntypedFormArray(object.map(entry => _toFormGroup(entry)));
    } else if (typeof object === 'object' && object != null) {
        return new UntypedFormGroup(mapObject(object, (obj: any) => _toFormGroup(obj)));
    } else {
        return new UntypedFormControl(object);
    }
}

function mapObject(object: Object, mapFn: Function) {
    return Object.keys(object).reduce(function (result: any, key: any) {
        result[key] = mapFn((object as any)[key])
        return result
    }, {})
}
